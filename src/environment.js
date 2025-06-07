import * as THREE from 'three';

export class Environment {
    constructor(scene) {
        this.scene = scene;
        this.createSkybox();
        this.addFog();
        this.addClouds();
    }

    createSkybox() {
        // Create a simple gradient skybox using a large sphere
        const skyGeometry = new THREE.SphereGeometry(300, 32, 32);
        
        // Create gradient material for sky
        const skyMaterial = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Color(0x0077ff) },
                bottomColor: { value: new THREE.Color(0x87CEEB) },
                offset: { value: 33 },
                exponent: { value: 0.6 }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 bottomColor;
                uniform float offset;
                uniform float exponent;
                varying vec3 vWorldPosition;
                void main() {
                    float h = normalize(vWorldPosition + offset).y;
                    gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
                }
            `,
            side: THREE.BackSide
        });

        const sky = new THREE.Mesh(skyGeometry, skyMaterial);
        this.scene.add(sky);
    }

    addFog() {
        // Add atmospheric fog for depth
        this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
    }

    addClouds() {
        const cloudGroup = new THREE.Group();
        
        // Create several cloud formations
        for (let i = 0; i < 15; i++) {
            const cloud = this.createCloud();
            cloud.position.set(
                (Math.random() - 0.5) * 200,
                Math.random() * 30 + 20,
                (Math.random() - 0.5) * 200
            );
            cloudGroup.add(cloud);
        }
        
        this.scene.add(cloudGroup);
    }

    createCloud() {
        const cloudGroup = new THREE.Group();
        
        // Create cloud using multiple spheres
        const cloudMaterial = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.7
        });
        
        // Random number of cloud puffs
        const puffCount = Math.floor(Math.random() * 5) + 3;
        
        for (let i = 0; i < puffCount; i++) {
            const puffGeometry = new THREE.SphereGeometry(
                Math.random() * 3 + 2, // Random size
                8, 6
            );
            const puff = new THREE.Mesh(puffGeometry, cloudMaterial);
            
            puff.position.set(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 3,
                (Math.random() - 0.5) * 10
            );
            
            cloudGroup.add(puff);
        }
        
        // Scale the entire cloud
        const scale = Math.random() * 0.5 + 0.5;
        cloudGroup.scale.setScalar(scale);
        
        return cloudGroup;
    }
} 