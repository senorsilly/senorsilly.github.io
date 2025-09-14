import {Equipment } from './equipment.js'
class Item {
    constructor(name, type, description, weight, bulk, quantity=1, icon) {
        this.name = name;
        this.type = type;
        this.description = description;
        this.weight = weight;
        this.bulk = bulk;
        this.quantity = quantity;
        this.icon = icon;
    }
}

let items = [];
let equipment = [];

// Example resource items
const potionItem = new Item("Health Potion", "Potion", "Restores 20 HP", 2, 1, 1, 'assets/img/tiles/health_potion.png');
items.push(potionItem)

// Level 1 Resources
const woodItem = new Item("Wood", "resource", "A piece of wood.", 1, 1, 1, 'assets/img/tiles/wood.png');
const stoneItem = new Item("Stone", "resource", "A piece of stone.", 1, 1, 1, 'assets/img/tiles/stone.png');
const herbItem = new Item("Herb", "resource", "A useful herb.", 1, 1, 1, 'assets/img/tiles/herb.png');
const berryItem = new Item("Berries", "resource", "A handful of edible berries.", 0.5, 0.5, 1, 'assets/img/tiles/berries.png');
const fiberItem = new Item("Plant Fiber", "resource", "Tough fibers from a plant.", 0.3, 0.3, 1, 'assets/img/tiles/fiber.png');
const mushroomCommonItem = new Item("Common Mushroom", "resource", "A typical mushroom.", 0.2, 0.2, 1, 'assets/img/tiles/mushroom_common.png');
const mushroomHealingItem = new Item("Healing Mushroom", "resource", "A mushroom with restorative properties.", 0.2, 0.2, 1, 'assets/img/tiles/mushroom_healing.png');
const resinItem = new Item("Resin", "resource", "Sticky tree sap.", 0.4, 0.4, 1, 'assets/img/tiles/resin.png');
const seedCommonItem = new Item("Common Seeds", "resource", "Seeds from a common plant.", 0.1, 0.1, 1, 'assets/img/tiles/seeds_common.png');
const clayItem = new Item("Clay", "resource", "A lump of wet clay.", 2, 1, 1, 'assets/img/tiles/clay.png');
const featherItem = new Item("Feather", "resource", "A lightweight feather.", 0.1, 0.1, 1, 'assets/img/tiles/feather.png');
const animalHideItem = new Item("Animal Hide", "resource", "The hide of an animal.", 3, 2, 1, 'assets/img/tiles/hide.png');
items.push(woodItem)
items.push(stoneItem)
items.push(herbItem)
items.push(berryItem) 
items.push(fiberItem) 
items.push(mushroomCommonItem) 
items.push(mushroomHealingItem) 
items.push(resinItem) 
items.push(seedCommonItem) 
items.push(clayItem) 
items.push(featherItem) 
items.push(animalHideItem) 

// Crafted Materials - Tier 1
const stoneBrickItem = new Item("Stone Bricks", "material", "Processed stone, useful for building.", 2, 1, 1,'assets/img/tiles/stone_bricks.png');
items.push(stoneBrickItem)

// Level 2 Resources (Normal Metals)
const ironOreItem = new Item("Iron Ore", "resource", "Raw iron ore.", 2, 2, 1, 'assets/img/tiles/iron.png');
const copperOreItem = new Item("Copper Ore", "resource", "Raw copper ore.", 2, 2, 1, 'assets/img/tiles/copper.png');
const tinOreItem = new Item("Tin Ore", "resource", "Raw tin ore.", 2, 2, 1, 'assets/img/tiles/tin.png');
items.push(ironOreItem)
items.push(copperOreItem)
items.push(tinOreItem)

// Buildings
const forgeBuildingItem = new Item("Forge", "building", "A sturdy forge for processing metals.", 100, 2, 0, 'assets/img/tiles/forge.png'); // Quantity 0 as it's likely a built structure
items.push(forgeBuildingItem)

// Processed Metals - Tier 2
const ironBarItem = new Item("Iron Bar", "material", "A bar of refined iron.", 5, 2, 1, 'assets/img/tiles/iron_bar.png');
const copperBarItem = new Item("Copper Bar", "material", "A bar of refined copper.", 4, 2, 1, 'assets/img/tiles/copper_bar.png');
const tinBarItem = new Item("Tin Bar", "material", "A bar of refined tin.", 3, 2, 1, 'assets/img/tiles/tin_bar.png');
const steelBarItem = new Item("Steel Bar", "material", "A bar of high carbon steel", 5, 2, 1, 'assets/img/tiles/steel_bar.png');
items.push(ironBarItem)
items.push(copperBarItem)
items.push(tinBarItem)
items.push(steelBarItem)

