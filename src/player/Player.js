import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { PLAYER_CONFIG } from '../config/constants.js';
import { Input } from './Input.js';
import { Movement } from './Movement.js';
import { StartOverlay } from '../ui/StartOverlay.js';

export class Player {
  constructor(camera, domElement, overlayContainer, hud, { collisionSystem = null } = {}) {
    this.camera = camera;
    this.hud = hud;
    this.controls = new PointerLockControls(camera, domElement);
    this.input = new Input();
    this.movement = new Movement(PLAYER_CONFIG.movement, collisionSystem, PLAYER_CONFIG.body);
    this.startOverlay = new StartOverlay(overlayContainer);

    this.controls.pointerSpeed = PLAYER_CONFIG.pointer.speed;
    this.controls.minPolarAngle = PLAYER_CONFIG.pointer.minPolarAngle;
    this.controls.maxPolarAngle = PLAYER_CONFIG.pointer.maxPolarAngle;

    this.handleStartRequested = this.handleStartRequested.bind(this);
    this.handleLock = this.handleLock.bind(this);
    this.handleUnlock = this.handleUnlock.bind(this);

    this.startOverlay.addEventListener('startrequested', this.handleStartRequested);
    this.controls.addEventListener('lock', this.handleLock);
    this.controls.addEventListener('unlock', this.handleUnlock);

    this.reset();
    this.updateHud();
  }

  reset() {
    this.camera.position.set(
      PLAYER_CONFIG.spawnPosition.x,
      PLAYER_CONFIG.spawnPosition.y,
      PLAYER_CONFIG.spawnPosition.z,
    );
    this.camera.lookAt(
      PLAYER_CONFIG.lookAt.x,
      PLAYER_CONFIG.lookAt.y,
      PLAYER_CONFIG.lookAt.z,
    );
  }

  update(deltaTime) {
    this.movement.update(deltaTime, this.input, this.controls);
    this.updateHud();
  }

  updateHud() {
    this.hud.updateCoordinates(this.camera.position);
  }

  get position() {
    return this.camera.position;
  }

  setPose(position, rotation) {
    this.camera.position.copy(position);
    this.camera.rotation.set(0, rotation.y, 0);
    this.movement.stop();
    this.updateHud();
  }

  handleStartRequested() {
    if (PLAYER_CONFIG.pointer.useRawMouseInput) {
      this.controls.lock(true);
      return;
    }

    this.controls.domElement.requestPointerLock();
  }

  handleLock() {
    this.startOverlay.hide();
  }

  handleUnlock() {
    this.input.reset();
    this.movement.stop();
    this.startOverlay.show();
  }

  dispose() {
    if (this.controls.isLocked) {
      this.controls.unlock();
    }

    this.startOverlay.removeEventListener('startrequested', this.handleStartRequested);
    this.controls.removeEventListener('lock', this.handleLock);
    this.controls.removeEventListener('unlock', this.handleUnlock);
    this.startOverlay.dispose();
    this.input.dispose();
    this.controls.dispose();
  }
}
