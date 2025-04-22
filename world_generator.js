let worldData = Array(266).fill().map(() => Array(533).fill().map(() => ({})));
let worldSettlements = new Map();
let worldLevels = [];

let SEED = '5952';


function preGenerateWorldData() {
  generateWorldLevels();
return new Promise(resolve => {
    for (let row = 0; row < 266; row++) {
        for (let col = 0; col < 533; col++) {
            const index = row * 533 + col;
            let regionData = getDataRegion(row, col);
            if (landmassData[index] === true) {
                // Get the base data for the region
                if (regionData) {
                // Generate content based on region attributes
                    worldData[row][col] = {
                            climate: regionData.climate,
                            cultures: regionData.cultures,
                            desert: regionData.desert,
                            forest: regionData.forest,
                            groups: regionData.groups,
                            index: regionData.index,
                            land: regionData.land,
                            population: regionData.population,
                            superRegion: regionData.superRegion,
                            terrain: regionData.terrain,
                            vegetation: regionData.vegetation,
                            factions: regionData.factions,
                            continent: regionData.continent,
                            water: false
                    };
                    const seed = Math.seedrandom().toString(36).substr(2, 10);
                    worldData[row][col].seed = seed;
                    worldData[row][col].exploredCells = new Set();
                    worldData[row][col].explorationReduction = Math.floor(Math.random() * 1200) + 800;
                    worldData[row][col].explorationProgress = 0;
                    worldData[row][col].level = worldLevels[row][col];
                    worldData[row][col].animals = [];
                }
            } else {
                worldData[row][col] = {
                    water: true
                }
            }
        }
    }
    resolve();
});
}


function generateWorldLevels() {
  const rows = 266;
  const cols = 533;
  const levels = 50;
  const noise = new SimplexNoise(); // Initialize the noise generator

  const levelThresholds = Array.from({ length: levels }, (_, i) =>
    1 - Math.pow((levels - i) / levels, 2)
);

  worldLevels = []; // 2D array to store the level for each cell

  // Iterate through each cell in the world
  for (let row = 0; row < rows; row++) {
      const rowLevels = [];
      for (let col = 0; col < cols; col++) {
        
          // Generate a noise value for the cell (scale the coordinates to get larger, smoother regions)
          const noiseValue = noise.noise2D(row / 15, col / 15); // Adjust divisor for region size
          const normalizedValue = (noiseValue + 1) / 2; // Normalize to [0, 1]

          // Determine the level based on thresholds

          // const level = levelThresholds.findIndex(threshold => normalizedValue < threshold);

          const level = 1;

          // Push the level to the row array
          rowLevels.push(level >= 0 ? level : levels - 1); // Default to the max level if no threshold matches
      }
      worldLevels.push(rowLevels); // Add the row to the world
  }

}





function getDataRegion(newRow, newCol) {
    let region = {};
    const index = newRow * 533 + newCol;
    if (landmassData[index] === true) {
        const cellSuperRegionColor = superRegionsImageData.slice(index * 4, index * 4 + 3); // Extract RGB values of the super region
        const cellSuperRegionColorString = cellSuperRegionColor.map(c => c.toString(16).padStart(2, '0')).join(''); // Convert to hex string for comparison
        const cellSuperRegionName = superRegionsData[cellSuperRegionColorString]; // Get the name of the super region based on the color

        if (cellSuperRegionName) {

            const cultures1 = areasObject[cellSuperRegionName].cultures;
            region = getOverworldCellData2(index, cellSuperRegionName, cultures1, newRow, newCol);
            region.level = worldLevels[newRow][newCol];
            return region;
        }

    } else {
        region = {
            water: true
        }
    }
}


async function generatePreContentForRegion(region, x, y) {

    const percentage = Math.floor(Math.random() * 100) + 1;
    if (region.factions && region.superRegion && region.cultures && region.land === 'Land') {
        if (1 === 1) {
            await generateOtherGroups(region);
            console.log('await generateOtherGroups(region);');
        }
        
    }

    let settlementChance = 20;
    if (region.climate === 'arctic') {
        settlementChance = 20;
    } else if (region.climate === 'arid') {
        settlementChance = 20;
    }
    if (percentage <= settlementChance) {
        generateWorldSettlements(region, x, y);
    }
}


function reshapeMapBorders(regionContent) {
  const size = regionContent.length;
  const simplex = new SimplexNoise();
  const maxBorderCut = Math.floor(size * (0.2 - (Math.random() * 0.2))); // Max 20% cut

  for (let x = 0; x < size; x++) {

      let topCut = Math.floor((simplex.noise2D(x * 0.2, 0) + 1) / 2 * maxBorderCut);
      let bottomCut = Math.floor((simplex.noise2D(x * 0.2, 1) + 1) / 2 * maxBorderCut);
      
      for (let y = 0; y < topCut; y++) {
        markAsRemoved(regionContent[y][x]);
      }
      for (let y = 0; y < bottomCut; y++) {
        markAsRemoved(regionContent[size - 1 - y][x]);
      }
  }

  for (let y = 0; y < size; y++) {

      let leftCut = Math.floor((simplex.noise2D(0, y * 0.2) + 1) / 2 * maxBorderCut);
      let rightCut = Math.floor((simplex.noise2D(1, y * 0.2) + 1) / 2 * maxBorderCut);
      
      for (let x = 0; x < leftCut; x++) {
        markAsRemoved(regionContent[y][x]);
      }
      for (let x = 0; x < rightCut; x++) {
        markAsRemoved(regionContent[y][size - 1 - x]);
      }
  }

  function markAsRemoved(data) {
    if (data.river != true && data.road != true) {
      data.removed = true;
      data.occupied = true;
    }
  }

}

function createRegionBorders(regionContent) {
  let size = regionContent.length;
  let borderSize = 6;

  for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
          if (x <= borderSize || x >= size - borderSize || y <= borderSize || y >= size - borderSize) {
              regionContent[x][y].impassable = true;
              regionContent[x][y].occupied = true; 
              regionContent[x][y].regionWall = true; 
              const elevation = (Math.random() * (1.2 - 0.4));
              regionContent[x][y].elevation = elevation;

                // Corrected inner wall positions
                if (x === borderSize && y >= borderSize && y < size - borderSize) {  
                  regionContent[x][y].side = 'North'; 
                    const ranLoc = Math.round(Math.random() * 10) + 1;
                    if ( y > 12 && y < size - 12) {
                      setPassageWay(ranLoc, regionContent[x][y], 'North');
                    }
                }
                if (y === borderSize && x >= borderSize && x < size - borderSize) {  
                  regionContent[x][y].side = 'West'; 
                    const ranLoc = Math.round(Math.random() * 10) + 1;
                    if ( x > 12 && x < size - 12) {
                      setPassageWay(ranLoc, regionContent[x][y], 'West');
                    }
                }
                if (y === size - borderSize && x >= borderSize && x < size - borderSize) {   
                  regionContent[x][y].side = 'East'; 
                    const ranLoc = Math.round(Math.random() * 10) + 1;
                    if ( x > 12 && x < size - 12) {
                      setPassageWay(ranLoc, regionContent[x][y], 'East');
                    }
                }
                if (x === size - borderSize && y >= borderSize && y < size - borderSize) {  
                  regionContent[x][y].side = 'South'; 
                    const ranLoc = Math.round(Math.random() * 10) + 1;
                    if ( y > 12 && y < size - 12) {
                      setPassageWay(ranLoc, regionContent[x][y], 'South');
                    }
                }
          }
      }
  }
}

function setPassageWay(ranLoc, content, direction, x, y) {
if (ranLoc === 1 || content.river === true) {
    if (direction === 'North') {
      content.passageWay = 'North';
      content.impassable = false;
      content.occupied = true;
    }
    if (direction === 'West') {
      content.passageWay = 'West';
      content.impassable = false;
      content.occupied = true;
    }
    if (direction === 'East') {
      content.passageWay = 'East';
      content.impassable = false;
      content.occupied = true;
    }
    if (direction === 'South') {
      content.passageWay = 'South';
      content.impassable = false;
      content.occupied = true;
    }
  }
}

