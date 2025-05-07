function getGroupLeader(group) {
  const leader = group.find(adventurer => adventurer.isGroupLeader === true);
  return leader;
}

function displayLeftSideParty() {

const existParty = document.getElementById('party-container');
if (existParty) {
  existParty.remove();
}

let group = Array.from(groupAdventurers.values());

  let partyContainer = document.createElement('div');
  partyContainer.setAttribute('id', 'party-container');
  //partyContainer.classList.add('infobox');

  let partyHeader = document.createElement('div');
  partyHeader.setAttribute('id', 'party-header');

  let partyAdvs = document.createElement('div');
  partyAdvs.setAttribute('id', 'party-adv-number');
  partyAdvs.textContent = `Adventurers (${groupAdventurers.size}/${TOTAL_PARTY_SLOTS})`;

  let groupLeader = document.createElement('div');
  groupLeader.setAttribute('id', 'party-leader');
  const leader = getGroupLeader(group);
  if (leader) {
    groupLeader.textContent = `Group leader: ${leader.Title}`;
  }

  const partyInside = document.createElement('div');
  partyInside.id = 'party-container-inside';

  let party = document.createElement('div');
  party.setAttribute('id', 'party');



  group.forEach(adventurer => {
    const element = createAdvPartyBox(adventurer);
    party.appendChild(element);
  });

  partyHeader.appendChild(partyAdvs);
  partyHeader.appendChild(groupLeader);

  partyContainer.appendChild(partyHeader);

  partyInside.appendChild(party);

  partyContainer.appendChild(partyInside);

  //partyContainer.appendChild(showPartyWeaponry(group));

  checkDisableLevelUpButtonsAdv();

  return partyContainer;

  
}

function showPartyWeaponry(group) {
  const weaponry = document.createElement('div');
  weaponry.innerHTML = '';
  group.forEach(adventurer => {
    weaponry.appendChild(createAdventurerWeaponSlot(adventurer.Equipment.Weapon));
  });
  return weaponry;
}



function createGroupSheet() {

    const groupSheetContainer = document.createElement('div');
    groupSheetContainer.setAttribute('id', 'group-sheet-container');
    //groupSheetContainer.classList.add('infobox');

    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = `Group Attributes`;

    groupSheetContainer.appendChild(title);

    fetch('/Templates/group-sheet.html')
    .then(response => response.text())
    .then(template => {

      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = template;
      const elements = tempContainer.children;

      for (const element of elements) {
        groupSheetContainer.appendChild(element);
      }

    //   let header = document.createElement('div');
    //   header.setAttribute('id', 'group-sheet-header');
    //   header.classList.add('infobox-header');
    //   header.textContent = `Our Group (${customGroupClassMap.Title})`;

      enableGroupSheetAttributeTooltips(groupSheetContainer);
      
      
    })
return groupSheetContainer;

}


