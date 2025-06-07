import * as THREE from 'three';

export class UFO {
    constructor(position) {
        this.group = new THREE.Group();
        this.isDestroyed = false;
        this.hoverTime = Math.random() * Math.PI * 2; // Random start phase
        this.hoverSpeed = 1 + Math.random() * 0.5; // Random hover speed
        this.hoverHeight = 2 + Math.random() * 3; // Random hover amplitude
        this.rotationSpeed = 0.5 + Math.random() * 1; // Random rotation speed
        
        this.createUFO();
        this.setPosition(position);
    }

    createUFO() {
        // Main UFO body (saucer shape)
        const bodyGeometry = new THREE.CylinderGeometry(2, 3, 0.8, 16);
        const bodyMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x888888,
            emissive: 0x222222 
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        this.group.add(body);

        // UFO dome (cockpit)
        const domeGeometry = new THREE.SphereGeometry(1.5, 12, 6);
        const domeMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x4444ff,
            transparent: true,
            opacity: 0.8,
            emissive: 0x111133
        });
        const dome = new THREE.Mesh(domeGeometry, domeMaterial);
        dome.position.y = 0.8;
        dome.scale.y = 0.6; // Flatten the dome
        dome.castShadow = true;
        this.group.add(dome);

        // UFO lights around the edge
        const lightGeometry = new THREE.SphereGeometry(0.2, 8, 6);
        const lightMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x00ff00,
            emissive: 0x004400
        });
        
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const light = new THREE.Mesh(lightGeometry, lightMaterial);
            light.position.set(
                Math.cos(angle) * 2.5,
                -0.2,
                Math.sin(angle) * 2.5
            );
            this.group.add(light);
        }

        // Add a subtle glow effect
        const glowGeometry = new THREE.RingGeometry(3, 4, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff00,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.rotation.x = -Math.PI / 2;
        glow.position.y = -0.5;
        this.group.add(glow);
    }

    setPosition(position) {
        this.group.position.copy(position);
    }

    update(deltaTime) {
        if (this.isDestroyed) return;

        // Hovering animation
        this.hoverTime += deltaTime * this.hoverSpeed;
        const hoverOffset = Math.sin(this.hoverTime) * this.hoverHeight;
        this.group.position.y += hoverOffset * deltaTime;

        // Rotation animation
        this.group.rotation.y += deltaTime * this.rotationSpeed;

        // Gentle swaying motion
        this.group.position.x += Math.sin(this.hoverTime * 0.7) * 0.5 * deltaTime;
        this.group.position.z += Math.cos(this.hoverTime * 0.5) * 0.3 * deltaTime;
    }

    getMesh() {
        return this.group;
    }

    getPosition() {
        return this.group.position;
    }

    getBoundingBox() {
        // Return bounding box for collision detection
        const box = new THREE.Box3().setFromObject(this.group);
        return box;
    }

    destroy() {
        this.isDestroyed = true;
    }

    isAlive() {
        return !this.isDestroyed;
    }
}

export class UFOManager {
    constructor(scene, cityBounds) {
        this.scene = scene;
        this.cityBounds = cityBounds;
        this.ufos = [];
        this.maxUFOs = 8;
        this.spawnTimer = 0;
        this.spawnInterval = 3; // Spawn every 3 seconds
        
        this.spawnInitialUFOs();
    }

    spawnInitialUFOs() {
        // Spawn initial UFOs over the city
        for (let i = 0; i < this.maxUFOs; i++) {
            this.spawnUFO();
        }
    }

    spawnUFO() {
        if (this.ufos.length >= this.maxUFOs) return;

        // Random position over the city
        const x = (Math.random() - 0.5) * this.cityBounds * 0.8;
        const z = (Math.random() - 0.5) * this.cityBounds * 0.8;
        const y = 15 + Math.random() * 20; // Height above city

        const position = new THREE.Vector3(x, y, z);
        const ufo = new UFO(position);
        
        this.ufos.push(ufo);
        this.scene.add(ufo.getMesh());
    }

    update(deltaTime) {
        // Update existing UFOs
        this.ufos.forEach(ufo => {
            if (ufo.isAlive()) {
                ufo.update(deltaTime);
            }
        });

        // Remove destroyed UFOs
        this.ufos = this.ufos.filter(ufo => {
            if (!ufo.isAlive()) {
                this.scene.remove(ufo.getMesh());
                return false;
            }
            return true;
        });

        // Spawn new UFOs
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.spawnInterval) {
            this.spawnUFO();
            this.spawnTimer = 0;
        }
    }

    getUFOs() {
        return this.ufos.filter(ufo => ufo.isAlive());
    }

    destroyUFO(ufo) {
        ufo.destroy();
    }
} 