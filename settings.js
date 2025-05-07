let BASE_RARITY_CHANCE = {
    "Normal": 50,
    "Rare": 20,
    "Legendary": 5
  };


// Define default settings
const DEFAULT_SETTINGS = {
    tooltipDelay: 50,
    perspective: true,
    perspectiveTableCont: "630",
    perspectiveGrid: 276,
    movespeed: 50,
    movespeedBonus: 1,
    angle: "87",
    zRotation: 0,
    throttleSpeed: 15,
    visibilityRadius: "5.2",
    baseVisibilityRadius: 5.2,
    posterization: true,
    timePerCell: 1,
    zoomFactor: 2.5,
    gridMovement: true,
    fov : 1.5,
    animations: true,
    animationTime: 75,
    translateY: 0,
    translateX: 0,
    translateZ: 0,
    sneakZ: 0,
    addedTranslateZ: 0,
    transformOriginX: 250,
    transformOriginY: 250,
    t3dx: 0,
    t3dy: 0,
    firstPerson: false,
    interface: true
  };
  
  // Create a copy for current settings
  let SETTINGS = { ...DEFAULT_SETTINGS };
  
  // Function to update settings dynamically
  function updateSettings(newSettings) {
    SETTINGS = { ...SETTINGS, ...newSettings };
  }
  
  // Function to reset settings (specific or all)
  function resetSettings(keys = null) {
    if (keys === null) {
      SETTINGS = { ...DEFAULT_SETTINGS }; // Reset all
    } else {
      keys.forEach(key => {
        if (DEFAULT_SETTINGS.hasOwnProperty(key)) {
          SETTINGS[key] = DEFAULT_SETTINGS[key];
        }
      });
    }
  }


function toggleSettingsDisplay() {
    let settings = document.getElementById('settings-window');

    if (settings) {
        settings.style.display = settings.style.display === 'none' ? 'block' : 'none';
    } else {
        createSettingsWindow();
    }

}



