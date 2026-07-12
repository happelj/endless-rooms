import * as THREE from 'three';
import { AabbCollider } from '../collision/AabbCollider.js';

const OPENING_WIDTH = 3.2;

export class ChunkManager {
  constructor({ room, generator, entitySpawnManager, escapeManager, hiddenBroadcastRoom, config }) {
    this.room = room;
    this.generator = generator;
    this.entitySpawnManager = entitySpawnManager;
    this.escapeManager = escapeManager;
    this.hiddenBroadcastRoom = hiddenBroadcastRoom;
    this.config = config;
    this.chunks = new Map();
    this.playerChunk = { x: 0, z: 0 };
  }

  update(playerWorldPosition, elapsedTime) {
    this.playerChunk = this.getChunkCoordinates(playerWorldPosition);
    this.ensureChunksAroundPlayer();
    this.unloadDistantChunks();
    this.updateFlicker(elapsedTime);
  }

  reset() {
    for (const key of Array.from(this.chunks.keys())) {
      this.unloadChunk(key);
    }

    this.chunks.clear();
    this.playerChunk = { x: 0, z: 0 };
  }

  getCurrentDepth() {
    return Math.abs(this.playerChunk.x) + Math.abs(this.playerChunk.z);
  }

  getChunkCoordinates(worldPosition) {
    const localX = worldPosition.x - this.room.origin.x;
    const localZ = worldPosition.z - this.room.origin.z;

    return {
      x: Math.floor((localX + this.config.chunkSize / 2) / this.config.chunkSize),
      z: Math.floor((localZ + this.config.chunkSize / 2) / this.config.chunkSize),
    };
  }

  getChunkDataAtCoordinates(x, z) {
    const key = this.generator.getKey(x, z);

    return this.chunks.get(key) ?? this.generator.generateChunk(x, z);
  }

  ensureChunksAroundPlayer() {
    for (let x = this.playerChunk.x - this.config.activeRadius; x <= this.playerChunk.x + this.config.activeRadius; x += 1) {
      for (let z = this.playerChunk.z - this.config.activeRadius; z <= this.playerChunk.z + this.config.activeRadius; z += 1) {
        const key = this.generator.getKey(x, z);

        if (!this.chunks.has(key)) {
          this.loadChunk(x, z);
        }
      }
    }
  }

  unloadDistantChunks() {
    for (const [key, chunk] of this.chunks) {
      const distance = Math.max(
        Math.abs(chunk.x - this.playerChunk.x),
        Math.abs(chunk.z - this.playerChunk.z),
      );

      if (distance > this.config.unloadRadius) {
        this.unloadChunk(key);
      }
    }
  }

  loadChunk(x, z) {
    const data = this.generator.generateChunk(x, z);
    const chunk = {
      ...data,
      center: {
        x: x * this.config.chunkSize,
        z: z * this.config.chunkSize,
      },
      group: new THREE.Group(),
      geometries: [],
      materials: [],
      colliders: [],
      lightMaterials: [],
      movingMeshes: [],
    };
    chunk.group.name = `ForgottenChunk:${chunk.key}:${chunk.type}`;
    this.room.group.add(chunk.group);

    this.addShell(chunk);
    this.addCeilingPanels(chunk);

    if (!this.hiddenBroadcastRoom?.isTargetChunk(chunk)) {
      this.addDetails(chunk);
    }

    this.hiddenBroadcastRoom?.decorateChunk(chunk, this);

    if (chunk.hasEscape && !this.hiddenBroadcastRoom?.isTargetChunk(chunk)) {
      this.addEscape(chunk);
    }

    this.chunks.set(chunk.key, chunk);

    if (!this.hiddenBroadcastRoom?.isTargetChunk(chunk)) {
      this.entitySpawnManager?.considerChunk(chunk);
    }
  }

