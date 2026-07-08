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
    trimMaterial,
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

    this.wallCover = this.createWallCover(material);
    this.baseboardCover = this.createBaseboardCover(trimMaterial);
    this.panel = this.wallCover;

    this.collider = new AabbCollider({
      name: `${id}:Collider`,
      center: this.room.toWorldPosition(this.getPanelPosition()),
      size: this.getColliderSize(),
    });
    this.room.addCollider(this.collider);
    this.triggerBox = this.createTriggerBox(triggerDepth);
    this.updateColliderState();
  }

  createWallCover(material) {
    const { height: roomHeight } = this.room.config.dimensions;
    const { height: baseboardHeight } = this.room.config.baseboard;
    const coverHeight = roomHeight - baseboardHeight;
    const geometry = new THREE.PlaneGeometry(this.getWallCoverSpan(), coverHeight);
    const mesh = new THREE.Mesh(geometry, material);
    const position = this.getInteriorCoverPosition(coverHeight, baseboardHeight);

    mesh.name = `${this.id}:InvisibleWallCover`;
    mesh.position.set(position.x, position.y, position.z);
    mesh.rotation.y = -Math.PI / 2;
    mesh.castShadow = false;
    mesh.receiveShadow = true;
    this.room.addMesh(mesh, { disposeGeometry: true });

    return mesh;
  }

  createBaseboardCover(material) {
    const { height, depth } = this.room.config.baseboard;
    const { width } = this.room.config.dimensions;

    return this.room.addBox({
      name: `${this.id}:BaseboardCover`,
      size: { x: depth, y: height, z: this.getWallCoverSpan() },
      position: {
        x: width / 2 - depth / 2,
        y: height / 2,
        z: 0,
      },
      material,
      castShadow: false,
      receiveShadow: true,
    });
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

  getInteriorCoverPosition(coverHeight, baseboardHeight) {
    const { width } = this.room.config.dimensions;

    return {
      x: width / 2 - 0.006,
      y: baseboardHeight + coverHeight / 2,
      z: 0,
    };
  }

  getWallCoverSpan() {
    return this.room.config.dimensions.length;
  }
}
