"using strict";
/*
	lexus is a game engine. Inspired by God.

	Every object is a GameElement.
*/


var requestAnimationFrame = window.requestAnimationFrame ||
							window.mozRequestAnimationFrame ||
							window.webkitRequestAnimationFrame ||
							window.msRequestAnimationFrame;

const C_WIDTH = 800;
const C_HEIGHT = 560;
const C_H_MID = C_WIDTH / 2;
const C_V_MID = C_HEIGHT / 2;
const C_CENTER = [C_H_MID, C_V_MID];


/* mandatory initialization */
function getGameState(selector, cWIDTH, cHEIGHT){
	const gameState = {};
	const canvas = document.getElementById(selector);
	gameState.canvas = canvas; // set canvase width an height
	gameState.C_WIDTH = canvas.width = cWIDTH;
	gameState.C_HEIGHT = canvas.height = cHEIGHT;
	gameState.ctx = canvas.getContext('2d');
	return gameState;
}


function detectCollusion(a, b){
	// detects collusion between game elements
	return !(
		(a.x > b.x + b.width) ||
		(a.x + a.width < b.x) ||
		(a.y > b.y + b.height) ||
		(a.y + a.height < b.y)
	);
}

function createImg(src){
	var img = new Image();
	img.src = src;
	return img;
}


function * imgCycle(range, img, start){
	// var img = [];
	start = start == undefined ? 0: start;
	for(let i=start; i<range; i++){
		if (i <= 9) {i = '0'+i;}
		yield img.replace(/\${}/, i+'');
	}
}


class ImageCycle{
	constructor(src_format, start, range){
		this._src_format = src_format;
		this.range = range;
		this.start = start;
		this.images = this.getImages();
		this._c = 0;
	}

	getImages(){
		let images = [];
		for(let src of imgCycle(this.range, this._src_format, this.start)){
			let img = new Image();
			img.src = src;
			images.push(img);
		}
		return images;
	}

	next(){
		this._c += .5;
		if(this._c > this.images.length - 1) this._c = 0;
		return this.images[Math.floor(this._c)]
	}
}

// assets
// class AudioAsset{
// 	// audio asset runs once
// 	constructor(src){
// 		this.audio = new Audio(src);
// 		this.n = 0; // number of plays
// 	}

// 	play(){
// 		try{
// 			this.audio.play();
// 			this.n++;
// 		}catch(e){
// 			console.log('Error f')
// 		}
// 	}

// }

// class Mode{
// 	// current mode describes assets to use
// 	constructor(name){
// 		this.name = name;
// 		this.assets = {} // asset cound be a slide or audio
// 	}
// 	addAssets(){

// 	}
// 	runAssets(){
// 		// run assets
// 	}
// }

// Base class for all game elements
class GameElement{
	constructor(){
		this._isinit = false;
		this._events = [];
	}
	draw(){
		// initialize loop variables
		if(this._isinit === false){
			this.init();
			this._isinit = true;
		}
		// reset and redraw
		this.reset();
		this.ondraw();
		this.update();
	}
	init(){
		// like the constructor but make it possible
		// to add widget sprite immediately after constructing the object
		// using this.game.addSprite
	}
	reset(){
		// undo unecessary updates
		// like when you would like to count down to 0
		// you could use reset to reset the counter to 0
		// when counter < 0
	}
	ondraw(){
		// re draws this element
	}
	update(){
		// update this element
		// this specifies path update variables that make sprite animated
	}
}

// main game constructor
// call MainGame.mainloop();
class MainGame extends GameElement{
	
	constructor(selector, width, height){
		super();
		this.WIDTH = width;
		this.HEIGHT = height;
		this.querySeletor = selector;
		this.gameState = getGameState(selector, width, height);
		this.ctx = this.gameState.ctx;
		this.canvas = this.gameState.canvas;
		
		// set elements
		this.isRunning = true;
		this.sprites = [];
		this._last_sprite = 0; //id
		this._timeStamp = 0
		this.frames = 0; // frames that where run
	}
	stop(){
		this.isRunning = false;
	}
	start(){
		this.isRunning = true;
		console.log('start')
	}
	addSprite(sprite){
		this._last_sprite++;
		sprite.useGame(this);
		sprite.id = this._last_sprite;
		this.sprites.push(sprite);
	}
	removeSprite(sprite_or_id){
		if(typeof sprite_or_id === 'number'){
			var id = sprite_or_id;
		}
		else if ('id' in sprite_or_id){
			var id = sprite_or_id.id;
		}
		else{throw Error('TypeError: Required integer or Sprite object');}
		// assume id is integer
		for(var i=0; i<this.sprites.length; i++){
			let sprite = this.sprites[i];
			if(sprite == void(0)) continue;
			if(sprite.id === id){
				this.deleteSprite(sprite, i);
				break;
			}
		}
	}
	deleteSprite(sprite, index){
		// all logic for deleting a single sprite
		this.sprites.splice(index, 1, void(0));
	}
	// callbacks
	reset(){
		this.ctx.clearRect(0,0,this.WIDTH,this.HEIGHT);
	}

	ondraw(){
		// draws all elements in this game
		for(let i=0; i<this.sprites.length; i++){
			let sprite = this.sprites[i];
			if(!(sprite === void(0))){
				sprite.draw();
			}
			else{
				this.sprites.splice(i, 1);
				i--;
			}
		}
	}

	update(){
		this.frames++;
	}
}


class Sprite extends GameElement{
	constructor(x, y, width, height){
		super();
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}
	useGame(game){
		this.game = game;
		this.ctx = game.ctx;
	}
	die(){
		// called by other game sprites to kill this one
	}
	coord(){
		return [this.x, this.y, this.width, this.height];
	}
}


class LifeBar extends Sprite{
	// use to show the amount of life the sprite has
	constructor(max, ...a){
		super(...a);
		this.max = max;
		this.value = 0;
		this.label = '';
	}
	ondraw(){
		this.drawOutline();
		this.drawInnerBar();
		if(!!this.label){
			this.drawLabel();
		}
	}
	setPoint(n){
		this.value = n;
	}
	drawOutline(){
		// this.ctx.lineWidth = 5;
		this.ctx.strokeStyle = 'rgba(0,0,0,.5)';//'#555';
		this.ctx.strokeRect(...this.coord());
	}
	drawInnerBar(){
		this.ctx.fillStyle = 'red';
		let pad = 2;
		var fullWidth = this.width - pad * 2,
			fullHeight = this.height - pad * 2,
			ratio = this.value/this.max,
			percentage = ratio * 100;
		if(percentage > 50){
			this.ctx.fillStyle = 'teal';
		}
		this.ctx.fillRect(this.x + pad, this.y + pad, fullWidth * ratio, fullHeight);
	}
}