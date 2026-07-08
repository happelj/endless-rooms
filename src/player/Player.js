import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { PLAYER_CONFIG } from '../config/constants.js';
import { Input } from './Input.js';
import { MobileControls } from './MobileControls.js';
import { Movement } from './Movement.js';
import { Physics } from './Physics.js';
import { StartOverlay } from '../ui/StartOverlay.js';

export class Player extends EventTarget {
  constructor(camera, domElement, overlayContainer, hud, { collisionSystem = null } = {}) {
    super();

    this.camera = camera;
    this.hud = hud;
    this.controls = new PointerLockControls(camera, domElement);
    this.input = new Input();
    this.movement = new Movement(PLAYER_CONFIG.movement, collisionSystem, PLAYER_CONFIG.body);
    this.physics = new Physics(PLAYER_CONFIG.physics, collisionSystem, PLAYER_CONFIG.body);
    this.startOverlay = new StartOverlay(overlayContainer);
    this.mobileControls = new MobileControls({
      container: overlayContainer,
      input: this.input,
      camera: this.camera,
      onInteract: () => this.dispatchEvent(new Event('interactionrequested')),
      onExit: () => this.deactivateTouchSession(),
    });
    this.isMovementPaused = false;
    this.isTouchSessionActive = false;

    if (this.mobileControls.isSupported()) {
      this.startOverlay.setPrompt('Tap anywhere to begin.');
    }

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
    this.physics.reset(this.camera.position);
  }

  update(deltaTime) {
    if (this.isMovementPaused) {
      this.movement.stop();
    } else {
      this.movement.update(deltaTime, this.input, this.controls);
    }

    this.physics.update(deltaTime, this.camera.position);
    this.updateHud();
  }

  updateHud() {
    this.hud.updateCoordinates(this.camera.position);
    this.hud.updatePhysicsDebug(this.physics.getState());
  }

  get position() {
    return this.camera.position;
  }

  setPose(position, rotation) {
    this.camera.position.copy(position);
    this.camera.rotation.set(0, rotation.y, 0);
    this.mobileControls.syncCameraRotation();
    this.movement.stop();
    this.physics.resolveFloor(this.camera.position, false);
    this.updateHud();
  }

  setMovementPaused(isPaused) {
    if (this.isMovementPaused === isPaused) {
      return;
    }

    this.isMovementPaused = isPaused;
    this.input.reset();
    this.movement.stop();
  }

  handleStartRequested() {
    if (this.mobileControls.isSupported()) {
      this.activateTouchSession();
      return;
    }

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
    this.setMovementPaused(false);
    this.input.reset();
    this.movement.stop();
    this.startOverlay.show();
  }

  activateTouchSession() {
    if (this.isTouchSessionActive) {
      return;
    }

    this.isTouchSessionActive = true;
    this.startOverlay.hide();
    this.mobileControls.setEnabled(true);
    this.dispatchEvent(new Event('touchsessionstart'));
  }

  deactivateTouchSession() {
    if (!this.isTouchSessionActive) {
      return;
    }

    this.isTouchSessionActive = false;
    this.setMovementPaused(false);
    this.input.reset();
    this.movement.stop();
    this.mobileControls.setEnabled(false);
    this.startOverlay.show();
    this.dispatchEvent(new Event('touchsessionend'));
  }

  dispose() {
    if (this.controls.isLocked) {
      this.controls.unlock();
    }

    this.deactivateTouchSession();
    this.startOverlay.removeEventListener('startrequested', this.handleStartRequested);
    this.controls.removeEventListener('lock', this.handleLock);
    this.controls.removeEventListener('unlock', this.handleUnlock);
    this.mobileControls.dispose();
    this.startOverlay.dispose();
    this.input.dispose();
    this.controls.dispose();
  }
}
