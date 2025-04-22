let adventurersByArea = {};  // group adventurers by area
let areasObject = {};




let regionData = {
    climate: '',
    cultures: '',
    desert: '',
    forest: '',
    groups: '',
    index: '',
    land: 'Land',
    population: '',
    superRegion: '',
    terrain: '',
    vegetation: '',
    factions: '',
    continent: '',
    riverNumber: 0,
    roadIDCounter: 0,
    water: false
};

let REGION = {};






function loadAdventurersJSON() {
    return fetch('../../JSONData/adventurers.json')
      .then(response => response.json())
      .then(data => {
        adventurers = data; // Store the adventurers data in the global variable
        adventurerMap = new Map(data.map(adventurer => [adventurer.Title, adventurer]));
        adventurers.forEach(adventurer => {
          adventurer.Attributes = [];
          adventurer.Attributes.Strength = 0;
          adventurer.Attributes.Cunning = 0;
          adventurer.Attributes.Artisanship = 0;
          adventurer.Attributes.Education = 0;
          
          const types = adventurer.Type.split(',').map(s => s.trim());
          adventurer.Types = types;
  
          const cultures = adventurer.Culture.split(',').map(s => s.trim());
          adventurer.Cultures = cultures;
  
          adventurer.Skills = [];
        });
        
        console.log('Adventurers data:', adventurers);
        console.log('Adventurer map:', adventurerMap);
        
        return adventurers; // Resolve with the adventurers data
      })
      .catch(error => {
        console.error('Error loading adventurers JSON:', error);
        throw error; // Propagate the error
      });
  }



function loadAreas() {
fetch('../../JSONData/areas.json')
.then(response => response.json())
.then(data => {
data.forEach(area => {
    
const areaName = area.Name;
areasObject[areaName] = {
  name: areaName,
  row: area.Row,
  col: area.Col,
  headerpic: area.Header,
  climate: area.Climate,
  posX: area.PosX,
  posY: area.PosY,
  connections: area.Connections,
  size: area.Size,
  cultures: area.Cultures,
  terrains: area.Terrains,
  faction: area.Faction,
  continent: area.Continent
};    
});
console.log(areasObject);
})
.catch(error => {
console.error('Error loading area data:', error);
});
}




let cachedGridCells = [];

createTable();

function createTable() {

    cachedGridCells = [];

    initateRegion();
  
    let regionContent = Array(75).fill().map(() => Array(75).fill().map(() => ({})));

    REGION.content = regionContent;



      const gridContainer = document.getElementById('table-container');
   
      gridContainer.style.display = 'grid';
      gridContainer.style.gridTemplateRows = 'repeat(75, 12px)';
      gridContainer.style.gridTemplateColumns = 'repeat(75, 12px)';


      // Create grid cells and populate them
      for (let i = 0; i < 75; i++) {
          for (let j = 0; j < 75; j++) {
              // Create a div for each grid cell
              const cell = document.createElement('div');
              const uniqueIndex = i * 75 + j;
              cell.setAttribute('index', `${uniqueIndex}`);
              cell.style.gridRow = `${i+1}`; // Adjust to start at 1
              cell.style.gridColumn = `${j+1}`; // Adjust to start at 1
              cell.setAttribute('row', i);
              cell.setAttribute('col', j);

              cell.classList.add('game-cell');
              cell.classList.add('empty');

              regionContent[i][j].index = i * 75 + j;
              cachedGridCells.push(cell);
  
              // Append the cell to the grid container
              gridContainer.appendChild(cell);
          }
      }



}



function initateRegion() {


    REGION = {
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
        roadIDCounter: regionData.roadIDCounter,
        riverNumber: regionData.riverNumber,
        name: '',
        water: false
    };
}


function setName() {
    const inputName = document.getElementById("region-name");
    const nameText = document.getElementById("name-text");
    const inputIndex = document.getElementById("region-index");
    const indexText = document.getElementById("index-text");

    if (inputIndex.value || inputName.value) {
        nameText.textContent = inputName.value;
        REGION.name = `${inputName.value}`;
        
        indexText.textContent = inputIndex.value;
        REGION.index = inputIndex.value;
        inputIndex.value = "";
    }
}

function setLevel() {
    const input = document.getElementById("level");
    const levelRegion = document.getElementById("levelRegion");

    if (input.value.trim()) {
        const factionItem = document.createElement("div");
        factionItem.textContent = input.value;
        levelRegion.appendChild(factionItem);
        input.value = "";
    }
}


