const slider = document.querySelector('#map-container');
let isDown = false;
let startX;
let scrollLeft;
let areasObject = {};
let selectedArea = false;
const showMapButton = document.getElementById('show-map-button');
showMapButton.disabled = true;
let currentArea;

slider.addEventListener('mousedown', (e) => {
  // Check if the mousedown event is on an element with the class 'location'
  if (!e.target.classList.contains('location') || !e.target.classList.contains('generic-large-header')) {
    isDown = true;
    slider.classList.add('active');
    startX = e.pageX - slider.offsetLeft;
    startY = e.pageY - slider.offsetTop;
    scrollLeft = slider.scrollLeft;
    scrollTop = slider.scrollTop;
  }
});

slider.addEventListener('mouseleave', () => {
  isDown = false;
  slider.classList.remove('active');
});
slider.addEventListener('mouseup', (e) => {
  isDown = false;
  slider.style.cursor = "";
  slider.classList.remove('active');
});
slider.addEventListener('mousemove', (e) => {
  if(!isDown) return;
  e.preventDefault();
  const x = e.pageX - slider.offsetLeft;
  const y = e.pageY - slider.offsetTop;
  const walkX = (x - startX) * 1; //scroll-fast
  const walkY = (y - startY) * 1; //scroll-fast
  slider.scrollLeft = scrollLeft - walkX;
  slider.scrollTop = scrollTop - walkY;
  slider.style.perspectiveOrigin = `${walkX}px ${walkY}px`;
  slider.style.transformOrigin = `${walkX}px ${walkY}px`;
  slider.style.cursor = "grabbing";
});





function displayTopDownMap() {
  isOnMap = true;
    fetch('/Templates/map_template.html')
    .then(response => response.text())
    .then(template => {
      // Create a temporary div to hold the template content
      const tempContainer = document.createElement('div');
      tempContainer.innerHTML = template;

      // Get the elements from the template
      const elements = tempContainer.children;
 
      // Append all elements
      const mapContainer = document.getElementById('map-container');
      for (const element of elements) {
            mapContainer.appendChild(element);
      }
    })
    .catch(error => {
      console.error('Error loading map template:', error);
    });

    displayAreas();
    const mapContainer = document.getElementById('map-container');
    mapContainer.style.display = 'block';
    const aside = document.getElementById('aside');
    document.body.appendChild(mapContainer);
    const mapHeader = document.createElement('div');
    mapHeader.setAttribute('id', 'map-header');
    mapHeader.classList.add('generic-large-header');
    mapContainer.append(mapHeader);
    enableDragAndDropWindow(mapHeader);
    mapHeader.textContent = 'Select a Starting Area';
    displayMessage(`Choose your starting area.`, 'white');

}

function displayAreas() {
  fetchAreasData();
  fetch('/JSONData/areas.json')
  .then(response => response.json())
  .then(data => {
      // Get the map container
      const mapImage = document.getElementById('map-image');

      // Loop through the data and create elements
      data.forEach(area => {
          const locationElement = document.createElement('div');
          locationElement.className = 'location';
          locationElement.innerHTML = area.Name;
          locationElement.style.left = `${area.PosX}%`;
          locationElement.style.top = `${area.PosY}%`;
          locationElement.classList.add(area.Size);

          // Append the element to the map image
          setAreaClimateClass(area, locationElement);
          mapImage.appendChild(locationElement);

            locationElement.addEventListener('mouseover', handleLocationMouseOver);
            locationElement.addEventListener('mouseleave', handleLocationMouseLeave);
 
      });

    })
    .catch(error => {
        console.error('Error loading areas data:', error);
    });
}

function setAreaClimateClass(area, element) {
    element.classList.add(`${area.Climate}`);
}

