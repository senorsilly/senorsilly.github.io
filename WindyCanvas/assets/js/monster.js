// monster.js
import { maps, getCurrentMapId, exploredMaps, isTilePassable, isTileVisible, getMapWidth, getMapHeight } from './map.js';
import { playerX, playerY, playerHP } from './player.js';
import { showDamageMessage, updateInfoOverlay, showInventoryMessage } from './ui.js';
import { addItemToInventory } from './inventory.js';
import { getCurrentLevel, loadImage, ctx, tileSize, cameraX, cameraY } from './game.js';
import { playSoundEffect } from './audio.js'
import { canSeeHiddenMonsters } from './spells.js'
import { findPathAStar } from './astarpathing.js'
import { Item } from './items.js'
class Monster {
    constructor(x, y, level, typeData, drops = []) {
        this.x = x;
        this.y = y;
        this.level = level;
        this.type = typeData; // Store the entire type object
        this.hp = Math.floor(typeData.hp * (1 + (level - 1) * typeData.levelScale));
        this.maxHp = this.hp;
        this.damage = typeData.damage;
        this.attackSpeed = typeData.attackSpeed;
        this.movementSpeed = typeData.movementSpeed;
        this.drops = this.processDrops(typeData.drops); // Process potential drops
        this.frame = 0;
        this.frameCounter = 0;
        this.path = [];
        this.pathIndex = 0;
        this.pathUpdateTimer = 0;
        this.pathUpdateInterval = 500;
        this.image = typeData.image;
    }

    processDrops(dropData) {
        const actualDrops = [];
        for (const drop of dropData) {
            if (Math.random() < drop.chance) {
                const quantity = this.rollDice(drop.quantity);
                for (let i = 0; i < quantity; i++) {
                    actualDrops.push(new Item(drop.item, getItemData(drop.item))); // Assuming getItemData function exists
                }
            }
        }
        return actualDrops;
    }

    rollDice(diceNotation) {
        //console.log(diceNotation);
        const parts = diceNotation.split('d');
        if (parts.length === 2) {
            const numDice = parseInt(parts[0]);
            const sidesAndModifier = parts[1].split('+');
            const numSides = parseInt(sidesAndModifier[0]);
            const modifier = sidesAndModifier.length > 1 ? parseInt(sidesAndModifier[1]) : 0;
            let total = modifier;
            for (let i = 0; i < numDice; i++) {
                total += Math.floor(Math.random() * numSides) + 1;
            }
            return total;
        } else if (!isNaN(parseInt(diceNotation))) {
            return parseInt(diceNotation);
        }
        return 1; // Default to 1 if notation is invalid
    }

    checkSight(playerX, playerY) {
        const dx = Math.abs(this.x - playerX);
        const dy = Math.abs(this.y - playerY);
        return dx <= 5 && dy <= 5;
    }

    moveTowardsPlayer(playerX, playerY, maps, deltaTime) {
        const currentLevelMap = maps[getCurrentMapId()];

        this.pathUpdateTimer += deltaTime * 1000;
        const occupiedMonsterTiles = getOccupiedMonsterTiles(this); // Exclude the current monster
        if (this.pathUpdateTimer > this.pathUpdateInterval) {
            this.path = findPathAStar(this.x, this.y, playerX, playerY, currentLevelMap);
            this.pathIndex = 0;
            this.pathUpdateTimer = 0;
        }

        if (this.path && this.path.length > this.pathIndex) {
            const nextStep = this.path[this.pathIndex];
            const nextTileKey = `${nextStep.x},${nextStep.y}`;

            // Check if the next step is occupied by another monster
            if (occupiedMonsterTiles.has(nextTileKey)) {
                // Optionally, try to find an alternative path or stop
                this.pathIndex++; // Try the next step in the current path
                if (this.pathIndex >= this.path.length) {
                    this.path = []; // No more steps in the current path
                }
            } else if (nextStep.x === playerX && nextStep.y === playerY) {
                this.path = []; // Stop before overlapping with the player
            } else {
                this.x = nextStep.x;
                this.y = nextStep.y;
                this.pathIndex++;
                playSoundEffect('monsterMove');
            }
        } else {
            // If no path or path is exhausted, fall back to simpler movement
            // (You can remove this if you only want A* movement)
            let dx = playerX - this.x;
            let dy = playerY - this.y;

            if (Math.abs(dx) > Math.abs(dy)) {
                let newX = this.x + (dx > 0 ? 1 : -1);
                if (currentLevelMap[this.y] && currentLevelMap[this.y][newX] === '.' && !(newX === playerX && this.y === playerY)) {
                    this.x = newX;
                }
            } else {
                let newY = this.y + (dy > 0 ? 1 : -1);
                if (currentLevelMap[newY] && currentLevelMap[newY][this.x] === '.' && !(this.x === playerX && newY === playerY)) {
                    this.y = newY;
                }
            }
            playSoundEffect('monsterMove');
        }
    }
}

