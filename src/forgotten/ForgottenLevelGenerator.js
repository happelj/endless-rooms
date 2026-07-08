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
    const connections = {
      north: false,
      south: false,
      east: false,
      west: false,
    };

    switch (type) {
      case 'long-hallway-x':
        connections.east = true;
        connections.west = true;
        break;
      case 'long-hallway-z':
        connections.north = true;
        connections.south = true;
        break;
      case 'dead-end':
        connections[this.seedManager.choose(x, z, 11, ['north', 'south', 'east', 'west'])] = true;
        break;
      case 'intersection':
      case 'large-room':
        connections.north = true;
        connections.south = true;
        connections.east = true;
        connections.west = true;
        break;
      case 'looping-corridor':
        connections.north = true;
        connections.east = true;
        connections[this.seedManager.random01(x, z, 13) > 0.5 ? 'south' : 'west'] = true;
        break;
      case 'impossible-layout':
        connections.north = this.seedManager.random01(x, z, 17) > 0.24;
        connections.south = this.seedManager.random01(x, z, 18) > 0.24;
        connections.east = this.seedManager.random01(x, z, 19) > 0.24;
        connections.west = this.seedManager.random01(x, z, 20) > 0.24;
        break;
      default:
        connections.north = this.seedManager.random01(x, z, 5) > 0.34;
        connections.south = this.seedManager.random01(x, z, 6) > 0.34;
        connections.east = this.seedManager.random01(x, z, 7) > 0.34;
        connections.west = this.seedManager.random01(x, z, 8) > 0.34;
        break;
    }

    if (x === 0 && z === 0) {
      connections.north = true;
      connections.south = true;
      connections.east = true;
      connections.west = true;
    }

    return connections;
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