async function generateContentForRegion(region, x, y) {

 const seed = region.seed;
  await generatePreContentForRegion(region, x, y);
  
    let regionContent = Array(75).fill().map(() => Array(75).fill().map(() => ({})));



    generateStructures(regionContent, region);
    generateStructures(regionContent, region);
    generateStructures(regionContent, region);
    //generatePest(regionContent, seed);

    generateImpassables(regionContent, region, seed);
    generateImpassables2(regionContent, region, seed);
    
    const randomChance = Math.floor(Math.random() * 3) + 1;
    let river;
    region.riversNumber = 0;
    const randomRiverNumber = Math.floor(Math.random() * 3);
    for (let i = 0 ; i < randomRiverNumber ; i++) {
      river = true;
      region.riversNumber++;
      generateRiverOrRoads(regionContent, river);
    }
    createRegionBorders(regionContent, region);

    generatePonds(regionContent, seed);
    region.roadIDCounter = 0;
    region.roadIDs = [];
    if (randomChance >= 1) {
      const randomRoadsNumber = Math.floor(Math.random() * 5) + 1;
      for (let i = 0 ; i < randomRoadsNumber ; i++) {
        river = false;
        region.roadIDCounter++;
        generateRiverOrRoads(regionContent, river, region.roadIDCounter, region.roadIDs);
      }
    }
    if (region.terrain === "Mountain") {
      //reshapeMapBorders(regionContent);
    }
    

    generateVegetation(regionContent, region, seed);

    region.ruinsNumber = 0;
    generateRuins(regionContent, region, seed);

    const ranLootContainer = Math.floor(Math.random() * 30) + 10;
    for (let i = 0 ; i < ranLootContainer ; i++) {
      generateLootContainers(region, regionContent);
    }

    placeOtherGroup(region, regionContent);
    generateFarms(regionContent);
    generateSkeletons(regionContent, seed);

    for (let row = 0; row < 75; row++) {
        for (let col = 0; col < 75; col++) {

          const randomChance = Math.floor(Math.random() * 100) + 1;
          if (randomChance === 25) {
          generateAnimals(region, regionContent[row][col], col, row);
          }
            //generateAnimals(region, regionContent[row][col], row, col);
            generateObjects(region, regionContent[row][col]);
            
            regionContent[row][col].index = row * 75 + col;

            if (region.vegetation === 'Tundra') {
              generatePalsa(region, regionContent[row][col]);
            }
          

        }
    }



    console.log('Region Generated Successfully.');
    region.content = regionContent;
}




function generateStructures(regionContent, region) {
  const rows = regionContent.length - 10;
  const cols = regionContent[0].length - 10;

  let x = Math.floor(Math.random() * 45) + 10;
  let y = Math.floor(Math.random() * 45) + 10;

  x = Math.min(x, cols - 1);
  y = Math.min(y, rows - 1);

  let width = Math.floor(Math.random() * 4) + 2;
  let height = Math.min(Math.floor(30 / width), Math.floor(Math.random() * 4) + 2);

  if (x + width >= cols) width = cols - x - 1;
  if (y + height >= rows) height = rows - y - 1;

  let walls = [];
  let floors = [];


  for (let i = -1; i <= height; i++) {
      for (let j = -1; j <= width; j++) {
          let newX = x + j;
          let newY = y + i;

          if (newX >= 0 && newX < cols && newY >= 0 && newY < rows) {
              let cell = regionContent[newY][newX];

              
              if (i === -1 || i === height || j === -1 || j === width) {
                cell.wall = {};
                  if ((i % 2 === 0 && i !== 0) || (j % 2 === 0 && j !== 0)) {
                      cell.wall.window = true;
                      console.log('Is a window!');
                  } else {
                      cell.wall.wall = true;
                  }
                  
                  if (i === -1) cell.topWall = true;
                  if (i === height) cell.bottomWall = true;
                  if (j === -1) cell.leftWall = true;
                  if (j === width) cell.rightWall = true;
                  
                  if (!((i === -1 && j === -1) || (i === -1 && j === width) ||
                        (i === height && j === -1) || (i === height && j === width))) {
                      walls.push({ x: newX, y: newY });
                  }
              } else {
                  cell.floor = true;
                  floors.push({ x: newX, y: newY });
              }

              cell.occupied = true;
              cell.structure = true;
              cell.road = false;
              cell.impassable = false;
              cell.river = false;
              cell.riverShore = false;
              cell.reed = false;
          }
      }
  }

  if (walls.length > 0) {
      let doorIndex = Math.floor(Math.random() * walls.length);
      let doorPos = walls[doorIndex];
      let doorCell = regionContent[doorPos.y][doorPos.x];
      doorCell.door = {};

      if (doorCell.topWall) doorCell.door.position = 'top';
      if (doorCell.bottomWall) doorCell.door.position = 'bottom';
      if (doorCell.leftWall) doorCell.door.position = 'left';
      if (doorCell.rightWall) doorCell.door.position = 'right';
  }

  if (floors.length > 0) {
      let npcIndex = Math.floor(Math.random() * floors.length);
      let npcPos = floors[npcIndex];
      regionContent[npcPos.y][npcPos.x].npc = generateNpc(npcPos.y, npcPos.x, region);
  }
}




function generateNpc(y, x, region) {
  let npc = {};

  npc.name = "Sarah";
  npc.life = 150;

  const cultureWords = region.cultures ? region.cultures.split(',').map(word => word.trim()) : [];
  const ranCulture = Math.floor(Math.random() * cultureWords.length);


  npc.culture = `${cultureWords[ranCulture]}`;

  return npc;
}


function generateSkeletons(regionContent, seed) {
  const size = regionContent.length; // Size of the region
  const simplex = new SimplexNoise(new Math.seedrandom(seed));
    let scale = Math.random() * 0.6;
    let threshold = 0.8;

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const noiseValue = simplex.noise2D(row * scale, col * scale);
        if (noiseValue > threshold && !regionContent[row][col].occupied) {
          const randomSekeleton = Math.floor(Math.random() * 15) + 1;
            regionContent[row][col].skeleton = {
              var: randomSekeleton
            }
        }
      }
    } 
}

function generatePest(regionContent, seed) {
  const size = regionContent.length; // Size of the region
  const simplex = new SimplexNoise(new Math.seedrandom(seed));
    let scale = Math.random() * 0.15;
    let threshold = 0.7;
  
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {

        const noiseValue = simplex.noise2D(row * scale, col * scale);

        if (noiseValue > threshold) {
            regionContent[row][col].pest = true;
        }
      }
    } 
}



function generateFarms(regionContent) {
  const numRows = regionContent.length;
  const numCols = regionContent[0].length;
  let farmSpots = [];
  const numberFarm = Math.floor(Math.random() * 5) + 1;

  function isValidSpot(row, col) {
      return row >= 0 && row < numRows && col >= 0 && col < numCols && !regionContent[row][col].occupied;
  }

  function addFarmSpot(row, col) {
      if (isValidSpot(row, col) && !regionContent[row][col].farm) {
          regionContent[row][col].farm = true;
          regionContent[row][col].occupied = true;
          farmSpots.push([row, col]);
          const chanceFence = Math.floor(Math.random() * 5) + 1;
          if (chanceFence === 3) { regionContent[row][col].fence = true; }
      }
  }

  // Pick up to `numberFarm` random unoccupied spots
  let attempts = 0;
  while (farmSpots.length < numberFarm && attempts < 100) {
      let row = Math.floor(Math.random() * numRows);
      let col = Math.floor(Math.random() * numCols);
      if (isValidSpot(row, col)) {
          addFarmSpot(row, col);
      }
      attempts++;
  }

  if (farmSpots.length === 0) {
    console.warn("No valid farm spots found!");
    return;
  }

  // Expand farms with a 30% chance
  let chance = 0.6;
  while (chance >= 0.1) {
      let newSpots = [...farmSpots]; // Clone the current farm spots

      newSpots.forEach(([row, col]) => {
          let directions = [
              [-1, 0], [1, 0], [0, -1], [0, 1]
          ];

          directions.forEach(([dRow, dCol]) => {
              if (Math.random() < chance) {
                  addFarmSpot(row + dRow, col + dCol);
              }
          });
      });

      chance -= 0.1;
  }
}




async function generateOtherGroups(region) {
    function getRandomGroupNum() {
        const random = Math.random();
      
        if (random < 0.10) {
          return 5; // 10% chance
        } else if (random < 0.10 + 0.20) {
          return 2; // 20% chance
        } else if (random < 0.10 + 0.20 + 0.50) {
          return 3; // 50% chance
        } else if (random < 0.10 + 0.20 + 0.50 + 0.15) {
          return 4; // 15% chance
        } else {
          return Math.random() < 0.5 ? 9 : 10; // 5% chance for either 5 or 6
        }
      }
      const Num = getRandomGroupNum();
      
      let otherGroups = await populateWithRandomGroups(region, Num);

      currentOtherGroups = otherGroups;

        for (let i = 0; i < otherGroups.length; i++) {
            const x = Math.floor(Math.random() * 73) + 1;
            const y = Math.floor(Math.random() * 73) + 1;
            otherGroups[i].X = x;
            otherGroups[i].Y = y;
        }

        region.groups = currentOtherGroups || null;
        CURRENT_PLAYER_REGION_DATA.groups = region.groups;
}

