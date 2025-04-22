let settlements = [];
let settlementsMap = new Map();

let animals = [];
let animalsMap = new Map();

let currentSettlement;


function fetchAnimalsData() {
  return new Promise((resolve) => {
    console.log('Loading Animals JSON...');
    setTimeout(() => {
    fetch('/JSONData/animals.json')
      .then(response => response.json())
      .then(data => {
        animals = data;
        animalsMap = new Map(data.map(animal => [
            animal.name, 
            animal]));
        console.log('Animals data:', animals);
        console.log('Animals map:', animalsMap);

        animals.forEach(animal => {
          animal.attack = Math.round((animal.attack - 8) / 5);
          animal.level = 1;
          animal.life = Math.round(animal.life / 5);
        });
  
        createAnimalsMap();

      })
      .catch(error => {
        console.error('Error loading Animals JSON:', error);
      });
    console.log('Animals JSON loaded');
    resolve();
  }, 200); // Simulate async loading
});
}

function createAnimalsMap() {
  const map = {};
  animals.forEach(animal => {
    map[animal.name] = animal;
  });
  return map;
}

function levelUpAnimal(animal) {
    animal.level++;
    animal.attack = animal.attack + 2;
    animal.life = animal.life + 2;
}


function loadSettlementsJSON() {
  return new Promise((resolve) => {
    console.log('Loading Region JSON...');
    setTimeout(() => {
    fetch('/JSONData/settlements.json')
      .then(response => response.json())
      .then(data => {
        settlements = data;
        settlementsMap = new Map(data.map(settlement => [
            settlement.Name, 
            settlement]));
        console.log('Settlements data:', settlements);
        console.log('Settlements map:', settlementsMap);
  
        // After loading the data, call the pickGroupClass function
        createsettlementsMap();
        
      })
      .catch(error => {
        console.error('Error loading Group Classes JSON:', error);
      });

    console.log('Region JSON loaded');
    resolve();
  }, 200); // Simulate async loading
});
}

function createsettlementsMap() {
    const map = {};
    settlements.forEach(settlement => {
      map[settlement.Name] = settlement;
    });
    return map;
}







function randomEvent () {
    const ranN = Math.floor(Math.random() * 6) + 1;

    if ( ranN === 4 && isInCombat === false) {
  
      isInEvent = true;
      setTimeout(() => {
        enemyEvent();
      }, "100");
    } else {
      return;
    }
  }





  function pickRandomSettlement() {
    const matchingSettlements = settlements.filter((settlement) => {
      // Check if the Terrain value matches the activeRegion Type
      const terrainWords = settlement.Terrain ? settlement.Terrain.split(',').map(word => word.trim()) : [];
      if (terrainWords.length > 0 && !terrainWords.includes(activeRegion.Type)) {
        return false;
      }
  
      // Check if the Areas value matches the currentArea name
      const areaWords = settlement.Areas ? settlement.Areas.split(',').map(word => word.trim()) : [];
      if (areaWords.length > 0 && !areaWords.includes(areasObject[currentArea].name) && !areaWords.includes(groupAreaDirection.name)) {
        return false;
      }
  
      return true;
    });
  
    // Pick a random settlement from the filtered list
    if (matchingSettlements.length > 0) {
      const randomIndex = Math.floor(Math.random() * matchingSettlements.length);
      currentSettlement = matchingSettlements[randomIndex];
      console.log('MATCH SETTLEMENT', currentSettlement);
      settlementEvent(currentSettlement);
    } else {
      console.log('No matching settlements found');
      closeEvent();
      // You can handle the case when no matching settlements are found here
    }
  }
  



  function startsWithVowel(word) {
    return /^[aeiou]/i.test(word);
  }

function settlementEvent (currentSettlement) {

    console.log(currentSettlement);
    const settlementName = currentSettlement.Name;

    if (startsWithVowel(settlementName)) {
      displayMessage(`We discover an ${settlementName}!`, '#eb4343');
    } else {
      displayMessage(`We discover a ${settlementName}!`, '#eb4343');
    }

    const settlementEvent = document.createElement('div');
    settlementEvent.setAttribute('id', 'settlement-event-popup');
    settlementEvent.innerHTML = `
    <div id="settlement-pic"></div>
    <div>
    We find a settlement: <span style="color:orange">${currentSettlement.Name}</span>!
    </div>
    `;
    const continueButton = document.createElement('button');
    continueButton.setAttribute('id', 'continue-button');
    continueButton.textContent = `CONTINUE`;
    settlementEvent.appendChild(continueButton);
    document.body.appendChild(settlementEvent);
    const settlementPic = document.getElementById('settlement-pic');
    settlementPic.style.backgroundImage = `url('/Art/Settlements/${currentSettlement.Name.toLowerCase()}.png`;
    continueButton.addEventListener("click", function () {
        closeEvent(settlementEvent);
      });
}


function closeEvent(element) {
    disableActionsButtons(isInCombat);
    if (element) { 
        element.remove();
    }
    isInCombat = false;
    isInEvent = false;
}