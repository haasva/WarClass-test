let skillsObject = {};
let isDraggingSkill;
let skillRadius = 70;
let skillTreestartX;
let SkillTreeScrollLeft;
let startY;

function addSkillTreeMovement() {



  let skillTreeSlider = document.getElementById('skill-tree-container');
skillTreeSlider.addEventListener('mousedown', (e) => {
  // Check if the mousedown event is on an element with the class 'skill'
  if (!e.target.classList.contains('skill') && e.button === 0) {
    isDown = true;
    skillTreeSlider.classList.add('active');
    skillTreestartX = e.pageX - skillTreeSlider.offsetLeft;
    startY = e.pageY - skillTreeSlider.offsetTop;
    SkillTreeScrollLeft = skillTreeSlider.scrollLeft;
    scrollTop = skillTreeSlider.scrollTop;
  }
});

skillTreeSlider.addEventListener('mouseleave', () => {
  isDown = false;
  skillTreeSlider.classList.remove('active');
});
skillTreeSlider.addEventListener('mouseup', () => {
  isDown = false;
  skillTreeSlider.style.cursor = "";
  skillTreeSlider.classList.remove('active');
});
skillTreeSlider.addEventListener('mousemove', (e) => {
  if(!isDown) return;
  e.preventDefault();
  const x = e.pageX - skillTreeSlider.offsetLeft;
  const y = e.pageY - skillTreeSlider.offsetTop;
  const walkX = (x - skillTreestartX) * 1; //scroll-fast
  const walkY = (y - startY) * 1; //scroll-fast
  skillTreeSlider.scrollLeft = SkillTreeScrollLeft - walkX;
  skillTreeSlider.scrollTop = scrollTop - walkY;
  skillTreeSlider.style.cursor = "grabbing";
});

let baseTreeWidth = 1550; // Initial width of the map image
let baseTreeHeight = 3000; // Initial height of the map image

skillTreeSlider.addEventListener('wheel', handleWheelEventTree);

skillTreeSlider.addEventListener('click', (e) => {
  // Check if the mousedown event is on an element with the class 'skill'
  if (!e.target.classList.contains('skill')) {

    
    console.log('CREER LES CHEMINS');
  }}, { once: true 
});
}

function handleWheelEventTree(event) {
  event.preventDefault();
  const mapImage = document.getElementById('skill-image');
  const scaleStep = 0.1; // You can adjust this value based on your desired zoom sensitivity
  let newScale = currentScale;
  if (event.deltaY < 0) {
    newScale += scaleStep;
  } else {
    newScale -= scaleStep;
  }
  newScale = Math.max(0.6, Math.min(1, newScale));
  mapImage.style.transform = `scale(${newScale})`;
  currentScale = newScale;
}




function displaySkillTree() {
  displaySkills();
  addSkillTreeMovement();
}

function displaySkills() {
const skillTreeHeader = document.getElementById('skill-tree-header');
addCloseButton(skillTreeHeader);
enableDragAndDropWindow(skillTreeHeader);
fetchSkillsData();
fetch('/JSONData/skills.json')
  .then(response => response.json())
  .then(data => {
    // Get the map container
    const skillImage = document.getElementById('skill-image');

    // Create the skills table
    const skillsTable = document.createElement('table');
    skillsTable.id = 'skills-table';

    // Set the dimensions of the table
    const numRows = 31;
    const numCols = 34;
    skillsTable.style.width = `${numCols * 60}px`; // Adjust the width based on cell size
    skillsTable.style.height = `${numRows * 60}px`; // Adjust the height based on cell size
    skillsTable.style.gridTemplateRows = `repeat(${numRows}, 1fr)`;
    skillsTable.style.gridTemplateColumns = `repeat(${numCols}, 1fr)`;

    // Initialize the table rows and cells
    for (let row = 0; row < numRows; row++) {
      const tableRow = document.createElement('tr');
      for (let col = 0; col < numCols; col++) {
        const cell = document.createElement('td');
        cell.style.width = '60px';
        cell.style.height = '60px';
        cell.style.boxSizing = 'border-box';
        tableRow.appendChild(cell);
      }
      skillsTable.appendChild(tableRow);
    }

    // Append the skills table to the skillImage
    skillImage.appendChild(skillsTable);

// Fill each cell with skill data
data.forEach(skill => {
// Round the position to the nearest integer
const adjustedPosX = Math.round(skill.PosX) - 1;
const adjustedPosY = Math.round(skill.PosY) - 1;

const row = skillsTable.rows[adjustedPosY];
if (row) {
  const cell = row.cells[adjustedPosX];
  if (cell) {
    cell.classList.add('skill', skill.Rarity, skill.Size);
    const types = skill.Type.split(',').map(s => s.trim());
    cell.classList.add(`${types[0]}`);
    if (types.length != 1) {
      cell.classList.add(`${types[1]}`);
    }
    cell.style.backgroundImage = `url('/Art/Skills/${skill.Name}.png')`;
    cell.innerHTML = skill.Name;
  }
}
});
toggleDraggingSkill();
    activateSkillEventListeners();

    const skillTree = document.getElementById('skill-tree');
    skillTree.style.opacity = '0';
    updateSkillConnectionsAsync().then(() => {
      // Hide the skill tree after updating connections
      skillTree.style.opacity = '1';
      skillTree.style.display = 'none';
    });
  })
  .catch(error => {
    console.error('Error loading skills data:', error);
  });
}







