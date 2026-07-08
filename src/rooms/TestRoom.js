import * as THREE from 'three';
import { TEST_ROOM_CONFIG } from '../config/constants.js';
import { RectangularRoom } from './RectangularRoom.js';
import { BlackLightSwitch } from './test-room/BlackLightSwitch.js';
import { FluorescentWritingReveal } from './test-room/FluorescentWritingReveal.js';
import { SecretWallEntrance } from './test-room/SecretWallEntrance.js';
import { TestRoomLightSwitch } from './test-room/TestRoomLightSwitch.js';

export class TestRoom extends RectangularRoom {
  constructor(scene, collisionSystem, config = TEST_ROOM_CONFIG) {
    super(scene, collisionSystem, TestRoom.createRuntimeConfig(config));
  }

  static createRuntimeConfig(config) {
    const secretEntrance = TestRoom.selectSecretEntrance(config.secretEntrance);
    const openings = Object.freeze({
      ...config.openings,
      entries: Object.freeze([
        ...config.openings.entries,
        Object.freeze({
          id: secretEntrance.id,
          wall: secretEntrance.wall,
          center: secretEntrance.center,
          width: secretEntrance.width,
          height: secretEntrance.height,
          hidden: true,
        }),
      ]),
    });

    return Object.freeze({
      ...config,
      openings,
      secretEntrance,
    });
  }

  static selectSecretEntrance(secretConfig) {
    const candidates = secretConfig.candidates;
    const candidate = candidates[TestRoom.getRandomIndex(candidates.length)];

    return Object.freeze({
      id: secretConfig.id,
      wall: candidate.wall,
      center: candidate.center,
      width: secretConfig.width,
      height: secretConfig.height,
    });
  }

  static getRandomIndex(length) {
    if (globalThis.crypto?.getRandomValues) {
      const value = new Uint32Array(1);
      globalThis.crypto.getRandomValues(value);
      return value[0] % length;
    }

    return Math.floor(Math.random() * length);
  }

  build() {
    super.build();
    this.secretWall = this.config.secretEntrance;
    this.normalLights = Array.from(this.lights);
    this.normalLightsOn = true;
    this.blackLightOn = false;
    this.secretTransitionTriggered = false;

    this.createSecretMaterials();
    this.addBlackLight();
    this.addSwitches();
    this.addSecretEntrance();
    this.updateSecretState();
  }

  createSecretMaterials() {
    this.secretMaterials = Object.freeze({
      switchPlate: this.createMaterial('SwitchPlate', {
        color: 0xe8e2d4,
        roughness: 0.62,
        metalness: 0,
      }),
      switchLever: this.createMaterial('SwitchLever', {
        color: 0x262626,
        roughness: 0.46,
        metalness: 0.12,
      }),
      blackPlate: this.createMaterial('BlackLightSwitchPlate', {
        color: 0x17131d,
        roughness: 0.58,
        metalness: 0.04,
        emissive: 0x1d0c3a,
        emissiveIntensity: 0.18,
      }),
      blackLever: this.createMaterial('BlackLightSwitchLever', {
        color: 0x5f36a8,
        roughness: 0.38,
        metalness: 0.12,
        emissive: 0x35166f,
        emissiveIntensity: 0.22,
      }),
      blackLightTube: this.trackSecretMaterial('BlackLightTube', new THREE.MeshBasicMaterial({
        color: 0xc681ff,
        transparent: true,
        opacity: 0.82,
        toneMapped: false,
      })),
    });
  }

  trackSecretMaterial(name, material) {
    material.name = `${this.name}:${name}`;
    this.materials.set(name, material);

    return material;
  }

  addBlackLight() {
    const secretWall = this.secretWall;
    const geometry = new THREE.CylinderGeometry(0.07, 0.07, 2.3, 18);
    const tube = new THREE.Mesh(geometry, this.secretMaterials.blackLightTube);
    tube.name = 'TestRoomBlackLightTube';
    tube.position.set(0, this.config.dimensions.height - 0.34, secretWall.center);
    tube.rotation.z = Math.PI / 2;
    tube.castShadow = false;
    tube.receiveShadow = false;
    this.addMesh(tube, { disposeGeometry: true });

    this.blackLightFixture = tube;
    this.blackLight = new THREE.PointLight(0x9b55ff, 44, 13, 2);
    this.blackLight.name = 'TestRoomBlackLight';
    this.blackLight.position.set(0, this.config.dimensions.height - 0.55, secretWall.center);
    this.blackLight.castShadow = false;
    this.blackLight.visible = false;
    this.group.add(this.blackLight);
  }

