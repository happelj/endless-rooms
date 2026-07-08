import * as THREE from 'three';
import { RoomBoundsCollider } from '../collision/RoomBoundsCollider.js';
import { Sky } from '../environment/Sky.js';
import { Terrain } from '../environment/Terrain.js';
import { VegetationFactory } from '../environment/Vegetation.js';
import { AUDIO_CONFIG, YOSEMITE_ROOM_CONFIG } from '../config/constants.js';
import { Room } from './Room.js';
import { RoomLabel } from './RoomLabel.js';

const TRAIL_MARKER_RANGE = 2.5;
const OUTDOOR_BOUNDARY_MARGIN = 0.08;

const TRAIL_MARKERS = Object.freeze([
  Object.freeze({
    id: 'valley-floor',
    title: 'Valley Floor',
    position: Object.freeze({ x: -1.9, z: -8.6 }),
    body: Object.freeze([
      'Placeholder trail note.',
      'Future content can describe geology, ecology, route choices, and discovered landmarks through the shared Content Panel system.',
    ]),
  }),
  Object.freeze({
    id: 'pine-canopy',
    title: 'Pine Canopy',
    position: Object.freeze({ x: 2.6, z: 1.5 }),
    body: Object.freeze([
      'Placeholder trail note.',
      'This marker will later introduce forest habitat details, seasonal changes, and wildlife observations.',
    ]),
  }),
  Object.freeze({
    id: 'water-edge',
    title: 'Water Edge',
    position: Object.freeze({ x: 7.1, z: 9.4 }),
    body: Object.freeze([
      'Placeholder trail note.',
      'Future versions can use this marker for stream ecology, soundscape notes, and photo references.',
    ]),
  }),
]);

const TREE_LAYOUT = Object.freeze([
  Object.freeze({ x: -11.8, z: -12.2, height: 4.6, radius: 0.17 }),
  Object.freeze({ x: -8.7, z: -7.8, height: 4.1, radius: 0.16 }),
  Object.freeze({ x: -12.9, z: -2.2, height: 5.0, radius: 0.18 }),
  Object.freeze({ x: -9.6, z: 6.4, height: 4.4, radius: 0.16 }),
  Object.freeze({ x: -13.2, z: 12.2, height: 5.2, radius: 0.2 }),
  Object.freeze({ x: 11.2, z: -13.5, height: 4.7, radius: 0.18 }),
  Object.freeze({ x: 8.2, z: -7.4, height: 4.0, radius: 0.15 }),
  Object.freeze({ x: 12.6, z: -1.5, height: 5.1, radius: 0.19 }),
  Object.freeze({ x: 9.4, z: 5.4, height: 4.2, radius: 0.16 }),
  Object.freeze({ x: 13.0, z: 12.6, height: 5.3, radius: 0.2 }),
  Object.freeze({ x: -5.5, z: 14.2, height: 4.0, radius: 0.16 }),
  Object.freeze({ x: 4.4, z: 15.0, height: 4.5, radius: 0.17 }),
]);

const BOULDER_LAYOUT = Object.freeze([
  Object.freeze({ x: -6.5, z: -10.6, radius: 0.62, scale: Object.freeze({ x: 1.35, y: 0.65, z: 1.0 }) }),
  Object.freeze({ x: 5.1, z: -4.7, radius: 0.5, scale: Object.freeze({ x: 1.0, y: 0.72, z: 1.4 }) }),
  Object.freeze({ x: -4.4, z: 5.8, radius: 0.48, scale: Object.freeze({ x: 1.25, y: 0.66, z: 0.9 }) }),
  Object.freeze({ x: 10.5, z: 10.4, radius: 0.7, scale: Object.freeze({ x: 1.35, y: 0.58, z: 1.25 }) }),
  Object.freeze({ x: -9.2, z: 11.3, radius: 0.58, scale: Object.freeze({ x: 1.1, y: 0.7, z: 1.35 }) }),
]);

const LOG_LAYOUT = Object.freeze([
  Object.freeze({ x: -3.3, z: -2.4, length: 2.6, rotationY: 0.72 }),
  Object.freeze({ x: 6.6, z: 4.2, length: 3.1, rotationY: -0.5 }),
  Object.freeze({ x: -7.2, z: 8.6, length: 2.7, rotationY: 1.15 }),
]);

export class YosemiteRoom extends Room {
  constructor(scene, collisionSystem, config = YOSEMITE_ROOM_CONFIG) {
    super(scene, collisionSystem, config);
    this.cloudTime = 0;
    this.streamStrips = [];
    this.build();
  }

  build() {
    this.createMaterials();
    this.addBounds();
    this.addTerrain();
    this.addSky();
    this.addLighting();
    this.addTrail();
    this.addGraniteCliffs();
    this.addWater();
    this.addVegetation();
    this.addTrailMarkers();
  }

