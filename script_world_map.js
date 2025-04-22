let viewpoint; // Global variable to store the viewpoint rectangle
let CURRENT_PLAYER_REGION_DATA = [];
window.CURRENT_PLAYER_REGION_DATA = [];
let fromTeleport = false;

let startRow = 90; // Starting row index
let startCol = 240; // Starting column index

const visibleRows = 15; // Visible rows
const visibleCols = 21; // Visible columns
let superRegionsImageData;
let superRegionsImage = new Image();
    const landmassData = [];
    const mountainsData = [];
    const climateData = [];
    const desertData = [];
    const forestsData = [];
    const coastsData = [];
    const superRegionsData = [];

    let locationsData = [];

    const cameraPan = 1;
    const landmassImage = new Image();
    const mountainsImage = new Image();
    const climateImage = new Image();
    const desertImage = new Image();
    const forestsImage = new Image();
    const coastsImage = new Image();
    let landmassLoaded = false;
    let mountainsLoaded = false;
    let climateLoaded = false;
    let desertLoaded = false;
    let forestsLoaded = false;
    let coastsLoaded = false;

    let playerPositionData = [];
    let playerOverworldCol;
    let playerOverworldRow;

    let exploredRegions = [];
// Function to create the map

let overworld_settings = {
  levels: false,
  superregions: false
}

createOverworldMiniMap();
async function createOverworldMap() {
  
  loadOverworldLocations();
  await loadSuperRegions();
  //createAndAppendOverworldCells();
  
}

function loadOverworldLocations() {
  fetch('/JSONData/overworld_locations.json')
    .then(response => response.json())
    .then(data => {
      locationsData = data;

      console.log('LOCATIONS data:', locationsData);

    })
    .catch(error => {
      console.error('Error loading LOCATIONS JSON:', error);
    });
    
}






function handleArrowKeys(event) {
  let direction = '';
  switch (event.key) {
    case 'ArrowUp':
      direction = 'up';
      updateDisplayOverworld(direction);
      break;
    case 'ArrowDown':
      direction = 'down';
      updateDisplayOverworld(direction);
      break;
    case 'ArrowLeft':
      direction = 'left';
      updateDisplayOverworld(direction);
      break;
    case 'ArrowRight':
      direction = 'right';
      updateDisplayOverworld(direction);
      break;
    default:
      return; // Exit if the key is not an arrow key
  }

  event.preventDefault(); // Prevent default arrow key behavior (e.g., scrolling the page)
}








function updateDisplayOverworld(direction) {
  switch (direction) {
    case 'up':
      if (startRow > 0) {
        startRow -= cameraPan; // Move one row up
        //createAndAppendOverworldCells();
        //updateOverworldViewpoint(startRow, startCol);
        updateOverworldMap(startRow, startCol);
        updateOverworldViewpoint(startRow, startCol);
        //updateSuperRegionText();
      }
      break;
    case 'down':
      if (startRow < 266 - visibleRows) {
        startRow += cameraPan; // Move one row down
        updateOverworldMap(startRow, startCol);
        updateOverworldViewpoint(startRow, startCol);
        //updateSuperRegionText();
      }
      break;
    case 'left':
      if (startCol > 0) {
        startCol-= cameraPan; // Move one column to the left
        updateOverworldMap(startRow, startCol);
        updateOverworldViewpoint(startRow, startCol);
        //updateSuperRegionText();
      }
      break;
    case 'right':
      if (startCol < 533 - visibleCols) {
        startCol+= cameraPan; // Move one column to the right
        updateOverworldMap(startRow, startCol);
        updateOverworldViewpoint(startRow, startCol);
        //updateSuperRegionText();
      }
      break;
    default:
      return; // Exit if the key is not an arrow key
      
  }

  event.preventDefault(); // Prevent default arrow key behavior (e.g., scrolling the page)
}

