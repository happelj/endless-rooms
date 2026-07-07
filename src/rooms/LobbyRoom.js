import { LOBBY_ROOM_CONFIG } from '../config/constants.js';
import { RectangularRoom } from './RectangularRoom.js';

export class LobbyRoom extends RectangularRoom {
  constructor(scene, collisionSystem, config = LOBBY_ROOM_CONFIG) {
    super(scene, collisionSystem, config);
  }
}
