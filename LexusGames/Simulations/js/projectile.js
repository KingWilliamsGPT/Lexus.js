
function setAttr(value, name, obj){

}

function quadrantAngle(a, b){
	// angle of elevation or depression based on quadrant angle
	var quad = getQuadrant(a, b);
	var vec_angle = new Vector(a, b).angle();
	if(quad===1) return angle;
	if(quad===2) return 180 - angle;
	if(quad===3) return 270 - angle;
	if(quad===4) return 360 - angle;
}

// Game

class BackgroundLayer extends Box{
	constructor(bg_src, ...a){
		super(...a);
		this.backgroundLayer = new Image();
		this.backgroundLayer.src = bg_src;
	}
	init(){
		var c = this.game;
		const h = 40;
		this.plane = new Box(0, c.height - h, c.width, h);
		this.game.addSprite(this.plane);
	}
	ondraw(){
		// this.ctx.drawImage(this.backgroundLayer, 0, 0, this.game.width, this.game.height);
	}
}

class Canon extends Circle{
	ondraw(){
		super.ondraw();
		this.drawCanonGun();
	}
	drawCanonGun(){
		// this.x = 500, this.y =100;
		var w = this.gun.width;
		var h = this.gun.height;
		// this.ctx.save();
		// this.ctx.translate(this.x, this.y);
		// this.ctx.rotate(radians(this.angle));
		// this.ctx.fillRect(w/-2,0,w,h);
		// this.ctx.restore();
		rotate(this.gun, this.angle, (-h - this.radius)/-h, (x,y,w,h)=>{
			this.ctx.fillRect(x,y,w,h);
			// console.log('new twisted coordinates', x, y);
		});
	}
	update(){
		this.gun.x = this.x;
		this.gun.y = this.y;
		this.x-=.2;
	}
	init(){
		super.init();
		this.bulletSpeed = 8;
		this.angle = new Vector(this, this.game.target).angle();
		this.stroke = false;
		this.gun = new Box(this.x, this.y, 10, 40);
		this.game.addSprite(this.gun);
		this.quadrantAngle = quadrantAngle(this, this.gun);
		this.shootOnClick();
		this.followMouse();
	}
	setAngle(angle){
		// angle in degrees
		this.angle = angle //- 90
	}
	followMouse(){
		$(window).bind('mousemove', e=>{
			window.vec = new Vector(this, mouse);
			this.angle = vec.angle();
			// console.log(vec.quadrant());
		});
	}
	shoot(){
		this.bullet = new CanonBullet(this, 5, 360, ...this.coords());
		this.game.addSprite(this.bullet);
	}
	shootOnClick(){
		window.onclick = ()=>{
			this.shoot();
		}
		window.onkeypress = (e)=>{
			if(e.code == SPACE || e.code == ENTER){
				this.shoot();
			}
		}
	}
}




class CanonBullet extends Circle{
	constructor(canon, ...circle){
		super(...circle);
		this.canon = canon;
		this.x = canon.x;
		this.y = canon.y;
		this.stroke = false;
	}

	init(){
		this.mass = 20;
		this.speed = this.canon.bulletSpeed;
		this.angle = 180 - 32;

		// from physics get vx and vy from speed
		this.vx = this.speed * Math.cos(radians(this.canon.angle));
		this.vy = this.speed * -Math.sin(radians(this.canon.angle));
		this.gravity = .05;

		this.OutOfGunNuzzle();
	}

	update(){
		this.x += this.vx;
		this.y += this.vy;
		if(this.y >= this.canon.y){
			// this.color = 'orange';
			this.stop();
		}
		if(this.OutOfGunNuzzle()){
			this.applyGravity();
		}
	}

	applyGravity(){
		this.vy += this.gravity;
		this.color = 'red';
	}

	stop(){
		this.vx = 0;
		this.vy = 0;
		this.gravity = 0;
	}

