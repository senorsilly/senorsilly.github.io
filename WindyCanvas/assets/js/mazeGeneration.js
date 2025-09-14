function generateMazeRecursiveBacktracker(width, height) {
    const grid = [];
    for (let y = 0; y < height; y++) {
        grid[y] = [];
        for (let x = 0; x < width; x++) {
            grid[y][x] = { north: true, south: true, east: true, west: true, visited: false };
        }
    }

    function carvePath(x, y) {
        grid[y][x].visited = true;
        const directions = [
            { dx: 0, dy: -1, dir: 'north', opposite: 'south' },
            { dx: 0, dy: 1, dir: 'south', opposite: 'north' },
            { dx: 1, dy: 0, dir: 'east', opposite: 'west' },
            { dx: -1, dy: 0, dir: 'west', opposite: 'east' }
        ];

        // Shuffle the directions to ensure randomness
        for (let i = directions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [directions[i], directions[j]] = [directions[j], directions[i]];
        }

        for (const dir of directions) {
            const newX = x + dir.dx * 2; // Move two steps to ensure a wall in between
            const newY = y + dir.dy * 2;

            if (newY >= 0 && newY < height && newX >= 0 && newX < width && !grid[newY][newX].visited) {
                // Remove the wall between the current cell and the new cell
                grid[y + dir.dy][x + dir.dx][dir.opposite] = false;
                grid[y][x][dir.dir] = false;
                carvePath(newX, newY);
            }
        }
    }

    // Start from a random cell
    const startX = Math.floor(Math.random() * width);
    const startY = Math.floor(Math.random() * height);
    carvePath(startX, startY);

    return convertGridToMapData(grid);
}

function convertGridToMapData(grid) {
    const height = grid.length;
    const width = grid[0].length;
    const mapData = [];

    for (let y = 0; y < height * 2 - 1; y++) {
        mapData[y] = [];
        for (let x = 0; x < width * 2 - 1; x++) {
            if (x % 2 === 0 && y % 2 === 0) {
                // Cell
                mapData[y][x] = '.'; // Floor
            } else if (x % 2 === 1 && y % 2 === 0) {
                // Vertical Wall
                const gridX = Math.floor(x / 2);
                const gridY = Math.floor(y / 2);
                mapData[y][x] = grid[gridY][gridX].east ? '#' : '.';
            } else if (x % 2 === 0 && y % 2 === 1) {
                // Horizontal Wall
                const gridX = Math.floor(x / 2);
                const gridY = Math.floor(y / 2);
                mapData[y][x] = grid[gridY][gridX].south ? '#' : '.';
            } else {
                // Corner - always a wall for this simple conversion
                mapData[y][x] = '#';
            }
        }
    }

    return mapData;
}

function generateMazePrim(width, height) {
    const grid = [];
    for (let y = 0; y < height; y++) {
        grid[y] = [];
        for (let x = 0; x < width; x++) {
            grid[y][x] = { north: true, south: true, east: true, west: true, inMaze: false };
        }
    }

    const walls = [];
    const startX = Math.floor(Math.random() * width);
    const startY = Math.floor(Math.random() * height);
    grid[startY][startX].inMaze = true;
    addWallsToFrontier(startX, startY, grid, walls);

    while (walls.length > 0) {
        const randomIndex = Math.floor(Math.random() * walls.length);
        const wall = walls.splice(randomIndex, 1)[0];
        const cx = wall.x;
        const cy = wall.y;
        const nx = wall.nx;
        const ny = wall.ny;

        if (nx >= 0 && nx < width && ny >= 0 && ny < height && !grid[ny][nx].inMaze) {
            carvePath(cx, cy, nx, ny, grid);
            grid[ny][nx].inMaze = true;
            addWallsToFrontier(nx, ny, grid, walls);
        }
    }

    return convertGridToMapDataPrim(grid);
}

function addWallsToFrontier(x, y, grid, walls) {
    const neighbors = [
        { dx: 0, dy: -1, dir: 'north', opposite: 'south' },
        { dx: 0, dy: 1, dir: 'south', opposite: 'north' },
        { dx: 1, dy: 0, dir: 'east', opposite: 'west' },
        { dx: -1, dy: 0, dir: 'west', opposite: 'east' }
    ];

    for (const neighbor of neighbors) {
        const nx = x + neighbor.dx;
        const ny = y + neighbor.dy;

        if (nx >= 0 && nx < grid[0].length && ny >= 0 && ny < grid.length && !grid[ny][nx].inMaze) {
            walls.push({ x, y, nx, ny, dir: neighbor.dir, opposite: neighbor.opposite });
        }
    }
}

function carvePath(cx, cy, nx, ny, grid) {
    if (nx > cx) {
        grid[cy][cx].east = false;
        grid[ny][nx].west = false;
    } else if (nx < cx) {
        grid[cy][cx].west = false;
        grid[ny][nx].east = false;
    } else if (ny > cy) {
        grid[cy][cx].south = false;
        grid[ny][nx].north = false;
    } else if (ny < cy) {
        grid[cy][cx].north = false;
        grid[ny][nx].south = false;
    }
}

