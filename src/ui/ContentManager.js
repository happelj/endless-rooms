import { ContentPanel } from './ContentPanel.js';

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
    if (!this.isOpen() || event.code !== 'Escape') {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.close();
  }

  dispose() {
    document.removeEventListener('keydown', this.handleKeyDown, true);
    this.close();
    this.panel.dispose();
    this.player = null;
  }
}
