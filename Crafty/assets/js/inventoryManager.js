// For now, we'll manage inventory directly within GameManager's gameState
// We might refactor this into a separate manager later if needed for more complex logic
class InventoryManager {
    constructor(game) {
        this.game = game;
    }

    addItem(itemKey, quantity = 1) {
        this.game.gameManager.addItemToInventory(itemKey, quantity);
    }

    removeItem(itemKey, quantity = 1) {
        const currentQuantity = this.game.gameState.player.inventory[itemKey] || 0;
        if (currentQuantity >= quantity) {
            this.game.gameState.player.inventory[itemKey] -= quantity;
            if (this.game.gameState.player.inventory[itemKey] === 0) {
                delete this.game.gameState.player.inventory[itemKey];
            }
            console.log('InventoryManager: Removed', quantity, itemKey);
            // this.game.uiManager.updateInventoryDisplay(this.game.gameState.player.inventory);
            return true;
        }
        console.log('InventoryManager: Not enough', itemKey, 'to remove');
        // this.game.uiManager.showNotification(`Not enough ${itemKey}`);
        return false;
    }

    getItemCount(itemKey) {
        return this.game.gameState.player.inventory[itemKey] || 0;
    }
}
export default InventoryManager;