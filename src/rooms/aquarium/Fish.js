import * as THREE from 'three';

const DEFAULT_BOUNDARY_MARGIN = 0.55;
const DEFAULT_TURN_RATE = 2.4;
const DEFAULT_WANDER_MIN_SECONDS = 1.4;
const DEFAULT_WANDER_MAX_SECONDS = 3.2;

export class Fish {
  constructor({
    id,
    bounds,
    position,
    speed,
    scale,
    bodyMaterial,
    finMaterial,
    bodyGeometry,
    tailGeometry,
    dorsalFinGeometry,
  }) {
    this.id = id;
    this.bounds = bounds;
    this.speed = speed;
    this.scale = scale;
    this.turnRate = DEFAULT_TURN_RATE;
    this.boundaryMargin = DEFAULT_BOUNDARY_MARGIN;
    this.position = new THREE.Vector3(position.x, position.y, position.z);
    this.velocity = new THREE.Vector3(speed, 0, 0);
    this.targetDirection = new THREE.Vector3(1, 0, 0);
    this.desiredVelocity = new THREE.Vector3();
    this.boundarySteer = new THREE.Vector3();
    this.forward = new THREE.Vector3(1, 0, 0);
    this.phase = Math.random() * Math.PI * 2;
    this.wanderTimer = this.getNextWanderDelay();

    this.group = new THREE.Group();
    this.group.name = `Fish:${id}`;
    this.group.position.copy(this.position);

    this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    this.body.name = `FishBody:${id}`;
    this.body.scale.set(scale.length, scale.height, scale.width);
    this.body.castShadow = true;
    this.body.receiveShadow = false;
    this.group.add(this.body);

    this.tail = new THREE.Mesh(tailGeometry, finMaterial);
    this.tail.name = `FishTail:${id}`;
    this.tail.position.set(-scale.length * 0.82, 0, 0);
    this.tail.rotation.z = Math.PI / 2;
    this.tail.scale.set(scale.height, scale.height, scale.height);
    this.group.add(this.tail);

    this.dorsalFin = new THREE.Mesh(dorsalFinGeometry, finMaterial);
    this.dorsalFin.name = `FishDorsalFin:${id}`;
    this.dorsalFin.position.set(-scale.length * 0.05, scale.height * 0.76, 0);
    this.dorsalFin.rotation.z = Math.PI / 2;
    this.dorsalFin.scale.set(scale.height * 0.72, scale.height * 0.55, scale.height * 0.72);
    this.group.add(this.dorsalFin);
  }

  update(deltaTime, elapsedTime) {
    this.wanderTimer -= deltaTime;

    if (this.wanderTimer <= 0) {
      this.chooseWanderDirection();
      this.wanderTimer = this.getNextWanderDelay();
    }

    this.applyBoundaryAvoidance();
    this.desiredVelocity.copy(this.targetDirection).multiplyScalar(this.speed);
    this.velocity.lerp(this.desiredVelocity, 1 - Math.exp(-this.turnRate * deltaTime));
    this.position.addScaledVector(this.velocity, deltaTime);
    this.clampPosition();
    this.updateTransform(elapsedTime);
  }

  chooseWanderDirection() {
    this.targetDirection.set(
      Math.random() * 2 - 1,
      (Math.random() * 2 - 1) * 0.28,
      Math.random() * 2 - 1,
    );

    if (this.targetDirection.lengthSq() === 0) {
      this.targetDirection.set(1, 0, 0);
    }

    this.targetDirection.normalize();
  }

  applyBoundaryAvoidance() {
    this.boundarySteer.set(0, 0, 0);
    this.addBoundarySteer('x', this.bounds.min.x, this.bounds.max.x);
    this.addBoundarySteer('y', this.bounds.min.y, this.bounds.max.y);
    this.addBoundarySteer('z', this.bounds.min.z, this.bounds.max.z);

    if (this.boundarySteer.lengthSq() > 0) {
      this.boundarySteer.normalize();
      this.targetDirection.lerp(this.boundarySteer, 0.42).normalize();
    }
  }

  addBoundarySteer(axis, min, max) {
    const distanceToMin = this.position[axis] - min;
    const distanceToMax = max - this.position[axis];

    if (distanceToMin < this.boundaryMargin) {
      this.boundarySteer[axis] += 1 - distanceToMin / this.boundaryMargin;
    }

    if (distanceToMax < this.boundaryMargin) {
      this.boundarySteer[axis] -= 1 - distanceToMax / this.boundaryMargin;
    }
  }

  clampPosition() {
    this.position.x = THREE.MathUtils.clamp(this.position.x, this.bounds.min.x, this.bounds.max.x);
    this.position.y = THREE.MathUtils.clamp(this.position.y, this.bounds.min.y, this.bounds.max.y);
    this.position.z = THREE.MathUtils.clamp(this.position.z, this.bounds.min.z, this.bounds.max.z);
  }

  updateTransform(elapsedTime) {
    if (this.velocity.lengthSq() > 0.0001) {
      this.forward.copy(this.velocity).normalize();
      this.group.rotation.y = -Math.atan2(this.forward.z, this.forward.x);
      this.group.rotation.z = Math.asin(THREE.MathUtils.clamp(this.forward.y, -0.35, 0.35)) * 0.35;
    }

    const swim = Math.sin(elapsedTime * (5.2 + this.speed) + this.phase);
    this.tail.rotation.y = swim * 0.56;
    this.body.position.y = Math.sin(elapsedTime * 1.6 + this.phase) * 0.025;
    this.group.position.copy(this.position);
  }

  getNextWanderDelay() {
    return THREE.MathUtils.lerp(
      DEFAULT_WANDER_MIN_SECONDS,
      DEFAULT_WANDER_MAX_SECONDS,
      Math.random(),
    );
  }

  dispose() {
    this.group.remove(this.body, this.tail, this.dorsalFin);
  }
}