function addFaction() {
    const input = document.getElementById("faction");
    const factionList = document.getElementById("factionList");

    if (input.value.trim()) {
        const factionItem = document.createElement("div");
        factionItem.textContent = input.value;
        factionList.appendChild(factionItem);
        input.value = "";
    }
}


document.getElementById("regionForm").addEventListener("submit", function(event) {
    event.preventDefault();

    // Update the REGION object with form values
    REGION.climate = document.getElementById("climate").value;

    const selectedCultures = Array.from(document.querySelectorAll("input[name='culture']:checked"))
        .map(culture => culture.value);
    REGION.cultures = selectedCultures.join(", ");

    REGION.desert = document.getElementById("desert").value;
    REGION.forest = document.getElementById("forest").value;
    REGION.population = document.getElementById("population").value;
    REGION.superRegion = document.getElementById("superRegion").value;
    REGION.terrain = document.getElementById("terrain").value;
    REGION.vegetation = document.getElementById("vegetation").value;
    REGION.exploredCells = null;
    REGION.explorationReduction = parseInt(document.getElementById("exploration-reduction").value);
    REGION.index = parseInt(document.getElementById("index-text").textContent);
    REGION.explorationReduction = parseInt(document.getElementById("exploration-reduction").value);
    REGION.row = parseInt(document.getElementById("region-row").value);
    REGION.col = parseInt(document.getElementById("region-col").value);
    REGION.name = document.getElementById("name-text").textContent;
    REGION.level = 10;

    const factions = Array.from(document.getElementById("factionList").children)
        .map(faction => faction.textContent);
    REGION.factions = factions.join(", ");

    // Log the updated REGION object
    console.log("Updated REGION:", REGION);

    if (worldData) {
        worldData[REGION.row][REGION.col] = REGION;
    }
});




// Reference to the currently selected tile
let selectedTile = null;
let isPainting = false; // Track whether the user is painting

// Add click event listeners to all tile elements
document.querySelectorAll('.tile').forEach(tile => {
    tile.addEventListener('click', () => {
        // Store the ID of the clicked tile
        selectedTile = tile.id;

        // Highlight the selected tile visually (optional)
        document.querySelectorAll('.tile').forEach(t => t.classList.remove('selected'));
        tile.classList.add('selected');
    });
});

// Add mouse event listeners to the grid container
const tableContainer = document.querySelector('#table-container');

// Start painting on mousedown
tableContainer.addEventListener('mousedown', (event) => {
    if (event.button != 0) {
        return;
    }
    if (selectedTile) {
        isPainting = true;

        // Identify the cell under the cursor and paint it
        const cell = document.elementFromPoint(event.clientX, event.clientY);
        if (cell && cell.hasAttribute('row') && cell.hasAttribute('col')) {
            paintCell(cell);
        }
    }
});

// Continue painting on mousemove
tableContainer.addEventListener('mousemove', (event) => {
    if (isPainting && selectedTile) {
        // Identify the cell under the cursor and paint it
        const cell = document.elementFromPoint(event.clientX, event.clientY);
        if (cell && cell.hasAttribute('row') && cell.hasAttribute('col')) {
            paintCell(cell);
            cell.style.animation = 'flashIn 0.2s ease-in-out 1'
        }
    }
});

// Stop painting on mouseup
document.addEventListener('mouseup', () => {
    isPainting = false;
});

// Function to update the cell and REGION.content
function paintCell(gamecell) {
    
    const row = parseInt(gamecell.getAttribute('row'), 10);
    const col = parseInt(gamecell.getAttribute('col'), 10);

    let cell = REGION.content[row][col];

    if ( selectedTile === 'empty') {
        cell.occupied = false;
        cell.road = null;
        cell.impassable = false;
        cell.building = null;
        cell.tree = "";
        cell.river = null;
    }
    if ( selectedTile === 'pond') {
        cell.pond = true;
        cell.road = null;
        cell.impassable = false;
        cell.river = null;
    }
    if ( selectedTile === 'rocks') {
        cell.impassable = true;
        cell.occupied = true;
        cell.road = null;
        cell.river = null;
        cell.tree = "";
        cell.building = null;
    }
    if ( selectedTile === 'road') {
        cell.road = true;
        cell.occupied = true;
        cell.impassable = null;
        cell.tree = "";
    }
    if ( selectedTile === 'building') {
        cell.impassable = true;
        cell.occupied = true;
        cell.building = true;
        cell.tree = "";
    }
    if ( selectedTile === 'river') {
        cell.river = true;
        cell.occupied = true;
        cell.rocks = null;
        cell.impassable = false;
        cell.tree = "";
        cell.building = null;
        markRiverShore(row, col, gamecell);
        populateGridFromRegion();
        
    
    }
    if ( selectedTile === 'vegetation-small') {
        cell.tree = "Small";
        cell.occupied = true;
        cell.road = null;
        cell.impassable = false;
        cell.building = null;
    }
    if ( selectedTile === 'vegetation-big') {
        cell.tree = "Big";
        cell.occupied = true;
        cell.road = null;
        cell.impassable = false;
        cell.building = null;
    }

    cell.index = row * 50 + col;


    gamecell.className = ''; // Clears all classes
    gamecell.classList.add(selectedTile);

    console.log(`Updated REGION.content[${row}][${col}] with ${selectedTile}`);
}













