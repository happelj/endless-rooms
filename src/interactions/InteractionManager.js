import * as THREE from 'three';
import { INTERACTION_CONFIG } from '../config/constants.js';

const SCREEN_CENTER = new THREE.Vector2(0, 0);

export class InteractionManager {
  constructor(camera, domElement, roomManager, hud, contentManager = null, config = INTERACTION_CONFIG) {
    this.camera = camera;
    this.domElement = domElement;
    this.roomManager = roomManager;
    this.hud = hud;
    this.contentManager = contentManager;
    this.config = config;
    this.raycaster = new THREE.Raycaster();
    this.raycaster.far = config.maxDistance;
    this.focusedInteraction = null;
    this.candidateTargets = [];
    this.scratchPosition = new THREE.Vector3();

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleClick = this.handleClick.bind(this);

    document.addEventListener('keydown', this.handleKeyDown);
    this.domElement.addEventListener('click', this.handleClick);
  }

  update() {
    this.updateFocusedInteraction();
  }

  updateFocusedInteraction() {
    if (this.contentManager?.isOpen()) {
      this.focusedInteraction = null;
      this.hud.updateInteractionPrompt('');
      return;
    }

    if (document.pointerLockElement !== this.domElement) {
      this.focusedInteraction = null;
      this.hud.updateInteractionPrompt('');
      this.hud.hideInfoPanel();
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

    this.candidateTargets.length = 0;

    for (const interactable of interactables) {
      if (!interactable.isEnabled() || !interactable.isInRange(this.camera.position, this.scratchPosition)) {
        continue;
      }

      this.candidateTargets.push(...interactable.getTargets());
    }

    if (this.candidateTargets.length === 0) {
      return null;
    }

    this.raycaster.setFromCamera(SCREEN_CENTER, this.camera);
    this.raycaster.far = this.config.maxDistance;

    for (const hit of this.raycaster.intersectObjects(this.candidateTargets, true)) {
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
      if (currentObject.userData.interactable) {
        return currentObject.userData.interactable;
      }

      currentObject = currentObject.parent;
    }

    return null;
  }

  getPromptText(interaction) {
    return `[${this.config.primaryActionLabel}] ${interaction.getPrompt({
      camera: this.camera,
      roomManager: this.roomManager,
      contentManager: this.contentManager,
    })}`;
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
    if (!this.focusedInteraction) {
      return;
    }

    event.preventDefault();
    this.focusedInteraction.interact({
      camera: this.camera,
      roomManager: this.roomManager,
      contentManager: this.contentManager,
    });
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
