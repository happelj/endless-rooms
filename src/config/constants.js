export const APP_METADATA = Object.freeze({
  title: 'Endless Rooms',
  version: '0.4',
  stepLabel: 'Step 4 - Room Portals',
});

export const SCENE_CONFIG = Object.freeze({
  backgroundColor: 0x9aa9b5,
});

export const ROOM_DIMENSIONS = Object.freeze({
  width: 18,
  length: 18,
  height: 4,
  wallThickness: 0.35,
  floorThickness: 0.18,
  ceilingThickness: 0.22,
});

export const CAMERA_CONFIG = Object.freeze({
  fieldOfView: 60,
  near: 0.1,
  far: 500,
  startPosition: Object.freeze({ x: 0, y: 1.7, z: 0 }),
  lookAt: Object.freeze({ x: 0, y: 1.6, z: -ROOM_DIMENSIONS.length / 2 }),
});

export const RENDERER_CONFIG = Object.freeze({
  clearColor: 0xb9c4cd,
  maxPixelRatio: 2,
});

export const LIGHTING_CONFIG = Object.freeze({
  hemisphere: Object.freeze({
    skyColor: 0xf6f8fb,
    groundColor: 0x8a8277,
    intensity: 0.9,
    position: Object.freeze({ x: 0, y: 24, z: 0 }),
  }),
  directional: Object.freeze({
    color: 0xfff7e8,
    intensity: 0.75,
    position: Object.freeze({ x: -10, y: 12, z: 8 }),
    target: Object.freeze({ x: 0, y: 0, z: 0 }),
    shadowMapSize: 2048,
    shadowCameraSize: 24,
    shadowCameraNear: 1,
    shadowCameraFar: 48,
    shadowBias: -0.00012,
  }),
  ceilingPointLights: Object.freeze({
    color: 0xffefd4,
    intensity: 42,
    distance: 13,
    decay: 2,
    heightOffset: 0.38,
    shadowMapSize: 512,
    shadowBias: -0.00025,
    positions: Object.freeze([
      Object.freeze({ x: -5.2, z: -5.2 }),
      Object.freeze({ x: 5.2, z: -5.2 }),
      Object.freeze({ x: -5.2, z: 5.2 }),
      Object.freeze({ x: 5.2, z: 5.2 }),
      Object.freeze({ x: 0, z: 0 }),
    ]),
  }),
});

export const TEST_ROOM_DIMENSIONS = Object.freeze({
  width: 14,
  length: 14,
  height: 4,
  wallThickness: 0.35,
  floorThickness: 0.18,
  ceilingThickness: 0.22,
});

export const ROOM_IDS = Object.freeze({
  lobby: 'lobby',
  testRoom: 'test-room',
});

export const TEST_ROOM_ORIGIN = Object.freeze({
  x: 0,
  y: 0,
  z: -ROOM_DIMENSIONS.length / 2 - ROOM_DIMENSIONS.wallThickness - TEST_ROOM_DIMENSIONS.length / 2,
});

export const PLAYER_CONFIG = Object.freeze({
  spawnPosition: Object.freeze({ x: 0, y: 1.7, z: 0 }),
  lookAt: Object.freeze({ x: 0, y: 1.6, z: -ROOM_DIMENSIONS.length / 2 }),
  body: Object.freeze({
    radius: 0.35,
    height: 1.8,
    eyeHeight: 1.7,
  }),
  pointer: Object.freeze({
    speed: 0.9,
    minPolarAngle: 0.05,
    maxPolarAngle: Math.PI - 0.05,
    useRawMouseInput: false,
  }),
  movement: Object.freeze({
    walkSpeed: 4.4,
    sprintMultiplier: 1.75,
    acceleration: 14,
    stopEpsilon: 0.001,
    keys: Object.freeze({
      forward: Object.freeze(['KeyW']),
      backward: Object.freeze(['KeyS']),
      left: Object.freeze(['KeyA']),
      right: Object.freeze(['KeyD']),
      sprint: Object.freeze(['ShiftLeft']),
    }),
  }),
});

export const LOBBY_ROOM_CONFIG = Object.freeze({
  id: ROOM_IDS.lobby,
  name: 'Lobby',
  origin: Object.freeze({ x: 0, y: 0, z: 0 }),
  dimensions: ROOM_DIMENSIONS,
  materials: Object.freeze({
    floor: Object.freeze({
      color: 0x657075,
      roughness: 0.96,
      metalness: 0,
    }),
    wall: Object.freeze({
      color: 0xd9dce0,
      roughness: 0.82,
      metalness: 0,
    }),
    ceiling: Object.freeze({
      color: 0xf0f1ec,
      roughness: 0.9,
      metalness: 0,
    }),
    trim: Object.freeze({
      color: 0xf7f7f4,
      roughness: 0.72,
      metalness: 0,
    }),
  }),
  baseboard: Object.freeze({
    height: 0.18,
    depth: 0.08,
  }),
  openings: Object.freeze({
    width: 2.4,
    height: 2.7,
    labelWidth: 2.7,
    labelHeight: 0.5,
    labelElevation: 3.14,
    labelInset: 0.12,
    entries: Object.freeze([
      Object.freeze({ id: 'test-room', label: 'Test Room', wall: 'north', center: 0, isMain: true }),
      Object.freeze({ id: 'library', label: 'Library', wall: 'east', center: -4.6 }),
      Object.freeze({ id: 'tom-jerry', label: 'Tom & Jerry', wall: 'east', center: 4.6 }),
      Object.freeze({ id: 'yosemite', label: 'Yosemite', wall: 'south', center: 0 }),
      Object.freeze({ id: 'space-station', label: 'Space Station', wall: 'west', center: 0 }),
    ]),
  }),
  lighting: LIGHTING_CONFIG,
});