// Function to load landmass data from the image
function loadLandmassData() {
  return new Promise((resolve, reject) => {
    // Function to check if images are loaded
    function checkIfLoaded() {
      if (landmassLoaded && mountainsLoaded && climateLoaded && forestsLoaded && desertLoaded) {
        const canvas = document.createElement('canvas');
        canvas.width = landmassImage.width;
        canvas.height = landmassImage.height;
        const context = canvas.getContext('2d');
        context.drawImage(landmassImage, 0, 0);
        const landmassImageData = context.getImageData(0, 0, canvas.width, canvas.height).data;

        const forestsCanvas = document.createElement('canvas');
        forestsCanvas.width = forestsImage.width;
        forestsCanvas.height = forestsImage.height;
        const forestsContext = canvas.getContext('2d');
        forestsContext.drawImage(forestsImage, 0, 0);
        const forestsImageData = forestsContext.getImageData(0, 0, canvas.width, canvas.height).data;

        const mountainsCanvas = document.createElement('canvas');
        mountainsCanvas.width = mountainsImage.width;
        mountainsCanvas.height = mountainsImage.height;
        const mountainsContext = mountainsCanvas.getContext('2d');
        mountainsContext.drawImage(mountainsImage, 0, 0);
        const mountainsImageData = mountainsContext.getImageData(0, 0, mountainsCanvas.width, mountainsCanvas.height).data;

        const climateCanvas = document.createElement('canvas');
        climateCanvas.width = climateImage.width;
        climateCanvas.height = climateImage.height;
        const climateContext = climateCanvas.getContext('2d');
        climateContext.drawImage(climateImage, 0, 0);
        const climateImageData = climateContext.getImageData(0, 0, climateCanvas.width, climateCanvas.height).data;

        const desertCanvas = document.createElement('canvas');
        desertCanvas.width = desertImage.width;
        desertCanvas.height = desertImage.height;
        const desertContext = desertCanvas.getContext('2d');
        desertContext.drawImage(desertImage, 0, 0);
        const desertImageData = desertContext.getImageData(0, 0, desertCanvas.width, desertCanvas.height).data;

        const coastsCanvas = document.createElement('canvas');
        coastsCanvas.width = coastsImage.width;
        coastsCanvas.height = coastsImage.height;
        const coastsContext = coastsCanvas.getContext('2d');
        coastsContext.drawImage(coastsImage, 0, 0);
        const coastsImageData = coastsContext.getImageData(0, 0, coastsCanvas.width, coastsCanvas.height).data;

        for (let i = 0; i < landmassImageData.length; i += 4) {
          // Check if the pixel is black (land)
          const isLand = landmassImageData[i] === 0 && landmassImageData[i + 1] === 0 && landmassImageData[i + 2] === 0;
          landmassData.push(isLand);

          // Check if the pixel is black (forest)
          const isForest = forestsImageData[i] === 0 && forestsImageData[i + 1] === 0 && forestsImageData[i + 2] === 0;
          forestsData.push(isForest);

          // Check if the pixel is white (desert)
          const isDesert = desertImageData[i] === 255 && desertImageData[i + 1] === 255 && desertImageData[i + 2] === 255;
          desertData.push(isDesert);

          // Check if the pixel is black (coast)
          const isCoasts = coastsImageData[i] === 0 && coastsImageData[i + 1] === 0 && coastsImageData[i + 2] === 0;
          coastsData.push(isCoasts);

          // Check if the pixel is a mountain
          const isMountain = mountainsImageData[i] === 149 && mountainsImageData[i + 1] === 73 && mountainsImageData[i + 2] === 22;
          mountainsData.push(isMountain);

          // Check climate based on pixel color
          const red = climateImageData[i];
          const green = climateImageData[i + 1];
          const blue = climateImageData[i + 2];
          let climate;
          if (red === 255 && green === 255 && blue === 255) {
            climate = 'arctic';
          } else if (red === 192 && green === 192 && blue === 192) {
            climate = 'temperate';
          } else if (red === 128 && green === 128 && blue === 128) {
            climate = 'arid';
          } else if (red === 64 && green === 64 && blue === 64) {
            climate = 'tropical';
          } else {
            climate = 'unknown'; // If the pixel color doesn't match any climate, mark it as unknown
          }
          climateData.push(climate);
        }

        createOverworldMap(landmassData, mountainsData, climateData, desertData, forestsData, coastsData);
        resolve(); // Resolve the promise when data is loaded and processed
      }
    }

    // Load landmass image
    landmassImage.onload = function() {
      landmassLoaded = true;
      checkIfLoaded();
    };
    landmassImage.src = 'landmass.bmp';

    // Load mountains image
    mountainsImage.onload = function() {
      mountainsLoaded = true;
      checkIfLoaded();
    };
    mountainsImage.src = 'mountains.bmp';

    // Load climate image
    climateImage.onload = function() {
      climateLoaded = true;
      checkIfLoaded();
    };
    climateImage.src = 'climate.bmp';

    // Load coasts image
    coastsImage.onload = function() {
      coastsLoaded = true;
      checkIfLoaded();
    };
    coastsImage.src = 'coasts.bmp';

    // Load forests image
    forestsImage.onload = function() {
      forestsLoaded = true;
      checkIfLoaded();
    };
    forestsImage.src = 'forests.bmp';

    // Load desert image
    desertImage.onload = function() {
      desertLoaded = true;
      checkIfLoaded();
    };
    desertImage.src = 'deserts.bmp';
  });
}


// Load the landmass data when the page is loaded
// window.addEventListener('DOMContentLoaded', loadLandmassData);

// Function to update cell count








// Function to detect bordering water cells and apply black border
// Function to detect bordering water cells and apply black border
// Function to detect bordering water cells and apply black border
function detectAndApplyBorderOverworld() {
const map = document.getElementById('overworld');
const visibleRows = map.rows.length;
const visibleCols = map.rows[0].cells.length;

for (let y = 0; y < visibleRows; y++) {
  for (let x = 0; x < visibleCols; x++) {
    const currentCell = map.rows[y].cells[x];
    if (currentCell.classList.contains('land')) {
      let borderDirections = '';

      // Check for neighboring water cells
      if (x > 0 && x < visibleCols - 1 && !map.rows[y].cells[x - 1].classList.contains('land')) {
        borderDirections += 'left'; // Water cell on the left
      }
      if (x < visibleCols - 1 && !map.rows[y].cells[x + 1].classList.contains('land')) {
        borderDirections += 'right'; // Water cell on the right
      }
      if (y > 0 && y < visibleRows - 1 && !map.rows[y - 1].cells[x].classList.contains('land')) {
        borderDirections += 'top'; // Water cell on the top
      }
      if (y < visibleRows - 1 && !map.rows[y + 1].cells[x].classList.contains('land')) {
        borderDirections += 'bottom'; // Water cell on the bottom
      }

      // Apply black border based on detected water cell neighbors
      if (borderDirections.includes('left')) {
        currentCell.style.borderLeft = '2px solid black';
      }
      if (borderDirections.includes('right')) {
        currentCell.style.borderRight = '2px outset black';
      }
      if (borderDirections.includes('top')) {
        currentCell.style.borderTop = '2px outset black';
      }
      if (borderDirections.includes('bottom')) {
        currentCell.style.borderBottom = '2px solid black';
      }

      // Apply border radius for cells with two adjacent water cells
      if (borderDirections.includes('left') && borderDirections.includes('top')) {
        currentCell.style.borderTopLeftRadius = '4px';
      }
      if (borderDirections.includes('left') && borderDirections.includes('bottom')) {
        currentCell.style.borderBottomLeftRadius = '4px';
      }
      if (borderDirections.includes('bottom') && borderDirections.includes('right')) {
        currentCell.style.borderBottomRightRadius = '4px';
      }
      if (borderDirections.includes('right') && borderDirections.includes('top')) {
        currentCell.style.borderTopRightRadius = '4px';
      }
    }
  }
}
}


