import { PLAYER_CONFIG } from '../config/constants.js';

export class Physics {
  constructor(config = PLAYER_CONFIG.physics, collisionSystem = null, body = PLAYER_CONFIG.body) {
    this.config = config;
    this.collisionSystem = collisionSystem;
    this.body = body;
    this.verticalVelocity = 0;
    this.isGrounded = false;
    this.groundY = null;
  }

  reset(position) {
    this.verticalVelocity = 0;
    this.resolveFloor(position, true);
  }

  update(deltaTime, position) {
    const fixedDeltaTime = Math.min(deltaTime, this.config.maxDeltaTime);

    this.resolveCeiling(position);
    this.resolveFloor(position, false);

    if (this.isGrounded) {
      this.verticalVelocity = 0;
      return;
    }

    this.verticalVelocity = Math.max(
      this.verticalVelocity - this.config.gravity * fixedDeltaTime,
      -this.config.maxFallSpeed,
    );
    position.y += this.verticalVelocity * fixedDeltaTime;

    this.resolveCeiling(position);
    this.resolveFloor(position, false);
  }

  resolveFloor(position, forceSnap) {
    const ground = this.collisionSystem?.getGroundInfo(position, this.body) ?? null;

    if (!ground) {
      this.isGrounded = false;
      this.groundY = null;
      return;
    }

    const footY = this.getFootY(position);
    const snapDistance = forceSnap
      ? Number.POSITIVE_INFINITY
      : this.config.groundedSnapDistance;
    const isBelowFloor = footY < ground.y - this.config.floorTolerance;
    const isCloseToGround = footY <= ground.y + snapDistance;
    const isFallingOrStable = this.verticalVelocity <= this.config.verticalStopEpsilon;

    if (isBelowFloor || (isCloseToGround && isFallingOrStable)) {
      this.snapToGround(position, ground.y);
      return;
    }

    this.isGrounded = false;
    this.groundY = ground.y;
  }

  resolveCeiling(position) {
    const ceiling = this.collisionSystem?.getCeilingInfo(position, this.body) ?? null;

    if (!ceiling) {
      return;
    }

    if (position.y > ceiling.maxEyeY) {
      position.y = ceiling.maxEyeY;
      this.verticalVelocity = Math.min(this.verticalVelocity, 0);
    }
  }

  snapToGround(position, groundY) {
    position.y = groundY + this.body.eyeHeight;
    this.verticalVelocity = 0;
    this.isGrounded = true;
    this.groundY = groundY;
  }

  getFootY(position) {
    return position.y - this.body.eyeHeight;
  }

  getState() {
    return {
      grounded: this.isGrounded,
      verticalVelocity: this.verticalVelocity,
    };
  }
}
