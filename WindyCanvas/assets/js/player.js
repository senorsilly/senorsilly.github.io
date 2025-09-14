// player.js
import { updateExploredMaps, maps, getMapType, getMapWidth, getMapHeight, changeMap, connectionPoints, getCurrentMapId, isTilePassable } from './map.js';
import { displayFloatingText, refreshMap, isDialogueOpen, startDialogue, restButton, showDamageMessage, updateInfoOverlay, showInventoryMessage } from './ui.js';
import { monsters, updateMonsters, removeDeadMonsters } from './monster.js';
import { castSpells, Spell, activeSpell, previousPlayerLocation } from './spells.js';
import { addItemToInventory, updateInventoryDisplay, inventory, useItem } from './inventory.js';
import { projectiles, getLastUpdateTime, setLastUpdateTime, loadImage, ctx, tileSize, cameraX, cameraY, isPlayerTurn, getCurrentLevel, getIsPlayerTurn, setIsPlayerTurn, updateGame } from './game.js';
import { getItem, getEquipment } from './items.js'
import { playSoundEffect } from './audio.js'
import { Projectile } from './projectiles.js'
import { npcs } from './npcs.js'
import { handleMonsterKilled, handleFirstNpcTalkedTo} from './achievements.js'

let autoExplore = false; // Add auto-explore mode toggle
let playerX = 1;
let playerY = 1;
let playerDirection = 'fr';
let playerFrame = 1;
let playerFrameRate = 120;
let playerFrameCounter = 0;
let playerHP = 100;
let maxPlayerHP = 150;
let playerMana = 100;
let playerMaxMana = 150;
let playerLevel = 1;
let playerDamage = 10;
let spellDirection = 'fr';
let playerAttack = 10;
let playerDefense = 10;

const healthRegenRate = 1.0; // Health points per second
const manaRegenRate = 1.0;   // Mana points per second

let isResting = false;
const restingRegenMultiplier = 3; // How much faster regeneration is while restin

let isHealingAuraActive = false;
let healingAuraStartTime = 0;

let player = {
    x: playerX,
    y: playerY,
    hp: playerHP,
    maxHp: maxPlayerHP,
    level: playerLevel,
    attack: playerAttack,
    defense: playerDefense,
    equipped: {
        weapon: null,
        armor: null,
        shield: null,
        helmet: null,
        gloves: null,
        boots: null,
        cloak: null,
        ring: null, // For a single ring slot initially
        amulet: null
    }
};

let visitedTiles = new Set();
let path = [];
let failedAttempts = 0;
const maxFailedAttempts = 100;
let previousMove = { x: 0, y: 0 };


function toggleAutoExplore() {
    autoExplore = !autoExplore;
}

// Add an array of resource tile types for easy checking
const resourceTileTypes = ['W', 'S', 'H', 'I', 'C', 'T', 'A', 'O', 'M', 'B', 'F', 'MC', 'MH', 'RS', 'SC', 'CL', 'FE', 'HI'];

