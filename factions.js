let factionsObject = [];

function fetchFactionsData() {
  return fetch('/JSONData/factions.json')
    .then(response => response.json())
    .then(data => {
      // Assuming 'data' is an array of objects in 'factions.json'
      factionsObject = data.map(faction => ({
        name: faction.Name,
        type: faction.Type,
        power: faction.Power,
      }));
      updateFactionAreas();
      console.log('Factions data', factionsObject);
      return factionsObject;
    })
    .catch(error => {
      console.error('Error fetching factions data:', error);
      return null;
    });
}


function updateFactionAreas() {
    for (const faction of factionsObject) {
      const areas = new Set(); // Using a Set to store unique words
      let powerIncrement = 0;
  
      for (const areaName in areasObject) {
        const area = areasObject[areaName];
        if (area.faction && area.faction.includes(faction.name)) {
          // Split the faction data and add unique words to the Set
          const factionWords = area.name.split(',').map(word => word.trim());
          factionWords.forEach(word => areas.add(word));
  
          // Increment power value
          powerIncrement++;
        }
      }
  
      // Convert the Set back to a string and update the faction's "Areas" and "Power" fields
      faction.areas = [...areas].join(', ');
      faction.power += powerIncrement;
    }
}


function toggleFactionTable() {

      const factionTable = document.createElement('div');
      //factionTable.classList.add('infobox');
      factionTable.setAttribute('id', 'factionTable');
      

      return factionTable;
    
}

function displayFactionsData() {
    const factionTable = document.getElementById('factionTable');
    factionTable.innerHTML = ''; // Clear previous content

    // Create a table
    const table = document.createElement('table');

    // Create table header
    const thead = document.createElement('thead');
    const headerRow = thead.insertRow();
    const headers = ['Name', 'Type', 'Power', 'Areas'];
    headers.forEach(headerText => {
      const th = document.createElement('th');
      th.appendChild(document.createTextNode(headerText));
      headerRow.appendChild(th);
    });
    table.appendChild(thead);

    // Create table body
    const tbody = document.createElement('tbody');
    factionsObject.forEach(faction => {
      const row = tbody.insertRow();
      const cells = [faction.name, faction.type, faction.power, faction.areas];
      cells.forEach(cellText => {
        const td = document.createElement('td');
        td.appendChild(document.createTextNode(cellText));
        row.appendChild(td);
      });
    });
    table.appendChild(tbody);
    table.classList.add('sortable');

    factionTable.appendChild(table);


}

function addCloseButton(element) {
  const minify = document.createElement('button');
  minify.setAttribute('id', 'minify-button');
  minify.setAttribute('class', 'minify-button');
  minify.setAttribute('onclick', 'minifyBox(event)'); // Pass event as an argument
  minify.innerHTML = '–';
  element.appendChild(minify);

  const closeButton = document.createElement('button');
  closeButton.setAttribute('id', 'close-button');
  closeButton.setAttribute('class', 'close-button');
  closeButton.setAttribute('onclick', 'closeBox(event)'); // Pass event as an argument
  closeButton.innerHTML = '&#x2716;';
  element.appendChild(closeButton);
}

function closeBox(event) { // Receive event as an argument
  clickSound();
  const box = event.target.parentElement;
  let box2 = box.parentElement;
  if (box2.id === "region-grid-container" || box2.id === "party-container" || box2.id === "group-sheet-container" || box2.id === "settings-window") {
    box2.style.display = 'none';
  } else if (box2.id === 'map-container') {
    showMap();
  } else if (box2.id === 'skill-tree') {
    togglePartyContainerDisplay('off');
    box2.style.display = 'none';
  } else {
    box2.remove();
  }
  
}



