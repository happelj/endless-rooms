import * as THREE from 'three';
import { RoomBoundsCollider } from '../collision/RoomBoundsCollider.js';
import { AUDIO_CONFIG, FORGOTTEN_LEVEL_CONFIG, PLAYER_CONFIG } from '../config/constants.js';
import { ChunkManager } from '../forgotten/ChunkManager.js';
import { EntitySpawnManager } from '../forgotten/EntitySpawnManager.js';
import { EscapeManager } from '../forgotten/EscapeManager.js';
import { ForgottenLevelGenerator } from '../forgotten/ForgottenLevelGenerator.js';
import { ProceduralSeedManager } from '../forgotten/ProceduralSeedManager.js';
import { Room } from './Room.js';

export class ForgottenLevelRoom extends Room {
  constructor(scene, collisionSystem, config = FORGOTTEN_LEVEL_CONFIG) {
    super(scene, collisionSystem, config);
    this.seedManager = new ProceduralSeedManager(config.procedural.baseSeed);
    this.generator = new ForgottenLevelGenerator(this.seedManager, config.procedural);
    this.escapeManager = new EscapeManager(this);
    this.entitySpawnManager = new EntitySpawnManager(this, this.generator, config.procedural);
    this.chunkManager = new ChunkManager({
      room: this,
      generator: this.generator,
      entitySpawnManager: this.entitySpawnManager,
      escapeManager: this.escapeManager,
      config: config.procedural,
    });
    this.currentSeed = null;
    this.nextEventTime = 7;
    this.silenceUntil = 0;
    this.build();
  }

  build() {
    this.createMaterials();
    this.addBounds();
    this.addLighting();
  }

  createMaterials() {
    this.forgottenMaterials = Object.freeze({
      carpet: this.createMaterial('Carpet', this.config.materials.carpet),
      carpetDark: this.createMaterial('CarpetDark', this.config.materials.carpetDark),
      wall: this.createMaterial('Wall', this.config.materials.wall),
      wallStained: this.createMaterial('WallStained', this.config.materials.wallStained),
      ceiling: this.createMaterial('Ceiling', this.config.materials.ceiling),
      trim: this.createMaterial('Trim', this.config.materials.trim),
      prop: this.createMaterial('AbandonedProp', {
        color: 0x6f6748,
        roughness: 0.88,
        metalness: 0.02,
      }),
      stain: this.trackMaterial('Stain', new THREE.MeshBasicMaterial({
        color: 0x332819,
        transparent: true,
        opacity: 0.42,
        depthWrite: false,
      })),
      lightPanel: this.trackMaterial('FluorescentPanel', new THREE.MeshBasicMaterial({
        color: 0xfff0a2,
        transparent: true,
        opacity: 0.45,
        toneMapped: false,
      })),
      exitDoor: this.createMaterial('EmergencyExitDoor', {
        color: 0x41372a,
        roughness: 0.8,
        metalness: 0.18,
        emissive: 0x281105,
        emissiveIntensity: 0.08,
      }),
      exitGlow: this.trackMaterial('EmergencyExitGlow', new THREE.MeshBasicMaterial({
        color: 0x75ff9d,
        transparent: true,
        opacity: 0.9,
        toneMapped: false,
      })),
      entity: this.createMaterial('EntitySilhouette', {
        color: 0x0f0d09,
        roughness: 0.9,
        metalness: 0,
        emissive: 0x160706,
        emissiveIntensity: 0.18,
      }),
    });
  }

  trackMaterial(name, material) {
    material.name = `${this.name}:${name}`;
    this.materials.set(name, material);

    return material;
  }

  addBounds() {
    const { width, length, height } = this.config.dimensions;
    const min = this.toWorldPosition({ x: -width / 2, y: 0, z: -length / 2 });
    const max = this.toWorldPosition({ x: width / 2, y: height, z: length / 2 });

    this.boundsCollider = new RoomBoundsCollider({
      name: `${this.name}BoundsCollider`,
      roomId: this.id,
      origin: this.origin,
      minX: min.x,
      maxX: max.x,
      minY: min.y,
      maxY: max.y,
      minZ: min.z,
      maxZ: max.z,
    });
    this.addBoundsCollider(this.boundsCollider);
  }

