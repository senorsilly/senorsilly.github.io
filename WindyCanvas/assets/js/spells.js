// spells.js
import { changeMap, getMapType, updateExploredMaps, maps, getCurrentMapId, getMapWidth, getMapHeight } from './map.js';
import { getPlayerX, getPlayerY, playerDirection, playerX, playerY, setPlayerHP, getMaxPlayerHP, getPlayerHP, getPlayerAttack, getPlayerDefense, playerMana, playerMaxMana, setPlayerMana, setPlayerX, setPlayerY } from './player.js';
import { displayFloatingText, showDamageMessage } from './ui.js';
import { monsters, removeDeadMonsters } from './monster.js';
import { updateStatusDisplay, loadImage, getCurrentLevel, ctx, tileSize, cameraX, cameraY } from './game.js';

// Get modal elements
const spellSelectionModal = document.getElementById('spellSelectionModal');
const closeSpellSelectionModalButton = document.getElementById('closeSpellSelectionModal');
const spellListContainer = document.getElementById('spellList');

let healingAuraImage = new Image();
healingAuraImage.src = 'assets/img/sprites/heal_0.png'; // Path to your aura image

let castSpells = [];

let canSeeHiddenMonsters = false;
let detectMonsterTimer = 0;
const detectMonsterDuration = 5000;
let previousPlayerLocation = null;
class Spell {
    constructor(x, y, direction, spellDetails) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.spellDetails = spellDetails;
    }
}

const spells = [
    {
        id: 'fireball',
        name: 'Fireball',
        cost: { mana: 10 },
        damage: 10,
        description: 'Launches a fiery projectile that damages enemies.',
        effect: (target) => { /* Apply fire damage */ },
        projectileFrames: ['assets/img/sprites/flame_0.png', 'assets/img/sprites/flame_1.png'],
        projectileSpeed: .1, // Example speed
        animationSpeed: 100, // Milliseconds per frame
        projectile: 'fireball_projectile', // Key to your projectile asset
        cooldown: 500, // milliseconds
        icon: 'assets/img/sprites/flame_0.png'
    },
    {
        id: 'icebolt',
        name: 'Ice Bolt',
        cost: { mana: 15 },
        damage: 10,
        description: 'Fires a bolt of ice that slows enemies.',
        effect: (target) => { /* Apply slow effect and damage */ },
        projectileFrames: ['assets/img/sprites/cloud_cold_0.png', 'assets/img/sprites/cloud_cold_1.png'],
        projectileSpeed: .1,
        animationSpeed: 1.0,
        projectile: 'icebolt_projectile',
        cooldown: 750,
        icon: 'assets/img/sprites/cloud_cold_0.png'
    },
    {
        id: 'heal',
        name: 'Heal',
        cost: { mana: 20 },
        heals: 10,
        description: 'Restores a portion of your health.',
        effect: (caster) => {
            // Healing logic
            const healAmount = 25; // Define the amount to heal
            var newplayerHealth = Math.min(getMaxPlayerHP(), getPlayerHP() + healAmount); // Increase health, but not above max
            setPlayerHP(newplayerHealth);
            //console.log(`Player healed for ${healAmount}. Current health: ${getPlayerHP()}/${getMaxPlayerHP()}`);
            // update the UI
            updateStatusDisplay(getPlayerHP(), getMaxPlayerHP(), getPlayerAttack(), getPlayerDefense(), playerMana, playerMaxMana);
        },
        cooldown: 1000,
        icon: 'assets/img/sprites/heal_0.png'
    },
    {
        id: 'detect_monster',
        name: 'Detect Monster',
        cost: { mana: 15 },
        description: 'For a short duration, reveals monsters beyond the normal sight radius.',
        duration: 5000, // Duration in milliseconds
        effect: castDetectMonster,
        icon: 'assets/img/sprites/detect_monster.png'
    },
    {
        id: 'clairvoyance',
        name: 'Clairvoyance',
        cost: { mana: 20 },
        description: 'Reveals a large area of the map around you.',
        radius: 30,
        effect: castClairvoyance,
        icon: 'assets/img/sprites/clairvoyance.png'
    },
    {
        id: 'destroy_wall',
        name: 'Destroy Wall',
        cost: { mana: 10 },
        description: 'Destroys a wall in the direction you are facing.',
        effect: castDestroyWall,
        icon: 'assets/img/sprites/destroy_wall.png'
    },
    {
        id: 'town_portal',
        name: 'Town Portal',
        cost: { mana: 10 },
        description: 'Creates a portal to return to town and back.',
        effect: castTownPortal,
        icon: 'assets/img/tiles/town_portal.png'
    }
];