function minifyBox(event) {
    clickSound();
    const box = event.target.parentElement;
    let box2 = box.parentElement;

    let headerHeight = box.offsetHeight;

    let windowChildren = box2.children;
    console.log(windowChildren);



    const isMinified = box2.getAttribute('data-minified') === 'true';

    if (isMinified) {
      // Restore to original height
      box2.style.height = ''; // or set to 'auto' if you want to revert to natural height
      box2.style.overflow = '';
      box2.style.resize = '';
      box2.setAttribute('data-minified', 'false');
      event.target.textContent = '–';
      for (let i = 1 ; i < windowChildren.length ; i++) {
        windowChildren[i].style.display = '';
      }
    } else {
      // Minify the height
      const elementHeight = box2.offsetHeight;
      box2.style.height = `${headerHeight}px`;
      box2.style.minHeight = `${headerHeight}px`;
      box2.style.resize = 'none';
      box2.style.overflow = 'hidden';
      box2.setAttribute('data-minified', 'true');
      event.target.textContent = '＋';

      for (let i = 1 ; i < windowChildren.length ; i++) {
        windowChildren[i].style.display = 'none';
      }
    }
}




function enableDragAndDropWindow(element) {
  element.addEventListener('mousedown', dragStartWindow);
  // Prevent text selection when dragging starts
  element.style.userSelect = 'none';
}

document.addEventListener('mousemove', dragMoveWindow);
document.addEventListener('mouseup', dragEndWindow);

let isDraggingWindow = false;
let windowInitialX;
let windowInitialY;
let windowOffsetX = 0;
let windowOffsetY = 0;
let currentDraggedWindow; // Variable to store the currently dragged window

// Function to handle the start of the drag
function dragStartWindow(e) {

  removeCombatLine();
  
  if (e.target.classList.contains('close-button') || e.target.classList.contains('minify-button')) {
    return;
  }
  
  // Bring the clicked window to the front
  const clickedWindow = e.target.closest('.infobox');
  const windows = document.querySelectorAll('.infobox');
  
  if (clickedWindow) {
    // Set a high z-index for the clicked window
    clickedWindow.style.zIndex = '9999';
    clickedWindow.classList.remove('inactive-infobox');
    
    
    // Loop through all windows
    windows.forEach(window => {
      // Skip the clicked window
      if (window !== clickedWindow) {
        // Give lower z-index to other windows
        window.style.zIndex = '9';
        window.classList.add('inactive-infobox');
      }
    });
  }
  
  isDraggingWindow = true;
  windowOffsetX = e.clientX - e.target.getBoundingClientRect().left;
  windowOffsetY = e.clientY - e.target.getBoundingClientRect().top;
  currentDraggedWindow = e.target.parentElement; // Store the currently dragged window
  // Prevent text selection when dragging starts
  e.preventDefault();
}

// Function to handle the actual drag
function dragMoveWindow(e) {
  if (isDraggingWindow) {
    const newX = e.clientX - windowOffsetX;
    const newY = e.clientY - windowOffsetY;
    
    // Get the viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calculate the boundaries for the dragged element
    const elementWidth = currentDraggedWindow.offsetWidth;
    const elementHeight = currentDraggedWindow.offsetHeight;
    const minX = 0;
    const minY = 0;
    const maxX = viewportWidth - elementWidth;
    const maxY = viewportHeight - elementHeight;
    
    // Ensure the dragged element stays within the viewport boundaries
    const boundedX = Math.max(minX, Math.min(newX, maxX));
    const boundedY = Math.max(minY, Math.min(newY, maxY));
    
    currentDraggedWindow.style.left = `${boundedX}px`;
    currentDraggedWindow.style.top = `${boundedY}px`;
    
  }
}

// Function to handle the end of the drag
function dragEndWindow() {
  isDraggingWindow = false;
  windowOffsetX = 0;
  windowOffsetY = 0;
}

document.body.addEventListener('click', function(event) {

  const clickedWindow = event.target.closest('.infobox');
    bringInfoboxUpward(clickedWindow);

});


function bringInfoboxUpward(clickedWindow) {
    // Bring the clicked window to the front

    const windows = document.querySelectorAll('.infobox');
    
    if (clickedWindow) {
      // Set a high z-index for the clicked window
      clickedWindow.style.zIndex = '99';
      clickedWindow.classList.remove('inactive-infobox');
      
      
      // Loop through all windows
      windows.forEach(window => {
        // Skip the clicked window
        if (window !== clickedWindow) {
          // Give lower z-index to other windows
          window.style.zIndex = '9';
          window.classList.add('inactive-infobox');
        }
      });
    }
}



