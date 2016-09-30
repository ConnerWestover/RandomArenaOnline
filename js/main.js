// main.js
// Dependencies: 
// Description: singleton object
// This object will be our main "controller" class and will contain references
// to most of the other objects in the game.
// Credit Enemy Sprite Sheet to https://andrewphillippi.files.wordpress.com/2013/01/zombiesheet.png
// another source of same spritesheet https://andrewphillippi.wordpress.com/2013/01/18/project-idea/
// Credit Player Sprite Sheet to http://knightyamato.deviantart.com/art/Blank-Sprite-Sheet-4-2-129192797 
// another source of above sprite sheet http://orig12.deviantart.net/9b3c/f/2009/193/f/2/blank_sprite_sheet_4_2_by_knightyamato.png

"use strict";

// if app exists use the existing copy
// else create a new object literal
var app = app || {};

app.main = {
	//  properties
    WIDTH : 1200, 
    HEIGHT: 800,
    canvas: undefined,
    ctx: undefined,
   	lastTime: 0, // used by calculateDeltaTime() 
    debug: true,
	paused: false,
	animationID: 0,
	gameState: undefined,
	roundScore: 0,
	totalScore: 0,
	sound: undefined,
	enemies: [],
	numEnemies: 0,
	staggerTime: 0,
	endRound: 0,
	timeBetweenWaves: 5000,
	
	bulletSize: 5,
	ENEMY_RADIUS: 18,
	
	itemText: "",
	descriptionText: "",
	timePutOnScreen: 0,
	
	itemsOnGround: [],
	invert: false,
	
	
	Emitter : undefined, // required = loaded by main.js
	pulsar : undefined, 
	exhaust : undefined,
	
	eBullActive: false,
	eBullLethal: false,
	
	playerOnFire: false,
	
	
	PLAYER: {
		health: 10,
		weapon: "none",
		attackPower: 5,
		defense: 1,
		x: 420,
		y: 420,
		radius: 0,
		maxBullets: 50000,
		BULLET:{
			distance: 600,
			power: 1,
			x: 0,
			y: 0,
			radius: 2,
			speed: 0,
			live: false
		},
	},
	
	ENEMY: {
		health: 2,
		attackPower: 1,
		defense: 1,
		x: 0,
		y: 0,
		radius: 10
	},
	
	// Part I - #2
	GAME_STATE: { // another fake enumeration
		//Play States
		BEGIN : 0,
		DEFAULT : 1,
		ROUND_OVER : 2,
		REPEAT_LEVEL : 3,
		//Menu States
		MAIN_MENU : 4,
		OPTIONS: 5,
		INSTRUCTIONS: 6,
		ABOUT: 7
	},	

	//  Part II - #2,3,4
	doMousedown: function(e){
	
		if (this.paused){
			this.paused = false;
			this.update;
			return;
		}
		
		var mouse = getMouse(e);

		if(this.gameState == this.GAME_STATE.MAIN_MENU){
			if (mouse.x > this.WIDTH/8 && mouse.x < this.WIDTH/8 + this.WIDTH*3/4 &&
			    mouse.y > this.HEIGHT/8 + 30  && mouse.y < this.HEIGHT/8 + 30 + this.HEIGHT/6){
				
				this.PLAYER = this.makePlayer();
				this.totalScore = 0;
				this.numEnemies = 0;
				this.reset();
				//Reset Items
				this.itemsOnGround = [];
				
				this.eBullLethal = false;
				this.eBullActive = false;
				this.playerOnFire = false;
				
				this.bulletSize = 5;
				this.ENEMY_RADIUS = 32;
				
				this.invert = false;
				this.gameState = this.GAME_STATE.DEFAULT;
				
			} else if (mouse.x > this.WIDTH/8 && mouse.x < this.WIDTH/8 + this.WIDTH*3/4 &&
			    mouse.y > this.HEIGHT/8 + 30 + this.HEIGHT/6 + 15 && mouse.y < this.HEIGHT/8 + 30 + this.HEIGHT/6 + 15 + this.HEIGHT/6){
				
				this.gameState = this.GAME_STATE.INSTRUCTIONS;
				
			} else if (mouse.x > this.WIDTH/8 && mouse.x < this.WIDTH/8 + this.WIDTH*3/4 &&
			    mouse.y > this.HEIGHT/8 + 30 + this.HEIGHT*2/6 + 30 && mouse.y < this.HEIGHT/8 + 30  + this.HEIGHT*2/6 + 30 + this.HEIGHT/6){
				
				this.gameState = this.GAME_STATE.OPTIONS;
				
			} else if (mouse.x > this.WIDTH/8 && mouse.x < this.WIDTH/8 + this.WIDTH*3/4 &&
			    mouse.y > this.HEIGHT/8 + 30  + this.HEIGHT*3/6 + 45 && mouse.y < this.HEIGHT/8 + 30  + this.HEIGHT*3/6 + 45 + this.HEIGHT/6){
				
				this.gameState = this.GAME_STATE.ABOUT;
				
			}
		} else if (this.gameState == this.GAME_STATE.INSTRUCTIONS ||
					this.gameState == this.GAME_STATE.OPTIONS ||
					this.gameState == this.GAME_STATE.ABOUT){
			if (mouse.x < 130 && mouse.y < 60){
				this.gameState = this.GAME_STATE.MAIN_MENU;
			}
		}
		
	},

    // methods
	init : function() {
		console.log("app.main.init() called");
		// initialize properties
		this.sound.playBGAudio();
		this.canvas = document.querySelector('canvas');
		this.canvas.width = this.WIDTH;
		this.canvas.height = this.HEIGHT;
		this.ctx = this.canvas.getContext('2d');
		this.totalScore = 0;
		this.gameState = this.GAME_STATE.MAIN_MENU;
		this.canvas.onmousedown = this.doMousedown.bind(this);
		this.PLAYER = this.makePlayer();
		//debugger;
		this.enemies = this.makeEnemy(this.numEnemies);
		
		this.pulsar = new this.Emitter();
		this.pulsar.red = 255;
		this.pulsar.minXspeed = this.pulsar.minYspeed = -0.25;
		this.pulsar.maxXspeed = this.pulsar.maxYspeed = 0.25;
		this.pulsar.lifetime = 500;
		this.pulsar.expansionRate = 0.05;
		this.pulsar.numParticles = 100;
		this.pulsar.xRange = 1;
		this.pulsar.yRange = 1;
		this.pulsar.useCircles = true;
		this.pulsar.useSquares = false;
		this.pulsar.createParticles({x:this.PLAYER.x, y: this.PLAYER.y});
		
		this.reset();
		
		this.update();
	},
	
	reset: function(){
		this.roundScore = 0;
		this.numEnemies += 5;
		this.enemies = this.makeEnemy(this.numEnemies);
	},
	
	update: function(){
	 	this.animationID = requestAnimationFrame(this.update.bind(this));
		
		this.ctx.clearRect(0,0,this.WIDTH, this.HEIGHT);
		
	 	// 2) PAUSED?
	 	// if so, bail out of loop
	 	if (this.paused){
			this.drawPauseScreen(this.ctx);
			return;
		}
	 	// 3) HOW MUCH TIME HAS GONE BY?
	 	var dt = this.calculateDeltaTime();
		
		// i) draw background	
		if (this.gameState == this.GAME_STATE.DEFAULT){
			this.drawBackground(this.ctx);
		}
		
		this.drawMain(this.ctx);

		//GamePlay Drawing Happens
		if (this.gameState == this.GAME_STATE.DEFAULT || this.gameState == this.GAME_STATE.ROUND_OVER){
			this.moveEnemy(dt);
			this.checkForCollisions();
			
			//powers check
			if(this.eBullActive == true){
				this.enemyShoot();
			}
			//update everyone
			if(myKeys.keydown[myKeys.KEYBOARD.KEY_W]){
				this.PLAYER.moveY(-dt);
			}	
			if (myKeys.keydown[myKeys.KEYBOARD.KEY_S]){
				this.PLAYER.moveY(dt);
			} 
			if (myKeys.keydown[myKeys.KEYBOARD.KEY_A]){
				this.PLAYER.moveX(-dt);
			} 
			if (myKeys.keydown[myKeys.KEYBOARD.KEY_D]){
				this.PLAYER.moveX(dt);
			} 
			if(myKeys.keydown[myKeys.KEYBOARD.KEY_UP]){
				this.PLAYER.fireUp();
			}	
			if (myKeys.keydown[myKeys.KEYBOARD.KEY_DOWN]){
				this.PLAYER.fireDown();
			} 
			if (myKeys.keydown[myKeys.KEYBOARD.KEY_LEFT]){
				this.PLAYER.fireLeft();
			} 
			if (myKeys.keydown[myKeys.KEYBOARD.KEY_RIGHT]){
				this.PLAYER.fireRight();
			} 
			this.PLAYER.update(dt);
		
			if(this.gameState != this.GAME_STATE.ROUND_OVER){
				this.drawOnGroundItems(this.ctx);
			}
			//draw things
			if (this.gameState == this.GAME_STATE.DEFAULT){
				this.drawShadows(this.ctx);
				this.drawEnemy(this.ctx);
			}
			this.PLAYER.draw(this.ctx);
			//draw hud
			this.drawItemText(this.ctx);
			this.drawHUD(this.ctx);
			
			this.checkTemporary();
			this.checkEnemiesDead();
			
			// https://developer.mozilla.org/en-US/docs/Web/API/ImageData
			var imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
			var data = imageData.data;
			var length = data.length;
			var width = imageData.width;
			if(this.invert){
				for (var i = 0; i < length; i +=4){
					var red = data[i], green = data[i+1], blue = data[i+2];
					data[i] = 255 - red; // set red value
					data[i+1] = 255 - green; // set blue value
					data[i+2] = 255 - blue; // set green value
					// data[i+3] is the alpha but we’re leaving that alone
				}
			}
			this.ctx.putImageData(imageData, 0, 0);
		}
		
		if(this.gameState == this.GAME_STATE.ROUND_OVER){
			this.drawHUD(this.ctx);
			if(myKeys.keydown[myKeys.KEYBOARD.KEY_SPACE]){
				if (this.PLAYER.health <= 0){
					this.gameState = this.GAME_STATE.MAIN_MENU;
				} else {
					this.gameState = this.GAME_STATE.DEFAULT;
					this.reset();
				}
			}
		}
	},
	
	drawBackground: function(ctx){
		ctx.fillStyle = "white"; 
		ctx.strokeStyle = "black";
		ctx.fillRect(0,0,this.WIDTH,this.HEIGHT); 
		/*for (var i = 0; i < this.WIDTH; i+= this.WIDTH/20){
			ctx.beginPath();
			ctx.moveTo(i, 0);
			ctx.lineTo(i, this.HEIGHT);
			ctx.closePath();
			ctx.stroke();
		}
		
		for (var i = 0; i < this.HEIGHT; i+= this.HEIGHT/20){
			ctx.beginPath();
			ctx.moveTo(0, i);
			ctx.lineTo(this.WIDTH, i);
			ctx.closePath();
			ctx.stroke();
		}*/
		var image = new Image();
		image.src = app.IMAGES['ground'];
		ctx.drawImage(image,					 					
					0, 0, this.WIDTH, this.HEIGHT
					);
	},
	
	drawMain: function(ctx){
		if (this.gameState == this.GAME_STATE.MAIN_MENU){
			ctx.save();
			
			ctx.strokeStyle = "black";
			ctx.lineWidth = 4;
			ctx.strokeRect(this.WIDTH/8, this.HEIGHT/8 + 30, this.WIDTH*3/4, this.HEIGHT/6);
			ctx.strokeRect(this.WIDTH/8, this.HEIGHT/8 + 30 + this.HEIGHT/6 + 15, this.WIDTH*3/4, this.HEIGHT/6);
			ctx.strokeRect(this.WIDTH/8, this.HEIGHT/8 + 30  + this.HEIGHT*2/6 + 30, this.WIDTH*3/4, this.HEIGHT/6);
			ctx.strokeRect(this.WIDTH/8, this.HEIGHT/8 + 30  + this.HEIGHT*3/6 + 45, this.WIDTH*3/4, this.HEIGHT/6);
			
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			
			this.fillText(ctx, "Down The Rabbit Hole", this.WIDTH/2, 50, "50pt Permanent Marker", "red");
			this.fillText(ctx, "Play", this.WIDTH/2, this.HEIGHT/8 + 30+ this.HEIGHT/11, "50pt Permanent Marker", "black");
			this.fillText(ctx, "Instructions", this.WIDTH/2, this.HEIGHT/6 + 30 + this.HEIGHT/4 - 10, "50pt Permanent Marker", "black");
			this.fillText(ctx, "Options", this.WIDTH/2, this.HEIGHT*2/6 + 30 + this.HEIGHT/4 + 5, "50pt Permanent Marker", "black");
			this.fillText(ctx, "About", this.WIDTH/2, this.HEIGHT*3/6 + 30 + this.HEIGHT/4+ 20, "50pt Permanent Marker", "black");
			ctx.restore();
		} else if (this.gameState == this.GAME_STATE.INSTRUCTIONS){
			ctx.save();
			ctx.strokeStyle = "black";
			ctx.fillStyle = "black";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.lineWidth = 4;
			this.fillText(ctx, "Instructions", this.WIDTH/2, this.HEIGHT/8, "60pt Permanent Marker", "black");
			this.fillText(ctx, "WASD to move the player", this.WIDTH/2, this.HEIGHT*2/5, "30pt Permanent Marker", "black");
			this.fillText(ctx, "Arrow Keys to fire bullets", this.WIDTH/2, this.HEIGHT*2/5 - 40, "30pt Permanent Marker", "black");
			this.fillText(ctx, "Defeat anyone who enters the arena", this.WIDTH/2, this.HEIGHT*2/5 + 70, "30pt Permanent Marker", "black");
			this.fillText(ctx, "Gain points by defeating enemies", this.WIDTH/2, this.HEIGHT*2/5 + 110, "30pt Permanent Marker", "black");
			this.fillText(ctx, "Pickup weapons by walking over them", this.WIDTH/2, this.HEIGHT*2/5 + 200, "30pt Permanent Marker", "black");
			this.fillText(ctx, "Fight until you drop", this.WIDTH/2, this.HEIGHT*2/5 + 240, "30pt Permanent Marker", "black");
			
			this.fillText(ctx, "Back", 60, 30, "30pt Permanent Marker", "black");
			ctx.strokeRect(0,0,130,60);
			
			ctx.restore();
		} else if (this.gameState == this.GAME_STATE.OPTIONS){
			ctx.save();
			ctx.strokeStyle = "black";
			ctx.fillStyle = "black";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.lineWidth = 4;
			this.fillText(ctx, "Back", 60, 30, "30pt Permanent Marker", "black");
			this.fillText(ctx, "Options", this.WIDTH/2, this.HEIGHT/8, "60pt Permanent Marker", "black");
			this.fillText(ctx, "This section is currently", this.WIDTH/2, this.HEIGHT*2/5, "30pt Permanent Marker", "black");
			this.fillText(ctx, "under construction", this.WIDTH/2, this.HEIGHT*2/5+40, "30pt Permanent Marker", "black");
			ctx.strokeRect(0,0,130,60);
			ctx.restore();
		} else if (this.gameState == this.GAME_STATE.ABOUT){
			ctx.save();
			ctx.strokeStyle = "black";
			ctx.fillStyle = "black";
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.lineWidth = 4;
			this.fillText(ctx, "Back", 60, 30, "30pt Permanent Marker", "black");
			this.fillText(ctx, "About", this.WIDTH/2, this.HEIGHT/8, "60pt Permanent Marker", "black");
			this.fillText(ctx, "Down The Rabbit Hole was created by:", this.WIDTH/2, this.HEIGHT*2/5, "30pt Permanent Marker", "black");
			this.fillText(ctx, "Alexander Huffman", this.WIDTH/2, this.HEIGHT*2/5+40, "30pt Permanent Marker", "black");
			this.fillText(ctx, "Conner Westover", this.WIDTH/2, this.HEIGHT*2/5+80, "30pt Permanent Marker", "black");
			this.fillText(ctx, "Joe Garcia", this.WIDTH/2, this.HEIGHT*2/5+120, "30pt Permanent Marker", "black");
			this.fillText(ctx, "Andrew Knowland", this.WIDTH/2, this.HEIGHT*2/5+160, "30pt Permanent Marker", "black");
			ctx.strokeRect(0,0,130,60);
			ctx.restore();
		}
		
	},
	
	drawHUD: function(ctx){
		ctx.save();
		// draw score
      	// fillText(this.ctx,string, x, y, css, color)
		ctx.fillStyle = "white";
		ctx.fillRect(this.WIDTH - 210, 2.5, 170, 22.5);
		this.fillText(this.ctx,"Total Score: " + this.totalScore, this.WIDTH - 200, 20, "14pt Permanent Marker", "black");
		ctx.lineWidth = 3;
		ctx.strokeStyle = "black";
		ctx.fillRect(5,5, 200, 40);
		ctx.fillStyle = "red";
		ctx.fillRect(5,5,200 * (this.PLAYER.health/this.PLAYER.maxHealth),40);
		ctx.strokeRect(5,5, 200, 40);
		
		if(this.PLAYER.gotHit == true){
			this.pulsar.stopDraw = false;
		}
		else{
			this.pulsar.stopDraw = true;
		}
		
		this.pulsar.updateAndDraw(this.ctx, {x:this.PLAYER.x, y: this.PLAYER.y});
		
		ctx.fillStyle = "white";
		if(this.gameState == this.GAME_STATE.BEGIN){
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			this.fillText(this.ctx,"To begin, click the screen", this.WIDTH/2, this.HEIGHT/2, "30pt Permanent Marker", "white");
		} // end if
	
		if(this.gameState == this.GAME_STATE.ROUND_OVER){
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			if (this.PLAYER.health <= 0){
				this.fillText(this.ctx,"GAME OVER", this.WIDTH/2, this.HEIGHT/2 - 80, "50pt Permanent Marker", "red");
				this.fillText(this.ctx,"Your final score was: " + this.roundScore, this.WIDTH/2, this.HEIGHT/2 - 20, "30pt Permanent Marker", "black");
				this.fillText(this.ctx,"Press SPACE to return to Main Menu", this.WIDTH/2, this.HEIGHT/2 + 10, "30pt Permanent Marker", "black");
			} else {
				this.fillText(this.ctx,"You have completed this round", this.WIDTH/2, this.HEIGHT/2 - 40, "30pt Permanent Marker", "black");
				this.fillText(this.ctx,"Press SPACE to continue", this.WIDTH/2, this.HEIGHT/2, "30pt Permanent Marker", "black");
			}
		} // end if
		
		ctx.restore(); // NEW
	},
	
	
	makePlayer: function(){
		var makeBullet = function(x,y,xSpeed, ySpeed, maxDistance){
			var move = function(dt){
				this.x += this.xSpeed;
				this.y += this.ySpeed;
				this.traveled += Math.abs(this.ySpeed);
				this.traveled += Math.abs(this.xSpeed);
				
				if (this.maxDistance < this.traveled){
					this.live = false;
				}
			};
			
			var draw = function(ctx){
				ctx.save();
				ctx.fillStyle = "red";
				ctx.strokeStyle = "black";
				ctx.beginPath();
				ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
				ctx.restore();
			};
			
			var drawShadow = function(ctx){
				ctx.save();
				ctx.fillStyle = "black";
				ctx.beginPath();
				ctx.globalAlpha = 0.5;
				ctx.arc(this.x, this.y + 20 - (20 * (this.traveled/this.maxDistance)), this.radius *.9, 0, Math.PI*2, false);
				ctx.closePath();
				ctx.fill();
				ctx.restore();
			}
			
			var b = {};
			b.maxDistance = maxDistance;
			b.traveled = 0;
			b.power = 1;
			b.x = this.x;
			b.y = this.y;
			b.radius = app.main.bulletSize;
			b.xSpeed = xSpeed;
			b.ySpeed = ySpeed;
			b.live = true
			b.draw = draw;
			b.drawShadow = drawShadow;
			b.move = move;
			
			return b;
		};
		
		var fireU = function(){
			var d = new Date();
			this.direction = 0;
			if (this.bullets.length < p.maxBullets && d.getTime() - this.timeLastFired > this.fireRate){
				this.bullets.push(this.makeBullet(this.x,this.y,0,-5,this.maxDistance));
				this.timeLastFired = d.getTime();
			}
		};
		var fireD = function(){
			var d = new Date();
			this.direction = 1;
			if (this.bullets.length < p.maxBullets && d.getTime() - this.timeLastFired > this.fireRate){
				this.bullets.push(this.makeBullet(this.x,this.y,0,5,this.maxDistance));
				this.timeLastFired = d.getTime();
			}
		};
		var fireL = function(){
			var d = new Date();
			this.direction = 3;
			if (this.bullets.length < p.maxBullets && d.getTime() - this.timeLastFired > this.fireRate){
				this.bullets.push(this.makeBullet(this.x,this.y,-5,0,this.maxDistance));
				this.timeLastFired = d.getTime();
			}
		};
		var fireR = function(){
			var d = new Date();
			this.direction = 2;
			if (this.bullets.length < p.maxBullets && d.getTime() - this.timeLastFired > this.fireRate){
				this.bullets.push(this.makeBullet(this.x,this.y,5,0,this.maxDistance));
				this.timeLastFired = d.getTime();
			}
		};
		var drawPlayer = function(ctx){
			ctx.save();
			
			if(!this.image){
				ctx.fillStyle = "orange";
				ctx.fillRect(this.x, this.y, 32, 32);
			} else {
				var halfW = this.radius;
				var halfH = this.radius;
				if(this.direction == 2){
					ctx.drawImage(this.image,				
					0 + this.spriteNumber * 32,64,32,32,		 					
					this.x- halfW, this.y- halfH, halfW*2, halfH*2
					);
				} else if (this.direction == 3) {
					ctx.drawImage(this.image,				
					0 + this.spriteNumber * 32,32,32,32,		 					
					this.x- halfW, this.y- halfH, halfW*2, halfH*2
					);
				} else if(this.direction == 1){
					ctx.drawImage(this.image,				
					0 + this.spriteNumber * 32,1,32,31,		 					
					this.x- halfW, this.y- halfH, halfW*2, halfH*2
					);	
				} else {
					ctx.drawImage(this.image,					 					
					0 + this.spriteNumber * 32,96,32,32,		 					
					this.x- halfW, this.y- halfH, halfW*2, halfH*2
					);
				}
			}
			ctx.restore();
			
			for (var i = 0; i < this.bullets.length; i++){
				this.bullets[i].draw(ctx);
			}
		};
		
		var drawShadow = function(ctx){
			ctx.save();
			ctx.fillStyle = "black";
			ctx.strokeStyle = "black";
			ctx.globalAlpha = .7;
			ctx.beginPath();
			ctx.arc(this.x, this.y+ 12, this.radius*.9, 0, Math.PI*2, false);
			ctx.fill();
			ctx.closePath();
			ctx.stroke();
			ctx.restore();
			for (var i = 0; i < this.bullets.length; i++){
				this.bullets[i].drawShadow(ctx);
			}
		}
		
		var movePlayerX = function(dt){
			this.x += this.speed * dt;
			if(dt > 0){
				//this.direction = 2;
			} else {
				//this.direction = 3;
			}
		};
		
		var movePlayerY = function(dt){
			this.y += this.speed * dt;
			if(dt > 0){
				//this.direction = 1;
			} else {
				//this.direction = 0;
			}
		};
		
		var update = function(dt){
			for (var i = 0; i < this.bullets.length; i++){
				this.bullets[i].move(dt);
				if(this.bullets[i].live == false) this.bullets.splice(i, 1);
			}
			if (this.x - this.radius < 0) this.x = this.radius;
			if (this.x + this.radius > app.main.WIDTH) this.x = app.main.WIDTH - this.radius;
			if (this.y - this.radius < 0) this.y = this.radius;
			if (this.y + this.radius > app.main.HEIGHT) this.y = app.main.HEIGHT - this.radius;
			
			if (this.gotHit){
				var d = new Date();
				//this.pulsar.updateAndDraw(this.ctx, {x:this.PLAYER.x, y: this.PLAYER.y});
				if (d.getTime() - this.timeGotHit > 1000){
					this.gotHit = false;
				}
			}
			
			var d = new Date();
			if (d.getTime() - this.timeLastSpriteChanged > 250){
				this.timeLastSpriteChanged = d.getTime();
				this.spriteNumber++;
				if (this.spriteNumber > 2){
					this.spriteNumber = 0;
				}
			}
		}
		
		var p = {};
		p.draw = drawPlayer;
		p.speed = 150;
		p.x = this.WIDTH/2;
		p.y = this.HEIGHT/2;
		p.moveX = movePlayerX;
		p.moveY = movePlayerY;
		p.health = 10;
		p.maxHealth = 10;
		p.weapon = "gun";
		p.attackPower = 1;
		p.defense = 1;
		p.radius = 18;
		p.maxBullets = 10;
		p.bullets = [];
		p.makeBullet = makeBullet;
		p.fireUp = fireU;
		p.fireDown = fireD;
		p.fireLeft = fireL;
		p.fireRight = fireR;
		p.update = update;
		p.drawShadow = drawShadow;
		p.gotHit = false;
		p.timeGotHit = 0;
		p.timeLastFired = 0;
		p.fireRate = 500;
		p.maxDistance = 600;
		
		//Sprite resources
		p.timeLastSpriteChanged = 0;
		p.spriteNumber = 0;
		p.direction = 0; // 0 = up, 1 = down, 2 = right, 3 = left
			
		var image = new Image();
		image.src = app.IMAGES['playerImage'];
			
		p.image = image;
		
		return p;
	},
	
	makeEnemy: function(num){
		
		var makeBullet = function(x,y,xSpeed, ySpeed){
			var move = function(dt){
				this.x += this.xSpeed;
				this.y += this.ySpeed;
				this.traveled += Math.abs(this.ySpeed);
				this.traveled += Math.abs(this.xSpeed);
				
				if (this.maxDistance < this.traveled){
					this.live = false;
				}
			};
			
			var draw = function(ctx){
				ctx.save();
				ctx.fillStyle = this.fillStyle;
				ctx.strokeStyle = "black";
				ctx.beginPath();
				ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false);
				ctx.closePath();
				ctx.fill();
				ctx.stroke();
				ctx.restore();
			};
			
			var drawShadow = function(ctx){
				ctx.save();
				ctx.fillStyle = "black";
				ctx.beginPath();
				ctx.globalAlpha = 0.5;
				ctx.arc(this.x, this.y + 20 - (20 * (this.traveled/this.maxDistance)), this.radius *.9, 0, Math.PI*2, false);
				ctx.closePath();
				ctx.fill();
				ctx.restore();
			}
			
			var b = {};
			if(app.main.eBullLethal == true){
				b.fillStyle = "red";
			}else{
				b.fillStyle = "yellow";
			}
			
			b.maxDistance = 300;
			b.traveled = 0;
			b.power = 1;
			b.x = this.x;
			b.y = this.y;
			b.radius = 5;
			b.xSpeed = xSpeed;
			b.ySpeed = ySpeed;
			b.live = true
			b.draw = draw;
			b.drawShadow = drawShadow;
			b.move = move;
			
			return b;
		};
		
		var fireU = function(){
			var d = new Date();
			this.direction = 0;
			if (this.bullets.length < e.maxBullets && d.getTime() - this.timeLastFired > this.fireRate){
				this.bullets.push(this.makeBullet(this.x,this.y,0,-5));
				this.timeLastFired = d.getTime();
			}
		};
		var fireD = function(){
			var d = new Date();
			this.direction = 1;
			if (this.bullets.length < e.maxBullets && d.getTime() - this.timeLastFired > this.fireRate){
				this.bullets.push(this.makeBullet(this.x,this.y,0,5));
				this.timeLastFired = d.getTime();
			}
		};
		var fireL = function(){
			var d = new Date();
			this.direction = 3;
			if (this.bullets.length < e.maxBullets && d.getTime() - this.timeLastFired > this.fireRate){
				this.bullets.push(this.makeBullet(this.x,this.y,-5,0));
				this.timeLastFired = d.getTime();
			}
		};
		var fireR = function(){
			var d = new Date();
			this.direction = 2;
			if (this.bullets.length < e.maxBullets && d.getTime() - this.timeLastFired > this.fireRate){
				this.bullets.push(this.makeBullet(this.x,this.y,5,0));
				this.timeLastFired = d.getTime();
			}
		};
		
		var enemyDraw = function(ctx){
			ctx.save();
			if(!this.image){
				ctx.fillStyle = "orange";
				ctx.fillRect(this.x, this.y, 32, 32);
			} else {
				var halfW = this.radius;
				var halfH = this.radius;
				if( Math.abs(this.xSpeed) >= Math.abs(this.ySpeed)){
					if(this.xSpeed >= 0){
						this.fireDirection = 2;
						ctx.drawImage(this.image,				
						1 + this.spriteNumber * 32 + this.column * 96,65 + this.row * 128,31,31,		 					
						this.x- halfW, this.y- halfH, halfW*2, halfH*2
						);
					} else {
						this.fireDirection = 3;
						ctx.drawImage(this.image,				
						1 + this.spriteNumber * 32 + this.column * 96,33 + this.row * 128,31,31,		 					
						this.x- halfW, this.y- halfH, halfW*2, halfH*2
						);
					}
				} else {
					if(this.ySpeed >= 0){
						this.fireDirection = 1;
						ctx.drawImage(this.image,				
						1 + this.spriteNumber * 32 + this.column * 96,1 + this.row * 128,31,31,		 					
						this.x- halfW, this.y- halfH, halfW*2, halfH*2
						);	
					} else {
						this.fireDirection = 0;
						ctx.drawImage(this.image,					 					
						1 + this.spriteNumber * 32 + this.column * 96,97 + this.row * 128,31,31,		 					
						this.x- halfW, this.y- halfH, halfW*2, halfH*2
						);
					}
				}
			}
			
			ctx.restore();
			for (var i = 0; i < this.bullets.length; i++){
				this.bullets[i].draw(ctx);
			}
		};
		
		var enemyDrawShadow = function(ctx){
			ctx.save();
			ctx.fillStyle = "black";
			ctx.beginPath();
			ctx.globalAlpha = .7;
			ctx.arc(this.x, this.y + 12, this.radius*.9, 0, Math.PI*2, false);
			ctx.fill();
			ctx.closePath();
			ctx.restore();
			for (var i = 0; i < this.bullets.length; i++){
				this.bullets[i].drawShadow(ctx);
			}
		};
		
		var enemyMove = function(dt){
			for (var i = 0; i < this.bullets.length; i++){
				this.bullets[i].move(dt);
				if(this.bullets[i].live == false) this.bullets.splice(i, 1);
			}
		
			this.xSpeed = app.main.PLAYER.x - this.x;
			this.ySpeed = app.main.PLAYER.y - this.y;
			
			var mag = Math.sqrt(this.xSpeed*this.xSpeed + this.ySpeed*this.ySpeed);
			this.xSpeed /= mag;
			this.ySpeed /= mag;
			
			this.x += this.xSpeed * this.speed * dt;
			this.y += this.ySpeed * this.speed * dt;
			
			//update walk cycle
			var d = new Date();
			if (d.getTime() - this.timeLastSpriteChanged > 10000/this.speed){
				this.timeLastSpriteChanged = d.getTime();
				this.spriteNumber++;
				if (this.spriteNumber > 2){
					this.spriteNumber = 0;
				}
			}
		}
		
		var array = [];
		
		var d = new Date();
		var n = d.getTime();
		
		for(var i = 0; i < num; i++){
			var e = {};
			var door = Math.floor(getRandom(0, 3));
			//control spawn point
			if(door == 0){
				e.x = 30;
				e.y = this.HEIGHT/2;
			}
			else if(door == 1){
				e.x = this.WIDTH/2;
				e.y = 30;
			}
			else{
				e.x = this.WIDTH - 30;
				e.y = this.HEIGHT/2;
			}
			
			e.startTime = n;
			
			e.started = false;
			e.alive = true;
			
			//calculate direction to player
			e.xSpeed = this.PLAYER.x - e.x;
			e.ySpeed = this.PLAYER.y - e.y;
			//normalize
			var mag = Math.sqrt(e.xSpeed*e.xSpeed + e.ySpeed*e.ySpeed);
			e.xSpeed /= mag;
			e.ySpeed /= mag;
			
			e.speed = Math.floor(getRandom(50, 150));
			
			e.health = Math.floor(getRandom(1, 5));
			e.attackPower = Math.floor(getRandom(1, 3));;
			e.radius = this.ENEMY_RADIUS;
			
			e.draw = enemyDraw;
			e.drawShadow = enemyDrawShadow;
			e.move = enemyMove;
			
			e.maxBullets = 1;
			e.bullets = [];
			e.makeBullet = makeBullet;
			e.fireUp = fireU;
			e.fireDown = fireD;
			e.fireLeft = fireL;
			e.fireRight = fireR;
			e.timeLastFired = 0;
			e.fireRate = 2000;
			e.fireDirection = 0;
			
			e.timeLastSpriteChanged = 0;
			e.spriteNumber = 0;

			
			//IMAGES
			var image = new Image();
			var r = getRandom(0,1);
			if (r <= .25){
				image.src = app.IMAGES['wolf'];
				e.row = 0;
				e.column = 0;
			} else if (r > .25 & r <= .5){
				image.src = app.IMAGES['deer'];
				e.row = 0;
				e.column = 0;
			} else if (r > .5 && r <= .75){
				image.src = app.IMAGES['bunny'];
				e.row = 0;
				e.column = 0;
			} else {
				image.src = app.IMAGES['bear'];
				e.row = 0;
				e.column = 0;
			}
			
			e.image = image;
			
			//Object.seal(e);
			array.push(e);
		}
		return array;
	},
	
	drawShadows: function(ctx){
		this.PLAYER.drawShadow(ctx);
		for(var i = 0; i < this.enemies.length; i++){
			var e = this.enemies[i];
			if(e.started == true && e.alive == true){
				e.drawShadow(ctx);
			}
		}
	},
	
	drawEnemy: function(ctx){
		for(var i = 0; i < this.enemies.length; i++){
			var e = this.enemies[i];
			
			var d = new Date();
			var n = d.getTime();
			
			if((e.startTime + i*getRandom(500,1000)) <= n){
				e.started = true;
			}
			
			if(e.started == true){
				//console.log(i);
			}
			
			if(e.started == true && e.alive == true){
				e.draw(ctx);
			}
		}
	},
	
	moveEnemy: function(dt){
		for(var i = 0; i < this.enemies.length; i++){
			var e = this.enemies[i];
			if(e.started == true){
				e.move(dt);
			}
		}
	},
	
	enemyShoot: function(){
		for(var i = 0; i < this.enemies.length; i++){
		var e = this.enemies[i];
			if(e.fireDirection == 0){
				e.fireUp();
			}else if(e.fireDirection == 1){
				e.fireDown();
			}else if(e.fireDirection == 2){
				e.fireRight();
			}else{
				e.fireLeft();
			}
		}
	},
	
	fillText: function(ctx, string, x, y, css, color) {
		ctx.save();
		// https://developer.mozilla.org/en-US/docs/Web/CSS/font
		ctx.font = css;
		ctx.fillStyle = color;
		ctx.fillText(string, x, y);
		ctx.restore();
	},
	
	calculateDeltaTime: function(){
		// what's with (+ new Date) below?
		// + calls Date.valueOf(), which converts it from an object to a 	
		// primitive (number of milliseconds since January 1, 1970 local time)
		var now,fps;
		now = (+new Date); 
		fps = 1000 / (now - this.lastTime);
		fps = clamp(fps, 12, 60);
		this.lastTime = now; 
		return 1/fps;
	},
	
	
	//check collision 
	checkForCollisions: function(){
		for (var j = 0; j < this.enemies.length; j++){
			if (this.enemies[j].alive == false) continue; // if enemy isn't alive disregard
			if (this.enemies[j].started == false) continue; // if enemy isn't started disregard
			if (!this.PLAYER.gotHit && 
				Math.abs(this.PLAYER.x - this.enemies[j].x) < this.PLAYER.radius + this.enemies[j].radius &&
				Math.abs(this.PLAYER.y - this.enemies[j].y) < this.PLAYER.radius + this.enemies[j].radius){
					this.PLAYER.health -= this.enemies[j].attackPower; //decrement					health
					if (this.playerOnFire.active == true){
						this.enemies[j].health -= player.attackPower * 2;
						if (this.enemies[j].health <= 0){
							this.enemies[j].alive = false;
						}
					}
					this.sound.playPlayerHurtEffect();
					if(this.PLAYER.health <= 0){ //make sure health can't go negative and sets round to over
						this.PLAYER.health = 0;
						this.roundScore = this.totalScore;
						this.gameState = this.GAME_STATE.ROUND_OVER;
					}
					var d = new Date();
					this.PLAYER.timeGotHit = d.getTime();
					this.PLAYER.gotHit = true;
				}
			if(this.eBullActive == true){
				for(var i = 0; i < this.enemies[j].bullets.length; i++){
					var b = this.enemies[j].bullets[i];
					if (Math.abs(b.x - this.PLAYER.x) < b.radius + this.PLAYER.radius && Math.abs(b.y - this.PLAYER.y) < b.radius + this.PLAYER.radius){
						b.live = false;
						if(this.eBullLethal == true){
							this.PLAYER.health -= 1;
							if(this.PLAYER.health <= 0){ //make sure health can't go negative and sets round to over
								this.PLAYER.health = 0;
								this.roundScore = this.totalScore;
								this.gameState = this.GAME_STATE.ROUND_OVER;
							}
							var d = new Date();
							this.PLAYER.timeGotHit = d.getTime();
							this.PLAYER.gotHit = true;
						}
					}
				}
			}
			for (var i = 0; i < this.PLAYER.bullets.length; i++){
				var e = this.enemies[j];
				var b = this.PLAYER.bullets[i];
				if (Math.abs(b.x - e.x) < b.radius + e.radius && Math.abs(b.y - e.y) < b.radius + e.radius){
					e.health -= b.power;
					this.sound.playEnemyHurtEffect();
					b.live = false;
					if(e.health <= 0){
						e.alive = false;
						this.totalScore = this.totalScore + 1;
						if(getRandom(0,100) > 40){
							var x = Math.floor(getRandom(0, myTemporaryItems.length));
							this.makeActiveItem(x, e.x,e.y);								
						}
					}
				}
			}
			
			//ITEMS
			for (var i = 0; i < this.itemsOnGround.length; i++){
				if (Math.abs(this.PLAYER.x - this.itemsOnGround[i].x) < this.PLAYER.radius + this.itemsOnGround[i].radius &&
					Math.abs(this.PLAYER.y - this.itemsOnGround[i].y) < this.PLAYER.radius + this.itemsOnGround[i].radius){
					if(this.itemsOnGround[i].active != true && this.itemsOnGround[i].onGround == true){
						this.itemsOnGround[i].onGround = false;
						this.itemsOnGround[i].doEffect(this.PLAYER);
						
						this.itemText = this.itemsOnGround[i].name;
						this.descriptionText = this.itemsOnGround[i].description;
						var d = new Date();
						this.timePutOnScreen = d.getTime();
					} else {
						this.itemsOnGround.splice(i, 1);
					}
				}
			}
		}
	},
	
	makeActiveItem: function(index, x, y){
		var item = myTemporaryItems[index];
		item.onGround = true;
		item.y = y;
		item.x = x;
		var image = new Image();
		var r = getRandom(0,100);
		if (r > 0 && r <=25){
			image.src = app.IMAGES['pill'];
		} else if (r > 25 && r <= 50){
			image.src = app.IMAGES['mushroom'];
		} else if (r > 50 && r <= 75){
			image.src = app.IMAGES['flower1'];
		} else if (r > 75 && r <= 100){
			image.src = app.IMAGES['plant'];
		} else {
			image.src = app.IMAGES['flower2'];
		}
		item.image = image;
		this.itemsOnGround.push(item);
	},
	
	drawOnGroundItems: function(ctx){
		for (var i = 0; i < this.itemsOnGround.length; i++){
			var item = this.itemsOnGround[i];
			if(item.onGround == true){
				ctx.save();
				ctx.drawImage(item.image,		 					
					item.x - item.radius/2, item.y - item.radius/2, item.radius, item.radius);	
				ctx.restore();
			}
		}
		
	},
	
	checkTemporary: function(){
		for(var i = 0; i < myTemporaryItems.length; i++){
			if(myTemporaryItems[i].beingUsed != true) continue;
			var n = timerCall();
			if((n - myTemporaryItems[i].timeActive) > 15000){
				myTemporaryItems[i].doEffect(this.PLAYER);
			}
		}
	},
	
	//check if all enemies have been killed
	checkEnemiesDead: function(){
		var dead = 0;
		for (var j = 0; j < this.enemies.length; j++){
			if(this.enemies[j].alive == false) dead++;
		}
		if(dead == this.numEnemies){
			this.gameState = this.GAME_STATE.ROUND_OVER;
		}
	},
	
	drawPauseScreen: function(ctx){
		ctx.save();
		ctx.fillStyle = "black";
		ctx.fillRect(0,0,this.WIDTH, this.HEIGHT);
		ctx.textAlign = "center";
		ctx.textBaseline= "middle";
		this.fillText(this.ctx,"...PAUSED...", this.WIDTH/2, this.HEIGHT/2, "40pt Permanent Marker", "white");
		ctx.restore();
	},
	
	pauseGame: function(){
		if (this.gameState == this.GAME_STATE.DEFAULT){
			this.paused = true;
			cancelAnimationFrame(this.animationID);
			this.stopBGAudio();
			this.update();
		}
	},
	
	resumeGame: function(){
		if (this.gameState == this.GAME_STATE.DEFAULT){
			cancelAnimationFrame(this.animationID);
			this.paused = false;
			this.sound.playBGAudio();
			this.update();
		}
	},
	
	stopBGAudio: function(){
		//this.bgAudio.pause();
		//this.bgAudio.currentTime = 0;
		this.sound.stopBGAudio();
	},
	manipulatePixels: function(ctx, canvas){
		// https://developer.mozilla.org/en-US/docs/Web/API/ImageData
		var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		var data = imageData.data;
		var length = data.length;
		var width = imageData.width;
		for (var i = 0; i < length; i +=4){
		
			if(invert){
				var red = data[i], green = data[i+1], blue = data[i+2];
				data[i] = 255 - red; // set red value
				data[i+1] = 255 - green; // set blue value
				data[i+2] = 255 - blue; // set green value
				// data[i+3] is the alpha but we’re leaving that alone
			}
			
		}
		ctx.putImageData(imageData, 0, 0);
	},
	
	drawItemText: function(ctx){
		var d = new Date();
		if (d.getTime() - this.timePutOnScreen < 2500){
			ctx.save();
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillStyle = "rgba(20,20,20,.5)";
			ctx.fillRect(this.WIDTH/2 - 300, this.HEIGHT/4 - 40, 600, 100);
			this.fillText(this.ctx,this.itemText, this.WIDTH/2, this.HEIGHT/4, "40pt Permanent Marker", "black");
			this.fillText(this.ctx,this.descriptionText, this.WIDTH/2, this.HEIGHT/4 + 40, "20pt Permanent Marker", "black");
			ctx.restore();
		}
	}
	
}; // end app.main