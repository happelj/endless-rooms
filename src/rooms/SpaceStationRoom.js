import * as THREE from 'three';
import { AabbCollider } from '../collision/AabbCollider.js';
import { AUDIO_CONFIG, SPACE_STATION_ROOM_CONFIG } from '../config/constants.js';
import { AnimatedDisplayPanel } from '../displays/AnimatedDisplayPanel.js';
import { OrbitalBackdrop } from '../environment/OrbitalBackdrop.js';
import { FurnitureBuilder } from './FurnitureBuilder.js';
import { RectangularRoom } from './RectangularRoom.js';

const INTERACTION_RANGE = 2.6;
const SHARED_WALL_SURFACE_OFFSET = 0.018;
const SHARED_WALL_SURFACE_DEPTH = 0.035;

const CONSOLE_CONTENT = Object.freeze({
  command: Object.freeze({
    title: 'Command Console',
    body: Object.freeze([
      'Placeholder station systems panel.',
      'Future steps can connect this console to navigation, station status, docking events, and room-specific objectives.',
    ]),
  }),
  observation: Object.freeze({
    title: 'Observation Terminal',
    body: Object.freeze([
      'Placeholder orbital observation feed.',
      'This panel will later support planet facts, telescope feeds, and educational overlays for the view outside.',
    ]),
  }),
  information: Object.freeze({
    title: 'Research Display',
    body: Object.freeze([
      'Placeholder research content.',
      'Future displays can show mission logs, experiment data, crew notes, and discoveries collected across Endless Rooms.',
    ]),
  }),
  telescope: Object.freeze({
    title: 'Telescope View',
    visual: Object.freeze({
      kind: 'starfield',
      label: 'Telescope view of distant stars',
    }),
    body: Object.freeze([
      'A quiet field of distant stars fills the telescope view.',
      'Future steps can connect this station instrument to astronomy lessons, discoveries, and live observation events.',
    ]),
  }),
});

export class SpaceStationRoom extends RectangularRoom {
  constructor(scene, collisionSystem, config = SPACE_STATION_ROOM_CONFIG) {
    super(scene, collisionSystem, config);
  }

  build() {
    super.build();

    this.furniture = new FurnitureBuilder(this);
    this.displayPanels = [];
    this.nextBeepTime = 5.5;
    this.createStationMaterials();
    this.addSharedLobbyWallInterior();
    this.addObservationExterior();
    this.addCurvedWallPanels();
    this.addFloorDetails();
    this.addCeilingPanels();
    this.addObservationWindows();
    this.addSupportBeams();
    this.addObservationTelescope();
    this.addCommandConsole();
    this.addSideWorkstations();
    this.addStorageAndEquipment();
    this.addAmbientGlowLights();
  }

  createStationMaterials() {
    this.stationMaterials = Object.freeze({
      darkMetal: this.createMaterial('DarkBrushedMetal', {
        color: 0x1f2b34,
        roughness: 0.45,
        metalness: 0.55,
      }),
      graphite: this.createMaterial('GraphitePanels', {
        color: 0x2d3942,
        roughness: 0.52,
        metalness: 0.32,
      }),
      blueAccent: this.createMaterial('StationBlueAccent', {
        color: 0x3ba4d7,
        roughness: 0.34,
        metalness: 0.22,
        emissive: 0x0d5f8a,
        emissiveIntensity: 0.28,
      }),
      consoleShell: this.createMaterial('ConsoleShell', {
        color: 0x22303a,
        roughness: 0.42,
        metalness: 0.42,
      }),
      cabinet: this.createMaterial('StationCabinet', {
        color: 0x52616c,
        roughness: 0.46,
        metalness: 0.36,
      }),
      windowFrame: this.createMaterial('ObservationWindowFrame', {
        color: 0xb8c9d3,
        roughness: 0.28,
        metalness: 0.48,
      }),
      holoGlass: this.trackMaterial('HolographicGlass', new THREE.MeshBasicMaterial({
        color: 0x77ddff,
        transparent: true,
        opacity: 0.18,
        side: THREE.DoubleSide,
        depthWrite: false,
        toneMapped: false,
      })),
      windowGlass: this.trackMaterial('ObservationWindowGlass', new THREE.MeshBasicMaterial({
        color: 0xbcefff,
        transparent: true,
        opacity: 0.16,
        side: THREE.DoubleSide,
        depthWrite: false,
        toneMapped: false,
      })),
      lightPanel: this.trackMaterial('CoolCeilingLightPanel', new THREE.MeshBasicMaterial({
        color: 0xd9f8ff,
        transparent: true,
        opacity: 0.78,
        toneMapped: false,
      })),
      lensGlass: this.trackMaterial('TelescopeLensGlass', new THREE.MeshBasicMaterial({
        color: 0xa4ebff,
        transparent: true,
        opacity: 0.56,
        toneMapped: false,
      })),
    });
  }

