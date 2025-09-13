// managers/uiManager.js
class UIManager {
    constructor(game, cameraManager) {
        this.game = game;
        this.cameraManager = cameraManager;
        this.splashScreen = document.getElementById('splash-screen');
        this.introScreen = document.getElementById('intro-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.worldMapElement = document.getElementById('world-map');
        this.startGameButton = document.getElementById('start-game-button');
        this.worldMapButton = document.getElementById('world-map-button');
        this.gameCanvas = document.getElementById('game-canvas');
        this.gameCanvas.width = game.canvasWidth;
        this.gameCanvas.height = game.canvasHeight;
        this.ctx = this.gameCanvas ? this.gameCanvas.getContext('2d') : null;
        this.isGameStarted = false;
        this.playerSize = 32; // Update playerSize to match tile size
        this.tileImages = {};
        this.playerImage = null; // To hold the player's tile image

        this.loadTileImages();
        this.loadPlayerImage(); // Load the player's image
    }

    initialize() {
        console.log('UIManager: Initializing...');
        this.showSplashScreen();
        if (this.startGameButton) {
            this.startGameButton.addEventListener('click', () => {
                if (!this.isGameStarted) {
                    this.showGameScreen();
                    this.game.gameManager.startNewGame();
                    //this.game.audioManager.startBackgroundMusic('townTheme');
                    console.log('Inital render zone');
                    this.isGameStarted = true; // <--- MOVE THIS LINE HERE
                    this.game.gameLoop();
                    //this.renderZone(); // Initial render when game starts
                }
            });
        }
        if (this.worldMapButton) {
            this.worldMapButton.addEventListener('click', () => this.showWorldMap());
        }
        if (this.worldMapElement) {
            this.setupWorldMap();
        }
    }
    loadPlayerImage() {
        return new Promise((resolve, reject) => {
            this.playerImage = new Image();
            this.playerImage.src = './assets/img/player_tile.png'; // Replace with your player image path
            this.playerImage.onload = () => {
                //console.log('UIManager: Player image loaded:', this.playerImage);
                resolve();
            };
            this.playerImage.onerror = reject;
        });
    }
    loadTileImages() {
        const imagePaths = this.game.mapManager.tileImagePaths;
        const promises = Object.keys(imagePaths).map((key) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = imagePaths[key];
                img.onload = () => {
                    this.tileImages[key] = img;
                    resolve();
                };
                img.onerror = reject;
            });
        });

        Promise.all(promises).then(() => {
            console.log('UIManager: Tile images loaded:', this.tileImages);
            // Optionally, trigger a render here if you want to ensure tiles are drawn immediately
            // if the game has already started.
            if (this.isGameStarted && this.game.gameManager.getCurrentState()) {
                this.renderZone();
            }
        }).catch(error => {
            console.error('UIManager: Error loading tile images:', error);
        });
    }

    showSplashScreen() {
        if (this.splashScreen) this.splashScreen.style.display = 'flex';
        if (this.introScreen) this.introScreen.style.display = 'none';
        if (this.gameScreen) this.gameScreen.style.display = 'none';
        if (this.worldMapElement) this.worldMapElement.style.display = 'none';
    }

    showIntroScreen() {
        if (this.splashScreen) this.splashScreen.style.display = 'none';
        if (this.introScreen) this.introScreen.style.display = 'flex';
        if (this.gameScreen) this.gameScreen.style.display = 'none';
        if (this.worldMapElement) this.worldMapElement.style.display = 'none';
    }

    showGameScreen() {
        if (this.splashScreen) this.splashScreen.style.display = 'none';
        if (this.introScreen) this.introScreen.style.display = 'none';
        if (this.gameScreen) this.gameScreen.style.display = 'block';
        if (this.worldMapElement) this.worldMapElement.style.display = 'none';
        this.renderZone(); // Render when navigating back to the game screen
    }

    showWorldMap() {
        if (this.gameScreen) this.gameScreen.style.display = 'none';
        if (this.worldMapElement) this.worldMapElement.style.display = 'flex';
        this.setupWorldMap(); // Re-render in case data changed
    }

    setupWorldMap() {
        if (this.worldMapElement && this.game.mapManager.getWorldMapRegions()) {
            this.worldMapElement.innerHTML = '<h2>World Map</h2>';
            this.game.mapManager.getWorldMapRegions().forEach(region => {
                const regionElement = document.createElement('div');
                regionElement.classList.add('world-map-region');
                regionElement.style.position = 'absolute';
                regionElement.style.left = `${region.x}px`;
                regionElement.style.top = `${region.y}px`;
                regionElement.style.width = `${region.width}px`;
                regionElement.style.height = `${region.height}px`;
                regionElement.dataset.zone = region.zoneKey;
                regionElement.textContent = region.name;
                regionElement.addEventListener('click', () => this.game.gameManager.changeZone(region.zoneKey));
                this.worldMapElement.appendChild(regionElement);
            });
        }
    }

    renderZone() {
        //console.log('UIManager: renderZone called');

        if (this.ctx && this.game.mapManager.currentZone && this.game.gameManager && this.game.gameManager.getCurrentState() && this.game.gameManager.getCurrentState().player) {
            this.ctx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height); // Clear the canvas

            const currentZone = this.game.mapManager.currentZone;
            const camera = this.cameraManager.getViewport();
            const player = this.game.gameManager.getCurrentState().player;
            const tiles = this.game.mapManager.getTiles();
            const tileSize = this.game.mapManager.getTileSize();

            //console.log('UIManager: Camera viewport:', camera);

            // Draw the tiles within the camera's viewport
            for (let y = 0; y < currentZone.height / tileSize; y++) {
                for (let x = 0; x < currentZone.width / tileSize; x++) {
                    const tileType = tiles[y][x];
                    const tileImage = this.tileImages[tileType];

                    if (tileImage) {
                        // Calculate the position to draw the tile on the canvas, considering the camera offset
                        const drawX = x * tileSize - camera.x;
                        const drawY = y * tileSize - camera.y;

                        // Only draw tiles that are within the viewport (plus a small buffer)
                        if (drawX >= -tileSize && drawX <= this.gameCanvas.width && drawY >= -tileSize && drawY <= this.gameCanvas.height) {
                            this.ctx.drawImage(tileImage, drawX, drawY, tileSize, tileSize);
                        }
                    }
                }
            }

             // Draw the player tile
             if (this.playerImage) {
                this.ctx.drawImage(this.playerImage, player.position.x - camera.x, player.position.y - camera.y, this.playerSize, this.playerSize);
            } else {
                // Fallback to red rectangle if player image hasn't loaded
                this.ctx.fillStyle = 'red';
                this.ctx.fillRect(player.position.x - camera.x, player.position.y - camera.y, this.playerSize, this.playerSize);
            }

        } else {
            console.log('UIManager: renderZone - conditions not met.');
        }
    }

    // ... other UI methods
}
export default UIManager;