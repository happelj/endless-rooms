import * as THREE from 'three';
import { PLAYER_CONFIG } from '../config/constants.js';

export class Movement {
  constructor(config = PLAYER_CONFIG.movement) {
    this.config = config;
    this.velocity = new THREE.Vector2();
    this.targetVelocity = new THREE.Vector2();
  }

  update(deltaTime, input, controls) {
    if (!controls.isLocked) {
      this.stop();
      return;
    }

    const intent = input.getMovementIntent();
    const speed = this.getCurrentSpeed(input);

    this.targetVelocity.set(intent.x * speed, intent.y * speed);
    this.velocity.lerp(this.targetVelocity, this.getSmoothingFactor(deltaTime));
    this.trimVelocity();

    controls.moveRight(this.velocity.x * deltaTime);
    controls.moveForward(this.velocity.y * deltaTime);
  }

  getCurrentSpeed(input) {
    return input.isSprinting()
      ? this.config.walkSpeed * this.config.sprintMultiplier
      : this.config.walkSpeed;
  }

  getSmoothingFactor(deltaTime) {
    return 1 - Math.exp(-this.config.acceleration * deltaTime);
  }

  trimVelocity() {
    if (Math.abs(this.velocity.x) < this.config.stopEpsilon) {
      this.velocity.x = 0;
    }

    if (Math.abs(this.velocity.y) < this.config.stopEpsilon) {
      this.velocity.y = 0;
    }
  }

  stop() {
    this.velocity.set(0, 0);
    this.targetVelocity.set(0, 0);
  }
}

