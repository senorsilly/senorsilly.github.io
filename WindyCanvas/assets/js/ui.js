// ui.js
import { addItemToInventory, removeItemFromInventory, unequipItem, inventory, updateInventoryDisplay, useItem } from './inventory.js';
import { getCachedImage, ctx, getCurrentLevel, tileSize, cameraX, cameraY } from './game.js';
import { setPlayerX, setPlayerY, getPlayerX, getPlayerY, maxPlayerHP, setPlayerHP, getPlayerHP, toggleIsResting, isResting, getEquippedItems, playerHP, toggleAutoExplore, autoExplore } from './player.js';
import { renderLevel, exploredMaps, maps, getCurrentMapId, getMapHeight, getMapWidth } from './map.js'
import { achievementsData } from './achievements.js'
import { activeSpell, previousPlayerLocation } from './spells.js'
import { getItem } from './items.js'
import { showMainMenu } from './gameState.js';

const infoOverlay = document.getElementById('infoOverlay');
const currentLevelDisplay = document.getElementById('currentLevelDisplay');
const infoDetails = document.getElementById('infoDetails');
const damageMessages = document.getElementById('damageMessages');
const inventoryMessages = document.getElementById('inventoryMessages');

const statusPanel = document.getElementById("statusPanel");
const hpDisplay = document.getElementById("hpDisplay");
const manaDisplay = document.getElementById("manaDisplay");
const attackDisplay = document.getElementById("attackDisplay");
const defenseDisplay = document.getElementById("defenseDisplay");
const equippedWeaponDisplay = document.getElementById("equippedWeapon");
const equippedArmorDisplay = document.getElementById("equippedArmor");
const itemScroller = document.getElementById("itemScroller");
const sectionSizer = document.getElementById("sectionSizer"); 

const equipmentModal = document.getElementById('equipmentModal');
const equipmentModalOverlay = document.getElementById('equipmentModalOverlay');
const equippedItemList = document.getElementById('equippedItemList');
const closeEquipmentModalButton = document.querySelector('#equipmentModal .close-button');
const openEquipmentButton = document.getElementById('openEquipmentButton');

// Get modal elements
const creditsModal = document.getElementById('creditsModal');
const closeCreditsModalButton = document.getElementById('closeCreditsModal');
const creditsListContainer = document.getElementById('creditsList');

// Get modal elements
const exploredMapModal = document.getElementById('exploredMapModal');
const closeExploredMapModalButton = document.getElementById('closeExploredMapModal');
const exploredMapTextElement = document.getElementById('exploredMapText');
const openExploredMap = document.getElementById('openExploredMap');

//Get modal elements
const debugModal = document.getElementById('debugModal');
const closeDebugModalButton = document.getElementById('closeDebugModal');
const openDebug = document.getElementById('openDebug'); 
const debugRenderFrameButton = document.getElementById('debugRenderFrame'); 
const debugGiveResourcesButton = document.getElementById('debugGiveResources'); 

const dialogueModal = document.getElementById('dialogueModal');
const npcNameElement = document.getElementById('npcName');
const dialogueTextElement = document.getElementById('dialogueText');
const dialogueChoicesElement = document.getElementById('dialogueChoices');
const closeDialogueButton = document.getElementById('closeDialogue');
const npcPortraitElement = document.getElementById('npcPortrait');
let currentDialogueNode = null;
let isDialogueOpen = false;
let interactingNpc = null;

const achievementsModal = document.getElementById('achievementsModal');
const closeAchievementsModalButton = document.getElementById('closeAchievementsModal');
const achievementsListElement = document.getElementById('achievementsList');
const openAchievementsButton = document.getElementById('openAchievements');

let floatingTexts = [];

const debugCurrentPlayerLocation = document.getElementById('debugCurrentPlayerLocation');
const debugPreviousPlayerLocation = document.getElementById('debugPreviousPlayerLocation');
const txtX = document.getElementById('txtX'); 
const txtY = document.getElementById('txtY'); 
const debugSetLocation = document.getElementById('debugSetLocation');

