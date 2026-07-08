import * as THREE from 'three';

const ENTITY_STATES = Object.freeze({
  idle: 'Idle',
  investigate: 'Investigate',
  stalk: 'Stalk',
  chase: 'Chase',
  disappear: 'Disappear',
});

export class ForgottenEntity {
  constructor({ name, position, material, seedOffset = 0 }) {
    this.name = name;
    this.state = ENTITY_STATES.idle;
    this.stateTime = 0;
    this.seedOffset = seedOffset;
    this.target = new THREE.Vector3(position.x, position.y, position.z);
    this.velocity = new THREE.Vector3();
    this.group = this.createMesh(material);
    this.group.name = name;
    this.group.position.set(position.x, position.y, position.z);
  }

  createMesh(material) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.34, 1.55, 0.28), material);
    body.name = `${this.name}:Body`;
    body.position.y = 0.82;
    body.castShadow = true;
    body.receiveShadow = true;

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.28, 0.24), material);
    head.name = `${this.name}:Head`;
    head.position.y = 1.73;
    head.castShadow = true;

    group.add(body, head);
    this.bodyGeometry = body.geometry;
    this.headGeometry = head.geometry;

    return group;
  }

  update(deltaTime, elapsedTime, playerLocalPosition, danger) {
    this.stateTime += deltaTime;
    const distance = this.group.position.distanceTo(playerLocalPosition);
    this.updateState(distance, danger);
    this.updateTarget(elapsedTime, playerLocalPosition, distance);
    this.move(deltaTime);
  }

  updateState(distance, danger) {
    if (this.state === ENTITY_STATES.disappear) {
      return;
    }

    if (distance < 4.8) {
      this.state = ENTITY_STATES.chase;
      this.stateTime = 0;
      return;
    }

    if (distance < 10 + danger * 8) {
      this.state = ENTITY_STATES.stalk;
      return;
    }

    if (this.stateTime > 8 && Math.sin(this.stateTime + this.seedOffset) > 0.82) {
      this.state = ENTITY_STATES.investigate;
      this.stateTime = 0;
    }

    if (distance > 48 && this.stateTime > 18) {
      this.state = ENTITY_STATES.disappear;
      this.group.visible = false;
    }
  }

  updateTarget(elapsedTime, playerLocalPosition, distance) {
    if (this.state === ENTITY_STATES.chase) {
      this.target.copy(playerLocalPosition);
      return;
    }

    if (this.state === ENTITY_STATES.stalk) {
      this.target.copy(playerLocalPosition);
      const away = this.group.position.clone().sub(playerLocalPosition).normalize();
      this.target.add(away.multiplyScalar(Math.max(6, Math.min(11, distance))));
      return;
    }

    if (this.state === ENTITY_STATES.investigate) {
      this.target.copy(playerLocalPosition);
      return;
    }

    if (this.stateTime > 3.5) {
      this.target.set(
        this.group.position.x + Math.sin(elapsedTime * 0.7 + this.seedOffset) * 6,
        this.group.position.y,
        this.group.position.z + Math.cos(elapsedTime * 0.6 + this.seedOffset) * 6,
      );
      this.stateTime = 0;
    }
  }

  move(deltaTime) {
    if (this.state === ENTITY_STATES.disappear) {
      return;
    }

    const direction = this.target.clone().sub(this.group.position);
    direction.y = 0;

    if (direction.lengthSq() < 0.01) {
      return;
    }

    const speed = this.state === ENTITY_STATES.chase
      ? 2.25
      : this.state === ENTITY_STATES.stalk
        ? 1.05
        : 0.65;

    direction.normalize();
    this.velocity.copy(direction).multiplyScalar(speed * deltaTime);
    this.group.position.add(this.velocity);
    this.group.lookAt(
      this.group.position.x + direction.x,
      this.group.position.y,
      this.group.position.z + direction.z,
    );
  }

  dispose() {
    this.bodyGeometry?.dispose();
    this.headGeometry?.dispose();
    this.group.clear();
  }
}
