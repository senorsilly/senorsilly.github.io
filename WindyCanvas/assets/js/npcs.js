const npcs = [
    {
        id: 'villager_01',
        name: 'Old Man Hemlock',
        portrait: 'assets/img/portraits/old_man_neutral.png',
        spriteFrames: ['assets/img/sprites/old_man_0.png', 'assets/img/sprites/old_man_1.png'],
        animationSpeed: 250, // Milliseconds per frame
        x: 5, // Tile X
        y: 7, // Tile Y
        currentFrame: 0,
        animationTimer: 0,
        dialogue: {
            start: {
                text: "Greetings, traveler. What brings you to our humble abode?",
                choices: [
                    { text: "Just passing through.", next: 'passing_through' },
                    { text: "I'm looking for adventure!", next: 'looking_for_adventure' }
                ]
            },
            passing_through: {
                text: "Safe travels then.",
                choices: [
                    { text: "Goodbye.", next: null }
                ]
            },
            looking_for_adventure: {
                text: "Hah! Adventure? There's plenty to be found around here, some good, some... less so. Be careful.",
                portrait: 'assets/img/portraits/old_man_happy.png',
                choices: [
                    { text: "Thanks for the warning.", next: null },
                    { text: "Any tips?", next: 'adventure_tips' }
                ]
            },
            adventure_tips: {
                text: "Stick to the path, and don't trust the shadows.",
                choices: [
                    { text: "Got it.", next: null }
                ]
            }
            // ... more dialogue nodes ...
        }
    },
    {
        id: 'healer_01',
        name: 'Sister Agnes',
        portrait: 'assets/img/portraits/healer.png',
        spriteFrames: ['assets/img/sprites/healer_0.png', 'assets/img/sprites/healer_1.png'],
        animationSpeed: 300,
        x: 7,
        y: 7,
        currentFrame: 0,
        animationTimer: 0,
        dialogue: {
            start: {
                text: "Welcome, child. Are you in need of healing?",
                choices: [
                    { text: "Yes, please.", action: 'heal_player', next: 'healed' },
                    { text: "Just looking.", next: null }
                ]
            },
            healed: {
                text: "May your wounds mend quickly.",
                choices: [
                    { text: "Thank you.", next: null }
                ]
            }
        }
    }
    // ... more NPCs ...
];

export { npcs}