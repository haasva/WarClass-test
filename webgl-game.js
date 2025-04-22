






let CELL_SIZE = 1;

let impassableObjects = [];
let treesObjects = [];
// Get the existing canvas
const canvas = document.querySelector("#webgl-canvas");

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
      event.preventDefault();
      const requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
      if (document.pointerLockElement === canvas) {
        document.exitPointerLock();
      } else {
        requestPointerLock.call(canvas);
      }
    }
  });

// Create a Three.js renderer using the canvas
const renderer = new THREE.WebGLRenderer({ canvas,
    powerPreference: "high-performance",
	antialias: false,
	stencil: false,
	depth: true
 });

renderer.setSize(1920, 1080);
// Enable shadows in the renderer
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Soft shadows (optional)

const regionGC = document.querySelector("#regopn-grid-container");
document.body.appendChild(renderer.domElement);


const scene = new THREE.Scene();

class SceneManager {
    constructor(scene) {
        this.scene = scene;          // The Three.js scene object
        this.objects = [];           // Array to hold all objects in the scene
    }

    // Add an object to the scene and the list
    addObject(object) {
        this.scene.add(object);
        this.objects.push(object);
    }

    // Remove an object from the scene and the list
    removeObject(object) {
        const index = this.objects.indexOf(object);
        if (index !== -1) {
            this.scene.remove(object);
            this.objects.splice(index, 1);
        }
    }

    // Clear all objects from the scene
    clearAllObjects() {
        this.objects.forEach(obj => {
            this.scene.remove(obj);
        });
        this.objects = [];  // Reset the array
    }

    // Get all objects in the scene
    getAllObjects() {
        return this.objects;
    }

    // Example: Find all objects of a specific type or class
    getObjectsByType(type) {
        return this.objects.filter(obj => obj instanceof type);
    }

    // Example: Remove all objects of a specific type
    removeObjectsByType(type) {
        const toRemove = this.objects.filter(obj => obj instanceof type);
        toRemove.forEach(obj => this.removeObject(obj));
    }
}

const sceneManager = new SceneManager(scene);


let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 50);
camera.position.set(0, 5, 10); // Adjust position



scene.receiveShadow = true;
scene.castShadow = true;
scene.fog = new THREE.Fog( 0x58615d, 20, 100 );
// Add a light source
const light = new THREE.DirectionalLight(0xffee98, 1);
light.position.set(37, 30, 20);
light.castShadow = true; // Enable shadow castingdawd
light.shadow.radius = 10;
light.shadow.mapSize.width = 1024; // Higher resolution for smoother shadows
light.shadow.mapSize.height = 1024;

light.shadow.camera.near = 0.5;
light.shadow.camera.far = 50;
light.shadow.camera.left = -20;
light.shadow.camera.right = 20;
light.shadow.camera.top = 20;
light.shadow.camera.bottom = -20;
light.shadow.bias = 0.0005;
scene.add(light);


const hemiLight = new THREE.HemisphereLight(0xffffff, 0x222222, 1);
scene.add(hemiLight);
const light2 = new THREE.AmbientLight(0xa6a6a6, 0.4); // soft white light
scene.add( light2 );





const skybox = createSkybox();
scene.add(skybox);

function createSkybox() {
// Load the skybox textures
const loader = new THREE.CubeTextureLoader();
const skyboxTexture = loader.load([
    '/Art/Skyboxes/normal/General/right.jpg',  // Right side (positive X)
    '/Art/Skyboxes/normal/General/left.jpg',  // Left side (negative X)
    '/Art/Skyboxes/normal/General/up.jpg',  // Top side (positive Y)
    '/Art/Skyboxes/normal/General/down.jpg',  // Bottom side (negative Y)
    '/Art/Skyboxes/normal/General/front.jpg',  // Front side (positive Z)
    '/Art/Skyboxes/normal/General/back.jpg'   // Back side (negative Z)
]);

// Set the scene background to the skybox texture
skyboxTexture.minFilter = THREE.NearestFilter;
skyboxTexture.magFilter = THREE.NearestFilter;
scene.background = skyboxTexture;


// Optional: You can also create a large cube geometry to represent the skybox in the scene
const skyboxGeometry = new THREE.BoxGeometry(512, 512, 512);  // Large cube

const skyboxMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.BackSide,  // Render only the inside of the cube
    map: skyboxTexture
});