// Reference to the file input element
const fileLoader = document.getElementById('fileLoader');

// Add an event listener to handle file input
fileLoader.addEventListener('change', async (event) => {
    const file = event.target.files[0];

    if (!file) {
        alert('No file selected!');
        return;
    }

    try {
        // Read the file content
        const fileContent = await file.text();
        const jsonData = JSON.parse(fileContent);

        // Validate and update the REGION object
        if (validateRegionData(jsonData)) {
            REGION = jsonData;

            // Paint the table-container based on the loaded REGION.content
            populateGridFromRegion();
            updateRegionOptions();
        } else {
            alert('Invalid REGION data in the JSON file.');
        }
    } catch (error) {
        console.error('Error loading file:', error);
        alert('Failed to load or parse the JSON file.');
    }
});

// Function to validate the REGION data structure
function validateRegionData(data) {
    // Ensure REGION.content is a 50x50 array and other keys are valid
    if (
        Array.isArray(data.content) &&
        data.content.length === 50 &&
        data.content.every(row => Array.isArray(row) && row.length === 50)
    ) {
        return true;
    }
    return false;
}

// Function to populate the grid based on REGION.content
function populateGridFromRegion() {
    const gridCells = document.querySelectorAll('#table-container div');

    gridCells.forEach(cell => {
        const row = parseInt(cell.getAttribute('row'), 10);
        const col = parseInt(cell.getAttribute('col'), 10);

        if (!isNaN(row) && !isNaN(col)) {
            // Clear existing classes
            cell.className = '';

            // Add the class based on REGION.content
            const cellData = REGION.content[row][col];
            const cellClasses = Object.keys(cellData).filter(key => cellData[key]);

            populateContentCellMiniTable(cell, cellData);
            if (cellClasses.length > 0) {
                cell.classList.add(...cellClasses);
            }
        }
    });

    console.log('Grid updated from REGION.content!');
}



function populateContentCellMiniTable(cell, data) {


if (!data.river === true) {
    cell.classList.add('empty');
}
if (data.impassable) {
    cell.classList.add('rocks');
}

if (data.road === true) {
  cell.classList.add('road');
  if (data.crossroad != null) {
    cell.classList.add('crossroad');
}
}

if (data.river === true) {
    cell.classList.add('river');
    if (data.river === true && data.road === true) {
        cell.classList.add('road');
    }
}
if (data.tree === 'Small') {
    cell.classList.add('vegetation-small');
}
if (data.tree === 'Big') {
    cell.classList.add('vegetation-big');
}

if (data.grass === true) {
    cell.classList.add(`grass`);
}

if (data.pond === true) {
    cell.classList.add(`pond`);
}

if (data.building) {
  cell.classList.add('building');
}

if (data.animal === true) {
    cell.classList.add('animal');
}

if (data.riverShore) {
    cell.classList.add('rivershore');
}


if (data.ruin) {
    cell.classList.add('ruin');
}

if (data.group != null) {
    cell.classList.add('group');
}
}



function updateRegionOptions() {
    const nameText = document.getElementById("name-text");
    const indexText = document.getElementById("index-text");

    nameText.textContent = `${REGION.name}`;
    indexText.textContent = `${REGION.index}`;
}





