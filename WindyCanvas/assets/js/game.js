// game.js
import { isTileVisible, maps, setCurrentMapId, getCurrentMapId, generateMap, changeMap, getMapWidth, getMapHeight, getMapType, renderLevel } from './map.js';
import { toggleHealingAuraActive, isHealingAuraActive, healingAuraStartTime, playerRegenCheck, playerMana, playerMaxMana, getPlayerAttack, maxPlayerHP, playerHP, playerDamage, getPlayerX, getPlayerY, playerX, playerY, playerFrameCounter, playerFrame, playerFrameRate, renderPlayer, updatePlayerFrameCounter, clearPlayerFrameCounter, setSpellDirection, spellDirection, autoExplore, autoExploreMove, getPlayerDefense, getPlayerHP, setPlayerHP, setPlayerMana, getPlayerMana } from './player.js';
import { updateMonsterFrames, monsters, removeDeadMonsters } from './monster.js';
import { previousPlayerLocation, checkForSeeHiddenMonsters, updateSpells, healingAuraDuration, healingAuraImage } from './spells.js';
import { updateDebugInfo, updateFloatingTexts, drawFloatingTexts, itemScroller,sectionSizer, updateInfoOverlay, showInventoryMessage, updateStatusDisplay, showDamageMessage, updateArmorDisplay } from './ui.js';
import { updateInventoryDisplay, addItemToInventory} from './inventory.js';
import { getItem } from './items.js'
import { initAudioContext } from './audio.js';
import { npcs } from './npcs.js'
import { showMainMenu, startNewGame } from './gameState.js'

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let tileSize = 32;
let cameraX = 0;
let cameraY = 0;
let viewportWidth = window.innerWidth - 340;
let viewportHeight = window.innerHeight - 60;
let imageCache = {}; // Centralized image cache
let tileImageCache = {};
let isPlayerTurn = true;
let currentLevel = 0;
const projectiles = []; // Array to hold active projectiles

const splashScreen = document.getElementById('splashScreen');
const loadingText = document.getElementById('loadingText');
const progressBar = document.getElementById('progressBar');
const gameCanvas = document.getElementById('gameCanvas');
const uiContainer = document.getElementById('uiContainer');

let gameLoaded = false;
let assetsLoadedCount = 0;
let totalAssets = 0;
const MIN_SPLASH_TIME = 2000; // Minimum time in milliseconds (e.g., 2 seconds)
let splashStartTime = 0;


canvas.width = viewportWidth;
canvas.height = viewportHeight;

let lastUpdateTime = performance.now();
function loadImage(src, callback) {
    if (imageCache[src]) {
        if (callback) {
            callback(imageCache[src]);
        } else {
            return imageCache[src];
        }
    } else {
        const img = new Image();
        if (callback) {
            img.onload = () => {
                imageCache[src] = img;
                callback(img);
            };
            img.src = src;
        } else {
            img.src = src;
            imageCache[src] = img;
            return img;
        }
    }
}
function getCachedImage(src, alt, className) {
    
    if (imageCache[src]) {
        //if (src.indexOf('rusty_sword') > -1) {
        //    console.log("rusty sword from cache");
        //}
        const cachedIcon = imageCache[src].cloneNode(true); // Clone to avoid modifying the cached version
        if (alt) cachedIcon.alt = alt;
        if (className) cachedIcon.classList.add(className);
        return cachedIcon;
    } else {
        //if (src.indexOf('rusty_sword') > -1) {
        //    console.log("rusty sword loaded");
        //}
        const icon = new Image();
        icon.src = src;
        if (alt) icon.alt = alt;
        if (className) icon.classList.add(className);
        imageCache[src] = icon; // Cache the image object
        return icon;
    }
}
function loadPreCachedImage(url, callback) {
    const img = new Image();
    img.onload = () => {
        imageCache[url] = img;
        assetsLoadedCount++;
        updateProgressBar();
        if (callback) {
            callback();
        }
        if (assetsLoadedCount === totalAssets) {
            onAllAssetsLoaded();
        }
    };
    img.onerror = () => {
        console.error(`Failed to load image: ${url}`);
        assetsLoadedCount++; // Still increment to avoid getting stuck
        updateProgressBar();
        if (callback) {
            callback();
        }
        if (assetsLoadedCount === totalAssets) {
            onAllAssetsLoaded();
        }
    };
    img.src = url;
}