function displayCKTable() {

  const exTable = document.querySelector('#ck-table');
  if ( exTable ) { exTable.remove() }

  calculateCulturalKnowledge();

  const categoryAverages = calculateCategorySum();

  const CKTable = document.createElement('div');
  CKTable.id = 'ck-table';
  //CKTable.classList.add('infobox');
  CKTable.innerHTML = ''; // Clear previous content

  const ckTitle = document.createElement('div');
  ckTitle.className = 'title';
  ckTitle.textContent = 'Cultural Knowledge';

  CKTable.appendChild(ckTitle);

  // Group cultures by category
  const topThreeCultures = [...CULTURES_DATA]
  .sort((a, b) => b.knowledge - a.knowledge) // Sort cultures by knowledge value in descending order
  .slice(0, 3) // Take the top three cultures
  .map(culture => culture.culture); // Extract only the culture names

const groupedByCategory = CULTURES_DATA.reduce((groups, culture) => {
  // Check if the current culture is in the top three and mark it as favored
  if (topThreeCultures.includes(culture.culture)) {
    culture.favored = true;
  } else {
    culture.favored = false; // Ensure others don't have this field set
  }

  if (!groups[culture.category]) {
    groups[culture.category] = [];
  }
  groups[culture.category].push(culture);

  return groups;
}, {});

  const categoryContainer = document.createElement('div');
  categoryContainer.classList.add('category-container');
  
  // Store category boxes in an array
  const categoryBoxes = [];
  
  for (const category in groupedByCategory) {
    const categoryBox = document.createElement('div');
    categoryBox.classList.add('category-box');
  
    const categoryHeader = document.createElement('div');
    categoryHeader.classList.add('category-header');
    categoryHeader.textContent = `${category}`;
  
    // Add the category name and average knowledge value to the header
    const averageKnowledge = Math.floor(categoryAverages[category]) || 0; // Default to 0 if no data
    const categoryAverage = document.createElement('span');
    categoryAverage.classList.add('category-average');
    categoryAverage.textContent = `(${averageKnowledge})`;

    

    
  
    categoryHeader.appendChild(categoryAverage);
    categoryBox.appendChild(categoryHeader);
  
    groupedByCategory[category].forEach(culture => {
      const cultureRow = document.createElement('div');
      cultureRow.classList.add('culture-row');
  
      const icon = document.createElement('div');
      icon.classList.add('icon');
      icon.style.backgroundImage = `url('Art/Cultures/${culture.culture}.png')`;
  
      const text = document.createElement('div');
      text.classList.add('text');

      if (culture.inGroup === true) {
        text.classList.add('in-group');
      }
      text.textContent = `${culture.culture}`;
  
      const knowledgeValue = document.createElement('div');
      knowledgeValue.classList.add('knowledge-value');
      knowledgeValue.textContent = `${culture.knowledge}`;

      if (culture.favored === true) {
        text.classList.add('favored');
        knowledgeValue.classList.add('favored');
      }
  
      cultureRow.appendChild(icon);
      cultureRow.appendChild(text);
      cultureRow.appendChild(knowledgeValue);
  
      categoryBox.appendChild(cultureRow);
    });
  
    categoryBox.setAttribute('knowledge', averageKnowledge);
    categoryBoxes.push(categoryBox); // Add to the array
  }
  
  // Sort the category boxes by their 'knowledge' attribute
  categoryBoxes.sort((a, b) => 
    parseInt(b.getAttribute('knowledge')) - parseInt(a.getAttribute('knowledge'))
  );
  
  // Append sorted category boxes to the container
  categoryBoxes.forEach(box => categoryContainer.appendChild(box));
  
  CKTable.appendChild(categoryContainer);












  updateGroupAttributes();

  const bottom = document.createElement('div');
  bottom.innerHTML = '';
  bottom.className = 'bottom';

  bottom.appendChild(drawCultureRadar());
  bottom.appendChild(createCulturalTraitsBox());

  CKTable.appendChild(bottom);
  


  return CKTable;
 
}


function createSettingsWindow() {
    let settings = document.createElement('div');
    settings.id = 'settings-window';
    //settings.classList.add('infobox');



    let settingsContent = document.createElement('div');
    settingsContent.id = 'settings-content';

    fetch('/Templates/settings.html')
        .then(response => response.text())
        .then(template => {
            settingsContent.innerHTML = template;
            settings.appendChild(settingsContent);


            // Move listener initialization here to ensure the elements are loaded
            createListenersSettings(settings);

            
        })
        .catch(error => {
            console.error('Error loading template:', error);
        });
        return settings;
}


