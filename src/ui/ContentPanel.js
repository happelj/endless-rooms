export class ContentPanel {
  constructor(container) {
    this.root = document.createElement('section');
    this.root.className = 'content-panel';
    this.root.setAttribute('aria-label', 'Content panel');
    this.root.setAttribute('role', 'dialog');
    this.root.hidden = true;
    this.root.innerHTML = this.createTemplate();
    container.append(this.root);

    this.titleElement = this.root.querySelector('[data-content-panel-title]');
    this.bodyElement = this.root.querySelector('[data-content-panel-body]');
    this.footerElement = this.root.querySelector('[data-content-panel-footer]');
  }

  createTemplate() {
    return `
      <div class="content-panel__surface">
        <h2 class="content-panel__title" data-content-panel-title></h2>
        <div class="content-panel__body" data-content-panel-body></div>
        <div class="content-panel__footer" data-content-panel-footer>Press ESC to close.</div>
      </div>
    `;
  }

  show({ title, body, footer = 'Press ESC to close.' }) {
    this.titleElement.textContent = title;
    this.bodyElement.replaceChildren(...this.createBodyNodes(body));
    this.footerElement.textContent = footer;
    this.root.hidden = false;
  }

  hide() {
    this.root.hidden = true;
  }

  createBodyNodes(body) {
    const paragraphs = Array.isArray(body) ? body : [body];

    return paragraphs.map((paragraph) => {
      const element = document.createElement('p');
      element.textContent = paragraph;
      return element;
    });
  }

  dispose() {
    this.root.remove();
  }
}