const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);

// Add the skybox to the scene

}










const player = addPlayer();
scene.add(player);

function addPlayer() {
    const initialRow = -35;
    const initialCol = 25;

    const playerGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const playerMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    
    const player = new THREE.Mesh(playerGeometry, playerMaterial);

    // Set the player's initial position
    player.position.set(initialCol * CELL_SIZE, 0.25, -initialRow * CELL_SIZE);



    // Create a light source (e.g., PointLight)
    const playerLight = new THREE.PointLight(0xe8bc42, 0.4, 10); // Yellow light with a distance of 10
    playerLight.position.set(0, -0.1, 0); // Position the light slightly above the player (you can adjust this as needed)
    playerLight.castShadow = true;
    playerLight.decay = 3;
    playerLight.shadow.radius = 3; // The higher the radius, the softer the shadow

    // Add the light as a child of the player
    player.add(playerLight);

    return player;
}

// Set initial player position based on map

    // Function to apply texture settings
    const applyTextureSettings = (texture) => {
        if (!texture) return;
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(75, 75);
    };

function addGround(veg) {
    const groundSize = 150;
    const ddsLoader = new THREE.TextureLoader();  // Use DDSLoader instead of TextureLoader
    
    // Load the textures
    const diffuseTexture = ddsLoader.load(`/Art/Vegetation/Textures/${veg}/diff.png`);
    const normalTexture = ddsLoader.load(`/Art/Vegetation/Textures/${veg}/norm.png`);
    const specularTexture = ddsLoader.load(`/Art/Vegetation/Textures/${veg}/spec.png`);
    

    
    // Apply settings to all textures
    applyTextureSettings(diffuseTexture);
    applyTextureSettings(normalTexture);
    applyTextureSettings(specularTexture);

    const material = new THREE.MeshStandardMaterial({
        map: diffuseTexture,
        // normalMap: normalTexture,
        // roughnessMap: specularTexture, // Specular map is used as roughnessMap
        roughness: 1, // Adjust if needed
    });
  

  
    const geometry = new THREE.PlaneGeometry(groundSize, groundSize);
    const mesh = new THREE.Mesh(geometry, material);


    mesh.position.set(0, 0, 0);
    mesh.rotation.x = -Math.PI / 2;

    return mesh;
}


let moveSpeed = 0.1;
let movementKeys = {}; // Track pressed keys
const lerpFactor = 0.7; // Controls smoothness of movement
let targetPosition = new THREE.Vector3(); // Where the player is moving

let cameraYaw = 0; // Horizontal rotation (yaw)
let cameraPitch = 0; // Vertical rotation (pitch)
let mouseSensitivity = 0.00085; // Sensitivity for mouse movement
let maxPitch = Math.PI / 3; // Limit vertical rotation to prevent full flip (about 60°)
let minPitch = -Math.PI / 3; // Prevent looking too far up or downmovementKeys

let headBob = {
    amplitude: 0.004, // How much the camera bobs up and down
    frequency: 0.8, // How fast the camera bobs (higher means faster)
    isMoving: false, // Whether the player is currently moving
    currentPosition: player.position.y + 0.06, // Current headbob position
    direction: 1, // Direction of bobbing
    speed: 0.0, // Speed at which the camera moves (for controlling the effect)
    bobbing() {
        if (this.isMoving) {
            // Calculate bobbing based on time and frequency
            this.currentPosition += (this.frequency * this.direction) + (player.position.y + 0.06);
            if (this.currentPosition > 1 || this.currentPosition < -1) {
                this.direction *= -1; // Reverse direction when reaching limits
            }

            // Apply the bobbing to the camera's Y position
            camera.position.y = (this.amplitude * Math.sin(this.currentPosition)) + (player.position.y + 0.06);
        } else {
            // If not moving, reset the bobbing
            camera.position.y = player.position.y + 0.06;
            this.currentPosition = player.position.y + 0.06; // Reset the bobbing position
        }
    },
    startBobbing() {
        this.isMoving = true;
    },
    stopBobbing() {
        this.isMoving = false;
    },
    updateMovementSpeed(speed) {
        this.speed = speed;
        // Start bobbing if moving
        if (this.speed > 0) {
            this.startBobbing();
        } else {
            this.stopBobbing();
        }
    }
};

