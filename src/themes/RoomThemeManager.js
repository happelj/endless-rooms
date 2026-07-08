import * as THREE from 'three';
import { SCENE_CONFIG } from '../config/constants.js';
import { RoomTheme } from './RoomTheme.js';

export class RoomThemeManager {
  constructor(scene) {
    this.scene = scene;
    this.defaultBackgroundColor = SCENE_CONFIG.backgroundColor;
    this.currentTheme = null;
  }

  applyTheme(themeConfig) {
    const theme = RoomTheme.from(themeConfig);
    this.currentTheme = theme;
    this.applyBackground(theme);
    this.applyFog(theme);

    return theme;
  }

  applyBackground(theme) {
    const backgroundColor = theme.environmentalPresets.backgroundColor
      ?? this.defaultBackgroundColor;

    this.scene.background = new THREE.Color(backgroundColor);
  }

  applyFog(theme) {
    if (!theme.fog.enabled) {
      this.scene.fog = null;
      return;
    }

    this.scene.fog = new THREE.Fog(theme.fog.color, theme.fog.near, theme.fog.far);
  }

  dispose() {
    this.currentTheme = null;
    this.scene.fog = null;
    this.scene.background = new THREE.Color(this.defaultBackgroundColor);
  }
}
