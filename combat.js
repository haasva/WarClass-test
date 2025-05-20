let inCombatOwnAdventurers = new Map();
let combatGrid = {};
let hasCombatStarted = false;
let combatIntervalId;
let COMBAT_SPEED = 1;
let isPaused = false;
let nextActionTimes = new Map();

function createCombatZone(enemyGroup, gid) {
    hasCombatStarted = false;
    let combatZoneContainer = document.createElement('div');

    combatZoneContainer.setAttribute('id', 'main-combat-box');
    combatZoneContainer.setAttribute('gid', gid);
    combatZoneContainer.classList.add('infobox');

    const tableContainer = document.getElementById('table-container');
    tableContainer.style.display = 'none';

    fetch('/Templates/combat-zone.html')
    .then(response => response.text())
    .then(template => {
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = template;

        // Append combat zone elements
        const elements = tempContainer.children;
        for (const element of elements) {
            combatZoneContainer.appendChild(element);
        }

        // Append combatZoneContainer after template is loaded
        document.body.appendChild(combatZoneContainer);

        // Access combatTableBox after appending combatZoneContainer
        const combatTableBox = document.getElementById('combat-table-box');

        const table = document.createElement('table');
        table.id = 'combat-table';

        for (let i = 0; i < 12; i++) {
            const row = table.insertRow();
            row.classList.add(`${i}`);
            row.classList.add('combat-row');
            if (i === 11) {
                row.classList.add('reserve-row');
            }
            if (i > 7) {
                row.classList.add('own-row');
            }
            if (i < 3) {
                row.classList.add('enemy-row');
            }

            for (let j = 0; j < 12; j++) {
                const cell = row.insertCell();
                cell.textContent = '';
                cell.classList.add('combat-cells');
                cell.classList.add('empty-combat-cells');
                if (!cell.parentElement.classList.contains('reserve-row')) {
                    setCellTexture(cell);
                }
            }
        }

        // Append the table to combatZoneContainer
        combatTableBox.appendChild(table);

        const combatHeader = document.createElement('div');
        combatHeader.setAttribute('id', 'combat-header');
        combatHeader.classList.add('generic-large-header');
        const enemyGroupTitle = enemyGroup.keys().next().value;
        combatHeader.textContent = `Encouter against ${enemyGroupTitle.toString()}`;
        combatZoneContainer.insertBefore(combatHeader, combatZoneContainer.firstChild);

        enableDragAndDropWindow(combatHeader);


        positionGroupAdventurers();
        positionEnemyGroupAdventurers(enemyGroup);

        checkPositionProblem();

        getOwnGroupUnitTarget();
        getEnemyGroupUnitTarget();


        initializeSideBarsCombat();
        activateCombatStartButton();

        let allCombatCells = table.querySelectorAll('.combat-row');
        appendWithAnimation(table, allCombatCells);


    })
    .catch(error => {
        console.error('Error loading template:', error);
    });
}

function setCellTexture(cell) {
    let veg = CURRENT_PLAYER_REGION_DATA.vegetation;
    cell.style.backgroundImage = `url('/Art/Vegetation/Textures/${veg}.jpg')`;
    
}
  


function positionEnemyGroupAdventurers(group) {
    let topRowCells = document.querySelectorAll('#combat-table tr:nth-child(-n+3) td');
    let rows = Array.from(topRowCells).reduce((acc, cell) => {
        let row = acc[cell.parentElement.rowIndex - 1];
        if (!row) {
            row = [];
            acc[cell.parentElement.rowIndex - 1] = row;
        }
        row.push(cell);
        return acc;
    }, []);

    let adventurersMap;

    // Iterate over the entries of the group map
    for (const [key, value] of group.entries()) {
        if (value instanceof Map && value.size > 0) {
            adventurersMap = value;
            currentActiveEnemyGroup = adventurersMap;
            break; // Found the adventurers map, exit the loop
        }
    }

    if (!adventurersMap) {
        console.error('No adventurers found in the group.');
        return;
    }

    let adventurers = Array.from(adventurersMap.values()); // Convert to array for easier iteration

    // Shuffle rows to randomly distribute adventurers among them
    rows = shuffle(rows);

    let occupiedCells = [];

    // Iterate over adventurers
    for (const adventurer of adventurers) {
        let rowIndex = Math.floor(Math.random() * Math.min(rows.length, 3)) - 1; // Random row index (up to 3)
        let row = rows[rowIndex];
        let cellIndex = Math.floor(Math.random() * row.length); // Random cell index within the row
    
        let cell = row[cellIndex];
    
        // Check if the cell is empty or already occupied by an advSprite
        if (cell.classList.contains('empty-combat-cells') || !cell.querySelector('.unit')) {
            // Check if adjacent cells are occupied
            let adjacentOccupied = occupiedCells.filter(occupied => {
                let rowDiff = Math.abs(cell.parentElement.rowIndex - occupied.parentElement.rowIndex);
                let colDiff = Math.abs(cell.cellIndex - occupied.cellIndex);
                return rowDiff <= 1 && colDiff <= 1 && rowDiff + colDiff > 0;
            });
    
            // 20% chance of positioning adjacent to another adventurer
            if (adjacentOccupied.length > 0 && Math.random() <= 0.2) {
                let adjacentCell = adjacentOccupied[Math.floor(Math.random() * adjacentOccupied.length)];
                cell = adjacentCell;
            }
    
            // Append the adventurer to the cell
            const advSprite = createAdvSprite(adventurer);
            advSprite.classList.add('enemy-unit');
            cell.appendChild(advSprite);
            cell.classList.remove('empty-combat-cells');
            occupiedCells.push(cell);
        } else {
            // Pick another cell if the current one is occupied
            let retryCount = 0;
            while (retryCount < 20) {
                rowIndex = Math.floor(Math.random() * Math.min(rows.length, 3)); // Random row index (up to 3)
                row = rows[rowIndex];
                cellIndex = Math.floor(Math.random() * row.length); // Random cell index within the row
                cell = row[cellIndex];
    
                if (cell.classList.contains('empty-combat-cells') || !cell.querySelector('.unit')) {
                    break;
                }
                retryCount++;
            }
    
            // If all retries fail, log a message
            if (retryCount >= 20) {
                console.error('Failed to find an empty cell after 10 retries.');
            } else {
                // Append the adventurer to the cell
                const advSprite = createAdvSprite(adventurer);
                advSprite.classList.add('enemy-unit');
                cell.appendChild(advSprite);
                cell.classList.remove('empty-combat-cells');
                occupiedCells.push(cell);
                addAdvSpriteEventListeners();
            }
        }
    }
    let enemyElements = document.getElementsByClassName('enemy-unit');
    //displayElementsWithDelay(enemyElements);
    
}

