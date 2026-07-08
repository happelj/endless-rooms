export const APP_METADATA = Object.freeze({
  title: 'Endless Rooms',
  version: '1.1.1',
  stepLabel: 'Step 11.1 - Yosemite Landmark',
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

export const TOM_AND_JERRY_ROOM_DIMENSIONS = Object.freeze({
  width: 16,
  length: 14,
  height: 4.2,
  wallThickness: 0.35,
  floorThickness: 0.18,
  ceilingThickness: 0.22,
});

export const AQUARIUM_ROOM_DIMENSIONS = Object.freeze({
  width: 18,
  length: 15,
  height: 4.6,
  wallThickness: 0.35,
  floorThickness: 0.18,
  ceilingThickness: 0.22,
});

export const LIBRARY_ROOM_DIMENSIONS = Object.freeze({
  width: 15,
  length: 10,
  height: 4.3,
  wallThickness: 0.35,
  floorThickness: 0.18,
  ceilingThickness: 0.22,
});

export const YOSEMITE_ROOM_DIMENSIONS = Object.freeze({
  width: 34,
  length: 38,
  height: 18,
  wallThickness: 0.35,
  floorThickness: 0.18,
  ceilingThickness: 0.22,
});

export const ROOM_IDS = Object.freeze({
  lobby: 'lobby',
  testRoom: 'test-room',
  tomAndJerry: 'tom-and-jerry-room',
  aquarium: 'aquarium-room',
  library: 'library-room',
  yosemite: 'yosemite-room',
});

export const TEST_ROOM_ORIGIN = Object.freeze({
  x: 0,
  y: 0,
  z: -ROOM_DIMENSIONS.length / 2 - ROOM_DIMENSIONS.wallThickness - TEST_ROOM_DIMENSIONS.length / 2,
});

export const LOBBY_OPENING_CENTERS = Object.freeze({
  testRoom: 0,
  library: -4.6,
  tomAndJerry: 4.6,
  aquarium: -4.6,
  yosemite: 0,
  spaceStation: 4.6,
});

export const TOM_AND_JERRY_ROOM_ORIGIN = Object.freeze({
  x: ROOM_DIMENSIONS.width / 2 + ROOM_DIMENSIONS.wallThickness + TOM_AND_JERRY_ROOM_DIMENSIONS.width / 2,
  y: 0,
  z: LOBBY_OPENING_CENTERS.tomAndJerry,
});

export const AQUARIUM_ROOM_ORIGIN = Object.freeze({
  x: -ROOM_DIMENSIONS.width / 2 - ROOM_DIMENSIONS.wallThickness - AQUARIUM_ROOM_DIMENSIONS.width / 2,
  y: 0,
  z: LOBBY_OPENING_CENTERS.aquarium,
});

export const LIBRARY_ROOM_DOOR_CENTER = LIBRARY_ROOM_DIMENSIONS.length / 2 - 1.4;

export const LIBRARY_ROOM_ORIGIN = Object.freeze({
  x: ROOM_DIMENSIONS.width / 2 + ROOM_DIMENSIONS.wallThickness + LIBRARY_ROOM_DIMENSIONS.width / 2,
  y: 0,
  z: LOBBY_OPENING_CENTERS.library - LIBRARY_ROOM_DOOR_CENTER,
});

export const YOSEMITE_ROOM_ORIGIN = Object.freeze({
  x: 0,
  y: 0,
  z: ROOM_DIMENSIONS.length / 2 + ROOM_DIMENSIONS.wallThickness + YOSEMITE_ROOM_DIMENSIONS.length / 2,
});

export const PLAYER_CONFIG = Object.freeze({
  spawnPosition: Object.freeze({ x: 0, y: 1.7, z: 0 }),
  lookAt: Object.freeze({ x: 0, y: 1.6, z: -ROOM_DIMENSIONS.length / 2 }),
  body: Object.freeze({
    radius: 0.35,
    height: 1.8,
    eyeHeight: 1.7,
  }),
  physics: Object.freeze({
    gravity: 18,
    maxFallSpeed: 42,
    groundedSnapDistance: 0.18,
    floorTolerance: 0.02,
    verticalStopEpsilon: 0.001,
    maxDeltaTime: 0.05,
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

export const INTERACTION_CONFIG = Object.freeze({
  maxDistance: 3.2,
  primaryActionLabel: 'E',
  keys: Object.freeze({
    interact: Object.freeze(['KeyE']),
  }),
});

export const TV_CONFIG = Object.freeze({
  video: Object.freeze({
    src: '/videos/Tom-and-Jerry.mp4',
    loop: true,
    defaultVolume: 0.45,
    volumeStep: 0.1,
  }),
  spatialAudio: Object.freeze({
    referenceDistance: 2,
    maxDistance: 9,
    minMultiplier: 0.18,
  }),
  effects: Object.freeze({
    displayMinIntensity: 0.92,
    displayMaxIntensity: 1.04,
    glowBaseOpacity: 0.12,
    glowFlickerOpacity: 0.035,
    scanlineOpacity: 0.16,
    flickerPrimaryRate: 15,
    flickerSecondaryRate: 37,
  }),
});

export const AUDIO_CONFIG = Object.freeze({
  masterVolume: 0.9,
  tomAndJerry: Object.freeze({
    hvac: Object.freeze({
      id: 'tom-and-jerry-room-hvac',
      kind: 'noise',
      volume: 0.014,
      position: Object.freeze({ x: 0, y: 3.45, z: 0 }),
      panner: Object.freeze({
        refDistance: 5,
        maxDistance: 18,
        rolloffFactor: 0.65,
      }),
      filter: Object.freeze({
        type: 'lowpass',
        frequency: 520,
        q: 0.45,
      }),
    }),
    crtHum: Object.freeze({
      id: 'tom-and-jerry-room-crt-hum',
      kind: 'oscillator',
      waveform: 'sine',
      frequency: 60,
      volume: 0.005,
      position: Object.freeze({ x: 6.28, y: 1.32, z: 0 }),
      panner: Object.freeze({
        refDistance: 1.2,
        maxDistance: 7,
        rolloffFactor: 1.8,
      }),
    }),
    crtCabinetHum: Object.freeze({
      id: 'tom-and-jerry-room-crt-cabinet-hum',
      kind: 'oscillator',
      waveform: 'triangle',
      frequency: 118,
      volume: 0.0022,
      position: Object.freeze({ x: 6.28, y: 1.25, z: 0 }),
      panner: Object.freeze({
        refDistance: 1,
        maxDistance: 5.8,
        rolloffFactor: 1.9,
      }),
    }),
    floorLampBuzz: Object.freeze({
      id: 'tom-and-jerry-room-floor-lamp-buzz',
      kind: 'oscillator',
      waveform: 'sine',
      frequency: 120,
      volume: 0.0028,
      position: Object.freeze({ x: -3.8, y: 1.7, z: -3.75 }),
      panner: Object.freeze({
        refDistance: 0.9,
        maxDistance: 5.2,
        rolloffFactor: 1.7,
      }),
    }),
  }),
  aquarium: Object.freeze({
    roomAmbience: Object.freeze({
      id: 'aquarium-room-gallery-ambience',
      kind: 'noise',
      volume: 0.01,
      position: Object.freeze({ x: 0, y: 2.5, z: 0 }),
      panner: Object.freeze({
        refDistance: 5,
        maxDistance: 18,
        rolloffFactor: 0.55,
      }),
      filter: Object.freeze({
        type: 'lowpass',
        frequency: 680,
        q: 0.35,
      }),
    }),
    tankBubbles: Object.freeze({
      id: 'aquarium-room-tank-bubbles',
      kind: 'noise',
      volume: 0.018,
      position: Object.freeze({ x: 0, y: 1.7, z: -5.7 }),
      panner: Object.freeze({
        refDistance: 1.6,
        maxDistance: 10,
        rolloffFactor: 1.55,
      }),
      filter: Object.freeze({
        type: 'bandpass',
        frequency: 920,
        q: 0.85,
      }),
    }),
    waterPump: Object.freeze({
      id: 'aquarium-room-water-pump',
      kind: 'oscillator',
      waveform: 'sine',
      frequency: 86,
      volume: 0.0045,
      position: Object.freeze({ x: 5.6, y: 1.1, z: -6.2 }),
      panner: Object.freeze({
        refDistance: 1.4,
        maxDistance: 9,
        rolloffFactor: 1.65,
      }),
    }),
  }),
  library: Object.freeze({
    hvac: Object.freeze({
      id: 'library-room-hvac',
      kind: 'noise',
      volume: 0.008,
      position: Object.freeze({ x: 0, y: 3.2, z: 0 }),
      panner: Object.freeze({
        refDistance: 5,
        maxDistance: 17,
        rolloffFactor: 0.55,
      }),
      filter: Object.freeze({
        type: 'lowpass',
        frequency: 560,
        q: 0.4,
      }),
    }),
    pageTurns: Object.freeze({
      id: 'library-room-page-turns',
      kind: 'noise',
      volume: 0.0045,
      position: Object.freeze({ x: 0.2, y: 1.35, z: 0.4 }),
      panner: Object.freeze({
        refDistance: 2.1,
        maxDistance: 9,
        rolloffFactor: 1.2,
      }),
      filter: Object.freeze({
        type: 'bandpass',
        frequency: 1380,
        q: 1.1,
      }),
    }),
    chairCreaks: Object.freeze({
      id: 'library-room-chair-creaks',
      kind: 'oscillator',
      waveform: 'triangle',
      frequency: 92,
      volume: 0.002,
      position: Object.freeze({ x: -2.9, y: 0.8, z: 0.9 }),
      panner: Object.freeze({
        refDistance: 1.5,
        maxDistance: 7.5,
        rolloffFactor: 1.35,
      }),
    }),
    lampBuzz: Object.freeze({
      id: 'library-room-lamp-buzz',
      kind: 'oscillator',
      waveform: 'sine',
      frequency: 120,
      volume: 0.0018,
      position: Object.freeze({ x: 3.5, y: 1.35, z: 2.2 }),
      panner: Object.freeze({
        refDistance: 1,
        maxDistance: 6,
        rolloffFactor: 1.6,
      }),
    }),
  }),
  yosemite: Object.freeze({
    wind: Object.freeze({
      id: 'yosemite-room-wind',
      kind: 'noise',
      volume: 0.012,
      position: Object.freeze({ x: 0, y: 6.5, z: 3 }),
      panner: Object.freeze({
        refDistance: 9,
        maxDistance: 42,
        rolloffFactor: 0.35,
      }),
      filter: Object.freeze({
        type: 'lowpass',
        frequency: 760,
        q: 0.4,
      }),
    }),
    overlookWind: Object.freeze({
      id: 'yosemite-room-overlook-wind',
      kind: 'noise',
      volume: 0.018,
      position: Object.freeze({ x: 0.8, y: 2.4, z: 14.4 }),
      panner: Object.freeze({
        refDistance: 2.8,
        maxDistance: 20,
        rolloffFactor: 1.05,
      }),
      filter: Object.freeze({
        type: 'bandpass',
        frequency: 820,
        q: 0.55,
      }),
    }),
    birds: Object.freeze({
      id: 'yosemite-room-birds',
      kind: 'oscillator',
      waveform: 'sine',
      frequency: 720,
      volume: 0.0018,
      position: Object.freeze({ x: -8.5, y: 5.5, z: 6 }),
      panner: Object.freeze({
        refDistance: 4,
        maxDistance: 26,
        rolloffFactor: 0.8,
      }),
    }),
    water: Object.freeze({
      id: 'yosemite-room-distant-water',
      kind: 'noise',
      volume: 0.011,
      position: Object.freeze({ x: 8, y: 0.6, z: 9 }),
      panner: Object.freeze({
        refDistance: 2.4,
        maxDistance: 18,
        rolloffFactor: 1.25,
      }),
      filter: Object.freeze({
        type: 'bandpass',
        frequency: 620,
        q: 0.8,
      }),
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
      Object.freeze({ id: ROOM_IDS.testRoom, label: 'Test Room', wall: 'north', center: LOBBY_OPENING_CENTERS.testRoom, isMain: true }),
      Object.freeze({ id: ROOM_IDS.library, label: 'Library', wall: 'east', center: LOBBY_OPENING_CENTERS.library }),
      Object.freeze({ id: ROOM_IDS.tomAndJerry, label: 'Tom & Jerry', wall: 'east', center: LOBBY_OPENING_CENTERS.tomAndJerry }),
      Object.freeze({ id: ROOM_IDS.yosemite, label: 'Yosemite', wall: 'south', center: LOBBY_OPENING_CENTERS.yosemite }),
      Object.freeze({ id: ROOM_IDS.aquarium, label: 'Aquarium', wall: 'west', center: LOBBY_OPENING_CENTERS.aquarium }),
      Object.freeze({ id: 'space-station', label: 'Space Station', subtitle: 'Coming Soon', wall: 'west', center: LOBBY_OPENING_CENTERS.spaceStation }),
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

export const TOM_AND_JERRY_ROOM_CONFIG = Object.freeze({
  id: ROOM_IDS.tomAndJerry,
  name: 'Tom & Jerry Room',
  origin: TOM_AND_JERRY_ROOM_ORIGIN,
  dimensions: TOM_AND_JERRY_ROOM_DIMENSIONS,
  omittedWalls: Object.freeze(['west']),
  floorSize: Object.freeze({
    x: TOM_AND_JERRY_ROOM_DIMENSIONS.width,
    z: TOM_AND_JERRY_ROOM_DIMENSIONS.length,
  }),
  materials: Object.freeze({
    floor: Object.freeze({
      color: 0x7d5b4f,
      roughness: 0.98,
      metalness: 0,
    }),
    wall: Object.freeze({
      color: 0xcfae82,
      roughness: 0.86,
      metalness: 0,
    }),
    ceiling: Object.freeze({
      color: 0xf1eadc,
      roughness: 0.92,
      metalness: 0,
    }),
    trim: Object.freeze({
      color: 0xf7f2e8,
      roughness: 0.7,
      metalness: 0,
    }),
  }),
  baseboard: Object.freeze({
    height: 0.18,
    depth: 0.08,
  }),
  crownMolding: Object.freeze({
    height: 0.16,
    depth: 0.1,
  }),
  openings: Object.freeze({
    width: 2.4,
    height: 2.7,
    labelWidth: 2.7,
    labelHeight: 0.5,
    labelElevation: 3.14,
    labelInset: 0.12,
    entries: Object.freeze([
      Object.freeze({ id: ROOM_IDS.lobby, wall: 'west', center: 0 }),
    ]),
  }),
  lighting: Object.freeze({
    hemisphere: Object.freeze({
      skyColor: 0xfff5e0,
      groundColor: 0x5b4032,
      intensity: 0.45,
      position: Object.freeze({ x: 0, y: 14, z: 0 }),
    }),
    directional: Object.freeze({
      color: 0xffefd4,
      intensity: 0.22,
      position: Object.freeze({ x: -4, y: 8, z: 3 }),
      target: Object.freeze({ x: 1, y: 1, z: 0 }),
      shadowMapSize: 1024,
      shadowCameraSize: 16,
      shadowCameraNear: 1,
      shadowCameraFar: 26,
      shadowBias: -0.00016,
    }),
    ceilingPointLights: Object.freeze({
      color: 0xffd7a3,
      intensity: 34,
      distance: 8.5,
      decay: 2,
      heightOffset: 0.5,
      castShadow: false,
      shadowMapSize: 512,
      shadowBias: -0.00028,
      positions: Object.freeze([
        Object.freeze({ x: -3.2, z: -3.2 }),
        Object.freeze({ x: 3.2, z: -3.2 }),
        Object.freeze({ x: -3.2, z: 3.2 }),
        Object.freeze({ x: 3.2, z: 3.2 }),
      ]),
    }),
  }),
});

export const AQUARIUM_ROOM_CONFIG = Object.freeze({
  id: ROOM_IDS.aquarium,
  name: 'Aquarium Room',
  origin: AQUARIUM_ROOM_ORIGIN,
  dimensions: AQUARIUM_ROOM_DIMENSIONS,
  omittedWalls: Object.freeze(['east']),
  floorSize: Object.freeze({
    x: AQUARIUM_ROOM_DIMENSIONS.width,
    z: AQUARIUM_ROOM_DIMENSIONS.length,
  }),
  materials: Object.freeze({
    floor: Object.freeze({
      color: 0x53616b,
      roughness: 0.42,
      metalness: 0.08,
    }),
    wall: Object.freeze({
      color: 0xc9d8df,
      roughness: 0.78,
      metalness: 0,
    }),
    ceiling: Object.freeze({
      color: 0xe9f1f2,
      roughness: 0.86,
      metalness: 0,
    }),
    trim: Object.freeze({
      color: 0xf3f7f7,
      roughness: 0.62,
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
      Object.freeze({ id: ROOM_IDS.lobby, wall: 'east', center: 0 }),
    ]),
  }),
  lighting: Object.freeze({
    hemisphere: Object.freeze({
      skyColor: 0xdff8ff,
      groundColor: 0x163041,
      intensity: 0.72,
      position: Object.freeze({ x: 0, y: 16, z: 0 }),
    }),
    directional: Object.freeze({
      color: 0xe7fbff,
      intensity: 0.28,
      position: Object.freeze({ x: -4, y: 8, z: 4 }),
      target: Object.freeze({ x: 0, y: 1.4, z: -4 }),
      shadowMapSize: 1024,
      shadowCameraSize: 18,
      shadowCameraNear: 1,
      shadowCameraFar: 30,
      shadowBias: -0.00016,
    }),
    ceilingPointLights: Object.freeze({
      color: 0xaedfff,
      intensity: 24,
      distance: 9.5,
      decay: 2,
      heightOffset: 0.52,
      castShadow: false,
      shadowMapSize: 512,
      shadowBias: -0.00024,
      positions: Object.freeze([
        Object.freeze({ x: -4.6, z: -2.4 }),
        Object.freeze({ x: 0, z: -2.4 }),
        Object.freeze({ x: 4.6, z: -2.4 }),
        Object.freeze({ x: -4.6, z: 3.6 }),
        Object.freeze({ x: 4.6, z: 3.6 }),
      ]),
    }),
  }),
});

export const LIBRARY_ROOM_CONFIG = Object.freeze({
  id: ROOM_IDS.library,
  name: 'Library Room',
  origin: LIBRARY_ROOM_ORIGIN,
  dimensions: LIBRARY_ROOM_DIMENSIONS,
  omittedWalls: Object.freeze(['west']),
  floorSize: Object.freeze({
    x: LIBRARY_ROOM_DIMENSIONS.width,
    z: LIBRARY_ROOM_DIMENSIONS.length,
  }),
  materials: Object.freeze({
    floor: Object.freeze({
      color: 0x6b4d3a,
      roughness: 0.88,
      metalness: 0,
    }),
    wall: Object.freeze({
      color: 0xd9c7aa,
      roughness: 0.84,
      metalness: 0,
    }),
    ceiling: Object.freeze({
      color: 0xf1e8d8,
      roughness: 0.9,
      metalness: 0,
    }),
    trim: Object.freeze({
      color: 0xf5ead8,
      roughness: 0.7,
      metalness: 0,
    }),
  }),
  baseboard: Object.freeze({
    height: 0.18,
    depth: 0.08,
  }),
  crownMolding: Object.freeze({
    height: 0.14,
    depth: 0.1,
  }),
  openings: Object.freeze({
    width: 2.4,
    height: 2.7,
    labelWidth: 2.7,
    labelHeight: 0.5,
    labelElevation: 3.14,
    labelInset: 0.12,
    entries: Object.freeze([
      Object.freeze({ id: ROOM_IDS.lobby, wall: 'west', center: LIBRARY_ROOM_DOOR_CENTER }),
    ]),
  }),
  lighting: Object.freeze({
    hemisphere: Object.freeze({
      skyColor: 0xfff4df,
      groundColor: 0x463423,
      intensity: 0.5,
      position: Object.freeze({ x: 0, y: 14, z: 0 }),
    }),
    directional: Object.freeze({
      color: 0xffddb0,
      intensity: 0.2,
      position: Object.freeze({ x: -3, y: 8, z: 4 }),
      target: Object.freeze({ x: 0, y: 1.3, z: 0 }),
      shadowMapSize: 1024,
      shadowCameraSize: 16,
      shadowCameraNear: 1,
      shadowCameraFar: 28,
      shadowBias: -0.00016,
    }),
    ceilingPointLights: Object.freeze({
      color: 0xffc77b,
      intensity: 24,
      distance: 8,
      decay: 2,
      heightOffset: 0.52,
      castShadow: false,
      shadowMapSize: 512,
      shadowBias: -0.00024,
      positions: Object.freeze([
        Object.freeze({ x: -3.8, z: -2.8 }),
        Object.freeze({ x: 3.8, z: -2.8 }),
        Object.freeze({ x: -3.8, z: 2.4 }),
        Object.freeze({ x: 3.8, z: 2.4 }),
      ]),
    }),
  }),
});

export const YOSEMITE_ROOM_CONFIG = Object.freeze({
  id: ROOM_IDS.yosemite,
  name: 'Yosemite Room',
  origin: YOSEMITE_ROOM_ORIGIN,
  dimensions: YOSEMITE_ROOM_DIMENSIONS,
  openings: Object.freeze({
    width: 2.4,
    height: 2.7,
    entries: Object.freeze([
      Object.freeze({ id: ROOM_IDS.lobby, wall: 'north', center: 0 }),
    ]),
  }),
  terrain: Object.freeze({
    segmentsX: 58,
    segmentsZ: 66,
  }),
  atmosphere: Object.freeze({
    fogColor: 0xb8d4e5,
    fogNear: 16,
    fogFar: 68,
    backgroundColor: 0xa8cbe1,
    hazeColor: 0xc7e3f2,
    hazeOpacity: 0.14,
  }),
  lighting: Object.freeze({
    hemisphere: Object.freeze({
      skyColor: 0xd5efff,
      groundColor: 0x425d37,
      intensity: 0.74,
      position: Object.freeze({ x: 0, y: 22, z: 0 }),
    }),
    sun: Object.freeze({
      color: 0xffe2aa,
      intensity: 2.35,
      position: Object.freeze({ x: -13, y: 19, z: -8 }),
      target: Object.freeze({ x: 1.2, y: 3.8, z: 14.2 }),
      shadowMapSize: 2048,
      shadowCameraSize: 46,
      shadowCameraNear: 1,
      shadowCameraFar: 70,
      shadowBias: -0.00018,
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
  Object.freeze({
    id: 'lobby-to-tom-and-jerry-room',
    sourceRoom: ROOM_IDS.lobby,
    destinationRoom: ROOM_IDS.tomAndJerry,
    continuous: true,
    spawnPosition: Object.freeze({
      x: TOM_AND_JERRY_ROOM_ORIGIN.x - TOM_AND_JERRY_ROOM_DIMENSIONS.width / 2 + 1.1,
      y: PLAYER_CONFIG.body.eyeHeight,
      z: TOM_AND_JERRY_ROOM_ORIGIN.z,
    }),
    spawnRotation: Object.freeze({ y: -Math.PI / 2 }),
    doorway: Object.freeze({
      wall: 'east',
      center: LOBBY_OPENING_CENTERS.tomAndJerry,
      width: LOBBY_ROOM_CONFIG.openings.width,
      height: LOBBY_ROOM_CONFIG.openings.height,
    }),
    triggerVolume: Object.freeze({
      center: Object.freeze({
        x: ROOM_DIMENSIONS.width / 2 + ROOM_DIMENSIONS.wallThickness + 0.45,
        y: LOBBY_ROOM_CONFIG.openings.height / 2,
        z: LOBBY_OPENING_CENTERS.tomAndJerry,
      }),
      size: Object.freeze({ x: 0.4, y: LOBBY_ROOM_CONFIG.openings.height, z: 2.05 }),
    }),
  }),
  Object.freeze({
    id: 'tom-and-jerry-room-to-lobby',
    sourceRoom: ROOM_IDS.tomAndJerry,
    destinationRoom: ROOM_IDS.lobby,
    continuous: true,
    spawnPosition: Object.freeze({
      x: ROOM_DIMENSIONS.width / 2 - 1.1,
      y: PLAYER_CONFIG.body.eyeHeight,
      z: LOBBY_OPENING_CENTERS.tomAndJerry,
    }),
    spawnRotation: Object.freeze({ y: Math.PI / 2 }),
    doorway: Object.freeze({
      wall: 'west',
      center: 0,
      width: TOM_AND_JERRY_ROOM_CONFIG.openings.width,
      height: TOM_AND_JERRY_ROOM_CONFIG.openings.height,
    }),
    triggerVolume: Object.freeze({
      center: Object.freeze({
        x: ROOM_DIMENSIONS.width / 2 - 0.45,
        y: TOM_AND_JERRY_ROOM_CONFIG.openings.height / 2,
        z: LOBBY_OPENING_CENTERS.tomAndJerry,
      }),
      size: Object.freeze({ x: 0.4, y: TOM_AND_JERRY_ROOM_CONFIG.openings.height, z: 2.05 }),
    }),
  }),
  Object.freeze({
    id: 'lobby-to-aquarium-room',
    sourceRoom: ROOM_IDS.lobby,
    destinationRoom: ROOM_IDS.aquarium,
    continuous: true,
    spawnPosition: Object.freeze({
      x: AQUARIUM_ROOM_ORIGIN.x + AQUARIUM_ROOM_DIMENSIONS.width / 2 - 1.1,
      y: PLAYER_CONFIG.body.eyeHeight,
      z: AQUARIUM_ROOM_ORIGIN.z,
    }),
    spawnRotation: Object.freeze({ y: Math.PI / 2 }),
    doorway: Object.freeze({
      wall: 'west',
      center: LOBBY_OPENING_CENTERS.aquarium,
      width: LOBBY_ROOM_CONFIG.openings.width,
      height: LOBBY_ROOM_CONFIG.openings.height,
    }),
    triggerVolume: Object.freeze({
      center: Object.freeze({
        x: -ROOM_DIMENSIONS.width / 2 - ROOM_DIMENSIONS.wallThickness - 0.45,
        y: LOBBY_ROOM_CONFIG.openings.height / 2,
        z: LOBBY_OPENING_CENTERS.aquarium,
      }),
      size: Object.freeze({ x: 0.4, y: LOBBY_ROOM_CONFIG.openings.height, z: 2.05 }),
    }),
  }),
  Object.freeze({
    id: 'aquarium-room-to-lobby',
    sourceRoom: ROOM_IDS.aquarium,
    destinationRoom: ROOM_IDS.lobby,
    continuous: true,
    spawnPosition: Object.freeze({
      x: -ROOM_DIMENSIONS.width / 2 + 1.1,
      y: PLAYER_CONFIG.body.eyeHeight,
      z: LOBBY_OPENING_CENTERS.aquarium,
    }),
    spawnRotation: Object.freeze({ y: -Math.PI / 2 }),
    doorway: Object.freeze({
      wall: 'east',
      center: 0,
      width: AQUARIUM_ROOM_CONFIG.openings.width,
      height: AQUARIUM_ROOM_CONFIG.openings.height,
    }),
    triggerVolume: Object.freeze({
      center: Object.freeze({
        x: -ROOM_DIMENSIONS.width / 2 + 0.45,
        y: AQUARIUM_ROOM_CONFIG.openings.height / 2,
        z: LOBBY_OPENING_CENTERS.aquarium,
      }),
      size: Object.freeze({ x: 0.4, y: AQUARIUM_ROOM_CONFIG.openings.height, z: 2.05 }),
    }),
  }),
  Object.freeze({
    id: 'lobby-to-library-room',
    sourceRoom: ROOM_IDS.lobby,
    destinationRoom: ROOM_IDS.library,
    continuous: true,
    spawnPosition: Object.freeze({
      x: LIBRARY_ROOM_ORIGIN.x - LIBRARY_ROOM_DIMENSIONS.width / 2 + 1.1,
      y: PLAYER_CONFIG.body.eyeHeight,
      z: LOBBY_OPENING_CENTERS.library,
    }),
    spawnRotation: Object.freeze({ y: -Math.PI / 2 }),
    doorway: Object.freeze({
      wall: 'east',
      center: LOBBY_OPENING_CENTERS.library,
      width: LOBBY_ROOM_CONFIG.openings.width,
      height: LOBBY_ROOM_CONFIG.openings.height,
    }),
    triggerVolume: Object.freeze({
      center: Object.freeze({
        x: ROOM_DIMENSIONS.width / 2 + ROOM_DIMENSIONS.wallThickness + 0.45,
        y: LOBBY_ROOM_CONFIG.openings.height / 2,
        z: LOBBY_OPENING_CENTERS.library,
      }),
      size: Object.freeze({ x: 0.4, y: LOBBY_ROOM_CONFIG.openings.height, z: 2.05 }),
    }),
  }),
  Object.freeze({
    id: 'library-room-to-lobby',
    sourceRoom: ROOM_IDS.library,
    destinationRoom: ROOM_IDS.lobby,
    continuous: true,
    spawnPosition: Object.freeze({
      x: ROOM_DIMENSIONS.width / 2 - 1.1,
      y: PLAYER_CONFIG.body.eyeHeight,
      z: LOBBY_OPENING_CENTERS.library,
    }),
    spawnRotation: Object.freeze({ y: Math.PI / 2 }),
    doorway: Object.freeze({
      wall: 'west',
      center: LIBRARY_ROOM_DOOR_CENTER,
      width: LIBRARY_ROOM_CONFIG.openings.width,
      height: LIBRARY_ROOM_CONFIG.openings.height,
    }),
    triggerVolume: Object.freeze({
      center: Object.freeze({
        x: ROOM_DIMENSIONS.width / 2 - 0.45,
        y: LIBRARY_ROOM_CONFIG.openings.height / 2,
        z: LOBBY_OPENING_CENTERS.library,
      }),
      size: Object.freeze({ x: 0.4, y: LIBRARY_ROOM_CONFIG.openings.height, z: 2.05 }),
    }),
  }),
  Object.freeze({
    id: 'lobby-to-yosemite-room',
    sourceRoom: ROOM_IDS.lobby,
    destinationRoom: ROOM_IDS.yosemite,
    continuous: true,
    spawnPosition: Object.freeze({
      x: 0,
      y: PLAYER_CONFIG.body.eyeHeight,
      z: YOSEMITE_ROOM_ORIGIN.z - YOSEMITE_ROOM_DIMENSIONS.length / 2 + 1.1,
    }),
    spawnRotation: Object.freeze({ y: 0 }),
    doorway: Object.freeze({
      wall: 'south',
      center: LOBBY_OPENING_CENTERS.yosemite,
      width: LOBBY_ROOM_CONFIG.openings.width,
      height: LOBBY_ROOM_CONFIG.openings.height,
    }),
    triggerVolume: Object.freeze({
      center: Object.freeze({
        x: LOBBY_OPENING_CENTERS.yosemite,
        y: LOBBY_ROOM_CONFIG.openings.height / 2,
        z: ROOM_DIMENSIONS.length / 2 + ROOM_DIMENSIONS.wallThickness + 0.45,
      }),
      size: Object.freeze({ x: 2.05, y: LOBBY_ROOM_CONFIG.openings.height, z: 0.4 }),
    }),
  }),
  Object.freeze({
    id: 'yosemite-room-to-lobby',
    sourceRoom: ROOM_IDS.yosemite,
    destinationRoom: ROOM_IDS.lobby,
    continuous: true,
    spawnPosition: Object.freeze({
      x: 0,
      y: PLAYER_CONFIG.body.eyeHeight,
      z: ROOM_DIMENSIONS.length / 2 - 1.1,
    }),
    spawnRotation: Object.freeze({ y: Math.PI }),
    doorway: Object.freeze({
      wall: 'north',
      center: 0,
      width: YOSEMITE_ROOM_CONFIG.openings.width,
      height: YOSEMITE_ROOM_CONFIG.openings.height,
    }),
    triggerVolume: Object.freeze({
      center: Object.freeze({
        x: LOBBY_OPENING_CENTERS.yosemite,
        y: YOSEMITE_ROOM_CONFIG.openings.height / 2,
        z: ROOM_DIMENSIONS.length / 2 + 0.18,
      }),
      size: Object.freeze({ x: 2.05, y: YOSEMITE_ROOM_CONFIG.openings.height, z: 0.46 }),
    }),
  }),
]);

export const ROOM_MANAGER_CONFIG = Object.freeze({
  initialRoomId: ROOM_IDS.lobby,
});

export const DEBUG_CONFIG = Object.freeze({
  showPhysicsBounds: false,
  showInteractionRanges: false,
  playerBounds: Object.freeze({
    color: 0x4fd1ff,
    radialSegments: 20,
  }),
  portalTriggers: Object.freeze({
    color: 0xffd166,
  }),
  roomBounds: Object.freeze({
    color: 0x8ef58e,
  }),
  interactionRanges: Object.freeze({
    color: 0xff6b9d,
    radialSegments: 32,
  }),
});

export const HUD_PLACEHOLDERS = Object.freeze({
  fps: '--',
  room: 'Lobby',
  portalCount: '--',
  connectedRooms: '--',
  connectedDestinations: '--',
  grounded: '--',
  verticalVelocity: '--',
});
