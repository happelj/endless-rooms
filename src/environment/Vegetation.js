import * as THREE from 'three';
import { AabbCollider } from '../collision/AabbCollider.js';

const DEFAULT_ROTATION = Object.freeze({ x: 0, y: 0, z: 0 });

export class VegetationFactory {
  constructor(room, materials) {
    this.room = room;
    this.materials = materials;
  }

  addPineTree({ name, position, height = 4.2, trunkRadius = 0.16, canopyRadius = 0.95 }) {
    const group = new THREE.Group();
    group.name = name;
    group.position.set(position.x, position.y, position.z);
    this.room.group.add(group);

    const trunkHeight = height * 0.45;
    group.add(this.createCylinder({
      name: `${name}:Trunk`,
      radiusTop: trunkRadius * 0.72,
      radiusBottom: trunkRadius,
      height: trunkHeight,
      position: { x: 0, y: trunkHeight / 2, z: 0 },
      material: this.materials.bark,
      radialSegments: 10,
    }));

    for (let index = 0; index < 3; index += 1) {
      const coneHeight = height * (0.4 - index * 0.045);
      const cone = this.createCone({
        name: `${name}:Canopy:${index + 1}`,
        radius: canopyRadius * (1 - index * 0.18),
        height: coneHeight,
        position: {
          x: 0,
          y: trunkHeight + index * height * 0.19,
          z: 0,
        },
        material: this.materials.pine,
        radialSegments: 12,
      });
      group.add(cone);
    }

    this.room.addCollider(new AabbCollider({
      name: `${name}:TrunkCollider`,
      center: this.room.toWorldPosition({
        x: position.x,
        y: position.y + trunkHeight / 2,
        z: position.z,
      }),
      size: { x: trunkRadius * 3.2, y: trunkHeight, z: trunkRadius * 3.2 },
    }));

    return group;
  }

  addShrub({ name, position, radius = 0.42 }) {
    const mesh = this.createSphere({
      name,
      radius,
      position,
      material: this.materials.shrub,
      scale: { x: 1.25, y: 0.58, z: 1 },
    });
    this.room.group.add(mesh);

    return mesh;
  }

  addWildflower({ name, position, colorMaterial }) {
    const stem = this.createCylinder({
      name: `${name}:Stem`,
      radiusTop: 0.012,
      radiusBottom: 0.014,
      height: 0.18,
      position: { x: position.x, y: position.y + 0.09, z: position.z },
      material: this.materials.flowerStem,
      radialSegments: 6,
    });
    const bloom = this.createSphere({
      name: `${name}:Bloom`,
      radius: 0.045,
      position: { x: position.x, y: position.y + 0.2, z: position.z },
      material: colorMaterial,
      scale: { x: 1.15, y: 0.55, z: 1.15 },
      widthSegments: 8,
      heightSegments: 6,
    });

    this.room.group.add(stem, bloom);
  }

  addBoulder({ name, position, radius = 0.55, scale = { x: 1, y: 0.75, z: 1 } }) {
    const mesh = this.createSphere({
      name,
      radius,
      position,
      material: this.materials.rock,
      scale,
      widthSegments: 16,
      heightSegments: 10,
    });
    this.room.group.add(mesh);
    this.room.addCollider(new AabbCollider({
      name: `${name}:Collider`,
      center: this.room.toWorldPosition(position),
      size: {
        x: radius * 2 * scale.x,
        y: Math.max(0.35, radius * 1.45 * scale.y),
        z: radius * 2 * scale.z,
      },
    }));

    return mesh;
  }

  addFallenLog({ name, position, length = 2.6, radius = 0.18, rotation = DEFAULT_ROTATION }) {
    const mesh = this.createCylinder({
      name,
      radiusTop: radius,
      radiusBottom: radius,
      height: length,
      position,
      rotation,
      material: this.materials.bark,
      radialSegments: 12,
    });
    this.room.group.add(mesh);
    this.room.addCollider(new AabbCollider({
      name: `${name}:Collider`,
      center: this.room.toWorldPosition(position),
      size: this.getRotatedLogSize(length, radius, rotation.y),
    }));

    return mesh;
  }

  createCylinder({ name, radiusTop, radiusBottom, height, position, material, radialSegments = 16, rotation = DEFAULT_ROTATION }) {
    const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.position.set(position.x, position.y, position.z);
    mesh.rotation.set(rotation.x, rotation.y, rotation.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.room.ownedGeometries.add(geometry);

    return mesh;
  }

  createCone({ name, radius, height, position, material, radialSegments = 16 }) {
    const geometry = new THREE.ConeGeometry(radius, height, radialSegments);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.position.set(position.x, position.y, position.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.room.ownedGeometries.add(geometry);

    return mesh;
  }

  createSphere({ name, radius, position, material, scale = { x: 1, y: 1, z: 1 }, widthSegments = 16, heightSegments = 10 }) {
    const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.position.set(position.x, position.y, position.z);
    mesh.scale.set(scale.x, scale.y, scale.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.room.ownedGeometries.add(geometry);

    return mesh;
  }

  getRotatedLogSize(length, radius, rotationY) {
    const diameter = radius * 2;
    const cos = Math.abs(Math.cos(rotationY));
    const sin = Math.abs(Math.sin(rotationY));

    return {
      x: length * sin + diameter * cos,
      y: diameter,
      z: length * cos + diameter * sin,
    };
  }
}
