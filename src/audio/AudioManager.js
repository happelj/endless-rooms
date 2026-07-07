import * as THREE from 'three';

const DEFAULT_PANNER = Object.freeze({
  distanceModel: 'inverse',
  refDistance: 1,
  maxDistance: 18,
  rolloffFactor: 1.35,
});

const DEFAULT_FILTER = Object.freeze({
  type: 'lowpass',
  frequency: 900,
  q: 0.4,
});

export class AudioManager {
  constructor(listener, config = {}) {
    this.listener = listener;
    this.config = config;
    this.context = null;
    this.masterGain = null;
    this.sources = new Map();
    this.activeRoomId = null;
    this.listenerWorldPosition = new THREE.Vector3();
    this.listenerDirection = new THREE.Vector3();
  }

  createPositionalLoop(config) {
    if (this.sources.has(config.id)) {
      return this.sources.get(config.id);
    }

    const source = new ManagedAudioSource(config);
    source.setRoomActive(config.roomId === this.activeRoomId);
    this.sources.set(config.id, source);

    if (this.context) {
      source.start(this.context, this.masterGain);
    }

    return source;
  }

  playSoundEffect(config) {
    this.ensureContext();

    const source = new SynthLoopSource(this.context, {
      ...config,
      id: config.id ?? `one-shot:${performance.now()}`,
      loop: false,
    });

    source.connect(this.masterGain);
    source.start();
    window.setTimeout(() => source.dispose(), (config.durationSeconds ?? 2) * 1000);

    return source;
  }

  setActiveRoom(roomId) {
    this.activeRoomId = roomId;

    for (const source of this.sources.values()) {
      source.setRoomActive(source.roomId === roomId);
    }
  }

  async resume() {
    this.ensureContext();

    for (const source of this.sources.values()) {
      source.start(this.context, this.masterGain);
    }

    if (this.context.state !== 'running') {
      await this.context.resume();
    }
  }

  async suspend() {
    if (this.context?.state === 'running') {
      await this.context.suspend();
    }
  }

  update() {
    if (!this.context || !this.listener) {
      return;
    }

    this.listener.getWorldPosition(this.listenerWorldPosition);
    this.listener.getWorldDirection(this.listenerDirection);

    const listener = this.context.listener;

    if (listener.positionX) {
      listener.positionX.value = this.listenerWorldPosition.x;
      listener.positionY.value = this.listenerWorldPosition.y;
      listener.positionZ.value = this.listenerWorldPosition.z;
      listener.forwardX.value = this.listenerDirection.x;
      listener.forwardY.value = this.listenerDirection.y;
      listener.forwardZ.value = this.listenerDirection.z;
      listener.upX.value = 0;
      listener.upY.value = 1;
      listener.upZ.value = 0;
      return;
    }

    listener.setPosition(
      this.listenerWorldPosition.x,
      this.listenerWorldPosition.y,
      this.listenerWorldPosition.z,
    );
    listener.setOrientation(
      this.listenerDirection.x,
      this.listenerDirection.y,
      this.listenerDirection.z,
      0,
      1,
      0,
    );
  }

  ensureContext() {
    if (this.context) {
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.context = new AudioContextClass();
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = this.config.masterVolume ?? 1;
    this.masterGain.connect(this.context.destination);
  }

  dispose() {
    for (const source of this.sources.values()) {
      source.dispose();
    }

    this.sources.clear();
    this.masterGain?.disconnect();
    this.context?.close();
    this.context = null;
    this.masterGain = null;
  }
}

class ManagedAudioSource {
  constructor(config) {
    this.config = { ...config };
    this.id = config.id;
    this.roomId = config.roomId;
    this.enabled = config.enabled ?? true;
    this.volume = config.volume ?? 0.02;
    this.isRoomActive = false;
    this.source = null;
  }

  start(context, destination) {
    if (this.source) {
      return;
    }

    this.source = new SynthLoopSource(context, {
      ...this.config,
      enabled: this.enabled,
      volume: this.volume,
    });
    this.source.connect(destination);
    this.source.start();
    this.source.setRoomActive(this.isRoomActive);
  }

  setRoomActive(isRoomActive) {
    this.isRoomActive = isRoomActive;
    this.source?.setRoomActive(isRoomActive);
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    this.source?.setEnabled(enabled);
  }

