
let CULTURES_DATA = [];
let CULTURAL_KNOWLEDGE = [];

let PLAYER_CULTURE_TRAIT = new Set();


parseCulturalData();



async function parseCulturalData() {
  try {
    const response = await fetch('/JSONData/cultures.json');
    const data = await response.json();

    // Assign an initial knowledge value (0) to each culture
    CULTURES_DATA = data.map(item => ({
      ...item,
      knowledge: 0,
      bonus: 0 // Add a new property to each culture object
    }));

    console.log('Cultural Knowledge Data:', CULTURES_DATA);
    await parseCulturalKnowledgeData();
    return CULTURES_DATA;
  } catch (error) {
    console.error('Error fetching cultural knowledge data:', error);
    return null;
  }
}

async function parseCulturalKnowledgeData() {
  return fetch('/JSONData/cultural_knowledge.json')
    .then(response => response.json())
    .then(data => {
      CULTURAL_KNOWLEDGE = data;
      return CULTURAL_KNOWLEDGE;
    })
    .catch(error => {
      console.error('Error fetching cultural distance data:', error);
      return null;
    });
}





function toggleCulturalKnowledgeTable() {
  const exTable = document.querySelector('#ck-table');

  if (exTable) { 
    exTable.remove();
  } else {
    displayCKTable();
  }

}














function calculateCulturalKnowledge() {
  updateCulturalKnowledge();

  const group = Array.from(groupAdventurers.values()); // Get adventurers in the group

  const groupCultures = group.flatMap(adventurer => adventurer.Culture.split(', '));
  const uniqueCultures = [...new Set(groupCultures)]; // Removes duplicates

  // Flat +10 for each culture in the group
  uniqueCultures.forEach(cultureName => {
    const correspondingCulture = CULTURES_DATA.find(c => c.culture === cultureName);
    if (correspondingCulture) {
      // Increment by +10, ensuring it doesn't exceed 100
      correspondingCulture.knowledge = Math.min(100, correspondingCulture.knowledge + 5);
      correspondingCulture.inGroup = true;
    }
  });

  group.forEach(adventurer => {
    const cultures = adventurer.Culture.split(', '); // Split cultures (e.g., "English, French")

    cultures.forEach(cultureName => {
      // Find the matching culture object in the CULTURAL_KNOWLEDGE array
      const cultureKnowledge = CULTURAL_KNOWLEDGE.find(c => c.Cultures === cultureName);

      if (cultureKnowledge) {
        // Update all cultures in CULTURES_DATA using the knowledge values in cultureKnowledge
        CULTURES_DATA.forEach(culture => {
          const incrementValue = cultureKnowledge[culture.culture]; // Get the value for the current culture

          if (incrementValue) {
            // Calculate the adjusted increment based on the current knowledge
            const currentKnowledge = culture.knowledge;
            const adjustedIncrement = (incrementValue / 4 * (1 - currentKnowledge / 100));

            // Update the knowledge value, ensuring it doesn't exceed 100
            culture.knowledge = Math.floor(
              Math.min(100, currentKnowledge + adjustedIncrement)
            );
          }
        });
      }
    });
  });

  uniqueCultures.forEach(cult => {
    // Update all cultures in CULTURES_DATA using the knowledge values in cultureKnowledge
    CULTURES_DATA.forEach(culture => {
      let distance = culturalData.find(c => c.Cultures === culture.culture)?.[cult];


        culture.knowledge = Math.floor(
          culture.knowledge
        );

   
    });
  });
}

function updateCulturalKnowledge() {
  CULTURES_DATA.forEach(culture => {
      culture.knowledge = 0;
      culture.favored = false;
      culture.inGroup = false;
      const bonus = culture.bonus; // Get the value for the current culture

      console.log('increased bonus by:', bonus);
      culture.knowledge = culture.knowledge + bonus;      
  });
}






function calculateCategorySum() {
  const categoryAverages = {};


  CULTURES_DATA.forEach(culture => {
    const { category, knowledge } = culture;

    if (!categoryAverages[category]) {
      categoryAverages[category] = { totalKnowledge: 0, count: 0 };
    }

    categoryAverages[category].totalKnowledge += knowledge;
    categoryAverages[category].count += 1;
  });

  for (const category in categoryAverages) {
    const { totalKnowledge, count } = categoryAverages[category];
    const averageKnowledge = totalKnowledge;
    categoryAverages[category] = averageKnowledge / count;
  }


  return categoryAverages;
}


function calculateCulturePercentages() {
  const total = Object.values(GROUP_ATTRIBUTES.cultureKnowledge).reduce((sum, value) => sum + value, 0);

  if (total === 0) {
    console.warn("Total culture knowledge is 0, cannot calculate percentages.");
    return;
  }

  Object.keys(GROUP_ATTRIBUTES.cultureKnowledge).forEach(category => {
    const value = GROUP_ATTRIBUTES.cultureKnowledge[category];
    const percentage = (value / total) * 100;

    // Store percentage in the object
    GROUP_ATTRIBUTES.cultureKnowledge[category] = {
      value: value,
      percentage: Math.round(percentage) // Round to 2 decimal places
    };
  });
}