const openMenuButton = document.getElementById('openMenu');
const saveGameDetails = document.getElementById('saveGameDetails');
function displayFloatingText(text, x, y, type = 'info') {
    floatingTexts.push({
        text: text,
        x: x,
        y: y,
        type: type,
        alpha: 1,
        lifetime: 1500, // Milliseconds
        startTime: Date.now(),
        velocityY: -0.5, // Adjust for speed
    });
}

function updateFloatingTexts() {
    floatingTexts.forEach(ft => {
        const elapsed = Date.now() - ft.startTime;
        ft.y += ft.velocityY;
        ft.alpha = 1 - (elapsed / ft.lifetime); // Fade out over lifetime
    });

    // Remove expired texts
    floatingTexts = floatingTexts.filter(ft => Date.now() - ft.startTime < ft.lifetime);
}

function drawFloatingTexts() {
    ctx.font = '16px sans-serif';
    floatingTexts.forEach(ft => {
        ctx.globalAlpha = ft.alpha;
        let color = 'white';
        switch (ft.type) {
            case 'info':
                color = 'lightblue';
                break;
            case 'warning':
                color = 'yellow';
                break;
            case 'error':
                color = 'red';
                break;
            case 'magic':
                color = 'lightgreen';
                break;
        }
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.fillText(ft.text, ft.x - cameraX, ft.y - cameraY);
        ctx.globalAlpha = 1; // Reset alpha
        ctx.textAlign = 'start'; // Reset text alignment
    });
}

function generateExploredMapText() {
    let currentExploredMap = exploredMaps[getCurrentMapId()];
    if (!currentExploredMap) {
        return "Explored map not initialized for current map.";
    }

    var heading = document.getElementById("exploredMapHeading")
    heading.innerText = "Explored Map " + getCurrentMapId();

    //Testing
    //currentExploredMap = maps[getCurrentMapId()];
    //console.log(getCurrentMapId() + ' explored map state');
    //console.log(currentExploredMap);

    let text = "";
    for (let y = 0; y < getMapHeight(); y++) {
        for (let x = 0; x < getMapWidth(); x++) {
            if (currentExploredMap && currentExploredMap[y] && currentExploredMap[y][x] && currentExploredMap[y][x].seen) {
                text += currentExploredMap[y][x].type;
            } else {
                text += ' '; // Not seen
            }
        }
        text += "\n"; // Newline at the end of each row
    }
    return text;
}

debugRenderFrameButton.addEventListener('click', (event) => {
    //console.log(getCurrentMapId() + ' explored map tile found at 0,1: ' + exploredMaps[getCurrentMapId()][1][0].type);
    renderLevel();
});
debugGiveResources.addEventListener('click', (event) => {
    //Crafting debug
    for (var intCount = 0; intCount < 10; intCount++) {
        addItemToInventory(getItem("Iron Bar"));
    }
    addItemToInventory(getItem("Forge"));
    updateInventoryDisplay();
});
function refreshMap() {
    exploredMapTextElement.textContent = generateExploredMapText();
}
function openExploredMapModal() {
    exploredMapTextElement.textContent = generateExploredMapText();
    exploredMapModal.style.display = 'block';
}

function closeExploredMapModal() {
    exploredMapModal.style.display = 'none';
}

closeExploredMapModalButton.addEventListener('click', closeExploredMapModal);

openExploredMap.addEventListener('click', (event) => {
    openExploredMapModal();
});

closeDebugModalButton.addEventListener('click', closeDebugModal);

openDebug.addEventListener('click', (event) => {
    refreshSaveGameInfo();
    openDebugModal();
});

function closeDebugModal() {
    debugModal.style.display = 'none';
}

function openDebugModal() {
    debugModal.style.display = 'block';
}
function updateStatusDisplay(hp, maxHp, attack, defense, mana, maxMana) {
    if (hpDisplay) {
        hpDisplay.textContent = `HP: ${hp}/${maxHp}`;
    }
    if (manaDisplay) {
        manaDisplay.textContent = `MP: ${mana}/${maxMana} (${activeSpell.name})`;
    }
    if (attackDisplay) {
        attackDisplay.textContent = `Attack: ${attack}`;
    }
    if (defenseDisplay) {
        defenseDisplay.textContent = `Defense: ${defense}`;
    }
}

