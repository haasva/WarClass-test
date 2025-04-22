let groupclasses = [];
let groupclassesMap = new Map();
let GroupGroupclassesMap = new Map();
let currentGroupSlots = 0;
let currentClassLevel = 1;
let selectedGroupClass = null;





function loadGroupClassesJSON() {
  return fetch('/JSONData/groupclasses.json')
    .then(response => response.json())
    .then(data => {
      groupclasses = data;
      fixGroupClassesImagePaths(groupclasses);
      groupclassesMap = new Map(data.map(groupclass => [
        groupclass.Title, 
        groupclass]));
      console.log('Group Classes data:', groupclasses);
      console.log('Group Classes map:', groupclassesMap);

      // Resolve the promise with the group classes data
      return groupclasses;
    })
    .catch(error => {
      console.error('Error loading Group Classes JSON:', error);
      throw error; // Propagate the error
    });
}


function fixGroupClassesImagePaths(groupclasses) {
  for (const groupclass of groupclasses) {
    for (const key in groupclass) {
      if (typeof groupclass[key] === 'string' && groupclass[key].includes('\\')) {
        groupclass[key] = groupclass[key].replace(/\\/g, '/');
        groupclass[key] = groupclass[key].replace(/ /g, '%20');
      }
    }
  }
}

function creategroupclassesMap() {
  const map = {};
  groupclasses.forEach(groupclass => {
    map[groupclass.Title] = groupclass;
  });
  return map;
}

function selectGroupClass(groupclassTitle) {
  GroupGroupclassesMap.clear();
  const groupclass = groupclasses.find(a => a.Title === groupclassTitle);
  if (groupclass) {
    GroupGroupclassesMap.set(groupclassTitle, groupclass);
  }
  updateGroupClass();
}

function updateGroupClass() {
  const updatedGroupGroupclassesMap = new Map();

  for (const groupclassTitle of GroupGroupclassesMap.keys()) {
    const groupclass = groupclasses.find(a => a.Title === groupclassTitle);
    if (groupclass) {
      updatedGroupGroupclassesMap.set(groupclassTitle, groupclass);

    }
  }

  GroupGroupclassesMap = updatedGroupGroupclassesMap;
  console.log('Selected Group Class data:', GroupGroupclassesMap);

}


function displayCurrentGroupClass() {
  GroupGroupclassesMap = customGroupClassMap;
  const groupclass = customGroupClassMap;
  if (groupclass) {
	const groupClassImage = document.getElementById('groupsheet');

	
	const groupClassTitle = document.getElementById('groupClassTitle');
	groupClassTitle.textContent = groupclass.Title;
	
	const typeMajor = document.getElementById('groupClassTypeMajor');
	typeMajor.style.backgroundImage = `url(${groupclass.Type1})`;
	
	const typeMinor = document.getElementById('groupClassTypeMinor');
	typeMinor.style.backgroundImage = `url(${groupclass.Type2})`;
	
	const groupClassLevel = document.getElementById('groupClassLevel');
	groupClassLevel.textContent = currentClassLevel;
	
  
  
	calculateCurrentGroupSlots(groupclass);
  initializeGroupAttributes();

  initiateGroupStartingSkills(groupclass);
  toggleUpdateInterface();
  displayGroupAdventurersToGroup();

  }
}

function enableStartingAreas(start) {
  // Select all location elements within the #map-image element
  const locationElements = document.querySelectorAll('#map-image .location');

  // Iterate over each location element
  locationElements.forEach(locationElement => {
    // Check if the innerHTML of the location element matches any location in the start array
      // Remove 'unselectable-location' class and add 'selectable-location' class
      locationElement.classList.remove('unselectable-location');
      locationElement.classList.add('selectable-location');
      locationElement.addEventListener('mouseup', (e) => {
        if ( inRegion === false) {
          handleLocationClick(e);
        } else {
          return;
        }
      });
  });
}


