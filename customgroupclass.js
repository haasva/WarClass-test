fetchAndParseJSONCombination();
let customAdventurersSelected = new Map();
let selectedAdventurersCount = 0;

function playerGroupClassChoice() {
  rerollAllAdventurers();
  selectedAdventurersCount = 0;
  customAdventurersSelected = new Map();
  adventurersSelectionBatch = new Map();
  selectedTitles.clear();
const map = document.getElementById('map-container');
map.style.zIndex = 0;
map.querySelector('#map-header').textContent = 'Compose your Group';

const exCC = document.getElementById('choose-your-way');
if (exCC) { exCC.remove() };

  classChoice = document.createElement("div");
  classChoice.setAttribute('id', 'choose-your-way');
  classChoice.textContent = ``;
  document.body.appendChild(classChoice);
displayGroupClassCreator(classChoice);
}


function rerollAllAdventurers() {
  adventurers.forEach(adventurer => {
    resetAdventurer(adventurer)
  });

}







function displayGroupClassCreator(classChoice) {

  //enableALTKey();

    classChoice.innerHTML = '';
    const title = document.createElement("div");
    title.setAttribute('id', 'container-title');
    title.innerHTML = `Select 3 Adventurers from <span>${currentArea}</span>`;
    classChoice.appendChild(title);

    const sortBox = document.createElement("div");
    sortBox.setAttribute('id', 'sort-box');
    title.appendChild(sortBox);
    addCloseButton(title);

    appendSortBoxTemplate(sortBox);

    const selectionOfAdv = document.createElement('div');
    selectionOfAdv.setAttribute('class', 'selection-of-adv-main');
    selectionOfAdv.style.marginRight = '0px';

    const innerBox = document.createElement('div');
    innerBox.setAttribute('class', 'inner-box');

    classChoice.appendChild(innerBox);
  
    innerBox.appendChild(selectionOfAdv);
    displayStartingAdventurers2(selectionOfAdv, innerBox);
}


function displayStartingAdventurers2(groupClassInfos, innerBox) {
  const adventurersSelection = document.createElement('div');
  adventurersSelection.setAttribute('id', 'selection-box');

  const expand = document.createElement('button');
  expand.setAttribute('id', 'expand-button');
  expand.textContent = 'Expand';

  const adventurersSelectedArea = document.createElement('div');
  adventurersSelectedArea.setAttribute('id', 'selected-box');
  adventurersSelectedArea.style.height = '120px';

  const title2 = document.createElement('div');
  title2.setAttribute('id', 'subtitle');
  title2.textContent = "Our group:";

  groupClassInfos.appendChild(adventurersSelection);
  adventurersSelectedArea.appendChild(title2);
  groupClassInfos.appendChild(adventurersSelectedArea);
  groupClassInfos.appendChild(expand);

  expand.addEventListener('click', function(event) {
      adventurersSelection.classList.toggle('wide');
  });

  // Fetch adventurers by area data from JSON
  fetch('/JSONData/adventurers_by_area.json')
      .then(response => response.json())
      .then(areaData => {


                  // Find the adventurers for the current area
                  const adventurersForArea = areaData[currentArea] || [];

                  // Loop through adventurers and match them by Title to detailed adventurers array
                  adventurersForArea.forEach(areaAdventurerName => {
                      // Find the adventurer object from the detailed array by matching the Title
                      const matchedAdventurer = adventurers.find(adv => adv.Title === areaAdventurerName);

                      if (matchedAdventurer) { // option:  && matchedAdventurer.Rarity != "Legendary"
                          // Create a slot for the adventurer
                          const slot = document.createElement('div');
                          slot.classList.add('adv-select-slot', 'empty');
                          adventurersSelection.appendChild(slot);

                          // Use the adventurer object for slot selection
                          findAnyRandomAdventurerToSelect(slot, matchedAdventurer);
                      }
                  });

      })
      .catch(error => {
          console.error('Error loading adventurers by area:', error);
      });

  createConfirmClassButton(groupClassInfos);

  const sideContent = document.createElement('div');
  sideContent.setAttribute('id', 'side-content');
  sideContent.style.marginRight = "0px";
  sideContent.style.width = "40%";
  innerBox.appendChild(sideContent);

  const groupClassData = document.createElement('div');
  groupClassData.setAttribute('id', 'group-class-info');
  sideContent.appendChild(groupClassData);



  sideContent.appendChild(groupClassData);



  displayGroupClassInfo2();
}


  let selectedTitles = new Set(); // Initialize a set to keep track of selected titles


  async function shuffleSelectableBatch(selectedTypes, selectedSpecialties, selectedCultures, searchTerm) {
    return new Promise(async (resolve, reject) => {
      try {
        selectedTitles.clear(); // Clear the set of selected titles
  
        const confirmButton = document.getElementById('Confirm');
        confirmButton.disabled = true;
  
        let adventurersSelection = document.getElementById('selection-box');
        adventurersSelection.innerHTML = '';
  
        let adventurersSelected = document.getElementById('selected-box');
        adventurersSelected.innerHTML = '';
  
        selectedAdventurersCount = 0;
        customAdventurersSelected = new Map();
        adventurersSelectionBatch = new Map();
  
        updateGroupClassData();
  
        // Filter adventurers based on selected filters
        let filteredAdventurers = [];
        filteredAdventurers = await filterAdventurers(selectedTypes, selectedSpecialties, selectedCultures, searchTerm);

        const size = filteredAdventurers.length;

        for (let i = 0; i < size; i++) {
          const slot = document.createElement('div');
          slot.classList.add('adv-select-slot', 'empty');
          adventurersSelection.appendChild(slot);
  
          // Display filtered adventurers
          if (filteredAdventurers.length > i) {
            const adventurer = filteredAdventurers[i];
            await addAdventurerToSelection2(adventurer, slot);
          }
        }
  
        // Once all operations are complete, resolve the promise
        resolve();
      } catch (error) {
        // If any error occurs, reject the promise
        reject(error);
      }
    });
  }
  