function updateHeadBob() {
    headBob.bobbing();
}







function animate() {

  requestAnimationFrame(animate);
  updatePlayerMovement();

  renderer.render(scene, camera);

}




function updateTreeOrientation() {
    const cameraYaw = camera.rotation.y;

    for (const obj of treesObjects) {
        if (obj instanceof THREE.InstancedMesh) {
            const matrix = new THREE.Matrix4();
            const position = new THREE.Vector3();
            const scale = new THREE.Vector3();
            const quaternion = new THREE.Quaternion();

            for (let i = 0; i < obj.count; i++) {
                obj.getMatrixAt(i, matrix);
                matrix.decompose(position, quaternion, scale);

                // Apply new rotation to face the camera (billboarding)
                quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw);

                // Recompose the matrix with new rotation
                matrix.compose(position, quaternion, scale);
                obj.setMatrixAt(i, matrix);
            }

            obj.instanceMatrix.needsUpdate = true; // Ensure the update is applied
        }
    }
}











document.addEventListener("keydown", (event) => {
    movementKeys[event.key] = true;
});

document.addEventListener("keyup", (event) => {
    movementKeys[event.key] = false;
    
    // When all movement keys are released, snap to the nearest grid position
    if (!movementKeys["w"] && !movementKeys["a"] && !movementKeys["s"] && !movementKeys["d"]) {
        //snapToGrid();
    }
});

function updatePlayerMovement() {
    if (document.pointerLockElement != canvas) {
        return;
    }
    let movement = new THREE.Vector3();

    // Get the direction the camera is facing (in world space)
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction); // Get the direction the camera is facing

    // Normalize direction to avoid faster diagonal movement
    direction.y = 0; // Ignore vertical movement for player movement
    direction.normalize();

    // Use movement keys to control the player
    if (movementKeys["w"]) movement.add(direction.multiplyScalar(moveSpeed)); // Move forward
    if (movementKeys["s"]) movement.sub(direction.multiplyScalar(moveSpeed)); // Move backward

    // Calculate the right vector for strafing (perpendicular to the forward direction)
    const right = new THREE.Vector3();
    right.crossVectors(direction, new THREE.Vector3(0, 1, 0)); // Right vector
    right.normalize();

    if (movementKeys["a"]) movement.sub(right.multiplyScalar(moveSpeed)); // Strafe left
    if (movementKeys["d"]) movement.add(right.multiplyScalar(moveSpeed)); // Strafe right

    // Update target position based on movement
    targetPosition.x += movement.x;
    targetPosition.z += movement.z;

    // Smoothly interpolate towards target position
    if (movement.lengthSq() === 0) return; // No movement

    let newPosition = player.position.clone().add(movement);

    if (!checkCollision(newPosition)) {
        player.position.copy(newPosition);
    } else {
        // Try sliding along X and Z separately
        let slideX = player.position.clone().add(new THREE.Vector3(movement.x, 0, 0));
        let slideZ = player.position.clone().add(new THREE.Vector3(0, 0, movement.z));

        if (!checkCollision(slideX)) {
            player.position.copy(slideX);
        } else if (!checkCollision(slideZ)) {
            player.position.copy(slideZ);
        }
    }
    playStepSound();
    updateCamera();
    headBob.updateMovementSpeed(0.1);
    updateHeadBob();

}


function snapToGrid() {
    let snappedX = Math.round(player.position.x / CELL_SIZE) * CELL_SIZE;
    let snappedZ = Math.round(player.position.z / CELL_SIZE) * CELL_SIZE;

    // Simulate snapping
    let proposedPosition = new THREE.Vector3(snappedX, player.position.y, snappedZ);

    if (!checkCollision(proposedPosition)) {
        player.position.copy(proposedPosition);
    } else {
        // Try sliding along the X or Z axis
        let slideX = new THREE.Vector3(snappedX, player.position.y, player.position.z);
        let slideZ = new THREE.Vector3(player.position.x, player.position.y, snappedZ);

        if (!checkCollision(slideX)) {
            player.position.copy(slideX);
        } else if (!checkCollision(slideZ)) {
            player.position.copy(slideZ);
        }
    }

    targetPosition.copy(player.position); // Ensure smooth movement towards new position
}

  


