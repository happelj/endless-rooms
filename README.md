# Endless Rooms

Endless Rooms is a browser-based first-person exploration project built with Three.js, Vite, ES modules, JavaScript, HTML5, and CSS3.

This repository currently contains Step 11: Yosemite Room. The lobby now connects to the Test Room, Tom & Jerry Room, Aquarium Room, Library Room, and Yosemite Room. Step 11 introduces the first outdoor environment architecture with reusable terrain, sky, and vegetation systems.

## Current Step

Version: 1.1

Step 11 includes:

- Vite development setup
- Three.js scene, perspective camera, and WebGL renderer
- First-person Pointer Lock controls
- WASD movement
- Left Shift sprint
- Smooth delta-time horizontal movement
- Player physics module for gravity and grounding
- Terrain-aware ground detection
- Configurable player height, eye height, gravity, movement, room, portal, audio, and debug settings
- Enclosed lobby hub
- Connected Test Room
- Connected Tom & Jerry Room
- Connected Aquarium Room
- Connected Library Room
- Connected Yosemite Room
- Directional portal system
- Room manager with room registration and activation
- Raycast-based interaction manager
- Reusable `Interactable` framework
- Reusable `ContentPanel` and `ContentManager`
- Movement pause while reading content
- Range-limited interaction prompts
- Interactive CRT television with local video texture playback
- TV power and volume controls
- Web Audio based `AudioManager`
- Ambient and positional room audio
- Aquarium fish, bubbles, water movement, and exhibit plaques
- Library bookshelves, reading tables, chairs, lamps, fireplace, display books, plants, and artwork
- Yosemite terrain, trail, sky, clouds, trees, shrubs, wildflowers, boulders, logs, water, trail markers, and outdoor ambience
- Collision for room shells, major furniture, exhibit props, terrain boundaries, trees, rocks, logs, and trail markers
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

## Step 11: Yosemite Room

`src/rooms/YosemiteRoom.js` creates the first outdoor destination. It captures a Yosemite-inspired atmosphere without reproducing a real-world location exactly.

The Yosemite Room includes:

- Rolling walkable terrain
- Winding trail
- Granite cliff boundaries
- Pine forest elements
- Shrubs and wildflowers
- Fallen logs
- Boulders
- Reflective pond and stream strips
- Blue outdoor sky
- Lightweight moving cloud approximation
- Directional sunlight
- Hemisphere outdoor fill lighting
- Positional wind, birds, and distant-water ambience
- Interactable trail markers that use the shared Content Panel

The room is connected through the lobby south wall with:

- `lobby-to-yosemite-room`
- `yosemite-room-to-lobby`

The room remains bounded for gameplay stability, but the walls are represented as natural cliffs and outdoor limits rather than indoor walls.

## Outdoor Environment Architecture

Step 11 adds reusable outdoor systems under `src/environment/`:

- `Terrain` builds a sampled BufferGeometry landscape and exposes a reusable ground collider.
- `TerrainGroundCollider` lets player physics query terrain height without coupling physics to a specific room.
- `Sky` owns the sky dome and moving cloud meshes.
- `VegetationFactory` creates reusable trees, shrubs, wildflowers, boulders, and fallen logs with shared materials and optional collision.

These systems are intentionally simple and modular so future outdoor rooms can replace or extend them with authored terrain, instancing, LOD, model assets, weather, or richer ecosystem simulation.

## Terrain System

The terrain uses a configurable height sampler to generate gentle elevation changes. Player grounding reads from the terrain collider, while horizontal movement still uses the shared collision system for trees, rocks, logs, cliffs, and boundaries.

`Room` now supports registering ground colliders through:

```js
room.addGroundCollider(collider);
```

That allows future rooms to add:

- Outdoor terrain
- Ramps
- Stairs
- Platforms
- Bridges
- Room-specific floor surfaces

## Audio System

`src/audio/AudioManager.js` owns Web Audio lifecycle, listener updates, positional loop registration, room-based source muting, and future sound-effect support. It creates the underlying audio graph only after the player enters pointer lock, then suspends audio when pointer lock exits.

The Yosemite Room registers:

- Spacious wind ambience
- Distant bird ambience
- Distant water ambience near the pond and stream

