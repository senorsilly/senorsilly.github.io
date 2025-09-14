// map.js
import { spawnNewMonster, Monster, monsters, getMonsterTypes, renderMonsters } from './monster.js'; // Import Monster class and monsters array.
import { getItem, Item } from './items.js'; // Import the Item class.
import { getCurrentLevel, setCurrentLevel, loadImage, ctx, tileSize, cameraX, cameraY} from './game.js';
import { resourceTileTypes, getPlayerX, getPlayerY, setPlayerX, setPlayerY, renderPlayer } from './player.js';
import { spells, updateSpells, renderSpells } from './spells.js';
import { updateInfoOverlay } from './ui.js';
import { playBackgroundMusic, audioContext } from './audio.js';
import { generateMazeKruskal, generateMazePrim, generateMazeRecursiveBacktracker} from './mazeGeneration.js'

let maps = {};
let mapWidth = 20;
let mapHeight = 10;
let connectionPoints = {};
let currentMapType = 'town'; // Default map type
let currentMapId = 'town'; // Use string identifier
let exploredMaps = {}; // 2D array to store explored tiles
const sightRadius = 5;

// Tile type definitions
const tileTypes = {
    '.': 'floor',
    'g': 'grass',
    's': 'stone_floor',
    'SW': 'stone_wall',
    '#': 'wall',
    'D': 'dungeon_portal', // Dungeon portal
    'R': 'resource_portal', // Resource portal
    't': 'town_portal', // Resource portal
    'W': 'tree', // Wood resource
    'S': 'stone', // Stone resource
    'H': 'herb', // Herb resource
    'B': 'berries',
    'F': 'fiber',
    'MC': 'mushroom_common',
    'MH': 'mushroom_healing',
    'RS': 'resin',
    'SC': 'seeds_common',
    'CL': 'clay',
    'FE': 'feather',
    'HI': 'hide',
    'I': 'iron',
    'C': 'copper',
    'T': 'tin',
    'A': 'adamantine',
    'O': 'orichalcum',
    'M': 'mithril',
    '<': 'stone_stairs_up',
    '>': 'stone_stairs_down',
    '^': 'cave_up',
    'v': 'cave_down',
    '~': 'water',
    '@': 'cliff'
};


var messageCount = 0;
function updateExploredMaps(tileX, tileY, tileType) {

    
    if (currentMapId && exploredMaps[currentMapId] && tileX >= 0 && tileX < getMapWidth() && tileY >= 0 && tileY < getMapHeight() && exploredMaps[currentMapId][tileY] && exploredMaps[currentMapId][tileY][tileX]) {
        exploredMaps[currentMapId][tileY][tileX].seen = true;
        exploredMaps[currentMapId][tileY][tileX].type = tileType;
    }

    //console.log('Updating explored map for '+currentMapId+' at:', tileX, tileY, ' tileType:', tileType, 'Map Dimensions:', getMapWidth(), getMapHeight());
    //console.log(exploredMaps[currentMapId][1][0].type);
    //setTimeout(function () { console.log(exploredMaps[currentMapId][1][0].type); }, 10);
}


