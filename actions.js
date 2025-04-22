let attackSpeed = 200;

function camp() {
  endurance = endurance + 10;
  updateInterface();
  healAdventurers();
}


function performAction() {

  if (endurance === MAX_ENDURANCE) {
    return;
  }
	
  let enduranceGain = 1;
  if (isNight === true) {
    enduranceGain *= 2;
  } else {
    enduranceGain *= 1;
  }

  endurance += enduranceGain;
  updateFatigueDisplay();
  gainExp();
}



function consumeFood() {

  const group = Array.from(groupAdventurers.values());
 // Start the attack for each adventurer
  group.forEach((adventurer) => {
    groupFood -= 1;
    if (groupFood <= 0) { groupFood=0; }
  });

  updateFoodDisplay();
}





function disableActions() {
  const actionButtons = document.getElementsByClassName('action-button');
  for (let i = 0; i < actionButtons.length; i++) {
    // Check if the button is not the campButton before disabling
    if (actionButtons[i].id !== 'camp-button') {
      actionButtons[i].disabled = true;
    }
  }
  const campButton = document.getElementById('camp-button');
}

function enableActions() {
  const actionButtons = document.getElementsByClassName('action-button');
  for (let i = 0; i < actionButtons.length; i++) {
    actionButtons[i].disabled = false;
  }
}

function accelerateTime() {
  REAL_TIME = 0.5;
}

function fatigueOverTime() {

  
    fatigueReduction = 1;
    if (isNight) {
      fatigueReduction = 2;
    }
  
  endurance -= fatigueReduction;
  if (endurance < 0) {
      endurance = 0;
  }
}









function gainExp() {
	experience += 0.1;
}


function healAdventurers() {
  groupAdventurers.forEach(adventurer => {

while (adventurer.Life < adventurer.MaxLife) {
  adventurer.Life++;
}


});
}








let canPlaceStructure = true;


function buildStructure() {
  canPlaceStructure = true;
  observedCells.forEach((elem) => {
      const visibility = window.getComputedStyle(elem).visibility;

      // Toggle only if the parent element is visible
      if (visibility === 'visible' && !elem.classList.contains('impassable') && canPlaceStructure === true) {
        elem.addEventListener('mousedown', function(event) {
            placeStructure(elem);
            
        }, { once: true });
      }
  });
}

function placeStructure(elem) {
  const store = document.createElement('div');
  store.classList.add('basic-store');
  store.classList.add('building');
  elem.appendChild(store);


  const randomSprite = Math.floor(Math.random() * 5) + 1;
  store.style.backgroundImage = `url('/Art/Sprites/Buildings/fishing_hut.png')`;

  //store.style.animation = 'building-growth 5s linear';
    
  canPlaceStructure = false;
}









function attackTarget(attacking, target) {
  if (keyState['w'] || keyState['s'] || keyState['a'] || keyState['d']) {
    return;
  }
  let char = document.querySelector('#player-char');
  let charRect = char.getBoundingClientRect();
  let targetRect = target.getBoundingClientRect();

  // Calculate the differences in x and y
  let deltaX = targetRect.left - charRect.left;
  let deltaY = targetRect.top - charRect.top;

  // Determine the direction based on the coordinate differences
  let direction;
  if (deltaY < 0 && Math.abs(deltaX) <= Math.abs(deltaY)) {
    direction = 'north';
  } else if (deltaY < 0 && deltaX > 0) {
    direction = 'north-east';
  } else if (deltaY < 0 && deltaX < 0) {
    direction = 'north-west';
  } else if (deltaY > 0 && Math.abs(deltaX) <= Math.abs(deltaY)) {
    direction = 'south';
  } else if (deltaY > 0 && deltaX > 0) {
    direction = 'south-east';
  } else if (deltaY > 0 && deltaX < 0) {
    direction = 'south-west';
  } else if (deltaX > 0 && Math.abs(deltaY) <= Math.abs(deltaX)) {
    direction = 'east';
  } else if (deltaX < 0 && Math.abs(deltaY) <= Math.abs(deltaX)) {
    direction = 'west';
  }

  let isAttacking = false;
  // Change character's image based on the attack status and direction
  // Perform attack if not already attacking
  if (attacking && !isAttacking) {
    isAttacking = true;
    char.style.backgroundImage = `url('/Art/Adventurers/Sprites/animated/attack-${direction}.gif')`;




    // Delay to reset attack status
    setTimeout(() => {
      isAttacking = false;

 
    }, attackSpeed * 2); // Adjust timing based on attackSpeed

  }

  // Reset to standing position if not attacking
  if (!attacking && !isAttacking) {
    char.style.backgroundImage = `url('/Art/Adventurers/Sprites/animated/stand.gif')`;
  }
}







function collectAnimal(data) {
  displayMessage(`We collect the ${data.name} (id:${data.id})`);
  
  meatSound();
  
  observedCells.forEach(cell => {
    const birdElement = cell.querySelector(`[birdID="${data.id}"]`);
    const index = parseInt(cell.getAttribute('index'));
    const object = CURRENT_PLAYER_REGION_DATA.content.flatMap(row => row).find(obj => obj.index === index);
    object.bird = null;
    
    if (birdElement) {
      collectAnimation(birdElement);
      setTimeout(() => {
        birdElement.remove();
      }, 200);
    }
  });
  GROUP_ATTRIBUTES.lore++;
  updateGroupSheet();
}


function collectAnimation(element) {
    element.style.animation = 'impacted 0.2s ease-out 1';
}