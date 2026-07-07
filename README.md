# Endless Rooms

Endless Rooms is a browser-based first-person exploration project built with Three.js, Vite, ES modules, JavaScript, HTML5, and CSS3.

This repository currently contains Step 10: Library Room and Content Panel. The lobby now connects to the Test Room, Tom & Jerry Room, Aquarium Room, and Library Room. Step 10 introduces a reusable content reading system that future rooms can use for books, plaques, exhibits, notes, and educational material.

## Current Step

Version: 1.0

Step 10 includes:

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
- Connected Aquarium Room
- Connected Library Room
- Directional portal system
- Room manager with room registration and activation
- Raycast-based interaction manager
- Reusable `Interactable` framework
- Reusable `ContentPanel` and `ContentManager`
- Movement pause while reading content
- Range-limited interaction prompts
- Interactive CRT television with local video texture playback
- TV power control
- TV volume control
- Subtle CRT glow, scanlines, and brightness flicker
- Web Audio based `AudioManager`
- Ambient room audio loops
- Positional room audio
- Aquarium fish, bubbles, water movement, and exhibit plaques
- Library bookshelves, reading tables, chairs, lamps, fireplace, display books, plants, and artwork
- Library book interactions with placeholder educational content
- Furniture collision for major room props
- HUD room metadata with connected destination names
- Debug HUD for coordinates, grounded state, vertical velocity, room, portal count, and connected rooms
- Optional debug visualization for player bounds, portal triggers, room bounds, and interaction ranges
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
- Look at an interactable object and press `E` to use it.
- Press `E` while reading to close the Content Panel; `ESC` still unlocks the mouse.
- Press `ESC` during normal play to unlock the mouse and show the start overlay again.

## Step 10: Library Room

`src/rooms/LibraryRoom.js` creates the third themed destination. It reuses `RectangularRoom` for the room shell, `FurnitureBuilder` for primitive room props, `Interactable` for book prompts, the shared collision system for furniture blocking, and `AudioManager` for room ambience.

The Library Room includes:

- Warm painted walls and ceiling
- Wall-to-wall bookshelves
- Reading tables
- Comfortable chairs
- Rugs
- Floor lamps
- Desk lamps
- Static fireplace with warm glow
- Decorative plants
- Generic framed artwork
- Magazine and book display table
- Positional low-volume room ambience
- Interactable books and shelves

The Library is connected through the lobby east wall with:

- `lobby-to-library-room`
- `library-room-to-lobby`

The Library is spatially offset from the Tom & Jerry Room while keeping its doorway aligned with the lobby opening. That prevents room geometry and furniture colliders from overlapping while preserving a natural portal transition.

## Content Panel System

Step 10 adds:

- `src/ui/ContentPanel.js`
- `src/ui/ContentManager.js`

`ContentPanel` owns the DOM for readable content. `ContentManager` owns open/close state, `E` closing, and player movement pause/resume.

Browsers reserve `ESC` as the pointer-lock exit gesture, so readable content uses `E` to close without leaving the game.

Readable interactions call:

```js
contentManager.open({
  title: 'Ancient History',
  body: [
    'Placeholder educational content.',
    'Future authored material can replace this copy without changing room interaction logic.',
  ],
});
```

This keeps educational content separate from room construction. Future rooms can reuse the same system for:

- Books
- Plaques
- Exhibit panels
- Notes
- Buttons
- Terminals
- NPC conversation text
- Room-specific discoveries

## Audio System

`src/audio/AudioManager.js` owns Web Audio lifecycle, listener updates, positional loop registration, room-based source muting, and future sound-effect support. It creates the underlying audio graph only after the player enters pointer lock, then suspends audio when pointer lock exits.

The manager supports:

- Ambient room loops
- Positional audio sources
- Room-based source activation
- Global suspend/resume when pointer lock changes
- Future one-shot sound effects

The Library Room registers:

- Quiet HVAC ambience
- Subtle page-turn texture
- Faint chair creak tone
- Soft lamp buzz

All Library sources are intentionally low volume so the room feels calm.

## Interaction System

`src/interactions/Interactable.js` represents one reusable interaction target. It owns:

- Unique id
- Target meshes
- Interaction range
- Prompt text
- Interaction callback
- Enabled state
- Optional metadata

`src/interactions/InteractionManager.js` filters active-room interactables by distance before raycasting, then displays a prompt only when the player is close enough and looking at a valid target.

The interaction system currently supports:

- TV power
- TV volume up/down
- Aquarium exhibit plaques
- Library bookshelves
- Library display books

Interaction prompts are hidden while the Content Panel is open.

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

The lobby now has four functional connected destinations:

- Test Room
- Tom & Jerry Room
- Aquarium Room
- Library Room

Unimplemented lobby destinations still display `Coming Soon`.

## Collision

Large room props register AABB colliders through the shared collision system.

Collidable objects currently include:

- Room walls and bounds
- Couch
- Entertainment center
- CRT television
- Coffee table
- Side table
- Aquarium glass
- Aquarium benches
- Aquarium plaque bases
- Aquarium planters
- Aquarium columns
- Library bookshelves
- Library tables
- Library chairs
- Library fireplace
- Library display table
- Library planters

`Movement` remains focused on horizontal movement. `Physics` remains focused on gravity, grounded state, vertical velocity, floor snapping, and ceiling resolution.

