import * as THREE from 'three';
import { INTERACTION_CONFIG } from '../config/constants.js';

export class Interactable {
  constructor({
    id,
    targets,
    range = INTERACTION_CONFIG.maxDistance,
    prompt,
    getPrompt,
    onInteract,
    enabled = true,
    metadata = {},
  }) {
    if (!id) {
      throw new Error('Interactable requires an id.');
    }

    this.id = id;
    this.targets = Array.isArray(targets) ? targets : [targets];
    this.range = range;
    this.prompt = prompt;
    this.getPromptCallback = getPrompt;
    this.onInteract = onInteract;
    this.enabled = enabled;
    this.metadata = metadata;
    this.worldPosition = new THREE.Vector3();
    this.scratchPosition = new THREE.Vector3();

    for (const target of this.targets) {
      target.userData.interactable = this;
    }
  }

  getTargets() {
    return this.targets;
  }

  getPrompt(context = {}) {
    if (typeof this.getPromptCallback === 'function') {
      return this.getPromptCallback(context);
    }

    return this.prompt ?? 'Interact';
  }

  interact(context = {}) {
    if (!this.enabled || typeof this.onInteract !== 'function') {
      return;
    }

    this.onInteract(context);
  }

  isEnabled() {
    return this.enabled;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
  }

  isInRange(position, scratchVector = this.worldPosition) {
    this.getWorldPosition(scratchVector);

    return scratchVector.distanceToSquared(position) <= this.range * this.range;
  }

  getWorldPosition(target = this.worldPosition) {
    if (this.targets.length === 0) {
      return target.set(0, 0, 0);
    }

    target.set(0, 0, 0);

    for (const mesh of this.targets) {
      mesh.getWorldPosition(this.scratchPosition);
      target.add(this.scratchPosition);
    }

    return target.multiplyScalar(1 / this.targets.length);
  }

  dispose() {
    for (const target of this.targets) {
      if (target.userData.interactable === this) {
        delete target.userData.interactable;
      }
    }

    this.targets.length = 0;
  }
}
