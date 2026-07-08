import * as THREE from 'three';

export class EscapeManager {
  constructor(room) {
    this.room = room;
    this.exits = new Map();
  }

  registerExit(chunk, position) {
    const box = new THREE.Box3(
      new THREE.Vector3(position.x - 0.75, 0, position.z - 0.75),
      new THREE.Vector3(position.x + 0.75, 2.45, position.z + 0.75),
    );
    box.min.add(this.room.origin);
    box.max.add(this.room.origin);
    this.exits.set(chunk.key, { box, chunk });
  }

  unregisterExit(chunkKey) {
    this.exits.delete(chunkKey);
  }

  update(player, roomManager) {
    for (const exit of this.exits.values()) {
      if (exit.box.containsPoint(player.position)) {
        roomManager.exitForgottenLevel?.();
        return;
      }
    }
  }

  reset() {
    this.exits.clear();
  }
}