function isTileVisible(tileX, tileY) {
    const dx = Math.abs(getPlayerX() - tileX);
    const dy = Math.abs(getPlayerY() - tileY);
    const isVisible = dx <= sightRadius && dy <= sightRadius && dx * dx + dy * dy <= sightRadius * sightRadius;
    if (isVisible && tileY == 1 && tileX ==0) { // Check the first two rows
        //console.log('Visible:', tileX, tileY, 'Player:', getPlayerX(), getPlayerY());
    }
    return isVisible;
}
function isTilePassable(tile) {
    // Define which tiles the player can walk on
    return tile === 's' || tile === 'g' || tile === '.' || tile === '<' || tile === '>' || tile === '^' || tile === 'v' || tile === 'D' || tile === 'R' || tile === 't' || resourceTileTypes.includes(tile);
}
function isLevelZeroResource(tile) {
    return tile === '@' || tile === '~' || tile === 'W' || tile === 'S' || tile === 'H' || tile === 'B' || tile === 'F' || tile === 'MC' || tile === 'MH' || tile === 'RS' || tile === 'SC' || tile === 'CL' || tile === 'FE' || tile === 'HI' || tile === 'v';
}
function isLevelOnePlusResource(tile) {
    return tile === 'I' || tile === 'C' || tile === 'T' || tile === 'A' || tile === 'O' || tile === 'M' || tile === '^' || tile === 'v';
}
function generateTownMap(width, height) {
    // Generate town map logic
    let map = [];
    for (let y = 0; y < height; y++) {
        map[y] = [];
        for (let x = 0; x < width; x++) {
            if (y == 0 || x == 0 || x == width-1 || y == height-1) {
                map[y][x] = '#';
            } else {
                map[y][x] = '.'; // Default to floor
            }
        }
    }

    // Add town-specific features (buildings, portals, etc.)
    map[5][5] = 'D'; // 'D' for dungeon portal
    map[5][8] = 'R'; // 'R' for resource portal
    map[5][10] = 't'; // 't' for town portal

    return map;
}
function generateDungeonMap(width, height, levelNumber) {
    //console.log('New dungeon ' + levelNumber);
    let map = [];
    for (let y = 0; y < height; y++) {
        let row = [];
        for (let x = 0; x < width; x++) {
            if (Math.random() < 0.1) {
                row.push('#');
            } else {
                row.push('.');
            }
        }
        map.push(row);
    }

    // Add stairs for testing level transitions
    let stairsX = Math.floor(Math.random() * width);
    let stairsY = Math.floor(Math.random() * height);
    if (levelNumber === 0) {
        map[5][5] = 't'; // Place town portal tile
        map[stairsY][stairsX] = '>';
        connectionPoints['>'] = { level: 1, x: 0, y: 0 };
    } else if (levelNumber === 1) {
        map[stairsY][stairsX] = '<';
        connectionPoints['<'] = { level: 0, x: 0, y: 0 };
        let downStairsX = Math.floor(Math.random() * width);
        let downStairsY = Math.floor(Math.random() * height);
        map[downStairsY][downStairsX] = '>';
        connectionPoints['>'] = { level: 2, x: 0, y: 0 };
    } else if (levelNumber === 2) {
        map[stairsY][stairsX] = '<';
        connectionPoints['<'] = { level: 1, x: 0, y: 0 };
    }
    //console.log(connectionPoints);

    // Add monsters
    for (let i = 0; i < 50; i++) {
        let attempts = 0;
        while (attempts < 100) { // Prevent infinite loops
            let monsterX = Math.floor(Math.random() * width); // Ensure integer coordinates
            let monsterY = Math.floor(Math.random() * height); // Ensure integer coordinates
            //console.log(`Trying to place monster at: (${monsterX}, ${monsterY}), Tile: ${map[monsterY][monsterX]}`);

            if (isTilePassable(map[monsterY][monsterX])) { // Check for floor tile
                let monsterDrops = [];
                if (Math.random() < 0.7) {
                    monsterDrops.push(new Item("Health Potion", "Potion", "Restores 20 HP", 2, 1));
                }

                // Randomly select monster type
                let monsterTypes = getMonsterTypes();
                let monsterType = monsterTypes[Math.floor(Math.random() * monsterTypes.length)];

                monsters.push(new Monster(monsterX, monsterY, 20, 5, levelNumber, monsterType, monsterDrops));
                //console.log(`Monster placed at: (${monsterX}, ${monsterY})`);
                break; // Monster placed, exit loop
            }
            attempts++;
        }
    }
    return map;
}

