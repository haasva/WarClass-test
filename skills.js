const typeColors = {
    Outlaw: '#f9d42e',
    Slave: '#b5b5b5',
    Commoner: '#ada935',
    Religious: '#f880ec',
    Explorer: '#01dd9f',
    Soldier: '#926f59',
    Noble: '#de1718',
    Intellectual: '#0188ff',
    General: '#ffffff'
};

let PLAYER_SKILLS = [];
let ACTIVE_SKILLS = new Set();

function getSignatureSkills() {
    let skillsFromSignatures = [];
    PLAYER_SKILLS = [];
    let group = Array.from(groupAdventurers.values());

    group.forEach(adventurer => {
        if (adventurer.Signature != '') {
            skillsFromSignatures.push(adventurer.Signature);
        }
    });

    skillsFromSignatures.forEach(skillName => {
        const skill = skillsObject[skillName];
        if (skill) {
            PLAYER_SKILLS.push(skill);
        }
    });

    console.log('Skills-- : ', PLAYER_SKILLS);

}


function updateSkillsBox() {
    let skillBox = document.getElementById('skill-box');
    if (!skillBox) { return; }
    let skillList = skillBox.querySelector('#skill-list');

    let header = skillBox.querySelector('#skill-header');
    header.textContent = `Skills (${PLAYER_SKILLS.length})`;

    skillList.innerHTML = '';

    PLAYER_SKILLS.forEach(skill => {
        if (skill) {
            const skillElement = document.createElement('div');
            skillElement.className = 'skill';
            skillElement.classList.add('skill-ready');
            skillElement.classList.add(`${skill.rarity}`);
            skillElement.classList.add(`${skill.type}`);
            skillElement.setAttribute('type', `${skill.type}`);
            skillElement.innerHTML = skill.name;
            skillElement.style.backgroundImage = `url('/Art/Skills/${skill.name}.png')`;
            skillElement.style.position = 'relative';

            skillElement.draggable = true;

            skillElement.addEventListener('dragstart', dragStartSkill);
            skillElement.addEventListener('dragend', dragEndSkill);

            skillElement.addEventListener('mouseover', function(event) {
                displaySkillTooltip(event);
              });

              skillElement.addEventListener('mouseout', function(event) {
                removeSkillTooltip();
              });

            skillList.appendChild(skillElement);

            let uniqueId = 'skill-' + Math.floor(Math.random() * 9999 + 1);
            skillElement.id = uniqueId;
        }
    });
}

function createSkillBox() {
    //getSignatureSkills();
    updateSkillsBox();

    let skillBox = document.createElement('div');
    skillBox.setAttribute('id', 'skill-box');

    let header = document.createElement('div');
    header.setAttribute('id', 'skill-header');
    header.classList.add('infobox-header');
    header.textContent = `Skills (${PLAYER_SKILLS.length})`;

    let skillList = document.createElement('div');
    skillList.setAttribute('id', 'skill-list');

    skillBox.appendChild(skillList);
    skillBox.prepend(header);

    const bagpack = document.getElementById('backpack');
    const skillsBag = document.querySelector('#backpack-skills');

    if (!skillsBag) { return;}

    skillsBag.appendChild(skillBox);

    

}

function dragEndSkill(event) {
    updateSkillsBox();
}

function dragStartSkill(event, slot, skillElement) {

  if (slot) {
    slot.classList.add('empty');
  }


    event.dataTransfer.setData('text/plain', event.target.id);

    playJewelSound();

    activateAllSkillSlots();

    removeAllKindsOfTooltips();

    let skillsTooltip = document.getElementsByClassName('skill-tooltip');
    if (skillsTooltip) {
        Array.from(skillsTooltip).forEach(tooltip => {
            tooltip.remove();
        });
    }
}

function dragOverSkill(event) {
    event.preventDefault();
    removeAllKindsOfTooltips();
}