function createOverworldMiniMap() {
// HTML structure for the minimap
const minimap = document.createElement('div');
minimap.id = 'overworld-minimap';
minimap.style.backgroundSize = 'cover';


document.body.appendChild(minimap);

// Create the viewpoint rectangle
viewpoint = document.createElement('div');
viewpoint.id = 'viewpoint';

viewpoint.style.width = `${visibleCols / 2}px`; // Adjust width of the viewpoint rectangle
viewpoint.style.height = `${visibleRows / 2}px`; // Adjust height of the viewpoint rectangle
minimap.appendChild(viewpoint);

const mapPanel = document.getElementById('map-content-left');
mapPanel.appendChild(minimap);

// minimap.addEventListener('mouseup', function(event) {
//   if (event.button === 0) {
//       switchConstOverworld = true; // Toggle the switch constant
//       toggleOverworldDisplay(event, switchConstOverworld); // Pass the toggled value to the function
//   }
// });
}

const minimap = document.getElementById('overworld-minimap');




// Function to update the actual map based on startRow and startCol
function updateOverworldMap(newRow, newCol) {
const map = document.getElementById('overworld');
map.innerHTML = '';

for (let y = newRow; y < newRow + visibleRows; y++) {
  for (let x = newCol; x < newCol + visibleCols; x++) {
    const index = y * 533 + x;
    const cell = document.createElement('td');
    cell.className = landmassData[index] ? 'region land' : 'region water';

    cell.style.top = (y - newRow) * 30 + 'px';
    cell.style.left = (x - newCol) * 30 + 'px';

    if (mountainsData[index]) {
      cell.classList.add('mountain');
    }

    if (desertData[index]) {
      cell.classList.add('desert');
    }

    if (forestsData[index]) {
      cell.classList.add('forest');
    }

    if (coastsData[index]) {
      cell.classList.add('coast');
    }

    const cellClimate = climateData[index];
    if (cellClimate) {
      cell.classList.add('climate');
      cell.classList.add(cellClimate);
    }

    const playerPosition = playerPositionData[index];
    if (playerPosition) {
      cell.classList.add('player-position');
    }

    if (worldData[y][x].vegetation === 'Montane') {
      cell.classList.add('montane');
    }
    
      // Check if the current coordinates have valid data in worldData
      if (worldData[y] && worldData[y][x]) {
        let worldDataEntry = worldData[y][x];

        if (Object.keys(worldDataEntry).length > 0 && worldDataEntry.groups != null) {
          cell.classList.add('has-groups');
          const cellSpan = document.createElement('span');
          cellSpan.setAttribute('class', `region-group-container`);
          cell.appendChild(cellSpan);
          for (let i = 0; i < worldData[y][x].groups.length ; i++) {
            const groupIco = document.createElement('span');
            groupIco.setAttribute('class', `group-icon`);
            groupIco.setAttribute('gid', `${worldData[y][x].groups[i].gID}`);
            cellSpan.appendChild(groupIco);
            addOtherGroupTooltip(groupIco, worldData[y][x].groups[i]);
          }
        }
        if (Object.keys(worldDataEntry).length > 0 && worldDataEntry.isSettlement === true) {
          cell.classList.add('location-overworld');
          const cellSpan = document.createElement('span');
          cellSpan.setAttribute('id', `${worldDataEntry.settlement.Name}`);
          cellSpan.classList.add(`${worldDataEntry.settlement.Type}`);
          cellSpan.classList.add(`${worldDataEntry.settlement.Size}`);
          cellSpan.classList.add(`${worldDataEntry.continent}`);
          cellSpan.classList.add('settlement');
          cell.appendChild(cellSpan);
          cellSpan.innerHTML = `${worldDataEntry.settlement.Name}`;
          cell.addEventListener('mouseover', function(event) {
            displayOverworldSettlementTooltip(event, cell, worldDataEntry);
           });
        } else {

        }
      } else {
      }

  // Check if the index matches any location index
  const locationIndex = locationsData.findIndex(location => location.index === index);
  if (locationIndex !== -1) {
    cell.classList.add('location-overworld');
    const location = locationsData[locationIndex];
    cell.classList.add(`${location.type}`);
    const cellSpan = document.createElement('span');
    cellSpan.setAttribute('id', `${location.name}`);
    cell.appendChild(cellSpan);
    cellSpan.innerHTML = `${location.name}`;
  }

    const cellSuperRegionColor = superRegionsImageData.slice(index * 4, index * 4 + 3); // Extract RGB values of the super region
    const cellSuperRegionColorString = cellSuperRegionColor.map(c => c.toString(16).padStart(2, '0')).join(''); // Convert to hex string for comparison
    const cellSuperRegionName = superRegionsData[cellSuperRegionColorString]; // Get the name of the super region based on the color

    if (cellSuperRegionName) {
        cell.classList.add('super-region');
        cell.classList.add(cellSuperRegionName);
        cell.setAttribute('super-region', cellSuperRegionName);
        addLevelOverlay(cell, worldData[y][x].level);
        addSuperRegionOverlay(cell, cellSuperRegionName);
    }

    checkIfRegionIsExplored(index, cell);

    map.appendChild(cell);



    if (!cell.classList.contains('location-overworld')) {
      cell.addEventListener('mouseover', function(event) {
        getOverworldCellData(event, cell, index, y, x);
       });
    }

    cell.addEventListener('mousedown', function(event) {
      const cultures1 = areasObject[cellSuperRegionName].cultures;
      let region = getOverworldCellData2(index, cellSuperRegionName, cultures1, y, x);

      
      //let region = getOverworldCellData(event, cell, index, y, x);
      removeAnyToolTip();
      displayRegionClickPopup(event, cell, region, y, x);
     });
  }

  startCol = newCol;
  startRow = newRow;
}

// Apply borders and update cell count after creating and appending cells
//detectAndApplyBorderOverworld();


}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function addSuperRegionOverlay(cell, superregion) {
  const colorIndicator = document.createElement('div');
  colorIndicator.classList.add('superregion-overlay');

  const color = areasObject[`${superregion}`].color;
  colorIndicator.style.backgroundColor = `${color}`;

  if (overworld_settings.superregions === true) {
    colorIndicator.style.visibility = 'visible';
  } else {
    colorIndicator.style.visibility = 'hidden';
  }

  cell.appendChild(colorIndicator);
}

