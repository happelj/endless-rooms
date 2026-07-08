import * as THREE from 'three';

export class TerrainGroundCollider {
  constructor({ name = 'TerrainGroundCollider', origin, width, length, sampleHeight }) {
    this.name = name;
    this.origin = new THREE.Vector3(origin.x, origin.y, origin.z);
    this.width = width;
    this.length = length;
    this.sampleHeight = sampleHeight;
    this.isActive = false;
  }

  setActive(isActive) {
    this.isActive = isActive;
  }

  getGroundInfo(position, body) {
    if (!this.isActive || !this.containsPosition(position, body.radius)) {
      return null;
    }

    return {
      y: this.origin.y + this.sampleHeight(position.x - this.origin.x, position.z - this.origin.z),
      collider: this,
    };
  }

  containsPosition(position, radius = 0) {
    const localX = position.x - this.origin.x;
    const localZ = position.z - this.origin.z;
    const halfWidth = this.width / 2 - radius;
    const halfLength = this.length / 2 - radius;

    return (
      localX >= -halfWidth
      && localX <= halfWidth
      && localZ >= -halfLength
      && localZ <= halfLength
    );
  }
}
