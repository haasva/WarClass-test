function damageDisplayNumber (element, damage) {

  let elementRect = element.getBoundingClientRect();
  const endX = elementRect.left + elementRect.width / 2;
  const endY = elementRect.top + elementRect.height / 2;

    const DamageDisplayNumber = document.createElement('div');
    DamageDisplayNumber.setAttribute('id', 'DamageNumberDisplay');
    DamageDisplayNumber.textContent = `${damage}`;

	  document.body.appendChild(DamageDisplayNumber);


    DamageDisplayNumber.style.left = `${endX}px`;
    DamageDisplayNumber.style.top = `${endY + 60}px`;


      DamageDisplayNumber.style.color = "white";
      DamageDisplayNumber.style.animation = "damageText 0.5s 1 ease-in";
    

    setTimeout(() => {
      DamageDisplayNumber.remove();
      }, damage + 200);
}

function damageDisplayNumberToUs (totalDamageToUs) {
    const DamageDisplayNumber = document.createElement('div');
    DamageDisplayNumber.setAttribute('id', 'DamageNumberDisplayToUs');
    DamageDisplayNumber.textContent = `${totalDamageToUs}`;

    const LifeArea = document.getElementById("life-circle");
	LifeArea.appendChild(DamageDisplayNumber);

    DamageDisplayNumber.style.display = "block";
    DamageDisplayNumber.style.left = `${10}px`;
    DamageDisplayNumber.style.top = `${10}px`;

    DamageDisplayNumber.style.animation = "damageText 0.5s 1 ease-in";
    setTimeout(() => {
        LifeArea.removeChild(DamageDisplayNumber);
      }, 500);
}

async function preAttackAnimation(attacker, defender, attackerElement, defenderElement) {


        const attackerRect = attackerElement.getBoundingClientRect();
        const startX = attackerRect.left;
        const startY = attackerRect.top;
  
        let enemyRect = defenderElement.getBoundingClientRect();
        let endX = enemyRect.left + enemyRect.width / 2;
        let endY = enemyRect.top + enemyRect.height / 2;

        const ranX = Math.floor(Math.random() * 26 - 13);
        const ranY = Math.floor(Math.random() * 26 - 13);

        endX += ranX;
        endY += ranY;
  
        // Call the attackAnimation function with the calculated coordinates
        const specialty = attacker.Specialty;
        const damage = attacker.Attack;

        switch (specialty) {
            case "Gunpowder":
            await attackAnimationGunpowder(startX, startY, endX, endY, defenderElement, damage);
            break;

            case "Archery":
              await attackAnimationArchery(startX, startY, endX, endY, defenderElement, damage);
            break;

            case "Melee":
              await attackAnimationMelee(startX, startY, endX, endY, defenderElement, damage);
            break;

            case "Unarmed":
              await attackAnimationUnarmed(startX, startY, endX, endY, defenderElement, damage);
            break;

            case "Polyfighter":
                const randomAnimation = Math.floor(Math.random() * 4) + 1;
                switch (randomAnimation) {
                  case 1:
                    await attackAnimationGunpowder(startX, startY, endX, endY, defenderElement, damage);
                    break;
                  case 2:
                    await attackAnimationArchery(startX, startY, endX, endY, defenderElement, damage);
                    break;
                  case 3:
                    await attackAnimationMelee(startX, startY, endX, endY, defenderElement, damage);
                    break;
                  case 4:
                    await attackAnimationUnarmed(startX, startY, endX, endY, defenderElement, damage);
                    break;
                  default:
                    console.error("Invalid random animation number.");
                    break;
                }
            break;

            case "Non-fighting":
            break;

          default:
            attackAnimationUnarmed(startX, startY, endX, endY, targetElement, damage);
            break;
        }

}
  
  



