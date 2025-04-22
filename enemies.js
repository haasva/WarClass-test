let isInCombat = false;
let isCombatAftermath = null;
let enemyAdventurersGroup = new Map();
let enemyGroupSpeed = 0;
let totalEnemyLife = 0;
let enemyCurrentLife = 0;
let totalEnemyAttackValue = 0;
let totalSpeed = 0;
let adventurerEventListeners = [];
let isInEvent = false;





function enemyEvent() {
	const popupEvent = document.createElement('div');
	popupEvent.setAttribute("id", "popupEvent");
  const regionArea = document.getElementById("content-region");
	regionArea.appendChild(popupEvent);

	// displayRandomAdventurerGroup();
}

function disableActionsButtons(isInCombat) {

}






// async function pickRandomEnemiesAdventurers(adventurersBatch, adventurerFoesGroupSize, superRegion) {

//   async function shuffleEnemies(array) {
//     for (let i = array.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));
//       [array[i], array[j]] = [array[j], array[i]];
//     }
//   }

//   await shuffleEnemies(adventurersBatch);




//   const randomAdventurersArray = [];
//   const areaCultures2 = cultures.split(', ').map(word => word.trim());

//   while (randomAdventurersArray.length < adventurerFoesGroupSize && adventurersBatch.length > 0) {

//     let selectedEnemyAdventurerIndex = -1;
//     for (let i = 0; i < adventurersBatch.length; i++) {

//       const adventurer = adventurersBatch[i];

      
//       // Check if at least one word in adventurer's culture matches the area's cultures
//       const adventurerCultures = adventurer.Culture.split(', ').map(word => word.trim());
//       if (adventurerCultures.some(culture => areaCultures2.includes(culture))) {
//         selectedEnemyAdventurerIndex = i;

//         break;
//       }
//     }
  
//     if (selectedEnemyAdventurerIndex !== -1) {

//       const selectedEnemyAdventurer = adventurersBatch[selectedEnemyAdventurerIndex];
//       randomAdventurersArray.push(selectedEnemyAdventurer);

//       const uID = Math.floor(Math.random() * 99999) + 1;
//       selectedEnemyAdventurer.uID = uID;
//       adventurersBatch.splice(selectedEnemyAdventurerIndex, 1);
//     }
    
//   }


//   return Promise.resolve(randomAdventurersArray);
// }






