//this is for items 
"use strict";

function timerCall(){
	var d = new Date();
	var n = d.getTime();
	return n;
}

//-----------Positive-----------
var OnFire = {
	x: 0,
	y: 0,
	name: "On Fire",
	description: "YOU'RE ON FIRE",
	radius: 20,
	onGround: false,
	active: false,
	image: undefined,
	doEffect: function(player, enemy){
		app.main.playerOnFire = !app.main.playerOnFire;
	}
};

var RangeUp = {
	x: 0,
	y: 0,
	name: "Range Up",
	description: "shoot farther",
	radius: 20,
	onGround: false,
	active: false,
	image: undefined,
	beingUsed: false,
	timeActive: 0,
	doEffect: function(player){
		if(this.beingUsed == false){
			this.timeActive = timerCall();
			player.maxDistance += 20;
			this.beingUsed = true;
			this.active = false;
			console.log("Range Up");
		}else{
			player.maxDistance -= 20;
			this.beingUsed = false;
			this.timeActive = 0;
		}
		
	}
};

var BulletSizeUp = {
	x: 0,
	y: 0,
	name: "Bullet Up",
	description: "larger bullets",
	radius: 20,
	onGround: false,
	active: false,
	image: undefined,
	beingUsed: false,
	timeActive: 0,
	doEffect: function(player){
		if(this.beingUsed == false){
			this.timeActive = timerCall();
			app.main.bulletSize += 1;
			this.beingUsed = true;
			this.active = false;
			console.log("Bullet Up");
		}else{
			app.main.bulletSize -= 1;
			this.beingUsed = false;
			this.timeActive = 0;
		}
	}
};

var SlowEnemy = {
	x: 0,
	y: 0,
	name: "Slow Enemy",
	description: "enemies are hindered",
	radius: 20,
	onGround: false,
	slowEnemy: true,
	active: false,
	image: undefined,
	beingUsed: false,
	timeActive: 0,
	doEffect: function(){
		if(this.beingUsed == false){
			this.timeActive = timerCall();
			for(var i = 0; i < app.main.enemies.length; i++){
				var e = app.main.enemies[i];
				e.speed /= 2;
			}
			this.beingUsed = true;
			this.active = false;
			console.log("Slow Enemy");
		}else{
			for(var i = 0; i < app.main.enemies.length; i++){
				var e = app.main.enemies[i];
				e.speed *= 2;
			}
			this.beingUsed = false;
			this.timeActive = 0;
		}
	}
};
//-----------Negative-----------
var EnemyFiresBulletsLethal = {
	x: 0,
	y: 0,
	name: "Enemies Spit Bullets",
	description: "LOOKOUT",
	radius: 20,
	onGround: false,
	active: false,
	image: undefined,
	beingUsed: false,
	timeActive: 0,
	doEffect: function(player){
		app.main.eBullActive = true;
		app.main.eBullLethal = true;
	}
};

var RangeDown = {
	x: 0,
	y: 0,
	name: "Range Down",
	description: "shoot not so far",
	radius: 20,
	onGround: false,
	active: false,
	image: undefined,
	beingUsed: false,
	timeActive: 0,
	doEffect: function(player){
		if(this.beingUsed == false){
			this.timeActive = timerCall();
			player.maxDistance -= 20;
			this.beingUsed = true;
			this.active = false;
			console.log("Range Down");
		}else{
			player.maxDistance += 20;
			this.beingUsed = false;
			this.timeActive = 0;
		}
	}
};

var SlowAll = {
	x: 0,
	y: 0,
	name: "Slow Down",
	description: "everything gets slower",
	radius: 20,
	onGround: false,
	slowAll: true,
	active: false,
	image: undefined,
	beingUsed: false,
	timeActive: 0,
	doEffect: function(player){
		if(this.beingUsed == false){
			this.timeActive = timerCall();
			for(var i = 0; i < app.main.enemies.length; i++){
				var e = app.main.enemies[i];
				e.speed /= 2;
			}
			player.speed /= 2;
			this.beingUsed = true;
			this.active = false;
			console.log("Speed");
		}else{	
			for(var i = 0; i < app.main.enemies.length; i++){
				var e = app.main.enemies[i];
				e.speed *= 2;
			}
			player.speed *= 2;
			this.beingUsed = false;
			this.timeActive = 0;
		}
	}
};

var BulletSizeDown = {
	x: 0,
	y: 0,
	name: "Bullet Down",
	description: "smaller bullets",
	radius: 20,
	onGround: false,
	active: false,
	image: undefined,
	beingUsed: false,
	timeActive: 0,
	doEffect: function(player){
		if(this.beingUsed == false){
			this.timeActive = timerCall();
			app.main.bulletSize -= 1;
			console.log("Bullet Down");
			this.beingUsed = true;
			this.active = false;
		}else{
			app.main.bulletSize += 1;
			this.beingUsed = false;
			this.timeActive = 0;
		}
	}
};

//-----------Neutral------------
var EnemyFiresBulletsNonLethal = {
	x: 0,
	y: 0,
	name: "Enemies Spit Bullets",
	description: "...nerf bullets",
	radius: 20,
	onGround: false,
	active: false,
	image: undefined,
	beingUsed: false,
	timeActive: 0,
	doEffect: function(player){
		app.main.eBullActive = true;
		app.main.eBullLethal = false;
	}
};

