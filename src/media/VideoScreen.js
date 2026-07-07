import * as THREE from 'three';

const MIN_VOLUME = 0;
const MAX_VOLUME = 1;

export class VideoScreen {
  constructor({ mesh, offMaterial, src, loop = true, defaultVolume = 0.5, volumeStep = 0.1 }) {
    this.mesh = mesh;
    this.offMaterial = offMaterial;
    this.src = src;
    this.volumeStep = volumeStep;
    this.isPowered = false;

    this.video = document.createElement('video');
    this.video.src = src;
    this.video.loop = loop;
    this.video.preload = 'auto';
    this.video.playsInline = true;
    this.video.volume = this.clampVolume(defaultVolume);

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
    this.setVolume(this.video.volume + this.volumeStep);
  }

  decreaseVolume() {
    this.setVolume(this.video.volume - this.volumeStep);
  }

  setVolume(volume) {
    this.video.volume = this.clampVolume(volume);
  }

  getVolumePercent() {
    return Math.round(this.video.volume * 100);
  }

  getPowerLabel() {
    return this.isPowered ? 'On' : 'Off';
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
