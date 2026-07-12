import * as THREE from 'three';
import { AabbCollider } from '../collision/AabbCollider.js';
import { AUDIO_CONFIG, LIBRARY_ROOM_CONFIG } from '../config/constants.js';
import { FurnitureBuilder } from './FurnitureBuilder.js';
import { RectangularRoom } from './RectangularRoom.js';

const SHARED_WALL_SURFACE_OFFSET = 0.018;
const SHARED_WALL_SURFACE_DEPTH = 0.035;
const BOOK_READ_RANGE = 2.45;
const TV_GUIDE_READ_RANGE = 3;

const BOOKSHELF = Object.freeze({
  height: 2.55,
  depth: 0.44,
  baseY: 1.28,
  boardThickness: 0.08,
  bookDepth: 0.12,
});

const READABLE_CONTENT = Object.freeze({
  ancientHistory: Object.freeze({
    title: 'Ancient History',
    body: Object.freeze([
      'Placeholder educational content.',
      'This book slot will later support structured chapters, illustrations, narration, and citations loaded through the reusable Content Panel system.',
    ]),
  }),
  fieldGuides: Object.freeze({
    title: 'Field Guides',
    body: Object.freeze([
      'Placeholder educational content.',
      'Future versions can connect this shelf to wildlife notes, exhibit references, or room-specific discoveries collected during exploration.',
    ]),
  }),
  worldMyths: Object.freeze({
    title: 'World Myths',
    body: Object.freeze([
      'Placeholder educational content.',
      'This panel is intentionally data-shaped so authored library entries can replace placeholder copy without changing room interaction logic.',
    ]),
  }),
  designNotes: Object.freeze({
    title: 'Design Notes',
    body: Object.freeze([
      'Placeholder educational content.',
      'The Library Room demonstrates how bookshelves and display items can pause movement, show readable content, then return control to the player.',
    ]),
  }),
});

const SHELF_LAYOUT = Object.freeze([
  Object.freeze({ id: 'north-west-history', wall: 'north', center: -4.7, length: 3.6, content: READABLE_CONTENT.ancientHistory }),
  Object.freeze({ id: 'north-east-myths', wall: 'north', center: 4.7, length: 3.6, content: READABLE_CONTENT.worldMyths }),
  Object.freeze({ id: 'east-field-guides', wall: 'east', center: -1.8, length: 4.2, content: READABLE_CONTENT.fieldGuides }),
  Object.freeze({ id: 'east-design-notes', wall: 'east', center: 2.9, length: 3.0, content: READABLE_CONTENT.designNotes }),
  Object.freeze({ id: 'south-reference', wall: 'south', center: 1.8, length: 4.5, content: READABLE_CONTENT.ancientHistory }),
  Object.freeze({ id: 'south-display', wall: 'south', center: 5.6, length: 2.4, content: READABLE_CONTENT.worldMyths }),
]);

const TABLES = Object.freeze([
  Object.freeze({ id: 'main', x: -1.35, z: 0.55, size: Object.freeze({ x: 2.6, z: 1.22 }) }),
  Object.freeze({ id: 'side', x: 3.65, z: -0.35, size: Object.freeze({ x: 1.55, z: 0.95 }) }),
]);

const TV_GUIDE_PLACEMENT = Object.freeze({
  position: Object.freeze({ x: 3.65, y: 0.84, z: -0.35 }),
  size: Object.freeze({ x: 0.82, y: 0.07, z: 0.98 }),
  coverOffsetY: 0.043,
  cover: Object.freeze({ width: 0.74, height: 0.46 }),
});

const CHAIRS = Object.freeze([
  Object.freeze({ id: 'main-north', x: -1.35, z: -0.55, rotation: Math.PI }),
  Object.freeze({ id: 'main-south', x: -1.35, z: 1.65, rotation: 0 }),
  Object.freeze({ id: 'main-west', x: -2.95, z: 0.55, rotation: Math.PI / 2 }),
  Object.freeze({ id: 'side-east', x: 4.95, z: -0.35, rotation: -Math.PI / 2 }),
]);

