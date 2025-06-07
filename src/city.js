import * as THREE from 'three';

export class City {
    constructor() {
        this.group = new THREE.Group();
        this.buildings = [];
        this.createCity();
    }

    createCity() {
        // Create city grid
        const citySize = 80;
        const blockSize = 8;
        const streetWidth = 2;
        
        for (let x = -citySize/2; x < citySize/2; x += blockSize + streetWidth) {
            for (let z = -citySize/2; z < citySize/2; z += blockSize + streetWidth) {
                // Skip center area for plane flying space
                if (Math.abs(x) < 15 && Math.abs(z) < 15) continue;
                
                this.createCityBlock(x, z, blockSize);
            }
        }

        // Create roads/streets
        this.createRoads(citySize);
        
        // Add some parks/green spaces
        this.createParks(citySize);
    }

    createCityBlock(x, z, blockSize) {
        // Random number of buildings per block (1-4)
        const numBuildings = Math.floor(Math.random() * 4) + 1;
        
        for (let i = 0; i < numBuildings; i++) {
            const buildingWidth = Math.random() * 3 + 2; // 2-5 units wide
            const buildingDepth = Math.random() * 3 + 2; // 2-5 units deep
            const buildingHeight = Math.random() * 15 + 5; // 5-20 units tall
            
            // Random position within the block
            const offsetX = (Math.random() - 0.5) * (blockSize - buildingWidth);
            const offsetZ = (Math.random() - 0.5) * (blockSize - buildingDepth);
            
            const building = this.createBuilding(
                buildingWidth, 
                buildingHeight, 
                buildingDepth
            );
            
            building.position.set(
                x + offsetX, 
                buildingHeight / 2, 
                z + offsetZ
            );
            
            this.buildings.push(building);
            this.group.add(building);
        }
    }

    createBuilding(width, height, depth) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        
        // Random building colors (various grays and building colors)
        const colors = [
            0x888888, 0x666666, 0x999999, 0xaaaaaa,
            0x8b7355, 0x654321, 0x4a4a4a, 0x5d5d5d
        ];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        const material = new THREE.MeshLambertMaterial({ color });
        const building = new THREE.Mesh(geometry, material);
        building.castShadow = true;
        building.receiveShadow = true;
        
        // Add windows
        this.addWindows(building, width, height, depth);
        
        return building;
    }

    addWindows(building, width, height, depth) {
        const windowMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x87CEEB, 
            transparent: true, 
            opacity: 0.7 
        });
        
        // Calculate window grid
        const windowsX = Math.floor(width * 2);
        const windowsY = Math.floor(height * 0.8);
        const windowsZ = Math.floor(depth * 2);
        
        // Front and back faces
        for (let i = 0; i < windowsX; i++) {
            for (let j = 1; j < windowsY; j++) {
                if (Math.random() > 0.3) { // 70% chance of window
                    const windowGeometry = new THREE.PlaneGeometry(0.3, 0.4);
                    const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
                    window1.position.set(
                        (i - windowsX/2 + 0.5) * (width / windowsX),
                        (j - windowsY/2) * (height / windowsY),
                        depth/2 + 0.01
                    );
                    building.add(window1);
                    
                    const window2 = new THREE.Mesh(windowGeometry, windowMaterial);
                    window2.position.set(
                        (i - windowsX/2 + 0.5) * (width / windowsX),
                        (j - windowsY/2) * (height / windowsY),
                        -depth/2 - 0.01
                    );
                    window2.rotation.y = Math.PI;
                    building.add(window2);
                }
            }
        }
    }

    createRoads(citySize) {
        const roadMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        
        // Main roads (cross pattern)
        const mainRoadGeometry = new THREE.PlaneGeometry(citySize, 4);
        const mainRoad1 = new THREE.Mesh(mainRoadGeometry, roadMaterial);
        mainRoad1.rotation.x = -Math.PI / 2;
        mainRoad1.position.y = -1.9;
        mainRoad1.receiveShadow = true;
        this.group.add(mainRoad1);
        
        const mainRoad2 = new THREE.Mesh(mainRoadGeometry, roadMaterial);
        mainRoad2.rotation.x = -Math.PI / 2;
        mainRoad2.rotation.z = Math.PI / 2;
        mainRoad2.position.y = -1.9;
        mainRoad2.receiveShadow = true;
        this.group.add(mainRoad2);
    }

    createParks(citySize) {
        const parkMaterial = new THREE.MeshLambertMaterial({ color: 0x2d5016 });
        
        // Create a few park areas
        for (let i = 0; i < 4; i++) {
            const parkSize = Math.random() * 8 + 4;
            const parkGeometry = new THREE.PlaneGeometry(parkSize, parkSize);
            const park = new THREE.Mesh(parkGeometry, parkMaterial);
            park.rotation.x = -Math.PI / 2;
            park.position.set(
                (Math.random() - 0.5) * citySize * 0.7,
                -1.8,
                (Math.random() - 0.5) * citySize * 0.7
            );
            park.receiveShadow = true;
            this.group.add(park);
            
            // Add some trees
            this.addTrees(park.position.x, park.position.z, parkSize);
        }
    }

    addTrees(centerX, centerZ, parkSize) {
        const treeCount = Math.floor(parkSize);
        
        for (let i = 0; i < treeCount; i++) {
            const trunkGeometry = new THREE.CylinderGeometry(0.1, 0.15, 1.5);
            const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            
            const leavesGeometry = new THREE.SphereGeometry(0.8);
            const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x228b22 });
            const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
            leaves.position.y = 1.2;
            
            const tree = new THREE.Group();
            tree.add(trunk);
            tree.add(leaves);
            
            tree.position.set(
                centerX + (Math.random() - 0.5) * parkSize * 0.8,
                -1.25,
                centerZ + (Math.random() - 0.5) * parkSize * 0.8
            );
            
            trunk.castShadow = true;
            leaves.castShadow = true;
            
            this.group.add(tree);
        }
    }

    getMesh() {
        return this.group;
    }

    // Method to get building positions for collision detection (future use)
    getBuildingPositions() {
        return this.buildings.map(building => ({
            position: building.position.clone(),
            size: building.geometry.parameters
        }));
    }
} 