# Endless Rooms

Endless Rooms is a browser-based first-person exploration project built with Three.js, Vite, ES modules, JavaScript, HTML5, and CSS3.

This repository currently contains Step 14: Hidden Broadcast Room. The lobby connects to the Test Room, Tom & Jerry Room, Aquarium Room, Library Room, Yosemite Room, and Space Station Room. The Test Room contains a hidden black-light secret entrance into a Backrooms-style procedural area called The Forgotten Level, which now contains a rare hidden broadcast closet.

## Current Step

Version: 1.4

Step 14 includes:

- Vite development setup
- Three.js scene, perspective camera, and WebGL renderer
- First-person Pointer Lock controls
- Mobile touch controls for Android and iPhone browsers
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
- Connected Space Station Room
- Hidden Forgotten Level procedural area
- Directional portal system
- Room manager with room registration and activation
- Reusable `RoomTheme` and `RoomThemeManager`
- Raycast-based interaction manager
- Reusable `Interactable` framework
- Reusable `ContentPanel` and `ContentManager`
- Content Panel visual slots for reusable in-world views
- Reusable animated display panels
- Reusable orbital exterior backdrop
- Reusable procedural seed manager
- Session broadcast code manager
- Chunk-based procedural generation
- Procedural entity spawn manager
- Procedural escape manager
- Movement pause while reading content
- Range-limited interaction prompts
- Interactive CRT television with local video texture playback
- TV power and volume controls
- Web Audio based `AudioManager`
- Ambient and positional room audio
- Aquarium fish, bubbles, water movement, and exhibit plaques
- Library bookshelves, reading tables, chairs, lamps, fireplace, display books, plants, and artwork
- Yosemite terrain, composed trail, sky, clouds, stylized granite landmark, trees, shrubs, wildflowers, boulders, logs, water, scenic overlook, trail markers, wildlife, and outdoor ambience
- Space Station observation deck, telescope view, exterior planet view, star field, nebula, workstations, equipment racks, animated consoles, and station ambience
- Test Room secret light switch puzzle with black light reveal
- Hidden fluorescent `ENTER HERE` writing
- Pass-through secret wall that opens only under black-light conditions
- The Forgotten Level chunk streaming, seeded layouts, flickering lights, unsettling ambience, rare exits, and entity encounters
- Hidden Forgotten Level closet room placed away from the spawn each run
- Green floor-arrow guidance that appears near the hidden closet route
- Library `TV Guide` book with a regenerated eight-character access code
- Locked hidden television with access-code entry and Rikki-Tikki video playback
- Collision for room shells, major furniture, exhibit props, terrain boundaries, trees, rocks, logs, trail markers, station consoles, support columns, cabinets, and equipment racks
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

Desktop:

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

Mobile:

- Tap the start overlay to begin.
- Use the left virtual joystick to move.
- Drag on the right side of the screen to look around.
- Hold `Shift` to sprint.
- Tap `E` to use the focused interactable object.
- Tap `Pause` to return to the start overlay and pause room media/audio.

## Deployment

The project includes `vercel.json` so Vercel can import the GitHub repository directly.

Vercel settings:

- Framework preset: `Vite`
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `dist`

For production, import `https://github.com/happelj/endless-rooms` in Vercel, select the `main` branch, and deploy. Vercel will build the static app from GitHub and publish a public URL.

The local development copy may include large media files that are not suitable for direct deployment. `.vercelignore` excludes local-only build folders and the oversized local TV video so Vercel can deploy the application code cleanly.

Production TV playback can be configured with an environment variable:

```text
VITE_TV_VIDEO_SRC=https://example.com/path/to/compressed-tv-video.mp4
```

If the environment variable is not set, the app uses the local development path:

```text
/videos/tom-and-jerry-short.mp4
```

## Step 14: Hidden Broadcast Room

Step 14 adds a secret broadcast side objective that ties the Library and The Forgotten Level together.

The feature includes:

- A generated eight-character access code for each app session
- A `TV Guide` book on the Library display table
- Dynamic TV Guide content that reveals the current access code
- A hidden closet-sized room placed in a distant Forgotten Level chunk each run
- Green floor arrows that appear when the player gets close enough to the hidden room route
- A small television on a stand inside the hidden closet
- A locked code-entry Content Panel using the format `---- - ----`
- Rikki-Tikki video playback after the correct code is entered

Flow:

1. Read the `TV Guide` book in the Library.
2. Enter The Forgotten Level through the Test Room black-light secret entrance.
3. Wander until green floor arrows appear.
4. Follow the arrows to the hidden closet.
5. Interact with the television and enter the code from the TV Guide.
6. The hidden broadcast unlocks and begins playing.

If the player reaches the hidden television before reading the guide, the television tells them to check the `TV Guide` in the Library.

## Step 13: The Forgotten Level

Step 13 adds a hidden Backrooms-style procedural area called `The Forgotten Level`. It is currently implemented through the Test Room so the mechanic can be validated before it is reused elsewhere.

The Test Room now includes:

- A regular interactable light switch
- A separate interactable `Black Light` switch
- Hidden fluorescent writing that says `ENTER HERE`
- A randomized pass-through wall that is visually indistinguishable from the rest of the room until the black light reveals it

Secret entrance rules:

- The Test Room starts with normal lights on.
- The secret entrance location is selected from several possible wall positions each time the room is created.
- Normal lights on means the black light cannot activate.
- Turning normal lights back on automatically turns the black light off.
- Fluorescent writing is visible only when normal lights are off and black light is on.
- The secret wall remains solid until the fluorescent writing is visible.
- Walking through the revealed wall transitions into The Forgotten Level.

The Forgotten Level includes:

- Seeded procedural generation through `ProceduralSeedManager`
- Chunk streaming through `ChunkManager`
- Stable active chunk radius and distant chunk unloading
- Symmetric chunk exits so neighboring chunks agree on openings and the generated level keeps expanding as the player moves
- Chunk variations such as hallways, empty rooms, office-like spaces, dead ends, intersections, looping corridors, rare large rooms, and impossible layouts
- Randomized stains, props, ceiling panels, flicker states, and damage
- Dim yellow atmosphere with room fog
- Buzzing fluorescent ambience, HVAC drone, eerie tone, and short flicker sounds
- Distant footsteps, positional entity calls, and occasional silence events
- Rare entity encounters with idle, investigate, stalk, chase, and disappear states
- Rare emergency-exit style escape locations, plus deterministic milestone exits so each run remains escapable
- Entity capture behavior that reshuffles the run and returns the player to the Forgotten Level start
- Difficulty scaling based on travel depth

The original Test Room wall does not become a normal doorway and no cover mesh is added over it. It stays visually disguised as normal wall surface, and the hidden route is entered by walking through it only under the correct lighting conditions.

## Step 12: Space Station Room

`src/rooms/SpaceStationRoom.js` creates a quiet orbital observation deck aboard a modern research station. The room emphasizes cool lighting, subtle audio, animated displays, and a large exterior view.

The Space Station Room includes:

- Futuristic observation deck layout
- Metallic floor and ceiling panels
- Curved wall panel approximation
- Dominant observation windows
- Earth-like planet outside the station
- Distant star field
- Faint nebula layers
- Slow orbital drift animation
- Central command console
- Side workstations
- Observation telescope with a reusable starfield Content Panel view
- Animated holographic-style display panels
- Storage cabinets
- Equipment racks
- Support beams and columns
- Cool white and blue lighting
- Low engine hum, HVAC, ventilation, and occasional beeps
- Interactable command console, observation terminal, and research display

The room is connected through the lobby west wall with:

- `lobby-to-space-station-room`
- `space-station-room-to-lobby`

The Space Station is spatially offset from the Aquarium Room so both west-side lobby destinations remain separate. Inactive rooms are hidden and their room-owned colliders are disabled, which prevents outdoor Yosemite scenery or collision from bleeding into the active station space.

## Room Theme System

Step 12 adds reusable room theme infrastructure under `src/themes/`:

- `RoomTheme` normalizes room theme data with sensible defaults.
- `RoomThemeManager` applies active-room background and fog settings.

Each room can now define:

- Ambient lighting profile
- Accent colors
- Ambience profile
- Fog settings
- Future music profile
- Environmental presets

Existing rooms use default themes unless they define their own. The Space Station Room uses a cool orbital theme with a dark exterior background and subtle fog. Yosemite still owns its specialized outdoor atmosphere override.

## Animated Display Framework

`src/displays/AnimatedDisplayPanel.js` creates reusable 3D display panels with canvas textures. The panels render lightweight looping graphics without shader complexity.

Current display usage includes:

- Command console systems display
- Observation terminal
- Research display

Future rooms can reuse the same panel class for terminals, exhibits, dashboards, control panels, or in-world signage.

## Orbital Environment

`src/environment/OrbitalBackdrop.js` owns the Space Station exterior view. It creates:

- Earth-like planet
- Procedural continent and cloud patches
- Distant star field
- Faint nebula layers
- Subtle drift and planet rotation

The animation is intentionally lightweight and runs only through simple transform updates.

## Step 11.1: Yosemite Landmark

`src/rooms/YosemiteRoom.js` creates the first outdoor destination. It captures a Yosemite-inspired atmosphere without reproducing a real-world location exactly.

The Yosemite Room includes:

- Rolling walkable terrain
- Redesigned winding trail with a composed landmark reveal
- Granite cliff boundaries
- Stylized Half Dome-inspired granite landmark
- Soft blue haze and room-specific fog for atmospheric perspective
- Pine forest elements
- Shrubs and wildflowers
- Fallen logs
- Boulders
- Reflective pond and stream strips
- Scenic overlook platform with wooden railing
- Blue outdoor sky
- Lightweight moving cloud approximation
- Lightweight circling birds above the landmark
- Directional sunlight
- Hemisphere outdoor fill lighting
- Positional wind, stronger overlook wind, birds, and distant-water ambience
- Interactable trail markers that use the shared Content Panel

The room is connected through the lobby south wall with:

- `lobby-to-yosemite-room`
- `yosemite-room-to-lobby`

The room remains bounded for gameplay stability, but the walls are represented as natural cliffs and outdoor limits rather than indoor walls.

## Outdoor Environment Architecture

Step 11 adds reusable outdoor systems under `src/environment/`:

- `GraniteLandmark` builds an original stylized rounded granite formation with a sheer face, layered masses, and collision volumes.
- `Terrain` builds a sampled BufferGeometry landscape and exposes a reusable ground collider.
- `TerrainGroundCollider` lets player physics query terrain height without coupling physics to a specific room.
- `Sky` owns the sky dome and moving cloud meshes.
- `VegetationFactory` creates reusable trees, shrubs, wildflowers, boulders, and fallen logs with shared materials and optional collision.
- `BirdFlock` creates lightweight reusable wildlife animation for circling distant birds.

These systems are intentionally simple and modular so future outdoor rooms can replace or extend them with authored terrain, instancing, LOD, model assets, weather, or richer ecosystem simulation.

## Granite Landmark System

`src/environment/GraniteLandmark.js` owns the reusable landmark geometry. It creates:

- A large rounded dome silhouette
- A prominent sheer face
- Layered granite base masses
- Subtle strata and crease geometry
- Collision boxes exposed to the room

The landmark is original and stylized. It is designed to evoke Yosemite's granite formations without attempting to reproduce Half Dome exactly.

## Atmospheric Perspective

The Yosemite Room applies room-specific fog and a lightweight transparent haze plane while the room is active. This creates distance and scale around the far landmark without affecting indoor rooms.

When the player leaves Yosemite, the previous scene fog and background are restored.

## Trail Composition

The trail is generated from a reusable curve function inside `YosemiteRoom`. It starts near the Lobby portal, bends naturally through the foreground, and pulls toward the granite landmark near the overlook.

The terrain height sampler flattens the walking path while preserving surrounding rolling hills. This keeps the trail walkable and lets the player remain grounded on outdoor terrain.

## Scenic Overlook

The far end of the trail contains a small wooden overlook with:

- Ground-level deck planks
- Side and back railing collision
- An informational plaque
- Existing `[E] Read Trail Marker` interaction
- Existing Content Panel display