const FLOOR_LAMPS = Object.freeze([
  Object.freeze({ id: 'west', x: -5.75, z: -2.1 }),
  Object.freeze({ id: 'south', x: 5.45, z: 3.25 }),
]);

const PLANTS = Object.freeze([
  Object.freeze({ id: 'west-corner', x: -5.8, z: -3.75 }),
  Object.freeze({ id: 'east-corner', x: 6.18, z: 3.75 }),
]);

const WALL_ART = Object.freeze([
  Object.freeze({ id: 'quiet-landscape', x: -4.6, y: 2.65, z: -4.82, wall: 'north', color: 0x78916c }),
  Object.freeze({ id: 'abstract-study', x: 7.32, y: 2.35, z: 1.15, wall: 'east', color: 0x8f6f4f }),
]);

export class LibraryRoom extends RectangularRoom {
  constructor(scene, collisionSystem, config = LIBRARY_ROOM_CONFIG) {
    super(scene, collisionSystem, config);
  }

  build() {
    super.build();

    this.furniture = new FurnitureBuilder(this);
    this.createLibraryMaterials();
    this.addCrownMolding();
    this.addSharedLobbyWallInterior();
    this.addRugs();
    this.addBookshelves();
    this.addReadingTables();
    this.addComfortableChairs();
    this.addFireplace();
    this.addLamps();
    this.addDecorativePlants();
    this.addFramedArtwork();
    this.addDisplayTable();
  }

  createLibraryMaterials() {
    this.libraryMaterials = Object.freeze({
      shelfWood: this.createMaterial('BuiltInShelfWalnut', {
        color: 0x4f3121,
        roughness: 0.74,
        metalness: 0,
      }),
      darkWood: this.createMaterial('LibraryDarkWood', {
        color: 0x2c1c13,
        roughness: 0.78,
        metalness: 0,
      }),
      tableWood: this.createMaterial('ReadingTableWood', {
        color: 0x6a4228,
        roughness: 0.68,
        metalness: 0,
      }),
      leather: this.createMaterial('ReadingChairLeather', {
        color: 0x5e2d24,
        roughness: 0.86,
        metalness: 0,
      }),
      chairAccent: this.createMaterial('ReadingChairAccent', {
        color: 0xb78a57,
        roughness: 0.9,
        metalness: 0,
      }),
      rugPrimary: this.createMaterial('LibraryMainRug', {
        color: 0x315054,
        roughness: 0.96,
        metalness: 0,
      }),
      rugAccent: this.createMaterial('LibraryRugAccent', {
        color: 0xb1844c,
        roughness: 0.96,
        metalness: 0,
      }),
      brass: this.createMaterial('LibraryAgedBrass', {
        color: 0xc49b58,
        roughness: 0.48,
        metalness: 0.32,
      }),
      lampShade: this.createMaterial('LibraryLampShade', {
        color: 0xf3d8a4,
        roughness: 0.86,
        metalness: 0,
        emissive: 0xffc77d,
        emissiveIntensity: 0.12,
      }),
      fireplaceStone: this.createMaterial('FireplaceStone', {
        color: 0x9b846b,
        roughness: 0.9,
        metalness: 0,
      }),
      firebox: this.createMaterial('FireplaceFirebox', {
        color: 0x1c1511,
        roughness: 0.72,
        metalness: 0,
        emissive: 0x2a0f05,
        emissiveIntensity: 0.16,
      }),
      plantPot: this.createMaterial('LibraryPlantPot', {
        color: 0x6c4534,
        roughness: 0.82,
        metalness: 0,
      }),
      plantLeaf: this.createMaterial('LibraryPlantLeaf', {
        color: 0x496f43,
        roughness: 0.8,
        metalness: 0,
      }),
      frame: this.createMaterial('LibraryArtworkFrame', {
        color: 0x3a2418,
        roughness: 0.7,
        metalness: 0,
      }),
      page: this.createMaterial('OpenBookPages', {
        color: 0xf2dfbd,
        roughness: 0.92,
        metalness: 0,
      }),
      tvGuide: this.createMaterial('LibraryTvGuideCover', {
        color: 0x204b73,
        roughness: 0.78,
        metalness: 0,
      }),
    });

    this.bookMaterials = Object.freeze([
      this.createMaterial('BookClothBurgundy', { color: 0x7a2833, roughness: 0.88, metalness: 0 }),
      this.createMaterial('BookClothBlue', { color: 0x2d5276, roughness: 0.88, metalness: 0 }),
      this.createMaterial('BookClothGreen', { color: 0x395b3c, roughness: 0.88, metalness: 0 }),
      this.createMaterial('BookClothOchre', { color: 0xaa7c34, roughness: 0.88, metalness: 0 }),
      this.createMaterial('BookClothPlum', { color: 0x523459, roughness: 0.88, metalness: 0 }),
    ]);

    this.fireGlowMaterial = this.trackMaterial('StaticFireGlow', new THREE.MeshBasicMaterial({
      color: 0xff8f30,
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
      toneMapped: false,
    }));
  }

