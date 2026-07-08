export class ProceduralSeedManager {
  constructor(defaultSeed = 'forgotten-level') {
    this.defaultSeed = defaultSeed;
    this.seed = defaultSeed;
    this.seedHash = this.hashString(defaultSeed);
  }

  startRun(seed = this.createRunSeed()) {
    this.seed = String(seed);
    this.seedHash = this.hashString(this.seed);

    return this.seed;
  }

  createRunSeed() {
    return `${this.defaultSeed}:${Date.now().toString(36)}:${Math.floor(Math.random() * 1e6).toString(36)}`;
  }

  random01(x = 0, z = 0, salt = 0) {
    let value = this.seedHash;
    value ^= Math.imul(x + 0x9e3779b9, 0x85ebca6b);
    value ^= Math.imul(z + 0xc2b2ae35, 0x27d4eb2f);
    value ^= Math.imul(salt + 0x165667b1, 0x9e3779b1);
    value ^= value >>> 16;
    value = Math.imul(value, 0x7feb352d);
    value ^= value >>> 15;
    value = Math.imul(value, 0x846ca68b);
    value ^= value >>> 16;

    return (value >>> 0) / 0xffffffff;
  }

  randomRange(x, z, salt, min, max) {
    return min + (max - min) * this.random01(x, z, salt);
  }

  choose(x, z, salt, values) {
    const index = Math.floor(this.random01(x, z, salt) * values.length);
    return values[Math.min(values.length - 1, index)];
  }

  hashString(value) {
    let hash = 2166136261;

    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }

    return hash >>> 0;
  }
}
