import * as THREE from 'three';

const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 256;
const LABEL_PADDING = 64;
const FONT_FAMILY = 'Inter, Segoe UI, Arial, sans-serif';

export class RoomLabel {
  constructor({ text, width, height, position, rotationY = 0 }) {
    this.text = text;
    this.canvas = document.createElement('canvas');
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;

    this.material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      toneMapped: false,
    });

    this.geometry = new THREE.PlaneGeometry(width, height);
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.name = `RoomLabel:${text}`;
    this.mesh.position.set(position.x, position.y, position.z);
    this.mesh.rotation.y = rotationY;
    this.mesh.renderOrder = 2;

    this.draw();
  }

  draw() {
    const context = this.canvas.getContext('2d');
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    context.fillStyle = 'rgba(15, 20, 24, 0.78)';
    this.drawRoundedRect(context, 24, 36, CANVAS_WIDTH - 48, CANVAS_HEIGHT - 72, 30);
    context.fill();

    context.strokeStyle = 'rgba(255, 255, 255, 0.32)';
    context.lineWidth = 4;
    this.drawRoundedRect(context, 24, 36, CANVAS_WIDTH - 48, CANVAS_HEIGHT - 72, 30);
    context.stroke();

    context.fillStyle = '#f7fbff';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.font = this.getFittedFont(context, this.text);
    context.fillText(this.text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 2);

    this.texture.needsUpdate = true;
  }

  getFittedFont(context, text) {
    const maxWidth = CANVAS_WIDTH - LABEL_PADDING * 2;
    let fontSize = 92;

    do {
      context.font = `700 ${fontSize}px ${FONT_FAMILY}`;
      fontSize -= 2;
    } while (context.measureText(text).width > maxWidth && fontSize > 42);

    return context.font;
  }

  drawRoundedRect(context, x, y, width, height, radius) {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.texture.dispose();
  }
}
