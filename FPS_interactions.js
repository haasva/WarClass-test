let PLAYER_STATE = {
  canAttack: true,
  canMove: true,
  isInMenu: false,
  currentAttackType: '',
  overtip: 'off',
  sneak: false,
  isZoomed: false,
}




window.addEventListener("click", async (event) => {
  if (!document.pointerLockElement) return;
  if (event.button !== 2) return;
  
  toggleZoom();

function toggleZoom() {
  const duration = 200; // Animation duration in milliseconds
  const targetZoom = PLAYER_STATE.isZoomed ? 35 : 120;
  const startZoom = SETTINGS.zoomFactor;
  let startTime = null;

  function animateZoom(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1); // Clamp progress to 1
    SETTINGS.zoomFactor = startZoom + (targetZoom - startZoom) * progress;
    applyNeoTransforms(); // Update the view with the new zoom factor

    if (progress < 1) {
      requestAnimationFrame(animateZoom);
    } else {
      PLAYER_STATE.isZoomed = !PLAYER_STATE.isZoomed; // Toggle zoom state
    }
  }

  requestAnimationFrame(animateZoom);
}
});




function toggleSneakMode() {
  PLAYER_STATE.sneak = !PLAYER_STATE.sneak;
  if (PLAYER_STATE.sneak === true) {
    displayMessage('Sneak mode activated.');

  } else {
    displayMessage('Sneak mode off.');

  }



  let start = PLAYER_STATE.sneak ? 0 : 4;
  let end = PLAYER_STATE.sneak ? 4 : 0;
  let duration = 200; // Animation duration in milliseconds
  let startTime = null;

  function animateSneakZ(timestamp) {
    if (!startTime) startTime = timestamp;
    let elapsed = timestamp - startTime;
    let progress = Math.min(elapsed / duration, 1); // Clamp progress to 1
    SETTINGS.sneakZ = start + (end - start) * progress;
    calculateCameraElevation();
    applyNeoTransforms();

    if (progress < 1) {
      requestAnimationFrame(animateSneakZ);
    }
  }

  requestAnimationFrame(animateSneakZ);
}


function selectAdventurer(index, adventurerKeys) {
  const adventurer = groupAdventurers.get(adventurerKeys[index]);
  console.log("Selected Adventurer:", adventurer);

  const group = Array.from(groupAdventurers.values());
  group.forEach(adv => {
    adv.equipped = false;
  });

  adventurer.equipped = true;

  const leftSide = document.querySelector('#left-side');

  let elements1 = leftSide.querySelectorAll(`.item`);
  elements1.forEach(element => {
    element.parentElement.classList.remove('equipped');
  });

  let elements = leftSide.querySelectorAll(`[uid='${adventurer.uID}']`);
  elements.forEach(element => {
    if (element.classList.contains('item')) {
      element.parentElement.classList.add('equipped');
    }
  });

  updateActiveWeaponryBox(adventurer);
  displayAdventurerOption(adventurer) // Display the adventurer's options;



  PLAYER_STATE.currentAttackType = adventurer.Equipment.Weapon.specialty;

  const line = document.getElementById('player-direction-line');
  if (line) {
    line.className = `${PLAYER_STATE.currentAttackType}`;
  }

  updateOvertip(crosshairInteractor.getHoveredEntity());
  return adventurer;
}

let scrollThreshold = 100; // Minimum scroll value before switching
let accumulatedScroll = 0;
let currentEquippedAdvIndex = 0;




function wheelScrollActiveAdventurers(event) {
  if (groupAdventurers.size === 0) {return}

  if (event.target === document.getElementById('backpack') || PLAYER_STATE.isInMenu === true) {
    return;
  }

  let adventurerKeys = [...groupAdventurers]
      .map(([key, _]) => key);
  
  accumulatedScroll += event.deltaY;
  
  if (accumulatedScroll > scrollThreshold) {
      // Scroll Down - Next Adventurer
      currentEquippedAdvIndex = (currentEquippedAdvIndex + 1) % adventurerKeys.length;
      accumulatedScroll = 0; // Reset after switching
  } else if (accumulatedScroll < -scrollThreshold) {
      // Scroll Up - Previous Adventurer
      currentEquippedAdvIndex = (currentEquippedAdvIndex - 1 + adventurerKeys.length) % adventurerKeys.length;
      accumulatedScroll = 0; // Reset after switching
  }
  
    selectAdventurer(currentEquippedAdvIndex, adventurerKeys);
}


