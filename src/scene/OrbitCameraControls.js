import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ORBIT_CONTROLS_CONFIG } from '../config/constants.js';

export class OrbitCameraControls {
  constructor(camera, domElement) {
    this.instance = new OrbitControls(camera, domElement);
    this.instance.target.set(
      ORBIT_CONTROLS_CONFIG.target.x,
      ORBIT_CONTROLS_CONFIG.target.y,
      ORBIT_CONTROLS_CONFIG.target.z,
    );
    this.instance.enableDamping = ORBIT_CONTROLS_CONFIG.enableDamping;
    this.instance.dampingFactor = ORBIT_CONTROLS_CONFIG.dampingFactor;
    this.instance.minDistance = ORBIT_CONTROLS_CONFIG.minDistance;
    this.instance.maxDistance = ORBIT_CONTROLS_CONFIG.maxDistance;
    this.instance.maxPolarAngle = ORBIT_CONTROLS_CONFIG.maxPolarAngle;
    this.instance.update();
  }

  update() {
    this.instance.update();
  }

  dispose() {
    this.instance.dispose();
  }
}