All Yosemite audio uses positional loops so the outdoor soundscape changes naturally as the player moves.

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
- Yosemite trail markers

Interaction prompts are hidden while the Content Panel is open.

## Content Panel System

`src/ui/ContentPanel.js` owns the DOM for readable content. `src/ui/ContentManager.js` owns open/close state, `E` closing, and player movement pause/resume.

Browsers reserve `ESC` as the pointer-lock exit gesture, so readable content uses `E` to close without leaving the game.

Readable interactions call:

```js
contentManager.open({
  title: 'Valley Floor',
  body: [
    'Placeholder trail note.',
    'Future authored material can replace this copy without changing room interaction logic.',
  ],
});
```

Future rooms can reuse the same system for books, plaques, exhibit panels, notes, terminals, NPC conversations, and environmental discoveries.

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

Doorway openings are also registered with the source room bounds collider, so the player can walk through open passages while still being blocked by solid walls or natural boundaries.

The lobby now has five functional connected destinations:

- Test Room
- Tom & Jerry Room
- Aquarium Room
- Library Room
- Yosemite Room

The remaining unimplemented destination still displays `Coming Soon`.

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
- Yosemite terrain boundaries
- Yosemite cliffs
- Yosemite trees
- Yosemite boulders
- Yosemite fallen logs
- Yosemite trail markers

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
YOSEMITE_ROOM_DIMENSIONS
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
    |-- environment/
    |   |-- Sky.js
    |   |-- Terrain.js
    |   |-- TerrainGroundCollider.js
    |   `-- Vegetation.js
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
    |   |-- YosemiteRoom.js
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
- `Room` owns reusable room lifecycle, materials, geometry caching, interactables, ground colliders, and collision registration.
- `RectangularRoom` owns reusable rectangular room shell construction.
- `YosemiteRoom` owns the themed outdoor layout, terrain, trail markers, outdoor ambience, and natural collision objects.
- `Terrain` owns reusable outdoor terrain mesh generation and terrain height sampling.
- `TerrainGroundCollider` owns reusable terrain grounding queries for player physics.
- `Sky` owns reusable sky dome and cloud animation.
- `VegetationFactory` owns reusable primitive outdoor props.
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

- Add Space Station Room as the next themed destination
- Add reusable low-gravity or artificial-gravity room settings
- Add richer Content Panel layouts with images and media references
- Replace placeholder educational content with authored structured content
- Add authored ambient audio files
- Add room-specific sound effects
- Add weather and day-night controls for outdoor rooms
- Add LOD and instancing for large outdoor environments
- Add richer aquarium species data for plaques
- Add a TV channel/source selector
- Add jump and crouch input
- Add furniture colliders with more precise compound shapes
- Add ramps, stairs, and platform grounding
- Add room streaming and unloading policy
- Add GLTF model loading
- Add save system
- Add multiplayer support
- Add VR support
- Add performance profiling and asset streaming

## Step 11 Verification

After running `npm run dev`, verify:

- The browser shows a start overlay with `ENDLESS ROOMS`.
- Clicking the overlay activates pointer lock.
- Mouse movement controls first-person look direction.
- `W`, `A`, `S`, and `D` move the player smoothly.
- Holding `Left Shift` increases movement speed.
- Pressing `ESC` exits pointer lock and shows the overlay again.
- The player remains grounded on floors and Yosemite terrain.
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
- Walking through the Yosemite doorway changes Current Room from `Lobby` to `Yosemite Room`.
- Walking back through the Yosemite doorway changes Current Room back to `Lobby`.
- Yosemite terrain is walkable and the player stays grounded on gentle elevation changes.
- Yosemite trees, cliffs, boulders, logs, and trail markers block movement.
- Looking at a Yosemite trail marker shows `[E] Read Trail Marker`.
- Pressing `E` near a trail marker opens the Content Panel.
- Pressing `E` closes the Content Panel without leaving pointer lock.
- Yosemite wind, birds, and distant-water ambience start after entering pointer lock and remain subtle.
- Library book interactions still open and close the Content Panel correctly.
- Aquarium plaques still open and hide their exhibit information panel correctly.
- Tom & Jerry TV power and volume interactions still work.
- Room audio suspends when pressing `ESC`.
- Solid walls and natural boundaries still block movement.
- Project builds successfully with `npm run build`.
