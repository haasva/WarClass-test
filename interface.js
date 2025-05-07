let isOnMap = false;

let endurance = 100;
let FOOD_CONSUMPTION_PER_DAY = 1; // Amount of food consumed
let groupFood = 20; // Initial food value
let groupCoins = 200;
let groupTools = 8;
let groupAmmos = 38;
let groupArrows = 20;
let groupCurrentAttack = 0;
let experience = 1;
let MAX_EXPERIENCE = 100;
let fatigueReduction = 0;
let groupAvailableSkillPoints = 1000;
let spentSkillPoints = 0;
let LEVELUP_POINTS = 0;
let MAX_LEVELUP_POINTS = 2;
let MAX_ENDURANCE = 100;
let CULTURAL_VARIANCE;


let updateInterfaceIntervalId; // Variable to store the interval ID
let isUpdateInterfaceEnabled = true; // Flag to toggle the execution


// Function to toggle the updateInterface
function toggleUpdateInterface() {
  isUpdateInterfaceEnabled = !isUpdateInterfaceEnabled;

  if (isUpdateInterfaceEnabled) {
    updateInterfaceIntervalId = setInterval(updateInterface, 200);
  } else {
    clearInterval(updateInterfaceIntervalId);
  }
}


function togglePointerLock() {
  const megaWrapper = document.getElementById('mega-wrapper');
  const requestPointerLock = megaWrapper.requestPointerLock || megaWrapper.mozRequestPointerLock || megaWrapper.webkitRequestPointerLock;

  if (PLAYER_STATE.isInMenu) {
    document.exitPointerLock(); // Ensure pointer is unlocked if the menu is open
    PLAYER_STATE.canAttack = false;
    return;
  }

  if (document.pointerLockElement === megaWrapper) {
    document.exitPointerLock();
    PLAYER_STATE.canAttack = false;
  } else {
    requestPointerLock.call(megaWrapper);
    PLAYER_STATE.canAttack = true;
  }
}


document.body.addEventListener('click', function(event) {
  if (!event.target.classList.contains('close-button') || !event.target.classList.contains('.skill')) {
    updateInterface();
  }
});
document.body.addEventListener('mousedown', function(event) {
  if (!event.target.classList.contains('close-button') || !event.target.classList.contains('.skill')) {
    updateInterface();
  }
});
document.body.addEventListener('keydown', function(event) {
  if (!event.key === 'Alt') {
    updateInterface();
  }
});
//enableALTKey();
function updateInterface() {


  updateExpBar();
  updateCurrentGroupAmmos();
  updateFatigueDisplay();
  updateCurrentLifeDisplay();
  updateGroupAttributes();
  
  updateSkillsBox();

}




function closeFirstInfoBoxWindow() {
  const closeButton = document.querySelectorAll('#close-button');
  if (closeButton.length > 0) {
    closeButton[closeButton.length-1].click();
  }
}





document.addEventListener('DOMContentLoaded', function () {
  let resources = document.querySelectorAll('.resource');

  resources.forEach(element => {
    const infos = element.getAttribute('infos');
    addGenericTooltip(element, infos);
  });
});

document.addEventListener('DOMContentLoaded', function () {
  let attributes = document.querySelectorAll('.attribute');

  attributes.forEach(element => {
    const infos = element.getAttribute('id'); // Get the id of the element
    addGenericTooltip(element, infos);
  });
});


// Call updateInventoryInfo initially to display the initial inventory information

//enableDragAndDrop();
updateFoodDisplay();
updateCoinsDisplay();
updateToolsDisplay();



function initializeGroupAttributes() {
const groupclass = customGroupClassMap;
  groupAttributes = {
    strength: parseInt(groupclass.Attributes.Strength) || 0,
    cunning: parseInt(groupclass.Attributes.Cunning) || 0,
    artisanship: parseInt(groupclass.Attributes.Artisanship) || 0,
    education: parseInt(groupclass.Attributes.Education) || 0
  };

}

