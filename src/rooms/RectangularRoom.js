import * as THREE from 'three';
import { RoomBoundsCollider } from '../collision/RoomBoundsCollider.js';
import { Room } from './Room.js';
import { RoomLabel } from './RoomLabel.js';

const WALL_NAMES = Object.freeze(['north', 'south', 'east', 'west']);

export class RectangularRoom extends Room {
  constructor(scene, collisionSystem, config) {
    super(scene, collisionSystem, config);

    this.floorMaterial = this.createMaterial('Floor', config.materials.floor);
    this.wallMaterial = this.createMaterial('Wall', config.materials.wall);
    this.ceilingMaterial = this.createMaterial('Ceiling', config.materials.ceiling);
    this.trimMaterial = this.createMaterial('Trim', config.materials.trim);

    this.build();
  }

  build() {
    this.addRoomBounds();
    this.addFloor();
    this.addCeiling();
    this.addWalls();
    this.addBaseboards();
    this.addOpeningLabels();
    this.addLighting(this.config.lighting);
  }

  addRoomBounds() {
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

  addFloor() {
    const { width, length, floorThickness, wallThickness } = this.config.dimensions;
    const floorSize = this.config.floorSize ?? {
      x: width + wallThickness * 2,
      z: length + wallThickness * 2,
    };

    this.addBox({
      name: `${this.name}Floor`,
      size: {
        x: floorSize.x,
        y: floorThickness,
        z: floorSize.z,
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
      name: `${this.name}Ceiling`,
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
    for (const wallName of this.getEnabledWalls()) {
      this.addWall(wallName);
    }
  }

  addWall(wallName) {
    const fullHeightSegments = this.getSolidSegments(wallName);

    for (const segment of fullHeightSegments) {
      this.addWallSegment({
        wallName,
        name: `${this.name}Wall:${wallName}:segment`,
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
      name: `${this.name}Wall:${wallName}:${opening.id}:header`,
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
    for (const wallName of this.getEnabledWalls()) {
      for (const segment of this.getSolidSegments(wallName)) {
        this.addBaseboardSegment(wallName, segment);
      }
    }
  }

  addBaseboardSegment(wallName, segment) {
    const { height } = this.config.baseboard;

    this.addBox({
      name: `${this.name}Baseboard:${wallName}`,
      size: this.getBaseboardSegmentSize(wallName, segment.end - segment.start),
      position: this.getBaseboardSegmentPosition(wallName, (segment.start + segment.end) / 2, height / 2),
      material: this.trimMaterial,
      castShadow: true,
      receiveShadow: true,
    });
  }

  addOpeningLabels() {
    for (const opening of this.config.openings.entries) {
      if (!opening.label) {
        continue;
      }

      this.addLabel(new RoomLabel({
        text: opening.label,
        width: this.config.openings.labelWidth,
        height: this.config.openings.labelHeight,
        position: this.getLabelPosition(opening),
        rotationY: this.getLabelRotation(opening.wall),
      }));
    }
  }

  addLighting(lightingConfig) {
    if (!lightingConfig) {
      return;
    }

    if (lightingConfig.hemisphere) {
      this.addHemisphereLight(lightingConfig.hemisphere);
    }

    if (lightingConfig.directional) {
      this.addDirectionalLight(lightingConfig.directional);
    }

    if (lightingConfig.ceilingPointLights) {
      this.addCeilingPointLights(lightingConfig.ceilingPointLights);
    }
  }

  addHemisphereLight(config) {
    const light = new THREE.HemisphereLight(config.skyColor, config.groundColor, config.intensity);
    light.name = `${this.name}HemisphereLight`;
    light.position.set(config.position.x, config.position.y, config.position.z);
    this.addLight(light);
  }

  addDirectionalLight(config) {
    const light = new THREE.DirectionalLight(config.color, config.intensity);
    light.name = `${this.name}DirectionalLight`;
    light.position.set(config.position.x, config.position.y, config.position.z);
    light.target.position.set(config.target.x, config.target.y, config.target.z);
    light.castShadow = true;
    light.shadow.mapSize.set(config.shadowMapSize, config.shadowMapSize);
    light.shadow.camera.near = config.shadowCameraNear;
    light.shadow.camera.far = config.shadowCameraFar;
    light.shadow.camera.left = -config.shadowCameraSize;
    light.shadow.camera.right = config.shadowCameraSize;
    light.shadow.camera.top = config.shadowCameraSize;
    light.shadow.camera.bottom = -config.shadowCameraSize;
    light.shadow.bias = config.shadowBias;

    this.addLight(light);
    this.addLight(light.target);
  }

  addCeilingPointLights(config) {
    const y = this.config.dimensions.height - config.heightOffset;

    for (const [index, position] of config.positions.entries()) {
      const light = new THREE.PointLight(config.color, config.intensity, config.distance, config.decay);
      light.name = `${this.name}CeilingPointLight:${index + 1}`;
      light.position.set(position.x, y, position.z);
      light.castShadow = true;
      light.shadow.mapSize.set(config.shadowMapSize, config.shadowMapSize);
      light.shadow.bias = config.shadowBias;
      this.addLight(light);
    }
  }

  getEnabledWalls() {
    const omittedWalls = new Set(this.config.omittedWalls ?? []);
    return WALL_NAMES.filter((wallName) => !omittedWalls.has(wallName));
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
      const openingWidth = opening.width ?? this.config.openings.width;
      const openingStart = Math.max(-halfSpan, opening.center - openingWidth / 2);
      const openingEnd = Math.min(halfSpan, opening.center + openingWidth / 2);

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
