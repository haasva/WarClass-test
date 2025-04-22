let PLAYER = new Map;
let TOTAL_PARTY_SLOTS = 0;


let GROUP_ATTRIBUTES = {
  mobility: 0,
  willpower: 0,
  stealth: 0,
  perception: 0,
  tradition: 0,
  influence: 0,
  cohesion: 0,
  harmony: 0,
  culturalVariance: 0,
  partySlots : 0,
  primaryAttributes: {
      strength: 0,
      cunning: 0,
      artisanship: 0,
      education: 0,
      dexterity: 0
  },
  cultureKnowledge: {
    Latin: 0,
    Western: 0,
    Eastern: 0,
    Muslim: 0,
    Tribal: 0,
    Asian: 0
  },
  cultureKnowledgeAverage: 0,
  fame: 0,
  lore: 0,
  entropy: 0,
  speed: 0
};


function updateGroupAttributes() {

let group = Array.from(groupAdventurers.values());

GROUP_ATTRIBUTES = {
    mobility: 0,
    willpower: 0,
    stealth: 0,
    perception: 0,
    tradition: 0,
    influence: 0,
    cohesion: 0,
    harmony: 0,
    culturalVariance: 0,
    partySlots : 0,
    primaryAttributes: {
        strength: 0,
        cunning: 0,
        artisanship: 0,
        education: 0,
        dexterity: 0
    },
    cultureKnowledge: {
      Latin: 0,
      Western: 0,
      Eastern: 0,
      Muslim: 0,
      Tribal: 0,
      Asian: 0
    },
    cultureKnowledgeAverage: 0,
    fame: 0,
    lore: 0,
    entropy: 0,
    speed: 0,
    size: 0

};

GROUP_ATTRIBUTES.partySlots = TOTAL_PARTY_SLOTS;


// PRIMARY ATTRIBUTES //
// Sum up values from adventurers
for (const adventurer of groupAdventurers.values()) {
  for (const key in GROUP_ATTRIBUTES.primaryAttributes) {
    GROUP_ATTRIBUTES.primaryAttributes[key] += adventurer.Attributes[key.charAt(0).toUpperCase() + key.slice(1)];
  }
}

// Compute the average and update GROUP_ATTRIBUTES
GROUP_ATTRIBUTES.size = groupAdventurers.size || 1; // Prevent division by zero
GROUP_ATTRIBUTES.primaryAttributes = Object.fromEntries(
  Object.entries(GROUP_ATTRIBUTES.primaryAttributes).map(([key, value]) => [key, Math.round(value)])
);

  // // RESILIENCE //
  // GROUP_ATTRIBUTES.moral += 100;
  // GROUP_ATTRIBUTES.willpower += Math.round(GROUP_ATTRIBUTES.primaryAttributes.strength / 2.5);
  // GROUP_ATTRIBUTES.entropy += currentDay;

  // GROUP_ATTRIBUTES.resilience = Math.round(
  //   ( (GROUP_ATTRIBUTES.willpower + currentClassLevel) - ((100 - GROUP_ATTRIBUTES.moral) / 10) - GROUP_ATTRIBUTES.entropy)
  // );



  GROUP_ATTRIBUTES.speed = calculateGroupSpeed();

  // GROUP_ATTRIBUTES.lore = calculateGroupLore();
  // GROUP_ATTRIBUTES.tradition = Math.round(GROUP_ATTRIBUTES.primaryAttributes.artisanship / 10);


  // COHESION //
  GROUP_ATTRIBUTES.quality = calculateGroupQuality(group);
  GROUP_ATTRIBUTES.culturalVariance = calculateCulturalVariance(group);
  GROUP_ATTRIBUTES.harmony = calculateTypeHarmony(group);

 
  GROUP_ATTRIBUTES.willpower = calculateWillpower(GROUP_ATTRIBUTES);
  GROUP_ATTRIBUTES.cohesion = calculateCohesion(GROUP_ATTRIBUTES.culturalVariance, GROUP_ATTRIBUTES.harmony, GROUP_ATTRIBUTES.primaryAttributes.education, group.length);
  GROUP_ATTRIBUTES.influence = calculateInfluence(GROUP_ATTRIBUTES);
  GROUP_ATTRIBUTES.tradition = calculateTradition(GROUP_ATTRIBUTES);
  GROUP_ATTRIBUTES.stealth = calculateStealth(GROUP_ATTRIBUTES);
  GROUP_ATTRIBUTES.perception = calculatePerception(GROUP_ATTRIBUTES);
  GROUP_ATTRIBUTES.mobility = calculateMobility(GROUP_ATTRIBUTES);

  GROUP_ATTRIBUTES.cultureKnowledge = calculateCategorySum();
  calculateCulturePercentages();

  updateGroupSheet();
}