// Handle mouse movement
document.addEventListener("mousemove", (event) => {
    if (document.pointerLockElement != canvas) {
        return;
    }
    let deltaX = event.movementX;
    let deltaY = event.movementY;

    // Update yaw (horizontal movement)
    cameraYaw += deltaX * mouseSensitivity;

    // Update pitch (vertical movement)
    cameraPitch -= deltaY * mouseSensitivity;

    // Clamp pitch to prevent the camera from going upside down
    cameraPitch = Math.max(minPitch, Math.min(maxPitch, cameraPitch));
    updateTreeOrientation();
    // Apply the changes to camera rotation
    updateCamera();
    
});

function updateCamera() {

    if (!player) return;

    // Keep the camera behind and slightly above the player
    camera.position.set(
        player.position.x,
        player.position.y + 0.06, // Slightly raised above player
        player.position.z
    );

    // Apply the yaw (left-right) and pitch (up-down) rotations
    camera.rotation.set(-Math.PI * 2, -cameraYaw, 0);

    
}


function updateShadowBlur() {
    let playerLight = null;

    // Find the light attached to the player
    player.children.forEach((child) => {
        if (child.isLight) {
            playerLight = child;
        }
    });

    if (!playerLight) return; // No light found, exit function

    scene.traverse((object) => {
        if (object.isMesh && object.castShadow) {
            const shadowDistance = object.position.distanceTo(player.position);
            const fadeFactor = Math.max(0.2, 1 - shadowDistance / 100);
            const blurFactor = Math.min(10, shadowDistance / 5); 


            if (object.shadow) {
                object.shadow.radius = blurFactor;
                object.shadow.mapSize.width = 512 + blurFactor * 20;
                object.shadow.mapSize.height = 512 + blurFactor * 20;
                object.shadow.needsUpdate = true;
            }
        }
    });
}

function checkCollision(newPosition) {
    const playerBox = new THREE.Box3().setFromObject(player);

    // Slightly shrink the bounding box for smoother gliding
    const margin = 0.01;
    playerBox.min.addScalar(margin);
    playerBox.max.subScalar(margin);

    // Simulate future position
    playerBox.translate(newPosition.clone().sub(player.position));

    for (const obj of impassableObjects) {
        const objBox = new THREE.Box3().setFromObject(obj);
        if (playerBox.intersectsBox(objBox)) {
            return true; // Collision detected
        }
    }
    return false; // No collision
}



// Define the render distance radius (you can adjust this value)
const renderRadius = 10;

function updateObjectsVisibility() {
    const cameraPosition = camera.position;

    // Function to check and render objects within the radius
    function checkObjectVisibility(obj) {
        const objectPosition = obj instanceof THREE.InstancedMesh ? obj.getMatrixAt(0).getPosition() : obj.position;
        const distance = cameraPosition.distanceTo(objectPosition);

        if (distance <= renderRadius) {
            obj.visible = true; // Make object visible if it's within the radius
        } else {
            obj.visible = false; // Hide object if it's out of the radius
        }
    }

    // Check visibility for impassable objects
    for (const obj of impassableObjects) {
        checkObjectVisibility(obj);
    }

    // Check visibility for trees objects
    for (const obj of treesObjects) {
        checkObjectVisibility(obj);
    }
}




function clearScene(scene) {
    sceneManager.clearAllObjects();
}