function toggleSkillTree() {
  const skillTree = document.getElementById('skill-tree');

  if (skillTree.style.display != 'block') {
    togglePartyContainerDisplay('on');
    skillTree.style.visibility = 'visible';
    
  } else {
    togglePartyContainerDisplay('off');
    skillTree.style.visibility = 'hidden';
  }
  updateSkillPointsDisplay();

  skillTree.style.display = skillTree.style.display === 'none' ? 'block' : 'none';

}


function activateSkillEventListeners() {
  let skillElements = document.querySelectorAll('.skill');

  skillElements.forEach(skillElement => {
    const skillText = skillElement.innerHTML;
    skillElement.addEventListener('mouseup', handleSkillClick);
    skillElement.addEventListener('mouseover', handleSkillMouseOver);
    skillElement.addEventListener('mouseleave', handleSkillMouseLeave);
  });
}

function updateSkillConnectionsAsync() {
  return new Promise(resolve => {
      // Assume this is the asynchronous operation to update skill connections
      updateSkillConnections();

      // Simulate delay (replace with actual code)
      setTimeout(() => {
          resolve();
      }, 1000);
  });
}

function fetchSkillsData() {
  return fetch('/JSONData/skills.json')
    .then(response => response.json())
    .then(data => {
      // Assuming 'data' is an array of objects in 'skills.json'
      data.forEach(skill => {
        const skillName = skill.Name;
        skillsObject[skillName] = {
          name: skillName,
          art: skill.Art,
          posX: skill.PosX,
          posY: skill.PosY,
          rarity: skill.Rarity,
          connections: skill.Connections,
          type: skill.Type,
          category: skill.Category,
          specialty: skill.Specialty,
          description: skill.Description,
          effect: skill.Effect,
          // Add more properties as needed
        };
      });
      console.log(skillsObject);
      return skillsObject;
      
    })
    .catch(error => {
      console.error('Error fetching skills data:', error);
      return null;
    });
}


function updateSkillConnections() {
  const skillElements = document.querySelectorAll('.skill');

  skillElements.forEach(skillElement => {
      const skillRect = skillElement.getBoundingClientRect();
      const skillName = skillElement.innerHTML;
      const skillCenterX = skillRect.left + skillRect.width / 2;
      const skillCenterY = skillRect.top + skillRect.height / 2;

      // Initialize or clear the ConnectedSkills array for the current skill
      skillsObject[skillName].ConnectedSkills = [];

      // Iterate through all other skills to check for proximity
      skillElements.forEach(otherSkillElement => {
          if (otherSkillElement !== skillElement) {
              const otherSkillRect = otherSkillElement.getBoundingClientRect();
              const otherSkillName = otherSkillElement.innerHTML;
              const otherSkillCenterX = otherSkillRect.left + otherSkillRect.width / 2;
              const otherSkillCenterY = otherSkillRect.top + otherSkillRect.height / 2;

              // Check proximity within 70px horizontally or vertically (not diagonally)
              const isCloseX = Math.abs(skillCenterX - otherSkillCenterX) <= skillRadius && Math.abs(skillCenterY - otherSkillCenterY) <= skillRect.height / 2;
              const isCloseY = Math.abs(skillCenterY - otherSkillCenterY) <= skillRadius && Math.abs(skillCenterX - otherSkillCenterX) <= skillRect.width / 2;

              if (isCloseX || isCloseY) {
                  // Ensure the skill is not already in the ConnectedSkills array
                  if (!skillsObject[skillName].ConnectedSkills.includes(otherSkillName)) {
                      // Check if the maximum of 4 connected skills has been reached
                      if (skillsObject[skillName].ConnectedSkills.length < 4) {
                          // Add the connected skill to the array
                          skillsObject[skillName].ConnectedSkills.push(otherSkillName);
                      }
                  }
              }
          }
      });
  });
}

let nextLineIDSkillTree = 1;


function generateUniqueSkillID() {
  const uniqueID = nextLineIDSkillTree;
  nextLineIDSkillTree += 1; // Increment for the next ID
  return uniqueID;
}

function isLineSkillIDExists(id) {
  const existingLines = document.querySelectorAll('.road-skill');
  return Array.from(existingLines).some(line => parseInt(line.dataset.lineId) === id);
}