  trackMaterial(name, material) {
    material.name = `${this.name}:${name}`;
    this.materials.set(name, material);

    return material;
  }

  addSharedLobbyWallInterior() {
    const { width, height } = this.config.dimensions;
    const { height: openingHeight, width: openingWidth } = this.config.openings;
    const panelX = width / 2 - SHARED_WALL_SURFACE_OFFSET;

    for (const segment of this.getSolidSegments('east')) {
      const span = segment.end - segment.start;
      const center = (segment.start + segment.end) / 2;

      this.furniture.addBox({
        name: `SpaceStationSharedWallInteriorPanel:${center}`,
        size: { x: SHARED_WALL_SURFACE_DEPTH, y: height, z: span },
        position: { x: panelX, y: height / 2, z: center },
        material: this.wallMaterial,
        castShadow: false,
        receiveShadow: true,
      });
    }

    this.furniture.addBox({
      name: 'SpaceStationSharedWallInteriorHeader',
      size: { x: SHARED_WALL_SURFACE_DEPTH, y: height - openingHeight, z: openingWidth },
      position: {
        x: panelX,
        y: openingHeight + (height - openingHeight) / 2,
        z: this.config.openings.entries[0].center,
      },
      material: this.wallMaterial,
      castShadow: false,
      receiveShadow: true,
    });
  }

  addObservationExterior() {
    this.orbitalBackdrop = new OrbitalBackdrop({
      name: 'SpaceStationOrbitalBackdrop',
      position: { x: -this.config.dimensions.width / 2 - 0.6, y: 1.8, z: 0 },
    });
    this.group.add(this.orbitalBackdrop.group);
  }

  addCurvedWallPanels() {
    const { width, length, height } = this.config.dimensions;
    const x = -width / 2 + 0.4;

    for (const [index, panel] of [
      { z: -length / 2 + 0.82, rotationY: -0.35 },
      { z: length / 2 - 0.82, rotationY: 0.35 },
    ].entries()) {
      this.addRotatedBox({
        name: `SpaceStationCurvedWallPanel:${index + 1}`,
        size: { x: 2.6, y: height - 0.55, z: 0.18 },
        position: { x, y: height / 2, z: panel.z },
        rotationY: panel.rotationY,
        material: this.wallMaterial,
        castShadow: true,
        receiveShadow: true,
      });
    }
  }

  addFloorDetails() {
    for (const z of [-4.2, -1.4, 1.4, 4.2]) {
      this.furniture.addBox({
        name: `SpaceStationFloorPanelSeam:${z}`,
        size: { x: 14.2, y: 0.018, z: 0.045 },
        position: { x: 0, y: 0.016, z },
        material: this.stationMaterials.darkMetal,
        castShadow: false,
        receiveShadow: true,
      });
    }

    for (const x of [-4.8, 4.8]) {
      this.furniture.addBox({
        name: `SpaceStationFloorAccentStrip:${x}`,
        size: { x: 0.07, y: 0.024, z: 10.5 },
        position: { x, y: 0.022, z: 0.2 },
        material: this.stationMaterials.blueAccent,
        castShadow: false,
        receiveShadow: true,
      });
    }
  }

