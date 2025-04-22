function appendSortBoxTemplate(sortBox) {
    fetch('/Templates/sort-box.html')
      .then(response => response.text())
      .then(template => {
        // Create a temporary div to hold the template content
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = template;
  
        // Get the elements from the template
        const elements = tempContainer.children;
  
        // Append all elements
        for (const element of elements) {
          sortBox.appendChild(element);
        }
      })
  
      .catch(error => {
        console.error('Error loading template:', error);
      });
  }

  async function applyFilter() {
    let checkedBoxes1 = document.querySelectorAll("#filterForm input[type=checkbox]:checked");
    let selectedTypes = [];
    for (let i = 0; i < checkedBoxes1.length; i++) {
        selectedTypes.push(checkedBoxes1[i].value);
    }
    let checkedBoxes2 = document.querySelectorAll("#filterForm2 input[type=checkbox]:checked");
    let selectedSpecialties = [];
    for (let i = 0; i < checkedBoxes2.length; i++) {
        selectedSpecialties.push(checkedBoxes2[i].value);
    }
    let checkedBoxes3 = document.querySelectorAll("#filterForm3 input[type=checkbox]:checked");
    let selectedCultures = [];
    for (let i = 0; i < checkedBoxes3.length; i++) {
        selectedCultures.push(checkedBoxes3[i].value);
    }
    
    let searchTerm = document.getElementById("searchTerm").value.trim();

    await shuffleSelectableBatch(selectedTypes, selectedSpecialties, selectedCultures, searchTerm);
}