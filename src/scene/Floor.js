import * as THREE from 'three';
import { FLOOR_CONFIG } from '../config/constants.js';

export class Floor {
  constructor(scene) {
    this.scene = scene;
    this.geometry = new THREE.PlaneGeometry(FLOOR_CONFIG.size, FLOOR_CONFIG.size);
    this.material = new THREE.MeshStandardMaterial({
      color: FLOOR_CONFIG.color,
      roughness: FLOOR_CONFIG.roughness,
      metalness: FLOOR_CONFIG.metalness,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.name = 'FoundationFloor';
    this.mesh.rotation.x = -Math.PI / 2;
    this.mesh.receiveShadow = true;

    this.scene.add(this.mesh);
  }

  dispose() {
    this.scene.remove(this.mesh);
    this.geometry.dispose();
    this.material.dispose();
  }
}

