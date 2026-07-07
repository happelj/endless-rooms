import * as THREE from 'three';

const DEFAULT_BOUNDARY_MARGIN = 0.75;
const DEFAULT_TURN_RATE = 1.9;
const DEFAULT_WANDER_MIN_SECONDS = 3.2;
const DEFAULT_WANDER_MAX_SECONDS = 6.4;
const WAYPOINT_REACHED_DISTANCE = 0.34;
const MIN_WAYPOINT_DISTANCE = 2.4;

export class Fish {
  constructor({
    id,
    bounds,
    position,
    speed,
    scale,
    bodyMaterial,
    finMaterial,
    eyeMaterial,
    bodyGeometry,
    tailGeometry,
    dorsalFinGeometry,
    eyeGeometry,
  }) {
    this.id = id;
    this.bounds = bounds;
    this.speed = speed;
    this.scale = scale;
    this.turnRate = DEFAULT_TURN_RATE;
    this.boundaryMargin = DEFAULT_BOUNDARY_MARGIN;
    this.position = new THREE.Vector3(position.x, position.y, position.z);
    this.velocity = new THREE.Vector3();
    this.targetPosition = new THREE.Vector3();
    this.seekDirection = new THREE.Vector3(1, 0, 0);
    this.desiredVelocity = new THREE.Vector3();
    this.boundarySteer = new THREE.Vector3();
    this.forward = new THREE.Vector3(1, 0, 0);
    this.phase = Math.random() * Math.PI * 2;
    this.wanderTimer = 0;

    this.group = new THREE.Group();
    this.group.name = `Fish:${id}`;
    this.group.position.copy(this.position);

    this.body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    this.body.name = `FishBody:${id}`;
    this.body.scale.set(scale.length, scale.height, scale.width);
    this.body.castShadow = true;
    this.body.receiveShadow = false;
    this.group.add(this.body);

    this.nose = new THREE.Mesh(tailGeometry, bodyMaterial);
    this.nose.name = `FishNose:${id}`;
    this.nose.position.set(scale.length * 0.82, 0, 0);
    this.nose.rotation.z = -Math.PI / 2;
    this.nose.scale.set(scale.height * 0.42, scale.height * 0.5, scale.width * 0.42);
    this.group.add(this.nose);

    this.tailGroup = new THREE.Group();
    this.tailGroup.name = `FishTail:${id}`;
    this.tailGroup.position.set(-scale.length * 0.84, 0, 0);
    this.group.add(this.tailGroup);

    this.tailUpper = this.createFin(tailGeometry, finMaterial, {
      name: `FishTailUpper:${id}`,
      position: { x: 0, y: scale.height * 0.18, z: 0 },
      rotation: { x: 0, y: 0, z: Math.PI / 2 },
      scale: { x: scale.height * 0.92, y: scale.height * 0.78, z: scale.width * 0.55 },
    });
    this.tailLower = this.createFin(tailGeometry, finMaterial, {
      name: `FishTailLower:${id}`,
      position: { x: 0, y: -scale.height * 0.18, z: 0 },
      rotation: { x: 0, y: 0, z: Math.PI / 2 },
      scale: { x: scale.height * 0.92, y: scale.height * 0.78, z: scale.width * 0.55 },
    });
    this.tailLower.rotation.x = Math.PI;
    this.tailGroup.add(this.tailUpper, this.tailLower);

    this.dorsalFin = new THREE.Mesh(dorsalFinGeometry, finMaterial);
    this.dorsalFin.name = `FishDorsalFin:${id}`;
    this.dorsalFin.position.set(-scale.length * 0.08, scale.height * 0.82, 0);
    this.dorsalFin.rotation.z = Math.PI / 2;
    this.dorsalFin.scale.set(scale.height * 0.62, scale.height * 0.56, scale.width * 0.46);
    this.group.add(this.dorsalFin);

    this.leftFin = this.createFin(dorsalFinGeometry, finMaterial, {
      name: `FishLeftPectoralFin:${id}`,
      position: { x: scale.length * 0.18, y: -scale.height * 0.1, z: scale.width * 0.82 },
      rotation: { x: Math.PI / 2.6, y: 0.48, z: Math.PI / 2 },
      scale: { x: scale.height * 0.46, y: scale.height * 0.38, z: scale.width * 0.42 },
    });
    this.rightFin = this.createFin(dorsalFinGeometry, finMaterial, {
      name: `FishRightPectoralFin:${id}`,
      position: { x: scale.length * 0.18, y: -scale.height * 0.1, z: -scale.width * 0.82 },
      rotation: { x: -Math.PI / 2.6, y: -0.48, z: Math.PI / 2 },
      scale: { x: scale.height * 0.46, y: scale.height * 0.38, z: scale.width * 0.42 },
    });
    this.leftEye = this.createEye(eyeGeometry, eyeMaterial, {
      name: `FishLeftEye:${id}`,
      x: scale.length * 0.58,
      y: scale.height * 0.24,
      z: scale.width * 0.52,
      size: Math.max(scale.height * 0.15, 0.018),
    });
    this.rightEye = this.createEye(eyeGeometry, eyeMaterial, {
      name: `FishRightEye:${id}`,
      x: scale.length * 0.58,
      y: scale.height * 0.24,
      z: -scale.width * 0.52,
      size: Math.max(scale.height * 0.15, 0.018),
    });
    this.group.add(this.leftFin, this.rightFin, this.leftEye, this.rightEye);

    this.chooseWanderTarget(true);
    this.velocity.copy(this.targetPosition).sub(this.position).normalize().multiplyScalar(this.speed);
  }