function updateActiveWeaponryBox(adventurer) {
  

  const wepBox = document.getElementById('active-weaponry');

  if (!wepBox) return;
  let weapon = adventurer.Equipment.Weapon;
  let specialty;
  if (weapon === null || weapon === undefined) {
    specialty = 'Unarmed';
  } else {
    specialty = weapon.specialty;
  }
  updateWeaponFPS(specialty);

  CURRENT_TARGET_ENTITY = null;
  CURRENT_TARGET_ELEMENT = null;

}


function updateWeaponFPS(specialty) {
  const wp = document.getElementById('weapon');
  if (specialty === "Non-fighting") {
    wp.style.backgroundImage = `none`;
  } else {
    wp.style.backgroundImage = `url('/Art/Speciality/${specialty}/1.png')`;
  }
}



function animateZoom(duration) {
  const el = document.getElementById('inner-neo');
  let start = performance.now(), initial = SETTINGS.zoomFactor, up = true;

  function step(time) {
    let progress = Math.min((time - start) / duration, 1);
    let scale = up ? initial + progress * 3 : initial + (1 - progress) * 3;
    el.style.scale = `${scale}`;

    if (progress < 1) requestAnimationFrame(step);
    else if (up) { up = false; start = time; requestAnimationFrame(step); }
  }

  requestAnimationFrame(step);
}


async function weaponImageAnimation(specialty) {

  PLAYER_STATE.canAttack = false;
  let m = 1;
  if (specialty === 'Archery') {
    m = 7;
  } else if (specialty === 'Unarmed') {
    m = 3;
  } else if (specialty === 'Melee') {
    m = 5;
  } else if (specialty === 'Gunpowder') {
    m = 1;
  }
    const wp = document.getElementById('weapon');
    const images = [];
  
    // Preload images



    for (let n = 1; n <= m; n++) {
        images[n] = new Image();
        images[n].src = `/Art/Speciality/${specialty.toLowerCase()}/${n}.png`;
        await new Promise(resolve => {
            images[n].onload = resolve;
        });
    }

    // Animate using preloaded images
    for (let n = 1; n <= m; n++) {
        wp.style.backgroundImage = `url('${images[n].src}')`;
        await new Promise(resolve => setTimeout(resolve, 35));
    }
  
    // Set final frame
    wp.style.backgroundImage = `url('${images[1].src}')`;

  PLAYER_STATE.canAttack = true;
}



window.addEventListener("click", async (event) => {

  if (event.button !== 0) return;

  crosshairInteractor.updateInteraction();

  updateTargetElementAndEntity();
  
  if (PLAYER_STATE.canAttack != true) {
    return;
  }
  if (CURRENT_TARGET_ENTITY === null || !CURRENT_TARGET_ENTITY) {
    return;
  }
  if (CURRENT_MANAGED_ADVENTURER.Specialty === "Non-fighting") {
    return;
  }

  let group = Array.from(groupAdventurers.values());
  let attacker = group.find(adventurer => adventurer.equipped === true);
  let defender;

  let attackerElement = document.getElementById('weapon');
  let defenderElement = event.target;

  if (PLAYER_STATE.currentAttackType === 'Unarmed') {
    const ran = Math.floor(Math.random() * 100) + 50;
    animateZoom(200 - ran);
  }
  await weaponImageAnimation(attacker.Specialty);

  if (event.target.classList.contains('group-store')) {

    const gid = parseInt(event.target.getAttribute('gid'));
    const enemyGroup = currentOtherGroups.find(map => map.gID === gid);

    if (enemyGroup) {
      await attackEnemyGroup(enemyGroup, gid, attacker, defender, attackerElement, defenderElement);
    }
    
  } else if (CURRENT_TARGET_ENTITY != null) {

    if (attacker.currentLife >= 0) {
      displayMessage('This adventurer can not attack', 'white');
    }

    const checkRange = checkAttackRange(attacker, CURRENT_TARGET_ENTITY);
    if (!checkRange) {
      displayMessage('Out of range!', '#974daf');
      return;
    }


    defenderElement = CURRENT_TARGET_ELEMENT;
    const aid = CURRENT_TARGET_ENTITY.id;
    const animal = CURRENT_PLAYER_REGION_DATA.animals.find(map => map.id === aid);
    if (animal && animal.currentLife >= 0) {
      await gunpowder();
      await attackAnimal(attackerElement, defenderElement, attacker, animal);
      PLAYER_STATE.canAttack = true;
    }

  }

});