// Helper function to shuffle an array
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Helper function to create an adventurer sprite
function createAdvSprite(adventurer) {
    const advSprite = document.createElement('div');
    advSprite.setAttribute('uID', `${adventurer.uID}`);
    advSprite.classList.add('unit');
    advSprite.style.backgroundImage = `url('/Art/Adventurers/${adventurer.Title}.png')`;
    advSprite.textContent = adventurer.uID;
    
    const infoBox = document.createElement('div');
    infoBox.classList.add('adv-combat-info');

    const lifeBar = document.createElement('progress');
    lifeBar.classList.add('lifebar');
    lifeBar.setAttribute('value', `${adventurer.Life}`);
    lifeBar.setAttribute('max', `${adventurer.MaxLife}`);
    lifeBar.textContent = `${adventurer.Life}` + '%';

    const lifeText = document.createElement('div');
    lifeText.classList.add('lifetext');
    lifeText.textContent = `${adventurer.Life}/${adventurer.MaxLife}`;

    const targetName = document.createElement('div');
    targetName.classList.add('target-name');
    targetName.textContent = 'No Target';

    const attackSpeed = document.createElement('div');
    attackSpeed.classList.add('atk-spd');
    const delayAdv = calculateDelay(adventurer.Speed) / 1000;
    attackSpeed.textContent = `${Number(delayAdv.toFixed(2))} a/s`;

    infoBox.appendChild(attackSpeed);

    infoBox.appendChild(lifeBar);
    infoBox.appendChild(lifeText);
    infoBox.appendChild(targetName);

    advSprite.appendChild(infoBox);
    advSprite.addEventListener('mousemove', showTooltip);
    advSprite.addEventListener('mouseenter', showTooltip);


    return advSprite;
}



function positionGroupAdventurers() {
    let bottomRowCells = document.querySelectorAll('#combat-table tr:last-child td');
    let n = bottomRowCells.length; // Number of cells in the bottom row
    let adventurers = Array.from(groupAdventurers.values()); // Convert to array for easier iteration

    // Iterate over both adventurers and cells simultaneously
    for (let i = 0; i < Math.min(adventurers.length, n); i++) {
        const adventurer = adventurers[i];
        const lastPosition = adventurer.lastPosition;

        // Check if the adventurer has a last position stored
        if (lastPosition) {
            adventurer.Active = true;
            const rowIndex = lastPosition.row;
            const colIndex = lastPosition.col;

            // Get the cell corresponding to the last position
            const cell = document.querySelector(`#combat-table tr:nth-child(${rowIndex + 1}) td:nth-child(${colIndex + 1})`);

            // Create and configure advSprite
            const advSprite = createAdvSprite(adventurer);
            advSprite.classList.add('own-unit');

            // Add drag-and-drop functionality
            advSprite.draggable = true;
            advSprite.addEventListener('dragstart', dragStartCombat);
            advSprite.addEventListener('dragover', dragOverCombat);
            advSprite.addEventListener('drop', dropCombat);

            // Remove 'empty-combat-cells' class from cell
            cell.classList.remove('empty-combat-cells');

            // Append advSprite to the cell
            cell.appendChild(advSprite);

            // Add event listeners
            addAdvSpriteEventListeners();
        } else {
            adventurer.Active = false;
            // If no last position is stored, position the adventurer on the bottom row
            const advSprite = createAdvSprite(adventurer);
            advSprite.classList.add('own-unit');

            // Add drag-and-drop functionality
            advSprite.draggable = true;
            advSprite.addEventListener('dragstart', dragStartCombat);
            advSprite.addEventListener('dragover', dragOverCombat);
            advSprite.addEventListener('drop', dropCombat);

            // Remove 'empty-combat-cells' class from bottom row cell
            bottomRowCells[i].classList.remove('empty-combat-cells');

            // Append advSprite to the bottom row cell
            bottomRowCells[i].appendChild(advSprite);

            // Add event listeners
            addAdvSpriteEventListeners();
        }
    }

    // Add drop event listeners to other cells
    const combatCells = document.querySelectorAll('.own-row .combat-cells');
    combatCells.forEach(cell => {
        cell.addEventListener('dragover', dragOverCombat);
        cell.addEventListener('drop', dropCombat);
    });
    let ownGroupElements = document.getElementsByClassName('own-unit');
    //displayElementsWithDelay(ownGroupElements);
}


function dragStartCombat(event) {
    event.dataTransfer.setData('text/plain', event.target.getAttribute('uID'));

    clickSound();

    const highCells = document.getElementsByClassName('highlighted-cell');
    if (highCells) {
        Array.from(otherCells).forEach(cell => {
                cell.classList.remove('highlighted-cell');
        });
    }
}

function removeCombatLine() {
    const lines = document.getElementsByClassName('target-line');
    if (lines) {
        Array.from(lines).forEach(line => {
            line.remove();
        });
    }
}


function dragOverCombat(event) {

    const existingAdventurerInfoContainer = document.getElementById('adventurer-info-container');
  
    if (existingAdventurerInfoContainer) {
      existingAdventurerInfoContainer.remove();
    }

    event.preventDefault();
    event.target.classList.add('hovered-cell-drag');

    const otherCells = document.getElementsByClassName('hovered-cell-drag');
    if (otherCells) {
        Array.from(otherCells).forEach(cell => {
            if (cell != event.target) {
                cell.classList.remove('hovered-cell-drag');
            }
        });
    }
    
    removeCombatLine();
}

function dropCombat(event) {
    event.preventDefault();
    event.target.classList.remove('hovered-cell-drag');
    const draggedUID = event.dataTransfer.getData('text/plain');
    const draggedElement = document.querySelector(`.unit[uID="${draggedUID}"]`);
    const targetCell = event.target.closest('.combat-cells');
    const originalCell = draggedElement.parentElement;
    originalCell.classList.add('empty-combat-cells');

    let movedAdventurer = findAdventurerByUID(draggedUID);

    if (targetCell && targetCell.parentElement.classList.contains('own-row') && targetCell.classList.contains('empty-combat-cells')) {
        // Move the dragged element to the target cell
        targetCell.appendChild(draggedElement);
        targetCell.classList.remove('empty-combat-cells');
        checkPositionProblem();
        rememberAdventurerLastPosition(movedAdventurer, targetCell);

        addAdvSpriteEventListeners();

        const audio = new Audio("/Sounds/bloc2.mp3");
        audio.volume = 0.8;
        audio.play();
        
        const lines = document.getElementsByClassName('target-line');
        if (lines) {
            Array.from(lines).forEach(line => {
                line.remove();
            });
        }


            
        if (targetCell.parentElement.classList.contains('reserve-row')) {
            movedAdventurer.Active = false;

        }

        
    }

    getOwnGroupUnitTarget();
    getEnemyGroupUnitTarget();
    addAdvSpriteEventListeners();
    initializeSideBarsCombat();
    
}

function rememberAdventurerLastPosition(adventurer, targetCell) {
    // Get the row and column indices of the target cell
    const rowIndex = targetCell.parentElement.rowIndex;
    const colIndex = targetCell.cellIndex;

    // Store the position in the adventurer's data
    adventurer.lastPosition = { row: rowIndex, col: colIndex };
}


