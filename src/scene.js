import * as THREE from 'three';

export class Scene {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = null;
        this.renderer = null;
        this.cameraOffset = new THREE.Vector3(0, 5, -15);
        this.cameraLookOffset = new THREE.Vector3(0, 0, 10);
        this.cameraMode = 'follow'; // 'follow' or 'free'
        this.init();
    }

    init() {
        // Set up camera
        this.camera = new THREE.PerspectiveCamera(
            75, // Field of view
            window.innerWidth / window.innerHeight, // Aspect ratio
            0.1, // Near clipping plane
            1000 // Far clipping plane
        );
        // Initial camera position will be updated by updateCamera method
        this.camera.position.set(0, 8, -15);
        this.camera.lookAt(0, 2, 0);

        // Set up renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87CEEB, 1); // Sky blue background
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Add to DOM
        document.getElementById('game-container').appendChild(this.renderer.domElement);

        // Set up lighting
        this.setupLighting();

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize(), false);
    }

    setupLighting() {
        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        this.scene.add(directionalLight);

        // Point light for additional warmth
        const pointLight = new THREE.PointLight(0xffffff, 0.5, 100);
        pointLight.position.set(-10, 10, -10);
        this.scene.add(pointLight);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    add(object) {
        this.scene.add(object);
    }

    updateCamera(plane, controls) {
        // Camera mode is always follow for now (toggle feature can be expanded later)
        if (this.cameraMode === 'follow' && plane) {
            this.updateFollowCamera(plane);
        }
        // Free camera mode would be implemented here for orbit controls
    }

    updateFollowCamera(plane) {
        const planePosition = plane.getPosition();
        const planeQuaternion = plane.getQuaternion();
        
        // Calculate camera position using quaternion offset
        const cameraPosition = this.cameraOffset.clone();
        cameraPosition.applyQuaternion(planeQuaternion);
        cameraPosition.add(planePosition);
        
        // Calculate look-at position
        const lookAtPosition = this.cameraLookOffset.clone();
        lookAtPosition.applyQuaternion(planeQuaternion);
        lookAtPosition.add(planePosition);
        
        // Smoothly follow plane using lerp-based transitions
        this.camera.position.lerp(cameraPosition, 0.1);
        this.camera.lookAt(lookAtPosition);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
} 