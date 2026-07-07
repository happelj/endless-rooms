import { LOBBY_ROOM_CONFIG } from '../config/constants.js';
import { RoomBoundsCollider } from '../collision/RoomBoundsCollider.js';
import { Room } from './Room.js';
import { RoomLabel } from './RoomLabel.js';

const WALL_NAMES = Object.freeze(['north', 'south', 'east', 'west']);

export class LobbyRoom extends Room {
  constructor(scene, collisionSystem, config = LOBBY_ROOM_CONFIG) {
    super(scene, collisionSystem, config);

    this.floorMaterial = this.createMaterial('CommercialCarpet', config.materials.floor);
    this.wallMaterial = this.createMaterial('PaintedWall', config.materials.wall);
    this.ceilingMaterial = this.createMaterial('Ceiling', config.materials.ceiling);
    this.trimMaterial = this.createMaterial('BaseboardTrim', config.materials.trim);

    this.build();
  }

  build() {
    this.addRoomBounds();
    this.addFloor();
    this.addCeiling();
    this.addWalls();
    this.addBaseboards();
    this.addOpeningLabels();
  }

  addRoomBounds() {
    const { width, length, height } = this.config.dimensions;

    this.addBoundsCollider(new RoomBoundsCollider({
      name: 'LobbyBoundsCollider',
      minX: -width / 2,
      maxX: width / 2,
      minY: 0,
      maxY: height,
      minZ: -length / 2,
      maxZ: length / 2,
    }));
  }

  addFloor() {
    const { width, length, wallThickness, floorThickness } = this.config.dimensions;

    this.addBox({
      name: 'LobbyFloor',
      size: {
        x: width + wallThickness * 2,
        y: floorThickness,
        z: length + wallThickness * 2,
      },
      position: { x: 0, y: -floorThickness / 2, z: 0 },
      material: this.floorMaterial,
      castShadow: false,
      receiveShadow: true,
    });
  }

  addCeiling() {
    const { width, length, height, wallThickness, ceilingThickness } = this.config.dimensions;

    this.addBox({
      name: 'LobbyCeiling',
      size: {
        x: width + wallThickness * 2,
        y: ceilingThickness,
        z: length + wallThickness * 2,
      },
      position: { x: 0, y: height + ceilingThickness / 2, z: 0 },
      material: this.ceilingMaterial,
      castShadow: true,
      receiveShadow: true,
    });
  }

  addWalls() {
    for (const wallName of WALL_NAMES) {
      this.addWall(wallName);
    }
  }

  addWall(wallName) {
    const fullHeightSegments = this.getSolidSegments(wallName);

    for (const segment of fullHeightSegments) {
      this.addWallSegment({
        wallName,
        name: `LobbyWall:${wallName}:segment`,
        centerAlongSpan: (segment.start + segment.end) / 2,
        spanLength: segment.end - segment.start,
        height: this.config.dimensions.height,
        centerY: this.config.dimensions.height / 2,
      });
    }

    for (const opening of this.getOpeningsForWall(wallName)) {
      this.addOpeningHeader(wallName, opening);
    }
  }

  addOpeningHeader(wallName, opening) {
    const lintelHeight = this.config.dimensions.height - this.config.openings.height;

    this.addWallSegment({
      wallName,
      name: `LobbyWall:${wallName}:${opening.id}:header`,
      centerAlongSpan: opening.center,
      spanLength: this.config.openings.width,
      height: lintelHeight,
      centerY: this.config.openings.height + lintelHeight / 2,
    });
  }

  addWallSegment({ wallName, name, centerAlongSpan, spanLength, height, centerY }) {
    this.addBox({
      name,
      size: this.getWallSegmentSize(wallName, spanLength, height),
      position: this.getWallSegmentPosition(wallName, centerAlongSpan, centerY),
      material: this.wallMaterial,
      castShadow: true,
      receiveShadow: true,
      collider: true,
    });
  }

  addBaseboards() {
    for (const wallName of WALL_NAMES) {
      for (const segment of this.getSolidSegments(wallName)) {
        this.addBaseboardSegment(wallName, segment);
      }
    }
  }

