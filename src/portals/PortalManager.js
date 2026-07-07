export class PortalManager {
  constructor() {
    this.portals = new Map();
  }

  registerPortal(portal) {
    if (this.portals.has(portal.id)) {
      throw new Error(`Portal already registered: ${portal.id}`);
    }

    this.portals.set(portal.id, portal);
  }

  getPortalCount() {
    return this.portals.size;
  }

  getConnectedRoomCount(roomId) {
    return this.getConnectedRooms(roomId).size;
  }

  getConnectedRooms(roomId) {
    const connectedRooms = new Set();

    for (const portal of this.portals.values()) {
      if (portal.sourceRoom === roomId) {
        connectedRooms.add(portal.destinationRoom);
      }
    }

    return connectedRooms;
  }

  getPortals() {
    return Array.from(this.portals.values());
  }

  getPortalForPosition(roomId, position) {
    for (const portal of this.portals.values()) {
      if (portal.sourceRoom === roomId && portal.containsPosition(position)) {
        return portal;
      }
    }

    return null;
  }

  dispose() {
    this.portals.clear();
  }
}
