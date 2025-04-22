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
    const exW = document.getElementById('interior_building');
    if (exW) {
        exW.remove();
    }

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
        
        if (cell.classList.contains('available')) {
            cell.textContent = currentInterior[r].dc;
        }

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

    window.appendChild(content);

    document.body.appendChild(window);
}


function generateLootInterior(size) {
    let interior = [];
    let area = {};
    for (r = 0; r < size; r++) {
        const ran = Math.floor(Math.random() * 6) + 1;

        if (ran === 1) {
            area.state = 'disabled';
         } else if (ran === 2) {
            area.state = 'visible';
            area.item = addItemToArea(area);
        } else if (ran >= 5) {
            area.state = 'available';
            const dc = Math.floor(Math.random() * 100) + 1;
            area.dc = dc;
        } else {
            area.state = 'invisible';
        }

        interior[r] = {...area} ;
    }

    return interior;
}


function addItemToArea(area) {
    const itemKeys = Object.keys(itemsObject);
    const randomItem = itemsObject[itemKeys[Math.floor(Math.random() * itemKeys.length)]];

    return randomItem;
}








