// inventory.js
import { getEquippedItems, playerHP, setPlayerHP, playerX, playerY } from './player.js';
import { updateWeaponDisplay, updateArmorDisplay, updateInfoOverlay, showInventoryMessage, updateEquippedItemsDisplay } from './ui.js';
import { getItem, getEquipment } from './items.js';
import { openCraftingModal } from './crafting.js'
import { playSoundEffect} from './audio.js'
import { handleTreeChopped } from './achievements.js'
import { getCachedImage } from './game.js'

let inventory = [getItem("Health Potion"),
    getEquipment("Wooden Sword"),
    getEquipment("Wooden Helmet")];

function addItemToInventory(item) {
    let existingItem = inventory.find(i => i.name === item.name);
    if (existingItem) {
        //console.log(existingItem);
        //console.log(item.quantity)
        existingItem.quantity = existingItem.quantity + item.quantity; // Increment quantity
    } else {
        inventory.push(item);
    }
    //console.log(inventory);
    playSoundEffect('itemPickup');

    if (item.name == "Wood") {
        handleTreeChopped();
    }
}

function removeItemFromInventory(item) {
    const index = inventory.indexOf(item);
    if (index !== -1) {
        inventory.splice(index, 1);
        updateInventoryDisplay();
    }
}

function useItem(itemName) {
    let itemIndex = inventory.findIndex(item => item.name === itemName);
    if (itemIndex !== -1) {
        let item = inventory[itemIndex];
        if (item.type === 'Potion') {
            if (item.name === "Health Potion") {
                setPlayerHP(playerHP + 20);
                updateInfoOverlay();
                showInventoryMessage("Used Health Potion", playerX, playerY);
            }
        } else if (item.type === 'resource' || item.type === 'building' || item.type === 'material') {
            openCraftingModal();
            return -1;
        } else if (['weapon', 'armor', 'shield', 'helmet', 'gloves', 'boots', 'cloak', 'ring', 'amulet'].includes(item.type)) {
            // Logic for equipping items
            equipItem(itemIndex);
        }
        
        item.quantity--; // Decrement quantity
        if (item.quantity <= 0) {
            inventory.splice(itemIndex, 1); // Remove item if quantity is 0
        }
        updateInventoryDisplay();
    }
}

function equipItem(inventoryIndex) {
    if (inventoryIndex >= 0 && inventoryIndex < inventory.length) {
        const itemToEquip = inventory[inventoryIndex];
        const slotToEquip = itemToEquip.type;
        const equippedItems = getEquippedItems();

        if (equippedItems.hasOwnProperty(slotToEquip)) {
            // Unequip the currently equipped item in that slot (if any)
            const currentlyEquipped = equippedItems[slotToEquip];
            if (currentlyEquipped) {
                // For now, just log it. Later, we'll add it back to inventory.
                console.log(`Unequipping: ${currentlyEquipped.name} from slot: ${slotToEquip}`);
                equippedItems[slotToEquip] = null;
                // Add the unequipped item back to the inventory
                addItemToInventory(currentlyEquipped);
            }

            // Equip the new item
            //console.log(`Equipping: ${itemToEquip.name} to slot: ${slotToEquip}`);
            equippedItems[slotToEquip] = itemToEquip; // Directly assign the inventory item for now
            itemToEquip.quantity--; // Decrement quantity
            if (itemToEquip.quantity <= 0) {
                inventory.splice(inventoryIndex, 1); // Remove from inventory
            }

            //Update UI
            if (itemToEquip.slot == 'weapon') {
                updateWeaponDisplay(itemToEquip)
            } else if (itemToEquip.slot == 'armor') {
                updateArmorDisplay(itemToEquip)
            }
        } else {
            console.warn(`Invalid equipment slot: ${slotToEquip}`);
        }

        updateEquippedItemsDisplay();
    }
}
function unequipItem(slotToUnequip) {
    const equippedItems = getEquippedItems();
    if (equippedItems.hasOwnProperty(slotToUnequip) && equippedItems[slotToUnequip]) {
        const itemToUnequip = equippedItems[slotToUnequip];
        equippedItems[slotToUnequip] = null;
        addItemToInventory(itemToUnequip);
        updateEquippedItemsDisplay();
        console.log(`Unequipped: ${itemToUnequip.name} from ${slotToUnequip}`);

        //Update UI
        if (itemToUnequip.slot == 'weapon') {
            updateWeaponDisplay(undefined);
        } else if (itemToUnequip.slot == 'armor') {
            updateArmorDisplay(undefined);
        }
    }
}
function updateInventoryDisplay() {
    let inventoryItemsDiv = document.getElementById("inventoryItems");
    inventoryItemsDiv.innerHTML = "";
    if (inventory.length === 0) {
        inventoryItemsDiv.innerHTML += "None";
    } else {
        inventory.forEach(item => {
            let useButton = document.createElement("button");
            let itemDetails = document.createElement("label")
            let itemBreak = document.createElement("br")
            itemBreak.style.clear = "both";

            useButton.textContent = "Use";
            useButton.addEventListener("click", function () { // Use anonymous function
                useItem(item.name);
            });
            if (item.quantity) {
                itemDetails.innerHTML = `${item.name} (${item.quantity}) `;
            } else {
                itemDetails.innerHTML = `${item.name}`;
            }
            
            inventoryItemsDiv.appendChild(itemDetails);
            if (item.icon) {
                const icon = getCachedImage(item.icon, item.name, 'item-icon');
                inventoryItemsDiv.appendChild(icon);
            }
            inventoryItemsDiv.appendChild(useButton);
            inventoryItemsDiv.appendChild(itemBreak);
        });
    }
}

export {inventory, unequipItem, addItemToInventory, removeItemFromInventory, updateInventoryDisplay, useItem};