function updateWeaponDisplay(weapon) {
    if (equippedWeaponDisplay) {
        if (weapon) {
            equippedWeaponDisplay.textContent = `Weapon: ${weapon.name}`;
        } else {
            equippedWeaponDisplay.textContent = `Weapon: None`;
        }
        
        if (weapon && weapon.icon) {
            const icon = getCachedImage(weapon.icon, weapon.name, 'item-icon');
            equippedWeaponDisplay.appendChild(icon);
        }
    }
    // Add similar logic for other equipment slots
}
function updateArmorDisplay(armor) {
    if (equippedArmorDisplay) {
        if (armor) {
            equippedArmorDisplay.textContent = `Armor: ${armor.name}`;
        } else {
            equippedArmorDisplay.textContent = `Armor: None`;
        }
        if (armor && armor.icon) {
            const icon = getCachedImage(armor.icon, armor.name, 'item-icon');
            equippedArmorDisplay.appendChild(icon);
        }
    }
    // Add similar logic for other equipment slots
}
function updateInfoOverlay() {
    currentLevelDisplay.textContent = getCurrentMapId();
}

function showDamageMessage(damage, x, y) {
    const message = document.createElement('span');
    message.textContent = damage;
    message.style.position = 'absolute';
    message.style.left = `${x * tileSize - cameraX}px`;
    message.style.top = `${y * tileSize - cameraY}px`;
    message.style.color = 'red';
    message.style.fontSize = '20px';
    message.style.pointerEvents = 'none'; // Prevent interaction

    damageMessages.appendChild(message);

    // Remove the message after a short delay
    setTimeout(() => {
        damageMessages.removeChild(message);
    }, 1000); // 1 second delay
}

function showInventoryMessage(messageDetails, x, y) {
    const message = document.createElement('span');
    message.textContent = messageDetails;
    message.style.position = 'absolute';
    message.style.left = `${x * tileSize - cameraX}px`;
    message.style.top = `${y * tileSize - cameraY - 30}px`;
    message.style.color = 'gray';
    message.style.fontSize = '20px';
    message.style.pointerEvents = 'none'; // Prevent interaction
    message.style.width = '200px';

    inventoryMessages.appendChild(message);

    // Remove the message after a short delay
    setTimeout(() => {
        inventoryMessages.removeChild(message);
    }, 1000); // 1 second delay

    updateInventoryDisplay();
}

function toggleInventoryDisplay() {
    const inventoryDiv = document.getElementById('inventoryModal');
    if (inventoryDiv) {
        if (inventoryDiv.style.display === 'none' || inventoryDiv.style.display === '') {
            inventoryDiv.style.display = 'block';
            updateInventoryDisplay(); // Update display when showing
        } else {
            inventoryDiv.style.display = 'none';
        }
    }
}

// Event listeners

// Event listener for escape key
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        document.querySelectorAll(".modal").forEach(function (e) {
            e.style.display = 'none';
        });
        isDialogueOpen = false;
    } else if (event.key === 'Tab') {
        openExploredMapModal();
    }
});

// Add auto-explore button
const autoExploreButton = document.createElement('button');
autoExploreButton.textContent = 'Auto Explore';
autoExploreButton.addEventListener('click', () => {
    toggleAutoExplore();
    autoExploreButton.textContent = autoExplore ? 'Stop Explore' : 'Auto Explore';
});
infoOverlay.appendChild(autoExploreButton);

function openEquipmentModal() {
    updateEquippedItemsDisplay();
    equipmentModal.style.display = 'block';
    equipmentModalOverlay.style.display = 'block';
}

function closeEquipmentModal() {
    equipmentModal.style.display = 'none';
    equipmentModalOverlay.style.display = 'none';
}

