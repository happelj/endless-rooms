import * as THREE from 'three';

export class Portal {
  constructor(config) {
    this.id = config.id;
    this.sourceRoom = config.sourceRoom;
    this.destinationRoom = config.destinationRoom;
    this.continuous = config.continuous ?? false;
    this.spawnPosition = new THREE.Vector3(
      config.spawnPosition.x,
      config.spawnPosition.y,
      config.spawnPosition.z,
    );
    this.spawnRotation = {
      y: config.spawnRotation?.y ?? 0,
    };
    this.doorway = {
      wall: config.doorway.wall,
      center: config.doorway.center,
      width: config.doorway.width,
      height: config.doorway.height,
    };
    this.triggerBox = this.createTriggerBox(config.triggerVolume);
  }

  containsPosition(position) {
    return this.triggerBox.containsPoint(position);
  }

  getBoundsOpening() {
    return {
      wall: this.doorway.wall,
      center: this.doorway.center,
      width: this.doorway.width,
      height: this.doorway.height,
    };
  }

  createTriggerBox(triggerVolume) {
    const center = new THREE.Vector3(
      triggerVolume.center.x,
      triggerVolume.center.y,
      triggerVolume.center.z,
    );
    const size = new THREE.Vector3(
      triggerVolume.size.x,
      triggerVolume.size.y,
      triggerVolume.size.z,
    );
    const halfSize = size.multiplyScalar(0.5);

    return new THREE.Box3(
      center.clone().sub(halfSize),
      center.clone().add(halfSize),
    );
  }
}
