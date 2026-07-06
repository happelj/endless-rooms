import { APP_METADATA, HUD_PLACEHOLDERS } from '../config/constants.js';

export class Hud {
  constructor(container) {
    this.container = container;
    this.root = document.createElement('div');
    this.root.className = 'hud-root';
    this.root.innerHTML = this.createTemplate();
    this.container.append(this.root);

    this.coordinateElements = {
      x: this.root.querySelector('[data-hud-coordinate="x"]'),
      y: this.root.querySelector('[data-hud-coordinate="y"]'),
      z: this.root.querySelector('[data-hud-coordinate="z"]'),
    };
  }

  createTemplate() {
    return `
      <section class="hud-panel hud-panel--title" aria-label="Project status">
        <h1 class="hud-title">${APP_METADATA.title}</h1>
        <div class="hud-meta">
          <div>Version ${APP_METADATA.version}</div>
          <div>${APP_METADATA.stepLabel}</div>
        </div>
      </section>

      <section class="hud-panel hud-panel--status" aria-label="Session status">
        <dl class="hud-status-list">
          <div class="hud-row">
            <dt class="hud-label">FPS</dt>
            <dd class="hud-value">${HUD_PLACEHOLDERS.fps}</dd>
          </div>
          <div class="hud-row">
            <dt class="hud-label">X</dt>
            <dd class="hud-value" data-hud-coordinate="x">--</dd>
          </div>
          <div class="hud-row">
            <dt class="hud-label">Y</dt>
            <dd class="hud-value" data-hud-coordinate="y">--</dd>
          </div>
          <div class="hud-row">
            <dt class="hud-label">Z</dt>
            <dd class="hud-value" data-hud-coordinate="z">--</dd>
          </div>
          <div class="hud-row">
            <dt class="hud-label">Room</dt>
            <dd class="hud-value">${HUD_PLACEHOLDERS.room}</dd>
          </div>
        </dl>
      </section>
    `;
  }

  updateCoordinates(position) {
    this.coordinateElements.x.textContent = this.formatCoordinate(position.x);
    this.coordinateElements.y.textContent = this.formatCoordinate(position.y);
    this.coordinateElements.z.textContent = this.formatCoordinate(position.z);
  }

  formatCoordinate(value) {
    return value.toFixed(2);
  }

  dispose() {
    this.root.remove();
  }
}