async function pickRandomEnemiesAdventurers(adventurersBatch, adventurerFoesGroupSize, superRegion) {

  function shuffleEnemies(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  shuffleEnemies(adventurersBatch);

  const randomAdventurersArray = [];
  let adventurersForArea = [];

  try {
    const response = await fetch('/JSONData/adventurers_by_area.json');
    const areaData = await response.json();

    adventurersForArea = areaData[superRegion] || [];
  } catch (error) {
    console.error('Error loading adventurers by area:', error);
    return randomAdventurersArray;
  }

  while (randomAdventurersArray.length < adventurerFoesGroupSize && adventurersBatch.length > 0) {
    // Filter adventurers that match the region data
    const eligibleAdventurers = adventurersBatch.filter(adv =>
      adventurersForArea.includes(adv.Title)
    );

    if (eligibleAdventurers.length === 0) break;

    // Calculate the total weight
    const totalWeight = eligibleAdventurers.reduce((sum, adv) => {
      const rarityChance = BASE_RARITY_CHANCE[adv.BaseRarity] || 0;
      return sum + rarityChance;
    }, 0);

    // Generate a random number to pick an adventurer based on weight
    const randomValue = Math.random() * totalWeight;
    let cumulativeWeight = 0;
    let selectedAdventurerIndex = -1;

    for (let i = 0; i < eligibleAdventurers.length; i++) {
      const adventurer = eligibleAdventurers[i];
      cumulativeWeight += BASE_RARITY_CHANCE[adventurer.BaseRarity] || 0;
      if (randomValue <= cumulativeWeight) {
        selectedAdventurerIndex = adventurersBatch.indexOf(adventurer);
        break;
      }
    }

    if (selectedAdventurerIndex !== -1) {
      const selectedAdventurer = adventurersBatch[selectedAdventurerIndex];
      randomAdventurersArray.push(selectedAdventurer);

      selectedAdventurer.uID = Math.floor(Math.random() * 99999) + 1;
      adventurersBatch.splice(selectedAdventurerIndex, 1);
    } else {
      // Fallback in case no adventurer was selected
      break;
    }
  }

  return randomAdventurersArray;
}


















function displayRandomAdventurerGroup(group) {

  clearInterval(enemyAttackInterval);
  clearInterval(ourGroupAttackInterval);

  const regionArea = document.getElementById('content-region');
  const attackButton = document.createElement('button');
  attackButton.setAttribute("id", "attack-button");
  attackButton.disabled = false;
  attackButton.textContent = "Attack!"
  attackButton.style.display = "block";
  regionArea.append(attackButton);
  attackButton.addEventListener('click', attackEnemy);

  let totalHP = 0;
  let totalEnemyAttackValue = 0;
  let totalSpeed = 0;

  const enemyEvent = document.createElement('div');
  enemyEvent.classList.add('enemyEvent');

  const enemyAdvGroup = document.createElement('div');
  enemyAdvGroup.setAttribute("id", "enemyAdvGroup");
  enemyAdvGroup.classList.add('enemyAdvGroup');
  
  totalEnemyLife += calculateTotalEnemyLife(randomAdventurers);
  totalSpeed += calculateTotalEnemySpeed(randomAdventurers);
  const enemyDamage = calculateTotalEnemyAttack(randomAdventurers);
  const enemyResistances = calculateEnemyGroupResistances(randomAdventurers);
  const enemyHandResist = enemyResistances.groupHandResistance;
  const enemyRangedResist = enemyResistances.groupRangedResistance;

  const enemyGroupUnaDmg = enemyDamage.UnarmedDamage;
  const enemyGroupMelDmg = enemyDamage.MeleeDamage;
  const enemyGroupArcDmg = enemyDamage.ArcheryDamage;
  const enemyGroupGunDmg = enemyDamage.GunpowderDamage;
  const enemyGroupTotDmg = enemyDamage.totalDamage;



  for (const adventurer of randomAdventurers) {

    const adventurerPics = document.createElement('div');
    adventurerPics.classList.add('adventurerPics');
    adventurerPics.style.backgroundImage = `url('/Art/Adventurers/${adventurer.Title}.png')`;
    adventurerPics.setAttribute("title", `${adventurer.Title}`);
    

    adventurerPics.addEventListener("click", function (event) {
      displayAdventurerOptions(event, adventurer.Title, adventurer);
    });

    enemyEvent.appendChild(adventurerPics);
	  
    const adventurerInfo = document.createElement('div');
    adventurerInfo.textContent = `${adventurer.Title}`;
    adventurerInfo.classList.add("enemyAdvTitles")
	  adventurerPics.appendChild(adventurerInfo);
	  adventurerInfo.classList.add('clickableAdvInfo');


	
	  const adventurerLife = document.createElement('div');
    adventurerLife.classList.add("enemyAdvHPText");
    adventurerLife.textContent = `(HP: ${adventurer.Life})`;
	  adventurerPics.appendChild(adventurerLife);
    
    enemyAdvGroup.appendChild(adventurerPics);
    
    if (adventurer.Rarity === "Rare") {
      adventurerInfo.classList.add("rare")
    }
    if (adventurer.Rarity === "Legendary") {
      adventurerInfo.classList.add("legendary")
    }
    enemyAdventurersGroup.set(adventurer.Title, adventurer);
  }
  


  enemyEvent.appendChild(enemyAdvGroup);

  

  console.log(`Enemy group map:`, enemyAdventurersGroup);

// ========= display Enemy Infos:

  const EnemyLifeInfo = document.createElement('div');
  EnemyLifeInfo.classList.add('EnemyLifeInfo');

  const totalHPElement = document.createElement('span');
  totalHPElement.setAttribute("id", "enemyHP");
  totalHPElement.textContent = `HP: ${totalEnemyLife}/${enemyCurrentLife}`;

  const enemyLifeBar = document.createElement('div');
  enemyLifeBar.setAttribute("id", "enemyLifeBar");

  EnemyLifeInfo.appendChild(enemyLifeBar);
  EnemyLifeInfo.appendChild(totalHPElement);

  const totalEnemyAttackValueElement = document.createElement('div');
  totalEnemyAttackValueElement.classList.add('totalEnemyAttackValue');
  totalEnemyAttackValueElement.textContent = `Damage: ${enemyGroupTotDmg}`;
  enemyEvent.insertBefore(totalEnemyAttackValueElement, enemyEvent.firstChild);

  const totalSpeedElement = document.createElement('div');
  totalSpeedElement.classList.add('totalSpeed');
  totalSpeedElement.textContent = `Speed: ${totalSpeed}`;
  enemyEvent.insertBefore(totalSpeedElement, enemyEvent.firstChild);

// ========= display Enemy Resistances Infos:

const EnemyResistancesInfo = document.createElement('div');
EnemyResistancesInfo.setAttribute('id', 'EnemyResistancesInfoBox');

const EnemyHandResistance = document.createElement('div');
EnemyHandResistance.setAttribute('id', 'EnemyHandResistance');

const EnemyRangedResistance = document.createElement('div');
EnemyRangedResistance.setAttribute('id', 'EnemyRangedResistance');

EnemyResistancesInfo.appendChild(EnemyHandResistance);
EnemyResistancesInfo.appendChild(EnemyRangedResistance);

EnemyHandResistance.textContent = `Hand Resistance: ${enemyHandResist}`;
EnemyRangedResistance.textContent = `Ranged Resistance: ${enemyRangedResist}`;

enemyEvent.appendChild(EnemyResistancesInfo);

// ========= display Enemy Damage Types:

  const EnemyAttackInfo = document.createElement('div');
  EnemyAttackInfo.setAttribute('id', 'EnemyAttackInfoBox');

  const EnemyUnarmedDamage = document.createElement('div');
  EnemyUnarmedDamage.setAttribute('id', 'EnemyUnarmedDamage');

  const EnemyMeleeDamage = document.createElement('div');
  EnemyMeleeDamage.setAttribute('id', 'EnemyMeleeDamage');

  const EnemyArcheryDamage = document.createElement('div');
  EnemyArcheryDamage.setAttribute('id', 'EnemyArcheryDamage');

  const EnemyGunpowderDamage = document.createElement('div');
  EnemyGunpowderDamage.setAttribute('id', 'EnemyGunpowderDamage');

  const EnemyTotalDamage = document.createElement('div');
  EnemyTotalDamage.setAttribute('id', 'EnemyTotalDamage');

  EnemyAttackInfo.appendChild(EnemyUnarmedDamage);
  EnemyAttackInfo.appendChild(EnemyMeleeDamage);
  EnemyAttackInfo.appendChild(EnemyArcheryDamage);
  EnemyAttackInfo.appendChild(EnemyGunpowderDamage);
  EnemyAttackInfo.appendChild(EnemyTotalDamage);

  EnemyUnarmedDamage.textContent = `Unarmed: ${enemyGroupUnaDmg}`;
  EnemyMeleeDamage.textContent = `Melee: ${enemyGroupMelDmg}`;
  EnemyArcheryDamage.textContent = `Archery: ${enemyGroupArcDmg}`;
  EnemyGunpowderDamage.textContent = `Gunpowder: ${enemyGroupGunDmg}`;
  EnemyTotalDamage.textContent = `TOTAL: ${enemyGroupTotDmg}`;

  enemyEvent.appendChild(EnemyAttackInfo);



  // ========= display Enemy Damage Life Bar:

  enemyEvent.insertBefore(EnemyLifeInfo, enemyEvent.firstChild);

  const enemyGroupClassTitle = document.createElement('div');
enemyGroupClassTitle.classList.add('enemy-group-class-title');
const enemyGroupClassText = generateCustomGroupClass(randomAdventurers);
enemyEvent.insertBefore(enemyGroupClassTitle, enemyEvent.firstChild);

if (randomAdventurers.length === 1) {
  enemyGroupClassTitle.textContent = "Lone Adventurer";
} else {
  enemyGroupClassTitle.textContent = enemyGroupClassText.toString();
}

if (adventurerFoesGroupSize > 1) {
	displayMessage(`A group of ${adventurerFoesGroupSize} demented adventurers want to attack us!`, 'magenta');
  } else {
	displayMessage(`A demented adventurer attacks us!`, 'magenta');
  }


	const popupEvent = document.getElementById('popupEvent');
  popupEvent.appendChild(enemyEvent);

  updateEnemyCurrentLifeDisplay();

  const adventurerPics = document.getElementsByClassName("adventurerPics")
  displayElementsWithDelay(adventurerPics);
}

function displayElementsWithDelay(adventurerPics) {
  for (let i = 0; i < adventurerPics.length; i++) {
    adventurerPics[i].style.animation = `enemyAppears ease ${(i+1)*0.4}s 1`;
}
setTimeout(() => {
for (let i = 0; i < adventurerPics.length; i++) {
  adventurerPics[i].style.animation = "moveupdown ease 2s infinite";
}
}, 1500);
}

// ========================================== ENEMY GROUP LIFE ==========================================

function calculateTotalEnemyLife(adventurers) {
  totalEnemyLife = 0;
  for (const adventurer of adventurers) {
    totalEnemyLife += Number(adventurer.Life) || 0;
  }
  enemyCurrentLife = totalEnemyLife;
  return totalEnemyLife;
}

// ========================================== ENEMY GROUP RESISTANCES ==========================================

function calculateEnemyGroupResistances(adventurers) {
  let totalRangedResist = 0;
  let totalHandResist = 0;

  for (const adventurer of adventurers) {
    totalRangedResist += parseInt(adventurer.RangedResist) || 0;
    totalHandResist += parseInt(adventurer.HandResist) || 0;
  }

  const groupSize = adventurers.length;
  const groupRangedResistance = Math.round(totalRangedResist / groupSize);
  const groupHandResistance = Math.round(totalHandResist / groupSize);

  return { groupRangedResistance, groupHandResistance };
}

// ========================================== ENEMY GROUP ATTACK VALUES ==========================================

function calculateTotalEnemyAttack(adventurers) {
  const damageValues = {
    GunpowderDamage: 0,
    ArcheryDamage: 0,
    MeleeDamage: 0,
    UnarmedDamage: 0,
  };

  let totalDamage = 0;

  for (const adventurer of adventurers) {
    const specialties = adventurer.Specialty.split(',').map(specialty => specialty.trim());
    const numSpecialties = specialties.length;
    const attackPoints = parseInt(adventurer.Attack) || 0;

    // Distribute attack points based on specialties
    if (numSpecialties === 0) {
      // No specialties, add attack points to UnarmedDamage
      damageValues.UnarmedDamage += attackPoints;
      totalDamage += attackPoints;
    } else {
      // Divide attack points equally among the corresponding damage values
      const attackPerSpecialty = Math.floor(attackPoints / numSpecialties);
      specialties.forEach(specialty => {
        switch (specialty) {
          case 'Gunpowder':
            damageValues.GunpowderDamage += attackPerSpecialty;
            totalDamage += attackPerSpecialty;
            break;
          case 'Archery':
            damageValues.ArcheryDamage += attackPerSpecialty;
            totalDamage += attackPerSpecialty;
            break;
          case 'Melee':
            damageValues.MeleeDamage += attackPerSpecialty;
            totalDamage += attackPerSpecialty;
            break;
          case 'Unarmed':
            damageValues.UnarmedDamage += attackPerSpecialty;
            totalDamage += attackPerSpecialty;
            break;
          case 'Polyfighter':
            // Polyfighter contributes to all damage values
            damageValues.GunpowderDamage += attackPerSpecialty;
            damageValues.ArcheryDamage += attackPerSpecialty;
            damageValues.MeleeDamage += attackPerSpecialty;
            damageValues.UnarmedDamage += attackPerSpecialty;
            totalDamage += attackPerSpecialty * 4; // Polyfighter contributes to all 4 damage values
            break;
          default:
            // For any unknown specialties, add attack points to UnarmedDamage
            damageValues.UnarmedDamage += attackPerSpecialty;
            totalDamage += attackPerSpecialty;
            break;
        }
      });
    }
  }

  return { ...damageValues, totalDamage };
}

// ========================================== ENEMY GROUP SPEED ==========================================

function calculateTotalEnemySpeed(adventurers) {
  let totalSpeed = Infinity;

  for (const adventurer of adventurers) {
    if (adventurer.Speed < totalSpeed) {
      totalSpeed = adventurer.Speed;
    }
  }
  return totalSpeed;
}











let enemyAttackInterval;
let ourGroupAttackInterval;
let attackTimeouts = {};
function attackEnemy() {
  isCombatAftermath = false;
  isInCombat = true;
  const attackButton = document.getElementById('attack-button');
  attackButton.remove();

  displayMessage(`The battle begins!`, 'white');
  const audio = new Audio("");
  audio.volume = 0.2;
  audio.play();



  const adventurerPics = document.getElementsByClassName("adventurerPics")

  
  if (isInCombat === true) {
    displayMessage(`We are in combat.`, 'violet');

        // Clear previously scheduled attacks before starting a new combat
        clearAttackTimeouts();

  // Call enemy group attack and our group attack at intervals

    ourGroupAttackLoop();
    enemyGroupAttack();
    
  } else {
    isInCombat = false;
    enemyCurrentLife = 0;
  }
}    

function clearAttackTimeouts() {
  for (const key in attackTimeouts) {
    clearTimeout(attackTimeouts[key]);
  }
  attackTimeouts = {};
}

// ========= OUR GROUP'S ATTACK LOOP =============

function ourGroupAttackLoop() {
  const ourGroup = Array.from(groupAdventurers.values());

  // Start the attack for each adventurer
  ourGroup.forEach((adventurer) => {
    const baseDelay = 1000; // 1 second base delay
    const speedMultiplier = 40; // Adjust this value to control the attack speed
    const attackDelay = baseDelay - adventurer.Speed * speedMultiplier;
    // Schedule the next attack for this adventurer
    const timeoutId = setTimeout(() => attackAdventurer(adventurer), attackDelay);
    attackTimeouts[adventurer.uID] = timeoutId; // Use uID as the key
  });
}

function attackAdventurer(adventurer) {
  const adventurerUID = CSS.escape(adventurer.uID); // Use uID instead of Title
  const adventurerAttack = adventurer.Attack; // Assuming Attack is a numeric value
  const adventurerElement = document.querySelector(`[uid="${adventurerUID}"]`); // Use uid attribute
  const adventurerSpecialty = adventurer.Specialty;

  if (isInCombat !== false && adventurerAttack !== 0 && adventurerElement && adventurerSpecialty !== "Non-fighting" && enemyCurrentLife !== 0) {
    const isEnemy = false;
    preAttackAnimation(adventurer.uID, adventurerElement, isEnemy); // Pass uID instead of Title
    // Perform the actual attack logic here
    // You might want to update enemyCurrentLife or perform other attack-related actions
  }

  // Calculate the next attack delay for this adventurer
  const baseDelay = 4000; // 1 second base delay
  const speedMultiplier = 40; // Adjust this value to control the attack speed
  const attackDelay = baseDelay - adventurer.Speed * speedMultiplier;

  // Schedule the next attack for this adventurer
  const timeoutId = setTimeout(() => attackAdventurer(adventurer), attackDelay);
  attackTimeouts[adventurer.uID] = timeoutId; // Use uID as the key
}





function addAdventurerEventListeners() {
  
  const groupAdventurers = Array.from(adventurerMap.values());
  // Call the attackAnimation function and pass all group adventurers
  groupAdventurers.forEach(adventurer => {
    const adventurerTitle = CSS.escape(adventurer.Title);
    const adventurerAttack = CSS.escape(adventurer.Attack);
    const adventurerSpecialty = CSS.escape(adventurer.Specialty);
    const adventurerElement = document.querySelector(`[title="${adventurerTitle}"]`);
    if (adventurerElement && adventurerAttack != 0 && adventurerSpecialty != "Non-fighting" && enemyCurrentLife != 0) {
      const adventurerEventListener = event => {
        preAttackAnimation(adventurer.Title, event);
      };
      adventurerElement.addEventListener("click", adventurerEventListener);
      adventurerEventListeners.push({ element: adventurerElement, listener: adventurerEventListener });
    }
  });
}

function removeAdventurerEventListeners() {
  adventurerEventListeners.forEach(({ element, listener }) => {
    element.removeEventListener("click", listener);
  });
  adventurerEventListeners = [];
}


// ========= THE ENEMY'S ATTACK LOOP =============

function enemyGroupAttack() {
  const enemyAdventurers = Array.from(enemyAdventurersGroup.values());
  // Start the attack for each adventurer
  enemyAdventurers.forEach((key) => {

    const baseDelay = 1000; // 1 second base delay
    const speedMultiplier = 40; // Adjust this value to control the attack speed
    const attackDelay = baseDelay - key.Speed * speedMultiplier;
    const adventurerTitle = CSS.escape(key.Title);
    // Schedule the next attack for this adventurer
    const timeoutId = setTimeout(() => attackAdventurerEnemies(key), attackDelay);
    attackTimeouts[adventurerTitle] = timeoutId;
  });

}

function attackAdventurerEnemies(adventurer) {
  const adventurerTitle = CSS.escape(adventurer.Title);
  const adventurerAttack = CSS.escape(adventurer.Attack);
  const adventurerElement = document.querySelector(`[title="${adventurerTitle}"]`);
  const lifeCircleGroup = document.getElementById('life-circle');
  const adventurerSpecialty = CSS.escape(adventurer.Specialty);
  if (isInCombat != false && adventurerAttack != "0" && adventurerElement && adventurerSpecialty != "Non-fighting" && enemyCurrentLife != 0) {
    const isEnemy = true;
    preAttackAnimationEnemy(adventurer.Title, adventurerElement, lifeCircleGroup, isEnemy);
    adventurerElement.style.animation = "moveupdown ease 2s infinite";
  }

  // Calculate the next attack delay for this adventurer
  const baseDelay = 4000; // 1 second base delay
  const speedMultiplier = 40; // Adjust this value to control the attack speed
  const attackDelay = baseDelay - adventurer.Speed * speedMultiplier;
  
  // Schedule the next attack for this adventurer
  const timeoutId = setTimeout(() => attackAdventurerEnemies(adventurer), attackDelay);
  attackTimeouts[adventurerTitle] = timeoutId;
  
}


function critCheck () {
  const critChance = calculateCriticalChance();
  const critTest = Math.floor(Math.random() * 100);
  let isCrit = false;
  if (critTest <= critChance) {
    isCrit = true;
    const documentPage = document.getElementById("enemyAdvGroup");
    documentPage.style.animation = "screenShake 0.1s 1";
    return isCrit;
  } else {
    isCrit = false;
    const documentPage = document.getElementById("enemyAdvGroup");
    documentPage.style.animation = "";
    return isCrit;
  }
}


let enemyLifeBarAnimationInterval;


function reduceEnemyCurrentLife(damage, damageType, targetElement) {
  const decreaseRate = 1;
  const totalFrames = 1;


  // Calculate the damage values based on the group's adventurers and specialties

  // Get the enemy group's resistances
  const { groupRangedResistance, groupHandResistance } = calculateEnemyGroupResistances(adventurers);

  // Calculate the total damage reduced by resistances for each damage type
  const reducedUnarmedDamage = Math.round(damage * (100 - groupHandResistance) / 100);
  const reducedMeleeDamage = Math.round(damage * (100 - groupHandResistance) / 100);
  const reducedArcheryDamage = Math.round(damage * (100 - groupRangedResistance) / 100);
  const reducedGunpowderDamage = Math.round(damage * (100 - groupRangedResistance) / 100);
  let reducedDamage;
  if (damageType === unarmed) {
    reducedDamage = reducedUnarmedDamage;
  } else if (damageType === melee) {
    reducedDamage = reducedMeleeDamage;
  } else if (damageType === archery) {
    reducedDamage = reducedArcheryDamage;
  } else if (damageType === gunpowder) {
    reducedDamage = reducedGunpowderDamage;
  }
  // Calculate the total damage to the enemy group considering resistances
  const damageModifier = sparingDamageModifier(sparedEnemyAdventurers);
  let totalDamageToEnemy = Math.round(reducedDamage * damageModifier);

  const isCrit = critCheck();

  if (isCrit === true) {
    totalDamageToEnemy = Math.round(totalDamageToEnemy * 1.5);
  } else {
    totalDamageToEnemy *= 1;
  }



  // Make sure the enemyCurrentLife won't go below 0
  const finalLife = Math.max(0, enemyCurrentLife - totalDamageToEnemy);
  // Get all adventurers in the group
  

  let decreaseAmount = Math.ceil(totalDamageToEnemy);

  damageDisplayNumber(totalDamageToEnemy, isCrit, damageType);

  const enemyLifeBar = document.getElementById("enemyLifeBar");


    if (enemyCurrentLife > finalLife) {
      // Reduce the enemy's current life by the decrease amount
      enemyCurrentLife -= decreaseAmount;
      enemyLifeBar.style.animation = "lifebardamage 0.2s 2";
      
    } else {
      // Stop the animation when the final life is reached
      enemyCurrentLife = finalLife;
      enemyLifeBar.style.animation = "";
    }
    if (enemyCurrentLife <= 0) {
      enemyCurrentLife = 0;

      // Perform actions for defeating the enemy group (e.g., reward, victory message, etc.)
    }
    // Update the enemy life bar display
    updateEnemyCurrentLifeDisplay();
}



function reduceGroupCurrentLife (damage, damageType) {
  const groupResistances = getGroupResistances();
  const groupHandResist = groupResistances.groupHandResistance;
  const groupRangedResist = groupResistances.groupRangedResistance;

  // Calculate the total damage reduced by resistances for each damage type
  const reducedUnarmedDamage = Math.round(damage * (100 - groupHandResist) / 100);
  const reducedMeleeDamage = Math.round(damage * (100 - groupHandResist) / 100);
  const reducedArcheryDamage = Math.round(damage * (100 - groupRangedResist) / 100);
  const reducedGunpowderDamage = Math.round(damage * (100 - groupRangedResist) / 100);
  let reducedDamage;
  if (damageType === unarmed) {
    reducedDamage = reducedUnarmedDamage;
  } else if (damageType === melee) {
    reducedDamage = reducedMeleeDamage;
  } else if (damageType === archery) {
    reducedDamage = reducedArcheryDamage;
  } else if (damageType === gunpowder) {
    reducedDamage = reducedGunpowderDamage;
  }

  const damageModifier = sparingDamageModifier(sparedEnemyAdventurers);

  const totalDamageToUs = Math.round(reducedDamage * damageModifier);

  calculateCurrentLife(-totalDamageToUs);
  damageDisplayNumberToUs(totalDamageToUs);
  updateCurrentLifeDisplay();
}






function updateEnemyCurrentLifeDisplay() {
    // Check if enemyCurrentLife is NaN, and if so, set it to 0
    if (isNaN(enemyCurrentLife)) {
      enemyCurrentLife = 0;
    } else {
  const totalHPElement = document.getElementById("enemyHP");
  totalHPElement.textContent = `HP: ${enemyCurrentLife}/${totalEnemyLife}`;
  updateEnemyLifeBar();
    }
}

function updateEnemyLifeBar() {
  const enemyLifeBar = document.getElementById("enemyLifeBar");
  
  // Reset the animation by setting it to 'none'
  enemyLifeBar.style.animation = 'none';
  
  // Trigger a reflow before setting the animation back to its original value
  void enemyLifeBar.offsetWidth;
  
  enemyLifeBar.style.animation = "lifebardamage 0.1s 2";

  const percentage = enemyCurrentLife / totalEnemyLife;
  enemyLifeBar.style.width = `${percentage * 100}%`;
  const enemyLifeBarWidth = enemyLifeBar.offsetWidth;
  if (enemyLifeBarWidth < 1) {
    enemyLifeBar.style.border = '0px';
  }
  if (enemyCurrentLife <= 0) {
    endCombat();
  }
}


































function endCombat(){
  
  displayMessage(`The enemy group is defeated.`, '#fff');
  isInCombat = false;
  isCombatAftermath = true;
  
  const popupEvent = document.getElementById('popupEvent');
  const regionArea = document.getElementById("content-region");
  const enemyBoxes = Array.from(document.getElementsByClassName('adventurerPics'));
  checkSparedResult();
  enemyBoxes.forEach(box => {
    box.style.top = "10px";
    box.style.animation = "";
    displaySparedResult(box);
  });


  
  clearInterval(enemyAttackInterval);
  clearInterval(ourGroupAttackInterval);

enemyGroupSpeed = 0;
totalEnemyLife = 0;
enemyCurrentLife = 0;
totalEnemyAttackValue = 0;
totalSpeed = 0;

const onCooldownEffects = Array.from(document.getElementsByClassName('on-cooldown'));
if (onCooldownEffects) {
onCooldownEffects.forEach(box => {
  box.remove();
});
}

const onCooldownEffectsEnemy = Array.from(document.getElementsByClassName('on-cooldown-enemy'));
if (onCooldownEffectsEnemy) {
onCooldownEffectsEnemy.forEach(box => {
  box.remove();
});
}

  const closebutton = document.createElement("button");
  closebutton.setAttribute('id', 'close-button-event');
  closebutton.style.zIndex = "20";
  closebutton.textContent = "Close"
  popupEvent.appendChild(closebutton);
  closebutton.addEventListener("click", function () {
    closePopupEvent(popupEvent);
  });
}

function closePopupEvent(element) {
  const closebutton = document.getElementById("close-button-event");
  element.removeChild(closebutton);
  const regionArea = document.getElementById("content-region");
  regionArea.removeChild(element);
  isInCombat = false;
  sparedEnemyAdventurers = {};
  enemyAdventurersGroup.clear();
  console.log('Enemy group map:', enemyAdventurersGroup);
  isCombatAftermath = false;
  isInEvent = false;
  totalEnemyLife = 0;
}


