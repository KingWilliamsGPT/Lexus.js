// constants
const SPACEBAR = ' ';
const ENTER = 'Enter';


function contains(item, ...items){
	// check if item is in items
	return items.indexOf(item) !== -1
}

//functions
function randint(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}


class Bar extends Sprite{
	init(){
		this.x = C_WIDTH - 20;
		this.width = 30;
		this.height = randint(100, C_HEIGHT - 400);
		this.y = randint(0, C_HEIGHT - this.height);
		this.speed = 5;
		this.getImage = createImg('./enemies/danger.png');
	}

	ondraw(){
		// this.ctx.fillRect(this.x, this.y, this.width, this.height);
		this.ctx.drawImage(this.getImage, this.x, this.y, this.width, this.height);
	}

	update(){
		this.x -= this.speed;
		if(this.collidingWith(Bird)){
			this.onhittingbird(this._targetSprite);
		}
		this._reset();
	}

	onhittingbird(bird){
		this.game.removeSprite(this.id);
		bird.onhit(this);
	}

	_reset(){
		// a stupid glitch occurs here, where the element before this on just glitches
		// maybe it's beign redrawn or something
		if(this.x + this.width <= 0) this.game.removeSprite(this.id);
	}

	collidingWith(SpriteClass){
		var sprites = this.game.sprites;

		for(let i=0; i<sprites.length; i++){
			let sprite = sprites[i];
			if(sprite instanceof SpriteClass){ // collusion with this type
				if (detectCollusion(this, sprite) === true){
					this._targetSprite = sprite;
					return true;
				}
			}
		}
		return false;
	}
}

class Coin extends Bar{
	init(){
		super.init();
		this.height = 40;
		this.width = this.height;
		this.coin = this.getImage = createImg('./promote/gold_coin.png');
		this.coinSplash = createImg('./promote/gold_coin_splash.png');
		this.coinCollected = false;
		this.detectCollusion = true;
	}
	collidingWith(s){
		 // detect collusion once
		var collusion = super.collidingWith(s);
		if(collusion && this.detectCollusion){
			this.detectCollusion = false;
			return collusion;
		}else{
			return false;
		}
	}
	onhittingbird(bird){
		this.coinCollected = true;
		this.getImage = this.coinSplash;
		this.fr_wait = 3;
		bird.onhit(this);
	}
	update(){
		super.update();
		if (this.coinCollected ===  true){
			this.fr_wait -= 1;
			if(this.fr_wait <= 0){
				this.game.removeSprite(this);
			}
		}
	}
}

class Enemy extends Sprite{
	init(){
		this.t = 0;
	}
	ondraw (){
		if(Math.floor(this.t) % 40 === 0 && randint(0, 2)){
			if(randint(0,2)){
				this.game.addSprite(new Bar());
			}else{
				this.game.addSprite(new Coin());
			}
		}
	}
	update(){
		this.t++;
	}
}

