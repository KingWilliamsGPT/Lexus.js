"using strict";
/*
	lexus is a game engine. Inspired by God.
    Every object is a GameElement.
    
    NEED TO 
        Standardize events (like declare multiple events with a more specific condition)
*/


var requestAnimationFrame = window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame;



// rotation
const TOP = 1,
    BOTTOM = 0,
    MIDDLE = .5;

// click events
const SPACE = 'Space',
    ENTER = 'Enter';


// helper functions

function _check_in(item, items){
    // returns true if i is in items
    for(var i=0; i<items.length; i++){
        if (item===items[i]) return true;
    }
    return false;
}

// random

function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// helper functions: maths 

function sqr(x) {
    return Math.pow(x, 2);
}

function radians(angle) {
    return angle * Math.PI / 180;
}

function degrees(angle) {
    return angle * 180 / Math.PI;
}

var isNeg = (n) => n < 0;

var isPos = (n) => n > 0;


function isEven(n) {
    return n % 2 === 0;
}

function isOdd(n) {
    return !isEven(n);
}

function sin(degrees) {
    return Math.sin(radians(degrees));
}

function cos(degrees) {
    return Math.cos(radians(degrees));
}

function atan(radians) {
    return degrees(Math.atan(radians));
}


/**
 *  @@@ Collusion detection
 */

const detectCollusion = {
    // collusion detection between game elements
    RectToRect: function(a, b) {
        return !(
            (a.x > b.x + b.width) ||
            (a.x + a.width < b.x) ||
            (a.y > b.y + b.height) ||
            (a.y + a.height < b.y)
        );
    },
    CircleToRect: function(circle, rect) {
        return !(
            // circle is out of the box
               (circle.y - circle.radius) < rect.y
            || (circle.y + circle.radius) > rect.y + rect.height
            || (circle.x + circle.radius) < rect.x
            || (circle.x - circle.radius) > rect.x + rect.width
        );
    }
}

/**
 *  @@@ Colors
 */
const COLORS = {
    hsl: function(hue, sat, light){
        return `hsl(${hue}, ${sat}%, ${light}%)`;
    },
    rgb: function(red, green, blue){
        return `rgb(${red}%, ${green}%, ${blue}%)`;
    },
    rgba: function(red, green, blue, alpha){
        return `rgb(${red}%, ${green}%, ${blue}%, ${alpha}%)`;
    },
}

/* mandatory initialization */
class GameState {
    constructor(selector, cWIDTH, cHEIGHT) {
        var canvas;
        if (typeof selector === 'string') {
            canvas = document.querySelector(selector);
        } else if (selector instanceof HTMLCanvasElement) {
            canvas = selector;
        } else {
            if (!canvas)
                throw TypeError(`The selector ${selector} supplied was not valid`);
        }
        this.canvas = canvas; // set canvase width an height
        this.C_WIDTH = canvas.width = cWIDTH;
        this.C_HEIGHT = canvas.height = cHEIGHT;
        this.ctx = canvas.getContext('2d');
    }

    // setGeom(w, h);
}

// transformations 

function createImg(src) {
    var img = new Image();
    img.src = src;
    return img;
}

function makeCoords(x, y) {
    return {
        x: x,
        y: y
    };
}

function rotate(object, angle, rotateFrom, draw) {
    var ctx = object.ctx,
        w = object.width,
        h = object.height;
    object.ctx.save();
    object.ctx.translate(object.x, object.y);
    object.ctx.rotate(radians(-(angle - 90)));

    // ctx.draw((w/-2, -w * (1-rotateFrom), w, h));
    // console.log(w, h, object.x, object.y)
    draw(w / -2, -h * (rotateFrom), w, h);

    object.ctx.restore();
}

function* imgCycle(range, img, start) {
    // var img = [];
    start = start == undefined ? 0 : start;
    for (let i = start; i < range; i++) {
        if (i <= 9) { i = '0' + i; }
        yield img.replace(/\${}/, i + '');
    }
}

class ImageCycle {
    /**Cycles through canvas images */
    constructor(src_format, start, range) {
        this._src_format = src_format;
        this.range = range;
        this.start = start;
        this.images = this.getImages();
        this._c = 0;
    }

    getImages() {
        let images = [];
        for (let src of imgCycle(this.range, this._src_format, this.start)) {
            let img = new Image();
            img.src = src;
            images.push(img);
        }
        return images;
    }

    next() {
        this._c += .5;
        if (this._c > this.images.length - 1) this._c = 0;
        return this.images[Math.floor(this._c)]
    }
}

// Time Related

function now() {
    return (new Date()).getTime();
}

class Timer {
    /** Keeps time related data */
    constructor() {
        this.startTime = now();
    }

    elapsedTime() {
        return now() - this.startTime;
    }
}