  addCeilingPanels() {
    const y = this.config.dimensions.height - 0.05;

    for (const [index, panel] of [
      { x: -3.7, z: -2.9 },
      { x: 3.7, z: -2.9 },
      { x: -3.7, z: 2.8 },
      { x: 3.7, z: 2.8 },
    ].entries()) {
      this.furniture.addBox({
        name: `SpaceStationCeilingLightPanel:${index + 1}`,
        size: { x: 2.4, y: 0.026, z: 0.82 },
        position: { x: panel.x, y, z: panel.z },
        material: this.stationMaterials.lightPanel,
        castShadow: false,
        receiveShadow: false,
      });
    }
  }

  addObservationWindows() {
    const { width } = this.config.dimensions;
    const x = -width / 2 + 0.05;

    for (const [index, z] of [-4.25, -1.4, 1.4, 4.25].entries()) {
      this.furniture.addBox({
        name: `SpaceStationObservationWindow:${index + 1}`,
        size: { x: 0.035, y: 2.85, z: 2.35 },
        position: { x, y: 2.35, z },
        material: this.stationMaterials.windowGlass,
        castShadow: false,
        receiveShadow: false,
      });
    }

    this.furniture.addBox({
      name: 'SpaceStationWindowTopFrame',
      size: { x: 0.26, y: 0.26, z: 11.5 },
      position: { x: -width / 2 + 0.16, y: 3.9, z: 0 },
      material: this.stationMaterials.windowFrame,
      castShadow: true,
      receiveShadow: true,
    });

    this.furniture.addBox({
      name: 'SpaceStationWindowBottomFrame',
      size: { x: 0.3, y: 0.28, z: 11.5 },
      position: { x: -width / 2 + 0.16, y: 0.78, z: 0 },
      material: this.stationMaterials.windowFrame,
      castShadow: true,
      receiveShadow: true,
      collider: true,
    });
  }

  addSupportBeams() {
    const x = -this.config.dimensions.width / 2 + 0.24;

    for (const [index, z] of [-5.65, -2.82, 0, 2.82, 5.65].entries()) {
      this.furniture.addBox({
        name: `SpaceStationWindowSupportColumn:${index + 1}`,
        size: { x: 0.32, y: 3.45, z: 0.2 },
        position: { x, y: 2.22, z },
        material: this.stationMaterials.windowFrame,
        castShadow: true,
        receiveShadow: true,
        collider: true,
      });
    }

    for (const z of [-5.95, 5.95]) {
      this.furniture.addBox({
        name: `SpaceStationSideSupportBeam:${z}`,
        size: { x: 4.6, y: 0.22, z: 0.28 },
        position: { x: -5.35, y: 3.05, z },
        material: this.stationMaterials.darkMetal,
        castShadow: true,
        receiveShadow: true,
      });
    }
  }

