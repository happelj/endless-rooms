import * as THREE from 'three';
import { PLAYER_CONFIG } from '../config/constants.js';

export class Movement {
  constructor(config = PLAYER_CONFIG.movement, collisionSystem = null, body = PLAYER_CONFIG.body) {
    this.config = config;
    this.collisionSystem = collisionSystem;
    this.body = body;
    this.velocity = new THREE.Vector2();
    this.targetVelocity = new THREE.Vector2();
    this.previousPosition = new THREE.Vector3();
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

    this.move(controls, this.velocity.x * deltaTime, this.velocity.y * deltaTime);
  }

  move(controls, rightDistance, forwardDistance) {
    if (!this.collisionSystem) {
      controls.moveRight(rightDistance);
      controls.moveForward(forwardDistance);
      return;
    }

    const controlledObject = controls.object;

    this.moveAxis(controlledObject, controls, rightDistance, 'right');
    this.moveAxis(controlledObject, controls, forwardDistance, 'forward');
  }

  moveAxis(controlledObject, controls, distance, axis) {
    if (distance === 0) {
      return;
    }

    this.previousPosition.copy(controlledObject.position);

    if (axis === 'right') {
      controls.moveRight(distance);
    } else {
      controls.moveForward(distance);
    }

    this.collisionSystem.resolvePlayerPosition(
      controlledObject.position,
      this.previousPosition,
      this.body,
    );
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