function getItemData(itemId) {
    // Your function to retrieve full item details based on the ID
    // (e.g., from your equipmentData or a similar item database)
    switch (itemId) {
        case 'gold_coin': return { name: 'Gold Coin', type: 'currency', description: 'A shiny gold coin.', weight: 0.01, bulk: 0.01, icon: 'assets/img/items/gold_coin.png' };
        case 'rusty_dagger': return { name: 'Rusty Dagger', type: 'weapon', slot: 'hand', description: 'A worn, rusty dagger.', weight: 2, bulk: 1, icon: 'assets/img/items/dagger_rusty.png', damage: '1d3' };
        case 'iron_axe': return { name: 'Iron Axe', type: 'weapon', slot: 'hand', description: 'A sturdy iron axe.', weight: 7, bulk: 3, icon: 'assets/img/items/axe_iron.png', damage: '1d6 + 1' };
        case 'health_potion_minor': return { name: 'Minor Health Potion', type: 'potion', description: 'Restores a small amount of health.', weight: 0.5, bulk: 0.5, icon: 'assets/img/items/potion_health_minor.png', effect: (target) => target.hp = Math.min(target.maxHp, target.hp + 15) };
        case 'healing_herb': return { name: 'Healing Herb', type: 'resource', description: 'A herb with medicinal properties.', weight: 0.2, bulk: 0.1, icon: 'assets/img/tiles/herb.png' };
        case 'troll_hide': return { name: 'Troll Hide', type: 'resource', description: 'Thick, leathery troll hide.', weight: 4, bulk: 2, icon: 'assets/img/tiles/troll_hide.png' };
        case 'large_club': return { name: 'Large Club', type: 'weapon', slot: 'hand', description: 'A heavy wooden club.', weight: 8, bulk: 4, icon: 'assets/img/items/club_large.png', damage: '1d8' };
        default: return { name: 'Unknown Item', type: 'misc', description: 'An unidentified item.', weight: 1, bulk: 1, icon: 'assets/img/items/unknown.png' };
    }
}

let monsters = [];
const monsterFrameRate = 30;
function getNeighbors(x, y, mapData, occupiedMonsterTiles) {
    const neighbors = [];
    const possibleNeighbors = [
        { dx: 0, dy: -1 }, // Up
        { dx: 0, dy: 1 },  // Down
        { dx: -1, dy: 0 }, // Left
        { dx: 1, dy: 0 }   // Right
    ];

    for (const move of possibleNeighbors) {
        const newX = x + move.dx;
        const newY = y + move.dy;
        const tileKey = `${newX},${newY}`;

        if (
            newY >= 0 &&
            newY < mapData.length &&
            newX >= 0 &&
            newX < mapData[0].length &&
            mapData[newY][newX] === '.' && // Only move to floor tiles
            !occupiedMonsterTiles.has(tileKey) // Check if the tile is occupied by another monster
        ) {
            neighbors.push({ x: newX, y: newY });
        }
    }

    return neighbors;
}
function getOccupiedMonsterTiles(excludeMonster = null) {
    const occupiedTiles = new Set();
    monsters.forEach(entity => {
        if (entity && entity !== excludeMonster) {
            occupiedTiles.add(`${entity.x},${entity.y}`);
        }
    });
    return occupiedTiles;
}
function updateMonsterFrames() {
    monsters.forEach(monster => {
        monster.frameCounter++;
        if (monster.frameCounter >= monsterFrameRate) {
            monster.frame = (monster.frame + 1) % 2; // Cycle between 0 and 1
            monster.frameCounter = 0;
        }
    });
}

function updateMonsters(deltaTime) {
    monsterRegenTimer += deltaTime * 1000;
    let currentMapMonsters = monsters.filter(monster => monster.level === getCurrentLevel());
    //console.log(`${currentMapMonsters.length} monsters on level`);
    if (monsterRegenTimer >= monsterRegenInterval && currentMapMonsters.length < (monsterCapPerLevel[getCurrentLevel()] || 30)) {
        spawnNewMonster(maps[getCurrentMapId()],getCurrentLevel());
        monsterRegenTimer = 0;
    }

    //for (let i = monsters.length - 1; i >= 0; i--) {
    //    let monster = monsters[i];
    //    if (monster.level === getCurrentLevel() && checkSight(playerX,playerY)) {
    //        monster.moveTowardsPlayer();
    //        // Add any other monster update logic here
    //    }
    //}
    //setIsPlayerTurn(true);
}

