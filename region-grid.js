
let cellGroupPosition = 25;
let EXPLORED_REGIONS_NUMBER = 0;

let currentOtherGroups = [];
let enemyGroupsByRegion = {};



let playerIsInWater = false;
let playerIsOnRoad = false;

let actionGridDisabled = false;


let CURRENT_GROUP_CELL;
let CURRENT_MINI_CELL;
let CURRENT_TARGET_CELL;

let newGroupCell = null;


function forceSVGFilterRedraw() {
  const filter = document.querySelector('#pixelate');
  const feFlood = filter.querySelector('feFlood');

  // Force the browser to materialize the node by injecting it into a real interaction
  document.body.offsetHeight; // force reflow

  // Force a tiny change
  feFlood.setAttribute('height', '4');

  requestAnimationFrame(() => {
    feFlood.setAttribute('height', '1');

    // Now, reapply the filter to the target element to force redraw
    const region = document.getElementById('neo-region');
    const originalFilter = region.style.filter;

    region.style.filter = 'none'; // remove filter
    void region.offsetWidth;      // trigger reflow
    region.style.filter = originalFilter || 'url(#pixelate)'; // reapply filter
  });
}





function appearTable() {
  return new Promise(resolve => {
    const tableMainContainer = document.getElementById('region-grid-container');
    const table = document.getElementById('table-container');

    tableMainContainer.classList.add('table-appear');
    table.classList.add('grid-appear');
      // Wait for the animation to complete
      setTimeout(() => {
          // Remove the rotation class
          tableMainContainer.classList.remove('table-appear');
          table.classList.remove('grid-appear');
          resolve(); // Resolve the promise to indicate animation completion
      }, 1000); // Adjust the timing as needed
  });
}
















































// Function to set the group position to a randomly picked cell in the left column
function setStartingGroupPosition() {
  const bottomRowCells = document.querySelectorAll('#region-grid-table:nth-child(25)'); // Select cells in the bottom row
  const availableCells = Array.from(bottomRowCells); // Filter out occupied cells

  let table = document.getElementById('table-container');

  if (availableCells.length > 0) {
    let selectedCell;
    
    // Start by trying the cellGroupPosition cell

      selectedCell = bottomRowCells[cellGroupPosition];


    // Remove 'current-group-position' class from all cells and add it to the selected cell


    if (selectedCell) {
      
      selectedCell.classList.add('current-group-position');
      selectedCell.classList.add('group-standing');
      selectedCell.classList.remove('unexplored');
      selectedCell.classList.add('group-initial-position');

        
 
      

    } else {
      console.error('No available cells found.');
    }
  } else {
    console.error('No available cells in the bottom row without the class "occupied".');
  }
}







function toggleInStructureMode() {
  const filter = document.querySelector('#region-grid-filter');

  PLAYER_STATE.isInStructure = !PLAYER_STATE.isInStructure;

  if (PLAYER_STATE.isInStructure === true) {
    filter.style.opacity = 0;
    PLAYER_STATE.isInStructure = true;
    SETTINGS.visibilityRadius = 8;
  } else {
    SETTINGS.visibilityRadius = SETTINGS.baseVisibilityRadius;
    if (isNightTime() === true) {
      filter.style.opacity = 1;
    }
  }

}

function checkTreeBefore(cell) {
  const treeMap = new Map();
  let treeCells = [];

  observedCells.forEach(cel => {
    if (cel.classList.contains('doodads') && cel.classList.contains('big')) {
      treeMap.set(`${cel.getAttribute('row')},${cel.getAttribute('col')}`, cel);
      treeCells.push(cel);
    }
  });


  treeCells.forEach(treeC => {
    const tr = treeC.querySelector('.doodad-store.big');
    tr.style.opacity = '1';
  });


  const prow = parseInt(cell.getAttribute('row'));
  const pcol = parseInt(cell.getAttribute('col'));

  const treeCell = treeMap.get(`${prow},${pcol}`);
  if (treeCell) {
    const tree = treeCell.querySelector('.doodad-store');
    tree.style.opacity = '0';
  }
}

let castShadowYes = true;

async function  checkGridCellInteraction() {
  onPlayerMove();

  const cell = CURRENT_GROUP_CELL;
  const now = Date.now();


  if (!cell.classList.contains('walked-on')) {
    await passiveHealMovement(1);
    cell.classList.add('walked-on');
  }


  if (cell.classList.contains('current-group-position') && cell.classList.contains('road-cell')) {
    playerIsOnRoad = true;
    playerIsInWater = false;
  } else if (cell.classList.contains('current-group-position') && cell.classList.contains('river-cell')) {
    playerIsOnRoad = false;
    playerIsInWater = true;
  } else if (cell.classList.contains('current-group-position') && cell.classList.contains('campfire')) {
    camp();
  } else {
    playerIsOnRoad = false;
    playerIsInWater = false;
  }

  if (cell.classList.contains('BigDoodad')) {
    //checkTreeBefore(cell);
  }

  if (cell.classList.contains('door')) {
    toggleInStructureMode();
  }

  if (cell.classList.contains('current-group-position') && cell.classList.contains('crossroad') && !cell.classList.contains('seen-crossroad')) {
    const x = parseInt(cell.getAttribute('col'));
    const y = parseInt(cell.getAttribute('row'));
    const crossroadArray = worldData[playerOverworldRow][playerOverworldCol].content[y][x].crossroad.roadIDs;

    console.log(crossroadArray);

    cell.classList.add('seen-crossroad');

    for (let i = 0 ; i < crossroadArray.length ; i++) {
      playStepAudio();
      const roadNumber = crossroadArray[i];
      const roadcells = Array.from(miniCells.filter(cell => cell.getAttribute('road-number') === roadNumber.toString()));
      roadcells.forEach(cell => {
        cell.style.visibility = `visible`;
        const index = cell.getAttribute('index');
        CURRENT_PLAYER_REGION_DATA.exploredCells.add(index);
      });
    }


  }

  //applyZoomFactor();

if (playerIsInWater) {
  SETTINGS.addedTranslateZ = 4;
} else {
  SETTINGS.addedTranslateZ = 0;
}

calculateCameraElevation();
applyNeoTransforms();




  lastExecutionTime = now; // Update the last execution time

  let nextMoveDir = '';
  let dirN = 1;
  if (cell.classList.contains('current-group-position') && cell.classList.contains('gateway')) {

    if (cell.getAttribute('towards') === 'North') {
      nextMoveDir = 'North';
      dirN = 1;
      enableMoveToNextRegionGrid(nextMoveDir, dirN, cell);
      return;
    } else if (cell.getAttribute('towards') === 'East') {
      nextMoveDir = 'East';
      dirN = 2;
      enableMoveToNextRegionGrid(nextMoveDir, dirN, cell);
      return;
    } else if (cell.getAttribute('towards') === 'South') {
      nextMoveDir = 'South';
      dirN = 3;
      enableMoveToNextRegionGrid(nextMoveDir, dirN, cell);
      return;
    } else if (cell.getAttribute('towards') === 'West') {
      nextMoveDir = 'West';
      dirN = 4;
      enableMoveToNextRegionGrid(nextMoveDir, dirN, cell);
      return;
    }
  } else {

    const moveText = document.getElementById('move-ready-message');
    if (moveText) {
      moveText.remove();
    }
  }
 
  await new Promise(resolve => setTimeout(resolve, 10)); 
  
}


function enableMoveToNextRegionGrid(nextMoveDir, dirN, moveReady, cell) {


  const moveText = document.getElementById('move-ready-message');
  if (moveText) {
    moveText.remove();
  }

  let regionArea = document.getElementById('region-grid-container');
  let move = document.createElement('button');
  move.setAttribute('id', 'move-ready-message');
  move.setAttribute('dir', `${dirN}`);

  let adjRegionLvl = 0;
  if (dirN === 1) {
    adjRegionLvl = worldData[playerOverworldRow - 1][playerOverworldCol].level;
  } else if (dirN === 2) {
    adjRegionLvl = worldData[playerOverworldRow][playerOverworldCol + 1].level
  } else if (dirN === 3) {
    adjRegionLvl = worldData[playerOverworldRow + 1][playerOverworldCol].level
  } else if (dirN === 4) {
    adjRegionLvl = worldData[playerOverworldRow][playerOverworldCol - 1].level
  }


  move.innerText = `Move ${nextMoveDir} (level: ${adjRegionLvl})`;
  regionArea.appendChild(move);


     
      move.addEventListener('click', function(event) {
        moveToNextRegionGrid(dirN);
      });






}

document.addEventListener('keydown', function(event) {
  if (event.code === 'KeyT') {
    if (actionGridDisabled === true) { return; }
    const moveButton = document.getElementById('move-ready-message');
    if (moveButton) {
      const dir = parseInt(moveButton.getAttribute('dir'));
      moveToNextRegionGrid(dir);
    } else {
      return;
    }
  }
});


function moveToNextRegionGrid(dirN) {

currentGroupDirection = dirN;

  const moveText = document.getElementById('move-ready-message');
  if (moveText) {
    moveText.remove();
  }

  togglePartyContainerDisplay('on');


  playNextRegionSound();

  const oriRow = parseInt(CURRENT_GROUP_CELL.getAttribute('row'));
  const oriCol = parseInt(CURRENT_GROUP_CELL.getAttribute('col'));

  saveRegionState(CURRENT_PLAYER_REGION_DATA);

STARTING_ROW = oriRow;
STARTING_COL = oriCol;

if (oriRow === 69) {
    STARTING_ROW = 7;
} else if (oriRow === 6) {
    STARTING_ROW = 68;
}

if (oriCol === 69) {
    STARTING_COL = 7;
} else if (oriCol === 6) {
    STARTING_COL = 68;
}

  if (oriRow === 69) {
    STARTING_ROW = 7;
  }
  if (oriRow === 6) {
    STARTING_ROW = 68;
  }
  if (oriCol === 69) {
    STARTING_COL = 7;
  }
  if (oriCol === 6) {
    STARTING_COL = 68;
  }
  

  if (dirN === 1) {
    playerOverworldRow - 1;
    teleportPlayer(playerOverworldRow - 1, playerOverworldCol);
    SETTINGS.zRotation = 0;
    } else if (dirN === 2) {
  teleportPlayer(playerOverworldRow, playerOverworldCol + 1);
  SETTINGS.zRotation = 90;
    } else if (dirN === 3) {
  teleportPlayer(playerOverworldRow + 1, playerOverworldCol);
  SETTINGS.zRotation = 180;
    } else if (dirN === 4) {
  teleportPlayer(playerOverworldRow, playerOverworldCol - 1);
  SETTINGS.zRotation = 270;
    }
    facingDirection = SETTINGS.zRotation;
    updateCompass();
    updateTargetedDirectionCell();
    applyNeoTransforms();

}





function getSettlementByName(name) {
  return settlements.find(settlement => settlement.Name === name);
}















async function populateWithRandomGroups(region, number) {
  const randomGroups = [];
  let superRegion = region.superRegion;
  for (let i = 0; i < number; i++) {
    randomGroups[i] = new Map();
    const gID = Math.floor(Math.random() * 99999) + 1;
    randomGroups[i].direction = setGroupDirection(randomGroups[i]);
    randomGroups[i].directionVariance = 10;
    // Assign the gID to the map object
    randomGroups[i].gID = gID;
    randomGroups[i].faction = region.factions;
    randomGroups[i].type = 'group';
    await generateRandomClassGroups(randomGroups[i], superRegion, region.level); // await here

  }
  
  currentOtherGroups = [...randomGroups];
  return currentOtherGroups;
}

async function generateRandomClassGroups(randomGroup, superRegion, level) {
  const adventurerFoesGroupSize = Math.floor(Math.random() * 6) + 1;

  const adventurersBatch = [];

  for (const adventurer of adventurerMap.values()) {
    const adventurer2 = { ...adventurer};
    adventurersBatch.push(adventurer2);
  }

  const randomAdventurers = await pickRandomEnemiesAdventurers(adventurersBatch, adventurerFoesGroupSize, superRegion);

      const mapGridAdvBatch = new Map();

      for (const adventurer of randomAdventurers) {
        if (adventurer.Title === "Kharash") {
          randomizeAdvCulture(adventurer);
        }
        randomAdventurers[0].isGroupLeader = true;
        await addAdventurerToBatch(adventurer, mapGridAdvBatch, level);
      }

      determineGeneratedGroupClassData(randomAdventurers);
      const enemyGroupClassText = generateCustomGroupClass(mapGridAdvBatch);

      randomGroup.set(enemyGroupClassText, mapGridAdvBatch);
      randomGroup.attributes = calculateOtherGroupAttributes(mapGridAdvBatch);
      const randomStartEntropy = Math.floor(Math.random() * randomGroup.attributes.size * 2) + 1;
      randomGroup.attributes.entropy += randomStartEntropy;

      

      const affixes = enemyGroupClassText.split(/\s+/).map(s => s.trim()).filter(Boolean);
      let groupAffixe = '';
      if (enemyGroupClassText != 'Lone Adventurer') {
        if (affixes.length === 1) {
          groupAffixe = affixes[0];
        } else {
          groupAffixe = affixes[1];
        }
      } else {
        groupAffixe = 'Lone Adventurer';
      }

      randomGroup.affix = groupAffixe;

      randomGroup.combatStats = getGroupCurrentAttack(mapGridAdvBatch);

      randomGroup.currentLife = 0;
      for (const adventurer of mapGridAdvBatch.values()) {
      randomGroup.currentLife += Number(adventurer.Life);
      }
      randomGroup.totalLife = randomGroup.currentLife;

      return Promise.resolve(randomGroup);

}