function updateCurrentGroupAmmos() {
  if (groupAmmos <= 0) {
    groupAmmos = 0;
  }
  if (groupArrows <= 0) {
    groupArrows = 0;
  }
  const currentAmmosSpan = document.getElementById('group-ammos');
  currentAmmosSpan.textContent = groupAmmos.toString();

  const currentArrowSpan = document.getElementById('group-arrows');
  currentArrowSpan.textContent = groupArrows.toString();
}





// Function to calculate DIPLOMACY based on the affixes of adventurers in the group
function calculateGroupDiplomacy() {
  let baseDiplomacy = 10;
  const multiplier = (groupAttributes.education * educationDiplomacyBonus);

  // Calculate DIPLOMACY based on affixes of adventurers in the group
  for (const adventurer of groupAdventurers.values()) {
    updatePartyLeftSide(adventurer);
    for (const affix of adventurer.Affixes) {
      if (affix.Stat === "Diplomacy") {
        baseDiplomacy += affix.BaseValue;
      }
    }
  }

  return parseInt(multiplier + baseDiplomacy);
}





function updateFatigueDisplay() {


  if (endurance >= MAX_ENDURANCE) {
	  endurance = MAX_ENDURANCE;
  }
    const enduranceValue = document.getElementById('endurance-value');
  enduranceValue.textContent = Math.round(endurance);
    const maxenduranceValue = document.getElementById('max-endurance-value');
  maxenduranceValue.textContent = MAX_ENDURANCE;
  updateFatigueCircle();

  const enduBar = document.getElementById('endurance-bar');
  enduBar.max = MAX_ENDURANCE;
  enduBar.value = endurance;
}

function updateFatigueCircle() {
  const percentage = endurance / MAX_ENDURANCE;

  const filledCircle = document.getElementById("filled-endurance-circle");

  filledCircle.style.height = `${percentage * 100}%`;
}




function updateExpBar() {
  while (experience >= MAX_EXPERIENCE) {
      experience -= MAX_EXPERIENCE;
      gainLevel();
  }

  const percentage = experience / MAX_EXPERIENCE;

  // Get the element representing the filled portion of the circle
  const filledExperience = document.getElementById("filled-exp");
  const expBarText = document.getElementById('exp-bar-text');
  expBarText.textContent = `${Math.round(experience)}/${MAX_EXPERIENCE}`;

  // Set the width of the filled circle element to the percentage of life remaining
  filledExperience.style.width = `${percentage * 100}%`;
}




function gainLevel() {
  const groupClassLevel = document.getElementById('groupClassLevel');
  currentClassLevel += 1;
  groupAvailableSkillPoints += 1;
  groupClassLevel.textContent = currentClassLevel;

  updateSkillPointsDisplay();

  MAX_EXPERIENCE = parseInt(MAX_EXPERIENCE + ((currentClassLevel * 2.14159) * 10));

  LEVELUP_POINTS = LEVELUP_POINTS + MAX_LEVELUP_POINTS;

  // playThunderSound();

  gainLevelPopup();

  checkDisableLevelUpButtonsAdv();

 
  levelUpSkillChoice();
  
}

function checkDisableLevelUpButtonsAdv() {
  let levelUpsButton = document.getElementsByClassName('level-up-adventurer');

  if (levelUpsButton.length != 0) {
      Array.from(levelUpsButton).forEach(button => {
        if (LEVELUP_POINTS > 0) {
          button.style.display = '';
        }
        if (LEVELUP_POINTS <= 0) {
          button.style.display = 'none';
        }
      });
  }

  const upSpan = document.getElementById('up-span-level');
  if (LEVELUP_POINTS <= 0 && upSpan) {
  upSpan.remove();
  }
}