function AddStairsAndMonsters(map, width, height, levelNumber) {
    // Add stairs for testing level transitions
    let stairsX = Math.floor(Math.random() * width);
    let stairsY = Math.floor(Math.random() * height);
    if (levelNumber === 0) {
        map[5][5] = 't'; // Place town portal tile
        map[stairsY][stairsX] = '>';
        connectionPoints['>'] = { level: 1, x: 0, y: 0 };
    } else if (levelNumber === 1) {
        map[stairsY][stairsX] = '<';
        connectionPoints['<'] = { level: 0, x: 0, y: 0 };
        let downStairsX = Math.floor(Math.random() * width);
        let downStairsY = Math.floor(Math.random() * height);
        map[downStairsY][downStairsX] = '>';
        connectionPoints['>'] = { level: 2, x: 0, y: 0 };
    } else if (levelNumber === 2) {
        map[stairsY][stairsX] = '<';
        connectionPoints['<'] = { level: 1, x: 0, y: 0 };
    }
    //console.log(connectionPoints);

    // Add monsters
    for (let i = 0; i < 50; i++) {
        spawnNewMonster(map, levelNumber);
        //let attempts = 0;
        //while (attempts < 100) { // Prevent infinite loops
        //    let monsterX = Math.floor(Math.random() * width); // Ensure integer coordinates
        //    let monsterY = Math.floor(Math.random() * height); // Ensure integer coordinates
        //    //console.log(`Trying to place monster at: (${monsterX}, ${monsterY}), Tile: ${map[monsterY][monsterX]}`);

        //    if (isTilePassable(map[monsterY][monsterX])) { // Check for floor tile
        //        let monsterDrops = [];
        //        if (Math.random() < 0.7) {
        //            monsterDrops.push(new Item("Health Potion", "Potion", "Restores 20 HP", 2, 1));
        //        }

        //        // Randomly select monster type
        //        let monsterTypes = getMonsterTypes();
        //        let monsterType = monsterTypes[Math.floor(Math.random() * monsterTypes.length)];

        //        monsters.push(new Monster(monsterX, monsterY, 20, 5, levelNumber, monsterType, monsterDrops));
        //        //console.log(`Monster placed at: (${monsterX}, ${monsterY})`);
        //        break; // Monster placed, exit loop
        //    }
        //    attempts++;
        //}
    }

    return map;
}
function generateResourceMap(width, height, resourceLevel) {
    //console.log(`generateResourceMap ${width}, ${height} - level ${resourceLevel}`);
    let map = [];
    for (let y = 0; y < height; y++) {
        map[y] = [];
        for (let x = 0; x < width; x++) {
            if (resourceLevel == 0) {
                map[y][x] = 'g';
            } else {
                map[y][x] = 'SW';
            }

        }
    }
    //console.log('place resources');
    if (resourceLevel === 0) {
        generateStreams(map, width, height, 3, Math.max(width, height) * 0.6); // Adjust parameters
        generateCliffs(map, width, height, 15, 7); // Adjust parameters
        placeResourceTiles(map, ['W', 'S', 'H', 'B', 'F', 'MC', 'MH', 'RS', 'SC', 'CL', 'FE', 'HI']);
        placeCaveTransitions(map, 'v', ''); //place cave transitions
        map[5][5] = 't'; // Place town portal tile
    } else if (resourceLevel === 1) {
        // Generate map with iron, copper, tin.
        // Logic for placing resource tiles and caves.
        placeResourceTiles(map, ['I', 'C', 'T']); // Place iron, copper, tin
        placeCaveTransitions(map, 'v', '^');
    } else if (resourceLevel === 2) {
        // Generate map with adamantine, orichalcum, mithril.
        // Logic for placing resource tiles and caves.
        placeResourceTiles(map, ['A', 'O', 'M']); // Place adamantine, orichalcum, mithril
        placeCaveTransitions(map, '', '^');
    }

    //console.log('map ready');

    return map;
}

