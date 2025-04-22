// ============ GLOBAL ADVENTURERS STATS MULTIPLIERS ===============
let ATTACK_BONUS = 0.6;
let cachedSkillSlots = [];


const attributeMap = {
  Strength: {
    default: "Sturdy",
    Education: "Mighty",
    Dexterity: "Athletic",
    Cunning: "Charismatic",
    Artisanship: "Seasoned"
  },
  Dexterity: {
    default: "Nimble",
    Strength: "Athletic",
    Cunning: "Deft",
    Artisanship: "Habile",
    Education: "Skilled"
  },
  Cunning: {
    default: "Sly",
    Strength: "Charismatic",
    Dexterity: "Deft",
    Artisanship: "Artful",
    Education: "Astute"
  },
  Artisanship: {
    default: "Competent",
    Strength: "Seasoned",
    Dexterity: "Habile",
    Cunning: "Artful",
    Education: "Ingenious"
  },
  Education: {
    default: "Erudite",
    Strength: "Mighty",
    Dexterity: "Skilled",
    Cunning: "Astute",
    Artisanship: "Ingenious"
  }
};


function randomizeAdvCulture(adventurer) {

    function getRandomAdventurer() {
      return adventurers[Math.floor(Math.random() * adventurers.length)];
    }
    let randomAdventurer = getRandomAdventurer();
    let cultures = randomAdventurer.Culture.includes(',') 
    ? randomAdventurer.Culture.split(',').map(c => c.trim()) 
    : [randomAdventurer.Culture];
    const randomCulture = cultures[Math.floor(Math.random() * cultures.length)];
    adventurer.Cultures[0] = randomCulture;
    adventurer.Culture = randomCulture;

}


function multiplyStatsByRarity(adventurer) {

  const rarityMultiplier = getRarityMultiplier(adventurer.Rarity);
  const randomness = Math.floor(Math.random() * 2) + 1;


  applyAdventurerTypeBonuses(adventurer, rarityMultiplier);

  setAdventurerRange(adventurer);

  setAdventurerMainAttribute(adventurer);

  distributeRandomPoints(adventurer);
  
  adventurer.RangedResist = Math.round(adventurer.Attributes.Dexterity);
  adventurer.HandResist = Math.round(adventurer.Attributes.Strength);


  const advStr = adventurer.Attributes.Strength;
  adventurer.Life = (advStr * 2) + 10;
  if (isNaN(adventurer.Life)) {
    adventurer.Life = Math.round(adventurer.Life);
  }
  adventurer.MaxLife = adventurer.Life;

  adventurer.Speed = Math.round(((2 + randomness + (adventurer.Attributes.Dexterity / 2)) * rarityMultiplier));

  if (adventurer.Mounted === 'Mounted') {
    adventurer.Speed = adventurer.Speed + 4;
  }

  const advTypes = adventurer.Type.split(',').map(type => type.trim());
  if (advTypes.includes("Intellectual") || advTypes.includes("Religious")) {
    adventurer.Speed = adventurer.Speed - 1;
  }

  adventurer.Level = 1;

  adventurer.totalAttributes = calculateIndividualAttributesTotal(adventurer);

  adventurer.upkeep = Math.round(adventurer.upkeep + (adventurer.totalAttributes / 3));

  if (adventurer.Equipment.Weapon != null) {
      randomizeWeaponQuality(adventurer.Equipment.Weapon);
      adventurer.Equipment.Weapon.iID = Math.floor(Math.random() * 9999);
      adventurer.Attack = calculateAdventurerAttackPoints(adventurer);
  }

  
  

}


function calculateAdventurerAttackPoints(adventurer) {
  const weapon = adventurer.Equipment.Weapon;

  const attributes = ["Strength", "Dexterity", "Cunning", "Education"];
  const dagger = [0, 3, 1, 0];
  const sword = [2, 1, 0, 0];
  const polearm = [3, 1, 0, 0];
  const axe = [4, 0, 0, 0];
  const handgun = [0, 2, 2, 0];
  const longgun = [1, 1, 2, 0];
  const bow = [1, 1, 1, 1];
  const crossbow = [2, 2, 0, 0];

  if (!weapon || !weapon.category) {
    adventurer.Attack = 0;
    return 0;
  }

  const weaponWeights = {
    dagger,
    sword,
    polearm,
    axe,
    handgun,
    longgun,
    bow,
    crossbow
  };

  const weights = weaponWeights[weapon.category.toLowerCase()];
  if (!weights) {
    adventurer.Attack = 0;
    return;
  }

  let attackPoints = weapon.baseDmg || 0;

  attributes.forEach((attribute, index) => {
    attackPoints += adventurer.Attributes[attribute] * weights[index];
  });

  attackPoints = Math.round((attackPoints / 4) + weapon.baseDmg);

  if (adventurer.Equipment.Weapon === null) {
    attackPoints = 0;
  }

  return attackPoints || 0;
}



