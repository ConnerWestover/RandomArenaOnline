// sound.js
"use strict";
// if app exists use the existing copy
// else create a new object literal
// Sound Credit: http://www.freesound.org/people/M-RED/sounds/41722/
// Player Hurt: http://www.freesound.org/people/alex_audio/sounds/188568/
// Enemy Hurt: http://www.freesound.org/people/borralbi/sounds/194451/
var app = app || {};

// define the .sound module and immediately invoke it in an IIFE
app.sound = (function(){
	console.log("sound.js module loaded");
	var bgAudio = undefined;
	var effectAudio = undefined;
	

	function init(){
		bgAudio = document.querySelector("#bgAudio");
		bgAudio.volume=0.25;
		effectAudio = document.querySelector("#effectAudio");
		effectAudio.volume = 0.3;
	}
		
	function stopBGAudio(){
		bgAudio.pause();
		bgAudio.currentTime = 0;
	}
	
	function playBGAudio(){
		bgAudio.play();
	}
	
	function playPlayerHurtEffect(){
		bgAudio.play();
		effectAudio.src = "media/PlayerHurt.mp3";
		effectAudio.play();
	}
	
	function playEnemyHurtEffect(){
		bgAudio.play();
		effectAudio.src = "media/EnemyHurt.wav";
		effectAudio.play();
	}
	
	return{
		init: init,
		stopBGAudio,
		playPlayerHurtEffect: playPlayerHurtEffect,
		playEnemyHurtEffect: playEnemyHurtEffect,
		playBGAudio: playBGAudio
	};
		
	// export a public interface to this module
	// TODO
}());