function generateStreams(map, width, height, numStreams = 3, streamLength = 50) {
    for (let i = 0; i < numStreams; i++) {
        let x = Math.random() < 0.5 ? (Math.random() < 0.5 ? 0 : width - 1) : Math.floor(Math.random() * width);
        let y = Math.random() < 0.5 ? (Math.random() < 0.5 ? 0 : height - 1) : Math.floor(Math.random() * height);
        let direction = Math.floor(Math.random() * 4); // 0: N, 1: E, 2: S, 3: W
        let path = [];

        for (let j = 0; j < streamLength; j++) {
            if (x >= 0 && x < width && y >= 0 && y < height && !path.some(p => p.x === x && p.y === y)) {
                map[y][x] = '~';
                path.push({ x, y });

                // Slight chance to change direction
                if (Math.random() < 0.3) {
                    direction += Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
                    direction = (direction + 4) % 4; // Wrap around
                }

                switch (direction) {
                    case 0: y--; break;
                    case 1: x++; break;
                    case 2: y++; break;
                    case 3: x--; break;
                }
            } else {
                break; // Stop if out of bounds
            }
        }
        // Optionally widen the stream path slightly
        widenStream(map, path);
    }
}

function widenStream(map, path) {
    const width = map[0].length;
    const height = map.length;
    for (const point of path) {
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (Math.abs(dx) + Math.abs(dy) === 1 && Math.random() < 0.2) { // Adjacent cells
                    const wx = point.x + dx;
                    const wy = point.y + dy;
                    if (wx >= 0 && wx < width && wy >= 0 && wy < height && map[wy][wx] === 'g') {
                        map[wy][wx] = '~';
                    }
                }
            }
        }
    }
}
function generateCliffs(map, width, height, numSeeds = 10, iterations = 5) {
    // Place initial cliff seeds randomly
    for (let i = 0; i < numSeeds; i++) {
        const x = Math.floor(Math.random() * width);
        const y = Math.floor(Math.random() * height);
        if (map[y][x] === 'g') {
            map[y][x] = '@';
        }
    }

    // Growth phase
    for (let iter = 0; iter < iterations; iter++) {
        const nextMap = map.map(row => [...row]); // Create a copy
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (map[y][x] === 'g') {
                    let adjacentCliffs = 0;
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            if (dx === 0 && dy === 0) continue;
                            const nx = x + dx;
                            const ny = y + dy;
                            if (nx >= 0 && nx < width && ny >= 0 && ny < height && map[ny][nx] === '@') {
                                adjacentCliffs++;
                            }
                        }
                    }
                    if (adjacentCliffs >= 2 && Math.random() < 0.5) {
                        nextMap[y][x] = '@';
                    }
                }
            }
        }
        map = nextMap;
    }

    // Optional smoothing phase (turn isolated grass into cliff)
    for (let iter = 0; iter < 3; iter++) {
        const nextMap = map.map(row => [...row]);
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (map[y][x] === 'g') {
                    let surroundingCliffs = 0;
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            if (dx === 0 && dy === 0) continue; // Skip the current cell
                            const nx = x + dx; // Declare nx here
                            const ny = y + dy; // Declare ny here
                            if (nx >= 0 && nx < width && ny >= 0 && ny < height && map[ny][nx] === '@') {
                                surroundingCliffs++;
                            }
                        }
                    }
                    if (surroundingCliffs >= 6) {
                        nextMap[y][x] = '@';
                    }
                }
            }
        }
        map = nextMap;
    }
}
function placeResourceTiles(map, resourceTiles) {
    const mapWidth = map[0].length;
    const mapHeight = map.length;
    const numTiles = Math.floor(mapWidth * mapHeight * 0.1); // 10% resource tiles

    for (let i = 0; i < numTiles; i++) {
        let x = Math.floor(Math.random() * mapWidth);
        let y = Math.floor(Math.random() * mapHeight);

        if (isTilePassable(map[y][x]) || map[y][x] == 'SW') {
            let resourceTile = resourceTiles[Math.floor(Math.random() * resourceTiles.length)];
            map[y][x] = resourceTile;
        }
    }
}

