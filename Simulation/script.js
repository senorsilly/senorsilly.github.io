// --- Global Variables ---
let scene, camera, renderer, controls;
let isPaused = false;
let universes = []; // Array to hold all our universe data objects
let universeGroup; // A THREE.Group to hold all the universe meshes for easy management
const depth = 3; // The recursion depth for the sphere flake
const maxUniverses = 1000; // A safety limit to prevent performance issues
const universeExpansionRate = 0.001; // Rate at which universes expand
const starFormationRate = 0.0001; // Probability of a star forming per frame

// Raycasting for user interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let selectedUniverse = null; // New global variable to store the currently selected universe

// --- Data Structures ---
// A class to represent a single universe in the sphere flake
class Universe {
    constructor(id, threeMesh, initialRadius) {
        this.id = id;
        this.threeMesh = threeMesh;
        this.initialRadius = initialRadius;
        this.currentRadius = initialRadius;
        this.age = 0;
        this.physicalConstants = {
            gravity: Math.random() * 0.5 + 0.5, // Random value between 0.5 and 1.0
            hydrogenDensity: 0
        };
        this.stars = [];
    }
}

// A class to represent celestial objects like stars
class CelestialObject {
    constructor(id, type, position, threeMesh) {
        this.id = id;
        this.type = type; // e.g., 'star', 'planet'
        this.position = position;
        this.threeMesh = threeMesh;
    }
}

// --- Initialization Function ---
function init() {
    // 1. Scene Setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a); // Dark space background

    // 2. Camera Setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;

    // 3. Renderer Setup
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    const canvasContainer = document.getElementById('canvas-container');
    canvasContainer.appendChild(renderer.domElement);

    // 4. Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // 6. Create a group to hold all universe meshes
    universeGroup = new THREE.Group();
    scene.add(universeGroup);

    // 7. Generate the Sphere Flake
    generateSphereFlake(new THREE.Vector3(0, 0, 0), 1, depth);

    // 8. Event Listeners
    window.addEventListener('resize', onWindowResize);
    document.getElementById('pause-btn').addEventListener('click', () => {
        isPaused = !isPaused;
        document.getElementById('pause-btn').textContent = isPaused ? 'Resume' : 'Pause';
    });
    document.getElementById('reset-btn').addEventListener('click', resetSimulation);
    // Attach mousedown listener to the renderer's DOM element for accurate raycasting
    renderer.domElement.addEventListener('click', onMouseDown, false);

    // 9. Start the Animation Loop
    animate();
}

// --- Sphere Flake Generation Function (now creates Universe objects) ---
function generateSphereFlake(position, radius, currentDepth) {
    if (currentDepth <= 0 || universes.length > maxUniverses) {
        return;
    }

    // Create the Three.js mesh for the universe
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshLambertMaterial({ color: 0x8888ff, transparent: true, opacity: 0.8 });
    const universeMesh = new THREE.Mesh(geometry, material);
    universeMesh.position.copy(position);
    universeGroup.add(universeMesh); // Add mesh to the universe group

    // Create the simulation data object and link it to the mesh
    const universeData = new Universe(universes.length, universeMesh, radius);
    universes.push(universeData);

    const newRadius = radius / 3;
    const newPositions = [];

    // Positions for 6 spheres around the central one
    newPositions.push(
        new THREE.Vector3(position.x + radius + newRadius, position.y, position.z),
        new THREE.Vector3(position.x - radius - newRadius, position.y, position.z),
        new THREE.Vector3(position.x, position.y + radius + newRadius, position.z),
        new THREE.Vector3(position.x, position.y - radius - newRadius, position.z),
        new THREE.Vector3(position.x, position.y, position.z + radius + newRadius),
        new THREE.Vector3(position.x, position.y, position.z - radius - newRadius)
    );

    // Recursively generate children
    newPositions.forEach(newPos => {
        generateSphereFlake(newPos, newRadius, currentDepth - 1);
    });
}