function addLevelOverlay(cell, level) {
  const colorIndicator = document.createElement('div');
  colorIndicator.classList.add('level-overlay');
  const maxLevel = 50;
  const grayValue = Math.floor((1 - (level - 1) / (maxLevel - 1)) * 255);
  colorIndicator.style.backgroundColor = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;

  if (overworld_settings.levels === true) {
    colorIndicator.style.visibility = 'visible';
  } else {
    colorIndicator.style.visibility = 'hidden';
  }

  cell.appendChild(colorIndicator);
}


let playerCurrentRegionRow = 50;
let playerCurrentRegionCol = 50;

async function teleportPlayer(row, col) {
  playNextRegionSound();
  console.log('teleport 1');

  let existingPopup = document.getElementById('region-popup-container');
  if (existingPopup) {
      existingPopup.remove();
  }


  fromTeleport = true;

  playerOverworldRow = row;
  playerOverworldCol = col;

  console.log('teleport 2');
  playerCurrentRegionRow = 25;
  playerCurrentRegionCol = 25;
  setOverworldPlayerPosition(playerOverworldRow, playerOverworldCol);
  CURRENT_PLAYER_REGION_DATA = [];
  CURRENT_PLAYER_REGION_DATA = getNewOverworldRegionData(playerOverworldRow, playerOverworldCol);


  const newRegionIndex = playerOverworldRow * 533 + playerOverworldCol;
await loadRegionState(newRegionIndex, worldData[playerOverworldRow][playerOverworldCol], playerOverworldRow, playerOverworldCol);




  const savedMap = await loadSavedMap(newRegionIndex);

  if (savedMap) {
    CURRENT_PLAYER_REGION_DATA = savedMap;
  } else {
    CURRENT_PLAYER_REGION_DATA = worldData[row][col];
  }

  
  togglePartyContainerDisplay('off');

  window.CURRENT_PLAYER_REGION_DATA = CURRENT_PLAYER_REGION_DATA;


  firstTimeGame = false;

      createSemTab(row, col, CURRENT_PLAYER_REGION_DATA);

  
  displayMessage(`We are now in ${areasObject[currentArea].name}.`, 'yellow');


  if (CURRENT_PLAYER_REGION_DATA.explored === true) {
    displayMessage(`We have already visited this region.`, 'bisque');
  } else {
    displayMessage(`We have never visited this region.`, 'bisque');
  }

  
  
startRow = row - 7; // Starting row index
startCol = col - 11; // Starting column index
  updateOverworldMap(startRow, startCol);
  updateOverworldViewpoint(startRow, startCol);

  updateRegionInformations();

  updateMinimapExplorationProgress();
  updateExplorationProgress();
  onPlayerChangeRegion();

  return new Promise(resolve => {
    setTimeout( async () => {
      const selectedCell = document.querySelector('.group-initial-position');
      const tableCont = document.getElementById('table-container');
      await initiatePlayerCamera(tableCont, selectedCell);
      togglePartyContainerDisplay('off');

        resolve();
      }, 100);
  });

}


function updateOverworldViewpoint(row, col) {
const minimap = document.getElementById('overworld-minimap');
const minimapRect = minimap.getBoundingClientRect(); // Get the bounding rectangle of the minimap

// Calculate the scale factors
const scaleX = minimap.clientWidth / 533;
const scaleY = minimap.clientHeight / 266;

// Calculate the position of the viewpoint rectangle
let x = col * scaleX - (scaleX * 4);
let y = row * scaleY - (scaleY * 4);

// Adjust the position to ensure it stays within the bounds of the minimap
x = Math.max(0, Math.min(x, minimapRect.width - viewpoint.clientWidth)); // Limit x within the width of the minimap
y = Math.max(0, Math.min(y, minimapRect.height - viewpoint.clientHeight)); // Limit y within the height of the minimap

// Update the position of the viewpoint rectangle
viewpoint.style.left = x + 'px';
viewpoint.style.top = y + 'px';
}


async function loadSuperRegions() {
    try {
        // Fetch the JSON file containing super region data
        const response = await fetch('/JSONData/colors-superregions.json');
        const superRegionColors = await response.json();

        console.log('superRegionColors JSON Data:', superRegionColors);

        // Fetch the super regions image
        superRegionsImage.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = superRegionsImage.width;
            canvas.height = superRegionsImage.height;
            const context = canvas.getContext('2d');
            context.drawImage(superRegionsImage, 0, 0);
            superRegionsImageData = context.getImageData(0, 0, canvas.width, canvas.height).data;

            // Update superRegionsData with color data
            for (let i = 0; i < superRegionsImageData.length; i += 4) {
                const color = [
                    superRegionsImageData[i],      // Red
                    superRegionsImageData[i + 1],  // Green
                    superRegionsImageData[i + 2]   // Blue
                ];

                // Match the color with the ones specified in the JSON data
                const matchedRegion = superRegionColors.find(region => {
                    return region.color[0] === color[0] &&
                           region.color[1] === color[1] &&
                           region.color[2] === color[2];
                });

                if (matchedRegion) {
                    const colorString = color.map(c => c.toString(16).padStart(2, '0')).join('');
                    superRegionsData[colorString] = matchedRegion.name.toString();
                }
            }

            console.log("superRegionData", superRegionsData); // Debugging: Log updated superRegionsData
        };
        superRegionsImage.src = 'superregions.bmp';
    } catch (error) {
        console.error('Error loading super regions:', error);
    }
}


