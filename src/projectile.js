import * as THREE from 'three';

export class Projectile {
    constructor(startPosition, direction, speed = 100) {
        this.group = new THREE.Group();
        this.velocity = direction.clone().normalize().multiplyScalar(speed);
        this.lifeTime = 0;
        this.maxLifeTime = 3; // 3 seconds before auto-destroy
        this.isDestroyed = false;
        
        this.createProjectile();
        this.group.position.copy(startPosition);
    }

    createProjectile() {
        // Create bullet geometry
        const bulletGeometry = new THREE.SphereGeometry(0.1, 6, 4);
        const bulletMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffff00,
            emissive: 0x444400
        });
        const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
        this.group.add(bullet);

        // Add a tracer trail effect
        const trailGeometry = new THREE.CylinderGeometry(0.05, 0.02, 0.5, 4);
        const trailMaterial = new THREE.MeshBasicMaterial({
            color: 0xff8800,
            transparent: true,
            opacity: 0.7
        });
        const trail = new THREE.Mesh(trailGeometry, trailMaterial);
        trail.rotation.x = Math.PI / 2;
        trail.position.z = -0.3;
        this.group.add(trail);
    }

    update(deltaTime) {
        if (this.isDestroyed) return false;

        // Update position
        this.group.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        
        // Update lifetime
        this.lifeTime += deltaTime;
        
        // Auto-destroy after max lifetime
        if (this.lifeTime >= this.maxLifeTime) {
            this.destroy();
            return false;
        }

        return true;
    }

    getPosition() {
        return this.group.position;
    }

    getMesh() {
        return this.group;
    }

    getBoundingBox() {
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

export class ProjectileManager {
    constructor(scene) {
        this.scene = scene;
        this.projectiles = [];
        this.fireRate = 0.2; // Seconds between shots
        this.lastFireTime = 0;
    }

    canFire(currentTime) {
        return (currentTime - this.lastFireTime) >= this.fireRate;
    }

    fire(startPosition, direction, currentTime) {
        if (!this.canFire(currentTime)) return null;

        const projectile = new Projectile(startPosition, direction);
        this.projectiles.push(projectile);
        this.scene.add(projectile.getMesh());
        this.lastFireTime = currentTime;
        
        return projectile;
    }

    update(deltaTime) {
        // Update all projectiles
        this.projectiles.forEach(projectile => {
            projectile.update(deltaTime);
        });

        // Remove destroyed projectiles
        this.projectiles = this.projectiles.filter(projectile => {
            if (!projectile.isAlive()) {
                this.scene.remove(projectile.getMesh());
                return false;
            }
            return true;
        });
    }

    getProjectiles() {
        return this.projectiles.filter(projectile => projectile.isAlive());
    }

    destroyProjectile(projectile) {
        projectile.destroy();
    }
} 