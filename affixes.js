async function generateAdventurerAffixes(adventurer) {
  try {
    // Load the affixes data from affixes.json
    const response = await fetch('/JSONData/affixes.json');
    const data = await response.json();
    const affixes = [...data]; // Store a copy of the affixes data

    // Create a new copy of the adventurer object
    const adventurerCopy = { ...adventurer };
    adventurerCopy.Affixes = [];

// Set Rarity based on probabilities
adventurerCopy.BaseRarity = adventurerCopy.Rarity;
adventurerCopy.Rarity = getRandomAdventurerRarity(adventurerCopy.BaseRarity);

// Set the number of affixes based on Rarity
const randomAffixNumber = getRandomAffixCount(adventurerCopy.Rarity);

    // Randomly select affixes to add to the adventurer
    for (let i = 0; i < randomAffixNumber; i++) {
      // Filter affixes based on adventurer's Type
      const matchingAffixes = affixes.filter(affix => {
        const adventurerTypeWords = adventurerCopy.Type.split(',').map(word => word.trim());
        const affixTypeWords = affix.Type.split(',').map(word => word.trim());

        // Check if the affix Type includes the word "Any" or matches adventurer's Type
        return affixTypeWords.includes("Any") || adventurerTypeWords.some(word => affixTypeWords.includes(word));
      });

      if (matchingAffixes.length > 0) {
        const randomIndex = Math.floor(Math.random() * matchingAffixes.length);
        const affix = matchingAffixes[randomIndex];

        affix.BaseValue = randomizeAffixValue(affix);
        // Push the affix to the adventurer's Affixes array
        adventurerCopy.Affixes.push(affix);
        // Remove the affix from the available affixes to avoid duplicates
        affixes.splice(affixes.indexOf(affix), 1);
      }
    }

    // Apply affix bonuses to the adventurer copy
    setAdventurerSkillSlots(adventurerCopy);
    applyAffixesToIndividualAdventurer(adventurerCopy);

    return adventurerCopy;
  } catch (error) {
    console.error('Error loading affixes JSON:', error);
  }
}

function getRandomAdventurerRarity(BaseRarity) {
  const randomValue = Math.random() * 100;

  if (randomValue < 3) {
    return BaseRarity === 'Legendary' ? 'Legendary' : 'Rare';
  } else if (randomValue < 13) {
    return BaseRarity === 'Normal' || BaseRarity === 'Rare' ? 'Rare' : BaseRarity;
  } else if (randomValue < 43) {
    return BaseRarity === 'Normal' || BaseRarity === 'Rare' ? 'Uncommon' : BaseRarity;
  } else {
    return BaseRarity === 'Normal' || BaseRarity === 'Rare' ? 'Normal' : BaseRarity;
  }
}


// Function to generate a random number of affixes based on rarity
function getRandomAffixCount(rarity) {
  switch (rarity) {
    case "Normal":
      return 0;
    case "Uncommon":
      return 1; // 1 or 2 affixes
    case "Rare":
      return 2; // 2, 3, or 4 affixes
    case "Legendary":
      return 3; // 4, 5, or 6 affixes
    default:
      return 0;
  }
}



function randomizeAffixValue(affix) {
    const baseValue = parseInt(affix.BaseValue);
    const range = parseInt(affix.Range);
    const minValue = baseValue - range;
    const maxValue = baseValue + range;
    return Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
}

function applyAffixesToIndividualAdventurer(adventurer) {
  if (!adventurer.Affixes || adventurer.Affixes.length === 0) return;

  // Create a deep copy of the Attributes object
  adventurer.Attributes = { ...adventurer.Attributes };

  for (const affix of adventurer.Affixes) {
    // Check the Stat property of the affix and update the corresponding stat of the adventurer
    if (affix.Stat === "Attack") {
      adventurer.Attack += affix.BaseValue;
    } else if (affix.Stat === "HandResist") {
      adventurer.HandResist += affix.BaseValue;
    } else if (affix.Stat === "RangedResist") {
      adventurer.RangedResist += affix.BaseValue;
    } else if (affix.Stat === "Life") {
      adventurer.Life += affix.BaseValue;
    } else if (affix.Stat === "Speed") {
      adventurer.Speed += affix.BaseValue;
    } else if (affix.Stat === "Cunning") {
      adventurer.Attributes.Cunning += affix.BaseValue;
    } else if (affix.Stat === "Dexterity") {
      adventurer.Attributes.Dexterity += affix.BaseValue;
    } else if (affix.Stat === "Education") {
      adventurer.Attributes.Education += affix.BaseValue;
    } else if (affix.Stat === "Strength") {
      adventurer.Attributes.Strength += affix.BaseValue;
    } else if (affix.Stat === "Artisanship") {
      adventurer.Attributes.Artisanship += affix.BaseValue;
    } else if (affix.Stat === "Damage against Slaves") {
      
    } else if (affix.Stat === 'Slot') {
      const type = affix.SlotType;
      adventurer.Slots.push({ type: type, status: 'empty' });
    }
  }
}




  


function generateAffixElements(adventurer, container) {
    if (!adventurer.Affixes || adventurer.Affixes.length === 0) return;
  
    for (const affix of adventurer.Affixes) {
      const affixElement = document.createElement('span');
      affixElement.classList.add("affix-li");
      if (!affix.Description) {
        affix.Description = ' base ';
      }
      affixElement.innerHTML = `<span class="affix-name">${affix.Name}</span> <span class="affix-info">(+${affix.BaseValue} ${affix.Description} ${affix.Stat})</span>`;
  
      // Optionally, you can apply styles or additional properties to the affix elements
        
      container.appendChild(affixElement);
    }
}