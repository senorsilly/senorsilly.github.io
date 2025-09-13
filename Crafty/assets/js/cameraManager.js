// managers/cameraManager.js
class CameraManager {
    constructor(viewportWidth, viewportHeight, worldWidth, worldHeight, inputManager) {
        this.x = 0;
        this.y = 0;
        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
        this.inputManager = inputManager;
    }

    followPlayer(playerX, playerY) {
        let targetX = playerX - this.viewportWidth / 2;
        let targetY = playerY - this.viewportHeight / 2;

        // Clamp the target position
        targetX = Math.max(0, Math.min(targetX, this.worldWidth - this.viewportWidth));
        targetY = Math.max(0, Math.min(targetY, this.worldHeight - this.viewportHeight));

        this.x = targetX;
        this.y = targetY;
    }

    getViewport() {
        return {
            x: this.x,
            y: this.y,
            width: this.viewportWidth,
            height: this.viewportHeight
        };
    }
}

export default CameraManager;