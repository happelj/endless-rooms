import { PORTAL_CONFIGS, ROOM_MANAGER_CONFIG } from '../config/constants.js';
import { Portal } from '../portals/Portal.js';
import { PortalManager } from '../portals/PortalManager.js';
import { LobbyRoom } from './LobbyRoom.js';
import { TestRoom } from './TestRoom.js';

export class RoomManager {
  constructor(scene, collisionSystem, hud) {
    this.scene = scene;
    this.collisionSystem = collisionSystem;
    this.hud = hud;
    this.rooms = new Map();
    this.portalManager = new PortalManager();
    this.activeRoomId = null;
    this.player = null;

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
  }

  registerRoom(room) {
    if (this.rooms.has(room.id)) {
      throw new Error(`Room already registered: ${room.id}`);
    }

    this.rooms.set(room.id, room);

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
    room.activate();
    this.activeRoomId = roomId;
    this.updateHud();
  }

  deactivateRoom(roomId) {
    const room = this.getRequiredRoom(roomId);
    room.deactivate();
  }

  update() {
    if (!this.player || !this.activeRoomId) {
      return;
    }

    const portal = this.portalManager.getPortalForPosition(this.activeRoomId, this.player.position);

    if (portal) {
      this.transitionThroughPortal(portal);
    }

    this.updateHud();
  }

  transitionThroughPortal(portal) {
    this.activateRoom(portal.destinationRoom);

    if (!portal.continuous) {
      this.player.setPose(portal.spawnPosition, portal.spawnRotation);
    }
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
    });
  }

  getRequiredRoom(roomId) {
    const room = this.rooms.get(roomId);

    if (!room) {
      throw new Error(`Room is not registered: ${roomId}`);
    }

    return room;
  }

  dispose() {
    for (const room of this.rooms.values()) {
      room.dispose();
    }

    this.portalManager.dispose();
    this.rooms.clear();
    this.activeRoomId = null;
    this.player = null;
  }
}
