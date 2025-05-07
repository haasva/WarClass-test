let currentOpenBuilding = {};


let lootChance = {
    'Poor': 0.7,
    'Common': 0.5,
    'Uncommon': 0.3,   
    'Rare': 0.15,
    'Legendary': 0.05
};

function createLootContent(data) {


    const lootContainer = data.lootContainer;
    console.log('building info', data);
    document.getElementById('interior_building')?.remove();

    const window = document.createElement('div');
    window.classList.add('infobox');
    window.classList.add('interior');
    window.id = 'interior_building';

    const header = document.createElement('div');
    header.innerHTML = `${lootContainer.type}`;
    header.classList.add('infobox-header');
    window.appendChild(header);
    enableDragAndDropWindow(header);
    addCloseButton(header);
  
    const content = document.createElement('div');
    content.classList.add('infobox-content');

    const description = document.createElement('div');
    description.classList.add('description');
    description.innerHTML = ` It's a 
    <span class="special" style="color: aqua;">${lootContainer.type}</span>
    `;

    content.appendChild(description);

    window.appendChild(content);

    const table = document.createElement('div');
    table.className = 'interior-area';

    let currentInterior = data.lootContainer.interior;

    for (let r = 0; r < currentInterior.length ; r++) {
        const cell = document.createElement('div');
        cell.setAttribute('space-id', `${r}`);
        cell.className = 'interior-space';
        table.appendChild(cell);
        cell.classList.add(`${currentInterior[r].state}`);

        if (currentInterior[r].item != null) {
            const itemEl = createItemElement(currentInterior[r].item);
            cell.appendChild(itemEl);
            addItemTooltip(itemEl, currentInterior[r].item);

            itemEl.addEventListener('click', function (event) {
                const success = grantGivenItem(currentInterior[r].item);
                if (success) {
                    currentInterior[r].item = null;
                    currentInterior[r].state = 'looted';
                    itemEl.remove();
                    removeAllKindsOfTooltips();
                } else {
                    displayMessage('Our inventory is full.', 'white');
                }
            });

            cell.addEventListener('click', function (event) {
                itemEl.style.visibility = 'visible';
            });
        }
    }

    content.appendChild(table);

    const lootAll = document.createElement('button');
    lootAll.className = 'loot-button';
    lootAll.innerHTML = '[E] Loot All';

    lootAll.addEventListener('click', function (event) {
        for (let r = 0; r < currentInterior.length; r++) {
            const space = currentInterior[r];
            if (space.item != null) {
                const success = grantGivenItem(space.item);
                if (success) {
                    space.item = null;
                    space.state = 'looted';
    
                    // Find the corresponding cell and update it
                    const cell = table.querySelector(`[space-id="${r}"]`);
                    if (cell) {
                        const itemEl = cell.querySelector('.inventory-item'); // Assuming class 'item' is used in createItemElement
                        if (itemEl) {
                            itemEl.remove();
                        }
                        cell.classList.add('looted');
                    }
                } else {
                    displayMessage('Our inventory is full.', 'white');
                    break; // Stop looting if inventory is full
                }
            }
        }
    
        removeAllKindsOfTooltips(); // Clean up any leftover tooltips
        window.remove();
        togglePointerLock();
        data.lootContainer = null;
        CURRENT_GROUP_CELL.querySelector('.loot-container')?.remove();
        CURRENT_GROUP_CELL.classList.remove('loot-container');
        data.occupied = false;
        CURRENT_GROUP_CELL.classList.remove('occupied');
    });

    content.appendChild(lootAll);

    window.appendChild(content);

    document.body.appendChild(window);

    document.addEventListener('keydown', function (event) {
        if (event.key === 'e') {
            lootAll.click();
        }
    });
}


function generateLootInterior(size) {
    let interior = [];
    let area = {};
    for (r = 0; r < size; r++) {

        area.state = 'visible';
        area.item = addItemToArea(area);
        
        interior[r] = {...area} ;
    }

    return interior;
}


function addItemToArea(area) {
    const itemKeys = Object.keys(itemsObject);
    const randomItem = itemsObject[itemKeys[Math.floor(Math.random() * itemKeys.length)]];

    return randomItem;
}








