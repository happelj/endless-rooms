# Endless Rooms

Endless Rooms is a browser-based first-person exploration project built with Three.js, Vite, ES modules, JavaScript, HTML5, and CSS3.

This repository currently contains Step 6: Tom & Jerry Room. The project now has a themed destination room connected to the lobby through the reusable portal and room-management systems.

## Current Step

Version: 0.6

Step 6 includes:

- Vite development setup
- Three.js scene, perspective camera, and WebGL renderer
- First-person Pointer Lock controls
- WASD movement
- Left Shift sprint
- Smooth delta-time horizontal movement
- Player physics module for gravity and grounding
- Configurable player height, eye height, and gravity settings
- Collision-backed floor and ceiling resolution
- Enclosed lobby hub
- Connected Test Room
- Connected Tom & Jerry Room
- Directional portal system
- Room manager with room registration and activation
- HUD room metadata with connected destination names
- Furniture collision for large room props
- Warm room-specific lighting
- Debug HUD for coordinates, grounded state, vertical velocity, room, portal count, and connected rooms
- Optional debug visualization for player bounds, portal triggers, and room bounds
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

## Step 6: Tom & Jerry Room

`src/rooms/TomAndJerryRoom.js` creates the first themed destination. It reuses `RectangularRoom` for the room shell and adds room-specific props, lighting, trim, and furniture.

The room includes:

- Wall-to-wall carpet
- Painted walls
- Ceiling
- White baseboards
- Crown molding
- Warm ceiling lights
- Floor lamp
- Side table
- Coffee table
- Couch
- Bean bag chair
- Entertainment center
- Large CRT television
- Small rug beneath the coffee table
- Two framed generic wall decorations

The television is intentionally static in Step 6. Its screen uses a dark placeholder material so the room is ready for the Step 7 video texture system without implementing video playback early.

## Furniture Collision

Large furniture pieces register AABB colliders through the same collision system used by the room shell.

Collidable furniture currently includes:

- Couch
- Entertainment center
- CRT television
- Coffee table
- Side table

The furniture is built with `FurnitureBuilder`, a small helper that keeps prop construction reusable while still letting each room own its own layout. Future rooms can reuse the same helper for furniture, decorations, collision boxes, and custom primitive meshes.

## Portal Additions

The lobby now has two functional connected destinations:

- Test Room
- Tom & Jerry Room

The Tom & Jerry doorway uses a pair of directional portals:

- `lobby-to-tom-and-jerry-room`
- `tom-and-jerry-room-to-lobby`

Both portals use continuous transitions, so walking through the doorway changes the active room without a fade or visible teleport. Unimplemented lobby destinations display `Coming Soon` on their doorway labels.

## Player Physics

`src/player/Physics.js` owns:

- Gravity
- Ground detection
- Grounded state
- Vertical velocity
- Floor snapping
- Ceiling resolution

`Movement` remains focused on horizontal movement only. The player update order is horizontal movement first, then vertical physics, then HUD updates. This keeps future jumping, crouching, ramps, stairs, moving platforms, and furniture collision easier to add.

## Room System

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

Doorway openings are also registered with the source room bounds collider, so the player can walk through open passages while still being blocked by solid walls.

## Configuration

Room dimensions, portal metadata, player body settings, movement settings, physics values, and debug flags live in `src/config/constants.js`.

Important sections:

```js
ROOM_DIMENSIONS
TEST_ROOM_DIMENSIONS
TOM_AND_JERRY_ROOM_DIMENSIONS
PLAYER_CONFIG
PORTAL_CONFIGS
DEBUG_CONFIG
```

Debug visualization is controlled by:

```js
DEBUG_CONFIG.showPhysicsBounds
```

The flag defaults to `false`.

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
    |   |-- TomAndJerryRoom.js
    |   |-- FurnitureBuilder.js
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
- `Room` owns reusable room lifecycle, materials, geometry caching, and collision registration.
- `RectangularRoom` owns reusable rectangular room shell construction.
- `TomAndJerryRoom` owns the themed room layout and room-specific props.
- `FurnitureBuilder` owns reusable primitive furniture construction.
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

- Add the video texture system for the CRT television
- Add video asset loading and lifecycle management
- Add room-specific audio ambience
- Add interaction prompts
- Add jump and crouch input
- Add furniture colliders with more precise compound shapes
- Add ramps, stairs, and platform grounding
- Add room streaming and unloading policy
- Add GLTF model loading
- Add save system
- Add multiplayer support
- Add VR support
- Add performance profiling and asset streaming

## Step 6 Verification

After running `npm run dev`, verify:

- The browser shows a start overlay with `ENDLESS ROOMS`.
- Clicking the overlay activates pointer lock.
- Mouse movement controls first-person look direction.
- `W`, `A`, `S`, and `D` move the player smoothly.
- Holding `Left Shift` increases movement speed.
- Pressing `ESC` exits pointer lock and shows the overlay again.
- The player remains grounded on the floor.
- The HUD shows live `X`, `Y`, and `Z` coordinates.
- The HUD shows the current room name.
- The HUD shows portal count, connected room count, and destination names.
- Walking through the Test Room doorway changes Current Room from `Lobby` to `Test Room`.
- Walking back through the doorway changes Current Room back to `Lobby`.
- Walking through the Tom & Jerry doorway changes Current Room from `Lobby` to `Tom & Jerry Room`.
- Walking back through the doorway changes Current Room back to `Lobby`.
- The couch, television, entertainment center, coffee table, and side table block player movement.
- Unimplemented lobby openings display `Coming Soon`.
- The Tom & Jerry Room lighting feels warm and does not create harsh shadows.
- The CRT television is visible and displays only a static placeholder screen.
- Solid walls still block movement.
- Project builds successfully with `npm run build`.