closeEquipmentModalButton.addEventListener('click', closeEquipmentModal);
equipmentModalOverlay.addEventListener('click', closeEquipmentModal);
openEquipmentButton.addEventListener('click', openEquipmentModal);

function updateEquippedItemsDisplay() {
    equippedItemList.innerHTML = ''; // Clear previous content
    const equippedItems = getEquippedItems(); // Assuming this function is imported from player.js

    for (const slot in equippedItems) {
        if (equippedItems.hasOwnProperty(slot) && equippedItems[slot]) {
            const item = equippedItems[slot];
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('equipped-item');

            const itemName = document.createElement('span');
            itemName.textContent = `${item.name} (${slot})`;

            const unequipButton = document.createElement('button');
            unequipButton.classList.add('unequip-button');
            unequipButton.textContent = 'Unequip';
            unequipButton.dataset.slot = slot; // Store the slot for the unequip action
            unequipButton.addEventListener('click', handleUnequip);

            itemDiv.appendChild(itemName);
            
            if (item.icon) {
                const icon = document.createElement('img');
                icon.src = item.icon;
                icon.alt = item.name;
                icon.classList.add('item-icon')
                itemDiv.appendChild(icon);
            }
            itemDiv.appendChild(unequipButton);
            equippedItemList.appendChild(itemDiv);
        }
    }

    if (equippedItemList.innerHTML === '') {
        equippedItemList.textContent = 'No items equipped.';
    }
}

function handleUnequip(event) {
    const slotToUnequip = event.target.dataset.slot;
    if (slotToUnequip) {
        unequipItem(slotToUnequip); // We need to create this function
        updateEquippedItemsDisplay(); // Refresh the modal
        updateInventoryDisplay(); // Refresh the inventory
        updateStatusDisplay(); // Refresh the status panel
    }
}

const restButton = document.getElementById('restButton');
if (restButton) {
    restButton.addEventListener('click', () => {
        toggleIsResting();
        //console.log(`Resting toggled: ${isResting}`);
    });
}

// Data structure for your credits
const gameCredits = [
    {
        section: 'Graphics',
        entries: [
            'Tile Graphics: https://opengameart.org/content/dungeon-crawl-32x32-tiles-supplemental',
            'Character Sprites:  Philipp Lenssen, outer-court.com',
            'Splash Screen Image: Gemini'
        ]
    },
    {
        section: 'Sound Effects',
        entries: [
            'https://opengameart.org/content/rpg-sound-pack',
            'Some of the sounds in this project were created by ViRiX Dreamcore (David McKee) soundcloud.com/virix',
        ]
    },
    {
        section: 'Music',
        entries: [
            'cynicmusic.com pixelsphere.org',
            'GRAPESTAR LLC',
            'http://www.matthewpablo.com/services'
        ]
    },
    {
        section: 'Code & Libraries',
        entries: [
            'Web Audio API: [Built-in browser API]',
            // If you use any external libraries, credit them here
        ]
    },
    {
        section: 'Game Development',
        entries: [
            'Developed by: senor_silly',
            'AI Assistance by Google Gemini'
        ]
    }
    // Add more sections as needed (e.g., Story, Testing)
];

function openCreditsModal() {
    creditsModal.style.display = 'block';
    populateCreditsList();
}

function closeCreditsModal() {
    creditsModal.style.display = 'none';
}

closeCreditsModalButton.addEventListener('click', closeCreditsModal);

function populateCreditsList() {
    creditsListContainer.innerHTML = '';
    gameCredits.forEach(creditSection => {
        const sectionDiv = document.createElement('div');
        sectionDiv.classList.add('credit-section');

        const title = document.createElement('h3');
        title.textContent = creditSection.section;
        sectionDiv.appendChild(title);

        const entries = document.createElement('p');
        entries.textContent = creditSection.entries.join('\n'); // Use line breaks
        sectionDiv.appendChild(entries);

        creditsListContainer.appendChild(sectionDiv);
    });
}

// You'll need a way to trigger the openCreditsModal() function,
// for example, from a button in your UI (e.g., in a main menu).
const openCreditsButton = document.getElementById('openCredits');
if (openCreditsButton) {
    openCreditsButton.addEventListener('click', openCreditsModal);
}

