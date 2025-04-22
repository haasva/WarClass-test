let audioTitle;



function playTitleMusic() {
    if (!audioTitle) {
        audioTitle = new Audio("/Sounds/main_title.mp3");
        audioTitle.volume = 1;
        audioTitle.play();
    } else {
        audioTitle.play(); // In case you want to play the audio again after stopping
    }
  }
function stopTitleMusic() {
  if (audioTitle) {
    audioTitle.pause();
    audioTitle.currentTime = 0; // Reset the audio to the beginning
  }
}

function playStepAudio() {
  const audio = new Audio("/Sounds/step.mp3");
  audio.volume = 0.3;
  audio.play();
}

function playStep2Audio() {
    const randomness = Math.floor(Math.random() * 11) + 1;
    const audio = new Audio(`/Sounds/walk/grass/grass_step_0${randomness}.wav`);
    audio.volume = 0.04;
    audio.play();
}

function playStepWaterAudio() {
    const randomness = Math.floor(Math.random() * 6) + 1;
    const audio = new Audio(`/Sounds/walk/water/${randomness}.wav`);
    audio.volume = 0.11;
    audio.play();
}

function playStepConcreteAudio() {
    const randomness = Math.floor(Math.random() * 9) + 1;
    const audio = new Audio(`/Sounds/walk/concrete/${randomness}.wav`);
    audio.volume = 0.1;
    audio.play();
}

function playNextRegionSound() {
    const audio = new Audio("/Sounds/ping_map.wav");
    audio.volume = 1;
    audio.play();
}

function playerSmallButton() {
    const audio = new Audio("/Sounds/smallbutton.wav");
    audio.volume = 0.2;
    audio.play();
}

function playerHover1() {
    const audio = new Audio("/Sounds/hover2.wav");
    audio.volume = 1;
    audio.play();
}

function playerHover2() {
    const audio = new Audio("/Sounds/hover.wav");
    audio.volume = 0.5;
    audio.play();
}

function playCheckSound() {
    const audio = new Audio("/Sounds/check.wav");
    audio.volume = 0.3;
    audio.play();
}

function playGridSound() {
    const audio = new Audio("/Sounds/grid.wav");
    audio.volume = 0.4;
    audio.play();
}

function playRemoveSound() {
    const audio = new Audio("/Sounds/remove.wav");
    audio.volume = 0.3;
    audio.play();
}

function clickSound() {
    const audio = new Audio("/Sounds/bloc.wav");
    audio.volume = 0.5;
    audio.play();
}

function clickButtonSound() {
    const audio = new Audio("/Sounds/click2.wav");
    audio.volume = 0.9;
    audio.play();
}

function playClickSound() {
    const audio = new Audio("/Sounds/interface_click.wav");
    audio.volume = 0.13;
    audio.play();
}

function playOpenRegionSound() {
    const audio = new Audio("/Sounds/open_region.mp3");
    audio.volume = 0.3;
    audio.play();
}

function playCongaSound() {
    const audio = new Audio("/Sounds/conga.mp3");
    audio.volume = 0.2;
    audio.play();
}

function playPaperSlide() {
    const audio = new Audio("/Sounds/map_slide.mp3");
    audio.volume = 0.8;
    audio.play();
}

function playGatherHerbSound() {
    const randomness = Math.floor(Math.random() * 3) + 1;
    const audio = new Audio(`/Sounds/gather/herb${randomness}.wav`);
    audio.volume = 0.75;
    audio.play();
}

function meatSound() {
    const randomness = Math.floor(Math.random() * 10) + 1;
    const audio = new Audio(`/Sounds/meat/gathermeat${randomness}.wav`);
    audio.volume = 0.75;
    audio.play();
}

function playThunderSound() {
    const randomness = Math.floor(Math.random() * 4) + 1;
    const audio = new Audio(`/Sounds/thunder/thunder${randomness}.wav`);
    audio.volume = 0.2;
    audio.play();
}

function playDropSkill() {
    const audio = new Audio("/Sounds/selectskill.wav");
    audio.volume = 0.15;
    audio.play();
}

