
function removeAllKindsOfTooltips() {
  
  document.querySelector('#building-prompt')?.remove();

  let tooltips1 = document.querySelectorAll('#adventurer-info-container');
    
  tooltips1.forEach(tooltip => {
    tooltip.remove();
  });

  let tooltips2 = document.querySelectorAll('.skill-tooltip');
    
  tooltips2.forEach(tooltip => {
    tooltip.remove();
  });

  let tooltips3 = document.querySelectorAll('.area-tooltip');
    
  tooltips3.forEach(tooltip => {
    tooltip.remove();
  });

}


function addGenericTooltip(element, infos) {
    element.addEventListener('mouseover', function (event) {
      displayGenericTooltip(event, infos);
    });
    element.addEventListener('mouseleave', removeGenericTooltip);
}


function addOvertip(data, id, element) {
  element.addEventListener('mouseenter', function (event) {
    PLAYER_STATE.overtip = 'on';
    updateOvertip(data, mouse = true, event); 
  });
  element.addEventListener('mouseleave', function (event) {
    PLAYER_STATE.overtip = 'off';
    updateOvertip(data); 
  });

  element.addEventListener('click', function (event) {
      const ele = event.target;
      selectSelectedEntity(data, ele);
  });

}

function addItemTooltip(element, infos) {
    element.addEventListener('mouseover', function (event) {
      displayItemTooltip(event, infos);
    });
    element.addEventListener('mouseleave', removeItemTooltip);
}

function addWeaponTooltip(element, infos) {
  element.addEventListener('mouseover', function (event) {
    displayWeaponTooltip(event, infos);
  });
  element.addEventListener('mouseleave', removeItemTooltip);
}

function addItemRightClick(element, item) {
  element.addEventListener('contextmenu', function (event) {
    event.preventDefault();
    if (!element.parentElement.classList.contains('group-slot')) {
      displayRightClickMenu(event, item);
    }
  });
}

function addSettlementTooltip(element, settlement) {
  element.addEventListener('mouseover', function (event) {
    displaySettlementTooltip(event, settlement);
  });
  element.addEventListener('mouseleave', removeAnyToolTip);
}

function addRuinTooltip(element, ruin) {
  element.addEventListener('mouseover', function (event) {
    displayRuinTooltip(event, ruin);
  });
  element.addEventListener('mouseleave', removeAnyToolTip);
}

function addOtherGroupTooltip(element, group) {
  element.addEventListener('mouseover', function eventListenerForOtherGroups(event) {
    displayOtherGroupTooltip(event, group);
  });
  element.addEventListener('mousenter', function eventListenerForOtherGroups(event) {
    displayOtherGroupTooltip(event, group);
  });
  element.addEventListener('mouseleave', removeAnyToolTip);
}

function removeAnyToolTip() {
  const existingTooltip = document.querySelector('.area-tooltip');
  if (existingTooltip) {
    existingTooltip.remove();
  }
}

function displaySettlementTooltip(event, settlement) {
  const hoveredElement = event.target;

  const existingTooltip = document.querySelector('.area-tooltip');
  if (existingTooltip) {
    existingTooltip.remove();
  }

    // Create a tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'area-tooltip settlement-tooltip';
    tooltip.setAttribute("id", "area-tooltip");
    tooltip.innerHTML = `
      <div class="header" id="header">${settlement.Name}</div>
      <div style="color: aqua;">${settlement.Type}</div>
      
    `;

    const header = tooltip.querySelector('#header');
    header.style.backgroundImage = `url('/Art/Settlements/${settlement.Name.toLowerCase()}.png`;
    header.style.height = '100px';
    header.style.width = '400px';

    // Set the tooltip position
    const tooltipX = event.clientX;
    const tooltipY = event.clientY;

    tooltip.style.position = 'absolute';

    // Adjust tooltip position to stay within the window boundaries
    const maxRight = window.innerWidth - tooltip.clientWidth;
    const maxBottom = window.innerHeight - tooltip.clientHeight;

    // If tooltip exceeds window boundaries, adjust its position
    const adjustedX = Math.min(tooltipX, maxRight);
    const adjustedY = Math.min(tooltipY, maxBottom);

    tooltip.style.left = `${adjustedX}px`;
    tooltip.style.top = `${adjustedY}px`;

    tooltip.style.width = `fit-content`;

    document.body.appendChild(tooltip);

    // Set the initial tooltip position
    updateTooltipPosition(event, tooltip);

    // Add event listener to update tooltip position on mousemove
    hoveredElement.addEventListener('mousemove', (event) => updateTooltipPosition(event, tooltip));
}