  unloadChunk(key) {
    const chunk = this.chunks.get(key);

    if (!chunk) {
      return;
    }

    this.escapeManager?.unregisterExit(key);
    this.entitySpawnManager?.removeChunk(key);
    this.hiddenBroadcastRoom?.unloadChunk(key);

    for (const collider of chunk.colliders) {
      this.room.removeCollider(collider);
    }

    this.room.group.remove(chunk.group);
    chunk.group.clear();

    for (const geometry of chunk.geometries) {
      geometry.dispose();
    }

    for (const material of chunk.materials) {
      material.dispose();
    }

    this.chunks.delete(key);
  }

  addShell(chunk) {
    const { chunkSize } = this.config;
    const { wallThickness, height, floorThickness, ceilingThickness } = this.room.config.dimensions;
    const floorMaterial = chunk.depth % 4 === 0
      ? this.room.forgottenMaterials.carpetDark
      : this.room.forgottenMaterials.carpet;
    const wallMaterial = chunk.depth % 5 === 0
      ? this.room.forgottenMaterials.wallStained
      : this.room.forgottenMaterials.wall;

    this.addBox(chunk, {
      name: `${chunk.key}:Floor`,
      size: { x: chunkSize, y: floorThickness, z: chunkSize },
      position: { x: chunk.center.x, y: -floorThickness / 2, z: chunk.center.z },
      material: floorMaterial,
      receiveShadow: true,
    });

    this.addBox(chunk, {
      name: `${chunk.key}:Ceiling`,
      size: { x: chunkSize, y: ceilingThickness, z: chunkSize },
      position: { x: chunk.center.x, y: height + ceilingThickness / 2, z: chunk.center.z },
      material: this.room.forgottenMaterials.ceiling,
      receiveShadow: true,
    });

    this.addWall(chunk, 'north', !chunk.connections.north, wallMaterial);
    this.addWall(chunk, 'south', !chunk.connections.south, wallMaterial);
    this.addWall(chunk, 'east', !chunk.connections.east, wallMaterial);
    this.addWall(chunk, 'west', !chunk.connections.west, wallMaterial);

    if (chunk.type === 'office-space') {
      this.addOfficePartitions(chunk);
    }

    if (chunk.type === 'impossible-layout') {
      this.addImpossibleWall(chunk);
    }
  }

  addWall(chunk, wall, solid, material) {
    if (solid) {
      this.addWallSegment(chunk, wall, 0, this.config.chunkSize, material);
      return;
    }

    const segmentLength = (this.config.chunkSize - OPENING_WIDTH) / 2;
    const offset = OPENING_WIDTH / 2 + segmentLength / 2;
    this.addWallSegment(chunk, wall, -offset, segmentLength, material);
    this.addWallSegment(chunk, wall, offset, segmentLength, material);
  }

  addWallSegment(chunk, wall, spanCenter, spanLength, material) {
    const { chunkSize } = this.config;
    const { wallThickness, height } = this.room.config.dimensions;
    const center = chunk.center;
    const size = this.isNorthSouth(wall)
      ? { x: spanLength, y: height, z: wallThickness }
      : { x: wallThickness, y: height, z: spanLength };
    const position = this.getWallPosition(wall, center, spanCenter, chunkSize, wallThickness, height / 2);

    this.addBox(chunk, {
      name: `${chunk.key}:Wall:${wall}`,
      size,
      position,
      material,
      castShadow: true,
      receiveShadow: true,
      collider: true,
    });
  }

  addCeilingPanels(chunk) {
    const count = chunk.type === 'large-room' ? 3 : 2;

    for (let index = 0; index < count; index += 1) {
      const lightMaterial = this.room.forgottenMaterials.lightPanel.clone();
      lightMaterial.name = `ForgottenLevel:LightPanel:${chunk.key}:${index}`;
      chunk.materials.push(lightMaterial);
      chunk.lightMaterials.push({
        material: lightMaterial,
        baseOpacity: 0.42 + this.generator.seedManager.randomRange(chunk.x, chunk.z, 83 + index, 0, 0.18),
        phase: chunk.flickerPhase + index * 1.9,
        unstable: this.generator.seedManager.random01(chunk.x, chunk.z, 86 + index) < 0.38 + chunk.danger * 0.3,
      });

      this.addBox(chunk, {
        name: `${chunk.key}:FluorescentPanel:${index + 1}`,
        size: { x: 2.1, y: 0.035, z: 0.34 },
        position: {
          x: chunk.center.x + (index - (count - 1) / 2) * 2.6,
          y: this.room.config.dimensions.height - 0.05,
          z: chunk.center.z + this.generator.seedManager.randomRange(chunk.x, chunk.z, 91 + index, -2.5, 2.5),
        },
        material: lightMaterial,
        castShadow: false,
        receiveShadow: false,
      });
    }
  }