function placeCaveTransitions(map, caveDown, caveUp) {
    const mapWidth = map[0].length;
    const mapHeight = map.length;

    // Place cave down
    let downX, downY;
    let sanityCheck = 0;
    if (caveDown !== '') {
        do {
            downX = Math.floor(Math.random() * mapWidth);
            downY = Math.floor(Math.random() * mapHeight);
            sanityCheck += 1;
        } while (isTilePassable(map[downY][downX]) == false && map[downY][downX] !== 'SW' && sanityCheck < 1000);
        map[downY][downX] = caveDown;
    }
    if (sanityCheck >= 1000) {
        console.log('failed to place cave down')
    }

    // Place cave up at a distance
    sanityCheck=0
    let upX, upY;
    if (caveUp !== '') {
        do {
            upX = Math.floor(Math.random() * mapWidth);
            upY = Math.floor(Math.random() * mapHeight);
            sanityCheck+=1
        } while (sanityCheck < 1000 && (isTilePassable(map[upY][upX]) == false || Math.abs(upX - downX) + Math.abs(upY - downY) < 10)); //ensure they are far enough apart.
        map[upY][upX] = caveUp;
    }
    if (sanityCheck >= 1000) {
        console.log('failed to place cave up')
    }
}

function generateMap(width, height, mapId, mapType, levelNumber = null) {
    if (mapType === 'town') {
        initExploredMap(width, height, mapId);
        return generateTownMap(width, height);
    } else if (mapType === 'dungeon') {
        //return generateDungeonMap(width, height, levelNumber);
        initExploredMap(width, height, mapId);
        //return generateDungeonMap(30, 30, levelNumber);
        //var maze = generateMazeRecursiveBacktracker(size, size);
        //var maze = generateMazePrim(30, 30);
        var maze = generateMazeKruskal(width, height);
        return AddStairsAndMonsters(maze, width, height, levelNumber)
    } else if (mapType === 'resource') {
        //console.log('generateMap resource level ' + levelNumber);
        initExploredMap(width, height, mapId);
        return generateResourceMap(width, height, levelNumber);
    }

    
}

function initExploredMap(mapWidth, mapHeight, mapId) {
    if (!exploredMaps[mapId]) {
        // Initialize explored map only if it doesn't exist for this map ID
        exploredMaps[mapId] = []; // Initialize as an empty array

        for (let y = 0; y < mapHeight; y++) {
            exploredMaps[mapId][y] = []; // Initialize each row as an empty array
            for (let x = 0; x < mapWidth; x++) {
                exploredMaps[mapId][y][x] = {
                    seen: false,
                    type: null
                };
            }
        }
        //console.log('Init explored map ' + mapId);
        //console.log(exploredMaps[mapId]);
    }
}

function clearCanvas() {
    // Get the width and height of your canvas element
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;

    // Call clearRect() with the top-left corner at (0, 0)
    // and the width and height equal to the canvas dimensions
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
}
function renderMap(map) {
    const currentexploredMaps = exploredMaps[currentMapId];
    if (!currentexploredMaps) return; // Don't draw fog if explored map isn't initialized

    const mapHeight = map.length;
    const mapWidth = map[0].length; // Assuming all rows have the same length

    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            let tile = map[y][x];
            let tileType = tileTypes[tile];
            if (tileType !== undefined) {
                if (tile == 'D' || tile == 'R' || tile == 't') {
                    let backGroundImage = loadImage('assets/img/tiles/floor.png');
                    ctx.drawImage(
                        backGroundImage,
                        x * tileSize - cameraX,
                        y * tileSize - cameraY,
                        tileSize,
                        tileSize
                    );
                } else if (isLevelZeroResource(tile)) {
                    let backGroundImage = loadImage('assets/img/tiles/grass.png');
                    ctx.drawImage(
                        backGroundImage,
                        x * tileSize - cameraX,
                        y * tileSize - cameraY,
                        tileSize,
                        tileSize
                    );
                } else if (isLevelOnePlusResource(tile)) {
                    let backGroundImage = loadImage('assets/img/tiles/stone_floor.png');
                    ctx.drawImage(
                        backGroundImage,
                        x * tileSize - cameraX,
                        y * tileSize - cameraY,
                        tileSize,
                        tileSize
                    );
                }
                if (isTileVisible(x, y)) {
                    // Tile is currently visible
                    drawTile(tileType, x, y);
                    //Updating here as it's need to be all tiles in the visible range rather than just where the player is standing
                    updateExploredMaps(x, y, tile);
                } else if (currentexploredMaps && currentexploredMaps[y] && currentexploredMaps[y][x] && currentexploredMaps[y][x].seen) {
                    // Tile has been seen before
                    drawExploredTile(x, y, tile); // Draw what was seen
                } else {
                    // Tile has not been seen, draw fog
                    drawFog(x, y);
                }
                
                
                
            } else {
                console.log(`Tile type ${tile} is undefined`);
            }
        }
    }
}

