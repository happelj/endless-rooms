import { TestRoomLightSwitch } from './TestRoomLightSwitch.js';

export class BlackLightSwitch extends TestRoomLightSwitch {
  constructor(options) {
    super({
      label: 'Black Light',
      prompt: 'Toggle Black Light',
      ...options,
    });
  }
}