  addDetails(chunk) {
    for (let index = 0; index < chunk.stainCount; index += 1) {
      this.addBox(chunk, {
        name: `${chunk.key}:CarpetStain:${index + 1}`,
        size: {
          x: this.generator.seedManager.randomRange(chunk.x, chunk.z, 101 + index, 0.7, 1.8),
          y: 0.018,
          z: this.generator.seedManager.randomRange(chunk.x, chunk.z, 111 + index, 0.55, 1.4),
        },
        position: {
          x: chunk.center.x + this.generator.seedManager.randomRange(chunk.x, chunk.z, 121 + index, -3.7, 3.7),
          y: 0.018,
          z: chunk.center.z + this.generator.seedManager.randomRange(chunk.x, chunk.z, 131 + index, -3.7, 3.7),
        },
        material: this.room.forgottenMaterials.stain,
        castShadow: false,
        receiveShadow: false,
      });
    }

    for (let index = 0; index < chunk.propCount; index += 1) {
      const x = chunk.center.x + this.generator.seedManager.randomRange(chunk.x, chunk.z, 141 + index, -3.4, 3.4);
      const z = chunk.center.z + this.generator.seedManager.randomRange(chunk.x, chunk.z, 151 + index, -3.4, 3.4);
      const isTall = this.generator.seedManager.random01(chunk.x, chunk.z, 161 + index) > 0.55;
      const willMove = this.generator.seedManager.random01(chunk.x, chunk.z, 171 + index) > 0.72;

      const prop = this.addBox(chunk, {
        name: `${chunk.key}:ForgottenProp:${index + 1}`,
        size: isTall
          ? { x: 0.64, y: 1.45, z: 0.5 }
          : { x: 0.92, y: 0.52, z: 0.7 },
        position: { x, y: isTall ? 0.725 : 0.26, z },
        material: this.room.forgottenMaterials.prop,
        castShadow: true,
        receiveShadow: true,
        collider: !willMove,
      });

      if (willMove) {
        chunk.movingMeshes.push({
          mesh: prop,
          baseX: prop.position.x,
          baseZ: prop.position.z,
          phase: chunk.flickerPhase + index * 2.6,
          amplitude: this.generator.seedManager.randomRange(chunk.x, chunk.z, 176 + index, 0.015, 0.055),
        });
      }
    }

    if (this.generator.seedManager.random01(chunk.x, chunk.z, 179) > 0.76 && chunk.depth > 3) {
      this.addFalseDoor(chunk);
    }
  }

  addFalseDoor(chunk) {
    const door = this.addBox(chunk, {
      name: `${chunk.key}:FalseDoor`,
      size: { x: 1.0, y: 2.05, z: 0.1 },
      position: {
        x: chunk.center.x + this.generator.seedManager.randomRange(chunk.x, chunk.z, 184, -2.8, 2.8),
        y: 1.025,
        z: chunk.center.z - this.config.chunkSize / 2 + 0.18,
      },
      material: this.room.forgottenMaterials.prop,
      castShadow: true,
      receiveShadow: true,
    });

    chunk.movingMeshes.push({
      mesh: door,
      baseX: door.position.x,
      baseZ: door.position.z,
      phase: chunk.flickerPhase + 5.3,
      amplitude: 0.09,
    });
  }