function gainLevelPopup() {

  const existLvlPop = document.getElementById('levelup-popup');
  if (existLvlPop) { existLvlPop.remove(); }

  const levelupPopup = document.createElement('div');
  levelupPopup.setAttribute('id', 'levelup-popup');

  levelupPopup.innerHTML = `We reached Level <span class='number'>${currentClassLevel}</span>!`;
  displayMessage('We gain 1 level.', 'magenta');

  document.body.append(levelupPopup);


  console.log('LEVELUP_POINTS in gainLevelPopup:', LEVELUP_POINTS);
  setTimeout(() => {
    levelupPopup.remove();
    }, 1000);
}















function updateGroupResistancesValues() {
  const groupResistances = getGroupResistances();
  const groupHandResist = groupResistances.groupHandResistance;
  const groupRangedResist = groupResistances.groupRangedResistance;

  // Display the Resistance values:
  document.getElementById('group-hand-resist').textContent = groupHandResist.toString();
  document.getElementById('group-ranged-resist').textContent = groupRangedResist.toString();
}






function updateGroupCritChance() {
  const critChance = calculateCriticalChance();
  const critChanceSpan = document.getElementById("group-crit-chance");
  critChanceSpan.textContent = `${critChance}`;
}



function updateFoodDisplay() {
  const foodValue = document.getElementById('group-food');
  foodValue.textContent = "";
  foodValue.textContent = groupFood;
  const foodElement = document.getElementById('food');
  itemUpdateEffect(foodElement);
}

function updateCoinsDisplay() {
  const coinsValue = document.getElementById('group-coins');
  coinsValue.textContent = "";
  coinsValue.textContent = `${groupCoins}`;
  const coinsElement = document.getElementById('coins');
  itemUpdateEffect(coinsElement);
}

function updateToolsDisplay() {
  const toolsValue = document.getElementById('group-tools');
  toolsValue.textContent = "";
  toolsValue.textContent = groupTools;
  const toolsElement = document.getElementById('tools');
  itemUpdateEffect(toolsElement);
}

function displayMessage(message, color = '', fontStyle = '', fontWeight = '') {
  const messageContainer = document.getElementById('message-container');

  // Create timestamp element
  const timestampElement = document.createElement('span');
  timestampElement.classList.add('message-timestamp');

  let timeText = '';

  if (currentMinute < 10) {
    timeText.textContent = `${currentHour.toString()}:0${currentMinute.toString()}`;
  } else {
    timeText.textContent = `${currentHour.toString()}:${currentMinute.toString()}`;
  }
  timestampElement.textContent = `${timeText} `;
  // Create message element
  const messageElement = document.createElement('span');
  messageElement.classList.add('message-text');
  messageElement.textContent = message;

  // Create container element
  const messageWrapper = document.createElement('div');
  messageWrapper.className = 'message-wrapper';

  // messageWrapper.appendChild(timestampElement);
  messageWrapper.appendChild(messageElement);

  
  // Set the color of the message text if provided
  if (color) {
    messageElement.style.color = color;
  }
  if (fontStyle) {
    messageElement.style.fontStyle = fontStyle;
  }

  // Append container element to message container
  messageContainer.appendChild(messageWrapper);

  const allMessages = messageContainer.querySelectorAll('.message-wrapper');
  if (allMessages.length > 8) {
    allMessages[0].remove(); 
  }

}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}





















function itemUpdateEffect(element) {
  element.style.animation = "itemUpdateScale 0.2s 1 ease";
  setTimeout(() => {
    element.style.animation = "";
  }, 200);
}
















function hoverButtonSound() {
  playerHover1();
}




  document.addEventListener('click', function(event) {
    const clickedInfobox = event.target.closest('.infobox');
    
    if (clickedInfobox) {
      const infoboxes = document.querySelectorAll('.infobox');
      
      // Set a high z-index for the clicked infobox
      clickedInfobox.style.zIndex = '11';
      clickedInfobox.classList.remove('inactive-infobox');
      
      // Loop through all infoboxes
      infoboxes.forEach(infobox => {
        // Skip the clicked infobox
        if (infobox !== clickedInfobox) {
          // Give lower z-index to other infoboxes
          infobox.style.zIndex = '9';
          infobox.classList.add('inactive-infobox');
        }
      });
    } else {
      const infoboxes = document.querySelectorAll('.infobox');
      infoboxes.forEach(infobox => {
          infobox.classList.add('inactive-infobox');
      });
    }
  });