function getEnemyGroupUnitTarget() {
    let isEnemy = true;
    const enemyUnits = document.querySelectorAll('.own-unit:not(.reserve-row .own-unit)');
    const ownUnits = document.querySelectorAll('.enemy-unit');

    ownUnits.forEach(ownUnit => {
        const ownUID = ownUnit.getAttribute('uid');

        let minDistance = Infinity;
        let targetEnemy = null;

        // Find the closest enemy unit
        enemyUnits.forEach(enemyUnit => {
            const enemyUID = enemyUnit.getAttribute('uid');
            const ownRect = ownUnit.getBoundingClientRect();
            const enemyRect = enemyUnit.getBoundingClientRect();

            // Calculate distance between own and enemy units
            const distance = Math.sqrt(
                Math.pow(ownRect.left - enemyRect.left, 2) +
                Math.pow(ownRect.top - enemyRect.top, 2)
            );

            // Update closest enemy unit
            if (distance < minDistance) {
                minDistance = distance;
                targetEnemy = enemyUID;
            }
        });

        if (targetEnemy) {
            drawLineTarget(ownUID, targetEnemy, isEnemy);
        }
    });
}

function getOwnGroupUnitTarget() {
    let isEnemy = false;
    const ownUnits = document.querySelectorAll('.own-unit:not(.reserve-row .own-unit)');
    const enemyUnits = document.querySelectorAll('.enemy-unit');

    ownUnits.forEach(ownUnit => {
        const ownUID = ownUnit.getAttribute('uid');

        let movedAdventurer = findAdventurerByUID(ownUID);

        if (movedAdventurer) {
            movedAdventurer.Active = true;
        }

        let minDistance = Infinity;
        let targetEnemy = null;

        // Find the closest enemy unit
        enemyUnits.forEach(enemyUnit => {
            const enemyUID = enemyUnit.getAttribute('uid');
            const ownRect = ownUnit.getBoundingClientRect();
            const enemyRect = enemyUnit.getBoundingClientRect();

            // Calculate distance between own and enemy units
            const distance = Math.sqrt(
                Math.pow(ownRect.left - enemyRect.left, 2) +
                Math.pow(ownRect.top - enemyRect.top, 2)
            );

            // Update closest enemy unit
            if (distance < minDistance) {
                minDistance = distance;
                targetEnemy = enemyUID;
            }
        });

        if (targetEnemy) {
            drawLineTarget(ownUID, targetEnemy, isEnemy);
        }
    });
}

function drawLineTarget(sourceUID, targetUID, isEnemy) {
    let sourceUnit = document.querySelector(`.unit[uID="${sourceUID}"]`);
    let targetUnit = document.querySelector(`.unit[uID="${targetUID}"]`);

    if (!sourceUnit || !targetUnit) {
        console.error('Source or target unit not found.');
        return;
    }

    const sourceRect = sourceUnit.getBoundingClientRect();
    const targetRect = targetUnit.getBoundingClientRect();

    const sourceX = sourceRect.left + sourceRect.width / 2;
    const sourceY = sourceRect.top + sourceRect.height / 2;
    const targetX = targetRect.left + targetRect.width / 2;
    const targetY = targetRect.top + targetRect.height / 2;

    const distance = Math.sqrt(Math.pow(targetX - sourceX, 2) + Math.pow(targetY - sourceY, 2));

    const angle = Math.atan2(targetY - sourceY, targetX - sourceX);

    const line = document.createElement('div');
    line.classList.add('target-line');
    line.style.position = 'absolute';
    line.style.width = `${distance}px`;
    line.style.height = '0';
    line.style.left = `${sourceX}px`;
    line.style.top = `${sourceY}px`;
    line.style.transformOrigin = '0 0';
    line.style.transform = `rotate(${angle}rad)`;

    line.setAttribute('id', `${sourceUID}`);

    if (hasCombatStarted === true) {
        line.classList.add('in-combat-line');
    }

    if (isEnemy === true) {
        line.classList.add('enemy-group-line');
    } else if (isEnemy === false) {
        line.classList.add('own-group-line');
    }

    document.body.appendChild(line);

    setIndividualTarget(sourceUID, targetUID, sourceUnit);
}



function setIndividualTarget(sourceUID, targetUID, sourceUnit) {

let sourceAdventurer = findAdventurerByUID(sourceUID);
let targetAdventurer = findAdventurerByUID(targetUID);



    const targetText = targetAdventurer.Title.toString();
    sourceAdventurer.Target = targetAdventurer;

    const targetElement = sourceUnit.querySelector(`.target-name`);
    targetElement.innerText = `${targetText}`;
}




function addAdvSpriteEventListeners() {
    const advSprites = document.querySelectorAll('.unit');
    advSprites.forEach(advSprite => {
        advSprite.addEventListener('mouseenter', handleAdvSpriteMouseEnter);
        advSprite.addEventListener('mouseleave', handleAdvSpriteMouseLeave);
        advSprite.addEventListener('mouseover', showTooltip);
        advSprite.addEventListener('mouseenter', showTooltip);
        advSprite.addEventListener('click', showTooltip);
    });
}

function handleAdvSpriteMouseEnter(event) {
    const uid = event.target.getAttribute('uID');
    const adventurer = findAdventurerByUID(uid);
    const range = adventurer.Range;

    clearCellHighlights();
    highlightCellsInRange(event.target.parentElement, range);
}

function handleAdvSpriteMouseLeave(event) {
    const uid = event.target.getAttribute('uID');
    clearCellHighlights();

}




function clearCellHighlights() {
    const highlightedCells = document.querySelectorAll('.highlighted-cell');
    highlightedCells.forEach(cell => {
        cell.classList.remove('highlighted-cell');
    });
}

function highlightCellsInRange(startCell, range) {
    const rowIndex = startCell.parentElement.rowIndex;
    const colIndex = startCell.cellIndex;

    for (let i = rowIndex - range; i <= rowIndex + range; i++) {
        for (let j = colIndex - range; j <= colIndex + range; j++) {
            const cell = getCellByIndex(i, j);
            if (cell && isWithinRange1(rowIndex, colIndex, i, j, range)) {
                cell.classList.add('highlighted-cell');
            }
        }
    }
}

function getCellByIndex(rowIndex, colIndex) {
    const rows = document.getElementById('combat-table').rows;
    if (rowIndex >= 0 && rowIndex < rows.length) {
        const cells = rows[rowIndex].cells;
        if (colIndex >= 0 && colIndex < cells.length) {
            return cells[colIndex];
        }
    }
    return null;
}

function isWithinRange1(startRow, startCol, row, col, range) {
    const rowDiff = Math.abs(row - startRow);
    const colDiff = Math.abs(col - startCol);
    return rowDiff + colDiff <= range;
}








function activateCombatStartButton() {
    const combatBox = document.getElementById('combat-container');

    const combatBoxActions = document.createElement('div');
    combatBoxActions.setAttribute('id', 'combat-sidebox');

    const combatStartButton = document.createElement('button');
    combatStartButton.innerText = 'FIGHT';
    combatStartButton.setAttribute('id', 'start-combat');



    combatStartButton.addEventListener('click', function(event) {
            StartCombat(combatStartButton);
        }, { once: true });
    

    const combatCloseButton = document.createElement('button');
    combatCloseButton.setAttribute('id', 'exit-combat');
    combatCloseButton.innerText = 'EXIT';

    combatCloseButton.setAttribute('onclick', 'ExitCombat()')

    combatBox.appendChild(combatBoxActions);

    combatBoxActions.appendChild(combatStartButton);
    combatBoxActions.appendChild(combatCloseButton);


    document.addEventListener('keydown', function(event) {
        if (event.keyCode === 70 && combatStartButton) {
            StartCombat(combatStartButton);
        }
    }, { once: true });

    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape" && combatCloseButton) {
            ExitCombat();
        }
    });

    appendSpeedSlider(combatBoxActions);
}