  addObservationTelescope() {
    const telescopePosition = { x: -6.28, y: 1.5, z: 1.82 };

    this.furniture.addCylinder({
      name: 'SpaceStationTelescopeStand',
      radiusTop: 0.055,
      radiusBottom: 0.075,
      height: 1.14,
      position: { x: telescopePosition.x + 0.36, y: 0.62, z: telescopePosition.z },
      material: this.stationMaterials.darkMetal,
      radialSegments: 14,
    });

    const mount = this.furniture.addBox({
      name: 'SpaceStationTelescopeMount',
      size: { x: 0.36, y: 0.18, z: 0.34 },
      position: { x: telescopePosition.x + 0.36, y: 1.2, z: telescopePosition.z },
      material: this.stationMaterials.graphite,
      castShadow: true,
      receiveShadow: true,
    });

    const body = this.furniture.addCylinder({
      name: 'SpaceStationObservationTelescope',
      radiusTop: 0.24,
      radiusBottom: 0.28,
      height: 1.22,
      position: telescopePosition,
      material: this.stationMaterials.darkMetal,
      radialSegments: 28,
      rotation: { x: 0, y: 0, z: Math.PI / 2 },
    });

    this.furniture.addCylinder({
      name: 'SpaceStationTelescopeFrontRim',
      radiusTop: 0.31,
      radiusBottom: 0.31,
      height: 0.12,
      position: { x: telescopePosition.x - 0.64, y: telescopePosition.y, z: telescopePosition.z },
      material: this.stationMaterials.windowFrame,
      radialSegments: 28,
      rotation: { x: 0, y: 0, z: Math.PI / 2 },
    });

    const lens = this.furniture.addCylinder({
      name: 'SpaceStationTelescopeLens',
      radiusTop: 0.23,
      radiusBottom: 0.23,
      height: 0.035,
      position: { x: telescopePosition.x - 0.71, y: telescopePosition.y, z: telescopePosition.z },
      material: this.stationMaterials.lensGlass,
      radialSegments: 28,
      rotation: { x: 0, y: 0, z: Math.PI / 2 },
      castShadow: false,
      receiveShadow: false,
    });

    this.furniture.addCylinder({
      name: 'SpaceStationTelescopeEyepiece',
      radiusTop: 0.11,
      radiusBottom: 0.13,
      height: 0.28,
      position: { x: telescopePosition.x + 0.7, y: telescopePosition.y - 0.02, z: telescopePosition.z },
      material: this.stationMaterials.graphite,
      radialSegments: 18,
      rotation: { x: 0, y: 0, z: Math.PI / 2 },
    });

    for (const [index, leg] of [
      { x: telescopePosition.x + 0.12, z: telescopePosition.z - 0.36, rotationY: -0.22 },
      { x: telescopePosition.x + 0.56, z: telescopePosition.z, rotationY: 0 },
      { x: telescopePosition.x + 0.12, z: telescopePosition.z + 0.36, rotationY: 0.22 },
    ].entries()) {
      this.addRotatedBox({
        name: `SpaceStationTelescopeTripodLeg:${index + 1}`,
        size: { x: 0.08, y: 0.82, z: 0.08 },
        position: { x: leg.x, y: 0.45, z: leg.z },
        rotationY: leg.rotationY,
        material: this.stationMaterials.darkMetal,
        castShadow: true,
        receiveShadow: true,
      });
    }

    this.addCollider(new AabbCollider({
      name: 'SpaceStationTelescopeCollider',
      center: this.toWorldPosition({ x: telescopePosition.x + 0.24, y: 0.82, z: telescopePosition.z }),
      size: { x: 1.15, y: 1.44, z: 0.84 },
    }));

    this.registerInteractable([body, lens, mount], {
      id: 'space-station-observation-telescope',
      range: INTERACTION_RANGE,
      prompt: 'Use Telescope',
      onInteract: ({ contentManager }) => this.openTelescopeView(contentManager),
    });
  }

  addCommandConsole() {
    const base = this.furniture.addBox({
      name: 'SpaceStationCommandConsoleBase',
      size: { x: 2.9, y: 0.82, z: 1.36 },
      position: { x: -0.9, y: 0.41, z: -0.2 },
      material: this.stationMaterials.consoleShell,
      castShadow: true,
      receiveShadow: true,
      collider: true,
    });

    this.furniture.addBox({
      name: 'SpaceStationCommandConsoleGlow',
      size: { x: 2.25, y: 0.055, z: 0.1 },
      position: { x: -0.9, y: 0.86, z: 0.47 },
      material: this.stationMaterials.blueAccent,
      castShadow: false,
      receiveShadow: false,
    });

    const panel = this.addDisplayPanel({
      name: 'SpaceStationCommandDisplay',
      label: 'ORBITAL SYSTEMS',
      width: 1.75,
      height: 0.86,
      position: { x: -0.9, y: 1.18, z: -0.93 },
      rotation: { x: -0.05, y: 0, z: 0 },
      content: CONSOLE_CONTENT.command,
    });

    this.addHolographicPane('SpaceStationCommandHologram', {
      size: { x: 1.6, y: 0.72 },
      position: { x: -0.9, y: 1.75, z: -0.04 },
      rotationY: 0,
    });

    this.registerConsoleInteraction([base, panel.mesh], 'space-station-command-console', CONSOLE_CONTENT.command);
  }