// Function to handle mutations in the DOM
function handleMutations(mutationsList, observer) {
  for (const mutation of mutationsList) {
    if (mutation.type === 'childList') {
      // Check if any new nodes are added
      mutation.addedNodes.forEach(node => {
        // Check if the added node is an infobox
        if (node.classList && node.classList.contains('infobox')) {
          // Remove the 'inactive-infobox' class
          node.classList.remove('inactive-infobox');
        }
      });
    }
  }
}

// Create a MutationObserver instance
const observer = new MutationObserver(handleMutations);

// Start observing changes in the DOM
observer.observe(document.body, { childList: true, subtree: true });



function toggleSearchBox() {
  let box = document.getElementById('search-container');
  box.style.display = box.style.display === 'block' ? 'none' : 'block';
}


function togglePartyContainerDisplay(value) {
  const mega = document.getElementById('mega-wrapper');


  if (inventoryInstanciated === false) {
    new Inventory();
  }
  

  if (value === 'on') {
    actionGridDisabled = true;
    mega.style.contentVisibility = 'hidden';
  } else if (value === 'off') {
    actionGridDisabled = false;
    mega.style.contentVisibility = 'visible';
  }
}

function toggleCulturalKnowledgeDisplay() {
  let ck = document.getElementById('ck-table');
  ck.style.display = ck.style.display === 'block' ? 'none' : 'block';
}


function toggleFullGroupSheetDisplay() {
  let gSheet = document.getElementById('group-sheet-container');
  gSheet.style.display = gSheet.style.display === 'block' ? 'none' : 'block';
}

function toggleAutoMap() {
  let map = document.getElementById('screenshot');
  map.style.display = map.style.display === 'none' ? 'block' : 'none';
}







function enableALTKey() {


  let altKeyPressed = false;
  let key1Pressed = false;
  let key2Pressed = false;

  document.body.addEventListener('keydown', function(event) {
      if (event.key === 'Alt' && !altKeyPressed) {
          event.preventDefault();
          altKeyPressed = true;
          //activateAllSkillSlots();
      }
  });
  




  document.body.addEventListener('keydown', function(event) {
    if (event.key === '1' && !key1Pressed) {
        event.preventDefault();
        key1Pressed = true;
        toggleFullGroupSheetDisplay();
    }
});
  
document.body.addEventListener('keydown', function(event) {
  if (event.key === '2' && !key2Pressed) {
      event.preventDefault();
      key2Pressed = true;
      togglePartyContainerDisplay();
  }
});
}





function activateAllSkillSlots() {

  
  const elements = document.querySelectorAll('[uid]');
  
  elements.forEach(element => {
      const uid = element.getAttribute('uid');

      if (!isNaN(uid)) {
          const adventurerUID = parseInt(uid, 10);
          let adventurer = findAdventurerByUID(adventurerUID);
          
          if (adventurer) {
            let fromALT = true;
              //displayAdventurerSkillSlots(adventurer, element, fromALT);

              const overlays = document.querySelectorAll('.adv-skill-slots-overlay');

              overlays.forEach(overlay => {
                  overlay.style.pointerEvents = 'all';
                  overlay.classList.add('alt-pressed');

     
                  
                      const skills = overlay.querySelectorAll('.skill');

                      skills.forEach(skill => {
                        skill.draggable = true;
                        //skill.addEventListener('dragstart', dragStartSkill);
                        //skill.addEventListener('dragend', dragEndSkill);
                      });
              });

          }
      }
  });
}