function Vector(a, b) {
    // performs various algorithm operations on two points
    this.a = a;
    this.b = b;

    this.dy = function() {
        // vertical distance
        return this.a.y - this.b.y;
    }

    this.dx = function() {
        // horizontal distance
        return this.a.x - this.b.x;
    }

    this.distance = function() {
        return Math.sqrt(sqr(this.dy()) + sqr(this.dx()));
    }

    this.gradient = function() {
        // calculate the slope of line
        return this.dy() / this.dx();
    }


    // direction	
    this.isright = function() {
        // is b on the right of a
        return isNeg(this.dx());
    }
    this.isleft = function() {
            // is b on the left of a
            return isPos(this.dx());
        }
        // note that the screen increases y on from top to bottom
    this.istop = function() {
        // is b above a
        return isPos(this.dy());
    }
    this.isbottom = function() {
            // is b below of a
            return isNeg(this.dy());
        }
        // quadrant specific
    this.istopright = function() {
        return this.istop() && this.isright();
    }
    this.istopleft = function() {
        return this.istop() && this.isleft();
    }
    this.isbottomright = function() {
        return this.isbottom() && this.isright();
    }
    this.isbottomleft = function() {
        return this.isbottom() && this.isleft();
    }

    this.quadrant = function() {
        // returns what quadrant is b from a
        var quadrant = [
            [1, this.istopright()],
            [2, this.istopleft()],
            [3, this.isbottomleft()],
            [4, this.isbottomright()]
        ]
        for (var i = 0; i < quadrant.length; i++) {
            if (quadrant[i][1] === true) return quadrant[i][0];
        }

        // this could mean they are on the same axis x or y or both
        return 0;
    }

    this.quadrantAngle = function() {
        // this is the angle in degrees a and b make on an imaginary right angle triangle
        var ret = degrees(Math.atan(this.gradient()));
        if (isNaN(ret)) return 0;
        return ret;
    }

    this.sameX = function() {
        return a.x === b.x;
    }

    this.angle = function() {
        // angle between two points
        var ret = this.baseAngle();
        // console.log(ret);
        return ret;
    }

    this.vertex = function() {
        // returns which side imagine two perpendicular lines crossed on the middle
        if (this.istop()) {
            console.log('side is', 'top')
            return 1;
        }
        if (this.isbottom()) {
            console.log('side is', 'bottom')
            return 3;
        }
        if (this.isright()) {
            console.log('side is', 'right')
            return 0;
        }
        if (this.isleft()) {
            console.log('side is', 'left')
            return 2;
        }
    }

    this.baseAngle = function() {
        // returns an angle in degrees of b from 0
        var theta = Math.abs(this.quadrantAngle());
        // console.log(theta);
        if (theta === 0 || theta === 90) {
            console.log('vertex', this.vertex() * 90)
            return this.vertex() * 90;
        }
        var alpha = 90 - theta;
        var quadrant = this.quadrant();

        switch (quadrant) {
            case (1):
                return theta;
            case (2):
                return 180 - theta;
            case (3):
                return 180 + theta;
            case (4):
                return 360 - theta;
        }
        return 0; // angle must be zero then
    }
}


// Base class for all game elements including MainGame
class GameElement {
    constructor() {
        this._isinit = false;
        this._events = [];
    }
    draw() {
        // initialize loop variables
        if (this._isinit === false) {
            this.init();
            this._isinit = true;
        }
        // reset and redraw
        this.reset();
        this.ondraw();
        this.update();
    }
    init() {
        // like the constructor but make it possible
        // to add widget sprite immediately after constructing the object
        // using this.game.addSprite
    }
    reset() {
        // undo unecessary updates
        // like when you would like to count down to 0
        // you could use reset to reset the counter to 0
        // when counter < 0
    }
    ondraw() {
        // re draws this element
    }
    update() {
        // update this element
        // this specifies path update variables that make sprite animated
    }

    // pre and post draw
    preDraw(){
        this.ctx.save();
    }
    postDraw(){
        this.ctx.restore();
    }
}

// Game constructor
class MainGame extends GameElement {

    constructor(selector, width, height) {
        super();
        this.x = this.y = 0; // for detecting collusion with the screen
        this.width = width;
        this.height = height;
        this.querySeletor = selector;

        this.gameState = new GameState(selector, width, height);
        this.ctx = this.gameState.ctx;
        this.canvas = this.gameState.canvas;

        // set elements

        this.sprites = [];

        this._isRunning = true;
        // this._last_sprite = 0; //id
        this.timer = new Timer();
        this.timeStamp = 0
        this.frames = 0; // frames that where run
        this.fps = 0;

        // leave trails by drawing semi transparent box on canvas
        this.leaveTrails = false;
    }

    // callbacks
    reset() {
        if(!this.leaveTrails){
            this.ctx.clearRect(0, 0, this.width, this.height);
            return;
        }

        // leave trails
        this.ctx.fillStyle = COLORS.rgba(0, 0, 0, .92);
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
        // this.ctx.clearRect(0, 0, this.width, this.height);

    }