function fetchAreasData() {
  return fetch('/JSONData/areas.json')
    .then(response => response.json())
    .then(data => {
      // Assuming 'data' is an array of objects in 'areas.json'
      data.forEach(area => {
        const areaName = area.Name;
        areasObject[areaName] = {
          name: areaName,
          row: area.Row,
          col: area.Col,
          headerpic: area.Header,
          climate: area.Climate,
          posX: area.PosX,
          posY: area.PosY,
          connections: area.Connections,
          size: area.Size,
          cultures: area.Cultures,
          terrains: area.Terrains,
          faction: area.Faction,
          continent: area.Continent,
          color: getRandomColor()
          // Add more properties as needed
        };
      });
      fetchFactionsData();
      console.log(areasObject);
      return areasObject;
      
    })
    .catch(error => {
      console.error('Error fetching areas data:', error);
      return null;
    });
}

let nextLineID = 1;


function generateUniqueID() {
  const uniqueID = nextLineID;
  nextLineID += 1; // Increment for the next ID
  return uniqueID;
}

function isLineIDExists(id) {
  const existingLines = document.querySelectorAll('.road');
  return Array.from(existingLines).some(line => parseInt(line.dataset.lineId) === id);
}

function pageSoundClick() {
  const audio = new Audio("/Sounds/page.mp3");
  audio.volume = 0.3;
  audio.play();
}

function handleLocationClick(e) {
  const audio = new Audio("/Sounds/page.mp3");
  audio.volume = 0.5;
  audio.play();
  if (selectedArea === false ) {
    selectedArea = true;
  }
  if (selectedArea === true ) {
    const existingButton = document.querySelector('.select-area-button');
    if (existingButton) {
      existingButton.remove();
    }
    const hoveredElement = e.target;
    hoveredElement.removeEventListener('mouseup', handleLocationClick);
    const hoveredAreaName = hoveredElement.innerHTML;
    const areaData = areasObject[hoveredAreaName];
    removeAreaTooltip();
    const selectAreaButton = document.createElement('button');
    selectAreaButton.classList.add('select-area-button');
    selectAreaButton.classList.add('direction-choice');
    selectAreaButton.style.backgroundImage = `url(/Art/Interface/Terrains/location_headers/${areasObject[hoveredAreaName].headerpic}.png)`
    selectAreaButton.innerHTML = `Start from ${areaData.name}`;
    selectAreaButton.style.pointerEvents = "all";
    selectAreaButton.oninput = "addListenerToButton()";
    const rightBox1 = document.getElementById('right-box1');
    rightBox1.appendChild(selectAreaButton);
    let enterButton = document.querySelector('.select-area-button');
    addListenerToButton(enterButton, areaData.name);
    enterArea(enterButton, areaData.name);
  }
}

function addListenerToButton(element, area) {
  element.addEventListener("mouseup", (event) => {
    enterArea(element, area);
  });
}


