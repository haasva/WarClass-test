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