function createObjectWindow(event, data) {

  removeAllKindsOfTooltips();

  let existingPopup = document.getElementById(`${data.name}`);
  if (existingPopup) {
      existingPopup.remove();
  }

  const window = document.createElement('div');
  window.setAttribute('id', `${data.name}`);
  window.classList.add(`infobox`);
  window.classList.add(`${data.name}`);

  const header = document.createElement('div');
  header.innerHTML = `${data.header}`;
  header.classList.add('infobox-header');
  window.appendChild(header);
  enableDragAndDropWindow(header);
  addCloseButton(header);

  const content = document.createElement('div');
  content.classList.add('infobox-content');
  window.appendChild(content);

  updateTooltipPosition(event, window);

  if (typeof data.functionName === 'string' && typeof window[data.functionName] === 'function') {
    window[data.functionName]();
  } else if (typeof data.functionName === 'function') {
    data.functionName(data, content);
  } else {
    console.error('functionName is not a valid function');
  }

  document.body.appendChild(window);
}


function populateTotemWindow(data, content) {

  const location = data.area.name;
  content.textContent = `A ${data.name} that can take us to ${location}.`;

  const button = document.createElement('button');
  button.classList.add(`totem-button`);

  const x = data.area.col;
  const y = data.area.row;
  
  button.setAttribute('onclick', `teleportPlayer(${y}, ${x})`);
  button.textContent = `Pray to the totem`;

  content.appendChild(button);

  button.addEventListener('mouseup', () => {
    teleportPlayer(y, x);
    content.parentElement.remove();
  });
}






function toggleScreenshotDisplay() {
  const screenshotElement = document.getElementById('screenshot');

  // Check if screenshot is already moved to document.body
  if (screenshotElement.parentNode === document.body) {
    // Revert the screenshot to its original parent (assuming its parent is the original element)
    const originalParent = screenshotElement.getAttribute('data-original-parent');
    if (originalParent) {
      document.getElementById(originalParent).insertBefore(screenshotElement, document.getElementById(originalParent).firstChild);
    }
    screenshotElement.style.position = 'relative'; // Reset any previous styles
    screenshotElement.style.top = '';
    screenshotElement.style.left = '0';
    screenshotElement.style.right = '0';
    screenshotElement.style.zIndex = '1';
    screenshotElement.style.transform = 'none';
    document.querySelectorAll('#mini-table div').forEach(cell => {
      cell.style.width = '1.75px';
      cell.style.height = '1.75px';
    });
  } else {
    // Save original parent reference if not already saved
    if (!screenshotElement.hasAttribute('data-original-parent')) {
      screenshotElement.setAttribute('data-original-parent', screenshotElement.parentNode.id);
    }

    // Move screenshot to document.body
    document.body.appendChild(screenshotElement);

    // Center the screenshot in the viewport
    screenshotElement.style.position = 'absolute'; // Fix the position on the page
    screenshotElement.style.top = '2px';
    screenshotElement.style.left = 'unset';
    screenshotElement.style.right = '2px';
    screenshotElement.style.zIndex = '99';
    document.querySelectorAll('#mini-table div').forEach(cell => {
      cell.style.width = '5px';
      cell.style.height = '5px';
    });
  }
}










async function interactWithObject() {

  if (CURRENT_GROUP_CELL.classList.contains('gatherable')) {
    if (CURRENT_GROUP_CELL.classList.contains('berries')) {
      await createGatherWindow('berries');
    }
    if (CURRENT_GROUP_CELL.classList.contains('reed')) {
      await createGatherWindow('reeds');
    }
    if (CURRENT_GROUP_CELL.classList.contains('tree')) {
      await createGatherWindow('tree');
    }
    if (CURRENT_GROUP_CELL.classList.contains('object-cell')) {
      await createGatherWindow('object');
    }
    if (CURRENT_GROUP_CELL.classList.contains('skeleton-cell')) {
      await createGatherWindow('skeleton');
    }
    if (CURRENT_GROUP_CELL.classList.contains('corpse')) {
      await createGatherWindow('corpse');
    }
    if (CURRENT_GROUP_CELL.classList.contains('fish-cell')) {
      await createGatherWindow('fish');
    }
  }


  if (CURRENT_GROUP_CELL.classList.contains('loot-container')) {
    const col = CURRENT_GROUP_CELL.getAttribute('col');
    const row = CURRENT_GROUP_CELL.getAttribute('row');
    const data = CURRENT_PLAYER_REGION_DATA.content[row][col];
    console.log('data:', data);
    togglePointerLock();
    createLootContent(data);
  }
}