  trackMaterial(name, material) {
    material.name = `${this.name}:${name}`;
    this.materials.set(name, material);

    return material;
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
    const { width, height } = this.config.dimensions;
    const { height: openingHeight, width: openingWidth } = this.config.openings;
    const panelX = -width / 2 + SHARED_WALL_SURFACE_OFFSET;

    for (const segment of this.getSolidSegments('west')) {
      const span = segment.end - segment.start;
      const center = (segment.start + segment.end) / 2;

      this.furniture.addBox({
        name: `LibrarySharedWallInteriorPanel:${center}`,
        size: { x: SHARED_WALL_SURFACE_DEPTH, y: height, z: span },
        position: { x: panelX, y: height / 2, z: center },
        material: this.wallMaterial,
        castShadow: false,
        receiveShadow: true,
      });

      this.addSharedWallTrimSegment(center, span);
    }

    this.furniture.addBox({
      name: 'LibrarySharedWallInteriorHeader',
      size: { x: SHARED_WALL_SURFACE_DEPTH, y: height - openingHeight, z: openingWidth },
      position: {
        x: panelX,
        y: openingHeight + (height - openingHeight) / 2,
        z: this.config.openings.entries[0].center,
      },
      material: this.wallMaterial,
      castShadow: false,
      receiveShadow: true,
    });
  }

  addSharedWallTrimSegment(center, span) {
    const { width, height } = this.config.dimensions;
    const { baseboard, crownMolding } = this.config;

    this.furniture.addBox({
      name: `LibrarySharedWallBaseboard:${center}`,
      size: { x: baseboard.depth, y: baseboard.height, z: span },
      position: {
        x: -width / 2 + baseboard.depth / 2,
        y: baseboard.height / 2,
        z: center,
      },
      material: this.trimMaterial,
      castShadow: true,
      receiveShadow: true,
    });

    this.furniture.addBox({
      name: `LibrarySharedWallCrown:${center}`,
      size: { x: crownMolding.depth, y: crownMolding.height, z: span },
      position: {
        x: -width / 2 + crownMolding.depth / 2,
        y: height - crownMolding.height / 2,
        z: center,
      },
      material: this.trimMaterial,
      castShadow: true,
      receiveShadow: true,
    });
  }

  addRugs() {
    this.furniture.addBox({
      name: 'LibraryMainReadingRug',
      size: { x: 5.2, y: 0.024, z: 4.15 },
      position: { x: -0.9, y: 0.012, z: 0.65 },
      material: this.libraryMaterials.rugPrimary,
      castShadow: false,
      receiveShadow: true,
    });

    this.furniture.addBox({
      name: 'LibraryFireplaceRug',
      size: { x: 3.4, y: 0.026, z: 1.2 },
      position: { x: 0, y: 0.014, z: -3.25 },
      material: this.libraryMaterials.rugAccent,
      castShadow: false,
      receiveShadow: true,
    });
  }

  addBookshelves() {
    for (const shelf of SHELF_LAYOUT) {
      this.addBookshelf(shelf);
    }
  }

