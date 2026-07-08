import * as THREE from 'three';

const CANVAS_WIDTH = 512;
const CANVAS_HEIGHT = 256;
const DEFAULT_POSITION = Object.freeze({ x: 0, y: 0, z: 0 });
const DEFAULT_ROTATION = Object.freeze({ x: 0, y: 0, z: 0 });

export class AnimatedDisplayPanel {
  constructor({
    name = 'AnimatedDisplayPanel',
    label = 'STATION',
    width = 1.4,
    height = 0.78,
    position = DEFAULT_POSITION,
    rotation = DEFAULT_ROTATION,
    baseColor = '#061522',
    accentColor = '#69d7ff',
    secondaryColor = '#9fffcf',
  } = {}) {
    this.name = name;
    this.label = label;
    this.baseColor = baseColor;
    this.accentColor = accentColor;
    this.secondaryColor = secondaryColor;
    this.lastDrawBucket = -1;

    this.canvas = document.createElement('canvas');
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
    this.context = this.canvas.getContext('2d');
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;

    this.material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    this.geometry = new THREE.PlaneGeometry(width, height);
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.name = name;
    this.mesh.position.set(position.x, position.y, position.z);
    this.mesh.rotation.set(rotation.x, rotation.y, rotation.z);
    this.mesh.renderOrder = 3;

    this.draw(0);
  }

  update(elapsedTime) {
    const bucket = Math.floor(elapsedTime * 12);

    if (bucket === this.lastDrawBucket) {
      return;
    }

    this.lastDrawBucket = bucket;
    this.draw(elapsedTime);
  }

  draw(elapsedTime) {
    const ctx = this.context;
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = this.baseColor;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    this.drawGrid(ctx, elapsedTime);
    this.drawScanBars(ctx, elapsedTime);
    this.drawTrace(ctx, elapsedTime);
    this.drawLabel(ctx);

    this.texture.needsUpdate = true;
  }

  drawGrid(ctx, elapsedTime) {
    ctx.strokeStyle = this.toRgba(this.accentColor, 0.22);
    ctx.lineWidth = 1;

    const offset = (elapsedTime * 18) % 32;

    for (let x = -offset; x < CANVAS_WIDTH; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }

    for (let y = offset; y < CANVAS_HEIGHT; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }
  }

  drawScanBars(ctx, elapsedTime) {
    const pulse = 0.55 + Math.sin(elapsedTime * 2.8) * 0.2;

    ctx.fillStyle = this.toRgba(this.accentColor, 0.18 * pulse);
    ctx.fillRect(28, 46, CANVAS_WIDTH - 56, 12);

    ctx.fillStyle = this.toRgba(this.secondaryColor, 0.22);
    const sweep = 44 + ((elapsedTime * 58) % 156);
    ctx.fillRect(52, sweep, CANVAS_WIDTH - 104, 8);

    for (let index = 0; index < 4; index += 1) {
      const width = 64 + Math.sin(elapsedTime * 1.4 + index) * 28;
      ctx.fillStyle = this.toRgba(index % 2 === 0 ? this.accentColor : this.secondaryColor, 0.42);
      ctx.fillRect(64, 86 + index * 28, width, 6);
    }
  }

  drawTrace(ctx, elapsedTime) {
    ctx.strokeStyle = this.toRgba(this.secondaryColor, 0.82);
    ctx.lineWidth = 3;
    ctx.beginPath();

    for (let x = 0; x <= 220; x += 8) {
      const y = 178
        + Math.sin(x * 0.045 + elapsedTime * 2.1) * 18
        + Math.sin(x * 0.12 + elapsedTime * 0.9) * 6;
      const screenX = 236 + x;

      if (x === 0) {
        ctx.moveTo(screenX, y);
      } else {
        ctx.lineTo(screenX, y);
      }
    }

    ctx.stroke();
  }

  drawLabel(ctx) {
    ctx.fillStyle = this.toRgba('#e8fbff', 0.94);
    ctx.font = '700 28px Inter, Segoe UI, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.label.toUpperCase(), 36, 28);

    ctx.strokeStyle = this.toRgba(this.accentColor, 0.66);
    ctx.lineWidth = 3;
    ctx.strokeRect(18, 18, CANVAS_WIDTH - 36, CANVAS_HEIGHT - 36);
  }

  toRgba(hexColor, alpha) {
    const normalized = hexColor.replace('#', '');
    const value = Number.parseInt(normalized, 16);
    const r = (value >> 16) & 255;
    const g = (value >> 8) & 255;
    const b = value & 255;

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.texture.dispose();
  }
}