async function attackAnimationGunpowder(startX, startY, endX, endY, targetElement, damage) {
    
    
    const line = document.createElement('div');
    line.setAttribute('id', 'attack-line-gunpowder');
    
    
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
  
    
    line.style.position = 'absolute';
    line.style.left = `${startX}px`;
    line.style.top = `${startY}px`;
    line.style.width = `${length}px`;
    line.style.height = '4px';
    line.style.transformOrigin = '0 0';
    line.style.transform = `rotate(${angle}deg)`;
    line.style.opacity = `0`;
    line.style.animation = "gunpowder-shot-animation 5s ease-out";
  
    const smokeEffect = document.createElement('div');
    smokeEffect.style.left = `${startX - 50}px`;
    smokeEffect.style.top = `${startY - 50}px`;
    smokeEffect.setAttribute('id', 'smoke-effect');
    document.body.appendChild(smokeEffect);
    smokeEffect.style.animation = "smokeout 1s ease-out";
    
    
    document.body.appendChild(line);
  
    bloodSplat(endX, endY);
  
    
  
    setTimeout( async () => {
      targetElement.classList.toggle("target-impact");
      const audio = new Audio("/Sounds/pistol.wav");
      audio.volume = 0.1;
      audio.play();
    }, 100);
    
    setTimeout( async () => {
        targetElement.classList.toggle("target-impact");
      document.body.removeChild(line);
      document.body.removeChild(smokeEffect);
    }, 500);
  }



  
  function bloodSplat(endX, endY) {
    const bloodEffect = document.createElement('div');
    bloodEffect.setAttribute('id', 'bloodEffect');
    bloodEffect.style.left = `${endX - 25}px`;
    bloodEffect.style.top = `${endY - 25}px`;
    document.body.appendChild(bloodEffect);

    const bloodDecal = document.createElement('div');
    bloodDecal.setAttribute('id', 'bloodDecal');
    bloodDecal.style.left = `${endX - 25}px`;
    bloodDecal.style.top = `${endY - 25}px`;
    document.body.appendChild(bloodDecal);
    setTimeout(async () => {
        document.body.removeChild(bloodDecal);
      }, 100);
    setTimeout(async () => {
      document.body.removeChild(bloodEffect);
    }, 300);
  }
  
  
  async  function attackAnimationArchery(startX, startY, endX, endY, targetElement, damage) {
    
    startX = '30%';
    startY = '40%';
    const audio = new Audio("/Sounds/arrow.wav");
    audio.volume = 0.2;
    audio.play();
    targetElement.style.animation = "";
    // Create a new div element for the animation
    const animationDiv = document.createElement('div');
    animationDiv.setAttribute('id', 'attack-animation-archery');
    
    // Set the starting position
    animationDiv.style.right = `${startX}`;
    animationDiv.style.bottom = `${startY}`;
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const arrowRotation = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
  
    // Add the animation class to trigger the smooth movement
    animationDiv.style.setProperty('--endX', `${endX - startX}px`);
    animationDiv.style.setProperty('--endY', `${endY - startY}px`);
    animationDiv.style.setProperty('--arrowRotation', `${arrowRotation + 90}deg`);
    animationDiv.classList.add('archery-animation');
  
    // Add the animationDiv to the document body
    document.body.appendChild(animationDiv);
    
    
    
    setTimeout(async () => {
      targetElement.classList.toggle("target-impact");
      bloodSplat(endX, endY);
    }, 250);
    
    // Use a timeout to remove the animationDiv after a short delay (e.g., 200ms)
    setTimeout( async () => {
      document.body.removeChild(animationDiv);
      targetElement.classList.toggle("target-impact");
    }, 200);

    setTimeout(async () => {
        fatigueFromAttack(1);
        arrowsLost(1);
    }, 200);
}
  
  
async function attackAnimationMelee(startX, startY, endX, endY, targetElement, damage) {
    
    const audio = new Audio("/Sounds/melee.wav");
    audio.volume = 0.04;
    audio.play();
    // Create a new div element for the animation
    const animationMelee = document.createElement('div');
    animationMelee.setAttribute('id', 'animationMelee');




    const line = document.createElement('div');
    line.setAttribute('id', 'attack-line');
    
    
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
  
    document.body.appendChild(line);
    line.style.position = 'absolute';
    line.style.left = `${startX}px`;
    line.style.top = `${startY}px`;
    line.style.width = `${length}px`;
    line.style.height = '1px';
    line.style.transformOrigin = '0 0';
    line.style.transform = `rotate(${angle}deg)`;
    
    
    // Set the starting position
    animationMelee.style.left = `${endX - 50}px`;
    animationMelee.style.top = `${endY - 50}px`;
  
    // Add the animationDiv to the document body
    document.body.appendChild(animationMelee);
    bloodSplat(endX, endY);
    targetElement.classList.toggle("target-impact");
  
    setTimeout(async () => {
      targetElement.classList.toggle("target-impact");
    }, 100);
    // Use a timeout to remove the animationDiv after a short delay (e.g., 200ms)
    setTimeout(async () => {     
      document.body.removeChild(animationMelee);
    }, 100);
    setTimeout(async () => {      
      document.body.removeChild(line);
    }, 400);
  }
  
  async function attackAnimationUnarmed(startX, startY, endX, endY, targetElement, damage) {
    
    const audio = new Audio("/Sounds/unarmed.wav");
    audio.volume = 0.04;;
    audio.play();
    targetElement.style.animation = "";
    // Create a new div element for the animation
    const animationUnarmed = document.createElement('div');
    animationUnarmed.setAttribute('id', 'animationUnarmed');
    
    // Set the starting position
    animationUnarmed.style.left = `${endX - 30}px`;
    animationUnarmed.style.top = `${endY - 30}px`;



    const line = document.createElement('div');
    line.setAttribute('id', 'attack-line-unarmed');
    
    
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
  
    document.body.appendChild(line);
    line.style.position = 'absolute';
    line.style.left = `${startX}px`;
    line.style.top = `${startY}px`;
    line.style.width = `${length}px`;
    line.style.transformOrigin = '0 0';
    line.style.transform = `rotate(${angle}deg)`;

  
    // Add the animationDiv to the document body
    document.body.appendChild(animationUnarmed);
    targetElement.classList.toggle("target-impact");
  
    setTimeout(async () => {
      targetElement.classList.toggle("target-impact");
    }, 100);
  
    // Use a timeout to remove the animationDiv after a short delay (e.g., 200ms)
    setTimeout(async () => {
      document.body.removeChild(animationUnarmed);
    }, 100);
    setTimeout(async () => {      
      document.body.removeChild(line);
    }, 300);
  }