function dropSkill(event) {
  event.preventDefault();

  const id = event.dataTransfer.getData('text/plain');
  const draggedSkill = document.getElementById(id);

  const targetSlot = cachedSkillSlots.find(cell => cell.contains(event.target));

  if (!draggedSkill) {
      console.error("Invalid dragged skill");
      return;
  }
  if (id === '') {
      console.error("id === ''");
      return;
  }
  if (!targetSlot) {
      console.error("Invalid target slot.");
      return;
  }

  // Check if the target slot can accept the skill

  if (
      targetSlot.classList.contains('empty') &&
      (targetSlot.getAttribute('type') === draggedSkill.getAttribute('type') ||
       targetSlot.getAttribute('type') === 'General' ||
       draggedSkill.getAttribute('type') === 'General')
  ) {
    const skillText = draggedSkill.textContent.trim();
      // Remove the skill from its current slot
      const currentSlot = draggedSkill.parentElement;
      if (currentSlot && currentSlot.classList.contains('skill-slot')) {
          currentSlot.classList.add('empty');
          currentSlot.innerHTML = ''; // Clear the current slot

          const parentAdvUID = draggedSkill.getAttribute('attached-adventurer');
          const parentAdventurer = findAdventurerByUID(parentAdvUID);
 
          if (parentAdventurer) {
            parentAdventurer.Skills = parentAdventurer.Skills.filter(sk => sk.name !== skillText);
            console.log(parentAdventurer);
          }
      }

      targetSlot.classList.remove('empty');

      // Update adventurer's skill list
      const targetAdventurerElement = targetSlot.closest('.adv-box');
      if (targetAdventurerElement) {
          const targetUID = targetAdventurerElement.getAttribute('uid');
          const adventurer = findAdventurerByUID(targetUID);


          if (adventurer) {
              const skill = skillsObject[skillText];
              adventurer.Skills.push(skill);

              playSkillSound(skill.type);

              // Update player skills
              PLAYER_SKILLS = PLAYER_SKILLS.filter(skill => skill.name !== skillText);


       

              updateInterface(); // Minimize this call if not necessary

              // Add skill to the new slot
              addSkillToSlot(skill, id, targetSlot, adventurer);
              updateActiveSkills();
 

              // Refresh cached skill slots
              cachedSkillSlots = Array.from(document.getElementsByClassName('skill-slot'));
          }
      }
  } else {
      console.warn("Skill drop not allowed in this slot.");
  }


}

function addSkillToSlot(skill, skillID, slot, adventurer) {
  adventurer.Skills = adventurer.Skills.filter(sk => sk.name !== skill.name);
  adventurer.Skills.push(skill);
  
  const skillElement = document.createElement('div');
  skillElement.className = 'skill skill-ready';
  skillElement.classList.add(skill.rarity, skill.type);
  skillElement.setAttribute('type', skill.type);
  skillElement.id = `${skillID}`;
  skillElement.innerHTML = skill.name;
  skillElement.setAttribute('attached-adventurer', `${adventurer.uID}`);

  skillElement.style.backgroundImage = `url('/Art/Skills/${skill.name}.png')`;
  skillElement.style.position = 'relative';

  skillElement.addEventListener('mouseover', displaySkillTooltip);
  skillElement.addEventListener('mouseout', removeSkillTooltip);

  slot.appendChild(skillElement);
  slot.classList.remove('empty');

  skillElement.draggable = true;

  skillElement.addEventListener('dragstart', function (event) {
      dragStartSkill(event, slot, skillElement);
  });

  skillElement.addEventListener('mouseup', function (event) {
      if (event.button === 2) {
          event.preventDefault();

          const skillText = skillElement.innerText;

          // Remove the skill element
          skillElement.remove();
          slot.classList.add('empty');

          // Update adventurer's skills
          adventurer.Skills = adventurer.Skills.filter(skill => skill.name !== skillText);

          // Add the skill back to PLAYER_SKILLS
          const skill = skillsObject[skillText];
          PLAYER_SKILLS.push(skill);
          removeAllKindsOfTooltips();

          // Remove the skill from ACTIVE_SKILLS
          ACTIVE_SKILLS.delete(skill);
          deactivateSkill(skill.effect);

          playDropSkill();
          updateActiveSkills();
          updateInterface();
      }
  });
}


function grantPlayerRandomSkill() {

        // Get all keys (skill names) from the skillsObject map
        let skillKeys = Object.keys(skillsObject);

        // Choose a random key from skillKeys
        let randomKey = skillKeys[Math.floor(Math.random() * skillKeys.length)];
    
        // Retrieve the skill object using the random key
        let skill = skillsObject[randomKey];
    
        // Add the skill to PLAYER_SKILLS
        PLAYER_SKILLS.push(skill);
    
        console.log(`Player granted random skill: ${skill.name}`);
        const type = skill.type;
        playSkillSound(type);

        updateSkillsBox();
        //enableSkillsDragandDrop();
        updateInterface();
}