    ondraw() {
        // draws all elements in this game skipping those marked for delete (undefined)
        for (let i = 0; i < this.sprites.length; i++) {
            let sprite = this.sprites[i];
            if (!(sprite === void(0))) {
                sprite.id = i;
                sprite.draw();
            } else {
                this.sprites.splice(i, 1);
                // the next item will take this index repeat it
                i--;
            }
        }
    }

    update() {
        this._updateTimeStates();
    }


    _updateTimeStates() {
        this.frames++;
        this.timeStamp = this.timer.elapsedTime();
        this.fps = this.frames / (this.timeStamp / 1000);
        if (isNaN(this.fps)) this.fps = 0;
    }

    // game states
    stop() {
        this._isRunning = false;
    }
    start() {
        this._isRunning = true;
        // console.log('start')
    }

    // Manage nodes
    addSprite(sprite) {
        this._last_sprite++;
        sprite.useGame(this);
        sprite.id = this._last_sprite;
        this.sprites.push(sprite);
        return sprite;
    }
    removeSprite(sprite_or_id) {
        if (typeof sprite_or_id === 'number') {
            var id = sprite_or_id;
        } else if ('id' in sprite_or_id) {
            var id = sprite_or_id.id;
        } else { throw Error('TypeError: Required integer or Sprite object'); }
        // assume id is integer
        for (var i = 0; i < this.sprites.length; i++) {
            let sprite = this.sprites[i];
            if (sprite == void(0)) continue; // avoid sprites marked for delete in main loop
            if (sprite.id === id) {
                this._deleteSprite(sprite, i);
                break;
            }
        }
    }
    _deleteSprite(sprite, index) {
        // all logic for deleting a single sprite
        this.sprites.splice(index, 1, void(0));
    }

}

// sprites
// sprites should have properties for styling

function drawCircle(ctx, r, x, y) {
    var fill = 'stroke';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, radians(360));
    ctx.closePath();
    ctx.fill();
}

class Sprite extends GameElement {
    constructor(x, y, width, height) {
        super();
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    useGame(game) {
        this.game = game;
        this.ctx = game.ctx;
    }
    die() {
        // called by other game sprites to kill this one
    }
    coords() {
        return [this.x, this.y, this.width, this.height];
    }
    setCoord(x, y, width, height) {
        this.x = x;
        this.y = y;
        if (!!height) this.height = height;
        if (!!width) this.width = width;
    }
    coordCenter() {
        return [(this.x + this.width / 2),
            (this.y + this.height / 2), this.width, this.height
        ];
    }
    getBounds(origin){
        // if((typeof origin) === 'number') throw TypeError("origin must be a float");
        var geom = {
            x: this.x * origin,
            y: this.y * origin,
            width: this.width,
            height: this.height
        }
        var coords = this.coords();
        for(var i in geom){
            coords[i] = geom[i];
        }
        return coords; // coords with parameters
    }
}

class Box extends Sprite {
    constructor(...a) {
        super(...a);
        this.color = 'black';
    }
    ondraw() {
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    setColor(color) {
        this.color = color;
        return this;
    }
}


// class Arc extends Sprite {}

class Circle extends Sprite {
    constructor(radius, endAngle, ...a) {
        super(...a);
        this.radius = radius;
        this.startAngle = 0;
        this.endAngle = radians(endAngle);
        this.stroke = false;
        this.color = 'white';
    }
    ondraw() {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(this.x, this.y, this.radius, this.startAngle, this.endAngle);
        this.ctx.strokeStyle = this.ctx.fillStyle = this.color;
        if (this.stroke) { this.ctx.stroke() } else { this.ctx.fill(); }
        this.ctx.closePath();
        this.ctx.restore();
    }
}

class LifeBar extends Sprite {
    // use to show the amount of life the sprite has
    constructor(max, ...a) {
        super(...a);
        this.max = max;
        this.value = 0;
        this.label = '';
    }
    ondraw() {
        this.drawOutline();
        this.drawInnerBar();
        if (!!this.label) {
            this.drawLabel();
        }
    }
    setPoint(n) {
        this.value = n;
    }
    drawOutline() {
        // this.ctx.lineWidth = 5;
        this.ctx.strokeStyle = 'rgba(0,0,0,.5)'; //'#555';
        this.ctx.strokeRect(...this.coord());
    }
    drawInnerBar() {
        this.ctx.fillStyle = 'red';
        let pad = 2;
        var fullWidth = this.width - pad * 2,
            fullHeight = this.height - pad * 2,
            ratio = this.value / this.max,
            percentage = ratio * 100;
        if (percentage > 50) {
            this.ctx.fillStyle = 'teal';
        }
        this.ctx.fillRect(this.x + pad, this.y + pad, fullWidth * ratio, fullHeight);
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