function resourceGatherCheck(tile) {
    let currentMap = maps[getCurrentMapId()];

    if (tile === 'W') {
       addItemToInventory(getItem("Wood"));
        currentMap[playerY][playerX] = 'g';
        showInventoryMessage("Gathered Wood", playerX, playerY);
        return; // Stop auto-explore movement
    } else if (tile === 'S') {
        addItemToInventory(getItem("Stone"));
        currentMap[playerY][playerX] = 'g';
        showInventoryMessage("Gathered Stone", playerX, playerY);
        return;
    } else if (tile === 'H') {
        addItemToInventory(getItem("Herb"));
        currentMap[playerY][playerX] = 'g';
        showInventoryMessage("Gathered Herbs", playerX, playerY);
        return;
    } else if (tile === 'I') {
        addItemToInventory(getItem("Iron Ore"));
        currentMap[playerY][playerX] = 's';
        showInventoryMessage("Gathered Iron", playerX, playerY);
        return;
    } else if (tile === 'C') {
        addItemToInventory(getItem("Copper Ore"));
        currentMap[playerY][playerX] = 's';
        showInventoryMessage("Gathered Copper", playerX, playerY);
        return;
    } else if (tile === 'T') {
        addItemToInventory(getItem("Tin Ore"));
        currentMap[playerY][playerX] = 's';
        showInventoryMessage("Gathered Tin", playerX, playerY);
        return;
    } else if (tile === 'A') {
        addItemToInventory(getItem("Adamantine Ore"));
        currentMap[playerY][playerX] = 's';
        showInventoryMessage("Gathered Adamantine", playerX, playerY);
        return;
    } else if (tile === 'O') {
        addItemToInventory(getItem("Orichalcum Ore"));
        currentMap[playerY][playerX] = 's';
        showInventoryMessage("Gathered Orichalcum", playerX, playerY);
        return;
    } else if (tile === 'M') {
        addItemToInventory(getItem("Mithril Ore"));
        currentMap[playerY][playerX] = 's';
        showInventoryMessage("Gathered Mithril", playerX, playerY);
        return;
    } else if (tile === 'B') {
        addItemToInventory(getItem("Berries"));
        currentMap[playerY][playerX] = 'g';
        showInventoryMessage("Gathered Berries", playerX, playerY);
        return;
    } else if (tile === 'F') {
        addItemToInventory(getItem("Plant Fiber"));
        currentMap[playerY][playerX] = 'g';
        showInventoryMessage("Gathered Plant Fiber", playerX, playerY);
        return;
    } else if (tile === 'MC') {
        addItemToInventory(getItem("Common Mushroom"));
        currentMap[playerY][playerX] = 'g';
        showInventoryMessage("Gathered Common Mushroom", playerX, playerY);
        return;
    } else if (tile === 'MH') {
        addItemToInventory(getItem("Healing Mushroom"));
        currentMap[playerY][playerX] = 'g';
        showInventoryMessage("Gathered Healing Mushroom", playerX, playerY);
        return;
    } else if (tile === 'RS') {
        addItemToInventory(getItem("Resin"));
        currentMap[playerY][playerX] = 'g';
        showInventoryMessage("Gathered Resin", playerX, playerY);
        return;
    } else if (tile === 'SC') {
        addItemToInventory(getItem("Common Seeds"));
        currentMap[playerY][playerX] = 'g';
        showInventoryMessage("Gathered Common Seeds", playerX, playerY);
        return;
    } else if (tile === 'CL') {
        addItemToInventory(getItem("Clay"));
        currentMap[playerY][playerX] = 'g';
        showInventoryMessage("Gathered Clay", playerX, playerY);
        return;
    } else if (tile === 'FE') {
        addItemToInventory(getItem("Feather"));
        currentMap[playerY][playerX] = 'g';
        showInventoryMessage("Gathered Feather", playerX, playerY);
        return;
    } else if (tile === 'HI') {
        addItemToInventory(getItem("Animal Hide"));
        currentMap[playerY][playerX] = 'g';
        showInventoryMessage("Gathered Animal Hide", playerX, playerY);
        return;
    }
}
function autoExploreMove() {
    if (!autoExplore) return;

    let currentMap = maps[getCurrentMapId()];
    let tile = currentMap[playerY][playerX];

    // Resource gathering logic
    if (getMapType() === 'resource') {
        resourceGatherCheck(tile);
    }

    // Auto-heal logic
    if (playerHP < 50) {
        let healthPotion = inventory.find(item => item.name === "Health Potion");
        if (healthPotion) {
            useItem("Health Potion");
            return; // Stop auto-explore to heal
        }
    }

    // Prioritize attacking monsters
    for (let i = monsters.length - 1; i >= 0; i--) {
        let monster = monsters[i];
        if (monster.level === getCurrentLevel() && getCurrentMapId().indexOf("dungeon") > -1 && Math.abs(monster.x - playerX) <= 1 && Math.abs(monster.y - playerY) <= 1) {
            // Attack monster
            monster.hp -= playerDamage;
            showDamageMessage(playerDamage, monster.x, monster.y);
            playSoundEffect('swing');

            if (monster.hp <= 0) {
                // Monster dies
                monsters.splice(i, 1);
                showDamageMessage("Monster Died", monster.x, monster.y);
                playSoundEffect('monsterDeath');
                //Drops?
                monster.drops.forEach(item => {
                    addItemToInventory(item);
                    //Update
                    updateInventoryDisplay();
                    showInventoryMessage(item.name, playerX, playerY);
                });
            } else {
                playerHP -= monster.damage;
                showDamageMessage(monster.damage, playerX, playerY);
                playSoundEffect('monsterAttack');
            }

            setIsPlayerTurn(false);
            return;
        }
    }

    // Explore unexplored areas
    let possibleMoves = [];
    let unvisitedMoves = [];
    let currentLevelMap = maps[getCurrentMapId()];

    // Check possible moves
    for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
            if (Math.abs(dx) + Math.abs(dy) === 1) { // Only adjacent moves
                let newX = playerX + dx;
                let newY = playerY + dy;
                if (newY >= 0 && newY < currentMap.length && newX >= 0 && newX < currentMap[0].length) {
                    let nextTile = currentMap[newY][newX];
                    if (isTilePassable(nextTile) || getMapType() === 'resource' && resourceTileTypes.includes(nextTile)) { // Allow move to resource tiles
                        possibleMoves.push({ x: newX, y: newY });
                    }
                }
            }
        }
    }

    if (possibleMoves.length > 0) {
        let randomIndex = Math.floor(Math.random() * possibleMoves.length);
        let move = possibleMoves[randomIndex];

        if (move && !(move.x === playerX && move.y === playerY)) {
            setPlayerX(move.x);
            setPlayerY(move.y);
            refreshMap();
            visitedTiles.add(`${move.x},${move.y}`);
            path.push({ x: playerX, y: playerY });
            failedAttempts = 0;
            setIsPlayerTurn(false);
            previousMove = { x: playerX, y: playerY }; // Update previous move
        } else {
            failedAttempts++;
            console.log("Failed attempt:", failedAttempts);
            if (failedAttempts >= maxFailedAttempts) {
                console.log('visited tiles reset');
                visitedTiles.clear();
                failedAttempts = 0;
            }
            setIsPlayerTurn(false); // Still end the turn
        }
    } else {
        setIsPlayerTurn(false); // End turn if no moves
    }
}
function getPlayerX() {
    return playerX;
}

