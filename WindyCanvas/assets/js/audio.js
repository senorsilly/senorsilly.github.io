// Get modal elements
const audioSettingsModal = document.getElementById('audioSettingsModal');
const closeAudioSettingsModalButton = document.getElementById('closeAudioSettingsModal');
const splashScreen = document.getElementById('splashScreen');
const startGameButton = document.getElementById('startGameButton');
const loadingText = document.getElementById('loadingText');
const progressBar = document.getElementById('progressBar');
const gameCanvas = document.getElementById('gameCanvas');
const uiContainer = document.getElementById('uiContainer');

// Get volume slider elements
const musicVolumeSlider = document.getElementById('musicVolumeSlider');
const effectsVolumeSlider = document.getElementById('effectsVolumeSlider');
const musicVolumeDisplay = document.getElementById('musicVolumeDisplay');
const effectsVolumeDisplay = document.getElementById('effectsVolumeDisplay');

let audioContext; // Declare audioContext outside the loading function
const soundBuffers = {};
let musicVolume = 0.0;
let effectsVolume = 0.1;
let musicGainNode;

//Background music
const mapMusic = {
    'town': 'assets/audio/town_theme.mp3',
    'resource': 'assets/audio/resource.mp3',
    'dungeon': 'assets/audio/dungeon.mp3',
};

let currentMap = 'town'; // Initialize with the starting map
let currentBackgroundMusicSource = null;
let currentBackgroundMusicURL = null; // To track what's currently playing

function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        musicGainNode = audioContext.createGain();
        musicGainNode.gain.value = musicVolume;
        musicGainNode.connect(audioContext.destination); // Make sure this is here
        //console.log('AudioContext initialized after user gesture.');
        loadGameAudio();
    } else if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
            console.log('AudioContext resumed.');
            if (!currentBackgroundMusicSource && currentMap) {
                playBackgroundMusic(currentMap);
            }
        });
    }
}
function loadAudio(url, name, callback) {
    fetch(url)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
        .then(audioBuffer => {
            soundBuffers[name] = audioBuffer;
            //console.log(`Audio loaded: ${name} from ${url}`);
            if (callback) {
                callback();
            }
        })
        .catch(error => console.error(`Error loading audio ${url}:`, error));
}

function loadGameAudio() {
    // Load background music tracks
    for (const mapId in mapMusic) {
        loadAudio(mapMusic[mapId], mapId, () => {
            if (audioContext && audioContext.state === 'running') {
                playBackgroundMusic('town');
            }
        }); // Use mapId as the buffer name
    }

    loadAudio('assets/audio/item_pickup1.wav', 'itemPickup');
    loadAudio('assets/audio/craft_success.wav', 'craftSuccess');
    loadAudio('assets/audio/swing.wav', 'swing');
    loadAudio('assets/audio/spell.wav', 'spell');
    loadAudio('assets/audio/monster_attack.wav', 'monsterAttack');
    loadAudio('assets/audio/monster_death.wav', 'monsterDeath');
    loadAudio('assets/audio/monster_move.wav', 'monsterMove');
    loadAudio('assets/audio/thud.wav', 'thud');
    loadAudio('assets/audio/mine.wav', 'mine'); 
}

