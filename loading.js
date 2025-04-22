let vegetationObject;
let buildingsObject;
let worldJSONData = '';




function requestFullScreen() {
  const elem = document.documentElement;
  
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) { // Firefox
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) { // Chrome, Safari and Opera
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) { // IE/Edge
    elem.msRequestFullscreen();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  
    loadGameData();
    updateFatigueDisplay();
    
  }, { once: true });


  function loadGameData() {
    
    loadLoadingScreenTemplate('/Templates/loading_screen.html').then(() => {
      document.body.style.opacity = '1';
      localStorage.clear();
      
      const tasks = [
        wrapFunctionWithPromise(loadRegionJSON, 'loadRegionJSON', 'regions'), //
        wrapFunctionWithPromise(loadSettlementsJSON, 'loadSettlementsJSON', 'settlements'),
        wrapFunctionWithPromise(fetchWeaponData, 'fetchWeaponData', 'weapons'),
        wrapFunctionWithPromise(loadAdventurersJSON, 'loadAdventurersJSON', 'adventurers'), //
        wrapFunctionWithPromise(fetchAnimalsData, 'fetchAnimalsData', 'animals '), //
        wrapFunctionWithPromise(loadLandmassData, 'loadLandmassData', 'overworld data'), //
        wrapFunctionWithPromise(loadGroupClassesJSON, 'loadGroupClassesJSON', 'group classes'), //
        wrapFunctionWithPromise(fetchVegetationData, 'fetchVegetationData', 'vegetation data'), //
        wrapFunctionWithPromise(fetchBuildingsData, 'fetchBuildingsData', 'buildings data'), //
        wrapFunctionWithPromise(preGenerateWorldData, 'preGenerateWorldData', 'world data'), //
        wrapFunctionWithPromise(parseCulturalData, 'parseCulturalData', 'cultural data'), //
        wrapFunctionWithPromise(fetchItemsData, 'fetchItemsData', 'items') //
      ];
  
      const totalTasks = tasks.length;
      let progress = 0;
      updateProgressBar(progress, totalTasks);
  
      tasks.reduce((promise, task) => {
        return promise.then(() => {
          return task().then(() => {
            progress += 1;
            updateProgressBar(progress, totalTasks);
          });
        });
      }, Promise.resolve())
      .then(() => {
        removeLoadingScreen();
      })
      .catch((error) => {
        console.error('Error loading data:', error);
        // Handle loading error (e.g., show an error message)
      });
    });
  }

  function updateProgressBar(value, max) {
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
      progressBar.max = max;
      progressBar.value = value;
    }
  }

  async function loadLoadingScreenTemplate(url) {
    try {
          const response = await fetch(url);
          const html = await response.text();
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = html;
          document.body.appendChild(tempDiv.firstElementChild);
      } catch (error) {
          console.error('Error loading the loading screen template:', error);
      }
  }
  
  function removeLoadingScreen() {
    //playTitleMusic();
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.remove();
    welcomeToWarClass();
    // teleportPlayer(122, 317);
  }

  function wrapFunctionWithPromise(func, funcName, text) {
    return function() {
      console.log(`Loading ${text}...`);
      let loadingText = document.getElementById('loading-text');
      loadingText.textContent = `Loading ${text}...`;

      return func().then(() => {
        console.log(`${funcName} completed`);
      });
    }
  }









  function welcomeToWarClass() {
    const gameContainer = document.getElementById('region-grid-container');
    gameContainer.style.display = "none";
  
    const welcomeSplash = document.createElement('div');
    welcomeSplash.setAttribute('id', 'welcome-splash');
  
    const title = document.createElement('div');
    title.setAttribute('id', 'title-splash');

    const titleText = document.createElement('div');
    titleText.setAttribute('id', 'title-text');
    titleText.textContent = "WarClass";
    
    document.body.append(welcomeSplash);
    document.body.style.animation = "";
  
    const mapContainer = document.getElementById('map-container');
    slider.scrollLeft = 500;
    slider.scrollTop = 200;
    mapContainer.style.zIndex = '-1';
    mapContainer.style.width = '100dvw';
    mapContainer.style.height = '100dvh';
    const mapHeader = mapContainer.querySelector('#map-header');
    mapHeader.style.display = 'none';
  
    welcomeSplash.addEventListener("click", () => removeSplashScreen());
    welcomeSplash.addEventListener("touch", () => removeSplashScreen());

    const loreText = document.createElement('div');
    loreText.setAttribute('id', 'lore-text-intro');
  
    welcomeSplash.appendChild(title);
    title.appendChild(titleText)
    welcomeSplash.appendChild(loreText);

    loadLoreText('/Templates/introduction.html', loreText)

    async function loadLoreText(url, loreBox) {
      try {
            const response = await fetch(url);
            const html = await response.text();
            loreBox.innerHTML = html;
        } catch (error) {
            console.error('Error loading the loading screen template:', error);
        }
    }
  
  }
  
  function removeSplashScreen() {
    requestFullScreen();
    const welcomeSplash = document.getElementById('welcome-splash');
    welcomeSplash.remove();
  
    document.body.style.backgroundImage = "url('bodybg2.jpg')";
    // playerGroupClassChoice();
    chooseStartingArea();
    generateContract();
    displayContractsSelections();
    //stopTitleMusic();
  }




function chooseStartingArea() {
  const mapContainer = document.getElementById('map-container');
  mapContainer.style.zIndex = '';
  const mapHeader = mapContainer.querySelector('#map-header');
  mapHeader.style.display = 'block';
  enableStartingAreas();
}









































function fetchVegetationData() {
    return fetch('/JSONData/vegetation.json')
      .then(response => response.json())
      .then(data => {
        // Assuming 'data' is an array of objects in 'factions.json'
        vegetationObject = data.map(vegetation => ({
          name: vegetation.name,
          description: vegetation.description,
          population: vegetation.population,
        }));
        console.log('vegetation data', vegetationObject);
        return vegetationObject;
      })
      .catch(error => {
        console.error('Error fetching vegetation data:', error);
        return null;
      });
}


async function fetchBuildingsData() {
  return fetch('/JSONData/buildings.json')
    .then(response => response.json())
    .then(data => {
      // Assuming 'data' is an array of objects in 'factions.json'
      buildingsObject = data.map(building => ({
        name: building.Name,
        type: building.Type,
        regions: building.Regions,
      }));
      console.log('buildings data', buildingsObject);
      return buildingsObject;
    })
    .catch(error => {
      console.error('Error fetching buildings data:', error);
      return null;
    });
}