function displayRuinTooltip(event, ruin) {
  const hoveredElement = event.target;

  const existingTooltip = document.querySelector('.area-tooltip');
  if (existingTooltip) {
    existingTooltip.remove();
  }

    // Create a tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'area-tooltip settlement-tooltip';
    tooltip.setAttribute("id", "area-tooltip");
    tooltip.innerHTML = `
      <div style="color: aqua;">${ruin.Size} ${ruin.Terrain} ${ruin.Name}</div>
      
    `;


    // Set the tooltip position
    const tooltipX = event.clientX;
    const tooltipY = event.clientY;

    tooltip.style.position = 'absolute';

    // Adjust tooltip position to stay within the window boundaries
    const maxRight = window.innerWidth - tooltip.clientWidth;
    const maxBottom = window.innerHeight - tooltip.clientHeight;

    // If tooltip exceeds window boundaries, adjust its position
    const adjustedX = Math.min(tooltipX, maxRight);
    const adjustedY = Math.min(tooltipY, maxBottom);

    tooltip.style.left = `${adjustedX}px`;
    tooltip.style.top = `${adjustedY}px`;

    tooltip.style.width = `fit-content`;

    document.body.appendChild(tooltip);

    // Set the initial tooltip position
    
    

    // Add event listener to update tooltip position on mousemove
    hoveredElement.addEventListener('mousemove', (event) => requestAnimationFrame(() => updateTooltipPosition(event, tooltip)));
}




function displayItemTooltip(event, item) {
  const hoveredElement = event.target;

  const existingTooltip = document.querySelector('.area-tooltip');
  if (existingTooltip) {
    existingTooltip.remove();
  }

    // Create a tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'area-tooltip equipment-tooltip';
    tooltip.setAttribute("id", "area-tooltip");
    tooltip.innerHTML = `
      <div class="header ${item.rarity} weapon" id="header" style="color: var(--${item.rarity.toLowerCase()}-color)">${item.name}</div>
      <div class="category">${item.category} (${item.rarity})</div>
      <div class="description">${item.description}</div>
      <div class="durability">Durability: <span>${item.durability}</span><span>/100</span></div>
      <div class="stackable">Stackable</div>  
      <div class="ability"></div>
      <div class="price">Sell Price: <span>${item.price}</span><span></div>
    `;

    if (item.healAmount) {
      const healAmount = document.createElement('div');
      healAmount.className = 'heal-amount';
      healAmount.textContent = `Heals ${item.healAmount} HP`;
      tooltip.querySelector(".ability").appendChild(healAmount);
    }

    // Set the tooltip position
    const tooltipX = event.clientX;
    const tooltipY = event.clientY;

    tooltip.style.position = 'absolute';

    // Adjust tooltip position to stay within the window boundaries
    const maxRight = window.innerWidth - tooltip.clientWidth;
    const maxBottom = window.innerHeight - tooltip.clientHeight;

    // If tooltip exceeds window boundaries, adjust its position
    const adjustedX = Math.min(tooltipX, maxRight);
    const adjustedY = Math.min(tooltipY, maxBottom);

    tooltip.style.left = `${adjustedX}px`;
    tooltip.style.top = `${adjustedY}px`;

    tooltip.style.width = `fit-content`;


    document.body.appendChild(tooltip);

    const stackable = tooltip.querySelector('.stackable');
    if (item.stackable != 'yes') {
      stackable.remove();
    }

    const durability = tooltip.querySelector('.durability');
    if (!item.durability) {
      durability.remove();
    }

    const tipDivs = tooltip.querySelectorAll('div');
    tipDivs.forEach(div => {
      if (div.innerHTML === '') {
        div.remove();
      }
    });

    if (item.quantity > 1) {
      const spanQ = document.createElement('span');
      spanQ.textContent = `(${item.quantity})`;
      tooltip.querySelector('#header').appendChild(spanQ);
    }
    hideEmptyElements(tooltip);

    // Set the initial tooltip position
    updateTooltipPosition(event, tooltip);

    // Add event listener to update tooltip position on mousemove
    hoveredElement.addEventListener('mousemove', (event) => updateTooltipPosition(event, tooltip));
}