// Level 3 Resources (Fantasy Metals)
const adamantineOreItem = new Item("Adamantine Ore", "resource", "Rare adamantine ore.", 5, 3, 1, 'assets/img/tiles/adamantine.png');
const orichalcumOreItem = new Item("Orichalcum Ore", "resource", "Glimmering orichalcum ore.", 5, 3, 1, 'assets/img/tiles/orichalcum.png');
const mithrilOreItem = new Item("Mithril Ore", "resource", "Lightweight mithril ore.", 5, 3, 1, 'assets/img/tiles/mithril.png');
items.push(adamantineOreItem)
items.push(orichalcumOreItem)
items.push(mithrilOreItem)


// Example Equipment Items
const woodenSwordEquipment = new Equipment(
    "Wooden Sword",
    "weapon",
    "Basically a stick with attitude.",
    { attack: 2 },
    0,
    10,
    null,
    "weapon",
    'assets/img/tiles/wooden_sword.png'
);
equipment.push(woodenSwordEquipment);

const woodenHelmetEquipment = new Equipment(
    "Wooden Helmet",
    "armor",
    "Crude but better than nothing.",
    { defense: 2 },
    0,
    10,
    null,
    "armor",
    'assets/img/tiles/wooden_helmet.png'
);
equipment.push(woodenHelmetEquipment);

const ironSwordEquipment = new Equipment(
    "Iron Sword",
    "weapon",
    "A worn and slightly damaged sword.",
    { attack: 4 },
    0,
    10,
    null,
    "weapon",
    'assets/img/tiles/rusty_sword.png'
);
equipment.push(ironSwordEquipment);

const ironKnifeEquipment = new Equipment(
    "Iron Knife",
    "weapon",
    "An iron knife, good for carving. Can be used as a weapon in a pinch",
    { attack: 1 },
    0,
    10,
    null,
    "weapon",
    'assets/img/tiles/iron_knife.png'
);
equipment.push(ironKnifeEquipment);

const ironArmorEquipment = new Equipment(
    "Iron Armor",
    "armor",
    "Heavy but durable iron armor.",
    { defense: 4 },
    0,
    10,
    null,
    "armor",
    'assets/img/tiles/iron_armor.png'
);
equipment.push(ironArmorEquipment);

const ironHelmetEquipment = new Equipment(
    "Iron Helmet",
    "helmet",
    "Heavy but durable.",
    { defense: 4 },
    0,
    10,
    null,
    "helmet",
    'assets/img/tiles/iron_helmet.png'
);
equipment.push(ironHelmetEquipment);

const steelSwordEquipment = new Equipment(
    "Steel Sword",
    "weapon",
    "A gleaming steel sword.",
    { attack: 6 },
    0,
    20,
    null,
    "weapon",
    'assets/img/tiles/steel_sword.png'
);
equipment.push(steelSwordEquipment);

const leatherArmorEquipment = new Equipment(
    "Leather Armor",
    "armor",
    "Light armor made from animal hide.",
    { defense: 1 },
    0,
    15,
    null,
    "armor",
    'assets/img/tiles/leather_armor.png'
);
equipment.push(leatherArmorEquipment);

const smallShieldEquipment = new Equipment(
    "Small Shield",
    "shield",
    "A basic wooden shield.",
    { defense: 1 },
    0,
    12,
    null,
    "shield",
    'assets/img/tiles/wooden_shield.png'
);
equipment.push(smallShieldEquipment);

const clothHelmetEquipment = new Equipment(
    "Cloth Helmet",
    "helmet",
    "A simple cloth head covering.",
    { defense: 0.5 },
    0,
    5,
    null,
    "helmet",
    'assets/img/tiles/cloth_helmet.png'
);
equipment.push(clothHelmetEquipment);

function getItem(itemName) {
    var matches = items.filter(item => item.name === itemName)
    if (matches.length > 0) {
        return { ...matches[0]};
    } else {
        console.log(`No item match for '${itemName}'`);
        return undefined;
    }
}

function getEquipment(equipmentName) {
    var matches = equipment.filter(item => item.name === equipmentName)
    if (matches.length > 0) {
        return matches[0]
    } else {
        console.log(`No equipment match for '${equipmentName}'`)
    }
}

export { getItem, getEquipment, Item }