function updateSuperRegionText() {
    // Get all cells with the 'super-region' attribute
    const cellsWithSuperRegion = document.querySelectorAll('.region[super-region]');
    
    // Create an object to count occurrences of super region names
    const superRegionCounts = {};
    cellsWithSuperRegion.forEach(cell => {
        const superRegionName = cell.getAttribute('super-region');
        if (superRegionCounts.hasOwnProperty(superRegionName)) {
            superRegionCounts[superRegionName]++;
        } else {
            superRegionCounts[superRegionName] = 1;
        }
    });
    
    // Find the super region with the highest count
    let maxCount = 0;
    let mostFrequentSuperRegion = '';
    for (const superRegionName in superRegionCounts) {
        if (superRegionCounts[superRegionName] > maxCount) {
            maxCount = superRegionCounts[superRegionName];
            mostFrequentSuperRegion = superRegionName;
        }
    }
    highlightSuperRegionCells(mostFrequentSuperRegion);
    function highlightSuperRegionCells() {
        const cells = document.querySelectorAll('.region');
    
        cells.forEach(cell => {
            const superRegionAttribute = cell.getAttribute('super-region');
            if (superRegionAttribute === mostFrequentSuperRegion) {
                cell.classList.add('super-region-highlight');
            } else {
                cell.classList.remove('super-region-highlight');
            }
        });
    }

    // Get the text from the most frequent super region
    const superRegionText = mostFrequentSuperRegion;

    // Create or update the text element
    let textElement = document.getElementById('superRegionText');
    let mapContainer = document.getElementById('overworld-container');
    if (!textElement) {
        textElement = document.createElement('div');
        textElement.id = 'superRegionText';
        textElement.style.position = 'absolute';
        textElement.style.zIndex = '7'; // Ensure it's above other elements
        
        mapContainer.appendChild(textElement);
    }

    // Update text content and position
    textElement.textContent = superRegionText;

    // Calculate the average position of visible cells with the most frequent super region
    let totalX = 0;
    let totalY = 0;
    let visibleCellCount = 0;
    cellsWithSuperRegion.forEach(cell => {
        const superRegionName = cell.getAttribute('super-region');
        if (superRegionName === mostFrequentSuperRegion) {
            const cellRect = cell.getBoundingClientRect();
            if (cellRect.top >= 0 && cellRect.bottom <= window.innerHeight &&
                cellRect.left >= 0 && cellRect.right <= window.innerWidth) {
                totalX += cellRect.left + cellRect.width / 2;
                totalY += cellRect.top + cellRect.height / 2;
                visibleCellCount++;
            }
        }
    });

    if (visibleCellCount === 5) {
        // No visible cells with the most frequent super region
        hideSuperRegionText();
        return;
    }

    // Calculate the average position
    if (visibleCellCount >= 1) {
    const averageX = totalX / visibleCellCount / 5 * 2;
    const averageY = totalY / visibleCellCount / 7 * 2;

    // Determine font size based on the number of visible cells
    let fontSize = visibleCellCount; // Adjust as needed
    if (fontSize >= 40) {
        fontSize = 40;
    }
    if (fontSize <= 20) {
        fontSize = 20;
    }

  
    // Update text position and style
    textElement.style.display = 'block';
    textElement.style.fontSize = fontSize + 'px';
    textElement.style.left = averageX + 'px';
    textElement.style.top = averageY + 'px';

    const viewportCenterX = startCol * 0.7 + (visibleCols * 15);
    const viewportCenterY = startRow * 1.2 + (visibleRows * 15);

    // Calculate angle between average position of cells and center of viewport
    const angle1 = Math.atan2(averageY - viewportCenterY, averageX - viewportCenterX) * (180 / Math.PI);

    // Calculate angle between center of viewport and origin
    const angle2 = Math.atan2(viewportCenterY, viewportCenterX) * (180 / Math.PI);

    // Calculate relative angle
    let degrees = (angle1 - angle2) + 120 / 2;

    // Adjust rotation based on the relative angle

    if (degrees > 45) {
        degrees -= 90;
    } else if (degrees < -45) {
        degrees += 90;
    }

    // Apply rotation
    textElement.style.transform = `translate(40%, 50%) rotate(${degrees}deg)`;


    } else {
        hideSuperRegionText();
    }
}

function hideSuperRegionText() {
    const textElement = document.getElementById('superRegionText');
    if (textElement) {
        textElement.style.display = 'none';
    }
}



