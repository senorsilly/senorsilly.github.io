//crafting.js
import { getItem, getEquipment } from './items.js'; // Import your items and potential building
import { inventory, addItemToInventory, updateInventoryDisplay } from './inventory.js';
import { playSoundEffect } from './audio.js'
import { getCachedImage } from './game.js'
const craftingModal = document.getElementById('craftingModal');
const craftingModalOverlay = document.getElementById('craftingModalOverlay');
const craftingRecipesList = document.getElementById('craftingRecipesList');
const requirementsList = document.getElementById('requirementsList');
const craftButton = document.getElementById('craftButton');
const craftingMessage = document.getElementById('craftingMessage');
const closeCraftingModalButton = document.querySelector('#craftingModal .close-button');
const backToRecipesButton = document.getElementById('backToRecipesButton');
const craftingCategoriesContainer = document.getElementById('craftingCategories');
const outputDetails = document.getElementById('outputDetails');
let currentCategory = 'all';

let currentCraftingRecipe = null;

// Define your crafting recipes
const craftingRecipes = [
    {
        name: "Stone Bricks",
        output: getItem("Stone Bricks"),
        category: "Crafted Material",
        cost: { [getItem("Stone").name]: { item: getItem("Stone"), quantity: 3 } }
    },
    {
        name: "Forge",
        output: getItem("Forge"), // Assuming you have a forge building item
        category: "Building",
        cost: {
            [getItem("Stone Bricks").name]: { item: getItem("Stone Bricks"), quantity: 10 },
            [getItem("Stone").name]: { item: getItem("Stone"), quantity: 5 }
        }
    },
    {
        name: "Iron Bar",
        output: getItem("Iron Bar"), // Assuming you have an iron bar item
        category: "Smelting",
        cost: { [getItem("Iron Ore").name]: { item: getItem("Iron Ore"), quantity: 2 } },
        requiredBuilding: getItem("Forge") // Requires a forge
    },
    {
        name: "Copper Bar",
        output: getItem("Copper Bar"),
        category: "Smelting",
        cost: { [getItem("Copper Ore").name]: { item: getItem("Copper Ore"), quantity: 2 } },
        requiredBuilding: getItem("Forge")
    },
    {
        name: "Health Potion",
        output: getItem("Health Potion"),
        category: "Potions",
        cost: { [getItem("Herb").name]: { item: getItem("Herb"), quantity: 2 } }
    },
    {
        name: "Iron Sword",
        output: getEquipment("Iron Sword"),
        category: "Weapons",
        cost: { [getItem("Iron Bar").name]: { item: getItem("Iron Bar"), quantity: 2 } },
        requiredBuilding: getItem("Forge")
    },
    {
        name: "Iron Armor",
        output: getEquipment("Iron Armor"),
        category: "Armor",
        cost: { [getItem("Iron Bar").name]: { item: getItem("Iron Bar"), quantity: 5 } },
        requiredBuilding: getItem("Forge")
    },
    {
        name: "Wooden Helmet",
        output: getEquipment("Wooden Helmet"),
        category: "Armor",
        cost: { [getItem("Wood").name]: { item: getItem("Wood"), quantity: 2 } },
        requiredBuilding: getEquipment("Iron Knife")
    },
    {
        name: "Wooden Sword",
        output: getEquipment("Wooden Sword"),
        category: "Weapons",
        cost: { [getItem("Wood").name]: { item: getItem("Wood"), quantity: 2 } },
        requiredBuilding: getEquipment("Iron Knife")
    },
    {
        name: getEquipment("Iron Helmet").name,
        output: getEquipment("Iron Helmet"),
        category: "Armor",
        cost: { [getItem("Iron Bar").name]: { item: getItem("Iron Bar"), quantity: 2 } },
        requiredBuilding: getItem("Forge")
    },
    {
        name: getEquipment("Iron Knife").name,
        output: getEquipment("Iron Knife"),
        category: "Weapons",
        cost: { [getItem("Iron Bar").name]: { item: getItem("Iron Bar"), quantity: 1 } },
        requiredBuilding: getItem("Forge")
    },
];

function openCraftingModal() {
    populateCraftingRecipes(currentCategory);
    craftingModal.style.display = 'block';
    craftingModalOverlay.style.display = 'block';
    currentCraftingRecipe = null;
    updateCraftingRequirementsDisplay();
    craftingMessage.textContent = '';
    // Initially hide the back button
    backToRecipesButton.style.display = 'none';
}