  addLighting() {
    const hemisphere = new THREE.HemisphereLight(0xd8c987, 0x241d11, 0.42);
    hemisphere.name = 'ForgottenLevelHemisphereLight';
    hemisphere.position.set(0, 12, 0);
    this.addLight(hemisphere);

    this.playerLight = new THREE.PointLight(0xffd77a, 16, 14, 2);
    this.playerLight.name = 'ForgottenLevelPlayerProximityLight';
    this.playerLight.castShadow = false;
    this.addLight(this.playerLight);
  }

  beginRun(seed = undefined) {
    this.currentSeed = this.seedManager.startRun(seed);
    this.chunkManager.reset();
    this.entitySpawnManager.reset();
    this.escapeManager.reset();
    this.nextEventTime = 7;
    this.silenceUntil = 0;
    this.chunkManager.ensureChunksAroundPlayer();

    return this.currentSeed;
  }

  getSpawnPose() {
    return {
      position: new THREE.Vector3(
        this.origin.x,
        PLAYER_CONFIG.body.eyeHeight,
        this.origin.z,
      ),
      rotation: { y: 0 },
    };
  }

  configureAudio(audioManager) {
    this.audioManager = audioManager;

    if (!audioManager || this.roomAudioConfigured) {
      return;
    }

    const audioConfig = AUDIO_CONFIG.forgottenLevel;
    this.fluorescentBuzzAudio = this.createRoomAudioSource(audioManager, audioConfig.fluorescentBuzz);
    this.hvacDroneAudio = this.createRoomAudioSource(audioManager, audioConfig.hvacDrone);
    this.roomAudioConfigured = true;
  }

  createRoomAudioSource(audioManager, sourceConfig) {
    return audioManager.createPositionalLoop({
      ...sourceConfig,
      roomId: this.id,
      position: this.toWorldPosition(sourceConfig.position),
    });
  }

  activate() {
    super.activate();

    if (!this.currentSeed) {
      this.beginRun();
    }
  }

  update(deltaTime, player, elapsedTime = 0, roomManager = null) {
    this.updatePlayerLight(player);
    this.chunkManager.update(player.position, elapsedTime);
    this.entitySpawnManager.update(
      deltaTime,
      elapsedTime,
      player.position,
      this.chunkManager.getCurrentDepth(),
    );
    this.escapeManager.update(player, roomManager);
    this.updateAtmosphereEvents(elapsedTime, player);
  }

  updatePlayerLight(player) {
    if (!this.playerLight) {
      return;
    }

    this.playerLight.position.set(
      player.position.x - this.origin.x,
      2.35,
      player.position.z - this.origin.z,
    );
    this.playerLight.intensity = 9 + Math.sin(performance.now() * 0.006) * 2.5;
  }

  updateAtmosphereEvents(elapsedTime, player) {
    if (this.silenceUntil > elapsedTime) {
      this.fluorescentBuzzAudio?.setVolume(0.001);
      this.hvacDroneAudio?.setVolume(0.002);
      return;
    }

    this.fluorescentBuzzAudio?.setVolume(AUDIO_CONFIG.forgottenLevel.fluorescentBuzz.volume);
    this.hvacDroneAudio?.setVolume(AUDIO_CONFIG.forgottenLevel.hvacDrone.volume);

    if (elapsedTime < this.nextEventTime || this.audioManager?.context?.state !== 'running') {
      return;
    }

    const depth = this.chunkManager.getCurrentDepth();
    const playEntityCall = depth > 6 && Math.sin(elapsedTime * 0.37 + depth) > 0.65;
    const soundConfig = playEntityCall
      ? AUDIO_CONFIG.forgottenLevel.entityCall
      : AUDIO_CONFIG.forgottenLevel.distantSteps;
    const offset = playEntityCall
      ? { x: -12 - depth * 0.12, y: 1.2, z: -18 }
      : { x: 8, y: 0.2, z: -10 - depth * 0.08 };

    this.audioManager.playSoundEffect({
      ...soundConfig,
      id: `${soundConfig.id}:${Math.floor(elapsedTime * 10)}`,
      position: {
        x: player.position.x + offset.x,
        y: player.position.y + offset.y,
        z: player.position.z + offset.z,
      },
    });

    if (depth > 10 && Math.sin(elapsedTime * 0.21) > 0.88) {
      this.silenceUntil = elapsedTime + 2.4;
    }

    this.nextEventTime = elapsedTime + 5 + Math.max(0, 12 - depth * 0.16);
  }

  dispose() {
    this.chunkManager.reset();
    this.entitySpawnManager.reset();
    this.escapeManager.reset();
    super.dispose();
  }
}