function handleSkillClick(e) {
  updateSkillPointsDisplay();
  if (e.button === 0 && groupAvailableSkillPoints != 0) {
    
    const clickedElement = e.target;
    const clickedSkillName = clickedElement.innerHTML;

    if (clickedElement.classList.contains('selected-skill')) {
        // Skill is not clickable or already selected, do nothing
        return;
    }

    // Toggle selected-skill class
    clickedElement.classList.toggle('selected-skill');

    // Remove selectable-skill class from the clicked skill
    clickedElement.classList.remove('selectable-skill');

    meatSound();
    updateSkillPoints();

    selectThisSkill(skillsObject[clickedSkillName]);

    // Update connected skills
    const connectedSkills = skillsObject[clickedSkillName]?.ConnectedSkills || [];

    connectedSkills.forEach(connectedSkillName => {
        const connectedSkillElement = findSkillElementByName(connectedSkillName);

        if (connectedSkillElement && !connectedSkillElement.classList.contains('selected-skill')) {
            connectedSkillElement.classList.add('selectable-skill');
        }
    });

    
  }
}

function updateSkillPoints() {
  groupAvailableSkillPoints -= 1;
  spentSkillPoints += 1;
  updateSkillPointsDisplay();
}

function updateSkillPointsDisplay() {
  const availableSkillPointsElement = document.getElementById('available-skill-points');
  availableSkillPointsElement.innerHTML = groupAvailableSkillPoints;

  const spentSkillPointsElement = document.getElementById('spent-skill-points');
  spentSkillPointsElement.innerHTML = spentSkillPoints;

  let skillSelectables = document.querySelectorAll('.selectable-skill');
  if (groupAvailableSkillPoints < 1) {
    for (const element of skillSelectables) {
      element.style.animation = 'none';
    }
  } else {
    for (const element of skillSelectables) {
      element.style.animation = '';
    }
  }
}

function findSkillElementByName(skillName) {
  const skillElements = document.querySelectorAll('.skill');

  for (const skillElement of skillElements) {
      if (skillElement.innerHTML.trim() === skillName.trim()) {
          return skillElement;
      }
  }

  return null;
}


function findSkillElementByName(skillName) {
  const skillElements = document.querySelectorAll('.skill');
  
  for (const skillElement of skillElements) {
      if (skillElement.innerHTML.trim() === skillName.trim()) {
          return skillElement;
      }
  }

  return null;
}














