import * as THREE from 'three';
import { AabbCollider } from '../collision/AabbCollider.js';

export class Room {
  constructor(scene, collisionSystem, config) {
    this.scene = scene;
    this.collisionSystem = collisionSystem;
    this.config = config;
    this.group = new THREE.Group();
    this.group.name = config.name;
    this.geometryCache = new Map();
    this.materials = new Map();
    this.registeredColliders = new Set();
    this.registeredBoundsColliders = new Set();
    this.labels = new Set();

    this.scene.add(this.group);
  }

  createMaterial(name, config) {
    const material = new THREE.MeshStandardMaterial({
      color: config.color,
      roughness: config.roughness,
      metalness: config.metalness,
    });

    material.name = `${this.config.name}:${name}`;
    this.materials.set(name, material);

    return material;
  }

  addBox({ name, size, position, material, castShadow = true, receiveShadow = true, collider = false }) {
    const geometry = this.getBoxGeometry(size);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.position.set(position.x, position.y, position.z);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = receiveShadow;
    this.group.add(mesh);

    if (collider) {
      this.addCollider(new AabbCollider({ name: `${name}Collider`, center: position, size }));
    }

    return mesh;
  }

  addCollider(collider) {
    this.collisionSystem.addCollider(collider);
    this.registeredColliders.add(collider);
  }

  addBoundsCollider(collider) {
    this.collisionSystem.addBoundsCollider(collider);
    this.registeredBoundsColliders.add(collider);
  }

  addLabel(label) {
    this.labels.add(label);
    this.group.add(label.mesh);
  }

  getBoxGeometry(size) {
    const key = this.getGeometryCacheKey(size);

    if (!this.geometryCache.has(key)) {
      this.geometryCache.set(key, new THREE.BoxGeometry(size.x, size.y, size.z));
    }

    return this.geometryCache.get(key);
  }

  getGeometryCacheKey(size) {
    return `${size.x.toFixed(3)}:${size.y.toFixed(3)}:${size.z.toFixed(3)}`;
  }

  dispose() {
    for (const collider of this.registeredColliders) {
      this.collisionSystem.removeCollider(collider);
    }

    for (const collider of this.registeredBoundsColliders) {
      this.collisionSystem.removeBoundsCollider(collider);
    }

    for (const label of this.labels) {
      label.dispose();
    }

    this.scene.remove(this.group);
    this.group.clear();

    for (const geometry of this.geometryCache.values()) {
      geometry.dispose();
    }

    for (const material of this.materials.values()) {
      material.dispose();
    }

    this.registeredColliders.clear();
    this.registeredBoundsColliders.clear();
    this.labels.clear();
    this.geometryCache.clear();
    this.materials.clear();
  }
}