function drawTile(tileType, x, y) {
    let imagePath = `assets/img/tiles/${tileType}.png`;
    let image = loadImage(imagePath);
    ctx.drawImage(
        image,
        x * tileSize - cameraX,
        y * tileSize - cameraY,
        tileSize,
        tileSize
    );
}
function drawExploredTile(x, y, tile) {
    // Draw the tile based on what was remembered (e.g., a faint outline of a wall, a dimmed resource)
    let imagePath = `assets/img/tiles/${tileTypes[tile]}.png`;
    let image = loadImage(imagePath);
    ctx.globalAlpha = 0.3;
    ctx.drawImage(image, x * tileSize - cameraX, y * tileSize - cameraY);
    ctx.globalAlpha = 1;
}

function drawFog(x, y) {
    // Draw a dark overlay or a specific fog texture
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'; // Example dark fog
    ctx.fillRect(x * tileSize - cameraX, y * tileSize - cameraY, tileSize, tileSize);
}

function drawWallOutline(x, y) {
    ctx.strokeStyle = 'rgba(50, 50, 50, 0.5)'; // Example faint wall outline
    ctx.lineWidth = 1;
    ctx.strokeRect(x * tileSize - cameraX, y * tileSize - cameraY, tileSize, tileSize);
}

function drawDimmedResource(x, y) {
    // Draw a semi-transparent or desaturated version of the resource tile
    const resourceTile = getResourceTile(x, y); // Assuming you have a way to get the resource tile info
    if (resourceTile && resourceTile.image) {
        ctx.globalAlpha = 0.3;
        ctx.drawImage(resourceTile.image, x * tileSize - cameraX, y * tileSize - cameraY);
        ctx.globalAlpha = 1;
    } else {
        ctx.fillStyle = 'rgba(100, 100, 0, 0.5)'; // Fallback for unknown resource
        ctx.fillRect(x * tileSize - cameraX, y * tileSize - cameraY, tileSize, tileSize);
    }
}
function renderLevel() {
    renderMap(maps[getCurrentMapId()]);
    if (getMapType() == 'dungeon') {
        renderMonsters();
    }
    renderPlayer();
    renderSpells();
}

