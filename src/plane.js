import * as THREE from 'three';

export class Plane {
    constructor() {
        this.group = new THREE.Group();
        this.propeller = null;
        
        // Physics properties
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.speed = 30; // Initial airspeed
        this.maxSpeed = 50;
        this.minSpeed = 10;
        
        // Flight control properties
        this.pitch = 0; // Current pitch angle
        this.roll = 0;  // Current roll angle
        this.yaw = 0;   // Current yaw angle
        this.maxPitch = Math.PI / 3; // ±60° limit
        this.maxRoll = Math.PI / 4;  // ±45° limit
        
        // Auto-leveling properties
        this.autoLevelStrength = 2.0;
        
        this.createPlane();
        this.setupInitialPosition();
    }

    createPlane() {
        // Main fuselage (body) - oriented along Z-axis (nose forward)
        const fuselageGeometry = new THREE.CylinderGeometry(0.3, 0.15, 4, 8);
        const fuselageMaterial = new THREE.MeshLambertMaterial({ color: 0x0066cc });
        const fuselage = new THREE.Mesh(fuselageGeometry, fuselageMaterial);
        fuselage.rotation.x = Math.PI / 2; // Rotate to point along Z-axis
        fuselage.castShadow = true;
        this.group.add(fuselage);

        // Main Wings - pass through fuselage horizontally (X-axis)
        const wingGeometry = new THREE.BoxGeometry(8, 0.3, 1.2);
        const wingMaterial = new THREE.MeshLambertMaterial({ color: 0x004499 });
        const wings = new THREE.Mesh(wingGeometry, wingMaterial);
        wings.position.set(0, 0, -0.5); // Slightly behind center
        wings.castShadow = true;
        this.group.add(wings);

        // Wing tips for more realistic look
        const wingTipGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.5);
        const wingTipMaterial = new THREE.MeshLambertMaterial({ color: 0x0066cc });
        
        const leftWingTip = new THREE.Mesh(wingTipGeometry, wingTipMaterial);
        leftWingTip.position.set(-4.0, 0, -0.5);
        leftWingTip.castShadow = true;
        this.group.add(leftWingTip);

        const rightWingTip = new THREE.Mesh(wingTipGeometry, wingTipMaterial);
        rightWingTip.position.set(4.0, 0, -0.5);
        rightWingTip.castShadow = true;
        this.group.add(rightWingTip);

        // Horizontal tail stabilizer
        const tailWingGeometry = new THREE.BoxGeometry(2.5, 0.2, 0.6);
        const tailWing = new THREE.Mesh(tailWingGeometry, wingMaterial);
        tailWing.position.set(0, 0, -1.8); // Behind fuselage
        tailWing.castShadow = true;
        this.group.add(tailWing);

        // Vertical tail fin
        const tailFinGeometry = new THREE.BoxGeometry(0.2, 1.2, 0.8);
        const tailFin = new THREE.Mesh(tailFinGeometry, wingMaterial);
        tailFin.position.set(0, 0.6, -1.8); // Behind and above fuselage
        tailFin.castShadow = true;
        this.group.add(tailFin);

        // Propeller at front
        const propellerGeometry = new THREE.BoxGeometry(3, 0.1, 0.1);
        const propellerMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        this.propeller = new THREE.Mesh(propellerGeometry, propellerMaterial);
        this.propeller.position.set(0, 0, 2.1); // At front of fuselage
        this.propeller.castShadow = true;
        this.group.add(this.propeller);

