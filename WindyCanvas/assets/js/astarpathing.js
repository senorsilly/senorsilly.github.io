function findPathAStar(startX, startY, targetX, targetY, mapData) {
    const openSet = [];
    const closedSet = [];
    const startNode = { x: startX, y: startY, g: 0, h: heuristic(startX, startY, targetX, targetY), f: 0, parent: null };

    openSet.push(startNode);

    while (openSet.length > 0) {
        // Find the node with the lowest F cost in the open set
        let currentNode = openSet[0];
        let currentIndex = 0;
        for (let i = 1; i < openSet.length; i++) {
            if (openSet[i].f < currentNode.f) {
                currentNode = openSet[i];
                currentIndex = i;
            }
        }

        // Move the current node from the open set to the closed set
        openSet.splice(currentIndex, 1);
        closedSet.push(currentNode);

        // If the target is reached, reconstruct and return the path
        if (currentNode.x === targetX && currentNode.y === targetY) {
            return reconstructPath(currentNode);
        }

        // Get neighbors of the current node (up, down, left, right)
        const neighbors = getNeighbors(currentNode.x, currentNode.y, mapData);

        for (const neighbor of neighbors) {
            // If the neighbor is in the closed set, ignore it
            if (closedSet.some(node => node.x === neighbor.x && node.y === neighbor.y)) {
                continue;
            }

            // Calculate the cost to move to the neighbor
            const newG = currentNode.g + 1;
            const newH = heuristic(neighbor.x, neighbor.y, targetX, targetY);
            const newF = newG + newH;

            // If the neighbor is not in the open set OR the new path to the neighbor is shorter
            const openNeighbor = openSet.find(node => node.x === neighbor.x && node.y === neighbor.y);
            if (!openNeighbor || newG < openNeighbor.g) {
                neighbor.g = newG;
                neighbor.h = newH;
                neighbor.f = newF;
                neighbor.parent = currentNode;

                if (!openNeighbor) {
                    openSet.push(neighbor);
                }
            }
        }
    }

    // If no path is found
    return null;
}

function heuristic(x1, y1, x2, y2) {
    // Manhattan distance
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

function getNeighbors(x, y, mapData) {
    const neighbors = [];
    const possibleNeighbors = [
        { dx: 0, dy: -1 }, // Up
        { dx: 0, dy: 1 },  // Down
        { dx: -1, dy: 0 }, // Left
        { dx: 1, dy: 0 }   // Right
    ];

    for (const move of possibleNeighbors) {
        const newX = x + move.dx;
        const newY = y + move.dy;

        if (
            newY >= 0 &&
            newY < mapData.length &&
            newX >= 0 &&
            newX < mapData[0].length &&
            mapData[newY][newX] === '.' // Only move to floor tiles
        ) {
            neighbors.push({ x: newX, y: newY });
        }
    }

    return neighbors;
}

function reconstructPath(node) {
    const path = [];
    let current = node;
    while (current) {
        path.unshift({ x: current.x, y: current.y });
        current = current.parent;
    }
    return path.slice(1); // Remove the starting node
}

export {findPathAStar }