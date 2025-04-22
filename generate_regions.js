async function processRegionStates(columns, rows) {
    for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
            const regionIndex = row * columns + column;
            try {
                updateOverworldPlayerPosition(row, column);
                // Load the region state for the current regionIndex
                await createARegion(regionIndex);
    
                // Wait for the regionTable (#region-grid-table) creation to be completed
                await waitForRegionTableCreation();
                centerPOVGroup;
                // Save the region state after the table is created
                saveRegionState(regionIndex, document.querySelector('#region-grid-table'));
            } catch (error) {
                console.error(`Error processing regionIndex: ${regionIndex}`, error);
            }

            // Throttle execution to avoid overwhelming the event loop
            await delay(2); // Adjust the delay as needed
        
    
        }
    }
}

// This function assumes that the loadRegionState function returns a promise
function createARegion(regionIndex) {
    // Implement loading logic here
    // Example: return a promise that resolves when loading is complete
    return new Promise((resolve) => {
        console.log(`Loading region state for regionIndex: ${regionIndex}`);
        createRegionGridTable();
        setTimeout(() => {
            resolve();
        }, 3); // Simulating an asynchronous load
    });
}

// Wait for the region table to be fully created
function waitForRegionTableCreation() {
    return new Promise((resolve) => {
        const interval = setInterval(() => {
            const regionTable = document.querySelector('#region-grid-table');
            if (regionTable) {
                clearInterval(interval);
                resolve();
            }
        }, 1); // Check every 100ms
    });
}


// Call the function with your columns and rows values