// --- Main Simulation Update Logic ---
function simulationUpdate() {
    let totalStars = 0;
    
    // Scale the entire group to make all spheres expand together
    universeGroup.scale.setScalar(1 + (universes[0].age * universeExpansionRate));

    // Update each universe's state
    universes.forEach(universe => {
        // 1. Universe Expansion (based on age)
        universe.age += 1;
        
        // 2. Hydrogen Density (increases with age)
        universe.physicalConstants.hydrogenDensity = Math.min(1.0, universe.age / 1000);

        // 3. Star Formation (probabilistic based on hydrogen density and gravity)
        const formationChance = starFormationRate * universe.physicalConstants.hydrogenDensity * universe.physicalConstants.gravity;
        
        if (Math.random() < formationChance) {
            // Create a new star
            const starGeometry = new THREE.SphereGeometry(0.05, 16, 16);
            const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
            const starMesh = new THREE.Mesh(starGeometry, starMaterial);

            // Position the star randomly within the universe's bounds
            const starPosition = new THREE.Vector3(
                (Math.random() - 0.5) * universe.threeMesh.geometry.parameters.radius * 2,
                (Math.random() - 0.5) * universe.threeMesh.geometry.parameters.radius * 2,
                (Math.random() - 0.5) * universe.threeMesh.geometry.parameters.radius * 2
            );

            starMesh.position.copy(starPosition);
            universe.threeMesh.add(starMesh); // Add the star to the universe's mesh group

            const newStar = new CelestialObject(universe.stars.length, 'star', starPosition, starMesh);
            universe.stars.push(newStar);
        }

        totalStars += universe.stars.length;
    });

    // Update the stats display
    document.getElementById('stats-display').innerHTML = `
        <p>Total Universes: ${universes.length}</p>
        <p>Total Stars: ${totalStars}</p>
    `;

    // New logic: Check for a selected universe and update details in real-time
    if (selectedUniverse) {
        document.getElementById('universe-details').innerHTML = `
            <h2>Universe Details</h2>
            <p><strong>ID:</strong> ${selectedUniverse.id}</p>
            <p><strong>Age:</strong> ${selectedUniverse.age} frames</p>
            <p><strong>Current Radius:</strong> ${(selectedUniverse.initialRadius * universeGroup.scale.x).toFixed(2)}</p>
            <p><strong>Gravity:</strong> ${selectedUniverse.physicalConstants.gravity.toFixed(2)}</p>
            <p><strong>Hydrogen Density:</strong> ${selectedUniverse.physicalConstants.hydrogenDensity.toFixed(2)}</p>
            <p><strong>Number of Stars:</strong> ${selectedUniverse.stars.length}</p>
        `;
    }
}

// --- User Interaction with Raycasting ---
function onMouseDown(event) {
    // Normalize mouse position to [-1, 1] range for both axes
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Update the raycaster with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate intersections with all children of the universeGroup, recursively.
    // The 'true' flag ensures it checks children of children, which is necessary
    // because the entire group is being scaled.
    const intersects = raycaster.intersectObjects(universeGroup.children, true);

    if (intersects.length > 0) {
        // Find the corresponding universe data object for the clicked mesh
        const clickedMesh = intersects[0].object;
        selectedUniverse = universes.find(u => u.threeMesh === clickedMesh);
    } else {
        // If no universe is clicked, clear the selected universe
        selectedUniverse = null;
        document.getElementById('universe-details').innerHTML = ''; // Clear the display
    }
}

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);

    if (!isPaused) {
        simulationUpdate();
    }

    // Update controls and render the scene
    controls.update();
    renderer.render(scene, camera);
}

// --- Helper Functions ---
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function resetSimulation() {
    console.log("Resetting simulation...");
    // Dispose of all child meshes to prevent memory leaks
    if (universeGroup) {
        universeGroup.children.forEach(child => {
            if (child.isMesh) {
                child.geometry.dispose();
                child.material.dispose();
            }
        });
        scene.remove(universeGroup);
    }
    
    // Reset data
    universes = [];
    isPaused = false;
    selectedUniverse = null; // Also reset the selected universe
    document.getElementById('pause-btn').textContent = 'Pause';
    document.getElementById('universe-details').innerHTML = ''; // Clear the display
    
    // Re-create the universe group and the sphere flake
    universeGroup = new THREE.Group();
    scene.add(universeGroup);
    generateSphereFlake(new THREE.Vector3(0, 0, 0), 1, depth);

    console.log("Simulation reset complete.");
}

// --- Start the application ---
init();