function appendPanelContent() {
    const middle = document.getElementById('middle');

    const partyContent = middle.querySelector('#party_content');
    const cultureContent = middle.querySelector('#culture_content');
    const settingsContent = middle.querySelector('#settings_content');
    const factionsContent = middle.querySelector('#factions_content');

    const party1 = displayLeftSideParty();
    const sheet = createGroupSheet();
    const ckTable = displayCKTable();
    const factions = toggleFactionTable();
    const sett = createSettingsWindow();

    partyContent.appendChild(party1);
    cultureContent.appendChild(sheet);
    cultureContent.appendChild(ckTable);
    factionsContent.appendChild(factions);
    settingsContent.appendChild(sett);

        displayFactionsData();



    const tabs = middle.querySelectorAll('.panel_tab');
    tabs.forEach(tab => {
        tab.addEventListener('mouseup', (event) => {
              switchTabPanel(event, tab, middle);
        });
        tab.addEventListener('mousedown', (event) => {
          if (!tab.classList.contains('active')) {
            playCongaSound();
          }
        });
      });
}


function switchTabPanel(event, tab, middle) {

    if (!tab.classList.contains('active')) {
        playClickSound();
    }

    const tabs = middle.querySelectorAll('.panel_tab');
    tabs.forEach(tab => {
        tab.classList.remove('active');
      });

    const otherContents = middle.querySelectorAll('.tabcontent');
    otherContents.forEach(content => {
        content.classList.remove('active');
    });

    tab.classList.add('active');

    const target = tab.getAttribute('target');

    const targetContent = middle.querySelector(`#${target}`);
    targetContent.classList.add('active');

    if (target === 'culture_content') {
        targetContent.querySelector('#ck-table').remove();
        targetContent.appendChild(displayCKTable());
    }
    if (target === 'map_content') {
      centerOverworldGroup();
    }

}





function displayAdventurerOption(adventurer, box) {
  CURRENT_MANAGED_ADVENTURER = adventurer;
  const partyAdventurers = document.querySelectorAll('.adv-box');
  partyAdventurers.forEach(adv => {
    adv.classList.remove('selected');
  });

  if (!box) {
    box = document.querySelector(`[uid='${adventurer.uID}']`);
  }

  box.classList.add('selected');

  clickSound();
  const middle = document.getElementById('middle');

  const exadvOptionCont = document.querySelector('#adventurer-option-container');
  if (exadvOptionCont) { exadvOptionCont.remove(); }

  
  const advOptionCont = document.createElement('div');
  advOptionCont.setAttribute('id', 'adventurer-option-container');
  advOptionCont.setAttribute('uid', `${adventurer.uID}`);
  advOptionCont.classList.add('infobox');

  let header = document.createElement('div');
  header.classList.add('infobox-header');
  header.textContent = `Current active adventurer`;

  advOptionCont.prepend(header);
  enableDragAndDropWindow(header);
  addCloseButton(header);

  document.body.appendChild(advOptionCont);




  Inventory.prototype.initDragAndDropAdvOption();

  // Ensure the template is fully loaded before accessing elements
  fetch('/Templates/adv-option.html')
    .then(response => response.text())
    .then(template => {
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = template;
      
      while (tempContainer.firstChild) {
        advOptionCont.appendChild(tempContainer.firstChild);
      }

      // Now safely query the buttons inside advOptionCont
      const removeBtn = advOptionCont.querySelector('#remove');
      const promoteBtn = advOptionCont.querySelector('#promote');
      const evolveBtn = advOptionCont.querySelector('#evolve');
      const devolveButton = advOptionCont.querySelector('#devolve');



      advOptionCont.querySelector('.title').textContent = `${adventurer.Title}`;

      const status = advOptionCont.querySelector('#status');
      updateAdventurerOptionStatus(adventurer, status);


      const weaponSlot = advOptionCont.querySelector('#equipment');
      weaponSlot.appendChild(createAdventurerWeaponSlot(adventurer));

      removeBtn.addEventListener('click', function (e) {
        advOptionCont.remove();
        removeAdventurerFromGroup(adventurer.uID);
       });

      if (adventurer.isGroupLeader === true) {
        promoteBtn.disabled = true;
        promoteBtn.textContent = `${adventurer.Title} is already Group Leader`;
      }
      if (adventurer.upgrades.length === 0) {
        evolveBtn.remove();
      }

      const hasDevolve = displayDevolveOptions(adventurer);
      if (!hasDevolve) {
        devolveButton.remove();
      }

      promoteBtn.addEventListener('click', () => {
        promoteBtn.disabled = true;
        let group = Array.from(groupAdventurers.values());
        group.forEach(adv => {
          adv.isGroupLeader = false;
        });
        adventurer.isGroupLeader = true;
        let allMarks = middle.querySelectorAll(`.group-leader-mark`);
        allMarks.forEach(mark => {
          mark.style.display = 'none';
        });
        let elements = middle.querySelectorAll(`[uid='${adventurer.uID}']`);
        elements.forEach(element => {
          const groupMark = element.querySelector('.group-leader-mark');
          if (groupMark) {
            groupMark.style.display = 'block';
          }
        });
        middle.querySelector('#party-leader').textContent = `Group leader: ${getGroupLeader(group).Title}`;
        playPromoteAudio();
        updatePartyHeader();
        sortAdventurersByIndex();
      });

      evolveBtn.addEventListener('click', () => {
        evolveBtn.disabled = true;
        if (devolveButton) devolveButton.disabled = false;
        const contEvo = advOptionCont.querySelector('#container-evolution');
        contEvo.style.display = 'flex';
        contEvo.querySelector('.subtitle').textContent = 'Choose an evolution:';
        const cont = advOptionCont.querySelector('#container-evolution .container');
        cont.innerHTML = '';
        for (i = 0 ; i < adventurer.upgrades.length ; i++) {
          cont.appendChild(createEvolutionBox(adventurer, adventurer.upgrades[i], "evolved"));
        }
      });


      devolveButton.addEventListener('click', function (e) {
        devolveButton.disabled = true;
        if (evolveBtn) evolveBtn.disabled = false;
        const contEvo = advOptionCont.querySelector('#container-evolution');
        const cont = advOptionCont.querySelector('#container-evolution .container');
        contEvo.querySelector('.subtitle').textContent = 'Choose a devolution:';
        cont.innerHTML = '';
        displayDevolveOptions(adventurer, cont, contEvo);
       });

    });
}