document.addEventListener('keydown', function(event) {
    let combatPauseButton = document.getElementById('pause-combat');
    if (event.keyCode === 82 && combatPauseButton) {
        pauseCombat();
    }
});

function appendSpeedSlider(container) {

    const sliderBox = document.createElement('div');
    sliderBox.setAttribute('id', 'combat-slider-box');

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '1';
    slider.max = '4';
    slider.value = COMBAT_SPEED;
    slider.id = 'speed-slider';

    sliderBox.appendChild(slider);
    const sliderValue = document.createElement('div');
    sliderValue.classList.add('combat-speed-text');
    sliderValue.textContent = `${COMBAT_SPEED} (normal)`;
    sliderBox.appendChild(sliderValue);

    container.appendChild(sliderBox);

    // Add event listener to handle slider changes
    slider.addEventListener('input', function() {
        // Update COMBAT_SPEED value based on slider value
        COMBAT_SPEED = parseInt(slider.value);

        if (COMBAT_SPEED === 1) {
            sliderValue.textContent = `${COMBAT_SPEED} (normal)`;
        } else if (COMBAT_SPEED > 1 && COMBAT_SPEED < 3) {
            sliderValue.textContent = `${COMBAT_SPEED} (fast)`;
        } else {
            sliderValue.textContent = `${COMBAT_SPEED} (insane!)`;
        }
        
    });
}


function pauseCombat() {
let combatTable = document.getElementById('combat-table');
if (hasCombatStarted === true && combatTable) {
    isPaused = !isPaused; // Toggle the paused state

    document.getElementById('pause-combat').textContent = isPaused ? 'Resume' : 'Pause';

    if (isPaused) {
        combatTable.classList.add('paused');
    } else {
        combatTable.classList.remove('paused');
    }
}
}


function ExitCombat() {
let combatZone = document.getElementById('main-combat-box');
if (combatZone) {


    isPaused = false;
    if (combatIntervalId) {
        clearInterval(combatIntervalId);
        combatIntervalId = null; // Reset the interval ID variable
    }

    const lines = document.getElementsByClassName('target-line');
    if (lines) {
        Array.from(lines).forEach(line => {
            line.remove();
        });
    }


inCombatOwnAdventurers = new Map();
currentActiveEnemyGroup = new Map();
combatGrid = {};
combatZone.remove();

for (const [, adventurer] of groupAdventurers) {
adventurer.Active = false;
}
for (const [, adventurer] of currentActiveEnemyGroup) {
adventurer.Active = false;
}

    const tableContainer = document.getElementById('table-container');
    tableContainer.style.display = '';

hasCombatStarted = false;

}
}



function appendPauseCombatButton() {
let combatBox = document.getElementById('combat-sidebox');
    const combatPauseButton = document.createElement('button');
    combatPauseButton.setAttribute('id', 'pause-combat');
    combatPauseButton.innerText = 'Pause';
    combatBox.prepend(combatPauseButton);
    combatPauseButton.disabled = true;

    combatPauseButton.addEventListener('click', () => {
            pauseCombat();
    });
}


function StartCombat(combatStartButton) {

    isPaused = false;
    appendPauseCombatButton();
const pauseButton = document.getElementById('pause-combat');
pauseButton.disabled = false;



combatStartButton.disabled = true;
combatStartButton.style.display = 'none';

nextActionTimes = new Map();

    initializeSideBarsCombat();
    initializeDPSCounterCombat();
    getOwnGroupUnitTarget();
    getEnemyGroupUnitTarget();

    const ownRows = document.getElementsByClassName('own-row');
        Array.from(ownRows).forEach(row => {
            row.classList.remove('own-row');
        });
    const reserveRow = document.querySelector('.reserve-row');
            reserveRow.remove();

    const lines = document.getElementsByClassName('target-line');
    if (lines) {
        Array.from(lines).forEach(line => {
            line.remove();
        });
    }

    const advSprites = document.querySelectorAll('.own-unit');
    advSprites.forEach(advSprite => {

        advSprite.draggable = false;
        for (const [, adventurer] of groupAdventurers) {
            if (adventurer.Active === true) {
                advSprite.classList.add('active-adventurer');
                inCombatOwnAdventurers.set(adventurer.uID, adventurer);
            } else if (adventurer.Active === false) {
                advSprite.classList.remove('active-adventurer');
            }
          }
    });

    displayMessage(`Combat is starting!`, 'red');

    hasCombatStarted = true;

    const tableRows = document.getElementById('combat-table').rows;
    const numRows = tableRows.length - 1; // Exclude the last row
    
    combatGrid = {
        rows: [],
        cols: tableRows[0].cells.length
    };
    
    // Iterate over the rows of the table up to the second-to-last row
    for (let i = 0; i < numRows; i++) {
        combatGrid.rows.push(tableRows[i]);
    }

    if (combatIntervalId) {
        clearInterval(combatIntervalId);
    }
    
    initializeNextActionTimes(inCombatOwnAdventurers);
    initializeNextActionTimes(currentActiveEnemyGroup);

    combatIntervalId = setInterval(async () => {
        if (isPaused) return; // Skip the combat loop if paused

        await combatLoop(combatGrid);

        // Add event listener to handle slider changes
        slider.addEventListener('input', function() {
            // Update COMBAT_SPEED value based on slider value
            COMBAT_SPEED = parseInt(slider.value);
            sliderValue.textContent = `${COMBAT_SPEED}`;
        });

        let enemyHP = calculateTotalCurrentEnemyGroupLife();
        let ourHP = calculateTotalCurrentOwnGroupLife();
        if (enemyHP <= 0) {
            if (combatIntervalId) {
                clearInterval(combatIntervalId);
                combatIntervalId = null; // Reset the interval ID variable
                const victory = true;
                postCombatScreen(victory, currentActiveEnemyGroup);
            }
        }
        if (ourHP <= 0) {
            if (combatIntervalId) {
                clearInterval(combatIntervalId);
                combatIntervalId = null; // Reset the interval ID variable
                const victory = false;
                postCombatScreen(victory, currentActiveEnemyGroup);
            }
        }
    }, COMBAT_SPEED);
}

async function combatLoop() {
    const lines = document.getElementsByClassName('target-line');
    if (lines) {
        Array.from(lines).forEach(line => {
            line.remove();
        });
    }
    getOwnGroupUnitTarget();
    getEnemyGroupUnitTarget();

    moveAdventurers(inCombatOwnAdventurers, '.own-unit', '.enemy-unit');
    moveAdventurers(currentActiveEnemyGroup, '.enemy-unit', '.own-unit');

    addAdvSpriteEventListeners();


}