const healingAuraDuration = spells.find(spell => spell.id === 'heal')?.cooldown || 1000; // Get cooldown or default
let activeSpell = spells.find(spell => spell.id === 'town_portal'); // Default active spell
function updateSpells() {
    // Update spells
    castSpells.forEach((spell, index) => {
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
        if (maps[getCurrentMapId()][spell.y] && maps[getCurrentMapId()][spell.y][spell.x] === '#') {
            castSpells.splice(index, 1); // Remove spell on wall collision
            return;
        }

        // Monster collision
        let monster = monsters.find(m => m.x === spell.x && m.y === spell.y && m.level == getCurrentLevel());
        if (monster) {
            monster.hp -= spell.damage;
            showDamageMessage(spell.damage, monster.x, monster.y);
            removeDeadMonsters();
            castSpells.splice(index, 1); // Remove spell on monster collision
            return;
        }

        // Off-screen check
        if (spell.x < 0 || spell.x >= getMapWidth() || spell.y < 0 || spell.y >= getMapHeight()) {
            castSpells.splice(index, 1); // Remove spell if off-screen
        }
    });
}
function renderSpells() {
    // Render spells
    castSpells.forEach(spell => {
        var spellImage = loadImage(spell.spellDetails.icon);
        ctx.drawImage(
            spellImage,
            spell.x * tileSize - cameraX,
            spell.y * tileSize - cameraY,
            tileSize,
            tileSize
        );
    });
}

function openSpellSelectionModal() {
    spellSelectionModal.style.display = 'block';
    populateSpellList();
    highlightActiveSpell();
}

function closeSpellSelectionModal() {
    spellSelectionModal.style.display = 'none';
}

closeSpellSelectionModalButton.addEventListener('click', closeSpellSelectionModal);

function populateSpellList() {
    spellListContainer.innerHTML = '';
    spells.forEach(spell => {
        const spellOption = document.createElement('div');
        spellOption.classList.add('spell-option');
        spellOption.dataset.spellId = spell.id;
        spellOption.addEventListener('click', selectActiveSpell);

        const icon = document.createElement('img');
        icon.src = spell.icon;
        icon.alt = spell.name;

        const name = document.createElement('span');
        name.textContent = spell.name;

        spellOption.appendChild(icon);
        spellOption.appendChild(name);
        spellListContainer.appendChild(spellOption);
    });
}

function selectActiveSpell(event) {
    const spellId = event.currentTarget.dataset.spellId;
    activeSpell = spells.find(spell => spell.id === spellId);
    highlightActiveSpell();
    //console.log(`Active spell selected: ${activeSpell.name}`);
    closeSpellSelectionModal(); // Close modal after selection
}

function highlightActiveSpell() {
    document.querySelectorAll('.spell-option').forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.spellId === activeSpell.id) {
            option.classList.add('selected');
        }
    });
}
const openSpellSelectionButton = document.getElementById('openSpellSelection');
if (openSpellSelectionButton) {
    openSpellSelectionButton.addEventListener('click', openSpellSelectionModal);
}

function castDetectMonster() {
    let spellDetails = spells.find(spell => spell.id === 'detect_monster');
    if (playerMana >= spellDetails.cost.mana && !canSeeHiddenMonsters) {
        setPlayerMana(playerMana - spellDetails.cost.mana);
        canSeeHiddenMonsters = true;
        detectMonsterTimer = Date.now();
        displayFloatingText("Detecting Monsters!", playerX * tileSize, playerY * tileSize - 10, 'magic');
    } else if (canSeeHiddenMonsters) {
        displayFloatingText("Already Detecting!", playerX * tileSize, playerY * tileSize - 10, 'warning');
    } else {
        displayFloatingText("Not enough mana!", playerX * tileSize, playerY * tileSize - 10, 'error');
    }
}

function checkForSeeHiddenMonsters() {
    if (canSeeHiddenMonsters && Date.now() - detectMonsterTimer > detectMonsterDuration) {
        canSeeHiddenMonsters = false;
    }
}
function castClairvoyance() {
    let spellDetails = spells.find(spell => spell.id === 'clairvoyance');
    if (playerMana >= spellDetails.cost.mana) {
        setPlayerMana(playerMana - spellDetails.cost.mana);
        const radius = spellDetails.radius;
        for (let y = playerY - radius; y <= playerY + radius; y++) {
            for (let x = playerX - radius; x <= playerX + radius; x++) {
                const dx = playerX - x;
                const dy = playerY - y;
                if (dx * dx + dy * dy <= radius * radius &&
                    x >= 0 && x < getMapWidth() && y >= 0 && y < getMapHeight()) {
                    const tileType = maps[getCurrentMapId()][y][x];
                    updateExploredMaps(x, y, tileType);
                }
            }
        }
        displayFloatingText("Clairvoyance!", playerX * tileSize, playerY * tileSize - 10, 'magic');
    } else {
        displayFloatingText("Not enough mana!", playerX * tileSize, playerY * tileSize - 10, 'error');
    }
}

