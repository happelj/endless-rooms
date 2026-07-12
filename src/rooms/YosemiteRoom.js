import * as THREE from 'three';
import { AabbCollider } from '../collision/AabbCollider.js';
import { BirdFlock } from '../environment/BirdFlock.js';
import { GraniteLandmark } from '../environment/GraniteLandmark.js';
import { RoomBoundsCollider } from '../collision/RoomBoundsCollider.js';
import { Sky } from '../environment/Sky.js';
import { Terrain } from '../environment/Terrain.js';
import { VegetationFactory } from '../environment/Vegetation.js';
import { AUDIO_CONFIG, YOSEMITE_ROOM_CONFIG } from '../config/constants.js';
import { Room } from './Room.js';
import { RoomLabel } from './RoomLabel.js';

const TRAIL_MARKER_RANGE = 2.5;
const OUTDOOR_BOUNDARY_MARGIN = 0.08;
const TRAIL_WIDTH = 2.5;
const TRAIL_SEGMENT_LENGTH = 2.65;
const TRAIL_START_Z = -16.6;
const TRAIL_END_Z = 14.5;
const OVERLOOK_Z = 14.1;
const COMPASS_PICKUP_RANGE = 2.35;
const COMPASS_PLACEMENT = Object.freeze({ x: -2.25, z: 11.8 });

const OVERLOOK_MARKER = Object.freeze({
  id: 'granite-overlook',
  title: 'Granite Overlook',
  position: Object.freeze({ x: 0.85, z: 13.9 }),
  body: Object.freeze([
    'Placeholder trail marker.',
    'Future content can describe granite formation, erosion, sunlight, weathering, and scenic observation points.',
  ]),
});

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
    position: Object.freeze({ x: 7.2, z: 8.2 }),
    body: Object.freeze([
      'Placeholder trail note.',
      'Future versions can use this marker for stream ecology, soundscape notes, and photo references.',
    ]),
  }),
]);

const TREE_LAYOUT = Object.freeze([
  Object.freeze({ x: -11.8, z: -13.5, height: 5.2, radius: 0.19 }),
  Object.freeze({ x: -7.5, z: -12.1, height: 4.6, radius: 0.17 }),
  Object.freeze({ x: -12.9, z: -5.8, height: 5.4, radius: 0.19 }),
  Object.freeze({ x: -9.2, z: -1.8, height: 4.8, radius: 0.17 }),
  Object.freeze({ x: -12.5, z: 5.8, height: 5.6, radius: 0.2 }),
  Object.freeze({ x: -10.4, z: 11.6, height: 4.9, radius: 0.18 }),
  Object.freeze({ x: 10.9, z: -13.8, height: 5.1, radius: 0.19 }),
  Object.freeze({ x: 7.7, z: -9.4, height: 4.5, radius: 0.16 }),
  Object.freeze({ x: 12.8, z: -3.3, height: 5.7, radius: 0.2 }),
  Object.freeze({ x: 9.8, z: 4.8, height: 4.8, radius: 0.17 }),
  Object.freeze({ x: 12.2, z: 11.5, height: 5.4, radius: 0.2 }),
  Object.freeze({ x: -6.0, z: 15.4, height: 4.1, radius: 0.16 }),
  Object.freeze({ x: 5.7, z: 15.5, height: 4.3, radius: 0.17 }),
]);

const BOULDER_LAYOUT = Object.freeze([
  Object.freeze({ x: -6.5, z: -10.6, radius: 0.62, scale: Object.freeze({ x: 1.35, y: 0.65, z: 1.0 }) }),
  Object.freeze({ x: 5.1, z: -4.7, radius: 0.5, scale: Object.freeze({ x: 1.0, y: 0.72, z: 1.4 }) }),
  Object.freeze({ x: -4.4, z: 5.8, radius: 0.48, scale: Object.freeze({ x: 1.25, y: 0.66, z: 0.9 }) }),
  Object.freeze({ x: 10.5, z: 10.4, radius: 0.7, scale: Object.freeze({ x: 1.35, y: 0.58, z: 1.25 }) }),
  Object.freeze({ x: -9.2, z: 11.3, radius: 0.58, scale: Object.freeze({ x: 1.1, y: 0.7, z: 1.35 }) }),
]);