function updateAdventurerOptionStatus(adv) {
  const status = document.querySelector("#adventurer-option-container #status");

  if (status) {
    const attack = status.querySelector('#attack-value');
    attack.textContent = `${adv.Attack}`;
  }

}

function createEvolutionBox(adventurer, upgrade, evolutionType) {
  const upBox = document.createElement('div');
  upBox.classList.add('upgrade-adventurer');

  const image = document.createElement('div');
  image.classList.add('art');
  const foundAdv = adventurers.find(adv => adv.Title === upgrade);

  image.style.backgroundImage = `url(/Art/Adventurers/${CSS.escape(foundAdv.Title)}.png)`;

  const right = document.createElement('div');
  right.classList.add('right');

  right.innerHTML = `
  <div class="title">${foundAdv.Title}</div>
  <div class="type">${foundAdv.Type}</div>
  <div class="culture">${foundAdv.Culture}</div>
  <div class="rarity">[${foundAdv.Rarity}]</div>
`;

const bottom = document.createElement('div');
bottom.classList.add('bottom');

bottom.innerHTML = `
<div class="requirements">
  <div class="subtitle">Required materials:</div>
  <div class="list"></div>
</div>
`;

upBox.appendChild(image);
upBox.appendChild(right);
upBox.appendChild(bottom);

const requiredList = bottom.querySelector('.list');
let requiredFragments = new Set();
createRequiredFragmentsList(requiredFragments, upBox, requiredList, adventurer, foundAdv);


if (upBox.classList.contains('clickable')) {
  upBox.addEventListener('click', () => {
    upgradeThisAdventurer(adventurer, foundAdv);
    deductRequiredFragments(requiredFragments);
    const groupSheet = document.getElementById('group-sheet');
    const advOptionCont = document.getElementById('adventurer-option-container');
    advOptionCont.remove();
    groupSheet.style.visibility = 'visible';
    groupSheet.style.display = 'grid';
    if (evolutionType === "devolved") {
      playDevolveAudio();
    } else {
      playEvolveAudio();
    }
    displayMessage(`${adventurer.Title} ${evolutionType} into ${foundAdv.Title}!`, 'rgb(232, 255, 149)');
  });
}

  return upBox;
}


