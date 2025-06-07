import * as THREE from 'three';

export class Explosion {
    constructor(position, size = 1) {
        this.group = new THREE.Group();
        this.particles = [];
        this.lifeTime = 0;
        this.maxLifeTime = 2; // 2 seconds explosion duration
        this.isComplete = false;
        this.size = size;
        
        this.createExplosion(position);
    }

    createExplosion(position) {
        this.group.position.copy(position);
        
        // Create multiple explosion particles
        const particleCount = 15 + Math.floor(Math.random() * 10);
        
        for (let i = 0; i < particleCount; i++) {
            this.createParticle();
        }
        
        // Create main explosion flash
        this.createFlash();
    }

    createParticle() {
        const particleGeometry = new THREE.SphereGeometry(0.2 + Math.random() * 0.3, 6, 4);
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color().setHSL(
                Math.random() * 0.1, // Red-orange hues
                0.8 + Math.random() * 0.2,
                0.5 + Math.random() * 0.5
            ),
            transparent: true,
            opacity: 1
        });
        
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        
        // Random initial position within explosion radius
        const angle = Math.random() * Math.PI * 2;
        const elevation = (Math.random() - 0.5) * Math.PI;
        const distance = Math.random() * 2 * this.size;
        
        particle.position.set(
            Math.cos(angle) * Math.cos(elevation) * distance,
            Math.sin(elevation) * distance,
            Math.sin(angle) * Math.cos(elevation) * distance
        );
        
        // Random velocity for particle movement
        const velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 20 * this.size,
            (Math.random() - 0.5) * 20 * this.size,
            (Math.random() - 0.5) * 20 * this.size
        );
        
        // Store particle data
        this.particles.push({
            mesh: particle,
            velocity: velocity,
            initialScale: particle.scale.clone(),
            material: particleMaterial
        });
        
        this.group.add(particle);
    }

    createFlash() {
        // Bright flash effect
        const flashGeometry = new THREE.SphereGeometry(3 * this.size, 8, 6);
        const flashMaterial = new THREE.MeshBasicMaterial({
            color: 0xffaa00,
            transparent: true,
            opacity: 0.8
        });
        
        this.flash = new THREE.Mesh(flashGeometry, flashMaterial);
        this.group.add(this.flash);
    }

    update(deltaTime) {
        if (this.isComplete) return false;
        
        this.lifeTime += deltaTime;
        const progress = this.lifeTime / this.maxLifeTime;
        
        if (progress >= 1) {
            this.isComplete = true;
            return false;
        }
        
        // Update particles
        this.particles.forEach(particleData => {
            const { mesh, velocity, initialScale, material } = particleData;
            
            // Move particle
            mesh.position.add(velocity.clone().multiplyScalar(deltaTime));
            
            // Scale down over time
            const scaleProgress = 1 - progress;
            mesh.scale.copy(initialScale).multiplyScalar(scaleProgress);
            
            // Fade out
            material.opacity = scaleProgress;
            
            // Apply gravity
            velocity.y -= 15 * deltaTime;
            
            // Air resistance
            velocity.multiplyScalar(0.98);
        });
        
        // Update flash
        if (this.flash) {
            const flashProgress = Math.min(progress * 4, 1); // Flash fades quickly
            this.flash.material.opacity = 0.8 * (1 - flashProgress);
            this.flash.scale.setScalar(1 + flashProgress * 2);
        }
        
        return true;
    }

    getMesh() {
        return this.group;
    }

    isFinished() {
        return this.isComplete;
    }
}

export class ExplosionManager {
    constructor(scene) {
        this.scene = scene;
        this.explosions = [];
    }

    createExplosion(position, size = 1) {
        const explosion = new Explosion(position, size);
        this.explosions.push(explosion);
        this.scene.add(explosion.getMesh());
        return explosion;
    }

    update(deltaTime) {
        // Update all explosions
        this.explosions.forEach(explosion => {
            explosion.update(deltaTime);
        });

        // Remove finished explosions
        this.explosions = this.explosions.filter(explosion => {
            if (explosion.isFinished()) {
                this.scene.remove(explosion.getMesh());
                return false;
            }
            return true;
        });
    }
} 