import * as THREE from 'three';
import { PLAYER_CONFIG } from '../config/constants.js';

const ZERO_INTENT = Object.freeze({ x: 0, y: 0 });

export class MobileControls {
  constructor({
    container,
    input,
    camera,
    onInteract,
    onExit,
    config = PLAYER_CONFIG.touch,
  }) {
    this.container = container;
    this.input = input;
    this.camera = camera;
    this.onInteract = onInteract;
    this.onExit = onExit;
    this.config = config;
    this.enabled = false;
    this.movePointerId = null;
    this.lookPointerId = null;
    this.lookPrevious = { x: 0, y: 0 };
    this.pitch = 0;
    this.yaw = 0;
    this.mediaQuery = window.matchMedia(config.coarsePointerQuery);

    this.root = document.createElement('div');
    this.root.className = 'mobile-controls';
    this.root.hidden = true;
    this.root.innerHTML = this.createTemplate();
    this.container.append(this.root);

    this.movePad = this.root.querySelector('[data-mobile-move-pad]');
    this.moveStick = this.root.querySelector('[data-mobile-move-stick]');
    this.lookSurface = this.root.querySelector('[data-mobile-look-surface]');
    this.sprintButton = this.root.querySelector('[data-mobile-sprint]');
    this.interactButton = this.root.querySelector('[data-mobile-interact]');
    this.exitButton = this.root.querySelector('[data-mobile-exit]');

    this.handleMovePointerDown = this.handleMovePointerDown.bind(this);
    this.handleMovePointerMove = this.handleMovePointerMove.bind(this);
    this.handleMovePointerUp = this.handleMovePointerUp.bind(this);
    this.handleLookPointerDown = this.handleLookPointerDown.bind(this);
    this.handleLookPointerMove = this.handleLookPointerMove.bind(this);
    this.handleLookPointerUp = this.handleLookPointerUp.bind(this);
    this.handleSprintPointerDown = this.handleSprintPointerDown.bind(this);
    this.handleSprintPointerUp = this.handleSprintPointerUp.bind(this);
    this.handleInteractPointerDown = this.handleInteractPointerDown.bind(this);
    this.handleExitPointerDown = this.handleExitPointerDown.bind(this);

    this.addEventListeners();
  }

  createTemplate() {
    return `
      <div class="mobile-look-surface" data-mobile-look-surface aria-hidden="true"></div>
      <div class="mobile-move-pad" data-mobile-move-pad aria-label="Move">
        <div class="mobile-move-pad__ring">
          <div class="mobile-move-pad__stick" data-mobile-move-stick></div>
        </div>
      </div>
      <div class="mobile-action-stack">
        <button class="mobile-control-button mobile-control-button--interact" type="button" data-mobile-interact aria-label="Interact">E</button>
        <button class="mobile-control-button mobile-control-button--sprint" type="button" data-mobile-sprint aria-label="Sprint">Shift</button>
      </div>
      <button class="mobile-pause-button" type="button" data-mobile-exit aria-label="Pause">Pause</button>
    `;
  }

  addEventListeners() {
    this.movePad.addEventListener('pointerdown', this.handleMovePointerDown);
    this.movePad.addEventListener('pointermove', this.handleMovePointerMove);
    this.movePad.addEventListener('pointerup', this.handleMovePointerUp);
    this.movePad.addEventListener('pointercancel', this.handleMovePointerUp);

    this.lookSurface.addEventListener('pointerdown', this.handleLookPointerDown);
    this.lookSurface.addEventListener('pointermove', this.handleLookPointerMove);
    this.lookSurface.addEventListener('pointerup', this.handleLookPointerUp);
    this.lookSurface.addEventListener('pointercancel', this.handleLookPointerUp);

    this.sprintButton.addEventListener('pointerdown', this.handleSprintPointerDown);
    this.sprintButton.addEventListener('pointerup', this.handleSprintPointerUp);
    this.sprintButton.addEventListener('pointercancel', this.handleSprintPointerUp);
    this.sprintButton.addEventListener('pointerleave', this.handleSprintPointerUp);

    this.interactButton.addEventListener('pointerdown', this.handleInteractPointerDown);
    this.exitButton.addEventListener('pointerdown', this.handleExitPointerDown);
  }

  isSupported() {
    return this.mediaQuery.matches || navigator.maxTouchPoints > 0;
  }

  setEnabled(isEnabled) {
    const shouldEnable = isEnabled && this.isSupported();

    if (this.enabled === shouldEnable) {
      return;
    }

    this.enabled = shouldEnable;
    this.root.hidden = !this.enabled;
    this.root.classList.toggle('is-active', this.enabled);
    this.input.setTouchControlsEnabled(this.enabled);

    if (this.enabled) {
      this.syncCameraRotation();
      return;
    }

    this.resetPointers();
  }

  syncCameraRotation() {
    this.camera.rotation.order = 'YXZ';
    this.pitch = this.camera.rotation.x;
    this.yaw = this.camera.rotation.y;
  }

