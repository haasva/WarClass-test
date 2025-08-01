let npcObject;

function fetchNpcData() {
  return fetch('/JSONData/npc.json')
    .then(response => response.json())
    .then(data => {
      npcObject = data;
      console.log('npc data', npcObject);
      return npcObject;
    })
    .catch(error => {
      console.error('Error fetching npc data:', error);
      return null;
    });
}


function nameRandom() {
  let randomName = '';
  const consCap = [ 'B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Z']
  const consLow = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'z']
  const vowelsCap = ['A', 'E', 'I', 'O', 'U', 'Y'];
  const vowelsLow = ['a', 'e', 'i', 'o', 'u', 'y'];
  const nameLength = Math.floor(Math.random()*7) + 3;
  function consCapGen() {
     return consCap[Math.floor(Math.random()*20)]
  }
  function consLowGen() {
    return consLow[Math.floor(Math.random()*20)]
  }
  function vowelCapGen() {
    return vowelsCap[Math.floor(Math.random()*6)]
  }
  function vowelLowGen() {
    return vowelsLow[Math.floor(Math.random()*6)]
  }
  if (nameLength === 3) {
    randomName = `${vowelCapGen()}${consLowGen()}${vowelLowGen()}`;
  } else if (nameLength === 4) {
    randomName =`${consCapGen()}${vowelLowGen()}${consLowGen()}${vowelLowGen()}`;
  } else if (nameLength === 5) {
    randomName = `${vowelCapGen()}${consLowGen()}${vowelLowGen()}${consLowGen()}${vowelLowGen()}`;
  } else if (nameLength === 6) {
    randomName = `${consCapGen()}${vowelLowGen()}${consLowGen()}${vowelLowGen()}${vowelLowGen()}${consLowGen()}`;
  } else if (nameLength === 7) {
    randomName = `${vowelCapGen()}${vowelLowGen()}${consLowGen()}${vowelLowGen()}${consLowGen()}${vowelLowGen()}${consLowGen()}`;
  } else if (nameLength === 8) {
    randomName = `${consCapGen()}${vowelLowGen()}${consLowGen()}${vowelLowGen()}${consLowGen()}${vowelLowGen()}${consLowGen()}${vowelLowGen()}`;
  } else if (nameLength === 9) {
    randomName = `${vowelCapGen()}${consLowGen()}${vowelLowGen()}${consLowGen()}${vowelLowGen()}${vowelLowGen()}${consLowGen()}${vowelLowGen()}${vowelLowGen()}`;
  };
  return randomName;
};


function generateNpc(region, x, y) {


  const ranType = Math.floor(Math.random() * npcObject.length);
  const npcTemplate = npcObject[ranType];
  let npc = { ...npcTemplate };

  npc.name = nameRandom();
  npc.life = Math.floor(Math.random() * 75) + 25;
  npc.id = x * 75 + y;
  npc.faction = region.factions;
  const types = npc.types.split(', ');
  npc.type = types[Math.floor(Math.random() * types.length)];

  const goldModifier = Math.floor(Math.random() * 60) - 20;
  npc.gold = Math.max(0, npc.gold + goldModifier);

  function giveNpcItems() {
    const inventoryNpc = Math.floor(Math.random() * 4);
    const npcInv = [];

    for (i = 0 ; i < inventoryNpc ; i++) {
      npcInv.push(addItemToArea());
    }

    return npcInv;
  }
  
  npc.inventory = giveNpcItems();

  const imgRange = npcObject[ranType].var;

  const imgNb = Math.floor(Math.random() * imgRange) + 1;

  npc.img = `url('/Art/People/${npcObject[ranType].class}/${imgNb}.png')`;

  npc.text = npcObject[ranType].text || "Greetings!";

  const cultureWords = region.cultures ? region.cultures.split(',').map(word => word.trim()) : [];
  const ranCulture = Math.floor(Math.random() * cultureWords.length);


  npc.culture = `${cultureWords[ranCulture]}`;

  region.npcs.push(npc);
  return npc;
}