function getPlayerY() {
    return playerY;
}

function setPlayerX(x) {
    playerX = x;
}

function setPlayerY(y) {
    playerY = y;
}
function updatePlayerFrameCounter() {
    playerFrameCounter++;
}
function clearPlayerFrameCounter() {
    playerFrameCounter=0;
}
function setSpellDirection(direction) {
    spellDirection = direction;
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
            case 'r':
                isResting = !isResting;
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
                if (activeSpell) {
                    playSoundEffect('spell');
                    //console.log(`Casting ${activeSpell.name}`);
                    castSpell(activeSpell);
                } else {
                    console.log('No active spell selected.');
                }
                break;
            default:
                return;
        }
        
        //Monster collision, trigger attack check
        var attacked = false;
        monsters.filter(m => m.level === getCurrentLevel() && getCurrentMapId().indexOf("dungeon")>-1 && m.x === newX && m.y === newY).forEach(monster => {
            if (monster) {
                // Combat
                monster.hp -= playerDamage;
                playerHP -= monster.rollDice(monster.damage);

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
                playSoundEffect('swing');
                showDamageMessage(playerDamage, monster.x, monster.y);
                playSoundEffect('monsterAttack');
                showDamageMessage(monster.damage, playerX, playerY);

                // Remove dead monsters
                removeDeadMonsters();

                // Update info overlay
                updateInfoOverlay();

                handleMonsterKilled();

                attacked = true;
            }
        });
        if (attacked) {
            return;
        }

        // Bounds checking
        if (newX < 0 || newX >= getMapWidth() || newY < 0 || newY >= getMapHeight()) {
            return; // Prevent movement outside the map
        }

        // Collision detection / mining
        if (getCurrentMapId().indexOf('resource') >-1 && maps[getCurrentMapId()][newY][newX] == 'SW') {
            attemptMine(newX, newY);
            return;
        } else if (maps[getCurrentMapId()][newY] && (isTilePassable(maps[getCurrentMapId()][newY][newX]) == false)) {
            //console.log(maps[getCurrentMapId()][newY][newX]);
            playSoundEffect('thud');
            return; // Prevent movement into walls
        }

        if (getCurrentMapId() == "town") {
            for (const npc of npcs) {
                if (newX === npc.x && newY === npc.y && !isDialogueOpen) {
                    startDialogue(npc);
                    handleFirstNpcTalkedTo();
                    break; // Exit the loop
                }
            }
        }
        if (isDialogueOpen) {
            return;
        }

        // Update player position
        playerX = newX;
        playerY = newY;

        //Map
        refreshMap()

        //Gathering / Mining
        resourceGatherCheck(maps[getCurrentMapId()][newY][newX]);

        // Check for level change
        checkForMapTransitions();

        //Toggle turn flag
        setIsPlayerTurn(false);

        // Monster movement
        if (getMapType() == "dungeon") {
            //Monster spawn
            const currentTime = performance.now();
            const deltaTime = currentTime - getLastUpdateTime(); // Time elapsed in seconds
            updateMonsters(deltaTime)

            monsters.filter(m => m.level === getCurrentLevel()).forEach(monster => {
                if (monster.checkSight(playerX, playerY)) {
                    monster.moveTowardsPlayer(playerX, playerY, maps, getMapWidth(), getMapHeight());

                    // Monster attack
                    if (monster.x === playerX && monster.y === playerY) {
                        playerHP -= monster.damage;
                        showDamageMessage(monster.damage, playerX, playerY);
                        playSoundEffect('monsterAttack');
                        updateInfoOverlay();
                    }
                }
            });
        } else if (getMapType() == "resource" && getCurrentLevel() == 0) {
            regenerateResourcesLevel0()
        }

        updateGame();
    }
}
function checkForMapTransitions() {
    // Check for map transitions
    let currentMap = maps[getCurrentMapId()]; // Use getCurrentMap()
    if (getMapType() === 'town') {
        if (currentMap[getPlayerY()][getPlayerX()] === 'D') {
            // Transition to dungeon
            changeMap('dungeon_0', 'dungeon');
            return;
        } else if (currentMap[getPlayerY()][getPlayerX()] === 'R') {
            // Transition to resource gathering area
            changeMap('resource_0', 'resource', 5, 5);
            return;
        } else if (currentMap[getPlayerY()][getPlayerX()] === 't' && previousPlayerLocation) {
            // Town portal back to previous map / location
            changeMap(previousPlayerLocation.mapId, previousPlayerLocation.mapType, previousPlayerLocation.x, previousPlayerLocation.y);
            return;
        }
    }

    //Level transitions
    if (getMapType() === 'dungeon') {
        if (currentMap[playerY][playerX] === 't') { // Check for town portal
            changeMap('town', 'town', 5, 5);
            return;
        } else if (currentMap[playerY][playerX] === '>') { // Check for stairs down
            let currentLevel = parseInt(getCurrentMapId().split('_')[1]);
            changeMap(`dungeon_${currentLevel + 1}`, 'dungeon');
            return;
        } else if (currentMap[playerY][playerX] === '<') { // Check for stairs up
            let currentLevel = parseInt(getCurrentMapId().split('_')[1]);
            if (currentLevel > -1) { // Prevent going below dungeon_0
                changeMap(`dungeon_${currentLevel - 1}`, 'dungeon');
                return;
            }
        }
    } else if (getMapType() === 'resource') {
        if (currentMap[playerY][playerX] === 't') { // Check for town portal
            changeMap('town', 'town', 8, 5);
            return;
        } else if (currentMap[playerY][playerX] === 'v') { // Check for caves down
            let currentLevel = parseInt(getCurrentMapId().split('_')[1]);
            changeMap(`resource_${currentLevel + 1}`, 'resource');
            return;
        } else if (currentMap[playerY][playerX] === '^') { // Check for caves up
            let currentLevel = parseInt(getCurrentMapId().split('_')[1]);
            changeMap(`resource_${currentLevel - 1}`, 'resource');
            return;
        }
    }
}
function attemptMine(targetX, targetY) {
    //switch (player.direction) {
    //    case 'bk':
    //        targetY--;
    //        break;
    //    case 'fr':
    //        targetY++;
    //        break;
    //    case 'lf':
    //        targetX--;
    //        break;
    //    case 'rt':
    //        targetX++;
    //        break;
    //}

    const currentMapId = getCurrentMapId();
    const currentMap = maps[currentMapId];

    if (targetX >= 0 && targetX < getMapWidth() && targetY >= 0 && targetY < getMapHeight()) {
        if (currentMap[targetY][targetX] === 'SW') {
            // Player successfully mines the stone wall
            maps[currentMapId][targetY][targetX] = 's'; // Cshange to stone floor
            updateExploredMaps(targetX, targetY, 's'); // Update explored map
            playSoundEffect('mine'); // Play a mining sound
            displayFloatingText("Mined Stone!", targetX * tileSize, targetY * tileSize - 10, 'success');
            // You might also want to add a chance for the player to gain a "stone" resource here.
        } else if (currentMap[targetY][targetX] !== 's') {
            displayFloatingText("Cannot mine here!", targetX * tileSize, targetY * tileSize - 10, 'info');
        }
    } else {
        displayFloatingText("Nothing to mine!", player.x * tileSize, player.y * tileSize - 10, 'info');
    }
}
function castSpell(spell) {
    // Check for mana cost
    if (playerMana >= spell.cost.mana) {
        playerMana -= spell.cost.mana;
        // Implement the spell's effect
        //console.log(`Casting ${spell.name} effect.`);
        
        if (spell.id === 'heal' && spell.effect) {
            spell.effect(player);
            isHealingAuraActive = true;
            healingAuraStartTime = Date.now();
        } else if (spell.projectile) {
            projectiles.push(new Projectile(playerX, playerY, playerDirection, spell.projectileFrames, spell.effect, spell.projectileSpeed, spell.animationSpeed, spell.damage));
        } else if (spell.effect) {
            spell.effect(player); // other effects
        }
        // Handle cooldown (you'll need to manage a cooldown timer)
        startSpellCooldown(spell);
    } else {
        console.log(`Not enough mana to cast ${spell.name}.`);
        showDamageMessage("Not enough mana");
    }
}
// Example function for starting a spell cooldown (you'll need to implement the timer)
const spellCooldowns = {};
function startSpellCooldown(spell) {
    spellCooldowns[spell.id] = Date.now() + spell.cooldown;
    //console.log(`${spell.name} on cooldown for ${spell.cooldown}ms.`);
    // Update UI to show cooldown
}