async function filterAdventurers(selectedTypes, selectedSpecialties, selectedCultures, searchTerm) {
  return adventurers.filter(adventurer => {
      // Check if all selected types are present in adventurer's type
      const typeMatch = selectedTypes.every(type => adventurer.Type.includes(type));
      
      // Check if all selected specialties are present in adventurer's specialty
      const specialtyMatch = selectedSpecialties.every(specialty => adventurer.Specialty.includes(specialty));
      
      // Check if all selected cultures are present in adventurer's culture
      const cultureMatch = selectedCultures.every(culture => adventurer.Culture.includes(culture));
      
      // Check if the search term is present in any of the adventurer's properties
      const searchMatch = searchTerm.trim() === '' ||
                         Object.values(adventurer).some(value =>
                             typeof value === 'string' && value.toLowerCase().includes(searchTerm.toLowerCase())
                         );

      return typeMatch && specialtyMatch && cultureMatch && searchMatch;
  });
}
  
  
  function findAnyRandomAdventurerToSelect(slot, adventurer) {

      displayAdventurerToSelect2(adventurer, slot);
  }
  
  function displayAdventurerToSelect2(adventurer, slot) {
    const selectionContainer = document.getElementById('selection-box');
    const slots = selectionContainer.getElementsByClassName('adv-select-slot');
    const emptySlots = getEmptySlots(slots);
  
    if (emptySlots.length === 0) {
      return;
    }
  
    // Add the adventurer to the first empty slot
    const emptySlot = emptySlots[0];
    addAdventurerToSelection2(adventurer, slot);
   
  }

  
  async function addAdventurerToSelection2(adventurer, slot) {
    if (adventurer) {

      if (selectedTitles.has(adventurer.Title)) {
        slot.remove();
        return;
      }
      
      selectedTitles.add(adventurer.Title);

      adventurer = { ... await generateNewAdventurer(adventurer) };

      if (adventurer.Title === "Kharash") {
      randomizeAdvCulture(adventurer);
      }


      // Generate a unique uID
      const newAdventurer = { ...adventurer };

  
      adventurersSelectionBatch.set(newAdventurer.uID, newAdventurer);
      
      if (1 === 1) { //newAdvWithAffixes.BaseRarity === "Normal"
        displayANewAdventurerToSelect2(newAdventurer, slot);
      } else {
        slot.remove();
        return;
      }
      

    }
  }
  

  
  function displayANewAdventurerToSelect2(adventurer, emptySlot) {


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
    emptySlot.classList.remove('empty');


    if (emptySlot.classList.contains('adv-select-slot')) {

        emptySlot.addEventListener('mousedown', () => handleCheckboxChange(adventurer.uID, emptySlot));
      
        const priceTag = document.createElement('div');
        priceTag.classList.add('adventurer-price');
        priceTag.innerText = `${adventurer.Price}`;
        emptySlot.appendChild(priceTag);
    }

  
    emptySlot.setAttribute('uid', adventurer.uID);
    emptySlot.setAttribute('color', adventurer.color);
    emptySlot.addEventListener('mouseover', showTooltip);
    emptySlot.addEventListener('mouseover', showTooltip);
 
  }

  
  function createConfirmClassButton(groupClassInfos) {
    confirmArea = document.createElement('div');
    confirmArea.setAttribute('id', 'confirm-area');

    confirmButton = document.createElement('button');
    confirmButton.setAttribute('id', 'Confirm');
    confirmButton.addEventListener("click", confirm);
    confirmButton.disabled = true;
    confirmButton.textContent = `Confirm`;

    confirmArea.appendChild(confirmButton);
    groupClassInfos.appendChild(confirmArea);

    createShuffleButton(confirmArea);
    createRerollButton(confirmArea);
    
    function confirm() {
      groupAdventurers = customAdventurersSelected;

      endGroupClassSelection();
      customGroupClassMap.Attributes.Strength = 0;
      customGroupClassMap.Attributes.Cunning = 0;
      customGroupClassMap.Attributes.Artisanship = 0;
      customGroupClassMap.Attributes.Education = 0;
    }
  }


  function createRerollButton(confirmArea) {

    reroll = document.createElement('button');
    reroll.setAttribute('id', 'Reroll');
    reroll.addEventListener("click", playerGroupClassChoice);
    reroll.textContent = `Reroll`;

    confirmArea.append(reroll);
  }

  async function createShuffleButton(confirmArea) {

    shuffleButton = document.createElement('button');
    shuffleButton.setAttribute('id', 'Shuffle');
    shuffleButton.addEventListener("click", shuffleBatchSelection);
    shuffleButton.textContent = `Shuffle`;

    confirmArea.append(shuffleButton);
    
  }
  

  function shuffleBatchSelection() {
    let adventurersSelection = document.getElementById('selection-box');
    adventurersSelection.innerHTML = '';
    let cultures = areasObject[currentArea].cultures.split(', ');

    const size = adventurers.length;
    for (let i = 0; i < size; i++) {

      const advCultures = adventurers[i].Culture.split(', ');
      const hasMatchingCulture = advCultures.some(culture => cultures.includes(culture));

      if (hasMatchingCulture) {
        const slot = document.createElement('div');
        slot.classList.add('adv-select-slot', 'empty');
        adventurersSelection.appendChild(slot);
        findAnyRandomAdventurerToSelect(slot, adventurers[i]);
      }

    }

  }





  function handleCheckboxChange(UID, checkbox) {
    const adventurer = findAdventurerByUID(UID);

    if (!checkbox.classList.contains('preselected')) {
      if (selectedAdventurersCount < 3) {
        checkbox.classList.add('preselected');
        customAdventurersSelected.set(adventurer.uID, adventurer);
        GLOBAL_ADV_INDEX++;
        adventurer.index = GLOBAL_ADV_INDEX;
        selectedAdventurersCount += 1;
        displaySelectedAdventurers();
        playCongaSound();
        // updateCustomGroupClassName();
        updateGroupClassData();
      } else {
        return;
      }
    } else {
      checkbox.classList.remove('preselected');
      
      customAdventurersSelected.delete(adventurer.uID);
      selectedAdventurersCount -= 1;
      removeSelectedAdventurers();
      playOpenRegionSound();
      // updateCustomGroupClassName();
      updateGroupClassData();
    }
    let confirmButton = document.getElementById('Confirm');
    if (selectedAdventurersCount === 3) {
      confirmButton.disabled = false;
    } else {
      confirmButton.disabled = true;
    }
  

  }


  function displaySelectedAdventurers() {
    const adventurersSelectedArea = document.getElementById('selected-box');
    const selectionSlots = adventurersSelectedArea.getElementsByClassName('selection-slot');
    const selectedAdventurersValues = Array.from(customAdventurersSelected.values());
  
    // Clear the current content of adventurersSelectedArea
    adventurersSelectedArea.innerHTML = '';
  
    for (let i = 0; i < selectedAdventurersValues.length; i++) {
      const adventurer = selectedAdventurersValues[i];
      const slot = document.createElement('div');
      slot.classList.add('selection-slot', 'item');
      adventurersSelectedArea.appendChild(slot);
  
      displayANewAdventurerToSelect2(adventurer, slot);
    }
  }

  function removeSelectedAdventurers() {
    const adventurersSelectedArea = document.getElementById('selected-box');
    const selectionSlots = adventurersSelectedArea.getElementsByClassName('selection-slot');
    const selectedAdventurersValues = Array.from(customAdventurersSelected.values());
  
    // Iterate over the selection slots and remove slots for adventurers not in the map
    for (let i = 0; i < selectionSlots.length; i++) {
      const slot = selectionSlots[i];
      const slotUID = parseInt(slot.getAttribute('uid'));
      
      if (!customAdventurersSelected.has(slotUID)) {
        slot.remove();
      }
    }
  }

  let csvRows;

  function updateCustomGroupClassName() {
    const customGroupClass = generateCustomGroupClass(customAdventurersSelected);
    const customGroupClassText = document.getElementById('custom-group-class-title');
    customGroupClassText.textContent = customGroupClass.toString();
  }
  
  // Call the function to fetch and parse the JSON file
  fetchAndParseJSONCombination().then(jsonData => {
    if (jsonData) {
      // Assign jsonData to csvRows for consistency
      csvRows = jsonData;
    }
  });
  