async function upgradeThisAdventurer(adventurer, foundAdv) {
  console.log('The adventurer that has been upgraded was', adventurer.Title);
  console.log('Its index was', adventurer.index);
  const olduID = adventurer.uID;
  const oldIndex = adventurer.index;
  const oldLevel = adventurer.Level;
  const newAdventurer = { ...foundAdv };
  newAdventurer.Affixes = [];
  do {
    newAdventurer.uID = Math.floor(Math.random() * 99999) + 1;
  } while (groupAdventurers.has(newAdventurer.uID));
  console.log(`${newAdventurer.Title} is a new adventurer. Generated uID: ${newAdventurer.uID}`);
  const newAdvWithAffixes = {... await generateNewAdventurer(newAdventurer) };

  adventurer = { ...newAdvWithAffixes };
  removeAdventurerFromPartyBox(olduID);
  groupAdventurers.delete(olduID);
  adventurer.index = oldIndex;
  if (oldLevel > 1) {
    for (let i = 0 ; i < oldLevel ; i++) {
      levelUpAdventurer(adventurer);
    }
  }

  groupAdventurers.set(newAdvWithAffixes.uID, adventurer);
  

  updateInterface();
  updateActiveSkills();
  updateSkillsBox();
  createNewOwnGroupDisplay();
  updatePartyHeader();

  let party = document.getElementById('party');
  if (party) {
    const element = createAdvPartyBox(adventurer);
    party.appendChild(element);
  }

  sortAdventurersByIndex();
}



function sortAdventurersByIndex() {
  const party = document.getElementById('party');
  const advBoxes = Array.from(party.getElementsByClassName('adv-box'));
  advBoxes.sort((a, b) => {
    return Number(a.getAttribute('index')) - Number(b.getAttribute('index'));
  });
  advBoxes.forEach(box => party.appendChild(box));


  const advLeft = document.getElementById('adventurers');
  const advSlots = Array.from(advLeft.getElementsByClassName('adventurer-slot'));
  advSlots.sort((a, b) => {
    const indexA = a.hasAttribute('index') && a.getAttribute('index') !== "" ? Number(a.getAttribute('index')) : Infinity;
    const indexB = b.hasAttribute('index') && b.getAttribute('index') !== "" ? Number(b.getAttribute('index')) : Infinity;
    
    return indexA - indexB;
  });
  advSlots.forEach(box => advLeft.appendChild(box));
}




function displayDevolveOptions(adventurer, cont, contEvo) {
  let devolvable = new Set();

  adventurerMap.forEach(otherAdventurer => {
      if (otherAdventurer.upgrades.includes(adventurer.Title)) {
          devolvable.add(otherAdventurer);
          console.log(otherAdventurer);
          if (cont) {
            cont.appendChild(createEvolutionBox(adventurer, otherAdventurer.Title, "devolved"));
          }
      }
  });

  console.log(devolvable);

  if (devolvable.size != 0) {
    if (contEvo) {
      contEvo.style.display = 'flex';
    }
    return devolvable;
  } else {
    return null;
  }
}








let GROUP_CULTURE_FRAGMENTS = new Map();

function initializeCultureFragments() {
  const fragmentContainer = document.getElementById('backpack-fragments');
  
  CULTURES_DATA.forEach(culture => {
    const fragmentBox = createFragmentBox(culture);
    fragmentContainer.appendChild(fragmentBox);
    
    GROUP_CULTURE_FRAGMENTS.set(culture.culture, { number: 0 });
  });

  updateCultureFragments();
}


