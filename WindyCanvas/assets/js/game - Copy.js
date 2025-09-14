let isPlayerTurn = true;
let currentLevel = 0;
let playerX = 1;
let playerY = 1;
let tileSize = 32;

let playerDirection = 'fr'; // Initial direction
let spellDirection = 'fr';
let playerFrame = 1; // Initial frame
let playerFrameRate = 2;
let playerFrameCounter = 0;
let imageCache = {};
let tileImageCache = {}; // Cache for tile images


const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let cameraX = 0;
let cameraY = 0;
let viewportWidth = window.innerWidth-40;
let viewportHeight = window.innerHeight-40;

// Set canvas dimensions
canvas.width = viewportWidth;
canvas.height = viewportHeight

let connectionPoints = {};// ... (your connection points)

const infoOverlay = document.getElementById('infoOverlay');
const currentLevelDisplay = document.getElementById('currentLevelDisplay');
const toggleOverlayPosition = document.getElementById('toggleOverlayPosition');
const infoDetails = document.getElementById('infoDetails');
const damageMessages = document.getElementById('damageMessages');
const inventoryMessages = document.getElementById('inventoryMessages'); 
const showInventoryModal = document.getElementById('showInventoryModal');

let playerHP = 100;
let playerDamage = 10;

class Item {
    constructor(name, type, description, weight, bulk) {
        this.name = name;
        this.type = type;
        this.description = description;
        this.weight = weight;
        this.bulk = bulk;
    }
}

let inventory = [];
inventory.push(new Item("Health Potion", "Potion", "Restores 20 HP", 2, 1));

function addItemToInventory(item) {
    inventory.push(item);
    updateInventoryDisplay();
}

function removeItemFromInventory(item) {
    const index = inventory.indexOf(item);
    if (index !== -1) {
        inventory.splice(index, 1);
        updateInventoryDisplay();
    }
}

function updateInventoryDisplay() {
    const inventoryDiv = document.getElementById('inventoryItems');
    if (inventoryDiv) {
        inventoryDiv.innerHTML = 'Inventory:<br>';
        if (inventory.length > 0) {
            inventory.forEach(item => {
                let itemDisplay = `${item.name} (${item.type})`;
                if (item.type === 'Potion' && item.name === 'Health Potion') {
                    itemDisplay += `<button onclick="useItem('${item.name}')">Use</button>`;
                }
                inventoryDiv.innerHTML += itemDisplay + '<br>';
            });
        } else {
            inventoryDiv.innerHTML += 'None';
        }
    }
}
function useItem(itemName) {
    const itemIndex = inventory.findIndex(item => item.name === itemName);
    if (itemIndex !== -1) {
        const item = inventory[itemIndex];
        if (item.type === 'Potion' && item.name === 'Health Potion') {
            playerHP += 20; // Restore 20 HP
            if (playerHP > 100) {
                playerHP = 100;
            }
            removeItemFromInventory(item);
            updateInfoOverlay();
        }
    }
}
class Monster {
    constructor(x, y, hp, damage, level, drops = []) {
        this.x = x;
        this.y = y;
        this.hp = hp;
        this.damage = damage;
        this.level = level;
        this.drops = drops;
    }

    checkSight(playerX, playerY) {
        const dx = Math.abs(this.x - playerX);
        const dy = Math.abs(this.y - playerY);
        return dx <= 5 && dy <= 5;
    }

    moveTowardsPlayer(playerX, playerY, levels, mapWidth, mapHeight) {
        let dx = playerX - this.x;
        let dy = playerY - this.y;

        let moveX = 0;
        let moveY = 0;

        if (Math.abs(dx) > Math.abs(dy)) {
            moveX = dx > 0 ? 1 : -1;
            if (Math.abs(dy) > 0) {
                moveY = dy > 0 ? 1 : -1;
            }
        } else if (Math.abs(dx) < Math.abs(dy)) {
            moveY = dy > 0 ? 1 : -1;
            if (Math.abs(dx) > 0) {
                moveX = dx > 0 ? 1 : -1;
            }
        } else {
            moveX = dx > 0 ? 1 : -1;
            moveY = dy > 0 ? 1 : -1;
        }

        const newX = this.x + moveX;
        const newY = this.y + moveY;

        // Prevent moving onto player's tile
        if (newX === playerX && newY === playerY) {
            return;
        }

        if (newX >= 0 && newX < mapWidth && newY >= 0 && newY < mapHeight && levels[currentLevel][newY][newX] !== '#') {
            this.x = newX;
            this.y = newY;
        }
    }
}