function placeOtherGroup(region, regionContent) {
  if (!region.groups) return;

  function findUnoccupiedPosition() {
    let attempts = 0;
    while (attempts < 500) { // Limit attempts to avoid infinite loops
      let randY = Math.floor(Math.random() * 73);
      let randX = Math.floor(Math.random() * 73);
      if (!regionContent[randY][randX].occupied) {
        return { x: randX, y: randY };
      }
      attempts++;
    }
    return null; // If no unoccupied position is found (edge case)
  }

  for (let i = 0; i < region.groups.length; i++) {
    let { X: x, Y: y } = region.groups[i];
    
    if (regionContent[y][x] != null && !regionContent[y][x].occupied) {
      regionContent[y][x].group = region.groups[i];
    } else {
      let newPos = findUnoccupiedPosition();
      if (newPos) {
        region.groups[i].X = newPos.x;
        region.groups[i].Y = newPos.y;
        regionContent[newPos.y][newPos.x].group = region.groups[i];
      } else {
        console.warn("No available unoccupied position found for group", region.groups[i]);
      }
    }
  }
}

function generatePalsa(region, regionContent) {
  if (regionContent.occupied != true && regionContent.object != true) {
      const randomChance = Math.floor(Math.random() * 100) + 1;
      if (randomChance <= 2) {
          regionContent.palsa = true;
      }
  }
}




function generatePonds(regionContent, seed) {
  const size = regionContent.length; // Size of the region
  const simplex = new SimplexNoise(new Math.seedrandom(seed));
  const scale = 0.05; // Scale the noise to adjust the frequency of mountains
  const threshold = 0.6; // Threshold to determine whether a cell is impassable

  // Helper function to check if a cell is within bounds
  function isWithinBounds(row, col) {

    return row >= 0 && row < size && col >= 0 && col < size;


  }


  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const noiseValue = simplex.noise2D(row * scale, col * scale);
      if (noiseValue > threshold && !regionContent[row][col].occupied) {
        regionContent[row][col].pond = true;

        const noiseValue = simplex.noise2D(row * scale, col * scale);
        if (noiseValue > threshold) {
          regionContent[row][col].pond = true;
        }
      }
    }
  }


  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (regionContent[row][col].impassable === true) {
        let top = isWithinBounds(row - 1, col) && regionContent[row - 1][col].pond === true;
        let bottom = isWithinBounds(row + 1, col) && regionContent[row + 1][col].pond === true;
        let left = isWithinBounds(row, col - 1) && regionContent[row][col - 1].pond === true;
        let right = isWithinBounds(row, col + 1) && regionContent[row][col + 1].pond === true;
        let topLeft = isWithinBounds(row - 1, col - 1) && regionContent[row - 1][col - 1].pond === true;
        let topRight = isWithinBounds(row - 1, col + 1) && regionContent[row - 1][col + 1].pond === true;
        let bottomLeft = isWithinBounds(row + 1, col - 1) && regionContent[row + 1][col - 1].pond === true;
        let bottomRight = isWithinBounds(row + 1, col + 1) && regionContent[row + 1][col + 1].pond === true;
      }
    }
  }
}

function generateImpassables(regionContent, region, seed) {
  const size = regionContent.length; // Size of the region
  const simplex = new SimplexNoise(new Math.seedrandom(seed));
    let scale = 0.15; // Scale the noise to adjust the frequency of mountains
    let threshold = Math.atan(Math.random() * 1); // Threshold to determine whether a cell is impassable   Math.random() * 1 / 1.2
    if (region.terrain === 'Moutain') {
      threshold = 0.10 + (Math.random() * 0.2);
      scale = 0.08 + (Math.random() * 0.04);
    } else if (region.terrain === 'Plain') {
      threshold = 0.4 + (Math.random() * 0.1);
      scale = 0.05 + (Math.random() * 0.1);
    }
  
    // Helper function to check if a cell is within bounds
    function isWithinBounds(row, col) {
      return row >= 0 && row < size && col >= 0 && col < size;
    }
  
    // Iterate over the grid to mark impassables
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        // Generate a noise value for this position
        const noiseValue = simplex.noise2D(row * scale, col * scale);
  
        // If the noise value is above the threshold, mark the cell as impassable
        if (noiseValue > threshold && !regionContent[row][col].occupied) {
          regionContent[row][col].impassable = true;
          regionContent[row][col].occupied = true;
          const elevation = noiseValue;
          regionContent[row][col].elevation = elevation;
        } else {
          regionContent[row][col].impassable = false;
        }
      }
    }
  
    // Second pass to check impassable sides
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (regionContent[row][col].impassable === true) {
          // Check neighbors to determine the impassable side
          let top = isWithinBounds(row - 1, col) && regionContent[row - 1][col].impassable === true;
          let bottom = isWithinBounds(row + 1, col) && regionContent[row + 1][col].impassable === true;
          let left = isWithinBounds(row, col - 1) && regionContent[row][col - 1].impassable === true;
          let right = isWithinBounds(row, col + 1) && regionContent[row][col + 1].impassable === true;
          let topLeft = isWithinBounds(row - 1, col - 1) && regionContent[row - 1][col - 1].impassable === true;
          let topRight = isWithinBounds(row - 1, col + 1) && regionContent[row - 1][col + 1].impassable === true;
          let bottomLeft = isWithinBounds(row + 1, col - 1) && regionContent[row + 1][col - 1].impassable === true;
          let bottomRight = isWithinBounds(row + 1, col + 1) && regionContent[row + 1][col + 1].impassable === true;
  
          // Determine the side based on neighboring impassables
          if (top && bottom && left && right) {
            regionContent[row][col].impassableSide = 'full';
          } else if (top && left && !right && !bottom) {
            regionContent[row][col].impassableSide = 'top-left-corner';
          } else if (top && right && !left && !bottom) {
            regionContent[row][col].impassableSide = 'top-right-corner';
          } else if (bottom && left && !top && !right) {
            regionContent[row][col].impassableSide = 'bottom-left-corner';
          } else if (bottom && right && !top && !left) {
            regionContent[row][col].impassableSide = 'bottom-right-corner';
          } else if (top && !bottom && !left && !right) {
            regionContent[row][col].impassableSide = 'top';
          } else if (bottom && !top && !left && !right) {
            regionContent[row][col].impassableSide = 'bottom';
          } else if (left && !right && !top && !bottom) {
            regionContent[row][col].impassableSide = 'left';
          } else if (right && !left && !top && !bottom) {
            regionContent[row][col].impassableSide = 'right';
          } else if (top && bottom && !left && !right) {
            regionContent[row][col].impassableSide = 'vertical';
          } else if (left && right && !top && !bottom) {
            regionContent[row][col].impassableSide = 'horizontal';
          } else {
            regionContent[row][col].impassableSide = 'isolated';
          }
        }
      }
    }
  }
  

  function generateImpassables2(regionContent, region, seed) {
    const size = regionContent.length; // Size of the region
    const simplex = new SimplexNoise(new Math.seedrandom(seed));
    const scale = 0.3; // Scale the noise to adjust the frequency of mountains
    const threshold = 0.8; // Threshold to determine whether a cell is impassable
  
    // Iterate over the grid
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        // Generate a noise value for this position
        const noiseValue = simplex.noise2D(row * scale, col * scale);
  
        // If the noise value is above the threshold, mark the cell as impassable
        if (noiseValue > threshold && !regionContent[row][col].occupied) {
          regionContent[row][col].impassable = true;
          regionContent[row][col].occupied = true;
          const elevation = noiseValue;
          regionContent[row][col].elevation = elevation;
        }
      }
    }
  }

function generateRuins(regionContent, region, seed) {
  const size = regionContent.length; // Size of the region
  const simplex = new SimplexNoise(new Math.seedrandom(seed));
    const scale = 0.9;
    const threshold = 0.85;
  
    // Iterate over the grid
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {

        
   
        const noiseValue = simplex.noise2D(row * scale, col * scale);
        const ruinType = Math.floor(Math.random() * 4) + 1;

        if (noiseValue > threshold && !regionContent[row][col].occupied) {
          regionContent[row][col].ruin = true;
          regionContent[row][col].ruinType = ruinType;
          regionContent[row][col].impassable = false;
          regionContent[row][col].occupied = true;

          region.ruinsNumber++;

          let type = 'Ruin';
          let nS = Math.floor(Math.random() * 3) + 1;
          let size;
          if (nS === 1) { size = 'Promising' }
          if (nS === 2) { size = 'Ordinary' }
          if (nS === 3) { size = 'Trivial' }

            let ruin = [];
            ruin.Name = 'Ruin';
            ruin.Size = size;
            ruin.Terrain = `${CURRENT_PLAYER_REGION_DATA.vegetation}`;
            ruin.Type = type;


          regionContent[row][col].ruinInfo = ruin;

        }
      }
    }
}
  