let debounceTimeout = null; // Define outside the function
function playBackgroundMusic(mapId) {
    if (!mapId) {
        mapId = currentMap; // Use the current map if no mapId is provided
    }

    // Debounce implementation
    const debounceDelay = 250; // Adjust this value (in milliseconds) as needed
    if (debounceTimeout) {
        clearTimeout(debounceTimeout);
    }

    debounceTimeout = setTimeout(() => {
        const musicURL = mapMusic[mapId];

        if (musicURL && soundBuffers[mapId] && audioContext && audioContext.state === 'running' && musicURL !== currentBackgroundMusicURL) {
            // Stop the currently playing music if there is one
            if (currentBackgroundMusicSource) {
                currentBackgroundMusicSource.stop();
                currentBackgroundMusicSource = null;
            }
            //console.log('soundBuffers for', mapId, ':', soundBuffers[mapId]);
            currentBackgroundMusicSource = audioContext.createBufferSource();
            currentBackgroundMusicSource.buffer = soundBuffers[mapId];
            currentBackgroundMusicSource.connect(musicGainNode); // Connect to volume control
            currentBackgroundMusicSource.loop = true;
            currentBackgroundMusicSource.start(0);
            currentBackgroundMusicURL = musicURL;
            currentMap = mapId; // Update the current map
            //console.log(`Playing background music for: ${mapId}`);
        } else if (!musicURL) {
            console.warn(`No background music defined for map: ${mapId}`);
            stopBackgroundMusic();
        } else if (!soundBuffers[mapId]) {
            console.warn(`Background music for map "${mapId}" not loaded.`);
            stopBackgroundMusic();
        } else if (musicURL === currentBackgroundMusicURL && currentBackgroundMusicSource && audioContext && audioContext.state === 'running') {
            // Music for this map is already playing, no need to restart
            console.log(`Background music for ${mapId} is already playing.`);
        } else if (audioContext && audioContext.state !== 'running') {
            console.warn('AudioContext is not running, cannot play background music.');
        }

        // Clear the timeout after execution
        debounceTimeout = null;
    }, debounceDelay);
}

function setMusicVolume(volume) {
    musicVolume = Math.max(0, Math.min(1, volume));
    musicGainNode.gain.value = musicVolume;
    musicVolumeSlider.value = musicVolume; // Update slider position
    musicVolumeDisplay.textContent = `${Math.round(musicVolume * 100)}%`; // Update display
}

function setEffectsVolume(volume) {
    effectsVolume = Math.max(0, Math.min(1, volume));
    effectsVolumeSlider.value = effectsVolume; // Update slider position
    effectsVolumeDisplay.textContent = `${Math.round(effectsVolume * 100)}%`; // Update display
}
function stopBackgroundMusic() {
    if (currentBackgroundMusicSource) {
        currentBackgroundMusicSource.stop();
        currentBackgroundMusicSource = null;
        currentBackgroundMusicURL = null;
        console.log('Background music stopped.');
    }
}

// For sound effects, you can create a new gain node each time if you want individual control,
// or have a master effects gain node. For simplicity here, we'll adjust volume directly on the source.
function playSoundEffect(name, volume = effectsVolume) {
    if (soundBuffers[name] && audioContext && audioContext.state === 'running') {
        const soundSource = audioContext.createBufferSource();
        soundSource.buffer = soundBuffers[name];
        const gainNode = audioContext.createGain();
        gainNode.gain.value = volume;
        soundSource.connect(gainNode);
        gainNode.connect(audioContext.destination);
        soundSource.start(0);
    } else {
        console.warn(`Sound effect "${name}" not loaded or AudioContext not running.`);
    }
}

// Function to open the audio settings modal
function openAudioSettingsModal() {
    audioSettingsModal.style.display = 'block';
    // Initialize slider values when opening the modal
    musicVolumeSlider.value = musicVolume;
    musicVolumeDisplay.textContent = `${Math.round(musicVolume * 100)}%`;
    effectsVolumeSlider.value = effectsVolume;
    effectsVolumeDisplay.textContent = `${Math.round(effectsVolume * 100)}%`;
}

// Function to close the audio settings modal
function closeAudioSettingsModal() {
    audioSettingsModal.style.display = 'none';
}

// Event listener to close the modal
closeAudioSettingsModalButton.addEventListener('click', closeAudioSettingsModal);

// Event listeners for volume sliders
musicVolumeSlider.addEventListener('input', () => {
    setMusicVolume(parseFloat(musicVolumeSlider.value));
});

effectsVolumeSlider.addEventListener('input', () => {
    setEffectsVolume(parseFloat(effectsVolumeSlider.value));
});

// You'll need a way to trigger the openAudioSettingsModal() function,
// for example, from a button in your UI.
// Example (assuming you have a button with id="openAudioSettings"):
const openAudioSettingsButton = document.getElementById('openAudioSettings');
if (openAudioSettingsButton) {
    openAudioSettingsButton.addEventListener('click', openAudioSettingsModal);
}

export { loadGameAudio, audioContext, initAudioContext, stopBackgroundMusic, playBackgroundMusic, playSoundEffect }