async function fetchAndParseJSONCombination() {
    const jsonPath = '/JSONData/class-combination.json'; // Adjust the path accordingly
  
    try {
      // Fetch the JSON file
      const response = await fetch(jsonPath);
  
      if (!response.ok) {
        throw new Error(`Failed to fetch JSON file: ${response.status} ${response.statusText}`);
      }
  
      // Parse the JSON data
      const jsonData = await response.json();
  
      return jsonData;
    } catch (error) {
      console.error('Error fetching and parsing JSON:', error);
      return null;
    }
  }
  



// Function to get the combination for a pair of adventurer types
function getCombination(type1, type2) {
    // Find the row with the given type1
    const row = csvRows.find(entry => entry["Types"] === type1);
  
    // Check if the row is valid
    if (row) {
      // Get the combination from the intersection of the row and column
      return row[type2];
    }
  
    // If the type1 is not found, return a default value
    return '';
  }
  
// Function to determine the prefix based on the type
function getPrefixForThirdAdventurer(type) {
    switch (type) {
      case 'Noble':
        return 'Errant';

      case 'Intellectual':
        return 'Journeying';

      case 'Commoner':
        return 'Nomadic';

      case 'Soldier':
        return 'Itinerant';

      case 'Religious':
        return 'Peregrine';

      case 'Outlaw':
        return 'Roving';

      case 'Explorer':
        return 'Wandering';

      case 'Slave':
        return 'Vagrant';
      default:
        return '';
    }
  }
  
  // Function to generate the customGroupClass based on selected adventurers
  function generateCustomGroupClass(selectedAdventurers) {
    let customGroupClass = "";


    if (selectedAdventurers.size === 1) {
      customGroupClass = "Lone Adventurer";
        customGroupClassMap.Gold = 150;

      return customGroupClass;
    }

    const adventurerTypes = Array.from(selectedAdventurers.values(), adventurer => {
      const types = adventurer.Type.split(', ');
      return types.length > 1 ? types : types[0];
  }).flat();



    shuffleArray(adventurerTypes);
    function shuffleArray(adventurerTypes) {
      for (let i = adventurerTypes.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [adventurerTypes[i], adventurerTypes[j]] = [adventurerTypes[j], adventurerTypes[i]];
      }
  }
  
    
    if (adventurerTypes.length >= 2 && selectedAdventurers.size >= 2) {
      
// Count occurrences of each adventurer type
const typeCounts = adventurerTypes.reduce((acc, type) => {
  acc[type] = (acc[type] || 0) + 1;
  return acc;
}, {});



// Get the two most recurring types
const sortedTypes = Object.entries(typeCounts)
  .sort(([, countA], [, countB]) => countB - countA);

let mostRecurringTypes = sortedTypes.slice(0, sortedTypes.length).map(([type]) => type);



if (sortedTypes.length > 1 && sortedTypes[0][1] >= 2) {
  mostRecurringTypes = sortedTypes.slice(0, 1).map(([type]) => type);
}
if (sortedTypes.length > 1 && sortedTypes[1][1] >= 2) {
  mostRecurringTypes = sortedTypes.slice(0, 2).map(([type]) => type);
}

// Remove duplicates


customGroupClass = "";

let affixes = [];
let prefixes = [];
let newCombination;




    
while (affixes.length < 50) {
  
  shuffleArray(mostRecurringTypes);
  function shuffleArray(mostRecurringTypes) {
    for (let i = mostRecurringTypes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [mostRecurringTypes[i], mostRecurringTypes[j]] = [mostRecurringTypes[j], mostRecurringTypes[i]];
    }
  }

    if (mostRecurringTypes.length === 1) {

        newCombination = getCombination(mostRecurringTypes[0], mostRecurringTypes[0]);
        affixes.push(newCombination);
        
    } else if (mostRecurringTypes.length > 1) {

        newCombination = getCombination(mostRecurringTypes[0], mostRecurringTypes[1]);
        affixes.push(newCombination);

    }
    
}

// Remove duplicates
affixes = Array.from(new Set(affixes));
// Randomly select one from affixes array
customGroupClass = affixes[Math.floor(Math.random() * affixes.length)];



updateGroupClassInitialGold(customGroupClass).then(([newGroupCoins, bonusSlots, rebate]) => {
  customGroupClassMap.Gold = newGroupCoins || 0;
  customGroupClassMap.Slots = bonusSlots || 0;
  customGroupClassMap.Rebate = rebate || 0;
  
  //const groupClassInfo = document.getElementById('group-class-info');
  //groupClassInfo.querySelector('#class-icon').style.backgroundImage = `url('../Art/Group Class/${customGroupClass}.png')`;
  //groupClassInfo.querySelector('#base-gold').textContent = `${customGroupClassMap.Gold}`;
  //const bonusSlotsInfo = groupClassInfo.querySelector('#base-slots-value');
    //bonusSlotsInfo.textContent = `${customGroupClassMap.Slots}`;
  //const rebateInfo = groupClassInfo.querySelector('#rebate-value');
   // rebateInfo.textContent = `${customGroupClassMap.Rebate}`;
});

if (adventurerTypes.length >= 3) {

  let prefix;
  let prefixType;

while (prefixes.length < 50) {

  shuffleArray(adventurerTypes);
  function shuffleArray(adventurerTypes) {
    for (let i = adventurerTypes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [adventurerTypes[i], adventurerTypes[j]] = [adventurerTypes[j], adventurerTypes[i]];
    }
  }

  prefixType = adventurerTypes.find(type => type !== adventurerTypes[0]);
  if (!prefixType) {
      prefixType = adventurerTypes.find(type => type !== adventurerTypes[0]);
      
  }
  

  prefix = getPrefixForThirdAdventurer(prefixType);
  prefixes.push(prefix);
  

}

// Remove duplicates
prefixes = Array.from(new Set(prefixes));
// Randomly select one from affixes array
prefix = prefixes[Math.floor(Math.random() * prefixes.length)];



  let suffix = `${customGroupClass}`;
  customGroupClass = `${prefix} ${customGroupClass}`;
  const chooseYourWay = document.getElementById('choose-your-way');
  if (chooseYourWay) {
    generateGroupDescription(prefix, suffix);
    populateCustomGroupClassSelectors(prefixes, affixes);
  }
  
  
}



return customGroupClass;
    }

    // If there are not enough adventurers, return a default value
    customGroupClassMap.Gold = 150;
    return 'Lone Adventurer';
}