function setGroupDirection(group) {

  const ran = Math.floor(Math.random() * 4) + 1;
  let direction = "North";
  if (ran === 1)  {
    direction = "North";
  } else if (ran === 2) {
    direction = "West";
  } else if (ran === 3) {
    direction = "East";
  } else if (ran === 4) {
    direction = "South";
  }
 

  console.log('GROUP DIRECTION', group);

  return direction;
}



async function addAdventurerToBatch(adventurer, mapGridAdvBatch, level) {
  if (adventurer) {
    const newAdventurer = { ...adventurer };
    newAdventurer.Affixes = [];

    do {
      newAdventurer.uID = Math.floor(Math.random() * 99999) + 1;
      
    } while (mapGridAdvBatch.has(newAdventurer.uID));

    const newAdvWithAffixes = { ... await generateNewAdventurer(adventurer) };
    const ranLevelEffector = Math.floor(Math.random() * 10) - 5;
    for (let i = 0 ; i < (level - 1) + ranLevelEffector ; i++) {
      levelUpAdventurer(newAdvWithAffixes);
    }
  
    mapGridAdvBatch.set(newAdvWithAffixes.uID, newAdvWithAffixes);
  }
}




function determineGeneratedGroupClassData(randomAdventurers) {
  totalEnemyLife += calculateTotalEnemyLife(randomAdventurers);
  totalSpeed += calculateTotalEnemySpeed(randomAdventurers);
  const enemyDamage = calculateTotalEnemyAttack(randomAdventurers);
  const enemyResistances = calculateEnemyGroupResistances(randomAdventurers);
  const enemyHandResist = enemyResistances.groupHandResistance;
  const enemyRangedResist = enemyResistances.groupRangedResistance;

  const enemyGroupUnaDmg = enemyDamage.UnarmedDamage;
  const enemyGroupMelDmg = enemyDamage.MeleeDamage;
  const enemyGroupArcDmg = enemyDamage.ArcheryDamage;
  const enemyGroupGunDmg = enemyDamage.GunpowderDamage;
  const enemyGroupTotDmg = enemyDamage.totalDamage;
}




function addOtherGroupTooltipAgain() {
  const otherGroupCells = document.querySelectorAll('#region-grid-table .other-group');
  
  otherGroupCells.forEach(cell => {
      const gid = parseInt(cell.getAttribute('gid')); // Parse gid as a number
      
      // Find the group map with matching gID in currentOtherGroups
      const group = currentOtherGroups.find(map => map.gID === gid);
      
      if (group) {
          addOtherGroupTooltip(cell, group);
          
      } else {
        
      }
  });


}



function otherGroupMovements() {
  // Select all cells with the 'other-group' class
  const otherGroupCells = document.querySelectorAll('#region-grid-table td.other-group');

  // Iterate over each cell with the 'other-group' class
  otherGroupCells.forEach(cell => {
    // 50% chance to move or stay
    if (Math.random() < 0.5) {
      // Get the row and column index of the current cell
      const rowIndex = cell.parentElement.rowIndex;
      const cellIndex = cell.cellIndex;

      // Array to store available adjacent cells
      const adjacentCells = [];

      // Check adjacent cells (up, down, left, right)
      const directions = [
        { row: rowIndex - 1, col: cellIndex }, // Up
        { row: rowIndex + 1, col: cellIndex }, // Down
        { row: rowIndex, col: cellIndex - 1 }, // Left
        { row: rowIndex, col: cellIndex + 1 }  // Right
      ];

      directions.forEach(direction => {
        const row = direction.row;
        const col = direction.col;

        // Check if the adjacent cell exists and doesn't have 'settlement' or 'impassable' class
        const adjacentCell = document.querySelector(`#region-grid-table tr:nth-child(${row + 1}) td:nth-child(${col + 1})`);
        if (adjacentCell && !adjacentCell.classList.contains('settlement-cell') && !adjacentCell.classList.contains('impassable') && !adjacentCell.classList.contains('other-group')) {
          adjacentCells.push(adjacentCell);
        }
      });

      if (adjacentCells.length > 0) {
        // Pick a random adjacent cell
        const randomIndex = Math.floor(Math.random() * adjacentCells.length);
        const randomAdjacentCell = adjacentCells[randomIndex];

        // Move the 'other-group' class and gID attribute to the random adjacent cell
        randomAdjacentCell.classList.add('other-group');
        randomAdjacentCell.setAttribute('gID', cell.getAttribute('gID'));

        // Remove the 'other-group' class and gID attribute from the original cell
        cell.classList.remove('other-group');
        cell.removeAttribute('gID');
      }
    }
  });

  // Ensure tooltips are re-added after movement
  addOtherGroupTooltipAgain();
}



async function curveTableRows() {
  return new Promise(resolve => {
    const playerRow = document.querySelector('.current-group-position').parentNode; // Find the row containing the player
    const table = document.getElementById('region-grid-table');
    const playerRowIndex = parseInt(CURRENT_GROUP_CELL.getAttribute('row'));
    // Get all rows of the table
    let rows = [];
    const rowsElement = table.querySelectorAll('.game-cell');

    rowsElement.forEach(row => {
      row.style.transform = 'none';
      const number = parseInt(row.getAttribute('game-row'));
      if (number === playerRowIndex) {
        rows.push(row);
      }
    });
    // Find the index of the player row
    

// Define the initial rotation value
let rotationIncrement = 3;

// Loop through each row above the player row
for (let i = playerRowIndex - 2; i >= 0; i--) {
    // Calculate the transformation values for this row
    const rotation = rotationIncrement;

    // Apply the transformation to the row
    if (i === playerRowIndex - 2) {
        rows[i].style.transform = `rotateX(${rotation}deg) translateZ(-3px)`;
    } else if (i === playerRowIndex - 3) {
        rows[i].style.transform = `rotateX(${rotation}deg) translateZ(-11px)`;
    } else if (i === playerRowIndex - 4) {
        rows[i].style.transform = `rotateX(${rotation}deg) translateZ(-24px)`;
    } else if (i === playerRowIndex - 5) {
        rows[i].style.transform = `rotateX(${rotation}deg) translateZ(-43px)`;
    } else if (i === playerRowIndex - 6) {
        rows[i].style.transform = `rotateX(${rotation}deg) translateZ(-67px)`;
    } else if (i === playerRowIndex - 7) {
        rows[i].style.transform = `rotateX(${rotation}deg) translateZ(-96px)`;
    } else if (i === playerRowIndex - 8) {
        rows[i].style.transform = `rotateX(${rotation}deg) translateZ(-130px)`;
    } else if (i === playerRowIndex - 9) {
        rows[i].style.transform = `rotateX(${rotation}deg) translateZ(-169px)`;
    } else if (i === playerRowIndex - 10) {
        rows[i].style.transform = `rotateX(${rotation}deg) translateZ(-213px)`;
    } else if (i === playerRowIndex - 11) {
        rows[i].style.transform = `rotateX(${rotation}deg) translateZ(-262px)`;
    } else if (i === playerRowIndex - 12) {
        rows[i].style.transform = `rotateX(${rotation}deg) translateZ(-316px)`;
    } else {
        rows[i].style.transform = `rotateX(${rotation}deg)`;
    }

    // Increment the rotation value for the next row
    rotationIncrement += 3;

}

    resolve(); // Resolve the promise once transformations are applied
  });
}


























function updateDisplayNumberOfRegionsVisited() {
  const regionCountElement = document.getElementById('region-count');
  regionCountElement.textContent = EXPLORED_REGIONS_NUMBER;
  }






function saveRegionState(region) {
  // Serialize the table's inner HTML or another representation of the state


  const regionState = JSON.stringify(region);
  
  // Store the state in localStorage
  localStorage.setItem(`region-${region.index}`, regionState);

  const explorationProgress = (Array.from(region.exploredCells));

  localStorage.setItem(`region-${region.index}-exploration`, explorationProgress);

  EXPLORED_REGIONS_NUMBER++;

}

async function loadRegionState(regionIndex, region, row, col) {

  // Retrieve the state from localStorage
  const regionState = localStorage.getItem(`region-${regionIndex}`);

  if (regionState) {
    region.explored = true;
    region = regionState;
  } else {
    await generateContentForRegion(region, row, col);
  }
}





async function loadSavedMap(index) {
  const url = `/JSONData/maps/${index}.json`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.warn(`No saved map found for index ${index}. HTTP status: ${response.status}`);
      return null;
    }

    const data = await response.json();

    // Convert `exploredCells` to a Set, or initialize it if undefined
    const explorationSate = localStorage.getItem(`region-${data.index}-exploration`);
    if (explorationSate) {
      const explorationProgress = explorationSate.split(',').map(word => word.trim());
      data.exploredCells = new Set(Array.from(explorationProgress));
    } else {
      data.exploredCells = new Set(data.exploredCells || []);
    }


    console.log('Saved map loaded:', data);
    return data;

  } catch (error) {
    console.error(`Failed to load saved map for index ${index}:`, error);
    return null;
  }
}








function changeTableBorders(dirN) {

let oldDir = '';
let newDir = '';
      if (dirN === 1) {
        oldDir = 'north';
        newDir = 'south';

      }
      if (dirN === 2) {
        oldDir = 'east';
        newDir = 'west';

      }
      if (dirN === 3) {
        oldDir = 'south';
        newDir = 'north';

      }
      if (dirN === 4) {
        oldDir = 'west';
        newDir = 'east';

      }


  const cells = document.querySelectorAll(`#region-grid-table .${oldDir}`);
  
  cells.forEach(cell => {
    cell.classList.remove(`${oldDir}`);
    cell.classList.add(`${newDir}`);
  });



}













function simulateMouseMovementLeft(px = 5) {
  // Get the current mouse position (for simulation purposes)
  let currentX = window.innerWidth / 2; // Assuming the mouse starts from the center
  let currentY = window.innerHeight / 2;

  // Calculate the new position after moving 5 pixels to the left
  const newX = currentX - px;

  // Create and dispatch a mousemove event
  const mouseMoveEvent = new MouseEvent('mousemove', {
      clientX: newX,
      clientY: currentY,
      bubbles: true,
      cancelable: true,
      view: window
  });

  // Dispatch the event on the document
  document.dispatchEvent(mouseMoveEvent);

  console.log(`Mouse moved to: X=${newX}, Y=${currentY}`);
}



function interactWithCell(event, group) {
let cell = event.target;
  //const x = cell.offsetLeft;
  //const y = cell.offsetTop;
  const x = event.clientX;
  const y = event.clientY;
    let gid = parseInt(cell.getAttribute('gid')); // Parse gid as a number


    displayOtherGroupInteraction(group, gid, x, y);
    console.log('ss', group);
}

function displayOtherGroupInteraction(group, gid, x, y) {
  clickButtonSound();
  let interactionWindow = createInteractionWindow(x, y);
  document.body.appendChild(interactionWindow);
  removeAnyToolTip();

  const enemyGroupTitle = group.keys().next().value;
  interactionWindow.querySelector('.header').textContent = `What to do with ${enemyGroupTitle.toString()}?`;

  let attack = document.createElement('button');
  attack.textContent = 'Attack!';

  let trade = document.createElement('button');
  trade.textContent = 'Trade';

  let showIntents = document.createElement('button');
  showIntents.textContent = 'Show Intents';

  let scare = document.createElement('button');
  scare.textContent = 'Scare';

  let inspect = document.createElement('button');
  inspect.textContent = 'Inspect';

  interactionWindow.querySelector('.content').appendChild(attack);
  interactionWindow.querySelector('.content').appendChild(trade);
  interactionWindow.querySelector('.content').appendChild(showIntents);
  interactionWindow.querySelector('.content').appendChild(scare);
  interactionWindow.querySelector('.content').appendChild(inspect);

  attack.addEventListener('click', function(event) {
    removeInteractionWindows();
    createCombatZone(group, gid);
  });

  inspect.addEventListener('click', function(event) {
    removeInteractionWindows();
    displayThisGroupAttributes(event, group);
  });

}







function createInteractionWindow(x, y) {
  removeInteractionWindows();
  let window = document.createElement('div');
  window.classList.add('interaction-window');

  let header = document.createElement('div');
  header.classList.add('header');

  let content = document.createElement('div');
  content.classList.add('content');

  let bottom = document.createElement('div');
  bottom.classList.add('bottom');

  let exit = document.createElement('button');
  exit.classList.add('exit');
  exit.textContent = 'Close'

  bottom.appendChild(exit);

  exit.addEventListener('click', function(event) {
    window.remove();
  });

  window.appendChild(header);
  window.appendChild(content);
  window.appendChild(bottom);

  return window;
}


function removeInteractionWindows() {
  let exWin = document.querySelectorAll('.interaction-window');
  if (exWin) {
    exWin.forEach(win => {
      win.remove();
    });
  }
}