  addSideWorkstations() {
    const northDesk = this.addWorkstation({
      id: 'north',
      position: { x: 2.9, y: 0.45, z: -4.7 },
      size: { x: 3.1, y: 0.9, z: 0.72 },
    });
    const northPanel = this.addDisplayPanel({
      name: 'SpaceStationObservationTerminalDisplay',
      label: 'OBSERVATION',
      width: 1.42,
      height: 0.7,
      position: { x: 2.9, y: 1.34, z: -5.12 },
      rotation: { x: 0, y: 0, z: 0 },
      content: CONSOLE_CONTENT.observation,
    });

    const southDesk = this.addWorkstation({
      id: 'south',
      position: { x: 3.0, y: 0.45, z: 4.72 },
      size: { x: 3.1, y: 0.9, z: 0.72 },
    });
    const southPanel = this.addDisplayPanel({
      name: 'SpaceStationResearchDisplay',
      label: 'RESEARCH',
      width: 1.42,
      height: 0.7,
      position: { x: 3.0, y: 1.34, z: 5.13 },
      rotation: { x: 0, y: Math.PI, z: 0 },
      content: CONSOLE_CONTENT.information,
    });

    this.registerConsoleInteraction([northDesk, northPanel.mesh], 'space-station-observation-terminal', CONSOLE_CONTENT.observation);
    this.registerConsoleInteraction([southDesk, southPanel.mesh], 'space-station-research-display', CONSOLE_CONTENT.information);
  }

  addWorkstation({ id, position, size }) {
    const desk = this.furniture.addBox({
      name: `SpaceStationWorkstation:${id}`,
      size,
      position,
      material: this.stationMaterials.consoleShell,
      castShadow: true,
      receiveShadow: true,
      collider: true,
    });

    this.furniture.addBox({
      name: `SpaceStationWorkstationAccent:${id}`,
      size: { x: size.x - 0.35, y: 0.045, z: 0.08 },
      position: { x: position.x, y: position.y + size.y / 2 + 0.04, z: position.z },
      material: this.stationMaterials.blueAccent,
      castShadow: false,
      receiveShadow: false,
    });

    return desk;
  }

  addStorageAndEquipment() {
    for (const [index, cabinet] of [
      { x: 6.85, z: 0.8, height: 1.6 },
      { x: 6.85, z: 2.45, height: 1.9 },
    ].entries()) {
      this.furniture.addBox({
        name: `SpaceStationStorageCabinet:${index + 1}`,
        size: { x: 0.7, y: cabinet.height, z: 1.05 },
        position: { x: cabinet.x, y: cabinet.height / 2, z: cabinet.z },
        material: this.stationMaterials.cabinet,
        castShadow: true,
        receiveShadow: true,
        collider: true,
      });
    }

    for (const [index, rack] of [
      { x: 6.72, z: -2.55 },
      { x: 6.72, z: -4.05 },
    ].entries()) {
      this.furniture.addBox({
        name: `SpaceStationEquipmentRack:${index + 1}`,
        size: { x: 0.82, y: 1.75, z: 0.92 },
        position: { x: rack.x, y: 0.88, z: rack.z },
        material: this.stationMaterials.graphite,
        castShadow: true,
        receiveShadow: true,
        collider: true,
      });

      this.furniture.addBox({
        name: `SpaceStationEquipmentRackLight:${index + 1}`,
        size: { x: 0.04, y: 0.68, z: 0.08 },
        position: { x: rack.x - 0.44, y: 1.1, z: rack.z },
        material: this.stationMaterials.blueAccent,
        castShadow: false,
        receiveShadow: false,
      });
    }
  }

  addAmbientGlowLights() {
    for (const [index, lightConfig] of [
      { x: -6.4, y: 2.5, z: -2.8, color: 0x9be8ff, intensity: 6.5, distance: 7 },
      { x: -6.4, y: 2.5, z: 2.8, color: 0x9be8ff, intensity: 6.5, distance: 7 },
      { x: -0.9, y: 1.35, z: -0.5, color: 0x5bd8ff, intensity: 4.8, distance: 4.5 },
    ].entries()) {
      const light = new THREE.PointLight(lightConfig.color, lightConfig.intensity, lightConfig.distance, 2);
      light.name = `SpaceStationAmbientGlow:${index + 1}`;
      light.position.set(lightConfig.x, lightConfig.y, lightConfig.z);
      light.castShadow = false;
      this.addLight(light);
    }
  }

