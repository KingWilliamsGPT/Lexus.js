document.addEventListener('DOMContentLoaded', () => {
    // Code here


    const canvas = document.getElementById('canvas');

    game = new MainGame(canvas, window.innerWidth, window.innerHeight);
    game.ctx.lineCap = 'round';
    game.init = create;
    game.mainLoop = mainLoop
    game.mainLoop();
});


function mainLoop() {
    var game = this;

    function animate() {
        requestAnimationFrame(animate);
        if(game._isRunning)
            game.draw();
    }
    animate();
}


function create() {
    var padside = this.width * 0.1;
    this.pingBall = this.addSprite(new PingBall(this.width / 2, this.height / 2));
    this.leftOponent = this.addSprite(new Player(padside, this.height / 2));
    this.rightOponent = this.addSprite(new ComputerPlayer(this.width - padside, this.height / 2));
}


function drawBox(ctx, x, y, width, height) {
    // draw a box with canvas context
    ctx.lineWidth = width;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + height);
    // ctx.lineTo(x + width, y + height);
    // ctx.lineTo(x+width, y);
    // ctx.lineTo(x, y);
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'white';
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
}

function resetInfity(n, fall) {
    if (!isFinite(n)) {
        return fall;
    }
    return n;
}

function _mockAngle(pingball, bar) {
    // bar.setCoord(...bar.coordCenter())
    vec = new Vector(pingball, bar);
    return 2 * atan(vec.dx() / vec.dy());
}


class PingBall extends Circle {
    constructor(startx, starty) {
        var radius = 30;
        super(radius, 360, startx, starty);
        this.color = '#00c0fd';
        this.speed = 300;
    }
    init() {
        this.angle = randint(0, 360); //_mockAngle(this, this.game.leftOponent); //-randint(0, 360 - 1);
        this.vy = this.speed * sin(this.angle);
        this.vx = this.speed * cos(this.angle)

    }
    update() {
        // speed per second

        // correct speed per second to per frame
        var vy = resetInfity(this.vy / this.game.fps, 0),
            vx = resetInfity(this.vx / this.game.fps, 0);
        this.x += vx;
        this.y += vy;


        if (this.x < 0 || this.x > this.game.width) {
            // setTimeout(function x() { location.reload() }, 1500)
            // alert('game over');
            this.game.stop();
        }
    }

    reset() {
        // if (!detectCollusion.CircleToRect(this, this.game)) {
        //     console.log('circle is out of game');
        // }
        if (this.y - this.radius <= this.game.y ||
            this.y + this.radius >= this.game.y + this.game.height) {
            this.vy *= -1;
        }
    }
}


class Player extends Box {
    constructor(x, y) {
        var width = 20,
            height = 150;
        super(x, y - width / 2, width, height);
        this.color = '#00c0fd';
        this.speed = 15;
    }
    update() {
        var pingBall = this.game.pingBall;
        if (detectCollusion.CircleToRect(pingBall, this)) {
            pingBall.vx = -pingBall.vx
            pingBall.vy += [1, -1][randint(0, 1)] * randint(1, 50);
        }
    }
    init() {
        window.addEventListener('keydown', e => {
            if (e.key.toLowerCase() === 'arrowup') {
                if (this.y > 0)
                    this.y -= this.speed;
            }
            if (e.key.toLowerCase() === 'arrowdown') {
                if (this.y + this.height < this.game.height)
                    this.y += this.speed;
            }
        });
    }
    
    ondraw(){
        drawBox(this.ctx, ...this.coords());
    }
}


class ComputerPlayer extends Player {
    init() {
        // this.color = `hsl(0, 93%, 50%)`;
        this._color = this.color
    }

    update() {
        super.update();
        var pingBall = this.game.pingBall;
        var newy = (pingBall.y + (this.x - pingBall.x) * pingBall.vy / pingBall.vx) - this.height / 2;
        if (newy >= 0 && newy <= this.game.height) {
            this.y = newy;
            this.color = this._color;
        } else {
            this.color = COLORS.hsl(randint(0, 360), 50, 50);
            // console.log('nope!', 'new y is', newy);
        }
    }
}