function drawCultureRadar() {
  const categories = Object.keys(GROUP_ATTRIBUTES.cultureKnowledge);
  const values = Object.values(GROUP_ATTRIBUTES.cultureKnowledge).map(culture => culture.percentage);

  const radar = document.createElement('div');
  radar.id = 'culture-radar';
  radar.innerHTML = ""; // Clear previous SVG

  const size = 200; // SVG size (width/height)
  const center = size / 2; // Center of the radar chart
  const maxRadius = center - 20; // Maximum radius for scaling
  
  // Find the highest value for scaling
  const maxValue = Math.max(...values, 1); // Prevent division by zero

  // Create SVG element
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", 290);
  svg.setAttribute("height", 200);
  svg.setAttribute("viewBox", `35 -5 ${145} ${200}`);

  // Function to get coordinates for a given category
  function getCoordinates(index, value) {
    const angle = (index / categories.length) * (2 * Math.PI);
    const radius = (value / maxValue) * maxRadius;
    const x = center + 6 + radius * Math.cos(angle);
    const y = center + 2 + radius * Math.sin(angle);
    return { x, y };
  }

  // Draw background grid (hexagon-like shape)
  for (let i = 0; i <= 2; i++) {
    let points = categories.map((_, index) => {
      let { x, y } = getCoordinates(index, (i / 2) * maxValue);
      return `${x},${y}`;
    }).join(" ");

    let polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute("points", points);
    polygon.setAttribute("stroke", "#555");
    polygon.setAttribute("fill", "none");
    svg.appendChild(polygon);
  }

  // Draw radar shape
  let radarPoints = categories.map((_, index) => {
    let { x, y } = getCoordinates(index, values[index]);
    return `${x},${y}`;
  }).join(" ");

  let radarPolygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  radarPolygon.setAttribute("points", radarPoints);
  radarPolygon.setAttribute("fill", "rgba(255, 255, 255, 0.5)");
  radarPolygon.setAttribute("stroke", "white");
  radarPolygon.setAttribute("stroke-width", "2");
  svg.appendChild(radarPolygon);

  // Draw category labels
  categories.forEach((category, index) => {
    const { x, y } = getCoordinates(index, maxValue + 10);
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y);
    if (category === 'Asian' || category === 'Tribal') {
      text.setAttribute("y", y + 16);
    }
    if (category === 'Eastern' || category === 'Latin') {
      text.setAttribute("y", y - 7);
    }

    text.setAttribute("font-size", "12");
    text.classList.add(`${category}`);
    text.setAttribute("text-anchor", "middle");
    text.textContent = category;
    svg.appendChild(text);

    const info = GROUP_ATTRIBUTES.cultureKnowledge[`${category}`].percentage + "%";
    addGenericTooltip(text, info);
  });



  radar.appendChild(svg);

  return radar;
}



function createCulturalTraitsBox() {
  const traitsBox = document.createElement('div');
  traitsBox.innerHTML = '';
  traitsBox.classList.add('cultural-traits');

  const header = document.createElement('div');
  header.classList.add('traits-header');
  header.textContent = `Culture Trait`;

  const traitsContainer = document.createElement('div');
  traitsContainer.classList.add('traits-container');

  traitsBox.appendChild(header);
  traitsBox.appendChild(traitsContainer);

  let favored = [];

  const sortedCultures = [...CULTURES_DATA].filter(culture => culture.favored === true).sort((a, b) => b.knowledge - a.knowledge);
  sortedCultures.forEach(culture => {
    if (favored.length < groupAdventurers.size) {
      favored.push(culture);
    }
  });

  favored.forEach(culture => {
    const favoredRow = document.createElement('div');
    favoredRow.classList.add('favored-row');
    favoredRow.style.backgroundImage = `url('Art/Cultures/${culture.culture}.png')`;

    if (PLAYER_CULTURE_TRAIT.has(`${culture.trait}`)) {
      favoredRow.classList.add('selected');
    } else {
      favoredRow.classList.add('unactive');
    }

    const left = document.createElement('div');
    left.classList.add('left');

    const text = document.createElement('div');
    text.classList.add('text');
    text.textContent = `${culture.culture}`;

    const trait = document.createElement('div');
    trait.classList.add('trait');
    trait.textContent = `${culture.trait}`;

    const traitArt = document.createElement('div');
    traitArt.classList.add('trait-art');
    traitArt.style.backgroundImage = `url('/Art/Cultures/traits/${culture.trait}.png')`;

    left.appendChild(text);
    left.appendChild(trait);
    favoredRow.appendChild(traitArt);
    favoredRow.appendChild(left);

    favoredRow.addEventListener('mouseup', () => selectCulturalTrait(favoredRow, culture, traitsContainer));

    traitsContainer.appendChild(favoredRow);
  });

  return traitsBox;
}


function selectCulturalTrait(favoredRow, culture, traitsContainer) {

  if (PLAYER_CULTURE_TRAIT.has(culture.trait)) {
    return;
  }

  CULTURES_DATA.forEach(culture => {
        culture.selectedTrait = false;
  });

  traitsContainer.querySelectorAll('.favored-row').forEach(row => {
    row.classList.remove('selected');
    row.classList.add('unactive');
  });

  playerSmallButton();

  favoredRow.classList.remove('unactive');
  favoredRow.classList.add('selected');

  culture.selectedTrait = true;

  PLAYER_CULTURE_TRAIT = new Set();
  PLAYER_CULTURE_TRAIT.add(culture.trait);

  console.log(culture);

  displayMessage(`Our Culture Trait is now ${culture.trait}.`, 'hotpink');
  

}