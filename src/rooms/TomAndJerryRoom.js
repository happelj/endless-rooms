import * as THREE from 'three';
import { AUDIO_CONFIG, TOM_AND_JERRY_ROOM_CONFIG, TV_CONFIG } from '../config/constants.js';
import { VideoScreen } from '../media/VideoScreen.js';
import { FurnitureBuilder } from './FurnitureBuilder.js';
import { RectangularRoom } from './RectangularRoom.js';

const LAYOUT = Object.freeze({
  couch: Object.freeze({ x: -2.75, z: 0 }),
  coffeeTable: Object.freeze({ x: 1.15, z: 0 }),
  sideTable: Object.freeze({ x: -2.8, z: -3.05 }),
  beanBag: Object.freeze({ x: -4.65, z: 4.55 }),
  entertainmentCenter: Object.freeze({ x: 6.48, z: 0 }),
  television: Object.freeze({ x: 6.28, z: 0 }),
  floorLamp: Object.freeze({ x: -3.8, z: -3.75 }),
});

const SHARED_WALL_SURFACE_OFFSET = 0.018;
const SHARED_WALL_SURFACE_DEPTH = 0.035;

const WALL_ART = Object.freeze([
  Object.freeze({
    name: 'WallArt:North',
    frameSize: Object.freeze({ x: 1.45, y: 0.85, z: 0.045 }),
    artSize: Object.freeze({ x: 1.08, y: 0.58, z: 0.055 }),
    position: Object.freeze({ x: -1.6, y: 2.4, z: -6.88 }),
    artColor: 0x6e8fa5,
  }),
  Object.freeze({
    name: 'WallArt:South',
    frameSize: Object.freeze({ x: 1.45, y: 0.85, z: 0.045 }),
    artSize: Object.freeze({ x: 1.08, y: 0.58, z: 0.055 }),
    position: Object.freeze({ x: 2.2, y: 2.35, z: 6.88 }),
    artColor: 0xa56e54,
  }),
]);

export class TomAndJerryRoom extends RectangularRoom {
  constructor(scene, collisionSystem, config = TOM_AND_JERRY_ROOM_CONFIG) {
    super(scene, collisionSystem, config);
  }

  build() {
    super.build();

    this.furniture = new FurnitureBuilder(this);
    this.crtEffectTime = 0;
    this.createFurnitureMaterials();
    this.createScreenEffectMaterials();
    this.addCrownMolding();
    this.addSharedLobbyWallInterior();
    this.addAreaRug();
    this.addEntertainmentCenter();
    this.addCouch();
    this.addTables();
    this.addBeanBagChair();
    this.addFloorLamp();
    this.addWallDecorations();
  }

  createFurnitureMaterials() {
    this.furnitureMaterials = Object.freeze({
      couch: this.createMaterial('CouchFabric', {
        color: 0x8b3f36,
        roughness: 0.95,
        metalness: 0,
      }),
      couchAccent: this.createMaterial('CouchAccentFabric', {
        color: 0xd8b16a,
        roughness: 0.92,
        metalness: 0,
      }),
      rug: this.createMaterial('CoffeeTableRug', {
        color: 0x405d5b,
        roughness: 0.97,
        metalness: 0,
      }),
      wood: this.createMaterial('WarmWalnut', {
        color: 0x5b3927,
        roughness: 0.74,
        metalness: 0,
      }),
      darkWood: this.createMaterial('DarkWalnut', {
        color: 0x2e2118,
        roughness: 0.78,
        metalness: 0,
      }),
      brass: this.createMaterial('AgedBrass', {
        color: 0xc1934f,
        roughness: 0.48,
        metalness: 0.35,
      }),
      controlMark: this.createMaterial('CrtControlMark', {
        color: 0xf1e2bf,
        roughness: 0.52,
        metalness: 0,
        emissive: 0x3a2a16,
        emissiveIntensity: 0.08,
      }),
      lampShade: this.createMaterial('LampShadeFabric', {
        color: 0xf2d49a,
        roughness: 0.86,
        metalness: 0,
        emissive: 0xffc879,
        emissiveIntensity: 0.12,
      }),
      screen: this.createMaterial('CrtPlaceholderScreen', {
        color: 0x172326,
        roughness: 0.58,
        metalness: 0,
        emissive: 0x1d3a3f,
        emissiveIntensity: 0.16,
      }),
      powerOff: this.createMaterial('CrtPowerOff', {
        color: 0x4f1614,
        roughness: 0.64,
        metalness: 0.15,
      }),
      powerOn: this.createMaterial('CrtPowerOn', {
        color: 0x2ed06e,
        roughness: 0.42,
        metalness: 0.1,
        emissive: 0x1ce968,
        emissiveIntensity: 0.7,
      }),
      bezel: this.createMaterial('CrtBezel', {
        color: 0x11100e,
        roughness: 0.82,
        metalness: 0,
      }),
      beanBag: this.createMaterial('BeanBagFabric', {
        color: 0xb27d42,
        roughness: 0.98,
        metalness: 0,
      }),
      frame: this.createMaterial('PictureFrame', {
        color: 0x3a251a,
        roughness: 0.68,
        metalness: 0,
      }),
      artBlue: this.createMaterial('GenericArtworkBlue', {
        color: 0x6e8fa5,
        roughness: 0.9,
        metalness: 0,
      }),
      artTerracotta: this.createMaterial('GenericArtworkTerracotta', {
        color: 0xa56e54,
        roughness: 0.9,
        metalness: 0,
      }),
    });
  }

