Big-line-big-clique

This is a website, just launch index.html from the website folder in a browser

If launched with firefox there should be no problem.
Most other browsers need a local server for the page to work otherwise
you are stuck in a loading screen when the p5.js does it's preload.
Here is how to make it work in that case :
https://github.com/processing/p5.js/wiki/Local-server
(I used the chrome extension on google chrome which worked well)

The p5.js file is the p5.js library https://p5js.org/
Inside the website file the .html files are the website pages
The highscore.js file is javascript code to create the highscore.html page and avoid large blocks of copied text
All the algorithms are implemented inside the sketch.js file