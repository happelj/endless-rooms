import * as THREE from 'three';
import { Camera } from './Camera.js';
import { Renderer } from './Renderer.js';
import { CollisionSystem } from '../collision/CollisionSystem.js';
import { DebugVisuals } from '../debug/DebugVisuals.js';
import { InteractionManager } from '../interactions/InteractionManager.js';
import { Player } from '../player/Player.js';
import { RoomManager } from '../rooms/RoomManager.js';
import { Hud } from '../ui/Hud.js';
import { DEBUG_CONFIG, SCENE_CONFIG } from '../config/constants.js';

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
    this.collisionSystem = new CollisionSystem();
    this.hud = new Hud(this.shell);
    this.roomManager = new RoomManager(this.scene, this.collisionSystem, this.hud);
    this.player = new Player(
      this.camera.instance,
      this.renderer.domElement,
      this.shell,
      this.hud,
      { collisionSystem: this.collisionSystem },
    );
    this.roomManager.setPlayer(this.player);
    this.interactionManager = new InteractionManager(
      this.camera.instance,
      this.renderer.domElement,
      this.roomManager,
      this.hud,
    );
    this.debugVisuals = DEBUG_CONFIG.showPhysicsBounds
      ? new DebugVisuals(this.scene, this.roomManager, this.player)
      : null;

    this.registerUpdateable(this.player);
    this.registerUpdateable(this.roomManager);
    this.registerUpdateable(this.interactionManager);
    this.registerUpdateable(this.debugVisuals);

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

    this.player.dispose();
    this.interactionManager.dispose();
    this.debugVisuals?.dispose();
    this.roomManager.dispose();
    this.collisionSystem.dispose();
    this.renderer.dispose();
    this.hud.dispose();
    this.timer.dispose();
    this.shell.remove();
    this.updateables.clear();
  }
}