function calculateMobility(attributes) {
  const speed = attributes.speed;

  let mob = speed * 12 - attributes.size * 6 + attributes.cohesion / 10;

  return Math.round(100 * (1 - Math.exp(-mob / 50))); 
}

function calculatePerception(attributes) {
  const cun = attributes.primaryAttributes.cunning;
  let per = cun / 2;
  return Math.round(100 * (1 - Math.exp(-per / 50))); 
}

function calculateStealth(attributes) {
  const dex = attributes.primaryAttributes.dexterity;  // Main contributor
  const str = attributes.primaryAttributes.strength;   // Reduces stealth
  const qual = attributes.quality;                     // Higher quality = lower stealth
  const size = attributes.size;                        // Larger size = lower stealth

  let stl = 60 + dex * 2 - (str * 0.5) - (qual * 1) - (size * 8);
  return Math.max(0, Math.min(100, Math.round(stl)));
}



function calculateTradition(attributes) {
  let tra = attributes.primaryAttributes.artisanship + (attributes.culturalVariance * attributes.size) / 4;
  return Math.round(100 * (1 - Math.exp(-tra / 50))); 
}

function calculateWillpower(attributes) {
  let will = attributes.primaryAttributes.strength - attributes.entropy;
  return Math.round(100 * (1 - Math.exp(-will / 50))); 
}


function calculateGroupQuality(group) {
  const base = 50;
  let totalQuality = base;

  const rarityModifiers = {
    Normal: -10,
    Uncommon: 0,
    Rare: 10,
    Legendary: 20
  };

  const groupSize = group.length;

  group.forEach(adventurer => {
    if (rarityModifiers.hasOwnProperty(adventurer.Rarity)) {
      // Apply diminishing returns: Divide by sqrt(group size) to soften impact
      totalQuality += rarityModifiers[adventurer.Rarity] / Math.sqrt(groupSize);
    }
  });

  return Math.round(totalQuality);
}



function calculateInfluence(attributes) {
  const edu = attributes.primaryAttributes.education;
  const cun = attributes.primaryAttributes.cunning;
  const fame = attributes.fame + 1;
  const qual = attributes.quality;
  const size = attributes.size;

  let inf = 
    ((cun * 2 + edu * 1) / 2) + 
    (fame / 2) + 
    ((qual - 50)) + 
    (size) + 
    10;

  // Normalize influence with an asymptotic function
  return Math.round(100 * (1 - Math.exp(-inf / 300))); 
}








function calculateCohesion(culturalVariance, harmony, education, groupSize) {
  // Define weights for each factor
  const culturalVarianceWeight = -1.5;
  const harmonyPositiveWeight = 1;
  const harmonyNegativeWeight = -0.5;
  const educationMultiplier = 0.33;
  const groupSizeWeight = -4;

  // Calculate the base cohesion affected by culturalVariance and groupSize
  let cohesion = 50; // Start with a base value

  // Adjust cohesion based on culturalVariance
  cohesion += culturalVarianceWeight * culturalVariance;

  // Adjust cohesion based on harmony
  if (harmony >= 25) {
      cohesion += harmonyPositiveWeight * (harmony - 25);
  } else {
      cohesion += harmonyNegativeWeight * (25 - harmony);
  }

  // Apply education as a multiplier
  cohesion *= 1 + educationMultiplier * (education / 100);

  // Adjust cohesion based on group size
  cohesion += groupSizeWeight * (groupSize - 1);

  cohesion = Math.max(1, Math.round(cohesion / 1.5));

  if (cohesion >= 100) cohesion = 100;

  return cohesion;
}