  createMaterials() {
    this.yosemiteMaterials = Object.freeze({
      terrain: this.createMaterial('TerrainGrass', {
        color: 0x5d7c43,
        roughness: 0.94,
        metalness: 0,
      }),
      trail: this.createMaterial('TrailDirt', {
        color: 0x9a7a52,
        roughness: 0.98,
        metalness: 0,
      }),
      granite: this.createMaterial('GraniteCliffs', {
        color: 0x9a9a8f,
        roughness: 0.86,
        metalness: 0.02,
      }),
      graniteDark: this.createMaterial('GraniteShadow', {
        color: 0x6e726d,
        roughness: 0.9,
        metalness: 0.01,
      }),
      bark: this.createMaterial('PineBark', {
        color: 0x4a3325,
        roughness: 0.9,
        metalness: 0,
      }),
      pine: this.createMaterial('PineNeedles', {
        color: 0x244d35,
        roughness: 0.86,
        metalness: 0,
      }),
      shrub: this.createMaterial('MountainShrub', {
        color: 0x45683f,
        roughness: 0.88,
        metalness: 0,
      }),
      flowerStem: this.createMaterial('WildflowerStem', {
        color: 0x3f6f37,
        roughness: 0.82,
        metalness: 0,
      }),
      flowerYellow: this.createMaterial('WildflowerYellow', {
        color: 0xf1d45c,
        roughness: 0.78,
        metalness: 0,
      }),
      flowerViolet: this.createMaterial('WildflowerViolet', {
        color: 0x8d77d6,
        roughness: 0.78,
        metalness: 0,
      }),
      rock: this.createMaterial('TrailBoulder', {
        color: 0x777d76,
        roughness: 0.92,
        metalness: 0.02,
      }),
      markerPost: this.createMaterial('TrailMarkerPost', {
        color: 0x5c3d2a,
        roughness: 0.78,
        metalness: 0,
      }),
      markerFace: this.createMaterial('TrailMarkerFace', {
        color: 0xd3b075,
        roughness: 0.7,
        metalness: 0,
      }),
      cloud: this.trackMaterial('Clouds', new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.62,
        depthWrite: false,
        toneMapped: false,
      })),
      water: this.trackMaterial('MountainWater', new THREE.MeshPhysicalMaterial({
        color: 0x83c7dc,
        roughness: 0.08,
        metalness: 0,
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        emissive: 0x1b6b8f,
        emissiveIntensity: 0.08,
      })),
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

  addBoundsOpening(opening) {
    this.boundsCollider.addOpening(opening);
  }

  addTerrain() {
    const { width, length } = this.config.dimensions;
    const { segmentsX, segmentsZ } = this.config.terrain;

    this.terrain = new Terrain({
      name: 'YosemiteTerrain',
      width: width - OUTDOOR_BOUNDARY_MARGIN,
      length: length - OUTDOOR_BOUNDARY_MARGIN,
      segmentsX,
      segmentsZ,
      origin: this.origin,
      material: this.yosemiteMaterials.terrain,
      heightSampler: (x, z) => this.sampleTerrainHeight(x, z),
    });

    this.group.add(this.terrain.mesh);
    this.addGroundCollider(this.terrain.collider);
  }

  sampleTerrainHeight(x, z) {
    const rawHill = 0.28
      + Math.sin(x * 0.22) * 0.16
      + Math.cos(z * 0.17) * 0.14
      + Math.sin((x + z) * 0.09) * 0.12;
    const trailCenter = this.getTrailCenterX(z);
    const trailDistance = Math.abs(x - trailCenter);
    const trailBlend = THREE.MathUtils.clamp(1 - trailDistance / 2.45, 0, 1);
    const trailHeight = 0.18 + Math.sin(z * 0.13) * 0.06;

    return Math.max(0.08, THREE.MathUtils.lerp(rawHill, trailHeight, trailBlend * 0.82));
  }

  getTrailCenterX(z) {
    return Math.sin((z + 9) * 0.19) * 2.15 + Math.sin(z * 0.075) * 1.05;
  }

  getTerrainY(x, z, offset = 0) {
    return this.terrain.getHeight(x, z) + offset;
  }

  addSky() {
    this.sky = new Sky({
      cloudMaterial: this.yosemiteMaterials.cloud,
      skyColor: 0x8fc9ff,
    });
    this.group.add(this.sky.group);
  }

  addLighting() {
    const { hemisphere, sun } = this.config.lighting;

    const hemi = new THREE.HemisphereLight(hemisphere.skyColor, hemisphere.groundColor, hemisphere.intensity);
    hemi.name = 'YosemiteHemisphereLight';
    hemi.position.set(hemisphere.position.x, hemisphere.position.y, hemisphere.position.z);
    this.addLight(hemi);

    const light = new THREE.DirectionalLight(sun.color, sun.intensity);
    light.name = 'YosemiteSunLight';
    light.position.set(sun.position.x, sun.position.y, sun.position.z);
    light.target.position.set(sun.target.x, sun.target.y, sun.target.z);
    light.castShadow = true;
    light.shadow.mapSize.set(sun.shadowMapSize, sun.shadowMapSize);
    light.shadow.camera.near = sun.shadowCameraNear;
    light.shadow.camera.far = sun.shadowCameraFar;
    light.shadow.camera.left = -sun.shadowCameraSize;
    light.shadow.camera.right = sun.shadowCameraSize;
    light.shadow.camera.top = sun.shadowCameraSize;
    light.shadow.camera.bottom = -sun.shadowCameraSize;
    light.shadow.bias = sun.shadowBias;
    this.addLight(light);
    this.addLight(light.target);
  }

  addTrail() {
    for (let z = -15; z <= 15; z += 2.4) {
      const x = this.getTrailCenterX(z);

      this.addBox({
        name: `YosemiteTrailSegment:${z.toFixed(1)}`,
        size: { x: 2.35, y: 0.035, z: 2.8 },
        position: {
          x,
          y: this.getTerrainY(x, z, 0.024),
          z,
        },
        material: this.yosemiteMaterials.trail,
        castShadow: false,
        receiveShadow: true,
      });
    }
  }

  addGraniteCliffs() {
    this.addBox({
      name: 'YosemiteWestGraniteCliff',
      size: { x: 3.2, y: 10.8, z: 34 },
      position: { x: -15.9, y: 5.35, z: 2.5 },
      material: this.yosemiteMaterials.granite,
      castShadow: true,
      receiveShadow: true,
      collider: true,
    });

    this.addBox({
      name: 'YosemiteEastGraniteCliff',
      size: { x: 3.0, y: 9.2, z: 30 },
      position: { x: 15.8, y: 4.6, z: 1.5 },
      material: this.yosemiteMaterials.graniteDark,
      castShadow: true,
      receiveShadow: true,
      collider: true,
    });

    this.addBox({
      name: 'YosemiteFarGraniteWall',
      size: { x: 29, y: 12.2, z: 3.2 },
      position: { x: 0, y: 6.0, z: 17.4 },
      material: this.yosemiteMaterials.granite,
      castShadow: true,
      receiveShadow: true,
      collider: true,
    });
  }

  addWater() {
    this.addPond();
    this.addStream();
  }

  addPond() {
    const x = 8.3;
    const z = 9.2;
    const geometry = new THREE.CylinderGeometry(1.9, 2.35, 0.035, 32);
    const mesh = new THREE.Mesh(geometry, this.yosemiteMaterials.water);
    mesh.name = 'YosemiteReflectivePond';
    mesh.position.set(x, this.getTerrainY(x, z, 0.04), z);
    mesh.scale.z = 0.68;
    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.renderOrder = 2;
    this.addMesh(mesh, { disposeGeometry: true });
  }

  addStream() {
    for (let index = 0; index < 7; index += 1) {
      const z = 2.5 + index * 1.55;
      const x = 6.6 + Math.sin(index * 0.85) * 0.8;
      const strip = this.addBox({
        name: `YosemiteStream:${index + 1}`,
        size: { x: 1.05, y: 0.025, z: 1.85 },
        position: { x, y: this.getTerrainY(x, z, 0.032), z },
        material: this.yosemiteMaterials.water,
        castShadow: false,
        receiveShadow: false,
      });
      strip.renderOrder = 2;
      this.streamStrips.push({
        mesh: strip,
        baseY: strip.position.y,
        phase: index * 0.7,
      });
    }
  }

  addVegetation() {
    this.vegetation = new VegetationFactory(this, this.yosemiteMaterials);

    for (const [index, tree] of TREE_LAYOUT.entries()) {
      this.vegetation.addPineTree({
        name: `YosemitePine:${index + 1}`,
        position: { x: tree.x, y: this.getTerrainY(tree.x, tree.z), z: tree.z },
        height: tree.height,
        trunkRadius: tree.radius,
        canopyRadius: tree.height * 0.21,
      });
    }

    for (const [index, boulder] of BOULDER_LAYOUT.entries()) {
      this.vegetation.addBoulder({
        name: `YosemiteBoulder:${index + 1}`,
        position: {
          x: boulder.x,
          y: this.getTerrainY(boulder.x, boulder.z, boulder.radius * boulder.scale.y),
          z: boulder.z,
        },
        radius: boulder.radius,
        scale: boulder.scale,
      });
    }

    for (const [index, log] of LOG_LAYOUT.entries()) {
      this.vegetation.addFallenLog({
        name: `YosemiteFallenLog:${index + 1}`,
        position: {
          x: log.x,
          y: this.getTerrainY(log.x, log.z, 0.2),
          z: log.z,
        },
        length: log.length,
        radius: 0.18,
        rotation: { x: Math.PI / 2, y: log.rotationY, z: 0 },
      });
    }

    this.addLowVegetation();
  }

  addLowVegetation() {
    const shrubs = [
      { x: -6.8, z: -5.2 },
      { x: 5.2, z: -10.8 },
      { x: -2.7, z: 7.8 },
      { x: 3.8, z: 12.5 },
      { x: -11.0, z: 3.6 },
    ];

    for (const [index, shrub] of shrubs.entries()) {
      this.vegetation.addShrub({
        name: `YosemiteShrub:${index + 1}`,
        position: { x: shrub.x, y: this.getTerrainY(shrub.x, shrub.z, 0.28), z: shrub.z },
        radius: 0.42 + (index % 2) * 0.12,
      });
    }

    for (let index = 0; index < 22; index += 1) {
      const z = -12 + index * 1.25;
      const x = this.getTrailCenterX(z) + (index % 2 === 0 ? -1.65 : 1.55);
      const material = index % 3 === 0
        ? this.yosemiteMaterials.flowerViolet
        : this.yosemiteMaterials.flowerYellow;

      this.vegetation.addWildflower({
        name: `YosemiteWildflower:${index + 1}`,
        position: { x, y: this.getTerrainY(x, z, 0.02), z },
        colorMaterial: material,
      });
    }
  }

  addTrailMarkers() {
    for (const marker of TRAIL_MARKERS) {
      const groundY = this.getTerrainY(marker.position.x, marker.position.z);

      this.addBox({
        name: `YosemiteTrailMarkerPost:${marker.id}`,
        size: { x: 0.12, y: 0.9, z: 0.12 },
        position: { x: marker.position.x, y: groundY + 0.45, z: marker.position.z },
        material: this.yosemiteMaterials.markerPost,
        castShadow: true,
        receiveShadow: true,
        collider: true,
      });

      const sign = this.addBox({
        name: `YosemiteTrailMarkerSign:${marker.id}`,
        size: { x: 1.05, y: 0.46, z: 0.08 },
        position: { x: marker.position.x, y: groundY + 1.06, z: marker.position.z - 0.04 },
        material: this.yosemiteMaterials.markerFace,
        castShadow: true,
        receiveShadow: true,
      });

      const label = new RoomLabel({
        text: marker.title,
        subtitle: 'Read Trail Marker',
        width: 1.25,
        height: 0.44,
        position: { x: marker.position.x, y: groundY + 1.07, z: marker.position.z - 0.095 },
        rotationY: 0,
      });
      this.addLabel(label);

      this.registerInteractable([sign, label.mesh], {
        id: `yosemite-marker-${marker.id}`,
        range: TRAIL_MARKER_RANGE,
        prompt: 'Read Trail Marker',
        onInteract: ({ contentManager }) => this.openTrailMarker(contentManager, marker),
      });
    }
  }

  openTrailMarker(contentManager, marker) {
    contentManager?.open({
      title: marker.title,
      body: marker.body,
    });
  }

  configureAudio(audioManager) {
    this.audioManager = audioManager;

    if (!audioManager || this.roomAudioConfigured) {
      return;
    }

    const audioConfig = AUDIO_CONFIG.yosemite;
    this.windAudio = this.createRoomAudioSource(audioManager, audioConfig.wind);
    this.birdsAudio = this.createRoomAudioSource(audioManager, audioConfig.birds);
    this.waterAudio = this.createRoomAudioSource(audioManager, audioConfig.water);
    this.roomAudioConfigured = true;
  }

  createRoomAudioSource(audioManager, sourceConfig) {
    return audioManager.createPositionalLoop({
      ...sourceConfig,
      roomId: this.id,
      position: this.toWorldPosition(sourceConfig.position),
    });
  }

  update(deltaTime, player, elapsedTime = 0) {
    this.cloudTime += deltaTime;
    this.sky?.update(elapsedTime);
    this.updateWater(elapsedTime);
  }

  updateWater(elapsedTime) {
    for (const strip of this.streamStrips) {
      strip.mesh.position.y = strip.baseY + Math.sin(elapsedTime * 1.2 + strip.phase) * 0.012;
    }

    this.yosemiteMaterials.water.opacity = 0.5 + Math.sin(elapsedTime * 0.45) * 0.05;
  }

  activate() {
    super.activate();
    this.terrain?.setActive(true);
  }

  deactivate() {
    super.deactivate();
    this.terrain?.setActive(false);
  }

  dispose() {
    this.terrain?.dispose();
    this.sky?.dispose();
    this.streamStrips.length = 0;
    super.dispose();
  }
}