function displayThisGroupAttributes(event, group) {
  console.log('this group attributes', group.attributes);

  let exWin = document.getElementById('other-group-sheet-container');
  if (exWin) {
      exWin.remove();
  }

  let sheet = document.createElement('div');
  sheet.setAttribute('id', 'other-group-sheet-container');
  sheet.classList.add('infobox');

  fetch('/Templates/group-sheet.html')
    .then(response => response.text())
    .then(template => {

      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = template;
      const elements = tempContainer.children;

      for (const element of elements) {
        sheet.appendChild(element);
      }
      document.body.appendChild(sheet);

      // Now that the template is appended, select and update the attribute elements
      let attributeElements = document.querySelectorAll('#other-group-sheet-container .attribute-value');

      attributeElements.forEach(element => {
        let attributeName = element.id;

        if (group.attributes.hasOwnProperty(attributeName)) {
            element.textContent = group.attributes[attributeName];
        } else if (group.attributes.primaryAttributes && group.attributes.primaryAttributes.hasOwnProperty(attributeName)) {
            element.textContent = group.attributes.primaryAttributes[attributeName];
        } else if (group.combatStats.hasOwnProperty(attributeName)) {
          element.textContent = group.combatStats[attributeName];
        }

      });

      
      let header = document.createElement('div');
      header.classList.add('infobox-header');
      const enemyGroupTitle = group.keys().next().value;
      header.textContent = `Attributes of ${enemyGroupTitle}`;

      sheet.prepend(header);
      enableDragAndDropWindow(header);
      addCloseButton(header);

      let thisGroupAdventurerBox = createThisGroupAdventurerBox(group);
      
      sheet.appendChild(thisGroupAdventurerBox);
      enableGroupSheetAttributeTooltips(sheet);


    });

    //updateTooltipPosition(event, sheet);
}


function createThisGroupAdventurerBox(group) {

  console.log('this group: ', group);

  let advsBox = document.createElement('div');
  advsBox.classList.add('advsBox');



    let adventurersMap;

    for (const [key, value] of group.entries()) {
        if (value instanceof Map && value.size > 0) {
            adventurersMap = value;
            currentActiveEnemyGroup = adventurersMap;
            break;
        }
    }

    if (!adventurersMap) {
        console.error('No adventurers found in the group.');
        return;
    }

    let thisGroupAdventurers = Array.from(adventurersMap.values()); // Convert to array for easier iteration

    for (const adventurer of thisGroupAdventurers) {
      const slot = display(adventurer);
      advsBox.appendChild(slot);
    }

        function display(adventurer) {
            const advSprite = document.createElement('div');
            advSprite.setAttribute('uID', `${adventurer.uID}`);
            advSprite.classList.add('other-group-adventurer');
            advSprite.classList.add('item');
            advSprite.style.backgroundImage = `url('/Art/Adventurers/${adventurer.Title}.png')`;
            advSprite.textContent = adventurer.uID;

            if (adventurer.Rarity === "Legendary") {
                advSprite.classList.add("legendary-adv-slot");
              }
              if (adventurer.Rarity === "Rare") {
                advSprite.classList.add("rare-adv-slot");
              }
              if (adventurer.Rarity === "Normal") {
                advSprite.classList.add("normal-adv-slot");
              }
              if (adventurer.Rarity === "Uncommon") {
                advSprite.classList.add("uncommon-adv-slot");
              }

              if (adventurer.isGroupLeader === true) {
                groupLeaderMark = document.createElement('div');
                groupLeaderMark.className = 'group-leader-mark';
                advSprite.appendChild(groupLeaderMark);
              }

            advSprite.addEventListener('mouseover', showTooltip);
            advSprite.addEventListener('mouseover', showTooltip);

            return advSprite;
        }

    return advsBox;

}
































































let isDraggingMini = false; // Track if mouse is held down




function movePlayerCameraOnMap(cell) {


  const newGroupCell = cell;

  let currentCell = CURRENT_GROUP_CELL;

  if (!currentCell) {
    currentCell = CURRENT_GROUP_CELL;
  }

  const currentRow = parseInt(currentCell.getAttribute('row'));
  const currentCol = parseInt(currentCell.getAttribute('col'));


  const targetRow = parseInt(newGroupCell.getAttribute('row'));
  const targetCol = parseInt(newGroupCell.getAttribute('col'));


  playStepSound();

  CURRENT_PLAYER_REGION_DATA.content[currentRow][currentCol].isPlayer = false;
  CURRENT_PLAYER_REGION_DATA.content[targetRow][targetCol].isPlayer = true;

  console.log(CURRENT_PLAYER_REGION_DATA.content[targetRow][targetCol]);

  const groupStore = document.querySelector('.our-group');
  newGroupCell.appendChild(groupStore);
  updateCurrentGroupPosition(newGroupCell);
  CURRENT_GROUP_CELL = newGroupCell;


}













let STARTING_COL = 25;
let STARTING_ROW = 25;

const keyState = {};
let moveRequest; // To track the animation frame request

let listenersRegionGridAdded = false;
let moveStep = 5;
let isPlayingStepSound = false;
let currentGroupDirection = 1;
// Function to initialize the playerCamera and set its position

function createNewOwnGroupDisplay() {

  const ourCell = observedCells.find(cell => 
    cell.classList.contains('current-group-position')
  );

  const exGroupDisp = ourCell.querySelector('.our-group');
  if (exGroupDisp) {
    exGroupDisp.remove();
  }
 
  ourCell.appendChild(createOtherGroupBox());
}

let zKeyPressed = false;
let animationFrameId = null;

async function initiatePlayerCamera(cell) {
 
  createNeoRegionZone();
  let megaWrapper = document.getElementById('mega-wrapper');

  adventurerPositions = [];
  observedCells = [];

  let playerCameraLeft;
  let playerCameraTop;

  let startingCell = cachedGridCells.find(start =>
    parseInt(start.getAttribute('row')) === STARTING_ROW &&
    parseInt(start.getAttribute('col')) === STARTING_COL
  );

  PLAYER_STATE.x = STARTING_COL;
  PLAYER_STATE.y = STARTING_ROW;

  const fenetre = document.getElementById('neo-region');
  const inner = fenetre.querySelector('#inner-neo');

  
  if (startingCell.classList.contains('impassable')) {
    startingCell.classList.remove('impassable');
    startingCell.querySelector('.impa-store')?.remove();
  }

if (startingCell) {
  CURRENT_GROUP_CELL = startingCell;
  CURRENT_GROUP_CELL.classList.add('current-group-position');
    const targetX = startingCell.offsetLeft + startingCell.offsetWidth / 2; // Center x-coordinate
    const targetY = startingCell.offsetTop + startingCell.offsetHeight / 2; // Center y-coordinate
    playerCameraLeft = targetX;
    playerCameraTop = targetY;
    inner.appendChild(CURRENT_GROUP_CELL);
    throttledObserveVisibleCells();
    updateCurrentGroupPosition(CURRENT_GROUP_CELL);
} else {
  startingCell = cell;
  CURRENT_GROUP_CELL = startingCell;
  CURRENT_GROUP_CELL.classList.add('current-group-position');
  const targetX = startingCell.offsetLeft + startingCell.offsetWidth / 2; // Center x-coordinate
  const targetY = startingCell.offsetTop + startingCell.offsetHeight / 2; // Center y-coordinate
  playerCameraLeft = targetX;
  playerCameraTop = targetY;
  inner.appendChild(CURRENT_GROUP_CELL);
  throttledObserveVisibleCells();
  
  updateCurrentGroupPosition(CURRENT_GROUP_CELL);
  }

  observeVisibleObjectsFOV();
  CURRENT_GROUP_CELL.appendChild(createOtherGroupBox());

   // Add event listeners only if they haven't been added already
  if (listenersRegionGridAdded === false) {

    const inner = document.getElementById('inner-neo');
    document.body.addEventListener("keydown", function(event) {
      if (event.key === "+") {
        SETTINGS.zoomFactor += 0.5;
      } else if (event.key === "-") {
        SETTINGS.zoomFactor -= 0.5;
      }
      inner.style.scale = `${SETTINGS.zoomFactor}`;
      applyNeoTransforms();
    });

    document.addEventListener('keydown', async (event) => {
      if (!actionGridDisabled) {
        document.getElementById('gather-window')?.remove();
        if (SETTINGS.gridMovement) await throttledMovementByCell(event);
      }
    });
      document.addEventListener('keyup', onKeyUp);

      document.addEventListener('keydown', (event) => {
        if (event.code === 'KeyZ' && !zKeyPressed) {
          event.preventDefault();
          zKeyPressed = true;
          startCameraAnimation();
        }
      });
      
      // Stop the animation when Z is released
      document.addEventListener('keyup', (event) => {
        if (event.code === 'KeyZ') {
          zKeyPressed = false;
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
          }
        }
      });


    const tableContainer = document.getElementById('table-container');

    //megaWrapper.addEventListener('wheel', wheelEventEngine);

    document.addEventListener('keydown', function(event) {
      if (event.code === 'KeyG') {
        event.preventDefault();
        toggleFirstPerson();
      }
    });
    megaWrapper.addEventListener('mousemove', updateCameraRotation);

    megaWrapper.addEventListener('touchmove', updateCameraRotation);

    document.addEventListener('keydown', (event) => {
      if (event.code === 'Space') {
        event.preventDefault();
        togglePointerLock();
      }
    });
  

    document.addEventListener('mousedown', function(event) {
      if (event.button === 0) {
          const exMenu = document.getElementById('rightclick-menu');
          if (exMenu && !exMenu.contains(event.target)) {
              removeAnyToolTip();
              exMenu.remove();
          }
      }
    });

    document.addEventListener('keydown', function(event) {
      if (event.code === 'KeyP') {
        event.preventDefault();
        toggleRetroFilters();
      }
    });

    document.addEventListener('keydown', function(event) {
      if (event.code === 'KeyC') {
        event.preventDefault();
        toggleSneakMode();
      }
    });

    document.addEventListener('keydown', function(event) {
      if (event.code === 'KeyX') {
        event.preventDefault();
        toggleSearchBox();
      }
    });

    document.addEventListener('keydown', function(event) {
      if (event.code === 'KeyQ') {
        event.preventDefault();
        toggleScreenshotDisplay();
      }
    });

    document.addEventListener('keydown', function(event) {
      if (event.code === 'KeyV') {
        event.preventDefault();
        toggleSkillTree();
      }
    });

    document.addEventListener('keydown', function(event) {
      if (event.code === 'KeyE') {
        event.preventDefault();
        closeFirstInfoBoxWindow();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.code  === 'KeyR') {
        cycleTargetEntitySprite(1); // Move down (next entity)
      }
    });
    
    document.addEventListener('keydown', async function(event) {
      if (event.code === 'KeyF') {
        if (actionGridDisabled != true) {
          await interactWithObject();
        }
      }
    });

    let tableGrid = document.getElementById('region-grid-container');
    tableGrid.addEventListener('contextmenu', function(event) {
      //event.preventDefault();
    });

    document.addEventListener('keydown', (event) => {
      if (event.code === 'Space') { event.preventDefault(); }
      if (event.altKey) {
        event.preventDefault();
        toggleDoodads('hidden');
      }
    });
    
    document.addEventListener('keyup', (event) => {
      if (event.code === 'AltLeft' || event.code === 'AltRight') {
        toggleDoodads('visible');
      }
    });

    document.addEventListener("wheel", (event) => {
      event.preventDefault();
      wheelScrollActiveAdventurers(event);
    });

    document.addEventListener("mousedown", (event) => {

      if (event.button != 1) return;
      SETTINGS.interface = !SETTINGS.interface;
      
      if (SETTINGS.interface === false) {
        megaWrapper.style.zIndex = '4';
      } else {
        megaWrapper.style.zIndex = '0';
      }
    });
    
    listenersRegionGridAdded = true; // Mark that listeners have been added

  }

  SETTINGS.firstPerson = false;
  toggleFirstPerson();
  applyNeoTransforms();
  createDirectionLine();
  createEntityOvertip();
  createOtherGroupBox();
  createSkybox(inner);
  entityObserver.setObservedCells(observedCells); // Provide the observed cells initially



  const exCam = document.getElementById('player-camera');
  if (exCam) exCam.remove();

  const playerCamera = document.createElement('div');
  playerCamera.id = 'player-camera';

  playerCamera.dataset.translateX = 245;
  playerCamera.dataset.translateY = 245;

  inner.appendChild(playerCamera);



}





