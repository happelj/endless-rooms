import * as THREE from 'three';
import { TerrainGroundCollider } from './TerrainGroundCollider.js';

export class Terrain {
  constructor({
    name = 'Terrain',
    width,
    length,
    segmentsX = 48,
    segmentsZ = 56,
    origin,
    material,
    heightSampler,
  }) {
    this.name = name;
    this.width = width;
    this.length = length;
    this.segmentsX = segmentsX;
    this.segmentsZ = segmentsZ;
    this.origin = origin;
    this.material = material;
    this.heightSampler = heightSampler;
    this.mesh = this.createMesh();
    this.collider = new TerrainGroundCollider({
      name: `${name}GroundCollider`,
      origin,
      width,
      length,
      sampleHeight: (x, z) => this.getHeight(x, z),
    });
  }

  createMesh() {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const indices = [];

    for (let zIndex = 0; zIndex <= this.segmentsZ; zIndex += 1) {
      const z = -this.length / 2 + (zIndex / this.segmentsZ) * this.length;

      for (let xIndex = 0; xIndex <= this.segmentsX; xIndex += 1) {
        const x = -this.width / 2 + (xIndex / this.segmentsX) * this.width;
        positions.push(x, this.getHeight(x, z), z);
      }
    }

    for (let zIndex = 0; zIndex < this.segmentsZ; zIndex += 1) {
      for (let xIndex = 0; xIndex < this.segmentsX; xIndex += 1) {
        const row = this.segmentsX + 1;
        const a = zIndex * row + xIndex;
        const b = a + 1;
        const c = a + row;
        const d = c + 1;

        indices.push(a, c, b, b, c, d);
      }
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    const mesh = new THREE.Mesh(geometry, this.material);
    mesh.name = this.name;
    mesh.castShadow = false;
    mesh.receiveShadow = true;

    return mesh;
  }

  getHeight(x, z) {
    return this.heightSampler(x, z);
  }

  setActive(isActive) {
    this.collider.setActive(isActive);
  }

  dispose() {
    this.mesh.geometry.dispose();
  }
}
