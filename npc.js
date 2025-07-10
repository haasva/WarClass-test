let npcObject;

function fetchNpcData() {
  return fetch('/JSONData/npc.json')
    .then(response => response.json())
    .then(data => {
      // Assuming 'data' is an array of objects in 'factions.json'
      npcObject = data;
      console.log('npc data', npcObject);
      return factionsObject;
    })
    .catch(error => {
      console.error('Error fetching npc data:', error);
      return null;
    });
}


function nameRandom() {
  let randomName = '';
  const consCap = [ 'B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Z']
  const consLow = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'z']
  const vowelsCap = ['A', 'E', 'I', 'O', 'U', 'Y'];
  const vowelsLow = ['a', 'e', 'i', 'o', 'u', 'y'];
  const nameLength = Math.floor(Math.random()*7) + 3;
  function consCapGen() {
     return consCap[Math.floor(Math.random()*20)]
  }
  function consLowGen() {
    return consLow[Math.floor(Math.random()*20)]
  }
  function vowelCapGen() {
    return vowelsCap[Math.floor(Math.random()*6)]
  }
  function vowelLowGen() {
    return vowelsLow[Math.floor(Math.random()*6)]
  }
  if (nameLength === 3) {
    randomName = `${vowelCapGen()}${consLowGen()}${vowelLowGen()}`;
  } else if (nameLength === 4) {
    randomName =`${consCapGen()}${vowelLowGen()}${consLowGen()}${vowelLowGen()}`;
  } else if (nameLength === 5) {
    randomName = `${vowelCapGen()}${consLowGen()}${vowelLowGen()}${consLowGen()}${vowelLowGen()}`;
  } else if (nameLength === 6) {
    randomName = `${consCapGen()}${vowelLowGen()}${consLowGen()}${vowelLowGen()}${vowelLowGen()}${consLowGen()}`;
  } else if (nameLength === 7) {
    randomName = `${vowelCapGen()}${vowelLowGen()}${consLowGen()}${vowelLowGen()}${consLowGen()}${vowelLowGen()}${consLowGen()}`;
  } else if (nameLength === 8) {
    randomName = `${consCapGen()}${vowelLowGen()}${consLowGen()}${vowelLowGen()}${consLowGen()}${vowelLowGen()}${consLowGen()}${vowelLowGen()}`;
  } else if (nameLength === 9) {
    randomName = `${vowelCapGen()}${consLowGen()}${vowelLowGen()}${consLowGen()}${vowelLowGen()}${vowelLowGen()}${consLowGen()}${vowelLowGen()}${vowelLowGen()}`;
  };
  return randomName;
};


function generateNpc(region, x, y) {
  let npc = {};

  npc.name = nameRandom();
  npc.life = Math.floor(Math.random() * 75) + 25;
  npc.id = x * 75 + y;
  npc.faction = region.factions;

  console.log(region);

  const ranType = Math.floor(Math.random() * npcObject.length);
  npc.class = npcObject[ranType].class;

  const imgRange = npcObject[ranType].var;

  const imgNb = Math.floor(Math.random() * imgRange) + 1;
  npc.img = `url('/Art/People/${npcObject[ranType].class}/${imgNb}.png')`;

  npc.text = npcObject[ranType].text || "Greetings!";

  const cultureWords = region.cultures ? region.cultures.split(',').map(word => word.trim()) : [];
  const ranCulture = Math.floor(Math.random() * cultureWords.length);


  npc.culture = `${cultureWords[ranCulture]}`;

  return npc;
}




function createNpcWindow(npc) {
document.getElementById(`npc-window`)?.remove();

  const window = document.createElement('div');
  window.setAttribute('id', `npc-window`);
  window.classList.add(`infobox`);

  const header = document.createElement('div');
  header.innerHTML = `${npc.name}`;
  header.classList.add('infobox-header');
  window.appendChild(header);
  enableDragAndDropWindow(header);
  addCloseButton(header);

  const content = document.createElement('div');
  content.classList.add('infobox-content');

      fetch('/Templates/npc-dialogue.html')
        .then(response => response.text())
        .then(template => {
            content.innerHTML = template;

              content.querySelector('.culture').textContent = `${npc.culture}`;
              content.querySelector('.faction').textContent = `${npc.faction}`;
              content.querySelector('.life').textContent = `${npc.life}`;
              content.querySelector('.class').textContent = `${npc.class}`;
              typeText(content.querySelector('.text'), npc.text);
        })
        .catch(error => {
            console.error('Error loading template:', error);
        });
  window.appendChild(content);
  document.body.appendChild(window);
}


function typeText(content, text, speed = 28) {

  content.textContent = ''; // Clear previous content

  let i = 0;
  function typeChar() {
    if (i < text.length) {
      content.textContent += text[i];
      i++;
      setTimeout(typeChar, speed);
    }
  }

  typeChar();
}