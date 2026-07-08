import * as THREE from 'three';
import { ForgottenEntity } from './ForgottenEntity.js';

export class EntitySpawnManager {
  constructor(room, generator, config) {
    this.room = room;
    this.generator = generator;
    this.config = config;
    this.entities = new Map();
    this.spawnedChunks = new Set();
  }

  considerChunk(chunk) {
    if (!chunk.hasEntity || this.spawnedChunks.has(chunk.key) || this.entities.size >= this.config.maxEntities) {
      return;
    }

    const localPosition = new THREE.Vector3(
      chunk.center.x + this.generator.seedManager.randomRange(chunk.x, chunk.z, 71, -2.8, 2.8),
      0,
      chunk.center.z + this.generator.seedManager.randomRange(chunk.x, chunk.z, 72, -2.8, 2.8),
    );
    const entity = new ForgottenEntity({
      name: `ForgottenEntity:${chunk.key}`,
      position: localPosition,
      material: this.room.forgottenMaterials.entity,
      seedOffset: this.generator.seedManager.randomRange(chunk.x, chunk.z, 73, 0, 100),
    });

    this.spawnedChunks.add(chunk.key);
    this.entities.set(chunk.key, entity);
    this.room.group.add(entity.group);
  }

  removeChunk(chunkKey) {
    const entity = this.entities.get(chunkKey);

    if (!entity) {
      return;
    }

    this.room.group.remove(entity.group);
    entity.dispose();
    this.entities.delete(chunkKey);
  }

  update(deltaTime, elapsedTime, playerWorldPosition, depth) {
    const playerLocalPosition = playerWorldPosition.clone().sub(this.room.origin);
    const danger = Math.min(1, depth / 70);

    for (const entity of this.entities.values()) {
      entity.update(deltaTime, elapsedTime, playerLocalPosition, danger);
    }
  }

  reset() {
    for (const [chunkKey] of this.entities) {
      this.removeChunk(chunkKey);
    }

    this.entities.clear();
    this.spawnedChunks.clear();
  }
}