function startDialogue(npc) {
    interactingNpc = npc;
    currentDialogueNode = npc.dialogue.start;
    updateDialogueModal();
    dialogueModal.style.display = 'block';
    isDialogueOpen = true;
}

function updateDialogueModal() {
    npcNameElement.textContent = interactingNpc.name;
    dialogueTextElement.textContent = currentDialogueNode.text;
    dialogueChoicesElement.innerHTML = '';

    // Display portrait
    if (currentDialogueNode.portrait) {
        npcPortraitElement.src = currentDialogueNode.portrait;
    } else if (interactingNpc.portrait) {
        npcPortraitElement.src = interactingNpc.portrait;
    } else {
        npcPortraitElement.src = ''; // Clear the portrait if no image is available
    }

    if (currentDialogueNode.choices) {
        currentDialogueNode.choices.forEach(choice => {
            const button = document.createElement('button');
            button.textContent = choice.text;
            button.addEventListener('click', () => handleDialogueChoice(choice));
            dialogueChoicesElement.appendChild(button);
        });
    } else {
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.addEventListener('click', closeDialogue);
        dialogueChoicesElement.appendChild(closeButton);
    }
}

function handleDialogueChoice(choice) {
    if (choice.action) {
        performDialogueAction(choice.action);
    }

    // Check for portrait change in the choice itself (optional, but could be useful)
    if (choice.portrait) {
        npcPortraitElement.src = choice.portrait;
    }

    if (choice.next) {
        currentDialogueNode = interactingNpc.dialogue[choice.next];
        updateDialogueModal();
    } else {
        closeDialogue();
    }
}

function performDialogueAction(action) {
    switch (action) {
        case 'heal_player':
            setPlayerHP(maxPlayerHP);
            //updateHealthDisplay();
            break;
        case 'give_item':
            // Implement logic to add an item to the player's inventory
            break;
        case 'remove_item':
            // Implement logic to remove an item from the player's inventory
            break;
        // ... other actions ...
    }
}

function closeDialogue() {
    dialogueModal.style.display = 'none';
    isDialogueOpen = false;
    interactingNpc = null;
    currentDialogueNode = null;
    npcPortraitElement.src = '';
}

closeDialogueButton.addEventListener('click', closeDialogue);

openMenuButton.addEventListener('click', showMainMenu);

function checkAndUnlockAchievement(achievementId) {
    if (achievementsData[achievementId] && !achievementsData[achievementId].unlocked) {
        achievementsData[achievementId].unlocked = true;
        displayAchievementNotification(achievementsData[achievementId]); // Optional: Show a small notification
        updateAchievementsModal(); // Update the modal if it's open
        //console.log(`Achievement unlocked: ${achievementsData[achievementId].name}`);
    }
}

function updateAchievementsModal() {
    achievementsListElement.innerHTML = ''; // Clear the list

    for (const id in achievementsData) {
        const achievement = achievementsData[id];
        const achievementDiv = document.createElement('div');
        achievementDiv.classList.add('achievement-item');
        achievementDiv.classList.add(achievement.unlocked ? 'achievement-unlocked' : 'achievement-locked');

        const image = document.createElement('img');
        image.src = achievement.image;
        image.alt = achievement.name;
        image.classList.add('achievement-image');
        achievementDiv.appendChild(image);

        const nameElement = document.createElement('h4');
        nameElement.textContent = achievement.name;
        achievementDiv.appendChild(nameElement);

        const descriptionElement = document.createElement('p');
        descriptionElement.textContent = achievement.description;
        achievementDiv.appendChild(descriptionElement);

        achievementsListElement.appendChild(achievementDiv);
    }
}