function generateVegetation(regionContent, region, seed) {
  const size = regionContent.length; // Size of the region
  const simplex = new SimplexNoise(new Math.seedrandom(seed));
    let scale = Math.random() * 0.3 + 0.1;
    let threshold = 0.3;

    if (region.desert === 'Desert') {
      threshold = 0.5 + Math.random() * 0.2;
      if (region.vegetation === 'Tugay') {
        threshold = 0.3 + Math.random() * 0.1;
      }
    }
    if (region.forest === "Forest") {
      scale = Math.random() * 0.5 + 0.4;
      threshold = 0.33 + Math.random() * 0.1;
    }
  
    // Iterate over the grid
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {

        
        // Generate a noise value for this position
        const noiseValue = simplex.noise2D(row * scale, col * scale);

        const randomChanceReeds = Math.floor(Math.random() * 3) + 1;

        if (regionContent[row][col].riverShore === true && randomChanceReeds === 3  && !regionContent[row][col].impassable && !regionContent[row][col].occupied) {
          regionContent[row][col].reed = true;
          regionContent[row][col].occupied = true;
        } 
  
        // If the noise value is above the threshold, mark the cell as impassable
        if (noiseValue > threshold && !regionContent[row][col].impassable && !regionContent[row][col].occupied && regionContent[row][col].reed != true) {
            const randomSize = Math.floor(Math.random() * 6) + 1;
            const animTime = 6 + Math.random() * 1;
            if (region.vegetation === 'Woodland' || region.vegetation === 'Taiga') {
              regionContent[row][col].tree = 'Big';
            } else {
              if (randomSize >= 4 ) {
                if (region.vegetation != 'Tundra') {
                  regionContent[row][col].tree = 'Big';
                }
              } else {
                  regionContent[row][col].tree = 'Small';
              }
            }

            regionContent[row][col].animTime = animTime;
            regionContent[row][col].occupied = true;
        }
      }
    }



        
}





function generateRiverOrRoads(regionContent, river, roadIDCounter, roadIDsArray) {
    const size = regionContent.length;


    // Helper function to check if a position is within bounds
    function inBounds(row, col) {
        return row >= 0 && row < size && col >= 0 && col < size;
    }

    // Helper function to mark a cell as part of the river
    function markRiver(row, col, roadID) {
      if (inBounds(row, col)) {
          if (river) {
              regionContent[row][col].river = true;
              regionContent[row][col].occupied = true;
              regionContent[row][col].impassable = false;

              const chanceShipwreck = Math.floor(Math.random() * 20) + 1;
              if (chanceShipwreck === 15) {
                regionContent[row][col].shipwreck = true;
              }

              const chanceFish = Math.floor(Math.random() * 10) + 1;
              if (chanceShipwreck === 10) {
                regionContent[row][col].fish = true;
              }

              const chanceMoreWater = Math.floor(Math.random() * 12) + 1;
              if (chanceMoreWater > 9 && row > 2 && row < 48 && col > 2 && col < 48) {
                const rowPlus = Math.floor(Math.random() * 3) - 1;
                const colPlus = Math.floor(Math.random() * 3) - 1;
                regionContent[row + rowPlus][col + colPlus].river = true;
                regionContent[row + rowPlus][col + colPlus].occupied = true;
                regionContent[row + rowPlus][col + colPlus].impassable = false;

                const evenMoreChance = Math.floor(Math.random() * 2) + 1;

                for (let i = 0 ; i < evenMoreChance ; i++) {
                  const rowPlus2 = Math.floor(Math.random() * 3) - 1;
                  const colPlus2 = Math.floor(Math.random() * 3) - 1;
                  regionContent[row + rowPlus2][col + colPlus2].river = true;
                  regionContent[row + rowPlus2][col + colPlus2].occupied = true;
                  regionContent[row + rowPlus2][col + colPlus2].impassable = false;
                }
              }

          } else {
              
              regionContent[row][col].impassable = false;

                  // Assign the road ID to the cell
                  if (!regionContent[row][col].road) {
                      regionContent[row][col].roadID = roadID;
                  }
  
                  regionContent[row][col].road = true;
  
                  // Increment road count
                  regionContent[row][col].roadCount = (regionContent[row][col].roadCount || 0) + 1;
  
                  // Mark as crossroad if roadCount is 2 or more
                  if (regionContent[row][col].roadCount >= 2) {
                      if (!regionContent[row][col].crossroad) {
                          regionContent[row][col].crossroad = {
                              roadIDs: []
                          };
                      }

                      
  
                        // Iterate through possible adjacent roads to include their IDs
                          const directions = [
                            [-1, 0], [1, 0], [0, -1], [0, 1]
                        ];
                        directions.forEach(([dRow, dCol]) => {
                            const adjRow = row + dRow;
                            const adjCol = col + dCol;

                            if (inBounds(adjRow, adjCol) && regionContent[adjRow][adjCol].road) {
                                const adjRoadID = regionContent[adjRow][adjCol].roadID;
                                if (!regionContent[row][col].crossroad.roadIDs.includes(adjRoadID)) {
                                    regionContent[row][col].crossroad.roadIDs.push(adjRoadID);
                                }
                            }
                        });

                        if (regionContent[row][col].crossroad.roadIDs.length <= 1) {
                          regionContent[row][col].crossroad = null;
                        }
                  }


  
                  regionContent[row][col].occupied = true;

                  const chanceDestroy = Math.floor(Math.random() * 100);
                  if (chanceDestroy > 93 && !regionContent[row][col].crossroad) {
                    regionContent[row][col].road = false;
                    regionContent[row][col].occupied = true;
                    regionContent[row][col].impassable = false;
                    regionContent[row][col].river = false;
                  }
              
          }
      }
  }

    // Helper function to mark adjacent cells as river shore
    function markRiverShore(row, col) {
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1] // up, down, left, right
        ];
        directions.forEach(([dRow, dCol]) => {
            const newRow = row + dRow;
            const newCol = col + dCol;
            if (inBounds(newRow, newCol)) {
                // Only mark as shore if it's not already a river cell
                if (!regionContent[newRow][newCol].river) {
                    regionContent[newRow][newCol].riverShore = true;
                }
                if (regionContent[newRow][newCol].river === true && regionContent[newRow][newCol].riverShore === true) {
                    regionContent[newRow][newCol].river = true;
                    regionContent[newRow][newCol].riverShore = false;
                }
            }
        });
    }

    // Step 1: Choose random starting and ending points on the edges
    let startRow, startCol, endRow, endCol;

    // the start point
    let startSide = Math.floor(Math.random() * 4);
    let endSide = Math.floor(Math.random() * 4);

    while (endSide === startSide) {
        startSide = Math.floor(Math.random() * 4);
        endSide = Math.floor(Math.random() * 4);
    }
    if (startSide === 0) { // Top side
        startRow = 6;
        startCol = Math.floor(Math.random() * size);
    } else if (startSide === 1) { // Bottom side
        startRow = size - 6;
        startCol = Math.floor(Math.random() * size);
    } else if (startSide === 2) { // Left side
        startRow = Math.floor(Math.random() * size);
        startCol = 6;
    } else { // Right side
        startRow = Math.floor(Math.random() * size);
        startCol = size - 6;
    }

    // the end point
    if (endSide === 0) { // Top side
        endRow = 6;
        endCol = Math.floor(Math.random() * size);
    } else if (endSide === 1) { // Bottom side
        endRow = size - 6;
        endCol = Math.floor(Math.random() * size);
    } else if (endSide === 2) { // Left side
        endRow = Math.floor(Math.random() * size);
        endCol = 6;
    } else { // Right side
        endRow = Math.floor(Math.random() * size);
        endCol = size - 6;
    }

    // Step 2: Generate the river path from start to end
    let currentRow = startRow;
    let currentCol = startCol;

    if (!regionContent[currentRow][currentCol].crossroad || regionContent[currentRow][currentCol].regionWall != true) {
      markRiver(currentRow, currentCol, roadIDCounter);
    }


    while (currentRow !== endRow || currentCol !== endCol) {
        // Calculate the direction to move toward the end point
        const rowDiff = endRow - currentRow;
        const colDiff = endCol - currentCol;

        // Choose randomly whether to move in the row direction or col direction
        let moveRow = Math.random() < Math.abs(rowDiff) / (Math.abs(rowDiff) + Math.abs(colDiff));

        if (moveRow && rowDiff !== 0) {
            const newRow = currentRow + Math.sign(rowDiff);
            if (inBounds(newRow, currentCol)) {
                currentRow = newRow;
            } else {
                moveRow = false; // If out of bounds, try to move in the other direction
            }
        }
        if (!moveRow && colDiff !== 0) {
            const newCol = currentCol + Math.sign(colDiff);
            if (inBounds(currentRow, newCol)) {
                currentCol = newCol;
            }
        }
        if (regionContent[currentRow][currentCol].regionWall != true) {
          markRiver(currentRow, currentCol, roadIDCounter);
        }
        
    }

    // Step 3: Mark cells adjacent to the river as river shore
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (regionContent[row][col].river && river) {
                markRiverShore(row, col);
            }
        }
    }
}