## Configuration

Room dimensions, portal metadata, player body settings, movement settings, physics values, audio sources, and debug flags live in `src/config/constants.js`.

Important sections:

```js
ROOM_DIMENSIONS
TEST_ROOM_DIMENSIONS
TOM_AND_JERRY_ROOM_DIMENSIONS
AQUARIUM_ROOM_DIMENSIONS
LIBRARY_ROOM_DIMENSIONS
PLAYER_CONFIG
PORTAL_CONFIGS
DEBUG_CONFIG
INTERACTION_CONFIG
TV_CONFIG
AUDIO_CONFIG
```

Debug visualization is controlled by:

```js
DEBUG_CONFIG.showPhysicsBounds
DEBUG_CONFIG.showInteractionRanges
```

Both flags default to `false`.

## Video Asset

The local runtime expects:

```text
public/videos/Tom-and-Jerry.mp4
```

That file is intentionally ignored by Git because the current local MP4 is larger than GitHub's normal file-size limit. For GitHub-hosted playback, provide a compressed video under 100 MB, use Git LFS, or host the video from an allowed external asset source and update `TV_CONFIG.video.src` in `src/config/constants.js`.

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
    |-- audio/
    |   `-- AudioManager.js
    |-- interactions/
    |   |-- Interactable.js
    |   `-- InteractionManager.js
    |-- media/
    |   `-- VideoScreen.js
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
    |   |-- AquariumRoom.js
    |   |-- LibraryRoom.js
    |   |-- FurnitureBuilder.js
    |   |-- RoomLabel.js
    |   `-- aquarium/
    |       `-- Fish.js
    |-- ui/
    |   |-- ContentManager.js
    |   |-- ContentPanel.js
    |   |-- Hud.js
    |   `-- StartOverlay.js
    |-- assets/
    `-- utils/
        `-- dom.js
```

## Architecture Notes

The application is intentionally organized around small classes with narrow responsibilities:

- `SceneManager` owns startup, lifecycle, frame updates, and system composition.
- `AudioManager` owns Web Audio lifecycle, listener updates, positional ambience, and future sound effects.
- `RoomManager` owns room registration, activation, and portal registration.
- `PortalManager` owns portal lookup and connected-room counts.
- `Portal` owns directional doorway metadata and trigger volume detection.
- `Room` owns reusable room lifecycle, materials, geometry caching, interactables, and collision registration.
- `RectangularRoom` owns reusable rectangular room shell construction.
- `LibraryRoom` owns the themed Library layout, book interactions, furniture collisions, and library ambience.
- `ContentManager` owns reusable reading state and movement pause/resume.
- `ContentPanel` owns reusable readable content UI.
- `Interactable` owns reusable prompt, range, target, and callback metadata.
- `InteractionManager` owns active-room range filtering, raycast focus, and interaction triggering.
- `FurnitureBuilder` owns reusable primitive furniture construction.
- `CollisionSystem` owns collision registration, horizontal resolution, ground queries, and ceiling queries.
- `Player` composes pointer lock, input, horizontal movement, physics, and HUD updates.
- `Input` tracks keyboard state without knowing movement or physics rules.
- `Movement` converts input into smooth delta-time horizontal camera movement.
- `Physics` owns vertical movement, gravity, floor snapping, and grounded state.
- `Hud` owns the overlay DOM, coordinates, room debug values, physics debug values, interaction prompt, and exhibit information panel.
- `DebugVisuals` owns optional visual helpers for physics, portals, room bounds, and interaction ranges.
- `StartOverlay` owns the click-to-begin pointer lock UI.

## Future Roadmap

Planned future steps:

- Add Yosemite Room as the next themed destination
- Replace placeholder educational content with authored structured content
- Add richer Content Panel layouts with images and media references
- Add authored ambient audio files
- Add room-specific sound effects
- Add richer aquarium species data for plaques
- Add a TV channel/source selector
- Add richer object interactions
- Add jump and crouch input
- Add furniture colliders with more precise compound shapes
- Add ramps, stairs, and platform grounding
- Add room streaming and unloading policy
- Add GLTF model loading
- Add save system
- Add multiplayer support
- Add VR support
- Add performance profiling and asset streaming

## Step 10 Verification

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
- Walking through the Aquarium doorway changes Current Room from `Lobby` to `Aquarium Room`.
- Walking back through the Aquarium doorway changes Current Room back to `Lobby`.
- Walking through the Library doorway changes Current Room from `Lobby` to `Library Room`.
- Walking back through the Library doorway changes Current Room back to `Lobby`.
- Looking at a Library bookshelf or display book shows `[E] Read Book`.
- Pressing `E` near a readable Library object opens the Content Panel.
- Player movement pauses while the Content Panel is open.
- Pressing `E` closes the Content Panel without leaving pointer lock.
- Player movement resumes after the Content Panel closes.
- Library shelves, tables, chairs, fireplace, display table, and planters block movement.
- Library room ambience starts after entering pointer lock and remains subtle.
- Aquarium fish animate smoothly inside the tank.
- Aquarium plaques still open and hide their exhibit information panel correctly.
- Tom & Jerry TV power and volume interactions still work.
- Room audio suspends when pressing `ESC`.
- Solid walls still block movement.
- Project builds successfully with `npm run build`.