function createNpcWindow(npc) {
playMessageSound();
document.getElementById(`npc-window`)?.remove();

  const window = document.createElement('div');
  window.setAttribute('id', `npc-window`);
  window.classList.add(`infobox`);

  const header = document.createElement('div');
  header.innerHTML = `${npc.name}`;
  header.classList.add('infobox-header');
  window.appendChild(header);
  enableDragAndDropWindow(header);
  addCloseButton(header);

  const content = document.createElement('div');
  content.classList.add('infobox-content');

      fetch('/Templates/npc-dialogue.html')
        .then(response => response.text())
        .then(template => {
            content.innerHTML = template;

              content.querySelector('.culture').textContent = `${npc.culture}`;
              content.querySelector('.faction').textContent = `${npc.faction}`;
              content.querySelector('.life').textContent = `${npc.life}`;
              content.querySelector('.class').textContent = `${npc.class}`;
              typeText(content.querySelector('.text'), npc.text);
        })
        .catch(error => {
            console.error('Error loading template:', error);
        });
  window.appendChild(content);
  document.body.appendChild(window);
}


function typeText(content, text, speed = 1) {
  content.textContent = ''; // Clear previous content
  let i = 0;
  function typeChar() {
    if (i < text.length) {
      content.textContent += text[i];
      i++;
      setTimeout(typeChar, speed);
    }
  }
  typeChar();
}





class BuildingManager {
  constructor() {
    this.currentBuilding = null;
    this.isInsideBuilding = false;
    this.actionGridDisabled = false;
  }

  async enterBuilding(building) {
    if (this.isInsideBuilding) return;
    this.currentBuilding = building;
    this.isInsideBuilding = true;

    console.log('Entering building:', building);
    
    playDoorSound('open');
    document.exitPointerLock();
    document.querySelector('#building-prompt')?.remove();
    document.querySelector('#neo-region').style.display = 'none';

    // Load templates
    const [insideHtml, menuHtml] = await Promise.all([
      this._fetchTemplate('/Templates/building-inside.html'),
      this._fetchTemplate('/Templates/building-inside-menu.html')
    ]);

    // Create building elements
    const buildingInside = this._createElementFromHtml(insideHtml, '#building-inside');
    const buildingMenu = this._createElementFromHtml(menuHtml, '.building-menu');
    
    document.body.appendChild(buildingMenu);
    document.querySelector('#engine-wrapper').appendChild(buildingInside);

    // Setup building visuals
    buildingInside.style.backgroundImage = `url('/Art/Textures/structure/interiors/${building.interior}.png')`;
    buildingInside.querySelector('#owner').style.backgroundImage = building.occupants[0].img;

    buildingMenu.querySelector('#building-type').textContent = `${building.infos.name}, ${building.infos.type.toLowerCase()}`;

    const occupantsList = buildingMenu.querySelector('#occupants');

    for (const occupant of building.occupants) {
      const occupantEl = document.createElement('div');
      occupantEl.className = 'occupant';
      occupantEl.textContent = `${occupant.name}, ${occupant.class}`;
      occupantEl.style.backgroundImage = occupant.img;
      occupantsList.appendChild(occupantEl);
      occupantEl.addEventListener('click', () => {
        clickButtonSound();
        this._updateNpcMenu(occupant, buildingMenu, buildingInside);
        occupantsList.querySelectorAll('.occupant').forEach(occ => {
          occ.classList.remove('selected');
        });
        occupantEl.classList.add('selected');
      });
    }

    this.actionGridDisabled = true;

    buildingMenu.querySelector('#exit-button').addEventListener('click', () => this.exitBuilding());
  }

  _updateNpcMenu(npc, buildingMenu, buildingInside) {
    // Setup menu header
    const npcMenu = buildingMenu.querySelector('#npc-menu');
    npcMenu.style.display = 'flex';
    const header = buildingMenu.querySelector('.header');
    header.querySelector('#owner-title').textContent = `${npc.name}, ${npc.class}`;
    header.querySelector('#owner-gold').textContent = `${npc.gold}`;

    const npcInventory = buildingMenu.querySelector('.inventories .npc');
    const playerInventory = buildingMenu.querySelector('.inventories .player');
    const talkElement = buildingMenu.querySelector('.talk');

    npcInventory.innerHTML = '';
    playerInventory.innerHTML = '';
    talkElement.innerHTML = '';

    buildingInside.querySelector('#owner').style.backgroundImage = npc.img;
    // Setup interactions
    buildingMenu.querySelector('.talk').textContent = `Welcome to my home!`;
    buildingMenu.querySelector('#trade-button').disabled = false;
    buildingMenu.querySelector('.trade').style.visibility = 'hidden';
    buildingMenu.querySelector('.trade').style.display = 'none';
    const selectedNpc = npc;
    this._setupMenuButtons(buildingMenu, buildingInside, selectedNpc);
  }