let monsters = [];

class Spell {
    constructor(x, y, direction, damage) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.damage = damage;
    }
}

let spells = [];
let spellImage = new Image();
spellImage.src = 'assets/img/sprites/flame_0.png';

function updateInfoOverlay() {
    currentLevelDisplay.textContent = currentLevel + 1;
    const levelText = `Level: ${currentLevel + 1}, HP: ${playerHP}`;
    infoDetails.innerHTML = levelText;
}

function showDamageMessage(damage, x, y) {
    const message = document.createElement('span');
    message.textContent = damage;
    message.style.position = 'absolute';
    message.style.left = `${x * tileSize - cameraX}px`;
    message.style.top = `${y * tileSize - cameraY}px`;
    message.style.color = 'red';
    message.style.fontSize = '20px';
    message.style.pointerEvents = 'none'; // Prevent interaction

    damageMessages.appendChild(message);

    // Remove the message after a short delay
    setTimeout(() => {
        damageMessages.removeChild(message);
    }, 1000); // 1 second delay
}

function showInventoryMessage(messageDetails, x, y) {
    const message = document.createElement('span');
    message.textContent = messageDetails;
    message.style.position = 'absolute';
    message.style.left = `${x * tileSize - cameraX}px`;
    message.style.top = `${y * tileSize - cameraY - 30}px`;
    message.style.color = 'gray';
    message.style.fontSize = '20px';
    message.style.pointerEvents = 'none'; // Prevent interaction
    message.style.width = '200px';

    inventoryMessages.appendChild(message);

    // Remove the message after a short delay
    setTimeout(() => {
        inventoryMessages.removeChild(message);
    }, 1000); // 1 second delay
}
function generateHugeMap(width, height, levelNumber) {
    let map = [];
    for (let y = 0; y < height; y++) {
        let row = [];
        for (let x = 0; x < width; x++) {
            if (Math.random() < 0.2) {
                row.push('#');
            } else {
                row.push('.');
            }
        }
        map.push(row);
    }

    // Add stairs for testing level transitions
    let stairsX = Math.floor(Math.random() * width);
    let stairsY = Math.floor(Math.random() * height);
    if (levelNumber === 0) {
        map[stairsY][stairsX] = '>';
        connectionPoints['>'] = { level: 1, x: 0, y: 0 };
    } else if (levelNumber === 1) {
        map[stairsY][stairsX] = '<';
        connectionPoints['<'] = { level: 0, x: 0, y: 0 };
        let downStairsX = Math.floor(Math.random() * width);
        let downStairsY = Math.floor(Math.random() * height);
        map[downStairsY][downStairsX] = '>';
        connectionPoints['>'] = { level: 2, x: 0, y: 0 };
    } else if (levelNumber === 2) {
        map[stairsY][stairsX] = '<';
        connectionPoints['<'] = { level: 1, x: 0, y: 0 };
    }

    // Add monsters
    //monsters = [];
    for (let i = 0; i < 15; i++) {
        let attempts = 0;
        while (attempts < 100) { // Prevent infinite loops
            let monsterX = Math.floor(Math.random() * width); // Ensure integer coordinates
            let monsterY = Math.floor(Math.random() * height); // Ensure integer coordinates
            //console.log(`Trying to place monster at: (${monsterX}, ${monsterY}), Tile: ${map[monsterY][monsterX]}`);

            if (map[monsterY][monsterX] === '.') { // Check for floor tile
                let monsterDrops = [];
                if (Math.random() < 0.7) {
                    monsterDrops.push(new Item("Health Potion", "Potion", "Restores 20 HP", 2, 1));
                }
                monsters.push(new Monster(monsterX, monsterY, 20, 5, levelNumber, monsterDrops));
                //console.log(`Monster placed at: (${monsterX}, ${monsterY})`);
                break; // Monster placed, exit loop
            }
            attempts++;
        }
    }

    return map;
}

//Dynamically generate maps.
let levels = [
    generateHugeMap(100, 100, 0),
    generateHugeMap(30, 30, 1),
    generateHugeMap(30, 30, 2)
];