function createSkybox(inner) {

  const exSkyBox = document.getElementById('skybox');
  if (exSkyBox) exSkyBox.remove();

const impa = document.createElement('div');
impa.id = 'skybox';

const top = document.createElement('div');
top.id = 'top';
top.style.backgroundImage = `url('/Art/Skyboxes/${CURRENT_PLAYER_REGION_DATA.vegetation}/up.jpg')`;

const left = document.createElement('div');
left.id = 'left';
left.style.backgroundImage = `url('/Art/Skyboxes/${CURRENT_PLAYER_REGION_DATA.vegetation}/left.jpg')`;

const right = document.createElement('div');
right.id = 'right';
right.style.backgroundImage = `url('/Art/Skyboxes/${CURRENT_PLAYER_REGION_DATA.vegetation}/right.jpg')`;

const front = document.createElement('div');
front.id = 'front';
front.style.backgroundImage = `url('/Art/Skyboxes/${CURRENT_PLAYER_REGION_DATA.vegetation}/front.jpg')`;

const back = document.createElement('div');
back.id = 'back';
back.style.backgroundImage = `url('/Art/Skyboxes/${CURRENT_PLAYER_REGION_DATA.vegetation}/back.jpg')`;

const bottom = document.createElement('div');
bottom.id = 'back';

impa.appendChild(top);
impa.appendChild(left);
impa.appendChild(right);
impa.appendChild(front);
impa.appendChild(back);
impa.appendChild(bottom);

inner.appendChild(impa);

}



function toggleDoodads(visibility) {
  observedCells.forEach(cell => {
    if (cell.classList.contains('BigDoodad')) {
      cell.querySelector('.doodad-store').style.visibility = visibility;
      cell.querySelector('.shadow').style.visibility = visibility;
    }
    if (cell.classList.contains('floor')) {
      cell.querySelector('.ceiling').style.visibility = visibility;
    }
  });
}




function updateCardboardRotation() {
  const cardboards = observedCells
  .map(cell => Array.from(cell.querySelectorAll('.cardboard')))
  .flat();

if (!cardboards.length) return;
  cardboards.forEach(board => {
    board.style.setProperty(
      "--rotationZ",
      `${SETTINGS.zRotation}deg`
    );

    board.style.setProperty(
      "--rotationX",
      `${Math.max(0, 55 - (SETTINGS.angle - 20) * (55 / (90 - 20)))}deg` );
  });
}




function onKeyUp(event) {

  if (pressedKeys.has(event.keyCode)) {
    pressedKeys.delete(event.keyCode);
  }

  keyState[event.key] = false;

  // Stop movement if no keys are pressed
  if (!keyState['w'] && !keyState['s'] && !keyState['a'] && !keyState['d']) {
    cancelAnimationFrame(moveRequest);
    moveRequest = null;
  }
}


function toggleFirstPerson(event) {

  const group = CURRENT_GROUP_CELL.querySelector('.our-group');

  SETTINGS.firstPerson = !SETTINGS.firstPerson;

  if (SETTINGS.firstPerson === true) {
    SETTINGS.angle = 90;
    SETTINGS.perspectiveGrid = 20;
    group.style.opacity = 0;

    SETTINGS.zoomFactor = 35;
    SETTINGS.translateZ = 8;

  } else {
    SETTINGS.angle = 35;
    SETTINGS.perspectiveGrid = 220;
    SETTINGS.zoomFactor = 3;
    group.style.opacity = 1;
    SETTINGS.translateX = 0;
    SETTINGS.translateY = 0;
    SETTINGS.translateZ = 0;
  }

  applyNeoTransforms();
}







let shadowAngleDiviser = 9;


async function castShadows() {
    const playerCell = CURRENT_GROUP_CELL;
    const playerRow = parseInt(playerCell.getAttribute('row'));
    const playerCol = parseInt(playerCell.getAttribute('col'));

    // Convert observedCells into a grid lookup for fast access
    let grid = new Map();
    observedCells.forEach(cell => {
        const row = parseInt(cell.getAttribute('row'));
        const col = parseInt(cell.getAttribute('col'));
        grid.set(`${row},${col}`, cell);
    });

    // Get all impassable cells
    const impassableCells = observedCells.filter(cell => cell.classList.contains('blocksvision'));

    // Set up fog for all observed cells
    observedCells.forEach(cell => {
        if (PLAYER_STATE.isInStructure === true) {
            if (!cell.classList.contains('structure')) {
                cell.classList.add('fogged');
                cell.style.visibility = 'hidden';
                return;
            }
        } else {
            cell.classList.remove('fogged');
            cell.style.visibility = 'visible';
        }
    });

    // Function to check if a line of sight exists (using Bresenham’s algorithm)
    function isBlocked(targetRow, targetCol) {
        let x0 = playerCol, y0 = playerRow;
        let x1 = targetCol, y1 = targetRow;

        let dx = Math.abs(x1 - x0);
        let dy = Math.abs(y1 - y0);
        let sx = (x0 < x1) ? 1 : -1;
        let sy = (y0 < y1) ? 1 : -1;
        let err = dx - dy;

        while (x0 !== x1 || y0 !== y1) {
            if (x0 !== playerCol || y0 !== playerRow) {
                let key = `${y0},${x0}`;
                if (grid.has(key) && grid.get(key).classList.contains('blocksvision')) {
                    return true; // A blocking cell is in the way
                }
            }
            let e2 = 2 * err;
            if (e2 > -dy) { err -= dy; x0 += sx; }
            if (e2 < dx) { err += dx; y0 += sy; }
        }
        return false;
    }

    // Loop through all observed cells and determine visibility
    observedCells.forEach(targetCell => {
        const targetRow = parseInt(targetCell.getAttribute('row'));
        const targetCol = parseInt(targetCell.getAttribute('col'));

        if (targetRow === playerRow && targetCol === playerCol) return;

        if (isBlocked(targetRow, targetCol)) {
            targetCell.classList.add('fogged');
        }
    });

    // Ensure first-row impassable cells remain visible
    impassableCells.forEach(impassableCell => {
        const row = parseInt(impassableCell.getAttribute('row'));
        const col = parseInt(impassableCell.getAttribute('col'));

        let adjacentCells = [
            grid.get(`${row - 1},${col}`),
            grid.get(`${row + 1},${col}`),
            grid.get(`${row},${col - 1}`),
            grid.get(`${row},${col + 1}`)
        ].filter(cell => cell);

        if (adjacentCells.some(cell => !cell.classList.contains('blocksvision') && !cell.classList.contains('fogged'))) {
            impassableCell.classList.remove('fogged');
        }
    });

    await new Promise(resolve => setTimeout(resolve, 10));
}



































function playStepSound() {
  if (!isPlayingStepSound) {
    isPlayingStepSound = true;
    
    if (playerIsInWater === false) {
      playStep2Audio();
    } else {
      playStepWaterAudio();
    }
    if (playerIsOnRoad === true) {
      playStepConcreteAudio();
      console.log("playerIsOnRoad:", playerIsOnRoad);
    }

    isPlayingStepSound = false;

  }
}




function getVisibleImpassableElements(playerCamera) {
  const regionGridTable = document.getElementById('region-grid-table');
  const cameraRect = playerCamera.getBoundingClientRect();
  const cameraX = cameraRect.left + cameraRect.width / 2;
  const cameraY = cameraRect.top + cameraRect.height / 2;
  const radius = 200; // 200px radius from the camera

  // Select all potentially nearby .impassable and .building elements


  

  // Filter only the elements within the 200px radius
  const nearbyElements = observedCells.filter(element => {
    if (element.classList.contains('impassable')) {
      const elementRect = element.getBoundingClientRect();
      const elementX = elementRect.left + elementRect.width / 2;
      const elementY = elementRect.top + elementRect.height / 2;
  
      // Calculate the distance between the playerCamera and the element
      const distance = Math.sqrt(
        Math.pow(elementX - cameraX, 2) + Math.pow(elementY - cameraY, 2)
      );
  
      // Check if the element is within the radius
      return distance <= radius;
    }

  });

  return nearbyElements;
}






// Function to update the playerCamera's position
function updateCameraPosition(playerCamera, left, top, dir, table) {
  const regionGridTable = document.getElementById('region-grid-table');
  const impassableElements = getVisibleImpassableElements(playerCamera);

  // Define the radius of the playerCamera
  const radius = playerCamera.clientWidth / 2 + 10;

  // Calculate the intended new position of playerCamera (circle center)
  let playerCameraCenter = {
    x: left + radius,
    y: top + radius
  };

  let collisionDetected = false;

  // Check for collisions with each impassable element
  for (let impassable of impassableElements) {
    const impassableRect = {
      left: impassable.offsetLeft + 5,
      top: impassable.offsetTop + 5,
      right: impassable.offsetLeft + impassable.clientWidth + 5,
      bottom: impassable.offsetTop + impassable.clientHeight + 6
    };

    // Calculate the closest point on the impassable element to the playerCamera's center
    const closestPoint = {
      x: Math.max(impassableRect.left + 10, Math.min(playerCameraCenter.x, impassableRect.right)),
      y: Math.max(impassableRect.top + 10, Math.min(playerCameraCenter.y, impassableRect.bottom))
    };

    // Calculate the distance between the playerCamera's center and the closest point
    const distanceX = playerCameraCenter.x - closestPoint.x;
    const distanceY = playerCameraCenter.y - closestPoint.y;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    let elevation = Number(impassable.getAttribute('elevation')) * -1;
    // Check if the distance is less than the radius (i.e., a collision occurs)

      if (distance < radius && elevation < ownElevation) {
        collisionDetected = true;

        // Push the playerCamera back along the collision normal vector
        const overlap = radius - distance;
        const normalX = distanceX / distance;
        const normalY = distanceY / distance;
  
        playerCameraCenter.x += normalX * overlap;
        playerCameraCenter.y += normalY * overlap;


  
        // Update left and top based on the adjusted center
        left = playerCameraCenter.x - radius;
        top = playerCameraCenter.y - radius;
 

      } else {

  
        collisionDetected = false;
        
        playerCamera.style.left = `${left}px`;
        playerCamera.style.top = `${top}px`;
    
        playerCameraCurrentLeft = left;
        playerCameraCurrentTop = top;

      }




      
  }

  

  // If no collision is detected, or collision adjustments have been made, update the playerCamera's position
  if (!collisionDetected || collisionDetected) {
    playerCamera.style.left = `${left}px`;
    playerCamera.style.top = `${top}px`;

    playerCameraCurrentLeft = left;
    playerCameraCurrentTop = top;

    //displaceGroupAdventurers(table, left, top, dir);

  }

}










let accumulatedRotateZ = 0;
let accumulatedRotateX = 0;
let accumulatedRotateY = 0;
let accumulatedRotate3d = 90;






function calculateCameraElevation(translateZ) {
  const minRotate = 40;
  const maxRotate = 140;
  const minZ = -2;
  const maxZ = -16;
  SETTINGS.translateZ = 8;
}

function updateCompass() {
  const compass = document.getElementById("compass-container");
  const angle = SETTINGS.zRotation; // Player's view direction in degrees
  const normalizedAngle = ((angle % 360) + 360) % 360;
  const backgroundX = -(normalizedAngle * (800 / 360));
  compass.style.backgroundPosition = `${backgroundX}px 0`;
}

function updateCameraRotation(event) {

    if (!document.pointerLockElement || PLAYER_STATE.isInMenu === true) {
      return;
    }
    
    const inner = document.getElementById('inner-neo');
    const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
    const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
  
    accumulatedRotateZ += -(movementX / window.innerWidth) * 180;
    accumulatedRotate3d += -(movementY / window.innerHeight) * 60;
    accumulatedRotate3d = Math.max(10, Math.min(180, accumulatedRotate3d));

    calculateCameraElevation();

    SETTINGS.zRotation = accumulatedRotateZ;
    SETTINGS.angle = accumulatedRotate3d;

    if (accumulatedRotateZ > 360) {
      accumulatedRotateZ = 0;
    }
    if (accumulatedRotateZ < 0) {
      accumulatedRotateZ = 360;
    }

    if (accumulatedRotateZ > 315 || accumulatedRotateZ <= 45) {
      facingDirection = 0; // Front
    } else if (accumulatedRotateZ > 45 && accumulatedRotateZ <= 135) {
      facingDirection = 270; // Left
    } else if (accumulatedRotateZ > 135 && accumulatedRotateZ <= 225) {
      facingDirection = 180; // Back
    } else if (accumulatedRotateZ > 225 && accumulatedRotateZ <= 315) {
      facingDirection = 90; // Right
    }

    if (inner) {
      inner.style.setProperty(
        "--rotateZ",
        `${facingDirection}deg`
      );
     }

    CURRENT_MINI_CELL.style.setProperty(
      "--rotationZ",
      `${-SETTINGS.zRotation}deg`
    );

    const camera = inner.querySelector('#player-camera');
    camera.style.setProperty(
      "--rotationZ",
      `${-SETTINGS.zRotation}deg`
    );
observeVisibleObjectsFOV();
    updateCompass();
    updateTargetedDirectionCell();
    applyNeoTransforms();

      const line = inner.querySelector('#player-direction-line');
      if (line) {
        line.style.setProperty(
          "--rotationZ",
          `${-SETTINGS.zRotation}deg`
        );

      }

      crosshairInteractor.updateInteraction();

      updateTargetElementAndEntity();

      //createObjectTooltip();

}

function createObjectTooltip() { 
  const tooltipElement = crosshairInteractor.getHoveredElement();
  const name = tooltipElement.getAttribute('name');
  if (tooltipElement.classList.contains('basic-store')) {
    displayMessage(name);
  }


}