  addBookshelf({ id, wall, center, length, content }) {
    const position = this.getShelfPosition(wall, center);
    const size = this.getShelfSize(wall, length);
    const targets = [];

    const caseMesh = this.furniture.addBox({
      name: `LibraryBookshelfCase:${id}`,
      size,
      position,
      material: this.libraryMaterials.shelfWood,
      castShadow: true,
      receiveShadow: true,
      collider: true,
    });
    targets.push(caseMesh);

    for (let shelfIndex = 0; shelfIndex < 4; shelfIndex += 1) {
      targets.push(this.addShelfBoard(id, wall, center, length, shelfIndex));
    }

    for (let row = 0; row < 4; row += 1) {
      for (let column = 0; column < 8; column += 1) {
        targets.push(this.addBookBlock(id, wall, center, length, row, column));
      }
    }

    this.registerReadable(targets, `library-bookshelf-${id}`, content);
  }

  getShelfPosition(wall, center) {
    const { width, length } = this.config.dimensions;

    switch (wall) {
      case 'north':
        return { x: center, y: BOOKSHELF.baseY, z: -length / 2 + BOOKSHELF.depth / 2 + 0.08 };
      case 'south':
        return { x: center, y: BOOKSHELF.baseY, z: length / 2 - BOOKSHELF.depth / 2 - 0.08 };
      case 'east':
        return { x: width / 2 - BOOKSHELF.depth / 2 - 0.08, y: BOOKSHELF.baseY, z: center };
      default:
        throw new Error(`Unsupported Library shelf wall: ${wall}`);
    }
  }

  getShelfSize(wall, length) {
    if (wall === 'east') {
      return { x: BOOKSHELF.depth, y: BOOKSHELF.height, z: length };
    }

    return { x: length, y: BOOKSHELF.height, z: BOOKSHELF.depth };
  }

  addShelfBoard(id, wall, center, length, shelfIndex) {
    const boardY = 0.28 + shelfIndex * 0.56;
    const size = wall === 'east'
      ? { x: BOOKSHELF.depth + 0.04, y: BOOKSHELF.boardThickness, z: length }
      : { x: length, y: BOOKSHELF.boardThickness, z: BOOKSHELF.depth + 0.04 };
    const position = this.getShelfPosition(wall, center);
    position.y = boardY;

    return this.furniture.addBox({
      name: `LibraryBookshelfBoard:${id}:${shelfIndex}`,
      size,
      position,
      material: this.libraryMaterials.darkWood,
      castShadow: true,
      receiveShadow: true,
    });
  }

  addBookBlock(id, wall, center, length, row, column) {
    const bookSpan = length / 8;
    const bookHeight = 0.32 + ((row + column) % 3) * 0.055;
    const material = this.bookMaterials[(row + column + id.length) % this.bookMaterials.length];
    const inset = -length / 2 + bookSpan * column + bookSpan / 2;
    const y = 0.5 + row * 0.56 + bookHeight / 2;
    const size = wall === 'east'
      ? { x: BOOKSHELF.bookDepth, y: bookHeight, z: bookSpan * 0.72 }
      : { x: bookSpan * 0.72, y: bookHeight, z: BOOKSHELF.bookDepth };
    const position = this.getBookPosition(wall, center, inset, y);

    return this.furniture.addBox({
      name: `LibraryBookBlock:${id}:${row}:${column}`,
      size,
      position,
      material,
      castShadow: true,
      receiveShadow: true,
    });
  }

  getBookPosition(wall, center, inset, y) {
    const { width, length } = this.config.dimensions;

    switch (wall) {
      case 'north':
        return { x: center + inset, y, z: -length / 2 + BOOKSHELF.depth + 0.04 };
      case 'south':
        return { x: center + inset, y, z: length / 2 - BOOKSHELF.depth - 0.04 };
      case 'east':
        return { x: width / 2 - BOOKSHELF.depth - 0.04, y, z: center + inset };
      default:
        throw new Error(`Unsupported Library book wall: ${wall}`);
    }
  }

  addReadingTables() {
    for (const table of TABLES) {
      this.addReadingTable(table);
    }
  }

