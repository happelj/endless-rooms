export class CollisionSystem {
  constructor() {
    this.boundsColliders = new Set();
    this.colliders = new Set();
    this.groundColliders = new Set();
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

  addGroundCollider(collider) {
    this.groundColliders.add(collider);
  }

  removeGroundCollider(collider) {
    this.groundColliders.delete(collider);
  }

  resolvePlayerPosition(position, previousPosition, body) {
    this.resolveHorizontalPlayerPosition(position, previousPosition, body);
    this.resolveVerticalPlayerPosition(position, body);
  }

  resolveHorizontalPlayerPosition(position, previousPosition, body) {
    this.applyHorizontalBounds(position, body);

    const minY = position.y - body.eyeHeight;
    const maxY = minY + body.height;

    for (const collider of this.colliders) {
      if (collider.isActive !== false && collider.intersectsVerticalRange(minY, maxY)) {
        collider.resolveHorizontalCircle(position, body.radius, previousPosition);
      }
    }

    this.applyHorizontalBounds(position, body);
  }

  resolveVerticalPlayerPosition(position, body) {
    for (const collider of this.boundsColliders) {
      if (collider.isActive) {
        collider.resolveVerticalPosition(position, body);
      }
    }
  }

  getGroundInfo(position, body) {
    let bestGround = null;

    for (const collider of this.boundsColliders) {
      if (collider.isActive) {
        bestGround = this.selectHigherGround(bestGround, collider.getGroundInfo(position, body));
      }
    }

    for (const collider of this.groundColliders) {
      bestGround = this.selectHigherGround(bestGround, collider.getGroundInfo?.(position, body) ?? null);
    }

    return bestGround;
  }

  getCeilingInfo(position, body) {
    let lowestCeiling = null;

    for (const collider of this.boundsColliders) {
      if (collider.isActive) {
        const ceiling = collider.getCeilingInfo(position, body);

        if (ceiling && (!lowestCeiling || ceiling.y < lowestCeiling.y)) {
          lowestCeiling = ceiling;
        }
      }
    }

    return lowestCeiling;
  }

  applyHorizontalBounds(position, body) {
    for (const collider of this.boundsColliders) {
      if (collider.isActive) {
        collider.resolveHorizontalPosition(position, body);
      }
    }
  }

  selectHigherGround(currentGround, candidateGround) {
    if (!candidateGround) {
      return currentGround;
    }

    if (!currentGround || candidateGround.y > currentGround.y) {
      return candidateGround;
    }

    return currentGround;
  }

  dispose() {
    this.boundsColliders.clear();
    this.colliders.clear();
    this.groundColliders.clear();
  }
}