function checkAttackRange(attacker, defender) {

  let range = 1;
  if (attacker.Range) {
    range = attacker.Range;
  }

  const distance = Math.hypot(defender.X - PLAYER_STATE.x, defender.Y - PLAYER_STATE.y);
  console.log('Distance: ', distance);
  if (distance <= range) {
    return true;
  } else {
    return false;
  }
}











function screenshakeEffect(style) {
  const inner = document.getElementById('mega-wrapper');
  inner.style.animation = `screenshake${style} 0.15s ease-out`;
  setTimeout(() => {
    inner.style.animation = "none";
  }, 150);
}




async function enemyAttackUs(attackerElement, defenderElement, attacker) {
if (!attacker) {
  return;
}

  let defender;
  let groupArray = Array.from(groupAdventurers.values());
  shuffle(groupArray);
  // Find a defender who is still alive
  
  defender = groupArray.find(adventurer => adventurer.Life > 0);
  if (!defender) return;
  attacker.Specialty = 'Melee';

  let n = attacker.attack; // Base attack value
  let range = n * 0.2; // 20% of n
  n = Math.round(n + (Math.random() * 2 - 1) * range);
  
  if (defender.Life <= 0) {
    defender.Life = 0;
    shuffle(groupArray);
    defender = groupArray.find(adventurer => adventurer.Life > 0);
    if (!defender) return;
    await animateAnimalAttack(attackerElement);
    defender.Life = parseInt(defender.Life - n);
  } else {
    await animateAnimalAttack(attackerElement);
    defender.Life = parseInt(defender.Life - n);
  }

  if (defender.Life <= 0) {
    defender.Life = 0;
  }

  console.log('attacker: ', attacker);
  console.log('defender', defender);

  displayMessage(`${attacker.name} attacks us for ${n} damage!`, 'red');

  updateInterface();

}


function showSreenBlood() {
  const bloodscreen = document.getElementById('bloodscreen');
  
  bloodscreen.style.animation = 'weAreAttacked 0.2s ease-out 1';
  setTimeout( () => {
    bloodscreen.style.animation = '';
  }, 200);
}

async function animateAnimalAttack(element) {
  let startTime = null;
  const duration = 100; // 100ms for attack movement
  const returnDuration = 100; // 100ms for return movement
  const initialOrigin = { x: 0, y: -50 }; // Default position
  const offset = 75; // Movement distance

  let targetOrigin = { ...initialOrigin };

  // Determine the new position based on facingDirection
  switch (facingDirection) {
    case 270: // Move left
      targetOrigin.x += offset;
      break;
    case 0: // Move up
      targetOrigin.y += offset;
      break;
    case 90: // Move right
      targetOrigin.x -= offset;
      break;
    case 180: // Move down
      targetOrigin.y -= offset;
      break;
  }

  function animateFrame(timestamp) {
    if (!startTime) startTime = timestamp;
    let elapsed = timestamp - startTime;
    let progress = Math.min(elapsed / duration, 1); // Clamp progress to 1

    // Interpolate movement
    let currentX = initialOrigin.x + (targetOrigin.x - initialOrigin.x) * progress;
    let currentY = initialOrigin.y + (targetOrigin.y - initialOrigin.y) * progress;

    element.style.translate = `${currentX}% ${currentY}%`;

    if (progress < 1) {
      requestAnimationFrame(animateFrame);
    } else {
      // Start return animation
      playBite();
      screenshakeEffect('Hurt');
      showSreenBlood();
      startTime = null;
      requestAnimationFrame(returnToStart);
    }
  }

  function returnToStart(timestamp) {
    if (!startTime) startTime = timestamp;
    let elapsed = timestamp - startTime;
    let progress = Math.min(elapsed / returnDuration, 1); // Clamp progress to 1

    // Interpolate back to initial position
    let currentX = targetOrigin.x + (initialOrigin.x - targetOrigin.x) * progress;
    let currentY = targetOrigin.y + (initialOrigin.y - targetOrigin.y) * progress;

    element.style.translate = `${currentX}% ${currentY}%`;

    if (progress < 1) {
      requestAnimationFrame(returnToStart);
    }
  }

  requestAnimationFrame(animateFrame);
}






