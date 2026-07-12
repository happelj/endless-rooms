import {
  PLAYER_CONFIG,
  PORTAL_CONFIGS,
  ROOM_DIMENSIONS,
  ROOM_IDS,
  ROOM_MANAGER_CONFIG,
} from '../config/constants.js';
import { Portal } from '../portals/Portal.js';
import { PortalManager } from '../portals/PortalManager.js';
import { BroadcastCodeManager } from '../state/BroadcastCodeManager.js';
import { RoomThemeManager } from '../themes/RoomThemeManager.js';
import { AquariumRoom } from './AquariumRoom.js';
import { ForgottenLevelRoom } from './ForgottenLevelRoom.js';
import { LibraryRoom } from './LibraryRoom.js';
import { LobbyRoom } from './LobbyRoom.js';
import { SpaceStationRoom } from './SpaceStationRoom.js';
import { TestRoom } from './TestRoom.js';
import { TomAndJerryRoom } from './TomAndJerryRoom.js';
import { YosemiteRoom } from './YosemiteRoom.js';

export class RoomManager {
  constructor(scene, collisionSystem, hud, audioManager = null) {
    this.scene = scene;
    this.collisionSystem = collisionSystem;
    this.hud = hud;
    this.audioManager = audioManager;
    this.rooms = new Map();
    this.portalManager = new PortalManager();
    this.broadcastCodeManager = new BroadcastCodeManager();
    this.themeManager = new RoomThemeManager(scene);
    this.activeRoomId = null;
    this.player = null;
    this.hasCompass = false;
    this.infoPanelTimeoutId = null;

    this.createRooms();
    this.createPortals();
    this.activateRoom(ROOM_MANAGER_CONFIG.initialRoomId);
  }

  setPlayer(player) {
    this.player = player;
    this.updateHud();
  }

  createRooms() {
    this.registerRoom(new LobbyRoom(this.scene, this.collisionSystem));
    this.registerRoom(new TestRoom(this.scene, this.collisionSystem));
    this.registerRoom(new TomAndJerryRoom(this.scene, this.collisionSystem));
    this.registerRoom(new AquariumRoom(this.scene, this.collisionSystem));
    this.registerRoom(new LibraryRoom(this.scene, this.collisionSystem));
    this.registerRoom(new YosemiteRoom(this.scene, this.collisionSystem));
    this.registerRoom(new SpaceStationRoom(this.scene, this.collisionSystem));
    this.registerRoom(new ForgottenLevelRoom(this.scene, this.collisionSystem));
  }

  registerRoom(room) {
    if (this.rooms.has(room.id)) {
      throw new Error(`Room already registered: ${room.id}`);
    }

    this.rooms.set(room.id, room);
    room.configureAudio?.(this.audioManager);

    return room;
  }

  createPortals() {
    for (const portalConfig of PORTAL_CONFIGS) {
      this.registerPortal(new Portal(portalConfig));
    }
  }

  registerPortal(portal) {
    const sourceRoom = this.getRequiredRoom(portal.sourceRoom);
    this.getRequiredRoom(portal.destinationRoom);

    this.portalManager.registerPortal(portal);
    sourceRoom.addBoundsOpening(portal.getBoundsOpening());
  }

  activateRoom(roomId) {
    if (this.activeRoomId === roomId) {
      return;
    }

    if (this.activeRoomId) {
      this.deactivateRoom(this.activeRoomId);
    }

    const room = this.getRequiredRoom(roomId);
    this.themeManager.applyTheme(room.getTheme());
    room.activate();
    this.activeRoomId = roomId;
    this.audioManager?.setActiveRoom(roomId);
    this.updateHud();
  }

  deactivateRoom(roomId) {
    const room = this.getRequiredRoom(roomId);
    room.deactivate();
  }

  update(deltaTime, elapsedTime) {
    if (!this.player || !this.activeRoomId) {
      return;
    }

    const portal = this.portalManager.getPortalForPosition(this.activeRoomId, this.player.position);

    if (portal) {
      this.transitionThroughPortal(portal);
    }

    this.getActiveRoom()?.update?.(deltaTime, this.player, elapsedTime, this);
    this.updateHud();
  }

  pauseActiveRoomMedia() {
    this.getActiveRoom()?.pauseMedia?.();
  }

  resumeActiveRoomMedia() {
    this.getActiveRoom()?.resumeMedia?.();
  }

  transitionThroughPortal(portal) {
    this.activateRoom(portal.destinationRoom);

    if (!portal.continuous) {
      this.player.setPose(portal.spawnPosition, portal.spawnRotation);
    }
  }