  addDisplayPanel(config) {
    const panel = new AnimatedDisplayPanel({
      baseColor: '#06131f',
      accentColor: '#66dcff',
      secondaryColor: '#9fffcf',
      ...config,
    });

    this.displayPanels.push(panel);
    this.group.add(panel.mesh);

    return panel;
  }

  addHolographicPane(name, { size, position, rotationY }) {
    const geometry = new THREE.PlaneGeometry(size.x, size.y);
    const mesh = new THREE.Mesh(geometry, this.stationMaterials.holoGlass);
    mesh.name = name;
    mesh.position.set(position.x, position.y, position.z);
    mesh.rotation.y = rotationY;
    mesh.renderOrder = 4;

    return this.addMesh(mesh, { disposeGeometry: true });
  }

  addRotatedBox({
    name,
    size,
    position,
    rotationY,
    material,
    castShadow = true,
    receiveShadow = true,
    collider = false,
  }) {
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.position.set(position.x, position.y, position.z);
    mesh.rotation.y = rotationY;
    mesh.castShadow = castShadow;
    mesh.receiveShadow = receiveShadow;
    this.addMesh(mesh, { disposeGeometry: true });

    if (collider) {
      this.addCollider(new AabbCollider({
        name: `${name}Collider`,
        center: this.toWorldPosition(position),
        size: this.getRotatedAabbSize(size, rotationY),
      }));
    }

    return mesh;
  }

  getRotatedAabbSize(size, rotationY) {
    const cos = Math.abs(Math.cos(rotationY));
    const sin = Math.abs(Math.sin(rotationY));

    return {
      x: size.x * cos + size.z * sin,
      y: size.y,
      z: size.x * sin + size.z * cos,
    };
  }

  registerConsoleInteraction(targets, id, content) {
    this.registerInteractable(targets, {
      id,
      range: INTERACTION_RANGE,
      prompt: 'Access Console',
      onInteract: ({ contentManager }) => this.openConsolePanel(contentManager, content),
    });
  }

  openConsolePanel(contentManager, content) {
    contentManager?.open({
      title: content.title,
      body: content.body,
    });
  }

  openTelescopeView(contentManager) {
    contentManager?.open({
      title: CONSOLE_CONTENT.telescope.title,
      visual: CONSOLE_CONTENT.telescope.visual,
      body: CONSOLE_CONTENT.telescope.body,
    });
  }

  configureAudio(audioManager) {
    this.audioManager = audioManager;

    if (!audioManager || this.roomAudioConfigured) {
      return;
    }

    const audioConfig = AUDIO_CONFIG.spaceStation;
    this.engineHumAudio = this.createRoomAudioSource(audioManager, audioConfig.engineHum);
    this.hvacAudio = this.createRoomAudioSource(audioManager, audioConfig.hvac);
    this.ventilationAudio = this.createRoomAudioSource(audioManager, audioConfig.ventilation);
    this.roomAudioConfigured = true;
  }

  createRoomAudioSource(audioManager, sourceConfig) {
    return audioManager.createPositionalLoop({
      ...sourceConfig,
      roomId: this.id,
      position: this.toWorldPosition(sourceConfig.position),
    });
  }

  update(deltaTime, player, elapsedTime = 0) {
    this.orbitalBackdrop?.update(elapsedTime);

    for (const panel of this.displayPanels) {
      panel.update(elapsedTime);
    }

    this.updateElectronicBeeps(elapsedTime);
  }

  updateElectronicBeeps(elapsedTime) {
    if (elapsedTime < this.nextBeepTime || this.audioManager?.context?.state !== 'running') {
      return;
    }

    const beepConfig = AUDIO_CONFIG.spaceStation.beeps;
    this.audioManager.playSoundEffect({
      ...beepConfig,
      id: `${beepConfig.id}:${Math.floor(elapsedTime * 10)}`,
      position: this.toWorldPosition(beepConfig.position),
    });
    this.nextBeepTime = elapsedTime + 8 + Math.sin(elapsedTime * 0.7) * 2.5;
  }

  dispose() {
    this.orbitalBackdrop?.dispose();

    for (const panel of this.displayPanels) {
      panel.dispose();
    }

    this.displayPanels.length = 0;
    super.dispose();
  }
}