const LOG_LAYOUT = Object.freeze([
  Object.freeze({ x: -3.6, z: -3.3, length: 2.6, rotationY: 0.72 }),
  Object.freeze({ x: 6.7, z: 3.4, length: 3.1, rotationY: -0.5 }),
  Object.freeze({ x: -7.4, z: 8.5, length: 2.7, rotationY: 1.15 }),
]);

const SMALL_STONE_LAYOUT = Object.freeze([
  Object.freeze({ x: -2.4, z: -12.4, radius: 0.13 }),
  Object.freeze({ x: 2.1, z: -10.7, radius: 0.1 }),
  Object.freeze({ x: -3.5, z: -7.2, radius: 0.16 }),
  Object.freeze({ x: 3.6, z: -1.6, radius: 0.12 }),
  Object.freeze({ x: -3.8, z: 3.1, radius: 0.11 }),
  Object.freeze({ x: 2.7, z: 6.8, radius: 0.15 }),
  Object.freeze({ x: -2.2, z: 10.9, radius: 0.12 }),
  Object.freeze({ x: 3.3, z: 12.8, radius: 0.14 }),
]);

export class YosemiteRoom extends Room {
  constructor(scene, collisionSystem, config = YOSEMITE_ROOM_CONFIG) {
    super(scene, collisionSystem, config);
    this.cloudTime = 0;
    this.streamStrips = [];
    this.compassMeshes = [];
    this.compassInteractable = null;
    this.previousFog = undefined;
    this.previousBackground = undefined;
    this.build();
  }

