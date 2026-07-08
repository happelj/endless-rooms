import { PLAYER_CONFIG } from '../config/constants.js';

const EMPTY_TOUCH_INTENT = Object.freeze({ x: 0, y: 0 });

export class Input {
  constructor(target = document) {
    this.target = target;
    this.pressedKeys = new Set();
    this.touchControlsEnabled = false;
    this.touchMovementIntent = { x: 0, y: 0 };
    this.touchSprint = false;

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handleBlur = this.handleBlur.bind(this);

    this.target.addEventListener('keydown', this.handleKeyDown);
    this.target.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleBlur);
  }

  getMovementIntent() {
    const { keys } = PLAYER_CONFIG.movement;
    const right = this.isAnyPressed(keys.right) ? 1 : 0;
    const left = this.isAnyPressed(keys.left) ? 1 : 0;
    const forward = this.isAnyPressed(keys.forward) ? 1 : 0;
    const backward = this.isAnyPressed(keys.backward) ? 1 : 0;

    const intent = {
      x: right - left + this.getTouchMovementIntent().x,
      y: forward - backward + this.getTouchMovementIntent().y,
    };

    const length = Math.hypot(intent.x, intent.y);

    if (length > 1) {
      intent.x /= length;
      intent.y /= length;
    }

    return intent;
  }

  isSprinting() {
    return this.touchSprint || this.isAnyPressed(PLAYER_CONFIG.movement.keys.sprint);
  }

  isAnyPressed(codes) {
    return codes.some((code) => this.pressedKeys.has(code));
  }

  handleKeyDown(event) {
    this.pressedKeys.add(event.code);
  }

  handleKeyUp(event) {
    this.pressedKeys.delete(event.code);
  }

  handleBlur() {
    this.pressedKeys.clear();
    this.resetTouchIntent();
  }

  reset() {
    this.pressedKeys.clear();
    this.resetTouchIntent();
  }

  setTouchControlsEnabled(isEnabled) {
    this.touchControlsEnabled = isEnabled;

    if (!isEnabled) {
      this.resetTouchIntent();
    }
  }

  isTouchControlsEnabled() {
    return this.touchControlsEnabled;
  }

  setTouchMovementIntent(intent) {
    this.touchMovementIntent.x = intent.x;
    this.touchMovementIntent.y = intent.y;
  }

  getTouchMovementIntent() {
    return this.touchControlsEnabled
      ? this.touchMovementIntent
      : EMPTY_TOUCH_INTENT;
  }

  setTouchSprint(isSprinting) {
    this.touchSprint = this.touchControlsEnabled && isSprinting;
  }

  resetTouchIntent() {
    this.touchMovementIntent.x = 0;
    this.touchMovementIntent.y = 0;
    this.touchSprint = false;
  }

  dispose() {
    this.target.removeEventListener('keydown', this.handleKeyDown);
    this.target.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);
    this.pressedKeys.clear();
  }
}