function convertGridToMapDataPrim(grid) {
    const height = grid.length;
    const width = grid[0].length;
    const mapData = [];

    for (let y = 0; y < height * 2 - 1; y++) {
        mapData[y] = [];
        for (let x = 0; x < width * 2 - 1; x++) {
            if (x % 2 === 0 && y % 2 === 0) {
                // Cell
                mapData[y][x] = '.'; // Floor
            } else if (x % 2 === 1 && y % 2 === 0) {
                // Vertical Wall
                const gridX = Math.floor(x / 2);
                const gridY = Math.floor(y / 2);
                mapData[y][x] = grid[gridY][gridX].east ? '#' : '.';
            } else if (x % 2 === 0 && y % 2 === 1) {
                // Horizontal Wall
                const gridX = Math.floor(x / 2);
                const gridY = Math.floor(y / 2);
                mapData[y][x] = grid[gridY][gridX].south ? '#' : '.';
            } else {
                // Corner - always a wall for this simple conversion
                mapData[y][x] = '#';
            }
        }
    }

    return mapData;
}

class DisjointSet {
    constructor(n) {
        this.parent = new Array(n);
        for (let i = 0; i < n; i++) {
            this.parent[i] = i;
        }
        this.rank = new Array(n).fill(0);
    }

    find(i) {
        if (this.parent[i] === i) {
            return i;
        }
        return this.parent[i] = this.find(this.parent[i]); // Path compression
    }

    union(i, j) {
        const rootI = this.find(i);
        const rootJ = this.find(j);
        if (rootI !== rootJ) {
            if (this.rank[rootI] < this.rank[rootJ]) {
                this.parent[rootI] = rootJ;
            } else if (this.rank[rootI] > this.rank[rootJ]) {
                this.parent[rootJ] = rootI;
            } else {
                this.parent[rootJ] = rootI;
                this.rank[rootI]++;
            }
            return true; // Union happened
        }
        return false; // Already in the same set
    }
}

function generateMazeKruskal(width, height) {
    const grid = [];
    for (let y = 0; y < height; y++) {
        grid[y] = [];
        for (let x = 0; x < width; x++) {
            grid[y][x] = { north: true, south: true, east: true, west: true };
        }
    }

    const numCells = width * height;
    const dsu = new DisjointSet(numCells);
    const walls = [];

    // Add all internal walls to the list
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const cellIndex = y * width + x;
            if (y > 0) walls.push({ r1: y, c1: x, r2: y - 1, c2: x, dir: 'north' });
            if (x > 0) walls.push({ r1: y, c1: x, r2: y, c2: x - 1, dir: 'west' });
        }
    }

    // Shuffle the walls randomly
    for (let i = walls.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [walls[i], walls[j]] = [walls[j], walls[i]];
    }

    let edgesCarved = 0;
    while (edgesCarved < numCells - 1 && walls.length > 0) {
        const wall = walls.pop();
        const index1 = wall.r1 * width + wall.c1;
        const index2 = wall.r2 * width + wall.c2;

        if (dsu.union(index1, index2)) {
            carvePathKruskal(grid, wall.r1, wall.c1, wall.r2, wall.c2, wall.dir);
            edgesCarved++;
        }
    }

    return convertGridToMapDataKruskal(grid);
}

function carvePathKruskal(grid, r1, c1, r2, c2, dir) {
    if (r1 === r2) { // Horizontal wall
        if (c1 > c2) { // West
            grid[r1][c1].west = false;
            grid[r2][c2].east = false;
        } else { // East
            grid[r1][c1].east = false;
            grid[r2][c2].west = false;
        }
    } else { // Vertical wall
        if (r1 > r2) { // North
            grid[r1][c1].north = false;
            grid[r2][c2].south = false;
        } else { // South
            grid[r1][c1].south = false;
            grid[r2][c2].north = false;
        }
    }
}

function convertGridToMapDataKruskal(grid) {
    const height = grid.length;
    const width = grid[0].length;
    const mapData = [];

    for (let y = 0; y < height * 2 - 1; y++) {
        mapData[y] = [];
        for (let x = 0; x < width * 2 - 1; x++) {
            if (x % 2 === 0 && y % 2 === 0) {
                // Cell
                mapData[y][x] = '.'; // Floor
            } else if (x % 2 === 1 && y % 2 === 0) {
                // Vertical Wall
                const gridX = Math.floor(x / 2);
                const gridY = Math.floor(y / 2);
                mapData[y][x] = grid[gridY][gridX].east ? '#' : '.';
            } else if (x % 2 === 0 && y % 2 === 1) {
                // Horizontal Wall
                const gridX = Math.floor(x / 2);
                const gridY = Math.floor(y / 2);
                mapData[y][x] = grid[gridY][gridX].south ? '#' : '.';
            } else {
                // Corner - always a wall for this simple conversion
                mapData[y][x] = '#';
            }
        }
    }

    return mapData;
}

export { generateMazeKruskal, generateMazePrim, generateMazeRecursiveBacktracker }