function getIsPlayerTurn() {
    return isPlayerTurn;
}

function setIsPlayerTurn(turn) {
    isPlayerTurn = turn;
}
function getCurrentLevel() {
    return currentLevel;
}

function setCurrentLevel(level) {
    currentLevel = level;
}
function gameLoop() {
    //Set the last update time
    lastUpdateTime = performance.now();

    playerRegenCheck();
    updateGame();
    requestAnimationFrame(gameLoop);
}

function updateCamera() {
    let currentLevelMap = maps[getCurrentMapId()];
    if (!currentLevelMap) return;

    let mapWidth = currentLevelMap[0].length * tileSize;
    let mapHeight = currentLevelMap.length * tileSize;

    cameraX = playerX * tileSize - viewportWidth / 2;
    cameraY = playerY * tileSize - viewportHeight / 2;

    // Clamp camera to map boundaries
    cameraX = Math.max(0, Math.min(cameraX, mapWidth - viewportWidth));
    cameraY = Math.max(0, Math.min(cameraY, mapHeight - viewportHeight));
}
function initGame() {
    // Generate initial town map
    let initialTownMap = generateMap(getMapWidth(), getMapHeight(), 'town', 'town'); // Use 'town' as mapId and mapType
    maps['town'] = initialTownMap; // Store the town map in the maps object
    setCurrentMapId('town'); // Set the current map to 'town'

    // Initial inventory display
    updateInventoryDisplay();

    //Size the scrolling section
    itemScroller.style.maxHeight = viewportHeight - sectionSizer.style.height - 240 + 'px';

    // Call updateInfoOverlay initially
    updateInfoOverlay();

    gameLoop(); // Start the game loop
}

function cacheImages() {
    const imagesToLoad = [
        'assets/img/tiles/dungeon_portal.png',
        'assets/img/tiles/floor.png',
        'assets/img/tiles/floor_sand_rock_0.png',
        'assets/img/tiles/floor_sand_rock_1.png',
        'assets/img/tiles/floor_sand_rock_3.png',
        'assets/img/tiles/grass_0_old.png',
        'assets/img/tiles/grass_1_new.png',
        'assets/img/tiles/grass_1_old.png',
        'assets/img/tiles/grass_2_new.png',
        'assets/img/tiles/grass_2_old.png',
        'assets/img/tiles/grass.png',
        'assets/img/tiles/stone_floor.png',
        'assets/img/tiles/portal.png',
        'assets/img/tiles/resource_portal.png',
        'assets/img/tiles/stone_stairs_down.png',
        'assets/img/tiles/stone_stairs_up.png',
        'assets/img/tiles/wall.png',
        'assets/img/tiles/wall_vines_0.png',
        'assets/img/tiles/wall_vines_1.png',
        'assets/img/tiles/wall_vines_2.png',
        'assets/img/tiles/wall_vines_3.png'
    ];
    totalAssets = imagesToLoad.length;
    assetsLoadedCount = 0; // Reset count

    imagesToLoad.forEach(url => {
        loadPreCachedImage(url);
    });
}
function updateProgressBar() {
    if (totalAssets > 0) {
        const progress = (assetsLoadedCount / totalAssets) * 100;
        progressBar.style.width = `${progress}%`;
        loadingText.textContent = `Loading... ${Math.round(progress)}%`;
    }
}