function initializeSideBarsCombat() {
    let enemyCurrentTotalLife = 0;
    let ownGroupCurrentTotalLife = 0;
    let ownGroupCurrentlLife = 0;

    for (const [, adventurer] of currentActiveEnemyGroup) {
        enemyCurrentTotalLife += adventurer.Life;
    }

    for (const [, adventurer] of groupAdventurers) {
        if (adventurer.Active === true) {
            ownGroupCurrentTotalLife += adventurer.MaxLife;
            ownGroupCurrentlLife += adventurer.Life;
        }
    }

    

    const enemyBar = document.getElementById('enemy-group-life-bar');
    const ownBar = document.getElementById('own-group-life-bar');

    enemyBar.setAttribute('value', enemyCurrentTotalLife);
    ownBar.setAttribute('value', ownGroupCurrentlLife);

    enemyBar.setAttribute('max', enemyCurrentTotalLife);
    ownBar.setAttribute('max', ownGroupCurrentTotalLife);
}

function calculateTotalCurrentEnemyGroupLife() {
    let enHPTotal = 0;
    for (const [, adventurer] of currentActiveEnemyGroup) {
        enHPTotal += Number(adventurer.Life) || 0;
    }
    return enHPTotal;
}
function calculateTotalCurrentOwnGroupLife() {
    let ownHPTotal = 0;
    for (const [, adventurer] of groupAdventurers) {
        if (adventurer.Active === true) {
            ownHPTotal += Number(adventurer.Life) || 0;
        }
    }
    return ownHPTotal;
}
function calculateTotalMaxOwnGroupLife() {
    let ownHPTotal = 0;
    for (const [, adventurer] of groupAdventurers) {
        if (adventurer.Active === true) {
            ownHPTotal += Number(adventurer.MaxLife) || 0;
        }
    }
    return ownHPTotal;
}


class PriorityQueue {
    constructor() {
        this.queue = [];
    }

    enqueue(item, priority) {
        this.queue.push({ item, priority });
        this.queue.sort((a, b) => a.priority - b.priority);
    }

    dequeue() {
        return this.queue.shift().item;
    }

    isEmpty() {
        return this.queue.length === 0;
    }
}

async function startCombatAdventurerMovement(combatGrid) {
    const ownGroupPromise = moveAdventurers(inCombatOwnAdventurers, '.own-unit', '.enemy-unit');
    const enemyGroupPromise = moveAdventurers(currentActiveEnemyGroup, '.enemy-unit', '.own-unit');
    await Promise.all([ownGroupPromise, enemyGroupPromise]);
}




function initializeNextActionTimes(groupMap) {
    groupMap.forEach(adventurer => {
        const delayAdv = calculateDelay(adventurer.Speed);
        nextActionTimes.set(adventurer.uID, Date.now() + delayAdv);
    });
}

function calculateDelay(speed) {
    const baseDelay = 600; // ms
    const minDelay = 50; // ms
    const delayReductionPerSpeedPoint = 15; // ms

    // Calculate the delay based on the speed
    let delay = (baseDelay - (speed - 1) * delayReductionPerSpeedPoint) / COMBAT_SPEED;

    // Ensure the delay doesn't go below the minimum
    delay = Math.max(delay, minDelay);

    return delay;
}