        // Cockpit/canopy
        const cockpitGeometry = new THREE.SphereGeometry(0.4, 8, 6);
        const cockpitMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x88ccff, 
            transparent: true, 
            opacity: 0.7 
        });
        const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
        cockpit.position.set(0, 0.2, 0.8); // On top, towards front
        cockpit.scale.set(0.8, 0.6, 1);
        cockpit.castShadow = true;
        this.group.add(cockpit);

        // Landing gear
        const gearGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.6, 6);
        const gearMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        
        // Front gear
        const frontGear = new THREE.Mesh(gearGeometry, gearMaterial);
        frontGear.position.set(0, -0.5, 1.2);
        frontGear.castShadow = true;
        this.group.add(frontGear);

        // Left gear
        const leftGear = new THREE.Mesh(gearGeometry, gearMaterial);
        leftGear.position.set(-0.8, -0.5, -0.5);
        leftGear.castShadow = true;
        this.group.add(leftGear);

        // Right gear
        const rightGear = new THREE.Mesh(gearGeometry, gearMaterial);
        rightGear.position.set(0.8, -0.5, -0.5);
        rightGear.castShadow = true;
        this.group.add(rightGear);

        // Position will be set in setupInitialPosition
    }

    setupInitialPosition() {
        // Position plane above and outside city, approaching inward
        this.group.position.set(-60, 25, -60);
        
        // Set initial orientation - slight nose-down attitude for approach
        this.pitch = -0.1; // Slight nose down
        this.updateRotation();
    }

    update(deltaTime, controls) {
        // Rotate propeller around Z-axis (since it's at the front)
        if (this.propeller) {
            this.propeller.rotation.z += deltaTime * this.speed * 0.5; // Speed-based spin
        }

        if (controls) {
            this.updatePhysics(deltaTime, controls);
        }
    }

    updatePhysics(deltaTime, controls) {
        const inputs = controls.getInputs();
        
        // Speed control (Q/E: 10-50 units range)
        this.speed += inputs.throttle * 20 * deltaTime;
        this.speed = Math.max(this.minSpeed, Math.min(this.maxSpeed, this.speed));
        
        // Flight controls with limits and auto-centering
        let targetPitch = inputs.pitch * this.maxPitch;
        let targetRoll = inputs.roll * this.maxRoll;
        
        // Auto-leveling when no inputs
        if (Math.abs(inputs.pitch) < 0.1) {
            targetPitch = 0;
        }
        if (Math.abs(inputs.roll) < 0.1) {
            targetRoll = 0;
        }
        
        // Smooth interpolation to target angles
        this.pitch = THREE.MathUtils.lerp(this.pitch, targetPitch, this.autoLevelStrength * deltaTime);
        this.roll = THREE.MathUtils.lerp(this.roll, targetRoll, this.autoLevelStrength * deltaTime);
        
        // Natural yaw coupling from roll (IMPORTANT: negative sign as specified)
        this.yaw += -this.roll * controls.sensitivity.turn * deltaTime;
        
        // Update rotation using quaternions (YXZ order)
        this.updateRotation();
        
        // Forward movement based on current orientation and speed
        this.updateMovement(deltaTime);
    }

    updateRotation() {
        // Create quaternion rotation in YXZ order for natural aircraft movement
        const euler = new THREE.Euler(this.pitch, this.yaw, this.roll, 'YXZ');
        this.group.quaternion.setFromEuler(euler);
    }

    updateMovement(deltaTime) {
        // Get forward direction from current orientation
        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyQuaternion(this.group.quaternion);
        
        // Calculate velocity based on speed and orientation
        this.velocity.copy(forward).multiplyScalar(this.speed);
        
        // Update position
        this.group.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        
        // Apply gravity effect based on speed and pitch
        const gravityEffect = (1 - this.speed / this.maxSpeed) * 0.5;
        this.group.position.y -= gravityEffect * deltaTime;
    }

    getMesh() {
        return this.group;
    }

    getPosition() {
        return this.group.position;
    }

    getQuaternion() {
        return this.group.quaternion;
    }

    getSpeed() {
        return this.speed;
    }

    getForwardDirection() {
        const forward = new THREE.Vector3(0, 0, 1);
        forward.applyQuaternion(this.group.quaternion);
        return forward;
    }

    getFirePosition() {
        // Fire from front of plane
        const fireOffset = new THREE.Vector3(0, 0, 3);
        fireOffset.applyQuaternion(this.group.quaternion);
        return this.group.position.clone().add(fireOffset);
    }

    setPosition(x, y, z) {
        this.group.position.set(x, y, z);
    }
} 