// function generateAnimals(region, regionContent, row, col) {
//     if (regionContent.occupied != true) {
//         const randomChance = Math.floor(Math.random() * 300) + 1;
//         if (randomChance <= 10) {
//           const randomDir = Math.floor(Math.random() * 2) + 1;
//           let dir = '';
//           if (randomDir === 1) { dir = 'east' } else if (randomDir === 2) { dir = 'west' }
//           const life = Math.floor(Math.random() * 200) + 100;
//           const aID = row + 75 * col;

//             if (randomChance <= 7) {
//               const animal = {
//                 type: "animal",
//                 id: aID,
//                 totalLife: life,
//                 currentLife: life,
//                 direction: dir,
//                 X: col,
//                 Y: row,
//               };
//               regionContent.animal = animal;
//               region.animals.push(animal);
//             } else {
//               const randomBird = Math.floor(Math.random() * 6) + 1;
//               const bird = {
//                 type: "bird",
//                 birdType: randomBird,
//                 direction: dir,
//                 id: aID,
//                 X: col,
//                 Y: row,
//                 totalLife: life,
//                 currentLife: life
//               };
//               regionContent.bird = bird;
//               region.animals.push(bird);
//             }
//             regionContent.occupied = true;
//         }
//     }
// }

function generateObjects(region, regionContent) {
  if (regionContent.occupied != true) {
      const randomChance = Math.floor(Math.random() * 500) + 1;
      if (randomChance < 60) {
          regionContent.object = true;
          regionContent.occupied = true;
      } else if (randomChance === 499) {
        regionContent.totem = true;
        regionContent.occupied = true;
      } else if (randomChance < 499 && randomChance > 495) {
        regionContent.campfire = true;
        regionContent.occupied = true;
      } else if (randomChance < 495 && randomChance > 480 && region.climate === 'temperate') {
        regionContent.berries = true;
        regionContent.occupied = true;
      } else if (randomChance < 480 && randomChance > 478 && region.climate === 'arctic') {
        regionContent.druidTree = true;
        regionContent.occupied = true;
      }
  }
}


function generateAnimals(region, regionContent, x, y) {
  const matchingAnimals = animals.filter((animal) => {

    const areaWords = animal.vegetation ? animal.vegetation.split(',').map(word => word.trim()) : [];
    if (areaWords[0] === 'any') {
      return true;
    }
    if (areaWords.length > 0 && !areaWords.includes(region.vegetation.toLowerCase())) {
      return false;
    }
    return true;
  });

  if (matchingAnimals.length > 0 && !regionContent.occupied) {

    const randomIndex = Math.floor(Math.random() * matchingAnimals.length);
    let currentAnimal = matchingAnimals[randomIndex];

    const randomDir = Math.floor(Math.random() * 2) + 1;
    let dir = '';
    if (randomDir === 1) { dir = 'east' } else if (randomDir === 2) { dir = 'west' }
    const uniqueIndex = x * 75 + y;

    let newAnimal = { ... currentAnimal };

    newAnimal.id = uniqueIndex;
    newAnimal.direction = dir;
    newAnimal.X = x;
    newAnimal.Y = y;

    const ranLevelEffector = Math.floor(Math.random() * 10) - 5;
    for (let i = 0 ; i < (region.level - 1) + ranLevelEffector ; i++) {
      levelUpAnimal(newAnimal);
    }
    newAnimal.currentLife = newAnimal.life;
    newAnimal.totalLife = newAnimal.life;

    regionContent.animal = { ... newAnimal };
    regionContent.occupied = true;
    region.animals.push(regionContent.animal);
  }
}



function generateLootContainers(region, regionContent) {

  const x = Math.floor(Math.random() * 73) + 1;
  const y = Math.floor(Math.random() * 73) + 1;

  if (!regionContent[x][y].occupied) {

    let currentContainer = {};

    const type = Math.floor(Math.random() * 5) + 1;

    if (type === 1) {
      currentContainer.type = 'Barel';
    } else if (type === 2) {
      currentContainer.type = 'Crates';
    } else if (type === 3) {
      currentContainer.type = 'Treasures';
    } else if (type === 4) {
      currentContainer.type = 'Junks';
    } else if (type === 5) {
      currentContainer.type = 'Broken Cart';
    }


    currentContainer.interior = [ ... generateLootInterior(16) ];

    regionContent[x][y].lootContainer = { ... currentContainer };
    regionContent[x][y].impassable = false;
    regionContent[x][y].occupied = true;
  }
}


function generateBuildings(region, regionContent) {
    const matchingBuildings = buildingsObject.filter((building) => {

      const areaWords = building.regions ? building.regions.split(',').map(word => word.trim()) : [];
      if (areaWords.length > 0 && !areaWords.includes(region.superRegion)) {
        return false;
      }
  
      return true;
    });

    const x = Math.floor(Math.random() * 73) + 1;
    const y = Math.floor(Math.random() * 73) + 1;
  
    if (matchingBuildings.length > 0 && !regionContent[x][y].occupied) {

      const randomIndex = Math.floor(Math.random() * matchingBuildings.length);
      let currentBuilding = matchingBuildings[randomIndex];
      currentBuilding.interior = [ ... generateBuildingInterior(16) ];

      regionContent[x][y].building = { ... currentBuilding };
      regionContent[x][y].impassable = false;
      regionContent[x][y].occupied = true;
    }
}


function generateWorldSettlements(region, x, y) {
    const matchingSettlements = settlements.filter((settlement) => {

      const areaWords = settlement.Areas ? settlement.Areas.split(',').map(word => word.trim()) : [];
      if (areaWords.length > 0 && !areaWords.includes(region.superRegion)) {
        return false;
      }
  
      return true;
    });
  

    if (matchingSettlements.length > 0) {
      const randomIndex = Math.floor(Math.random() * matchingSettlements.length);
      let currentSettlement = matchingSettlements[randomIndex];
      
      region.settlement = currentSettlement;
      region.isSettlement = true;

      if (region.settlement.Size === 'Large') {
        worldSettlements.set(region.settlement.Name, region.settlement);
        worldSettlements.forEach(settlement => {
            settlement.X = x;
            settlement.Y = y;
        });
      }
    }
}



let cachedGridCells = [];
let miniCells = [];



function createSemTab(Prow, Pcol, data) {

  cachedGridCells = [];

  console.log("region creation for:", data);

    let updateRegion = CURRENT_PLAYER_REGION_DATA;

  
    // Get the container element where you want to append the table
    const mainContainer = document.getElementById('region-grid-container');

    mainContainer.style.display = "block";
    //mainContainer.style.backgroundImage = `url(${nextRegion.Art.toString()})`;
    
    const existingTable = document.getElementById('table-container');
    if (existingTable) {
      existingTable.remove();
    }



  
    // Create the table element
    const tableContainer = document.createElement('div');
    tableContainer.id = 'table-container';
  
    const gridContainer = document.createElement('div');
    gridContainer.id = 'region-grid-table';
    
 
    gridContainer.style.display = 'grid';

    gridContainer.style.width = '2500px'; // 50 * 50
    gridContainer.style.height = '2500px';

    
    // Add background image based on vegetation

    
    // Add rain class if weather condition is met
    if (CURRENT_WEATHER.rain === true) {
        gridContainer.classList.add('rain');
    } else {
        gridContainer.classList.remove('rain');
    }



    
    // Create grid cells and populate them
    for (let i = 0; i < 75; i++) {
        for (let j = 0; j < 75; j++) {
            // Create a div for each grid cell
            const cell = document.createElement('div');
            const uniqueIndex = i * 75 + j;
            cell.setAttribute('index', `${uniqueIndex}`);
            cell.style.gridRow = `${i + 1}`; // Adjust to start at 1
            cell.style.gridColumn = `${j + 1}`; // Adjust to start at 1

            cell.classList.add('game-cell');

            
            // You can style the cell further here
            let data = CURRENT_PLAYER_REGION_DATA.content[i][j];
            let veg = CURRENT_PLAYER_REGION_DATA.vegetation;
            

            populateContentCell(cell, data, veg, i, j);



            cachedGridCells.push(cell);

            // Append the cell to the grid container
            //gridContainer.appendChild(cell);
        }
    }
    
    // Append the grid container to the wrapper
    let wrapper = document.getElementById('engine-wrapper');
    tableContainer.appendChild(gridContainer);
    wrapper.appendChild(tableContainer);


    const exFilter = document.getElementById('region-grid-filter') // Remove the filter if it exists;
    if (exFilter) exFilter.remove();

    let gridFilter = document.createElement('div');
    gridFilter.id = 'region-grid-filter';
    wrapper.appendChild(gridFilter);

  //   setTimeout(() => {
  //     if (window.createMapGrid) {
  //         window.createMapGrid();
  //     } else {
  //         console.error("createMapGrid is not available.");
  //     }
  // }, 100);



    

      const cells = document.querySelectorAll('#region-grid-table td');


      createMiniSemTable();

      function createMiniSemTable() {
          const miniTable = document.createElement('div');
          miniTable.id = 'mini-table';
          const screenshot = document.getElementById('screenshot');
  
          screenshot.innerHTML = '';
  
          for (let i = 6; i < 70; i++) {
              for (let j = 6; j < 70; j++) {
                const cell = document.createElement('div');
                const uniqueIndex = i * 75 + j;
                cell.setAttribute('index', `${uniqueIndex}`);
                cell.textContent = '';
                cell.setAttribute('row', i);
                cell.setAttribute('col', j);
                cell.style.gridRow = `${i + 1}`; // Adjust to start at 1
                cell.style.gridColumn = `${j + 1}`; // Adjust to start at 1
                cell.classList.add('minitable-cell');

                let data = CURRENT_PLAYER_REGION_DATA.content[i][j];
                populateContentCellMiniTable(cell, data);
                miniTable.appendChild(cell);
              }
            }
  
            screenshot.appendChild(miniTable);

            miniCells = Array.from(miniTable.querySelectorAll('.minitable-cell'));

            ['mousemove', 'mousedown'].forEach(eventType => {
              miniTable.addEventListener(eventType, function(event) {
                if (event.buttons === 1) { // Check if the left mouse button is pressed
                  if (event.target.classList.contains('minitable-cell')) {
                    const cell = event.target;
                    movePlayerCameraOnMap(cell);
                  }
                }
              });
            });

      }
}


