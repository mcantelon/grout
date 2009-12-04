var Map = function (params) {
	this.initialize(params);
}

Map.prototype = {

	initialize:function(params) {

		this.width  = this.merge(params.width, 10);
		this.height = this.merge(params.height, 10);

		this.pixel_width  = this.merge(params.pixel_width, 10);
		this.pixel_height = this.merge(params.pixel_height, 10);

		this.pixels = new Array;

		this.clear();
		
		this.state = {}
	},

	//
	// Pixel-wrangling
	//

	cycle_through_pixels:function(logic) {

		for (x = 0; x < this.width; x++) {
			for (y = 0; y < this.height; y++) {
				logic(this, x, y);
			}
		}
	},

	clear:function() {

		this.cycle_through_pixels(function(that, x, y) {
				
			if (that.undefined_or_null(that.pixels[x])) {
				that.pixels[x] = Array()
			}

			that.pixels[x][y] = false;
		});
	},

	draw:function() {

		//this.size_canvas();

		this.cycle_through_pixels(function(that, x, y) {

			var real_x = x * that.pixel_width;
			var real_y = y * that.pixel_width;

			if (that.pixels[x][y] == true) {

				that.parent.ctx.fillStyle = 'black';
			}
			else if (that.pixels[x][y]) {

				that.parent.ctx.fillStyle = that.pixels[x][y];
			}

			if (that.pixels[x][y]) {

				// hide canvas errors
				try {
					that.parent.ctx.fillRect(
						real_x,
						real_y,
						that.pixel_width,
						that.pixel_height
					);
				} catch(e) {}
			}
			else {

				/*
				// hide canvas errors
				try {
					that.parent.ctx.clearRect(
						real_x,
						real_y,
						that.pixel_width,
						that.pixel_height
					);
				} catch(e) {}
				*/
			}
		});
	},

	// Shorthand for setting pixels:
	// my_screen.poke(1, 4, 'red'); <- set individual pixel to red
	// my_screen.poke([[2, 5], [3, 4, 'green']]); <- set one to black, one to green
	poke:function(x, y, color) {

		// allow x to be a set of points to poke
		if (typeof x == 'object') {

			for (var i in x) {
				this.poke(x[i][0], x[i][1], x[i][2]);
			}
		}
		else {

			if (this.pixels.length >= (x + 1)
				&& this.pixels[x].length >= (y + 1)
			) {

				if (this.undefined_or_null(color)) {
					color = true;
				}

				this.pixels[x][y] = color;
			}
		}
	},

	toggle:function(x, y, color) {

		// allow x to be a set of points to poke
		if (typeof x == 'object') {

			for (var i in x) {
				this.toggle(x[i][0], x[i][1], x[i][2]);
			}
		}
		else {

			if (this.pixels.length >= (x + 1)
				&& this.pixels[x].length >= (y + 1)
			) {

				if (this.undefined_or_null(color)) {
					color = true;
				}

				this.pixels[x][y] = this.pixels[x][y] ? false : color;
			}
		}
	},

	click:function(logic) {

		// store click logic
		this.click_logic = logic;

		// activate click handler
		this.parent.canvas.addEventListener('mousedown', this.parent.click_handler, false);
	},
	
	//
	// Helpers
	//

	doc_get:function(id) {
		return document.getElementById(id);
	},

	merge:function(sent, preset) {
		return (this.undefined_or_null(sent)) ? preset : sent;
	},

	undefined_or_null:function(value) {
		return value == undefined || value == null;
	}
}

var Grout = function (params) {
	this.initialize(params);
}

Grout.prototype = {

	initialize:function(params) {

		this.initialize_canvas(params);
		
		this.maps  = {};
		this.state = {};
	},

	map:function(name) {

		if (!this.maps[name]) {
			this.maps[name] = new Map({});
			this.maps[name].parent = this;
		}
			
		return this.maps[name];
	},

	initialize_canvas:function(params) {

		this.canvas_id = this.merge(params.canvas_id, 'canvas');
		this.canvas    = this.doc_get(this.canvas_id);

		if (!this.canvas) {
			document.write('<canvas id="' + this.canvas_id + '"></canvas>');
			this.canvas    = this.doc_get(this.canvas_id);
		}

		// put reference to this object in canvas
		this.canvas.screen = this

		if (this.canvas.getContext) {  
			this.ctx = this.canvas.getContext('2d');  
		}		
	},

	size_canvas:function() {

		var canvas_width  = this.doc_get(this.canvas_id).getAttribute('width');
		var canvas_height = this.doc_get(this.canvas_id).getAttribute('height');

		var auto_width = (this.width * this.pixel_width);
		if (auto_width != canvas_width) {
			this.doc_get(this.canvas_id).setAttribute('width', auto_width);
		}

		var auto_height = (this.height * this.pixel_height);
		if (auto_height != canvas_height) {
			this.doc_get(this.canvas_id).setAttribute('height', auto_height);
		}
	},

	//
	// Interaction and animation
	//

	click:function(logic) {

		// store click logic
		this.click_logic = logic;

		// activate click handler
		this.canvas.addEventListener('mousedown', this.click_handler, false);
	},

	click_handler:function(event) {

		// determine x and y in real pixels relative to canvas
		var relative_x = event.clientX - this.offsetLeft;
		var relative_y = event.clientY - this.offsetTop;

		// execute pixel map click logic
		for (var map in this.screen.maps) {

			// determine x and y in virtual pixels
			pixel_x = Math.floor(relative_x / this.screen.maps[map].pixel_width);
			pixel_y = Math.floor(relative_y / this.screen.maps[map].pixel_height);

			this.screen.maps[map].click_logic(pixel_x, pixel_y);
		}

		// execute global click logic
		this.screen.click_logic(relative_x, relative_y);
	},

	draw_all:function() {

		this.ctx.clearRect(0,0,300,300);

		for (var map in this.maps) {
			this.maps[map].draw();
		}
	},

	animate:function(speed, logic) {

		if (!this.animate_logic) {
			this.animate_logic = logic;
		}

		this.animate_logic();
		this.draw_all();

		setTimeout('document.getElementById("' + this.canvas_id + '").screen.animate(' + speed + ')', speed);
	},

	//
	// Helpers
	//
	
	doc_get:function(id) {
		return document.getElementById(id);
	},

	merge:function(sent, preset) {
		return (this.undefined_or_null(sent)) ? preset : sent;
	},

	undefined_or_null:function(value) {
		return value == undefined || value == null;
	}
}
