// game.js
import AudioManager from './audioManager.js';
import MapManager from './mapManager.js';
import InputManager from './inputManager.js';
import SaveManager from './saveManager.js';
import UIManager from './uiManager.js';
import GameManager from './gameManager.js';
import CraftingManager from './craftingManager.js';
import InventoryManager from './inventoryManager.js'; // We might not need a separate InventoryManager initially
import NpcManager from './npcManager.js'; // Let's hold off on this for now
import CameraManager from './cameraManager.js';

class Game {
    constructor() {
        this.canvasWidth = 400; // Define canvas dimensions here
        this.canvasHeight = 400;
        this.audioManager = new AudioManager();
        this.mapManager = new MapManager();
        this.inputManager = new InputManager();
        this.saveManager = new SaveManager();
        this.cameraManager = new CameraManager(this.canvasWidth, this.canvasHeight, this.canvasWidth, this.canvasHeight, this.inputManager); // Example world bounds
        this.uiManager = new UIManager(this, this.cameraManager); // Pass CameraManager to UIManager
        this.gameManager = new GameManager(this, this.cameraManager); // Pass CameraManager to GameManager
        this.craftingManager = new CraftingManager(this);
         this.inventoryManager = new InventoryManager(this);
        this.npcManager = new NpcManager(this);

        this.isGameLoaded = false;
        this.boundGameLoop = this.gameLoop.bind(this); // Bind gameLoop once
    }

    async init() {
        console.log('Game initializing...');
        this.uiManager.showSplashScreen();

        await new Promise(resolve => setTimeout(resolve, 2000));

        await this.audioManager.loadAssets();
        await this.mapManager.loadMapData();
        this.inputManager.setupInputListeners();
        this.uiManager.initialize();

        const savedData = this.saveManager.loadGame();
        if (savedData) {
            this.gameManager.loadState(savedData);
            this.uiManager.showGameScreen();
            //this.audioManager.startBackgroundMusic('townTheme');
            this.isGameLoaded = true;
            requestAnimationFrame(this.boundGameLoop); // Start the loop
        } else {
            this.uiManager.showIntroScreen();
        }

        // We don't need to call gameLoop here directly anymore if we start it after loading or intro
        //this.gameLoop();
    }

    gameLoop() {
        if (!this.uiManager.isGameStarted ) {
            requestAnimationFrame(this.gameLoop.bind(this));
            return;
        }
        //console.log('prepare update');
        //console.log('gameLoop - this.game:', this.game); // Check the game instance
        //console.log('gameLoop - this.game.gameManager:', this.game.gameManager); // Check the gameManager instance
        this.gameManager.update();
        this.uiManager.renderZone(); // Rendering is now handled by UIManager based on camera
        requestAnimationFrame(this.boundGameLoop); // Use the bound function for the next frame
    }
}

const game = new Game();
game.init();