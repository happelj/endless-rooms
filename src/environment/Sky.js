import * as THREE from 'three';

const DEFAULT_CLOUDS = Object.freeze([
  Object.freeze({ x: -9, y: 9.4, z: -4, scale: 1.15, speed: 0.18 }),
  Object.freeze({ x: 2.4, y: 10.2, z: 4.8, scale: 0.95, speed: 0.12 }),
  Object.freeze({ x: 11, y: 8.8, z: -11, scale: 1.35, speed: 0.15 }),
]);

export class Sky {
  constructor({ radius = 80, cloudMaterial, skyColor = 0x8fc8ff, clouds = DEFAULT_CLOUDS } = {}) {
    this.group = new THREE.Group();
    this.group.name = 'OutdoorSky';
    this.clouds = [];

    this.addSkyDome(radius, skyColor);
    this.addClouds(cloudMaterial, clouds);
  }

  addSkyDome(radius, skyColor) {
    const geometry = new THREE.SphereGeometry(radius, 32, 16);
    const material = new THREE.MeshBasicMaterial({
      color: skyColor,
      side: THREE.BackSide,
      depthWrite: false,
      toneMapped: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'OutdoorSkyDome';
    this.group.add(mesh);
    this.skyDome = mesh;
  }

  addClouds(material, clouds) {
    for (const [index, cloud] of clouds.entries()) {
      const group = new THREE.Group();
      group.name = `OutdoorCloud:${index + 1}`;
      group.position.set(cloud.x, cloud.y, cloud.z);
      group.scale.setScalar(cloud.scale);

      for (const [partIndex, offset] of [
        { x: -0.9, y: 0, z: 0, scale: 0.86 },
        { x: 0, y: 0.15, z: 0.06, scale: 1.1 },
        { x: 0.95, y: -0.02, z: -0.04, scale: 0.78 },
      ].entries()) {
        const geometry = new THREE.SphereGeometry(0.75 * offset.scale, 14, 8);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = `OutdoorCloudPart:${index + 1}:${partIndex + 1}`;
        mesh.position.set(offset.x, offset.y, offset.z);
        mesh.scale.y = 0.28;
        mesh.castShadow = false;
        mesh.receiveShadow = false;
        group.add(mesh);
      }

      this.clouds.push({
        group,
        baseX: cloud.x,
        speed: cloud.speed,
        phase: index * 1.7,
      });
      this.group.add(group);
    }
  }

  update(elapsedTime) {
    for (const cloud of this.clouds) {
      cloud.group.position.x = cloud.baseX + Math.sin(elapsedTime * cloud.speed + cloud.phase) * 1.8;
    }
  }

  dispose() {
    this.skyDome.geometry.dispose();
    this.skyDome.material.dispose();

    for (const cloud of this.clouds) {
      for (const mesh of cloud.group.children) {
        mesh.geometry.dispose();
      }
    }

    this.group.clear();
    this.clouds.length = 0;
  }
}