function updateTargetElementAndEntity() {
  const newTargetElement = crosshairInteractor.getHoveredElement();

  if (newTargetElement !== CURRENT_TARGET_ELEMENT) {
      CURRENT_TARGET_ELEMENT = newTargetElement;
      CURRENT_TARGET_ENTITY = crosshairInteractor.getHoveredEntity();
      displayOtherGroupTooltip(CURRENT_TARGET_ELEMENT.parentElement, CURRENT_TARGET_ENTITY);
      updateOvertip(CURRENT_TARGET_ENTITY);
  }
}


function updateCameraRotation2(event) {

  if (!document.pointerLockElement || PLAYER_STATE.isInMenu === true) {
    return;
  }
  
  const inner = document.getElementById('inner-neo');
  const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
  const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

  accumulatedRotateZ += -(movementX / window.innerWidth) * 180;
  accumulatedRotate3d += -(movementY / window.innerHeight) * 60;
  accumulatedRotate3d = Math.max(30, Math.min(140, accumulatedRotate3d));

  //calculateCameraElevation();

  SETTINGS.zRotation = accumulatedRotateZ;
  SETTINGS.angle = accumulatedRotate3d;

  if (accumulatedRotateZ > 360) {
    accumulatedRotateZ = 0;
  }
  if (accumulatedRotateZ < 0) {
    accumulatedRotateZ = 360;
  }

  if (accumulatedRotateZ > 315 || accumulatedRotateZ <= 45) {
    facingDirection = 0; // Front
  } else if (accumulatedRotateZ > 45 && accumulatedRotateZ <= 135) {
    facingDirection = 270; // Left
  } else if (accumulatedRotateZ > 135 && accumulatedRotateZ <= 225) {
    facingDirection = 180; // Back
  } else if (accumulatedRotateZ > 225 && accumulatedRotateZ <= 315) {
    facingDirection = 90; // Right
  }

  if (inner) {
    inner.style.setProperty(
      "--rotateZ",
      `${facingDirection}deg`
    );
   }

  CURRENT_MINI_CELL.style.setProperty(
    "--rotationZ",
    `${-SETTINGS.zRotation}deg`
  );

  updateCompass();
  updateTargetedDirectionCell();
  applyNeoTransforms2();

    const line = inner.querySelector('#player-direction-line');
    if (line) {
      line.style.setProperty(
        "--rotationZ",
        `${-SETTINGS.zRotation}deg`
      );

    }

    crosshairInteractor.updateInteraction();

    updateTargetElementAndEntity();
}






class TargetManager {
  constructor() {}

  getHoveredTargetInfo(element) {
    if (!element) return null; // Ensure element exists

    const aid = element.getAttribute('aid');
    const gid = element.parentElement.getAttribute('gid');
    if (aid) {
      const animal = CURRENT_PLAYER_REGION_DATA.animals.find(map => map.id === parseInt(aid));
      if (animal) {
        highlightTargetEntitySprite(element, animal); // Highlight entity
        PLAYER_STATE.overtip = 'on';
        return animal; // Return the found entity
      }
    } else if (gid) {
      const group = currentOtherGroups.find(map => map.gID === parseInt(gid));
      if (group) {
        
          console.log(group);
          return group;
      }
    }
    return null;
  }
}

const targetManager = new TargetManager();

class CrosshairInteractor {
  constructor() {
      this.lastElement = null;
  }

  updateInteraction() {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const target = document.elementFromPoint(centerX, centerY);

      if (target && target !== this.lastElement) {
          if (this.lastElement) {
              this.triggerMouseLeave(this.lastElement);
          }
          this.triggerMouseEnter(target);
          this.lastElement = target;
      }
  }

  
  updateInteractionCamera() {
    const inner = document.getElementById('inner-neo');
    const camera = document.getElementById('player-camera');
    const cameraLeft = parseFloat(camera.style.left) || 0;
    const cameraTop = parseFloat(camera.style.top) || 0;
    const rect = camera.getBoundingClientRect();
const target = document.elementFromPoint(rect.left, rect.top);

    if (target && target !== this.lastElement) {
      return target;
    }
  }

  triggerMouseEnter(element) {
      element.dispatchEvent(new Event("mouseenter", { bubbles: true }));
  }

  triggerMouseLeave(element) {
      element.dispatchEvent(new Event("mouseleave", { bubbles: true }));
      deLightEntitySprites();
  }

  triggerClick() {
      const target = document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2);
      if (target) {
          target.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      }
  }

  getHoveredElement() {
      return this.lastElement; // Returns the currently hovered element
  }

  getHoveredEntity() {
    const element = this.getHoveredElement(); // Get the hovered element
    if (!element) return null; // Return null if nothing is hovered
    PLAYER_STATE.overtip = 'off';
    removeAllKindsOfTooltips();
    if (element.classList.contains('animal')) {
      return targetManager.getHoveredTargetInfo(element);
    }

    if (element.classList.contains('sprite-type')) {
      return targetManager.getHoveredTargetInfo(element);
    }

    if (element.classList.contains('basic-store')) {
      return targetManager.getHoveredTargetInfo(element);
    }

  }
}

const crosshairInteractor = new CrosshairInteractor();


function updateTargetedDirectionCell() {

  if (CURRENT_GROUP_CELL) {
    let currentCell = CURRENT_GROUP_CELL;

    const currentRow = parseInt(currentCell.getAttribute('row'));
    const currentCol = parseInt(currentCell.getAttribute('col'));

    let targetRow = currentRow;
    let targetCol = currentCol;

    if (facingDirection === 0) {
      targetRow -= 1;
    } else if (facingDirection === 90) {
      targetCol += 1;
    } else if (facingDirection === 180) {
      targetRow += 1;
    } else if (facingDirection === 270) {
      targetCol -= 1;
    }

    observedCells.forEach(cell => {
      cell.classList.remove('targeted-cell');
    });

    const targetCell = observedCells.find(cell => 
      parseInt(cell.getAttribute('row')) === targetRow && 
      parseInt(cell.getAttribute('col')) === targetCol
    );

    targetCell.classList.add('targeted-cell');

    CURRENT_TARGET_CELL = targetCell;
  }

}


class EntityObserver {
  constructor() {
      this.visibleEntities = new Set();
      this.observer = null;
      this.observedCells = []; // Ensure you populate this elsewhere
  }

  initializeObserver() {
      if (this.observer) return; // Prevent duplicate observers

      this.observer = new MutationObserver(() => this.updateVisibleEntities());

      // Observe changes in observedCells
      this.observedCells.forEach(cell => {
          this.observer.observe(cell, {
              childList: true,
              subtree: true,
          });
      });
  }

  updateVisibleEntities() {
      let updated = false;
      const newVisibleEntities = new Set();

      this.observedCells.forEach(cell => {
          const entityElement = cell.querySelector('.entity:not(.fogged) > .animal');
          const aid = entityElement ? parseInt(entityElement.getAttribute('aid')) : null;
          const animal = aid ? CURRENT_PLAYER_REGION_DATA.animals.find(map => map.id === aid) : null;

          if (entityElement && animal) {
              newVisibleEntities.add(animal);
              animal.distance = Math.abs(CURRENT_GROUP_CELL.getAttribute('row') - cell.getAttribute('row')) + Math.abs(CURRENT_GROUP_CELL.getAttribute('col') - cell.getAttribute('col'));
          }
      });

      // Check if there are any changes
      if (this.visibleEntities.size !== newVisibleEntities.size ||
          [...this.visibleEntities].some(entity => !newVisibleEntities.has(entity))) {
          this.visibleEntities = newVisibleEntities;
          updated = true;
      }

      if (updated) this.updateEntitiesList();
  }

  updateEntitiesList() {
      const entityContainer = document.getElementById('entities-container');
      const entitiesNumber = entityContainer.querySelector('.number');
      const entitiesList = entityContainer.querySelector('#entities-list');

      const entitiesArray = Array.from(this.visibleEntities);
      entitiesNumber.innerText = `${entitiesArray.length}`;

      // Use DocumentFragment to reduce reflow
      const fragment = document.createDocumentFragment();
      entitiesArray.forEach(entity => {
          const entityElement = this.createEntityListElement(entity);
          if (entityElement) fragment.appendChild(entityElement);
      });

      entitiesList.innerHTML = ''; // Clear and append in one go
      entitiesList.appendChild(fragment);
  }

  createEntityListElement(entity) {
      if (entity.currentLife <= 0) return null;

      const cont = document.createElement('div');
      cont.className = 'entity-element';
      cont.setAttribute('aid', entity.id);
      if (entity.active) cont.classList.add('active');

      const name = document.createElement('div');
      name.className = 'entity-name';
      name.textContent = entity.name;

      const image = document.createElement('div');
      image.className = 'entity-image';
      image.style.backgroundImage = `url('/Art/Animals/${entity.name}.png')`;

      const life = document.createElement('div');
      life.className = 'entity-life';
      life.textContent = `${entity.currentLife} / ${entity.totalLife}`;

      cont.appendChild(image);
      cont.appendChild(name);
      cont.appendChild(life);

      cont.addEventListener("click", () => {
        deLightEntitySprites();
          highlightTargetEntitySprite(cont, entity);
      });

      return cont;
  }

  setObservedCells(cells) {
      this.observedCells = cells;
      if (this.observer) {
          this.observer.disconnect();
          this.initializeObserver();
      }
  }
}

// Usage
const entityObserver = new EntityObserver();

entityObserver.initializeObserver();



function deLightEntitySprites() {
  const entitiesList = document.querySelector('#entities-list');
  const listElements = entitiesList.querySelectorAll('.entity-element');
  for (const el of listElements) {
    el.classList.remove('active');
  }

  for (const cell of observedCells) {
    const entityElement = cell.querySelector('.entity:not(.fogged) > .animal');
    if (entityElement) {
      entityElement.classList.remove('highlight-visible');
    }
  }
}


function highlightTargetEntitySprite(element, entity) {

  element.classList.add('active');

  for (const animal of CURRENT_PLAYER_REGION_DATA.animals) {
    animal.active = false;
  }

  for (const cell of observedCells) {
    const entityElement = cell.querySelector('.entity:not(.fogged) > .animal');
    if (entityElement && parseInt(entityElement.getAttribute('aid')) === entity.id) {
      entityElement.classList.add('highlight-visible');
      entity.active = true;
      break;
    }
  }
}


let currentEntityIndex = 0;


function cycleTargetEntitySprite(direction) {
  const entitiesList = document.querySelector('#entities-list');
  const listElements = Array.from(entitiesList.querySelectorAll('.entity-element'));
  if (listElements.length === 0) return;

  // Update index based on direction
  currentEntityIndex += direction;
  if (currentEntityIndex < 0) {
    currentEntityIndex = listElements.length - 1; // Wrap around to last
  } else if (currentEntityIndex >= listElements.length) {
    currentEntityIndex = 0; // Wrap around to first
  }

  // Get the currently selected entity element
  const selectedElement = listElements[currentEntityIndex];
  const selectedEntityId = parseInt(selectedElement.getAttribute('aid'));
  const selectedEntity = CURRENT_PLAYER_REGION_DATA.animals.find(animal => animal.id === selectedEntityId);
  
  if (!selectedEntity) return;

  // Call the highlight function to update UI and data
  deLightEntitySprites();
  highlightTargetEntitySprite(selectedElement, selectedEntity);
}






// Helper function to check if a number is within a range
Number.prototype.between = function(lower, upper) {
  return lower <= this && this <= upper;
};












async function updateCurrentGroupPosition(newGroupCell) {

  const fenetre = document.getElementById('neo-region');
  const inner = fenetre.querySelector('#inner-neo');
  // let groupStore = CURRENT_GROUP_CELL.querySelector('.our-group');

  
  
  // inner.style.transform = `rotateX(${SETTINGS.angle}deg) rotateZ(${SETTINGS.zRotation}deg)`;

  CURRENT_GROUP_CELL.classList.remove('current-group-position');
  // If the cell hasn't changed, skip the rest of the code
  newGroupCell.classList.add('current-group-position');
  CURRENT_GROUP_CELL = newGroupCell;

  console.log(CURRENT_GROUP_CELL);

  throttledObserveVisibleCells();
  

  await updateNeoRegion(CURRENT_GROUP_CELL);





  if (castShadowYes === true) {
    await castShadows();
  }
  

  // Update mini-map cell if the group cell has changed
  if (CURRENT_GROUP_CELL) {

    const index = CURRENT_GROUP_CELL.getAttribute('index');

    // Only update mini-cell if it has changed
    if (CURRENT_MINI_CELL) CURRENT_MINI_CELL.classList.remove('current-position-mini');
    const miniMap = document.getElementById('mini-table');
    CURRENT_MINI_CELL = miniMap.querySelector(`div[index="${index}"]`);
    if (CURRENT_MINI_CELL) {
      CURRENT_MINI_CELL.classList.add('current-position-mini');
      CURRENT_MINI_CELL.style.setProperty(
        "--rotationZ",
        `${-SETTINGS.zRotation}deg`
      );
    }
  }

    // Set visibility for all observed cells in mini-table
    observedCells.forEach(cell => {
      if (!cell.classList.contains('fogged')) {
        const index = cell.getAttribute('index');
        const miniCell = miniCells.find(mini => mini.getAttribute('index') === index);
      
  
        if (miniCell && !CURRENT_PLAYER_REGION_DATA.exploredCells.has(index)) {
          miniCell.style.visibility = 'visible';
          CURRENT_PLAYER_REGION_DATA.exploredCells.add(index);
        }
      }
    });
    setTimeout( async () => {
      await checkGridCellInteraction();
    }, 5);

     

  if (CURRENT_PLAYER_REGION_DATA.explorationProgress < 100) {
    updateExplorationProgress();
  }


  if (!isDraggingMini) {
    await realTime();
    PLAYER_STATE.canMove = true;
  }
}


