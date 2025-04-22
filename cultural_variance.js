
let culturalData = [];

parseCulturalDistanceData();

function parseCulturalDistanceData() {
    return fetch('/JSONData/cultural_distance.json')
      .then(response => response.json())
      .then(data => {
        // Assuming 'data' is an array of objects in 'factions.json'
        culturalData = data;
        return culturalData;
      })
      .catch(error => {
        console.error('Error fetching cultural distance data:', error);
        return null;
      });
  }



// Function to calculate culturalVariance
function calculateCulturalVariance(group) {
    if (group.length === 1 || group.length === 0) {
        return 0; // Adjusted to return 0 when there's only one or no adventurers
    }

    // Count the frequency of each culture in the group
    let cultureFrequency = {};
    group.forEach(adventurer => {
        let uniqueCultures = new Set(adventurer.Culture.split(', ')); // Use a Set to get unique cultures
        uniqueCultures.forEach(culture => {
            cultureFrequency[culture] = (cultureFrequency[culture] || 0) + 1;
        });
    });

    let totalCulturalDistance = 0;
    let totalAdventurers = group.length;
    let uniqueCultureCount = 0; // Counter for adventurers with unique cultures

    // Iterate over each adventurer
    for (let i = 0; i < group.length; i++) {
        let adventurer1 = group[i];
        let cultures1 = adventurer1.Culture.split(', ');
        let hasUniqueCulture = true;
        let weight1 = cultures1.length > 1 ? 0.5 : 1; // Weight based on the number of cultures

        // Check if adventurer1 has any culture in common with any other adventurer
        for (let j = 0; j < group.length; j++) {
            if (i !== j) {
                let adventurer2 = group[j];
                let cultures2 = adventurer2.Culture.split(', ');

                if (cultures1.some(culture => cultures2.includes(culture))) {
                    hasUniqueCulture = false;
                    break;
                }
            }
        }

        // If adventurer1 has at least one unique culture, increment uniqueCultureCount
        if (hasUniqueCulture) {
            uniqueCultureCount++;
        }

        // Compare cultures of adventurer1 with cultures of all other adventurers
        cultures1.forEach(culture1 => {
            for (let j = i + 1; j < group.length; j++) {
                let adventurer2 = group[j];
                let cultures2 = adventurer2.Culture.split(', ');
                let weight2 = cultures2.length > 1 ? 0.5 : 1; // Weight based on the number of cultures

                cultures2.forEach(culture2 => {
                    let distance = culturalData.find(c => c.Cultures === culture1)[culture2];
                    totalCulturalDistance += distance * weight1 * weight2;
                });
            }
        });
    }

    // Calculate the total number of pairings of adventurers with different cultures
    let totalPairings = totalAdventurers * (totalAdventurers - 1);

    // Calculate the culturalVariance adjusted by uniqueCultureCount
    let culturalVariance = parseFloat(((((totalCulturalDistance) / (totalPairings)) + (uniqueCultureCount / totalAdventurers / totalPairings) + uniqueCultureCount)).toFixed(2));
    let RawCV = totalCulturalDistance / totalPairings;

    if (culturalVariance <= 1) {
        culturalVariance = 1;
    }
    return culturalVariance;
}

