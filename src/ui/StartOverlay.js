import { APP_METADATA } from '../config/constants.js';

export class StartOverlay extends EventTarget {
  constructor(container) {
    super();

    this.container = container;
    this.root = document.createElement('button');
    this.root.className = 'start-overlay';
    this.root.type = 'button';
    this.root.setAttribute('aria-label', 'Click anywhere to begin');
    this.root.innerHTML = this.createTemplate();
    this.promptElement = this.root.querySelector('[data-start-overlay-prompt]');

    this.handleClick = this.handleClick.bind(this);
    this.root.addEventListener('click', this.handleClick);
    this.container.append(this.root);
  }

  createTemplate() {
    return `
      <span class="start-overlay__content">
        <span class="start-overlay__title">${APP_METADATA.title.toUpperCase()}</span>
        <span class="start-overlay__prompt" data-start-overlay-prompt>Click anywhere to begin.</span>
      </span>
    `;
  }

  setPrompt(prompt) {
    this.promptElement.textContent = prompt;
    this.root.setAttribute('aria-label', prompt);
  }

  show() {
    this.root.classList.remove('is-hidden');
  }

  hide() {
    this.root.classList.add('is-hidden');
  }

  handleClick() {
    this.dispatchEvent(new Event('startrequested'));
  }

  dispose() {
    this.root.removeEventListener('click', this.handleClick);
    this.root.remove();
  }
}
