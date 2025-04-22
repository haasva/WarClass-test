const DAY_DURATION = 24;
const DAYTIME_START_HOUR = 6;
const DAYTIME_END_HOUR = 20;
const NIGHT_COLOR = 'blue';
const DAY_COLOR = 'yellow';

let DAY_NIGHT_CYCLE_MESSAGE_SENT = false;

let CURRENT_WEATHER = [];
CURRENT_WEATHER.rain = false;
CURRENT_WEATHER.snow = false;
CURRENT_WEATHER.mist = false;
CURRENT_WEATHER.storm = false;



function getCurrentTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

let currentHour = 12;
let currentMinute = 0;
let currentDay = 1;
let isNight = false;
let REAL_TIME = 2000;

let realTimeInterval;
let entitiesMovementInterval;



function startRealTime() {
  realTimeInterval = setInterval(realTime, REAL_TIME);

}

function stopRealTime() {
  clearInterval(realTimeInterval);
}

function getRealTime(value) {
  let REAL_TIME = value;
  return REAL_TIME;
}

let lastCheckedMinute = 0; // Tracks the last time these functions were called

function waitTime(value) {
realTime(value);
}






async function realTime(time) {
    // Increment currentMinute based on input or default
    if (time) {
        currentMinute += time;
    } else {
        currentMinute += SETTINGS.timePerCell;
        fatigueOverTime();
    }
    updateAudio();

        // Call the functions
        await moveOtherGroupInObservedCells();
        await updateGroupDirection();
        await moveAnimalsInMap();



    // Handle hour rollover
    if (currentMinute > 59) {
        currentMinute = 0;
        currentHour += 1;
        
        updateWeather();
        // otherGroupMovements();
    }

    // Handle day rollover
    if (currentHour >= 24) {
        currentHour = 0;
        updateDayNumber();
    }

    // Update other time-related features
    updateTimeOfDay();
    updateClockHandRotation();
    updateInterface();
}





function updateClockHandRotation() {
  const totalMinutes = currentHour * 60 + currentMinute;
  const rotationDegrees = (totalMinutes % (24 * 60)) * 0.25; // 0.5 degrees per minute
  const timeCircle = document.getElementById('time-of-day-bar');
  timeCircle.style.transform = `rotate(${rotationDegrees}deg)`;
}


function updateTimeOfDay() {

  const timeIndicator = document.getElementById('time-indicator');
  const timeOfDayBar = document.getElementById('time-of-day-bar');
  const hourElement = document.getElementById('current-hour');
  const timeOfDayElement = document.getElementById('current-time-of-day');
  const totalHours = DAY_DURATION;
  const hourWidth = timeOfDayBar.clientWidth / totalHours;
  const indicatorPosition = hourWidth * currentHour - 15;
  timeIndicator.style.left = `${indicatorPosition}px`;

  const isNightTime = currentHour < DAYTIME_START_HOUR || currentHour >= DAYTIME_END_HOUR;
  timeOfDayBar.style.backgroundColor = isNightTime ? NIGHT_COLOR : DAY_COLOR;

  


  if (currentMinute < 10) {
    hourElement.textContent = `${currentHour.toString()}:0${currentMinute.toString()}`;
  } else {
    hourElement.textContent = `${currentHour.toString()}:${currentMinute.toString()}`;
  }

  timeOfDayElement.textContent = isNightTime ? 'Night' : 'Day';
  
  if (currentHour === 18) {
    DAY_NIGHT_CYCLE_MESSAGE_SENT = false;
  }
  
  if (DAY_NIGHT_CYCLE_MESSAGE_SENT === false) {
    displayTimeChangeMessage();
  }


    
  		  currentHour = (currentHour) % DAY_DURATION;
	  	

  if (isNightTime) {
   
    const game = document.getElementById('table-container');
    const nightFilter = document.getElementById('region-grid-filter');
    
    if (game) {
      if (!game.classList.contains('nighttime')) { 
        game.classList.add('nighttime'); 
        nightFilter.style.opacity = '1';
      }
    }



  } else{
    const game = document.getElementById('table-container');
    if (game) {
   
      if (game.classList.contains('nighttime') && game) { 
        game.classList.remove('nighttime'); 
        game.classList.add('daytime'); 
        const nightFilter = document.getElementById('region-grid-filter');
        nightFilter.style.opacity = '0';
      }
    }


  }
}


function formatHour(hour) {
  if (currentMinute >= 10) {
  return hour.toString().padStart(2, '0') + `:${currentMinute}`;
  } else {
  return hour.toString().padStart(2, '0') + `:0${currentMinute}`;  
  }
}