function onAllAssetsLoaded() {
    //console.log('All game assets loaded.');
    gameLoaded = true;
    initGame();
}
function updateGame() {
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updatePlayerFrameCounter();
    updateMonsterFrames();
    updateCamera();
    updateInfoOverlay();
    updateStatusDisplay(playerHP, maxPlayerHP, getPlayerAttack(), getPlayerDefense(), playerMana, playerMaxMana);
    updateDebugInfo();

    isPlayerTurn = true;

    if (autoExplore) {
        autoExploreMove();
    }

    if (getMapType() === 'resource') {
        gatheringCheck();
    }

    // Update camera position
    updateCamera();
    // Render the game
    renderLevel();
    //Spell effects
    renderSpellEffects();
    checkForSeeHiddenMonsters();
    drawFloatingTexts();
    updateFloatingTexts();
    //NPC's
    if (getCurrentMapId() == "town") {
        renderNPCs();
    }
}

function renderNPCs() {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastUpdateTime; // Time elapsed in seconds

    npcs.forEach(npc => {
        if (isTileVisible(npc.x, npc.y)) {
            const screenX = npc.x * tileSize - cameraX;
            const screenY = npc.y * tileSize - cameraY;

            npc.animationTimer += deltaTime * 1000;
            if (npc.animationTimer > npc.animationSpeed) {
                npc.currentFrame = (npc.currentFrame + 1) % npc.spriteFrames.length;
                npc.animationTimer = 0;
            }

            const currentFrameUrl = npc.spriteFrames[npc.currentFrame];
            loadImage(currentFrameUrl, (img) => {
                if (img) {
                    ctx.drawImage(img, screenX, screenY);
                }
            });
        }
    });
}

function renderSpellEffects() {
    const currentTime = performance.now();
    const deltaTime = currentTime - lastUpdateTime; // Time elapsed in seconds

    projectiles.forEach((projectile, index) => {
        switch (projectile.direction) {
            case 'bk':
                projectile.y -=projectile.speed;
                break;
            case 'fr':
                projectile.y += projectile.speed;
                break;
            case 'lf':
                projectile.x -= projectile.speed;
                break;
            case 'rt':
                projectile.x += projectile.speed;
                break;
            case 'ul':
                projectile.x -= projectile.speed;
                projectile.y--;
                break;
            case 'ur':
                projectile.x += projectile.speed;
                projectile.y -= projectile.speed;
                break;
            case 'dl':
                projectile.x -= projectile.speed;
                projectile.y += projectile.speed;
                break;
            case 'dr':
                projectile.x += projectile.speed;
                projectile.y += projectile.speed;
                break;
        }

        //Increase the animation timer
        projectile.animationTimer += deltaTime;
        //console.log('animationTimer ' + projectile.animationTimer);
        
        if (projectile.animationTimer > projectile.animationSpeed) {
            //console.log('reset animation timer');
            projectile.frameIndex = (projectile.frameIndex + 1) % projectile.frames.length;
            projectile.animationTimer = 0;
        }

        const currentFrameUrl = projectile.frames[projectile.frameIndex];
        loadImage(currentFrameUrl, (img) => {
            if (img) {
                //console.log('projectile ' + projectile.frames[projectile.frameIndex] + ' x:' + parseInt(projectile.x) + ' y:' + parseInt(projectile.y));
                ctx.drawImage(img, projectile.x * tileSize - cameraX, projectile.y * tileSize - cameraY);
            } else {
                console.warn(`Failed to load image: ${currentFrameUrl} for projectile.`);
            }
        });

        // Collision detection
        if (maps[getCurrentMapId()][parseInt(projectile.y)] && maps[getCurrentMapId()][parseInt(projectile.y)][parseInt(projectile.x)] === '#') {
            projectiles.splice(index, 1); // Remove projectile on wall collision
            return;
        }

        // Monster collision
        if (monsters !== undefined) {
            let monster = monsters.find(m => m.x === parseInt(projectile.x) && m.y === parseInt(projectile.y) && m.level == getCurrentLevel());
            if (monster) {
                monster.hp -= projectile.damage;
                showDamageMessage(projectile.damage, monster.x, monster.y);
                removeDeadMonsters();
                projectiles.splice(index, 1); // Remove projectile on monster collision
                return;
            }
        }

        // Off-screen check
        if (projectile.x < 0 || projectile.x >= getMapWidth() || projectile.y < 0 || projectile.y >= getMapHeight()) {
            projectiles.splice(index, 1); // Remove projectile if off-screen
        }
    });

    // Draw the healing aura if active
    if (isHealingAuraActive) {
        const currentTime = Date.now();
        const elapsedTime = currentTime - healingAuraStartTime;
        if (elapsedTime < healingAuraDuration) {
            // Calculate the center of the player's current tile
            const playerCenterX = getPlayerX() * tileSize + tileSize / 2;
            const playerCenterY = getPlayerY() * tileSize + tileSize / 2;

            // Calculate the position to draw the aura centered on the player's center
            const auraX = playerCenterX - healingAuraImage.width / 2;
            const auraY = playerCenterY - healingAuraImage.height / 2;

            // You can also add some visual effects here, like scaling or fading in/out
            const alpha = 1 - (elapsedTime / healingAuraDuration); // Fade out over time
            ctx.globalAlpha = alpha > 0 ? alpha : 0;
            ctx.drawImage(healingAuraImage, auraX, auraY);
            ctx.globalAlpha = 1; // Reset alpha
        } else {
            toggleHealingAuraActive();
        }
    }
}

