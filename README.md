
# WarClass

99% of this game's assets are taken from other games/internet/mods used as placeholders.
contact me if you don't want your asset be found in this project or if you want to know the source of an asset.


This is a 100% HTML-CSS-JavaScript 3D first person party-based RPG set in a semi-historical 18th century.
Manage a group of adventurers from various cultures, and explore the WHOLE world.

Everything you see is an html div. I'm not a code expert so I relied quite a lot on chatGPT. Code might look extremely ugly and obviously unefficient. But things work!

START THE GAME:
Launch the run.bat file, which is going to create a local server on which you can play the game through the browser (WebKit only supported!).



## Engine

The game is rendered entirely in DOM with CSS 3D transform engine. It doesn't rely on WebGL or other similar libraries. Canvas is not used to render the game too.

Canvas is used only in the computing of bitmap pictures into arrays for building the world map data (bitmap to array).

Game is IN DEVELOPMENT.
![App Screenshot](https://github.com/haasva/WarClass-test/blob/4a994f3a3c14b226719a23c06820c8dfedd382e0/screenshot.jpg)

The pixelated effect is a filter, it can be disabled by pressing P.

## How to play

Select your starting adventurers/location. Move around like any other FPS game. Movement is cell-based.

Adventurers can attack if they have a weapon equiped. Use the wheel to change the active adventurer.

Browse the world map to change regions (teleport) or travel by foot through the region (gateways are revealed cells at the borders of the map with a red border).
Etc.

## Contact
you can contact me for anything. I'm really looking for feedback, both gamedesign and programming wise.

## Future
Continue to build the game.

Create a real skills-items-talents system (skills, adventurer's talents and most item currently don't do anything).

Implement working group vs group combat.

Find a way to abandon cell-based movement (Daggerfall-like movement instead).


![App Screenshot](https://github.com/haasva/WarClass-test/blob/8d67f1b862f476202a4d5f94b318dabb2fb5c9cf/100cssscreenshot.jpg)
![App Screenshot](https://github.com/haasva/WarClass-test/blob/415ad7703ab711c1ba52e8c5131a6dbd6478a8c1/Screenshots/meadow.png)