  build() {
    this.createMaterials();
    this.addBounds();
    this.addTerrain();
    this.addSky();
    this.addAtmosphere();
    this.addLighting();
    this.addTrail();
    this.addGraniteCliffs();
    this.addGraniteLandmark();
    this.addWater();
    this.addVegetation();
    this.addForegroundDetails();
    this.addScenicOverlook();
    this.addTrailMarkers();
    this.addTrailCompass();
    this.addWildlife();
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
      graniteLight: this.createMaterial('SunlitGraniteFace', {
        color: 0xb7b4a8,
        roughness: 0.84,
        metalness: 0.02,
      }),
      graniteDark: this.createMaterial('GraniteShadow', {
        color: 0x6e726d,
        roughness: 0.9,
        metalness: 0.01,
      }),
      graniteCrease: this.createMaterial('GraniteCrease', {
        color: 0x5e625f,
        roughness: 0.94,
        metalness: 0,
      }),
      wood: this.createMaterial('OverlookWood', {
        color: 0x6a462d,
        roughness: 0.82,
        metalness: 0,
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
      compassBrass: this.createMaterial('TrailCompassBrass', {
        color: 0xb68a39,
        roughness: 0.48,
        metalness: 0.38,
      }),
      compassFace: this.createMaterial('TrailCompassFace', {
        color: 0xf2e6c8,
        roughness: 0.66,
        metalness: 0,
      }),
      compassNeedle: this.createMaterial('TrailCompassNeedle', {
        color: 0xc83b2f,
        roughness: 0.42,
        metalness: 0.16,
      }),
      compassTail: this.createMaterial('TrailCompassTail', {
        color: 0x273642,
        roughness: 0.48,
        metalness: 0.16,
      }),
      bird: this.trackMaterial('DistantBirds', new THREE.MeshBasicMaterial({
        color: 0x263035,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.82,
        depthWrite: false,
        toneMapped: false,
      })),
      cloud: this.trackMaterial('Clouds', new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.62,
        depthWrite: false,
        toneMapped: false,
      })),
      haze: this.trackMaterial('BlueAtmosphericHaze', new THREE.MeshBasicMaterial({
        color: this.config.atmosphere.hazeColor,
        transparent: true,
        opacity: this.config.atmosphere.hazeOpacity,
        depthWrite: false,
        side: THREE.DoubleSide,
        toneMapped: false,
      })),
      water: this.trackMaterial('MountainWater', new THREE.MeshStandardMaterial({
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
    const landmarkMound = Math.exp(-(((x - 0.6) ** 2) / 92 + ((z - 15.5) ** 2) / 18)) * 0.55;
    const trailCenter = this.getTrailCenterX(z);
    const trailDistance = Math.abs(x - trailCenter);
    const trailBlend = THREE.MathUtils.clamp(1 - trailDistance / 2.65, 0, 1);
    const downhill = THREE.MathUtils.smoothstep(z, -16.5, -8.5);
    const overlookRise = THREE.MathUtils.smoothstep(z, 5.5, 14.8);
    const trailHeight = 0.12
      - downhill * 0.08
      + overlookRise * 0.46
      + Math.sin(z * 0.14) * 0.035;

    return Math.max(0.04, THREE.MathUtils.lerp(rawHill + landmarkMound, trailHeight, trailBlend * 0.86));
  }

  getTrailCenterX(z) {
    const curve = Math.sin((z + 11.5) * 0.18) * 1.45
      + Math.sin((z - 2) * 0.32) * 0.55;
    const entryPull = 1 - THREE.MathUtils.smoothstep(z, -16.8, -11.8);
    const landmarkPull = THREE.MathUtils.smoothstep(z, 7.5, 15.5);

    return THREE.MathUtils.lerp(
      THREE.MathUtils.lerp(curve, 0, entryPull * 0.95),
      0.75,
      landmarkPull * 0.82,
    );
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

  addAtmosphere() {
    const geometry = new THREE.PlaneGeometry(32, 13.5);
    const haze = new THREE.Mesh(geometry, this.yosemiteMaterials.haze);
    haze.name = 'YosemiteDistanceHaze';
    haze.position.set(0, 6.6, 11.2);
    haze.renderOrder = 1;
    haze.castShadow = false;
    haze.receiveShadow = false;
    this.addMesh(haze, { disposeGeometry: true });
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
    this.trailGeometry = new THREE.BoxGeometry(TRAIL_WIDTH, 0.035, TRAIL_SEGMENT_LENGTH);
    this.ownedGeometries.add(this.trailGeometry);

    for (let z = TRAIL_START_Z; z <= TRAIL_END_Z; z += TRAIL_SEGMENT_LENGTH * 0.76) {
      const x = this.getTrailCenterX(z);
      const previousX = this.getTrailCenterX(z - 0.6);
      const nextX = this.getTrailCenterX(z + 0.6);
      const angle = Math.atan2(nextX - previousX, 1.2);
      const trail = new THREE.Mesh(this.trailGeometry, this.yosemiteMaterials.trail);

      trail.name = `YosemiteTrailSegment:${z.toFixed(1)}`;
      trail.position.set(x, this.getTerrainY(x, z, 0.026), z);
      trail.rotation.y = angle;
      trail.castShadow = false;
      trail.receiveShadow = true;
      this.group.add(trail);
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
      name: 'YosemiteFarGraniteRidge',
      size: { x: 31, y: 5.6, z: 2.4 },
      position: { x: 0, y: 2.8, z: 18.0 },
      material: this.yosemiteMaterials.graniteDark,
      castShadow: true,
      receiveShadow: true,
      collider: true,
    });
  }

  addGraniteLandmark() {
    const position = {
      x: 0.8,
      y: this.getTerrainY(0.8, 15.7, 0.04),
      z: 15.6,
    };

    this.graniteLandmark = new GraniteLandmark({
      name: 'YosemiteHalfDomeInspiredLandmark',
      position,
      materials: {
        granite: this.yosemiteMaterials.granite,
        graniteLight: this.yosemiteMaterials.graniteLight,
        graniteShadow: this.yosemiteMaterials.graniteDark,
        graniteCrease: this.yosemiteMaterials.graniteCrease,
      },
    });

    this.group.add(this.graniteLandmark.group);

    for (const [index, box] of this.graniteLandmark.getCollisionBoxes().entries()) {
      this.addCollider(new AabbCollider({
        name: `YosemiteGraniteLandmarkCollider:${index + 1}`,
        center: this.toWorldPosition(box.center),
        size: box.size,
      }));
    }
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

  addForegroundDetails() {
    for (const [index, stone] of SMALL_STONE_LAYOUT.entries()) {
      const geometry = new THREE.SphereGeometry(stone.radius, 10, 6);
      const mesh = new THREE.Mesh(geometry, this.yosemiteMaterials.rock);
      mesh.name = `YosemiteTrailStone:${index + 1}`;
      mesh.position.set(stone.x, this.getTerrainY(stone.x, stone.z, stone.radius * 0.45), stone.z);
      mesh.scale.set(1.4, 0.5, 1);
      mesh.rotation.y = index * 0.73;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.addMesh(mesh, { disposeGeometry: true });
    }
  }

  addScenicOverlook() {
    const center = {
      x: this.getTrailCenterX(OVERLOOK_Z),
      z: OVERLOOK_Z,
    };
    const groundY = this.getTerrainY(center.x, center.z);
    const platformY = groundY + 0.065;

    this.addBox({
      name: 'YosemiteOverlookPlatform',
      size: { x: 4.6, y: 0.12, z: 2.35 },
      position: { x: center.x, y: platformY, z: center.z },
      material: this.yosemiteMaterials.wood,
      castShadow: true,
      receiveShadow: true,
    });

    for (let index = 0; index < 6; index += 1) {
      const plankX = center.x - 1.85 + index * 0.74;
      this.addBox({
        name: `YosemiteOverlookDeckPlank:${index + 1}`,
        size: { x: 0.58, y: 0.035, z: 2.25 },
        position: { x: plankX, y: platformY + 0.078, z: center.z },
        material: this.yosemiteMaterials.wood,
        castShadow: false,
        receiveShadow: true,
      });
    }

    this.addOverlookRailing(center, groundY);
    this.addOverlookPlaque(center, groundY);
  }

  addOverlookRailing(center, groundY) {
    const postPositions = [
      { x: center.x - 2.12, z: center.z - 0.95 },
      { x: center.x - 2.12, z: center.z + 0.95 },
      { x: center.x, z: center.z + 1.03 },
      { x: center.x + 2.12, z: center.z + 0.95 },
      { x: center.x + 2.12, z: center.z - 0.95 },
    ];

    for (const [index, post] of postPositions.entries()) {
      this.addBox({
        name: `YosemiteOverlookRailingPost:${index + 1}`,
        size: { x: 0.14, y: 1.02, z: 0.14 },
        position: { x: post.x, y: groundY + 0.57, z: post.z },
        material: this.yosemiteMaterials.wood,
        castShadow: true,
        receiveShadow: true,
        collider: true,
      });
    }

    for (const rail of [
      { name: 'Back', size: { x: 4.38, y: 0.12, z: 0.14 }, position: { x: center.x, y: groundY + 1.02, z: center.z + 1.03 } },
      { name: 'Left', size: { x: 0.14, y: 0.12, z: 2.05 }, position: { x: center.x - 2.12, y: groundY + 1.02, z: center.z } },
      { name: 'Right', size: { x: 0.14, y: 0.12, z: 2.05 }, position: { x: center.x + 2.12, y: groundY + 1.02, z: center.z } },
    ]) {
      this.addBox({
        name: `YosemiteOverlookRailing:${rail.name}`,
        size: rail.size,
        position: rail.position,
        material: this.yosemiteMaterials.wood,
        castShadow: true,
        receiveShadow: true,
        collider: true,
      });
    }
  }

  addOverlookPlaque(center, groundY) {
    const plaquePosition = {
      x: center.x + 1.25,
      y: groundY + 0.98,
      z: center.z - 0.68,
    };

    this.addBox({
      name: 'YosemiteOverlookPlaquePost',
      size: { x: 0.1, y: 0.68, z: 0.1 },
      position: { x: plaquePosition.x, y: groundY + 0.54, z: plaquePosition.z },
      material: this.yosemiteMaterials.markerPost,
      castShadow: true,
      receiveShadow: true,
    });

    const plaque = this.addBox({
      name: 'YosemiteOverlookPlaqueFace',
      size: { x: 1.26, y: 0.46, z: 0.08 },
      position: plaquePosition,
      material: this.yosemiteMaterials.markerFace,
      castShadow: true,
      receiveShadow: true,
    });

    const label = new RoomLabel({
      text: OVERLOOK_MARKER.title,
      subtitle: 'Read Trail Marker',
      width: 1.3,
      height: 0.46,
      position: { x: plaquePosition.x, y: plaquePosition.y, z: plaquePosition.z - 0.055 },
      rotationY: Math.PI,
    });

    this.addLabel(label);
    this.registerInteractable([plaque, label.mesh], {
      id: `yosemite-marker-${OVERLOOK_MARKER.id}`,
      range: TRAIL_MARKER_RANGE,
      prompt: 'Read Trail Marker',
      onInteract: ({ contentManager }) => this.openTrailMarker(contentManager, OVERLOOK_MARKER),
    });
  }

  addLowVegetation() {
    const shrubs = [
      { x: -6.8, z: -5.2 },
      { x: 5.2, z: -10.8 },
      { x: -2.7, z: 7.8 },
      { x: 3.8, z: 11.5 },
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

  addWildlife() {
    this.birdFlock = new BirdFlock({
      name: 'YosemiteLandmarkBirdFlock',
      center: { x: 0.9, y: 11.2, z: 15.1 },
      count: 7,
      radiusX: 4.2,
      radiusZ: 1.65,
      heightVariation: 0.62,
      speed: 0.18,
      material: this.yosemiteMaterials.bird,
    });
    this.group.add(this.birdFlock.group);
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
        rotationY: Math.PI,
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

  addTrailCompass() {
    const groundY = this.getTerrainY(COMPASS_PLACEMENT.x, COMPASS_PLACEMENT.z);
    const position = {
      x: COMPASS_PLACEMENT.x,
      y: groundY + 0.07,
      z: COMPASS_PLACEMENT.z,
    };
    const targets = [
      this.addCompassDisc('YosemiteTrailCompassBase', {
        radius: 0.42,
        height: 0.075,
        position,
        material: this.yosemiteMaterials.compassBrass,
      }),
      this.addCompassDisc('YosemiteTrailCompassFace', {
        radius: 0.32,
        height: 0.024,
        position: { x: position.x, y: position.y + 0.052, z: position.z },
        material: this.yosemiteMaterials.compassFace,
      }),
      this.addCompassNeedle('YosemiteTrailCompassNeedleNorth', {
        size: { x: 0.075, y: 0.024, z: 0.34 },
        position: { x: position.x, y: position.y + 0.082, z: position.z - 0.11 },
        material: this.yosemiteMaterials.compassNeedle,
      }),
      this.addCompassNeedle('YosemiteTrailCompassNeedleSouth', {
        size: { x: 0.075, y: 0.022, z: 0.24 },
        position: { x: position.x, y: position.y + 0.081, z: position.z + 0.12 },
        material: this.yosemiteMaterials.compassTail,
      }),
    ];

    this.compassMeshes = targets;
    this.compassInteractable = this.registerInteractable(targets, {
      id: 'yosemite-trail-compass',
      range: COMPASS_PICKUP_RANGE,
      prompt: 'Pick Up Compass',
      onInteract: ({ roomManager }) => this.pickUpCompass(roomManager),
    });
  }

  addCompassDisc(name, { radius, height, position, material }) {
    const geometry = new THREE.CylinderGeometry(radius, radius, height, 36);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.position.set(position.x, position.y, position.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return this.addMesh(mesh, { disposeGeometry: true });
  }

  addCompassNeedle(name, { size, position, material }) {
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.position.set(position.x, position.y, position.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return this.addMesh(mesh, { disposeGeometry: true });
  }

  pickUpCompass(roomManager) {
    if (!roomManager || roomManager.hasTrailCompass()) {
      this.setCompassVisible(false);
      return;
    }

    roomManager.collectTrailCompass();
    this.setCompassVisible(false);
    roomManager.showTemporaryInfo?.({
      title: 'Compass picked up',
      body: 'The compass will help you pick up the trail inside The Forgotten Level.',
      durationMs: 3200,
    });
  }

  setCompassVisible(isVisible) {
    for (const mesh of this.compassMeshes) {
      mesh.visible = isVisible;
    }

    this.compassInteractable?.setEnabled(isVisible);
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
    this.overlookWindAudio = this.createRoomAudioSource(audioManager, audioConfig.overlookWind);
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
    this.birdFlock?.update(elapsedTime);
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
    this.applyAtmosphere();
  }

  deactivate() {
    super.deactivate();
    this.terrain?.setActive(false);
    this.clearAtmosphere();
  }

  applyAtmosphere() {
    if (this.previousFog !== undefined) {
      return;
    }

    this.previousFog = this.scene.fog;
    this.previousBackground = this.scene.background;
    this.scene.fog = new THREE.Fog(
      this.config.atmosphere.fogColor,
      this.config.atmosphere.fogNear,
      this.config.atmosphere.fogFar,
    );
    this.scene.background = new THREE.Color(this.config.atmosphere.backgroundColor);
  }

  clearAtmosphere() {
    if (this.previousFog === undefined) {
      return;
    }

    this.scene.fog = this.previousFog;
    this.scene.background = this.previousBackground;
    this.previousFog = undefined;
    this.previousBackground = undefined;
  }

  dispose() {
    this.clearAtmosphere();
    this.terrain?.dispose();
    this.sky?.dispose();
    this.graniteLandmark?.dispose();
    this.birdFlock?.dispose();
    this.streamStrips.length = 0;
    super.dispose();
  }
}
