
const occupiedItems = [];
let tooltip = document.getElementById('tooltip');
let searchInput = document.getElementById('search-input');
let suggestionsContainer = document.getElementById('suggestions-container');
let itemList = document.getElementById('item-list'); // Added for item list
let adventurers = []; // Global variable to store the adventurers data
let adventurerMap = new Map();
let groupAdventurers = new Map();
let currentActiveEnemyGroup = new Map();

let delayTimerTooltip;

let GLOBAL_ADV_INDEX = 0;

let CURRENT_MANAGED_ADVENTURER;

let PLAYER_WEAPONS = [];


document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
      event.preventDefault();
      // Your custom logic here
      console.log('Escape key pressed and default action prevented.');
  }
});




function loadAdventurersJSON() {
  return fetch('/JSONData/adventurers.json')
    .then(response => response.json())
    .then(data => {
      adventurers = data; // Store the adventurers data in the global variable
      fixAdventurerImagePaths(adventurers);
      displaySkillTree();
      adventurerMap = new Map(data.map(adventurer => [adventurer.Title, adventurer]));
      adventurers.forEach(adventurer => {

          resetAdventurer(adventurer);

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


function resetAdventurer(adventurer) {
  adventurer.Attributes = [];
  adventurer.Attributes.Strength = 0;
  adventurer.Attributes.Cunning = 0;
  adventurer.Attributes.Artisanship = 0;
  adventurer.Attributes.Education = 0;
  adventurer.Attributes.Dexterity = 0;

  adventurer.Attack = 0;

  adventurer.RangedResist = Math.round(adventurer.Attributes.Dexterity * 2);
  adventurer.HandResist = Math.round(adventurer.Attributes.Strength * 2);
  
  const types = adventurer.Type.split(',').map(s => s.trim());
  adventurer.Types = types;

  const cultures = adventurer.Culture.split(',').map(s => s.trim());
  adventurer.Cultures = cultures;

  adventurer.Skills = [];

  adventurer.upgrades = [
    adventurer.Upgrade1,
    adventurer.Upgrade2,
    adventurer.Upgrade3
  ].filter(upgrade => upgrade !== "");

  if (typeof (adventurer.Equipment.Weapon) === 'string') {
    const weaponName = adventurer.Equipment.Weapon.toLowerCase();
    if (weaponsObject.hasOwnProperty(weaponName)) {
      adventurer.Equipment.Weapon = {... weaponsObject[weaponName] };
    } else {
      adventurer.Equipment.Weapon = null;
    }
  }

}






function fixAdventurerImagePaths(adventurers) {
  for (const adventurer of adventurers) {
    for (const key in adventurer) {
      if (typeof adventurer[key] === 'string' && adventurer[key].includes('\\')) {
        adventurer[key] = adventurer[key].replace(/\\/g, '/');
        adventurer[key] = adventurer[key].replace(/ /g, '%20');
      }
    }
  }
}

function createAdventurerMap(adventurers) {
  const map = {};
  adventurers.forEach(adventurer => {
    map[adventurer.Title] = adventurer;
  });
  return map;
}


function getAdventurerByTitle(title) {
  return adventurerMap[title] || null;
}






async function generateNewAdventurer(adventurer) {
  resetAdventurer(adventurer);
  multiplyStatsByRarity(adventurer);

  adventurer.Affixes = [];
  adventurer.uID = Math.floor(Math.random() * 99999) + 1;

  const newAdvWithAffixes = await generateAdventurerAffixes(adventurer);

  newAdvWithAffixes.Price = setAdventurerPrice(newAdvWithAffixes);
  setAdventurerMainAttribute(newAdvWithAffixes);

  return newAdvWithAffixes;
}





















function createInventory() {
  const inventoryContainer = document.getElementById('inventory-container');
  const n = currentGroupSlots;
    createGroupSlot(n);

    inventoryContainer.addEventListener("wheel", function (e) {
    if (e.deltaY > 0) inventoryContainer.scrollLeft += 100;
    else inventoryContainer.scrollLeft -= 100;
  });
}


function createGroupSlot(n) {
  const inventoryContainer = document.getElementById('inventory-container');
for (let i = 0; i < n; i++) {
  const itemDiv = document.createElement('div');
  itemDiv.classList.add('item');
  itemDiv.addEventListener('contextmenu', showContextMenu);
  inventoryContainer.appendChild(itemDiv);
  itemDiv.classList.add('draggable'); // Add the draggable class

  const type1Span = document.createElement('span');
  itemDiv.appendChild(type1Span);
  type1Span.classList.add('type1Span');

  const type2Span = document.createElement('span');
  itemDiv.appendChild(type2Span);
  type2Span.classList.add('type2Span');
}
}



function displayAndAddToGroup(adventurer) {

  playPaperSlide();

  const inventoryContainer = document.getElementById('inventory-container');
  const itemDivs = inventoryContainer.getElementsByClassName('item');
  const emptySlots = getEmptySlots(itemDivs);

  if (groupAdventurers.size >= TOTAL_PARTY_SLOTS) {
    displayMessage(`Our group is full!`, '#eb4343');

  } else {
    // Add the adventurer to the first empty slot
    const emptySlot = emptySlots[0];
    addAdventurerToGroup(adventurer, emptySlot);
  }


}


async function addAdventurerToGroup(adventurer, emptySlot) {
  if (adventurer) {

    const newAdvWithAffixes = { ... await generateNewAdventurer(adventurer) };
    GLOBAL_ADV_INDEX++;
    newAdvWithAffixes.index = GLOBAL_ADV_INDEX;
    // Add the adventurer to the group
    groupAdventurers.set(newAdvWithAffixes.uID, newAdvWithAffixes);

    // Display messages and update UI as needed
    displayMessage(`${newAdvWithAffixes.Title} joined our group!`, '#00bfc0');

    console.log(groupAdventurers);
    addCulturalFragmentsToPlayer(newAdvWithAffixes);
    displayNewGroupAdventurer(newAdvWithAffixes, emptySlot);

    if (adventurer.Equipment.Weapon != null) {
      PLAYER_WEAPONS.push(adventurer.Equipment.Weapon);
    }
  }
}





function displayNewGroupAdventurer(adventurer, emptySlot) {


  
  let party = document.getElementById('party');
  if (party) {
    const element = createAdvPartyBox(adventurer);
   
    party.appendChild(element);
    updatePartyHeader();
    checkDisableLevelUpButtonsAdv();
  } else {
    displayLeftSideParty();
  }




  occupiedItems.push(adventurer.Title);



  updateInterface();
  createNewOwnGroupDisplay();

  const invSlotsNumber = Math.round(adventurer.Attributes.Artisanship);
  addInventorySlot(invSlotsNumber);



}


function addCulturalFragmentsToPlayer(adventurer) {
  const culturesFrag = new Map();
  for (const culture of adventurer.Cultures) {
    const ran = Math.floor(Math.random() * 5 * newRarityMultiplier(adventurer.BaseRarity)) + 2;
    culturesFrag.set(culture, ran);
  }
  culturesFrag.forEach((count, culture) => {
    if (count > 0) {
        gainCultureFragment(culture, count);
    }
  });
}






function removeAdventurerFromGroup(UID) {
  // Convert the UID to a number
  const adventurerUID = parseInt(UID);

  // Check if the adventurer exists in the groupAdventurers map
  if (groupAdventurers.has(adventurerUID)) {
    const adventurer = groupAdventurers.get(adventurerUID);

    const skillText = adventurer.Signature;
    PLAYER_SKILLS = PLAYER_SKILLS.filter(skill => skill.name !== skillText);

    // Display a message (if needed)
    displayMessage(`Goodbye ${adventurer.Title}.`);

    // Remove the adventurer from the groupAdventurers map
    groupAdventurers.delete(adventurerUID);
    removeAdventurerFromPartyBox(adventurerUID);
    updateInterface();
    updateActiveSkills();
    updateSkillsBox();
    createNewOwnGroupDisplay();
    updatePartyHeader();
    playRemoveSound();
  } else {
    // Display a message indicating that the adventurer was not found
    console.log(`Adventurer with UID ${UID} not found in the group.`);
  }
}



function findAdventurerByUID(uid) {
  for (const [, adventurer] of groupAdventurers) {
    if (adventurer.uID === parseInt(uid)) {
      return adventurer;
    }
  }
  
  // Search in adventurersSelectionBatch
  for (const [, adventurer] of adventurersSelectionBatch) {
    if (adventurer.uID === parseInt(uid)) {
      return adventurer;
    }
  }

    // Search in currentActiveEnemyGroup
    for (const [, adventurer] of currentActiveEnemyGroup) {
      if (adventurer.uID === parseInt(uid)) {
        return adventurer;
      }
    }

  // Handle the case when no adventurer with the given UID is found
  return null;
}



function fadeInAndMove(element, delay) {
  if (!element.classList.contains('adventurer-info')) {
    element.style.opacity = '0';
    //element.style.transform = 'translateY(40px) scale(0.5)';
    element.style.transition = 'opacity 0.1s ease-in-out, transform 0.1s ease-in-out';

    requestAnimationFrame(() => {
      element.style.opacity = '1';
      element.style.transform = '';
      element.style.transitionDelay = `${delay}s`;
    });
  }
}

function appendWithAnimation(container, elements, delayMultiplier = 0.001) {
  let delay = 0;

  function processElement(element) {
    //fadeInAndMove(element, delay);
    //delay += delayMultiplier;

    // Recursively process children
    const childElements = Array.from(element.children);
    for (const child of childElements) {
      processElement(child);
    }
  }

  for (const element of elements) {
    processElement(element);
    container.appendChild(element);
  }
}

function rarityBorderColor(rarity, element, topheader, artAdv) {
  if ( rarity === "Rare" ) {
    artAdv.style.border = "1px solid #0070dd";
    topheader.style.borderColor = "#0070dd";
    topheader.style.color = "#0070dd";
  }
  if ( rarity === "Legendary" ) {
    artAdv.style.border = "1px solid #da00ff";
    topheader.style.borderColor = "#da00ff";
    topheader.style.color = "#da00ff";
  }
  if ( rarity === "Normal" ) {
    artAdv.style.border = "1px solid white";
    topheader.style.borderColor = "white";
    topheader.style.color = "white";
  }
  if ( rarity === "Uncommon" ) {
    artAdv.style.border = "1px solid #1eff00";
    topheader.style.borderColor = "#1eff00";
    topheader.style.color = "#1eff00";
  }
}

function displayAnyAdventurerInfo(adventurer, mouseX, mouseY) {

  const existingAdventurerInfoContainer = document.getElementById('adventurer-info-container');

  if (existingAdventurerInfoContainer) {
    existingAdventurerInfoContainer.remove();
  }


  
  const adventurerInfoContainer = document.createElement('div');
  adventurerInfoContainer.setAttribute('id', 'adventurer-info-container')
  

  if (adventurer) {
    // Convert number properties to strings and handle null properties
    for (const prop in adventurer) {
      if (adventurer[prop] === null) {
        adventurer[prop] = '';
      } else {
		  adventurer[prop] = adventurer[prop];
    }}

            // Extract "Name" values from the "Affixes" array
            const affixNames = adventurer.Affixes.map(affix => affix.Name);

            // Create a string by joining the "Name" values
            const affixString = affixNames.join(' ');

    // Fetch the adventurer info template
    fetch('/Templates/adventurer-info-template.html')
      .then(response => response.text())
      .then(template => {
        // Create a temporary div to hold the template content
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = template;

        // Get the elements from the template
        const elements = tempContainer.children;







        adventurerInfoContainer.innerHTML = ''; // Clear previous content
        appendWithAnimation(adventurerInfoContainer, elements);


        if (adventurer.Affixes) {
          const affixesBox = adventurerInfoContainer.querySelector('#Affixes');
          generateAffixElements(adventurer, affixesBox);
        }
        // Update the adventurer info with the actual data
		adventurerInfoContainer.querySelector('.Art').style.backgroundImage = `url('/Art/Adventurers/${adventurer.Title}.png')`;
		adventurerInfoContainer.querySelector('.Title').textContent = `${affixString} ${adventurer.Title}`;
        // Update the adventurer info with the actual data
      
    adventurerInfoContainer.querySelector('#adv-level').textContent = adventurer.Level;


		adventurerInfoContainer.querySelector('.Culture').textContent = adventurer.Culture;
		adventurerInfoContainer.querySelector('.Age').textContent = adventurer.Age;
		adventurerInfoContainer.querySelector('.Life').textContent = adventurer.Life;
		adventurerInfoContainer.querySelector('.Speed').textContent = adventurer.Speed;
    adventurerInfoContainer.querySelector('.HandResist').textContent = adventurer.HandResist;		
    adventurerInfoContainer.querySelector('.RangedResist').textContent = adventurer.RangedResist;
		adventurerInfoContainer.querySelector('.Type1').style.backgroundImage = `url(${adventurer.Type1})`;
		adventurerInfoContainer.querySelector('.Type2').style.backgroundImage = `url(${adventurer.Type2})`;
		adventurerInfoContainer.querySelector('.Type').textContent = adventurer.Type;

    adventurerInfoContainer.querySelector('.Strength').textContent = adventurer.Attributes.Strength;
    adventurerInfoContainer.querySelector('.Cunning').textContent = adventurer.Attributes.Cunning;
    adventurerInfoContainer.querySelector('.Artisanship').textContent = adventurer.Attributes.Artisanship;
    adventurerInfoContainer.querySelector('.Education').textContent = adventurer.Attributes.Education;

		adventurerInfoContainer.querySelector('.SubCategory').textContent = adventurer.SubCategory;
		adventurerInfoContainer.querySelector('.MountedArt').style.backgroundImage = `url(${adventurer.MountedArt})`;
		adventurerInfoContainer.querySelector('.Specialty').textContent = adventurer.Specialty;
		adventurerInfoContainer.querySelector('.Specialty1').style.backgroundImage = `url(${adventurer.Specialty1})`;
		adventurerInfoContainer.querySelector('.Specialty2').style.backgroundImage = `url(${adventurer.Specialty2})`;
    adventurerInfoContainer.querySelector('.Base-attack').textContent = adventurer.Attack;
		adventurerInfoContainer.querySelector('.Signature').textContent = adventurer.Signature;
		adventurerInfoContainer.querySelector('.Description').textContent = adventurer.Description;
		adventurerInfoContainer.querySelector('.Lore').textContent = adventurer.Lore;
		adventurerInfoContainer.querySelector('.Upgrade1').textContent = adventurer.Upgrade1;
		adventurerInfoContainer.querySelector('.Upgrade2').textContent = adventurer.Upgrade2;
		adventurerInfoContainer.querySelector('.Upgrade3').textContent = adventurer.Upgrade3;
		adventurerInfoContainer.querySelector('.Upgrade1Art').style.backgroundImage = `url(${adventurer.Upgrade1Art})`;
		adventurerInfoContainer.querySelector('.Upgrade2Art').style.backgroundImage = `url(${adventurer.Upgrade2Art})`;
		adventurerInfoContainer.querySelector('.Upgrade3Art').style.backgroundImage = `url(${adventurer.Upgrade3Art})`;
		adventurerInfoContainer.querySelector('.CultureImg1').style.backgroundImage = `url(${adventurer.CultureImg1})`;
		adventurerInfoContainer.querySelector('.CultureImg2').style.backgroundImage = `url(${adventurer.CultureImg2})`;
    const adventurerBox = document.getElementById('adventurer-display-inbox');
    hideEmptyElements(adventurerInfoContainer);
  
  
  
  
    
    document.body.append(adventurerInfoContainer);
    const tooltipRect = adventurerInfoContainer.getBoundingClientRect();
    const tooltipWidth = tooltipRect.width;
    const tooltipHeight = tooltipRect.height;
    
    // Get the X and Y coordinates of the adventurer element relative to the viewport

    
    adventurerInfoContainer.style.left = `${mouseX}px`;
    adventurerInfoContainer.style.top = `${mouseY}px`;
    
  
        const topheader = adventurerInfoContainer.querySelector('#top-header');
        rarityBorderColor(adventurer.Rarity, adventurerInfoContainer, topheader);
  
        })
        .catch(error => {
          console.error('Error loading adventurer info template:', error);
        });
    }
  }


  
  // Clear the timeout if the mouse moves out before the delay
  document.addEventListener('mouseout', () => {
    clearTimeout(delayTimerTooltip);
  });

  document.addEventListener('mouseout', event => {
    if (event.target.classList.contains('clickableAdvInfo') || event.target.classList.contains('item') || event.target.classList.contains('unit')) {
      const adventurerBoxSource = document.getElementById("adventurer-info-container");
      const skillSlotsOverlay = event.target.querySelector('.adv-skill-slots-overlay');
  
      if (adventurerBoxSource) {
        adventurerBoxSource.remove();
      }
      if (skillSlotsOverlay && !event.relatedTarget.closest('.adv-skill-slots-overlay')) {
        skillSlotsOverlay.remove();
      }
    }
  });


document.addEventListener('mousedown', event => {
  if (event.target.classList.contains('clickableAdvInfo') || event.target.classList.contains('item') || event.target.classList.contains('unit')) {
    const adventurerBoxSource = document.getElementById("adventurer-info-container");
    if (adventurerBoxSource) {
      adventurerBoxSource.remove();
    }

  }
});



// Add event listener on the document for event delegation
document.addEventListener('click', event => {
  if (event.target.classList.contains('upgradeClick')) {
    const adventurerTitle = event.target.textContent;
    const adventurer = adventurerMap.get(adventurerTitle);

    if (adventurer) {
      const adventurerBoxSource = document.getElementById("adventurer-info-container");
      const adventurerRect = adventurerBoxSource.getBoundingClientRect();

      const adventurerBoxSourceHeight = adventurerBoxSource.height;
      // Get the X and Y coordinates of the adventurer element relative to the viewport
      const mouseX = adventurerRect.left;
      const mouseY = adventurerRect.top + adventurerBoxSourceHeight;

      // Call the function and pass the adventurer and mouse position as parameters
      displayAnyAdventurerInfo(adventurer, mouseX, mouseY);
    }
  }
});












































function closeAdventurerInfo() {
  const adventurerInfoContainer = document.getElementById('adventurer-info-container');

  clickSound();
    	adventurerInfoContainer.remove();
}

function hideEmptyElements(element) {
  const children = element.children;
  for (let i = children.length - 1; i >= 0; i--) {
    const child = children[i];
	if (child.textContent.trim() != '' || child.classList.contains('skilz')) {
		child.classList.add('dontdelete');
    }
    if (child.style.backgroundImage === `url("")` && !child.classList.contains("dontdelete"))  {
		child.style.display = "none";
    } else {
      child.style.display = ""; // Reset display for non-empty elements
    }
    if (child.textContent.trim() === '' && !child.classList.contains("dontdelete") && child.style.backgroundImage === "")  {
		child.style.display = "none";
    }
    hideEmptyElements(child); // Recursively check subchildren
  }
}




function showTooltip(event) {

  clearTimeout(delayTimerTooltip);

    delayTimerTooltip = setTimeout(() => {
    displayAdventurerInfo(event);
    }, SETTINGS.tooltipDelay);
 
}

function updateLifeBarAdventurersBottom(event) {
  const adventurerUID = event.target.getAttribute('uid');
  let adventurer = findAdventurerByUID(adventurerUID);
  const lifeBar = event.target.querySelector('.lifebar');
  if (lifeBar) {
    lifeBar.setAttribute('value', `${adventurer.Life}`);
    lifeBar.setAttribute('max', `${adventurer.MaxLife}`);
  }
}


function addItem() {
  const searchInput = document.getElementById('search-input');
  const searchText = searchInput.value.trim();

  const foundAdv = adventurers.find(adventurer => adventurer.Title === searchText);
  if (foundAdv) {
    searchInput.value = '';
    displayAndAddToGroup(foundAdv);
  }
}

function searchItems() {
  const searchInput = document.getElementById('search-input');
  const searchText = searchInput.value.trim();
  const filteredItems = adventurers.filter(adventurer =>
    adventurer.Title.toLowerCase().includes(searchText.toLowerCase())
  );
  showSuggestions(filteredItems);
}

function showSuggestions(filteredAdventurers) {
  const searchInput = document.getElementById('search-input');
  const suggestionsContainer = document.getElementById('suggestions-container');
  suggestionsContainer.innerHTML = '';

  filteredAdventurers.forEach(adventurer => {
    const suggestion = document.createElement('div');
    suggestion.classList.add('suggestion');
    suggestion.innerText = adventurer.Title; // Use 'Title' instead of 'title' property
    suggestion.addEventListener('click', selectSuggestion);
    suggestion.addEventListener('mouseover', fillTextField);
    suggestionsContainer.appendChild(suggestion);
  });

  suggestionsContainer.style.display = 'block';
}

function fillTextField(event) {
  const searchInput = document.getElementById('search-input');
  const selectedText = event.target.innerText;
  searchInput.value = selectedText;
}

function selectSuggestion(event) {
  const searchInput = document.getElementById('search-input');
  const selectedText = event.target.innerText;
  searchInput.value = selectedText;
  hideSuggestions(); // Call the hideSuggestions function when a suggestion is selected
}

function hideSuggestions() {
  const searchInput = document.getElementById('search-input');
  const suggestionsContainer = document.getElementById('suggestions-container');
  suggestionsContainer.style.display = 'none';
}













searchInput.addEventListener('input', searchItems);
searchInput.addEventListener('focusout', hideSuggestions);

function findRandomAdventurer() {
  const adventurersCount = adventurers.length;
  const usedIndexes = new Set();
  let randomIndex;

  do {
    randomIndex = Math.floor(Math.random() * adventurersCount);
  } while (usedIndexes.has(randomIndex));

  const adventurer = adventurers[randomIndex];
  usedIndexes.add(randomIndex);
  displayAndAddToGroup(adventurer);
  return adventurer;
}




function getEmptySlots(itemDivs) {
  const emptySlots = [];
  for (let i = 0; i < itemDivs.length; i++) {
    const itemDiv = itemDivs[i];
    if (!itemDiv.style.backgroundImage) {
      emptySlots.push(itemDiv);
    }
  }
  return emptySlots;
}

// Fill inventory randomly on button click
const fillInventoryButton = document.getElementById('fill-inventory-button');
fillInventoryButton.addEventListener('click', findRandomAdventurer);


function addEmptySlot(value) {
  if (TOTAL_PARTY_SLOTS > 5) {
    displayMessage("We can't sustain more than six members!", '#eb4343');
    return;
  }
  TOTAL_PARTY_SLOTS++;
  const n = value;
  createGroupSlot(n);
  updatePartyHeader();
}

// Add empty slot on button click
const addSlotButton = document.getElementById('add-slot-button');
addSlotButton.addEventListener('click', function() {
  addEmptySlot(1);
});






function updateInventoryInfo() {
  const inventoryContainer = document.getElementById('inventory-container');
  const itemDivs = inventoryContainer.getElementsByClassName('item');
  const emptySlotsCount = getEmptySlots(itemDivs).length;
  const occupiedSlotsCount = itemDivs.length - emptySlotsCount;
  const totalSlotsCount = itemDivs.length;

  const emptySlotsCountElement = document.getElementById('empty-slots-count');
  emptySlotsCountElement.textContent = emptySlotsCount;

  const occupiedSlotsCountElement = document.getElementById('occupied-slots-count');
  occupiedSlotsCountElement.textContent = occupiedSlotsCount;

  const totalSlotsCountElement = document.getElementById('total-slots-count');
  totalSlotsCountElement.textContent = totalSlotsCount;
}







let currentContextMenu;

function showContextMenu(event) {
  event.preventDefault();

  const itemDiv = event.target;

  if (currentContextMenu) {
    currentContextMenu.remove();
  }

  const contextMenu = document.createElement('div');
  contextMenu.setAttribute('id', 'context-menu');

  const removeItem = document.createElement('li');
  removeItem.setAttribute('id', 'remove-item');
  const adventurerToRemove = itemDiv.getAttribute('title');

  removeItem.textContent = `Remove ${adventurerToRemove}`;

  const showAdvInfoButton = document.createElement('li');
  showAdvInfoButton.setAttribute('id', 'show-adv-info');
  showAdvInfoButton.textContent = "Info";

  contextMenu.appendChild(showAdvInfoButton);
  contextMenu.appendChild(removeItem);

  showAdvInfoButton.addEventListener('click', () => displayAdventurerInfo(event));
  removeItem.addEventListener('click', removeItemFromInventory.bind(null, adventurerToRemove, itemDiv));
  document.addEventListener('click', hideContextMenu);

  contextMenu.style.left = `${event.clientX}px`;
  contextMenu.style.top = `${event.clientY}px`;
  contextMenu.style.display = "block";
  document.body.appendChild(contextMenu);

  currentContextMenu = contextMenu; // Store reference to the current context menu
}


function removeItemFromInventory(adventurerToRemove, itemDiv) {
  const inventoryContainer = document.getElementById('inventory-container');
  const advUID = itemDiv.getAttribute('uid');
  // Find the index of the adventurer to remove in the occupiedItems array
  const itemIndex = occupiedItems.indexOf(adventurerToRemove);

  if (itemIndex !== -1) {
    // Remove the adventurer from the occupiedItems array
    occupiedItems.splice(itemIndex, 1);
  }

  // Remove the adventurer's itemDiv element from the inventoryContainer
  inventoryContainer.removeChild(itemDiv);

  // Create a new empty slot element
  const n = 1;
  createGroupSlot(n);
  
  removeAdventurerFromGroup(advUID);
  updatePartyHeader();
}


function hideContextMenu(event) {
  const existingContextMenu = document.querySelector('#context-menu');
  if (existingContextMenu) {
    existingContextMenu.remove();
  }
}

  



function isItemInInventory(adventurer) {
  const inventoryContainer = document.getElementById('inventory-container');
  const inventoryItems = inventoryContainer.getElementsByClassName('item');

  for (let i = 0; i < inventoryItems.length; i++) {
    if (inventoryItems[i].getAttribute('title') === adventurer.title) {
      return true;
    }
  }

  return false;
}
























function displayAllAdventurer() {
  const allAdventurers = document.createElement('div');
  allAdventurers.setAttribute('id', 'all-adventurers');
  allAdventurers.style.display = 'flex';
  const allAdventurersHeader = document.createElement('div');
  allAdventurersHeader.innerHTML = 'All Adventurers';
  allAdventurersHeader.classList.add('infobox-header');
  allAdventurers.appendChild(allAdventurersHeader);

  for (const adventurer of adventurers) {
    if (adventurer) {
      // Convert number properties to strings and handle null properties
      for (const prop in adventurer) {
        if (adventurer[prop] === null) {
          adventurer[prop] = '';
        } else {
          adventurer[prop] = adventurer[prop];
        }
      }

      // Fetch the adventurer info template
      fetch('/Templates/adventurer-info.html')
        .then(response => response.text())
        .then(template => {
          // Create a new adventurerInfoContainer for each adventurer
          const adventurerInfoContainer = document.createElement('div');
          adventurerInfoContainer.setAttribute('id', 'adventurer-info-container');

          // Create a temporary div to hold the template content
          const tempContainer = document.createElement('div');
          tempContainer.innerHTML = template;

          // Get the elements from the template
          const elements = tempContainer.children;

          // Append all elements to the adventurer info container
          adventurerInfoContainer.style.display = 'block';

          for (const element of elements) {
            if (element.textContent.trim() !== '' || element.style.backgroundImage !== 'none') {
              adventurerInfoContainer.appendChild(element);
            }
          }

          // Update the adventurer info with the actual data
          adventurerInfoContainer.querySelector('.Art').style.backgroundImage = `url('/Art/Adventurers/${adventurer.Title}.png')`;
          adventurerInfoContainer.querySelector('.Title').textContent = `${adventurer.Title}`;

          adventurerInfoContainer.querySelector('.Rarity').textContent = adventurer.Rarity;
          adventurerInfoContainer.querySelector('.Culture').textContent = adventurer.Culture;
          adventurerInfoContainer.querySelector('.Age').textContent = adventurer.Age;
          adventurerInfoContainer.querySelector('.Life').textContent = adventurer.Life;
          adventurerInfoContainer.querySelector('.Speed').textContent = adventurer.Speed;

          adventurerInfoContainer.querySelector('.Type1').style.backgroundImage = `url(${adventurer.Type1})`;
          adventurerInfoContainer.querySelector('.Type2').style.backgroundImage = `url(${adventurer.Type2})`;
          adventurerInfoContainer.querySelector('.Type').textContent = adventurer.Type;

          adventurerInfoContainer.querySelector('.SubCategory').textContent = adventurer.SubCategory;
          adventurerInfoContainer.querySelector('.SubCategoryArt').style.backgroundImage = `url(${adventurer.SubCategoryArt})`;
          adventurerInfoContainer.querySelector('.MountedArt').style.backgroundImage = `url(${adventurer.MountedArt})`;
          adventurerInfoContainer.querySelector('.Specialty').textContent = adventurer.Specialty;
          adventurerInfoContainer.querySelector('.Specialty1').style.backgroundImage = `url(${adventurer.Specialty1})`;
          adventurerInfoContainer.querySelector('.Specialty2').style.backgroundImage = `url(${adventurer.Specialty2})`;

          adventurerInfoContainer.querySelector('.Lore').textContent = adventurer.Lore;
          adventurerInfoContainer.querySelector('.Upgrade1').textContent = adventurer.Upgrade1;
          adventurerInfoContainer.querySelector('.Upgrade2').textContent = adventurer.Upgrade2;
          adventurerInfoContainer.querySelector('.Upgrade3').textContent = adventurer.Upgrade3;
          adventurerInfoContainer.querySelector('.Upgrade1Art').style.backgroundImage = `url(${adventurer.Upgrade1Art})`;
          adventurerInfoContainer.querySelector('.Upgrade2Art').style.backgroundImage = `url(${adventurer.Upgrade2Art})`;
          adventurerInfoContainer.querySelector('.Upgrade3Art').style.backgroundImage = `url(${adventurer.Upgrade3Art})`;
          adventurerInfoContainer.querySelector('.CultureImg1').style.backgroundImage = `url(${adventurer.CultureImg1})`;
          adventurerInfoContainer.querySelector('.CultureImg2').style.backgroundImage = `url(${adventurer.CultureImg2})`;

          hideEmptyElements(adventurerInfoContainer);
          adventurerInfoContainer.style.display = 'block';
          adventurerInfoContainer.style.position = 'relative';

          const adventurerRarity = adventurerInfoContainer.querySelector('.Rarity').textContent;
          const topheader = adventurerInfoContainer.querySelector('#top-header');

          rarityBorderColor(adventurerRarity, adventurerInfoContainer, topheader);

          // Append the adventurerInfoContainer to the allAdventurers container
          allAdventurers.appendChild(adventurerInfoContainer);
        })
        .catch(error => {
          console.error('Error loading adventurer info template:', error);
        });
    }
  }

  // Append the allAdventurers container to the body outside the loop
  document.body.appendChild(allAdventurers);
  enableDragAndDropWindow(allAdventurersHeader);
  addCloseButton(allAdventurersHeader);
}










function updatePartyHeader() {
  let group = Array.from(groupAdventurers.values());
  const party = document.getElementById('party-container');
  party.querySelector('#party-adv-number').textContent = `Adventurers (${groupAdventurers.size} / ${TOTAL_PARTY_SLOTS})`;


  //party.querySelector('#party-header').appendChild(createPartyButtons());

  const advLeft = document.getElementById('adventurers');
  const advs = advLeft.querySelectorAll('.adventurer-slot');

  advs.forEach(el => {
    el.innerHTML = '';
  });


  let i = 0;
  group.forEach(adventurer => {
    const element = advs[i];
    const advPic = document.createElement('div');
    advPic.classList.add('pic');
    advPic.classList.add('item');
    advPic.setAttribute('uid', `${adventurer.uID}`)
    advPic.style.backgroundImage = `url('/Art/Adventurers/${adventurer.Title}.png')`;
    advPic.addEventListener('mouseenter', showTooltip);
  
    if (adventurer.Rarity === "Legendary") {
      advPic.classList.add("legendary-adv-slot");
    }
    if (adventurer.Rarity === "Rare") {
      advPic.classList.add("rare-adv-slot");
    }
    if (adventurer.Rarity === "Normal") {
      advPic.classList.add("normal-adv-slot");
    }
    if (adventurer.Rarity === "Uncommon") {
      advPic.classList.add("uncommon-adv-slot");
    }

    if (adventurer.isGroupLeader === true) {
      groupLeaderMark = document.createElement('div');
      groupLeaderMark.className = 'group-leader-mark';
      advPic.appendChild(groupLeaderMark);
    }
  
    element.appendChild(advPic);
    element.setAttribute('index', adventurer.index);
    i++;
  });

}

function removeAdventurerFromPartyBox(uid) {
    const party = document.getElementById('party-container');
    const selector = `.adv-box[uid="${uid}"]`;
    const elementAdv = party.querySelector(selector);
    if (elementAdv) {
      elementAdv.remove();
    }
}

function createAdvPartyBox(adventurer) {
  const advBox = document.createElement('div');
  advBox.classList.add('adv-box');
  advBox.setAttribute('uid', `${adventurer.uID}`)
  advBox.setAttribute('index', adventurer.index);

  advBox.style.backgroundImage = `url('/Art/Adventurers/${adventurer.Title}.png')`;

  const header = document.createElement('div');
  header.classList.add('header');

  header.setAttribute('uid', adventurer.uID);




  const types = document.createElement('div');
  types.classList.add('types');

  const type1 = document.createElement('div');
  type1.classList.add('type');
  type1.style.backgroundImage = `url('/Art/Categories/Types/${adventurer.Types[0]}.png')`;
  types.appendChild(type1);
  if (adventurer.Types.length === 2) {
    const type2 = document.createElement('div');
    type2.classList.add('type');
    type2.style.backgroundImage = `url('/Art/Categories/Types/${adventurer.Types[1]}.png')`;
    types.appendChild(type2);
  }

  advBox.appendChild(types);

  const title = document.createElement('div');
  title.classList.add('title');
  title.classList.add(`${adventurer.Rarity}`)
  title.innerText = `${adventurer.Title}`;

  const level = document.createElement('div');
  level.classList.add('level');
  level.innerText = `${adventurer.Level}`;

  const upkeep = document.createElement('div');
  upkeep.classList.add('upkeep');
  upkeep.innerText = `${adventurer.upkeep}`;
  addGenericTooltip(upkeep, 'Daily upkeep');
  title.appendChild(upkeep);

  header.appendChild(title);
  header.appendChild(level);



  const infos = document.createElement('div');
  infos.classList.add('infos');


  const left = document.createElement('div');
  left.classList.add('left');

  const advPic = document.createElement('div');
  advPic.classList.add('pic');
  advPic.classList.add('item');
  advPic.setAttribute('uid', `${adventurer.uID}`)
  advPic.style.backgroundImage = `url('/Art/Adventurers/${adventurer.Title}.png')`;





  if (adventurer.Rarity === "Legendary") {
    advPic.classList.add("legendary-adv-slot");
  }
  if (adventurer.Rarity === "Rare") {
    advPic.classList.add("rare-adv-slot");
  }
  if (adventurer.Rarity === "Normal") {
    advPic.classList.add("normal-adv-slot");
  }
  if (adventurer.Rarity === "Uncommon") {
    advPic.classList.add("uncommon-adv-slot");
  }

  groupLeaderMark = document.createElement('div');
  groupLeaderMark.className = 'group-leader-mark';
  groupLeaderMark.style.display = 'none';
  advPic.appendChild(groupLeaderMark);





  const right = document.createElement('div');
  right.classList.add('right');

  const lifeBarBox = document.createElement('div');
  lifeBarBox.classList.add('adv-combat-info');

  const lifeBar = document.createElement('progress');
  lifeBar.classList.add('lifebar');
  lifeBar.setAttribute('value', `${adventurer.Life}`);
  lifeBar.setAttribute('max', `${adventurer.MaxLife}`);

  right.appendChild(lifeBar);


  infos.appendChild(right);

  const bottom = document.createElement('div');
  bottom.classList.add('bottom');

  const attributesOrder = ['Strength', 'Dexterity', 'Artisanship', 'Cunning', 'Education'];
    attributesOrder.forEach(attr => {
      const attribute = document.createElement('div');
      attribute.classList.add('attribute');
      attribute.setAttribute('id', `${attr}`);
      attribute.innerText = `${adventurer.Attributes[attr]}`;
      if (adventurer.mainAttr[0] === attr || adventurer.mainAttr[1] === attr) {
        attribute.classList.add('main-attribute'); 
      }
      attribute.style.setProperty('color', `var(--${attr.substring(0, 3).toLowerCase()}-color)`);
      bottom.appendChild(attribute);
    });

    right.appendChild(bottom);
  
  const content = document.createElement('div');
  content.classList.add('content');

  content.append(advPic, infos, right, appendSkillSlots(adventurer));
  advBox.appendChild(header);
  advBox.appendChild(content);



  header.addEventListener('mouseover', showTooltip);

  advBox.addEventListener('mousedown', function (event) {
    if (!event.target.classList.contains('adv-box')) { return; }
    displayAdventurerOption(adventurer, advBox);
  });

  return advBox;
}


function appendSkillSlots(adventurer) {

  const container = document.createElement('div');
  container.classList.add('adv-skills-container');

  let number = 0;
  adventurer.Slots.forEach(slot => {
    // Create a skill-slot element
    const skillSlot = document.createElement('div');
    skillSlot.classList.add('skill-slot', slot.type, slot.status);
    skillSlot.setAttribute('type', `${slot.type}`);
    skillSlot.setAttribute('number', `${number}`);
    skillSlot.style.backgroundImage = `url(/Art/Categories/Types/small/grey/${slot.type}.png)`;
    number++;

    container.appendChild(skillSlot);

    cachedSkillSlots.push(skillSlot);


    skillSlot.addEventListener('dragover', dragOverSkill);
    skillSlot.addEventListener('drop', dropSkill);

    skillSlot.addEventListener('contextmenu', function(event) {
      event.preventDefault();
    });
  });

  let skillsFromSignatures = [];
  if (adventurer.Signature != '') {
    skillsFromSignatures.push(adventurer.Signature);
  }
  skillsFromSignatures.forEach(skillName => {
    const skill = skillsObject[skillName];
    if (skill) {
      const skillSlot = document.createElement('div');
      skillSlot.classList.add('skill-slot');
      container.prepend(skillSlot);

      const skillElement = document.createElement('div');
      skillElement.className = 'skill signature-skill';
      skillElement.classList.add(skill.rarity, skill.type);
      skillElement.setAttribute('type', skill.type);
      skillElement.innerHTML = skill.name;
      skillElement.setAttribute('attached-adventurer', `${adventurer.uID}`);
    
      skillElement.style.backgroundImage = `url('/Art/Skills/${skill.name}.png')`;
      skillElement.style.position = 'relative';
    
      skillElement.addEventListener('mouseover', displaySkillTooltip);
      skillElement.addEventListener('mouseout', removeSkillTooltip);
    
      skillSlot.appendChild(skillElement);
      adventurer.Skills.push(skill);
      ACTIVE_SKILLS.add(skill);
      updateActiveSkills();
    }
  });

  return container;
}








function updatePartyLeftSide(adventurer) {
  const advBox = document.querySelector(`.adv-box[uid="${adventurer.uID}"]`);
  if (!advBox) return; // If the adventurer box does not exist, exit the function

  // Update level
  const level = advBox.querySelector('.level');
  if (level) {
    level.innerText = `${adventurer.Level}`;
  }

  // Update life bar
  const lifeBar = advBox.querySelector('.lifebar');
  if (lifeBar) {
    const value = adventurer.Life;
    const max = adventurer.MaxLife;
    lifeBar.setAttribute('value', `${value}`);
    lifeBar.setAttribute('max', `${max}`);
    lifeBar.style.setProperty('--progress-value-color', calculateColor(value, max));
  }

  // Update attributes
  Object.keys(adventurer.Attributes).forEach(attr => {
    const attributeElement = advBox.querySelector(`.attribute[id="${attr}"]`);
    if (attributeElement) {
      attributeElement.textContent = `${adventurer.Attributes[attr]}`;
    }
  });
}

function calculateColor(value, max) {
  const ratio = value / max;
  const red = Math.round(255 * (1 - ratio));
  const green = Math.round(255 * ratio);
  return `rgb(${red}, ${green}, 25)`;
}



function cheatLevelUp() {
  const group = Array.from(groupAdventurers.values());
  for (i = 0 ; i < 10 ; i++) {
    group.forEach((adventurer) => {
      levelUpAdventurer(adventurer);
     });
  }
}