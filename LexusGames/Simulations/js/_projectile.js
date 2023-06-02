const _window = {
	setWindowSize: function(){
		var _w = $(window);
		_w.bind('resize', ()=>{
			this.reset();
			this.callback(this.width, this.height);
		});
		return this;
	},
	reset: function(){
		var _w = $(window);
		this.width = _w.width();
		this.height = _w.height();
	},
	onWindowResize: function(callback){
		this.callback = callback;
	},
	dispatch: function(callback){
		this.onWindowResize(callback);
		this.setWindowSize();
	}
}

_window.setWindowSize().reset();

const mouse = {
	x: null,
	y: null
}

$(window).bind('mousemove', e=>{
	mouse.x = e.offsetX; // e.clientX
	mouse.y = e.offsetY; // e.clientY
	// console.log('bind', e)
	// reset canon angle
});


var initCanvas = (function(){
	const canvas = $('#canvas')[0];
	canvas.width = _window.width;
	canvas.height = _window.height / 2;
	_window.onWindowResize(function(width, height){
		canvas.width = width;
		canvas.height = height / 2;
	});

	var context = canvas.getContext('2d');

	return {
		canvas: canvas,
		ctx: context,
		selector: '#canvas'
	};
}());