async function passiveHealMovement(healAmount) {
  let group = Array.from(groupAdventurers.values());
  let toHeal = [];

  for (const adventurer of group) {
    if (adventurer.Life < adventurer.MaxLife) {
      toHeal.push(adventurer);
    }
  }

  if (toHeal.length != 0) {
    const n = Math.floor(Math.random() * toHeal.length);
    toHeal[n].Life = Math.min(toHeal[n].Life + healAmount, toHeal[n].MaxLife);
  }

}



function updateExplorationProgress() {
  
  const exBar = document.getElementById('exploration-bar');
  const exPercentage = document.getElementById('exploration-percent');
  const exValue = document.getElementById('exploration-value');

  const totalCells = cachedGridCells.length - CURRENT_PLAYER_REGION_DATA.explorationReduction;
  const exploredCells = CURRENT_PLAYER_REGION_DATA.exploredCells.size;
  let percentage = Math.floor((exploredCells / totalCells) * 100);

  if (percentage >= 100) {
    percentage = 100;
    CURRENT_PLAYER_REGION_DATA.explorationProgress = percentage;
    exValue.textContent = `${totalCells}/${totalCells}`;
    onExplorationFull();
  }

  exBar.max = 100;
  exBar.value = percentage;

  exPercentage.textContent = `(${percentage}%)`;
  exValue.textContent = `${exploredCells}/${totalCells}`;

CURRENT_PLAYER_REGION_DATA.explorationProgress = percentage;

const expGain = 0.1;
experience = Math.round(experience + expGain);
updateExpBar();

}


function updateMinimapExplorationProgress() {


  CURRENT_PLAYER_REGION_DATA.exploredCells.values().forEach(value => {
    const miniCell = miniCells.find(mini => mini.getAttribute('index') === value);
    miniCell.style.visibility = 'visible';
  });
    

}













let observedCells = [];

function observeVisibleCells() {
  observedObjects = [];
  observeVisibleObjectsFOV();

  const visibilityRadius = SETTINGS.visibilityRadius;
    let groupPositionCell = CURRENT_GROUP_CELL;
  
  const currentRow = parseInt(groupPositionCell.getAttribute('row'), 10);
  const currentCol = parseInt(groupPositionCell.getAttribute('col'), 10);

  cachedGridCells.forEach(cell => {
    const cellRow = parseInt(cell.getAttribute('row'), 10);
    const cellCol = parseInt(cell.getAttribute('col'), 10);

    const distance = Math.sqrt(
      Math.pow(cellRow - currentRow, 2) + Math.pow(cellCol - currentCol, 2)
    );

    const isVisible = distance <= visibilityRadius;

    cell.style.display = isVisible ? 'visible' : 'hidden';

    if (isVisible) {
                if (cell.firstChild != null) {
            observedObjects.push(cell.firstChild);
          }
      cell.classList.remove('unexplored');
      cell.classList.add('explored', 'highlighted');

      if (!observedCells.includes(cell)) {
          observedCells.push(cell);

          if (PLAYER_STATE.isInStructure === true) {
            if (!cell.classList.contains('structure')) {
              cell.classList.add('fogged');
            }
          }
      }
    } else {
      cell.classList.remove('highlighted');

      const index = observedCells.indexOf(cell);
      if (index !== -1) {
        observedCells.splice(index, 1);
      }
    }
  });
}

let observedObjects = [];

function observeVisibleObjectsFOV() {
   
  const groupPositionCell = CURRENT_GROUP_CELL;

  const currentRow = parseInt(groupPositionCell.getAttribute('row'), 10);
  const currentCol = parseInt(groupPositionCell.getAttribute('col'), 10);

  const cameraPosition = {
    x: currentCol,
    y: currentRow,
  };

  const cameraRotation = -SETTINGS.zRotation;

  const cameraDirection = ((cameraRotation - 90) * Math.PI) / 180;

  const fovShift = 2;
  const shiftX = Math.cos(cameraDirection) * fovShift;
  const shiftY = Math.sin(cameraDirection) * fovShift;

  const shiftedCameraPosition = {
    x: cameraPosition.x - shiftX,
    y: cameraPosition.y - shiftY,
  };

  const fov = SETTINGS.fov;
  const fovRange = SETTINGS.visibilityRadius * 2;

  observedObjects.forEach(obj => {
    if (obj.parentElement === null) {
      return;
    }
    const objRow = parseInt(obj.parentElement.getAttribute('row'), 10);
    const objCol = parseInt(obj.parentElement.getAttribute('col'), 10);

    const dx = objCol - shiftedCameraPosition.x;
    const dy = objRow - shiftedCameraPosition.y;

    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) - cameraDirection;
    const angleNormalized = Math.atan2(Math.sin(angle), Math.cos(angle));
    const isWithinFov = Math.abs(angleNormalized) <= fov / 2;
    const isWithinRange = distance <= fovRange;
    const isVisible = isWithinFov && isWithinRange;
    if (isVisible) {
      if (obj.style.visibility !== 'visible') {
        obj.style.visibility = 'visible';
        obj.parentElement.style.opacity = 1;
      }
    } else {
      if (SETTINGS.firstPerson === true) {
      obj.style.visibility = 'hidden';
      obj.parentElement.style.opacity = 0;
      }
    }
  });
}













// old functions //

function observeVisibleCells2() {
  // Get the player camera's position
  const playerCamera = document.getElementById('player-camera');
  const playerCameraRect = playerCamera.getBoundingClientRect();
  const playerCameraX = playerCameraRect.left + playerCameraRect.width / 2;
  const playerCameraY = playerCameraRect.top + playerCameraRect.height / 2;

  cachedGridCells.forEach(cell => {
      const cellRect = cell.getBoundingClientRect();
      const cellX = cellRect.left + cellRect.width / 2;
      const cellY = cellRect.top + cellRect.height / 2;

      // Calculate the distance between the cell and the player camera
      const distance = Math.sqrt((cellX - playerCameraX) ** 2 + (cellY - playerCameraY - 150) ** 2);

      // Check visibility
      const isVisible = distance <= 700;
      cell.style.visibility = isVisible ? 'visible' : 'hidden';

      if (isVisible) {
        cell.classList.remove('unexplored');
        cell.classList.add('explored');
        cell.classList.add('highlighted');
      
        if (!observedCells.includes(cell)) {
          observedCells.push(cell);
        }
      } else {
        cell.classList.remove('highlighted');
        
        const index = observedCells.indexOf(cell);
        if (index !== -1) {
          observedCells.splice(index, 1);  // Removes the specific cell from the array
        }
      }
  });
}


function observeVisibleCellsFOV() {
  observedCells = [];
  const visibilityRadius = SETTINGS.visibilityRadius;
  const gridParent = document.getElementById('region-grid-table');
  const playerCamera = document.getElementById('player-camera');
  
  // Get the current group position cell
  const groupPositionCell = cachedGridCells.find(cell => 
    cell.classList.contains('current-group-position')
  );

  const currentRow = parseInt(groupPositionCell.getAttribute('row'), 10);
  const currentCol = parseInt(groupPositionCell.getAttribute('col'), 10);

  // Get the player camera's position and direction
  const cameraPosition = {
    x: currentCol,
    y: currentRow,
  };

  // Get the rotateZ value from the player's transform (using computed styles)
  const cameraRotation = -SETTINGS.zRotation;  // Default to 0 if no rotateZ is found

  // Convert camera rotation to radians and adjust by -90 degrees (Math.PI / 2)
  const cameraDirection = ((cameraRotation - 90) * Math.PI) / 180;

  // Define how many cells behind the camera to start the FOV (e.g., 1 or 2 cells)
  const fovShift = 2;  // 1 or 2 cells behind the camera
  const shiftX = Math.cos(cameraDirection) * fovShift;
  const shiftY = Math.sin(cameraDirection) * fovShift;

  // Adjust the camera's position to be behind it by the specified amount
  const shiftedCameraPosition = {
    x: cameraPosition.x - shiftX,
    y: cameraPosition.y - shiftY,
  };

  // Field of View (FOV) settings: you can adjust these values based on your game settings
  const fov = SETTINGS.fov;  // 45 degrees FOV
  const fovRange = SETTINGS.visibilityRadius;  // How far the FOV reaches in grid cells

  cachedGridCells.forEach(cell => {
    const cellRow = parseInt(cell.getAttribute('row'), 10);
    const cellCol = parseInt(cell.getAttribute('col'), 10);

    // Calculate the relative position of the cell
    const dx = cellCol - shiftedCameraPosition.x;
    const dy = cellRow - shiftedCameraPosition.y;

    // Calculate the distance between the camera and the cell
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Calculate angle between the camera's direction and the cell's position
    const angle = Math.atan2(dy, dx) - cameraDirection;

    // Ensure the angle is between -PI and PI
    const angleNormalized = Math.atan2(Math.sin(angle), Math.cos(angle));

    // Check if the cell is within the camera's FOV
    const isWithinFov = Math.abs(angleNormalized) <= fov / 2;

    // Check if the cell is within the range of the camera's FOV
    const isWithinRange = distance <= fovRange;

    // Combine the FOV and distance checks to determine visibility
    const isVisible = isWithinFov && isWithinRange;

    // Apply visibility to the cell
    if (isVisible) {
      cell.style.visibility = 'visible';
      cell.classList.remove('unexplored');
      cell.classList.add('explored', 'highlighted');

      if (!observedCells.includes(cell)) {
        observedCells.push(cell);
      }
    } else {
      cell.style.visibility = 'hidden';
      cell.classList.remove('highlighted');

      const index = observedCells.indexOf(cell);
      if (index !== -1) {
        observedCells.splice(index, 1);
      }
    }
  });
}


// ===== //






function updateFogOvermap(cellIndex, isVisible) {
  const overmap = document.getElementById('mini-table');
  const overmapCells = overmap.querySelectorAll('td');

  if (overmapCells[cellIndex]) {
      if (isVisible) {
          overmapCells[cellIndex].classList.add('visible');
      } else {
          overmapCells[cellIndex].classList.remove('visible');
      }
  }
}


function updateShadowPositionForCell(cell, playerCameraX, playerCameraY) {
  const shadow = cell.querySelector('.shadow'); // Find the shadow inside the cell
  if (!shadow) return; // Skip if no shadow element exists

  const parentRect = cell.getBoundingClientRect(); // Get parent (cell) position

  // Calculate the center-bottom position of the shadow's parent element
  const centerBottomX = parentRect.left + parentRect.width / 2; // Center X
  const centerBottomY = parentRect.top + parentRect.height; // Bottom Y (height of cell)

  // Calculate the direction vector from the camera to the shadow's parent
  const deltaX = (centerBottomX - playerCameraX);
  const deltaY = (centerBottomY - playerCameraY) / 2;

  // Calculate the distance and angle from the player camera to the shadow's parent element
  const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
  
  // Scale factor for the shadow size based on the distance
  ///const scaleFactor = Math.max(0.5, 1 - distance / 1200); // Ensure scale does not go below 0.5

  // Calculate the rotation angle (in degrees) based on the direction from the camera to the shadow's parent
  const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI); // Convert radians to degrees

  // Calculate dynamic translation values to ensure shadow base is attached to the center-bottom
  const translateX = centerBottomX - (parentRect.left + parentRect.width / 2) - 10; // Center of parent
  const translateY = centerBottomY - (parentRect.top + parentRect.height) + 10; // Center-bottom of parent

  // Apply rotation, scaling, and dynamic translation to the shadow
  shadow.style.transform = `
      rotate(${-angle}deg) 
      
      translateZ(0.1px) 
      translateX(${translateX}px) 
      translateY(${translateY}px)`;
}