  addReadingTable({ id, x, z, size }) {
    this.furniture.addBox({
      name: `LibraryReadingTableTop:${id}`,
      size: { x: size.x, y: 0.14, z: size.z },
      position: { x, y: 0.72, z },
      material: this.libraryMaterials.tableWood,
      castShadow: true,
      receiveShadow: true,
      collider: true,
    });

    for (const xOffset of [-size.x / 2 + 0.18, size.x / 2 - 0.18]) {
      for (const zOffset of [-size.z / 2 + 0.16, size.z / 2 - 0.16]) {
        this.furniture.addBox({
          name: `LibraryReadingTableLeg:${id}:${xOffset}:${zOffset}`,
          size: { x: 0.1, y: 0.64, z: 0.1 },
          position: { x: x + xOffset, y: 0.34, z: z + zOffset },
          material: this.libraryMaterials.darkWood,
          castShadow: true,
          receiveShadow: true,
        });
      }
    }
  }

  addComfortableChairs() {
    for (const chair of CHAIRS) {
      this.addArmchair(chair);
    }
  }

  addArmchair({ id, x, z, rotation }) {
    const chairGroup = new THREE.Group();
    chairGroup.name = `LibraryArmchair:${id}`;
    chairGroup.position.set(x, 0, z);
    chairGroup.rotation.y = rotation;
    this.group.add(chairGroup);

    this.addChairPart(chairGroup, `LibraryArmchairSeat:${id}`, {
      size: { x: 0.82, y: 0.28, z: 0.76 },
      position: { x: 0, y: 0.36, z: 0 },
      material: this.libraryMaterials.leather,
      collider: true,
    });

    this.addChairPart(chairGroup, `LibraryArmchairBack:${id}`, {
      size: { x: 0.88, y: 0.82, z: 0.18 },
      position: { x: 0, y: 0.74, z: 0.38 },
      material: this.libraryMaterials.leather,
      collider: true,
    });

    for (const xOffset of [-0.5, 0.5]) {
      this.addChairPart(chairGroup, `LibraryArmchairArm:${id}:${xOffset}`, {
        size: { x: 0.18, y: 0.5, z: 0.78 },
        position: { x: xOffset, y: 0.55, z: 0 },
        material: this.libraryMaterials.leather,
        collider: true,
      });
    }

    this.addChairPart(chairGroup, `LibraryArmchairCushion:${id}`, {
      size: { x: 0.58, y: 0.08, z: 0.56 },
      position: { x: 0, y: 0.54, z: -0.03 },
      material: this.libraryMaterials.chairAccent,
    });
  }

  addChairPart(group, name, { size, position, material, collider = false }) {
    const mesh = new THREE.Mesh(this.getBoxGeometry(size), material);
    mesh.name = name;
    mesh.position.set(position.x, position.y, position.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);

    if (collider) {
      const worldPosition = new THREE.Vector3(position.x, position.y, position.z);
      worldPosition.applyEuler(group.rotation);
      worldPosition.add(group.position);
      this.addColliderForLocalBox(name, size, worldPosition, group.rotation.y);
    }

    return mesh;
  }

  addColliderForLocalBox(name, size, localPosition, rotationY) {
    this.addCollider(new AabbCollider({
      name: `${name}Collider`,
      center: this.toWorldPosition(localPosition),
      size: this.getRotatedAabbSize(size, rotationY),
    }));
  }

  getRotatedAabbSize(size, rotationY) {
    const cos = Math.abs(Math.cos(rotationY));
    const sin = Math.abs(Math.sin(rotationY));

    return {
      x: size.x * cos + size.z * sin,
      y: size.y,
      z: size.x * sin + size.z * cos,
    };
  }

  addFireplace() {
    const z = -4.62;

    this.furniture.addBox({
      name: 'LibraryFireplaceBody',
      size: { x: 2.8, y: 1.35, z: 0.48 },
      position: { x: 0, y: 0.72, z },
      material: this.libraryMaterials.fireplaceStone,
      castShadow: true,
      receiveShadow: true,
      collider: true,
    });

    this.furniture.addBox({
      name: 'LibraryFireplaceOpening',
      size: { x: 1.55, y: 0.72, z: 0.08 },
      position: { x: 0, y: 0.58, z: z + 0.24 },
      material: this.libraryMaterials.firebox,
      castShadow: false,
      receiveShadow: true,
    });

    this.furniture.addBox({
      name: 'LibraryFireplaceMantel',
      size: { x: 3.15, y: 0.18, z: 0.64 },
      position: { x: 0, y: 1.44, z: z + 0.02 },
      material: this.libraryMaterials.darkWood,
      castShadow: true,
      receiveShadow: true,
    });

    this.furniture.addBox({
      name: 'LibraryStaticFireGlow',
      size: { x: 1.05, y: 0.38, z: 0.04 },
      position: { x: 0, y: 0.48, z: z + 0.285 },
      material: this.fireGlowMaterial,
      castShadow: false,
      receiveShadow: false,
    });

    const light = new THREE.PointLight(0xff8d34, 9, 4.8, 2);
    light.name = 'LibraryFireplaceGlowLight';
    light.position.set(0, 0.9, z + 0.55);
    light.castShadow = false;
    this.addLight(light);
  }

