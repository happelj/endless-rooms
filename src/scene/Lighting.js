import * as THREE from 'three';
import { LIGHTING_CONFIG, ROOM_DIMENSIONS } from '../config/constants.js';

export class Lighting {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.group.name = 'FoundationLighting';

    this.hemisphereLight = this.createHemisphereLight();
    this.directionalLight = this.createDirectionalLight();
    this.ceilingPointLights = this.createCeilingPointLights();

    this.group.add(this.hemisphereLight);
    this.group.add(this.directionalLight);
    this.group.add(this.directionalLight.target);
    this.group.add(...this.ceilingPointLights);
    this.scene.add(this.group);
  }

  createHemisphereLight() {
    const light = new THREE.HemisphereLight(
      LIGHTING_CONFIG.hemisphere.skyColor,
      LIGHTING_CONFIG.hemisphere.groundColor,
      LIGHTING_CONFIG.hemisphere.intensity,
    );

    light.position.set(
      LIGHTING_CONFIG.hemisphere.position.x,
      LIGHTING_CONFIG.hemisphere.position.y,
      LIGHTING_CONFIG.hemisphere.position.z,
    );

    return light;
  }

  createDirectionalLight() {
    const light = new THREE.DirectionalLight(
      LIGHTING_CONFIG.directional.color,
      LIGHTING_CONFIG.directional.intensity,
    );

    light.position.set(
      LIGHTING_CONFIG.directional.position.x,
      LIGHTING_CONFIG.directional.position.y,
      LIGHTING_CONFIG.directional.position.z,
    );

    light.target.position.set(
      LIGHTING_CONFIG.directional.target.x,
      LIGHTING_CONFIG.directional.target.y,
      LIGHTING_CONFIG.directional.target.z,
    );

    light.castShadow = true;
    light.shadow.mapSize.set(
      LIGHTING_CONFIG.directional.shadowMapSize,
      LIGHTING_CONFIG.directional.shadowMapSize,
    );

    light.shadow.camera.near = LIGHTING_CONFIG.directional.shadowCameraNear;
    light.shadow.camera.far = LIGHTING_CONFIG.directional.shadowCameraFar;
    light.shadow.camera.left = -LIGHTING_CONFIG.directional.shadowCameraSize;
    light.shadow.camera.right = LIGHTING_CONFIG.directional.shadowCameraSize;
    light.shadow.camera.top = LIGHTING_CONFIG.directional.shadowCameraSize;
    light.shadow.camera.bottom = -LIGHTING_CONFIG.directional.shadowCameraSize;
    light.shadow.bias = LIGHTING_CONFIG.directional.shadowBias;

    return light;
  }

  createCeilingPointLights() {
    const { ceilingPointLights } = LIGHTING_CONFIG;
    const y = ROOM_DIMENSIONS.height - ceilingPointLights.heightOffset;

    return ceilingPointLights.positions.map((position, index) => {
      const light = new THREE.PointLight(
        ceilingPointLights.color,
        ceilingPointLights.intensity,
        ceilingPointLights.distance,
        ceilingPointLights.decay,
      );

      light.name = `CeilingPointLight:${index + 1}`;
      light.position.set(position.x, y, position.z);
      light.castShadow = true;
      light.shadow.mapSize.set(
        ceilingPointLights.shadowMapSize,
        ceilingPointLights.shadowMapSize,
      );
      light.shadow.bias = ceilingPointLights.shadowBias;

      return light;
    });
  }

  dispose() {
    this.scene.remove(this.group);
    this.group.clear();
  }
}