  resetPointers() {
    this.movePointerId = null;
    this.lookPointerId = null;
    this.input.resetTouchIntent();
    this.moveStick.style.transform = 'translate3d(0, 0, 0)';
  }

  handleMovePointerDown(event) {
    if (!this.enabled || this.movePointerId !== null) {
      return;
    }

    event.preventDefault();
    this.movePointerId = event.pointerId;
    this.movePad.setPointerCapture(event.pointerId);
    this.updateMovementIntent(event);
  }

  handleMovePointerMove(event) {
    if (!this.enabled || event.pointerId !== this.movePointerId) {
      return;
    }

    event.preventDefault();
    this.updateMovementIntent(event);
  }

  handleMovePointerUp(event) {
    if (event.pointerId !== this.movePointerId) {
      return;
    }

    event.preventDefault();
    this.movePointerId = null;
    this.input.setTouchMovementIntent(ZERO_INTENT);
    this.moveStick.style.transform = 'translate3d(0, 0, 0)';
  }

  updateMovementIntent(event) {
    const rect = this.movePad.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const rawX = event.clientX - centerX;
    const rawY = event.clientY - centerY;
    const distance = Math.hypot(rawX, rawY);
    const radius = this.config.joystickRadius;
    const clampedDistance = Math.min(distance, radius);
    const normalX = distance > 0 ? rawX / distance : 0;
    const normalY = distance > 0 ? rawY / distance : 0;
    const normalizedDistance = clampedDistance / radius;

    this.moveStick.style.transform = `translate3d(${normalX * clampedDistance}px, ${normalY * clampedDistance}px, 0)`;

    if (normalizedDistance < this.config.joystickDeadZone) {
      this.input.setTouchMovementIntent(ZERO_INTENT);
      return;
    }

    this.input.setTouchMovementIntent({
      x: normalX * normalizedDistance,
      y: -normalY * normalizedDistance,
    });
  }

  handleLookPointerDown(event) {
    if (!this.enabled || this.lookPointerId !== null) {
      return;
    }

    event.preventDefault();
    this.lookPointerId = event.pointerId;
    this.lookPrevious.x = event.clientX;
    this.lookPrevious.y = event.clientY;
    this.lookSurface.setPointerCapture(event.pointerId);
    this.syncCameraRotation();
  }

  handleLookPointerMove(event) {
    if (!this.enabled || event.pointerId !== this.lookPointerId) {
      return;
    }

    event.preventDefault();

    const deltaX = event.clientX - this.lookPrevious.x;
    const deltaY = event.clientY - this.lookPrevious.y;

    this.lookPrevious.x = event.clientX;
    this.lookPrevious.y = event.clientY;
    this.yaw -= deltaX * this.config.lookSensitivity;
    this.pitch -= deltaY * this.config.lookSensitivity;
    this.pitch = THREE.MathUtils.clamp(
      this.pitch,
      Math.PI / 2 - PLAYER_CONFIG.pointer.maxPolarAngle,
      Math.PI / 2 - PLAYER_CONFIG.pointer.minPolarAngle,
    );
    this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
  }

  handleLookPointerUp(event) {
    if (event.pointerId !== this.lookPointerId) {
      return;
    }

    event.preventDefault();
    this.lookPointerId = null;
  }

  handleSprintPointerDown(event) {
    if (!this.enabled) {
      return;
    }

    event.preventDefault();
    this.input.setTouchSprint(true);
  }

  handleSprintPointerUp(event) {
    if (!this.enabled) {
      return;
    }

    event.preventDefault();
    this.input.setTouchSprint(false);
  }

  handleInteractPointerDown(event) {
    if (!this.enabled) {
      return;
    }

    event.preventDefault();
    this.onInteract?.();
  }

  handleExitPointerDown(event) {
    if (!this.enabled) {
      return;
    }

    event.preventDefault();
    this.onExit?.();
  }

  dispose() {
    this.setEnabled(false);
    this.movePad.removeEventListener('pointerdown', this.handleMovePointerDown);
    this.movePad.removeEventListener('pointermove', this.handleMovePointerMove);
    this.movePad.removeEventListener('pointerup', this.handleMovePointerUp);
    this.movePad.removeEventListener('pointercancel', this.handleMovePointerUp);
    this.lookSurface.removeEventListener('pointerdown', this.handleLookPointerDown);
    this.lookSurface.removeEventListener('pointermove', this.handleLookPointerMove);
    this.lookSurface.removeEventListener('pointerup', this.handleLookPointerUp);
    this.lookSurface.removeEventListener('pointercancel', this.handleLookPointerUp);
    this.sprintButton.removeEventListener('pointerdown', this.handleSprintPointerDown);
    this.sprintButton.removeEventListener('pointerup', this.handleSprintPointerUp);
    this.sprintButton.removeEventListener('pointercancel', this.handleSprintPointerUp);
    this.sprintButton.removeEventListener('pointerleave', this.handleSprintPointerUp);
    this.interactButton.removeEventListener('pointerdown', this.handleInteractPointerDown);
    this.exitButton.removeEventListener('pointerdown', this.handleExitPointerDown);
    this.root.remove();
  }
}