	OutOfGunNuzzle(){
		var sl = this.canon.radius + this.canon.gun.height; //slant height
		// // dy dx of center of this.canon from tip of gun
		var dx = sl * Math.cos(radians(180 - this.canon.angle));
		var dy = sl * Math.sin(radians(180 - this.canon.angle));
		// this.game.addSprite(new Box(this.canon.x - dx, this.canon.y - dy, 10, 10).setColor('orange')); // indicate point
		return this.x <= this.canon.x - dx || this.y <= this.canon.y - dy;
	}

	setStartGravity(){

	}
	// debug(){// return real range
	// 	window.phxRange = (sqr(this.u) * Math.sin(2 * radians(180 - this.angle))) / this.gravity;
	// 	window.vec = new Vector(this.canon, this);
	// 	window.realRange = vec.dx();
	// 	console.log('real range', realRange, '------------- physics range', phxRange, '--------------- angle', 180-this.angle);
	// 	console.log('range difference', Math.floor(realRange - phxRange))
	// }
}

class Bullet extends Box{
	init(){
		this.speed = 25;
		// this.shootAngle = 360-10;
		this.width=10;
		this.height=9;
		this.vx = this.speed * Math.cos(radians(this.shootAngle));
		this.vy = this.speed * -Math.sin(radians(this.shootAngle));
	}
	update(){
		this.x+=this.vx;
		this.y+=this.vy;
	}
}

class MachineGun extends Box{
	init(){
		this.x = target.x + target.width/2-15;
		this.y = target.y - 40;
		this.width = 15;
		this.height = 40;
		this.color = 'orange';
		this.machineGun = new Box(this.x+5, this.y+3, 10, 40);
		this.machineGun.color = 'red';
		this.machineGun.ctx = this.ctx;
		this.angle = 30;
		
		$(window).bind('mousemove', e=>{
			window.vec = new Vector(this, mouse);
			this.angle = vec.angle();
			// console.log(vec.quadrant());
		});

		$(window).bind('click', ()=>{
			this.shoot();
		});
	}

	ondraw(){
		super.ondraw();
		var h = this.machineGun.height;
		rotate(this.machineGun, this.angle, (-h + 12)/-h, (x,y,w,h)=>{
			this.ctx.fillRect(x,y,w,h);
		});
		// this.machineGun.draw();
	}

	shoot(){
		this.bullet = new Bullet(...this.coords());
		this.bullet.shootAngle=this.angle;
		this.game.addSprite(this.bullet);
	}

	update(){
		// this.angle++;
	}
}


var game = function (){
	var _ = initCanvas;
	const c = _.canvas;
	mainGame = new MainGame(_.selector, c.width, c.height);
	mainGame.canvas = c;
	(function setSprites(){
		var layerHeight = (function setGroundLayer(){
			const h = 40;
			var layer = new BackgroundLayer("./img/sky1.PNG", 0, c.height - h, c.width, h);
			mainGame.addSprite(layer);
			mainGame.layer = layer;
			return h;
		})();

		target = new Box(20, c.height - layerHeight - 90, 400, 90);
		mainGame.addSprite(target); mainGame.target = target;
		
		canon = new Canon(50, 360, c.width - 50 - 120, c.height - layerHeight);
		mainGame.addSprite(canon);
		
		mg = new MachineGun();
		mainGame.addSprite(mg);
	}());

	// $(window).bind('resize', ()=>{mainGame.sprites=[]; mainGame.reset(); setSprites();});
	$('#angle').bind('change', e=>{
		var n = Number(e.target.value);
		if(!isNaN(n)){
			canon.setAngle(180 - n);
		}
	});

	$('#speed').bind('change', e=>{
		var n = Number(e.target.value);
		if(!isNaN(n))
			canon.bulletSpeed = n;
	});


	(function animate(){
		if(mainGame.isRunning)
			mainGame.draw();
		requestAnimationFrame(animate);
	})();
}

game();