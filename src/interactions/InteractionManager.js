import * as THREE from 'three';
import { INTERACTION_CONFIG } from '../config/constants.js';

const SCREEN_CENTER = new THREE.Vector2(0, 0);

export class InteractionManager {
  constructor(camera, domElement, roomManager, hud, config = INTERACTION_CONFIG) {
    this.camera = camera;
    this.domElement = domElement;
    this.roomManager = roomManager;
    this.hud = hud;
    this.config = config;
    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = config.maxDistance;
    this.focusedInteraction = null;

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleClick = this.handleClick.bind(this);

    document.addEventListener('keydown', this.handleKeyDown);
    this.domElement.addEventListener('click', this.handleClick);
  }

  update() {
    this.updateFocusedInteraction();
  }

  updateFocusedInteraction() {
    if (document.pointerLockElement !== this.domElement) {
      this.focusedInteraction = null;
      this.hud.updateInteractionPrompt('');
      return;
    }

    const interaction = this.findFocusedInteraction();
    this.focusedInteraction = interaction;

    if (!interaction) {
      this.hud.updateInteractionPrompt('');
      return;
    }

    this.hud.updateInteractionPrompt(this.getPromptText(interaction));
  }

  findFocusedInteraction() {
    const interactables = this.roomManager.getActiveInteractables();

    if (interactables.length === 0) {
      return null;
    }

    this.raycaster.setFromCamera(SCREEN_CENTER, this.camera);

    for (const hit of this.raycaster.intersectObjects(interactables, true)) {
      const interaction = this.getInteractionFromObject(hit.object);

      if (interaction) {
        return interaction;
      }
    }

    return null;
  }

  getInteractionFromObject(object) {
    let currentObject = object;

    while (currentObject) {
      if (currentObject.userData.interaction) {
        return currentObject.userData.interaction;
      }

      currentObject = currentObject.parent;
    }

    return null;
  }

  getPromptText(interaction) {
    const label = typeof interaction.getPrompt === 'function'
      ? interaction.getPrompt()
      : interaction.prompt;

    return `[${this.config.primaryActionLabel}] ${label}`;
  }

  handleKeyDown(event) {
    if (document.pointerLockElement !== this.domElement) {
      return;
    }

    if (event.repeat || !this.isInteractionKey(event.code)) {
      return;
    }

    this.triggerFocusedInteraction(event);
  }

  handleClick(event) {
    if (document.pointerLockElement !== this.domElement) {
      return;
    }

    this.triggerFocusedInteraction(event);
  }

  triggerFocusedInteraction(event) {
    if (!this.focusedInteraction?.onInteract) {
      return;
    }

    event.preventDefault();
    this.focusedInteraction.onInteract();
    this.updateFocusedInteraction();
  }

  isInteractionKey(code) {
    return this.config.keys.interact.includes(code);
  }

  dispose() {
    document.removeEventListener('keydown', this.handleKeyDown);
    this.domElement.removeEventListener('click', this.handleClick);
    this.hud.updateInteractionPrompt('');
  }
}
