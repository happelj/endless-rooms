import { RoomLabel } from '../RoomLabel.js';

export class TestRoomLightSwitch {
  constructor({
    room,
    id,
    label,
    prompt,
    plate,
    lever,
    labelConfig,
    onInteract,
  }) {
    this.room = room;
    this.id = id;
    this.label = label;
    this.prompt = prompt;
    this.onInteract = onInteract;
    this.targets = [];

    this.plate = this.room.addBox({
      name: `${id}:Plate`,
      size: plate.size,
      position: plate.position,
      material: plate.material,
      castShadow: true,
      receiveShadow: true,
    });

    this.lever = this.room.addBox({
      name: `${id}:Lever`,
      size: lever.size,
      position: lever.position,
      material: lever.material,
      castShadow: true,
      receiveShadow: true,
    });

    this.targets.push(this.plate, this.lever);

    if (labelConfig) {
      this.sign = new RoomLabel({
        text: label,
        width: labelConfig.width,
        height: labelConfig.height,
        position: labelConfig.position,
        rotationY: labelConfig.rotationY,
      });
      this.room.addLabel(this.sign);
      this.targets.push(this.sign.mesh);
    }

    this.interactable = this.room.registerInteractable(this.targets, {
      id,
      range: 2.2,
      prompt,
      onInteract: (context) => this.onInteract?.(context),
    });
  }
}