function throttleAsync(func, limit) {
  let inThrottle = false;

  return async function (...args) {
    if (!inThrottle) {
      inThrottle = true;
      await func(...args); // Wait for the function to complete
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Use throttle to limit how often observeVisibleCells runs (e.g., once every 200ms)
const throttledObserveVisibleCells = throttleAsync(observeVisibleCells, SETTINGS.throttleSpeed);
const throttledMovementByCell = throttleAsync(movePlayerCameraByKey, SETTINGS.animationTime);





// Call updateOverlayWithFillers before observing cells














  



function highlightOuterCells() {
  // Select all cells inside #table-overlay
  const cells = document.querySelectorAll('#table-overlay > *');

  // Loop through each cell and check its position
  cells.forEach((cell) => {
    const row = cell.style.gridRowStart;
    const column = cell.style.gridColumnStart;

    // Convert row and column to numbers for comparison
    const rowNum = parseInt(row, 10);
    const colNum = parseInt(column, 10);

    // If the cell is in the first or last row/column
    if (rowNum === 1 || rowNum === 10 || colNum === 1 || colNum === 10) {



    }
  });
}


function setGroupPositionCellClass() {
  const bottomRowCells = document.querySelectorAll('#region-grid-table tr:nth-child(25) td'); // Select cells in the bottom row
  const availableCells = Array.from(bottomRowCells);

  let table = document.getElementById('table-container');

  if (availableCells.length > 0) {
    let selectedCell;

      selectedCell = bottomRowCells[cellGroupPosition];

    if (selectedCell) {
      selectedCell.classList.add('current-group-position');
      selectedCell.classList.add('group-standing');
      selectedCell.classList.remove('unexplored');
      selectedCell.classList.add('group-initial-position');
    }
}
}

























function createOtherGroupBox(group) {

  const box = document.createElement('div');
  box.classList.add('sprites-container');


  let thisGroupAdventurers = []
  
  if (group) { //if this is another group

    

    let adventurersMap;

    for (const [key, value] of group.entries()) {
        if (value instanceof Map && value.size > 0) {
            adventurersMap = value;
            break;
        }
    }
  
    if (!adventurersMap) {
        console.error('No adventurers found in the group.');
        return;
    }

    thisGroupAdventurers = Array.from(adventurersMap.values()); // Convert to array for easier iteration

  } else { // if this is our group
    box.classList.add('our-group');
    thisGroupAdventurers = Array.from(groupAdventurers.values());
  }


  shuffle(thisGroupAdventurers);
  for (const adventurer of thisGroupAdventurers) {
    const slot = display(adventurer);
    box.appendChild(slot);
  }

  const advNum = thisGroupAdventurers.length;
  if (advNum === 2) {
    box.style.gridTemplateColumns = `repeat(${2}, 5px)`;
    box.style.gridTemplateRows = `repeat(${1}, 5px)`;
  } else if (advNum === 3) {
    box.style.gridTemplateColumns = `repeat(${2}, 5px)`;
    box.style.gridTemplateRows = `repeat(${1}, 5px)`;
  } else if (advNum === 4) {
    box.style.gridTemplateColumns = `repeat(${2}, 5px)`;
    box.style.gridTemplateRows = `repeat(${2}, 5px)`;
  } else if (advNum === 5) {
    box.style.gridTemplateColumns = `repeat(${3}, 5px)`;
    box.style.gridTemplateRows = `repeat(${2}, 5px)`;
  } else if (advNum === 6) {
    box.style.gridTemplateColumns = `repeat(${3}, 5px)`;
    box.style.gridTemplateRows = `repeat(${2}, 5px)`;
  } else if (advNum === 7) {
    box.style.gridTemplateColumns = `repeat(${4}, 5px)`;
    box.style.gridTemplateRows = `repeat(${2}, 5px)`;
  } else if (advNum === 8) {
    box.style.gridTemplateColumns = `repeat(${4}, 5px)`;
    box.style.gridTemplateRows = `repeat(${2}, 5px)`;
  } else {
    box.style.gridTemplateColumns = `repeat(${advNum}, 5px)`;
    box.style.gridTemplateRows = `repeat(${advNum}, 5px)`;
  }


  function display(adventurer) {
    const advSprite = document.createElement('div');
    advSprite.classList.add('sprite-type');
    advSprite.classList.add('cardboard');


    const advTypes = adventurer.Type.split(', ');
    const ran = Math.floor(Math.random() + 0.5);
    let advType1;
    if (advTypes.length === 2) {
      advType1 = advTypes[ran];
    } else {
      advType1 = advTypes[0];
    }


    const img = new Image();
    img.src = `/Art/Adventurers/Sprites/${adventurer.Title}.png`;
    img.onload = () => advSprite.style.backgroundImage = `url('${img.src}')`;
    img.onerror = () => advSprite.style.backgroundImage = "url('/Art/Adventurers/Sprites/Gallóglach.png')";

    

    const ranDelay = (Math.random() * 3) + 1;
    advSprite.style.animationDelay = `${ranDelay / 10}s`;
    advSprite.style.animationDuration = `${ranDelay}s`;

    advSprite.style.setProperty(
      "--rotationZ",
      `${SETTINGS.zRotation}deg`
    );

    return advSprite;
}

return box;

}









async function moveAnimalsInMap() {
  if (CURRENT_PLAYER_REGION_DATA.animals.length === 0) return;

  for (const animal of CURRENT_PLAYER_REGION_DATA.animals) {

    if (animal.currentLife <= 0) {
      CURRENT_PLAYER_REGION_DATA.animals = CURRENT_PLAYER_REGION_DATA.animals.filter(an => an.id === animal.id);
    }


    const chance = Math.floor(Math.random() * 10) + 1;
    if (chance > 7 && animal.aggressive != "yes") continue; // Skip movement sometimes

    

    console.log("try to move animal");
    let isAdjacent;
    const orow = animal.Y;
    const ocol = animal.X;

    let currentCell = observedCells.find(cell =>
      parseInt(cell.getAttribute('row')) === orow &&
      parseInt(cell.getAttribute('col')) === ocol
    );

    if (!currentCell) continue;
    console.log('animal cell found');

    // Get player position
    const playerRow = parseInt(CURRENT_GROUP_CELL.getAttribute('row'));
    const playerCol = parseInt(CURRENT_GROUP_CELL.getAttribute('col'));

    // **Check if animal is already adjacent to the player**
    isAdjacent =
      (Math.abs(orow - playerRow) === 1 && ocol === playerCol) ||
      (Math.abs(ocol - playerCol) === 1 && orow === playerRow);

    if (animal.aggressive === "yes" && isAdjacent && animal.currentLife > 0) {

      const ran = Math.floor(Math.random() * 5) + 1;

      if (ran != 5) {
        console.log("Aggressive animal is already adjacent to the player, not moving.");
        const attackerElement = currentCell.querySelector(".animal");
        const defenderElement = CURRENT_GROUP_CELL.querySelector('.our-group');
        const attacker = animal;
        await enemyAttackUs(attackerElement, defenderElement, attacker);
        continue; // Skip movement if already adjacent
      }

    }

    // Define potential movement directions
    const directions = [
      { row: orow - 1, col: ocol, direction: "North" },
      { row: orow + 1, col: ocol, direction: "South" },
      { row: orow, col: ocol - 1, direction: "West" },
      { row: orow, col: ocol + 1, direction: "East" }
    ];

    // Filter valid moves
    let validMoves = directions
      .map(({ row, col, direction }) => ({
        targetCell: observedCells.find(cell =>
          parseInt(cell.getAttribute('row')) === row &&
          parseInt(cell.getAttribute('col')) === col
        ),
        row,
        col,
        direction,
        distanceToPlayer: Math.abs(row - playerRow) + Math.abs(col - playerCol) // Manhattan distance
      }))
      .filter(({ targetCell }) =>
        targetCell &&
        !targetCell.classList.contains('entity') &&
        !targetCell.classList.contains('current-group-position') &&
        !targetCell.classList.contains('impassable') && 
        !targetCell.classList.contains('wall') && 
        !targetCell.classList.contains('door')
      );

    if (validMoves.length === 0) continue; // No valid move

    // If aggressive, prioritize moves closer to the player
    const ran = Math.floor(Math.random() * 4) + 1;
    if (animal.aggressive === "yes" && ran != 4) {
      validMoves.sort((a, b) => a.distanceToPlayer - b.distanceToPlayer);
    }

    // Pick a move (closest to player if aggressive, otherwise random)
    const { targetCell, row: trow, col: tcol, direction } = 
      animal.aggressive === "yes" && ran != 4 ? validMoves[0] : validMoves[Math.floor(Math.random() * validMoves.length)];

    const store = currentCell.querySelector(".animal");
    if (store) {

      if (direction === 'West' || direction === 'East') {
        store.classList.remove('east', 'west');
        store.classList.add(direction.toLowerCase());
      }

      if (SETTINGS.animations === true && !store.classList.contains('bird')) {
        store.style.animation = `move${direction} 0.${SETTINGS.animationTime}s linear 1, standAnimal${animal.direction} 1.1s linear infinite`;
        await new Promise(resolve => setTimeout(resolve, SETTINGS.animationTime));
        store.style.animation = `standAnimal${animal.direction} 1.1s linear infinite`;
      }

          
        

  
      // Move the animal
      targetCell.appendChild(store);
    }

    // Update classes
    targetCell.classList.add("entity", "animal");
    currentCell.classList.remove("entity", "animal");

    // Update animal position
    animal.Y = trow;
    animal.X = tcol;
    animal.distance = Math.abs(CURRENT_GROUP_CELL.getAttribute('row') - targetCell.getAttribute('row')) + Math.abs(CURRENT_GROUP_CELL.getAttribute('col') - targetCell.getAttribute('col'));
    console.log('ANIMAL MOVED!');
    

      isAdjacent =
        (Math.abs(trow - playerRow) === 1 && tcol === playerCol) ||
        (Math.abs(tcol - playerCol) === 1 && trow === playerRow);

      if (animal.aggressive === "yes" && isAdjacent) {
        console.log("Aggressive animal is already adjacent to the player, not moving.");
        const attackerElement = targetCell.querySelector(".animal");
        const defenderElement = CURRENT_GROUP_CELL.querySelector('.our-group');
        const attacker = animal;
        await enemyAttackUs(attackerElement, defenderElement, attacker)
      }

      if (PLAYER_STATE.overtip === 'on') {
        if (animal === CURRENT_TARGET_ENTITY) {
          updateOvertip(animal);
        }
      }
  }
}











async function moveOtherGroupInObservedCells() {

  if (!CURRENT_PLAYER_REGION_DATA.groups) {
    return;
  }
 
  const directions = {
    North: { row: -1, col: 0 },
    West: { row: 0, col: -1 },
    South: { row: 1, col: 0 },
    East: { row: 0, col: 1 }
  };

  if (!cachedGridCells || cachedGridCells.length === 0) {
    console.error("cachedGridCells is empty or undefined.");
    return;
  }


  CURRENT_PLAYER_REGION_DATA.groups.forEach(async group => {

    
    let targetX;
    let targetY;
    const groupName = group.keys().next().value;
    // Find the current cell of the group
    let currentCell = null;
    for (const cell of cachedGridCells) {
      const cellRow = parseInt(cell.getAttribute("row"), 10);
      const cellCol = parseInt(cell.getAttribute("col"), 10);
      const cellGID = parseInt(cell.getAttribute("gid"), 10);
      if (cellGID === group.gID) {
        currentCell = cell;
        targetY = parseInt(currentCell.getAttribute('row'));
        targetX = parseInt(currentCell.getAttribute('col'));
        break;
      }
    }

    if (!currentCell) {
      console.error(
        `Group ${groupName} at (${group.Y}, ${group.X}) not found. Ensure attributes are correct.`
      );
      return;
    }

    if (!currentCell.classList.contains("other-group")) {
      console.warn(
        `Group ${groupName} at (${group.Y}, ${group.X}) is not in .other-group. Skipping.`
      );
      return;
    }

    // Determine the target cell based on direction
    const direction = directions[group.direction];
    const targetRow = targetY + direction.row;
    const targetCol = targetX + direction.col;

    let targetCell = null;
    for (const cell of cachedGridCells) {
      const cellRow = parseInt(cell.getAttribute("row"));
      const cellCol = parseInt(cell.getAttribute("col"));
        if (cellCol === targetCol && cellRow === targetRow && !cell.classList.contains('other-group') && !cell.classList.contains('current-group-position') && !cell.classList.contains('entity')) {
          targetCell = cell;
        }


    }

    if (targetCell) {
      if (
      targetCell.classList.contains('impassable') ||
      targetCell.classList.contains('wall') || 
      targetCell.classList.contains('entity')
    ) {
        const randomDirection = Object.keys(directions)[
          Math.floor(Math.random() * Object.keys(directions).length)
        ];
        group.direction = randomDirection;
        return;
      }
      const ranStay = Math.floor(Math.random() * group.attributes.speed) + 1;
      if (ranStay === 1) {
        console.log(`${groupName} has stopped to recover.`);
        return;
      }
      // Move the group to the target cell
      const groupStore = currentCell.querySelector(".group");
      if (groupStore) {
        
        groupStore.style.animation = `move${direction} 0.2s linear 1`;
          await new Promise(resolve => setTimeout(resolve, 200));
          groupStore.style.animation = `none`;
        
        targetCell.appendChild(groupStore);


        
      }
      

      // Update classes
      currentCell.classList.remove("other-group");
      currentCell.classList.remove('entity');
      currentCell.removeAttribute('gid');
  
      targetCell.classList.add("other-group");
      targetCell.classList.add("entity");
      targetCell.setAttribute('gid', group.gID);

      const currentIndex = currentCell.getAttribute('index');
      const targetIndex = targetCell.getAttribute('index');
      updateGroupsInMinimap(currentIndex, targetIndex, group.gID);
      
      
   
      const oldRow = group.Y; // Store the old position
      const oldCol = group.X;
      
      // Update the group's position
      group.Y = targetRow;
      group.X = targetCol;
      
      // Update CURRENT_PLAYER_REGION_DATA.content with the new position

// CURRENT_PLAYER_REGION_DATA.content[oldCol][oldRow].group = null; // Clear old position
// CURRENT_PLAYER_REGION_DATA.content[targetCol][targetRow].group = group; // Set new position


      group.directionVariance += parseInt((10 - (group.attributes.cohesion / 10)));


    } else {
      // Handle blocked movement by changing direction
      
      group.directionVariance += 30;
    }
  });

}


function playAnimation(element, animation) {
  return new Promise((resolve) => {
    element.style.animation = animation;

    const onAnimationEnd = () => {
      element.style.animation = `none`;
      element.removeEventListener('animationend', onAnimationEnd);
      resolve();
    };

    element.addEventListener('animationend', onAnimationEnd);
  });
}




async function updateGroupDirection() {
if (!CURRENT_PLAYER_REGION_DATA.groups) { return; }
CURRENT_PLAYER_REGION_DATA.groups.forEach(group => {
        if (group.directionVariance >= 90) {
        group.direction = setGroupDirection(group);
        const groupName = group.keys().next().value;
        console.log(`Direction of ${groupName} changed to ${group.direction}`);
        group.directionVariance = 0;
        }
  });

}


function updateGroupsInMinimap(oldIndex, newIndex, gid) {
  const oldCell = miniCells.find(cell => cell.getAttribute('index') === oldIndex);
  oldCell.classList.remove('group');
  oldCell.removeAttribute('gid');

  const newCell = miniCells.find(cell => cell.getAttribute('index') === newIndex);
  newCell.classList.add('group');
  newCell.setAttribute('gid', gid);
}



function revealAllMap() {
  document.querySelectorAll('#mini-table div').forEach(cell => {
    cell.style.visibility = 'visible';
  });
}






function startCameraAnimation() {
  const cam = document.getElementById('player-camera');
  const inner = document.querySelector('#inner-neo');
  animateCamera(inner, cam);
}
let lastHoveredCell = null; // Track last hovered cell
function animateCamera(inner, cam) {
  let lastTimestamp = null;

  async function update(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = timestamp - lastTimestamp;
    lastTimestamp = timestamp;

    const camRect = cam.getBoundingClientRect();
    const innerRect = inner.getBoundingClientRect();
    const centerX = (camRect.left + camRect.width / 2) - innerRect.left;
    const centerY = (camRect.top + camRect.height / 2) - innerRect.top;

    // Movement calculation
    const angleRad = (SETTINGS.zRotation - 180) * (Math.PI / 180);
    const speed = 40;
    const offsetX = speed * Math.sin(angleRad) * (delta / 1000);
    const offsetY = speed * Math.cos(angleRad) * (delta / 1000);

    let currentX = parseFloat(cam.dataset.translateX) || 250; // Start centered
    let currentY = parseFloat(cam.dataset.translateY) || 250;

    // Apply movement
    currentX += offsetY;
    currentY += offsetX;
    cam.dataset.translateX = currentX;
    cam.dataset.translateY = currentY;
    cam.style.top = `${currentX - 1}px`;
    cam.style.left = `${currentY - 1}px`;
    SETTINGS.translateX -= offsetX;
    SETTINGS.translateY -= offsetY;

    applyNeoTransforms();

    
    // const currentHoveredCell = crosshairInteractor.updateInteractionCamera();




    // if (currentHoveredCell && currentHoveredCell !== lastHoveredCell) {
    //   lastHoveredCell = currentHoveredCell;

    //   console.log(currentHoveredCell);
    //   currentHoveredCell.classList.add('under-camera');

    //   if (currentHoveredCell.classList.contains('game-cell') && !currentHoveredCell.classList.contains('impassable')) {
    //     finalizeLocationNewcell(currentHoveredCell);
    //   }
    // }

    if (zKeyPressed) {
      animationFrameId = requestAnimationFrame(update);
    }
  }

  animationFrameId = requestAnimationFrame(update);
}


function isAdjacent(cell1, cell2) {
  if (!cell1 || !cell2) return false;

  const row1 = parseInt(cell1.getAttribute('row'), 10);
  const col1 = parseInt(cell1.getAttribute('col'), 10);
  const row2 = parseInt(cell2.getAttribute('row'), 10);
  const col2 = parseInt(cell2.getAttribute('col'), 10);

  // Check if the cells are directly adjacent in any of the four directions
  return (
    (Math.abs(row1 - row2) === 1 && col1 === col2) || // Up or Down
    (Math.abs(col1 - col2) === 1 && row1 === row2)   // Left or Right
  );
}




const pressedKeys = new Set();
let facingDirection = 0; // 0: North, 90: East, 180: South, 270: West

const directionMapping = {
  0: { row: -1, col: 0 },   // North
  90: { row: 0, col: 1 },   // East
  180: { row: 1, col: 0 },  // South
  270: { row: 0, col: -1 }  // West
};

async function movePlayerCameraByKey(event) {
  if (PLAYER_STATE.canMove === false) return;
  const key = event.keyCode;
  if (![87, 65, 68, 83].includes(key) ) return;

  document.getElementById('interior_building')?.remove();


  removeAllKindsOfTooltips();
  pressedKeys.add(key);

  let currentCell = CURRENT_GROUP_CELL;
  let currentRow = parseInt(currentCell.getAttribute('row'));
  let currentCol = parseInt(currentCell.getAttribute('col'));

  let targetRow = currentRow;
  let targetCol = currentCol;

  let offset = 0;
  const direction = directionMapping[facingDirection];
  // Handle rotations and movement
  switch (key) {
    case 65: // A (Left)
    case 68: // D (Right)
    if (key === 65) { // Strafe Left
      targetRow = currentRow - direction.col; // Swap row/col for perpendicular movement
      targetCol = currentCol + direction.row;
      offset = -20;
    } else { // Strafe Right
      targetRow = currentRow + direction.col;
      targetCol = currentCol - direction.row;
      offset = -20;
    }

    break;

    case 87: // W (Move Forward)
    case 83: // S (Move Backward)
      if (key === 87) { // Forward
        targetRow += direction.row;
        targetCol += direction.col;
        offset = 20;
      } else { // Backward
        targetRow -= direction.row;
        targetCol -= direction.col;
        offset = -20;
      }

      break;
  }

  accumulatedRotateZ = SETTINGS.zRotation;
  updateTargetedDirectionCell();




  // Validate movement
  const targetCell = observedCells.find(cell =>
    parseInt(cell.getAttribute('row')) === targetRow &&
    parseInt(cell.getAttribute('col')) === targetCol
  );

  if (!targetCell || targetCell.classList.contains('impassable') || targetCell.classList.contains('other-group') || targetCell.classList.contains('wall') || targetCell.classList.contains('entity')) {
    console.warn(`No valid target cell found for row ${targetRow}, col ${targetCol}`);
    return;
  }

  // Move player to the new cell
  CURRENT_PLAYER_REGION_DATA.content[currentRow][currentCol].isPlayer = false;
  CURRENT_PLAYER_REGION_DATA.content[targetRow][targetCol].isPlayer = true;


    removeDirectionLine();
    playStepSound();
    await animateToCell(document.querySelector('#inner-neo'), targetCell, offset, key);

}


async function animateToCell(inner, newGroupCell, offset, key) {
  PLAYER_STATE.canMove = false;
  let duration = 1;
  if (SETTINGS.animations === true) {
    duration = SETTINGS.animationTime;
  }
  const initialOrigin = { x: SETTINGS.translateX, y: SETTINGS.translateY };

  let targetOrigin = { ...initialOrigin };

  if (facingDirection in directionMapping) {
    const dir = directionMapping[facingDirection];

    if (offset !== 0) {
      // Determine movement type
      if (key === 65) { // Strafe Left
        targetOrigin.x += -dir.row * offset; // Perpendicular left
        targetOrigin.y += dir.col * offset;
      } else if (key === 68) { // Strafe Right
        targetOrigin.x += dir.row * offset; // Perpendicular right
        targetOrigin.y += -dir.col * offset;
      } else { // Forward/Backward movement
        targetOrigin.x += dir.col * offset;
        targetOrigin.y += dir.row * offset;
      }
    }
  }

  async function animateFrame(timestamp, startTime = null) {
    if (!startTime) startTime = timestamp;
    let progress = Math.min((timestamp - startTime) / duration, 1);

    // translate3d(${SETTINGS.translateX}px, ${SETTINGS.translateY}px, ${0 + SETTINGS.addedTranslateZ + SETTINGS.sneakZ}px)

    SETTINGS.translateX = initialOrigin.x - (targetOrigin.x - initialOrigin.x) * progress;
    SETTINGS.translateY = initialOrigin.y - (targetOrigin.y - initialOrigin.y) * progress;

    inner.style.transform = `
    rotateX(${SETTINGS.angle}deg)  /* Pitch - applied first */
    rotateZ(${SETTINGS.zRotation}deg) /* Yaw - applied second */
    translate3d(${SETTINGS.translateX}px, ${SETTINGS.translateY}px, ${0 + SETTINGS.addedTranslateZ + SETTINGS.sneakZ}px)
    `;

    if (progress < 1) {
      requestAnimationFrame((t) => animateFrame(t, startTime));
    } else {
        SETTINGS.translateX = 0;
        SETTINGS.translateY = 0;
      applyNeoTransforms();
      observeVisibleObjectsFOV();
      await finalizeLocationNewcell(newGroupCell);
    }
  }

  requestAnimationFrame(animateFrame);
}



async function finalizeLocationNewcell(newGroupCell) {

  const groupStore = document.querySelector('.our-group');
  groupStore.style.transform = `translate(0px, 0px) translateZ(3px)`;
  newGroupCell.appendChild(groupStore);

  await updateCurrentGroupPosition(newGroupCell);
  PLAYER_STATE.x = newGroupCell.getAttribute('col');
  PLAYER_STATE.y = newGroupCell.getAttribute('row'); 
  const cam = document.querySelector('#player-camera');
  cam.style.left = '245px';
  cam.style.top = '245px';
  SETTINGS.translateX = 0;
  SETTINGS.translateY = 0;

  entityObserver.updateVisibleEntities();
  updateTargetedDirectionCell();
  // createDirectionLine();
}


function applyNeoTransforms() {
  const inner = document.getElementById('inner-neo');



  inner.parentElement.style.perspective = `${SETTINGS.perspectiveGrid}px`;
  inner.style.scale = `${SETTINGS.zoomFactor}`;

  SETTINGS.transformOriginX = 250;
  SETTINGS.transformOriginY = 250;

  inner.style.transformOrigin = `${SETTINGS.transformOriginX}px ${SETTINGS.transformOriginY}px ${SETTINGS.translateZ}px`;


  inner.style.transform = `
    rotateX(${SETTINGS.angle}deg)  /* Pitch - applied first */
    rotateZ(${SETTINGS.zRotation}deg) /* Yaw - applied second */
    translate3d(${SETTINGS.translateX}px, ${SETTINGS.translateY}px, ${0 + SETTINGS.addedTranslateZ + SETTINGS.sneakZ}px)
    `;

  updateCardboardRotation();
}











function createNeoRegionZone() {

  const veg = CURRENT_PLAYER_REGION_DATA.vegetation;

  const engine = document.getElementById('engine-wrapper');

  const exWin = document.getElementById('neo-region');
  if ( exWin ) exWin.remove();

  const fenetre = document.createElement('div');
  fenetre.setAttribute('id', 'neo-region');

  const inner = document.createElement('div');
  inner.setAttribute('id', 'inner-neo');

  inner.style.setProperty(
    "--after-bg",
    `url('../Art/Vegetation/Textures/${veg}.jpg')`
  );

  fenetre.appendChild(inner);
  engine.appendChild(fenetre);
  
}

const fragment = document.createDocumentFragment();

async function updateNeoRegion(newGroupCell) {
  return new Promise(resolve => {
    const fenetre = document.getElementById('neo-region');
    const inner = fenetre.querySelector('#inner-neo');
    const newCellsSet = new Set(observedCells);
    const currentCells = new Set(inner.children);

    currentCells.forEach(cell => {
      if (!newCellsSet.has(cell) && cell.id !== "skybox" && cell.id !== "player-camera") {
        inner.removeChild(cell);
      }
    });

    observedCells.forEach(cell => {
      if (!currentCells.has(cell)) {
        const board = cell.querySelector('.cardboard')
        if (board) {
          board.style.setProperty(
            "--rotationZ",
            `${SETTINGS.zRotation}deg`
          );
        }
        fragment.appendChild(cell);
      }
    });

    inner.appendChild(fragment);

    resolve();
  });
}



function applyNeoTransforms2() {
  const inner = document.getElementById('inner-neo');

  inner.parentElement.style.perspective = `${SETTINGS.perspectiveGrid}px`;
  inner.style.scale = `${SETTINGS.zoomFactor}`;

  inner.style.transformOrigin = `${SETTINGS.transformOriginX}px ${SETTINGS.transformOriginY}px`;

  inner.style.transform = ` 
    translate3d(${SETTINGS.t3dx}px, ${SETTINGS.t3dy}px, 9px) 
    translateZ(${SETTINGS.translateZ}px) 
    rotateX(${SETTINGS.angle}deg)
    rotateZ(${SETTINGS.zRotation}deg);
`;



  updateCardboardRotation();
}