async function attackAnimal(attackerElement, defenderElement, attacker, defender) {
  



  await preAttackAnimation(attacker, defender, attackerElement, defenderElement);

  const missed = checkMissChance(attacker, defender);
  if (missed) {
    displayMessage('Missed!', '#974daf');
    displayDamageText('Miss');
    await new Promise(resolve => setTimeout(resolve, 100));
  } else {
    screenshakeEffect('Hit');

    defender.currentLife -= attacker.Attack;
    displayDamageText(attacker.Attack);
    updateOvertip(defender, defender.id);
    if (defender.currentLife <= 0) {
  
      defenderElement.parentElement.classList.remove('animal');
      defenderElement.parentElement.classList.remove('entity');
      playMonkeyDeath();
      await new Promise(resolve => setTimeout(resolve, 50));
      await impactDamageTarget(defenderElement, defenderElement.parentElement);
  
      const matchingEntListEl = document.querySelector(`.entity-element[aid='${defender.id}']`);
      if (matchingEntListEl) {
        matchingEntListEl.remove();
      }
  
      resultEntityKilled(defender, defenderElement.parentElement);
  
      CURRENT_PLAYER_REGION_DATA.animals = CURRENT_PLAYER_REGION_DATA.animals.filter(def => def.id !== defender.id);
      CURRENT_TARGET_ENTITY = null;
  
    }
  }
  updateEntityListElement(defender, defender.id);
  await new Promise(resolve => setTimeout(resolve, 200)); 
  await realTime();
  PLAYER_STATE.canAttack = true;
}


function checkMissChance(attacker, defender) {
  let roll = Math.round(Math.random() * 100);

  let missChance = (defender.distance * 6 + 10) - attacker.Attributes.Cunning;
  if (roll <= missChance) {
    return true;
  }
}


function resultEntityKilled(entity, cell) {
  displayMessage(`${entity.name} is DEAD!`, 'red');
  
  const expGain = 12 * (entity.level) + entity.attack + entity.life;
  gainExperience(expGain);

  createLoot(entity, cell);
}


function createLoot(entity, cell) {
  
}




function gainExperience(amount) {
experience = Math.round(experience + amount);
displayMessage(`We gain +${amount} experience.`);
updateExpBar();
}


function displayDamageText(n) {
  const exDmg = document.getElementById('damage-text');
  if (exDmg) exDmg.remove();
  const dmg = document.createElement('div');
  dmg.id = 'damage-text';
  dmg.textContent = `${n}`;
  const ran = Math.floor(Math.random() * 8) + 1;
  dmg.style.scale = `${1 + (ran / 10)}`;
  document.body.appendChild(dmg);
  setTimeout(() => {
    dmg.remove();
  }, 500);


}



async function attackEnemyGroup(group, gid, attacker, defender, attackerElement, defenderElement) {
  let adventurersMap;

  // Find the first non-empty Map in the group
  for (const value of group.values()) {
      if (value instanceof Map && value.size > 0) {
          adventurersMap = value;
          break;
      }
  }

  if (!adventurersMap || adventurersMap.size === 0) return;

  let groupArray = Array.from(adventurersMap.values());

  // Find a defender who is still alive
  defender = groupArray.find(adventurer => adventurer.Life > 0);

  if (!defender) {
      await removeAnEnemyGroupTotally(gid, group);
      return;
  }

  // Calculate group.currentLife without resetting it first
  group.currentLife = groupArray.reduce((total, adventurer) => total + Math.max(0, adventurer.Life), 0);

  // If the group is dead, remove it
  if (group.currentLife <= 0) {
      await removeAnEnemyGroupTotally(gid, group);
      return;
  }

  // Proceed with attack if defender is alive
  await preAttackAnimation(attacker, defender, attackerElement, defenderElement);
  screenshakeEffect('Hit');
  applyDamage(attacker, defender, attackerElement, defenderElement);
  updateOvertip(group);
  // If the defender dies after the attack, choose another one
  if (defender.Life <= 0) {
      defender = groupArray.find(adventurer => adventurer.Life > 0);

      // If no adventurer is left alive, remove the group
      if (!defender) {
        await removeAnEnemyGroupTotally(gid, group);
      }
  }
  await realTime();
}