  exitBuilding() {
    if (!this.isInsideBuilding) return;
    
    playDoorSound('close');
    document.querySelector('#building-inside')?.remove();
    document.querySelector('.building-menu')?.remove();
    
    togglePointerLock();
    document.querySelector('#neo-region').style.display = 'block';
    
    this.currentBuilding = null;
    this.isInsideBuilding = false;
    this.actionGridDisabled = false;
  }

  // Private helper methods
  async _fetchTemplate(url) {
    const response = await fetch(url);
    return await response.text();
  }

  _createElementFromHtml(html, selector) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.querySelector(selector);
  }

  _setupMenuButtons(menuElement, buildingElement, selectedNpc) {
    
    
    const tradeButton = menuElement.querySelector('#trade-button');
    tradeButton.addEventListener('click', () => {
      tradeButton.disabled = true;
      new TradeSystem().startTrade(selectedNpc, menuElement);
    });

    // Setup talk button if needed
    const talkButton = menuElement.querySelector('#talk-button');
    talkButton?.addEventListener('click', () => {
      tradeButton.disabled = false;
      menuElement.querySelector('.trade').style.display = 'none';
      menuElement.querySelector('.talk').textContent = `It's a pleasure talking with you...`;
    });
  }
}




class TradeSystem {
  constructor() {
    this.currentTrade = null;
  }

  startTrade(npc, buildingMenu) {
    this.currentTrade = { npc, buildingMenu };
    
    const npcInventory = buildingMenu.querySelector('.inventories .npc');
    const playerInventory = buildingMenu.querySelector('.inventories .player');
    const talkElement = buildingMenu.querySelector('.talk');

    // Clear previous content
    npcInventory.innerHTML = '';
    playerInventory.innerHTML = '';
    buildingMenu.querySelector('.trade').style.visibility = 'visible';
    buildingMenu.querySelector('.trade').style.display = '';

    // Setup NPC inventory
    this._setupNpcInventory(npc, npcInventory, talkElement);
    
    // Setup player inventory
    this._setupPlayerInventory(playerInventory, npc, talkElement);
  }

  _setupNpcInventory(npc, npcInventory, talkElement) {
    if (npc.inventory.length === 0) {
      npcInventory.style.display = 'none';
      this._showNpcDialogue(talkElement, `I have nothing to trade...`);
      return;
    } else {
      npcInventory.style.display = '';
    }

    const s = npc.inventory.length === 1 ? '' : 's';
    this._showNpcDialogue(talkElement, `I have ${npc.gold} gold and ${npc.inventory.length} item${s} to sell.`);

    npc.inventory.forEach(item => {
      const slot = this._createInventoryItemElement(item, true);
      npcInventory.appendChild(slot);
      slot.addEventListener('click', () => this._handleClickBuy(item, npc, talkElement));
    });
  }

  _setupPlayerInventory(playerInventory, npc, talkElement) {
    PLAYER_ITEMS.forEach(item => {
      const slot = this._createInventoryItemElement(item, true);
      playerInventory.appendChild(slot);
      
      slot.addEventListener('click', () => this._handlePlayerItemClick(item, npc, talkElement));
    });
  }

  _createInventoryItemElement(item, isPlayerItem) {
    const slot = document.createElement('div');
    slot.className = 'slot';

    const itemEl = createItemElement(item);
    addItemTooltip(itemEl, item);
    itemEl.setAttribute('draggable', false);
    
    if (slot instanceof HTMLElement) {
      slot.appendChild(itemEl);
    } else if (typeof slot === 'function') {
      slot(itemEl);
    }
    
    return slot;
  }

  _handlePlayerItemClick(item, npc, talkElement) {
    const realItemIndex = PLAYER_ITEMS.findIndex(i => i.iID === item.iID);
    const realItem = PLAYER_ITEMS[realItemIndex];

    if (!realItem) return;

    if (npc.gold < 1 || npc.gold - realItem.price < 1) {
      this._showNpcDialogue(talkElement, `I don't have enough to buy your ${realItem.name}.`);
      return;
    }

    // Process transaction
    npc.gold -= realItem.price;
    document.querySelector('#owner-gold').textContent = `${npc.gold}`;
    itemUpdateEffect(document.querySelector('#owner-gold'));
    
    this._showNpcDialogue(talkElement, `You sold me your ${realItem.name} for ${realItem.price} gold.`);
    groupCoins += realItem.price;
    updateCoinsDisplay();

    // Update NPC inventory
    this._addItemToNpcInventory(realItem, npc);

    // Update player inventory
    this._removeItemFromPlayerInventory(realItem, realItemIndex);
  }

