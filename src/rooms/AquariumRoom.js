import * as THREE from 'three';
import { AQUARIUM_ROOM_CONFIG, AUDIO_CONFIG } from '../config/constants.js';
import { Fish } from './aquarium/Fish.js';
import { FurnitureBuilder } from './FurnitureBuilder.js';
import { RectangularRoom } from './RectangularRoom.js';
import { RoomLabel } from './RoomLabel.js';

const SHARED_WALL_SURFACE_OFFSET = 0.018;
const SHARED_WALL_SURFACE_DEPTH = 0.035;
const EXHIBIT_READ_RANGE = 2.35;
const EXHIBIT_INFO_HIDE_DISTANCE = 2.75;

const TANK = Object.freeze({
  glass: Object.freeze({
    size: Object.freeze({ x: 12.6, y: 3.35, z: 0.06 }),
    position: Object.freeze({ x: 0, y: 2.12, z: -5.22 }),
  }),
  water: Object.freeze({
    size: Object.freeze({ x: 11.9, y: 2.95, z: 1.55 }),
    position: Object.freeze({ x: 0, y: 2.15, z: -6.12 }),
  }),
  enclosure: Object.freeze({
    sideSize: Object.freeze({ x: 0.32, y: 3.42, z: 1.86 }),
    backSize: Object.freeze({ x: 13.15, y: 3.42, z: 0.32 }),
    centerY: 2.12,
    centerZ: -6.08,
    backZ: -6.94,
    sideX: 6.6,
  }),
  bounds: Object.freeze({
    min: Object.freeze({ x: -5.45, y: 0.95, z: -6.82 }),
    max: Object.freeze({ x: 5.45, y: 3.36, z: -5.54 }),
  }),
});

const EXHIBITS = Object.freeze([
  Object.freeze({
    id: 'reef-ecosystem',
    title: 'Reef Ecosystem',
    subtitle: 'Read Exhibit',
    position: Object.freeze({ x: -5.7, y: 1.22, z: -3.85 }),
    body: 'Placeholder exhibit copy: this panel will describe how reef structures protect young marine life and support biodiversity.',
  }),
  Object.freeze({
    id: 'pelagic-zone',
    title: 'Pelagic Zone',
    subtitle: 'Read Exhibit',
    position: Object.freeze({ x: 0, y: 1.22, z: -3.75 }),
    body: 'Placeholder exhibit copy: this panel will explain open-water swimming patterns, schooling behavior, and predator avoidance.',
  }),
  Object.freeze({
    id: 'water-systems',
    title: 'Water Systems',
    subtitle: 'Read Exhibit',
    position: Object.freeze({ x: 5.7, y: 1.22, z: -3.85 }),
    body: 'Placeholder exhibit copy: this panel will cover filtration, water movement, oxygenation, and exhibit life-support systems.',
  }),
]);

const FISH_SPECS = Object.freeze([
  Object.freeze({ color: 0xffb04f, finColor: 0xffe0a3, speed: 0.72, position: Object.freeze({ x: -4.1, y: 2.35, z: -6.1 }), scale: Object.freeze({ length: 0.34, height: 0.14, width: 0.13 }) }),
  Object.freeze({ color: 0x5ed4ff, finColor: 0xb9f2ff, speed: 0.6, position: Object.freeze({ x: -1.8, y: 2.75, z: -5.85 }), scale: Object.freeze({ length: 0.28, height: 0.12, width: 0.11 }) }),
  Object.freeze({ color: 0xf76d7a, finColor: 0xffb3ba, speed: 0.68, position: Object.freeze({ x: 2.2, y: 1.75, z: -6.3 }), scale: Object.freeze({ length: 0.32, height: 0.13, width: 0.12 }) }),
  Object.freeze({ color: 0xf7dc5c, finColor: 0xfff2a1, speed: 0.55, position: Object.freeze({ x: 4.3, y: 2.45, z: -6.0 }), scale: Object.freeze({ length: 0.25, height: 0.1, width: 0.1 }) }),
  Object.freeze({ color: 0x93e083, finColor: 0xd2ffbd, speed: 0.5, position: Object.freeze({ x: 0.9, y: 3.05, z: -6.35 }), scale: Object.freeze({ length: 0.24, height: 0.1, width: 0.1 }) }),
  Object.freeze({ color: 0xa57dff, finColor: 0xd6c5ff, speed: 0.64, position: Object.freeze({ x: -3.0, y: 1.45, z: -5.78 }), scale: Object.freeze({ length: 0.3, height: 0.12, width: 0.11 }) }),
]);