  createScreenEffectMaterials() {
    this.screenGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0x9fdfff,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      toneMapped: false,
    });
    this.screenGlowMaterial.name = `${this.name}:CrtScreenGlow`;
    this.materials.set('CrtScreenGlow', this.screenGlowMaterial);

    this.scanlineTexture = this.createScanlineTexture();
    this.scanlineMaterial = new THREE.MeshBasicMaterial({
      map: this.scanlineTexture,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      toneMapped: false,
    });
    this.scanlineMaterial.name = `${this.name}:CrtScanlines`;
    this.materials.set('CrtScanlines', this.scanlineMaterial);
  }

  createScanlineTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 8;

    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'rgba(0, 0, 0, 0.28)';
    context.fillRect(0, 0, canvas.width, 1);
    context.fillStyle = 'rgba(255, 255, 255, 0.08)';
    context.fillRect(0, 4, canvas.width, 1);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 58);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.LinearFilter;

    return texture;
  }

  addCrownMolding() {
    const { height, depth } = this.config.crownMolding;
    const y = this.config.dimensions.height - height / 2;

    for (const wallName of this.getEnabledWalls()) {
      for (const segment of this.getSolidSegments(wallName)) {
        this.furniture.addBox({
          name: `${this.name}CrownMolding:${wallName}`,
          size: this.getTrimSegmentSize(wallName, segment.end - segment.start, height, depth),
          position: this.getTrimSegmentPosition(wallName, (segment.start + segment.end) / 2, y, depth),
          material: this.trimMaterial,
          castShadow: true,
          receiveShadow: true,
        });
      }
    }
  }

  addSharedLobbyWallInterior() {
    const { width, length, height } = this.config.dimensions;
    const { height: openingHeight, width: openingWidth } = this.config.openings;
    const halfLength = length / 2;
    const halfOpening = openingWidth / 2;
    const panelX = -width / 2 + SHARED_WALL_SURFACE_OFFSET;
    const segmentLength = halfLength - halfOpening;

    for (const z of [-(halfOpening + segmentLength / 2), halfOpening + segmentLength / 2]) {
      this.furniture.addBox({
        name: `TomAndJerrySharedWallInteriorPanel:${z}`,
        size: { x: SHARED_WALL_SURFACE_DEPTH, y: height, z: segmentLength },
        position: { x: panelX, y: height / 2, z },
        material: this.wallMaterial,
        castShadow: false,
        receiveShadow: true,
      });

      this.furniture.addBox({
        name: `TomAndJerrySharedWallBaseboard:${z}`,
        size: { x: this.config.baseboard.depth, y: this.config.baseboard.height, z: segmentLength },
        position: {
          x: -width / 2 + this.config.baseboard.depth / 2,
          y: this.config.baseboard.height / 2,
          z,
        },
        material: this.trimMaterial,
        castShadow: true,
        receiveShadow: true,
      });

      this.furniture.addBox({
        name: `TomAndJerrySharedWallCrown:${z}`,
        size: { x: this.config.crownMolding.depth, y: this.config.crownMolding.height, z: segmentLength },
        position: {
          x: -width / 2 + this.config.crownMolding.depth / 2,
          y: height - this.config.crownMolding.height / 2,
          z,
        },
        material: this.trimMaterial,
        castShadow: true,
        receiveShadow: true,
      });
    }

    this.furniture.addBox({
      name: 'TomAndJerrySharedWallInteriorHeader',
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

  addAreaRug() {
    this.furniture.addBox({
      name: 'TomAndJerryRoomSmallRug',
      size: { x: 2.8, y: 0.024, z: 3.5 },
      position: { x: LAYOUT.coffeeTable.x, y: 0.012, z: LAYOUT.coffeeTable.z },
      material: this.furnitureMaterials.rug,
      castShadow: false,
      receiveShadow: true,
    });
  }

  addEntertainmentCenter() {
    this.furniture.addBox({
      name: 'EntertainmentCenterCabinet',
      size: { x: 1.55, y: 0.72, z: 5.05 },
      position: { x: LAYOUT.entertainmentCenter.x, y: 0.36, z: LAYOUT.entertainmentCenter.z },
      material: this.furnitureMaterials.wood,
      receiveShadow: true,
      collider: true,
    });

    this.furniture.addBox({
      name: 'EntertainmentCenterTopShelf',
      size: { x: 1.65, y: 0.08, z: 5.2 },
      position: { x: LAYOUT.entertainmentCenter.x, y: 0.76, z: LAYOUT.entertainmentCenter.z },
      material: this.furnitureMaterials.darkWood,
      receiveShadow: true,
    });

    this.furniture.addBox({
      name: 'EntertainmentCenterLowerShelf',
      size: { x: 1.38, y: 0.08, z: 4.55 },
      position: { x: LAYOUT.entertainmentCenter.x - 0.02, y: 0.38, z: LAYOUT.entertainmentCenter.z },
      material: this.furnitureMaterials.darkWood,
      receiveShadow: true,
    });

    this.addCrtTelevision();
  }

  addCrtTelevision() {
    this.furniture.addBox({
      name: 'CrtTelevisionCabinet',
      size: { x: 0.9, y: 1.12, z: 2.25 },
      position: { x: LAYOUT.television.x, y: 1.35, z: LAYOUT.television.z },
      material: this.furnitureMaterials.darkWood,
      receiveShadow: true,
      collider: true,
    });

    this.furniture.addBox({
      name: 'CrtTelevisionBezel',
      size: { x: 0.07, y: 0.82, z: 1.58 },
      position: { x: LAYOUT.television.x - 0.49, y: 1.38, z: LAYOUT.television.z },
      material: this.furnitureMaterials.bezel,
      receiveShadow: true,
    });

    const screenMesh = this.furniture.addBox({
      name: 'CrtTelevisionScreenPlaceholder',
      size: { x: 0.04, y: 0.58, z: 1.18 },
      position: { x: LAYOUT.television.x - 0.535, y: 1.4, z: LAYOUT.television.z - 0.16 },
      material: this.furnitureMaterials.screen,
      castShadow: false,
      receiveShadow: false,
    });

    this.television = new VideoScreen({
      mesh: screenMesh,
      offMaterial: this.furnitureMaterials.screen,
      src: TV_CONFIG.video.src,
      loop: TV_CONFIG.video.loop,
      defaultVolume: TV_CONFIG.video.defaultVolume,
      volumeStep: TV_CONFIG.video.volumeStep,
      spatialAudio: TV_CONFIG.spatialAudio,
    });
    this.addCrtScreenEffects();
    this.registerInteractable(screenMesh, {
      id: 'tom-and-jerry-tv-screen',
      getPrompt: () => this.getTelevisionPowerPrompt(),
      onInteract: () => this.toggleTelevisionPower(),
    });

    this.furniture.addBox({
      name: 'CrtTelevisionSpeakerPanel',
      size: { x: 0.045, y: 0.56, z: 0.28 },
      position: { x: LAYOUT.television.x - 0.54, y: 1.38, z: LAYOUT.television.z + 0.72 },
      material: this.furnitureMaterials.bezel,
      receiveShadow: true,
    });

    for (const [index, z] of [0.92, 0.7].entries()) {
      const knob = this.furniture.addCylinder({
        name: `CrtTelevisionControlKnob:${index + 1}`,
        radiusTop: 0.08,
        height: 0.07,
        radialSegments: 18,
        position: { x: LAYOUT.television.x - 0.57, y: 1.13 - index * 0.18, z },
        rotation: { x: 0, y: 0, z: Math.PI / 2 },
        material: this.furnitureMaterials.brass,
        receiveShadow: true,
      });
      this.registerInteractable(knob, {
        id: `tom-and-jerry-tv-volume-${index === 0 ? 'up' : 'down'}`,
        getPrompt: () => this.getTelevisionVolumePrompt(index === 0 ? '+' : '-'),
        onInteract: () => this.adjustTelevisionVolume(index === 0 ? 1 : -1),
      });
    }

    this.addControlMark('+', { y: 1.13, z: 1.13 });
    this.addControlMark('-', { y: 0.95, z: 0.91 });

    this.powerButton = this.furniture.addCylinder({
      name: 'CrtTelevisionPowerButton',
      radiusTop: 0.075,
      height: 0.08,
      radialSegments: 18,
      position: { x: LAYOUT.television.x - 0.575, y: 0.91, z: 0.88 },
      rotation: { x: 0, y: 0, z: Math.PI / 2 },
      material: this.furnitureMaterials.powerOff,
      receiveShadow: true,
    });
    this.registerInteractable(this.powerButton, {
      id: 'tom-and-jerry-tv-power-button',
      getPrompt: () => this.getTelevisionPowerPrompt(),
      onInteract: () => this.toggleTelevisionPower(),
    });

    this.furniture.addBox({
      name: 'CrtTelevisionStand',
      size: { x: 0.78, y: 0.16, z: 1.55 },
      position: { x: LAYOUT.television.x, y: 0.84, z: LAYOUT.television.z },
      material: this.furnitureMaterials.darkWood,
      receiveShadow: true,
    });
  }

  addCrtScreenEffects() {
    this.screenGlowMesh = this.furniture.addBox({
      name: 'CrtTelevisionScreenGlow',
      size: { x: 0.012, y: 0.68, z: 1.34 },
      position: { x: LAYOUT.television.x - 0.568, y: 1.4, z: LAYOUT.television.z - 0.16 },
      material: this.screenGlowMaterial,
      castShadow: false,
      receiveShadow: false,
    });
    this.screenGlowMesh.renderOrder = 4;

    this.scanlineMesh = this.furniture.addBox({
      name: 'CrtTelevisionScanlineOverlay',
      size: { x: 0.01, y: 0.59, z: 1.2 },
      position: { x: LAYOUT.television.x - 0.576, y: 1.4, z: LAYOUT.television.z - 0.16 },
      material: this.scanlineMaterial,
      castShadow: false,
      receiveShadow: false,
    });
    this.scanlineMesh.renderOrder = 5;
  }

  addControlMark(symbol, { y, z }) {
    const x = LAYOUT.television.x - 0.59;

    this.furniture.addBox({
      name: `CrtTelevisionControlMark:${symbol}:horizontal`,
      size: { x: 0.018, y: 0.026, z: 0.16 },
      position: { x, y, z },
      material: this.furnitureMaterials.controlMark,
      castShadow: false,
      receiveShadow: true,
    });

    if (symbol === '+') {
      this.furniture.addBox({
        name: 'CrtTelevisionControlMark:plus:vertical',
        size: { x: 0.018, y: 0.16, z: 0.026 },
        position: { x, y, z },
        material: this.furnitureMaterials.controlMark,
        castShadow: false,
        receiveShadow: true,
      });
    }
  }

  toggleTelevisionPower() {
    this.television.togglePower();
    this.syncTelevisionControls();
  }

  adjustTelevisionVolume(direction) {
    if (direction > 0) {
      this.television.increaseVolume();
    } else {
      this.television.decreaseVolume();
    }

    this.syncTelevisionControls();
  }

  getTelevisionPowerPrompt() {
    return `Power TV - ${this.television.getPowerLabel()} - Volume ${this.television.getVolumePercent()}%`;
  }

  getTelevisionVolumePrompt(symbol) {
    const direction = symbol === '+' ? 'Increase' : 'Decrease';
    return `${symbol} ${direction} TV Volume - Set ${this.television.getVolumePercent()}%`;
  }

  syncTelevisionControls() {
    if (!this.powerButton) {
      return;
    }

    this.powerButton.material = this.television.isPowered
      ? this.furnitureMaterials.powerOn
      : this.furnitureMaterials.powerOff;
    this.setTelevisionHumEnabled(this.television.isPowered);
  }

  addCouch() {
    this.furniture.addBox({
      name: 'RetroCouchSeat',
      size: { x: 1.15, y: 0.34, z: 4.15 },
      position: { x: LAYOUT.couch.x, y: 0.36, z: LAYOUT.couch.z },
      material: this.furnitureMaterials.couch,
      receiveShadow: true,
      collider: true,
    });

    this.furniture.addBox({
      name: 'RetroCouchBack',
      size: { x: 0.34, y: 0.9, z: 4.28 },
      position: { x: LAYOUT.couch.x - 0.55, y: 0.72, z: LAYOUT.couch.z },
      material: this.furnitureMaterials.couch,
      receiveShadow: true,
      collider: true,
    });

    for (const z of [-2.2, 2.2]) {
      this.furniture.addBox({
        name: `RetroCouchArm:${z}`,
        size: { x: 1.15, y: 0.62, z: 0.32 },
        position: { x: LAYOUT.couch.x, y: 0.56, z },
        material: this.furnitureMaterials.couch,
        receiveShadow: true,
        collider: true,
      });
    }

    for (const z of [-0.85, 0.85]) {
      this.furniture.addBox({
        name: `RetroCouchPillow:${z}`,
        size: { x: 0.12, y: 0.42, z: 0.82 },
        position: { x: LAYOUT.couch.x + 0.08, y: 0.82, z },
        material: this.furnitureMaterials.couchAccent,
        castShadow: true,
        receiveShadow: true,
      });
    }
  }

  addTables() {
    this.furniture.addBox({
      name: 'CoffeeTableTop',
      size: { x: 1.25, y: 0.12, z: 2.35 },
      position: { x: LAYOUT.coffeeTable.x, y: 0.5, z: LAYOUT.coffeeTable.z },
      material: this.furnitureMaterials.wood,
      receiveShadow: true,
      collider: true,
    });

    this.addTableLegs('CoffeeTable', LAYOUT.coffeeTable, 0.58, 2.15, 0.42);

    this.furniture.addBox({
      name: 'SideTableTop',
      size: { x: 0.78, y: 0.12, z: 0.78 },
      position: { x: LAYOUT.sideTable.x, y: 0.56, z: LAYOUT.sideTable.z },
      material: this.furnitureMaterials.wood,
      receiveShadow: true,
      collider: true,
    });

    this.addTableLegs('SideTable', LAYOUT.sideTable, 0.58, 0.58, 0.48);
  }

  addTableLegs(name, center, xSpan, zSpan, height) {
    for (const xOffset of [-xSpan / 2, xSpan / 2]) {
      for (const zOffset of [-zSpan / 2, zSpan / 2]) {
        this.furniture.addBox({
          name: `${name}Leg:${xOffset}:${zOffset}`,
          size: { x: 0.08, y: height, z: 0.08 },
          position: { x: center.x + xOffset, y: height / 2, z: center.z + zOffset },
          material: this.furnitureMaterials.darkWood,
          receiveShadow: true,
        });
      }
    }
  }

  addBeanBagChair() {
    this.furniture.addSphere({
      name: 'BeanBagChair',
      radius: 0.72,
      scale: { x: 1.15, y: 0.48, z: 1 },
      position: { x: LAYOUT.beanBag.x, y: 0.34, z: LAYOUT.beanBag.z },
      material: this.furnitureMaterials.beanBag,
      widthSegments: 28,
      heightSegments: 16,
      receiveShadow: true,
    });
  }

  addFloorLamp() {
    this.furniture.addCylinder({
      name: 'FloorLampBase',
      radiusTop: 0.28,
      radiusBottom: 0.28,
      height: 0.06,
      radialSegments: 28,
      position: { x: LAYOUT.floorLamp.x, y: 0.03, z: LAYOUT.floorLamp.z },
      material: this.furnitureMaterials.brass,
      receiveShadow: true,
    });

    this.furniture.addCylinder({
      name: 'FloorLampPole',
      radiusTop: 0.035,
      radiusBottom: 0.035,
      height: 1.6,
      radialSegments: 16,
      position: { x: LAYOUT.floorLamp.x, y: 0.86, z: LAYOUT.floorLamp.z },
      material: this.furnitureMaterials.brass,
      receiveShadow: true,
    });

    this.furniture.addCylinder({
      name: 'FloorLampShade',
      radiusTop: 0.27,
      radiusBottom: 0.44,
      height: 0.48,
      radialSegments: 28,
      position: { x: LAYOUT.floorLamp.x, y: 1.78, z: LAYOUT.floorLamp.z },
      material: this.furnitureMaterials.lampShade,
      castShadow: true,
      receiveShadow: false,
    });

    const light = new THREE.PointLight(0xffc982, 26, 6, 2);
    light.name = 'TomAndJerryRoomFloorLampLight';
    light.position.set(LAYOUT.floorLamp.x, 1.72, LAYOUT.floorLamp.z);
    light.castShadow = false;
    this.addLight(light);
  }

  addWallDecorations() {
    for (const art of WALL_ART) {
      const material = art.artColor === 0x6e8fa5
        ? this.furnitureMaterials.artBlue
        : this.furnitureMaterials.artTerracotta;

      this.furniture.addBox({
        name: `${art.name}:Frame`,
        size: art.frameSize,
        position: art.position,
        material: this.furnitureMaterials.frame,
        castShadow: true,
        receiveShadow: true,
      });

      this.furniture.addBox({
        name: `${art.name}:GenericArtwork`,
        size: art.artSize,
        position: {
          x: art.position.x,
          y: art.position.y,
          z: art.position.z + Math.sign(-art.position.z) * 0.035,
        },
        material,
        castShadow: false,
        receiveShadow: true,
      });
    }
  }

  getTrimSegmentSize(wallName, spanLength, height, depth) {
    if (this.isNorthSouthWall(wallName)) {
      return { x: spanLength, y: height, z: depth };
    }

    return { x: depth, y: height, z: spanLength };
  }

  getTrimSegmentPosition(wallName, centerAlongSpan, centerY, depth) {
    const { width, length } = this.config.dimensions;

    switch (wallName) {
      case 'north':
        return { x: centerAlongSpan, y: centerY, z: -length / 2 + depth / 2 };
      case 'south':
        return { x: centerAlongSpan, y: centerY, z: length / 2 - depth / 2 };
      case 'east':
        return { x: width / 2 - depth / 2, y: centerY, z: centerAlongSpan };
      case 'west':
        return { x: -width / 2 + depth / 2, y: centerY, z: centerAlongSpan };
      default:
        throw new Error(`Unknown trim wall: ${wallName}`);
    }
  }

  update(deltaTime, player) {
    this.television?.updateSpatialVolume(player.position);
    this.updateCrtEffects(deltaTime);
  }

  updateCrtEffects(deltaTime) {
    if (!this.television?.isPowered) {
      this.screenGlowMaterial.opacity = 0;
      this.scanlineMaterial.opacity = 0;
      this.television?.setDisplayIntensity(1);
      return;
    }

    const effects = TV_CONFIG.effects;
    this.crtEffectTime += deltaTime;

    const primary = Math.sin(this.crtEffectTime * effects.flickerPrimaryRate) * 0.02;
    const secondary = Math.sin(this.crtEffectTime * effects.flickerSecondaryRate) * 0.012;
    const brightness = THREE.MathUtils.clamp(
      1 + primary + secondary,
      effects.displayMinIntensity,
      effects.displayMaxIntensity,
    );

    this.television.setDisplayIntensity(brightness);
    const normalizedFlicker = THREE.MathUtils.clamp(Math.abs(primary + secondary) / 0.032, 0, 1);
    this.screenGlowMaterial.opacity = effects.glowBaseOpacity
      + normalizedFlicker * effects.glowFlickerOpacity;
    this.scanlineMaterial.opacity = effects.scanlineOpacity;
  }

  configureAudio(audioManager) {
    this.audioManager = audioManager;

    if (!audioManager || this.roomAudioConfigured) {
      return;
    }

    const audioConfig = AUDIO_CONFIG.tomAndJerry;
    this.hvacAudio = this.createRoomAudioSource(audioManager, audioConfig.hvac);
    this.floorLampBuzzAudio = this.createRoomAudioSource(audioManager, audioConfig.floorLampBuzz);
    this.crtHumAudio = this.createRoomAudioSource(audioManager, audioConfig.crtHum, { enabled: false });
    this.crtCabinetHumAudio = this.createRoomAudioSource(audioManager, audioConfig.crtCabinetHum, { enabled: false });
    this.roomAudioConfigured = true;
    this.setTelevisionHumEnabled(this.television?.isPowered ?? false);
  }

  createRoomAudioSource(audioManager, sourceConfig, overrides = {}) {
    return audioManager.createPositionalLoop({
      ...sourceConfig,
      ...overrides,
      roomId: this.id,
      position: this.toWorldPosition(sourceConfig.position),
    });
  }

  setTelevisionHumEnabled(enabled) {
    this.crtHumAudio?.setEnabled(enabled);
    this.crtCabinetHumAudio?.setEnabled(enabled);
  }

  activate() {
    super.activate();
    this.resumeMedia();
  }

  deactivate() {
    super.deactivate();
    this.pauseMedia();
  }

  pauseMedia() {
    this.television?.pause();
  }

  resumeMedia() {
    this.television?.resumeIfPowered();
  }

  dispose() {
    this.television?.dispose();
    this.scanlineTexture?.dispose();
    super.dispose();
  }
}
