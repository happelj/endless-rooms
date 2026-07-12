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
    this.roomDebugElements = {
      currentRoom: this.root.querySelector('[data-hud-current-room]'),
      portalCount: this.root.querySelector('[data-hud-portal-count]'),
      connectedRooms: this.root.querySelector('[data-hud-connected-rooms]'),
      connectedDestinations: this.root.querySelector('[data-hud-connected-destinations]'),
    };
    this.physicsElements = {
      grounded: this.root.querySelector('[data-hud-grounded]'),
      verticalVelocity: this.root.querySelector('[data-hud-vertical-velocity]'),
    };
    this.interactionPromptElement = this.root.querySelector('[data-interaction-prompt]');
    this.infoPanelElement = this.root.querySelector('[data-info-panel]');
    this.infoPanelTitleElement = this.root.querySelector('[data-info-panel-title]');
    this.infoPanelBodyElement = this.root.querySelector('[data-info-panel-body]');
    this.trailCompassElement = this.root.querySelector('[data-trail-compass]');
    this.trailCompassArrowElement = this.root.querySelector('[data-trail-compass-arrow]');
    this.trailCompassDistanceElement = this.root.querySelector('[data-trail-compass-distance]');
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
            <dt class="hud-label">Grounded</dt>
            <dd class="hud-value" data-hud-grounded>${HUD_PLACEHOLDERS.grounded}</dd>
          </div>
          <div class="hud-row">
            <dt class="hud-label">Vertical Velocity</dt>
            <dd class="hud-value" data-hud-vertical-velocity>${HUD_PLACEHOLDERS.verticalVelocity}</dd>
          </div>
          <div class="hud-row">
            <dt class="hud-label">Current Room</dt>
            <dd class="hud-value" data-hud-current-room>${HUD_PLACEHOLDERS.room}</dd>
          </div>
          <div class="hud-row">
            <dt class="hud-label">Portal Count</dt>
            <dd class="hud-value" data-hud-portal-count>${HUD_PLACEHOLDERS.portalCount}</dd>
          </div>
          <div class="hud-row">
            <dt class="hud-label">Connected Rooms</dt>
            <dd class="hud-value" data-hud-connected-rooms>${HUD_PLACEHOLDERS.connectedRooms}</dd>
          </div>
          <div class="hud-row hud-row--stacked">
            <dt class="hud-label">Destinations</dt>
            <dd class="hud-value hud-value--destinations" data-hud-connected-destinations>${HUD_PLACEHOLDERS.connectedDestinations}</dd>
          </div>
        </dl>
      </section>

      <div class="interaction-prompt" data-interaction-prompt hidden></div>

      <section class="trail-compass" data-trail-compass hidden aria-label="Forgotten Level trail compass">
        <div class="trail-compass__ring">
          <div class="trail-compass__arrow" data-trail-compass-arrow></div>
        </div>
        <div class="trail-compass__label">
          Trail
          <span data-trail-compass-distance>--m</span>
        </div>
      </section>

      <section class="info-panel" data-info-panel hidden aria-label="Exhibit information">
        <h2 class="info-panel__title" data-info-panel-title></h2>
        <p class="info-panel__body" data-info-panel-body></p>
      </section>
    `;
  }

  updateCoordinates(position) {
    this.coordinateElements.x.textContent = this.formatCoordinate(position.x);
    this.coordinateElements.y.textContent = this.formatCoordinate(position.y);
    this.coordinateElements.z.textContent = this.formatCoordinate(position.z);
  }

  updateRoomDebug({ currentRoom, portalCount, connectedRooms, connectedDestinations }) {
    this.roomDebugElements.currentRoom.textContent = currentRoom;
    this.roomDebugElements.portalCount.textContent = String(portalCount);
    this.roomDebugElements.connectedRooms.textContent = String(connectedRooms);
    this.roomDebugElements.connectedDestinations.textContent = connectedDestinations;
    this.roomDebugElements.connectedDestinations.title = connectedDestinations;
  }

  updatePhysicsDebug({ grounded, verticalVelocity }) {
    this.physicsElements.grounded.textContent = grounded ? 'Yes' : 'No';
    this.physicsElements.verticalVelocity.textContent = this.formatCoordinate(verticalVelocity);
  }

  updateInteractionPrompt(text) {
    this.interactionPromptElement.textContent = text;
    this.interactionPromptElement.hidden = text.length === 0;
  }

  updateTrailCompass({ isVisible, angle = 0, distance = 0 }) {
    this.trailCompassElement.hidden = !isVisible;

    if (!isVisible) {
      return;
    }

    this.trailCompassArrowElement.style.transform = `rotate(${angle}rad)`;
    this.trailCompassDistanceElement.textContent = `${Math.round(distance)}m`;
  }

  showInfoPanel({ title, body }) {
    this.infoPanelTitleElement.textContent = title;
    this.infoPanelBodyElement.textContent = body;
    this.infoPanelElement.hidden = false;
  }

  hideInfoPanel() {
    this.infoPanelElement.hidden = true;
  }

  formatCoordinate(value) {
    return value.toFixed(2);
  }

  dispose() {
    this.root.remove();
  }
}
