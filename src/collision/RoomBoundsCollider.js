import * as THREE from 'three';

export class RoomBoundsCollider {
  constructor({ name = 'RoomBoundsCollider', minX, maxX, minY, maxY, minZ, maxZ }) {
    this.name = name;
    this.minX = minX;
    this.maxX = maxX;
    this.minY = minY;
    this.maxY = maxY;
    this.minZ = minZ;
    this.maxZ = maxZ;
  }

  resolvePlayerPosition(position, body) {
    const radius = body.radius;
    const minEyeY = this.minY + body.eyeHeight;
    const maxEyeY = this.maxY - Math.max(0, body.height - body.eyeHeight);

    position.x = THREE.MathUtils.clamp(position.x, this.minX + radius, this.maxX - radius);
    position.y = THREE.MathUtils.clamp(position.y, minEyeY, maxEyeY);
    position.z = THREE.MathUtils.clamp(position.z, this.minZ + radius, this.maxZ - radius);
  }
}