function createSkillRoads() {
  let skillElements = document.querySelectorAll('.skill');

  const allRoadsSkill = document.querySelectorAll('.road-skill');
  if (allRoadsSkill) {
      allRoadsSkill.forEach(road => {
      road.remove();
     });
  }
  skillElements.forEach(skillElement => { 
    createSkillConnections(skillElement, skillElements);
  });

}

  function createSkillConnections(element, skillElements) {
    
    const connectedElements = new Set(); // Keep track of elements already connected
    const hoveredElement = element;

    // Fetch the JSON data dynamically
    fetch('/JSONData/skills.json')
      .then(response => response.json())
      .then(jsonData => {
        const maxConnections = getMaxSkillConnections(hoveredElement, jsonData);

        // Find the farthest neighbor for each skill
        const farthestNeighbors = findFarthestNeighbors(skillElements);

        while (connectedElements.size < maxConnections) {
          const nearestElement = findNearestUnconnectedElement(hoveredElement, connectedElements, farthestNeighbors, skillElements);

          if (!nearestElement) {
            break; // Break the loop if no more unconnected elements are found
          }

          if (maxConnections === 0) {
            break; // Break the loop if no more unconnected elements are found
          }

          connectSkillElements(hoveredElement, nearestElement);
          connectedElements.add(nearestElement);
        }
      })
      .catch(error => {
        console.error('Error loading map data:', error);
      });
  }

  function getMaxSkillConnections(element, jsonData) {
    const elementName = element.innerHTML;

    // Find the corresponding element in the fetched JSON data
    const elementData = jsonData.find(data => data.Name === elementName);

    // Use the Connections value from the JSON data
    return elementData ? elementData.Connections : 0;
  }

  function findNearestUnconnectedElement(element, connectedElements, farthestNeighbors, skillElements) {
    const elementRect = element.getBoundingClientRect();
    let nearestElement = null;
    let minDistance = Number.MAX_SAFE_INTEGER;

    skillElements.forEach(otherElement => {
      if (otherElement !== element && !connectedElements.has(otherElement)) {
        const otherElementRect = otherElement.getBoundingClientRect();
        const distance = Math.sqrt(
          Math.pow(otherElementRect.top - elementRect.top, 2) +
          Math.pow(otherElementRect.left - elementRect.left, 2)
        );

        // Check the condition for not connecting to neighbors impacted by the farthest neighbor
        if (!isImpactedByFarthestNeighbor(otherElement, element, farthestNeighbors) && distance < minDistance) {
          minDistance = distance;
          nearestElement = otherElement;
        }
      }
    });

    return nearestElement;
  }

  function findFarthestNeighbors(skillElements) {
    const farthestNeighbors = new Map();

    skillElements.forEach(skillElement => {
      const elementRect = skillElement.getBoundingClientRect();
      let farthestNeighbor = null;
      let maxDistance = 0;

      skillElements.forEach(otherElement => {
        if (otherElement !== skillElement) {
          const otherElementRect = otherElement.getBoundingClientRect();
          const distance = Math.sqrt(
            Math.pow(otherElementRect.top - elementRect.top, 2) +
            Math.pow(otherElementRect.left - elementRect.left, 2)
          );

          if (distance > maxDistance) {
            maxDistance = distance;
            farthestNeighbor = otherElement;
          }
        }
      });

      farthestNeighbors.set(skillElement, farthestNeighbor);
    });

    return farthestNeighbors;
  }

  function isImpactedByFarthestNeighbor(element, hoveredElement, farthestNeighbors) {
    const elementRect = element.getBoundingClientRect();
    const hoveredElementRect = hoveredElement.getBoundingClientRect();

    const distanceToHovered = Math.sqrt(
      Math.pow(hoveredElementRect.top - elementRect.top, 2) +
      Math.pow(hoveredElementRect.left - elementRect.left, 2)
    );

    const farthestNeighbor = farthestNeighbors.get(element);

    if (farthestNeighbor) {
      const farthestNeighborRect = farthestNeighbor.getBoundingClientRect();
      const distanceToFarthest = Math.sqrt(
        Math.pow(farthestNeighborRect.top - elementRect.top, 2) +
        Math.pow(farthestNeighborRect.left - elementRect.left, 2)
      );

      return distanceToFarthest < distanceToHovered;
    }

    return false;
  }

  function connectSkillElements(element1, element2) {
    const element1Rect = element1.getBoundingClientRect();
    const element2Rect = element2.getBoundingClientRect();
    const skillImageRect = document.getElementById('skill-image').getBoundingClientRect();

    const element1Name = element1.innerHTML;
    const element2Name = element2.innerHTML;
  
    const line = document.createElement('div');
    line.className = 'road-skill';
   // Generate a unique ID for the line
   const lineID = generateUniqueSkillID();
  
   // Check if the ID already exists, and regenerate if needed
   while (isLineSkillIDExists(lineID)) {
     lineID = generateUniqueSkillID();
   }
     // Set the dataset property to store the line ID
  line.dataset.lineId = lineID;

    const x1 = (element1Rect.left - skillImageRect.left + element1Rect.width / 2);
    const y1 = (element1Rect.top - skillImageRect.top + element1Rect.height / 2);
    const x2 = (element2Rect.left - skillImageRect.left + element2Rect.width / 2);
    const y2 = (element2Rect.top - skillImageRect.top + element2Rect.height / 2);
  
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const distance = Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));
  
    line.style.position = 'absolute';
    line.style.left = `${x1}px`;
    line.style.top = `${y1}px`;
    line.style.width = `${distance}px`;
    line.style.transformOrigin = '0 50%';
    line.style.transform = `rotate(${angle}rad)`;
    document.getElementById('skill-image').appendChild(line);
    calculateSkillRoadDistanceNumber(distance, x1, x2, y1, y2);
    const roadDistance = calculateSkillRoadDistanceNumber(distance, x1, x2, y1, y2);
    uppdateConnectedSkills(element1Name, element2Name, roadDistance);
    // assignTerrainValuesToAllSkills();
  }

  function assignTerrainValuesToAllSkills() {
    for (const skillName in skillsObject) {
      if (skillsObject.hasOwnProperty(skillName)) {
        const skillData = skillsObject[skillName];
        assignTerrainValues(skillData);
      }
    }
  }
  
  function assignTerrainValues(skillData) {
    if (skillData && skillData.terrains && typeof skillData.terrains === 'string') {
      const words = skillData.terrains.split(',').map(word => word.trim());
      const baseValue = 100;
  
      const calculatedValue = baseValue / words.length;
  
      // Restructure the skillData.terrains object
      skillData.terrains = {};
      words.forEach((word, index) => {
        const terrainObjectName = `terrain_${index + 1}`;
        skillData.terrains[terrainObjectName] = {
          name: word,
          value: calculatedValue
        };
      });
    }
  }
  
  
  
  
  
  

  function calculateSkillRoadDistanceNumber(distance, x1, x2, y1, y2) {
    const distanceValue = Math.round(distance * 3.1 / 88);
    return distanceValue;
  }
  

  
  
  
  

  function uppdateConnectedSkills(element1Name, element2Name, roadDistance) {
    // Update the JSON object
    if (skillsObject[element1Name]) {
      if (!skillsObject[element1Name].ConnectedSkills) {
        skillsObject[element1Name].ConnectedSkills = [];
      }
  
      const existingConnection = skillsObject[element1Name].ConnectedSkills.find(connection => connection.elementName === element2Name);
  
      if (!existingConnection) {
        const connectionObject = {
          elementName: element2Name,
          distance: roadDistance
        };
  
        skillsObject[element1Name].ConnectedSkills.push(connectionObject);
      }
    }
  
    if (skillsObject[element2Name]) {
      if (!skillsObject[element2Name].ConnectedSkills) {
        skillsObject[element2Name].ConnectedSkills = [];
      }
  
      const existingConnection = skillsObject[element2Name].ConnectedSkills.find(connection => connection.elementName === element1Name);
  
      if (!existingConnection) {
        const connectionObject = {
          elementName: element1Name,
          distance: roadDistance
        };
  
        skillsObject[element2Name].ConnectedSkills.push(connectionObject);
      }
    }
  }
  
  

