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
    };
    this.physicsElements = {
      grounded: this.root.querySelector('[data-hud-grounded]'),
      verticalVelocity: this.root.querySelector('[data-hud-vertical-velocity]'),
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
        </dl>
      </section>
    `;
  }

  updateCoordinates(position) {
    this.coordinateElements.x.textContent = this.formatCoordinate(position.x);
    this.coordinateElements.y.textContent = this.formatCoordinate(position.y);
    this.coordinateElements.z.textContent = this.formatCoordinate(position.z);
  }

  updateRoomDebug({ currentRoom, portalCount, connectedRooms }) {
    this.roomDebugElements.currentRoom.textContent = currentRoom;
    this.roomDebugElements.portalCount.textContent = String(portalCount);
    this.roomDebugElements.connectedRooms.textContent = String(connectedRooms);
  }

  updatePhysicsDebug({ grounded, verticalVelocity }) {
    this.physicsElements.grounded.textContent = grounded ? 'Yes' : 'No';
    this.physicsElements.verticalVelocity.textContent = this.formatCoordinate(verticalVelocity);
  }

  formatCoordinate(value) {
    return value.toFixed(2);
  }

  dispose() {
    this.root.remove();
  }
}
