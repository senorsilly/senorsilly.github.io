import { Item } from './items.js'
import { displayFloatingText } from './ui.js'
import { playerX, playerY, setPlayerX, setPlayerY } from './player.js'
import { tileSize, viewportWidth, viewportHeight, setCameraX, setCameraY } from './game.js'
import { getCurrentMapId, setCurrentMapId, maps, exploredMaps, setMaps, setMonseters, setExploredMaps } from './map.js'
import { monsters } from './monster.js'
import {startIntro } from './intro.js'
const mainMenu = document.getElementById('main-menu');
const newGameButton = document.getElementById('new-game-button');
const loadGameButton = document.getElementById('load-game-button');
const saveGameButton = document.getElementById('save-game-button');

const loadGameScreen = document.getElementById('load-game-screen');
const savedGamesList = document.getElementById('saved-games-list');
const backToMainFromLoad = document.getElementById('back-to-main-from-load');
const GameElements = document.getElementById('GameElements');

// Function to hide all menu screens
function hideAllMenus() {
    const menus = document.querySelectorAll('.menu-screen');
    menus.forEach(menu => menu.style.display = 'none');
}

// Event listeners for the main menu buttons
newGameButton.addEventListener('click', () => {
    hideAllMenus();
    startNewGame(); // Your function to start a new game
    // Start your game loop or game initialization here
});

loadGameButton.addEventListener('click', () => {
    hideAllMenus();
    loadGameScreen.style.display = 'block';
    populateSavedGamesList(); // Function to display saved games
});

// Event listeners for the load game screen
backToMainFromLoad.addEventListener('click', () => {
    hideAllMenus();
    mainMenu.style.display = 'block';
});
function populateSavedGamesList() {
    savedGamesList.innerHTML = ''; // Clear previous list
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('windyCanvasSave_')) { // Assuming you prefix your save keys
            const saveSlot = document.createElement('div');
            saveSlot.textContent = `Save Slot ${key.split('_')[0]}`; // Display a simple slot name
            saveSlot.classList.add('saved-game-slot');
            saveSlot.addEventListener('click', () => {
                loadSpecificGame(key); // Function to load a specific save
            });
            savedGamesList.appendChild(saveSlot);
        }
    }
    if (savedGamesList.children.length === 0) {
        const noSaves = document.createElement('p');
        noSaves.textContent = "No saved games found.";
        savedGamesList.appendChild(noSaves);
    }
}

function loadSpecificGame(saveKey) {
    const saveString = localStorage.getItem(saveKey);
    if (saveString) {
        gameState = JSON.parse(saveString);
        hideAllMenus();
        loadLevel(gameState.currentMapId, gameState.player.tileX, gameState.player.tileY);
        //updateUI();
        // Start your game loop if it's not already running
        showGameElements();
    } else {
        console.error(`Error loading save: ${saveKey}`);
    }
}

// After the splash screen logic (e.g., after a delay or animation)
function showMainMenu() {
    mainMenu.style.display = 'block';
}

// Example of how you might transition from splash to main menu
// setTimeout(showMainMenu, 3000); // Show main menu after 3 seconds
//showMainMenu(); // For testing, show immediately