function handleMouseLeave() {
  const lines = document.querySelectorAll('.road-skill-skill');
  lines.forEach(line => line.remove());
}



function handleSkillMouseOver(event) {


  

  const existingButton = document.querySelector('.select-skill-button');
  if (existingButton) {
      existingButton.remove();
  }

  const hoveredElement = event.target;
  const hoveredSkillName = hoveredElement.innerHTML;

  // Highlight the hovered skill
  

  // Highlight connected skills
  const connectedSkills = skillsObject[hoveredSkillName]?.ConnectedSkills || [];
  const skillElements = document.querySelectorAll('.skill');

  connectedSkills.forEach(connectedSkillName => {
      const connectedSkillElement = Array.from(skillElements).find(skillElement => skillElement.innerHTML === connectedSkillName);

      if (connectedSkillElement && !connectedSkillElement.classList.contains('selected-skill')) {
          connectedSkillElement.classList.add('skill-highlight');
      }
  });

  if (isDraggingSkill !== true) {
      displaySkillTooltip(event);
      // displaySkillRadius(hoveredElement);
  }
}

function displaySkillRadius(hoveredElement) {
  const skillRadiusCircle = document.createElement('div');
  skillRadiusCircle.setAttribute('class', 'skill-radius');

  const skillRect = hoveredElement.getBoundingClientRect();
  const elX = skillRect.left + skillRect.width / 2 - skillRadius;
  const elY = skillRect.top + skillRect.height / 2 - skillRadius;

  // Set the circle position using CSS styles
  skillRadiusCircle.style.top = `${elY}px`;
  skillRadiusCircle.style.left = `${elX}px`;

  document.body.append(skillRadiusCircle);

  // Set the circle radius using CSS styles
  skillRadiusCircle.style.width = `${skillRadius * 2}px`;
  skillRadiusCircle.style.height = `${skillRadius * 2}px`;
}




// Function to find the connected skill
function getConnectedElement(roadElement) {
  // Find the other end of the road
  const connectedElement = roadElement.parentElement.querySelector('.skill');

  return connectedElement;
}

// Function to check if a road element is connected to a skill element
function isConnectedToSkill(roadElement, skillElement) {
  const roadRect = roadElement.getBoundingClientRect();
  const skillRect = skillElement.getBoundingClientRect();

  // Check if the road element intersects with the skill element
  return (
    roadRect.left < skillRect.right &&
    roadRect.right > skillRect.left &&
    roadRect.top < skillRect.bottom &&
    roadRect.bottom > skillRect.top
  );
}


function handleSkillMouseLeave() {
  const highlightedSkills = document.querySelectorAll('.skill-highlight');

  highlightedSkills.forEach(skillElement => {
      skillElement.classList.remove('skill-highlight');
  });

  const radiusCircles = document.querySelectorAll('.skill-radius');

  radiusCircles.forEach(circle => {
    circle.remove();
  });

  removeSkillTooltip();
}








function displaySkillTooltip(event) {

  clearTimeout(delayTimerTooltip);

    delayTimerTooltip = setTimeout(() => {

    

  const hoveredElement = event.target;
  const hoveredSkillName = hoveredElement.innerHTML;
  const skillData = skillsObject[hoveredSkillName];

  const attachedAdventurerUID = parseInt(hoveredElement.getAttribute('attached-adventurer'));
  let adventurer = { Title: 'none'};
  if (attachedAdventurerUID) {
    adventurer = findAdventurerByUID(attachedAdventurerUID);
    attachedToText = adventurer.Title;
  }
  

  const existingTooltip = document.querySelector('.skill-tooltip');
  if (existingTooltip) {
    existingTooltip.remove();
  }

  // Check if the data exists
  if (skillData) {
    // Create a tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'skill-tooltip area-tooltip';
    tooltip.classList.add(`${skillData.type}`);
    tooltip.setAttribute('id', 'skill-tooltip');
    const connectedSkillsHTML = skillsObject[hoveredSkillName]?.ConnectedSkills?.join('<span class="normal">, </span>') || '';
    
    tooltip.innerHTML = `
      <div class="header" id="header" style="">${skillData.name}</div>
      <div>${skillData.category}</div>
      <div class="${skillData.type} type-skill">${skillData.type}</div>
      <div>${skillData.specialty}</div>
      <div>${skillData.description}</div>
      <div class="Connections">Adjacent skills:<br><span class="connectedto">${connectedSkillsHTML}</span></div>
      <div class="attachment">Attached to:<span class="connectedto">${adventurer.Title}</span></div>
    `;
  
    hideEmptyElements(tooltip);
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

    // Call the function to display terrain icons
    const terrainsElement = tooltip.querySelector('#terrains-words');
    displayTerrainIcons(skillData.terrains, terrainsElement);

    // Append the tooltip to the body
    document.body.appendChild(tooltip);
    
    // Update the background image of the header
    const header = tooltip.querySelector('#header');

    if (typeColors.hasOwnProperty(skillData.type)) {
      header.style.color = typeColors[skillData.type];
      header.style.backgroundImage = `url('/Art/Categories/Types/small/grey/${skillData.type}.png')`;
    }

    if (hoveredElement.classList.contains('signature-skill')) {
      const signInd = document.createElement('div');
      signInd.className = 'signature-indicator';
      signInd.textContent = 'Signature Skill';
      header.appendChild(signInd);
    }

    // Set the initial tooltip position
    updateTooltipPosition(event, tooltip);

    // Add event listener to update tooltip position on mousemove
    hoveredElement.addEventListener('mousemove', (event) => updateTooltipPosition(event, tooltip));
  }

}, SETTINGS.tooltipDelay);
}