async function updateGroupClassInitialGold(title) {
  let newGroupCoins = 0;
  try {
    const response = await fetch('/JSONData/group-classes-bonuses.json');
    const data = await response.json();
    
    // Find the object with the matching title
    let groupClassData = data.find(group => group.Title === title);
    
    if (groupClassData) {
      // Coins
      newGroupCoins = groupCoins + groupClassData.Gold || 0;

      // Slots
      bonusSlots = groupClassData.Slots || 0;

      // rebate
      rebate = groupClassData.Rebate || 0;

      return [newGroupCoins, bonusSlots, rebate];




    }


  } catch (error) {
    console.error('Error loading groupClassBonuses JSON:', error);
  } Promise.resolve(newGroupCoins);
}


let customGroupClassMap = new Map();
function updateGroupClassData() {

  let customGroupClassTitle;
  const groupClassInfo = document.getElementById('group-class-info');

    if (customAdventurersSelected.size > 1) {

      customGroupClassTitle = generateCustomGroupClass(customAdventurersSelected);


    } else {

      customGroupClassTitle = 'Lone Adventurer';
      
      let affixesElement = document.querySelector('#groupclass-affixes');
      let prefixesElement = document.querySelector('#groupclass-prefixes');
    
      // Clear and populate affixes select element
      affixesElement.innerHTML = '';
      prefixesElement.innerHTML = '';

    }
    

    

    // Ensure customGroupClassMap.Attributes is initialized as an object
    customGroupClassMap.Title = customGroupClassTitle.toString();
    customGroupClassMap.Attributes = customGroupClassMap.Attributes || {};
    customGroupClassMap.Start = customGroupClassMap.Start || {};
    customGroupClassMap.Slots = customGroupClassMap.Slots || {};
    customGroupClassMap.StartingSkills = customGroupClassMap.StartingSkills || {};
    customGroupClassMap.Traits = customGroupClassMap.Traits || {};

    // Initialize attributes sum
    let sumStrength = 0;
    let sumCunning = 0;
    let sumArtisanship = 0;
    let sumEducation = 0;
    let spentGold = 0;
    let dailyUpkeep = 0;

    // Iterate over selected adventurers and calculate the sum
    customAdventurersSelected.forEach(adventurer => {
        sumStrength += adventurer.Attributes.Strength || 0;
        sumCunning += adventurer.Attributes.Cunning || 0;
        sumArtisanship += adventurer.Attributes.Artisanship || 0;
        sumEducation += adventurer.Attributes.Education || 0;
        spentGold += adventurer.Price || 0;
        dailyUpkeep += adventurer.upkeep || 0;
    });

    // Apply the sums to customGroupClassMap.Attributes
    customGroupClassMap.Attributes.Strength = sumStrength;
    customGroupClassMap.Attributes.Cunning = sumCunning;
    customGroupClassMap.Attributes.Artisanship = sumArtisanship;
    customGroupClassMap.Attributes.Education = sumEducation;
    customGroupClassMap.spentGold = spentGold;
    customGroupClassMap.dailyUpkeep = dailyUpkeep;

    updateGroupClassInitialGold(customGroupClassTitle).then(([newGroupCoins, bonusSlots, rebate]) => {
      customGroupClassMap.Gold = newGroupCoins;
      customGroupClassMap.Slots = bonusSlots;
      customGroupClassMap.Rebate = rebate;

      groupClassInfo.querySelector('#class-icon').style.backgroundImage = `url('../Art/Group Class/${customGroupClassTitle}.png')`;
      groupClassInfo.querySelector('#class-title').textContent = customGroupClassMap.Title;
      groupClassInfo.querySelector('#base-gold').textContent = `${customGroupClassMap.Gold}`;
      groupClassInfo.querySelector('#base-slots-value').textContent = `${customGroupClassMap.Slots}`;
      groupClassInfo.querySelector('#rebate-value').textContent = `${customGroupClassMap.Rebate}`;
      groupClassInfo.querySelector('#upkeep-value').textContent = `${customGroupClassMap.dailyUpkeep}`;
    });

    actualizeGroupClassData(groupClassInfo);
    const locationChoices = groupClassInfo.querySelector('#choose-location');
    locationChoices.innerHTML = '';
}


