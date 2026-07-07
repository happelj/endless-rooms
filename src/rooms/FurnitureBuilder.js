import * as THREE from 'three';

const DEFAULT_ROTATION = Object.freeze({ x: 0, y: 0, z: 0 });
const DEFAULT_SEGMENTS = 24;

export class FurnitureBuilder {
  constructor(room) {
    this.room = room;
  }

  addBox({
    name,
    size,
    position,
    material,
    castShadow = true,
    receiveShadow = true,
    collider = false,
  }) {
    return this.room.addBox({
      name,
      size,
      position,
      material,
      castShadow,
      receiveShadow,
      collider,
    });
  }

  addCylinder({
    name,
    radiusTop,
    radiusBottom = radiusTop,
    height,
    position,
    material,
    radialSegments = DEFAULT_SEGMENTS,
    rotation = DEFAULT_ROTATION,
    castShadow = true,
    receiveShadow = true,
  }) {
    const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.position.set(position.x, position.y, position.z);
    mesh.rotation.set(rotation.x, rotation.y, rotation.z);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = receiveShadow;

    return this.room.addMesh(mesh, { disposeGeometry: true });
  }

  addSphere({
    name,
    radius,
    position,
    material,
    scale = DEFAULT_ROTATION,
    widthSegments = DEFAULT_SEGMENTS,
    heightSegments = 16,
    castShadow = true,
    receiveShadow = true,
  }) {
    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.position.set(position.x, position.y, position.z);
    mesh.scale.set(scale.x || 1, scale.y || 1, scale.z || 1);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = receiveShadow;

    return this.room.addMesh(mesh, { disposeGeometry: true });
  }
}