function renderMonsters() {
    // Render monsters
    monsters.filter(m => m.level === getCurrentLevel()).forEach(monster => {
        //let imagePath = `assets/img/sprites/${monster.type}${monster.frame}.png`; // Use monster type
        let imagePath = monster.image;
        let image = loadImage(imagePath);
        if (image) {
            if (isTileVisible(monster.x, monster.y) || canSeeHiddenMonsters) {
                ctx.drawImage(
                    image,
                    monster.x * tileSize - cameraX,
                    monster.y * tileSize - cameraY,
                    tileSize,
                    tileSize
                );
            } else if (exploredMaps[getCurrentMapId()] && exploredMaps[getCurrentMapId()][monster.y] && exploredMaps[getCurrentMapId()][monster.y][monster.x] && exploredMaps[getCurrentMapId()][monster.y][monster.x].seen) {
                // Optionally draw a faint marker for seen monsters in debug mode
                ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
                ctx.fillRect(monster.x * tileSize - cameraX, monster.y * tileSize - cameraY, tileSize, tileSize);
            }
            
        } else {
            console.log('Could not load ' + imagePath);
        }
    });
}

function removeDeadMonsters() {
    monsters = monsters.filter(m => m.hp > 0);
}
function getMonsterTypes() {
    return [
        {
            id: 'goblin',
            name: 'Goblin',
            image: 'assets/img/sprites/goblin_new.png',
            hp: 15,
            damage: '1d4',
            attackSpeed: 1.2, // Attacks per second
            movementSpeed: 0.8, // Multiplier for base movement speed
            drops: [
                { item: 'gold_coin', chance: 0.5, quantity: '1d3' },
                { item: 'rusty_dagger', chance: 0.2, quantity: '1d2' }
            ],
            levelScale: 0.8 // Multiplier applied based on level
        },
        {
            id: 'orc_warrior',
            name: 'Orc Warrior',
            image: 'assets/img/sprites/orc_warrior_new.png',
            hp: 30,
            damage: '1d8 + 1',
            attackSpeed: 0.9,
            movementSpeed: 0.95,
            drops: [
                { item: 'gold_coin', chance: 0.7, quantity: '2d4' },
                { item: 'iron_axe', chance: 0.3, quantity: '1d2' },
                { item: 'health_potion_minor', chance: 0.1, quantity: '1d2' }
            ],
            levelScale: 1.1
        },
        {
            id: 'troll',
            name: 'Troll',
            image: 'assets/img/sprites/troll.png',
            hp: 60,
            damage: '1d10 + 2',
            attackSpeed: 0.7,
            movementSpeed: 0.7,
            drops: [
                { item: 'gold_coin', chance: 0.9, quantity: '3d6' },
                { item: 'large_club', chance: 0.4, quantity: '1d2' },
                { item: 'healing_herb', chance: 0.5, quantity: '1d2' },
                { item: 'troll_hide', chance: 0.2, quantity: '1d2' }
            ],
            levelScale: 1.3
        },
        // ... more monster types ...
    ];
}

const monsterCapPerLevel = {
    0: 50,
    1: 75,
    2: 100,
    // ... other levels
};
const monsterRegenInterval = 5000; // Regenerate every 5 seconds
let monsterRegenTimer = 0;

function spawnNewMonster(map, levelNumber) {
    let currentMap;
    if (map) {
        currentMap = map
    } else {
        currentMap = maps[getCurrentMapId()];
    }
    //console.log(currentMap);
    const width = currentMap[0].length;
    const height = currentMap.length;
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
        const spawnX = Math.floor(Math.random() * width);
        const spawnY = Math.floor(Math.random() * height);

        if (isTilePassable(currentMap[spawnY][spawnX]) && !isTileOccupiedByPlayer(spawnX, spawnY) && !isTileOccupiedByMonster(spawnX, spawnY)) {
            const monsterTypes = getMonsterTypes();
            const monsterTypeData = monsterTypes[Math.floor(Math.random() * monsterTypes.length)];
            const newMonster = new Monster(spawnX, spawnY, levelNumber, monsterTypeData); // Level scales with map ID for simplicity
            monsters.push(newMonster);
            //console.log(`Spawned a new ${monsterTypeData.name} at (${spawnX}, ${spawnY}) on level ${levelNumber}`);
            return;
        }
        attempts++;
    }
    console.warn(`Failed to find a valid spawn point after ${maxAttempts} attempts on level ${getCurrentMapId()}`);
}

function isTileOccupiedByPlayer(x, y) {
    return playerX === x && playerY === y;
}

function isTileOccupiedByMonster(x, y) {
    return monsters.some(monster => monster.x === x && monster.y === y && monster.level === getCurrentLevel());
}

export { spawnNewMonster, updateMonsters, monsters, Monster, renderMonsters, removeDeadMonsters, getMonsterTypes, updateMonsterFrames };