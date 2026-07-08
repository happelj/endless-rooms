import * as THREE from 'three';

const DEFAULT_POSITION = Object.freeze({ x: 0, y: 0, z: 0 });

export class OrbitalBackdrop {
  constructor({ name = 'OrbitalBackdrop', position = DEFAULT_POSITION } = {}) {
    this.name = name;
    this.group = new THREE.Group();
    this.group.name = name;
    this.group.position.set(position.x, position.y, position.z);
    this.geometries = new Set();
    this.materials = new Set();

    this.build();
  }

  build() {
    this.addStarField();
    this.addNebula();
    this.addPlanet();
  }

  addStarField() {
    const starCount = 120;
    const positions = new Float32Array(starCount * 3);

    for (let index = 0; index < starCount; index += 1) {
      const stride = index * 3;
      positions[stride] = -18 - this.random01(index, 1) * 16;
      positions[stride + 1] = -7 + this.random01(index, 2) * 16;
      positions[stride + 2] = -14 + this.random01(index, 3) * 28;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0xd8f1ff,
      size: 0.055,
      transparent: true,
      opacity: 0.86,
      depthWrite: false,
      toneMapped: false,
    });

    this.stars = new THREE.Points(geometry, material);
    this.stars.name = `${this.name}:Stars`;
    this.group.add(this.stars);
    this.geometries.add(geometry);
    this.materials.add(material);
  }

  addNebula() {
    this.nebulaGroup = new THREE.Group();
    this.nebulaGroup.name = `${this.name}:Nebula`;

    for (const [index, cloud] of [
      { x: -23, y: 5.2, z: -6, radius: 3.8, color: 0x4766aa, opacity: 0.16 },
      { x: -24.5, y: 3.6, z: -3, radius: 2.9, color: 0x7b5fb8, opacity: 0.11 },
      { x: -22.8, y: 2.1, z: 1.5, radius: 3.4, color: 0x4aa5c7, opacity: 0.12 },
    ].entries()) {
      const geometry = new THREE.CircleGeometry(cloud.radius, 28);
      const material = new THREE.MeshBasicMaterial({
        color: cloud.color,
        transparent: true,
        opacity: cloud.opacity,
        side: THREE.DoubleSide,
        depthWrite: false,
        toneMapped: false,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.name = `${this.name}:NebulaCloud:${index + 1}`;
      mesh.position.set(cloud.x, cloud.y, cloud.z);
      mesh.rotation.y = Math.PI / 2;
      this.nebulaGroup.add(mesh);
      this.geometries.add(geometry);
      this.materials.add(material);
    }

    this.group.add(this.nebulaGroup);
  }

  addPlanet() {
    this.planetGroup = new THREE.Group();
    this.planetGroup.name = `${this.name}:PlanetGroup`;
    this.planetGroup.position.set(-25, -1.25, 1.6);

    const planetGeometry = new THREE.SphereGeometry(3.2, 40, 22);
    const planetMaterial = new THREE.MeshBasicMaterial({
      color: 0x2b83c6,
      toneMapped: false,
    });
    this.planet = new THREE.Mesh(planetGeometry, planetMaterial);
    this.planet.name = `${this.name}:EarthLikePlanet`;
    this.planetGroup.add(this.planet);
    this.geometries.add(planetGeometry);
    this.materials.add(planetMaterial);

    this.addPlanetPatch('ContinentA', { x: 3.05, y: 0.38, z: 0.15 }, { x: 1.35, y: 0.55, z: 1 }, 0x3a9a57);
    this.addPlanetPatch('ContinentB', { x: 3.0, y: -0.45, z: -0.9 }, { x: 1.05, y: 0.42, z: 1 }, 0x4a8f45);
    this.addPlanetPatch('CloudBandA', { x: 3.12, y: 0.9, z: 0.25 }, { x: 1.9, y: 0.16, z: 1 }, 0xffffff, 0.55);
    this.addPlanetPatch('CloudBandB', { x: 3.14, y: -0.1, z: -0.25 }, { x: 2.1, y: 0.13, z: 1 }, 0xffffff, 0.44);

    this.group.add(this.planetGroup);
  }

  addPlanetPatch(name, position, scale, color, opacity = 0.82) {
    const geometry = new THREE.CircleGeometry(0.55, 18);
    const material = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity,
      side: THREE.DoubleSide,
      depthWrite: false,
      toneMapped: false,
    });
    const patch = new THREE.Mesh(geometry, material);
    patch.name = `${this.name}:${name}`;
    patch.position.set(position.x, position.y, position.z);
    patch.rotation.y = Math.PI / 2;
    patch.scale.set(scale.x, scale.y, scale.z);
    this.planetGroup.add(patch);
    this.geometries.add(geometry);
    this.materials.add(material);
  }

  update(elapsedTime) {
    this.group.position.z = Math.sin(elapsedTime * 0.035) * 0.45;
    this.stars.rotation.x = Math.sin(elapsedTime * 0.018) * 0.01;
    this.nebulaGroup.rotation.x = Math.sin(elapsedTime * 0.02) * 0.015;
    this.planetGroup.rotation.y = elapsedTime * 0.025;
  }

  random01(index, channel) {
    const value = Math.sin((index + 1) * (channel * 12.9898)) * 43758.5453;
    return value - Math.floor(value);
  }

  dispose() {
    for (const geometry of this.geometries) {
      geometry.dispose();
    }

    for (const material of this.materials) {
      material.dispose();
    }

    this.group.clear();
    this.geometries.clear();
    this.materials.clear();
  }
}