  addLamps() {
    for (const lamp of FLOOR_LAMPS) {
      this.addFloorLamp(lamp);
    }

    this.addDeskLamp('main', { x: -0.45, y: 0.81, z: 0.15 });
    this.addDeskLamp('display', { x: 3.65, y: 0.66, z: 2.45 });
  }

  addFloorLamp({ id, x, z }) {
    this.furniture.addCylinder({
      name: `LibraryFloorLampBase:${id}`,
      radiusTop: 0.26,
      radiusBottom: 0.26,
      height: 0.06,
      radialSegments: 28,
      position: { x, y: 0.03, z },
      material: this.libraryMaterials.brass,
      receiveShadow: true,
    });

    this.furniture.addCylinder({
      name: `LibraryFloorLampPole:${id}`,
      radiusTop: 0.03,
      radiusBottom: 0.03,
      height: 1.55,
      radialSegments: 14,
      position: { x, y: 0.82, z },
      material: this.libraryMaterials.brass,
      receiveShadow: true,
    });

    this.furniture.addCylinder({
      name: `LibraryFloorLampShade:${id}`,
      radiusTop: 0.25,
      radiusBottom: 0.42,
      height: 0.46,
      radialSegments: 28,
      position: { x, y: 1.68, z },
      material: this.libraryMaterials.lampShade,
      castShadow: true,
      receiveShadow: false,
    });

    const light = new THREE.PointLight(0xffc27a, 20, 5.5, 2);
    light.name = `LibraryFloorLampLight:${id}`;
    light.position.set(x, 1.62, z);
    light.castShadow = false;
    this.addLight(light);
  }

  addDeskLamp(id, position) {
    const baseHeight = 0.04;
    const poleHeight = 0.34;

    this.furniture.addCylinder({
      name: `LibraryDeskLampBase:${id}`,
      radiusTop: 0.16,
      radiusBottom: 0.16,
      height: baseHeight,
      radialSegments: 20,
      position,
      material: this.libraryMaterials.brass,
      receiveShadow: true,
    });

    this.furniture.addCylinder({
      name: `LibraryDeskLampStem:${id}`,
      radiusTop: 0.022,
      radiusBottom: 0.022,
      height: poleHeight,
      radialSegments: 14,
      position: {
        x: position.x,
        y: position.y + baseHeight / 2 + poleHeight / 2,
        z: position.z,
      },
      material: this.libraryMaterials.brass,
      receiveShadow: true,
    });

    this.furniture.addCylinder({
      name: `LibraryDeskLampShade:${id}`,
      radiusTop: 0.14,
      radiusBottom: 0.24,
      height: 0.22,
      radialSegments: 20,
      position: { x: position.x, y: position.y + 0.34, z: position.z },
      material: this.libraryMaterials.lampShade,
      castShadow: true,
      receiveShadow: false,
    });

    const light = new THREE.PointLight(0xffd49a, 8, 3.4, 2);
    light.name = `LibraryDeskLampLight:${id}`;
    light.position.set(position.x, position.y + 0.38, position.z);
    light.castShadow = false;
    this.addLight(light);
  }

