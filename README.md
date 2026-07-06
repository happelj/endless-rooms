# Endless Rooms

Endless Rooms is a browser-based first-person exploration project built with Three.js, Vite, ES modules, JavaScript, HTML5, and CSS3.

This repository currently contains Step 2: First-person Player Controller. The project now has a playable movement foundation while still keeping the code modular for future rooms, collisions, interactions, audio, models, multiplayer, and VR.

## Current Step

Version: 0.2

Step 2 includes:

- Vite development setup
- Three.js scene, perspective camera, and WebGL renderer
- Hemisphere and directional lighting
- Shadow-ready renderer, light, and floor
- Large neutral floor
- Pleasant scene background color
- Pointer Lock first-person mouse look
- WASD movement
- Left Shift sprint
- Smooth delta-time movement
- Real-time player coordinates in the HUD
- Start overlay that controls pointer lock entry
- Resize handling
- Animation loop

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

## Controls

- Click anywhere on the start overlay to begin.
- Move the mouse to look around.
- Press `W` to move forward.
- Press `A` to move left.
- Press `S` to move backward.
- Press `D` to move right.
- Hold `Left Shift` to sprint.
- Press `ESC` to unlock the mouse and show the start overlay again.

## Pointer Lock

Endless Rooms uses the browser Pointer Lock API through Three.js `PointerLockControls`.

Pointer lock requires a user gesture, so the app starts with an overlay. Clicking the overlay requests pointer lock from the browser. When pointer lock is active, mouse movement rotates the first-person camera. Pressing `ESC` exits pointer lock, releases the mouse cursor, and restores the overlay.

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
|-- index.html
|-- package.json
|-- vite.config.js
|-- README.md
|-- public/
|   |-- textures/
|   |-- audio/
|   |-- videos/
|   `-- models/
`-- src/
    |-- main.js
    |-- style.css
    |-- config/
    |   `-- constants.js
    |-- scene/
    |   |-- SceneManager.js
    |   |-- Renderer.js
    |   |-- Camera.js
    |   |-- Lighting.js
    |   `-- Floor.js
    |-- player/
    |   |-- Player.js
    |   |-- Input.js
    |   `-- Movement.js
    |-- rooms/
    |-- ui/
    |   |-- Hud.js
    |   `-- StartOverlay.js
    |-- assets/
    `-- utils/
        `-- dom.js
```

## Architecture Notes

The application is intentionally organized around small classes with narrow responsibilities:

- `SceneManager` owns startup, lifecycle, frame updates, and composition.
- `Renderer` owns WebGL renderer configuration and resize behavior.
- `Camera` owns perspective camera setup and aspect updates.
- `Lighting` owns scene lighting and shadow configuration.
- `Floor` owns the initial room foundation mesh.
- `Player` composes pointer lock, input, movement, and HUD position updates.
- `Input` tracks keyboard state without knowing movement rules.
- `Movement` converts input into smooth delta-time camera movement.
- `Hud` owns the overlay DOM and coordinate rendering.
- `StartOverlay` owns the click-to-begin pointer lock UI.

Movement settings live in `PLAYER_CONFIG` in `src/config/constants.js`. Future player systems such as collision, gravity, jumping, crouching, interactions, and save state can build around this player module without changing the app entry point.

The `SceneManager` maintains an updateable system list. Future features such as room streaming, audio, multiplayer networking, and VR sessions can register with the loop without turning `main.js` into a large file.

## Future Roadmap

Planned future steps:

- Room shell with walls and ceiling
- Collision detection
- Gravity and grounded player movement
- Jumping and crouching
- Room loading and procedural room transitions
- Doorway systems
- Interaction system
- Audio zones and sound effects
- Video texture surfaces
- GLTF model loading
- Save system
- Multiplayer support
- VR support
- Performance profiling and asset streaming

## Step 2 Verification

After running `npm run dev`, verify:

- The browser shows a start overlay with `ENDLESS ROOMS`.
- Clicking the overlay activates pointer lock.
- Mouse movement controls first-person look direction.
- `W`, `A`, `S`, and `D` move the player smoothly.
- Holding `Left Shift` increases movement speed.
- Pressing `ESC` exits pointer lock and shows the overlay again.
- The HUD displays live `X`, `Y`, and `Z` coordinates.
- The FPS placeholder remains unchanged.
- The room label remains `Lobby`.