async function initiateGroupStartingSkills(groupclass) {
  const skillTree = document.getElementById('skill-tree');
  skillTree.style.opacity = '0';
  skillTree.style.display = 'block';

  await new Promise(resolve => {
    const startingSkills = groupclass.StartingSkills.split(',').map(skillName => skillName.trim());

    // Using requestAnimationFrame to wait for the next repaint
    requestAnimationFrame(() => {
      startingSkills.forEach(skillName_1 => {
        const skillElement = findClassSkillElementByName(skillName_1);

        if (skillElement) {
          skillElement.classList.add('selectable-skill');
        }
      });

      displayMessage(`Starting skills: [${startingSkills}].`, '#fcc112');

      // Simulate delay (replace with actual code)
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  });
  skillTree.style.opacity = '1';
  skillTree.style.display = 'none';
}




function findClassSkillElementByName(skillName) {
  const skillElements = document.querySelectorAll('.skill');

  for (const skillElement of skillElements) {
      if (skillElement.innerHTML.trim() === skillName.trim()) {

          return skillElement;
      }
  }

  return null;
}

function calculateCurrentGroupSlots(groupclass) {
  GroupSlots = parseInt(groupclass.Slots) || 0;
  
  currentGroupSlots = GroupSlots;
	displayMessage(`Group slots = [${currentGroupSlots}].`, '#fcc112');
  createInventory();
  return currentGroupSlots;
}






function groupClassSelector() {
  const classChoice = document.getElementById('choose-your-way');
  classChoice.remove();
  fetch('/Templates/group_class_selection.html')
  .then(response => response.text())
  .then(template => {
    // Create a temporary div to hold the template content
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = template;

    // Get the elements from the template
    const elements = tempContainer.children;

    // Append all elements to the adventurer info container
    const groupClassSelector = document.getElementById('group-class-selector');
    groupClassSelector.style.display = 'block';
    groupClassSelector.style.left = `0px`;
    groupClassSelector.style.top = `0px`;
    groupClassSelector.innerHTML = ''; // Clear previous content

    for (const element of elements) {
        groupClassSelector.appendChild(element);
    }

    const groupClassButtons = groupClassSelector.querySelector('#group-classes-buttons');
    for (const groupclass of groupclassesMap.keys()) {
      const ClassPic = document.createElement('div');
      ClassPic.setAttribute('class', 'class-pic');
      groupClassButtons.appendChild(ClassPic);

      ClassTitle = document.createElement("div");
      ClassTitle.setAttribute('class', 'class-button-title');
      ClassTitle.textContent = `${groupclassesMap.get(groupclass).Title}`;
      ClassPic.appendChild(ClassTitle);
      ClassPic.style.backgroundImage = `url(${groupclassesMap.get(groupclass).Art})`;
      ClassPic.addEventListener("click", () => displayGroupClassInfo(ClassPic, groupclass));
    };

    // groupClassSelector.querySelector('.Art').style.backgroundImage = `url(${adventurer.Art.toString()})`;

    confirmButton = groupClassSelector.querySelector('#Confirm');
    confirmButton.addEventListener("click", confirmClassChoice);
    confirmButton.disabled = true;
    confirmButton.textContent = `Select a Group Class first!`

    function confirmClassChoice() {
      // endGroupClassSelection();
      chooseStartingAdventurers();
    }

  })
  .catch(error => {
    console.error('Error loading group class selector template:', error);
  });
}


function displayGroupClassInfo(element, groupclass) {
  playClickSound();

  const groupclassTitle = groupclassesMap.get(groupclass).Title; // Store the selected group class title in a variable
  selectedGroupClass = groupclassTitle; // Set the selectedGroupClass variable
  selectGroupClass(groupclassTitle);

  const ClassPics = document.getElementsByClassName("class-pic");
  for (let i = 0; i < ClassPics.length; i++) {
    ClassPics[i].classList.remove("selected");
  }
  element.classList.add('selected');
  const groupClassSelector = document.getElementById('group-class-selector');
  const groupClassInfo = groupClassSelector.querySelector('#group-class-info');
  
  groupClassInfo.textContent = "";

  ConfirmButton = document.getElementById('Confirm');
  ConfirmButton.disabled = false;
  ConfirmButton.textContent = `Start as ${groupclassesMap.get(groupclass).Title}`

  fetch('/Templates/group_class_information.html')
  .then(response => response.text())
  .then(template => {


  const tempContainer = document.createElement('div');
  tempContainer.innerHTML = template;

  // Get the elements from the template
  const elements = tempContainer.children;
  for (const element of elements) {
    groupClassInfo.appendChild(element);
  }

  const groupClassName = groupclassesMap.get(groupclass).Title.toLowerCase();

  console.log(groupClassName);

  const audio = new Audio(`/Sounds/groupclasses/${groupClassName}.mp3`);
  audio.volume = 0.5;
  audio.play();

    groupClassInfo.querySelector('#class-title').textContent = `${groupclassesMap.get(groupclass).Title}`;
    groupClassInfo.querySelector('#type1-text').textContent = `${groupclassesMap.get(groupclass).Major}`;
    groupClassInfo.querySelector('#type2-text').textContent = `${groupclassesMap.get(groupclass).Minor}`;
    groupClassInfo.querySelector('#type1-pic').style.backgroundImage = `url(${groupclassesMap.get(groupclass).Type1})`;
    groupClassInfo.querySelector('#type2-pic').style.backgroundImage = `url(${groupclassesMap.get(groupclass).Type2})`;
    groupClassInfo.querySelector('#base-slots-value').textContent = `${groupclassesMap.get(groupclass).Slots}`;
    groupClassInfo.querySelector('#base-gold').textContent = `${groupclassesMap.get(groupclass).Gold}`;
    groupClassInfo.querySelector('#class-desc').textContent = `${groupclassesMap.get(groupclass).Desc}`;

    groupClassInfo.querySelector('#strength').textContent = `${groupclassesMap.get(groupclass).Attributes.Strength}`;
    groupClassInfo.querySelector('#cunning').textContent = `${groupclassesMap.get(groupclass).Attributes.Cunning}`;
    groupClassInfo.querySelector('#artisanship').textContent = `${groupclassesMap.get(groupclass).Attributes.Artisanship}`;
    groupClassInfo.querySelector('#education').textContent = `${groupclassesMap.get(groupclass).Attributes.Education}`;
    groupClassInfo.querySelector('#starting-location1').textContent = `${groupclassesMap.get(groupclass).Start.Location1}`;
    groupClassInfo.querySelector('#starting-location2').textContent = `${groupclassesMap.get(groupclass).Start.Location2}`;

    appendStartingSkills(groupclass);
    activateSkillEventListeners();
    fetchAreasData();

    const area1 = groupclassesMap.get(groupclass).Start.Location1;
    const area2 = groupclassesMap.get(groupclass).Start.Location2;

    const area1pic = areasObject[area1].headerpic;
    const area2pic = areasObject[area2].headerpic;

    groupClassInfo.querySelector('#location-choice1').style.backgroundImage = `url('/Art/Interface/Terrains/location_headers/${area1pic}.png')`;
    groupClassInfo.querySelector('#location-choice2').style.backgroundImage = `url('/Art/Interface/Terrains/location_headers/${area2pic}.png')`;

  })
  .catch(error => {
    console.error('Error loading group class selector template:', error);
  });
}

function appendStartingSkills(groupclass) {
  const skillsStartElement = document.getElementById('skills-start');

// Assuming groupclass is the current group class and skillsObject is the object containing skill data
const startingSkills = groupclassesMap.get(groupclass).StartingSkills;

// Split the StartingSkills string into an array of skill names
const startingSkillsArray = startingSkills.split(',').map(skillName => skillName.trim());

// Iterate through each skill name and create corresponding skill elements
startingSkillsArray.forEach(skillName => {
    const skill = skillsObject[skillName];

    if (skill) {
        const skillElement = document.createElement('div');
        skillElement.className = 'skill';
        skillElement.classList.add('skill-gc-selection');
        skillElement.classList.add(`${skill.rarity}`);
        skillElement.innerHTML = skill.name;
        skillElement.style.backgroundImage = `url('/Art/Skills/${skill.name}.png')`;
        skillElement.style.position = 'relative';
        // Append the skill element to the #skills-start container
        skillsStartElement.appendChild(skillElement);
    }
});

}



async function endGroupClassSelection() {
  
  appendPanelContent();
  await createBackpack();
  createSkillBox();

  const audio = new Audio("/Sounds/wall.wav");
  audio.volume = 0.5;
  audio.play();
  displayCurrentGroupClass();
  const chooseYourWay = document.getElementById('choose-your-way');
  chooseYourWay.remove();
//gameContainer = document.getElementById('game-container');
// gameContainer.style.display = "block";
document.getElementById('day-box').style.display = "none";
const groupClassSelector = document.getElementById('group-class-selector');
groupClassSelector.remove();

const regionGridContainer = document.getElementById('region-grid-container');
regionGridContainer.style.display = 'block';

const mapWorld = document.getElementById('map-container');
mapWorld.style.display = 'none';
mapWorld.style.visibility = 'hidden';

inRegion = true;


const rightBox1 = document.getElementById('right-box1');
rightBox1.innerHTML = '';


isOnMap = false;
displayMessage(`We are setting out from ${currentArea}.`, 'white');
document.getElementById('day-box').style.display = "flex";

const resources = document.getElementById('ammunition-box');
groupCoins = GroupGroupclassesMap.Gold - GroupGroupclassesMap.spentGold;
resources.querySelector('#group-coins').textContent = `${groupCoins}`;

TOTAL_PARTY_SLOTS = parseInt(customGroupClassMap.Slots) || 0;
startRow = playerOverworldRow - 7; // Starting row index
startCol = playerOverworldCol - 15; // Starting column index
 
const group = Array.from(groupAdventurers.values());
group[0].isGroupLeader = true;

for (const adv of group) {
  if (adv.Equipment.Weapon != null) {
    PLAYER_WEAPONS.push(adv.Equipment.Weapon);
  }
}

createGroupSheet();

displayRightSideContract();



  setTimeout( async () => {
    
    
    updateInterface();
    updateTimeOfDay();

updatePartyHeader();

for (const adv of groupAdventurers.values()) {
  addCulturalFragmentsToPlayer(adv);
}

addInventorySlot(10);
grantGivenItem('carrot');
grantGivenItem('carrot');
grantGivenItem('carrot');
grantGivenItem('raw meat');

  }, 500);
  teleportPlayer(playerOverworldRow, playerOverworldCol);
  selectAdventurer(0, [...groupAdventurers.keys()]);
}




function chooseStartingAdventurers() {
  const groupClassButtons = document.getElementById('group-classes-buttons');
  groupClassButtons.remove();

  const groupClassInfos = document.getElementById('group-class-info');
  groupClassInfos.style.margin = '10px';
  groupClassInfos.style.marginRight = '10px';
  groupClassInfos.style.marginTop = '0px';
  groupClassInfos.style.marginBottom = '0px';
  groupClassInfos.style.width = '1314px';

  const selectionOfAdv = document.createElement('div');
  selectionOfAdv.setAttribute('class', 'selection-of-adv-main');
  selectionOfAdv.width = '600px';

  const mainWindow = document.getElementById('main-container');
  mainWindow.style.height = 'auto';
  mainWindow.style.width = '1009px';

  const groupClassContainer = document.getElementById('group-classes-container');
  groupClassContainer.appendChild(selectionOfAdv);


  const groupClassTitle = document.getElementById('container-title');
  groupClassTitle.textContent = 'Select Starting Adventurers';

  confirmButton = document.getElementById('Confirm');
  confirmButton.addEventListener("click", confirm);
  confirmButton.disabled = false;
  confirmButton.textContent = `Select Starting Adventurers First!`

  
  function confirm() {
    endGroupClassSelection();
  }

  displayStartingAdventurers(selectionOfAdv);
}

function displayStartingAdventurers(groupClassInfos) {
  const groupclass = GroupGroupclassesMap.get(selectedGroupClass);
  const adventurersSelection = document.createElement('div');
  adventurersSelection.setAttribute('id', 'selection-box');

  const adventurersSelectedArea = document.createElement('div');
  adventurersSelectedArea.setAttribute('id', 'selected-box');
  
  const mainContainer = document.getElementById('main-container');

  const title = document.createElement('div');
  title.setAttribute('id', 'subtitle');
  title.textContent = "You must select 3 adventurers:";

  const title2 = document.createElement('div');
  title2.setAttribute('id', 'subtitle');
  title2.textContent = "Our group:";

  groupClassInfos.appendChild(title);
  groupClassInfos.appendChild(adventurersSelection);
  adventurersSelectedArea.appendChild(title2);
  groupClassInfos.appendChild(adventurersSelectedArea);

  const size = 12;
  for (let i = 0; i < size; i++) {
    const slot = document.createElement('div');
    slot.classList.add('adv-select-slot', 'empty');
    adventurersSelection.appendChild(slot);
    findRandomAdventurerToSelect(slot, groupclass);
    slot.addEventListener('mouseup', (e) => {
      selectThisAdventurer(e);
      slot.classList.add('inselection');
      slot.style.pointerEvents = 'none';
    });
  }
  for (let i = 0; i < 3; i++) {
    const slot = document.createElement('div');
    slot.classList.add('selection-slot', 'item');
    adventurersSelectedArea.appendChild(slot);
  }
}

let pos = 0;

function selectThisAdventurer(e) {

  emptySlot = document.getElementsByClassName('selection-slot');
  const adventurersSelectedArea = document.getElementById('selected-box');
  if (pos > 2) {
    pos = 0;
    emptySlot.remove();

    const slot = document.createElement('div');
    slot.classList.add('selection-slot', 'item');
    adventurersSelectedArea.append(slot);
  }

  const UID = e.target.getAttribute('uid');
  console.log('UID-Selected', UID);
  const adventurer = findAdventurerByUID(UID);

  displayANewAdventurerToSelect(adventurer, emptySlot[pos]);
  groupAdventurers.set(adventurer.uID, adventurer);
}


function findRandomAdventurerToSelect(slot, groupclass) {
  const adventurersCount = adventurers.length;
  const usedIndexes = new Set();
  let randomIndex;

  do {
    randomIndex = Math.floor(Math.random() * adventurersCount);
  } while (usedIndexes.has(randomIndex));

  const adventurer = adventurers[randomIndex];
  
  // Check if the adventurer's Type matches the groupclass.Minor or groupclass.Major
  const adventurerTypes = adventurer.Type.split(',').map(word => word.trim());
  const isTypeMatch = adventurerTypes.some(type => type === groupclass.Minor || type === groupclass.Major);

  if (isTypeMatch) {
    usedIndexes.add(randomIndex);
    displayAdventurerToSelect(adventurer, slot);
    return adventurer;
  } else {
    // If the Type doesn't match, recursively call the function to find another adventurer
    return findRandomAdventurerToSelect(slot, groupclass);
  }
}

function displayAdventurerToSelect(adventurer, slot) {
  const selectionContainer = document.getElementById('selection-box');
  const slots = selectionContainer.getElementsByClassName('adv-select-slot');
  const emptySlots = getEmptySlots(slots);

  if (emptySlots.length === 0) {
    return;
  }

  // Add the adventurer to the first empty slot
  const emptySlot = emptySlots[0];
  addAdventurerToSelection(adventurer, slot);
}

let adventurersSelectionBatch = new Map();

async function addAdventurerToSelection(adventurer, slot) {
  if (adventurer) {
    // Generate a unique uID
    const newAdventurer = { ...adventurer };
    newAdventurer.Affixes = [];

    do {
      newAdventurer.uID = Math.floor(Math.random() * 99999) + 1;
    } while (adventurersSelectionBatch.has(newAdventurer.uID));

    console.log(`${newAdventurer.Title} is a new adventurer. Generated uID: ${newAdventurer.uID}`);

    // Generate affixes for the adventurer


    const newAdvWithAffixes = await generateAdventurerAffixes(newAdventurer);
    // Add the adventurer to the group
    newAdvWithAffixes.Life = newAdvWithAffixes.Attributes.Strength * 2;
    adventurersSelectionBatch.set(newAdvWithAffixes.uID, newAdvWithAffixes);


    // Display messages and update UI as needed

    console.log('adventurersSelectionBatch', adventurersSelectionBatch);

    displayANewAdventurerToSelect(newAdvWithAffixes, slot);

    
  }
}

function displayANewAdventurerToSelect(adventurer, emptySlot) {
  pos += 1;
  if (adventurer.Rarity === "Legendary") {
    emptySlot.classList.add("legendary-adv-slot");
  }
  if (adventurer.Rarity === "Rare") {
    emptySlot.classList.add("rare-adv-slot");
  }
  if (adventurer.Rarity === "Uncommon") {
    emptySlot.classList.add("uncommon-adv-slot");
  }
  if (adventurer.Rarity === "Normal") {
    emptySlot.classList.add("normal-adv-slot");
  }
  emptySlot.style.backgroundImage = `url('/Art/Adventurers/${adventurer.Title}.png')`;
  emptySlot.classList.add("item");


  emptySlot.setAttribute('uid', adventurer.uID);
  emptySlot.setAttribute('color', adventurer.color);
  emptySlot.addEventListener('mouseover', showTooltip);


}


function displayGroupAdventurersToGroup() {
  console.log('GROUPPP', groupAdventurers);
  const inventoryContainer = document.getElementById('inventory-container');
  const itemDivs = inventoryContainer.getElementsByClassName('item');
  const groupAdventurersValues = Array.from(groupAdventurers.values());


}
