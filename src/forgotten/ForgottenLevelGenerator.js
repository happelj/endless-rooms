const CHUNK_TYPES = Object.freeze([
  'long-hallway-x',
  'long-hallway-z',
  'empty-room',
  'office-space',
  'dead-end',
  'intersection',
  'looping-corridor',
  'large-room',
  'impossible-layout',
]);

const WALLS = Object.freeze(['north', 'south', 'east', 'west']);

const OPPOSITE_WALLS = Object.freeze({
  north: 'south',
  south: 'north',
  east: 'west',
  west: 'east',
});

export class ForgottenLevelGenerator {
  constructor(seedManager, config) {
    this.seedManager = seedManager;
    this.config = config;
  }

  generateChunk(x, z) {
    const depth = Math.abs(x) + Math.abs(z);
    const type = x === 0 && z === 0 ? 'empty-room' : this.getType(x, z);
    const connections = this.getConnections(type, x, z);
    const stainCount = Math.floor(this.seedManager.randomRange(x, z, 25, 0, 4 + depth * 0.08));
    const propCount = Math.floor(this.seedManager.randomRange(x, z, 31, 0, 5));
    const danger = Math.min(1, depth / 70);

    return {
      key: this.getKey(x, z),
      x,
      z,
      depth,
      type,
      connections,
      stainCount,
      propCount,
      danger,
      flickerPhase: this.seedManager.randomRange(x, z, 41, 0, Math.PI * 2),
      damagedCeiling: this.seedManager.random01(x, z, 43) < 0.24 + danger * 0.2,
      hasEscape: this.hasEscape(x, z, depth),
      hasEntity: this.hasEntity(x, z, depth),
    };
  }

  getType(x, z) {
    const roll = this.seedManager.random01(x, z, 3);
    const thresholds = [0.16, 0.31, 0.45, 0.58, 0.7, 0.83, 0.93, 0.975, 1];

    return CHUNK_TYPES[thresholds.findIndex((threshold) => roll <= threshold)];
  }

  getConnections(type, x, z) {
    const connections = {};

    for (const wall of WALLS) {
      connections[wall] = this.shouldOpenEdge(type, x, z, wall);
    }

    return connections;
  }

  shouldOpenEdge(type, x, z, wall) {
    const neighbor = this.getNeighborCoordinates(x, z, wall);
    const neighborType = neighbor.x === 0 && neighbor.z === 0
      ? 'empty-room'
      : this.getType(neighbor.x, neighbor.z);
    const oppositeWall = OPPOSITE_WALLS[wall];

    if (this.isOrigin(x, z) || this.isOrigin(neighbor.x, neighbor.z)) {
      return true;
    }

    if (this.isRequiredPathEdge(x, z, wall, neighbor)) {
      return true;
    }

    if (
      this.isPreferredEdge(type, wall)
      || this.isPreferredEdge(neighborType, oppositeWall)
    ) {
      return true;
    }

    const chance = Math.max(
      this.getOpenChance(type),
      this.getOpenChance(neighborType),
    );

    return this.getSharedEdgeRoll(x, z, wall) < chance;
  }

  isRequiredPathEdge(x, z, wall, neighbor) {
    return (
      this.pointsToParent(x, z, neighbor.x, neighbor.z)
      || this.pointsToParent(neighbor.x, neighbor.z, x, z)
      || this.isGridCorridorEdge(x, z, wall)
    );
  }

  pointsToParent(x, z, targetX, targetZ) {
    if (this.isOrigin(x, z)) {
      return false;
    }

    const parent = this.getParentCoordinates(x, z);
    return parent.x === targetX && parent.z === targetZ;
  }

  getParentCoordinates(x, z) {
    if (Math.abs(x) >= Math.abs(z) && x !== 0) {
      return { x: x - Math.sign(x), z };
    }

    return { x, z: z - Math.sign(z) };
  }

  isGridCorridorEdge(x, z, wall) {
    if ((wall === 'east' || wall === 'west') && Math.abs(z % 4) === 0) {
      return true;
    }

    if ((wall === 'north' || wall === 'south') && Math.abs(x % 4) === 0) {
      return true;
    }

    return false;
  }

  isPreferredEdge(type, wall) {
    switch (type) {
      case 'long-hallway-x':
        return wall === 'east' || wall === 'west';
      case 'long-hallway-z':
        return wall === 'north' || wall === 'south';
      case 'intersection':
      case 'large-room':
        return true;
      case 'looping-corridor':
        return wall === 'north' || wall === 'east';
      default:
        return false;
    }
  }

  getOpenChance(type) {
    switch (type) {
      case 'dead-end':
        return 0.28;
      case 'office-space':
        return 0.58;
      case 'empty-room':
        return 0.64;
      case 'impossible-layout':
        return 0.7;
      case 'looping-corridor':
        return 0.74;
      default:
        return 0.66;
    }
  }

  getSharedEdgeRoll(x, z, wall) {
    switch (wall) {
      case 'east':
        return this.seedManager.random01(x, z, 211);
      case 'west':
        return this.seedManager.random01(x - 1, z, 211);
      case 'south':
        return this.seedManager.random01(x, z, 223);
      case 'north':
        return this.seedManager.random01(x, z - 1, 223);
      default:
        return 1;
    }
  }

  getNeighborCoordinates(x, z, wall) {
    switch (wall) {
      case 'north':
        return { x, z: z - 1 };
      case 'south':
        return { x, z: z + 1 };
      case 'east':
        return { x: x + 1, z };
      case 'west':
        return { x: x - 1, z };
      default:
        return { x, z };
    }
  }

  isOrigin(x, z) {
    return x === 0 && z === 0;
  }

  hasEntity(x, z, depth) {
    if (x === 0 && z === 0) {
      return false;
    }

    const chance = Math.min(0.32, this.config.normalEntityChance + depth * this.config.deeperEntityBonus);
    return this.seedManager.random01(x, z, 53) < chance;
  }

  hasEscape(x, z, depth) {
    if (depth < 8) {
      return false;
    }

    const chance = Math.max(0.002, this.config.escapeChance - depth * this.config.deeperEscapePenalty);
    return this.seedManager.random01(x, z, 59) < chance;
  }

  getKey(x, z) {
    return `${x}:${z}`;
  }
}