function levelUpSkillChoice() {

  document.exitPointerLock();
  const array = generateSetOfSkill();
        createSkillSelectionBox(array);
}


function generateSetOfSkill() {
    let GROUP_SKILLS_SET = new Set();
    let existantSkills = new Set();
    let PossibleSet = new Set();


    if(!groupAdventurers) {
        return;
    }

// based on equipped skills;

    groupAdventurers.forEach(adventurer => {
        adventurer.Skills.forEach(skill => {
            GROUP_SKILLS_SET.add(skill);
        });
    });

    GROUP_SKILLS_SET.forEach(skill => {
        existantSkills.add(skill.name);
    });

    GROUP_SKILLS_SET.forEach(skill => {
            skill.ConnectedSkills.forEach(connected => {
                if(!existantSkills.has(connected)) {
                    PossibleSet.add(connected);
                }  
            });
    });

    console.log(PossibleSet);

    let PossibleArray = Array.from(PossibleSet.values());


let SelectionSet = new Set();
if (PossibleArray.length != 0) {
  for (let j = 0 ; j < 3 ; j++) {
      while (SelectionSet.size < 3) {
          let ran = Math.floor(Math.random() * PossibleArray.length);
          let selectedSKill = PossibleArray[ran];
          SelectionSet.add(selectedSKill);
      }
  }
}


// based on types of group adventurers's skill slots' type;
let uniqueTypes = new Set();
let setBasedOnTypes = new Set();
let skillKeys = Object.keys(skillsObject);

groupAdventurers.forEach(adventurer => {
    adventurer.Slots.forEach(slot => {
        uniqueTypes.add(slot.type);
    });
});

while (setBasedOnTypes.size < 3) {
  let randomSkillName = skillKeys[Math.floor(Math.random() * skillKeys.length)];
  let skill = skillsObject[randomSkillName];

  if (uniqueTypes.has(skill.type) && !existantSkills.has(randomSkillName)) {
    setBasedOnTypes.add(randomSkillName);
  }
}

SelectionSet = SelectionSet.union(setBasedOnTypes);






// random bonus random skill;

let criticalLevelUp = Math.floor(Math.random() * 100) + 1;
if (criticalLevelUp < 6) {

    let randomKey = skillKeys[Math.floor(Math.random() * skillKeys.length)];
    
    SelectionSet.add(randomKey);
}


 console.log(SelectionSet);

 const arrayOfSKills = Array.from(SelectionSet).sort(() => Math.random() - 0.5);
 return arrayOfSKills;
}


function createSkillSelectionBox(arrayOfSKills) {

    const exBox = document.getElementById('skill-levelup-selector');
    if (exBox) { exBox.remove() }

    let confirmation = [];

    let rerollPoints = Math.round(GROUP_ATTRIBUTES.influence / 2);

    const skillBox = document.createElement('div');
    skillBox.id = 'skill-levelup-selector';

    const title = document.createElement('div');
    title.classList.add('title');
    title.textContent = 'Select 1 New Skill'

    const content = document.createElement('div');
    content.classList.add('content');

    const reroll = document.createElement('button');
    reroll.id = 'reroll-skill-selections';
    reroll.textContent = `Reroll Selection (${rerollPoints} possible)`;

    if (rerollPoints === 0 || rerollPoints < 1) {
      reroll.disabled = true;
      reroll.textContent = `Can't reroll anymore`;
    }

    const confirm = document.createElement('button');
    confirm.id = 'confirm-levelup';
    confirm.textContent = `Confirm`;
    confirm.disabled = true;

    skillBox.appendChild(createAdvLvlUpChoice(confirmation));
    skillBox.appendChild(title);
    skillBox.appendChild(content);
    skillBox.appendChild(reroll);
    skillBox.appendChild(confirm);
    document.body.appendChild(skillBox);



    confirm.addEventListener('mouseup', function(event) {
      confirmLvlUpWindow(confirmation);
    });

    reroll.addEventListener('mouseup', function(event) {
      rerollPoints--;
      if (rerollPoints < 0) {
        rerollPoints = 0;
      }
        reroll.textContent = `Reroll Selection (${rerollPoints} possible)`;
        const array = generateSetOfSkill();
        content.innerHTML = '';
        confirmation.skill = null;

        if (confirmation.skill === null) {
          confirm.disabled = true;
        }

        for (let j = 0 ; j < 3 ; j++) {
          setTimeout( async () => {
            addSkillChoice(array[j], content, confirmation);
            resolve();
          }, 100); 
        }

        if (rerollPoints === 0 || rerollPoints < 1) {
          reroll.disabled = true;
          reroll.textContent = `Can't reroll anymore`;
        }
      
    });


    for (let j = 0 ; j < 3 ; j++) {
      setTimeout( async () => {
        addSkillChoice(arrayOfSKills[j], content, confirmation);
        resolve();
        }, 100); 
    }
}