  addDecorativePlants() {
    for (const plant of PLANTS) {
      this.furniture.addBox({
        name: `LibraryPlanter:${plant.id}`,
        size: { x: 0.58, y: 0.45, z: 0.58 },
        position: { x: plant.x, y: 0.225, z: plant.z },
        material: this.libraryMaterials.plantPot,
        castShadow: true,
        receiveShadow: true,
        collider: true,
      });

      for (const [index, offset] of [-0.16, 0, 0.16].entries()) {
        this.furniture.addBox({
          name: `LibraryPlantLeaf:${plant.id}:${index}`,
          size: { x: 0.075, y: 0.78 + index * 0.12, z: 0.075 },
          position: { x: plant.x + offset, y: 0.78, z: plant.z - offset * 0.5 },
          material: this.libraryMaterials.plantLeaf,
          castShadow: true,
          receiveShadow: false,
        });
      }
    }
  }

  addFramedArtwork() {
    for (const art of WALL_ART) {
      const artMaterial = this.createMaterial(`LibraryArtwork:${art.id}`, {
        color: art.color,
        roughness: 0.9,
        metalness: 0,
      });
      const rotation = art.wall === 'east' ? Math.PI / 2 : 0;
      const frame = this.createFlatWallBox(`LibraryArtworkFrame:${art.id}`, {
        size: { x: 1.35, y: 0.82, z: 0.045 },
        position: { x: art.x, y: art.y, z: art.z },
        material: this.libraryMaterials.frame,
        rotationY: rotation,
      });

      this.createFlatWallBox(`LibraryArtworkCanvas:${art.id}`, {
        size: { x: 1.05, y: 0.56, z: 0.052 },
        position: { x: art.x, y: art.y, z: art.z + (art.wall === 'north' ? 0.035 : 0) },
        material: artMaterial,
        rotationY: rotation,
      });

      frame.castShadow = true;
    }
  }

  createFlatWallBox(name, { size, position, material, rotationY = 0 }) {
    const mesh = new THREE.Mesh(this.getBoxGeometry(size), material);
    mesh.name = name;
    mesh.position.set(position.x, position.y, position.z);
    mesh.rotation.y = rotationY;
    mesh.castShadow = false;
    mesh.receiveShadow = true;

    return this.addMesh(mesh);
  }

  addDisplayTable() {
    const tableCenter = { x: 3.65, y: 0.56, z: 2.45 };
    const tableSize = { x: 1.8, y: 0.16, z: 1.0 };

    this.furniture.addBox({
      name: 'LibraryMagazineDisplayTable',
      size: tableSize,
      position: tableCenter,
      material: this.libraryMaterials.tableWood,
      castShadow: true,
      receiveShadow: true,
      collider: true,
    });

    this.addDisplayTableLegs(tableCenter, tableSize);

    const targets = [];

    for (const [index, offset] of [-0.46, 0, 0.46].entries()) {
      targets.push(this.furniture.addBox({
        name: `LibraryDisplayBook:${index + 1}`,
        size: { x: 0.34, y: 0.045, z: 0.5 },
        position: { x: 3.65 + offset, y: 0.66, z: 2.45 },
        material: this.bookMaterials[index % this.bookMaterials.length],
        castShadow: true,
        receiveShadow: true,
      }));
    }

    this.furniture.addBox({
      name: 'LibraryOpenBookLeftPage',
      size: { x: 0.36, y: 0.035, z: 0.46 },
      position: { x: 3.37, y: 0.705, z: 2.85 },
      material: this.libraryMaterials.page,
      castShadow: true,
      receiveShadow: true,
    });

    this.furniture.addBox({
      name: 'LibraryOpenBookRightPage',
      size: { x: 0.36, y: 0.035, z: 0.46 },
      position: { x: 3.75, y: 0.705, z: 2.85 },
      material: this.libraryMaterials.page,
      castShadow: true,
      receiveShadow: true,
    });

    this.addTvGuideBook();
    this.registerReadable(targets, 'library-display-books', READABLE_CONTENT.designNotes);
  }

