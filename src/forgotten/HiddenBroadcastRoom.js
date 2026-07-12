import * as THREE from 'three';
import { VideoScreen } from '../media/VideoScreen.js';

const DIRECTIONS = Object.freeze({
  north: Object.freeze({ x: 0, z: -1 }),
  south: Object.freeze({ x: 0, z: 1 }),
  east: Object.freeze({ x: 1, z: 0 }),
  west: Object.freeze({ x: -1, z: 0 }),
});

export class HiddenBroadcastRoom {
  constructor({ room, config }) {
    this.room = room;
    this.config = config;
    this.targetChunk = { x: 0, z: config.minDepth };
    this.instances = new Map();
    this.isUnlocked = false;
  }

  createMaterials() {
    this.materials = Object.freeze({
      wall: this.room.createMaterial('HiddenBroadcastClosetWall', {
        color: 0xb9b174,
        roughness: 0.92,
        metalness: 0,
      }),
      trim: this.room.createMaterial('HiddenBroadcastClosetTrim', {
        color: 0x82723e,
        roughness: 0.84,
        metalness: 0,
      }),
      darkWood: this.room.createMaterial('HiddenBroadcastStandWood', {
        color: 0x2b1d12,
        roughness: 0.78,
        metalness: 0,
      }),
      tvCabinet: this.room.createMaterial('HiddenBroadcastTvCabinet', {
        color: 0x151515,
        roughness: 0.72,
        metalness: 0.08,
      }),
      tvBezel: this.room.createMaterial('HiddenBroadcastTvBezel', {
        color: 0x050505,
        roughness: 0.52,
        metalness: 0.18,
      }),
      guideArrow: this.trackBasicMaterial('HiddenBroadcastGuideArrow', new THREE.MeshBasicMaterial({
        color: 0x4cff7c,
        transparent: true,
        opacity: 0.78,
        toneMapped: false,
      })),
      lockedScreen: this.createLockedScreenMaterial(),
    });
  }

  startRun(seedManager) {
    this.unloadAll();
    this.targetChunk = this.selectTargetChunk(seedManager);
    this.isUnlocked = false;
  }

  selectTargetChunk(seedManager) {
    const distance = Math.floor(seedManager.randomRange(
      0,
      0,
      701,
      this.config.minDepth,
      this.config.maxDepth + 1,
    ));
    const axis = seedManager.random01(0, 0, 702) < 0.5 ? 'x' : 'z';
    const sign = seedManager.random01(0, 0, 703) < 0.5 ? -1 : 1;

    return axis === 'x'
      ? { x: distance * sign, z: 0 }
      : { x: 0, z: distance * sign };
  }

  decorateChunk(chunk, chunkManager) {
    if (this.isTargetChunk(chunk)) {
      this.addBroadcastCloset(chunk, chunkManager);
      return;
    }

    if (this.shouldAddGuideArrow(chunk)) {
      this.addGuideArrow(chunk, chunkManager);
    }
  }

  shouldAddGuideArrow(chunk) {
    const distance = this.getManhattanDistance(chunk.x, chunk.z, this.targetChunk.x, this.targetChunk.z);

    return distance > 0 && distance <= this.config.guidanceRadiusChunks;
  }

  isTargetChunk(chunk) {
    return chunk.x === this.targetChunk.x && chunk.z === this.targetChunk.z;
  }

  getTargetWorldPosition() {
    return new THREE.Vector3(
      this.room.origin.x + this.targetChunk.x * this.room.config.procedural.chunkSize,
      0,
      this.room.origin.z + this.targetChunk.z * this.room.config.procedural.chunkSize,
    );
  }

