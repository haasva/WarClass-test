let weaponsObject = [];

function fetchWeaponData() {
  return fetch('/JSONData/weapons.json')
    .then(response => response.json())
    .then(data => {
      weaponsObject = {};
      data.forEach(weapon => {
        weaponsObject[weapon.Title.toLowerCase()] = {
          name: weapon.Title.toLowerCase(),
          category: weapon.Type,
          unique: weapon.Unique,
          baseRarity: weapon.BaseRarity,
          specialty: weapon.Specialty,
          baseDmg: weapon.BaseDamage,
          baseCrit: weapon.BaseCritChance,
          quality: 'Common',
          culture: weapon.Culture
        };
      });
      console.log('Weapon data', weaponsObject);
      return weaponsObject;
    })
    .catch(error => {
      console.error('Error fetching weapons data:', error);
      throw error;
    });
}



function randomizeWeaponQuality(weapon) {
  const baseRarity = weapon.baseRarity;
  const qualities = ['Poor', 'Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

  const rarityWeights = {
    Common: [82, 10,	5, 2, 1, 0],
    Uncommon: [60, 20, 10, 6, 3, 1],
    Rare: [40, 30, 15, 8, 5, 2]
  };

  const weights = rarityWeights[baseRarity] || [82, 10,	5, 2, 1, 0]; // Default weights
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const randomWeight = Math.random() * totalWeight;

  let cumulativeWeight = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulativeWeight += weights[i];
    if (randomWeight <= cumulativeWeight) {
      weapon.quality = qualities[i];
      break;
    }
  }

  if (weapon.unique === true) {
    weapon.quality = 'Legendary';
  }

  const qualityMultiplier = {
    Poor: 0.75,
    Common: 1,
    Uncommon: 1.25,
    Rare: 1.5,
    Epic: 2,
    Legendary: 2.5
  };

  weapon.baseDmg = Math.round(weapon.baseDmg * qualityMultiplier[weapon.quality]);
}





function levelUpAdventurer(adv) {
  adv.Level = adv.Level + 1;

  // Pick one main attribute randomly if there are two
  let chosenMainAttr = adv.mainAttr.length === 1 ? adv.mainAttr[0] : adv.mainAttr[Math.floor(Math.random() * adv.mainAttr.length)];

  adv.Attributes.Strength = Math.round(adv.Attributes.Strength + (chosenMainAttr === 'Strength' ? 2 : 1));
  adv.Attributes.Cunning = Math.round(adv.Attributes.Cunning + (chosenMainAttr === 'Cunning' ? 2 : 1));
  adv.Attributes.Artisanship = Math.round(adv.Attributes.Artisanship + (chosenMainAttr === 'Artisanship' ? 2 : 1));
  adv.Attributes.Education = Math.round(adv.Attributes.Education + (chosenMainAttr === 'Education' ? 2 : 1));
  adv.Attributes.Dexterity = Math.round(adv.Attributes.Dexterity + (chosenMainAttr === 'Dexterity' ? 2 : 1));

  const lifePercentage = adv.Life / adv.MaxLife;
  const advStr = adv.Attributes.Strength;
  adv.MaxLife = (advStr * 2);
  if (isNaN(adv.MaxLife)) {
    adv.MaxLife = Math.round(adv.MaxLife);
  }
  adv.Life = Math.round(adv.MaxLife * lifePercentage);



  adv.RangedResist = Math.round(adv.Attributes.Dexterity * 2);
  adv.HandResist = Math.round(adv.Attributes.Strength * 2);

  adv.upkeep++;

  adv.Attack = calculateAdventurerAttackPoints(adv);
  updateAdventurerOptionStatus(adv);

  let elements = document.querySelectorAll(`[uid='${adv.uID}']`);
  elements.forEach(element => {
    element.style.animation = 'toggleInOut 0.5s forwards';
    const upkeepElement = element.querySelector('.upkeep');
    if ( upkeepElement ) { upkeepElement.textContent = `${adv.upkeep}`}
    setTimeout(() => {
      element.style.animation = '';
    }, 500);
  });

}






function createAdventurerWeaponSlot(adventurer) {

  const slot = document.createElement('div');
  slot.className = 'empty-slot slot';

  const weapon = adventurer.Equipment.Weapon;
  if (weapon != null) {
    const weaponSlot = document.createElement('div');
    weaponSlot.classList.add('adv-weapon-slot');
    weaponSlot.classList.add('inventory-item');

    weaponSlot.style.backgroundImage = `url('/Art/Interface/weapon categories/${weapon.category}.png')`;
    weaponSlot.style.outlineColor = `var(--${weapon.quality.toLowerCase()}-color)`;
    weaponSlot.style.setProperty(
      "--rarity-color",
      `var(--${weapon.quality.toLowerCase()}-color)`
    );
    weaponSlot.setAttribute('infos', `${weapon.name}`);
    weaponSlot.setAttribute('item-id', weapon.iID);
    weaponSlot.setAttribute('draggable', true);
    weaponSlot.addEventListener('dragstart', Inventory.prototype.dragItem); // ← bound method
    addWeaponTooltip(weaponSlot, weapon);

    slot.appendChild(weaponSlot);
    slot.className = 'occupied-slot slot';
    console.log('this adv has a weapon.');
  } else {
    console.log('this adv has no weapon.');
  }
    return slot;

}