async function populateCustomGroupClassSelectors(prefixes, affixes) {



  let affixesElement = document.querySelector('#groupclass-affixes');
  let prefixesElement = document.querySelector('#groupclass-prefixes');

  // Clear and populate affixes select element
  affixesElement.innerHTML = '';
  affixes.sort();
  affixes.forEach(affix => {
      const optionElement = document.createElement('option');
      optionElement.textContent = affix;
      affixesElement.appendChild(optionElement);
  });

  // Clear and populate prefixes select element
  prefixesElement.innerHTML = '';
  prefixes.sort();
  prefixes.forEach(prefix => {
      const optionElement = document.createElement('option');
      optionElement.textContent = prefix;
      prefixesElement.appendChild(optionElement);
  });



  let selectedAffix = '';
  let selectedPrefix = '';
    selectedPrefix = prefixes[0];
    selectedAffix = affixes[0];

  // Event listener for affixes select element
  affixesElement.addEventListener('change', function() {
      selectedAffix = affixesElement.value;
      updateCustomGroupClassTitle();
  });

  // Event listener for prefixes select element
  prefixesElement.addEventListener('change', function() {
      selectedPrefix = prefixesElement.value;
      updateCustomGroupClassTitle();
  });

  // Function to update customGroupClassMap.Title and UI
  async function updateCustomGroupClassTitle() {
      customGroupClassMap.Title = `${selectedPrefix} ${selectedAffix}`;

      let groupClassInfo = document.getElementById('group-class-info');

      updateGroupClassInitialGold(selectedAffix).then(([newGroupCoins, bonusSlots, rebate]) => {
        
        customGroupClassMap.Gold = newGroupCoins;
        customGroupClassMap.Slots = bonusSlots;
        customGroupClassMap.Rebate = rebate;

        groupClassInfo.querySelector('#class-icon').style.backgroundImage = `url('../Art/Group Class/${selectedAffix}.png')`;
        groupClassInfo.querySelector('#class-title').textContent = customGroupClassMap.Title;
        groupClassInfo.querySelector('#base-gold').textContent = `${customGroupClassMap.Gold}`;
        groupClassInfo.querySelector('#base-slots-value').textContent = `${customGroupClassMap.Slots}`;
        groupClassInfo.querySelector('#upkeep-value').textContent = `${customGroupClassMap.dailyUpkeep}`;
        groupClassInfo.querySelector('#rebate-value').textContent = `${customGroupClassMap.Rebate}`;
      });




  }
}




  

