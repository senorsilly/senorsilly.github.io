// main.js
import { generateMap } from './map.js';
import { handleInput } from './player.js';
import { initGame } from './game.js';
import { updateInventoryDisplay } from './inventory.js';
import * as ui from './ui.js';

// Event listeners
document.addEventListener('keydown', handleInput);

// Start the game waits DOMContentLoaded and it called automatically
//initGame();