function markGateways() {
    // Create a Map for fast cell lookup
    const cellMap = new Map(cachedGridCells.map(cell => {
        const row = parseInt(cell.getAttribute('row'));
        const col = parseInt(cell.getAttribute('col'));
        return [`${row},${col}`, cell];
    }));

    // Iterate only over border rows and columns
    for (let i = 0; i < 75; i++) {
        // Skip corners
        if (i !== 0 && i !== 74) {
            markCell(i, 0, 'West');
            markCell(i, 74, 'East');
        }
        markCell(0, i, 'North');
        markCell(74, i, 'South');
    }

    function markCell(row, col, direction) {
        const cell = cellMap.get(`${row},${col}`);
        if (cell) {
            cell.classList.add('gateway', direction);
            cell.setAttribute('towards', direction);
        }
    }
}









function populateContentCellMiniTable(cell, data) {

    cell.style.width = '1.75px';
    cell.style.height = '1.75px';

let currentRow = Math.floor(playerOverworldRow);
let currentCol = Math.floor(playerOverworldCol);

let updateRegion = CURRENT_PLAYER_REGION_DATA;

let veg = updateRegion.vegetation;



if (!data.river === true) {
    cell.style.backgroundColor = '#ca6f1e';
}
if (data.impassable === true) {
    cell.style.backgroundColor = '#521f09';
}

if (data.passageWay) {
    cell.style.backgroundColor = '#fb5073';
    cell.style.visibility = 'visible';
}

if (data.road === true) {
  cell.classList.add('road-mini');
  cell.style.backgroundColor = '#b5b5b5';
  cell.setAttribute('road-number', data.roadID);
}
if (data.river === true) {
    cell.style.backgroundColor = '#00b191';
    cell.classList.add('river');
    if (data.river === true && data.road === true) {
      cell.style.backgroundColor = '#b5b5b5';
    }
}
if (data.tree === 'Small' || data.tree === 'Big') {
    cell.style.backgroundColor = '#357f19';
    cell.classList.add('tree');
}

if (data.grass === true) {
    cell.classList.add(`grass`);
}

if (data.lootContainer) {
  cell.style.backgroundColor = 'rgb(255 255 255)';
  cell.classList.add('loot-container');
}

if (data.structure) {
  cell.classList.add('structure');
}

if (data.animal) {
    cell.classList.add('animal');
    cell.style.backgroundColor = '#e43939';
}

if (data.riverShore) {
    if (data.riverShore === true && data.road === true) {
      cell.style.backgroundColor = '#b5b5b5';
    }
}


if (data.ruin) {
    cell.style.backgroundColor = '#555';
    cell.classList.add('ruin');
}

if (data.group != null) {
  cell.classList.add('group');
  cell.backgroundColor = '#9746ea';
  const gID = data.group.gID;
  cell.setAttribute('gid', gID);
  cell.textContent = `${[gID]}`;
  addOtherGroupTooltip(cell, data.group);
  cell.addEventListener('click', function(event) {
    displayThisGroupAttributes(event, data.group);
  });
}

if (data.farm === true) {
  cell.classList.add('farm');
  cell.style.backgroundColor = 'GreenYellow';
}

if (data.removed === true) {
  cell.classList.add('removed');
  cell.style.backgroundColor = '#521f09';
}

}


