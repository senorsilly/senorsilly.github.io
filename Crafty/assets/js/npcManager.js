class NpcManager {
    constructor(game) {
        this.game = game;
        this.npcs = {}; // We'll populate this with NPC data later
    }

    loadNpcs(zoneData) {
        this.npcs[zoneData.name] = zoneData.npcs || [];
        console.log(`NpcManager: Loaded NPCs for ${zoneData.name}`, this.npcs[zoneData.name]);
    }

    interactWithNpc(npcId) {
        const currentZoneNpcs = this.npcs[this.game.gameState.currentZone] || [];
        const npc = currentZoneNpcs.find(npc => npc.id === npcId);
        if (npc) {
            console.log('Interacting with NPC:', npc);
            this.game.uiManager.showModal(`You are talking to ${npc.name}.`);
            // Implement specific interaction logic based on NPC type
        } else {
            console.log('NPC not found:', npcId);
        }
    }
}
export default NpcManager;