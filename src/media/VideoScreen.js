import * as THREE from 'three';

const MIN_VOLUME = 0;
const MAX_VOLUME = 1;

export class VideoScreen {
  constructor({
    mesh,
    offMaterial,
    src,
    loop = true,
    defaultVolume = 0.5,
    volumeStep = 0.1,
    spatialAudio = null,
  }) {
    this.mesh = mesh;
    this.offMaterial = offMaterial;
    this.src = src;
    this.volumeStep = volumeStep;
    this.spatialAudio = spatialAudio;
    this.isPowered = false;
    this.userVolume = this.clampVolume(defaultVolume);
    this.spatialMultiplier = 1;
    this.effectiveVolume = this.userVolume * this.spatialMultiplier;
    this.sourcePosition = new THREE.Vector3();

    this.video = document.createElement('video');
    this.video.src = src;
    this.video.loop = loop;
    this.video.preload = 'auto';
    this.video.playsInline = true;
    this.video.volume = this.effectiveVolume;

    this.texture = new THREE.VideoTexture(this.video);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;
    this.texture.generateMipmaps = false;

    this.videoMaterial = new THREE.MeshBasicMaterial({
      map: this.texture,
      toneMapped: false,
    });
    this.videoMaterial.name = 'VideoScreenMaterial';
    this.setDisplayIntensity(1);
  }

  async togglePower() {
    if (this.isPowered) {
      this.powerOff();
      return;
    }

    await this.powerOn();
  }

  async powerOn() {
    this.isPowered = true;
    this.mesh.material = this.videoMaterial;
    this.applyVolume();

    try {
      await this.video.play();
    } catch (error) {
      console.warn('Video playback could not start.', error);
    }
  }

  powerOff() {
    this.isPowered = false;
    this.video.pause();
    this.mesh.material = this.offMaterial;
    this.setDisplayIntensity(1);
  }

  pause() {
    this.video.pause();
  }

  async resumeIfPowered() {
    if (this.isPowered) {
      await this.powerOn();
    }
  }

  increaseVolume() {
    this.setVolume(this.userVolume + this.volumeStep);
  }

  decreaseVolume() {
    this.setVolume(this.userVolume - this.volumeStep);
  }

  setVolume(volume) {
    this.userVolume = this.clampVolume(volume);
    this.effectiveVolume = this.userVolume * this.spatialMultiplier;
    this.applyVolume();
  }

  updateSpatialVolume(listenerPosition) {
    if (!this.spatialAudio) {
      this.applyVolume();
      return;
    }

    this.mesh.getWorldPosition(this.sourcePosition);
    const distance = this.sourcePosition.distanceTo(listenerPosition);
    const {
      referenceDistance,
      maxDistance,
      minMultiplier,
    } = this.spatialAudio;

    if (distance <= referenceDistance) {
      this.spatialMultiplier = 1;
      this.effectiveVolume = this.userVolume * this.spatialMultiplier;
      this.applyVolume();
      return;
    }

    const range = Math.max(maxDistance - referenceDistance, 0.001);
    const normalizedDistance = THREE.MathUtils.clamp((distance - referenceDistance) / range, 0, 1);
    this.spatialMultiplier = THREE.MathUtils.lerp(1, minMultiplier, normalizedDistance);
    this.effectiveVolume = this.userVolume * this.spatialMultiplier;
    this.applyVolume();
  }

  applyVolume() {
    this.video.volume = this.clampVolume(this.effectiveVolume);
  }

  getVolumePercent() {
    return Math.round(this.userVolume * 100);
  }

  getEffectiveVolumePercent() {
    return Math.round(this.video.volume * 100);
  }

  getPowerLabel() {
    return this.isPowered ? 'On' : 'Off';
  }

  setDisplayIntensity(intensity) {
    this.videoMaterial.color.setScalar(intensity);
  }

  clampVolume(volume) {
    return THREE.MathUtils.clamp(volume, MIN_VOLUME, MAX_VOLUME);
  }

  dispose() {
    this.video.pause();
    this.video.removeAttribute('src');
    this.video.load();
    this.texture.dispose();
    this.videoMaterial.dispose();
  }
}