function populateContentCell(cell, data, veg, i, j) {

  cell.setAttribute('row', i);
  cell.setAttribute('col', j);





    cell.classList.add('unexplored');

    if ( Object.keys(data).length == 2 && data.impassable == false) {
      cell.classList.add('not-seen');
    }

    if (!data.river === true && !data.riverShore && data.farm != true && !data.structure === true) {

       if (veg === "Meadow") {

        const ran = Math.floor(Math.random() * 2) + 1;
        if (ran === 1) {
          cell.style.backgroundImage = `url('/Art/Vegetation/Textures/meadow2.jpg')`;
        } else {
          cell.style.backgroundImage = `url('/Art/Vegetation/Textures/${veg}.jpg')`;
        }

       } else if (veg === "Tundra") {
        const ran = Math.floor(Math.random() * 8) + 1;
        if (ran === 1) {
          cell.style.backgroundImage = `url('/Art/Vegetation/Textures/tundra2.jpg')`;
        } else {
          cell.style.backgroundImage = `url('/Art/Vegetation/Textures/${veg}.jpg')`;
        }
        
       }
        else {
        cell.style.backgroundImage = `url('/Art/Vegetation/Textures/${veg}.jpg')`;
       }
      
    }

    if (data.structure === true) {
      cell.classList.add('structure');
      if (data.wall) {
          if (data.door) {
            cell.classList.add('door');
            const door = document.createElement('div');
            door.classList.add('door');
            door.classList.add(`${data.door.position}`);
            cell.appendChild(door);
            const top = document.createElement('div');
            top.classList.add('ceiling');
            cell.appendChild(top);
          } else {
            cell.classList.add('wall');
            const wallStore = createCube('structure-wall', data.wall.window);
            cell.appendChild(wallStore);
          }
      }
      if (data.floor === true) {
        cell.classList.add('floor');
        const top = document.createElement('div');
        top.classList.add('ceiling');
        cell.appendChild(top);
      }
    }

    if (data.removed === true) {
      cell.classList.add('removed');
      cell.classList.add('impassable');
    }

    if (data.impassable === true || data.removed === true) {
        cell.classList.add('impassable');
        cell.classList.add('blocksvision');
        const elevation = data.elevation;
        cell.setAttribute('elevation', `${elevation * 2}`);
        const randomSprite = Math.floor(Math.random() * 2) + 1;
        cell.appendChild(createCube('impa-wall', elevation * 2));
    }

    if (data.river === true && !data.road) {
        cell.classList.add('river-cell');
        cell.classList.add('occupied');

        if (data.fish === true) {
          cell.classList.add('fish-cell');
          cell.classList.add('gatherable');
          cell.appendChild(addStore('fish'));
        }
        if (data.shipwreck === true) {
          cell.classList.add('shipwreck-cell');
          cell.appendChild(addStore('shipwreck'));
        }
        if (data.passageWay) {
          cell.classList.add(`gateway`);
          cell.classList.add(`gateway-${data.passageWay}`);
          cell.setAttribute('towards', data.passageWay);
        }

    } else if (data.road && data.river === true) {
      cell.classList.add('bridge-cell');
      cell.classList.add('occupied');
      cell.style.backgroundImage = `url('/Art/Textures/bridge.jpg')`;
      cell.setAttribute('road-number', data.roadNumber);
    }

    if (data.riverShore) {
      cell.classList.add('river-shore');

      if (data.reed === true) {
        cell.classList.add('reed');
        cell.appendChild(addStore('reed'));
        cell.classList.add('gatherable');
      }
    }

    if (data.passageWay) {
      cell.classList.add(`gateway`);
      cell.classList.add(`gateway-${data.passageWay}`);
      cell.setAttribute('towards', data.passageWay);
    }

    if (data.pond) {
      if (data.farm != true) {
        cell.classList.add('pond-cell');
        cell.classList.add('occupied');
        if (veg === 'Prairie') {
          cell.style.backgroundImage = `url('/Art/Vegetation/Textures/Prairie2.jpg')`;
        } else if (veg === 'Desertic') {
          cell.style.backgroundImage = `url('/Art/Vegetation/Textures/desertic2.jpg')`;
        } else {
          cell.style.backgroundImage = `url('/Art/Textures/riverbed.jpg')`;
        }
      }
    }

    if (data.palsa) {
      cell.classList.add('palsa-cell');
      cell.classList.add('occupied');
      cell.appendChild(addStore('palsa'));
    }

    if (data.pest === true) {
      cell.classList.add('pest-cell');
      const store = addStore('pest');
      store.classList.remove('clickable');
      cell.appendChild(store);
    }

    if (data.object) {
      cell.classList.add('object-cell');
      cell.classList.add('occupied');
      cell.classList.add('gatherable');
      const store = addStore('object');
      cell.appendChild(store);
    }

    if (data.skeleton) {
      cell.classList.add('skeleton-cell');
      cell.classList.add('occupied');
      cell.classList.add('gatherable');
      const skeletonVar = data.skeleton.var;
      const store = addStore('skeleton', skeletonVar);
      cell.appendChild(store);
    }

    if (data.road) {
      cell.classList.add('road-cell');
      cell.classList.add('occupied');
      cell.style.backgroundImage = `url('/Art/Textures/road.jpg')`;
      cell.setAttribute('road-number', data.roadID);

      if (data.regionWall) {
        cell.classList.add(`gateway`);
        cell.classList.add(`gateway-${data.side}`);
        cell.setAttribute('towards', data.side);
      }
    }

    if (data.crossroad) {
      cell.classList.add('road-cell');
      cell.classList.add('occupied');
      cell.style.backgroundImage = `url('/Art/Textures/crossroad.jpg')`;
      cell.setAttribute('road-number', data.roadID);
      cell.appendChild(addStore('crossroad'));
      cell.classList.add('crossroad');
    }


    let spriteName = '';
    if (data.tree === 'Small') {
        cell.classList.add(`small`);
    }
    if (data.tree === 'Big') {
        cell.classList.add(`big`);
    }

    if (data.tree) {
        spriteName = `${data.tree}Doodad`;
        cell.classList.add(`${spriteName}`);
        cell.classList.add(`doodads`);
        

        const doodadStore = document.createElement('div');
        doodadStore.classList.add('doodad-store');
        doodadStore.classList.add('cardboard');
        doodadStore.classList.add(`${data.tree}`);
        doodadStore.classList.add(`${spriteName}`);
        cell.appendChild(doodadStore);

        let image = '';
        let treeNumbers = 12;

        if (data.tree === 'Big' ) {
          cell.classList.add('gatherable');
          const animTime = Math.floor(Math.random() * 6) + 3;
          const delay = Math.random() * 1;


            doodadStore.style.animation = `treeMove ${animTime}s ease-in-out infinite`;


          let randomness = Math.floor(Math.random() * treeNumbers) + 1;

          if (veg === 'Savanna') {
            randomness = Math.floor(Math.random() * 14) + 1;
          }

          image = `url('/Art/Vegetation/Sprites/${veg}/Big/${randomness}.png')`;
          doodadStore.style.backgroundImage = `url('/Art/Vegetation/Sprites/${veg}/Big/${randomness}.png')`;

          cell.appendChild(appendShadow(image));
        } else if (data.tree === 'Small'  ) {

          let randomness = Math.floor(Math.random() * treeNumbers) + 1;

          if (veg === 'Meadow') {
            randomness = Math.floor(Math.random() * 12) + 1;
          }
          if (veg === 'Montane') {
            randomness = Math.floor(Math.random() * 15) + 1;
          }
          if (veg === 'Tundra') {
            randomness = Math.floor(Math.random() * 15) + 1;
          }
          if (veg === 'Savanna') {
            randomness = Math.floor(Math.random() * 17) + 1;
          }

          image = `url('/Art/Vegetation/Sprites/${veg}/Small/${randomness}.png')`;
          doodadStore.style.backgroundImage = `url('/Art/Vegetation/Sprites/${veg}/Small/${randomness}.png')`;
        }

        





    }
    if (data.grass === true) {
        cell.classList.add(`grass`);
    }
    if (data.ruin === true) {
        cell.classList.add(`ruin-cell`);
        const ruinType = data.ruinType;
        cell.setAttribute('ruin-type', `${ruinType}`);
        cell.appendChild(createRuinCube('wall'));
    }

    if (data.totem === true) {
      cell.classList.add('totem');
      const store = addStore('totem');
      cell.appendChild(store);
      const info = `Totem`;
      addGenericTooltip(store, info);
    }

    if (data.berries === true && !data.tree) {
      cell.classList.add('berries');
      cell.classList.add('gatherable');
      const store = addStore('berries');
      cell.appendChild(store);
      const info = `berries bush`;
      addGenericTooltip(store, info);
    }

    if (data.druidTree === true) {
      cell.classList.add('druidTree');
      const store = addStore('druidTree');
      cell.appendChild(store);
      const info = `Druid tree`;
      addGenericTooltip(store, info);
    }

  if (data.campfire === true) {
    cell.classList.add('campfire');
    cell.classList.add('gatherable');
    const store = addStore('campfire');
    cell.appendChild(store);
  }

    if (data.animal) {
        cell.classList.add(`animal`);
        cell.classList.add("entity");
        const store = addStore('animal');
        cell.appendChild(store);
    }

  //   if (data.bird) {
  //     cell.classList.add('bird');
  //     const store = addStore('bird', data.bird.birdType);
  //     cell.appendChild(store);
  // }

    if (data.lootContainer) {
        cell.classList.add('loot-container');
        cell.classList.add('occupied');
        cell.appendChild(addStore('loot-container'));
    }


    if (data.group != null) {
      cell.classList.add('other-group');
      cell.classList.add("entity");
      cell.classList.remove('impassable');
      cell.classList.remove('building');
      cell.classList.remove('occupied');
      cell.setAttribute('gid', data.group.gID);

      cell.appendChild(addStore('group'));
  }

  if (data.farm === true) {
    cell.classList.add('farm');
  }

  if (data.fence === true) {
    cell.appendChild(addStore('fence'));
  }

  if (data.npc) {
    cell.appendChild(addStore('npc'));
  }

  function addStore(info, values) {
    const store = document.createElement('div');
    store.classList.add('basic-store');
    store.classList.add('clickable');
    store.classList.add(`${info}`);

    if (info === 'npc') {
      store.classList.add('cardboard');
      store.addEventListener('click', function(event) {
        createWindow(data.npc);
      });
    }
    
    if (info === 'animal') {
      store.classList.add('cardboard');
      store.classList.add(`${data.animal.direction}`);
      store.setAttribute('aID', data.animal.id);
      store.style.backgroundImage = `url('/Art/Animals/${data.animal.name}.png')`;
      // addOvertip(data.animal, data.animal.id, store);
    }

    // if (info === 'bird') {
    //   store.style.backgroundImage = `url('/Art/Sprites/entities/birds/${data.bird.birdType}.gif')`;
    //   store.classList.add('bird');
    //   store.classList.add('animal');
    //   store.setAttribute('birdID', data.bird.id);
    //   store.classList.add(`${data.bird.direction}`);

    //   const birdData = generateBirdData(data.bird);
    //   store.addEventListener('click', function(event) {
    //     createObjectWindow(event, birdData);
    //   });

    //   addOvertip(data.bird, data.bird.id, store);
    // }

    if (info === 'loot-container') {
      store.classList.add('cardboard');
      store.style.backgroundImage = `url('/Art/Sprites/Objects/containers/${data.lootContainer.type.toLowerCase()}.png')`;
    }

    if (info === 'object') {
      const ran = Math.floor(Math.random() * 9) + 1;
      if (ran === 8 || ran === 9) {
        store.classList.add('cardboard');
        const ranHead = Math.floor(Math.random() * 4) + 1;
        store.style.backgroundImage = `url('/Art/Sprites/Objects/heads/Head00${ranHead}.png')`;
        store.classList.add('head-pike'); 
      } else {
        store.style.backgroundImage = `url('/Art/Sprites/Objects/props/Rugs00${ran}.png')`;
        store.style.backgroundSize = 'contain';
      }
    }

    if (info === 'skeleton') {
      store.style.backgroundImage = `url('/Art/Sprites/Objects/props/skeletons/Sceleton${values}.png')`;
    }

    if (info === 'fish') {
      store.classList.add('cardboard');
      store.style.backgroundImage = `url('/Art/Sprites/entities/fish/1.gif')`;
    }

    if (info === 'shipwreck') {
      const ran = Math.floor(Math.random() * 2) + 1;
      store.classList.add('cardboard');
      store.style.backgroundImage = `url('/Art/Sprites/Objects/props/Shipwreck${ran}.png')`;
    }

    if (info === 'fence') {
      const ran = Math.floor(Math.random() * 2) + 1;
      if (ran === 2) {
        store.classList.add('west');
      }
      store.style.backgroundImage = `url('/Art/Sprites/fence.png')`;
    }

    if (info === 'reed') {
      store.classList.add('cardboard');
      const ran = Math.floor(Math.random() * 8) + 1;
      store.style.backgroundImage = `url('/Art/Vegetation/Sprites/river/${ran}.png')`;
    }

    if (info === 'crossroad') {
      store.classList.add('cardboard');
      const ran = Math.floor(Math.random() * 3) + 1;
      store.style.backgroundImage = `url('/Art/Sprites/Objects/signs/${ran}.png')`;
    }
    
    if (info === 'druidTree') {
      store.classList.add('cardboard');
      const ran = Math.floor(Math.random() * 2) + 1;
      store.style.backgroundImage = `url('/Art/Sprites/Objects/props/druid_tree${ran}.png')`;
    }

    if (info === 'corpse') {
      store.classList.add('cardboard');
      store.style.backgroundImage = `url('/Art/Doodads/corpse2.png')`;
    }

    if (info === 'campfire') {
      store.classList.add('cardboard');
      store.style.backgroundImage = `url('/Art/Sprites/Objects/campfire.gif')`;
    }

    if (info === 'berries') {
      store.classList.add('cardboard');
      const ran = Math.floor(Math.random() * 4) + 1;
      store.style.backgroundImage = `url('/Art/Sprites/Objects/berries/${ran}.png')`;
      const berriesData = {
        name : 'berries bush',
        header : 'A small berries bush',
      }
      store.addEventListener('click', function(event) {
        createObjectWindow(event, berriesData);
      });
      addRuinTooltip(store, berriesData);
    }

    if (info === 'totem') {
      store.classList.add('cardboard');
      const ran = Math.floor(Math.random() * 3) + 1;
      store.style.backgroundImage = `url('/Art/Sprites/Objects/totems/${ran}.png')`;
      const image = `url('/Art/Sprites/Objects/totems/${ran}.png')`;
      cell.appendChild(appendShadow(image));

      const totemData = generateTotemData();

      store.addEventListener('click', function(event) {
        createObjectWindow(event, totemData);
      });
    }

    if (info === 'ruin') {
      store.appendChild(createRuinCube('ruin-wall'));
      addRuinTooltip(store, data.ruinInfo);
    }

    if (info === 'group') {
      store.classList.add('cardboard');
      store.classList.add(`group-store`);
      const gID = data.group.gID;
      store.setAttribute('gid', gID);
      store.textContent = `${[gID]}`;
      
      const spriteBox = createOtherGroupBox(data.group);
      spriteBox.setAttribute('gid', gID);
      store.appendChild(spriteBox);

      // const overtip = createOtherGroupOvertip(data.group);
      // overtip.setAttribute('gid', gID);
      // document.body.appendChild(overtip);

      //addOvertip(data.group, data.group.gID, store);

      spriteBox.addEventListener('contextmenu', function(event) {
        event.preventDefault();
        interactWithCell(event, data.group);
      });

    }

    if (info === 'palsa') {
      store.style.backgroundImage = `url('/Art/Vegetation/Sprites/tundra/palsa.png')`;
    }
    return store;
  }


  function appendShadow(image, x, y) {
    const shadow = document.createElement('div');
    shadow.classList.add('shadow');
    shadow.style.backgroundImage = `${image}`;
    if (x || y) {
      shadow.style.translate = `${x}px ${y}px`;
    }
    return shadow;
  }

  cell.addEventListener('mouseover', function(event) {
      updateCellDataInfo(cell, data);
  });
  
}



