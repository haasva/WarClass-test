let activeRegion = null;
let nextRegion = null;
let activeRegionExplored = null;
let currentGroupPosition = 0;
let regions = []; // Declare the regions variable outside the loadRegionJSON function
let regionMap = new Map();
let regionCount = 0;
let inRegion = false;
let groupAreaDirection;
let currentDistanceValueToNextArea;
let regionToNextArea = [];



function loadRegionJSON() {
  return new Promise((resolve) => {
    console.log('Loading Region JSON...');
    setTimeout(() => {
  fetch('/JSONData/regions.json')
    .then(response => response.json())
    .then(data => {
      regions = data; // Store the adventurers data in the global variable
      fixRegionsImagePaths(regions);

      regionMap = new Map(data.map(region => [region.Title, region]));

      
      console.log('Regions data:', regions);
      console.log('Region map:', regionMap);
    })
    .catch(error => {
      console.error('Error loading regions JSON:', error);
    });
    console.log('Region JSON loaded');
    resolve();
  }, 1000); // Simulate async loading
});
}

function fixRegionsImagePaths(regions) {
  for (const region of regions) {
    for (const key in region) {
      if (typeof region[key] === 'string' && region[key].includes('\\')) {
        region[key] = region[key].replace(/\\/g, '/');
        region[key] = region[key].replace(/ /g, '%20');
      }
    }
  }
  startingRegion();
}


function startingRegion() {
  const nextAreaReached = document.getElementById('destination-reached');
  if (nextAreaReached) {
    nextAreaReached.remove();
  }
  if ( inRegion === true ) {
    currentGroupPosition = 0;
    // displayMiniMap();
    // displayDirectionChoice();
    getRandomRegion();
  } else {
    displayTopDownMap();
  }
}












function updateRegionInformations() {
  const infos = document.getElementById('region-infos');

  const areaName = infos.querySelector('#area-name');
  areaName.textContent = `${CURRENT_PLAYER_REGION_DATA.superRegion} `;

  if (CURRENT_PLAYER_REGION_DATA.name != null) {
    areaName.textContent = `${CURRENT_PLAYER_REGION_DATA.name} `;
  }

  const coordinates = infos.querySelector('#coordinates');
  coordinates.textContent = `[${playerOverworldCol}:${playerOverworldRow}]`;

  const level = infos.querySelector('#level');
  level.textContent = `${CURRENT_PLAYER_REGION_DATA.level}`;

  const groups = infos.querySelector('#groups');
  if (CURRENT_PLAYER_REGION_DATA.groups) {
    groups.textContent = `${CURRENT_PLAYER_REGION_DATA.groups.length}`;
  } else {
    groups.textContent = `0`;
  }

  const roads = infos.querySelector('#roads');
  roads.textContent = `${CURRENT_PLAYER_REGION_DATA.roadIDCounter}`;

  const ruins = infos.querySelector('#ruins');
  ruins.textContent = `${CURRENT_PLAYER_REGION_DATA.ruinsNumber}`;

  const rivers = infos.querySelector('#rivers');
  rivers.textContent = `${CURRENT_PLAYER_REGION_DATA.riversNumber}`;
}









function centerMapOnLocation(locationId) {
  const minimapElement = document.getElementById('minimap');
  const mapContainerElement = document.getElementById('map-container');
  const locationElement = locationId;

  if (!minimapElement || !mapContainerElement || !locationElement) {
    console.error('Elements not found.');
    return;
  }

  // Calculate the scroll position to center on the location element
  const containerWidth = minimapElement.offsetWidth;
  const containerHeight = minimapElement.offsetHeight;

  const locationLeft = locationElement.offsetLeft;
  const locationTop = locationElement.offsetTop;
  const locationWidth = locationElement.offsetWidth;
  const locationHeight = locationElement.offsetHeight;

  const scrollLeft = locationLeft - (containerWidth - locationWidth) / 2;
  const scrollTop = locationTop - (containerHeight - locationHeight) / 2;

  // Set the scroll position
  mapContainerElement.scrollLeft = scrollLeft;
  mapContainerElement.scrollTop = scrollTop;
}



function findLocationElementByName(name) {
  const minimapElement = document.getElementById('minimap');
  const locationElements = minimapElement.getElementsByClassName('location');

  for (let i = 0; i < locationElements.length; i++) {
    const locationElement = locationElements[i];
    if (locationElement.innerText.trim() === name.trim()) {
      return locationElement;
    }
  }

  return null; // Return null if not found
}




  















































































