async function createGatherWindow(gathered) {



  let progression = 1;
  const maxProgress = 20;
  const updateInterval = 10;
  const index = parseInt(CURRENT_GROUP_CELL.getAttribute('index'));

  const ex = document.getElementById('gather-window');
  if (ex) { ex.remove() }

  const window = document.createElement('div');
  window.classList.add(`gather-window`);
  window.id = "gather-window";
  
  const header = document.createElement('div');
  header.classList.add(`header`);

  const bar = document.createElement('progress');
  bar.classList.add('gather-progress');
  bar.value = progression;
  bar.setAttribute('max', maxProgress);
  bar.textContent = `${progression}` + '%';

  
  const result = document.createElement('div');
  result.classList.add(`result`);
  result.textContent = `Gathering ${gathered}...`;

  window.appendChild(header);
  window.appendChild(bar);
  window.appendChild(result);
  document.body.appendChild(window);

  playGatherHerbSound();
// Start the progression
const progressInterval = setInterval(async () => {
  actionGridDisabled = true;
  if (progression < maxProgress) {
    progression++;
    bar.value = progression;
    bar.textContent = `${progression}%`;
  } else {
    clearInterval(progressInterval); // Stop when it reaches 100%
    result.textContent = 'Gathered!';
    bar.remove();

    grantGatheredLoot(gathered);
    updateRegionContentObject(gathered, index);

    const basicStore = CURRENT_GROUP_CELL.querySelector('.basic-store.clickable');
    if ( basicStore ) { 

      basicStore.parentElement.classList.remove('gatherable');
      basicStore.parentElement.classList.remove(`${gathered}`);

      
      basicStore.style.animation = `growthOut 0.3s linear 1`;
      
      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, 300));
      basicStore.style.animation = "none";
      basicStore.remove();
      await new Promise(resolve => setTimeout(resolve, 100));
      await realTime(1);
    }
    
    CURRENT_GROUP_CELL.classList.remove('gatherable');
    

 
    actionGridDisabled = false;
    setTimeout(() => {
      window.remove();
    }, 600);
  }

}, updateInterval);
}

function grantGatheredLoot(gathered) {
  
  if (gathered === 'berries') {
    grantGivenItem('berries');
  }
  if (gathered === 'reeds') {
    grantGivenItem('sheaf of reeds');
  }
  if (gathered === 'tree') {
    grantGivenItem('logs');
  }
  if (gathered === 'object') {
    grantGivenItem('scraps');
  }
  if (gathered === 'skeleton') {
    grantGivenItem('bones');
  }
  if (gathered === 'corpse') {
    grantGivenItem('raw meat');
  }
  if (gathered === 'fish') {
    grantGivenItem('fish');
  }

}


function updateRegionContentObject(gathered, index) {
  const object = CURRENT_PLAYER_REGION_DATA.content.flatMap(row => row)
    .find(obj => obj.index === index);

  if (object && gathered in object) {
    object[gathered] = null;
  }
}




function createWindow(npc) {
  let existingPopup = document.getElementById(`merchant-window`);
  if (existingPopup) {
      existingPopup.remove();
  }

  const window = document.createElement('div');
  window.setAttribute('id', `merchant-window`);
  window.classList.add(`infobox`);

  const header = document.createElement('div');
  header.innerHTML = `${npc.name}`;
  header.classList.add('infobox-header');
  window.appendChild(header);
  enableDragAndDropWindow(header);
  addCloseButton(header);

  const content = document.createElement('div');
  content.classList.add('infobox-content');

  content.innerHTML = `
  <div>Culture: <span class='culture'>${npc.culture}</span></div>
  <div>Life: <span class='life'>${npc.life}</span></div>
  `
  window.appendChild(content);

  document.body.appendChild(window);
}