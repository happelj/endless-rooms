import * as THREE from 'three';

export class RoomBoundsCollider {
  constructor({
    name = 'RoomBoundsCollider',
    roomId,
    origin = { x: 0, y: 0, z: 0 },
    minX,
    maxX,
    minY,
    maxY,
    minZ,
    maxZ,
    openings = [],
  }) {
    this.name = name;
    this.roomId = roomId;
    this.origin = new THREE.Vector3(origin.x, origin.y, origin.z);
    this.minX = minX;
    this.maxX = maxX;
    this.minY = minY;
    this.maxY = maxY;
    this.minZ = minZ;
    this.maxZ = maxZ;
    this.openings = new Set(openings);
    this.isActive = false;
  }

  setActive(isActive) {
    this.isActive = isActive;
  }

  addOpening(opening) {
    this.openings.add(opening);
  }

  resolvePlayerPosition(position, body) {
    if (!this.isActive) {
      return;
    }

    this.resolveHorizontalPosition(position, body);
    this.resolveVerticalPosition(position, body);
  }

  resolveHorizontalPosition(position, body) {
    if (!this.isActive) {
      return;
    }

    const radius = body.radius;

    if (position.x < this.minX + radius && !this.isInsideOpening('west', position, body)) {
      position.x = this.minX + radius;
    }

    if (position.x > this.maxX - radius && !this.isInsideOpening('east', position, body)) {
      position.x = this.maxX - radius;
    }

    if (position.z < this.minZ + radius && !this.isInsideOpening('north', position, body)) {
      position.z = this.minZ + radius;
    }

    if (position.z > this.maxZ - radius && !this.isInsideOpening('south', position, body)) {
      position.z = this.maxZ - radius;
    }
  }

  resolveVerticalPosition(position, body) {
    if (!this.isActive) {
      return;
    }

    const minEyeY = this.minY + body.eyeHeight;
    const maxEyeY = this.getMaxEyeY(body);

    position.y = THREE.MathUtils.clamp(position.y, minEyeY, maxEyeY);
  }

  getGroundInfo(position, body) {
    if (!this.isActive || !this.hasGroundSupport(position, body)) {
      return null;
    }

    return {
      y: this.minY,
      collider: this,
    };
  }

  getCeilingInfo(position, body) {
    if (!this.isActive || !this.hasGroundSupport(position, body)) {
      return null;
    }

    return {
      y: this.maxY,
      maxEyeY: this.getMaxEyeY(body),
      collider: this,
    };
  }

  getBoundsBox() {
    return new THREE.Box3(
      new THREE.Vector3(this.minX, this.minY, this.minZ),
      new THREE.Vector3(this.maxX, this.maxY, this.maxZ),
    );
  }

  hasGroundSupport(position, body) {
    const radius = body.radius;
    const insideRoom =
      position.x >= this.minX + radius
      && position.x <= this.maxX - radius
      && position.z >= this.minZ + radius
      && position.z <= this.maxZ - radius;

    if (insideRoom) {
      return true;
    }

    if (position.x < this.minX + radius && this.isInsideOpening('west', position, body)) {
      return true;
    }

    if (position.x > this.maxX - radius && this.isInsideOpening('east', position, body)) {
      return true;
    }

    if (position.z < this.minZ + radius && this.isInsideOpening('north', position, body)) {
      return true;
    }

    if (position.z > this.maxZ - radius && this.isInsideOpening('south', position, body)) {
      return true;
    }

    return false;
  }

  getMaxEyeY(body) {
    return this.maxY - Math.max(0, body.height - body.eyeHeight);
  }

  isInsideOpening(wall, position, body) {
    for (const opening of this.openings) {
      if (opening.wall === wall && this.fitsOpening(opening, position, body)) {
        return true;
      }
    }

    return false;
  }

  fitsOpening(opening, position, body) {
    const localX = position.x - this.origin.x;
    const localZ = position.z - this.origin.z;
    const spanPosition = this.isNorthSouthWall(opening.wall) ? localX : localZ;
    const halfWidth = opening.width / 2;
    const footY = position.y - body.eyeHeight;
    const headY = footY + body.height;
    const openingFloor = opening.floor ?? this.minY;
    const openingTop = openingFloor + opening.height;

    return (
      spanPosition >= opening.center - halfWidth + body.radius
      && spanPosition <= opening.center + halfWidth - body.radius
      && footY >= openingFloor - 0.05
      && headY <= openingTop + 0.05
    );
  }

  isNorthSouthWall(wall) {
    return wall === 'north' || wall === 'south';
  }
}