  addTvGuideBook() {
    const book = this.furniture.addBox({
      name: 'LibraryTvGuideBook',
      size: TV_GUIDE_PLACEMENT.size,
      position: TV_GUIDE_PLACEMENT.position,
      material: this.libraryMaterials.tvGuide,
      castShadow: true,
      receiveShadow: true,
    });

    const cover = this.addBookCoverText('LibraryTvGuideBookCoverText', {
      text: 'TV GUIDE',
      width: TV_GUIDE_PLACEMENT.cover.width,
      height: TV_GUIDE_PLACEMENT.cover.height,
      position: {
        x: TV_GUIDE_PLACEMENT.position.x,
        y: TV_GUIDE_PLACEMENT.position.y + TV_GUIDE_PLACEMENT.coverOffsetY,
        z: TV_GUIDE_PLACEMENT.position.z,
      },
    });

    this.registerInteractable([book, cover], {
      id: 'library-tv-guide-book',
      range: TV_GUIDE_READ_RANGE,
      prompt: 'Read TV Guide',
      onInteract: ({ contentManager, roomManager }) => this.openTvGuide(contentManager, roomManager),
    });
  }

  addBookCoverText(name, { text, width, height, position }) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    context.fillStyle = '#102a42';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = '#f4d06f';
    context.lineWidth = 14;
    context.strokeRect(28, 28, canvas.width - 56, canvas.height - 56);
    context.fillStyle = '#f7f1d0';
    context.font = '800 74px Inter, Segoe UI, Arial, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2 + 4);

    const texture = this.trackTexture(new THREE.CanvasTexture(canvas));
    texture.colorSpace = THREE.SRGBColorSpace;

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    material.name = `${this.name}:${name}:Material`;
    this.materials.set(name, material);

    const geometry = new THREE.PlaneGeometry(width, height);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.position.set(position.x, position.y, position.z);
    mesh.rotation.x = -Math.PI / 2;
    mesh.renderOrder = 2;

    return this.addMesh(mesh, { disposeGeometry: true });
  }

  addDisplayTableLegs(center, tableSize) {
    const legHeight = 0.52;
    const xSpan = tableSize.x - 0.32;
    const zSpan = tableSize.z - 0.28;

    for (const xOffset of [-xSpan / 2, xSpan / 2]) {
      for (const zOffset of [-zSpan / 2, zSpan / 2]) {
        this.furniture.addBox({
          name: `LibraryMagazineDisplayTableLeg:${xOffset}:${zOffset}`,
          size: { x: 0.09, y: legHeight, z: 0.09 },
          position: {
            x: center.x + xOffset,
            y: legHeight / 2,
            z: center.z + zOffset,
          },
          material: this.libraryMaterials.darkWood,
          castShadow: true,
          receiveShadow: true,
        });
      }
    }
  }

  registerReadable(targets, id, content) {
    this.registerInteractable(targets, {
      id,
      range: BOOK_READ_RANGE,
      prompt: 'Read Book',
      onInteract: ({ contentManager }) => this.openContentPanel(contentManager, content),
    });
  }

  openContentPanel(contentManager, content) {
    contentManager?.open({
      title: content.title,
      body: content.body,
    });
  }

  openTvGuide(contentManager, roomManager) {
    roomManager?.markBroadcastGuideRead();
    const accessCode = roomManager?.getFormattedBroadcastAccessCode() ?? '---- - ----';

    contentManager?.open({
      title: 'TV Guide',
      body: [
        'Late Night Broadcast Access',
        `Access Code: ${accessCode}`,
        'Use this code on the small television hidden somewhere in The Forgotten Level.',
      ],
      footer: 'Remember the code, then press E to close.',
    });
  }

  configureAudio(audioManager) {
    this.audioManager = audioManager;

    if (!audioManager || this.roomAudioConfigured) {
      return;
    }

    const audioConfig = AUDIO_CONFIG.library;
    this.hvacAudio = this.createRoomAudioSource(audioManager, audioConfig.hvac);
    this.pageTurnsAudio = this.createRoomAudioSource(audioManager, audioConfig.pageTurns);
    this.chairCreaksAudio = this.createRoomAudioSource(audioManager, audioConfig.chairCreaks);
    this.lampBuzzAudio = this.createRoomAudioSource(audioManager, audioConfig.lampBuzz);
    this.roomAudioConfigured = true;
  }

  createRoomAudioSource(audioManager, sourceConfig) {
    return audioManager.createPositionalLoop({
      ...sourceConfig,
      roomId: this.id,
      position: this.toWorldPosition(sourceConfig.position),
    });
  }
}