function setAdventurerSkillSlots(adv) {
  // Initialize the Slots array
  adv.Slots = [];
  
  // Get the number of types the adventurer has
  const typesCount = adv.Types.length;
  
  // If the adventurer has only one type, create two slots of that type
  if (typesCount === 1) {
      adv.Slots.push({ type: adv.Types[0], status: 'empty' });
      adv.Slots.push({ type: adv.Types[0], status: 'empty' });
  } else {
      // If the adventurer has more than one type, create one slot for each type
      adv.Types.forEach(type => {
          adv.Slots.push({ type: type, status: 'empty' });
      });
  }
}

function displayAdventurerSkillSlots(adventurer, target, fromALT) {

  if (!target.classList.contains('item')) {
      return;
  }

  // Remove existing overlays
  let exOverlay = target.querySelector('.adv-skill-slots-overlay');
  if (exOverlay) {
      exOverlay.remove();
      //cachedSkillSlots = [];
  }
  let exOverlayAll = document.querySelector('.adv-skill-slots-overlay');
  if (exOverlayAll && fromALT != true) {
      exOverlayAll.remove();
      //cachedSkillSlots = [];
  }

  // Create a new overlay
  const overlay = document.createElement('div');
  overlay.classList.add('adv-skill-slots-overlay');
  let number = 0;

  // Loop through each slot in adventurer.Slots
  adventurer.Slots.forEach(slot => {
      // Create a skill-slot element
      const skillSlot = document.createElement('div');
      skillSlot.classList.add('skill-slot', slot.type, slot.status);
      skillSlot.setAttribute('type', `${slot.type}`);
      skillSlot.setAttribute('number', `${number}`);
      number++;

      // Append the skill-slot to the overlay
      overlay.appendChild(skillSlot);

      //cachedSkillSlots.push(skillSlot);


      skillSlot.addEventListener('dragover', dragOverSkill);
      skillSlot.addEventListener('drop', dropSkill);
  });

  // Append the adv-skill-slots-overlay to the target element
  target.appendChild(overlay);

  // Add skills to the corresponding slots


}






function setAdventurerPrice(a) {
  
let rarityValue = 1
if (a.Rarity === 'Legendary') {
  rarityValue = 1.5;
} else if (a.Rarity === 'Rare') {
  rarityValue = 1.35;
} else if (a.Rarity === 'Uncommon') {
  rarityValue = 1.2;
} else if (a.Rarity === 'Normal') {
  rarityValue = 1;
}

  let attrSum = Math.round(((a.Attributes.Strength + a.Attributes.Cunning + a.Attributes.Artisanship + a.Attributes.Education) / 4));

  let price = Math.round(((((attrSum + a.Speed + (a.Slots.length * 2))) * (getRarityMultiplier(a.BaseRarity) * (a.Level / 2))) * rarityValue) / 1.5);

  const types = a.Type.split(',').map(type => type.trim());

  if (types.includes('Slave')) {
    price = Math.round(price / 2);
  }
  if (types.includes('Commoner')) {
    price = Math.round(price / 1.5);
  }
  if (types.includes('Noble')) {
    price = Math.round(price * 1.2);
  }

  if(types.length === 2) {
    price = Math.round(price * 1.1);
  }

  return price;
}




function getAttributeCombination(attributes) {
  if (!attributes.length) return null;

  if (attributes.length === 1) {
    return attributeMap[attributes[0]]?.default || null;
  }

  const [attr1, attr2] = attributes;
  return attributeMap[attr1]?.[attr2] || attributeMap[attr2]?.[attr1] || attributeMap[attr1]?.default || null;
}




