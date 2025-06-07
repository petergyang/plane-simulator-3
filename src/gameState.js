import * as THREE from 'three';

export class GameState {
    constructor() {
        this.score = 0;
        this.hits = 0;
        this.shots = 0;
        this.accuracy = 0;
        this.gameTime = 0;
        this.isGameActive = true;
    }

    addScore(points) {
        this.score += points;
        this.updateUI();
    }

    addHit() {
        this.hits++;
        this.calculateAccuracy();
        this.updateUI();
    }

    addShot() {
        this.shots++;
        this.calculateAccuracy();
        this.updateUI();
    }

    calculateAccuracy() {
        this.accuracy = this.shots > 0 ? (this.hits / this.shots) * 100 : 0;
    }

    update(deltaTime) {
        this.gameTime += deltaTime;
        this.updateUI();
    }

    updateUI() {
        // Update score display
        const scoreElement = document.getElementById('score-value');
        if (scoreElement) {
            scoreElement.textContent = this.score;
        }

        const hitsElement = document.getElementById('hits-value');
        if (hitsElement) {
            hitsElement.textContent = this.hits;
        }

        const accuracyElement = document.getElementById('accuracy-value');
        if (accuracyElement) {
            accuracyElement.textContent = Math.round(this.accuracy);
        }
    }

    getScore() {
        return this.score;
    }

    getStats() {
        return {
            score: this.score,
            hits: this.hits,
            shots: this.shots,
            accuracy: this.accuracy,
            gameTime: this.gameTime
        };
    }
}

export class CollisionManager {
    constructor() {
        this.tempBox1 = new THREE.Box3();
        this.tempBox2 = new THREE.Box3();
    }

    checkCollisions(projectiles, ufos, explosionManager, gameState, audioManager = null) {
        const collisions = [];
        
        projectiles.forEach(projectile => {
            if (!projectile.isAlive()) return;
            
            const projectileBox = projectile.getBoundingBox();
            
            ufos.forEach(ufo => {
                if (!ufo.isAlive()) return;
                
                const ufoBox = ufo.getBoundingBox();
                
                // Check if bounding boxes intersect
                if (projectileBox.intersectsBox(ufoBox)) {
                    // More precise distance check
                    const distance = projectile.getPosition().distanceTo(ufo.getPosition());
                    
                    if (distance < 3) { // UFO hit radius
                        collisions.push({
                            projectile: projectile,
                            ufo: ufo,
                            position: ufo.getPosition().clone()
                        });
                    }
                }
            });
        });
        
        // Process collisions
        collisions.forEach(collision => {
            // Create explosion
            explosionManager.createExplosion(collision.position, 1.5);
            
            // Play explosion sound
            if (audioManager) {
                audioManager.playSound('explosion');
                audioManager.playSound('hit');
            }
            
            // Destroy projectile and UFO
            collision.projectile.destroy();
            collision.ufo.destroy();
            
            // Update game state
            gameState.addHit();
            gameState.addScore(100); // 100 points per UFO
        });
        
        return collisions;
    }

    // Helper method for sphere-sphere collision
    checkSphereCollision(pos1, radius1, pos2, radius2) {
        const distance = pos1.distanceTo(pos2);
        return distance < (radius1 + radius2);
    }

    // Helper method for box-box collision
    checkBoxCollision(box1, box2) {
        return box1.intersectsBox(box2);
    }
}