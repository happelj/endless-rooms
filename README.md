# Endless Rooms

Endless Rooms is a browser-based first-person exploration project built with Three.js, Vite, ES modules, JavaScript, HTML5, and CSS3.

This repository currently contains Step 4: Portal System and Connected Rooms. The project now starts in the lobby hub and supports walking through a functional doorway into a connected Test Room without a fade or visible teleport.

## Current Step

Version: 0.4

Step 4 includes:

- Vite development setup
- Three.js scene, perspective camera, and WebGL renderer
- First-person Pointer Lock controls
- WASD movement
- Left Shift sprint
- Smooth delta-time movement
- Real-time player coordinates in the HUD
- Start overlay that controls pointer lock entry
- Enclosed lobby hub
- Connected Test Room
- Reusable rectangular room shell architecture
- Directional portal system
- Room manager with room registration and activation
- Portal-aware collision bounds
- Per-room lighting configuration
- HUD debug rows for current room, portal count, and connected rooms
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

## Portal System

Step 4 introduces directional portals through `src/portals/Portal.js` and `src/portals/PortalManager.js`.

Each portal owns:

- Unique id
- Source room id
- Destination room id
- Spawn position
- Spawn rotation
- Doorway dimensions
- Trigger volume
- Continuous-transition flag

The current lobby-to-Test-Room portal is continuous, so walking through the doorway keeps the player in world space and simply changes the active room once the player crosses the trigger volume. The spawn position and rotation are already part of the portal contract for future rooms that may be streamed, offset, or loaded non-contiguously.

## Room Manager

`RoomManager` owns the room graph.

Responsibilities:

- Create rooms
- Register rooms
- Activate rooms
- Deactivate rooms
- Register portals
- Update HUD room debug values
- Prepare for future room streaming

Future themed rooms should be able to follow this pattern:

```js
roomManager.registerRoom(new AquariumRoom(scene, collisionSystem));
roomManager.registerRoom(new LibraryRoom(scene, collisionSystem));
roomManager.registerRoom(new TomAndJerryRoom(scene, collisionSystem));
roomManager.registerRoom(new YosemiteRoom(scene, collisionSystem));
roomManager.registerRoom(new SpaceStationRoom(scene, collisionSystem));
```

Step 4 registers `LobbyRoom` and `TestRoom` once at startup. Rooms remain instantiated so geometry is not rebuilt every frame.

## Room Architecture

The reusable room stack is now:

- `Room`: base class for material ownership, collider registration, labels, lights, lifecycle, and world-position conversion.
- `RectangularRoom`: reusable floor, ceiling, wall, baseboard, label, room-bound, and lighting builder.
- `LobbyRoom`: central hub room using `RectangularRoom`.
- `TestRoom`: connected validation room using `RectangularRoom`.

Rooms own their own lighting configuration. This prepares the project for future rooms with daylight, darkness, colored lights, animated lights, and room-specific ambience without pushing lighting decisions into `SceneManager`.

## Collision

Collision is handled by a dedicated collision module instead of being embedded in scene composition.

- `CollisionSystem` stores active room bounds and solid colliders.
- `RoomBoundsCollider` constrains the player only for the active room.
- Portal openings can be registered on room bounds so a connected doorway can be crossed naturally.
- `AabbCollider` provides reusable axis-aligned solid collision for walls and future furniture.
- `Movement` applies player motion one axis at a time, then resolves the camera position through collision.

Only the functional Test Room doorway is portal-enabled in Step 4. Other lobby openings remain future connection points.

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
    |-- portals/
    |   |-- Portal.js
    |   `-- PortalManager.js
    |-- scene/
    |   |-- SceneManager.js
    |   |-- Renderer.js
    |   `-- Camera.js
    |-- player/
    |   |-- Player.js
    |   |-- Input.js
    |   `-- Movement.js
    |-- rooms/
    |   |-- Room.js
    |   |-- RectangularRoom.js
    |   |-- RoomManager.js
    |   |-- LobbyRoom.js
    |   |-- TestRoom.js
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
- `RoomManager` owns room registration, activation, and portal registration.
- `PortalManager` owns portal lookup and connected-room counts.
- `Portal` owns directional doorway metadata and trigger volume detection.
- `Room` owns reusable room lifecycle concerns.
- `RectangularRoom` owns reusable rectangular room shell construction.
- `CollisionSystem` owns collision registration and player position resolution.
- `Player` composes pointer lock, input, movement, and HUD coordinate updates.
- `Input` tracks keyboard state without knowing movement rules.
- `Movement` converts input into smooth delta-time camera movement and collision-aware translation.
- `Hud` owns the overlay DOM, coordinates, and room debug values.
- `StartOverlay` owns the click-to-begin pointer lock UI.

Room and portal data live in `src/config/constants.js`. Future systems such as gravity, jumping, crouching, interactions, room loading, save state, networking, and VR can build around these modules without changing the app entry point.

## Future Roadmap

Planned future steps:

- Replace Test Room with the first themed destination room
- Add portal metadata for Aquarium, Library, Tom & Jerry, Yosemite, and Space Station
- Add doorway status indicators for unavailable rooms
- Add room streaming and unloading policy
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

## Step 4 Verification

After running `npm run dev`, verify:

- The browser shows a start overlay with `ENDLESS ROOMS`.
- Clicking the overlay activates pointer lock.
- Mouse movement controls first-person look direction.
- `W`, `A`, `S`, and `D` move the player smoothly.
- Holding `Left Shift` increases movement speed.
- Pressing `ESC` exits pointer lock and shows the overlay again.
- The player starts at the center of the lobby.
- Walking through the Test Room doorway changes Current Room from `Lobby` to `Test Room`.
- Walking back through the doorway changes Current Room back to `Lobby`.
- Solid walls still block movement.
- Portal Count and Connected Rooms display in the HUD.
- The HUD displays live `X`, `Y`, and `Z` coordinates.
- The FPS placeholder remains unchanged.
