var clamp = function(value, min, max) {
	if(value < min){
			value = min;
	}
	if(value > max)	{
		value = max;
	}
	return value;
}

var Point = new Class({
	initialize: function(x, y) {
		this.x = x;
		this.y = y;
	}
});

var distance = function(a, b) {
	var dx = a.x - b.x;
	var dy = a.y - b.y;
	return ~~(Math.sqrt((dx*dx) + (dy*dy)));
}

var Vector = new Class({
	initialize: function(dx, dy, origin) {
		this.dx = dx;
		this.dy = dy;
		this.origin = origin;
	}
});

var Timer = new Class({
	Implements: [Events, Options],
	tick : function() {
		this.fireEvent('tick');
		this.tick.delay(this.interval, this);
	},
	initialize: function(interval, options) {
		this.interval = interval;		
		this.setOptions(options);
		this.tick();		
	}	
});


var Mouse = new Class({
	nowX: 0,
	nowY: 0,
	initialize: function(element) {
		this.update();
		this.currentDirection = new Vector(0, 0, this.currentPosition);
		var width = parseInt($(element).getProperty('width'));
		var height = parseInt($(element).getProperty('height'));
		$(document.body).addEvent('mousemove', function(event) {
			this.nowX = clamp(event.page.x -  $(element).getPosition().x, 0, width);
			this.nowY = clamp(event.page.y -  $(element).getPosition().y, 0, height);
		}.bind(this));
	},
	update: function() {
		var newPoint = new Point(this.nowX, this.nowY);
		if(!this.currentPosition){
			this.currentPosition = new Point(this.nowX, this.nowY);
		}else{
			this.currentDirection = new Vector(newPoint.x - this.currentPosition.x,
											   newPoint.y - this.currentPosition.y,
											   newPoint);
			this.currentPosition = newPoint;
		}
	},
	getPostitionRelativeToElement: function(){
		return new Point(this.nowX, this.nowY);
	}
});

var Particle = new Class({
	Implements: Options,
	initialize: function(canvas, location, mouse, canvasWidth, canvasHeight) {
		this.canvas = canvas;
		this.location = location;
		this.mouse = mouse;
		this.direction = new Vector(0, 0, location);
		this.canvasWidth = canvasWidth - 5;
		this.canvasHeight = canvasHeight - 5;
		this.width = 2;
		this.height = 2;
	},
	update: function() {
		var x = clamp(this.location.x + this.direction.dx, 0, this.canvasWidth);
		var y = clamp(this.location.y + this.direction.dy, 0, this.canvasHeight);		
		this.location = new Point(x, y);
		if(distance(this.location, this.mouse.getPostitionRelativeToElement()) < 50  && 
		  (this.mouse.currentDirection.dx > 0 || this.mouse.currentDirection.dy > 0)){
			this.direction = this.mouse.currentDirection;
		}else{
			this.direction = new Vector(
										clamp(this.direction.dx + ~~(Math.random()*3) - 1, -3, 3), 
										clamp(this.direction.dy + ~~(Math.random()*3)-1, -3, 3), 
										this.location);
		}
	},
	draw: function() {
		this.canvas.fillStyle = '#000';
		this.canvas.fillRect( this.location.x,
							  this.location.y,
							  this.width,
							  this.height);
	}
});


window.addEvent('domready', function(){	
	var div = document.getElementById('test_div');
	var canvas = document.getElementById('test_canvas');
	var mouse = new Mouse(canvas);	
	var ctx = canvas.getContext('2d');
	var width = parseInt($(canvas).getProperty('width'));
	var height = parseInt($(canvas).getProperty('height'));
	var particles = new Array();
	for(var i = 0; i < 2000; i++) {
		particles.push(new Particle(ctx,
									new Point(~~(Math.random()*width), ~~(Math.random()*height)),
									mouse,
									width,
									height));
	}
	var timer = new Timer(33, {
		onTick: function() {
					mouse.update();
					for(var i = 0; i < particles.length; i++)
					{
						particles[i].update();
					}
					//clear the frame
					ctx.fillStyle = '#fff';
					ctx.fillRect(0, 0, width, height);					
					for(var i = 0; i < particles.length; i++)
					{
						particles[i].draw();
					}
				}
	});
});