function displayTimeChangeMessage() {
  const messageElement = document.getElementById('time-change-message');
  const isNightTime = currentHour < DAYTIME_START_HOUR || currentHour >= DAYTIME_END_HOUR;

  if (currentHour === DAYTIME_START_HOUR || currentHour === DAYTIME_END_HOUR) {

    const message = isNightTime ? 'Night falls.' : 'The sun arises.';
    const value = isNightTime ? 'night' : 'day';
    playDayNightCycleSound(value);
    displayMessage(`${message}`, 'beige');

    DAY_NIGHT_CYCLE_MESSAGE_SENT = true;

  }
}

function updateDayNumber() {

  DAY_NIGHT_CYCLE_MESSAGE_SENT = false;
    // A new day has started
    currentDay++;
    displayMessage(`A new day has started.`, 'beige');

    manageUpkeep();
	
const audio = new Audio("/Sounds/newday.wav");
audio.volume = 0.15;
audio.play();

const dayNumberElement = document.getElementById('day-number');
dayNumberElement.textContent = currentDay;
updateGlobalEntropy();
updateGroupSheet();
}


function manageUpkeep() {
  consumeFood();
	updateFoodDisplay();
  goldUpkeep();
}


function goldUpkeep() {
  let goldLost = 0;
  const group = Array.from(groupAdventurers.values());

  group.forEach(adventurer => {
    goldLost += adventurer.upkeep;
  });

  groupCoins -= goldLost;

  if (groupCoins < 0) { groupCoins = 0; }

  groupCoins = Math.round(groupCoins);

  displayMessage(`Upkeep for our group - we lose ${goldLost} coins.`);
  
  updateCoinsDisplay();
}






function isNightTime() {
  if ((currentHour >= 0 && currentHour <= 5) || (currentHour >= 20 && currentHour <= 24)) {
    isNight = true;
  } else {
    isNight = false;
  }

  return isNight
}


function getCurrentHour() {
  const currentDate = new Date();
  return currentDate.getHours();
}





function updateWeather() {
  let ran = Math.floor(Math.random() * 100);
  let gameCont = document.getElementById('region-grid-container');

  let rainChance = 10;

  if (CURRENT_PLAYER_REGION_DATA.climate = 'temperate') {
    rainChance = 25;
  }
  if (CURRENT_PLAYER_REGION_DATA.climate = 'arid') {
    rainChance = 10;
  }
  if (CURRENT_PLAYER_REGION_DATA.climate = 'tropical') {
    rainChance = 60;
  }
  if (CURRENT_PLAYER_REGION_DATA.climate = 'arctic') {
    rainChance = 75;
  }

  if (CURRENT_WEATHER.rain) {
    if (ran < 20) {
      CURRENT_WEATHER.rain = false;
      displayMessage(`Rain has stopped.`, 'beige');
      gameCont.classList.remove('rain');
    }
  } else {
    if (ran <= rainChance) {
      CURRENT_WEATHER.rain = true;
      displayMessage(`It starts raining.`, 'beige');
      gameCont.classList.add('rain');
    }
  }
  updateRegionModifiers();
}



function movementOfEntities() {
  const entities = observedCells.filter(cell => cell.classList.contains('other-group'));
  

  if (entities.length === 0) return;

  entities.forEach(entity => {
    // Ensure the entity has a position style to adjust
    const currentLeft = parseInt(window.getComputedStyle(entity).left, 10) || 0;
    const currentTop = parseInt(window.getComputedStyle(entity).top, 10) || 0;

    // Retrieve or initialize entity's movement direction
    let direction = entity.dataset.direction
      ? parseFloat(entity.dataset.direction)
      : Math.random() * 360;

    // 10% chance to change direction
    if (Math.random() <= 0.1) {
      direction += (Math.random() * 60 - 30); // Randomly adjust direction by ±30 degrees
    }

    // Normalize direction to be within 0-360 degrees
    if (direction < 0) direction += 360;
    if (direction >= 360) direction -= 360;

    // Store the updated direction back to the entity's dataset
    entity.dataset.direction = direction;

    // Convert direction to movement vector
    const radians = (direction * Math.PI) / 180;
    const moveX = Math.cos(radians) * 4; // Speed can be adjusted
    const moveY = Math.sin(radians) * 4; // Speed can be adjusted

    // Apply the movement
    const child = entity.querySelector('.sprites-container');
    child.style.left = `${currentLeft + moveX}px`;
    child.style.top = `${currentTop + moveY}px`;

  });
}



function updateGlobalEntropy() {
  CURRENT_PLAYER_REGION_DATA.groups.forEach(group => {
    group.attributes.entropy += 1;
  });
  GROUP_ATTRIBUTES.entropy += 1;
}




