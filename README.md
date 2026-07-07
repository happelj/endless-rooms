# Endless Rooms

Endless Rooms is a browser-based first-person exploration project built with Three.js, Vite, ES modules, JavaScript, HTML5, and CSS3.

This repository currently contains Step 5: Player Physics Foundation. The project now has reusable gravity, floor resolution, grounded state, and vertical velocity behavior layered under the existing first-person movement and portal system.

## Current Step

Version: 0.5

Step 5 includes:

- Vite development setup
- Three.js scene, perspective camera, and WebGL renderer
- First-person Pointer Lock controls
- WASD movement
- Left Shift sprint
- Smooth delta-time horizontal movement
- Player physics module for gravity and grounding
- Configurable player height and eye height
- Configurable gravity, max fall speed, snap distance, and vertical tolerances
- Collision-backed floor and ceiling resolution
- Portal transitions that preserve player height and grounded state
- Debug HUD rows for grounded state and vertical velocity
- Optional debug visualization for player bounds, portal triggers, and room bounds
- Enclosed lobby hub
- Connected Test Room
- Directional portal system
- Room manager with room registration and activation
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

## Player Physics

Step 5 introduces `src/player/Physics.js`.

`Physics` owns:

- Gravity
- Ground detection
- Grounded state
- Vertical velocity
- Floor snapping
- Ceiling resolution

`Movement` remains focused on horizontal movement only. The player update order is horizontal movement first, then vertical physics, then HUD updates. This keeps future jumping, crouching, ramps, stairs, moving platforms, and furniture collision easier to add without turning movement into a large mixed-responsibility module.

## Ground Detection

Grounding is backed by the collision system.

- `CollisionSystem.getGroundInfo()` queries active room bounds and future ground colliders.
- `RoomBoundsCollider` exposes floor and ceiling information for the active room.
- The player eye position is resolved from configured body dimensions.
- The player stays grounded on flat room floors and remains stable while crossing the lobby-to-Test-Room portal.

Future furniture, ramps, stairs, and platforms can register ground-capable colliders without changing `Physics`.

## Configuration

Physics and body values live in `src/config/constants.js`.

```js
PLAYER_CONFIG.body = {
  radius,
  height,
  eyeHeight,
};

PLAYER_CONFIG.physics = {
  gravity,
  maxFallSpeed,
  groundedSnapDistance,
  floorTolerance,
  verticalStopEpsilon,
  maxDeltaTime,
};
```

Debug visualization is controlled by:

```js
DEBUG_CONFIG.showPhysicsBounds
```

The flag defaults to `false`.

## Debug Visualization

When `DEBUG_CONFIG.showPhysicsBounds` is enabled, the app displays:

- Player collision bounds
- Portal trigger volumes
- Room bounds

Debug helpers are created once and reused. They are not built when the debug flag is off.

## Pointer Lock

Endless Rooms uses the browser Pointer Lock API through Three.js `PointerLockControls`.

Pointer lock requires a user gesture, so the app starts with an overlay. Clicking the overlay requests pointer lock from the browser. When pointer lock is active, mouse movement rotates the first-person camera. Pressing `ESC` exits pointer lock, releases the mouse cursor, and restores the overlay.

## Portal System

Directional portals live in `src/portals/Portal.js` and `src/portals/PortalManager.js`.

Each portal owns:

- Unique id
- Source room id
- Destination room id
- Spawn position
- Spawn rotation
- Doorway dimensions
- Trigger volume
- Continuous-transition flag

The current lobby-to-Test-Room portal is continuous, so walking through the doorway keeps the player in world space and changes only the active room once the player crosses the trigger volume.

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
    |-- debug/
    |   `-- DebugVisuals.js
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
    |   |-- Movement.js
    |   `-- Physics.js
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
- `CollisionSystem` owns collision registration, horizontal resolution, ground queries, and ceiling queries.
- `Player` composes pointer lock, input, horizontal movement, physics, and HUD updates.
- `Input` tracks keyboard state without knowing movement or physics rules.
- `Movement` converts input into smooth delta-time horizontal camera movement.
- `Physics` owns vertical movement, gravity, floor snapping, and grounded state.
- `Hud` owns the overlay DOM, coordinates, room debug values, and physics debug values.
- `DebugVisuals` owns optional visual helpers for physics and portal debugging.
- `StartOverlay` owns the click-to-begin pointer lock UI.

## Future Roadmap

Planned future steps:

- Begin the Tom & Jerry themed room
- Add portal metadata for all lobby destinations
- Add doorway status indicators for unavailable rooms
- Add jump and crouch input
- Add furniture colliders and ground-capable object collision
- Add ramps, stairs, and platform grounding
- Add room streaming and unloading policy
- Add interaction prompts
- Add audio zones and sound effects
- Add video texture surfaces
- Add GLTF model loading
- Add save system
- Add multiplayer support
- Add VR support
- Add performance profiling and asset streaming

## Step 5 Verification

After running `npm run dev`, verify:

- The browser shows a start overlay with `ENDLESS ROOMS`.
- Clicking the overlay activates pointer lock.
- Mouse movement controls first-person look direction.
- `W`, `A`, `S`, and `D` move the player smoothly.
- Holding `Left Shift` increases movement speed.
- Pressing `ESC` exits pointer lock and shows the overlay again.
- The player remains grounded on the floor.
- The HUD shows `Grounded Yes`.
- Vertical Velocity remains near `0.00` while grounded.
- Walking through the Test Room doorway changes Current Room from `Lobby` to `Test Room`.
- Walking back through the doorway changes Current Room back to `Lobby`.
- Portal transitions preserve player height and grounded state.
- Solid walls still block movement.
- Portal Count and Connected Rooms display in the HUD.
- The HUD displays live `X`, `Y`, and `Z` coordinates.
- The FPS placeholder remains unchanged.
