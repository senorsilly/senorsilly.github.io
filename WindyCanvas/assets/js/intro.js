import { showGameElements } from './gameState.js'
const introScreen = document.getElementById('intro-screen');
const introImage = document.getElementById('intro-image');
const introText = document.getElementById('intro-text');
const nextIntroButton = document.getElementById('next-intro-button');
const skipIntroButton = document.getElementById('skip-intro-button');

let introTimer;
const introPartDuration = 5000; // Duration in milliseconds for each part

function startIntro() {
    introActive = true;
    currentIntroPart = 0;
    loadIntroPart();
    introScreen.style.display = 'block';
    startIntroTimer();
}

function loadIntroPart() {
    if (currentIntroPart < gameIntro.length) {
        introImage.src = gameIntro[currentIntroPart].image;
        introText.textContent = gameIntro[currentIntroPart].text;

        if (gameIntro[currentIntroPart].final) {
            nextIntroButton.textContent = "Begin Adventure";
        } else {
            nextIntroButton.textContent = "Next";
        }
    } else {
        endIntro();
    }
}

function nextIntro() {
    currentIntroPart++;
    loadIntroPart();
    resetIntroTimer();
}

function skipIntro() {
    endIntro();
}

function endIntro() {
    clearInterval(introTimer);
    introActive = false;
    introScreen.style.display = 'none';
    startGameAfterIntro(); // Your function to start the actual game
}

function startIntroTimer() {
    clearInterval(introTimer);
    introTimer = setTimeout(nextIntro, introPartDuration);
}

function resetIntroTimer() {
    clearTimeout(introTimer);
    startIntroTimer();
}

// Event listeners
nextIntroButton.addEventListener('click', () => {
    if (introActive) {
        nextIntro();
    }
});

skipIntroButton.addEventListener('click', () => {
    if (introActive) {
        skipIntro();
    }
});

function startGameAfterIntro() {
    // This is where you would proceed with loading the initial game level,
    // setting up the player, and starting the game loop.
    //console.log("Intro finished, starting the game.");
    //hideMainMenu(); // Assuming you have a function to hide the main menu
    //generateLevel(0);
    //loadLevel(0, 5, 5);
    //updateUI();
    //// Start your game loop here
    showGameElements();
}

const gameIntro = [
    {
        image: 'assets/img/intro/part1.png',
        text: "In the realm of Aerthos, the winds once whispered tales of harmony and prosperity. But a creeping silence has fallen...",
    },
    {
        image: 'assets/img/intro/part2.png',
        text: "Ancient artifacts, imbued with the power of the winds, have been scattered and their magic disrupted. The land stagnates...",
    },
    {
        image: 'assets/img/intro/part3.png',
        text: "You awaken, an adventurer with a forgotten past, drawn by the lingering echoes of the wind's song. Your journey begins...",
    },
    {
        image: 'assets/img/intro/part4.png',
        text: "Will you be the one to gather the lost artifacts and restore the winds to Aerthos? Click to begin your adventure.",
        final: true // Optional: Flag for the last part
    }
    // ... more parts of your intro ...
];

let currentIntroPart = 0;
let introActive = false;

export {startIntro }