function isSpellOnCooldown(spell) {
    return spellCooldowns[spell.id] > Date.now();
}
function renderPlayer() {

    let imagePath = `assets/img/sprites/amg1_${playerDirection}${playerFrame}.png`;
    let image = loadImage(imagePath);
    ctx.drawImage(
        image,
        playerX * tileSize - cameraX,
        playerY * tileSize - cameraY,
        tileSize,
        tileSize
    );

    // Increment playerFrame based on frameCounter and frameRate
    updatePlayerFrameCounter(); // Increment here

    if (playerFrameCounter >= playerFrameRate) {
        playerFrame++;
        clearPlayerFrameCounter(); // Reset counter
        if (playerFrame > 2) {
            playerFrame = 1; // Loop animation
        }
    }
}

function getPlayerHP() {
    return playerHP;
}

function getMaxPlayerHP() {
    return maxPlayerHP;
}

function getPlayerLevel() {
    return playerLevel;
}

function getPlayerAttack() {
    let baseAttack = player.attack;
    if (player.equipped.weapon && player.equipped.weapon.stats && player.equipped.weapon.stats.attack) {
        baseAttack += player.equipped.weapon.stats.attack;
    }
    // Add other equipment attack bonuses here if needed
    return baseAttack;
}

function getPlayerDefense() {
    let baseDefense = player.defense;
    if (player.equipped.armor && player.equipped.armor.stats && player.equipped.armor.stats.defense) {
        baseDefense += player.equipped.armor.stats.defense;
    }
    if (player.equipped.shield && player.equipped.shield.stats && player.equipped.shield.stats.defense) {
        baseDefense += player.equipped.shield.stats.defense;
    }
    if (player.equipped.helmet && player.equipped.helmet.stats && player.equipped.helmet.stats.defense) {
        baseDefense += player.equipped.helmet.stats.defense;
    }
    if (player.equipped.gloves && player.equipped.gloves.stats && player.equipped.gloves.stats.defense) {
        baseDefense += player.equipped.gloves.stats.defense;
    }
    if (player.equipped.boots && player.equipped.boots.stats && player.equipped.boots.stats.defense) {
        baseDefense += player.equipped.boots.stats.defense;
    }
    if (player.equipped.cloak && player.equipped.cloak.stats && player.equipped.cloak.stats.defense) {
        baseDefense += player.equipped.cloak.stats.defense;
    }
    if (player.equipped.ring && player.equipped.ring.stats && player.equipped.ring.stats.defense) {
        baseDefense += player.equipped.ring.stats.defense;
    }
    if (player.equipped.amulet && player.equipped.amulet.stats && player.equipped.amulet.stats.defense) {
        baseDefense += player.equipped.amulet.stats.defense;
    }
    // Add other equipment defense bonuses here
    return baseDefense;
}

