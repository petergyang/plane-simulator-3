import * as THREE from 'three';
import { Scene } from './scene.js';
import { Plane } from './plane.js';
import { City } from './city.js';
import { Environment } from './environment.js';
import { Controls } from './controls.js';
import { UFOManager } from './ufo.js';
import { ProjectileManager } from './projectile.js';
import { ExplosionManager } from './explosion.js';
import { GameState, CollisionManager } from './gameState.js';
import { AudioManager } from './audio.js';

class Game {
    constructor() {
        this.scene = null;
        this.plane = null;
        this.city = null;
        this.environment = null;
        this.controls = null;
        this.ufoManager = null;
        this.projectileManager = null;
        this.explosionManager = null;
        this.gameState = null;
        this.collisionManager = null;
        this.audioManager = null;
        this.clock = null;
        this.isLoaded = false;
        this.audioInitialized = false;
        
        this.init();
    }

    async init() {
        try {
            // Initialize scene
            this.scene = new Scene();
            
            // Create clock for delta time
            this.clock = new THREE.Clock();
            
            // Create controls
            this.controls = new Controls();
            
            // Create game systems
            this.gameState = new GameState();
            this.collisionManager = new CollisionManager();
            this.projectileManager = new ProjectileManager(this.scene.scene);
            this.explosionManager = new ExplosionManager(this.scene.scene);
            this.audioManager = new AudioManager();
            
            // Create environment (skybox, fog, clouds)
            this.environment = new Environment(this.scene.scene);
            
            // Create city
            this.city = new City();
            this.scene.add(this.city.getMesh());
            
            // Create UFO manager
            this.ufoManager = new UFOManager(this.scene.scene, 80); // City bounds
            
            // Create plane
            this.plane = new Plane();
            this.scene.add(this.plane.getMesh());
            
            // Add ground plane
            this.createGround();
            
            // Initialize audio system
            await this.initializeAudio();
            
            // Update UI
            document.getElementById('loading').style.display = 'none';
            this.isLoaded = true;
            
            // Start game loop
            this.gameLoop();
            
        } catch (error) {
            console.error('Error initializing game:', error);
            document.getElementById('loading').textContent = 'Error loading game. Please refresh.';
        }
    }

    createGround() {
        const groundGeometry = new THREE.PlaneGeometry(200, 200);
        const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x4a5d4a });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -2;
        ground.receiveShadow = true;
        this.scene.add(ground);
    }

    async initializeAudio() {
        try {
            if (this.audioManager) {
                await this.audioManager.initialize();
                console.log('Audio initialized - music will start on first user interaction');
            }
        } catch (error) {
            console.error('Failed to initialize audio:', error);
        }
    }

    async startAudio() {
        if (this.audioManager && !this.audioInitialized) {
            await this.audioManager.resumeAudioContext();
            this.audioManager.playBackgroundMusic();
            this.audioInitialized = true;
            console.log('Background music started');
        }
    }

    updateUI() {
        if (!this.plane) return;
        
        const speed = Math.round(this.plane.getSpeed());
        const speedElement = document.getElementById('speed-value');
        const speedIndicator = document.getElementById('speed-indicator');
        
        speedElement.textContent = speed;
        
        // Color-coded speed feedback
        speedIndicator.className = '';
        if (speed < 20) {
            speedIndicator.classList.add('speed-slow');
        } else if (speed < 35) {
            speedIndicator.classList.add('speed-medium');
        } else {
            speedIndicator.classList.add('speed-fast');
        }
    }

    gameLoop() {
        if (!this.isLoaded) return;

        requestAnimationFrame(() => this.gameLoop());

        const deltaTime = this.clock.getDelta();
        const currentTime = this.clock.getElapsedTime();

        // Start audio on first user interaction
        if (!this.audioInitialized) {
            this.startAudio();
        }

        // Update controls
        if (this.controls) {
            this.controls.update(deltaTime);
            
            // Handle audio toggles
            if (this.controls.isMusicToggled() && this.audioManager) {
                this.audioManager.toggleMusic();
            }
            if (this.controls.isSfxToggled() && this.audioManager) {
                this.audioManager.toggleSfx();
            }
        }

        // Handle shooting
        this.handleShooting(currentTime);

        // Update plane with physics
        if (this.plane && this.controls) {
            this.plane.update(deltaTime, this.controls);
        }

        // Update game systems
        this.updateGameSystems(deltaTime);

        // Update camera system
        if (this.scene && this.plane && this.controls) {
            this.scene.updateCamera(this.plane, this.controls);
        }

        // Update UI
        this.updateUI();

        // Render the scene
        this.scene.render();
    }

    handleShooting(currentTime) {
        if (!this.controls || !this.plane || !this.projectileManager || !this.gameState) return;
        
        const inputs = this.controls.getInputs();
        
        if (inputs.fire) {
            const firePosition = this.plane.getFirePosition();
            const fireDirection = this.plane.getForwardDirection();
            
            const projectile = this.projectileManager.fire(firePosition, fireDirection, currentTime);
            if (projectile) {
                this.gameState.addShot();
                // Play shooting sound effect
                if (this.audioManager) {
                    this.audioManager.playSound('shoot');
                }
            }
        }
    }

    updateGameSystems(deltaTime) {
        // Update UFOs
        if (this.ufoManager) {
            this.ufoManager.update(deltaTime);
        }

        // Update projectiles
        if (this.projectileManager) {
            this.projectileManager.update(deltaTime);
        }

        // Update explosions
        if (this.explosionManager) {
            this.explosionManager.update(deltaTime);
        }

        // Update game state
        if (this.gameState) {
            this.gameState.update(deltaTime);
        }

        // Check collisions
        if (this.collisionManager && this.projectileManager && this.ufoManager && this.explosionManager && this.gameState) {
            this.collisionManager.checkCollisions(
                this.projectileManager.getProjectiles(),
                this.ufoManager.getUFOs(),
                this.explosionManager,
                this.gameState,
                this.audioManager
            );
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Game();
}); 