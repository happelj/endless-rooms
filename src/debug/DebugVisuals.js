import * as THREE from 'three';
import { DEBUG_CONFIG, PLAYER_CONFIG } from '../config/constants.js';

export class DebugVisuals {
  constructor(scene, roomManager, player, config = DEBUG_CONFIG) {
    this.scene = scene;
    this.roomManager = roomManager;
    this.player = player;
    this.config = config;
    this.group = new THREE.Group();
    this.group.name = 'DebugVisuals';
    this.helpers = new Set();

    this.playerBounds = this.createPlayerBounds();
    this.createRoomBounds();
    this.createPortalTriggers();

    this.scene.add(this.group);
  }

  update() {
    this.updatePlayerBounds();
  }

  createPlayerBounds() {
    const { radius, height } = PLAYER_CONFIG.body;
    const geometry = new THREE.CylinderGeometry(
      radius,
      radius,
      height,
      this.config.playerBounds.radialSegments,
      1,
      true,
    );
    const material = new THREE.MeshBasicMaterial({
      color: this.config.playerBounds.color,
      wireframe: true,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = 'DebugPlayerBounds';
    mesh.renderOrder = 10;
    this.group.add(mesh);

    return mesh;
  }

  createRoomBounds() {
    for (const room of this.roomManager.getRooms()) {
      if (!room.boundsCollider) {
        continue;
      }

      const helper = new THREE.Box3Helper(
        room.boundsCollider.getBoundsBox(),
        this.config.roomBounds.color,
      );
      helper.name = `DebugRoomBounds:${room.id}`;
      this.helpers.add(helper);
      this.group.add(helper);
    }
  }

  createPortalTriggers() {
    for (const portal of this.roomManager.getPortals()) {
      const helper = new THREE.Box3Helper(
        portal.triggerBox,
        this.config.portalTriggers.color,
      );
      helper.name = `DebugPortalTrigger:${portal.id}`;
      this.helpers.add(helper);
      this.group.add(helper);
    }
  }

  updatePlayerBounds() {
    const { height, eyeHeight } = PLAYER_CONFIG.body;
    this.playerBounds.position.set(
      this.player.position.x,
      this.player.position.y - eyeHeight + height / 2,
      this.player.position.z,
    );
  }

  dispose() {
    this.scene.remove(this.group);

    for (const helper of this.helpers) {
      helper.geometry?.dispose?.();
      helper.material?.dispose?.();
    }

    this.playerBounds.geometry.dispose();
    this.playerBounds.material.dispose();
    this.group.clear();
    this.helpers.clear();
  }
}
