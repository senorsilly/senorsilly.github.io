// managers/gameManager.js
class GameManager {
    constructor(game, cameraManager) {
        this.game = game;
        this.cameraManager = cameraManager;
        this.gameState = {
            player: {
                position: { x: 0, y: 0 },
                inventory: {},
                currency: { copper: 0, silver: 0, gold: 0, platinum: 0 },
                learnedRecipes: {},
                experience: { crafting: 0, gathering: 0 }
            },
            currentZone: 'home',
            // ... other game state
        };
        this.playerSpeed = 5; // Define playerSpeed here
    }

    startNewGame() {
        console.log('GameManager: Starting new game...');
        this.gameState = {
            player: {
                position: { x: 100, y: 100 }, // Initial player position
                inventory: {},
                currency: { copper: 100, silver: 0, gold: 0, platinum: 0 },
                learnedRecipes: {},
                experience: { crafting: 0, gathering: 0 }
            },
            currentZone: 'home',
            // ... initial game state
        };
        //console.log('GameManager: gameState after startNewGame:', this.gameState); // ADD THIS LOG
        this.game.mapManager.loadZone(this.gameState.currentZone);
        const zoneDimensions = this.game.mapManager.getCurrentZoneDimensions();
        this.game.cameraManager.worldWidth = zoneDimensions.width;
        this.game.cameraManager.worldHeight = zoneDimensions.height;
        this.cameraManager.followPlayer(this.gameState.player.position.x, this.gameState.player.position.y);
        // this.game.uiManager.renderZone(); // Rendering is handled in the game loop now
    }

    loadState(savedData) {
        console.log('GameManager: Loading saved state...', savedData);
        this.gameState = savedData;
        this.game.mapManager.loadZone(this.gameState.currentZone);
        this.cameraManager.followPlayer(this.gameState.player.position.x, this.gameState.player.position.y);
        this.game.uiManager.renderZone(); // Render loaded zone
    }

    getCurrentState() {
        return this.gameState;
    }

    update() {
        const currentZoneDimensions = this.game.mapManager.getCurrentZoneDimensions();
        const playerSize = this.game.uiManager.playerSize;
        const newPosition = { ...this.gameState.player.position };
        const tileSize = this.game.mapManager.getTileSize();
        const tiles = this.game.mapManager.getTiles();

        let intendedX = newPosition.x;
        let intendedY = newPosition.y;

        // Handle input and set intended new position
        if (this.game.inputManager.isKeyDown('w')) intendedY -= this.playerSpeed;
        if (this.game.inputManager.isKeyDown('s')) intendedY += this.playerSpeed;
        if (this.game.inputManager.isKeyDown('a')) intendedX -= this.playerSpeed;
        if (this.game.inputManager.isKeyDown('d')) intendedX += this.playerSpeed;

        let blockedX = false;
        let blockedY = false;

        const currentPlayerTopLeftX = Math.floor(newPosition.x / tileSize);
        const currentPlayerTopLeftY = Math.floor(newPosition.y / tileSize);
        const currentPlayerBottomRightX = Math.floor((newPosition.x + playerSize - 1) / tileSize);
        const currentPlayerBottomRightY = Math.floor((newPosition.y + playerSize - 1) / tileSize);

        // Check for collisions in the intended movement direction
        if (this.game.inputManager.isKeyDown('w')) {
            const targetTopY = Math.floor((intendedY) / tileSize);
            if (tiles[targetTopY]?.[currentPlayerBottomRightX] === 'wall') blockedY = true;
            //console.log(`Blocked Y ${blockedY}`);
        }
        if (this.game.inputManager.isKeyDown('s')) {
            const targetBottomY = Math.floor((intendedY + playerSize - 1) / tileSize);
            if (tiles[targetBottomY]?.[currentPlayerTopLeftX] === 'wall') blockedY = true;
            //console.log(`Blocked Y ${blockedY}`);
        }
        if (this.game.inputManager.isKeyDown('a')) {
            const targetLeftX = Math.floor((intendedX) / tileSize);
            if (tiles[currentPlayerTopLeftY]?.[targetLeftX] === 'wall') blockedX = true;
            //console.log(`Blocked X ${blockedX}`);
        }
        if (this.game.inputManager.isKeyDown('d')) {
            const targetRightX = Math.floor((intendedX + playerSize - 1) / tileSize);
            if (tiles[currentPlayerBottomRightY]?.[targetRightX] === 'wall') blockedX = true;
            //console.log(`Blocked X ${blockedX}`);
        }

        // Apply movement if not blocked
        if (!blockedX) newPosition.x = intendedX;
        if (!blockedY) newPosition.y = intendedY;

        // Keep player within overall map boundaries (independent of tiles)
        if (
            newPosition.x >= 0 &&
            newPosition.x <= currentZoneDimensions.width - playerSize &&
            newPosition.y >= 0 &&
            newPosition.y <= currentZoneDimensions.height - playerSize
        ) {
            this.gameState.player.position = newPosition;
        }

        // Keep the camera following the player
        this.cameraManager.followPlayer(this.gameState.player.position.x, this.gameState.player.position.y);
    }

    changeZone(zoneKey) {
        //console.log(`GameManager: Changing zone to ${zoneKey}`);
        this.gameState.currentZone = zoneKey;
        this.game.mapManager.loadZone(zoneKey);
        if (zoneKey === 'worldMap') {
            this.game.uiManager.showWorldMap();
        } else {
            this.game.uiManager.showGameScreen();
            this.game.uiManager.renderZone(); // Render the new zone
        }
    }

    addItemToInventory(itemKey, quantity = 1) {
        this.gameState.player.inventory[itemKey] = (this.gameState.player.inventory[itemKey] || 0) + quantity;
        console.log('GameManager: Item added to inventory:', itemKey, this.gameState.player.inventory);
        // this.game.uiManager.updateInventoryDisplay(this.gameState.player.inventory); // Implement in UIManager
    }

    addCurrency(type, amount) {
        this.gameState.player.currency[type] += amount;
        console.log('GameManager: Currency added:', type, amount, this.gameState.player.currency);
        // this.game.uiManager.updateCurrencyDisplay(this.gameState.player.currency); // Implement in UIManager
    }

    removeCurrency(type, amount) {
        if (this.gameState.player.currency[type] >= amount) {
            this.gameState.player.currency[type] -= amount;
            console.log('GameManager: Currency removed:', type, amount, this.gameState.player.currency);
            // this.game.uiManager.updateCurrencyDisplay(this.gameState.player.currency); // Implement in UIManager
            return true;
        }
        console.log('GameManager: Not enough currency to remove:', type, amount, this.gameState.player.currency);
        // this.game.uiManager.showNotification("Not enough currency!"); // Implement in UIManager
        return false;
    }

    learnRecipe(recipeKey) {
        this.gameState.player.learnedRecipes[recipeKey] = true;
        console.log('GameManager: Learned recipe:', recipeKey, this.gameState.player.learnedRecipes);
        // this.game.uiManager.updateCraftingUI(this.gameState.player.learnedRecipes, this.game.craftingManager.recipes); // Implement in UIManager
        // this.game.uiManager.showNotification(`Learned recipe: ${recipeKey}`); // Implement in UIManager
    }

    gainExperience(skill, amount) {
        this.gameState.player.experience[skill] += amount;
        console.log('GameManager: Gained experience:', skill, amount, this.gameState.player.experience);
        // this.game.uiManager.updateExperienceUI(this.gameState.player.experience); // Implement in UIManager
        // Potentially trigger level-up logic here
    }

    // ... other game management methods
}
export default GameManager;