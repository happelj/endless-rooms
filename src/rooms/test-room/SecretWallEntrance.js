import * as THREE from 'three';
import { AabbCollider } from '../../collision/AabbCollider.js';

export class SecretWallEntrance {
  constructor({
    room,
    id,
    wall,
    center,
    width,
    height,
    material,
    triggerDepth = 1.25,
  }) {
    this.room = room;
    this.id = id;
    this.wall = wall;
    this.center = center;
    this.width = width;
    this.height = height;
    this.isAccessible = false;
    this.isRoomActive = false;

    this.room.addBoundsOpening({
      wall,
      center,
      width,
      height,
    });

    this.panel = this.room.addBox({
      name: `${id}:WallCover`,
      size: this.getPanelSize(),
      position: this.getPanelPosition(),
      material,
      castShadow: true,
      receiveShadow: true,
    });

    this.collider = new AabbCollider({
      name: `${id}:Collider`,
      center: this.room.toWorldPosition(this.getPanelPosition()),
      size: this.getColliderSize(),
    });
    this.room.addCollider(this.collider);
    this.triggerBox = this.createTriggerBox(triggerDepth);
    this.updateColliderState();
  }

  setRoomActive(isRoomActive) {
    this.isRoomActive = isRoomActive;
    this.updateColliderState();
  }

  setAccessible(isAccessible) {
    this.isAccessible = isAccessible;
    this.updateColliderState();
  }

  contains(position) {
    return this.isAccessible && this.triggerBox.containsPoint(position);
  }

  updateColliderState() {
    this.collider.setActive(this.isRoomActive && !this.isAccessible);
  }

  createTriggerBox(triggerDepth) {
    const panelPosition = this.getPanelPosition();
    const center = this.room.toWorldPosition({
      x: panelPosition.x + triggerDepth / 2,
      y: this.height / 2,
      z: panelPosition.z,
    });
    const size = new THREE.Vector3(triggerDepth, this.height, this.width * 0.82);
    const halfSize = size.multiplyScalar(0.5);
    const centerVector = new THREE.Vector3(center.x, center.y, center.z);

    return new THREE.Box3(
      centerVector.clone().sub(halfSize),
      centerVector.clone().add(halfSize),
    );
  }

  getPanelSize() {
    const { wallThickness } = this.room.config.dimensions;
    return { x: wallThickness + 0.08, y: this.height, z: this.width };
  }

  getColliderSize() {
    const { wallThickness } = this.room.config.dimensions;
    return { x: wallThickness + 0.18, y: this.height, z: this.width };
  }

  getPanelPosition() {
    const { width, wallThickness } = this.room.config.dimensions;
    return {
      x: width / 2 + wallThickness / 2,
      y: this.height / 2,
      z: this.center,
    };
  }
}