  enterForgottenLevel(seed = undefined) {
    const forgottenLevel = this.getRequiredRoom(ROOM_IDS.forgottenLevel);
    forgottenLevel.beginRun(seed);
    this.activateRoom(ROOM_IDS.forgottenLevel);

    const spawnPose = forgottenLevel.getSpawnPose();
    this.player.setPose(spawnPose.position, spawnPose.rotation);
  }

  exitForgottenLevel() {
    this.activateRoom(ROOM_IDS.lobby);
    this.player.setPose(
      {
        x: 0,
        y: PLAYER_CONFIG.body.eyeHeight,
        z: -ROOM_DIMENSIONS.length / 2 + 1.7,
      },
      { y: Math.PI },
    );
  }

  updateHud() {
    if (!this.hud || !this.activeRoomId) {
      return;
    }

    const activeRoom = this.getRequiredRoom(this.activeRoomId);

    this.hud.updateRoomDebug({
      currentRoom: activeRoom.name,
      portalCount: this.portalManager.getPortalCount(),
      connectedRooms: this.portalManager.getConnectedRoomCount(this.activeRoomId),
      connectedDestinations: this.getConnectedDestinationNames(this.activeRoomId),
    });
    this.updateTrailCompass(activeRoom);
  }

  updateTrailCompass(activeRoom) {
    if (!this.hasCompass || this.activeRoomId !== ROOM_IDS.forgottenLevel || !this.player) {
      this.hud.updateTrailCompass({ isVisible: false });
      return;
    }

    const targetPosition = activeRoom.getCompassTargetWorldPosition?.();

    if (!targetPosition) {
      this.hud.updateTrailCompass({ isVisible: false });
      return;
    }

    const deltaX = targetPosition.x - this.player.position.x;
    const deltaZ = targetPosition.z - this.player.position.z;
    const angle = Math.atan2(deltaX, -deltaZ);
    const distance = Math.sqrt(deltaX * deltaX + deltaZ * deltaZ);

    this.hud.updateTrailCompass({
      isVisible: true,
      angle,
      distance,
    });
  }

  showTemporaryInfo({ title, body, durationMs = 2400 }) {
    if (!this.hud) {
      return;
    }

    if (this.infoPanelTimeoutId !== null) {
      window.clearTimeout(this.infoPanelTimeoutId);
      this.infoPanelTimeoutId = null;
    }

    this.hud.showInfoPanel({ title, body });
    this.infoPanelTimeoutId = window.setTimeout(() => {
      this.hud?.hideInfoPanel();
      this.infoPanelTimeoutId = null;
    }, durationMs);
  }

  markBroadcastGuideRead() {
    this.broadcastCodeManager.markGuideRead();
  }

  hasReadBroadcastGuide() {
    return this.broadcastCodeManager.hasGuideBeenRead();
  }

  getBroadcastAccessCode() {
    return this.broadcastCodeManager.getCode();
  }

  getFormattedBroadcastAccessCode() {
    return this.broadcastCodeManager.getFormattedCode();
  }

  verifyBroadcastAccessCode(input) {
    return this.broadcastCodeManager.verify(input);
  }

  collectTrailCompass() {
    this.hasCompass = true;
    this.updateHud();
  }

  hasTrailCompass() {
    return this.hasCompass;
  }

  getConnectedDestinationNames(roomId) {
    const roomNames = Array.from(this.portalManager.getConnectedRooms(roomId))
      .map((connectedRoomId) => this.getRequiredRoom(connectedRoomId).name);

    return roomNames.length > 0 ? roomNames.join(', ') : 'None';
  }

  getRooms() {
    return Array.from(this.rooms.values());
  }

  getActiveRoom() {
    if (!this.activeRoomId) {
      return null;
    }

    return this.getRequiredRoom(this.activeRoomId);
  }

  getActiveInteractables() {
    return this.getActiveRoom()?.getInteractables() ?? [];
  }

  getPortals() {
    return this.portalManager.getPortals();
  }

  getRequiredRoom(roomId) {
    const room = this.rooms.get(roomId);

    if (!room) {
      throw new Error(`Room is not registered: ${roomId}`);
    }

    return room;
  }

  dispose() {
    if (this.infoPanelTimeoutId !== null) {
      window.clearTimeout(this.infoPanelTimeoutId);
      this.infoPanelTimeoutId = null;
    }

    for (const room of this.rooms.values()) {
      room.dispose();
    }

    this.portalManager.dispose();
    this.themeManager.dispose();
    this.rooms.clear();
    this.activeRoomId = null;
    this.player = null;
    this.audioManager = null;
  }
}