  addBaseboardSegment(wallName, segment) {
    const { height, depth } = this.config.baseboard;

    this.addBox({
      name: `LobbyBaseboard:${wallName}`,
      size: this.getBaseboardSegmentSize(wallName, segment.end - segment.start),
      position: this.getBaseboardSegmentPosition(wallName, (segment.start + segment.end) / 2, height / 2),
      material: this.trimMaterial,
      castShadow: true,
      receiveShadow: true,
    });
  }

  addOpeningLabels() {
    for (const opening of this.config.openings.entries) {
      this.addLabel(new RoomLabel({
        text: opening.label,
        width: this.config.openings.labelWidth,
        height: this.config.openings.labelHeight,
        position: this.getLabelPosition(opening),
        rotationY: this.getLabelRotation(opening.wall),
      }));
    }
  }

  getOpeningsForWall(wallName) {
    return this.config.openings.entries
      .filter((opening) => opening.wall === wallName)
      .sort((a, b) => a.center - b.center);
  }

  getSolidSegments(wallName) {
    const spanLength = this.getWallSpanLength(wallName);
    const halfSpan = spanLength / 2;
    const openings = this.getOpeningsForWall(wallName);
    const segments = [];
    let cursor = -halfSpan;

    for (const opening of openings) {
      const openingStart = Math.max(-halfSpan, opening.center - this.config.openings.width / 2);
      const openingEnd = Math.min(halfSpan, opening.center + this.config.openings.width / 2);

      if (openingStart > cursor) {
        segments.push({ start: cursor, end: openingStart });
      }

      cursor = Math.max(cursor, openingEnd);
    }

    if (cursor < halfSpan) {
      segments.push({ start: cursor, end: halfSpan });
    }

    return segments;
  }

  getWallSegmentSize(wallName, spanLength, height) {
    const { wallThickness } = this.config.dimensions;

    if (this.isNorthSouthWall(wallName)) {
      return { x: spanLength, y: height, z: wallThickness };
    }

    return { x: wallThickness, y: height, z: spanLength };
  }

  getWallSegmentPosition(wallName, centerAlongSpan, centerY) {
    const { width, length, wallThickness } = this.config.dimensions;
    const wallOffset = wallThickness / 2;

    switch (wallName) {
      case 'north':
        return { x: centerAlongSpan, y: centerY, z: -length / 2 - wallOffset };
      case 'south':
        return { x: centerAlongSpan, y: centerY, z: length / 2 + wallOffset };
      case 'east':
        return { x: width / 2 + wallOffset, y: centerY, z: centerAlongSpan };
      case 'west':
        return { x: -width / 2 - wallOffset, y: centerY, z: centerAlongSpan };
      default:
        throw new Error(`Unknown wall name: ${wallName}`);
    }
  }

  getBaseboardSegmentSize(wallName, spanLength) {
    const { height, depth } = this.config.baseboard;

    if (this.isNorthSouthWall(wallName)) {
      return { x: spanLength, y: height, z: depth };
    }

    return { x: depth, y: height, z: spanLength };
  }

  getBaseboardSegmentPosition(wallName, centerAlongSpan, centerY) {
    const { width, length } = this.config.dimensions;
    const { depth } = this.config.baseboard;

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
        throw new Error(`Unknown wall name: ${wallName}`);
    }
  }

  getLabelPosition(opening) {
    const { width, length } = this.config.dimensions;
    const { labelElevation, labelInset } = this.config.openings;

    switch (opening.wall) {
      case 'north':
        return { x: opening.center, y: labelElevation, z: -length / 2 + labelInset };
      case 'south':
        return { x: opening.center, y: labelElevation, z: length / 2 - labelInset };
      case 'east':
        return { x: width / 2 - labelInset, y: labelElevation, z: opening.center };
      case 'west':
        return { x: -width / 2 + labelInset, y: labelElevation, z: opening.center };
      default:
        throw new Error(`Unknown opening wall: ${opening.wall}`);
    }
  }

  getLabelRotation(wallName) {
    switch (wallName) {
      case 'north':
        return 0;
      case 'south':
        return Math.PI;
      case 'east':
        return -Math.PI / 2;
      case 'west':
        return Math.PI / 2;
      default:
        throw new Error(`Unknown label wall: ${wallName}`);
    }
  }

  getWallSpanLength(wallName) {
    return this.isNorthSouthWall(wallName)
      ? this.config.dimensions.width
      : this.config.dimensions.length;
  }

  isNorthSouthWall(wallName) {
    return wallName === 'north' || wallName === 'south';
  }
}