  addOfficePartitions(chunk) {
    for (const offset of [-2.1, 2.1]) {
      this.addBox(chunk, {
        name: `${chunk.key}:OfficePartition:${offset}`,
        size: { x: 0.16, y: 1.55, z: 4.1 },
        position: { x: chunk.center.x + offset, y: 0.78, z: chunk.center.z },
        material: this.room.forgottenMaterials.trim,
        castShadow: true,
        receiveShadow: true,
        collider: true,
      });
    }
  }

  addImpossibleWall(chunk) {
    this.addBox(chunk, {
      name: `${chunk.key}:ImpossibleWall`,
      size: { x: 5.8, y: this.room.config.dimensions.height, z: 0.18 },
      position: { x: chunk.center.x, y: this.room.config.dimensions.height / 2, z: chunk.center.z },
      material: this.room.forgottenMaterials.wallStained,
      castShadow: true,
      receiveShadow: true,
      collider: true,
    });
  }

  addEscape(chunk) {
    const position = {
      x: chunk.center.x + this.generator.seedManager.randomRange(chunk.x, chunk.z, 181, -2.2, 2.2),
      y: 1.1,
      z: chunk.center.z + this.generator.seedManager.randomRange(chunk.x, chunk.z, 182, -2.2, 2.2),
    };

    this.addBox(chunk, {
      name: `${chunk.key}:EmergencyExitDoor`,
      size: { x: 1.15, y: 2.2, z: 0.18 },
      position,
      material: this.room.forgottenMaterials.exitDoor,
      castShadow: true,
      receiveShadow: true,
    });

    this.addBox(chunk, {
      name: `${chunk.key}:EmergencyExitGlow`,
      size: { x: 1.28, y: 0.12, z: 0.05 },
      position: { x: position.x, y: 2.35, z: position.z - 0.12 },
      material: this.room.forgottenMaterials.exitGlow,
      castShadow: false,
      receiveShadow: false,
    });

    this.escapeManager?.registerExit(chunk, position);
  }

  updateFlicker(elapsedTime) {
    for (const chunk of this.chunks.values()) {
      for (const light of chunk.lightMaterials) {
        const flicker = light.unstable
          ? Math.max(0.08, Math.sin(elapsedTime * 18 + light.phase) * 0.18 + Math.sin(elapsedTime * 43 + light.phase) * 0.08)
          : Math.sin(elapsedTime * 2.3 + light.phase) * 0.04;
        light.material.opacity = Math.max(0.08, light.baseOpacity + flicker - chunk.danger * 0.12);
      }

      for (const moving of chunk.movingMeshes) {
        const movement = Math.max(0, Math.sin(elapsedTime * 0.9 + moving.phase) - 0.86) * moving.amplitude;
        moving.mesh.position.x = moving.baseX + movement;
        moving.mesh.position.z = moving.baseZ + movement * 0.35;
      }
    }
  }

  addBox(chunk, {
    name,
    size,
    position,
    material,
    castShadow = false,
    receiveShadow = true,
    collider = false,
  }) {
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.position.set(position.x, position.y, position.z);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = receiveShadow;
    chunk.group.add(mesh);
    chunk.geometries.push(geometry);

    if (collider) {
      const colliderInstance = new AabbCollider({
        name: `${name}:Collider`,
        center: this.room.toWorldPosition(position),
        size,
      });
      this.room.addCollider(colliderInstance);
      chunk.colliders.push(colliderInstance);
    }

    return mesh;
  }

  getWallPosition(wall, center, spanCenter, chunkSize, wallThickness, y) {
    const offset = chunkSize / 2 + wallThickness / 2;

    switch (wall) {
      case 'north':
        return { x: center.x + spanCenter, y, z: center.z - offset };
      case 'south':
        return { x: center.x + spanCenter, y, z: center.z + offset };
      case 'east':
        return { x: center.x + offset, y, z: center.z + spanCenter };
      case 'west':
        return { x: center.x - offset, y, z: center.z + spanCenter };
      default:
        throw new Error(`Unknown Forgotten Level wall: ${wall}`);
    }
  }

  isNorthSouth(wall) {
    return wall === 'north' || wall === 'south';
  }
}
