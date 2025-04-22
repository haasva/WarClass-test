let sparedEnemyAdventurers = {};

function checkSparedResult() {
    for (const adventurerTitle in sparedEnemyAdventurers) {
      const spareCheck = Math.floor(Math.random() * 100) + 1;
  
      if (spareCheck <= DIPLOMACY) {
        // Keep the adventurer
        console.log(`Adventurer ${adventurerTitle} is spared.`);
        displayMessage(`${adventurerTitle} has successfully been spared!`, '#d3f0f7');
      } else {
        // Remove the adventurer
        console.log(`Adventurer ${adventurerTitle} is not spared.`);
        displayMessage(`${adventurerTitle} has unfortunately been killed in the battle.`, '#d3f0f7');
        delete sparedEnemyAdventurers[adventurerTitle];
        const adventurerPics = document.getElementsByClassName('sparedTarget');
        for (const element of adventurerPics) {
          element.classList.remove("sparedTarget");
        }
      }
    }
  }
  
  
  function displaySparedResult(box) {
    if (box.classList.contains('sparedTarget')) {
      const hpText = box.querySelector('.enemyAdvHPText');
      if (hpText) {
        hpText.textContent = "";
        hpText.classList.add('defeated-spared');
      }
    } else {
      const hpText = box.querySelector('.enemyAdvHPText');
      if (hpText) {
        hpText.textContent = "";
        hpText.classList.add('defeated-dead');
      }
    }
  }
  
  
  
  
  
  
  
  function displayAdventurerOptions(event, adventurerTitle, adventurer) {
  
  if (!isInCombat && isCombatAftermath != true) {
    const existingOptionMenu = document.querySelector('.options-menu');
    if (existingOptionMenu) {
      existingOptionMenu.remove();
    }
    // Get the adventurerPics element that was clicked
    const adventurerPics = event.currentTarget;
    const potentialSpared = document.getElementsByClassName('adventurerPics');
    const sparedTargets = document.getElementsByClassName('sparedTarget');
  
  
    const existingOptionsMenu = adventurerPics.querySelector('.options-menu');
    if (event.target.classList.contains('enemyAdvTitles')) return;
  
    // Check if the options menu already exists and remove it if it does
    if (existingOptionsMenu) {
      existingOptionsMenu.remove();
      return;
    }
  
  
    // Create a div element to hold the options menu
    const optionsMenu = document.createElement('div');
    optionsMenu.classList.add('options-menu');
  
    // Create a checkable element for sparing the adventurer
    const sparedLabel = document.createElement('label');
    const sparedCheckbox = document.createElement('input');
    sparedCheckbox.type = 'checkbox';
    sparedCheckbox.classList.add('spared-checkbox');
    sparedLabel.textContent = 'Spare';
    sparedLabel.appendChild(sparedCheckbox);
    optionsMenu.appendChild(sparedLabel);
  
    // Check the checkbox if adventurer is spared
    if (adventurerPics.classList.contains('sparedTarget')) {
      sparedCheckbox.checked = true;
    }
    if ( sparedTargets.length >= (potentialSpared.length - 1) || potentialSpared.length === 1 ) {
      if (!adventurerPics.classList.contains("sparedTarget")) {
        sparedCheckbox.disabled = true;
      }
    }
  
    // Add the options menu to the adventurerPics element
    optionsMenu.style.left = `${event.clientX-50}px`;
    optionsMenu.style.top = `${event.clientY-10}px`;
    document.body.appendChild(optionsMenu);
    
    // Add event listener to handle the sparing checkbox
    sparedCheckbox.addEventListener('change', () => {
      
        if (sparedCheckbox.checked) {
          adventurerPics.classList.add('sparedTarget');
          // Add the adventurer to the sparedEnemyAdventurers object
          sparedEnemyAdventurers[adventurerTitle] = JSON.parse(JSON.stringify(adventurer));
          console.log('Spared adventurers:', sparedEnemyAdventurers);
          displayMessage(`We will try to spare ${adventurerTitle}.`, 'violet');
          document.body.removeChild(optionsMenu);
        } else {
          adventurerPics.classList.remove('sparedTarget');
          // Remove the adventurer from the sparedEnemyAdventurers object
          delete sparedEnemyAdventurers[adventurerTitle];
          console.log('Spared adventurers:', sparedEnemyAdventurers);
          displayMessage(`No quarter for ${adventurerTitle}!`, 'violet');
          document.body.removeChild(optionsMenu);
        }
  
    });
    
  
    // Prevent the click event from bubbling up to the document
    event.stopPropagation();
  
    // Prevent the click event on the label from closing the options menu
    sparedLabel.addEventListener('click', (event) => {
      event.stopPropagation();
    });
  
    sparedLabel.addEventListener('click', (event) => {
    const optionsMenus = document.querySelectorAll('.options-menu');
    optionsMenus.forEach(menu => {
      if (!menu.contains(event.target)) {
        menu.remove();
      }
    });
  });
  
  }
  }
  
  
  
  
  // Add event listener to hide the options menu when clicking outside the menu
  document.addEventListener('click', (event) => {
    const optionsMenus = document.querySelectorAll('.options-menu');
    optionsMenus.forEach(menu => {
      if (!menu.contains(event.target)) {
        menu.remove();
      }
    });
  });
  
  
  function sparingDamageModifier(sparedEnemyAdventurers) {
    const numberOfSparedAdventurers = Object.keys(sparedEnemyAdventurers).length;
    const negativeMultiplier = numberOfSparedAdventurers * 0.20;
    return Math.max(1 - negativeMultiplier, 0);
  }
  
  