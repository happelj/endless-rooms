# Endless Rooms

Endless Rooms is a browser-based first-person exploration project built with Three.js, Vite, ES modules, JavaScript, HTML5, and CSS3.

This repository currently contains Step 3: Lobby Room Shell. The project now starts inside an enclosed lobby with solid walls, ceiling, openings for future rooms, collision boundaries, pointer-lock movement, sprinting, and a live coordinate HUD.

## Current Step

Version: 0.3

Step 3 includes:

- Vite development setup
- Three.js scene, perspective camera, and WebGL renderer
- Shadow-ready renderer using soft shadow maps
- Hemisphere light, directional light, and ceiling point lights
- First-person Pointer Lock controls
- WASD movement
- Left Shift sprint
- Smooth delta-time movement
- Real-time player coordinates in the HUD
- Start overlay that controls pointer lock entry
- Enclosed 18m x 18m x 4m lobby shell
- Floor, ceiling, four thick walls, and white baseboard trim
- Five empty room openings labeled Aquarium, Library, Tom & Jerry, Yosemite, and Space Station
- Basic modular collision that keeps the player inside the lobby
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

## Room Architecture

Step 3 introduces the room system.

- `Room` is the reusable base class for room meshes, material ownership, labels, geometry reuse, and collider registration.
- `LobbyRoom` builds the first actual room from configuration.
- Room dimensions, openings, materials, trim, and labels are configured centrally in `src/config/constants.js`.
- `SceneManager` composes the active room instead of building geometry in `main.js`.

Future rooms can reuse the same pattern by creating a room class that owns its geometry and registers colliders with the shared collision system.

## Collision

Collision is handled by a dedicated collision module instead of being embedded in the room or player code.

- `CollisionSystem` stores active room bounds and object colliders.
- `RoomBoundsCollider` keeps the player inside the lobby volume.
- `AabbCollider` provides reusable axis-aligned box collision for solid room geometry and future furniture.
- `Movement` applies player motion one axis at a time, then resolves the camera position through the collision system.

The current implementation prevents the player from walking through walls, through the ceiling, or outside the lobby. Gravity, jumping, crouching, and furniture collision are prepared for architecturally but are not implemented yet.

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
    |-- collision/
    |   |-- AabbCollider.js
    |   |-- CollisionSystem.js
    |   `-- RoomBoundsCollider.js
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
    |   |-- Room.js
    |   |-- LobbyRoom.js
    |   `-- RoomLabel.js
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
- `Room` owns reusable room construction concerns.
- `LobbyRoom` owns the current lobby shell layout.
- `CollisionSystem` owns collision registration and player position resolution.
- `Player` composes pointer lock, input, movement, and HUD position updates.
- `Input` tracks keyboard state without knowing movement rules.
- `Movement` converts input into smooth delta-time camera movement and collision-aware translation.
- `Hud` owns the overlay DOM and coordinate rendering.
- `StartOverlay` owns the click-to-begin pointer lock UI.

Player settings live in `PLAYER_CONFIG`, and lobby settings live in `LOBBY_ROOM_CONFIG`. Future systems such as gravity, jumping, crouching, interactions, room loading, save state, networking, and VR can build around these modules without changing the app entry point.

## Future Roadmap

Planned future steps:

- Turn lobby openings into room transition portals
- Build the first connected destination room
- Add doorway metadata and room loading
- Add gravity and grounded player movement
- Add jumping and crouching
- Expand collision for furniture and interactable objects
- Add interaction prompts
- Add audio zones and sound effects
- Add video texture surfaces
- Add GLTF model loading
- Add save system
- Add multiplayer support
- Add VR support
- Add performance profiling and asset streaming

## Step 3 Verification

After running `npm run dev`, verify:

- The browser shows a start overlay with `ENDLESS ROOMS`.
- Clicking the overlay activates pointer lock.
- Mouse movement controls first-person look direction.
- `W`, `A`, `S`, and `D` move the player smoothly.
- Holding `Left Shift` increases movement speed.
- Pressing `ESC` exits pointer lock and shows the overlay again.
- The player starts at the center of the enclosed lobby.
- The player cannot leave the room through walls or openings.
- The player cannot move through the ceiling or outside the room bounds.
- The lobby has a floor, ceiling, four walls, baseboards, and five labeled openings.
- The room lighting feels warm and soft.
- The HUD displays live `X`, `Y`, and `Z` coordinates.
- The FPS placeholder remains unchanged.
- The room label remains `Lobby`.