function updateCellDataInfo(cell, data) {
  const box = document.getElementById('cellData');
  box.innerHTML = ''; // Clear previous content

  for (const [key, value] of Object.entries(data)) {
    const line = document.createElement('div');
    line.className = 'line';

    const keyy = document.createElement('div');
    keyy.textContent = `${key}:`;
    keyy.className = 'keyy';

    const vallue = document.createElement('div');
    vallue.textContent = `${value}`;
    vallue.className = 'vallue';

    line.appendChild(keyy);
    line.appendChild(vallue);

    box.appendChild(line);
  }
}














function roadGeneration() {
    // Iterate through all rows of worldData
    for (let y = 0; y < worldData.length; y++) {
      // Iterate through all columns of worldData
      for (let x = 0; x < worldData[y].length; x++) {
        // Access the worldData object at [x][y]
        const data = worldData[x][y];
        
        // Check if the object has a settlement and its size is 'Large'
        if (data.settlement === true && data.settlement.Size === 'Large') {
          // Generate a random number between 0 and 1
          const chance = Math.random();
  
          // 50% chance to set roadStart to true
          if (chance < 0.5) {
            data.roadStart = true;
            console.log(data);
          }
        }
      }
    }
  }








function generateTotemData() {

  let data = [];
  const ran = Math.floor(Math.random() * Object.keys(areasObject).length);

  data.name = 'totem';
  data.header = 'A weird totem';
  data.functionName = populateTotemWindow;
  data.area = Object.values(areasObject)[ran];

  return data;

}

function createCube(className, elevation, isWindow) {

const impa = document.createElement('div');
impa.classList.add('impa-store');

const top = document.createElement('div');
top.classList.add(`${className}`);
top.id = 'top';

const left = document.createElement('div');
left.classList.add(`${className}`);
left.id = 'left';

const right = document.createElement('div');
right.classList.add(`${className}`);
right.id = 'right';

const front = document.createElement('div');
front.classList.add(`${className}`);
front.id = 'front';

const back = document.createElement('div');
back.classList.add(`${className}`);
back.id = 'back';

impa.appendChild(top);
impa.appendChild(left);
impa.appendChild(right);
impa.appendChild(front);
impa.appendChild(back);

let walls = [];

if (className === 'structure-wall') {
  // function randomizeWallTexture() {
  //   const ran = Math.floor(Math.random() * 4) + 1;
  //   return ran;
  // }
  left.style.backgroundImage = `url('/Art/Textures/structure/walls/wall.png')`;
  right.style.backgroundImage = `url('/Art/Textures/structure/walls/wall.png')`;
  front.style.backgroundImage = `url('/Art/Textures/structure/walls/wall.png')`;
  back.style.backgroundImage = `url('/Art/Textures/structure/walls/wall.png')`;
} else if (isWindow === true) {
  left.style.backgroundImage = `url('/Art/Textures/structure/walls/window.png')`;
  right.style.backgroundImage = `url('/Art/Textures/structure/walls/window.png')`;
  front.style.backgroundImage = `url('/Art/Textures/structure/walls/window.png')`;
  back.style.backgroundImage = `url('/Art/Textures/structure/walls/window.png')`;
}



if (elevation) {
  if (elevation < 0.3) {
    elevation = 0.4;
  }
  impa.style.transform = `scale3d(1, 1, ${elevation})`;
}

// Use the elevation value directly as scaleZ
const scaleZ = elevation;

// Adjust the background size for all walls
if (className === 'impa-wall') {
  walls = [top, left, right, front, back];
  walls.forEach(wall => {
    wall.style.backgroundSize = `20px ${20 / scaleZ}px`;
  });
  impa.addEventListener('click', function(event) {
    destroyImpassable(impa);
  });
}



return impa;
}



function createRuinCube(className) {

  const impa = document.createElement('div');
  impa.classList.add('ruin-store');
  
  const left = document.createElement('div');
  left.classList.add(`${className}`);
  left.id = 'left';
  
  const right = document.createElement('div');
  right.classList.add(`${className}`);
  right.id = 'right';
  
  const front = document.createElement('div');
  front.classList.add(`${className}`);
  front.id = 'front';
  
  const back = document.createElement('div');
  back.classList.add(`${className}`);
  back.id = 'back';
  
  impa.appendChild(left);
  impa.appendChild(right);
  impa.appendChild(front);
  impa.appendChild(back);

  const walls = [left, right, front, back];

  for (i = 0 ; i < walls.length ; i++) {
    walls[i].style.backgroundImage = `url('/Art/Textures/structure/ruins/${i + 1}.png')`;
  }
  
  const randomAngle = [0, 90, 180, 270][Math.floor(Math.random() * 4)];
  impa.style.rotate = `${randomAngle}deg`;
  
  return impa;
}