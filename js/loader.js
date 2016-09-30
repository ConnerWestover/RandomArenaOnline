/*
loader.js
variable 'app' is in global scope - i.e. a property of window.
app is our single global object literal - all other functions and properties of 
the game will be properties of app.
*/
"use strict";

// if app exists use the existing copy
// else create a new empty object literal
var app = app || {};


window.onload = function(){
	console.log("window.onload called");
	
	app.queue = new createjs.LoadQueue(false);
	app.queue.installPlugin(createjs.Sound);
	app.queue.on("complete", function(){
		console.log("images loaded called");
		app.sound.init();
		app.main.sound = app.sound;
		app.main.Emitter = app.Emitter;
		app.main.init();
	});

	app.queue.loadManifest([
     {id: "enemyImage", src:"media/zombiesheet.png"},
	 {id: "deer", src:"media/deer.png"},
	 {id: "bear", src:"media/bear.png"},
	 {id: "bunny", src:"media/bunny.png"},
	 {id: "wolf", src:"media/wolf.png"},
	 {id: "pill", src:"media/pill.png"},
	 {id: "mushroom", src:"media/mushroom.png"},
	 {id: "flower1", src:"media/flower1.png"},
	 {id: "flower2", src:"media/flower2.png"},
	 {id: "plant", src:"media/plant3.png"},
	 {id: "ground", src:"media/grass.png"}
	]);
}

window.onblur = function(){
	console.log("blur at " + Date());
	app.main.pauseGame();
};

window.onfocus = function(){
	console.log("focus at " + Date());
	app.main.resumeGame();
};