export const TEST_ROOM_CONFIG = Object.freeze({
  id: ROOM_IDS.testRoom,
  name: 'Test Room',
  origin: TEST_ROOM_ORIGIN,
  dimensions: TEST_ROOM_DIMENSIONS,
  omittedWalls: Object.freeze(['south']),
  floorSize: Object.freeze({
    x: TEST_ROOM_DIMENSIONS.width,
    z: TEST_ROOM_DIMENSIONS.length,
  }),
  materials: Object.freeze({
    floor: Object.freeze({
      color: 0x6c7780,
      roughness: 0.94,
      metalness: 0,
    }),
    wall: Object.freeze({
      color: 0xd2d6da,
      roughness: 0.86,
      metalness: 0,
    }),
    ceiling: Object.freeze({
      color: 0xebede8,
      roughness: 0.92,
      metalness: 0,
    }),
    trim: Object.freeze({
      color: 0xf4f4f0,
      roughness: 0.74,
      metalness: 0,
    }),
  }),
  baseboard: Object.freeze({
    height: 0.18,
    depth: 0.08,
  }),
  openings: Object.freeze({
    width: 2.4,
    height: 2.7,
    labelWidth: 2.7,
    labelHeight: 0.5,
    labelElevation: 3.14,
    labelInset: 0.12,
    entries: Object.freeze([]),
  }),
  lighting: Object.freeze({
    hemisphere: Object.freeze({
      skyColor: 0xf2f6fb,
      groundColor: 0x6f7378,
      intensity: 0.7,
      position: Object.freeze({ x: 0, y: 18, z: 0 }),
    }),
    directional: Object.freeze({
      color: 0xffffff,
      intensity: 0.45,
      position: Object.freeze({ x: 5, y: 9, z: 4 }),
      target: Object.freeze({ x: 0, y: 1, z: 0 }),
      shadowMapSize: 1024,
      shadowCameraSize: 18,
      shadowCameraNear: 1,
      shadowCameraFar: 32,
      shadowBias: -0.00012,
    }),
    ceilingPointLights: Object.freeze({
      color: 0xfff0d6,
      intensity: 30,
      distance: 10,
      decay: 2,
      heightOffset: 0.42,
      shadowMapSize: 512,
      shadowBias: -0.00022,
      positions: Object.freeze([
        Object.freeze({ x: -3.8, z: -3.8 }),
        Object.freeze({ x: 3.8, z: -3.8 }),
        Object.freeze({ x: -3.8, z: 3.8 }),
        Object.freeze({ x: 3.8, z: 3.8 }),
      ]),
    }),
  }),
});

export const PORTAL_CONFIGS = Object.freeze([
  Object.freeze({
    id: 'lobby-to-test-room',
    sourceRoom: ROOM_IDS.lobby,
    destinationRoom: ROOM_IDS.testRoom,
    continuous: true,
    spawnPosition: Object.freeze({ x: 0, y: PLAYER_CONFIG.body.eyeHeight, z: TEST_ROOM_ORIGIN.z + TEST_ROOM_DIMENSIONS.length / 2 - 1.1 }),
    spawnRotation: Object.freeze({ y: 0 }),
    doorway: Object.freeze({
      wall: 'north',
      center: 0,
      width: LOBBY_ROOM_CONFIG.openings.width,
      height: LOBBY_ROOM_CONFIG.openings.height,
    }),
    triggerVolume: Object.freeze({
      center: Object.freeze({ x: 0, y: LOBBY_ROOM_CONFIG.openings.height / 2, z: -ROOM_DIMENSIONS.length / 2 - ROOM_DIMENSIONS.wallThickness - 0.18 }),
      size: Object.freeze({ x: 2.05, y: LOBBY_ROOM_CONFIG.openings.height, z: 0.46 }),
    }),
  }),
  Object.freeze({
    id: 'test-room-to-lobby',
    sourceRoom: ROOM_IDS.testRoom,
    destinationRoom: ROOM_IDS.lobby,
    continuous: true,
    spawnPosition: Object.freeze({ x: 0, y: PLAYER_CONFIG.body.eyeHeight, z: -ROOM_DIMENSIONS.length / 2 + 1.1 }),
    spawnRotation: Object.freeze({ y: Math.PI }),
    doorway: Object.freeze({
      wall: 'south',
      center: 0,
      width: LOBBY_ROOM_CONFIG.openings.width,
      height: LOBBY_ROOM_CONFIG.openings.height,
    }),
    triggerVolume: Object.freeze({
      center: Object.freeze({ x: 0, y: LOBBY_ROOM_CONFIG.openings.height / 2, z: -ROOM_DIMENSIONS.length / 2 - 0.18 }),
      size: Object.freeze({ x: 2.05, y: LOBBY_ROOM_CONFIG.openings.height, z: 0.46 }),
    }),
  }),
]);

export const ROOM_MANAGER_CONFIG = Object.freeze({
  initialRoomId: ROOM_IDS.lobby,
});

export const HUD_PLACEHOLDERS = Object.freeze({
  fps: '--',
  room: 'Lobby',
  portalCount: '--',
  connectedRooms: '--',
});