function updateOvertip(entity) {

  const tip = document.getElementById('overtip-container');
  if (!tip) { return; }
  if (PLAYER_STATE.overtip === 'on') {
    tip.style.opacity = 1;
    if (entity.currentLife <= 0) {
      tip.style.opacity = 0;
      PLAYER_STATE.overtip = 'off';
    } else {
      const lifebar = tip.querySelector('.overtip-lifebar');
      lifebar.setAttribute('value', entity.currentLife);
      lifebar.setAttribute('max', entity.totalLife);
  
      const title = tip.querySelector('.overtip-title');

      const missChance = (entity.distance * 6 + 10) - CURRENT_MANAGED_ADVENTURER.Attributes.Cunning;


      title.textContent = `${entity.name} [${entity.level}]`;
      tip.querySelector('.overtip-info').textContent = `Dist: ${entity.distance} | CM: ${missChance}%`;
  
      if (entity.aggressive === 'yes') {
        title.classList.add('aggressive');
      } else {
        title.classList.remove('aggressive');
      }
  
      if (entity.type === 'group') {
        titleText = entity.keys().next().value;
        title.textContent = `${titleText}`;
      }
    }
  } else {
    PLAYER_STATE.overtip = 'off';
    tip.style.opacity = 0;
  }
}


function createEntityOvertip() {

  const exTip = document.getElementById('overtip-container');
  if (exTip) exTip.remove();
  
  const tip = document.createElement('div');
  tip.id = 'overtip-container';
  tip.setAttribute('oid', 0);

  tip.style.opacity = 0;

  const lifebar = document.createElement('progress');
  lifebar.classList.add('overtip-lifebar');
  lifebar.setAttribute('value', 0);
  lifebar.setAttribute('max', 0);

  const title = document.createElement('div');
  title.classList.add('overtip-title');
  let titleText = '';
  title.textContent = `${titleText}`;

  const info = document.createElement('div');
  info.classList.add('overtip-info');

  tip.appendChild(title);
  tip.appendChild(info);
  tip.appendChild(lifebar);

  document.querySelector('#region-grid-container').appendChild(tip);

}


function updateEntityListElement(enemy, id) {
  const matchingEntListEl = document.querySelector(`.entity-element[aid='${id}']`);
  if (matchingEntListEl) {

      const life = matchingEntListEl.querySelector('.entity-life');
      life.textContent = `${enemy.currentLife} / ${enemy.totalLife}`;

      if (enemy.currentLife <= 0) {
        matchingEntListEl.remove();
      }
  }
}









async function impactDamageTarget(target, cell) {


  const ran = Math.floor(Math.random() * 3) + 1;
  if (ran === 1) {
    playBloodSplat2Sound();
  } else {
    playBloodSplatSound();
  }

cell.classList.add('corpse');
cell.classList.add('gatherable');
cell.classList.remove('entity');

target.remove();

store = document.createElement('div');
store.classList.add('basic-store');
store.classList.add('clickable');
store.classList.add('corpse');
store.classList.add('cardboard');
store.style.setProperty(
  "--rotationZ",
  `${SETTINGS.zRotation}deg`
);
store.style.transform = `rotateX(-90deg) rotateY(var(--rotationZ)) rotateX(var(--rotationX));`;
cell.appendChild(store);
updateCardboardRotation();
store.classList.add('impacted2');
setTimeout(() => {
  store.classList.remove('impacted2');
}, 500);

}


function removeDirectionLine() {
  const exLine = document.getElementById(`player-direction-line`);
  if (exLine) exLine.remove();
}