function createListenersSettings(settings) {
    // Use querySelector for compatibility
    const slider = settings.querySelector("#tooltip-delay");
    const output = settings.querySelector("#tooltips-delay-output");

    if (slider && output) {
        output.innerHTML = slider.value;
        slider.oninput = function () {
            output.innerHTML = this.value;
            SETTINGS.tooltipDelay = this.value;
        };
    }


    const sliderMovespeed = settings.querySelector("#movespeed");
    const outputMovespeed = settings.querySelector("#movespeed-output");

    if (sliderMovespeed && output) {
        outputMovespeed.innerHTML = sliderMovespeed.value;
        sliderMovespeed.oninput = function () {
            outputMovespeed.innerHTML = this.value;
            SETTINGS.movespeedBonus = this.value;
        };
    }


    const sliderVisibility = settings.querySelector("#visibility");
    const outputVisibility = settings.querySelector("#visibility-output");

    if (sliderVisibility && output) {
        outputVisibility.innerHTML = sliderVisibility.value;
        sliderVisibility.oninput = function () {
            outputVisibility.innerHTML = this.value;
            SETTINGS.visibilityRadius = this.value / 10;

            updateSettings({
                visibilityRadius: this.value / 10,
              });
            
            observeVisibleCells();
        };
    }


    const sliderPerGrid = settings.querySelector("#grid-perspective");
    const outputPerGrid = settings.querySelector("#grid-perspective-output");

    if (sliderPerGrid && outputPerGrid) {
        outputPerGrid.innerHTML = sliderPerGrid.value;
        sliderPerGrid.oninput = function () {
            outputPerGrid.innerHTML = this.value;
            SETTINGS.perspectiveGrid = this.value;
            const grid = document.getElementById('neo-region');
            grid.style.perspective = `${SETTINGS.perspectiveGrid}px`;
        };
    }

    const sliderAngleGrid = settings.querySelector("#grid-angle");
    const outputAngleGrid = settings.querySelector("#grid-angle-output");

    if (sliderAngleGrid && outputAngleGrid) {
        outputAngleGrid.innerHTML = sliderAngleGrid.value;
        sliderAngleGrid.oninput = function () {
            outputAngleGrid.innerHTML = this.value;
            SETTINGS.angle = this.value;
        };
    }

    const checkBox = settings.querySelector("#perspective");
    const text = settings.querySelector("#perspective-toggle");

    if (checkBox && text) {
        if (checkBox.checked) {
            text.innerHTML = 'Perspective On';
        } else {
            text.innerHTML = 'Perspective Off';
        }

        checkBox.addEventListener('change', function () {
            if (this.checked) {
                text.innerHTML = 'Perspective On';
                toggle3D();
            } else {
                text.innerHTML = 'Perspective Off';
                toggle3D();
            }
        });
    }



    const pixelateBox = settings.querySelector("#posterization");
    const textpixelate = settings.querySelector("#posterization-toggle");

    if (pixelateBox && textpixelate) {
        if (pixelateBox.checked) {
            textpixelate.innerHTML = 'Retro Filters On';
        } else {
            textpixelate.innerHTML = 'Retro Filters Off';
        }

        pixelateBox.addEventListener('change', function () {
            if (this.checked) {
                textpixelate.innerHTML = 'Retro Filters On';
                toggleRetroFilters();
            } else {
                textpixelate.innerHTML = 'Retro Filters Off';
                toggleRetroFilters();
            }
        });
    }


    const animationsBox = settings.querySelector("#animations");
    const textanimations = settings.querySelector("#animations-toggle");

    if (animationsBox && textanimations) {
        if (animationsBox.checked) {
            textanimations.innerHTML = 'Animations On';
        } else {
            textanimations.innerHTML = 'Animations Off';
        }

        animationsBox.addEventListener('change', function () {
            if (this.checked) {
                textanimations.innerHTML = 'Animations On';
                SETTINGS.animations = true;
            } else {
                textanimations.innerHTML = 'Animations Off';
                SETTINGS.animations = false;
            }
        });
    }



        // const gridMovement = settings.querySelector("#grid-movement");
        // const gridMovementText = settings.querySelector("#grid-movement-toggle");

        // if (gridMovement && text) {
        //     if (gridMovement.checked) {
        //         gridMovementText.innerHTML = 'Grid-based movement';
        //         SETTINGS.gridMovement = true;
        //     } else {
        //         gridMovementText.innerHTML = 'Free movement';
        //         SETTINGS.gridMovement = false;
        //     }

        //     gridMovement.addEventListener('change', function () {
        //         if (this.checked) {
        //             gridMovementText.innerHTML = 'Grid-based movement';
        //             SETTINGS.gridMovement = true;
        //         } else {
        //             gridMovementText.innerHTML = 'Free movement';
        //             SETTINGS.gridMovement = false;
        //         }
        //     });
        // }
}


function toggleRetroFilters() {
    const mega = document.getElementById('mega-wrapper');
    const engine = document.getElementById('engine-wrapper');

    SETTINGS.posterization = !SETTINGS.posterization;

    if (!SETTINGS.posterization) {

        engine.style.filter = 'saturate(1.3) brightness(1.15)';
        mega.classList.add('non-filter');

    } else {

        engine.style.filter = 'saturate(1.3) brightness(1.28) url(#pixelate)';
        mega.classList.remove('non-filter');
    }

}



function toggleShadows() {
    const shadows = Array.from(document.querySelectorAll('#region-grid-table .doodads .shadow'));
    
    shadows.forEach((elem) => {
        const parentVisibility = window.getComputedStyle(elem.parentElement).visibility;

        // Toggle only if the parent element is visible
        if (parentVisibility === 'visible') {
            elem.style.visibility = elem.style.visibility === 'hidden' ? 'visible' : 'hidden';
        }
    });
}


function toggle3D() {
    const table = document.getElementById('neo-region');
    const grid = document.getElementById('inner-neo');
  
    if (!SETTINGS.perspective) {
      table.style.perspective = `${SETTINGS.perspectiveGrid}`;
      grid.style.transform = `rotateX(${SETTINGS.angle}deg)`;
    } else {
      table.style.perspective = `none`;
      grid.style.transform = `none`;
    }
  
    SETTINGS.perspective = !SETTINGS.perspective;
  }