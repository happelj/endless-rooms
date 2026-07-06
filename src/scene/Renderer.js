import * as THREE from 'three';
import { RENDERER_CONFIG } from '../config/constants.js';

export class Renderer {
  constructor(container) {
    this.container = container;
    this.instance = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });

    this.instance.setClearColor(RENDERER_CONFIG.clearColor);
    this.instance.outputColorSpace = THREE.SRGBColorSpace;
    this.instance.shadowMap.enabled = true;
    this.instance.shadowMap.type = THREE.PCFShadowMap;
    this.instance.domElement.className = 'scene-canvas';
    this.instance.domElement.tabIndex = 0;

    this.container.append(this.instance.domElement);
    this.resize();
  }

  get domElement() {
    return this.instance.domElement;
  }

  get aspectRatio() {
    const width = Math.max(1, this.container.clientWidth);
    const height = Math.max(1, this.container.clientHeight);
    return width / height;
  }

  resize() {
    const width = Math.max(1, this.container.clientWidth);
    const height = Math.max(1, this.container.clientHeight);
    const pixelRatio = Math.min(window.devicePixelRatio, RENDERER_CONFIG.maxPixelRatio);

    this.instance.setPixelRatio(pixelRatio);
    this.instance.setSize(width, height, false);
  }

  render(scene, camera) {
    this.instance.render(scene, camera);
  }

  dispose() {
    this.instance.dispose();
    this.instance.domElement.remove();
  }
}
