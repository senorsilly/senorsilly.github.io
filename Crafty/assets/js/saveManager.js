class SaveManager {
    saveGame(gameState) {
        localStorage.setItem('craftingGameSave', JSON.stringify(gameState));
        console.log('SaveManager: Game saved:', gameState);
    }

    loadGame() {
        const savedData = localStorage.getItem('craftingGameSave');
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            console.log('SaveManager: Game loaded:', parsedData);
            return parsedData;
        }
        return null;
    }

    clearSaveGame() {
        localStorage.removeItem('craftingGameSave');
        console.log('SaveManager: Save game cleared.');
    }
}
export default SaveManager;