  setVolume(volume) {
    this.volume = volume;
    this.source?.setVolume(volume);
  }

  setPosition(position) {
    this.config.position = { x: position.x, y: position.y, z: position.z };
    this.source?.setPosition(position);
  }

  dispose() {
    this.source?.dispose();
    this.source = null;
  }
}

class SynthLoopSource {
  constructor(context, config) {
    this.context = context;
    this.id = config.id;
    this.roomId = config.roomId;
    this.kind = config.kind ?? 'noise';
    this.loop = config.loop ?? true;
    this.volume = config.volume ?? 0.02;
    this.enabled = config.enabled ?? true;
    this.isRoomActive = false;
    this.frequency = config.frequency ?? 60;
    this.waveform = config.waveform ?? 'sine';
    this.filter = config.filter ?? DEFAULT_FILTER;
    this.position = new THREE.Vector3(
      config.position?.x ?? 0,
      config.position?.y ?? 0,
      config.position?.z ?? 0,
    );
    this.nodes = [];

    this.outputGain = context.createGain();
    this.outputGain.gain.value = 0;

    this.panner = context.createPanner();
    this.configurePanner(config.panner ?? DEFAULT_PANNER);
    this.setPosition(this.position);

    this.outputGain.connect(this.panner);
  }

  start() {
    if (this.kind === 'oscillator') {
      this.startOscillator();
    } else {
      this.startNoiseLoop();
    }

    this.updateGain();
  }

  startOscillator() {
    const oscillator = this.context.createOscillator();
    oscillator.type = this.waveform;
    oscillator.frequency.value = this.frequency;

    oscillator.connect(this.outputGain);
    oscillator.start();
    this.nodes.push(oscillator);
  }

  startNoiseLoop() {
    const source = this.context.createBufferSource();
    source.buffer = this.createNoiseBuffer();
    source.loop = this.loop;

    const filter = this.context.createBiquadFilter();
    filter.type = this.filter.type;
    filter.frequency.value = this.filter.frequency;
    filter.Q.value = this.filter.q;

    source.connect(filter);
    filter.connect(this.outputGain);
    source.start();
    this.nodes.push(source, filter);
  }

  configurePanner(config) {
    this.panner.distanceModel = config.distanceModel ?? DEFAULT_PANNER.distanceModel;
    this.panner.refDistance = config.refDistance ?? DEFAULT_PANNER.refDistance;
    this.panner.maxDistance = config.maxDistance ?? DEFAULT_PANNER.maxDistance;
    this.panner.rolloffFactor = config.rolloffFactor ?? DEFAULT_PANNER.rolloffFactor;
  }

  createNoiseBuffer() {
    const durationSeconds = 2;
    const sampleRate = this.context.sampleRate;
    const frameCount = sampleRate * durationSeconds;
    const buffer = this.context.createBuffer(1, frameCount, sampleRate);
    const channel = buffer.getChannelData(0);

    for (let index = 0; index < frameCount; index += 1) {
      channel[index] = Math.random() * 2 - 1;
    }

    return buffer;
  }

  connect(destination) {
    this.panner.connect(destination);
  }

  setRoomActive(isRoomActive) {
    this.isRoomActive = isRoomActive;
    this.updateGain();
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    this.updateGain();
  }

  setVolume(volume) {
    this.volume = volume;
    this.updateGain();
  }

  setPosition(position) {
    this.position.set(position.x, position.y, position.z);

    if (this.panner.positionX) {
      this.panner.positionX.value = this.position.x;
      this.panner.positionY.value = this.position.y;
      this.panner.positionZ.value = this.position.z;
      return;
    }

    this.panner.setPosition(this.position.x, this.position.y, this.position.z);
  }

  updateGain() {
    const targetGain = this.enabled && this.isRoomActive ? this.volume : 0;
    this.outputGain.gain.setTargetAtTime(targetGain, this.context.currentTime, 0.08);
  }

  dispose() {
    for (const node of this.nodes) {
      try {
        node.stop?.();
      } catch {
        // One-shot nodes may already have stopped before disposal.
      }
      node.disconnect?.();
    }

    this.outputGain.disconnect();
    this.panner.disconnect();
    this.nodes.length = 0;
  }
}