function displayWeaponTooltip(event, item) {
  const hoveredElement = event.target;

  const existingTooltip = document.querySelector('.area-tooltip');
  if (existingTooltip) {
    existingTooltip.remove();
  }

    // Create a tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'area-tooltip equipment-tooltip';
    tooltip.setAttribute("id", "area-tooltip");
    tooltip.innerHTML = `
      <div class="header ${item.quality} weapon" id="header" style="color: var(--${item.quality.toLowerCase()}-color)">${item.name}</div>
      <div class="category">${item.quality} ${item.category}</div>
      <div class="dmg-type">${item.specialty}</div>
      <div class="stats damage"><span class="word">Base Damage: </span>${item.baseDmg}</div>
      <div class="stats crit"><span class="word">Crit Chance: </span>${item.baseCrit}</div>
      <div class="stats culture"><span class="word">Culture: </span>${item.culture}</div>
    `;

    // Set the tooltip position

    if (item.culture === '') tooltip.querySelector('.culture').remove();
    const tooltipX = event.clientX;
    const tooltipY = event.clientY;

    tooltip.style.position = 'absolute';

    // Adjust tooltip position to stay within the window boundaries
    const maxRight = window.innerWidth - tooltip.clientWidth;
    const maxBottom = window.innerHeight - tooltip.clientHeight;

    // If tooltip exceeds window boundaries, adjust its position
    const adjustedX = Math.min(tooltipX, maxRight);
    const adjustedY = Math.min(tooltipY, maxBottom);

    tooltip.style.left = `${adjustedX}px`;
    tooltip.style.top = `${adjustedY}px`;

    tooltip.style.width = `fit-content`;


    document.body.appendChild(tooltip);

    const tipDivs = tooltip.querySelectorAll('div');
    tipDivs.forEach(div => {
      if (div.innerHTML === '') {
        div.remove();
      }
    });

    updateTooltipPosition(event, tooltip);

    hoveredElement.addEventListener('mousemove', (event) => updateTooltipPosition(event, tooltip));
}



function displayGenericTooltip(event, infos) {
    const hoveredElement = event.target;
  
    const existingTooltip = document.querySelector('.area-tooltip');
    if (existingTooltip) {
      existingTooltip.remove();
    }
  
      // Create a tooltip element
      const tooltip = document.createElement('div');
      tooltip.className = 'area-tooltip';
      tooltip.setAttribute("id", "area-tooltip");
      tooltip.innerHTML = `
        <div style="color: aqua;">${infos}</div>
      `;
  
      // Set the tooltip position
      const tooltipX = event.clientX;
      const tooltipY = event.clientY + 20;
  
      tooltip.style.position = 'absolute';
  
      // Adjust tooltip position to stay within the window boundaries
      const maxRight = window.innerWidth - tooltip.clientWidth;
      const maxBottom = window.innerHeight - tooltip.clientHeight;
  
      // If tooltip exceeds window boundaries, adjust its position
      const adjustedX = Math.min(tooltipX, maxRight);
      const adjustedY = Math.min(tooltipY, maxBottom);
  
      tooltip.style.left = `${adjustedX}px`;
      tooltip.style.top = `${adjustedY}px`;

      tooltip.style.width = `fit-content`;
  
      document.body.appendChild(tooltip);

      // Set the initial tooltip position
      updateTooltipPosition(event, tooltip);
  
      // Add event listener to update tooltip position on mousemove
      hoveredElement.addEventListener('mousemove', (event) => updateTooltipPosition(event, tooltip));
  }

  function removeGenericTooltip() {
    const existingTooltip = document.querySelector('.area-tooltip');
    if (existingTooltip) {
      existingTooltip.remove();
    }
  }

  function removeItemTooltip() {
    const existingTooltip = document.querySelector('.area-tooltip');
    if (existingTooltip) {
      existingTooltip.remove();
    }
  }