// Set map dimensions based on the current level.
let mapWidth = levels[currentLevel][0].length;
let mapHeight = levels[currentLevel].length;

function gameLoop() {
    updateGame();
    requestAnimationFrame(gameLoop);
}
function handleInput(event) {
    if (isPlayerTurn) {
        let newX = playerX;
        let newY = playerY;
        let attackX = playerX;
        let attackY = playerY;

        switch (event.key) {
            case 'i':
                toggleInventoryDisplay();
                break;
            case 'w':
                newY--;
                playerDirection = 'bk';
                spellDirection = 'bk';
                break;
            case 's':
                newY++;
                playerDirection = 'fr';
                spellDirection = 'fr';
                break;
            case 'a':
                newX--;
                playerDirection = 'lf';
                spellDirection = 'lf';
                break;
            case 'd':
                newX++;
                playerDirection = 'rt';
                spellDirection = 'rt';
                break;
            case 'q': // Diagonal up-left
                newX--;
                newY--;
                playerDirection = 'lf'; // Up-left
                spellDirection = 'ul';
                break;
            case 'e': // Diagonal up-right
                newX++;
                newY--;
                playerDirection = 'rt'; // Up-right
                spellDirection = 'ur';
                break;
            case 'z': // Diagonal down-left
                newX--;
                newY++;
                playerDirection = 'lf'; // Down-left
                spellDirection = 'dl';
                break;
            case 'c': // Diagonal down-right
                newX++;
                newY++;
                playerDirection = 'rt'; // Down-right
                spellDirection = 'dr';
                break;
            case ' ': // Spacebar for attack
                // Create spell
                spells.push(new Spell(playerX, playerY, spellDirection, playerDamage));
                break;
            default:
                return;
        }

        //Monster collision, trigger attack check
        var attacked = false;
        monsters.filter(m => m.level === currentLevel && m.x === newX && m.y === newY).forEach(monster => {
            if (monster) {
                // Combat
                monster.hp -= playerDamage;
                playerHP -= monster.damage;

                // Add monster drops to inventory if dead
                if (monster.hp < 1) {
                    monster.drops.forEach(item => {
                        addItemToInventory(item);
                        //Update
                        updateInventoryDisplay();
                        showInventoryMessage(item.name, playerX, playerY);
                    });
                }


                // Show damage messages
                showDamageMessage(playerDamage, monster.x, monster.y);
                showDamageMessage(monster.damage, playerX, playerY);

                // Remove dead monsters
                monsters = monsters.filter(m => m.hp > 0);

                // Update info overlay
                updateInfoOverlay();

                attacked = true;
            }
        });
        if (attacked) {
            return;
        }
        
        // Bounds checking
        if (newX < 0 || newX >= mapWidth || newY < 0 || newY >= mapHeight) {
            return; // Prevent movement outside the map
        }

        // Collision detection
        if (levels[currentLevel][newY] && levels[currentLevel][newY][newX] === '#') {
            return; // Prevent movement into walls
        }

        // Update player position
        playerX = newX;
        playerY = newY;

        // Check for level change
        const tile = levels[currentLevel][playerY][playerX];
        if (connectionPoints[tile]) {
            changeLevel(tile);
        }

        isPlayerTurn = false;

        // Monster movement
        monsters.filter(m => m.level === currentLevel).forEach(monster => {
            if (monster.checkSight(playerX, playerY)) {
                monster.moveTowardsPlayer(playerX, playerY, levels, mapWidth, mapHeight);

                // Monster attack
                if (monster.x === playerX && monster.y === playerY) {
                    playerHP -= monster.damage;
                    showDamageMessage(monster.damage, playerX, playerY);
                    updateInfoOverlay();
                }
            }
        });

        updateGame();
    }
}