function getOverworldCellData(event, cell, index, row, col) {

    const cellSuperRegionName = cell.getAttribute('super-region');
  

  let land = landmassData[index] ? 'Land' : 'Water';
  let mountain = mountainsData[index] ? 'Mountain' : 'Plain';
  let desert = desertData[index] ? 'Desert' : '';
  let forest = forestsData[index] ? 'Forest' : '';
  let climate = climateData[index];
  let explored = exploredRegions[index]  ? 'Explored' : 'Not Explored';
  let superRegion = '';
  let coast = coastsData[index];
  let level = worldData[row][col].level;
  if (cellSuperRegionName) { 
    superRegion = cellSuperRegionName.toString();
  }

  displayOverworldCellTooltip(event, land, mountain, desert, climate, superRegion, coast, forest, index, row, col, explored, level);


  let hoveredRegion = {
    land: land,
    terrain: mountain, 
    coast: coast,
    vegetation: forest,
    desert: desert,
    climate: climate,
    explored: explored,
    cultures: '',
    population: 'Average',
    groups: enemyGroupsByRegion[index],
    superRegion: superRegion,
    level: level,
    index: index
  };

  if (coast === true) {
    hoveredRegion.coast = 'Coastal';
  } else {
    hoveredRegion.coast = 'Inland';
  }
  
  if (mountain === 'Mountain' && forest === 'Forest') {
    hoveredRegion.vegetation = 'Montane';
    if (climate === 'arctic') {
      hoveredRegion.vegetation = 'Alpine-Tundra';
    }
    if (climate === 'tropical') {
      hoveredRegion.vegetation = 'Cloud-Forest';
    }
  }
  if (mountain === 'Plain' && forest === '' && climate === 'temperate') {
    hoveredRegion.vegetation = 'Prairie';
  }
  if (mountain === 'Plain' && forest === '' && climate === 'arid') {
    hoveredRegion.vegetation = 'Steppe';
  }
  if (mountain === 'Plain' && forest === '' && climate === 'arctic') {
    hoveredRegion.vegetation = 'Tundra';
  }
  if (mountain === 'Plain' && forest === '' && climate === 'tropical') {
    hoveredRegion.vegetation = 'Savanna';
  }
  if (desert === 'Desert' && forest === '' && climate === 'temperate') {
    hoveredRegion.vegetation = 'Desertic';
  }
  if (mountain === 'Plain' && desert === 'Desert' && forest === '' && climate === 'arid') {
    hoveredRegion.vegetation = 'Desertic';
  }
  if (mountain === 'Mountain' && forest === '') {
    if (climate === 'temperate') {
      hoveredRegion.vegetation = 'Meadow';
    }
    if (climate === 'tropical') {
      hoveredRegion.vegetation = 'Cloud-Forest';
    }
  }
  if (climate === 'arctic') {
    if (forest === 'Forest') {
      hoveredRegion.vegetation = 'Taiga';
      if (mountain === 'Mountain') {
        hoveredRegion.vegetation = 'Alpine-Tundra';
      }
    }
    
  }
  if (climate === 'temperate' && forest === 'Forest' && mountain === 'Plain') {
    hoveredRegion.vegetation = 'Woodland';
  }
  if (climate === 'tropical' && forest === 'Forest' && mountain === 'Plain') {
    hoveredRegion.vegetation = 'Jungle';
  }
  if (climate === 'tropical' && forest === 'Forest' && coastsData[index] === true) {
    hoveredRegion.vegetation = 'Mangrove';
  }
  if (climate === 'arid' && forest === 'Forest' && mountain === 'Plain') {
    hoveredRegion.vegetation = 'Tugay';
  }
  if (climate === 'temperate' && forest === 'Forest' && desert === 'Desert') {
    hoveredRegion.vegetation = 'Tugay';
  }

  return hoveredRegion;
}





function displayOverworldCellTooltip(event, land, mountain, desert, climate, superRegion, coast, forest, index, row, col, explored, level) {

  const hoveredElement = event.target;

  const existingTooltip = document.querySelector('.area-tooltip');
  if (existingTooltip) {
    existingTooltip.remove();
  }

  const areaData = areasObject[superRegion];

    const tooltip = document.createElement('div');
    tooltip.className = 'area-tooltip';
    tooltip.setAttribute('id', 'overworld-cell-tooltip');

if (land === 'Land' && areaData) {
  tooltip.innerHTML = `
  <div class="header" id="header" style="">Region of ${superRegion}</div>
  <div class="Level">Lvl: ${level}</div>
  <div class="Cultures">${areaData.cultures}</div>
  <div class="Faction"><span class="normal">Faction: </span>${areaData.faction}</div>
  <div class="Faction"><span class="normal">Index: </span>${index}</div>
  <div class=""><span class="normal">Row: ${row} </span>Col: ${col}</span></div>
  <div class="Faction">${explored}</div>
`;
} else {
  tooltip.innerHTML = `
  <div>${land}</div>
`;
}



  
    hideEmptyElements(tooltip);
    // Set the tooltip position
    const tooltipX = event.clientX;
    const tooltipY = event.clientY;

    tooltip.style.position = 'absolute';

    // Adjust tooltip position to stay within the window boundaries
    const maxRight = window.innerWidth - tooltip.clientWidth;
    const maxBottom = window.innerHeight - tooltip.clientHeight;

    // If tooltip exceeds window boundaries, adjust its position
    const adjustedX = Math.min(tooltipX, maxRight);
    const adjustedY = Math.min(tooltipY, maxBottom);

    tooltip.style.left = `${adjustedX - 10}px`;
    tooltip.style.top = `${adjustedY + 10}px`;


    // Append the tooltip to the body
    document.body.appendChild(tooltip);
    
    // Update the background image of the header
    if (areaData) {
      const header = tooltip.querySelector('#header');
      header.style.backgroundImage = `url('/Art/Interface/Terrains/location_headers/${areaData.headerpic}.png')`;
    }


    // Set the initial tooltip position
    updateTooltipPosition(event, tooltip);

    // Add event listener to update tooltip position on mousemove
    hoveredElement.addEventListener('mousemove', (event) => updateTooltipPosition(event, tooltip));

    const overworld = document.getElementById('overworld-container');
    overworld.addEventListener('mouseout', function(event) {
      const existingTooltip = document.querySelector('.area-tooltip');
      if (existingTooltip) {
        existingTooltip.remove();
      }
    });

}


function centerOverworldGroup() {
  updateOverworldMap(playerOverworldRow - 7, playerOverworldCol - 11);
  updateOverworldViewpoint(playerOverworldRow - 7, playerOverworldCol - 11);
}



function closeOverworld() {
  const overworld = document.getElementById('overworld-container');
  overworld.style.display = 'none';

  const game = document.getElementById('region-grid-container');
  game.classList.remove('hidden');
  game.style.display = '';

}