let gameState = {
    currentMapId: 'town',
    player: {
        tileX: 5,
        tileY: 5,
        health: 100,
        mana: 50,
        inventory: [],
        equipment: {},
        exploredMaps: {}, // Object to store explored state for each map
        // ... other player-related data ...
    },
    maps: {}, // Store the state of each generated map (especially for changes like mining)
    monsters: [], // Array of monster objects (including their positions, health, etc.)
    gameTime: 0, // Elapsed game time (optional)
    // ... other global game state ...
};
function startNewGame() {
    gameState = {
        currentMapId: 'town',
        player: {
            tileX: 5,
            tileY: 5,
            health: 100,
            mana: 50,
            inventory: [new Item("Basic Sword", "weapon", "A simple sword.", 3, 1, 1, 'assets/img/items/sword_basic.png')],
            equipment: { hand: null, offhand: null, head: null, body: null, feet: null },
            exploredMaps: {},
        },
        maps: {},
        monsters: [],
        gameTime: 0,
    };
    startIntro();
    //generateLevel(0); // Generate the starting level
    //loadLevel(gameState.currentMapId, gameState.player.tileX, gameState.player.tileY); // Load and display the starting level
    //updateUI(); // Update health, mana, inventory displays
    //console.log("New game started.");
}
function showGameElements() {
    GameElements.style.display = "";
    hideAllMenus();
}
function saveGame() {
    try {
        const saveString = JSON.stringify(gameState);
        localStorage.setItem(`windyCanvasSave_`, saveString);
        displayFloatingText("Game saved!", playerX * tileSize, playerY * tileSize - 20, 'success');
        console.log("Game state saved.");
    } catch (e) {
        console.error("Error saving game:", e);
        displayFloatingText("Save failed!", playerX * tileSize, playerY * tileSize - 20, 'error');
    }
}
saveGameButton.addEventListener('click', saveGame);
function loadGame() {
    try {
        const saveString = localStorage.getItem('windyCanvasSave_');
        if (saveString) {
            gameState = JSON.parse(saveString);
            loadLevel(gameState.currentMapId, gameState.player.tileX, gameState.player.tileY); // Load the saved level
            showGameElements();
            //updateUI(); // Update UI elements based on the loaded state
            console.log("Game state loaded.");
            displayFloatingText("Game loaded!", playerX * tileSize, playerY * tileSize - 20, 'success');
        } else {
            displayFloatingText("No saved game found.", playerX * tileSize, playerY * tileSize - 20, 'info');
            console.log("No saved game found.");
        }
    } catch (e) {
        console.error("Error loading game:", e);
        displayFloatingText("Load failed!", playerX * tileSize, playerY * tileSize - 20, 'error');
    }
}
function loadLevel(levelId, playerX, playerY) {
    setCurrentMapId(levelId);
    setPlayerX(playerX);
    setPlayerY(playerY);

    //if (!gameState.maps[levelId]) {
    //    // Generate the level if it doesn't exist in the saved state
    //    let mapWidth = 60;
    //    let mapHeight = 40;
    //    if (levelId === 0) {
    //        gameState.maps[levelId] = generateResourceMap(mapWidth, mapHeight, levelId);
    //    } else if (levelId === 1) {
    //        gameState.maps[levelId] = generateMazePrim(mapWidth / 2, mapHeight / 2);
    //        mapWidth = gameState.maps[levelId][0].length;
    //        mapHeight = gameState.maps[levelId].length;
    //    } else if (levelId === 2) {
    //        gameState.maps[levelId] = generateMazeKruskal(mapWidth / 2, mapHeight / 2);
    //        mapWidth = gameState.maps[levelId][0].length;
    //        mapHeight = gameState.maps[levelId].length;
    //    }
    //    gameState.maps[levelId] = AddStairsAndMonsters(gameState.maps[levelId], mapWidth, mapHeight, levelId);
    //}

    setMaps(gameState.maps); // Set the current game map
    setMonseters(gameState.monsters)

    // Load explored state
    setExploredMaps(gameState.player.exploredMaps);

    // Update camera position based on player
    setCameraX(playerX * tileSize) - (viewportWidth / 2);
    setCameraY(playerY * tileSize) - (viewportHeight / 2);
    //clampCamera();

    console.log(`Loaded level ${levelId} at (${playerX}, ${playerY}).`);
}
function updateExploredMaps(x, y, tile) {
    if (!exploredMap[y]) {
        exploredMap[y] = [];
    }
    exploredMap[y][x] = true;
    if (tile) {
        maps[currentMapId][y][x] = tile; // Update the actual map if needed (e.g., mined stone)
        gameState.maps[currentMapId][y][x] = tile; // Update the saved map state
    }
    if (!gameState.player.exploredMaps[currentMapId]) {
        gameState.player.exploredMaps[currentMapId] = initializeExploredMap(maps[currentMapId]);
    }
    gameState.player.exploredMaps[currentMapId][y][x] = true;
}

function updateExploredMapsFull(map) {
    exploredMap = initializeExploredMap(map);
    if (!gameState.player.exploredMaps[currentMapId]) {
        gameState.player.exploredMaps[currentMapId] = initializeExploredMap(map);
    } else {
        gameState.player.exploredMaps[currentMapId] = exploredMap;
    }
}

function initializeExploredMap(map) {
    return map.map(row => row.map(() => false));
}

export { showMainMenu, startNewGame, showGameElements };