  addSwitches() {
    const { width, length } = this.config.dimensions;

    this.mainLightSwitch = new TestRoomLightSwitch({
      room: this,
      id: 'TestRoomMainLightSwitch',
      label: 'Lights',
      prompt: 'Toggle Main Lights',
      plate: {
        size: { x: 0.06, y: 0.46, z: 0.32 },
        position: { x: -width / 2 + 0.045, y: 1.22, z: -3.35 },
        material: this.secretMaterials.switchPlate,
      },
      lever: {
        size: { x: 0.08, y: 0.2, z: 0.08 },
        position: { x: -width / 2 + 0.01, y: 1.2, z: -3.35 },
        material: this.secretMaterials.switchLever,
      },
      labelConfig: {
        width: 1.0,
        height: 0.34,
        position: { x: -width / 2 + 0.12, y: 1.78, z: -3.35 },
        rotationY: Math.PI / 2,
      },
      onInteract: () => this.toggleMainLights(),
    });

    this.blackLightSwitch = new BlackLightSwitch({
      room: this,
      id: 'TestRoomBlackLightSwitch',
      plate: {
        size: { x: 0.34, y: 0.46, z: 0.06 },
        position: { x: 4.55, y: 1.22, z: -length / 2 + 0.045 },
        material: this.secretMaterials.blackPlate,
      },
      lever: {
        size: { x: 0.09, y: 0.2, z: 0.08 },
        position: { x: 4.55, y: 1.2, z: -length / 2 + 0.01 },
        material: this.secretMaterials.blackLever,
      },
      labelConfig: {
        width: 1.42,
        height: 0.34,
        position: { x: 4.55, y: 1.78, z: -length / 2 + 0.12 },
        rotationY: 0,
      },
      onInteract: ({ contentManager }) => this.toggleBlackLight(contentManager),
    });
  }

  addSecretEntrance() {
    const secretWall = this.secretWall;
    const { width } = this.config.dimensions;

    this.secretEntrance = new SecretWallEntrance({
      room: this,
      id: 'TestRoomForgottenLevelEntrance',
      wall: secretWall.wall,
      center: secretWall.center,
      width: secretWall.width,
      height: secretWall.height,
    });

    this.fluorescentWriting = new FluorescentWritingReveal({
      text: 'ENTER HERE',
      width: 2.04,
      height: 0.52,
      position: {
        x: width / 2 - 0.03,
        y: 1.68,
        z: secretWall.center,
      },
      rotationY: -Math.PI / 2,
    });
    this.addMesh(this.fluorescentWriting.mesh);
  }

  toggleMainLights() {
    this.normalLightsOn = !this.normalLightsOn;

    if (this.normalLightsOn) {
      this.blackLightOn = false;
    }

    this.updateSecretState();
  }

  toggleBlackLight(contentManager) {
    if (this.normalLightsOn) {
      contentManager?.open({
        title: 'Black Light',
        body: ['Turn off the main lights first.'],
      });
      return;
    }

    this.blackLightOn = !this.blackLightOn;
    this.updateSecretState();
  }

  updateSecretState() {
    const revealSecret = !this.normalLightsOn && this.blackLightOn;
    this.secretEntrance?.setAccessible(revealSecret);
    this.fluorescentWriting?.setVisible(revealSecret);
    this.applyLightingState();
  }

  applyLightingState() {
    const normalVisible = this.isActive && this.normalLightsOn;

    for (const light of this.normalLights ?? []) {
      light.visible = normalVisible;
    }

    if (this.blackLight) {
      this.blackLight.visible = this.isActive && this.blackLightOn && !this.normalLightsOn;
    }

    const uvIntensity = this.blackLight?.visible ? 0.24 : 0;
    this.wallMaterial.emissive.setHex(uvIntensity > 0 ? 0x24124b : 0x000000);
    this.wallMaterial.emissiveIntensity = uvIntensity;
    this.floorMaterial.emissive.setHex(uvIntensity > 0 ? 0x160b2d : 0x000000);
    this.floorMaterial.emissiveIntensity = uvIntensity * 0.55;
  }

  setLightingEnabled() {
    this.applyLightingState();
  }

  setCollidersEnabled(enabled) {
    super.setCollidersEnabled(enabled);
    this.secretEntrance?.setRoomActive(enabled);
  }

  activate() {
    super.activate();
    this.secretTransitionTriggered = false;
    this.updateSecretState();
  }

  deactivate() {
    super.deactivate();
    this.applyLightingState();
  }

  update(deltaTime, player, elapsedTime, roomManager) {
    if (
      !this.secretTransitionTriggered
      && this.secretEntrance?.contains(player.position)
    ) {
      this.secretTransitionTriggered = true;
      roomManager.enterForgottenLevel?.();
    }
  }

  dispose() {
    this.fluorescentWriting?.dispose();
    super.dispose();
  }
}