function actualizeGroupClassData(groupClassInfo) {
      
    groupClassInfo.querySelector('#class-title').textContent = `${customGroupClassMap.Title}`;
    //groupClassInfo.querySelector('#type1-text').textContent = `${customGroupClassMap.Major}`;
    //groupClassInfo.querySelector('#type2-text').textContent = `${customGroupClassMap.Minor}`;
    //groupClassInfo.querySelector('#type1-pic').style.backgroundImage = `url(${customGroupClassMap.Type1})`;
    //groupClassInfo.querySelector('#type2-pic').style.backgroundImage = `url(${customGroupClassMap.Type2})`;
    // groupClassInfo.querySelector('#base-slots-value').textContent = `${customGroupClassMap.Slots}`;

    groupClassInfo.querySelector('#base-gold').textContent = `${customGroupClassMap.Gold}`;
    groupClassInfo.querySelector('#spent-gold').textContent = `- ${customGroupClassMap.spentGold}`;
    groupClassInfo.querySelector('#result-gold').textContent = `= ${customGroupClassMap.Gold - customGroupClassMap.spentGold}`;
    groupClassInfo.querySelector('#upkeep-value').textContent = `${customGroupClassMap.dailyUpkeep}`;
    groupClassInfo.querySelector('#class-desc').textContent = `${customGroupClassMap.Desc}`;

    groupClassInfo.querySelector('#strength').textContent = `${customGroupClassMap.Attributes.Strength}`;
    groupClassInfo.querySelector('#cunning').textContent = `${customGroupClassMap.Attributes.Cunning}`;
    groupClassInfo.querySelector('#artisanship').textContent = `${customGroupClassMap.Attributes.Artisanship}`;
    groupClassInfo.querySelector('#education').textContent = `${customGroupClassMap.Attributes.Education}`;

    appendStartingSkills2();
    appendGroupClassTypes();
    activateSkillEventListeners();
    fetchAreasData().then(() => {
        determineStartLocations(groupClassInfo);
    });
}

