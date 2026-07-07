import * as THREE from 'three';
import { AabbCollider } from '../collision/AabbCollider.js';

const DEFAULT_ORIGIN = Object.freeze({ x: 0, y: 0, z: 0 });

export class Room {
  constructor(scene, collisionSystem, config) {
    this.scene = scene;
    this.collisionSystem = collisionSystem;
    this.config = config;
    this.id = config.id;
    this.name = config.name;
    this.origin = new THREE.Vector3(
      config.origin?.x ?? DEFAULT_ORIGIN.x,
      config.origin?.y ?? DEFAULT_ORIGIN.y,
      config.origin?.z ?? DEFAULT_ORIGIN.z,
    );
    this.isActive = false;
    this.group = new THREE.Group();
    this.group.name = config.name;
    this.group.position.copy(this.origin);
    this.geometryCache = new Map();
    this.ownedGeometries = new Set();
    this.materials = new Map();
    this.registeredColliders = new Set();
    this.registeredBoundsColliders = new Set();
    this.labels = new Set();
    this.lights = new Set();

    this.scene.add(this.group);
  }

  createMaterial(name, config) {
    const material = new THREE.MeshStandardMaterial({
      color: config.color,
      roughness: config.roughness,
      metalness: config.metalness,
      emissive: config.emissive ?? 0x000000,
      emissiveIntensity: config.emissiveIntensity ?? 0,
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
      this.addCollider(new AabbCollider({
        name: `${name}Collider`,
        center: this.toWorldPosition(position),
        size,
      }));
    }

    return mesh;
  }

  addMesh(mesh, { disposeGeometry = false } = {}) {
    this.group.add(mesh);

    if (disposeGeometry && mesh.geometry) {
      this.ownedGeometries.add(mesh.geometry);
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

  addLight(light) {
    this.lights.add(light);
    this.group.add(light);
  }

  addLabel(label) {
    this.labels.add(label);
    this.group.add(label.mesh);
  }

  activate() {
    this.isActive = true;

    for (const collider of this.registeredBoundsColliders) {
      collider.setActive(true);
    }
  }

  deactivate() {
    this.isActive = false;

    for (const collider of this.registeredBoundsColliders) {
      collider.setActive(false);
    }
  }

  toWorldPosition(position) {
    return {
      x: position.x + this.origin.x,
      y: position.y + this.origin.y,
      z: position.z + this.origin.z,
    };
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

    for (const geometry of this.ownedGeometries) {
      geometry.dispose();
    }

    for (const material of this.materials.values()) {
      material.dispose();
    }

    this.registeredColliders.clear();
    this.registeredBoundsColliders.clear();
    this.labels.clear();
    this.lights.clear();
    this.geometryCache.clear();
    this.ownedGeometries.clear();
    this.materials.clear();
  }
}
