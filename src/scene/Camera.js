import * as THREE from 'three';
import { CAMERA_CONFIG } from '../config/constants.js';

export class Camera {
  constructor(aspectRatio) {
    this.instance = new THREE.PerspectiveCamera(
      CAMERA_CONFIG.fieldOfView,
      aspectRatio,
      CAMERA_CONFIG.near,
      CAMERA_CONFIG.far,
    );

    this.instance.position.set(
      CAMERA_CONFIG.startPosition.x,
      CAMERA_CONFIG.startPosition.y,
      CAMERA_CONFIG.startPosition.z,
    );

    this.lookAtCenter();
  }

  lookAtCenter() {
    this.instance.lookAt(
      CAMERA_CONFIG.lookAt.x,
      CAMERA_CONFIG.lookAt.y,
      CAMERA_CONFIG.lookAt.z,
    );
  }

  resize(aspectRatio) {
    this.instance.aspect = aspectRatio;
    this.instance.updateProjectionMatrix();
  }
}