  _handleClickBuy(item, npc, talkElement) {
    const realItemIndex = npc.inventory.findIndex(i => i.iID === item.iID);
    const realItem = npc.inventory[realItemIndex];

    if (!realItem) return;

    if (groupCoins.gold < 1 || groupCoins.gold - realItem.price < 1) {
      this._showNpcDialogue(talkElement, `Come back when you have enough gold!`);
      return;
    }

    // Process transaction
    groupCoins -= realItem.price;
    npc.gold += realItem.price;
    document.querySelector('#owner-gold').textContent = `${npc.gold}`;
    itemUpdateEffect(document.querySelector('#owner-gold'));
    
    this._showNpcDialogue(talkElement, `I sell you my ${realItem.name} for ${realItem.price} gold.`);
    updateCoinsDisplay();



    // Update PLAYER inventory
    grantThatItem(item);
    this._addItemToPlayerInventory(item);

    // Update npc inventory
    document.querySelector(`.inventories .npc .slot [name="${item.name}"]`)?.parentElement.remove();
    this._removeItemFromNpcInventory(realItem, realItemIndex, npc);

  }

  _addItemToNpcInventory(item, npc) {
    const npcInventory = document.querySelector('.inventories .npc');
    
    const existingItem = npc.inventory.find(i => i.name === item.name && i.stackable === 'yes');
    if (existingItem) {
      existingItem.quantity++;
      const itemEl = npcInventory.querySelector(`.inventory-item[name="${existingItem.name}"]`);
      updateQuantityThere(itemEl, existingItem);
    } else {
      npcInventory.style.display = 'flex';
      const itemCopy = structuredClone(item);
      itemCopy.quantity = 1;
      npc.inventory.push(itemCopy);
      const slot = this._createInventoryItemElement(itemCopy, false);
      npcInventory.appendChild(slot);
    }
  }

  _addItemToPlayerInventory(item) {
    const playerInv = document.querySelector('.player-export .inventory-content');
    
    const existingItem = PLAYER_ITEMS.find(i => i.name === item.name && i.stackable === 'yes');
    if (existingItem) {
      existingItem.quantity++;
      const itemEl = playerInv.querySelector(`.inventory-item[name="${existingItem.name}"]`);
      updateQuantityThere(itemEl, existingItem);
    } else {
      playerInv.style.display = 'flex';
      const itemCopy = structuredClone(item);
      itemCopy.quantity = 1;
      const slot = this._createInventoryItemElement(itemCopy, false);
      playerInv.appendChild(slot);
    }
  }

  _removeItemFromPlayerInventory(item, index) {
    if (item.quantity > 1) {
      item.quantity--;
      // Update quantity display in both backpack and trade UI
      this._updateItemQuantityInUI(item);
    } else {
      PLAYER_ITEMS.splice(index, 1);
      removeItem(item);
      // Remove from trade UI
      document.querySelector(`.player .slot [name="${item.name}"]`)?.parentElement.remove();
    }
  }

  _removeItemFromNpcInventory(item, index, npc) {
    if (item.quantity > 1) {
      item.quantity--;
      // Update quantity display in both backpack and trade UI
      this._updateItemQuantityInUI(item);
    } else {
      npc.inventory.splice(index, 1);
      // Remove from trade UI
      document.querySelector(`.inventories .npc .slot [name="${item.name}"]`)?.parentElement.remove();
    }
  }

  _updateItemQuantityInUI(item) {
    // Update in trade UI
    const tradeItem = document.querySelector(`.player .slot [name="${item.name}"]`);
    if (tradeItem) {
      updateQuantityThere(tradeItem, item);
    }
    
    // Update in backpack
    const backpackItem = document.querySelector(`#backpack [name="${item.name}"]`);
    if (backpackItem) {
      updateQuantityThere(backpackItem, item);
    }
  }

  _showNpcDialogue(element, text) {
    element.textContent = text;
    playAnimation(element, 'flash-console 0.2s 1');
  }
}



const buildingManager = new BuildingManager();
const tradeSystem = new TradeSystem();