// Function to create a span element for a culture with a background image
function createCultureSpan(culture) {
  const cultureSpan = document.createElement('span');
  cultureSpan.className = 'culture-icon';
  cultureSpan.style.backgroundImage = `url(${getCultureImageURL(culture)})`;
  return cultureSpan.outerHTML;
}

// Function to get the URL of the culture's image (replace with actual paths)
function getCultureImageURL(culture) {
  // Replace with the actual paths to culture images
  const cultureImagePaths = {
    French: 'Art/Cultures/french.png',
    African: 'Art/Cultures/african.png',
    American: 'Art/Cultures/American.png',
    Arab: 'Art/Cultures/arab.png',
    Arctic: 'Art/Cultures/arctic.png',
    Balkan: 'Art/Cultures/balkan.png',
    Chinese: 'Art/Cultures/chinese.png',
    Dutch: 'Art/Cultures/dutch.png',
    English: 'Art/Cultures/english.png',
    German: 'Art/Cultures/german.png',
    Iberian: 'Art/Cultures/iberian.png',
    Indian: 'Art/Cultures/indian.png',
    Italian: 'Art/Cultures/italian.png',
    Japanese: 'Art/Cultures/japanese.png',
    Latino: 'Art/Cultures/latino.png',
    Altaic: 'Art/Cultures/altaic.png',
    Nanyang: 'Art/Cultures/nanyang.png',
    Ottoman: 'Art/Cultures/ottoman.png',
    Persian: 'Art/Cultures/persian.png',
    Scandinavian: 'Art/Cultures/scandinavian.png',
    Russian: 'Art/Cultures/russian.png'
  };

  return cultureImagePaths[culture] || '';
}

function removeSkillTooltip() {
  const existingTooltip = document.querySelector('.skill-tooltip');
  if (existingTooltip) {
    existingTooltip.remove();
  }
}















// Add this event listener to each skill element you want to make draggable
document.querySelectorAll('.skill').forEach(skillElement => {
  //skillElement.addEventListener('mousedown', startDragSkill);
});

const skillPositions = {};


