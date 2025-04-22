


function displayAdventurerInfo(event) {

    const existingAdventurerInfoContainer = document.getElementById('adventurer-info-container');
  
    if (existingAdventurerInfoContainer) {
      existingAdventurerInfoContainer.remove();
    }
  
  
    
    const adventurerInfoContainer = document.createElement('div');
    adventurerInfoContainer.setAttribute('id', 'adventurer-info-container');
    
    updateTooltipPosition(event, adventurerInfoContainer);
    const adventurerTitle = event.target.getAttribute('title');
    const adventurerUID = event.target.getAttribute('uid');
  const adventurer = findAdventurerByUID(adventurerUID);
  
    if (adventurer) {
      // Convert number properties to strings and handle null properties
      for (const prop in adventurer) {
        if (adventurer[prop] === null) {
          adventurer[prop] = '';
        } else {
            adventurer[prop] = adventurer[prop];
      }}
  
              // Extract "Name" values from the "Affixes" array
              const affixNames = adventurer.Affixes.map(affix => affix.Name);
  
              // Create a string by joining the "Name" values
              const affixString = affixNames.join(' ');
  
      // Fetch the adventurer info template
      fetch('/Templates/adventurer-info-template.html')
        .then(response => response.text())
        .then(template => {
          // Create a temporary div to hold the template content
          const tempContainer = document.createElement('div');
          tempContainer.innerHTML = template;
  
          // Get the elements from the template
          const elements = tempContainer.children;
          
  
          // Append all elements to the adventurer info container
  
            adventurerInfoContainer.style.display = 'block';
  
  
  // Add event listener for mouseout event on the adventurerInfoContainer
  adventurerInfoContainer.addEventListener('mouseout', event => {
    const isMouseOutsideContainer = !adventurerInfoContainer.contains(event.relatedTarget);
    if (isMouseOutsideContainer) {
      adventurerInfoContainer.remove();
    }
  });   
  
  event.target.addEventListener('mouseout', event => {
      adventurerInfoContainer.remove();
  }); 
       
        
          adventurerInfoContainer.innerHTML = ''; // Clear previous content
          appendWithAnimation(adventurerInfoContainer, elements);
  
          if (adventurer.Affixes) {
            const affixesBox = adventurerInfoContainer.querySelector('#Affixes');
            generateAffixElements(adventurer, affixesBox);
          }
          if (adventurer.Signature) {
            const element = adventurerInfoContainer.querySelector('#signature-skill');
            appendSignatureSkill(adventurer, element);
          }
  
          // Update the adventurer info with the actual data
          adventurerInfoContainer.querySelector('.Art').style.backgroundImage = `url('/Art/Adventurers/${adventurer.Title}.png')`;
          adventurerInfoContainer.querySelector('.Title').textContent = `${adventurer.Title}`;
          adventurerInfoContainer.querySelector('.Prefix').textContent = `${adventurer.prefix}`;
  
          adventurerInfoContainer.querySelector('#adv-level').textContent = adventurer.Level;
  
          adventurerInfoContainer.querySelector('.Culture').textContent = adventurer.Culture;
          adventurerInfoContainer.querySelector('.Age').textContent = adventurer.Age;
          adventurerInfoContainer.querySelector('.Upkeep').textContent = adventurer.upkeep;
          adventurerInfoContainer.querySelector('.Life').textContent = adventurer.Life;
          adventurerInfoContainer.querySelector('.MaxLife').textContent = adventurer.MaxLife;

          const delayAdv = calculateDelay(adventurer.Speed) / 1000;
          const asD = Number(delayAdv.toFixed(2));
          
          adventurerInfoContainer.querySelector('.Speed').textContent = `${adventurer.Speed} Speed`;

          const asSpan = document.createElement('span');
          asSpan.textContent = ` (${asD} aps)`
          adventurerInfoContainer.querySelector('.Speed').appendChild(asSpan);



      adventurerInfoContainer.querySelector('.HandResist').textContent = adventurer.HandResist;		
      adventurerInfoContainer.querySelector('.RangedResist').textContent = adventurer.RangedResist;

          adventurerInfoContainer.querySelector('.Type1').style.backgroundImage = `url('/Art/Categories/Types/${adventurer.Types[0]}.png')`;
          if (adventurer.Types.length != 1) {
            adventurerInfoContainer.querySelector('.Type2').style.backgroundImage = `url('/Art/Categories/Types/${adventurer.Types[1]}.png')`;
          } else {
            adventurerInfoContainer.querySelector('.Type2').style.display = 'none';
          }
          
          adventurerInfoContainer.querySelector('.Type').textContent = adventurer.Type;
  
            // Clear previous main-attribute classes
            const attributes = ['Strength', 'Cunning', 'Artisanship', 'Education'];
            attributes.forEach(attr => {
              adventurerInfoContainer.querySelector(`.${attr}`).classList.remove('main-attribute');
            });

            // Update the text content
            adventurerInfoContainer.querySelector('.Strength').textContent = adventurer.Attributes.Strength;
            adventurerInfoContainer.querySelector('.Cunning').textContent = adventurer.Attributes.Cunning;
            adventurerInfoContainer.querySelector('.Artisanship').textContent = adventurer.Attributes.Artisanship;
            adventurerInfoContainer.querySelector('.Education').textContent = adventurer.Attributes.Education;
            adventurerInfoContainer.querySelector('.Dexterity').textContent = adventurer.Attributes.Dexterity;

            // Add main-attribute class to main attributes
            adventurer.mainAttr.forEach(attr => {
              adventurerInfoContainer.querySelector(`.${attr}`).classList.add('main-attribute');
            });
  
          adventurerInfoContainer.querySelector('.SubCategory').textContent = adventurer.SubCategory;
          //adventurerInfoContainer.querySelector('.MountedArt').style.backgroundImage = `url(${adventurer.MountedArt})`;
          adventurerInfoContainer.querySelector('.Specialty').textContent = adventurer.Specialty;
          //adventurerInfoContainer.querySelector('.Specialty1').style.backgroundImage = `url(${adventurer.Specialty1})`;
          //adventurerInfoContainer.querySelector('.Specialty2').style.backgroundImage = `url(${adventurer.Specialty2})`;
      adventurerInfoContainer.querySelector('.Base-attack').textContent = adventurer.Attack;
      
      if (adventurer.Signature) {
        adventurerInfoContainer.querySelector('.Signature').textContent = adventurer.Signature + ` (${skillsObject[adventurer.Signature].type})`;
      }

      if (adventurer.Equipment.Weapon != null) {
        adventurerInfoContainer.querySelector('.Weapon').textContent = adventurer.Equipment.Weapon.name;
        adventurerInfoContainer.querySelector('.weapon-type').style.backgroundImage = `url('/Art/Interface/weapon categories/${adventurer.Equipment.Weapon.category}.png')`;
      }
          

          adventurerInfoContainer.querySelector('.Description').textContent = adventurer.Description;
          


          const loreElement = adventurerInfoContainer.querySelector('.Lore');

          // Check if adventurer.Lore contains an asterisk
          if (adventurer.Lore.includes('*')) {
            // Replace asterisk with a line break character
            const loreWithLineBreak = adventurer.Lore.replace(/\*/g, '\n');
            loreElement.textContent = loreWithLineBreak;
            loreElement.style.whiteSpace = 'pre-line'; // Preserve line breaks
          } else {
            // If no asterisk is present, set the text content directly
            loreElement.textContent = adventurer.Lore;
            loreElement.style.whiteSpace = 'normal'; // Reset white-space property
          }


          adventurerInfoContainer.querySelector('.Upgrade1').textContent = adventurer.Upgrade1;
          adventurerInfoContainer.querySelector('.Upgrade2').textContent = adventurer.Upgrade2;
          adventurerInfoContainer.querySelector('.Upgrade3').textContent = adventurer.Upgrade3;
          adventurerInfoContainer.querySelector('.Upgrade1Art').style.backgroundImage = `url('/Art/Adventurers/${adventurer.Upgrade1}.png')`;
          adventurerInfoContainer.querySelector('.Upgrade2Art').style.backgroundImage = `url('/Art/Adventurers/${adventurer.Upgrade2}.png')`;
          adventurerInfoContainer.querySelector('.Upgrade3Art').style.backgroundImage = `url('/Art/Adventurers/${adventurer.Upgrade3}.png')`;

          let cultureNumber = adventurer.Cultures.length;

          for (let i = 0 ; i < cultureNumber ; i++) {
            const cultureSpan = document.createElement('span');
            cultureSpan.classList.add('adv-culture-icon');
            cultureSpan.classList.add(`d${i}`);
            cultureSpan.textContent = `${adventurer.Cultures[i]}`;
            cultureSpan.style.backgroundImage = `url('/Art/Cultures/${adventurer.Cultures[i]}.png')`;


            const titleBox = adventurerInfoContainer.querySelector('.Title');

            titleBox.prepend(cultureSpan);
          }

  
      console.log(adventurer);
  
  
      // Update other properties as needed
    const adventurerBox = document.getElementById('adventurer-display-inbox');
    hideEmptyElements(adventurerInfoContainer);
  
  
    
    document.body.append(adventurerInfoContainer);
  
    if (adventurer.Affixes.length === 0) {
      const affixesBox = adventurerInfoContainer.querySelector('#Affixes');
      affixesBox.style.display = "none";
    }
    if (adventurer.Upgrade1 === "") {
      const upgrades = adventurerInfoContainer.querySelector('.upgrades');
      upgrades.style.display = "none";
    }
    

    updateTooltipPosition(event, adventurerInfoContainer);
    

  
    // Add event listener to update tooltip position on mousemove
    //event.target.addEventListener('mousemove', (event) => updateTooltipPosition(event, adventurerInfoContainer));
    
  
        const topheader = adventurerInfoContainer.querySelector('#top-header');
        const artAdv = adventurerInfoContainer.querySelector('.Art');

        rarityBorderColor(adventurer.Rarity, adventurerInfoContainer, topheader, artAdv);
  
        })
        .catch(error => {
          console.error('Error loading adventurer info template:', error);
        });
    }
    
  }



  function appendSignatureSkill(adventurer, element) {

    const startingSkills = adventurer.Signature;
    // Split the StartingSkills string into an array of skill names using the special character
    const startingSkillsArray = startingSkills.split(', ');

    // Iterate through each skill name and create corresponding skill elements
    startingSkillsArray.forEach(skillName => {
        // You may want to add further validation to ensure skillName is valid
        const skill = skillsObject[skillName];

    

        if (skill) {
          console.log(skill);
            const skillElement = document.createElement('div');
            skillElement.className = 'skill';

            skillElement.classList.add('dontdelete');
            skillElement.classList.add(`${skill.type}`);
            skillElement.classList.add(`${skill.rarity}`);
            skillElement.innerHTML = skill.name;
            skillElement.style.backgroundImage = `url('/Art/Skills/${skill.name}.png')`;
            skillElement.style.position = 'relative';
            skillElement.style.filter = 'brightness(1) grayscale(0)';
            element.appendChild(skillElement);
        }
      });
}