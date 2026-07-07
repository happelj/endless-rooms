import { TEST_ROOM_CONFIG } from '../config/constants.js';
import { RectangularRoom } from './RectangularRoom.js';

export class TestRoom extends RectangularRoom {
  constructor(scene, collisionSystem, config = TEST_ROOM_CONFIG) {
    super(scene, collisionSystem, config);
  }
}