  update(deltaTime, elapsedTime) {
    this.wanderTimer -= deltaTime;

    if (
      this.wanderTimer <= 0
      || this.position.distanceToSquared(this.targetPosition) <= WAYPOINT_REACHED_DISTANCE ** 2
    ) {
      this.chooseWanderTarget();
    }

    this.seekDirection.copy(this.targetPosition).sub(this.position).normalize();
    this.applyBoundaryAvoidance();
    this.desiredVelocity.copy(this.seekDirection).multiplyScalar(this.speed);
    this.velocity.lerp(this.desiredVelocity, 1 - Math.exp(-this.turnRate * deltaTime));
    this.position.addScaledVector(this.velocity, deltaTime);
    this.clampPosition();
    this.updateTransform(elapsedTime);
  }

  createFin(geometry, material, { name, position, rotation, scale }) {
    const fin = new THREE.Mesh(geometry, material);
    fin.name = name;
    fin.position.set(position.x, position.y, position.z);
    fin.rotation.set(rotation.x, rotation.y, rotation.z);
    fin.scale.set(scale.x, scale.y, scale.z);

    return fin;
  }

  createEye(geometry, material, { name, x, y, z, size }) {
    const eye = new THREE.Mesh(geometry, material);
    eye.name = name;
    eye.position.set(x, y, z);
    eye.scale.setScalar(size);

    return eye;
  }

  chooseWanderTarget(force = false) {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      this.targetPosition.set(
        THREE.MathUtils.lerp(this.bounds.min.x, this.bounds.max.x, Math.random()),
        THREE.MathUtils.lerp(this.bounds.min.y, this.bounds.max.y, Math.random()),
        THREE.MathUtils.lerp(this.bounds.min.z, this.bounds.max.z, Math.random()),
      );

      if (force || this.targetPosition.distanceToSquared(this.position) >= MIN_WAYPOINT_DISTANCE ** 2) {
        break;
      }
    }

    this.wanderTimer = this.getNextWanderDelay();
  }

  applyBoundaryAvoidance() {
    this.boundarySteer.set(0, 0, 0);
    this.addBoundarySteer('x', this.bounds.min.x, this.bounds.max.x);
    this.addBoundarySteer('y', this.bounds.min.y, this.bounds.max.y);
    this.addBoundarySteer('z', this.bounds.min.z, this.bounds.max.z);

    if (this.boundarySteer.lengthSq() > 0) {
      this.boundarySteer.normalize();
      this.seekDirection.lerp(this.boundarySteer, 0.56).normalize();
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
    const finStroke = Math.sin(elapsedTime * 4.2 + this.phase);
    this.tailGroup.rotation.y = swim * 0.72;
    this.leftFin.rotation.y = 0.48 + finStroke * 0.16;
    this.rightFin.rotation.y = -0.48 - finStroke * 0.16;
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
    this.group.clear();
  }
}