function generateGroupDescription(a, b) {

    const selectedAdventurersNames = Array.from(customAdventurersSelected.values()).map((adventurer, index, array) => {
        // Determine the appropriate article ('a' or 'an') based on the first letter of the adventurer's name
        const article = 'aeiou'.includes(adventurer.Title[0].toLowerCase()) ? 'an' : 'a';

        // Add 'and' before the last adventurer's name
        return index === array.length - 1 ? `and ${article} ${adventurer.Title}` : `${article} ${adventurer.Title}`;
    });

    const adventurersList = selectedAdventurersNames.join(', ');

    customGroupClassMap.Desc = `A heteroclite ${b.toLowerCase()} composed of ${adventurersList}, being ${a.toLowerCase()}. Shall their endeavour lead to their success?`;
    
}




function appendLocationChoices(groupClassInfo) {
    const locationChoices = groupClassInfo.querySelector('#choose-location');
    locationChoices.innerHTML = '';

    // Iterate through customGroupClassMap.Start and append location elements
    Object.keys(customGroupClassMap.Start).forEach((key, index) => {
        
        // Create location choice element
        const locationChoiceElement = document.createElement('div');
        locationChoiceElement.id = `location-choice${index + 1}`;
        locationChoiceElement.classList.add('location-choice');
        
        // Create starting location element
        const startingLocationElement = document.createElement('div');
        startingLocationElement.id = `starting-location${index + 1}`;

        // Append starting location to location choice
        locationChoiceElement.appendChild(startingLocationElement);

        // Append location choice to location choices container
        locationChoices.appendChild(locationChoiceElement);
        
        // Set background image for the location choice
        const locationName = customGroupClassMap.Start[key];
        const areaPic = areasObject[locationName].headerpic;
        locationChoiceElement.style.backgroundImage = `url('/Art/Interface/Terrains/location_headers/${areaPic}.png')`;
        locationChoiceElement.textContent = locationName.toString();
    });
}