function closeCraftingModal() {
    craftingModal.style.display = 'none';
    craftingModalOverlay.style.display = 'none';
}

closeCraftingModalButton.addEventListener('click', closeCraftingModal);
craftingModalOverlay.addEventListener('click', closeCraftingModal);
craftButton.addEventListener('click', attemptCraft);

function populateCraftingRecipes(category = 'all') {
    craftingRecipesList.innerHTML = '';
    const filteredRecipes = category === 'all'
        ? craftingRecipes
        : craftingRecipes.filter(recipe => recipe.category === category);

    filteredRecipes.forEach((recipe, indexInFiltered) => {
        // Find the original index in the full craftingRecipes array
        const originalIndex = craftingRecipes.indexOf(recipe);

        const recipeDiv = document.createElement('div');
        recipeDiv.classList.add('crafting-recipe');
        recipeDiv.textContent = recipe.name;
        recipeDiv.dataset.recipeIndex = originalIndex; // Store the original index
        recipeDiv.addEventListener('click', selectCraftingRecipe);
        try {
            if (recipe.output.icon) {
                const icon = getCachedImage(recipe.output.icon, recipe.name, 'crafting-icon');
                recipeDiv.appendChild(icon);
            }
        } catch (error) {
            console.log(recipe)
            console.log(error);
        }

        craftingRecipesList.appendChild(recipeDiv);
    });
}
function selectCraftingRecipe(event) {
    const originalIndex = event.target.dataset.recipeIndex;
    if (originalIndex !== undefined) {
        currentCraftingRecipe = craftingRecipes[parseInt(originalIndex)]; // Use the original index
        document.querySelectorAll('.crafting-recipe').forEach(el => el.classList.remove('selected'));
        event.target.classList.add('selected');
        updateCraftingRequirementsDisplay();
        craftingMessage.textContent = '';
        // Show the back button when a recipe is selected
        //backToRecipesButton.style.display = 'block';
    }
}
function selectCraftingCategory(event) {
    const selectedCategory = event.target.dataset.category;
    if (selectedCategory) {
        currentCategory = selectedCategory;
        // Update active button style
        document.querySelectorAll('.category-button').forEach(button => {
            button.classList.remove('active');
            if (button.dataset.category === currentCategory) {
                button.classList.add('active');
            }
        });
        populateCraftingRecipes(currentCategory);
        currentCraftingRecipe = null;
        updateCraftingRequirementsDisplay();
        craftingMessage.textContent = '';
    }
}
// Add event listeners for category buttons
craftingCategoriesContainer.addEventListener('click', (event) => {
    if (event.target.classList.contains('category-button')) {
        selectCraftingCategory(event);
    }
});

function goBackToRecipes() {
    currentCraftingRecipe = null;
    document.querySelectorAll('.crafting-recipe').forEach(el => el.classList.remove('selected'));
    updateCraftingRequirementsDisplay();
    craftingMessage.textContent = '';
    // Hide the back button
    backToRecipesButton.style.display = 'none';
}

backToRecipesButton.addEventListener('click', goBackToRecipes);

function updateCraftingRequirementsDisplay() {
    requirementsList.innerHTML = '';
    craftButton.disabled = true;

    if (currentCraftingRecipe) {
        let canCraftEventually = true; // Assume we can eventually craft

        outputDetails.innerHTML = currentCraftingRecipe.output.description;

        for (const ingredientName in currentCraftingRecipe.cost) {
            const required = currentCraftingRecipe.cost[ingredientName];
            const playerHasAmount = inventory.find(item => item.name === ingredientName)?.quantity || 0;
            const listItem = document.createElement('li');
            try {
                listItem.textContent = `${required.item.name}: ${playerHasAmount}/${required.quantity}`;
            } catch (ex) {
                console.log(currentCraftingRecipe);
                console.log(ex);
            }
            
            if (playerHasAmount < required.quantity) {
                listItem.classList.add('missing-requirement');
                const prerequisiteRecipe = findCraftingRecipeByOutput(required.item);
                if (prerequisiteRecipe) {
                    listItem.textContent += ' (Can be auto-crafted)';
                } else {
                    canCraftEventually = false; // Cannot craft if a prerequisite can't be obtained
                }
            }
            if (required.item.icon) {
                const icon = getCachedImage(required.item.icon, required.item.name, 'crafting-icon');
                listItem.appendChild(icon);
            }
            requirementsList.appendChild(listItem);
        }

        // Enable the craft button if all requirements can eventually be met
        craftButton.disabled = !canCraftEventually;

    } else {
        requirementsList.innerHTML = 'Select a recipe to see the requirements.';
    }
}

