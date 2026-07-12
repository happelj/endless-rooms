const CODE_LENGTH = 8;
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export class BroadcastCodeManager {
  constructor() {
    this.code = this.generateCode();
    this.hasReadGuide = false;
  }

  markGuideRead() {
    this.hasReadGuide = true;
  }

  hasGuideBeenRead() {
    return this.hasReadGuide;
  }

  getCode() {
    return this.code;
  }

  getFormattedCode(code = this.code) {
    const normalizedCode = this.normalize(code);

    return `${normalizedCode.slice(0, 4)}-${normalizedCode.slice(4, 8)}`;
  }

  verify(input) {
    return this.normalize(input) === this.code;
  }

  normalize(input) {
    return String(input ?? '')
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, CODE_LENGTH);
  }

  generateCode() {
    let code = '';

    for (let index = 0; index < CODE_LENGTH; index += 1) {
      code += CODE_ALPHABET[this.getRandomIndex()];
    }

    return code;
  }

  getRandomIndex() {
    if (globalThis.crypto?.getRandomValues) {
      const buffer = new Uint32Array(1);
      globalThis.crypto.getRandomValues(buffer);

      return buffer[0] % CODE_ALPHABET.length;
    }

    return Math.floor(Math.random() * CODE_ALPHABET.length);
  }
}
