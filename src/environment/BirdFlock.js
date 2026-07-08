import * as THREE from 'three';

const DEFAULT_CENTER = Object.freeze({ x: 0, y: 8, z: 0 });

export class BirdFlock {
  constructor({
    name = 'BirdFlock',
    center = DEFAULT_CENTER,
    count = 5,
    radiusX = 4.8,
    radiusZ = 2.2,
    heightVariation = 0.55,
    speed = 0.14,
    material,
  }) {
    this.name = name;
    this.center = center;
    this.count = count;
    this.radiusX = radiusX;
    this.radiusZ = radiusZ;
    this.heightVariation = heightVariation;
    this.speed = speed;
    this.material = material;
    this.group = new THREE.Group();
    this.group.name = name;
    this.birds = [];
    this.wingGeometry = new THREE.PlaneGeometry(0.22, 0.055);

    this.build();
  }

  build() {
    for (let index = 0; index < this.count; index += 1) {
      const bird = this.createBird(index);
      this.birds.push({
        group: bird,
        leftWing: bird.children[0],
        rightWing: bird.children[1],
        phase: (index / this.count) * Math.PI * 2,
        radiusOffset: 1 + (index % 3) * 0.08,
        speedOffset: 0.82 + (index % 4) * 0.11,
      });
      this.group.add(bird);
    }
  }

  createBird(index) {
    const group = new THREE.Group();
    group.name = `${this.name}:Bird:${index + 1}`;

    const leftWing = new THREE.Mesh(this.wingGeometry, this.material);
    leftWing.name = `${group.name}:LeftWing`;
    leftWing.position.x = -0.09;
    leftWing.rotation.z = 0.45;

    const rightWing = new THREE.Mesh(this.wingGeometry, this.material);
    rightWing.name = `${group.name}:RightWing`;
    rightWing.position.x = 0.09;
    rightWing.rotation.z = -0.45;

    group.add(leftWing, rightWing);
    group.scale.setScalar(0.8 + (index % 3) * 0.14);

    return group;
  }

  update(elapsedTime) {
    for (const bird of this.birds) {
      const angle = elapsedTime * this.speed * bird.speedOffset + bird.phase;
      const x = this.center.x + Math.cos(angle) * this.radiusX * bird.radiusOffset;
      const z = this.center.z + Math.sin(angle) * this.radiusZ * bird.radiusOffset;
      const y = this.center.y + Math.sin(angle * 1.7 + bird.phase) * this.heightVariation;
      const flap = Math.sin(elapsedTime * 5.2 + bird.phase) * 0.18;

      bird.group.position.set(x, y, z);
      bird.group.rotation.y = -angle + Math.PI / 2;
      bird.leftWing.rotation.z = 0.45 + flap;
      bird.rightWing.rotation.z = -0.45 - flap;
    }
  }

  dispose() {
    this.wingGeometry.dispose();
    this.group.clear();
    this.birds.length = 0;
  }
}
