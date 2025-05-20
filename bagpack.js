let itemsObject = [];

let PLAYER_ITEMS = [];
let PLAYER_ITEMS_SLOTS = [];

let GROUP_ITEMS = new Set();
let GROUP_ITEMS_SLOTS = [];


let inventoryInstanciated = false;

fetchItemsData();



function createGroupClassInventory() {
    const leftSide = document.getElementById('left-side');
    let groupClassInventory = document.createElement('div');
    groupClassInventory.id = 'group-class-inventory';

    fetch('/Templates/group-class-inventory.html')
        .then(response => response.text())
        .then(template => {
            groupClassInventory.innerHTML = template;
            leftSide.appendChild(groupClassInventory);

            const slots = groupClassInventory.querySelectorAll('.slot');
            slots.forEach(slot => {
                const id = slot.getAttribute('id')
                slot.style.backgroundImage = `url('/Art/Interface/inventory/${id}.png')`;
                slot.classList.add('group-slot');
                GROUP_ITEMS_SLOTS.push(slot);
                const info = id.replace(/^./, char => char.toUpperCase());
                //addGenericTooltip(slot, info);
 
            });

        })
        .catch(error => {
            console.error('Error loading template:', error);
        });


}






async function createBackpack() {
    const partyInside = document.getElementById('party_content');
    const left = partyInside.querySelector('.left')
    let bagpackContent = document.createElement('div');
    bagpackContent.id = 'backpack-container';

    fetch('/Templates/bagpack.html')
        .then(response => response.text())
        .then(template => {
            bagpackContent.innerHTML = template;
            left.appendChild(bagpackContent);
            createBagInventory();
            createGroupClassInventory();
            initializeCultureFragments();
            inventoryInstanciated = false;
        })
        .catch(error => {
            console.error('Error loading template:', error);
        });

}