function setAdventurerMainAttribute(adventurer) {
  const types = adventurer.Type.split(',').map(type => type.trim());
  const mainType = types;
  let mainAttrs = [];
  let upkeep = 1;

  if (mainType.includes('Slave')) {
    const possibleAttributes = ['Cunning', 'Strength', 'Artisanship'];
    const randomAttribute = possibleAttributes[Math.floor(Math.random() * possibleAttributes.length)];
    mainAttrs.push(randomAttribute);
  }
  if (mainType.includes('Outlaw')) {
    const possibleAttributes = ['Cunning', 'Dexterity'];
    const randomAttribute = possibleAttributes[Math.floor(Math.random() * possibleAttributes.length)];
    mainAttrs.push(randomAttribute);
    upkeep = upkeep + 1;
  }
  if (mainType.includes('Soldier')) {
    mainAttrs.push('Strength');
    upkeep = upkeep + 2;
  }
  if (mainType.includes('Explorer')) {
    const possibleAttributes = ['Strength', 'Dexterity', 'Education', 'Artisanship', 'Cunning'];
    const randomAttribute = possibleAttributes[Math.floor(Math.random() * possibleAttributes.length)];
    mainAttrs.push(randomAttribute);
    upkeep = upkeep + 1;
  }
  if (mainType.includes('Noble')) {
    const possibleAttributes = ['Education', 'Cunning'];
    const randomAttribute = possibleAttributes[Math.floor(Math.random() * possibleAttributes.length)];
    mainAttrs.push(randomAttribute);
    upkeep = upkeep + 3;
}
  if (mainType.includes('Intellectual')) {
    mainAttrs.push('Education');
    upkeep = upkeep + 2;
  }
  if (mainType.includes('Religious')) {
    const possibleAttributes = ['Education', 'Artisanship'];
    const randomAttribute = possibleAttributes[Math.floor(Math.random() * possibleAttributes.length)];
    mainAttrs.push(randomAttribute);
    upkeep = 2;
  }
  if (mainType.includes('Commoner')) {
    mainAttrs.push('Artisanship');
    upkeep = 1;
  }

  adventurer.mainAttr = mainAttrs;

  function removeDuplicates(array) {
    return array.filter((item, index) => array.indexOf(item) === index);
  }

    if (mainAttrs.length > 2) {
        // Remove duplicates
        mainAttrs = removeDuplicates(mainAttrs);
        
        // If still more than 2, remove extra attributes
        while (mainAttrs.length > 2) {
            // Remove a random attribute
            mainAttrs.splice(Math.floor(Math.random() * mainAttrs.length), 1);
        }
    }

// Assign to adventurer.mainAttr
adventurer.mainAttr = mainAttrs;

adventurer.prefix = getAttributeCombination(mainAttrs);


let rarityValue = 1
if (adventurer.Rarity === 'Legendary') {
  rarityValue = 1.5;
} else if (adventurer.Rarity === 'Rare') {
  rarityValue = 1.35;
} else if (adventurer.Rarity === 'Uncommon') {
  rarityValue = 1.2;
} else if (adventurer.Rarity === 'Normal') {
  rarityValue = 1;
}


  adventurer.upkeep = Math.round(upkeep * (rarityValue * 2));
}



function setAdventurerRange(adventurer) {

  const specialties = adventurer.Specialty.split(',').map(s => s.trim());
  
  if (specialties.includes('Archery')) {
    adventurer.Range = 7;
  }

  if (specialties.includes('Melee')) {
    adventurer.Range = 1;
  }

  if (specialties.includes('Unarmed')) {
    adventurer.Range = 1;
  }

  if (specialties.includes('Gunpowder')) {
    adventurer.Range = 7;
  }

  if (specialties.includes('Non-fighting')) {
    adventurer.Range = 1;
  }
}

function setAdvLevel(adventurer, randomness) {
  let numberToLevel = Math.round(1 + randomness);

  for (let i = 0 ; i < numberToLevel ; i++) {
    levelUpAdventurer(adventurer);
  }
}