function changeMap(mapId, newMapType, newplayerX, newplayerY) {
    //console.log("changeMap called with mapId:", mapId, "newMapType:", newMapType); //Debugging
    let previousMapID = getCurrentMapId();
    setCurrentMapId(mapId);
    currentMapType = newMapType;
    let levelNumber = parseInt(mapId.split('_')[1]); // Extract level number from mapId
    let previousLevelNumber = 0;
    let currentTile = null;
    clearCanvas();

    //Change background music for the map in question
    playBackgroundMusic(newMapType);
    

    if (newMapType === 'dungeon' || newMapType === 'resource') {
        previousLevelNumber = getCurrentLevel();
        setCurrentLevel(levelNumber);
        if (maps[previousMapID]) {
            currentTile = maps[previousMapID][getPlayerY()][getPlayerX()];
        }
    }
    if (!maps[mapId]) {
        //console.log('changeMap ' + newMapType + ' - level ' + levelNumber);
        maps[mapId] = generateMap(getMapWidth() + (levelNumber * 5), getMapHeight() + (levelNumber * 5), mapId, newMapType, levelNumber);
    }
    if (previousLevelNumber != levelNumber && levelNumber !== null && currentTile !== null) {
        //console.log('changeMap level ' + levelNumber + ' currentTitle ' + currentTile);
        changeLevel(currentTile, newplayerX, newplayerY);
    }
    //New player location?
    if (newplayerX && newplayerY) {
        //console.log(`set player postion on ${getCurrentMapId()} ${newplayerX},${newplayerY}`);
        setPlayerX(newplayerX);
        setPlayerY(newplayerY);
    }

    updateInfoOverlay();
    updateMapDimensions();
    renderLevel();
}
function changeLevel(currentTile) {
    //Set player position to the stairs that lead back to where they came from
    // Find the corresponding entrance/stairs on the new level
    let destinationTile = '';
    if (currentTile === '>') {
        destinationTile = '<';
    } else if (currentTile === '<') {
        destinationTile = '>';
    } else if (currentTile === '^') {
        destinationTile = 'v';
    } else if (currentTile === 'v') {
        destinationTile = '^';
    }

    //console.log('changeLevel currentTile ' + currentTile);

    // Find the coordinates of the destination tile
    let destinationX = -1;
    let destinationY = -1;
    const destinationLevelMap = maps[getCurrentMapId()];

    for (let y = 0; y < destinationLevelMap.length; y++) {
        for (let x = 0; x < destinationLevelMap[y].length; x++) {
            if (destinationLevelMap[y][x] === destinationTile) {
                destinationX = x;
                destinationY = y;
                break;
            }
        }
        if (destinationX !== -1) {
            break;
        }
    }

    if (destinationX !== -1 && destinationY !== -1) {
        setPlayerX(destinationX);
        setPlayerY(destinationY);
    } else {
        // Handle error if destination tile is not found
        console.error(`Destination tile '${destinationTile}' not found on level ${getCurrentMapId()}`);
    }
}

function getCurrentMapId() {
    return currentMapId;
}

function setCurrentMapId(mapId) {
    currentMapId = mapId;
    //console.log('explored')
    //console.log(exploredMaps[mapId]);
    //console.log('tile visible: ' + isTileVisible(0, 15));
    //console.log('map')
    //console.log(maps[currentMapId]);
}

function getMapType() {
    return currentMapType;
}

function updateMapDimensions() {
    mapWidth = maps[getCurrentMapId()][0].length;
    mapHeight = maps[getCurrentMapId()].length;
    //console.log(`Width ${mapWidth}, Heigh ${mapHeight}`);
}

function getMapWidth() {
    return mapWidth;
}

function getMapHeight() {
    return mapHeight;
}
function setMaps(theMaps) {
    if (theMaps && theMaps.length > 0) {
        theMaps.forEach(entity => {
            maps.push(entity)
        });
    }
}
function setMonseters(theMonsters) {
    if (theMonsters && theMonsters.length > 0) {
        theMonsters.forEach(entity => {
            monsters.push(entity)
        });
    }
}

function setExploredMaps(theExploredMaps) {
    if (theExploredMaps && theExploredMaps.length > 0) {
        theExploredMaps.forEach(entity => {
            exploredMaps.push(entity)
        });
    }
}
export { setExploredMaps, setMonseters, setMaps, updateExploredMaps, isTileVisible, exploredMaps, isTilePassable, setCurrentMapId,getCurrentMapId, maps, generateMap, changeMap, getMapWidth, getMapHeight, getMapType, renderLevel, connectionPoints };