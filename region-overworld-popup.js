function displayRegionClickPopup(event, cell, region, y, x) {
    console.log(region);
    playOpenRegionSound();
    let existingPopup = document.getElementById('region-popup-container');
    if (existingPopup) {
        existingPopup.remove();
    }
    const overworld = document.getElementById('overworld');
    const selectedCells = overworld.querySelectorAll('.selected');
    selectedCells.forEach(cell => {
        cell.classList.remove('selected');
    });

    cell.classList.add('selected');

    let regionPopup = document.createElement('div');

    regionPopup.setAttribute('id', 'region-popup-container');

    fetch('/Templates/region-popup.html')
    .then(response => response.text())
    .then(template => {
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = template;

        // Append combat zone elements
        const elements = tempContainer.children;
        for (const element of elements) {
            regionPopup.appendChild(element);
        }
        const mapTabContent = document.getElementById('map-content-left');
        mapTabContent.appendChild(regionPopup);
        regionPopup.style.opacity = '1';
        populateRegionPopup(region, regionPopup, y, x);

        const regionHeader = document.createElement('div');
        regionHeader.innerHTML = 'Selected Region';
        regionHeader.classList.add('infobox-header');
        regionPopup.prepend(regionHeader);
        addCloseButton(regionHeader);


        const teleportButton = document.createElement('button');
        teleportButton.setAttribute('onclick', `teleportPlayer(${y}, ${x})`);
        teleportButton.innerText = `Move to this region`;
        regionPopup.append(teleportButton);


    })
    .catch(error => {
        console.error('Error loading template:', error);
    });
}

function populateRegionPopup(region, container, y, x) {
    const areaData = areasObject[region.superRegion];
    container.querySelector('.title').textContent = 'Region of ' + region.superRegion;
    container.querySelector('.terrain').textContent = region.terrain + ` (${region.coast})`;
    container.querySelector('.climate').textContent = region.climate;
    container.querySelector('.vegetation').textContent = region.vegetation;
    container.querySelector('.faction').textContent = areaData.faction;
    container.querySelector('.pop').textContent = region.population;
    container.querySelector('.index').textContent = region.index;
    container.querySelector('.level').textContent = region.level;
  
    // Clear existing cultures
    const culturesContainer = container.querySelector('#cultures');
  
    // Create and append new culture elements
    const culturesArray = areaData.cultures.split(',');
    culturesArray.forEach(culture => {
      const cultureDiv = document.createElement('div');
      cultureDiv.className = 'info-data cultures';
      cultureDiv.textContent = culture.trim(); // Trim any extra whitespace
      culturesContainer.appendChild(cultureDiv);
    });
  
    if (areaData) {
      const header = container.querySelector('.title');
      header.style.backgroundImage = `url('/Art/Vegetation/${region.vegetation}.png')`;
    }
  
    const regionPic = localStorage.getItem(`region-${region.index}-pic`);
  
    if (regionPic) {
      container.querySelector('.snapshot').style.backgroundImage = `url(${regionPic})`;
    }
  
    const vegetationElement = container.querySelector('.vegetation');
    addVegetationTooltip(vegetationElement, region.vegetation);

    let actualRegion = worldData[y][x];
    if (actualRegion.groups) {
      let groupsContainer = container.querySelector('.groups')
      console.log(actualRegion.groups);

      for (let i = 0; i < actualRegion.groups.length; i++) {
        const box = document.createElement('div');
        box.classList.add('box-group');
        const gID = actualRegion.groups[i].gID;
        box.setAttribute('gID', gID);
        box.textContent = `${[i]}`;
        groupsContainer.appendChild(box);
        addOtherGroupTooltip(box, actualRegion.groups[i]);
        box.addEventListener('click', function(event) {
          displayThisGroupAttributes(event, actualRegion.groups[i]);
        });
    }
    }
  }


function addVegetationTooltip(element, vegetation) {

            // Find the description based on region.vegetation
            const regionVegetation = vegetation;
            const vegetationData = vegetationObject.find(veg => veg.name === regionVegetation);
            
            // If vegetation data is found, add the tooltip with the description
            if (vegetationData) {
                element.addEventListener('mouseover', function(event) {
                addGenericTooltip(element, vegetationData.description);
              });
            } else {
              console.error('Vegetation data not found for', regionVegetation);
            }
 
}


function makeASnapshot() { 
    const regionTable = document.getElementById('region-grid-table');
    const tableContainer = document.getElementById('table-container');

    tableContainer.style.transform = 'none';
    tableContainer.style.tranlate = '0px';
    regionTable.style.transform = 'none';

    const children = document.querySelectorAll('#region-grid-table td');
    for (let i = 0; i < children.length; i++) {
      children[i].style.visibility = "visible";
    }

    html2canvas(regionTable).then(canvas => {
        // Convert the canvas to a data URL
        const imageDataURL = canvas.toDataURL('image/png');
        
        // Display the image
        addImageToData(imageDataURL);
    });
    setTimeout(() => {
        centerPOVGroup();
    }, 100); // Adjust the timing as needed
}



function addImageToData(url) {
    const regionPic = url;
    const screenshot = document.getElementById('screenshot');
    screenshot.style.backgroundImage = `url(${url}`;
}