function playJewelSound() {
    const audio = new Audio("/Sounds/jewel.wav");
    audio.volume = 0.82;
    audio.play();
}

function playSkillSound(type) {
    const audio = new Audio(`/Sounds/types/${type}.mp3`);
    audio.volume = 1;
    audio.play();
}

function playPaperOpen() {
    const audio = new Audio("/Sounds/paper1.mp3");
    audio.volume = 0.4;
    audio.play();
}

function playPaperClose() {
    const audio = new Audio("/Sounds/paper2.mp3");
    audio.volume = 0.4;
    audio.play();
}

function playSwingSound() {
    const audio = new Audio("/Sounds/weapons/swing.ogg");
    audio.volume = 0.2;
    audio.play();
}

function playDrawMusketSound() {
    const audio = new Audio("/Sounds/weapons/draw_musket.ogg");
    audio.volume = 0.2;
    audio.play();
}

function playDrawPickaxeSound() {
    const audio = new Audio("/Sounds/weapons/draw_pickaxe.ogg");
    audio.volume = 0.2;
    audio.play();
}

function playBloodSplatSound() {
    const audio = new Audio("/Sounds/blood_splat.wav");
    audio.volume = 0.9;
    audio.play();
}

function playBloodSplat2Sound() {
    const audio = new Audio("/Sounds/blood_splat2.ogg");
    audio.volume = 0.1;
    audio.play();
}

function playBluntHitSound() {
    const audio = new Audio("/Sounds/blunt_hit_high.ogg");
    audio.volume = 0.1;
    audio.play();
}


function playJumpScreamSound() {
    const audio = new Audio("/Sounds/walk/jump/jump_scream.mp3");
    audio.volume = 0.5;
    audio.play();
}

function playDayNightCycleSound(value) {
    const audio = new Audio(`/Sounds/Ambient/day_night/${value}.mp3`);
    audio.volume = 0.05;
    audio.play();
}

function playPromoteAudio() {
    const audio = new Audio(`/Sounds/promote.mp3`);
    audio.volume = 0.7;
    audio.play();
}

function playEvolveAudio() {
    const audio = new Audio(`/Sounds/evolve.mp3`);
    audio.volume = 0.7;
    audio.play();
}

function playDevolveAudio() {
    const audio = new Audio(`/Sounds/devolve.mp3`);
    audio.volume = 0.7;
    audio.play();
}

function playMonkeyDeath() {
    const a = Math.floor(Math.random() * 7) + 1;
    if (a === 1) {
        return;
    }
    const n = Math.floor(Math.random() * 5) + 1;
    const audio = new Audio(`/Sounds/death/monkey/${n}.mp3`);
    audio.volume = 0.2;
    audio.play();
}


function playBite() {
    const audio = new Audio(`/Sounds/bite1.ogg`);
    audio.volume = 0.05;
    audio.play();
}







class AudioLoopManager {
    constructor(volume = 0.05) {
        this.audio = null;
        this.volume = volume;
        this.currentSource = null;
    }

    play(source) {
        if (this.currentSource === source) return;
        this.stop();

        this.audio = new Audio(source);
        this.audio.loop = true;
        this.audio.volume = this.volume;
        this.audio.play().catch(err => console.error("Audio playback error:", err));

        this.currentSource = source;
    }

    stop() {
        if (this.audio) {
            this.audio.pause();
            this.audio.currentTime = 0;
        }
        this.currentSource = null;
    }
}

// Instantiate managers for ambiance and music
const ambianceManager = new AudioLoopManager(0.02);
const musicManager = new AudioLoopManager(1);

function updateAudio() {
    // Handle ambiance
    if (CURRENT_WEATHER.rain) {
        ambianceManager.play('/Sounds/rain.wav');
    } else {
        ambianceManager.stop();
    }

    // Handle music based on region climate
    //const musicSource = `/Sounds/music/${CURRENT_PLAYER_REGION_DATA.climate}.mp3`;
    //musicManager.play(musicSource);
}