function createRoads() {
  handleMouseLeave();

  locationElements.forEach(locationElement => { 
    createConnections(locationElement, locationElements);
  });

}

  function createConnections(element, locationElements) {
    const connectedElements = new Set(); // Keep track of elements already connected
    const hoveredElement = element;

    // Fetch the JSON data dynamically
    fetch('/JSONData/areas.json')
      .then(response => response.json())
      .then(jsonData => {
        const maxConnections = getMaxConnections(hoveredElement, jsonData);

        // Find the farthest neighbor for each location
        const farthestNeighbors = findFarthestNeighbors(locationElements);

        while (connectedElements.size < maxConnections) {
          const nearestElement = findNearestUnconnectedElement(hoveredElement, connectedElements, farthestNeighbors, locationElements);

          if (!nearestElement) {
            break; // Break the loop if no more unconnected elements are found
          }

          if (maxConnections === 0) {
            break; // Break the loop if no more unconnected elements are found
          }

          connectElements(hoveredElement, nearestElement);
          connectedElements.add(nearestElement);
        }
      })
      .catch(error => {
        console.error('Error loading map data:', error);
      });
  }

  function getMaxConnections(element, jsonData) {
    const elementName = element.innerHTML;

    // Find the corresponding element in the fetched JSON data
    const elementData = jsonData.find(data => data.Name === elementName);

    // Use the Connections value from the JSON data
    return elementData ? elementData.Connections : 0;
  }

  function findNearestUnconnectedElement(element, connectedElements, farthestNeighbors, locationElements) {
    const elementRect = element.getBoundingClientRect();
    let nearestElement = null;
    let minDistance = Number.MAX_SAFE_INTEGER;

    locationElements.forEach(otherElement => {
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

  function findFarthestNeighbors(locationElements) {
    const farthestNeighbors = new Map();

    locationElements.forEach(locationElement => {
      const elementRect = locationElement.getBoundingClientRect();
      let farthestNeighbor = null;
      let maxDistance = 0;

      locationElements.forEach(otherElement => {
        if (otherElement !== locationElement) {
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

      farthestNeighbors.set(locationElement, farthestNeighbor);
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

  function connectElements(element1, element2) {
    const element1Rect = element1.getBoundingClientRect();
    const element2Rect = element2.getBoundingClientRect();
    const mapImageRect = document.getElementById('map-image').getBoundingClientRect();

    const element1Name = element1.innerHTML;
    const element2Name = element2.innerHTML;
  
    const line = document.createElement('div');
    line.className = 'road';
   // Generate a unique ID for the line
   const lineID = generateUniqueID();
  
   // Check if the ID already exists, and regenerate if needed
   while (isLineIDExists(lineID)) {
     lineID = generateUniqueID();
   }
     // Set the dataset property to store the line ID
  line.dataset.lineId = lineID;

    const x1 = (element1Rect.left - mapImageRect.left + element1Rect.width / 2);
    const y1 = (element1Rect.top - mapImageRect.top + element1Rect.height / 2);
    const x2 = (element2Rect.left - mapImageRect.left + element2Rect.width / 2);
    const y2 = (element2Rect.top - mapImageRect.top + element2Rect.height / 2);
  
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const distance = Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2));
  
    line.style.position = 'absolute';
    line.style.left = `${x1}px`;
    line.style.top = `${y1}px`;
    line.style.width = `${distance}px`;
    line.style.transformOrigin = '0 50%';
    line.style.transform = `rotate(${angle}rad)`;
    
    document.getElementById('map-image').appendChild(line);
    
    const roadDistance = calculateRoadDistanceNumber(distance, x1, x2, y1, y2);
    uppdateConnectedLocations(element1Name, element2Name, roadDistance);
    assignTerrainValuesToAllAreas();

  }

  function assignTerrainValuesToAllAreas() {
    for (const areaName in areasObject) {
      if (areasObject.hasOwnProperty(areaName)) {
        const areaData = areasObject[areaName];
        assignTerrainValues(areaData);
      }
    }
  }
  
  function assignTerrainValues(areaData) {
    if (areaData && areaData.terrains && typeof areaData.terrains === 'string') {
      const words = areaData.terrains.split(',').map(word => word.trim());
      const baseValue = 100;
  
      const calculatedValue = baseValue / words.length;
  
      // Restructure the areaData.terrains object
      areaData.terrains = {};
      words.forEach((word, index) => {
        const terrainObjectName = `terrain_${index + 1}`;
        areaData.terrains[terrainObjectName] = {
          name: word,
          value: calculatedValue
        };
      });
    }
  }
  
  
  
  
  
  

  function calculateRoadDistanceNumber(distance, x1, x2, y1, y2) {
    const distanceValue = Math.round(distance * 2.1 / 34);
  
    // Display the width as a number without decimals
    const widthNumber = document.createElement('div');
    widthNumber.className = 'road-distance-number';
    widthNumber.textContent = distanceValue;
    widthNumber.style.position = 'absolute';
    const leftValue = (x1 + x2) / 2;
    const topValue = (y1 + y2) / 2;
    const posValueClass = Math.round(leftValue + topValue);
    widthNumber.style.left = `${leftValue}px`;
    widthNumber.style.top = `${topValue}px`;
    widthNumber.setAttribute('data-pos', posValueClass);
    document.getElementById('map-image').appendChild(widthNumber);
    removeDuplicateRoadNumbers(posValueClass);
    widthNumber.remove();
    return distanceValue;
  }
  
  function removeDuplicateRoadNumbers(posValueClass) {
    const existingNumbers = document.querySelectorAll('.road-distance-number[data-pos="' + posValueClass + '"]');
    
    // Check if there are more than one element with the same data-pos
    if (existingNumbers.length > 2) {
      existingNumbers.forEach(existingNumber => {
        existingNumber.remove();
      });
    }
  }
  
  
  
  

  function uppdateConnectedLocations(element1Name, element2Name, roadDistance) {
    // Update the JSON object
    if (areasObject[element1Name]) {
      if (!areasObject[element1Name].ConnectedLocations) {
        areasObject[element1Name].ConnectedLocations = [];
      }
  
      const existingConnection = areasObject[element1Name].ConnectedLocations.find(connection => connection.elementName === element2Name);
  
      if (!existingConnection) {
        const connectionObject = {
          elementName: element2Name,
          distance: roadDistance
        };
  
        areasObject[element1Name].ConnectedLocations.push(connectionObject);
      }
    }
  
    if (areasObject[element2Name]) {
      if (!areasObject[element2Name].ConnectedLocations) {
        areasObject[element2Name].ConnectedLocations = [];
      }
  
      const existingConnection = areasObject[element2Name].ConnectedLocations.find(connection => connection.elementName === element1Name);
  
      if (!existingConnection) {
        const connectionObject = {
          elementName: element1Name,
          distance: roadDistance
        };
  
        areasObject[element2Name].ConnectedLocations.push(connectionObject);
      }
    }
  }
  
  

function handleMouseLeave() {
  const lines = document.querySelectorAll('.road');
  lines.forEach(line => line.remove());
}



// Function to handle mouseover event on location elements
function handleLocationMouseOver(event) {
  

  const hoveredElement = event.target;
  const hoveredAreaName = hoveredElement.innerHTML;
  displayTooltip(event);

  // Get all road elements
  const roadElements = document.querySelectorAll('.road');

  // Update the JSON object
  if (areasObject[hoveredAreaName]) {
    console.log(areasObject[hoveredAreaName]);
  }

  // Change the color of the connected road elements to red
  roadElements.forEach(roadElement => {
    if (isConnectedToLocation(roadElement, hoveredElement)) {
      roadElement.style.backgroundColor = 'white';
      roadElement.style.height = '4px';
      roadElement.style.backgroundImage = 'none';
    }
  });
}

// Function to find the connected location
function getConnectedElement(roadElement) {
  // Find the other end of the road
  const connectedElement = roadElement.parentElement.querySelector('.location');

  return connectedElement;
}

// Function to check if a road element is connected to a location element
function isConnectedToLocation(roadElement, locationElement) {
  const roadRect = roadElement.getBoundingClientRect();
  const locationRect = locationElement.getBoundingClientRect();

  // Check if the road element intersects with the location element
  return (
    roadRect.left < locationRect.right &&
    roadRect.right > locationRect.left &&
    roadRect.top < locationRect.bottom &&
    roadRect.bottom > locationRect.top
  );
}


function handleLocationMouseLeave() {

  const roadElements = document.querySelectorAll('.road');

  // Reset the color of all road elements to the original state
  roadElements.forEach(roadElement => {
    roadElement.style.backgroundColor = ''; // Reset to the default color (or any other color you prefer)
    roadElement.style.boxShadow = "0 0 7px #000000b8";
    roadElement.style.height = "";
    roadElement.style.animation = "";
    roadElement.style.backgroundImage = '';
  });

  if (selectedArea === false) {

  removeAreaTooltip();
  // Get all road elements
} else {
  if (selectedArea === true ) {
    selectedArea = false;
  }
  return;
}
}







function displayTooltip(event) {
  const hoveredElement = event.target;
  const hoveredAreaName = hoveredElement.innerHTML;

  const existingTooltip = document.querySelector('.area-tooltip');
  if (existingTooltip) {
    existingTooltip.remove();
  }

  // Get the corresponding data from the JSON object
  const areaData = areasObject[hoveredAreaName];

  // Check if the data exists
  if (areaData) {
    // Create a tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'area-tooltip';
    tooltip.setAttribute("id", "area-tooltip");
    tooltip.innerHTML = `
      <div class="header" id="header">${areaData.name}</div>
      <div class="Size">${areaData.climate} Climate</div>
      <div class="Connections">Connected to <span class="connectedto">${areaData.ConnectedLocations ? areaData.ConnectedLocations.map(connection => connection.elementName).join('<span class="normal">, </span>') : 'None'}</span></div>

      <div class="Cultures"><span class="normal">Cultures: </span>${areaData.cultures}</div>
      <div class="Faction"><span class="normal">Faction: </span>${areaData.faction}</div>
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

    tooltip.style.left = `${adjustedX}px`;
    tooltip.style.top = `${adjustedY}px`;

    // Call the function to display terrain icons
    //const terrainsElement = tooltip.querySelector('#terrains-words');
    //displayTerrainIcons(areaData.terrains, terrainsElement);

    // Append the tooltip to the body
    document.body.appendChild(tooltip);
    
    // Update the background image of the header
    const header = tooltip.querySelector('#header');
    header.style.backgroundImage = `url('/Art/Interface/Terrains/location_headers/${areaData.headerpic}.png')`;
    // Set the initial tooltip position
    updateTooltipPosition(event, tooltip);

    // Add event listener to update tooltip position on mousemove
    hoveredElement.addEventListener('mousemove', (event) => updateTooltipPosition(event, tooltip));
    
  }
}




// Display terrain icons within the specified element
function displayTerrainIcons(terrainsObject, element) {

  if (element && terrainsObject) {
    for (const terrainKey in terrainsObject) {
      if (terrainsObject.hasOwnProperty(terrainKey)) {
        const terrain = terrainsObject[terrainKey];

        const terrainSpan = document.createElement('span');
        //terrainSpan.className = `${terrain.name.toLowerCase()}-icon`;
        //terrainSpan.classList.add('terrain-icon');
        terrainSpan.textContent = terrain.name;
        element.appendChild(terrainSpan);
      }
    }
  }
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

function removeAreaTooltip() {
  const existingTooltip = document.querySelector('.area-tooltip');
  if (existingTooltip) {
    existingTooltip.remove();
  }
}


function enterArea(element, area) {
  element.remove();
  const selectableLocations = document.querySelectorAll('.unselectable-location');
  selectableLocations.forEach(selectableLocation => {
    selectableLocation.classList.remove('unselectable-location');
  });
  const audio = new Audio("/Sounds/tavern.wav");
  audio.volume = 0;
  audio.play();
  const showMapButton = document.getElementById('show-map-button');
  showMapButton.disabled = false;
  console.log(area);
  currentArea = area;

playerOverworldRow = areasObject[currentArea].row;
playerOverworldCol = areasObject[currentArea].col;

  playerGroupClassChoice();
}



function showMap(e) {
  "use strict";

    e = e || event;

  const mapContainer = document.getElementById('map-container');
  const minimapContainer = document.getElementById('minimap');
  

  if (isOnMap) {
    minimapContainer.style.display = 'none';
    playPaperClose();
    mapContainer.style.opacity = '1';
    mapContainer.style.visibility = 'hidden';
    mapContainer.style.top = '';
    mapContainer.style.left = '';
    mapContainer.style.position = 'relative';
    mapContainer.style.animation = 'none';
    mapContainer.removeAttribute('class', 'map-shown');
    mapContainer.classList.remove('infobox');
    minimapContainer.appendChild(mapContainer);
    const mapHeader = document.getElementById('map-header');
    mapHeader.classList.add('map-header-hidden');
    centerMapOnLocation(findLocationElementByName(areasObject[currentArea].name));
  } else {
    playPaperOpen();
    mapContainer.setAttribute('class', 'map-shown');
    mapContainer.classList.add('infobox');
    mapContainer.style.visibility = 'visible';
    mapContainer.style.display = 'block';
    mapContainer.style.opacity = '1';
    mapContainer.style.width = '838px';
    mapContainer.style.height = '500px';
    mapContainer.style.top = '229px';
    mapContainer.style.left = '663px';
    mapContainer.style.position = 'absolute';
    mapContainer.style.zIndex = '29';
    mapContainer.style.animation = 'flipin 0.35s normal 1';

    let locationElements = document.querySelectorAll('.location');
    console.log(inRegion);
    minimapContainer.style.display = 'none';
    document.body.appendChild(mapContainer);
    const mapHeader = document.getElementById('map-header');
    mapHeader.classList.remove('map-header-hidden');
    mapHeader.textContent = 'World Map';
    addCloseButton(mapHeader);



    locationElements.forEach(locationElement => {
      locationElement.addEventListener('mouseover', handleLocationMouseOver);
      locationElement.addEventListener('mouseleave', handleLocationMouseLeave);
    });

 
    
    const containerWidth = mapContainer.offsetWidth;
    const containerHeight = mapContainer.offsetHeight;
  
    const scrollLeft = containerWidth * 2.5;
    const scrollTop = containerHeight * 1.5;
    
    mapContainer.scrollLeft = scrollLeft;
    mapContainer.scrollTop = scrollTop;
  }

  isOnMap = !isOnMap; // Toggle the state
}







function tryCenterMap(row) {
  if (!row.classList.contains("centered")) {
    row.classList.add("centered");
    
    const mousemoveHandler = (e) => {
      const { x, y } = row.getBoundingClientRect();
      row.style.setProperty("--x", e.clientX - x);
      row.style.setProperty("--y", e.clientY - y);
    };
    
    const documentMousemoveHandler = (e) => {
      const wh = window.innerHeight / 2,
            ww = window.innerWidth / 2 + 200;
      row.style.setProperty('--mouseX7', (e.clientX - ww) / 30);
      row.style.setProperty('--mouseY7', (e.clientY - wh) / 30);
    };
    
    const documentMouseleaveHandler = () => {
      row.style.setProperty('--mouseX7', 0);
      row.style.setProperty('--mouseY7', 0);
    };
    
    row.addEventListener("mousemove", mousemoveHandler);
    document.addEventListener('mousemove', documentMousemoveHandler);
    document.addEventListener('mouseleave', documentMouseleaveHandler);
    
    row.dataset.mousemoveHandler = mousemoveHandler;
    row.dataset.documentMousemoveHandler = documentMousemoveHandler;
    row.dataset.documentMouseleaveHandler = documentMouseleaveHandler;
  } else {
    row.classList.remove("centered");
    
    const mousemoveHandler = row.dataset.mousemoveHandler;
    const documentMousemoveHandler = row.dataset.documentMousemoveHandler;
    const documentMouseleaveHandler = row.dataset.documentMouseleaveHandler;
    
    row.removeEventListener("mousemove", mousemoveHandler);
    document.removeEventListener('mousemove', documentMousemoveHandler);
    document.removeEventListener('mouseleave', documentMouseleaveHandler);
    
    delete row.dataset.mousemoveHandler;
    delete row.dataset.documentMousemoveHandler;
    delete row.dataset.documentMouseleaveHandler;
  }
}











function showMap2(e) {
  const minimapContainer = document.getElementById('minimap');
  const rightSide = document.getElementById('right-side');

  

  if (isOnMap) {
    rightSide.style.width = '';
    minimapContainer.style.height = '';
    centerMapOnLocation(findLocationElementByName(areasObject[currentArea].name));
  } else {
    rightSide.style.width = '45%';
    minimapContainer.style.height = '700px';
  }
  centerMapOnLocation(findLocationElementByName(areasObject[currentArea].name));
  isOnMap = !isOnMap; // Toggle the state
}