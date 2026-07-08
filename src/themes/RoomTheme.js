const DEFAULT_LIGHTING_PROFILE = Object.freeze({
  mood: 'neutral',
  ambientColor: 0xffffff,
  accentColor: 0x9fb7c9,
  intensity: 1,
});

const DEFAULT_ACCENT_COLORS = Object.freeze({
  primary: 0xffffff,
  secondary: 0x9fb7c9,
  warning: 0xffd166,
});

const DEFAULT_FOG = Object.freeze({
  enabled: false,
  color: 0x000000,
  near: 1,
  far: 100,
});

export const DEFAULT_ROOM_THEME_CONFIG = Object.freeze({
  id: 'default',
  name: 'Default Room Theme',
  ambientLightingProfile: DEFAULT_LIGHTING_PROFILE,
  accentColors: DEFAULT_ACCENT_COLORS,
  ambienceProfile: Object.freeze({ id: 'default-ambience', intensity: 'neutral' }),
  fog: DEFAULT_FOG,
  musicProfile: Object.freeze({ id: 'none', enabled: false }),
  environmentalPresets: Object.freeze({}),
});

export class RoomTheme {
  constructor(config = {}) {
    this.id = config.id ?? DEFAULT_ROOM_THEME_CONFIG.id;
    this.name = config.name ?? DEFAULT_ROOM_THEME_CONFIG.name;
    this.ambientLightingProfile = Object.freeze({
      ...DEFAULT_ROOM_THEME_CONFIG.ambientLightingProfile,
      ...(config.ambientLightingProfile ?? {}),
    });
    this.accentColors = Object.freeze({
      ...DEFAULT_ROOM_THEME_CONFIG.accentColors,
      ...(config.accentColors ?? {}),
    });
    this.ambienceProfile = Object.freeze({
      ...DEFAULT_ROOM_THEME_CONFIG.ambienceProfile,
      ...(config.ambienceProfile ?? {}),
    });
    this.fog = Object.freeze({
      ...DEFAULT_ROOM_THEME_CONFIG.fog,
      ...(config.fog ?? {}),
    });
    this.musicProfile = Object.freeze({
      ...DEFAULT_ROOM_THEME_CONFIG.musicProfile,
      ...(config.musicProfile ?? {}),
    });
    this.environmentalPresets = Object.freeze({
      ...DEFAULT_ROOM_THEME_CONFIG.environmentalPresets,
      ...(config.environmentalPresets ?? {}),
    });
  }

  static from(config) {
    return config instanceof RoomTheme ? config : new RoomTheme(config);
  }
}