function applyAdventurerTypeBonuses(adventurer, rarityMultiplier) {
  adventurer.Attributes.Strength = parseFloat(adventurer.Attributes.Strength) + 0;
  adventurer.Attributes.Cunning = parseFloat(adventurer.Attributes.Cunning) + 0;
  adventurer.Attributes.Artisanship = parseFloat(adventurer.Attributes.Artisanship) + 0;
  adventurer.Attributes.Education = parseFloat(adventurer.Attributes.Education) + 0;
  adventurer.Attributes.Dexterity = parseFloat(adventurer.Attributes.Dexterity) + 0;

  // Apply additional bonuses based on adventurer.Types
  if (adventurer.Type) {
    const types = adventurer.Type.split(',').map(type => type.trim());

    const typeBonuses = {
      'Soldier': { Strength: 6, Dexterity: 4 },
      'Outlaw': { Strength: 1, Dexterity: 4, Cunning: 5 },
      'Explorer': { Strength: 2, Dexterity: 2, Cunning: 2, Artisanship: 2, Education: 2 },
      'Commoner': { Strength: 2, Dexterity: 2, Artisanship: 6 },
      'Slave': { Strength: 1, Dexterity: 2, Cunning: 2, Artisanship: 3, Education: 1 },
      'Intellectual': { Cunning: 3, Artisanship: 1, Education: 6 },
      'Religious': { Strength: 1, Cunning: 1, Artisanship: 3, Education: 5 },
      'Noble': { Strength: 3, Cunning: 3, Education: 4 }
    };
    

    // Initialize bonuses
    let typeBonusesSum = {
      Strength: 0,
      Cunning: 0,
      Artisanship: 0,
      Education: 0,
      Dexterity: 0
    };

    types.forEach(type => {
      const typeBonus = typeBonuses[type];
      if (typeBonus) {
        Object.keys(typeBonus).forEach(attribute => {
          typeBonusesSum[attribute] += typeBonus[attribute];
        });
      }
    });

    // Distribute bonuses according to the rules
    if (types.length === 1) {
      Object.keys(typeBonusesSum).forEach(attribute => {
        adventurer.Attributes[attribute] += typeBonusesSum[attribute];
      });
    } else if (types.length === 2) {
      Object.keys(typeBonusesSum).forEach(attribute => {
        if (typeBonusesSum[attribute] > 4) {
          adventurer.Attributes[attribute] += 4;
        } else {
          adventurer.Attributes[attribute] += typeBonusesSum[attribute] / 2;
        }
      });
    }
  }

  // Ensure that the total bonus doesn't exceed +8 for each attribute
  Object.keys(adventurer.Attributes).forEach(attribute => {
    adventurer.Attributes[attribute] = Math.round((adventurer.Attributes[attribute] + 1 ) * rarityMultiplier);
  });


}


function distributeRandomPoints(adventurer, points = 4) {
  const attributes = Object.keys(adventurer.Attributes); // Get all attribute names

  for (let i = 0; i < points; i++) {
      const randomAttribute = attributes[Math.floor(Math.random() * attributes.length)];
      adventurer.Attributes[randomAttribute]++; // Increase a random attribute by 1
  }
}

function calculateIndividualAttributesTotal(adventurer) {
  return Object.values(adventurer.Attributes).reduce((sum, value) => sum + value, 0);
}



  
function getRarityMultiplier(rarity) {
    switch (rarity) {
      case "Legendary":
        return 1.2;
      case "Rare":
        return 1.1;
      case "Common":
      default:
        return 1;
    }
}

  
function newRarityMultiplier(rarity) {
  switch (rarity) {
    case "Legendary":
      return 2.5;
    case "Rare":
      return 1.75;
    case "Common":
    default:
      return 1;
  }
}





// Function to modify group attributes during the game
function modifyGroupAttribute(attribute, value) {
  groupAttributes[attribute] += value;
}

const attributesClass = document.getElementsByClassName('group-attributes-value');
for (let i = 0; i < attributesClass.length; i++) {
  const attribute = attributesClass[i].getAttribute('data-attribute'); // Get attribute name from data-attribute
  attributesClass[i].addEventListener("click", function () {
    modifyGroupAttribute(attribute, 1);
  });
}


let groupAttributes = {
  strength: 0,
  cunning: 0,
  artisanship: 0,
  education: 0,
  dexterity: 0
};

// STRENGTH INFLUENCE
let totalLife = 0;
let backpackSize = 10;
let strengthMeleeBonus = 0.25;
let strengthUnarmedBonus = 0.25;

// CUNNING INFLUENCE
let groupSpeed = 0;
let cunningCriticalBonus = 0.25;
let cunningArcheryBonus = 0.25;

// ARTISANSHIP INFLUENCE
let MAX_FATIGUE = 40; // = Endurance

// EDUCATION INFLUENCE
let DIPLOMACY = 0;
let educationDiplomacyBonus = 0.5;
let EXPERIENCE_BONUS = 0;

function calculateCriticalChance() {
  const baseCriticalChance = 0;
  const cunningPoints = groupAttributes.cunning || 0;

  // Calculate the critical chance with the bonus
  let bonusPercentage = cunningPoints * cunningCriticalBonus;
  let CRITICAL_CHANCE = parseInt(baseCriticalChance + bonusPercentage);

  return CRITICAL_CHANCE;
}




function damageCunningMulitplier() {
  const cunningMultiplier = (groupAttributes.cunning / 100) + 1;
  return cunningMultiplier;
}

function damageStrengthMulitplier() {
  const strengthMultiplier = (groupAttributes.strength / 100) + 1;
  return strengthMultiplier;
}