The overlook acts as the scenic endpoint for the current Yosemite experience and a test case for future outdoor points of interest.

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
- Stronger positional wind near the scenic overlook
- Distant bird ambience
- Distant water ambience near the pond and stream

The Space Station Room registers:

- Low engine hum
- Quiet HVAC
- Positional ventilation
- Occasional electronic beeps

Room ambience uses positional loops where appropriate so soundscapes change naturally as the player moves.

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
- Yosemite scenic overlook plaque
- Space Station command console
- Space Station observation terminal
- Space Station research display

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

The lobby now has six functional connected destinations:

- Test Room
- Tom & Jerry Room
- Aquarium Room
- Library Room
- Yosemite Room
- Space Station Room

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
- Yosemite granite landmark
- Yosemite trees
- Yosemite boulders
- Yosemite fallen logs
- Yosemite overlook railings
- Yosemite trail markers
- Space Station command console
- Space Station workstations
- Space Station cabinets
- Space Station equipment racks
- Space Station support columns

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
SPACE_STATION_ROOM_DIMENSIONS
PLAYER_CONFIG
PORTAL_CONFIGS
DEBUG_CONFIG
INTERACTION_CONFIG
TV_CONFIG
FORGOTTEN_LEVEL_CONFIG.hiddenBroadcast
AUDIO_CONFIG
```

Debug visualization is controlled by:

```js
DEBUG_CONFIG.showPhysicsBounds
DEBUG_CONFIG.showInteractionRanges
```

Both flags default to `false`.

## Video Assets

The deployed Tom & Jerry TV video asset is:

```text
public/videos/tom-and-jerry-short.mp4
```

The deployed hidden broadcast video asset is:

```text
public/videos/short-rikki-tikki-tavi.mp4
```

The original local source file is:

```text
public/videos/Tom-and-Jerry.mp4
```

The original source file is intentionally ignored by Git and Vercel because it is larger than GitHub and Vercel's normal file-size limits. The shorter MP4 files stay under Vercel Hobby's 100 MB static upload limit. Tom & Jerry uses `TV_CONFIG.video.src`, and the hidden broadcast uses `FORGOTTEN_LEVEL_CONFIG.hiddenBroadcast.video.src`.

For a different production video, set `VITE_TV_VIDEO_SRC` to a compressed HTTPS video URL.

For a different hidden broadcast video, set `VITE_RIKKI_TIKKI_VIDEO_SRC` to a compressed HTTPS video URL.

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
|-- vercel.json
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
    |-- displays/
    |   `-- AnimatedDisplayPanel.js
    |-- forgotten/
    |   |-- ChunkManager.js
    |   |-- EntitySpawnManager.js
    |   |-- EscapeManager.js
    |   |-- ForgottenEntity.js
    |   |-- ForgottenLevelGenerator.js
    |   |-- HiddenBroadcastRoom.js
    |   `-- ProceduralSeedManager.js
    |-- environment/
    |   |-- BirdFlock.js
    |   |-- GraniteLandmark.js
    |   |-- OrbitalBackdrop.js
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
    |-- themes/
    |   |-- RoomTheme.js
    |   `-- RoomThemeManager.js
    |-- state/
    |   `-- BroadcastCodeManager.js
    |-- scene/
    |   |-- SceneManager.js
    |   |-- Renderer.js
    |   `-- Camera.js
    |-- player/
    |   |-- Player.js
    |   |-- Input.js
    |   |-- MobileControls.js
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
    |   |-- SpaceStationRoom.js
    |   |-- ForgottenLevelRoom.js
    |   |-- FurnitureBuilder.js
    |   |-- RoomLabel.js
    |   |-- aquarium/
    |   |   `-- Fish.js
    |   `-- test-room/
    |       |-- BlackLightSwitch.js
    |       |-- FluorescentWritingReveal.js
    |       |-- SecretWallEntrance.js
    |       `-- TestRoomLightSwitch.js
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
- `RoomThemeManager` owns active-room theme application for background and fog settings.
- `RoomTheme` normalizes room theme settings with defaults for lighting, accents, ambience, fog, music, and environmental presets.
- `PortalManager` owns portal lookup and connected-room counts.
- `Portal` owns directional doorway metadata and trigger volume detection.
- `Room` owns reusable room lifecycle, active-room visibility, materials, geometry caching, interactables, ground colliders, and collision registration.
- `RectangularRoom` owns reusable rectangular room shell construction.
- `TestRoom` owns the current secret entrance puzzle and delegates switch, writing, and secret wall behavior to small feature classes.
- `ForgottenLevelRoom` owns the hidden procedural area, active run seed, room atmosphere, and procedural subsystem composition.
- `ProceduralSeedManager` owns deterministic seed generation and seeded random helpers.
- `ForgottenLevelGenerator` owns chunk type, connection, danger, entity, and escape decisions.
- `ChunkManager` owns active chunk streaming, chunk mesh construction, collider registration, flicker state, and distant chunk unloading.
- `HiddenBroadcastRoom` owns the secret closet target, floor-arrow guidance, hidden television, code-entry interaction, and streamed cleanup.
- `EntitySpawnManager` owns rare entity spawning and cleanup as chunks stream.
- `ForgottenEntity` owns lightweight entity state behavior: idle, investigate, stalk, chase, and disappear.
- `EscapeManager` owns rare escape trigger registration and exit detection.
- `SpaceStationRoom` owns the orbital observation deck layout, display interactions, station ambience, and exterior view composition.
- `AnimatedDisplayPanel` owns reusable in-world canvas display animation.
- `OrbitalBackdrop` owns reusable planet, star field, nebula, and orbital drift visuals.
- `YosemiteRoom` owns the themed outdoor layout, trail composition, landmark placement, overlook, trail markers, outdoor ambience, and natural collision objects.
- `GraniteLandmark` owns reusable stylized granite landmark geometry and collision box metadata.
- `BirdFlock` owns reusable lightweight distant wildlife animation.
- `Terrain` owns reusable outdoor terrain mesh generation and terrain height sampling.
- `TerrainGroundCollider` owns reusable terrain grounding queries for player physics.
- `Sky` owns reusable sky dome and cloud animation.
- `VegetationFactory` owns reusable primitive outdoor props.
- `ContentManager` owns reusable reading state and movement pause/resume.
- `ContentPanel` owns reusable readable content UI, optional visual slots such as the telescope starfield, and access-code entry panels.
- `BroadcastCodeManager` owns the generated session code shared by the Library TV Guide and hidden broadcast television.
- `Interactable` owns reusable prompt, range, target, and callback metadata.
- `InteractionManager` owns active-room range filtering, raycast focus, and interaction triggering.
- `FurnitureBuilder` owns reusable primitive furniture construction.
- `CollisionSystem` owns collision registration, horizontal resolution, ground queries, and ceiling queries.
- `Player` composes pointer lock, touch session state, input, horizontal movement, physics, and HUD updates.
- `Input` tracks keyboard and touch movement state without knowing movement or physics rules.
- `MobileControls` owns the Android/iPhone touch joystick, look surface, sprint, interact, and pause controls.
- `Movement` converts input into smooth delta-time horizontal camera movement.
- `Physics` owns vertical movement, gravity, floor snapping, and grounded state.
- `Hud` owns the overlay DOM, coordinates, room debug values, physics debug values, interaction prompt, and exhibit information panel.
- `DebugVisuals` owns optional visual helpers for physics, portals, room bounds, and interaction ranges.
- `StartOverlay` owns the click/tap-to-begin UI.

## Future Roadmap

Planned future steps:

- Add reusable low-gravity or artificial-gravity room settings
- Add richer station systems interactions and room state
- Add a dedicated content authoring format for room terminals and exhibits
- Add higher-fidelity outdoor LOD and instancing for dense natural scenes
- Add authored outdoor landmark and trail content
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

## Step 13 Verification

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
- The Test Room has a visible `Lobby` doorway on the return wall.
- Walking back through the doorway changes Current Room back to `Lobby`.
- In the Test Room, looking at the regular wall switch shows `[E] Toggle Main Lights`.
- Interacting with the regular wall switch turns normal room lights off.
- Looking at the `Black Light` switch shows `[E] Toggle Black Light`.
- Trying the black light while normal lights are on shows a message telling the player to turn off the main lights first.
- With normal lights off, activating the black light reveals fluorescent `ENTER HERE` writing.
- The secret wall remains solid unless normal lights are off and the black light is on.
- Walking through the revealed wall changes Current Room to `The Forgotten Level`.
- The Forgotten Level generates chunks around the player and unloads distant chunks.
- The Forgotten Level shows dim yellow rooms, flickering ceiling panels, stains, props, and varied hallway layouts.
- The Forgotten Level plays subtle fluorescent/HVAC ambience after entering pointer lock.
- Distant footsteps, silence events, and occasional entity sounds occur over time.
- Rare entities may appear and change behavior as the player gets deeper.
- Rare escape doors can return the player to the Lobby.
- Walking through the Tom & Jerry doorway changes Current Room from `Lobby` to `Tom & Jerry Room`.
- Walking back through the doorway changes Current Room back to `Lobby`.
- Walking through the Aquarium doorway changes Current Room from `Lobby` to `Aquarium Room`.
- Walking back through the Aquarium doorway changes Current Room back to `Lobby`.
- Walking through the Library doorway changes Current Room from `Lobby` to `Library Room`.
- Walking back through the Library doorway changes Current Room back to `Lobby`.
- Walking through the Yosemite doorway changes Current Room from `Lobby` to `Yosemite Room`.
- Walking back through the Yosemite doorway changes Current Room back to `Lobby`.
- Walking through the Space Station doorway changes Current Room from `Lobby` to `Space Station Room`.
- Walking back through the Space Station doorway changes Current Room back to `Lobby`.
- The Space Station theme applies a dark orbital background and subtle fog.
- Animated Space Station display panels update while the room is active.
- The planet, stars, and nebula outside the observation windows drift subtly.
- Space Station engine hum, HVAC, ventilation, and beeps remain subtle after entering pointer lock.
- Yosemite grass, trees, and marker props do not render inside the Space Station.
- Looking at Space Station consoles shows `[E] Access Console`.
- Pressing `E` near a Space Station console opens the Content Panel.
- Looking at the Space Station telescope shows `[E] Use Telescope`.
- Pressing `E` near the telescope opens a starfield telescope view in the Content Panel.
- Space Station consoles, telescope, cabinets, racks, and support columns block movement.
- On Android or iPhone, tapping the start overlay begins touch play without Pointer Lock.
- On Android or iPhone, the left virtual joystick moves the player and the right side of the screen controls look direction.
- On Android or iPhone, `E`, `Shift`, and `Pause` touch buttons trigger interaction, sprint, and return-to-overlay behavior.
- The granite landmark is immediately visible after entering from the Lobby portal.
- Trees and trail geometry frame the landmark instead of blocking it.
- Yosemite terrain is walkable and the player stays grounded on gentle elevation changes.
- The trail remains fully walkable from entry to the overlook.
- Yosemite trees, cliffs, landmark collision, boulders, logs, overlook railings, and trail markers block movement.
- Looking at a Yosemite trail marker shows `[E] Read Trail Marker`.
- Yosemite trail marker text faces the readable side of each marker.
- Pressing `E` near a trail marker opens the Content Panel.
- Looking at the overlook plaque shows `[E] Read Trail Marker`.
- Yosemite overlook plaque text faces the readable side of the plaque.
- Pressing `E` near the overlook plaque opens the Content Panel.
- Pressing `E` closes the Content Panel without leaving pointer lock.
- Circling birds animate above the granite landmark.
- Yosemite wind, overlook wind, birds, and distant-water ambience start after entering pointer lock and remain subtle.
- Library book interactions still open and close the Content Panel correctly.
- Aquarium plaques still open and hide their exhibit information panel correctly.
- Tom & Jerry TV power and volume interactions still work.
- Room audio suspends when pressing `ESC`.
- Solid walls and natural boundaries still block movement.
- Project builds successfully with `npm run build`.
