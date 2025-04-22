let CONTRACTS = [];
let OUR_CONTRACTS = [];


function rerollContracts() {
    const list = document.getElementById('contract-container');
    list.innerHTML = '';
    generateContract();
    for (let i = 0 ; i < CONTRACTS.length ; i++) {
        const contractBox = createContractBox(CONTRACTS[i]);
        list.appendChild(contractBox);
    }
}

function generateContract() {

    CONTRACTS = [];

    for (let j = 0 ; j < 6 ; j++) {

        let contract = [];
        let contractSize = Math.floor(Math.random() * 4) + 2;

        for (let i = 0 ; i < contractSize ; i++) {
            const r1 = Math.floor(Math.random() * adventurers.length);
    
            const selectedAdv = adventurers[r1];
        
            contract.push(selectedAdv);
        }

        defineContractInformation(contract);

        CONTRACTS.push(contract);

    }
    console.log(CONTRACTS);
}


function defineContractInformation(contract) {


    let contractValue = 10;

    for (let i = 0 ; i < contract.length ; i++) {
 
        if (contract[i].Rarity === "Legendary") {
            contractValue += 20;
        } else if (contract[i].Rarity === "Rare") {
            contractValue += 8;
        } else if (contract[i].Rarity === "Normal") {
            contractValue += 4;
        } 
    }

    let cultV = calculateCulturalVariance(contract);
    if (cultV === 0) {
        cultV = 1;
    }
    contract.culturalVariance = cultV;

    contract.value = Math.floor(((contractValue / contract.length) + contract.length * 4) * (cultV * 2));

    if (contract.value <= 100) {
        contract.quality = 'Insignificant'; } 
    else if (contract.value > 100 & contract.value <= 200) {
        contract.quality = 'Trivial'; }
    else if (contract.value > 100 & contract.value <= 200) {
        contract.quality = 'Noteworthy'; }
    else if (contract.value > 200 & contract.value <= 300) {
        contract.quality = 'Valuable'; }
    else if (contract.value > 300 & contract.value <= 400) {
        contract.quality = 'Eminent'; }
    else if (contract.value > 400 & contract.value <= 500) {
        contract.quality = 'Important'; }
    else if (contract.value > 500) {
        contract.quality = 'Priceless'; } 



    contract.id = Math.floor(Math.random() * 98) + 1;

    const harbors = locationsData.filter(location => location.type === 'Harbor');

    const randomHarbor = harbors[Math.floor(Math.random() * harbors.length)];
    contract.harbor = randomHarbor;

}


function displayContracts(box) {

    const title = document.createElement('div');
    title.id = 'subtitle';
    title.textContent = 'Select one Contract';
    box.appendChild(title);

    const contractCont = document.createElement('div');
    contractCont.id = 'contract-container';
    box.appendChild(contractCont);

    for (let i = 0 ; i < CONTRACTS.length ; i++) {
        const contractBox = createContractBox(CONTRACTS[i]);
        contractCont.appendChild(contractBox);

        contractBox.addEventListener('mouseup', function(event) {
            selectThisContract(CONTRACTS[i]);
          });
    }
}

function createContractBox(contract) {

    const contBox = document.createElement('div');
    contBox.classList.add('contract-box');

    const advList = document.createElement('div');
    advList.classList.add('adv-list');

    const title = document.createElement('div');
    title.classList.add('contract-title');
    title.textContent = `${contract.quality} Contract #${contract.id}`;
    contBox.appendChild(title);

    contBox.appendChild(advList);

    for (let i = 0 ; i < contract.length ; i++) {
        const adv = document.createElement('div');
        adv.classList.add('adv');

        const advTitle = document.createElement('div');
        advTitle.classList.add('title');
        advTitle.textContent = `${contract[i].Title}`;

        const advInfo = document.createElement('div');
        advInfo.classList.add('info');
        advInfo.textContent = `${contract[i].Culture}`;

        adv.appendChild(advTitle);
        adv.appendChild(advInfo);

        advList.appendChild(adv);
    }

    const value = document.createElement('div');
    value.classList.add('contract-value');
    value.textContent = `Value: ${contract.value} gold.`;

    const harbor = document.createElement('div');
    harbor.classList.add('hegira');
    const region = worldData.flat().find(cell => cell.index === contract.harbor.index) || null;
    harbor.textContent = `${contract.harbor.name} (${region.superRegion})`;
    value.appendChild(harbor);
    contBox.appendChild(value);



    return contBox;

}



function displayContractsSelections() {

    const contractList = document.createElement('div');
    contractList.setAttribute('id', 'contract-list');
    contractList.classList.add('infobox');
  
    const header = document.createElement('div');
    header.innerHTML = 'Contracts';
    header.classList.add('infobox-header');
    contractList.appendChild(header);
    enableDragAndDropWindow(header);
    addCloseButton(header);
  
    displayContracts(contractList);
  
    const rerollContracts = document.createElement('button');
    rerollContracts.setAttribute('id', 'reroll');
    rerollContracts.textContent = 'Reroll Contracts';
    rerollContracts.addEventListener('mouseup', function(event) {
      if (event.button === 0) { // Left button
        const list = document.getElementById('contract-container');
        list.innerHTML = '';
        generateContract();
        for (let i = 0 ; i < CONTRACTS.length ; i++) {
            const contractBox = createContractBox(CONTRACTS[i]);
            list.appendChild(contractBox);
            
            contractBox.addEventListener('mouseup', function(event) {
                selectThisContract(CONTRACTS[i]);
              });
        }
      }
    });
  
    contractList.appendChild(rerollContracts);
  
    document.body.appendChild(contractList);
    
  }


function selectThisContract(contract) {
    playerSmallButton();
    OUR_CONTRACTS.push(contract);
    CONTRACTS.splice(contract);

    const contractBox = document.getElementById('contract-list');
    contractBox.remove();
}


function displayRightSideContract() {

    if (OUR_CONTRACTS.length === 0) {
        OUR_CONTRACTS.push(CONTRACTS[0]);
    }

    document.getElementById('right-side').appendChild(createContractBox(OUR_CONTRACTS[0]));
}