function generatePonds() {
    const table = document.getElementById('table-container')
    const regionContent = REGION.content;
    const size = 75; // Size of the region
    const simplex = new SimplexNoise();
    const scale = 0.1; // frequency
    const threshold = 0.8; // Thresholde
  
    // Helper function to check if a cell is within bounds
    function isWithinBounds(row, col) {
  
      return row >= 0 && row < size && col >= 0 && col < size;
  
  
    }
  
  
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        const noiseValue = simplex.noise2D(row * scale, col * scale);
        if (noiseValue > threshold && !regionContent[row][col].occupied) {
          regionContent[row][col].pond = true;
          regionContent[row][col].occupied = 'true';



  
          const noiseValue = simplex.noise2D(row * scale, col * scale);
          if (noiseValue > threshold) {
            regionContent[row][col].pond = true;
            regionContent[row][col].occupied = 'true';
          }
        }
      }
    }
  
  
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (regionContent[row][col].impassable === 'impassable') {
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
    populateGridFromRegion();
  }

let roadID = 0;
function generateRivers(river, roadID) {

    if (river) {
        REGION.riverNumber++;
    } else {
        REGION.roadIDCounter++;
        roadID++;
    }
    const size = 75;
    const regionContent = REGION.content;
    let roadIDCounter = REGION.roadIDCounter;


    // Helper function to check if a position is within bounds


    // Helper function to mark a cell as part of the river
    function markRiver(row, col) {
      if (inBounds(row, col)) {
          if (river) {
            
              regionContent[row][col].river = true;
              regionContent[row][col].occupied = true;
              regionContent[row][col].impassable = false;

              const chanceMoreWater = Math.floor(Math.random() * 12) + 1;
              if (chanceMoreWater > 2 && row > 2 && row < 74 && col > 2 && col < 74) {
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
                          regionContent[row][col].crossroad = false;
                        }
                  }


  
                  regionContent[row][col].occupied = true;

                  const chanceDestroy = Math.floor(Math.random() * 100);
                  if (chanceDestroy > 93 && !regionContent[row][col].crossroad) {
                    regionContent[row][col].road = false;
                  }
              
          }
      }
  }



    // Step 1: Choose random starting and ending points on the edges
    let startRow, startCol, endRow, endCol;

    // Randomly pick a side for the start point
    let startSide = Math.floor(Math.random() * 4);
    let endSide = Math.floor(Math.random() * 4);
    while (endSide === startSide) {
        startSide = Math.floor(Math.random() * 4);
        endSide = Math.floor(Math.random() * 4);
    }

    if (endSide === 0) { // Top side
        endRow = 0;
        endCol = Math.floor(Math.random() * size);
    } else if (endSide === 1) { // Bottom side
        endRow = size - 1;
        endCol = Math.floor(Math.random() * size);
    } else if (endSide === 2) { // Left side
        endRow = Math.floor(Math.random() * size);
        endCol = 0;
    } else { // Right side
        endRow = Math.floor(Math.random() * size);
        endCol = size - 1;
    }
    if (startSide === 0) { // Top side
        startRow = 0;
        startCol = Math.floor(Math.random() * size);
    } else if (startSide === 1) { // Bottom side
        startRow = size - 1;
        startCol = Math.floor(Math.random() * size);
    } else if (startSide === 2) { // Left side
        startRow = Math.floor(Math.random() * size);
        startCol = 0;
    } else { // Right side
        startRow = Math.floor(Math.random() * size);
        startCol = size - 1;
    }


    // Randomly pick a side for the end point



    // Step 2: Generate the river path from start to end
    let currentRow = startRow;
    let currentCol = startCol;

    if (!regionContent[currentRow][currentCol].crossroad) {
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

        markRiver(currentRow, currentCol);
        
    }

    // Step 3: Mark cells adjacent to the river as river shore
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (regionContent[row][col].river && river) {
                markRiverShore(row, col);
            }
        }
    }
    populateGridFromRegion();
}


    // Helper function to mark adjacent cells as river shore
function markRiverShore(row, col, gamecell) {
        const directions = [
            [-1, 0], [1, 0], [0, -1], [0, 1] // up, down, left, right
        ];
        directions.forEach(([dRow, dCol]) => {
            const newRow = row + dRow;
            const newCol = col + dCol;
            if (inBounds(newRow, newCol)) {
                // Only mark as shore if it's not already a river cell
                if (!REGION.content[newRow][newCol].river) {
                    REGION.content[newRow][newCol].riverShore = true;
                    if (gamecell) {
                        gamecell.classList.add('rivershore');
                    }

                }
                if (REGION.content[newRow][newCol].river === true && REGION.content[newRow][newCol].riverShore === true) {
                    REGION.content[newRow][newCol].river = true;
                    REGION.content[newRow][newCol].riverShore = false;
                }
            }
        });
        
    }
    function inBounds(row, col) {
        const size = 75;
        return row >= 0 && row < size && col >= 0 && col < size;
}