  getCompassGuidance(playerWorldPosition, chunkManager) {
    const targetPosition = this.getTargetWorldPosition();
    const distance = Math.hypot(
      targetPosition.x - playerWorldPosition.x,
      targetPosition.z - playerWorldPosition.z,
    );
    const playerChunk = chunkManager.getChunkCoordinates(playerWorldPosition);
    const chunk = chunkManager.getChunkDataAtCoordinates(playerChunk.x, playerChunk.z);
    const routeDirection = this.getBestOpenDirection(chunk);
    const routeVector = DIRECTIONS[routeDirection];

    if (!routeVector) {
      return {
        targetPosition,
        distance,
      };
    }

    return {
      targetPosition: new THREE.Vector3(
        playerWorldPosition.x + routeVector.x,
        0,
        playerWorldPosition.z + routeVector.z,
      ),
      distance,
    };
  }

  addGuideArrow(chunk, chunkManager) {
    const direction = this.getBestOpenDirection(chunk);

    if (!direction) {
      return;
    }

    const { shaftSize, shaftPosition, headPoints } = this.getArrowLayout(direction, chunk.center);

    chunkManager.addBox(chunk, {
      name: `${chunk.key}:BroadcastGuideArrow:Shaft`,
      size: shaftSize,
      position: shaftPosition,
      material: this.materials.guideArrow,
      castShadow: false,
      receiveShadow: false,
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([
      headPoints[0].x, 0.05, headPoints[0].z,
      headPoints[1].x, 0.05, headPoints[1].z,
      headPoints[2].x, 0.05, headPoints[2].z,
    ], 3));
    geometry.computeVertexNormals();

    const head = new THREE.Mesh(geometry, this.materials.guideArrow);
    head.name = `${chunk.key}:BroadcastGuideArrow:Head`;
    head.renderOrder = 1;
    chunk.group.add(head);
    chunk.geometries.push(geometry);
  }

  getBestOpenDirection(chunk) {
    const currentDistance = this.getManhattanDistance(chunk.x, chunk.z, this.targetChunk.x, this.targetChunk.z);
    let bestDirection = null;
    let bestDistance = currentDistance;

    for (const [direction, vector] of Object.entries(DIRECTIONS)) {
      if (!chunk.connections[direction]) {
        continue;
      }

      const nextX = chunk.x + vector.x;
      const nextZ = chunk.z + vector.z;
      const distance = this.getManhattanDistance(nextX, nextZ, this.targetChunk.x, this.targetChunk.z);

      if (distance < bestDistance) {
        bestDirection = direction;
        bestDistance = distance;
      }
    }

    if (bestDirection) {
      return bestDirection;
    }

    return this.getDirectDirection(chunk.x, chunk.z);
  }

  getDirectDirection(x, z) {
    const dx = this.targetChunk.x - x;
    const dz = this.targetChunk.z - z;

    if (Math.abs(dx) >= Math.abs(dz) && dx !== 0) {
      return dx > 0 ? 'east' : 'west';
    }

    if (dz !== 0) {
      return dz > 0 ? 'south' : 'north';
    }

    return null;
  }

  getArrowLayout(direction, center) {
    const size = this.config.arrowSize;
    const half = size / 2;
    const shaftWidth = 0.24;
    const shaftLength = 0.88;
    const headWidth = 0.82;
    const headInset = 0.22;
    const y = 0.035;

    if (direction === 'north' || direction === 'south') {
      const sign = direction === 'north' ? -1 : 1;

      return {
        shaftSize: { x: shaftWidth, y: 0.018, z: shaftLength },
        shaftPosition: { x: center.x, y, z: center.z - sign * 0.2 },
        headPoints: [
          { x: center.x, z: center.z + sign * half },
          { x: center.x - headWidth / 2, z: center.z + sign * headInset },
          { x: center.x + headWidth / 2, z: center.z + sign * headInset },
        ],
      };
    }

    const sign = direction === 'west' ? -1 : 1;

    return {
      shaftSize: { x: shaftLength, y: 0.018, z: shaftWidth },
      shaftPosition: { x: center.x - sign * 0.2, y, z: center.z },
      headPoints: [
        { x: center.x + sign * half, z: center.z },
        { x: center.x + sign * headInset, z: center.z - headWidth / 2 },
        { x: center.x + sign * headInset, z: center.z + headWidth / 2 },
      ],
    };
  }

  addBroadcastCloset(chunk, chunkManager) {
    const closet = this.config.closet;
    const center = {
      x: chunk.center.x,
      y: closet.height / 2,
      z: chunk.center.z + 0.45,
    };
    const halfWidth = closet.width / 2;
    const halfDepth = closet.depth / 2;
    const wall = closet.wallThickness;
    const doorSegmentLength = (closet.width - closet.doorWidth) / 2;

    chunkManager.addBox(chunk, {
      name: `${chunk.key}:BroadcastCloset:BackWall`,
      size: { x: closet.width, y: closet.height, z: wall },
      position: { x: center.x, y: center.y, z: center.z - halfDepth },
      material: this.materials.wall,
      castShadow: true,
      receiveShadow: true,
      collider: true,
    });

    for (const side of [-1, 1]) {
      chunkManager.addBox(chunk, {
        name: `${chunk.key}:BroadcastCloset:SideWall:${side}`,
        size: { x: wall, y: closet.height, z: closet.depth },
        position: { x: center.x + side * halfWidth, y: center.y, z: center.z },
        material: this.materials.wall,
        castShadow: true,
        receiveShadow: true,
        collider: true,
      });

      chunkManager.addBox(chunk, {
        name: `${chunk.key}:BroadcastCloset:FrontWall:${side}`,
        size: { x: doorSegmentLength, y: closet.height, z: wall },
        position: {
          x: center.x + side * (closet.doorWidth / 2 + doorSegmentLength / 2),
          y: center.y,
          z: center.z + halfDepth,
        },
        material: this.materials.wall,
        castShadow: true,
        receiveShadow: true,
        collider: true,
      });
    }

    chunkManager.addBox(chunk, {
      name: `${chunk.key}:BroadcastCloset:DoorHeader`,
      size: { x: closet.doorWidth, y: 0.42, z: wall },
      position: { x: center.x, y: closet.height - 0.21, z: center.z + halfDepth },
      material: this.materials.wall,
      castShadow: true,
      receiveShadow: true,
      collider: true,
    });

    this.addBroadcastFurniture(chunk, chunkManager, center);
  }

  addBroadcastFurniture(chunk, chunkManager, closetCenter) {
    const stand = chunkManager.addBox(chunk, {
      name: `${chunk.key}:BroadcastTvStand`,
      size: { x: 1.45, y: 0.72, z: 0.72 },
      position: { x: closetCenter.x, y: 0.36, z: closetCenter.z - 0.92 },
      material: this.materials.darkWood,
      castShadow: true,
      receiveShadow: true,
      collider: true,
    });

    const tvCabinet = chunkManager.addBox(chunk, {
      name: `${chunk.key}:BroadcastTvCabinet`,
      size: { x: 1.12, y: 0.74, z: 0.58 },
      position: { x: closetCenter.x, y: 1.09, z: closetCenter.z - 0.92 },
      material: this.materials.tvCabinet,
      castShadow: true,
      receiveShadow: true,
      collider: true,
    });

    chunkManager.addBox(chunk, {
      name: `${chunk.key}:BroadcastTvBezel`,
      size: { x: 0.82, y: 0.48, z: 0.06 },
      position: { x: closetCenter.x, y: 1.13, z: closetCenter.z - 0.605 },
      material: this.materials.tvBezel,
      castShadow: true,
      receiveShadow: true,
    });

    const screen = chunkManager.addBox(chunk, {
      name: `${chunk.key}:BroadcastTvScreen`,
      size: { x: 0.66, y: 0.36, z: 0.035 },
      position: { x: closetCenter.x, y: 1.14, z: closetCenter.z - 0.567 },
      material: this.materials.lockedScreen,
      castShadow: false,
      receiveShadow: false,
    });

    const videoScreen = new VideoScreen({
      mesh: screen,
      offMaterial: this.materials.lockedScreen,
      src: this.config.video.src,
      loop: this.config.video.loop,
      defaultVolume: this.config.video.defaultVolume,
      volumeStep: this.config.video.volumeStep,
      spatialAudio: this.config.spatialAudio,
    });

    const interactable = this.room.registerInteractable([screen, tvCabinet, stand], {
      id: `${chunk.key}:hidden-broadcast-tv`,
      range: 2.65,
      getPrompt: ({ roomManager }) => this.getPrompt(videoScreen, roomManager),
      onInteract: ({ roomManager, contentManager }) => this.handleInteract(videoScreen, roomManager, contentManager),
    });

    this.instances.set(chunk.key, {
      videoScreen,
      interactable,
    });
  }

  getPrompt(videoScreen, roomManager) {
    if (!roomManager?.hasReadBroadcastGuide()) {
      return 'Inspect Broadcast TV';
    }

    if (!this.isUnlocked) {
      return 'Enter Broadcast Code';
    }

    return videoScreen.isPowered ? 'Turn Off Broadcast' : 'Play Broadcast';
  }

  handleInteract(videoScreen, roomManager, contentManager) {
    if (!roomManager?.hasReadBroadcastGuide()) {
      contentManager?.open({
        title: 'Broadcast Locked',
        body: [
          'The small television waits at ---- - ----.',
          'A label on the stand reads: Check the TV Guide in the Library.',
        ],
      });
      return;
    }

    if (this.isUnlocked) {
      void videoScreen.togglePower();
      return;
    }

    contentManager?.open({
      title: 'Broadcast Access',
      body: [
        'The screen waits at ---- - ----.',
        'Enter the access code from the TV Guide.',
      ],
      footer: 'Type the access code, then unlock the broadcast.',
      codeEntry: {
        placeholder: '---- - ----',
        inputPlaceholder: 'ABCD-1234',
        submitLabel: 'Unlock Broadcast',
        onSubmit: (value) => {
          if (!roomManager?.verifyBroadcastAccessCode(value)) {
            return { message: 'Code not accepted. Check the TV Guide again.' };
          }

          this.isUnlocked = true;
          contentManager?.close();
          void videoScreen.powerOn();
          roomManager.showTemporaryInfo?.({
            title: 'Broadcast unlocked',
            body: 'The closet television begins playing.',
            durationMs: 2200,
          });

          return { message: '' };
        },
      },
    });
  }

  update(player) {
    for (const instance of this.instances.values()) {
      instance.videoScreen.updateSpatialVolume(player.position);
    }
  }

  pauseMedia() {
    for (const instance of this.instances.values()) {
      instance.videoScreen.pause();
    }
  }

  resumeMedia() {
    for (const instance of this.instances.values()) {
      void instance.videoScreen.resumeIfPowered();
    }
  }

  unloadChunk(chunkKey) {
    const instance = this.instances.get(chunkKey);

    if (!instance) {
      return;
    }

    instance.videoScreen.dispose();
    this.room.unregisterInteractable(instance.interactable);
    this.instances.delete(chunkKey);
  }

  unloadAll() {
    for (const chunkKey of Array.from(this.instances.keys())) {
      this.unloadChunk(chunkKey);
    }
  }

  dispose() {
    this.unloadAll();
  }

  createLockedScreenMaterial() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    context.fillStyle = '#050807';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#8affab';
    context.font = '700 54px Cascadia Mono, Consolas, monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('---- - ----', canvas.width / 2, canvas.height / 2);

    const texture = this.room.trackTexture(new THREE.CanvasTexture(canvas));
    texture.colorSpace = THREE.SRGBColorSpace;

    return this.trackBasicMaterial('HiddenBroadcastLockedScreen', new THREE.MeshBasicMaterial({
      map: texture,
      toneMapped: false,
    }));
  }

  trackBasicMaterial(name, material) {
    material.name = `${this.room.name}:${name}`;
    this.room.materials.set(name, material);

    return material;
  }

  getManhattanDistance(ax, az, bx, bz) {
    return Math.abs(ax - bx) + Math.abs(az - bz);
  }
}
