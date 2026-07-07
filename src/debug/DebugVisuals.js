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
    this.interactionRangeHelpers = new Map();

    this.playerBounds = this.config.showPhysicsBounds ? this.createPlayerBounds() : null;

    if (this.config.showPhysicsBounds) {
      this.createRoomBounds();
      this.createPortalTriggers();
    }

    if (this.config.showInteractionRanges) {
      this.createInteractionRanges();
    }

    this.scene.add(this.group);
  }

  update() {
    this.updatePlayerBounds();
    this.updateInteractionRanges();
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

  createInteractionRanges() {
    for (const room of this.roomManager.getRooms()) {
      for (const interactable of room.getInteractables()) {
        const geometry = new THREE.SphereGeometry(
          interactable.range,
          this.config.interactionRanges.radialSegments,
          Math.max(8, this.config.interactionRanges.radialSegments / 2),
        );
        const material = new THREE.MeshBasicMaterial({
          color: this.config.interactionRanges.color,
          wireframe: true,
          depthWrite: false,
          transparent: true,
          opacity: 0.55,
        });
        const helper = new THREE.Mesh(geometry, material);
        helper.name = `DebugInteractionRange:${interactable.id}`;
        helper.renderOrder = 10;
        this.interactionRangeHelpers.set(interactable, helper);
        this.helpers.add(helper);
        this.group.add(helper);
      }
    }
  }

  updatePlayerBounds() {
    if (!this.playerBounds) {
      return;
    }

    const { height, eyeHeight } = PLAYER_CONFIG.body;
    this.playerBounds.position.set(
      this.player.position.x,
      this.player.position.y - eyeHeight + height / 2,
      this.player.position.z,
    );
  }

  updateInteractionRanges() {
    for (const [interactable, helper] of this.interactionRangeHelpers) {
      interactable.getWorldPosition(helper.position);
      helper.visible = interactable.isEnabled();
    }
  }

  dispose() {
    this.scene.remove(this.group);

    for (const helper of this.helpers) {
      helper.geometry?.dispose?.();
      helper.material?.dispose?.();
    }

    this.playerBounds?.geometry.dispose();
    this.playerBounds?.material.dispose();
    this.group.clear();
    this.helpers.clear();
    this.interactionRangeHelpers.clear();
  }
}