export class AquariumRoom extends RectangularRoom {
  constructor(scene, collisionSystem, config = AQUARIUM_ROOM_CONFIG) {
    super(scene, collisionSystem, config);
  }

  build() {
    super.build();

    this.furniture = new FurnitureBuilder(this);
    this.fish = [];
    this.bubbles = [];
    this.caustics = [];
    this.activeExhibit = null;
    this.infoPanelHud = null;
    this.exhibitWorldPosition = new THREE.Vector3();
    this.createAquariumMaterials();
    this.createSharedGeometries();
    this.addSharedLobbyWallInterior();
    this.addArchitecturalDetails();
    this.addAquariumTank();
    this.addBenches();
    this.addDecorativePlants();
    this.addExhibitPlaques();
    this.addAquariumLighting();
  }

  createAquariumMaterials() {
    this.aquariumMaterials = Object.freeze({
      tankFrame: this.createMaterial('TankFrame', {
        color: 0x172c38,
        roughness: 0.36,
        metalness: 0.22,
      }),
      bench: this.createMaterial('GalleryBench', {
        color: 0x273b47,
        roughness: 0.62,
        metalness: 0.08,
      }),
      benchCushion: this.createMaterial('GalleryBenchCushion', {
        color: 0x3e6674,
        roughness: 0.86,
        metalness: 0,
      }),
      plaqueStand: this.createMaterial('PlaqueStand', {
        color: 0x1d313c,
        roughness: 0.42,
        metalness: 0.2,
      }),
      column: this.createMaterial('AquariumColumn', {
        color: 0x9fb5bf,
        roughness: 0.66,
        metalness: 0.05,
      }),
      rock: this.createMaterial('AquariumRock', {
        color: 0x485b62,
        roughness: 0.95,
        metalness: 0,
      }),
      plantDark: this.createMaterial('AquaticPlantDark', {
        color: 0x1d6b5b,
        roughness: 0.82,
        metalness: 0,
        emissive: 0x06352f,
        emissiveIntensity: 0.08,
      }),
      plantLight: this.createMaterial('AquaticPlantLight', {
        color: 0x58b779,
        roughness: 0.78,
        metalness: 0,
        emissive: 0x0f4f2c,
        emissiveIntensity: 0.08,
      }),
      floorAccent: this.createMaterial('FloorBlueAccent', {
        color: 0x7ec8df,
        roughness: 0.28,
        metalness: 0.05,
        emissive: 0x1d6a8c,
        emissiveIntensity: 0.16,
      }),
      fishEye: this.createMaterial('FishEye', {
        color: 0x111719,
        roughness: 0.32,
        metalness: 0,
      }),
    });

    this.glassMaterial = this.trackMaterial('AquariumGlass', new THREE.MeshStandardMaterial({
      color: 0xd4fbff,
      roughness: 0.04,
      metalness: 0,
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      emissive: 0x4aa9c7,
      emissiveIntensity: 0.04,
    }));

    this.waterMaterial = this.trackMaterial('AquariumWaterVolume', new THREE.MeshStandardMaterial({
      color: 0x1b8fc1,
      roughness: 0.18,
      metalness: 0,
      transparent: true,
      opacity: 0.34,
      depthWrite: false,
      emissive: 0x0b5272,
      emissiveIntensity: 0.18,
    }));

    this.waterSurfaceMaterial = this.trackMaterial('AquariumWaterSurface', new THREE.MeshBasicMaterial({
      color: 0x91ebff,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    }));

    this.bubbleMaterial = this.trackMaterial('AquariumBubbles', new THREE.MeshBasicMaterial({
      color: 0xd9fbff,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
      toneMapped: false,
    }));

    this.reflectionMaterial = this.trackMaterial('AquariumGlassReflection', new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
      toneMapped: false,
    }));
  }

  createSharedGeometries() {
    this.fishGeometries = Object.freeze({
      body: new THREE.SphereGeometry(1, 20, 12),
      tail: new THREE.ConeGeometry(1, 1, 3),
      dorsalFin: new THREE.ConeGeometry(1, 1, 3),
      eye: new THREE.SphereGeometry(1, 8, 6),
    });
    this.bubbleGeometry = new THREE.SphereGeometry(1, 8, 6);

    for (const geometry of Object.values(this.fishGeometries)) {
      this.ownedGeometries.add(geometry);
    }

    this.ownedGeometries.add(this.bubbleGeometry);
  }

  trackMaterial(name, material) {
    material.name = `${this.name}:${name}`;
    this.materials.set(name, material);

    return material;
  }

  addSharedLobbyWallInterior() {
    const { width, length, height } = this.config.dimensions;
    const { height: openingHeight, width: openingWidth } = this.config.openings;
    const halfLength = length / 2;
    const halfOpening = openingWidth / 2;
    const panelX = width / 2 - SHARED_WALL_SURFACE_OFFSET;
    const segmentLength = halfLength - halfOpening;

    for (const z of [-(halfOpening + segmentLength / 2), halfOpening + segmentLength / 2]) {
      this.furniture.addBox({
        name: `AquariumSharedWallInteriorPanel:${z}`,
        size: { x: SHARED_WALL_SURFACE_DEPTH, y: height, z: segmentLength },
        position: { x: panelX, y: height / 2, z },
        material: this.wallMaterial,
        castShadow: false,
        receiveShadow: true,
      });

      this.furniture.addBox({
        name: `AquariumSharedWallBaseboard:${z}`,
        size: { x: this.config.baseboard.depth, y: this.config.baseboard.height, z: segmentLength },
        position: {
          x: width / 2 - this.config.baseboard.depth / 2,
          y: this.config.baseboard.height / 2,
          z,
        },
        material: this.trimMaterial,
        castShadow: true,
        receiveShadow: true,
      });
    }

    this.furniture.addBox({
      name: 'AquariumSharedWallInteriorHeader',
      size: { x: SHARED_WALL_SURFACE_DEPTH, y: height - openingHeight, z: openingWidth },
      position: {
        x: panelX,
        y: openingHeight + (height - openingHeight) / 2,
        z: 0,
      },
      material: this.wallMaterial,
      castShadow: false,
      receiveShadow: true,
    });
  }

  addArchitecturalDetails() {
    this.furniture.addBox({
      name: 'AquariumFloorAccentNorth',
      size: { x: 13.4, y: 0.018, z: 0.08 },
      position: { x: 0, y: 0.012, z: -3.75 },
      material: this.aquariumMaterials.floorAccent,
      castShadow: false,
      receiveShadow: true,
    });

    for (const x of [-6.75, 6.75]) {
      this.furniture.addBox({
        name: `AquariumArchitecturalColumn:${x}`,
        size: { x: 0.46, y: 3.9, z: 0.56 },
        position: { x, y: 1.95, z: -4.95 },
        material: this.aquariumMaterials.column,
        castShadow: true,
        receiveShadow: true,
        collider: true,
      });
    }
  }

  addAquariumTank() {
    this.addTankFrame();
    this.addWaterVolume();
    this.addRockyBottom();
    this.addAquaticPlants();
    this.addBubbles();
    this.addFish();
    this.addGlassReflections();
  }

  addTankFrame() {
    const { enclosure, glass } = TANK;
    const frameMaterial = this.aquariumMaterials.tankFrame;

    this.furniture.addBox({
      name: 'AquariumViewingGlass',
      size: glass.size,
      position: glass.position,
      material: this.glassMaterial,
      castShadow: false,
      receiveShadow: false,
      collider: true,
    });

    for (const y of [0.38, 3.86]) {
      this.furniture.addBox({
        name: `AquariumTankFrameHorizontal:${y}`,
        size: { x: 13.15, y: 0.24, z: 0.34 },
        position: { x: 0, y, z: -5.18 },
        material: frameMaterial,
        castShadow: true,
        receiveShadow: true,
        collider: y < 1,
      });
    }

    for (const x of [-6.6, 6.6]) {
      this.furniture.addBox({
        name: `AquariumTankFrameVertical:${x}`,
        size: { x: 0.3, y: 3.62, z: 0.34 },
        position: { x, y: 2.12, z: -5.18 },
        material: frameMaterial,
        castShadow: true,
        receiveShadow: true,
        collider: true,
      });
    }

    for (const x of [-enclosure.sideX, enclosure.sideX]) {
      this.furniture.addBox({
        name: `AquariumTankSideEnclosure:${x}`,
        size: enclosure.sideSize,
        position: { x, y: enclosure.centerY, z: enclosure.centerZ },
        material: frameMaterial,
        castShadow: true,
        receiveShadow: true,
        collider: true,
      });
    }

    this.furniture.addBox({
      name: 'AquariumTankBackEnclosure',
      size: enclosure.backSize,
      position: { x: 0, y: enclosure.centerY, z: enclosure.backZ },
      material: frameMaterial,
      castShadow: true,
      receiveShadow: true,
      collider: true,
    });
  }

  addWaterVolume() {
    this.waterMesh = this.furniture.addBox({
      name: 'AquariumWaterVolume',
      size: TANK.water.size,
      position: TANK.water.position,
      material: this.waterMaterial,
      castShadow: false,
      receiveShadow: false,
    });
    this.waterMesh.renderOrder = 1;

    this.waterSurface = this.furniture.addBox({
      name: 'AquariumWaterSurface',
      size: { x: TANK.water.size.x, y: 0.018, z: TANK.water.size.z },
      position: {
        x: TANK.water.position.x,
        y: TANK.water.position.y + TANK.water.size.y / 2 - 0.06,
        z: TANK.water.position.z,
      },
      material: this.waterSurfaceMaterial,
      castShadow: false,
      receiveShadow: false,
    });
    this.waterSurface.renderOrder = 2;
  }

  addRockyBottom() {
    const rocks = [
      { x: -4.8, z: -6.55, radius: 0.34, scale: { x: 1.7, y: 0.45, z: 1.1 } },
      { x: -3.2, z: -5.85, radius: 0.28, scale: { x: 1.3, y: 0.5, z: 1.2 } },
      { x: -0.7, z: -6.45, radius: 0.42, scale: { x: 1.8, y: 0.42, z: 1.1 } },
      { x: 1.5, z: -5.86, radius: 0.3, scale: { x: 1.4, y: 0.52, z: 1.1 } },
      { x: 3.6, z: -6.38, radius: 0.38, scale: { x: 1.6, y: 0.46, z: 1.25 } },
      { x: 4.9, z: -5.75, radius: 0.26, scale: { x: 1.2, y: 0.5, z: 1.1 } },
    ];

    for (const rock of rocks) {
      this.furniture.addSphere({
        name: `AquariumRock:${rock.x}:${rock.z}`,
        radius: rock.radius,
        scale: rock.scale,
        position: { x: rock.x, y: 0.68, z: rock.z },
        material: this.aquariumMaterials.rock,
        widthSegments: 16,
        heightSegments: 10,
        castShadow: true,
        receiveShadow: true,
      });
    }
  }

  addAquaticPlants() {
    for (const plant of [
      { x: -4.6, z: -5.92, height: 0.82 },
      { x: -2.3, z: -6.48, height: 0.64 },
      { x: 0.35, z: -5.78, height: 0.76 },
      { x: 2.75, z: -6.44, height: 0.9 },
      { x: 4.45, z: -6.0, height: 0.7 },
    ]) {
      this.addAquaticPlant(plant);
    }
  }

  addAquaticPlant({ x, z, height }) {
    const material = height > 0.75
      ? this.aquariumMaterials.plantLight
      : this.aquariumMaterials.plantDark;

    for (const [index, offset] of [-0.12, 0, 0.12].entries()) {
      this.furniture.addBox({
        name: `AquaticPlantBlade:${x}:${z}:${index}`,
        size: { x: 0.045, y: height * (0.78 + index * 0.08), z: 0.035 },
        position: {
          x: x + offset,
          y: 0.78 + height / 2,
          z: z + Math.sin(index) * 0.06,
        },
        material,
        castShadow: false,
        receiveShadow: false,
      });
    }
  }

  addBubbles() {
    const columns = [-4.7, -1.6, 2.1, 4.8];

    for (const [columnIndex, x] of columns.entries()) {
      for (let index = 0; index < 8; index += 1) {
        const bubble = new THREE.Mesh(this.bubbleGeometry, this.bubbleMaterial);
        const size = 0.025 + Math.random() * 0.035;
        bubble.name = `AquariumBubble:${columnIndex}:${index}`;
        bubble.scale.setScalar(size);
        bubble.position.set(
          x + (Math.random() * 0.34 - 0.17),
          0.96 + Math.random() * 2.18,
          -6.08 + (Math.random() * 0.44 - 0.22),
        );
        bubble.renderOrder = 3;
        this.group.add(bubble);
        this.bubbles.push({
          mesh: bubble,
          baseX: bubble.position.x,
          speed: 0.28 + Math.random() * 0.22,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }
  }

  addFish() {
    for (const [index, spec] of FISH_SPECS.entries()) {
      const fish = new Fish({
        id: `aquarium-${index + 1}`,
        bounds: TANK.bounds,
        position: spec.position,
        speed: spec.speed,
        scale: spec.scale,
        bodyMaterial: this.createFishMaterial(`FishBody:${index}`, spec.color),
        finMaterial: this.createFishMaterial(`FishFin:${index}`, spec.finColor),
        eyeMaterial: this.aquariumMaterials.fishEye,
        bodyGeometry: this.fishGeometries.body,
        tailGeometry: this.fishGeometries.tail,
        dorsalFinGeometry: this.fishGeometries.dorsalFin,
        eyeGeometry: this.fishGeometries.eye,
      });

      this.fish.push(fish);
      this.group.add(fish.group);
    }
  }

  createFishMaterial(name, color) {
    return this.trackMaterial(name, new THREE.MeshStandardMaterial({
      color,
      roughness: 0.46,
      metalness: 0,
      emissive: color,
      emissiveIntensity: 0.05,
    }));
  }

  addGlassReflections() {
    for (const [index, x] of [-3.8, 0.2, 3.9].entries()) {
      const geometry = new THREE.PlaneGeometry(0.12, 2.5);
      const reflection = new THREE.Mesh(geometry, this.reflectionMaterial);
      reflection.name = `AquariumGlassReflection:${index + 1}`;
      reflection.position.set(x, 2.2, -5.175);
      reflection.rotation.z = -0.28;
      reflection.renderOrder = 4;
      this.addMesh(reflection, { disposeGeometry: true });
    }
  }

  addBenches() {
    for (const [index, z] of [1.5, 3.85].entries()) {
      this.furniture.addBox({
        name: `AquariumBenchSeat:${index + 1}`,
        size: { x: 4.85, y: 0.18, z: 0.72 },
        position: { x: index === 0 ? -2.7 : 2.7, y: 0.52, z },
        material: this.aquariumMaterials.benchCushion,
        castShadow: true,
        receiveShadow: true,
        collider: true,
      });

      this.furniture.addBox({
        name: `AquariumBenchBase:${index + 1}`,
        size: { x: 4.55, y: 0.22, z: 0.46 },
        position: { x: index === 0 ? -2.7 : 2.7, y: 0.26, z },
        material: this.aquariumMaterials.bench,
        castShadow: true,
        receiveShadow: true,
      });
    }
  }

  addDecorativePlants() {
    for (const plant of [
      { x: -7.15, z: 5.65 },
      { x: 7.1, z: 5.35 },
      { x: -7.1, z: -1.35 },
    ]) {
      this.furniture.addBox({
        name: `AquariumPlanter:${plant.x}:${plant.z}`,
        size: { x: 0.74, y: 0.48, z: 0.74 },
        position: { x: plant.x, y: 0.24, z: plant.z },
        material: this.aquariumMaterials.column,
        castShadow: true,
        receiveShadow: true,
        collider: true,
      });

      for (const [index, offset] of [-0.18, 0, 0.18].entries()) {
        this.furniture.addBox({
          name: `AquariumDecorativePlantLeaf:${plant.x}:${plant.z}:${index}`,
          size: { x: 0.08, y: 0.9 + index * 0.12, z: 0.08 },
          position: { x: plant.x + offset, y: 0.9, z: plant.z - offset },
          material: index === 1 ? this.aquariumMaterials.plantLight : this.aquariumMaterials.plantDark,
          castShadow: true,
          receiveShadow: false,
        });
      }
    }
  }

  addExhibitPlaques() {
    for (const exhibit of EXHIBITS) {
      this.furniture.addBox({
        name: `ExhibitPlaqueBase:${exhibit.id}`,
        size: { x: 1.25, y: 0.08, z: 0.42 },
        position: { x: exhibit.position.x, y: 0.56, z: exhibit.position.z + 0.02 },
        material: this.aquariumMaterials.plaqueStand,
        castShadow: true,
        receiveShadow: true,
        collider: true,
      });

      this.furniture.addBox({
        name: `ExhibitPlaquePost:${exhibit.id}`,
        size: { x: 0.1, y: 0.68, z: 0.1 },
        position: { x: exhibit.position.x, y: 0.86, z: exhibit.position.z },
        material: this.aquariumMaterials.plaqueStand,
        castShadow: true,
        receiveShadow: true,
      });

      const label = new RoomLabel({
        text: exhibit.title,
        subtitle: exhibit.subtitle,
        width: 1.28,
        height: 0.46,
        position: exhibit.position,
        rotationY: 0,
      });

      this.addLabel(label);
      this.registerInteractable(label.mesh, {
        id: `aquarium-exhibit-${exhibit.id}`,
        range: EXHIBIT_READ_RANGE,
        prompt: 'Read Exhibit',
        onInteract: ({ roomManager }) => this.showExhibitInfo(exhibit, roomManager),
      });
    }
  }

  showExhibitInfo(exhibit, roomManager) {
    this.activeExhibit = exhibit;
    this.infoPanelHud = roomManager.hud;
    roomManager.hud.showInfoPanel({
      title: exhibit.title,
      body: exhibit.body,
    });
  }

  addAquariumLighting() {
    for (const [index, position] of [
      { x: -4.5, y: 3.35, z: -5.15 },
      { x: 0, y: 3.45, z: -5.1 },
      { x: 4.5, y: 3.35, z: -5.15 },
    ].entries()) {
      const light = new THREE.PointLight(0x76d9ff, 16, 7.5, 2);
      light.name = `AquariumTankAccentLight:${index + 1}`;
      light.position.set(position.x, position.y, position.z);
      light.castShadow = false;
      this.addLight(light);
    }

    this.addCausticBands();
  }

  addCausticBands() {
    for (let index = 0; index < 7; index += 1) {
      const material = this.trackMaterial(`CausticBand:${index}`, new THREE.MeshBasicMaterial({
        color: 0xbdefff,
        transparent: true,
        opacity: 0.12,
        depthWrite: false,
        toneMapped: false,
      }));

      const mesh = this.furniture.addBox({
        name: `AquariumCausticBand:${index + 1}`,
        size: { x: 2.2 + (index % 3) * 0.45, y: 0.012, z: 0.045 },
        position: { x: -5.5 + index * 1.85, y: 0.028, z: -2.35 + (index % 2) * 0.62 },
        material,
        castShadow: false,
        receiveShadow: false,
      });

      this.caustics.push({
        mesh,
        material,
        baseX: mesh.position.x,
        phase: index * 0.73,
      });
    }
  }

  configureAudio(audioManager) {
    this.audioManager = audioManager;

    if (!audioManager || this.roomAudioConfigured) {
      return;
    }

    const audioConfig = AUDIO_CONFIG.aquarium;
    this.roomAmbienceAudio = this.createRoomAudioSource(audioManager, audioConfig.roomAmbience);
    this.tankBubblesAudio = this.createRoomAudioSource(audioManager, audioConfig.tankBubbles);
    this.waterPumpAudio = this.createRoomAudioSource(audioManager, audioConfig.waterPump);
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
    this.updateExhibitInfoPanel(player);
    this.updateFish(deltaTime, elapsedTime);
    this.updateBubbles(deltaTime, elapsedTime);
    this.updateWater(elapsedTime);
    this.updateCaustics(elapsedTime);
  }

  updateExhibitInfoPanel(player) {
    if (!this.activeExhibit || !this.infoPanelHud) {
      return;
    }

    const position = this.toWorldPosition(this.activeExhibit.position);
    this.exhibitWorldPosition.set(position.x, player.position.y, position.z);

    if (this.exhibitWorldPosition.distanceTo(player.position) > EXHIBIT_INFO_HIDE_DISTANCE) {
      this.hideExhibitInfo();
    }
  }

  hideExhibitInfo() {
    this.infoPanelHud?.hideInfoPanel();
    this.activeExhibit = null;
  }

  updateFish(deltaTime, elapsedTime) {
    for (const fish of this.fish) {
      fish.update(deltaTime, elapsedTime, this.fish);
    }
  }

  updateBubbles(deltaTime, elapsedTime) {
    for (const bubble of this.bubbles) {
      bubble.mesh.position.y += bubble.speed * deltaTime;

      if (bubble.mesh.position.y > TANK.bounds.max.y) {
        bubble.mesh.position.y = TANK.bounds.min.y;
      }

      bubble.mesh.position.x = bubble.baseX + Math.sin(elapsedTime * 1.4 + bubble.phase) * 0.035;
    }
  }

  updateWater(elapsedTime) {
    const wave = Math.sin(elapsedTime * 0.85) * 0.018;
    this.waterMaterial.opacity = 0.33 + Math.sin(elapsedTime * 0.48) * 0.025;
    this.waterSurfaceMaterial.opacity = 0.16 + Math.sin(elapsedTime * 0.62) * 0.035;
    this.waterSurface.position.y = TANK.water.position.y + TANK.water.size.y / 2 - 0.06 + wave;
    this.glassMaterial.emissiveIntensity = 0.035 + Math.sin(elapsedTime * 0.7) * 0.012;
  }

  updateCaustics(elapsedTime) {
    for (const caustic of this.caustics) {
      caustic.mesh.position.x = caustic.baseX + Math.sin(elapsedTime * 0.35 + caustic.phase) * 0.22;
      caustic.material.opacity = 0.08 + Math.sin(elapsedTime * 0.9 + caustic.phase) * 0.04;
    }
  }

  deactivate() {
    super.deactivate();
    this.hideExhibitInfo();
  }

  dispose() {
    this.hideExhibitInfo();

    for (const fish of this.fish) {
      fish.dispose();
    }

    this.fish.length = 0;
    this.bubbles.length = 0;
    this.caustics.length = 0;
    super.dispose();
  }
}
