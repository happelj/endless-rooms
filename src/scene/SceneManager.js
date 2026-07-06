import * as THREE from 'three';
import { Camera } from './Camera.js';
import { Floor } from './Floor.js';
import { Lighting } from './Lighting.js';
import { OrbitCameraControls } from './OrbitCameraControls.js';
import { Renderer } from './Renderer.js';
import { Hud } from '../ui/Hud.js';
import { SCENE_CONFIG } from '../config/constants.js';

export class SceneManager {
  constructor(container) {
    this.container = container;
    this.shell = document.createElement('div');
    this.shell.className = 'app-shell';
    this.container.append(this.shell);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(SCENE_CONFIG.backgroundColor);

    this.timer = new THREE.Timer();
    this.timer.connect(document);
    // Future systems register here so the entry point stays a thin composition root.
    this.updateables = new Set();
    this.animationFrameId = null;
    this.isRunning = false;

    this.renderer = new Renderer(this.shell);
    this.camera = new Camera(this.renderer.aspectRatio);
    this.lighting = new Lighting(this.scene);
    this.floor = new Floor(this.scene);
    this.controls = new OrbitCameraControls(this.camera.instance, this.renderer.domElement);
    this.hud = new Hud(this.shell);

    this.registerUpdateable(this.controls);

    this.handleResize = this.handleResize.bind(this);
    this.tick = this.tick.bind(this);
  }

  start() {
    if (this.isRunning) {
      return;
    }

    window.addEventListener('resize', this.handleResize);
    this.handleResize();
    this.timer.reset();
    this.isRunning = true;
    this.tick();
  }

  registerUpdateable(system) {
    if (typeof system?.update === 'function') {
      this.updateables.add(system);
    }
  }

  unregisterUpdateable(system) {
    this.updateables.delete(system);
  }

  handleResize() {
    this.renderer.resize();
    this.camera.resize(this.renderer.aspectRatio);
  }

  tick(timestamp) {
    if (!this.isRunning) {
      return;
    }

    this.timer.update(timestamp);

    const deltaTime = this.timer.getDelta();
    const elapsedTime = this.timer.getElapsed();

    this.update(deltaTime, elapsedTime);
    this.renderer.render(this.scene, this.camera.instance);

    this.animationFrameId = window.requestAnimationFrame(this.tick);
  }

  update(deltaTime, elapsedTime) {
    for (const system of this.updateables) {
      system.update(deltaTime, elapsedTime);
    }
  }

  dispose() {
    this.isRunning = false;
    window.removeEventListener('resize', this.handleResize);

    if (this.animationFrameId !== null) {
      window.cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.controls.dispose();
    this.floor.dispose();
    this.lighting.dispose();
    this.renderer.dispose();
    this.hud.dispose();
    this.timer.dispose();
    this.shell.remove();
    this.updateables.clear();
  }
}