function gatheringCheck() {
    // Add resource gathering logic
    if (maps[getCurrentMapId()][getPlayerY()][getPlayerX()] === 'W') {
        // Gather wood
        addItemToInventory(getItem("Wood"));
        maps[getCurrentMapId()][getPlayerY()][getPlayerX()] = 'g'; // Remove resource tile
        showInventoryMessage("Gathered Wood", getPlayerX(), getPlayerY());
    }
    if (maps[getCurrentMapId()][getPlayerY()][getPlayerX()] === 'S') {
        // Gather stone
        addItemToInventory(getItem("Stone"));
        maps[getCurrentMapId()][getPlayerY()][getPlayerX()] = 'g'; // Remove resource tile
        showInventoryMessage("Gathered Stone", getPlayerX(), getPlayerY());
    }
    if (maps[getCurrentMapId()][getPlayerY()][getPlayerX()] === 'H') {
        // Gather herbs
        addItemToInventory(getItem("Herb"));
        maps[getCurrentMapId()][getPlayerY()][getPlayerX()] = 'g'; // Remove resource tile
        showInventoryMessage("Gathered Herb", getPlayerX(), getPlayerY());
    }
    if (maps[getCurrentMapId()][getPlayerY()][getPlayerX()] === 'I') {
        // Gather iron
        addItemToInventory(getItem("Iron Ore"));
        maps[getCurrentMapId()][getPlayerY()][getPlayerX()] = 's'; // Remove resource tile
        showInventoryMessage("Gathered Iron", getPlayerX(), getPlayerY());
    }
    if (maps[getCurrentMapId()][getPlayerY()][getPlayerX()] === 'C') {
        // Gather copper
        addItemToInventory(getItem("Copper Ore"));
        maps[getCurrentMapId()][getPlayerY()][getPlayerX()] = 's'; // Remove resource tile
        showInventoryMessage("Gathered Copper", getPlayerX(), getPlayerY());
    }
    if (maps[getCurrentMapId()][getPlayerY()][getPlayerX()] === 'T') {
        // Gather tin
        addItemToInventory(getItem("Tin Ore"));
        maps[getCurrentMapId()][getPlayerY()][getPlayerX()] = 's'; // Remove resource tile
        showInventoryMessage("Gathered Tin", getPlayerX(), getPlayerY());
    }
    if (maps[getCurrentMapId()][getPlayerY()][getPlayerX()] === 'A') {
        // Gather adamantine
        addItemToInventory(getItem("Adamantine Ore"));
        maps[getCurrentMapId()][getPlayerY()][getPlayerX()] = 's'; // Remove resource tile
        showInventoryMessage("Gathered Adamantine", getPlayerX(), getPlayerY());
    }
    if (maps[getCurrentMapId()][getPlayerY()][getPlayerX()] === 'O') {
        // Gather orichalcum
        addItemToInventory(getItem("Orichalcum Ore"));
        maps[getCurrentMapId()][getPlayerY()][getPlayerX()] = 's'; // Remove resource tile
        showInventoryMessage("Gathered Orichalcum", getPlayerX(), getPlayerY());
    }
    if (maps[getCurrentMapId()][getPlayerY()][getPlayerX()] === 'M') {
        // Gather mithril
        addItemToInventory(getItem("Mithril Ore"));
        maps[getCurrentMapId()][getPlayerY()][getPlayerX()] = 's'; // Remove resource tile
        showInventoryMessage("Gathered Adamantine", getPlayerX(), getPlayerY());
    }
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
        case 's':
            imagePath = 'stone_floor.png';
            break;
        case 'g':
            imagePath = 'grass.png';
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

window.addEventListener('resize', () => {
    viewportWidth = window.innerWidth - 340;
    viewportHeight = window.innerHeight - 60;

    // Resize canvas
    canvas.width = viewportWidth;
    canvas.height = viewportHeight;

    //Scrolling section
    itemScroller.style.maxHeight = viewportHeight - sectionSizer.style.height - 240 + 'px';

    renderLevel(); // Re-render the level to fill the new viewport
});

function loadGameAssets() {
    splashStartTime = Date.now(); // Record when loading starts

    // Cache images
    cacheImages();
}
function tryToHideSplashScreen() {
    if (assetsLoadedCount === totalAssets) {
        const elapsedTime = Date.now() - splashStartTime;
        if (elapsedTime >= MIN_SPLASH_TIME) {
            hideSplashScreen();
            initGame();
        } else {
            // Wait for the remaining minimum time
            setTimeout(tryToHideSplashScreen, MIN_SPLASH_TIME - elapsedTime);
        }
    }
}
function hideSplashScreenAndStartGame() {
    hideSplashScreen();
    initGame();
    initAudioContext();
    //showMainMenu();
    startNewGame();
}
function hideSplashScreen() {
    if (splashScreen) {
        splashScreen.style.display = 'none';
    }
    if (gameCanvas) {
        gameCanvas.style.display = 'block'; // Make the canvas visible
    }
    if (uiContainer) {
        uiContainer.style.display = 'block'; // Make the UI visible
    }
}

// Entry point:
document.addEventListener('DOMContentLoaded', () => {
    // Initially hide game elements
    if (gameCanvas) gameCanvas.style.display = 'none';
    if (uiContainer) uiContainer.style.display = 'none';
    updateProgressBar(); // Initialize progress bar to 0%
    loadGameAssets(); // Start loading assets

    startGameButton.addEventListener('click', () => {
        hideSplashScreenAndStartGame();
    });
});

function setLastUpdateTime(newUpdateTime) {
    lastUpdateTime = newUpdateTime;
}
function getLastUpdateTime() {
    return lastUpdateTime;
}
function setCameraX(newX) {
    cameraX = newX;
}
function setCameraY(newY) {
    cameraY = newY;
}
export { setCameraX, setCameraY, getCachedImage, projectiles, getLastUpdateTime,setLastUpdateTime, updateStatusDisplay, gameLoop, updateCamera, updateGame, drawTile, renderLevel, ctx, tileSize, cameraX, cameraY, viewportWidth, viewportHeight, imageCache, tileImageCache, isPlayerTurn, initGame, getCurrentLevel, setCurrentLevel, loadImage, getIsPlayerTurn, setIsPlayerTurn };