const throttledUpdateOverworld = throttleAsync(updateOverworldMap, 1);

function toggleOverworldDisplay(event) {
  removeAllKindsOfTooltips();

  PLAYER_STATE.isInMenu = !PLAYER_STATE.isInMenu;
  togglePointerLock();

  const mega = document.getElementById('mega-wrapper');
  const middle = document.getElementById('middle');

  middle.classList.toggle('invisible');
  mega.classList.toggle('invisible');
  
  const overworldContainer = document.getElementById('overworld-container');
  const minimap = document.getElementById('overworld-minimap');


  let existingPopup = document.getElementById('region-popup-container');
  if (existingPopup) {
      existingPopup.remove();
  }


    

    minimap.style.display = 'block';
    centerOverworldGroup();


if ( switchConstOverworld === true) {
  overworldContainer.style.display = 'block';
  document.body.addEventListener('keydown', handleArrowKeys);


  overworldContainer.classList.add('overworld-large');


  //updateSuperRegionText();



  ['mousemove', 'mousedown'].forEach(eventType => {
    minimap.addEventListener(eventType, function(event) {
      if (event.buttons === 1) { // Check if the left mouse button is pressed
        
        const rect = minimap.getBoundingClientRect();
        const scaleX = 29;
        const scaleY = 30;
        const clickX = (event.clientX - rect.left) * scaleX * 2;
        const clickY = ((event.clientY - rect.top) * scaleY * 2) - 200;
      
        // Calculate startRow and startCol based on the click position
        const row = Math.floor(clickY / 30);
        const col = Math.floor(clickX / 30);
  
        // Update the actual map based on the calculated startRow and startCol
        throttledUpdateOverworld(row, col);
        updateOverworldViewpoint(row, col);
        
        //updateSuperRegionText();
      }
    });
  });

} else {

overworldContainer.classList.remove('overworld-large');
document.body.removeEventListener('keydown', handleArrowKeys);
updateOverworldMinimapPlayerPosition(playerOverworldRow, playerOverworldCol);

}
}

let switchConstOverworld = true;
document.addEventListener('keydown', function(event) {
  if (event.key === 'Tab') {
      event.preventDefault();

      toggleOverworldDisplay(event, switchConstOverworld); // Pass the toggled value to the function
  }
});


function setOverworldPlayerPosition(playerRow, playerCol) {
  playerPositionData = Array.from(landmassData).fill(false); // Create a copy of landmassData and fill it with false

  // Calculate the index of the player position in playerPositionData
  const index = playerRow * 533 + playerCol;

  // Update the player position to true
  playerPositionData[index] = true;
  updateOverworldPlayerPosition(playerRow, playerCol);

  return playerPositionData; // Return the updated player position data


}

function updateOverworldPlayerPosition(newRow, newCol) {

  //getNewOverworldRegionData(newRow, newCol);

  playerPositionData.fill(false);
    // Calculate the index of the player position in playerPositionData
    const index = newRow * 533 + newCol;

    // Update the player position to true
    playerPositionData[index] = true;
    updateOverworldMinimapPlayerPosition(newRow, newCol);
    updateOverworldViewpoint(newRow, newCol);
}

function updateOverworldMinimapPlayerPosition(newRow, newCol) {
  const playerPos = document.getElementById("minimap-player-pos");
  const mapContainer = document.getElementById("minimap2");
  
  // Update player position
  playerPos.style.top = newRow + 'px';
  playerPos.style.left = newCol + 'px';

  // Calculate scroll position to center around player
  const containerWidth = mapContainer.offsetWidth;
  const containerHeight = mapContainer.offsetHeight;
  const playerLeft = newCol * 7; // considering scale(5)
  const playerTop = newRow * 7; // considering scale(5)
  const scrollLeft = playerLeft - containerWidth / 2 + playerPos.offsetWidth / 2;
  const scrollTop = playerTop - containerHeight / 2 + playerPos.offsetHeight / 2;

  // Set scroll position
  mapContainer.scrollLeft = scrollLeft;
  mapContainer.scrollTop = scrollTop;
}


function getNewOverworldRegionData(newRow, newCol) {

  const index = newRow * 533 + newCol;
  if (landmassData[index] === true) {
  const cellSuperRegionColor = superRegionsImageData.slice(index * 4, index * 4 + 3); // Extract RGB values of the super region
  const cellSuperRegionColorString = cellSuperRegionColor.map(c => c.toString(16).padStart(2, '0')).join(''); // Convert to hex string for comparison
  const cellSuperRegionName = superRegionsData[cellSuperRegionColorString]; // Get the name of the super region based on the color


console.log(cellSuperRegionName);

if (cellSuperRegionName) {
  const mountain = mountainsData[index] ? 'Mountain' : '';
  const desert = desertData[index] ? 'Desert' : '';
  const forest = forestsData[index] ? 'Forest' : '';
  
  const terrain = desert || forest || mountain || 'Plain';


  const climate = climateData[index];
  let superRegion = `${cellSuperRegionName}`;
  let coast = '';


  const areaData = areasObject[superRegion];


  areasObject[currentArea].climate = climate;

  areasObject[currentArea].terrains.terrain_1 = terrain;
  areasObject[currentArea].name = superRegion;


    areasObject[currentArea].cultures = areasObject[superRegion].cultures;
    areasObject[currentArea].faction = areasObject[superRegion].faction;



    const cultures1 = areasObject[superRegion].cultures;
    console.log(cultures1);


  CURRENT_PLAYER_REGION_DATA = getOverworldCellData2(index, superRegion, cultures1, newRow, newCol);

  updateRegionModifiers();
  console.log('CURRENT_PLAYER_REGION_DATA', CURRENT_PLAYER_REGION_DATA);

  return CURRENT_PLAYER_REGION_DATA;
}


  }
}