function setPlayerHP(newHP) {
    playerHP = newHP;
}

function setMaxPlayerHP(newMaxHP) {
    maxPlayerHP = newMaxHP;
}

function setPlayerLevel(newLevel) {
    playerLevel = newLevel;
}

function setPlayerAttack(newAttack) {
    playerAttack = newAttack;
}

function setPlayerDefense(newDefense) {
    playerDefense = newDefense;
}
function getPlayerMana() {
    return playerMana;
}

function setPlayerMana(newPlayerMana) {
    playerMana = newPlayerMana;
}

function getEquippedItems() {
    return player.equipped;
}

function toggleIsResting() {
    isResting = !isResting;
    if (isResting) {
        restButton.innerText = 'Resting'
    } else {
        restButton.innerText = 'Rest'
    }
}
function playerRegenCheck() {
    if (isResting) {
        const currentTime = Date.now();
        const deltaTime = (currentTime - getLastUpdateTime()) / 1000; // Time elapsed in seconds
        setLastUpdateTime(currentTime);

        // Health Regeneration
        const currentHealthRegenRate = isResting ? healthRegenRate * restingRegenMultiplier : healthRegenRate;
        var newPlayerHealth = parseInt( Math.min(maxPlayerHP, playerHP + currentHealthRegenRate));
        setPlayerHP(newPlayerHealth);
        if (getPlayerHP() < 0) setPlayerHP(0); // Prevent going below zero

        // Mana Regeneration
        const currentManaRegenRate = isResting ? manaRegenRate * restingRegenMultiplier : manaRegenRate;
        var newPlayerMana = parseInt(Math.min(playerMaxMana, playerMana + currentManaRegenRate));
        setPlayerMana(newPlayerMana);
        if (getPlayerMana() < 0) setPlayerMana(playerMana); // Prevent going below zero

        if (playerMaxMana == playerMana && playerHP == maxPlayerHP) {
            toggleIsResting()
            //console.log('Full mana and HP, resting canceled');
        }
    }
}

