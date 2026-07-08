import * as THREE from 'three';

const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 256;

export class FluorescentWritingReveal {
  constructor({ text, width, height, position, rotationY }) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = CANVAS_WIDTH;
    this.canvas.height = CANVAS_HEIGHT;
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.material = new THREE.MeshBasicMaterial({
      map: this.texture,
      transparent: true,
      opacity: 0.96,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    this.geometry = new THREE.PlaneGeometry(width, height);
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.name = `FluorescentWriting:${text}`;
    this.mesh.position.set(position.x, position.y, position.z);
    this.mesh.rotation.y = rotationY;
    this.mesh.renderOrder = 5;
    this.mesh.visible = false;

    this.draw(text);
  }

  setVisible(isVisible) {
    this.mesh.visible = isVisible;
  }

  draw(text) {
    const context = this.canvas.getContext('2d');
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    context.fillStyle = 'rgba(184, 91, 255, 0.16)';
    context.font = '900 128px Inter, Segoe UI, Arial, sans-serif';
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    for (let offset = 14; offset > 0; offset -= 3) {
      context.shadowColor = '#bd70ff';
      context.shadowBlur = offset;
      context.fillText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 8);
    }

    context.shadowBlur = 24;
    context.fillStyle = '#f1c6ff';
    context.fillText(text, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 8);
    this.texture.needsUpdate = true;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.texture.dispose();
  }
}