function createFragmentBox(culture) {
  const box = document.createElement('div');
  box.className = 'fragment-cont';
  const safeCultureId = culture.culture.replace(/\s+/g, '-');
  box.id = `${safeCultureId}`;

  const icon = document.createElement('div');
  icon.className = 'fragment-icon';
  icon.style.backgroundImage = `url('Art/Cultures/${culture.culture}.png')`;
  
  const name = document.createElement('div');
  name.className = 'fragment-name';
  name.textContent = `${culture.culture}`;

  const number = document.createElement('div');
  number.className = 'fragment-number';
  number.textContent = `0`;

  box.appendChild(icon);
  box.appendChild(name);
  box.appendChild(number);

  return box;
}

function updateCultureFragments() {
  const fragmentContainer = document.getElementById('backpack-fragments');
  let fragments = [];

  CULTURES_DATA.forEach(culture => {
    const safeCultureId = culture.culture.replace(/\s+/g, '-');
    let fragment = fragmentContainer.querySelector(`#${safeCultureId}`);
    let fragmentNumber = fragment.querySelector('.fragment-number');

    let cultureCount = GROUP_CULTURE_FRAGMENTS.get(culture.culture).number;

    if (cultureCount === 0) {
      fragment.style.display = 'none';
    } else {
      fragment.style.display = 'grid';
      fragmentNumber.textContent = `${cultureCount}`;
    }
    fragments.push({ element: fragment, count: cultureCount });
  });

  fragments.sort((a, b) => b.count - a.count);
  fragmentContainer.innerHTML = "";
  fragments.forEach(item => fragmentContainer.appendChild(item.element));
}




function gainCultureFragment(cultureName, number) {
  GROUP_CULTURE_FRAGMENTS.get(`${cultureName}`).number += number;
  updateCultureFragments();
}


function createRequiredFragmentsList(requiredFragments, upBox, list, adventurer, foundAdv) {
  let group = [];
  group.push(adventurer);
  group.push(foundAdv);
  const variance = (1 + calculateCulturalVariance(group));
  console.log(variance);



  foundAdv.Cultures.forEach(culture => {
    const ok = {
      culture: culture,
      req: 0
    };
    requiredFragments.add(ok);
  });

  const rarity = foundAdv.Rarity;

  const reArray = Array.from(requiredFragments);
  reArray.forEach(culture => {
    culture.req = Math.round(
      (1 * variance * newRarityMultiplier(rarity)) / foundAdv.Cultures.length
    );

    const reqEl = document.createElement('div');
    reqEl.className = 'fragment-cont';
    reqEl.innerHTML = `
      <span class="fragment-icon"></span><span class="number">${culture.req}</span> <span class="culture-name">${culture.culture}</span> fragments.
    `
    reqEl.querySelector('.fragment-icon').style.backgroundImage = `url('Art/Cultures/${culture.culture}.png')`;
    list.appendChild(reqEl);
  });

  let conclusion = document.createElement('div');
  conclusion.classList.add('conclusion');

  reArray.forEach(culture => {
  let playerFragments = GROUP_CULTURE_FRAGMENTS.get(culture.culture)?.number || 0;


    if (playerFragments >= culture.req) {
      conclusion.textContent = "✓ Enough fragments";
      upBox.classList.add('clickable');
    } else {
      conclusion.textContent = "✕ Not enough fragments";
      upBox.classList.remove('clickable');
    }
  });

  list.appendChild(conclusion);


}


function deductRequiredFragments(cost) {
  cost.forEach(cultureObj => {
    let cultureName = cultureObj.culture;
    let requiredAmount = cultureObj.req;

    if (GROUP_CULTURE_FRAGMENTS.has(cultureName)) {
      let currentAmount = GROUP_CULTURE_FRAGMENTS.get(cultureName).number;
      
      if (currentAmount >= requiredAmount) {
        GROUP_CULTURE_FRAGMENTS.get(cultureName).number -= requiredAmount;
      } else {
        console.warn(`Not enough ${cultureName} fragments!`);
      }
    } else {
      console.warn(`Culture ${cultureName} not found in GROUP_CULTURE_FRAGMENTS!`);
    }
  });

  // Refresh UI after deduction
  updateCultureFragments();
}
