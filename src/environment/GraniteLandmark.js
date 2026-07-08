import * as THREE from 'three';

const DEFAULT_POSITION = Object.freeze({ x: 0, y: 0, z: 0 });
const DEFAULT_ROTATION = Object.freeze({ x: 0, y: 0, z: 0 });
const DEFAULT_SCALE = Object.freeze({ x: 1, y: 1, z: 1 });

const COLLISION_BOXES = Object.freeze([
  Object.freeze({
    center: Object.freeze({ x: -0.3, y: 1.4, z: -1.2 }),
    size: Object.freeze({ x: 12.8, y: 2.8, z: 4.4 }),
  }),
  Object.freeze({
    center: Object.freeze({ x: 1.35, y: 4.8, z: -1.2 }),
    size: Object.freeze({ x: 6.6, y: 8.7, z: 0.95 }),
  }),
  Object.freeze({
    center: Object.freeze({ x: -1.1, y: 4.2, z: 1.2 }),
    size: Object.freeze({ x: 8.2, y: 7.2, z: 4.8 }),
  }),
]);

export class GraniteLandmark {
  constructor({ name = 'GraniteLandmark', position = DEFAULT_POSITION, materials }) {
    this.name = name;
    this.position = position;
    this.materials = materials;
    this.group = new THREE.Group();
    this.group.name = name;
    this.group.position.set(position.x, position.y, position.z);
    this.geometries = new Set();

    this.build();
  }

  build() {
    this.addBaseMasses();
    this.addRoundedDome();
    this.addSheerFace();
    this.addGraniteStrata();
  }

  addBaseMasses() {
    this.addEllipsoid({
      name: `${this.name}:BaseApron`,
      radius: 1,
      position: { x: -0.45, y: 1.15, z: -1.2 },
      scale: { x: 7.4, y: 1.35, z: 2.55 },
      material: this.materials.granite,
    });

    this.addEllipsoid({
      name: `${this.name}:LowerShoulder`,
      radius: 1,
      position: { x: -2.0, y: 2.45, z: 0.35 },
      scale: { x: 5.7, y: 2.35, z: 2.85 },
      material: this.materials.graniteShadow,
    });

    this.addBox({
      name: `${this.name}:FrontTerrace`,
      size: { x: 9.8, y: 0.55, z: 1.15 },
      position: { x: -0.7, y: 1.4, z: -2.95 },
      material: this.materials.graniteLight,
    });
  }

  addRoundedDome() {
    const geometry = new THREE.SphereGeometry(1, 36, 18, 0, Math.PI * 2, 0, Math.PI / 2);
    const mesh = this.createMesh(geometry, this.materials.granite, {
      name: `${this.name}:RoundedDome`,
      position: { x: -0.75, y: 2.05, z: 0.85 },
      scale: { x: 5.85, y: 8.15, z: 3.9 },
      rotation: { x: 0, y: -0.08, z: 0 },
    });
    mesh.receiveShadow = true;
  }

  addSheerFace() {
    this.addBox({
      name: `${this.name}:SheerFace`,
      size: { x: 6.25, y: 8.8, z: 0.48 },
      position: { x: 1.75, y: 4.6, z: -2.05 },
      rotation: { x: 0, y: -0.08, z: 0 },
      material: this.materials.graniteLight,
    });

    this.addBox({
      name: `${this.name}:FaceShadowSide`,
      size: { x: 1.45, y: 8.35, z: 0.5 },
      position: { x: -2.0, y: 4.35, z: -1.92 },
      rotation: { x: 0, y: -0.08, z: 0 },
      material: this.materials.graniteShadow,
    });
  }

  addGraniteStrata() {
    for (const [index, y] of [1.95, 2.85, 3.86, 5.05, 6.18].entries()) {
      this.addBox({
        name: `${this.name}:HorizontalStrata:${index + 1}`,
        size: { x: 5.7 - index * 0.34, y: 0.055, z: 0.06 },
        position: { x: 1.8 - index * 0.13, y, z: -2.325 },
        rotation: { x: 0, y: -0.08, z: -0.02 + index * 0.012 },
        material: this.materials.graniteCrease,
        castShadow: false,
        receiveShadow: false,
      });
    }

    for (const [index, strip] of [
      { x: 0.05, y: 4.25, height: 5.4, rotationZ: -0.035 },
      { x: 1.45, y: 5.1, height: 4.75, rotationZ: 0.026 },
      { x: 2.8, y: 4.05, height: 5.7, rotationZ: -0.018 },
    ].entries()) {
      this.addBox({
        name: `${this.name}:VerticalCrease:${index + 1}`,
        size: { x: 0.07, y: strip.height, z: 0.075 },
        position: { x: strip.x, y: strip.y, z: -2.35 },
        rotation: { x: 0, y: -0.08, z: strip.rotationZ },
        material: this.materials.graniteCrease,
        castShadow: false,
        receiveShadow: false,
      });
    }

    this.addBox({
      name: `${this.name}:SunlitLip`,
      size: { x: 5.5, y: 0.28, z: 0.55 },
      position: { x: 1.2, y: 8.92, z: -1.92 },
      rotation: { x: 0, y: -0.08, z: 0.015 },
      material: this.materials.graniteLight,
    });
  }

  addBox({
    name,
    size,
    position,
    material,
    rotation = DEFAULT_ROTATION,
    castShadow = true,
    receiveShadow = true,
  }) {
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const mesh = this.createMesh(geometry, material, {
      name,
      position,
      rotation,
      castShadow,
      receiveShadow,
    });

    return mesh;
  }

  addEllipsoid({
    name,
    radius,
    position,
    scale = DEFAULT_SCALE,
    material,
    rotation = DEFAULT_ROTATION,
  }) {
    const geometry = new THREE.SphereGeometry(radius, 24, 12);
    return this.createMesh(geometry, material, {
      name,
      position,
      scale,
      rotation,
    });
  }

  createMesh(
    geometry,
    material,
    {
      name,
      position = DEFAULT_POSITION,
      scale = DEFAULT_SCALE,
      rotation = DEFAULT_ROTATION,
      castShadow = true,
      receiveShadow = true,
    },
  ) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.position.set(position.x, position.y, position.z);
    mesh.scale.set(scale.x, scale.y, scale.z);
    mesh.rotation.set(rotation.x, rotation.y, rotation.z);
    mesh.castShadow = castShadow;
    mesh.receiveShadow = receiveShadow;
    this.group.add(mesh);
    this.geometries.add(geometry);

    return mesh;
  }

  getCollisionBoxes() {
    return COLLISION_BOXES.map((box) => ({
      center: {
        x: this.position.x + box.center.x,
        y: this.position.y + box.center.y,
        z: this.position.z + box.center.z,
      },
      size: box.size,
    }));
  }

  dispose() {
    for (const geometry of this.geometries) {
      geometry.dispose();
    }

    this.group.clear();
    this.geometries.clear();
  }
}
