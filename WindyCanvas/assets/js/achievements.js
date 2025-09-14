import { checkAndUnlockAchievement } from './ui.js'

const achievementsData = {
    'got_wood': {
        name: 'Got Wood!',
        description: 'Chop down your first tree.',
        image: 'assets/img/achievements/got_wood.png',
        unlocked: false // Initially locked
    },
    'chatty': {
        name: 'Chatty',
        description: 'Talk to an NPC for the first time.',
        image: 'assets/img/achievements/chatty.png',
        unlocked: false
    },
    'blood_thirst': {
        name: 'Blood Thirst',
        description: 'Defeat 10 monsters.',
        image: 'assets/img/achievements/blood_thirst.png',
        unlocked: false
    },
    // ... more achievements ...
};

// Keep track of the number of monsters killed
let monstersKilled = 0;

// Example: Unlock achievements based on game events
function handleTreeChopped() {
    checkAndUnlockAchievement('got_wood');
}

function handleFirstNpcTalkedTo() {
    checkAndUnlockAchievement('chatty');
}

function handleMonsterKilled() {
    monstersKilled++;
    if (monstersKilled >= 10) {
        checkAndUnlockAchievement('blood_thirst');
    }
}

export { achievementsData, handleTreeChopped, handleFirstNpcTalkedTo, handleMonsterKilled }