function updateTooltipPosition(e,t,b=0){
  const w=t.clientWidth,h=t.clientHeight,r=e.target.getBoundingClientRect();
  let x=e.clientX+(t.id==="rightclick-menu"?0:30),
      y=e.clientY+(t.id==="rightclick-menu"?0:10);
  x+w>window.innerWidth&&(x=r.left-w-b);
  y+h>window.innerHeight&&(y=r.top-h-b);
  x<0&&(x=0);
  y<0&&(y=0);
  t.style.left=x+"px";
  t.style.top=y+"px";
  t.style.transformOrigin="top right";
}







  function displayOtherGroupTooltip(element, group) {
    const hoveredElement = element;

    if (!hoveredElement.hasAttribute('gid')) {
      return;
    }
  
    const existingTooltip = document.querySelector('.area-tooltip');
    if (existingTooltip) {
      existingTooltip.remove();
    }
  
      // Create a tooltip element
      const tooltip = document.createElement('div');
      tooltip.className = 'area-tooltip groupclass-tooltip';
      tooltip.setAttribute("id", "area-tooltip");
      tooltip.innerHTML = groupClassHTML(group);
  
      tooltip.style.width = `fit-content`;
  
      document.body.appendChild(tooltip);
  
      // Set the initial tooltip position
      //updateTooltipPosition(event, tooltip);
  
      // Add event listener to update tooltip position on mousemove
      //hoveredElement.addEventListener('mousemove', (event) => requestAnimationFrame(() => updateTooltipPosition(event, tooltip)));
  }

  function groupClassHTML(group) {
    let html = '';

    // Extract the group name and faction
    const groupName = group.keys().next().value;
    const groupFaction = group.faction;

    // Initialize min and max levels
    let minLevel = Infinity;
    let maxLevel = -Infinity;

    // Count the number of adventurers
    let adventurerCount = 0;

    // Iterate over the adventurers map in the group map
    let adventurersHTML = '';
    for (const adventurerMap of group.values()) {
        // Iterate over each adventurer object in the adventurer map
        for (const [adventurerId, adventurer] of adventurerMap) {
            adventurerCount++;
            // Update min and max levels
            if (adventurer.Level < minLevel) {
                minLevel = adventurer.Level;
            }
            if (adventurer.Level > maxLevel) {
                maxLevel = adventurer.Level;
            }
            // Create a div element for each adventurer
            adventurersHTML += `<div class="adv-name">
                                    ${adventurer.Title}
                                    <span class="adv-icon" style="background-image: url('/Art/Adventurers/${adventurer.Title}.png');"></span>
                                </div>`;
        }
    }

    // Determine the level display based on the number of adventurers
    let levelDisplay;
    if (adventurerCount === 1) {
        levelDisplay = `[${minLevel}]`;
    } else {
        levelDisplay = `[${minLevel} - ${maxLevel}]`;
    }

    // Header for the group name with the level display
    const headerHTML = `
    <div class="header">
        <div class="group-main"><span class="group-icon" style="background-image: url('/Art/Group Class/${group.affix}.png');"></span><span class="group-class">${groupName}</span><span class="level">${levelDisplay}</span></div>
        <div class="faction">${groupFaction}</div>
        <div class="direction">${group.direction} <span class="variance">(${group.directionVariance})</span> <span class="position">(x:${group.X} y:${group.Y})</span> </div>
        
    </div>`;

    // Wrap adventurers HTML within a container div
    html += `${headerHTML}<div class="container">${adventurersHTML}</div>`;

    return html;
}




function displayOverworldSettlementTooltip(event, cell, worldDataEntry) {

  const existingTooltip = document.querySelector('.area-tooltip');
  if (existingTooltip) {
    existingTooltip.remove();
  }

  const infos = `${worldDataEntry.settlement.Size} ${worldDataEntry.settlement.Type}`;

  displayGenericTooltip(event, infos);

}










function displayRightClickMenu(event, item) {
  removeAnyToolTip();

  const exMenu = document.getElementById('rightclick-menu');
  if (exMenu) exMenu.remove();

  const menu = document.createElement('div');
  menu.id = 'rightclick-menu';

  const discardButton = document.createElement('button');
  discardButton.textContent = 'Discard';
  discardButton.addEventListener('click', function (event) {
    removeItem(item);
    menu.remove();
  });

  const useButton = document.createElement('button');
  useButton.textContent = 'Use';
  useButton.addEventListener('click', function (event) {
    useItem(item);
    menu.remove();
  });

  menu.appendChild(useButton);
  menu.appendChild(discardButton);

  document.body.appendChild(menu);

  updateTooltipPosition(event, menu);
  playerHover1();
}

function removeItem(item) {
  const iID = item.iID;

  // Find the inventory slot that contains the item
  const itemSlot = PLAYER_ITEMS_SLOTS.find(slot => {
      const item = slot.querySelector('.inventory-item'); 
      return item && item.getAttribute('item-id') === `${iID}`;
  });

  if (item.quantity > 1) {
    item.quantity--;
    const itemEl = itemSlot.querySelector('.inventory-item .item-quantity');
    itemEl.textContent = item.quantity;
  } else {
    if (itemSlot) {
        // Remove the item from the slot
        const itemElement = itemSlot.querySelector('.inventory-item');
        if (itemElement) {
            itemElement.remove();
        }

        // Update slot classes in PLAYER_ITEMS_SLOTS
        itemSlot.classList.replace('occupied-slot', 'empty-slot');
        itemSlot.removeAttribute('occupied-by');
    }

    // Also find and update the slot in #backpack-items
    const backpackSlot = document.querySelector(`#backpack-items [item-id="${iID}"]`);
    if (backpackSlot) {
        const backpackSlotParent = backpackSlot.parentElement;
        backpackSlot.remove(); // Remove the item

        // Update slot classes
        if (backpackSlotParent) {
            backpackSlotParent.classList.replace('occupied-slot', 'empty-slot');
            backpackSlotParent.removeAttribute('occupied-by');
        }
    }

    // Remove the item from PLAYER_ITEMS array
    PLAYER_ITEMS = PLAYER_ITEMS.filter(item => item.iID !== iID);
    console.log(`Removed item with iID: ${iID}`);

    // Remove the menu
    playRemoveSound();
  }
}


