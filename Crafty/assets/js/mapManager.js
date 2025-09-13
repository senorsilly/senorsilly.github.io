// managers/mapManager.js
class MapManager {
    constructor() {
        this.mapData = {};
        this.currentZone = null;
        this.currentZoneWidth = 0;
        this.currentZoneHeight = 0;
        this.tileSize = 32; // Define tile size
        this.tileImagePaths = {
            grass: './assets/img/grass_tile.png', 
            dirt: './assets/img/dirt_tile.png',   
            water: './assets/img/water_tile.png', 
            wall: './assets/img/wall_tile.png',     
            door: './assets/img/door_tile.png'      
        };
    }

    async loadMapData() {
        console.log('MapManager: Loading map data...');
        this.tileSize = 32; // Ensure tileSize is set here as well
        // Placeholder for loading actual map data (e.g., from a JSON file)
        this.mapData = {
            home: {
                name: 'Home Area',
                width: 1600, // Example width
                height: 1600, // Example height
                width: 32 * 25, // 25 tiles wide
                height: 32 * 20, // 20 tiles high
                tiles: [
                    ['wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
                    ['wall', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'wall', 'grass', 'grass', 'wall'],
                    ['wall', 'grass', 'dirt', 'dirt', 'dirt', 'dirt', 'dirt', 'dirt', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'wall', 'grass', 'grass', 'wall'],
                    ['wall', 'grass', 'dirt', 'grass', 'grass', 'grass', 'grass', 'dirt', 'grass', 'grass', 'water', 'water', 'water', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'door', 'grass', 'grass', 'wall'],
                    ['wall', 'grass', 'dirt', 'grass', 'grass', 'grass', 'grass', 'dirt', 'grass', 'grass', 'water', 'water', 'water', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'wall', 'grass', 'grass', 'wall'],
                    ['wall', 'grass', 'dirt', 'dirt', 'dirt', 'dirt', 'dirt', 'dirt', 'grass', 'grass', 'water', 'water', 'water', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'wall', 'grass', 'grass', 'wall'],
                    ['wall', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'wall'],
                    ['wall', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'wall'],
                    ['wall', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'wall'],
                    ['wall', 'wall', 'door', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall', 'wall'],
                    ['grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass'],
                    ['grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass'],
                    ['grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass'],
                    ['grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass'],
                    ['grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass'],
                    ['grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass'],
                    ['grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass'],
                    ['grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass'],
                    ['grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass'],
                    ['grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass', 'grass'],
                ]
            },
            town: {
                name: 'Town',
                width: 1200,
                height: 900,
                tiles: this.generateRandomTiles(1200 / this.tileSize, 900 / this.tileSize)
            },
            worldMap: {
                name: 'World Map',
                regions: [
                    { name: 'Home Region', zoneKey: 'home', x: 50, y: 50, width: 100, height: 80 },
                    { name: 'Town Region', zoneKey: 'town', x: 200, y: 150, width: 120, height: 90 },
                    // ... more regions
                ]
            }
            // ... more zones
        };
    }

    generateRandomTiles(gridX, gridY) {
        const tiles = [];
        for (let y = 0; y < gridY; y++) {
            const row = [];
            for (let x = 0; x < gridX; x++) {
                const random = Math.random();
                if (random < 0.7) {
                    row.push('grass');
                } else if (random < 0.85) {
                    row.push('dirt');
                } else {
                    row.push('water');
                }
            }
            tiles.push(row);
        }
        return tiles;
    }

    loadZone(zoneKey) {
        //console.log(`MapManager: Loading zone ${zoneKey}`);
        this.currentZone = this.mapData[zoneKey] || null;
        if (this.currentZone) {
            this.currentZoneWidth = this.currentZone.width || 0;
            this.currentZoneHeight = this.currentZone.height || 0;
            //console.log(`MapManager: Zone "${zoneKey}" loaded. Width: ${this.currentZoneWidth}, Height: ${this.currentZoneHeight}`); // ADD THIS LOG
            // Here you would also handle loading the tile data for rendering
        } else if (zoneKey === 'worldMap' && this.mapData.worldMap) {
            this.currentZone = this.mapData.worldMap;
            this.currentZoneWidth = 0; // World map doesn't have fixed dimensions in this way
            this.currentZoneHeight = 0;
        } else {
            console.error(`MapManager: Zone key "${zoneKey}" not found.`);
            this.currentZoneWidth = 0;
            this.currentZoneHeight = 0;
        }
    }

    getCurrentZone() {
        return this.currentZone;
    }

    getWorldMapRegions() {
        return this.mapData.worldMap ? this.mapData.worldMap.regions : [];
    }

    getCurrentZoneDimensions() {
        return { width: this.currentZoneWidth, height: this.currentZoneHeight };
    }

    getTileSize() {
        return this.tileSize;
    }

    getTiles() {
        return this.currentZone && this.currentZone.tiles ? this.currentZone.tiles : [];
    }
}
export default MapManager;