function startDragSkill(event) {
  const draggedSkill = event.target;

  // Check if the skill element has the classes 'selectable-skill' or 'selected-skill'
  if (draggedSkill.classList.contains('selectable-skill') || draggedSkill.classList.contains('selected-skill')) {
    return; // Do not proceed with dragging for skills with specified classes
  }

  // Get the skill's position in the table
  const originalCell = getParentCell(draggedSkill);


  // Calculate the offset from the mouse cursor to the skill's position
  const offsetX = event.clientX - draggedSkill.getBoundingClientRect().left;
  const offsetY = event.clientY - draggedSkill.getBoundingClientRect().top;

  // Create a visual clone of the dragged skill
  const clone = draggedSkill.cloneNode(true);
  clone.style.position = 'absolute';
  clone.style.zIndex = '1000';
  clone.style.pointerEvents = 'none';
  clone.classList.add('clone-dragged');
  document.body.appendChild(clone);

  // Update the skill's position while dragging
  function updateSkillPosition(mouseEvent) {
    const mouseX = mouseEvent.clientX;
    const mouseY = mouseEvent.clientY;

    clone.style.left = mouseX - offsetX + 'px';
    clone.style.top = mouseY - offsetY + 'px';

    // Get the cell over which the mouse is hovering
    const hoveredCell = getHoveredCell(mouseX, mouseY);

    // Remove the drop-target class from all cells
    document.querySelectorAll('.drop-target').forEach(cell => cell.classList.remove('drop-target'));

    if (hoveredCell) {
      // Calculate the distance between the original and destination cells
      const rowDifference = Math.abs(originalCell.parentElement.rowIndex - hoveredCell.parentElement.rowIndex);
      const colDifference = Math.abs(originalCell.cellIndex - hoveredCell.cellIndex);

      // Check if the distance is within the allowed range (1 row and 1 column)
      if (rowDifference <= 1 && colDifference <= 1 && !hoveredCell.classList.contains('skill')) {
        // Add the drop-target class to the suitable cell
        hoveredCell.classList.add('drop-target');
      }
    }
  }

  // Handle the mousemove event to update the skill's position
  document.addEventListener('mousemove', updateSkillPosition);

  // Handle the mouseup event to drop the skill
  document.addEventListener('mouseup', function dropSkill(event) {
    // Remove the event listeners
    document.removeEventListener('mousemove', updateSkillPosition);
    document.removeEventListener('mouseup', dropSkill);

    // Remove the visual clone
    clone.remove();

    // Get the cell over which the mouse is hovering
    const hoveredCell = getHoveredCell(event.clientX, event.clientY);

    if (hoveredCell && hoveredCell.classList.contains('drop-target')) {
      // Get the outerHTML of the dragged skill
      const draggedSkillHTML = draggedSkill.innerHTML;

      // Calculate the distance between the original and destination cells
      const rowDifference = Math.abs(originalCell.parentElement.rowIndex - hoveredCell.parentElement.rowIndex);
      const colDifference = Math.abs(originalCell.cellIndex - hoveredCell.cellIndex);

      // Check if the distance is within the allowed range (1 row and 1 column)
      if (rowDifference <= 1 && colDifference <= 1 && !hoveredCell.classList.contains('skill')) {
        // Create a new empty td element
        const emptyTd = document.createElement('td');

        // Reset the content of the original cell to the empty td
        originalCell.replaceWith(emptyTd);

        // Set the innerHTML of the destination cell with the dragged skill HTML
        hoveredCell.innerHTML = draggedSkillHTML;

        // Update the skill's position in the data
        const newPosX = Array.from(hoveredCell.parentElement.cells).indexOf(hoveredCell) + 1;
        const newPosY = Array.from(hoveredCell.parentElement.parentElement.rows).indexOf(hoveredCell.parentElement) + 1;

        const audio = new Audio("/Sounds/wall.wav");
        audio.volume = 0.5;
        audio.play();
        

        // Update the skill's data (assuming you have a data structure for skills)
        updateSkillData(hoveredCell, draggedSkillHTML, newPosX, newPosY);
        updateSkillConnectionsAsync();

        // Update connected skills
        const connectedSkills = skillsObject[draggedSkillHTML]?.ConnectedSkills || [];

        connectedSkills.forEach(connectedSkillName => {
            const connectedSkillElement = findSkillElementByName(connectedSkillName);

            if (connectedSkillElement && connectedSkillElement.classList.contains('selected-skill')) {
              hoveredCell.classList.add('selectable-skill');
            }
        });
        const enableDragging = dragToggle.checked;
        if (enableDragging) {
          hoveredCell.addEventListener('mousedown', startDragSkill);
        } else {
          hoveredCell.removeEventListener('mousedown', startDragSkill);
        }
        


      } else {
        // If the destination is too far, return the skill to its original position
        originalCell.appendChild(draggedSkill);
      }
    } else {
      // If not dropped over a valid cell, return the skill to its original position
      originalCell.appendChild(draggedSkill);
    }

    // Remove the drop-target class from all cells
    document.querySelectorAll('.drop-target').forEach(cell => cell.classList.remove('drop-target'));

    // Update any other logic or styles as needed

    // Prevent default behavior
    event.preventDefault();


  });
  
  // Prevent default behavior
  event.preventDefault();

}

// Helper function to get the parent cell of an element
function getParentCell(element) {
  while (element && element.tagName !== 'TD') {
    element = element.parentElement;
  }
  return element;
}

// Helper function to get the hovered cell based on mouse coordinates
function getHoveredCell(mouseX, mouseY) {
  const elementMouseIsOver = document.elementFromPoint(mouseX, mouseY);
  return getParentCell(elementMouseIsOver);
}

// Example function to update the skill's data (replace this with your actual logic)
function updateSkillData(hoveredCell, draggedSkillHTML, newPosX, newPosY) {
  const skillName = draggedSkillHTML;
  console.log(`Skill '${skillName}' moved to position X: ${newPosX}, Y: ${newPosY}`);
  hoveredCell.classList.add('skill', skillsObject[skillName].rarity, skillsObject[skillName].size);
  hoveredCell.style.backgroundImage = `url('/Art/Skills/${skillsObject[skillName].name}.png')`;
  activateSkillEventListeners();
}















let isRightClicking = false;
let startRightClickX;
let startRightClickY;
let selectedSkillsOffsets = {};

// Add this event listener to skill elements for the right-click

  //document.addEventListener('mousedown', handleRightClickTree);
  // document.addEventListener('contextmenu', e => e.preventDefault()); // Prevent the default context menu

//document.addEventListener('mousemove', handleMouseMoveSelection);
//document.addEventListener('mouseup', handleMouseUpSelection);


function handleRightClickTree(e) {
  if (e.button === 2) { // Check if it's a right click
    isRightClicking = true;
    startRightClickX = e.clientX;
    startRightClickY = e.clientY;

    // Prevent the default context menu
   // e.preventDefault();

    // Deselect all skills initially
    document.querySelectorAll('.skill').forEach(skillElement => {
        skillElement.classList.remove('selection');
    });
}
}