function getOverworldCellData2(index, superRegion, cultures1, newRow, newCol) {



  let land = landmassData[index] ? 'Land' : 'Water';
  let mountain = mountainsData[index] ? 'Mountain' : 'Plain';
  let desert = desertData[index] ? 'Desert' : '';
  let forest = forestsData[index] ? 'Forest' : '';
  let climate = climateData[index];
  let explored = exploredRegions[index]  ? 'Explored' : 'Not Explored';
  let coast = coastsData[index];
  let factions = areasObject[superRegion].faction;
  let continent = areasObject[superRegion].continent;
  let cultures = cultures1;
  let level = worldData[newRow][newCol].level;
  
  if (coast) {
    coast = 'Coastal';
  }
  
  
  let hoveredRegion = {
    land: land,
    terrain: mountain, 
    coast: coast,
    vegetation: forest,
    desert: desert,
    forest: forest,
    climate: climate,
    explored: explored,
    cultures: cultures,
    population: 'Average',
    groups: enemyGroupsByRegion[index],
    superRegion: superRegion,
    index: index,
    continent: continent,
    factions: factions,
    level: level
  };


if (mountain === 'Mountain' && forest === 'Forest') {
  hoveredRegion.vegetation = 'Montane';
  if (climate === 'arctic') {
    hoveredRegion.vegetation = 'Alpine-Tundra';
  }
  if (climate === 'tropical') {
    hoveredRegion.vegetation = 'Cloud-Forest';
  }
}
if (mountain === 'Plain' && forest === '' && climate === 'temperate') {
  hoveredRegion.vegetation = 'Prairie';
}
if (mountain === 'Plain' && forest === '' && climate === 'arid') {
  hoveredRegion.vegetation = 'Steppe';
}
if (mountain === 'Plain' && forest === '' && climate === 'arctic') {
  hoveredRegion.vegetation = 'Tundra';
}
if (mountain === 'Plain' && forest === '' && climate === 'tropical') {
  hoveredRegion.vegetation = 'Savanna';
}
if (desert === 'Desert' && forest === '' && climate === 'temperate') {
  hoveredRegion.vegetation = 'Desertic';
}
if (mountain === 'Plain' && desert === 'Desert' && forest === '' && climate === 'arid') {
  hoveredRegion.vegetation = 'Desertic';
}
if (mountain === 'Mountain' && forest === '') {
  if (climate === 'temperate') {
    hoveredRegion.vegetation = 'Meadow';
  }
  if (climate === 'tropical') {
    hoveredRegion.vegetation = 'Cloud-Forest';
  }
  if (climate === 'arid') {
    hoveredRegion.vegetation = 'Arid-Montane';
  }
}
if (climate === 'arctic') {
  if (forest === 'Forest') {
    hoveredRegion.vegetation = 'Taiga';
    if (mountain === 'Mountain') {
      hoveredRegion.vegetation = 'Alpine-Tundra';
    }
  }
  
}
if (climate === 'temperate' && forest === 'Forest' && mountain === 'Plain') {
  hoveredRegion.vegetation = 'Woodland';
}
if (climate === 'tropical' && forest === 'Forest' && mountain === 'Plain') {
  hoveredRegion.vegetation = 'Jungle';
}
if (climate === 'tropical' && forest === 'Forest' && coastsData[index] === true) {
  hoveredRegion.vegetation = 'Mangrove';
}
if (climate === 'arid' && forest === 'Forest' && mountain === 'Plain') {
  hoveredRegion.vegetation = 'Tugay';
}
if (climate === 'temperate' && forest === 'Forest' && desert === 'Desert') {
  hoveredRegion.vegetation = 'Tugay';
}

  
  return hoveredRegion;
  }



function checkIfRegionIsExplored(index, cell) {
  const regionState = localStorage.getItem(`region-${index}`);
  
  if (regionState) {
    cell.classList.add('explored');
    exploredRegions[index] = true;
    
    const regionPic = localStorage.getItem(`region-${index}-pic`);
  
    if (regionPic) {
      cell.style.backgroundImage = `url(${regionPic})`;
    }
  }
}






















function updateRegionModifiers() {
  let modifierBox = document.getElementById('region-modifiers-container');
  let terrain = modifierBox.querySelector('#terrain');
  let climate = modifierBox.querySelector('#climate');
  let vegetation = modifierBox.querySelector('#vegetation');

  terrain.style.backgroundImage = `url('/Art/Vegetation/icons/${CURRENT_PLAYER_REGION_DATA.vegetation}.png')`;

  vegetation.style.backgroundImage = `url('/Art/Vegetation/icons/${CURRENT_PLAYER_REGION_DATA.vegetation}.png')`;

  if (CURRENT_WEATHER.rain) {
    climate.style.backgroundImage = `url('/Art/Weather/rain.png')`;
  } else {
    climate.style.backgroundImage = `none`;
  }
}





function toggleOverlayOverworldlevels(classname) {
  const map = document.getElementById('overworld');
  const overlays = map.querySelectorAll(`${classname}`);

  if (classname === '.level-overlay') {
    if (overworld_settings.levels === true) {
      overworld_settings.levels = false;
      overlays.forEach(elem => {
        elem.style.visibility = 'hidden';
      });
    } else {
      overworld_settings.levels = true;
      overlays.forEach(elem => {
        elem.style.visibility = 'visible';
      });
    }
  }

  if (classname === '.superregion-overlay') {
    if (overworld_settings.superregions === true) {
      overworld_settings.superregions = false;
      overlays.forEach(elem => {
        elem.style.visibility = 'hidden';
      });
    } else {
      overworld_settings.superregions = true;
      overlays.forEach(elem => {
        elem.style.visibility = 'visible';
      });
    }
  }
}