function displayAchievementNotification(achievement) {
    let notificationContainer = document.getElementById('notificationContainer');
    if (!notificationContainer) {
        // Create a container if it doesn't exist (you'll need to add this to your HTML)
        const container = document.createElement('div');
        container.id = 'notificationContainer';
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.left = '20px';
        container.style.zIndex = '1000'; // Ensure it's on top
        document.body.appendChild(container);
        notificationContainer = container;
    }

    const notification = document.createElement('div');
    notification.classList.add('achievement-notification');
    notification.innerHTML = `
    <img src="${achievement.image}" alt="${achievement.name}" class="notification-image">
    <div>
      <h4>Achievement Unlocked!</h4>
      <p><strong>${achievement.name}</strong>: ${achievement.description}</p>
    </div>
  `;

    notificationContainer.appendChild(notification);

    // Optional: Add animation for fade-in/out
    notification.style.opacity = 0;
    let fadeInInterval = setInterval(() => {
        notification.style.opacity = parseFloat(notification.style.opacity) + 0.1;
        if (parseFloat(notification.style.opacity) >= 1) {
            clearInterval(fadeInInterval);
        }
    }, 50);

    // Automatically remove the notification after a few seconds
    setTimeout(() => {
        let fadeOutInterval = setInterval(() => {
            notification.style.opacity = parseFloat(notification.style.opacity) - 0.1;
            if (parseFloat(notification.style.opacity) <= 0) {
                clearInterval(fadeOutInterval);
                notificationContainer.removeChild(notification);
                if (notificationContainer.children.length === 0) {
                    // Optionally remove the container if no notifications are present
                    // document.body.removeChild(notificationContainer);
                }
            }
        }, 50);
    }, 3000); // Adjust the display duration (in milliseconds)
}
function openAchievementsModal() {
    updateAchievementsModal();
    achievementsModal.style.display = 'block';
}

function closeAchievementsModal() {
    achievementsModal.style.display = 'none';
}

closeAchievementsModalButton.addEventListener('click', closeAchievementsModal);

openAchievementsButton.addEventListener('click', (event) => {
    openAchievementsModal();
});

debugSetLocation.addEventListener('click', (event) => {
    setPlayerX(txtX.value);
    setPlayerY(txtY.value);
});

function updateDebugInfo() {
    debugCurrentPlayerLocation.innerText = `${getCurrentMapId()} ${getPlayerX()}, ${getPlayerY()}`;
    
    if (previousPlayerLocation) {
        debugPreviousPlayerLocation.innerText = `${previousPlayerLocation.mapId} ${previousPlayerLocation.x},${previousPlayerLocation.y} `;
    } else {
        debugPreviousPlayerLocation.innerText = 'None';
    }
}

function refreshSaveGameInfo() {
    saveGameDetails.innerHTML = "";
    const saveString = localStorage.getItem('windyCanvasSave_');
    if (saveString) {
        var gameState = JSON.parse(saveString);
        saveGameDetails.innerHTML = listObjectPropertiesRecursive(gameState);
    }
}
function listObjectPropertiesRecursive(obj, indent = "") {
    var objectDetails = [];
    for (const property in obj) {
        if (Object.hasOwnProperty.call(obj, property)) {
            const value = obj[property];
            objectDetails.push((`${indent}${property}: ${typeof value === 'object' && value !== null ? '[Object]' : value}`));

            if (typeof value === 'object' && value !== null) {
                objectDetails.push(listObjectPropertiesRecursive(value, indent + "&nbsp;&nbsp;")); // Add indentation for nested levels
            }
        }
    }
    return objectDetails.join('<br/>');
}
function listObjectProperties(obj) {
    var objectDetails = [];
    for (const property in obj) {
        if (Object.hasOwnProperty.call(obj, property)) {
            objectDetails.push(`${property}: ${obj[property]}`);
        }
    }
    return objectDetails.join('<br/>');
}
export { updateDebugInfo, drawFloatingTexts, updateFloatingTexts, displayFloatingText, refreshMap, checkAndUnlockAchievement, isDialogueOpen, startDialogue, restButton, updateWeaponDisplay, updateArmorDisplay, openEquipmentModal, updateEquippedItemsDisplay, updateInventoryDisplay, sectionSizer, itemScroller,updateStatusDisplay, updateInfoOverlay, showDamageMessage, showInventoryMessage };