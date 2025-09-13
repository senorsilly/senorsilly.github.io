class CraftingManager {
    constructor(game) {
        this.game = game;
        this.recipes = {}; // We'll populate this with recipes later
        this.unlockedRecipes = {};
    }

    // Methods for loading recipes, checking if craftable, and crafting
    loadRecipes() {
        // Load recipes from a data source (e.g., JSON)
        this.recipes = {
            // Example:
            'unfinishedBricks': {
                ingredients: { 'clay': 1, 'straw': 1 },
                result: 'unfinishedBricks',
                quantity: 2,
                experienceGain: 5
            }
        };
        console.log('CraftingManager: Recipes loaded:', this.recipes);
    }

    canCraft(recipeKey) {
        const recipe = this.recipes[recipeKey];
        if (!recipe || !this.game.gameState.player.learnedRecipes[recipeKey]) {
            return false;
        }
        for (const ingredient in recipe.ingredients) {
            if (!this.game.gameState.player.inventory[ingredient] || this.game.gameState.player.inventory[ingredient] < recipe.ingredients[ingredient]) {
                return false;
            }
        }
        return true;
    }

    craft(recipeKey) {
        if (this.canCraft(recipeKey)) {
            const recipe = this.recipes[recipeKey];
            for (const ingredient in recipe.ingredients) {
                this.game.gameManager.addItemToInventory(ingredient, -recipe.ingredients[ingredient]);
            }
            this.game.gameManager.addItemToInventory(recipe.result, recipe.quantity);
            this.game.gameManager.gainExperience('crafting', recipe.experienceGain);
            console.log('CraftingManager: Crafted', recipe.result);
            return true;
        } else {
            console.log('CraftingManager: Cannot craft', recipeKey);
            return false;
        }
    }

    learnRecipe(recipeKey) {
        this.game.gameManager.learnRecipe(recipeKey);
    }
}
export default CraftingManager;