async function createDirectionLine() {
  const exLine = document.getElementById(`player-direction-line`);
  if (exLine) {
      exLine.remove();
  }

  const line = document.createElement('div');
  line.id = `player-direction-line`;
  line.className = `${PLAYER_STATE.currentAttackType}`;
  line.style.position = 'absolute';

  line.style.setProperty(
    "--rotationZ",
    `${-SETTINGS.zRotation}deg`
  );

  document.querySelector('#inner-neo').appendChild(line);
}








async function gunpowder() {
    



  const gun = document.getElementById('weapon');
  gun.style.animation = "gunFire 0.4s ease-out";

  const tableContainer = document.getElementById('inner-neo');

  screenshakeEffect();
  
  if (PLAYER_STATE.currentAttackType === 'Gunpowder') {
    const smokeEffect = document.createElement('div');
    smokeEffect.setAttribute('id', 'smoke-effect');
    document.body.appendChild(smokeEffect);
  

  
    setTimeout(() => {
      tableContainer.style.animation = "";
    }, 200);
  
    setTimeout(() => {
      smokeEffect.remove();
    }, 2000);
  }

  setTimeout(() => {
    gun.style.animation = "weaponIdling 2s infinite";
  }, 400);
}

let CURRENT_TARGET_ELEMENT = null;
let CURRENT_TARGET_ENTITY = null;

function checkLineIntersections() {
  const currentEntityIndicator = document.getElementById('current-target');
  const line = document.getElementById(`player-direction-line`);
  const targetableElements = document.querySelectorAll('.entity');

  if (!line || targetableElements.length === 0) return;



  // Get the bounding rectangle for the line
  const lineRect = line.getBoundingClientRect();


  for (const cell of observedCells) {
    const entityElement = cell.querySelector('.entity:not(.fogged) > .animal');

    if (entityElement) {
    let targetRect = entityElement.getBoundingClientRect();

    let distance = Math.hypot(targetRect.left - lineRect.left, targetRect.top - lineRect.top);
    let scalingFactor = Math.max(1, distance / 1000); // Adjust the divisor based on game scale
    
    let hitboxBonusX = 1 * scalingFactor;
    let hitboxBonusY = 1 * scalingFactor;

    const intersects = !(lineRect.right < targetRect.left + hitboxBonusX ||
                         lineRect.left > targetRect.right + hitboxBonusY ||
                         lineRect.bottom < targetRect.top ||
                         lineRect.top > targetRect.bottom);

      if (intersects) {
          entityElement.classList.add('highlight-visible');

          const aid = entityElement ? parseInt(entityElement.getAttribute('aid')) : null;
          const animal = aid ? CURRENT_PLAYER_REGION_DATA.animals.find(map => map.id === aid) : null;
          
          CURRENT_TARGET_ELEMENT = entityElement;
          CURRENT_TARGET_ENTITY = animal;

          console.log(CURRENT_TARGET_ENTITY);

          // currentEntityIndicator.appendChild(createEntityListElement(CURRENT_TARGET_ENTITY));
          updateOvertip(CURRENT_TARGET_ENTITY);

      } else {

        entityElement.classList.remove('highlight-visible');

        const tip = document.getElementById('overtip-container');
        if (tip) {
            tip.style.opacity = 0;
        }
      }
    }

  }
}




function createCorpse(target) {
  target.classList.remove('impacted2');
  target.classList.remove('impacted');
  target.parentElement.setAttribute('id', 'corpse-box');
  target.parentElement.classList.add('corpse-box');
  target.classList.remove('animal-face');
  target.classList.add('corpse-face');
  target.setAttribute('id', 'corpse-front');
  target.style.setProperty(
    "--rotationZ",
    `${SETTINGS.zRotation}deg`
  );
  target.style.transform = `rotateX(-90deg) rotateY(var(--rotationZ));`;
}














function destroyImpassable(target) {
  target.style.animation = "fadeDown 0.2s linear 1 ";
  setTimeout(() => {
    target.style.animation = "none";
    let veg = CURRENT_PLAYER_REGION_DATA.vegetation;
    target.parentElement.classList.remove('impassable');
    target.parentElement.classList.remove('blocksvision');
    target.parentElement.classList.remove('wall');
    target.parentElement.style.visibility = "visible";

    target.remove();
    castShadows();
    playStepAudio();
  }, 200);


}