function addSkillChoice(skillName, box, confirmation) {
    const skill = skillsObject[skillName];

    if (skill) {

        const skillElement = document.createElement('div');

        fetch('/Templates/skill_card.html')
        .then(response => response.text())
        .then(template => {
            skillElement.innerHTML = template;

            skillElement.classList.add('skill-container');

            skillElement.querySelector('.container').classList.add(`${skill.type}`);
            const skillColor = getComputedStyle(document.documentElement).getPropertyValue(`--${skill.type.toLowerCase()}-color`).trim();
            skillElement.querySelector('.container').style.borderColor = skillColor;
        
            // Update content and styles here after template is loaded
            skillElement.querySelector('.art').style.backgroundImage = `url('/Art/Skills/${skill.name}.png')`;
            skillElement.querySelector('.title').textContent = `${skill.name}`;
            skillElement.querySelector('.title').style.color = skillColor;
            skillElement.querySelector('.type').textContent = `${skill.type}`;
            skillElement.querySelector('.category').textContent = `${skill.category}`;
            skillElement.querySelector('.desc').textContent = `${skill.description}`;
            skillElement.querySelector('.type-pic').style.backgroundImage = `url('/Art/Categories/Types/small/${skill.type}.png')`;
        
            const connectedSkillsHTML = skill.ConnectedSkills
                ?.map(connectedSkill => `<span class='adj-skill'>${connectedSkill}</span>`)
                .join('<span class="normal">, </span>') || '';
            skillElement.querySelector('.adj').innerHTML = connectedSkillsHTML;

            let connectedSkills = skillElement.querySelectorAll('.adj-skill');
            connectedSkills.forEach(skillElement => {
              skillElement.addEventListener('mouseover', handleSkillMouseOver);
              skillElement.addEventListener('mouseleave', handleSkillMouseLeave);
            });

              
            box.appendChild(skillElement);
              

            skillElement.addEventListener('mouseup', function(event) {
                selectThisSkill(skillElement, skill, confirmation, box);
            });


        })
        .catch(error => {
            console.error('Error loading skill template:', error);
        });

        
    } else {
        return;
    }
}



function selectThisSkill(skillElement, skill, confirmation, box) {

  box.querySelectorAll('.skill-container').forEach(ele => {
    ele.classList.remove('selected');
    ele.classList.add('unselected');
  });

  skillElement.classList.add('selected');
  skillElement.classList.remove('unselected');


    confirmation.skill = skill;
    const type = skill.type;
    playSkillSound(type);

    const confirmButton = document.getElementById('confirm-levelup');
    if (confirmation.skill != null && confirmation.adventurer != null) {
      confirmButton.disabled = false;
    }

}


function confirmLvlUpWindow(confirmation) {

  PLAYER_SKILLS.push(confirmation.skill);


  const adventurer = findAdventurerByUID(confirmation.adventurer);
  levelUpAdventurer(adventurer);
  updateActiveWeaponryBox(adventurer);
  playDrawPickaxeSound();
  //enableSkillsDragandDrop();
  updateInterface();
  updateActiveSkills();
  const exBox = document.getElementById('skill-levelup-selector');
  if (exBox) { exBox.remove() }
  
}