function changeLevel(tile) {
    let destinationLevel = currentLevel;
    if (tile === '>') {
        destinationLevel++;
    } else if (tile === '<') {
        destinationLevel--;
    }

    if (destinationLevel < 0 || destinationLevel >= levels.length) {
        console.error("Invalid level transition");
        return;
    }

    currentLevel = destinationLevel;

    // Find the corresponding entrance/stairs on the new level
    let destinationTile = '';
    if (tile === '>') {
        destinationTile = '<';
    } else if (tile === '<') {
        destinationTile = '>';
    }

    // Find the coordinates of the destination tile
    let destinationX = -1;
    let destinationY = -1;
    const destinationLevelMap = levels[currentLevel];

    for (let y = 0; y < destinationLevelMap.length; y++) {
        for (let x = 0; x < destinationLevelMap[y].length; x++) {
            if (destinationLevelMap[y][x] === destinationTile) {
                destinationX = x;
                destinationY = y;
                break;
            }
        }
        if (destinationX !== -1) {
            break;
        }
    }

    if (destinationX !== -1 && destinationY !== -1) {
        playerX = destinationX;
        playerY = destinationY;
    } else {
        // Handle error if destination tile is not found
        console.error(`Destination tile '${destinationTile}' not found on level ${currentLevel}`);
    }

    //Update map width and height.
    mapWidth = levels[currentLevel][0].length;
    mapHeight = levels[currentLevel].length;

    updateInfoOverlay();
    renderLevel();
}

function updateCamera() {
    // Center the camera on the player
    cameraX = playerX * tileSize - viewportWidth / 2;
    cameraY = playerY * tileSize - viewportHeight / 2;

    // Keep the camera within the map bounds
    cameraX = Math.max(0, Math.min(cameraX, mapWidth * tileSize - viewportWidth));
    cameraY = Math.max(0, Math.min(cameraY, mapHeight * tileSize - viewportHeight));
}
function updateGame() {
    playerFrameCounter++;
    if (playerFrameCounter >= 60 / playerFrameRate) {
        playerFrameCounter = 0;
        //playerFrame = (playerFrame + 1) % 4; //Cycle through 4 frames.
        playerFrame = playerFrame === 1 ? 2 : 1; // Toggle between 1 and 2
    }

    updateSpells();
    updateCamera();
    renderLevel();
    updateInfoOverlay();
    isPlayerTurn = true;
}
function updateSpells(){
    // Update spells
    spells.forEach((spell, index) => {
        switch (spell.direction) {
            case 'bk':
                spell.y--;
                break;
            case 'fr':
                spell.y++;
                break;
            case 'lf':
                spell.x--;
                break;
            case 'rt':
                spell.x++;
                break;
            case 'ul':
                spell.x--;
                spell.y--;
                break;
            case 'ur':
                spell.x++;
                spell.y--;
                break;
            case 'dl':
                spell.x--;
                spell.y++;
                break;
            case 'dr':
                spell.x++;
                spell.y++;
                break;
        }

        // Collision detection
        if (levels[currentLevel][spell.y] && levels[currentLevel][spell.y][spell.x] === '#') {
            spells.splice(index, 1); // Remove spell on wall collision
            return;
        }

        // Monster collision
        let monster = monsters.find(m => m.x === spell.x && m.y === spell.y && m.level == currentLevel);
        if (monster) {
            monster.hp -= spell.damage;
            showDamageMessage(spell.damage, monster.x, monster.y);
            monsters = monsters.filter(m => m.hp > 0);
            spells.splice(index, 1); // Remove spell on monster collision
            return;
        }

        // Off-screen check
        if (spell.x < 0 || spell.x >= mapWidth || spell.y < 0 || spell.y >= mapHeight) {
            spells.splice(index, 1); // Remove spell if off-screen
        }
    });
}

function showInventory(items) {
    const inventoryDiv = document.getElementById('inventoryItems');
    document.getElementById('inventoryModal').style.display = 'block';
}

function closeInventory() {
    document.getElementById('inventoryModal').style.display = 'none';
}

function drawTile(x, y, tile, camX, camY) {
    let imagePath = '';

    switch (tile) {
        case '#':
            imagePath = 'wall_vines_0.png';
            break;
        case '.':
            imagePath = 'grass_0_new.png';
            break;
        case '>':
            imagePath = 'stone_stairs_down.png';
            break;
        case '<':
            imagePath = 'stone_stairs_up.png';
            break;
        default:
            return; // Skip drawing for unknown tiles
    }

    imagePath = 'assets/img/tiles/' + imagePath;

    if (tileImageCache[imagePath]) {
        // Image is cached, draw it directly
        ctx.drawImage(
            tileImageCache[imagePath],
            x * tileSize - camX,
            y * tileSize - camY,
            tileSize,
            tileSize
        );
    } else {
        // Image is not cached, load and cache it
        let tileImage = new Image();
        tileImage.src = imagePath;

        tileImage.onload = function () {
            tileImageCache[imagePath] = tileImage;
            ctx.drawImage(
                tileImage,
                x * tileSize - camX,
                y * tileSize - camY,
                tileSize,
                tileSize
            );
        };
    }
}