function getGroupCurrentAttack(group) {
    let groupCurrentAttack = 0;
    let archeryDamage = 0;
    let meleeDamage = 0;
    let unarmedDamage = 0;
    let gunpowderDamage = 0;
    let polyfighterCount = 0;




  
    for (const adventurer of group.values()) {
      const attack = parseInt(adventurer.Attack) || 0;
      const specialties = adventurer.Specialty.split(',').map(s => s.trim());
  
      if (specialties.includes('Archery')) {
        archeryDamage += parseInt(attack);
      }
  
      if (specialties.includes('Melee')) {
        meleeDamage += parseInt(attack);
      }
  
      if (specialties.includes('Unarmed')) {
        unarmedDamage += parseInt(attack);
      }
  
      if (specialties.includes('Gunpowder')) {
        gunpowderDamage += parseInt(attack);
      }
  
      if (specialties.includes('Polyfighter')) {
        polyfighterCount++;
      }
    }
  
    // Divide the Polyfighter's attack equally among all 4 damage types
    if (polyfighterCount > 0) {
      const polyfighterAttackContribution = Math.floor(
        (archeryDamage + meleeDamage + unarmedDamage + gunpowderDamage) / 4
      );
      archeryDamage += polyfighterAttackContribution;
      meleeDamage += polyfighterAttackContribution;
      unarmedDamage += polyfighterAttackContribution;
      gunpowderDamage += polyfighterAttackContribution;
    }
  
    groupCurrentAttack = archeryDamage + meleeDamage + unarmedDamage + gunpowderDamage;

    const combatStats = {
      totalDamage: groupCurrentAttack,
      unarmed: unarmedDamage,
      melee: meleeDamage,
      archery: archeryDamage,
      gunpowder: gunpowderDamage
    }
  
    return combatStats;
}

// ============ GROUP RESISTANCES =========

function getGroupResistances() {
    let totalRangedResistance = 0;
    let totalHandResistance = 0;
    const numAdventurers = groupAdventurers.size;
  
    for (const adventurer of groupAdventurers.values()) {
      totalRangedResistance += parseInt(adventurer.RangedResist) || 0;
      totalHandResistance += parseInt(adventurer.HandResist) || 0;
    }
  
    let groupRangedResistance = Math.floor(totalRangedResistance / numAdventurers);
    let groupHandResistance = Math.floor(totalHandResistance / numAdventurers);

    if (isNaN(groupRangedResistance)) {
      groupRangedResistance = 0;
    }
    if (isNaN(groupHandResistance)) {
      groupHandResistance = 0;
    }
  
    return {
      groupRangedResistance,
      groupHandResistance
    };
}

// ============ GROUP SPEED ===============

function calculateGroupSpeed(group) {
  let totalSpeed = 0;
  let count = 0;


  if (group) { //for other groups
    for (const adventurer of group.values()) {
      totalSpeed += adventurer.Speed;
      count++;
   }
 
  } else { //for our own group
    for (const adventurer of groupAdventurers.values()) {
      totalSpeed += adventurer.Speed;
      count++;
    }
  }

  if (count === 0) {
      return 0;
  }
  const averageSpeed = (totalSpeed / count) - (count / 2);
  return Math.round(averageSpeed);
}


// ============ GROUP LIFE ===============

function updateCurrentLifeDisplay() {
  let currentLife = 0;
  let totalLife = 0;

for (const [, adventurer] of groupAdventurers) {
      currentLife += Number(adventurer.Life) || 0;
      totalLife += Number(adventurer.MaxLife) || 0;
      updatePartyLeftSide(adventurer);
}

  const currentLifeSpan = document.getElementById('current-life');
  currentLifeSpan.textContent = currentLife.toString();
  const groupLife = document.getElementById('group-life');
  groupLife.textContent = totalLife.toString();

  const currentLifeSpan2 = document.getElementById('current-life2');
  currentLifeSpan2.textContent = currentLife.toString();

  const totalLifeCircle = document.getElementById('total-life-circle');
  totalLifeCircle.textContent = totalLife.toString();

  updateLifeCircle(currentLife, totalLife);

  const lifeBar = document.getElementById('grouplife-bar');
  lifeBar.max = totalLife;
  lifeBar.value = currentLife;

  lifeBar.setAttribute('value', currentLife);
}

function updateLifeCircle(currentLife, totalLife) {
  // Calculate the percentage of life remaining
  const percentage = currentLife / totalLife;

  // Get the element representing the filled portion of the circle
  const filledCircle = document.getElementById("filled-circle");

  // Set the width of the filled circle element to the percentage of life remaining
  filledCircle.style.height = `${percentage * 100}%`;
}