function createAdvLvlUpChoice(confirmation) {
  const content = document.createElement('div');
  content.classList.add('adv-content');

  const header = document.createElement('div');
  header.classList.add('adv-content-header');
  header.textContent = 'Select an Adventurer to Level Up';

  const advList = document.createElement('div');
  advList.classList.add('adv-list');

  content.appendChild(header);
  content.appendChild(advList);

  groupAdventurers.forEach(adventurer => {

    const advElement = document.createElement('div')
    advElement.classList.add('adv-element');
    const lvl = document.createElement('div')
    lvl.classList.add('adv-lvlup');
    lvl.textContent = `+1`;

    const name = document.createElement('div')
    name.classList.add('adv-name');
    name.classList.add(`${adventurer.Rarity}`);
    name.textContent = `${adventurer.Title}`;

    const advLvl = document.createElement('div')
    advLvl.classList.add('adv-level');
    advLvl.textContent = `${adventurer.Level}`;
    name.appendChild(advLvl);
    

    const advPic = document.createElement('div');
    advPic.setAttribute('uID', `${adventurer.uID}`);
    advPic.classList.add('item');
    advPic.style.backgroundImage = `url('/Art/Adventurers/${adventurer.Title}.png')`;
    advPic.classList.add(`${adventurer.Rarity}`);
    advPic.addEventListener('mouseenter', showTooltip);
    
    advElement.appendChild(lvl);
    advElement.appendChild(advPic);
    advElement.appendChild(name);

    advList.appendChild(advElement);

      advElement.addEventListener('mouseup', function(event) {
        selectThisAdventurerToLevelUp(adventurer, confirmation, advElement, advList);
      });
  });

return content;
}


function selectThisAdventurerToLevelUp(adventurer, confirmation, advElement, advList) {

  playerSmallButton();


  confirmation.adventurer = adventurer.uID;

  advList.querySelectorAll('.adv-element').forEach(ele => {
    ele.classList.remove('selected');
  });
  advElement.classList.add('selected');

  const confirmButton = document.getElementById('confirm-levelup');
  if (confirmation.skill != null && confirmation.adventurer != null) {
    confirmButton.disabled = false;
  }
}











function updateActiveSkills() {

    const skillsBox = document.getElementById('active-skills');
    skillsBox.innerHTML = '';

    ACTIVE_SKILLS = new Set();
    groupAdventurers.forEach(adventurer => {
        adventurer.Skills.forEach(skill => {
            ACTIVE_SKILLS.add(skill);
        });
    });

    ACTIVE_SKILLS.forEach(skill => {
        if (skill) {
            if (skill.effect) {
                activateSkill(skill.effect);
            }

            const skillElement = document.createElement('div');
            skillElement.className = 'skill';
            skillElement.classList.add(`${skill.rarity}`);
            skillElement.classList.add(`${skill.type}`);
            skillElement.setAttribute('type', `${skill.type}`);
            skillElement.innerHTML = skill.name;
            skillElement.style.backgroundImage = `url('/Art/Skills/${skill.name}.png')`;
            skillElement.style.position = 'relative';


            skillElement.addEventListener('mouseover', function(event) {
                clickSound();
                displaySkillTooltip(event);
              });

              skillElement.addEventListener('mouseout', function(event) {
                removeSkillTooltip();
              });

              skillsBox.appendChild(skillElement);

            let uniqueId = 'skill-' + Math.floor(Math.random() * 9999 + 1);
            skillElement.id = uniqueId;
        }
    });

}




const gameState = {
    events: {},
    registerEvent: function (eventName, callback, priority = 0) {
      if (!this.events[eventName]) {
        this.events[eventName] = [];
      }
      this.events[eventName].push({ callback, priority });
      // Sort by priority in descending order
      this.events[eventName].sort((a, b) => b.priority - a.priority);
    },
    triggerEvent: function (eventName, ...args) {
      if (this.events[eventName]) {
        this.events[eventName].forEach(listener => listener.callback(...args));
      }
    },
  };


let skillPassiveEffects = {};
let activeEffects = {};
let reversibleEffects = {};


async function fetchPassivesSkillsData() {
    try {
        const response = await fetch('/JSONData/skill_effects/passives/passives.json');
        const data = await response.json();
        skillPassiveEffects = data;
        console.log(skillPassiveEffects);
        return skillPassiveEffects;
    } catch (error) {
        console.error('Error fetching skills passive data:', error);
        return null;
    }
}

