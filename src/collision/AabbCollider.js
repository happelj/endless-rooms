import * as THREE from 'three';

export class AabbCollider {
  constructor({ name = 'AabbCollider', center, size }) {
    this.name = name;
    this.center = new THREE.Vector3(center.x, center.y, center.z);
    this.size = new THREE.Vector3(size.x, size.y, size.z);
    this.min = new THREE.Vector3();
    this.max = new THREE.Vector3();

    this.updateBounds();
  }

  updateBounds() {
    const halfSize = this.size.clone().multiplyScalar(0.5);
    this.min.copy(this.center).sub(halfSize);
    this.max.copy(this.center).add(halfSize);
  }

  intersectsVerticalRange(minY, maxY) {
    return maxY > this.min.y && minY < this.max.y;
  }

  resolveHorizontalCircle(position, radius, previousPosition) {
    const closestX = THREE.MathUtils.clamp(position.x, this.min.x, this.max.x);
    const closestZ = THREE.MathUtils.clamp(position.z, this.min.z, this.max.z);
    const deltaX = position.x - closestX;
    const deltaZ = position.z - closestZ;
    const distanceSquared = deltaX * deltaX + deltaZ * deltaZ;
    const radiusSquared = radius * radius;

    if (distanceSquared >= radiusSquared) {
      return false;
    }

    if (distanceSquared > 0) {
      const distance = Math.sqrt(distanceSquared);
      const pushDistance = radius - distance;
      position.x += (deltaX / distance) * pushDistance;
      position.z += (deltaZ / distance) * pushDistance;
      return true;
    }

    this.resolveEmbeddedCircle(position, radius, previousPosition);
    return true;
  }

  resolveEmbeddedCircle(position, radius, previousPosition) {
    if (previousPosition.x <= this.min.x - radius) {
      position.x = this.min.x - radius;
      return;
    }

    if (previousPosition.x >= this.max.x + radius) {
      position.x = this.max.x + radius;
      return;
    }

    if (previousPosition.z <= this.min.z - radius) {
      position.z = this.min.z - radius;
      return;
    }

    if (previousPosition.z >= this.max.z + radius) {
      position.z = this.max.z + radius;
      return;
    }

    const candidates = [
      { axis: 'x', value: this.min.x - radius, distance: Math.abs(position.x - (this.min.x - radius)) },
      { axis: 'x', value: this.max.x + radius, distance: Math.abs(position.x - (this.max.x + radius)) },
      { axis: 'z', value: this.min.z - radius, distance: Math.abs(position.z - (this.min.z - radius)) },
      { axis: 'z', value: this.max.z + radius, distance: Math.abs(position.z - (this.max.z + radius)) },
    ];

    const nearestExit = candidates.reduce((nearest, candidate) => (
      candidate.distance < nearest.distance ? candidate : nearest
    ));

    position[nearestExit.axis] = nearestExit.value;
  }
}