function attemptCraft() {
    if (currentCraftingRecipe && !craftButton.disabled) {
        const canCraftFinal = autoCraftPrerequisites(currentCraftingRecipe);
        if (canCraftFinal) {
            // Deduct ingredients for the final recipe
            for (const ingredientName in currentCraftingRecipe.cost) {
                const required = currentCraftingRecipe.cost[ingredientName];
                const inventoryItem = inventory.find(item => item.name === ingredientName);
                if (inventoryItem) {
                    inventoryItem.quantity -= required.quantity;
                    if (inventoryItem.quantity <= 0) {
                        const index = inventory.indexOf(inventoryItem);
                        inventory.splice(index, 1);
                    }
                }
            }

            // Add crafted item to inventory
            //console.log(currentCraftingRecipe.output);
            addItemToInventory(currentCraftingRecipe.output);
            craftingMessage.textContent = `Crafted ${currentCraftingRecipe.output.name}!`;
            updateInventoryDisplay();
            updateCraftingRequirementsDisplay(); // Update requirements after crafting
            playSoundEffect('craftSuccess');
        } else {
            craftingMessage.textContent = 'Could not craft due to missing prerequisites or resources.';
        }
    }
}

function autoCraftPrerequisites(recipeToCraft, currentlyCrafting = new Set()) {
    if (!recipeToCraft) {
        return true;
    }

    for (const ingredientName in recipeToCraft.cost) {
        const required = recipeToCraft.cost[ingredientName];
        let playerHasAmount = inventory.find(item => item.name === ingredientName)?.quantity || 0;

        while (playerHasAmount < required.quantity) {
            const prerequisiteRecipe = findCraftingRecipeByOutput(required.item);

            if (prerequisiteRecipe && !currentlyCrafting.has(prerequisiteRecipe)) {
                currentlyCrafting.add(prerequisiteRecipe);
                const canCraftPrerequisite = autoCraftPrerequisites(prerequisiteRecipe, currentlyCrafting);
                currentlyCrafting.delete(prerequisiteRecipe);

                if (canCraftPrerequisite) {
                    // Deduct resources for the prerequisite
                    for (const preIngName in prerequisiteRecipe.cost) {
                        const preRequired = prerequisiteRecipe.cost[preIngName];
                        const invItem = inventory.find(item => item.name === preIngName);
                        if (invItem) {
                            invItem.quantity -= preRequired.quantity;
                            if (invItem.quantity <= 0) {
                                const index = inventory.indexOf(invItem);
                                inventory.splice(index, 1);
                            }
                        }
                    }
                    // Add the prerequisite item to inventory
                    addItemToInventory(prerequisiteRecipe.output);
                    craftingMessage.textContent = `Auto-crafted ${prerequisiteRecipe.output.name}.`;
                    updateInventoryDisplay();
                    playerHasAmount = inventory.find(item => item.name === ingredientName)?.quantity || 0; // Update amount
                } else {
                    craftingMessage.textContent = `Could not auto-craft prerequisite: ${prerequisiteRecipe.output.name}.`;
                    return false;
                }
            } else if (currentlyCrafting.has(prerequisiteRecipe)) {
                craftingMessage.textContent = `Circular dependency detected for ${recipeToCraft.output.name}.`;
                return false;
            } else if (playerHasAmount < required.quantity) {
                craftingMessage.textContent = `No recipe found to craft required: ${required.item.name}.`;
                return false;
            } else {
                break; // Player now has enough of this ingredient
            }
        }
    }

    return checkCraftingRequirementsForRecipe(recipeToCraft);
}

// Helper function to find a crafting recipe by its output item
function findCraftingRecipeByOutput(outputItem) {
    return craftingRecipes.find(recipe => recipe.output === outputItem);
}

// Helper function to check if the player meets the requirements for a specific recipe
function checkCraftingRequirementsForRecipe(recipe) {
    for (const ingredientName in recipe.cost) {
        const required = recipe.cost[ingredientName];
        const playerHasAmount = inventory.find(item => item.name === ingredientName)?.quantity || 0;
        if (playerHasAmount < required.quantity) {
            return false;
        }
    }
    // Add check for required building here if needed for the prerequisite
    return true;
}

const openCraftingButton = document.getElementById('openCraftingButton');
openCraftingButton.addEventListener('click', openCraftingModal);

export { openCraftingModal, craftingRecipes };