function toggleHealingAuraActive() {
    isHealingAuraActive = !isHealingAuraActive;
}

const resourceCapPerTypeLevel0 = {
    'W': 50,
    'S': 40,
    'H': 60,
    // ... other resource types
};
const resourceRegenIntervalLevel0 = 10000; // Regenerate every 10 seconds
let resourceRegenTimerLevel0 = 0;

function updateResources(deltaTime) {
    if (currentMapId === 0) {
        resourceRegenTimerLevel0 += deltaTime * 1000;

        if (resourceRegenTimerLevel0 >= resourceRegenIntervalLevel0) {
            regenerateResourcesLevel0();
            resourceRegenTimerLevel0 = 0;
        }
    }
}

function regenerateResourcesLevel0() {
    const level0Map = maps['resource_0'];
    const width = level0Map[0].length;
    const height = level0Map.length;
    const currentResourceCounts = countResources(level0Map);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (level0Map[y][x] === 'g') { // Only regenerate on grass tiles
                // Define probabilities for each resource type
                const regenProbabilities = {
                    'W': 0.02,
                    'S': 0.015,
                    'H': 0.025,
                    // ... probabilities for other resources
                };

                for (const resourceType in regenProbabilities) {
                    if ((currentResourceCounts[resourceType] || 0) < (resourceCapPerTypeLevel0[resourceType] || 50) && Math.random() < regenProbabilities[resourceType]) {
                        level0Map[y][x] = resourceType;
                        //console.log(`Regenerated ${resourceType} at (${x}, ${y}) on level 0`);
                        return; // Regenerate only one resource per tick to avoid sudden bursts
                    }
                }
            }
        }
    }
}

function countResources(map) {
    const counts = {};
    for (const row of map) {
        for (const tile of row) {
            if (['W', 'S', 'H'].includes(tile)) { // Add other resource tiles here
                counts[tile] = (counts[tile] || 0) + 1;
            }
        }
    }
    return counts;
}

export {
    playerX, playerY, playerDirection, playerFrame, playerFrameRate, playerFrameCounter, playerHP, maxPlayerHP, playerDamage, handleInput, renderPlayer, getPlayerX, getPlayerY, setPlayerX, setPlayerY, updatePlayerFrameCounter, clearPlayerFrameCounter, setSpellDirection, spellDirection, setPlayerHP, autoExplore, toggleAutoExplore, autoExploreMove,
    getPlayerHP,
    getMaxPlayerHP,
    setMaxPlayerHP,
    getPlayerLevel,
    setPlayerLevel,
    getPlayerAttack,
    setPlayerAttack,
    getPlayerDefense,
    setPlayerDefense,
    getEquippedItems,
    player,
    playerMana,
    playerMaxMana,
    isResting,
    healthRegenRate,
    manaRegenRate,
    getPlayerMana,
    setPlayerMana,
    toggleIsResting,
    playerRegenCheck,
    isHealingAuraActive,
    healingAuraStartTime,
    toggleHealingAuraActive,
    projectiles,
    resourceTileTypes
};