# Endless Rooms

Endless Rooms is a browser-based first-person exploration project built with Three.js, Vite, ES modules, JavaScript, HTML5, and CSS3.

This repository currently contains Step 1: Foundation. The goal of this step is to establish a clean rendering architecture, a simple room base, and a UI shell that can grow into a larger exploration experience without rewrites.

## Current Step

Version: 0.1

Step 1 includes:

- Vite development setup
- Three.js scene, perspective camera, and WebGL renderer
- Hemisphere and directional lighting
- Shadow-ready renderer, light, and floor
- Large neutral floor
- Pleasant scene background color
- OrbitControls as a temporary camera control layer
- Resize handling
- Animation loop
- Overlay UI with project status placeholders

## Installation

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will print a local development URL, usually:

```text
http://localhost:5173/
```

Open that URL in a browser to view the project.

## Build

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Project Layout

```text
endless-rooms/
├── index.html
├── package.json
├── vite.config.js
├── README.md
├── public/
│   ├── textures/
│   ├── audio/
│   ├── videos/
│   └── models/
└── src/
    ├── main.js
    ├── style.css
    ├── config/
    │   └── constants.js
    ├── scene/
    │   ├── SceneManager.js
    │   ├── Renderer.js
    │   ├── Camera.js
    │   ├── Lighting.js
    │   ├── Floor.js
    │   └── OrbitCameraControls.js
    ├── player/
    ├── rooms/
    ├── ui/
    │   └── Hud.js
    ├── assets/
    └── utils/
        └── dom.js
```

## Architecture Notes

The application is intentionally organized around small classes with narrow responsibilities:

- `SceneManager` owns startup, lifecycle, frame updates, and composition.
- `Renderer` owns WebGL renderer configuration and resize behavior.
- `Camera` owns perspective camera setup and aspect updates.
- `Lighting` owns scene lighting and shadow configuration.
- `Floor` owns the initial room foundation mesh.
- `OrbitCameraControls` isolates the temporary controls layer so Pointer Lock can replace it cleanly later.
- `Hud` owns the overlay DOM.

The `SceneManager` maintains an updateable system list. Future features such as player movement, interactions, room streaming, audio, multiplayer networking, and VR sessions can register with the loop without turning `main.js` into a large file.

## Future Roadmap

Planned future steps:

- Pointer Lock first-person controls
- Player movement and camera rig
- Collision detection
- Room loading and procedural room transitions
- Wall, ceiling, and doorway systems
- Interaction system
- Audio zones and sound effects
- Video texture surfaces
- GLTF model loading
- Save system
- Multiplayer support
- VR support
- Performance profiling and asset streaming

## Step 1 Verification

After running `npm run dev`, verify:

- The browser shows a large neutral floor on a softly lit scene background.
- The camera starts angled toward the center of the floor.
- OrbitControls can rotate, pan, and zoom the camera.
- The top-left overlay displays `Endless Rooms`, `Version 0.1`, and `Step 1 - Foundation`.
- The bottom-right overlay displays FPS, coordinates, and room placeholders.