function createMapGrid() {
    impassableObjects = [];
    treesObjects = [];
    clearScene(scene);
    const mapData = window.CURRENT_PLAYER_REGION_DATA.content;
    const veg = window.CURRENT_PLAYER_REGION_DATA.vegetation;

    // 📌 1️⃣ Pre-create geometries and materials to reuse
    const planeGeometry = new THREE.PlaneGeometry(CELL_SIZE, CELL_SIZE);
    const defaultMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22, side: THREE.DoubleSide });
    const riverMaterial = new THREE.MeshStandardMaterial({ color: 0x3EBCEE, side: THREE.DoubleSide });
    const impassableMaterial = new THREE.MeshStandardMaterial({ color: 0x974601, side: THREE.DoubleSide });
    const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x676767, side: THREE.DoubleSide });




    for (let i = 0; i < mapData.length; i++) {
        for (let j = 0; j < mapData[i].length; j++) {
            const data = mapData[i][j];

            // 📌 2️⃣ Choose material BEFORE creating the plane
            let cellMaterial = defaultMaterial;
            if (data.river) cellMaterial = riverMaterial;
            else if (data.impassable) cellMaterial = impassableMaterial;
            else if (data.road) cellMaterial = roadMaterial;

            const x = j * CELL_SIZE;  // Columns go along X
            const z = (mapData.length - 1 - i) * CELL_SIZE;  // Flip rows along Z

            // 📌 3️⃣ Create and position the plane
            const plane = new THREE.Mesh(planeGeometry, cellMaterial);
            plane.position.set(x, -1, z);
            plane.rotation.x = Math.PI / 2;


            scene.add(plane);
            sceneManager.addObject(plane);

            // 📌 4️⃣ Add trees if present
            if (data.tree) {
                const tree = createTreeObject(data, veg, x, z);
                scene.add(tree);
                treesObjects.push(tree);
                sceneManager.addObject(tree);
            }

            // 📌 5️⃣ Add cliffs (impassable objects)
            if (data.impassable) {
                const cliff = createImpassableBox(data, x, z);
                // cliff.position.set(x, 0.5, z);
                cliff.castShadow = true;
                cliff.receiveShadow = true;
                scene.add(cliff);
                sceneManager.addObject(cliff);
            }
        }
    }
    const ground = addGround(veg);
    ground.castShadow = true;
    ground.receiveShadow = true;
    scene.add(ground);
    sceneManager.addObject(ground);
}


function createTreeObject(data, veg, x, z) {
    const randomness = Math.floor(Math.random() * 10) + 1;
    const textureLoader = new THREE.TextureLoader();
    
    const texture = textureLoader.load(`/Art/Vegetation/Sprites/${veg}/${data.tree}/${randomness}.png`);
    
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.y = -1;

    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;

    let aspectRatio = 1;
    texture.onload = () => {
        aspectRatio = texture.image.width / texture.image.height;
    };

    let planeWidth = (data.tree === 'Big') ? 3 : 0.5;
    const geometry = new THREE.PlaneGeometry(planeWidth, planeWidth / aspectRatio);
    geometry.rotateX(Math.PI); // Flip to make it face the right way

    const material = new THREE.MeshStandardMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: true,
        alphaTest: 0.5
    });

    // Define the number of instances (change if placing multiple trees)
    const count = 1;  
    const treePlane = new THREE.InstancedMesh(geometry, material, count);

    treePlane.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // Allow dynamic updates

    // Set the transformation matrix for the instance
    const matrix = new THREE.Matrix4();
    matrix.setPosition(x, data.tree === 'Big' ? 1.5 : 0.25, z);
    matrix.multiply(new THREE.Matrix4().makeRotationY(Math.PI)); // Apply Y rotation
    treePlane.setMatrixAt(0, matrix);

    treePlane.instanceMatrix.needsUpdate = true; // Apply changes

    return treePlane;
}


  




function createImpassableBox(data, x, z) {
    const textureLoader = new THREE.TextureLoader();

    // Load the textures
    const diffuseTexture = textureLoader.load('/Art/Textures/cliffs/old/montane.png');
    // const normalTexture = textureLoader.load('/Art/Textures/new/norm.png');
    // const specularTexture = textureLoader.load('/Art/Textures/new/spec.png');

    diffuseTexture.minFilter = THREE.NearestFilter;
    diffuseTexture.magFilter = THREE.NearestFilter;

    const material = new THREE.MeshStandardMaterial({
        map: diffuseTexture,
        // normalMap: normalTexture,
        // roughnessMap: specularTexture,
        roughness: 1,
        transparent: true
    });

    const geometry = new THREE.BoxGeometry(1, 1, 1);

    // Define the number of instances (e.g., 1 if only one box is created)


    // Create the instanced mesh
    const box = new THREE.InstancedMesh(geometry, material, 1);

    box.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // Enable dynamic updates

    // Set the transformation matrix for the instance
    const matrix = new THREE.Matrix4();
    matrix.setPosition(x, 0.5, z); // Adjust position as needed
    box.setMatrixAt(0, matrix);
    
    box.instanceMatrix.needsUpdate = true; // Update the matrix

    box.receiveShadow = true;
    box.castShadow = true;
    box.userData.isImpassable = true; 

    impassableObjects.push(box);

    return box;
}

window.createMapGrid = createMapGrid;
window.animate = animate;
window.scene = scene;