async function initializePassiveEffects() {
    await fetchPassivesSkillsData(); // Fetch passive skill data
  
    // Iterate over all passive skills
    for (let skillName in skillPassiveEffects) {
      const skillData = skillPassiveEffects[skillName];
  
      // Resolve the target dynamically
      const targetObject = resolveTarget(skillData.target);
  
      if (targetObject) {
        // Register the skill effect to the gameState's event system
        gameState.registerEvent(skillData.condition, (gameState) => {
          applyPassiveEffect(skillData, targetObject);
        }, 1); // Priority can be adjusted as needed
      } else {
        console.warn(`Target ${skillData.target} could not be resolved for skill ${skillName}`);
      }
    }
}
function resolveTarget(target) {
  const targetMapping = {
    SETTINGS: SETTINGS, // Map the string "SETTINGS" to the actual SETTINGS object
    // Add more mappings as needed
  };
  return targetMapping[target];
}


// Function to apply the effect
function applyPassiveEffect(skillData, target) {
    const effectHandlers = {
      sightRange: (params, target) => {
        if (!activeEffects[skillData.effect]) {
          target.visibilityRadius += params.additive;
          activeEffects[skillData.effect] = true; // Mark as active
          console.log(`Sight range increased to ${target.visibilityRadius}`);
        }
      },
      // Add more handlers as needed
    };
  
    // Execute the corresponding effect
    const effectHandler = effectHandlers[skillData.effect];
    if (effectHandler) {
      effectHandler(skillData.parameters, target);
    } else {
      console.warn(`No handler found for effect: ${skillData.effect}`);
    }
  }

initializePassiveEffects();


function onPlayerMove() {
  for (const skillName in activeEffects) {
    const skillData = skillPassiveEffects[skillName];
    if (skillHandlers[skillName] && activeEffects[skillName] != false && skillPassiveEffects[skillName].trigger === 'movement') {
      skillHandlers[skillName](skillData, gameState);
      console.log(skillPassiveEffects[skillName].trigger);
    }
  }
}

function onPlayerChangeRegion() {
  for (const skillName in activeEffects) {
    const skillData = skillPassiveEffects[skillName];
    if (skillHandlers[skillName] && activeEffects[skillName] != false && skillPassiveEffects[skillName].trigger === 'regionChange') {
      skillHandlers[skillName](skillData, gameState);
      console.log(skillPassiveEffects[skillName].trigger);
    }
  }
}
  




const skillHandlers = {
  plainsMastery: (skillData, gameState) => {
    const isInVegetation =
      CURRENT_PLAYER_REGION_DATA.vegetation === "Prairie" ||
      CURRENT_PLAYER_REGION_DATA.vegetation === "Steppe";


        if (isInVegetation) { 
          SETTINGS.visibilityRadius += skillData.parameters.additive;
          activeEffects[skillData.effect] = true;
          console.log(`Sight range increased to ${SETTINGS.visibilityRadius}`);
        } else {
          SETTINGS.visibilityRadius -= skillData.parameters.additive;
          activeEffects[skillData.effect] = false;
          console.log(`Sight range reverted to ${SETTINGS.visibilityRadius}`);
        }


      
  },
};

  


function activateSkill(skillName) {
  const skillData = skillPassiveEffects[skillName];
  if (skillData) {
    activeEffects[skillName] = true;
  } else {
    console.warn(`Skill data not found for: ${skillName}`);
  }
}

  function deactivateSkill(skillName) {
    if (activeEffects[skillName]) {
      activeEffects[skillName] = false;
      console.log(`Skill "${skillName}" deactivated`);
    }
  }





function onExplorationFull() {
    revealAllMap();
    displayMessage('Exploration Progress complete: Region fulled mapped.', 'MediumSpringGreen');

    EXPLORED_REGIONS_NUMBER++;
    console.log('EXPLORED_REGIONS_NUMBER: ', EXPLORED_REGIONS_NUMBER);

    const cultures = CURRENT_PLAYER_REGION_DATA.cultures.split(', ');

        // Select a random culture from the cultures array
        const randomCultureName = cultures[Math.floor(Math.random() * cultures.length)];

        // Find the matching culture object in the CULTURAL_KNOWLEDGE array
        const culture = CULTURES_DATA.find(c => c.culture === randomCultureName);

        if (culture) {
            culture.bonus = culture.bonus + 1; // Add bonus point
            displayMessage(`We gain +1 Culture Knowledge for the ${randomCultureName} culture`, 'hotpink');
            console.log(culture);
        } 
  }