function moveAdventurers(groupMap, advSpriteSelector, targetAdvSpriteSelector) {
    const currentTime = Date.now();

    groupMap.forEach(adventurer => {
        updatePartyLeftSide(adventurer);
        const nextActionTime = nextActionTimes.get(adventurer.uID);
        if (currentTime >= nextActionTime) {
            processAdventurer(adventurer, advSpriteSelector, targetAdvSpriteSelector);
            const delayAdv = calculateDelay(adventurer.Speed);
            nextActionTimes.set(adventurer.uID, currentTime + delayAdv);
        }
    });
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function processAdventurer(adventurer, advSpriteSelector, targetAdvSpriteSelector) {
    const advSprite = document.querySelector(`${advSpriteSelector}[uID="${adventurer.uID}"]`);
    if (!advSprite) {
        console.error(`AdvSprite not found for adventurer with uID ${adventurer.uID}`);
        return;
    }

    const targetUID = adventurer.Target.uID;
    const targetAdventurer = findAdventurerByUID(targetUID);
    const targetAdvSprite = document.querySelector(`${targetAdvSpriteSelector}[uID="${targetUID}"]`);
    if (!targetAdvSprite) {
        console.error(`Target AdvSprite not found for adventurer with uID ${adventurer.uID}`);
        return;
    }

    const startCell = advSprite.parentElement;
    const targetCell = targetAdvSprite.parentElement;

    let isRanged = ['Archery', 'Gunpowder'].some(s => adventurer.Specialty.includes(s));
    let isSupport = adventurer.Specialty.includes('Non-fighting');

    if (isWithinRangeAdventurer(startCell, targetCell, adventurer.Range)) {
        if (isRanged) {
            if (Math.random() <= 0.4) {
                moveAwayFromTarget(advSprite, startCell, targetCell);
            } else {
                attackTargetAdventurer(adventurer, advSprite, targetAdventurer, targetAdvSprite);
            }
        } else {
            attackTargetAdventurer(adventurer, advSprite, targetAdventurer, targetAdvSprite);
        }
    } else if (!isSupport) {
        moveAdvSpriteTowardsTarget(advSprite, targetAdvSprite);
    }

    checkPositionProblem();
}


async function attackTargetAdventurer (adventurer, advSprite, targetAdventurer, targetAdvSprite) {
    const attacker = adventurer;
    const defender = targetAdventurer;
    const attackerElement = advSprite;
    const defenderElement = targetAdvSprite;

    await preAttackAnimation(attacker, defender, attackerElement, defenderElement);
    setTimeout(() => {
        applyDamage(attacker, defender, attackerElement, defenderElement);
        updateSideBarsCombat();
      }, 10);
}

function applyDamage (attacker, defender, attackerElement, defenderElement) {

    let damageType;
    let defenseType;
    let damage = attacker.Attack;
    let reducedDamage;
    let defenderHR = defender.HandResist;
    let defenderRR = defender.RangedResist;

    const attackerSpecialties = attacker.Specialty.split(',').map(s => s.trim());
  
    if (attackerSpecialties.includes('Melee')) {
        damageType = 'melee';
    }
    if (attackerSpecialties.includes('Unarmed')) {
        damageType = 'unarmed';
    }
    if (attackerSpecialties.includes('Gunpowder')) {
        damageType = 'gunpowder';
    }
    if (attackerSpecialties.includes('Archery')) {
        damageType = 'archery';
    }

    if (damageType === 'melee' || damageType === 'unarmed') {
        defenseType = 'handRes';
        if (!isNaN(defenderHR)) {
            reducedDamage = Math.round(damage * (100 - defenderHR) / 100);
        } else {
            // Handle the case when defenderHR is NaN
            reducedDamage = damage;
        }
    }
    if (damageType === 'archery' || damageType === 'gunpowder') {
        defenseType = 'rangeRes';
        if (!isNaN(defenderRR)) {
            reducedDamage = Math.round(damage * (100 - defenderRR) / 100);
        } else {
            // Handle the case when defenderRR is NaN
            reducedDamage = damage;
        }
    }
    
    // Ensure reducedDamage is a number before subtracting from defender.Life
    if (!isNaN(reducedDamage)) {
        defender.Life = parseInt(defender.Life - reducedDamage);
    } else {
        // Handle the case when reducedDamage is NaN
        defender.Life = parseInt(defender.Life);
    }

    if (hasCombatStarted === true) {

    const defenderLifeBar = defenderElement.querySelector('.lifebar');
    defenderLifeBar.value = parseInt(defender.Life);

    const defenderLifeText = defenderElement.querySelector('.lifetext');
    defenderLifeText.textContent = `${defender.Life}/${defender.MaxLife}`;


        damageDisplayNumber(defenderElement, reducedDamage);
        updateSideBarsCombat(reducedDamage);
        updateDPSCounterCombat(attacker, reducedDamage);
        if (defender.Life < 1) {
            defender.Life = 0;
            defenderElement.remove();

            const dmgCounters = Array.from(document.querySelectorAll('.unit-dps'));
            const dmgCounter = dmgCounters.find(counter => counter.getAttribute('uid') === `${defender.uID}`);
            const picDead = dmgCounter.querySelector('.pic-dead');
            picDead.style.display = 'block';
            dmgCounter.classList.add('dead-adv');

        }
    }

}

function updateSideBarsCombat() {
    let enemyCurrentTotalLife = 0;
    let ownGroupCurrentTotalLife = 0;

    for (const [, adventurer] of currentActiveEnemyGroup) {
        enemyCurrentTotalLife += adventurer.Life;
    }

    for (const [, adventurer] of groupAdventurers) {
        if (adventurer.Active === true) {
            ownGroupCurrentTotalLife += adventurer.Life;
        }
    }
    
    const enemyBar = document.getElementById('enemy-group-life-bar');
    const ownBar = document.getElementById('own-group-life-bar');

    enemyBar.setAttribute('value', enemyCurrentTotalLife);
    ownBar.setAttribute('value', ownGroupCurrentTotalLife);
}

function moveAwayFromTarget(advSprite, startCell, targetCell) {
    const emptyAdjacentCell = findEmptyAdjacentCell(startCell, targetCell);
    if (emptyAdjacentCell) {
        // Move advSprite to the empty adjacent cell
        startCell.classList.add('empty-combat-cells');
        emptyAdjacentCell.appendChild(advSprite);
        emptyAdjacentCell.classList.remove('empty-combat-cells');
    } else {
        
    }
}

function isWithinRangeAdventurer(startCell, targetCell, range) {
    const startX = startCell.cellIndex;
    const startY = startCell.parentElement.rowIndex;
    const targetX = targetCell.cellIndex;
    const targetY = targetCell.parentElement.rowIndex;

    const distance = Math.abs(targetX - startX) + Math.abs(targetY - startY);
    return distance <= range;
}



function moveAdvSpriteTowardsTarget(advSprite, targetAdvSprite) {

    const currentCell = advSprite.parentElement;
    const targetCell = targetAdvSprite.parentElement;

    // Check if advSprite is already adjacent to targetAdvSprite
    if (isAdjacent(currentCell, targetCell)) {
        
        return;
    }

    // Find adjacent cell that allows moving closer to targetAdvSprite
    let adjacentCell = findAdjacentCell(currentCell, targetCell);
    
    // If the adjacent cell already contains an advSprite, find another adjacent cell
    const maxIterations = 10; // Set a maximum number of iterations
    let iterations = 0; // Initialize a counter for iterations
    while (adjacentCell && adjacentCell.querySelector('.unit')) {
        adjacentCell = findAdjacentCell(adjacentCell, targetCell);
        iterations++; // Increment the counter
        if (iterations >= maxIterations) {
            console.error('Exceeded maximum iterations in finding empty adjacent cell');
            break; // Break out of the loop
        }
    }

    if (!adjacentCell) {
        console.error('No adjacent cell found to move closer to targetAdvSprite');
        return;
    }

    currentCell.classList.add('empty-combat-cells');

    // Move advSprite to the adjacent cell
    adjacentCell.appendChild(advSprite);
    adjacentCell.classList.remove('empty-combat-cells');
}


function isAdjacent(cell1, cell2) {
    const rowDiff = Math.abs(cell1.parentElement.rowIndex - cell2.parentElement.rowIndex);
    const colDiff = Math.abs(cell1.cellIndex - cell2.cellIndex);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

function findEmptyAdjacentCell(startCell, targetCell) {
    // Define directions to check for empty adjacent cells
    const directions = [
        { row: -1, col: 0 }, // Up
        { row: 1, col: 0 },  // Down
        { row: 0, col: -1 }, // Left
        { row: 0, col: 1 }   // Right
    ];

    // Check each direction for an empty adjacent cell
    for (const dir of directions) {
        const row = startCell.parentElement.rowIndex + dir.row;
        const col = startCell.cellIndex + dir.col;
        const cell = getCellByIndex(row, col);
        if (cell && cell.classList.contains('empty-combat-cells') && !isAdjacent(cell, targetCell)) {
            return cell;
        }
    }
    return null;
}

function findAdjacentCell(currentCell, targetCell) {
    const rowIndex = currentCell.parentElement.rowIndex;
    const colIndex = currentCell.cellIndex;

    // Define possible moves (up, down, left, right)
    const possibleMoves = [
        { row: rowIndex - 1, col: colIndex }, // Up
        { row: rowIndex + 1, col: colIndex }, // Down
        { row: rowIndex, col: colIndex - 1 }, // Left
        { row: rowIndex, col: colIndex + 1 }, // Right
    ];

    // Filter out invalid moves (outside the grid or diagonal moves)
    const validMoves = possibleMoves.filter(move => {
        return move.row >= 0 && move.row < combatGrid.rows.length && move.col >= 0 && move.col < combatGrid.cols &&
            (move.row === rowIndex || move.col === colIndex);
    });

    

    // Sort valid moves based on distance to targetCell
    validMoves.sort((move1, move2) => {
        const distance1 = Math.abs(move1.row - targetCell.parentElement.rowIndex) +
                          Math.abs(move1.col - targetCell.cellIndex);
        const distance2 = Math.abs(move2.row - targetCell.parentElement.rowIndex) +
                          Math.abs(move2.col - targetCell.cellIndex);
        return distance1 - distance2;
    });

    

    // Find the closest valid move to the targetCell
    const closestMove = validMoves[0];

    

    // Return the corresponding cell
    return combatGrid.rows[closestMove.row].cells[closestMove.col];
}








function checkPositionProblem() {
    const combatCells = document.querySelectorAll('.combat-cells');

    combatCells.forEach(cell => {
        const unitCount = cell.querySelectorAll('.unit').length;

        if (unitCount >= 2) {
            const nearestEmptyCell = findNearestEmptyCell(cell);

            if (nearestEmptyCell) {
                const units = cell.querySelectorAll('.unit');
                units.forEach(unit => {
                    nearestEmptyCell.appendChild(units[0]);
                });
            }
        }
    });
}

function findNearestEmptyCell(cell) {
    const range = [
        { row: -1, col: 0 }, // top
        { row: 1, col: 0 }, // bottom
        { row: 0, col: -1 }, // left
        { row: 0, col: 1 } // right
    ];

    for (const direction of range) {
        const rowIndex = cell.parentElement.rowIndex + direction.row;
        const colIndex = cell.cellIndex + direction.col;
        const adjacentCell = getCell(rowIndex, colIndex);

        if (adjacentCell && adjacentCell.classList.contains('empty-combat-cells')) {
            return adjacentCell;
        }
    }

    return null;
}

function getCell(rowIndex, colIndex) {
    const combatTable = document.getElementById('combat-table');

    if (combatTable && rowIndex >= 0 && rowIndex < combatTable.rows.length - 1 && colIndex >= 0 && colIndex < combatTable.rows[0].cells.length) {
        return combatTable.rows[rowIndex].cells[colIndex];
    }

    return null;
}



function initializeDPSCounterCombat() {

    let dpsCounterBox = document.getElementById('dps_counters');


    for (const [, adventurer] of currentActiveEnemyGroup) {

        adventurer.Dmg = 0;
        adventurer.AttackMeter = 0;

        const dpsBar = document.createElement('div');
        dpsBar.setAttribute('uid', `${adventurer.uID}`);
        dpsBar.classList.add('unit-dps');
        dpsBar.classList.add('enemy');
        dpsBar.textContent = `${adventurer.Title}`;

        const attackMeter = document.createElement('div');
        attackMeter.classList.add('attack-meter');
        dpsBar.appendChild(attackMeter);

        dpsBar.setAttribute('dmg', `${adventurer.Dmg}`);

        const pic = document.createElement('div');
        pic.classList.add('pic');
        pic.style.backgroundImage = `url('/Art/Adventurers/${adventurer.Title}.png')`;
        dpsBar.appendChild(pic);

        const picDead = document.createElement('div');
        picDead.classList.add('pic-dead');
        pic.appendChild(picDead);

        dpsCounterBox.appendChild(dpsBar);
    }

    for (const [, adventurer] of groupAdventurers) {
        if (adventurer.Active === true) {

            adventurer.Dmg = 0;
            adventurer.AttackMeter = 0;

            const dpsBar = document.createElement('div');
            dpsBar.setAttribute('uid', `${adventurer.uID}`);
            dpsBar.classList.add('unit-dps');
            dpsBar.classList.add('own');
            dpsBar.textContent = `${adventurer.Title}`;



            const attackMeter = document.createElement('div');
            attackMeter.classList.add('attack-meter');
            dpsBar.appendChild(attackMeter);

            dpsBar.setAttribute('dmg', `${adventurer.Dmg}`);

            const pic = document.createElement('div');
            pic.classList.add('pic');
            pic.style.backgroundImage = `url('/Art/Adventurers/${adventurer.Title}.png')`;
            dpsBar.appendChild(pic);

            const picDead = document.createElement('div');
            picDead.classList.add('pic-dead');
            pic.appendChild(picDead);

            dpsCounterBox.appendChild(dpsBar);
        }
    }
}


function updateDPSCounterCombat(adventurer, dmg) {
    adventurer.Dmg += dmg;
    adventurer.AttackMeter += 1;

    const dmgCounterContainer = document.getElementById('dps_counters');
    const dmgCounters = Array.from(dmgCounterContainer.querySelectorAll('.unit-dps'));

    let dmgCounter = dmgCounters.find(counter => counter.getAttribute('uid') === `${adventurer.uID}`);
    
    if (dmgCounter) {

        let attackMeter = dmgCounter.querySelector('.attack-meter');
        attackMeter.textContent = `${adventurer.AttackMeter}`;

        let currentDmg = parseInt(dmgCounter.getAttribute('dmg')) || 0;
        let targetDmg = adventurer.Dmg;
        
        // Calculate the step size based on the difference between current and target dmg
        let step = 1; // Adjust step size as needed

        // Start a timer to incrementally update the dmg attribute
        let timer = setInterval(() => {
            if (currentDmg < targetDmg) {
                currentDmg += step;
                dmgCounter.setAttribute('dmg', currentDmg);
            } else {
                clearInterval(timer); // Stop the timer when target dmg is reached
                
                // Reorder the dmgCounters based on their dmg attribute
                dmgCounters.sort((a, b) => {
                    const dmgA = parseInt(a.getAttribute('dmg')) || 0;
                    const dmgB = parseInt(b.getAttribute('dmg')) || 0;
                    return dmgB - dmgA; // Sort in descending order
                });
                
                // Append the sorted counters back to the container
                dmgCounters.forEach(counter => dmgCounterContainer.appendChild(counter));
            }
        }, dmg); // Adjust the interval (in milliseconds) as needed
    }
}


async function postCombatScreen(victory, currentActiveEnemyGroup) {

    let combatPauseButton = document.getElementById('pause-combat');
    combatPauseButton.remove();

    let expGain = 0;
    let nbEDefeated = 0;

    for (const [, adventurer] of currentActiveEnemyGroup) {
        if (adventurer.Life <= 0) {
            const rarityMultiplier = getRarityMultiplier(adventurer.Rarity);
            expGain += Math.round((10 + adventurer.Level) * (rarityMultiplier * 1.5));
            nbEDefeated ++;
        }
    }

    expGain = expGain * 2;

let combatTable = document.getElementById('combat-table-box');
combatTable.innerHTML = '';
combatTable.classList.add('post-combat-screen');
await loadPostCombatScreenTemplate(combatTable);

async function loadPostCombatScreenTemplate() {
    try {
          const response = await fetch('/Templates/post-combat-screen.html');
          const html = await response.text();
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = html;
          combatTable.appendChild(tempDiv.firstElementChild);
      } catch (error) {
          console.error('Error', error);
      }
}

let pcMain = document.getElementById('post-combat-screen')
let pcHeader = pcMain.querySelector('.top');
let pcMid = pcMain.querySelector('.middle ');
let pcBottom = pcMain.querySelector('.bottom');

if (victory === true) {
    pcHeader.innerText = '♪ Victory! ♫';
    expGain = expGain * 1.5;
    pcMid.innerText = `We gain ${expGain} experience (${nbEDefeated} enemy adventurers defeated).`;
    pcMid.appendChild(showCultureFragmentGained(currentActiveEnemyGroup));
    pcBottom.style.display = 'block';
    displayAdventurersToCapture(pcBottom, currentActiveEnemyGroup);
    displayPostChoicesButton(pcBottom);
} else {
    pcHeader.innerText = '☹ Defeat!';
    pcMid.innerText = `We gain ${expGain} experience (-33% because we lost. ${nbEDefeated} enemy adventurers defeated).`
}

experience = Math.round(experience + expGain);
updateExpBar();
}

function showCultureFragmentGained(currentActiveEnemyGroup) {
    let culturesGroup = new Map();

    const container = document.createElement('div');
    container.className = 'fragment-gained';
    
    for (const [, adventurer] of currentActiveEnemyGroup) {
        for (let i = 0; i < adventurer.Cultures.length; i++) {
            let culture = adventurer.Cultures[i];
            const ran = Math.floor(Math.random() * 2 * newRarityMultiplier(adventurer.BaseRarity));
            // Check if the culture is already in the map, and increment if it exists
            if (culturesGroup.has(culture)) {
                const ran2 = Math.floor(Math.random() * 2);
                culturesGroup.set(culture, culturesGroup.get(culture) + ran2);
            } else {
                culturesGroup.set(culture, ran); // Initialize with 1 instead of 0
            }
        }
    }

    culturesGroup.forEach((count, culture) => {
        if (count > 0) {
            gainCultureFragment(culture, count);
            const cont = document.createElement('div');
            cont.textContent = `+${count} ${culture} Fragments!`;
            container.appendChild(cont);
        }
    });

    return container;
}


function displayAdventurersToCapture(pcBottom, currentActiveEnemyGroup) {
    const bottomHeader = pcBottom.querySelector('#header');
    bottomHeader.textContent = 'Select 1 adventurer to capture, and/or choose an action:';
    let captureZone = pcBottom.querySelector('#capture-box');
    for (const [, adventurer] of currentActiveEnemyGroup) {
          const slot = createAdvElementsToCapture(adventurer);
          captureZone.appendChild(slot);
    }
}


function createAdvElementsToCapture(adventurer) {
    const advSprite = document.createElement('div');
    advSprite.setAttribute('uID', `${adventurer.uID}`);
    advSprite.classList.add('capturable-adventurer');
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

    advSprite.addEventListener('mouseover', showTooltip);
    advSprite.addEventListener('mouseover', showTooltip);

    advSprite.addEventListener('mousedown', function(event) {
        captureThisAdventurer(adventurer, event);
    });

    return advSprite;
}

function captureThisAdventurer(adventurer, event) {

    const combatZoneContainer = document.getElementById('main-combat-box')
    let gid = parseInt(combatZoneContainer.getAttribute('gid'));
    let group = currentOtherGroups.find(map => map.gID === gid);
    let uIDToRemove = adventurer.uID;

    if (group) {
        for (let [groupName, vagrantTroupeMap] of group) {
            if (vagrantTroupeMap instanceof Map && vagrantTroupeMap.has(uIDToRemove)) {
                


                const inventoryContainer = document.getElementById('inventory-container');
                const itemDivs = inventoryContainer.getElementsByClassName('item');
                const emptySlots = getEmptySlots(itemDivs);
              
                if (emptySlots.length === 0) {
                  displayMessage(`Our group is full!`, '#eb4343');
                } else {
                    vagrantTroupeMap.delete(uIDToRemove);
                    // Add the adventurer to the first empty slot
                    const emptySlot = emptySlots[0];
                    event.target.remove();
                    groupAdventurers.set(adventurer.uID, adventurer);
                    displayMessage(`${adventurer.Title} has been captured.`, '#00bfc0');
                    displayNewGroupAdventurer(adventurer, emptySlot);

                    if (vagrantTroupeMap.size <= 0) {
                        const bottom = combatZoneContainer.querySelector(".bottom");
                        bottom.remove();
                        removeAnEnemyGroupTotally(gid, group);
                    }

                    break; // Assuming each uID is unique across all nested maps, we can break after removing
                }
            }
        }
    }
}


async function removeAnEnemyGroupTotally(gidToRemove, group) {

    const cellGroup = cachedGridCells.find(start =>
        parseInt(start.getAttribute('row')) === group.Y &&
        parseInt(start.getAttribute('col')) === group.X
    );

    const cellIndex = parseInt(cellGroup.getAttribute('index'));

    const miniCellGroup = miniCells.find(cell =>
        parseInt(cell.getAttribute('index')) === cellIndex
    );
    
    miniCellGroup.classList.remove('group');


    cellGroup.classList.remove('other-group');
    const groupStore = cellGroup.querySelector('.group-store');

    await impactDamageTarget(groupStore, cellGroup);

    const index = CURRENT_PLAYER_REGION_DATA.groups.findIndex(group => group.gID === gidToRemove);
    if (index !== -1) {
      CURRENT_PLAYER_REGION_DATA.groups.splice(index, 1);
    }
    
}




function displayPostChoicesButton(bottom) {
    const choices = bottom.querySelector('#post-choice');
    
    const spareButton = document.createElement('button');
    spareButton.setAttribute('id', 'spare');
    spareButton.textContent = 'Spare them';

    const executeButton = document.createElement('button');
    executeButton.setAttribute('id', 'execute');
    executeButton.textContent = 'Execute them';

    choices.appendChild(spareButton);
    choices.appendChild(executeButton);

    spareButton.addEventListener("click", spareEnemyGroup);
    executeButton.addEventListener("click", executeEnemyGroup);

    let mercy;
    let postChoiceText = document.getElementById('post-choice-text');
    spareButton.addEventListener("mouseover", function () {
        mercy = true;
        showPostCombatChoiceText(mercy);
    });

    executeButton.addEventListener("mouseover", function () {
        mercy = false;
        showPostCombatChoiceText(mercy);
    });

    spareButton.addEventListener("mouseleave", function () {
        postChoiceText.innerHTML = '';
    });

    executeButton.addEventListener("mouseleave", function () {
        postChoiceText.innerHTML = '';
    });
}

function spareEnemyGroup(){
    const combatZoneContainer = document.getElementById('main-combat-box')
    let gid = parseInt(combatZoneContainer.getAttribute('gid'));
    let group = currentOtherGroups.find(map => map.gID === gid);
    displayMessage(`We spare ${group.keys().next().value}.`, '#00bfc0');
    for (const [, adventurer] of currentActiveEnemyGroup) {
        adventurer.Life = 5;
    }
    ExitCombat();
}

function executeEnemyGroup(){
    const combatZoneContainer = document.getElementById('main-combat-box')
    let gid = parseInt(combatZoneContainer.getAttribute('gid'));
    let group = currentOtherGroups.find(map => map.gID === gid);
    let corpse = true;
    removeAnEnemyGroupTotally(gid, group, corpse);
    displayMessage(`${group.keys().next().value} has been executed!`, '#00bfc0');
    playBloodSplatSound();
    ExitCombat();
    
}

function showPostCombatChoiceText(mercy) {

let postChoiceText = document.getElementById('post-choice-text');
let groupSize = currentActiveEnemyGroup.size;

let moralMalus = Math.round(groupSize * 2);
let fameMalus = Math.round(groupSize);
let plural = '';
if (groupSize > 1) { plural = 's'; } else { plural = '';}

    if (mercy === true) {
        postChoiceText.innerHTML = 
        `Justice is done.` + `<br>` + 
        `Sparing <span class="normal">${groupSize}</span> adventurer${plural} would result in:` + `<br>` + 
        `+<span class="moral">${moralMalus} Moral</span>` + `<br>` + 
        `+<span class="fame">${fameMalus} Fame</span>`;
    } else if (mercy === false) {
        postChoiceText.innerHTML = 
        `No mercy!` + `<br>` + 
        `Killing <span class="normal">${groupSize}</span> adventurer${plural} would result in:` + `<br>` + 
        `-<span class="moral">${moralMalus} Moral</span>` + `<br>` + 
        `-<span class="fame">${fameMalus} Fame</span>`;
    }

}