var NegativeColor = {
	x: 0,
	y: 0,
	name: "Negative",
	description: "what happened to the colors?",
	radius: 20,
	onGround: false,
	active: false,
	image: undefined,
	beingUsed: false,
	timeActive: 0,
	doEffect: function(player){
		if(this.beingUsed == false){
			this.timeActive = timerCall();
			app.main.invert = !app.main.invert;
			console.log("Negative");
			this.beingUsed = true;
			this.active = false;
		}else{
			app.main.invert = app.main.invert;
			this.beingUsed = false;
			this.timeActive = 0;
		}
	}
};

var EnemySizeUp = {
	x: 0,
	y: 0,
	name: "Enemy Size Up",
	description: "David vs Goliaths",
	radius: 20,
	onGround: false,
	active: false,
	image: undefined,
	doEffect: function(player){
		app.main.ENEMY_RADIUS+=4;
		for (var i = 0; i < app.main.enemies.length; i++){
			var e = app.main.enemies[i];
			e.radius = app.main.ENEMY_RADIUS;
		}
		this.active = false;
		console.log("Enemy Size Up");
	}
};

var EnemySizeDown = {
	x: 0,
	y: 0,
	name: "Enemy Size Down",
	description: "Goliath vs Davids",
	radius: 20,
	onGround: false,
	active: false,
	image: undefined,
	doEffect: function(player){
		app.main.ENEMY_RADIUS-=4;
		for (var i = 0; i < app.main.enemies.length; i++){
			var e = app.main.enemies[i];
			e.radius = app.main.ENEMY_RADIUS;
		}
		this.active = false;
		console.log("Enemy Size Down");
	}
};

var PlayerSizeUp = {
	x: 0,
	y: 0,
	name: "Player Size Up",
	description: "stop eating so much",
	radius: 20,
	onGround: false,
	active: false,
	image: undefined,
	doEffect: function(player){
		player.radius +=4;
		this.active = false;
		console.log("Player Size Up");
	}
};

var PlayerSizeDown = {
	x: 0,
	y: 0,
	name: "Player Size Down",
	description: "you should eat more",
	radius: 20,
	onGround: false,
	active: false,
	image: undefined,
	doEffect: function(player){
		player.radius -= 4;
		this.active = false;
		console.log("Player Size Down");
	}
};

var EveryoneSizeUp = {
	x: 0,
	y: 0,
	name: "SIZE UP",
	description: "is the room shrinking?",
	radius: 20,
	onGround: false,
	active: false,
	image: undefined,
	doEffect: function(player){
		app.main.ENEMY_RADIUS+=4;
		for (var i = 0; i < app.main.enemies.length; i++){
			var e = app.main.enemies[i];
			e.radius = app.main.ENEMY_RADIUS;
		}
		this.active = false;
		console.log("Everyone Size Up");
	}
};



var EveryoneSizeDown = {
	x: 0,
	y: 0,
	name: "SIZE DOWN",
	description: "everything feels... bigger",
	radius: 20,
	onGround: false,
	active: false,
	image: undefined,
	doEffect: function(player){
		app.main.ENEMY_RADIUS-=4;
		for (var i = 0; i < app.main.enemies.length; i++){
			var e = app.main.enemies[i];
			e.radius = app.main.ENEMY_RADIUS;
		}
		this.active = false;
		console.log("Everyone Size Down");
	}
};

//Health

var HalfHealth = {
	x: 0,
	y: 0,
	name: "Half Health",
	description: "you're at half health",
	radius: 20,
	onGround: false,
	active: false,
	image: undefined,
	doEffect: function(player){
		app.main.PLAYER.health = ((app.main.PLAYER.maxHealth)/2);
		this.active = false;
		console.log("player at half health");
	}
};
var FullHealth = {
	x: 0,
	y: 0,
	name: "Full Health",
	description: "you have full health",
	radius: 20,
	onGround: false,
	active: false,
	image: undefined,
	doEffect: function(player){
		app.main.PLAYER.health = app.main.PLAYER.maxHealth;
		this.active = false;
		console.log("player at full health");
	}
};

var HealthUp = {
	x: 0,
	y: 0,
	name: "Health Up",
	description: "more health",
	radius: 20,
	onGround: false,
	active: false,
	image: undefined,
	doEffect: function(player){
		app.main.PLAYER.maxHealth ++;
		app.main.PLAYER.health ++;
		this.active = false;
		console.log("Max health increased, player slightly healed");
	}
};
var HealthDown = {
	x: 0,
	y: 0,
	name: "health down",
	description: "you have less health",
	radius: 20,
	onGround: false,
	active: false,
	image: undefined,
	doEffect: function(player){
		app.main.PLAYER.maxHealth --;
		app.main.PLAYER.health --;
		this.active = false;
		console.log("Max health decreased, player slightly damaged");
	}
};

var myTemporaryItems = [OnFire, EnemyFiresBulletsLethal, EnemyFiresBulletsNonLethal, RangeUp, RangeDown, SlowEnemy, SlowAll, NegativeColor, BulletSizeDown, BulletSizeUp,EnemySizeUp,EnemySizeDown,PlayerSizeUp,PlayerSizeDown, EveryoneSizeUp, EveryoneSizeDown];