function renderPlayer() {
    let imagePath = `assets/img/sprites/amg1_${playerDirection}${playerFrame}.png`;

    if (imageCache[imagePath]) {
        ctx.drawImage(
            imageCache[imagePath],
            playerX * tileSize - cameraX,
            playerY * tileSize - cameraY,
            tileSize,
            tileSize
        );
    } else {
        let playerImage = new Image();
        playerImage.src = imagePath;

        playerImage.onload = function () {
            imageCache[imagePath] = playerImage;
            ctx.drawImage(
                playerImage,
                playerX * tileSize - cameraX,
                playerY * tileSize - cameraY,
                tileSize,
                tileSize
            );
        };
    }
}

function renderMonsters() {
    // Render monsters
    monsters.filter(m => m.level === currentLevel).forEach(monster => {
        let imagePath = `assets/img/sprites/goblin_new.png`;

        if (imageCache[imagePath]) {
            ctx.drawImage(
                imageCache[imagePath],
                monster.x * tileSize - cameraX,
                monster.y * tileSize - cameraY,
                tileSize,
                tileSize
            );
        } else {
            let monsterImage = new Image();
            monsterImage.src = imagePath;

            monsterImage.onload = function () {
                imageCache[imagePath] = monsterImage;
                ctx.drawImage(
                    monsterImage,
                    monster.x * tileSize - cameraX,
                    monster.y * tileSize - cameraY,
                    tileSize,
                    tileSize
                );
            };
        }
    });
}
function renderLevel() {
    const level = levels[currentLevel];

    // Calculate the visible portion of the map
    let startTileX = Math.floor(cameraX / tileSize);
    let startTileY = Math.floor(cameraY / tileSize);
    let endTileX = Math.ceil((cameraX + viewportWidth) / tileSize);
    let endTileY = Math.ceil((cameraY + viewportHeight) / tileSize);

    // Clear the canvas
    ctx.clearRect(0, 0, viewportWidth, viewportHeight);

    // Draw the visible tiles
    for (let y = startTileY; y < endTileY; y++) {
        for (let x = startTileX; x < endTileX; x++) {
            if (level[y] && level[y][x]) {
                drawTile(x, y, level[y][x], cameraX, cameraY);
            }
        }
    }

    renderSpells();
    renderPlayer();
    renderMonsters();
}

function renderSpells() {
    // Render spells
    spells.forEach(spell => {
        ctx.drawImage(
            spellImage,
            spell.x * tileSize - cameraX,
            spell.y * tileSize - cameraY,
            tileSize,
            tileSize
        );
    });
}


window.addEventListener('resize', () => {
    viewportWidth = window.innerWidth-40;
    viewportHeight = window.innerHeight-40;

    // Resize canvas
    canvas.width = viewportWidth;
    canvas.height = viewportHeight;

    renderLevel(); // Re-render the level to fill the new viewport
});

function toggleInventoryDisplay() {
    const inventoryDiv = document.getElementById('inventoryModal');
    if (inventoryDiv) {
        if (inventoryDiv.style.display === 'none' || inventoryDiv.style.display === '') {
            inventoryDiv.style.display = 'block';
            updateInventoryDisplay(); // Update display when showing
        } else {
            inventoryDiv.style.display = 'none';
        }
    }
}

//Event handlers
toggleOverlayPosition.addEventListener('click', () => {
    if (infoOverlay.style.top === '0px') {
        infoOverlay.style.top = '';
        infoOverlay.style.bottom = '0px';
    } else {
        infoOverlay.style.top = '0px';
        infoOverlay.style.bottom = '';
    }
});

showInventoryModal.addEventListener('click', () => {
    showInventory(inventory);
});

document.addEventListener('keydown', handleInput);
function startGame() {
    //Update map dimensions at the start.
    mapWidth = levels[currentLevel][0].length;
    mapHeight = levels[currentLevel].length;

    // Call updateInfoOverlay initially
    updateInfoOverlay();

    gameLoop();
    renderLevel(); // Initial render

    //Update inventory display
    updateInventoryDisplay();
}

startGame();