function handleMouseMoveSelection(e) {
  if (isRightClicking) {
    const ExselectionRect = document.getElementById('selection-rectangle');
    if (!ExselectionRect) {
        // Create the selection rectangle if it doesn't exist
        const newSelectionRect = document.createElement('div');
        newSelectionRect.id = 'selection-rectangle';
        newSelectionRect.style.pointerEvents = 'none'; // Ensure the rectangle doesn't interfere with other elements
        document.body.appendChild(newSelectionRect);
    }

    const rectX = Math.min(startRightClickX, e.clientX);
    const rectY = Math.min(startRightClickY, e.clientY);
    const rectWidth = Math.abs(startRightClickX - e.clientX);
    const rectHeight = Math.abs(startRightClickY - e.clientY);

    // Update the style of the selection rectangle
    const selectionRect = document.getElementById('selection-rectangle');
    selectionRect.style.left = `${rectX}px`;
    selectionRect.style.top = `${rectY}px`;
    selectionRect.style.width = `${rectWidth}px`;
    selectionRect.style.height = `${rectHeight}px`;

    // Iterate through each skill and check if it's within the rectangle
    document.querySelectorAll('.skill').forEach(skillElement => {
      
        const skillRect = skillElement.getBoundingClientRect();
        const isInsideRectangle = (
            skillRect.left < rectX + rectWidth &&
            skillRect.left + skillRect.width > rectX &&
            skillRect.top < rectY + rectHeight &&
            skillRect.top + skillRect.height > rectY
        );

        if (isInsideRectangle) {
            skillElement.classList.add('selection');
        } else {
            skillElement.classList.remove('selection');
        }
    });
}
}

function handleMouseUpSelection(e) {
    if (e.button === 2 && isRightClicking) {
        // Right mouse button released
        isRightClicking = false;

        // Remove the selection rectangle
        const selectionRect = document.getElementById('selection-rectangle');
        if (selectionRect) {
            selectionRect.remove();
        }
    }
}

















































function updateRandomSkillPositions() {
  console.log('OKKK');
  let allSkillElements = document.querySelectorAll('.skill');
    // Number of skill elements to update randomly
    const numberOfElementsToUpdate = getRandomNumber(10, 20);

    // Randomly select skill elements
    const skillElementsToUpdate = getRandomSkillElements(numberOfElementsToUpdate);

    // Update the positions of the selected skill elements
    skillElementsToUpdate.forEach(skillElement => {
        updateSkillPositionRandomly(skillElement);
    });
    
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomSkillElements(numberOfElements) {
  let allSkillElements = document.querySelectorAll('.skill');
    // Shuffle the array of all skill elements
    const shuffledSkillElements = Array.from(allSkillElements).sort(() => Math.random() - 0.5);

    // Select the first numberOfElements elements
    return shuffledSkillElements.slice(0, numberOfElements);
}
function updateSkillPositionRandomly(skillElement) {
  // Get the current position of the skill element
  const currentLeft = parseFloat(skillElement.style.left || '0');
  const currentTop = parseFloat(skillElement.style.top || '0');

  // Randomly choose +1% or -1% for both horizontal and vertical axes
  const deltaX = getRandomNumber(0, 1) === 0 ? -1 : 1;
  const deltaY = getRandomNumber(0, 1) === 0 ? -1 : 1;

  // Update the skill element position within the percentage range (0% to 98%)
  skillElement.style.left = `${Math.max(0, Math.min(98, currentLeft + deltaX))}%`;
  skillElement.style.top = `${Math.max(0, Math.min(98, currentTop + deltaY))}%`;
}


// intervalID = setInterval(updateRandomSkillPositions, 10);




function toggleDraggingSkill() {
  let skillTreeSlider = document.getElementById('skill-tree-container');
  const dragToggle = document.getElementById('dragToggle');
  const skillElements = document.querySelectorAll('.skill');
  const skillImage = document.getElementById('skill-image');
  const toggleContainer = document.getElementById('toggle-container');

  function handleDragToggleChange() {
    const enableDragging = dragToggle.checked;

    skillElements.forEach(skillElement => {
      if (enableDragging) {
        skillImage.style.transform = 'scale(1)';

        // Check if the skill element has the classes 'selectable-skill' or 'selected-skill'
        if (!skillElement.classList.contains('selectable-skill') && !skillElement.classList.contains('selected-skill')) {
          // Enable dragging only if it doesn't have the specified classes
          skillElement.addEventListener('mousedown', startDragSkill);
        }

        skillTreeSlider.removeEventListener('wheel', handleWheelEventTree);
        toggleContainer.style.animation = 'toggleInOut 0.5s normal 1';
        toggleContainer.style.borderColor = 'rgb(0, 247, 255)';
      } else {
        skillElement.removeEventListener('mousedown', startDragSkill);
        skillTreeSlider.addEventListener('wheel', handleWheelEventTree);
        toggleContainer.style.animation = '';
        toggleContainer.style.borderColor = '';
      }
    });
  }

  // Initial binding
  handleDragToggleChange();

  // Event listener for toggle switch change
  dragToggle.addEventListener('change', handleDragToggleChange);
}

