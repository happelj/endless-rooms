import { ContentPanel } from './ContentPanel.js';

const CLOSE_CONTENT_CODE = 'KeyE';

export class ContentManager {
  constructor(container) {
    this.panel = new ContentPanel(container);
    this.player = null;
    this.openContent = null;

    this.handleKeyDown = this.handleKeyDown.bind(this);
    document.addEventListener('keydown', this.handleKeyDown, true);
  }

  setPlayer(player) {
    this.player = player;
  }

  open(content) {
    this.openContent = content;
    this.player?.setMovementPaused(true);
    this.panel.show(content);
  }

  close() {
    if (!this.isOpen()) {
      return;
    }

    this.openContent = null;
    this.panel.hide();
    this.player?.setMovementPaused(false);
  }

  isOpen() {
    return this.openContent !== null;
  }

  handleKeyDown(event) {
    if (!this.isOpen() || event.code !== CLOSE_CONTENT_CODE) {
      return;
    }

    if (event.target?.closest?.('.content-panel__code-entry')) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    this.close();
  }

  dispose() {
    document.removeEventListener('keydown', this.handleKeyDown, true);
    this.close();
    this.panel.dispose();
    this.player = null;
  }
}