function switchTab(tabId) {

    const audio = new Audio("/Sounds/latch.wav");
    audio.volume = 0.3;
    audio.play();

    // Get all tabs and tab contents
    const tabs = document.querySelectorAll('.tab-header .tab');
    const contents = document.querySelectorAll('.tab-content > div');


    tabs.forEach(tab => {
        // Highlight the active tab
        const isActiveTab = tab.getAttribute('data-target') === tabId;
        if (isActiveTab) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    contents.forEach(content => {
        // Show the target content and hide others
        if (content.id === tabId) {
            content.classList.add('active');
            content.classList.remove('inactive');
        } else {
            content.classList.remove('active');
            content.classList.add('inactive');
        }
    });


}


function toggleBag() {
    const bag = document.getElementById('bagpack'); // Remove `#`
    if (bag.classList.contains('open')) {
        bag.style.height = '37px'; // Close the bag
        bag.classList.remove('open');
    } else {
        bag.style.height = 'auto'; // Open the bag
        bag.classList.add('open');
    }
}




function createBagInventory() {
    const inv = document.getElementById('backpack-items');
    inv.innerHTML = '';

    const table = document.createElement('div');
    table.className = 'inventory-bag';

    PLAYER_ITEMS_SLOTS.length = 0; // Reset existing slots

    const invSlotsNumber = Math.round(GROUP_ATTRIBUTES.primaryAttributes.artisanship);
    for (let r = 0; r < invSlotsNumber; r++) {
        const cell = document.createElement('div');
        cell.setAttribute('slot-id', `${r}`);
        cell.className = 'empty-slot slot';
        table.appendChild(cell);
        PLAYER_ITEMS_SLOTS.push(cell);
    }

    inv.appendChild(table);
}



function addInventorySlot(number) {
    const table = document.querySelector('#backpack-items .inventory-bag');
    const currentSlots = table.children.length; 

    for (let i = 0; i < number; i++) {
        const cell = document.createElement('div');
        cell.setAttribute('slot-id', `${currentSlots + i}`);
        cell.className = 'empty-slot slot';
        table.appendChild(cell);
        PLAYER_ITEMS_SLOTS.push(cell);
    }
}




async function fetchItemsData() {
  try {
        const response = await fetch('/JSONData/items.json');
        const data = await response.json();


        data.forEach(item => {
            const itemName = item.name.toLowerCase();
            itemsObject[itemName] = {
                name: item.name.toLowerCase(),
                rarity: item.rarity,
                category: item.category,
                stackable: item.stackable,
                description: item.description,
                ability: item.ability,
                healAmount: item.healAmount
            };
          });

        console.log('Items data', itemsObject);
        return itemsObject;
    } catch (error) {
        console.error('Error fetching itemsObject data:', error);
        return null;
    }
}



function grantGivenItem(itemName) {
    if (!itemsObject[itemName] && typeof itemName != 'object') {
        console.error(`Item ${itemName} does not exist.`);
        return false;
    }
    playCheckSound();

    let item;

    if (typeof itemName === 'object') {
        item = { ... itemName };
        item.iID = Math.floor(Math.random() * 9999);
        item.quantity = 1;
    } else {
        item = { ...itemsObject[itemName], iID: Math.floor(Math.random() * 9999) + 1, quantity: 1 };
    }

    let existingItem = PLAYER_ITEMS.find(invItem => invItem.name === item.name);

    if (existingItem && existingItem.stackable === 'yes') {
        existingItem.quantity += 1;
        updateItemQuantity(existingItem);
        return true; // Successfully added a new item
    } else {
        const emptySlot = PLAYER_ITEMS_SLOTS.find(sl => sl.classList.contains('empty-slot'));
        if (!emptySlot) {
            console.log("No empty slots available!");
            return;
        }
        if (item.category === 'Equipment') {
            item.durability = 100 - Math.floor(Math.random() * 60) + 1;
        }
        PLAYER_ITEMS.push(item);
        addItemToEmptySlot(item);
        return true; // Successfully added a new item
    }
}




function grantRandomItem(n = 1) {
    const itemKeys = Object.keys(itemsObject);
    if (itemKeys.length === 0) {
        console.error("No items available to grant.");
        return;
    }

    for (i = 0 ; i < n ; i++) {
        const randomItem = itemsObject[itemKeys[Math.floor(Math.random() * itemKeys.length)]];
        grantGivenItem(randomItem.name);
    }

}



function addItemToEmptySlot(item) {
    const emptySlot = PLAYER_ITEMS_SLOTS.find(sl => sl.classList.contains('empty-slot'));
    if (!emptySlot) {
        console.log("No empty slots available!");
        return;
    }

    const itemEl = createItemElement(item);
    emptySlot.appendChild(itemEl);
    emptySlot.classList.replace('empty-slot', 'occupied-slot');
    emptySlot.setAttribute('occupied-by', item.name);
    addItemTooltip(itemEl, item);
    addItemRightClick(itemEl, item);

    if (item.category === 'Food') {
        itemEl.addEventListener('dblclick', function (event) {
            useItem(item);
        });
    }
}


function updateItemQuantity(item) {
    const occupiedSlots = PLAYER_ITEMS_SLOTS.filter(sl => sl.classList.contains('occupied-slot'));


    for (let slot of occupiedSlots) {
        if (slot.getAttribute('occupied-by') === item.name) {
            let itemEl = slot.querySelector('.inventory-item .item-quantity');
            if (!itemEl) {
                itemEl = document.createElement('span');
                itemEl.className = 'item-quantity';
                slot.querySelector('.inventory-item').appendChild(itemEl);
                // Make the new item draggable
                //itemEl.setAttribute('draggable', true);
                //itemEl.addEventListener('dragstart', Inventory.dragItem); // Re-bind the dragstart event listener
 
            }
            itemEl.textContent = item.quantity;
            return;
        }
    }
}

function createItemElement(item) {
    const itemEl = document.createElement('div');
    itemEl.className = `inventory-item ${item.rarity}`;
    itemEl.style.outlineColor = `var(--${item.rarity.toLowerCase()}-color)`;
    itemEl.setAttribute('item-id', item.iID);
    itemEl.style.backgroundImage = `url('/Art/Items/${item.name}.png')`;
    itemEl.setAttribute('draggable', true);
    itemEl.addEventListener('dragstart', Inventory.prototype.dragItem); // ← bound method


    if (item.stackable === 'yes' && item.quantity > 1) {
        const quantityEl = document.createElement('span');
        quantityEl.className = 'item-quantity';
        quantityEl.textContent = item.quantity;
        itemEl.appendChild(quantityEl);
    }

    return itemEl;
}


function removeItemTooltip() {
    const existingTooltip = document.querySelector('.area-tooltip');
    if (existingTooltip) {
      existingTooltip.remove();
    }
}

class Inventory {
    constructor() {
        // Bind methods once for consistent `this`
        this.dragItem = this.dragItem.bind(this);
        this.allowDrop = this.allowDrop.bind(this);
        this.dropItem = this.dropItem.bind(this);
  
        this.initDragAndDrop();
        this.initDragAndDropAdvOption();
    }
  
    initDragAndDrop() {
        if (inventoryInstanciated === false) {
            const backpack = document.getElementById('backpack-items');
            const group = document.getElementById('group-class-inventory');
  
            backpack.addEventListener('dragover', this.allowDrop);
            backpack.addEventListener('drop', (event) => this.dropItem(event, 'inventory'));
  
            group.addEventListener('dragover', this.allowDrop);
            group.addEventListener('drop', (event) => this.dropItem(event, 'group'));

  
            inventoryInstanciated = true;
  
            console.log("Inventory drag and drop initialized.");
        }
    }
      
    initDragAndDropAdvOption(element) {
            const advOption = document.getElementById('adventurer-option-container');
            if (advOption) {
                advOption.addEventListener('dragover', this.allowDrop);
                advOption.addEventListener('drop', (event) => this.dropItem(event, 'adventurer'));
            }

            if (element) {
                element.addEventListener('dragover', this.allowDrop);
                element.addEventListener('drop', (event) => this.dropItem(event, 'adventurer'));
            }
    }
  
    dragItem(event) {
        event.dataTransfer.setData('text/plain', event.target.getAttribute('item-id'));
        playCheckSound();
        removeItemTooltip();
        console.log("Item dragged:", event.target.getAttribute('item-id'));
    }
  
    allowDrop(event) {
        event.preventDefault();
    }
  
    dropItem(event, dropTarget) {
        event.preventDefault();
        const itemID = event.dataTransfer.getData('text/plain');
        const draggedItemEl = document.querySelector(`.inventory-item[item-id='${itemID}']`);

        let isFromAdv = false;
        
        if (!draggedItemEl) return;
  
        const targetSlot = event.target.closest('.slot');
        if (!targetSlot) return;
  
        let draggedItemObject;
        if (!draggedItemEl.classList.contains('adv-weapon-slot')) {
            draggedItemObject = PLAYER_ITEMS.find(item => item.iID == itemID);
            if (!draggedItemObject) return;
        } else {
            draggedItemObject = PLAYER_WEAPONS.find(item => item.iID == itemID);
            isFromAdv = true;
            if (!draggedItemObject) return;
        }



        if (dropTarget === 'adventurer') { 
            isFromAdv = false;
            const advOption = targetSlot.closest('.adv-box');
            const uID = parseInt(advOption.getAttribute('uid'));
            if (uID) {
                console.log('oj');
                console.log(draggedItemObject);
                const adv = groupAdventurers.get(uID);
                if (adv) {
                    console.log('ok');
                    adv.Equipment.Weapon = draggedItemObject;
                    console.log('[FINAL CHECK]', adv.Equipment.Weapon);
                    adv.Attack = calculateAdventurerAttackPoints(adv);
                    updateAdventurerOptionStatus(adv);
                    updateActiveWeaponryBox(adv);
                }
            }
        }        

        if (dropTarget === 'group') {
            const slotCategory = targetSlot.getAttribute('id').toLowerCase().trim();
            const itemCategories = draggedItemObject.category
                .split(',')
                .map(category => category.toLowerCase().trim()); 
            if (!itemCategories.includes(slotCategory)) return;
            GROUP_ITEMS.add(draggedItemObject);
        } else {
            GROUP_ITEMS.delete(draggedItemObject);
            if (!PLAYER_ITEMS.includes(draggedItemObject)) {
                PLAYER_ITEMS.push(draggedItemObject);
            }
        }

        if (isFromAdv === true) {
            const group = Array.from(groupAdventurers.values());
            const adventurer = group.find(adv => adv.Equipment?.Weapon?.iID == itemID);
            if (adventurer) {
                if (adventurer.Equipment.Weapon != null) {
                    adventurer.Equipment.Weapon = null;
                    adventurer.Attack = calculateAdventurerAttackPoints(adventurer);
                    updateAdventurerOptionStatus(adventurer);
                    updateActiveWeaponryBox(adventurer);
                }
            }
        }
  
        playGridSound();
        this.swapItems(draggedItemEl, targetSlot);
    }
  
    swapItems(draggedItemEl, targetSlot) {
        const oldSlot = draggedItemEl.parentElement;
        const existingItemEl = targetSlot.querySelector('.inventory-item');
  
        if (existingItemEl) {
            oldSlot.appendChild(existingItemEl);
            oldSlot.classList.replace('empty-slot', 'occupied-slot');
            oldSlot.setAttribute('occupied-by', existingItemEl.getAttribute('item-id'));
        } else {
            oldSlot.classList.replace('occupied-slot', 'empty-slot');
            oldSlot.removeAttribute('occupied-by');
        }
  
        targetSlot.appendChild(draggedItemEl);
        targetSlot.classList.replace('empty-slot', 'occupied-slot');
        targetSlot.setAttribute('occupied-by', draggedItemEl.getAttribute('item-id'));

        
    }
  }
  












function useItem(item, target) {
    if (!item.ability || !abilities[item.ability]) {
        console.log(`${item.name} has no effect.`);
        console.log(item);
        return;
    }

    if (!target) {
        target = CURRENT_MANAGED_ADVENTURER;
    }

    let ability = abilities[item.ability];

    if (ability.conditions(item, target)) {
        let success = ability.execute(item, target);
        if (success) {
            updateInterface();
            removeItemTooltip();
            removeItem(item);
        }
    } else {
        console.log(`Cannot use ${item.name} right now.`);
    }
}



const abilities = {
    heal: {
        name: "Heal",
        execute: (item, target) => {
            let healAmount = item.healAmount || 5; 
            if (target.Life >= target.MaxLife) return false; // Prevent overhealing

            target.Life = Math.min(target.Life + healAmount, target.MaxLife);
            console.log(`${target.Title} heals ${healAmount} HP. Current HP: ${target.Life}/${target.MaxLife}`);
            return true; // Ability was successfully applied
        },
        description: "Restores some health.",
        conditions: (item, target) => target.Life < target.MaxLife
    },
    boostAttack: {
        name: "Attack Boost",
        execute: (item, target) => {
            let boostAmount = item.boostAmount || 2;
            target.attackPower += boostAmount;
            console.log(`${target.name} gains +${boostAmount} Attack Power.`);
            return true; // Ability was successfully applied
        },
        description: "Temporarily increases attack power.",
        conditions: (item, target) => true
    }
};

