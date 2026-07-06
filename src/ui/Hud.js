import { APP_METADATA, HUD_PLACEHOLDERS } from '../config/constants.js';

export class Hud {
  constructor(container) {
    this.container = container;
    this.root = document.createElement('div');
    this.root.className = 'hud-root';
    this.root.innerHTML = this.createTemplate();
    this.container.append(this.root);
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
            <dt class="hud-label">Coordinates</dt>
            <dd class="hud-value">${HUD_PLACEHOLDERS.coordinates}</dd>
          </div>
          <div class="hud-row">
            <dt class="hud-label">Room</dt>
            <dd class="hud-value">${HUD_PLACEHOLDERS.room}</dd>
          </div>
        </dl>
      </section>
    `;
  }

  dispose() {
    this.root.remove();
  }
}

