# 3D Plane Simulator Game

A 3D browser-based game where you control a plane and shoot down UFOs hovering over a city using Three.js.

## Requirements

- Modern web browser with WebGL support
- Node.js (v14+ recommended)
- npm or yarn package manager
- Basic understanding of JavaScript and 3D graphics concepts

## Tech Stack

- **Three.js** - 3D graphics library for rendering
- **JavaScript (ES6+)** - Core game logic
- **HTML5** - Game container and UI elements
- **CSS3** - Styling and UI layout
- **Web Audio API** - Sound effects and music
- **Vite** - Development server and build tool (lightweight alternative to complex bundlers)

## Milestones

### Milestone 1: Create Plane Model
- Design and implement the player's airplane model
- Set up basic 3D scene with camera, lighting, and renderer
- Add basic plane geometry and materials
- Implement smooth plane animations and rotations

### Milestone 2: Build City Environment
- Create a 3D city landscape with buildings of varying heights
- Add terrain/ground plane
- Implement skybox for atmosphere
- Add environmental lighting and fog effects
- Optimize rendering performance for the city scene

### Milestone 3: Set Up Plane Controls
- Implement keyboard/mouse controls for plane movement
- Add realistic flight physics (pitch, yaw, roll)
- Set up camera system that follows the plane
- Fine-tune control responsiveness and flight feel
- Add visual feedback for plane movements

### Milestone 4: Add UFOs, Shooting, and Explosions
- Create UFO models with hovering animations
- Implement shooting mechanics with projectiles
- Add collision detection between bullets and UFOs
- Create explosion effects when UFOs are destroyed
- Add scoring system and UFO respawn logic

### Milestone 5: Add Audio, UI, and Game States
- Integrate background music and sound effects
- Create start screen with game instructions
- Implement victory conditions and win screen
- Add game over screen for losing conditions
- Polish UI elements and add game statistics display

## Getting Started

1. Clone this repository
2. Install dependencies with `npm install`
3. Run development server with `npm run dev`
4. Open your browser to the provided localhost URL
5. Start shooting down UFOs!

## Game Controls

- **Arrow Keys / WASD** - Control plane movement
- **Spacebar** - Shoot projectiles
- **Mouse** - Camera control (optional)
- **ESC** - Pause game

---

*Built with ❤️ using Three.js* 