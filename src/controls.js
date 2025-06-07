import * as THREE from 'three';

export class Controls {
    constructor() {
        this.keys = {};
        this.inputs = {
            pitch: 0,
            roll: 0,
            yaw: 0,
            throttle: 0,
            fire: false
        };
        
        // Sensitivity parameters as specified
        this.sensitivity = {
            pitch: 0.8,
            turn: 1.5,
            roll: 2.0
        };
        
        this.cameraToggle = false;
        this.musicToggle = false;
        this.sfxToggle = false;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Keyboard events
        document.addEventListener('keydown', (event) => {
            this.keys[event.code] = true;
            
            // Camera toggle
            if (event.code === 'KeyC') {
                this.cameraToggle = !this.cameraToggle;
            }
            
            // Music toggle
            if (event.code === 'KeyM') {
                this.musicToggle = !this.musicToggle;
            }
            
            // Sound FX toggle
            if (event.code === 'KeyN') {
                this.sfxToggle = !this.sfxToggle;
            }
        });

        document.addEventListener('keyup', (event) => {
            this.keys[event.code] = false;
        });

        // Prevent default browser behavior for game keys
        document.addEventListener('keydown', (event) => {
            if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE', 'KeyC', 'Space', 'KeyM', 'KeyN'].includes(event.code)) {
                event.preventDefault();
            }
        });
    }

    update(deltaTime) {
        // Reset inputs
        this.inputs.pitch = 0;
        this.inputs.roll = 0;
        this.inputs.throttle = 0;
        this.inputs.fire = false;

        // Pitch control (W/S) - normalized to -1 to 1
        if (this.keys['KeyW']) {
            this.inputs.pitch = 1; // Nose up
        }
        if (this.keys['KeyS']) {
            this.inputs.pitch = -1; // Nose down
        }

        // Roll control (A/D) - normalized to -1 to 1
        if (this.keys['KeyA']) {
            this.inputs.roll = -1; // Roll left
        }
        if (this.keys['KeyD']) {
            this.inputs.roll = 1; // Roll right
        }

        // Speed control (Q/E) - normalized to -1 to 1
        if (this.keys['KeyQ']) {
            this.inputs.throttle = -1; // Decrease speed
        }
        if (this.keys['KeyE']) {
            this.inputs.throttle = 1; // Increase speed
        }

        // Fire control (Space)
        if (this.keys['Space']) {
            this.inputs.fire = true;
        }

        // Apply sensitivity scaling
        this.inputs.pitch *= this.sensitivity.pitch;
        this.inputs.roll *= this.sensitivity.roll;
    }

    getInputs() {
        return { ...this.inputs };
    }

    isCameraToggled() {
        return this.cameraToggle;
    }

    isMusicToggled() {
        const toggled = this.musicToggle;
        this.musicToggle = false; // Reset after checking
        return toggled;
    }

    isSfxToggled() {
        const toggled = this.sfxToggle;
        this.sfxToggle = false; // Reset after checking
        return toggled;
    }
} 