class Bird extends Sprite{
	constructor(){
		super(...arguments);
		this.mass = randint(1, 10);
		this._flap = {
			height: 60,
			a_grav: -8.088,//-8.8, // acceleration due to grav
			duration: 3,
			get_initial_speed: function(){
				return 30//(this.height - .5 * this.a_grav * this.duration**2) / this.duration;
			},
			isflapping: false
		}
		this.coinCount = 0;
		this.life = 5;

	}
	init(){
		this.x = (200 - 40);
		this.y = C_HEIGHT / 2;
		this.falling_speed = 12;
		this.speed = 0.2;
		this.accel = .088;

		this.lifeBar = new LifeBar(this.life, this.game.WIDTH - 15 * 2, 15, 15, 10);
		this.lifeBar.setPoint(this.life);
		this.game.addSprite(this.lifeBar);

		document.addEventListener('keypress', e=>{
			if(contains(e.key, SPACEBAR, ENTER)) this.flap();
		});
		this.flyImages = new ImageCycle("./bluebat/skeleton-animation_${}.png", 0, 11);
	}
	ondraw(){
		this.img = this.flyImages.next() // this.mode.next mode.runAssets
		this.ctx.drawImage(this.img, this.x, this.y, this.width, this.height);
		// this.ctx.strokeRect(this.x, this.y, this.width, this.height)
	}
	reset(){
		if(this.touchingRoof()){
			this.y = 0;
		}
		if (this.outOfScreen()){
			this.y = C_HEIGHT - this.height;
		}
		// this.lifeBar.x = this.x + this.width - 30;
		// this.lifeBar.y = this.y - 5;
	}
	update(){
		if (this._flap.isflapping){
			this.y -= this.speed;
			this.speed += this._flap.a_grav; // decelerate
			if (this.speed <= 0) {
				this._flap.isflapping = false;
				// this.speed = this.falling_speed;
				this.speed = 0;
			}
		}
		else{
			this.y += this.speed;
			this.speed += this.accel;
		}
	}
	onhit(sprite){
		if(sprite instanceof Coin){
			this.increaseCoinCount;
			this.coinCount++;
			new Audio('./audio/point.ogg').play();
			// console.log('hit by coin');
			document.getElementById('life').innerHTML = this.coinCount;
		}else if(sprite instanceof Bar){
			this.life--;
			this.lifeBar.setPoint(this.life);
			this.blink();
			new Audio('./audio/hit.ogg').play();

			if(this.life <= 0){
				this.game.stop(); 
				alert('End Game');
			}
		}
	}
	blink(){
		// this.ctx.fillStyle = 'red';
		// this.ctx.fillRect(this.x, this.y, this.width, this.height);
	}
	flap(){
		this._flap.isflapping = true;
		this.speed = this._flap.get_initial_speed();
		new Audio('./audio/wing.ogg').play();
	}
	touchingRoof(){
		return this.y <= 0;
	}
	outOfScreen(){
		return this.y >= C_HEIGHT - this.height;
	}
}

class Game extends MainGame{
	init(){
		var sku = new Audio('./audio/action.mp3');
		sku.loop = true;
		sku.play();
	}
}

function main(){
	// game begins
	const $canvas = "cnv";
	const C_WIDTH = 800;
	const C_HEIGHT = 560;

	mainGame = new Game($canvas, C_WIDTH, C_HEIGHT);

	bird = new Bird(0, 0, 100, 56.497);
	obstacle = new Bar();
	
	mainGame.addSprite(bird);
	mainGame.addSprite(new Coin(0,0,20,20))
	mainGame.addSprite(new Enemy());

	// main
	function animate(timestamp){
		//calculate difference since last repaint
		var drawStart = (timestamp || Date.now()),
		diff = drawStart - startTime;

		//use diff to determine correct next step
		mainGame.timeStamp = timestamp;
		mainGame.timedifference = diff;

		//reset startTime to this repaint
		startTime = drawStart;
		//draw again
		if(mainGame.isRunning){
			mainGame.draw();
		}
		
		requestAnimationFrame(animate);
	}
	startTime = window.mozAnimationStartTime || Date.now();
	requestAnimationFrame(animate);
}

gameStarted = false;
BUBBLE_PHASE = false;
CLICK_EVENT = 'click';

document.addEventListener('DOMContentLoaded', ()=>{
	function replaceEventWith(newCallback, formerCallback, ev){
		ev.target.removeEventListener(ev.type, formerCallback, BUBBLE_PHASE);
		ev.target.addEventListener(ev.type, newCallback, BUBBLE_PHASE);
		// console.log('replacing', functionName, '\n\n WITH \n\n', formerCallbackFunction);
	}
	function unPauseGame(ev){
		mainGame.isRunning = true;
		this.innerHTML = 'Pause';
		replaceEventWith(pauseGame, arguments.callee, ev);
	}

	function pauseGame(ev){
		mainGame.isRunning = false;
		this.innerHTML = 'Continue';
		replaceEventWith(unPauseGame, arguments.callee, ev);
	}

	function startGame(ev){
		// if(!gameStarted){
			main();
			gameStarted = true;
			this.innerHTML = 'Pause';
			replaceEventWith(pauseGame, arguments.callee, ev);
		// }
	}
	btn = document.getElementById('startGame');
	btn.addEventListener('click', startGame, BUBBLE_PHASE);
});