function castDestroyWall() {
    let spellDetails = spells.find(spell => spell.id === 'destroy_wall');
    if (playerMana >= spellDetails.cost.mana) {
        setPlayerMana(playerMana - spellDetails.cost.mana);
        let targetX = playerX;
        let targetY = playerY;

        switch (playerDirection) {
            case 'bk':
                targetY--;
                break;
            case 'fr':
                targetY++;
                break;
            case 'lf':
                targetX--;
                break;
            case 'rt':
                targetX++;
                break;
        }

        if (targetX >= 0 && targetX < getMapWidth() && targetY >= 0 && targetY < getMapHeight()) {
            const currentTileType = maps[getCurrentMapId()][targetY][targetX];
            if (currentTileType === '#') {
                setTileType(targetX, targetY, '.'); // Assuming '.' represents floor
                displayFloatingText("Wall Destroyed!", targetX * tileSize, targetY * tileSize - 10, 'magic');
                // Optionally, trigger a map redraw
            } else {
                displayFloatingText("No wall to destroy!", targetX * tileSize, targetY * tileSize - 10, 'info');
            }
        } else {
            displayFloatingText("Nothing there!", playerX * tileSize, playerY * tileSize - 10, 'info');
        }
    } else {
        displayFloatingText("Not enough mana!", playerX * tileSize, playerY * tileSize - 10, 'error');
    }
}

// You'll need a function to set the tile type in your map data
function setTileType(x, y, newType) {
    // Implementation depends on how your map data is structured
    maps[getCurrentMapId()][y][x] = newType;
}

function castTownPortal() {
    let spellDetails = spells.find(spell => spell.id === 'town_portal');
    if (playerMana >= spellDetails.cost.mana) {
        setPlayerMana(playerMana - spellDetails.cost.mana);

        const townMapId = 'town'; // Assuming your town map has an ID of 0
        const townPortalTile = 't'; // Assuming 't' is the tile for the town portal in the town map

        if (getCurrentMapId() === townMapId && previousPlayerLocation) {
            // Teleport back to the previous location
            changeMap(previousPlayerLocation.mapId, previousPlayerLocation.mapType, previousPlayerLocation.x, previousPlayerLocation.y);
            displayFloatingText("Returned from Town!", getPlayerX() * tileSize, getPlayerY() * tileSize - 10, 'magic');
            previousPlayerLocation = null; // Clear the previous location
        } else if (getCurrentMapId() !== townMapId) {
            // Teleport to town
            // Store the current location
            previousPlayerLocation = { mapId: getCurrentMapId(), mapType: getMapType(), x: getPlayerX(), y: getPlayerY() };

            // Find the town portal tile in the town map
            const townMap = maps[townMapId];
            if (townMap) {
                for (let y = 0; y < townMap.length; y++) {
                    for (let x = 0; x < townMap[y].length; x++) {
                        if (townMap[y][x] === townPortalTile) {
                            //console.log(`Changing map to: ${townMapId} ${x},${y}`);
                            changeMap(townMapId, townMapId, x, y);
                            setTimeout(function (e) {
                                setPlayerX(x);
                                setPlayerY(y);
                            }, 10);
                            displayFloatingText("Teleported to Town!", getPlayerX() * tileSize, getPlayerY() * tileSize - 10, 'magic');
                            return; // Exit the function after teleporting
                        }
                    }
                }
            }
            console.warn("Town portal tile 't' not found in the town map.");
        } else {
            displayFloatingText("No previous location to return to.", getPlayerX() * tileSize, getPlayerY() * tileSize - 10, 'info');
        }
    } else {
        displayFloatingText("Not enough mana!", getPlayerX() * tileSize, getPlayerY() * tileSize - 10, 'error');
    }
}

export { previousPlayerLocation, checkForSeeHiddenMonsters, canSeeHiddenMonsters, spells, Spell, castSpells, updateSpells, renderSpells, activeSpell, healingAuraDuration, healingAuraImage };