function fatigueFromAttack(value) {
    endurance -= value;
    updateFatigueDisplay();
}

function ammosLost(value) {
    groupAmmos -= value;
    updateCurrentGroupAmmos();
    const ammosItem = document.getElementById('ammos');
    itemUpdateEffect(ammosItem);
}
function arrowsLost(value) {
    groupArrows -= value;
    updateCurrentGroupAmmos();
    const arrowsItem = document.getElementById('arrows');
    itemUpdateEffect(arrowsItem);
}




































// function preAttackAnimationEnemy(adventurerTitle, adventurerElement, lifeCircleGroup, isEnemy) {

//     const inventoryContainer = document.getElementById('inventory-container');
//     const inventoryItems = inventoryContainer.getElementsByClassName('item');
//     const enemyEvent = document.getElementById("enemyAdvGroup");
//     const enemyAdventurers = enemyEvent.getElementsByClassName('adventurerPics');
  
//     // Get the coordinates of the attacking enemy adventurer
//     const adventurer = enemyAdventurersGroup.get(adventurerTitle);
    
//     const attackingEnemyRec = adventurerElement.getBoundingClientRect();
//     const startX = attackingEnemyRec.left + attackingEnemyRec.width / 2;
//     const startY = attackingEnemyRec.top + attackingEnemyRec.height / 2;
  
//         // Choose a random adventurer from our group to be attacked
//         let randomIndex = Math.floor(Math.random() * inventoryItems.length);
//         let targetRec = lifeCircleGroup.getBoundingClientRect();
//         let targetElement = lifeCircleGroup;
  
//         const endX = targetRec.left + targetRec.width / 2;
//         const endY = targetRec.top + targetRec.height / 2;
  
//         // Call the attackAnimation function with the calculated coordinates
//         const specialty = adventurer.Specialty;
//         const damage = adventurer.Attack;
//         const Speed = adventurer.Speed
  
//         switch (specialty) {
//             case "Gunpowder":
//                 adventurerElement.classList.add("attacking-adventurer-enemy");
//             attackAnimationGunpowder(startX, startY, endX, endY, targetElement, damage);
//             break;

//             case "Archery":
//                 adventurerElement.classList.add("attacking-adventurer-enemy");
//             attackAnimationArchery(startX, startY, endX, endY, targetElement, damage);
//             break;

//             case "Melee":
//                 adventurerElement.classList.add("attacking-adventurer-enemy");
//             attackAnimationMelee(startX, startY, endX, endY, targetElement, damage);
//             break;

//             case "Unarmed":
//                 adventurerElement.classList.add("attacking-adventurer-enemy");
//             attackAnimationUnarmed(startX, startY, endX, endY, targetElement, damage);
//             break;

//             case "Polyfighter":
//                 const randomAnimation = Math.floor(Math.random() * 4) + 1;
//                 adventurerElement.classList.add("attacking-adventurer-enemy");
//                 switch (randomAnimation) {
//                   case 1:
//                     attackAnimationGunpowder(startX, startY, endX, endY, targetElement, damage, isEnemy);
//                     break;
//                   case 2:
//                     attackAnimationArchery(startX, startY, endX, endY, targetElement, damage, isEnemy);
//                     break;
//                   case 3:
//                     attackAnimationMelee(startX, startY, endX, endY, targetElement, damage, isEnemy);
//                     break;
//                   case 4:
//                     attackAnimationUnarmed(startX, startY, endX, endY, targetElement, damage, isEnemy);
//                     break;
//                   default:
//                     attackAnimationUnarmed(startX, startY, endX, endY, targetElement, damage, isEnemy);
//                     break;
//                 }
//             break;

//             case "Non-fighting":
//                 adventurerElement.classList.remove("attacking-adventurer-enemy");
//             break;

//           default:
//             console.error(`Unknown specialty for adventurer ${adventurer}`);
//             break;
//         }
  
//         // Calculate the next adventurer's index and call the function again after a delay
//         const baseDelay = 4000; // 1 second base delay
//         const speedMultiplier = 10; // Adjust this value to control the attack speed
  
//         const attackDelay = baseDelay - Speed * speedMultiplier;

//         // Apply the animation duration to the beforeElement
//         const onCooldownAnimationElement = document.createElement("div");
//         onCooldownAnimationElement.classList.add("on-cooldown-enemy");
//         adventurerElement.appendChild(onCooldownAnimationElement);
//         const attackAnimationDuration = attackDelay / 1000; // Convert to seconds
//         onCooldownAnimationElement.style.animationDuration = `${attackAnimationDuration - 0.3}s`;

//         setTimeout(() => {
//             adventurerElement.classList.remove("attacking-adventurer-enemy");
//             onCooldownAnimationElement.remove();
//         }, attackDelay);
        
// }