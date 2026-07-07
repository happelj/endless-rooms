export class CollisionSystem {
  constructor() {
    this.boundsColliders = new Set();
    this.colliders = new Set();
  }

  addBoundsCollider(collider) {
    this.boundsColliders.add(collider);
  }

  removeBoundsCollider(collider) {
    this.boundsColliders.delete(collider);
  }

  addCollider(collider) {
    this.colliders.add(collider);
  }

  removeCollider(collider) {
    this.colliders.delete(collider);
  }

  resolvePlayerPosition(position, previousPosition, body) {
    this.applyBounds(position, body);

    const minY = position.y - body.eyeHeight;
    const maxY = minY + body.height;

    for (const collider of this.colliders) {
      if (collider.intersectsVerticalRange(minY, maxY)) {
        collider.resolveHorizontalCircle(position, body.radius, previousPosition);
      }
    }

    this.applyBounds(position, body);
  }

  applyBounds(position, body) {
    for (const collider of this.boundsColliders) {
      if (collider.isActive) {
        collider.resolvePlayerPosition(position, body);
      }
    }
  }

  dispose() {
    this.boundsColliders.clear();
    this.colliders.clear();
  }
}