function calculateGroupLore() {
  const lore = Math.floor(GROUP_ATTRIBUTES.lore + GROUP_ATTRIBUTES.cultureKnowledgeAverage);
  return lore;
}

function calculateTypeHarmony(group) {
  if (group.length === 0) {
      return 0;
  }
  if (group.length === 1) {
    return 100;
}

  let uniqueTypes = new Set();
  let totalTypesCount = 0;

  group.forEach(adventurer => {
      adventurer.Types.forEach(type => {
          uniqueTypes.add(type);
          totalTypesCount++;
      });
  });

  let uniqueTypesCount = uniqueTypes.size;

  let uniqueTypesPercentage = (uniqueTypesCount / totalTypesCount) * 100;
  let typeHarmony = 100 - uniqueTypesPercentage;

  return Math.round(typeHarmony);
}





function updateGroupSheet() {
    // Select all elements with the class .attribute-value within #group-sheet
    let attributeElements = document.querySelectorAll('#group-sheet-container .attribute-value');

    let combatStats = getGroupCurrentAttack(groupAdventurers);
    
    // Iterate over the NodeList of elements
    attributeElements.forEach(element => {
        // Get the id of the element
        let attributeName = element.id;
        
        // Check if the id matches a key in GROUP_ATTRIBUTES
        if (GROUP_ATTRIBUTES.hasOwnProperty(attributeName)) {
          const value = GROUP_ATTRIBUTES[attributeName];
          element.textContent = value;
          
          if (element.parentElement.classList.contains('major')) {
            const normalized = Math.min(1, Math.max(0, value / 100));
            let red, green;
            if (normalized < 0.5) {
                red = 255;
                green = Math.round(2 * normalized * 255);
            } else {
                red = Math.round((1 - 2 * (normalized - 0.5)) * 255);
                green = 255;
            }
            element.style.color = `rgb(${red}, ${green}, 0)`;
          }


      }
 else if (GROUP_ATTRIBUTES.primaryAttributes && GROUP_ATTRIBUTES.primaryAttributes.hasOwnProperty(attributeName)) {
            // Check if the id matches a key in GROUP_ATTRIBUTES.primaryAttributes
            element.textContent = GROUP_ATTRIBUTES.primaryAttributes[attributeName];
        } else if (combatStats.hasOwnProperty(attributeName)) {
            element.textContent = combatStats[attributeName];
        }
    });
}









  function enableGroupSheetAttributeTooltips(sheet) {

    let attributes = sheet.querySelectorAll('.attribute-name');
  
    attributes.forEach(element => {
      let attributeName = element.textContent.trim().toLowerCase();

      const img = `url('../Art/Interface/Attributes/${attributeName}.png')`;

        element.style.setProperty(
          "--icon",
          `${img}`
        );
      
  
      // Load the tooltip content from the corresponding .txt file
      fetch(`/Templates/texts/attributes/${attributeName}.txt`)
        .then(response => response.text())
        .then(data => {
          let dataText = data;
  
          element.addEventListener('mouseover', function(event) {
            displayAttributeTooltip(event, attributeName, dataText);
          });
        })
        .catch(error => {
          console.error('Error loading tooltip content:', error);
        });
  
      element.addEventListener('mouseleave', () => {
        const existingTooltip = document.querySelector('.attribute-tooltip');
        if (existingTooltip) {
          existingTooltip.remove();
        }
      });
    });
  }



function displayAttributeTooltip(event, attributeName, data) {

  const existingTooltip = document.querySelector('.attribute-tooltip');
  if (existingTooltip) {
    existingTooltip.remove();
  }

    // Create a tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'attribute-tooltip area-tooltip';
    tooltip.setAttribute('id', 'attribute-tooltip');
    
    tooltip.innerHTML = `
      <div>${data}</div>
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

    tooltip.style.left = `${adjustedX - 10}px`;
    tooltip.style.top = `${adjustedY + 10}px`;


    // Append the tooltip to the body
    document.body.appendChild(tooltip);
    


    // Set the initial tooltip position
    updateTooltipPosition(event, tooltip);

}













