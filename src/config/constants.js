export const APP_METADATA = Object.freeze({
  title: 'Endless Rooms',
  version: '0.1',
  stepLabel: 'Step 1 - Foundation',
});

export const SCENE_CONFIG = Object.freeze({
  backgroundColor: 0xb9c4cd,
});

export const CAMERA_CONFIG = Object.freeze({
  fieldOfView: 60,
  near: 0.1,
  far: 500,
  startPosition: Object.freeze({ x: 12, y: 9, z: 12 }),
  lookAt: Object.freeze({ x: 0, y: 0, z: 0 }),
});

export const RENDERER_CONFIG = Object.freeze({
  clearColor: 0xb9c4cd,
  maxPixelRatio: 2,
});

export const LIGHTING_CONFIG = Object.freeze({
  hemisphere: Object.freeze({
    skyColor: 0xf4f8ff,
    groundColor: 0x75808a,
    intensity: 1.85,
    position: Object.freeze({ x: 0, y: 24, z: 0 }),
  }),
  directional: Object.freeze({
    color: 0xffffff,
    intensity: 2.15,
    position: Object.freeze({ x: -12, y: 18, z: 10 }),
    target: Object.freeze({ x: 0, y: 0, z: 0 }),
    shadowMapSize: 2048,
    shadowCameraSize: 42,
    shadowCameraNear: 1,
    shadowCameraFar: 80,
    shadowBias: -0.00018,
  }),
});

export const FLOOR_CONFIG = Object.freeze({
  size: 72,
  color: 0x8f969d,
  roughness: 0.88,
  metalness: 0,
});

export const ORBIT_CONTROLS_CONFIG = Object.freeze({
  target: Object.freeze({ x: 0, y: 0, z: 0 }),
  enableDamping: true,
  dampingFactor: 0.08,
  minDistance: 4,
  maxDistance: 42,
  maxPolarAngle: Math.PI * 0.48,
});

export const HUD_PLACEHOLDERS = Object.freeze({
  fps: '--',
  coordinates: 'x --  y --  z --',
  room: 'Lobby',
});
