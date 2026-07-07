export const APP_METADATA = Object.freeze({
  title: 'Endless Rooms',
  version: '0.3',
  stepLabel: 'Step 3 - Lobby Room Shell',
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

export const FLOOR_CONFIG = Object.freeze({
  size: 72,
  color: 0x8f969d,
  roughness: 0.88,
  metalness: 0,
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
  name: 'Lobby',
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
      Object.freeze({ id: 'aquarium', label: 'Aquarium', wall: 'north', center: 0, isMain: true }),
      Object.freeze({ id: 'library', label: 'Library', wall: 'east', center: -4.6 }),
      Object.freeze({ id: 'tom-jerry', label: 'Tom & Jerry', wall: 'east', center: 4.6 }),
      Object.freeze({ id: 'yosemite', label: 'Yosemite', wall: 'south', center: 0 }),
      Object.freeze({ id: 'space-station', label: 'Space Station', wall: 'west', center: 0 }),
    ]),
  }),
});

export const HUD_PLACEHOLDERS = Object.freeze({
  fps: '--',
  room: 'Lobby',
});