function determineStartLocations(groupClassInfo) {
  const selectedAdventurersValues = Array.from(customAdventurersSelected.values());

  // Check if there are at least three adventurers
  if (selectedAdventurersValues.length >= 1) {

      // Initialize Start if not defined
      customGroupClassMap.Start = {};

      // Extract the first culture from each adventurer
      const cultures = selectedAdventurersValues.slice(0, 3).map(adventurer => adventurer.Culture.split(',')[0]);

      // Create a set to store unique locations
      const uniqueLocations = new Set();

      // Iterate through the cultures and assign corresponding locations
      for (let i = 0; i < cultures.length; i++) {
          const culture = cultures[i];
          const matchingAreas = findMatchingAreas(culture);

          // If there are matching areas, randomly select one
          if (matchingAreas.length > 0) {
              const selectedArea = matchingAreas[Math.floor(Math.random() * matchingAreas.length)];
              uniqueLocations.add(selectedArea.name); // Add location to the set
          }
      }

      // Convert set to array and assign to customGroupClassMap.Start
      customGroupClassMap.Start = [...uniqueLocations];

      // Log the updated customGroupClassMap


      // Append location elements
      appendLocationChoices(groupClassInfo);
  }
}



function findMatchingAreas(targetCulture) {
    // Filter areas based on matching cultures
    const matchingAreas = Object.values(areasObject).filter(area => {
        const areaCultures = area.cultures.split(',')[0]; // Extract the first culture
        return areaCultures === targetCulture;
    });

    // Shuffle the matching areas using the Fisher-Yates algorithm
    for (let i = matchingAreas.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [matchingAreas[i], matchingAreas[j]] = [matchingAreas[j], matchingAreas[i]];
    }

    return matchingAreas;
}


function appendStartingSkills2() {
    const skillsStartElement = document.getElementById('skills-start');

    // Initialize the starting skills string
    let startingSkills = '';
    let startingSkillsString = '';

    // Iterate through each selected adventurer and append their Signature to startingSkills
    customAdventurersSelected.forEach(adventurer => {
        startingSkills += adventurer.Signature + '_'; // Use a special character as a delimiter
        startingSkillsString += adventurer.Signature + ', ';
    });

    customGroupClassMap.StartingSkills = startingSkillsString;

    // Trim any trailing delimiter
    startingSkills = startingSkills.replace(/_+$/, '');

    // Clear existing skill elements
    skillsStartElement.innerHTML = '';

    // Split the StartingSkills string into an array of skill names using the special character
    const startingSkillsArray = startingSkills.split('_');

    // Iterate through each skill name and create corresponding skill elements
    startingSkillsArray.forEach(skillName => {
        // You may want to add further validation to ensure skillName is valid
        const skill = skillsObject[skillName];

        if (skill) {
            const skillElement = document.createElement('div');
            skillElement.className = 'skill';
            skillElement.classList.add('skill-gc-selection');
            skillElement.classList.add(`${skill.type}`);
            skillElement.classList.add(`${skill.rarity}`);
            skillElement.innerHTML = skill.name;
            skillElement.style.backgroundImage = `url('/Art/Skills/${skill.name}.png')`;
            skillElement.style.position = 'relative';
            // Append the skill element to the #skills-start container
            skillsStartElement.appendChild(skillElement);
        }
    });
}

function appendGroupClassTypes() {
  const typesContainer = document.getElementById('class-types');
  let allTypes = [];

  customAdventurersSelected.forEach(adventurer => {
    const adventurerTypes = adventurer.Type.split(',').map(type => type.trim()); // Split types and remove whitespace
    allTypes = allTypes.concat(adventurerTypes);
  });

  // Remove duplicate types
  const uniqueTypes = Array.from(new Set(allTypes));

  customGroupClassMap.Type = uniqueTypes.join(', ');
  typesContainer.innerHTML = '';

  uniqueTypes.forEach(type => {
    const typeElement = document.createElement('div');
    typeElement.className = 'type';
    typeElement.setAttribute('infos', `${type}`);
    typeElement.style.backgroundImage = `url('/Art/Categories/Types/${type}.png')`;
    typeElement.style.position = 'relative';
    typesContainer.appendChild(typeElement);

    const infos = typeElement.getAttribute('infos');
    addGenericTooltip(typeElement, infos);
  });

  if (uniqueTypes.length > 1) {
  }
}




function displayGroupClassInfo2() {
    
    const groupClassInfo = document.querySelector('#group-class-info');
    groupClassInfo.textContent = "";
  
  
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

    const groupClassTitle = document.getElementById('class-title');
    groupClassTitle.textContent = '[Group Title]';

    groupClassInfo.querySelector('#base-gold').textContent = `${groupCoins}`;
  
    })
    .catch(error => {
      console.error('Error loading group class selector template:', error);
    });
  }