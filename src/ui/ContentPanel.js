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
    this.codeInputElement = null;
  }

  createTemplate() {
    return `
      <div class="content-panel__surface">
        <h2 class="content-panel__title" data-content-panel-title></h2>
        <div class="content-panel__body" data-content-panel-body></div>
        <div class="content-panel__footer" data-content-panel-footer>Press E to close. ESC unlocks the mouse.</div>
      </div>
    `;
  }

  show({
    title,
    body,
    footer = 'Press E to close. ESC unlocks the mouse.',
    visual = null,
    codeEntry = null,
  }) {
    this.titleElement.textContent = title;
    this.bodyElement.replaceChildren(
      ...this.createVisualNodes(visual),
      ...this.createBodyNodes(body),
      ...this.createCodeEntryNodes(codeEntry),
    );
    this.footerElement.textContent = footer;
    this.root.hidden = false;

    if (this.codeInputElement) {
      window.requestAnimationFrame(() => this.codeInputElement?.focus());
    }
  }

  hide() {
    this.root.hidden = true;
    this.codeInputElement = null;
  }

  createBodyNodes(body) {
    const paragraphs = Array.isArray(body) ? body : [body];

    return paragraphs.map((paragraph) => {
      const element = document.createElement('p');
      element.textContent = paragraph;
      return element;
    });
  }

  createVisualNodes(visual) {
    if (!visual) {
      return [];
    }

    const config = typeof visual === 'string' ? { kind: visual } : visual;
    const element = document.createElement('div');
    element.className = `content-panel__visual content-panel__visual--${config.kind}`;
    element.setAttribute('aria-label', config.label ?? 'Visual content');
    element.setAttribute('role', 'img');

    return [element];
  }

  createCodeEntryNodes(codeEntry) {
    if (!codeEntry) {
      this.codeInputElement = null;
      return [];
    }

    const form = document.createElement('form');
    form.className = 'content-panel__code-entry';
    form.setAttribute('autocomplete', 'off');

    const display = document.createElement('div');
    display.className = 'content-panel__code-display';
    display.setAttribute('aria-live', 'polite');
    display.textContent = codeEntry.placeholder ?? '---- - ----';

    const input = document.createElement('input');
    input.className = 'content-panel__code-input';
    input.inputMode = 'text';
    input.autocomplete = 'off';
    input.autocapitalize = 'characters';
    input.spellcheck = false;
    input.maxLength = 9;
    input.placeholder = codeEntry.inputPlaceholder ?? 'ABCD-1234';
    input.setAttribute('aria-label', codeEntry.label ?? 'Broadcast access code');

    const error = document.createElement('div');
    error.className = 'content-panel__code-error';
    error.setAttribute('aria-live', 'polite');

    const button = document.createElement('button');
    button.className = 'content-panel__submit';
    button.type = 'submit';
    button.textContent = codeEntry.submitLabel ?? 'Unlock';

    input.addEventListener('input', () => {
      const normalizedValue = this.normalizeCode(input.value);
      input.value = this.formatCode(normalizedValue);
      display.textContent = this.formatCodeForDisplay(normalizedValue);
      error.textContent = '';
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const result = codeEntry.onSubmit?.(this.normalizeCode(input.value));

      if (result?.message) {
        error.textContent = result.message;
      }
    });

    form.append(display, input, button, error);
    this.codeInputElement = input;

    return [form];
  }

  normalizeCode(value) {
    return String(value ?? '')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 8);
  }

  formatCode(value) {
    const normalizedValue = this.normalizeCode(value);

    if (normalizedValue.length <= 4) {
      return normalizedValue;
    }

    return `${normalizedValue.slice(0, 4)}-${normalizedValue.slice(4, 8)}`;
  }

  formatCodeForDisplay(value) {
    const normalizedValue = this.normalizeCode(value).padEnd(8, '-');

    return `${normalizedValue.slice(0, 4)} - ${normalizedValue.slice(4, 8)}`;
  }

  dispose() {
    this.root.remove();
  }
}
