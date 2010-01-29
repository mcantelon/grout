// Global used to keep track of grout instances
var grout_id = 0;

// Base class contains helpers
var Base = function(params) {
}

Base.prototype = {

	mixin:function(name_and_definition_hash) {

		for(property_name in name_and_definition_hash) {
			this[property_name] = name_and_definition_hash[property_name];
		}
	},

	doc_get:function(id) {
		return document.getElementById(id);
	},

	merge:function(sent, preset) {
		return (this.undefined_or_null(sent)) ? preset : sent;
	},

	undefined_or_null:function(value) {
		return value == undefined || value == null;
	},

	set_attributes_from_hash:function(params) {

		for(param in params) {
			this[param] = params[param];
		}
	}
}

// Has_Pixels mixin defines logic common to sprites and maps
var Has_Pixels = {

	initialize_resources:function(params) {

		params = this.merge(params, {});
		//params = typeof(params) != 'undefined' ? params : {};

		this.width  = this.merge(params.width, 10);
		this.height = this.merge(params.height, 10);

		this.tile_width  = this.merge(params.tile_width, 10);
		this.tile_height = this.merge(params.tile_height, 10);

		this.pixels = []; // pixels to draw when rendering
		this.buffer = []; // buffer area for pixel transformations

		this.state  = {} // ad-hoc variables for applications
		this.system = {} // misc variable for internal use

		this.clear(); // initialize pixel area
	},

	cycle_through_pixels:function(logic) {

		for (x = 0; x < this.width; x++) {
			for (y = 0; y < this.height; y++) {
				// params is optional, to pass ad-hoc stuff through
				params = typeof(params) != 'undefined' ? params : {};
				logic(this, x, y, params);
			}
		}
	},

	draw_common:function(that, x, y, real_x, real_y) {

		if (that.pixels[x] != undefined) {

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
						that.tile_width,
						that.tile_height
					);
				} catch(e) {}
			}
		}
	},

	clear:function() {

		this.pixels = []

		this.cycle_through_pixels(function(that, x, y, params) {
				
			if (that.undefined_or_null(that.pixels[x])) {
				that.pixels[x] = Array()
			}

			that.pixels[x][y] = false;
		});
	},

	inside_margins:function(x, y) {

		var horizontal_margin_data = this.margin_horizontal_data(this.pixels);
		var vertical_margin_data;

		if (x >= (this.offset_x + horizontal_margin_data['left'])
		  & x < (this.offset_x + this.width - horizontal_margin_data['right'])) {

			vertical_margin_data = this.margin_vertical_data(this.pixels);

			if (y >= (this.offset_y + vertical_margin_data['top'])
			  & y < (this.offset_y + this.height - vertical_margin_data['bottom'])) {

				return true;
			}
			else {

				return false;
			}
		}

		return false;
	},

	margin_vertical_data:function(pixels) {

		var lowest_row = 0;
		var lowest_row_with_pixel = 0;
		var highest_row = 999;
		var highest_row_with_pixel = 999;

		// cycle through each column
		for (var x = 0; x < pixels.length; x++) {
			
			if (pixels[x] != undefined) {

				for (var y = 0; y < pixels[x].length; y++) {
					
					if (pixels[x][y] != undefined
					  && pixels[x][y]) {
						if (y > lowest_row_with_pixel) {
							lowest_row_with_pixel = y;
						}
						if (y < highest_row_with_pixel) {
							highest_row_with_pixel = y;
						}
					}
					if (y < highest_row) {
						highest_row = y;
					}
					if (y > lowest_row) {
						lowest_row = y;
					}
				}
			}
		}

		return {
			'bottom': lowest_row - lowest_row_with_pixel,
			'top': highest_row_with_pixel
		}
	},

	margin_horizontal_data:function(pixels) {

		//var margin_data = {}

		var leftmost_row = 999;
		var leftmost_row_with_pixel = 999;
		var rightmost_row = 0;
		var rightmost_row_with_pixel = 0;

		// cycle through each column
		for (var x = 0; x < pixels.length; x++) {
			
			if (pixels[x] != undefined) {

				for (var y = 0; y < pixels[x].length; y++) {

		// cycle through each column
		//for (var x in pixels) {
		//	for (var y in pixels[x]) {

					if (pixels[x][y] != undefined
					  && pixels[x][y]) {

						if (x > rightmost_row_with_pixel) {
							rightmost_row_with_pixel = x;
						}

						if (x < leftmost_row_with_pixel) {
							leftmost_row_with_pixel = x;
						}
					}

					if (x > rightmost_row) {
						rightmost_row = x;
					}
				}
			}
		}

		return {
			'left': leftmost_row_with_pixel,
			'right': (this.width - 1) - rightmost_row_with_pixel
		}
	},

	detect_collision_with_pixels:function(pixels, offset_x, offset_y) {

		offset_x = this.merge(offset_x, 0);
		offset_y = this.merge(offset_y, 0);

		// hack: pass object as parameter so we can return value
		function collision_object() {}
		var collision = new collision_object();

		params = {
			'pixels': pixels,
			'collision': collision,
			'offset_x': offset_x,
			'offset_y': offset_y
		};

		params['collision'].value = false;

		this.cycle_through_pixels(function(that, x, y, params) {

			var other_pixels = params['pixels'];
			var other_x = x + params['offset_x'];
			var other_y = y + params['offset_y'];

			if (!that.undefined_or_null(that.pixels[x])
			  && !that.undefined_or_null(other_pixels[other_x])) {

  				if (!that.undefined_or_null(that.pixels[x][y])
  				  && !that.undefined_or_null(other_pixels[other_x][other_y])) {

					if (that.pixels[x][y] && other_pixels[other_x][other_y]) {
						params['collision'].value = true;
					}
  				}
			}
		});
		
		return params['collision'].value;
	},
	
	rotate:function() {

		var temp = [];
		var temp_x;

		if (this.width <= this.height) {
			width = this.width;
		}
		else {
			width = this.height;
		}

		for(var i=0; i < width; i++) {
			for(var j=0; j < width; j++) {
				temp_x = (width - 1) - j;
				if (temp[temp_x] == undefined) {
					temp[temp_x] = [];
				}
				temp[temp_x][i]= this.pixels[i][j];
			}
		}

		this.pixels = temp;

		//return temp;
	},

	overwrite:function(new_pixels) {

		this.clear();
		this.stamp(new_pixels);
	},

	stamp:function(new_pixels, offset_x, offset_y) {

		new_pixels = this.merge(new_pixels, []);
		offset_x = this.merge(offset_x, 0);
		offset_y = this.merge(offset_y, 0);

		params = {
			'new_pixels': new_pixels,
			'offset_x':   offset_x,
			'offset_y':   offset_y,
			'count': 0
		};

		this.cycle_through_pixels(function(that, x, y, params) {

			if (params['new_pixels'][x] != undefined
			  && params['new_pixels'][x][y] != undefined) {
				if (params['new_pixels'][x][y]) {
					that.pixels[x + params['offset_x']][y + params['offset_y']] = params['new_pixels'][x][y];
					params['count']++;
			  	}
			}
		});
	},

	count_pixels:function(start_x, start_y, end_x, end_y) {

		params = {
			'count': 0
		}

		this.cycle_through_pixels(function(that, x, y, params) {
				
			if (!that.undefined_or_null(that.pixels[x][y])
			  && that.pixels[x][y]
			) {
				params['count']++;
			}
		});

		return params['count'];
	},

	clear_range:function(start_x, start_y, end_x, end_y) {

		for(var x = start_x; x <= end_x; x++) {

			if (!this.undefined_or_null(this.pixels[x])) {

				for (var y = start_y; y <= end_y; y++) {

					this.pixels[x][y] = false;
				}
			}
		}
	},

	copy_tile_range:function(start_x, start_y, end_x, end_y) {

		var new_y_count = 0;
		var new_pixels = [];

		for (var y = start_y; y <= end_y; y++) {

			for (var x = start_x; x <= end_x; x++) {

				if (this.undefined_or_null(new_pixels[x])) {
					new_pixels[x] = [];
				}

				if (!this.undefined_or_null(this.pixels[x])
				  && !this.undefined_or_null(this.pixels[x][y])) {
					new_pixels[x][new_y_count] = this.pixels[x][y];
				}
			}

			new_y_count++;
		}

		return new_pixels;
	},

    pixels_and_size_from_string:function(sprite_string, color_codes) {

		var color_codes = this.merge(color_codes, {});

		var sprite_rows = [];

		// normalize whitespace
		sprite_string = sprite_string.replace(/[\n\r\t]/g, ' ');

		// reduce multiple contigous spaces to single spaces
		while(sprite_string.indexOf('  ') != -1) {
			sprite_string = sprite_string.replace('  ', ' ');
		}

		// separate into raw rows, separated by spaces
		raw_rows = sprite_string.split(" ");

		// get rid of blank rows
		var y = 0;
		for (var i = 0; i < raw_rows.length; i++) {
			row = raw_rows[i].replace(' ', '');
			if (row.length > 0) {
				sprite_rows[y] = raw_rows[i];
				y++;
			}
		}

		// create pixel array from string
		var y = 0;
		pixels = [];
		for (var y = 0; y < sprite_rows.length; y++) {
			for (var x = 0; x < sprite_rows[y].length; x++) {

				if (this.undefined_or_null(pixels[x])) {
					pixels[x] = [];
				}

				if (sprite_rows[y][x] == '.') {
					pixels[x][y] = false;
				} else {
					if (sprite_rows[y][x] == '*') {
						pixels[x][y] = true;
					} else {
						color_code = sprite_rows[y][x];
						pixels[x][y] = color_codes[color_code];
					}
				}
			}
		}

        return {
            'pixels': pixels,
            'x': x,
            'y': y
        };
    },

	make_sprite:function(sprite_string, color_codes) {

        var sprite_data = this.pixels_and_size_from_string(sprite_string, color_codes);

		this.width = sprite_data.x;
		this.height = sprite_data.y;

		this.pixels = sprite_data.pixels;
	}
};

// Sprite class deals with floating pixel maps
var Sprite = function (params) {
	this.initialize(params);
}

// Sprite extends Base
Sprite.prototype = new Base();

// Sprite mixins
Sprite.prototype.mixin(Has_Pixels);
Sprite.prototype.mixin({

	initialize:function(params) {

		var params = this.merge(params, {});

		this.initialize_resources(params);

		this.offset_x = this.merge(params.offset_x, 0);
		this.offset_y = this.merge(params.offset_y, 0);

        this.frames = [];
		this.current_frame = 0;
	},

	draw:function() {

		this.cycle_through_pixels(function(that, x, y, params) {

			var real_x = (x + that.offset_x) * that.tile_width;
			var real_y = (y + that.offset_y) * that.tile_width;

			that.draw_common(that, x, y, real_x, real_y);
		});
	},

	// bottom margin in relation to some map
	margin_vertical:function(map) {

		var margin_data = this.margin_vertical_data(this.pixels);

		return {
			'top': (this.offset_y + margin_data['top']),
			'bottom':  map.height - (this.offset_y + this.height - margin_data['bottom'])
		}
	},

	// bottom margin in relation to some map
	margin_horizontal:function(map) {

		var margin_data = this.margin_horizontal_data(this.pixels);

		return {
			'left':   (this.offset_x + margin_data['left']),
			'right':  map.width - (this.offset_x + this.width - margin_data['right'])
		}
	},

	outside_of_map:function(map) {

		var outside_horizontally = this.outside_of_map_horizontally(map);
		var outside_vertically   = this.outside_of_map_vertically(map);

		return outside_horizontally || outside_vertically;
	},

	outside_of_map_horizontally:function(map) {

		var margin_horizontal = this.margin_horizontal(map);

		var past_left_edge  = this.offset_x < 0;
		var past_right_edge = ((this.offset_x + this.width - margin_horizontal['right']) > map.width);

		return past_left_edge || past_right_edge;
	},

	outside_of_map_vertically:function(map) {

		var margin_vertical = this.margin_vertical(map);

		var past_top    = this.offset_y < 0;
		var past_bottom = this.offset_y + this.height - margin_vertical['bottom'] > map.height;

		return past_top || past_bottom;
	},

	margin_left:function(map) {
		
		var margin_horizontal = this.margin_horizontal(map);

		return margin_horizontal['left'];
	},

	margin_right:function(map) {

		var margin_horizontal = this.margin_horizontal(map);

		return margin_horizontal['right'];
	},

	margin_top:function(map) {

		var margin_data = this.margin_vertical(map);

		return margin_data['top'];
	},

	margin_bottom:function(map) {

		var margin_data = this.margin_vertical(map);

		return margin_data['bottom'];
	},

	// should we let it move to negative, etc.? i guess... or make it an option
	move:function(offset_x, offset_y) {

		this.offset_x = this.offset_x + offset_x;
		this.offset_y = this.offset_y + offset_y;
	},

	check_if_move_will_collide_with_pixels:function(offset_x, offset_y, pixels) {

		return this.detect_collision_with_pixels(pixels, this.offset_x + offset_x, this.offset_y + offset_y);
	},

	detect_collision_with_map:function(map) {
		
		return this.detect_collision_with_pixels(map.pixels, this.offset_x, this.offset_y);
	},

	click:function(logic) {

		// store click logic
		this.click_logic = logic;

		// activate click handler
		//this.parent.canvas.addEventListener('mousedown', this.parent.click_handler, false);
	},

    add_frame:function(pixels) {
        this.frames.push(pixels);
    },

    add_frame_from_string:function(sprite_string, color_codes) {

        var frame_data = this.pixels_and_size_from_string(sprite_string, color_codes)

        this.add_frame(frame_data.pixels);
    },

    next_frame:function(restart_at_frame) {

		restart_at_frame = this.merge(restart_at_frame, this.frames.length - 1);

    	if (
    	  this.current_frame < (this.frames.length - 1)
    	  && this.current_frame < restart_at_frame
    	) {
            this.current_frame++;
    	}
    	else {
    	    this.current_frame = 0;
    	}
        this.pixels = this.frames[this.current_frame];
    },

    set_frame:function(frame) {
        banker.pixels = banker.frames[0];
    }
});

// Map class deals with pixel maps
var Map = function (params) {
	this.initialize(params);
}

// Map extends Base
Map.prototype = new Base();

// Map mixins
Map.prototype.mixin(Has_Pixels);
Map.prototype.mixin({

	initialize:function(params) {
		this.initialize_resources(params);
	},

	check_if_shift_will_collide_with_pixels:function(shift_x, shift_y, pixels) {

		var temp_map = new Map();
		temp_map.pixels = this.pixels;
		temp_map.shift(shift_x, shift_y);
		if (temp_map.detect_collision_with(pixels)) {
			return true;
		}
		
		return false;
	},

	detect_collision_with:function(pixels) {
		
		return this.detect_collision_with_pixels(pixels);
	},

	margin_bottom:function() {
		
		var margin_vertical = this.margin_vertical();

		return margin_vertical['bottom'];
	},

	margin_top:function() {
		
		var margin_vertical = this.margin_vertical();

		return margin_vertical['top'];
	},

	// return vertical pixel margins of active pixels in map
	margin_vertical:function() {

		var margin_data = this.margin_vertical_data(this.pixels);
		
		return margin_data;
	},

	margin_left:function() {
		
		var margin_horizontal = this.margin_horizontal();

		return margin_horizontal['left'];
	},

	margin_right:function() {
		
		var margin_horizontal = this.margin_horizontal();

		return margin_horizontal['right'];
	},

	// return horizontal pixel margins of active pixels in map
	margin_horizontal:function() {

		//var margin_data = {}

		var leftmost_row = 999;
		var leftmost_row_with_pixel = 999;
		var rightmost_row = 0;
		var rightmost_row_with_pixel = 0;

		// cycle through each column
		for (var x in this.pixels) {
			for (var y in this.pixels[x]) {

				if (this.pixels[x][y] != undefined
				  && this.pixels[x][y]) {
					if (x > rightmost_row_with_pixel) {
						rightmost_row_with_pixel = x;
					}
					if (x < leftmost_row_with_pixel) {
						leftmost_row_with_pixel = x;
					}
				}

				if (x > rightmost_row) {
					rightmost_row = x;
				}
			}
		}

		return {
			'left': leftmost_row_with_pixel,
			'right': (this.width - 1) - rightmost_row_with_pixel
		}
	},

	shift:function(x, y) {

		params = {
			'original': this.pixels,
			'new': [],
			'shift_x': x,
			'shift_y': y
		};

		this.buffer = [] // clear buffer

		this.cycle_through_pixels(function(that, x, y, params) {

			if (params['original'][x] != undefined) {

				pixel = params['original'][x][y];

				// if attempting to shift pixel beyond map border, wrap
				new_x = x + params['shift_x'];

				if (new_x > (that.pixels.width - 1)) {
					new_x = new_x - that.pixels.length;
				}

				// if attempting to shift pixel beyond map border, wrap
				new_y = y + params['shift_y'];

				if (new_y > (that.height - 1)) {
					new_y = new_y - that.pixels[x].length;
				}

				try {

					if (that.buffer[new_x] == undefined) {
						that.buffer[new_x] = [];
					}

					that.buffer[new_x][new_y] = pixel;

				} catch(e) {}
			}
		});
		
		this.pixels = this.buffer;
	},

	draw:function() {

		this.cycle_through_pixels(function(that, x, y, params) {

			var real_x = x * that.tile_width;
			var real_y = y * that.tile_width;

			that.draw_common(that, x, y, real_x, real_y);
		});
	},

	// Shorthand for setting pixels:
	// my_grout.poke(1, 4, 'red'); <- set individual pixel to red
	// my_grout.poke([[2, 5], [3, 4, 'green']]); <- set one to black, one to green
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
	}
});

// Grout class manages big picture
var Grout = function (params) {
	this.initialize(params);
}

// Grout extends Base
Grout.prototype = new Base();

// Grout mixins
Grout.prototype.mixin({

	initialize:function(params) {

		// each grout gets unique ID
		grout_id++;
		this.id = grout_id;

		this.key_repeat_interval = 250;

		this.set_attributes_from_hash(params);

		this.initialize_canvas(params);

		// hashes where maps and sprites live
		this.maps    = {};
		this.sprites = {};

		// group-related data
		this.active_group = 'main';
		this.group_maps    = {};
		this.map_group     = {};
		this.group_sprites = {};
		this.sprite_group  = {};

		// hash for ad-hoc state
		this.state   = {};

		this.stopped = false;

		this.keys_pressed = {};
		this.key_repeat_interval_for = {};
	},

	initialize_canvas:function(params) {

		this.canvas_id = this.merge(params.canvas_id, 'canvas_' + this.id);
		this.canvas    = this.doc_get(this.canvas_id);

		// write canvas to document
		if (!this.canvas) {
			document.write('<canvas id="' + this.canvas_id + '"></canvas>');
			this.canvas    = this.doc_get(this.canvas_id);
		}

		// set canvas size
		this.canvas.setAttribute('width',  this.width);
		this.canvas.setAttribute('height', this.height);

		// put reference to this object in canvas
		this.canvas.grout = this

		if (this.canvas.getContext) {  
			this.ctx = this.canvas.getContext('2d');  
		}		
	},

	map:function(name, params) {

		var group;

		params = this.merge(params, {});

		group = this.merge(params['group'], 'main');

		if (!this.maps[name]) {
			this.maps[name] = new Map(params);
			this.maps[name].parent = this;
			this.add_to_group(this.group_maps, this.map_group, group, name);
		}

		return this.maps[name];
	},

	sprite:function(name, params) {

		var group;

		params = this.merge(params, {});

		group = this.merge(params['group'], 'main');

		if (!this.sprites[name]) {
			this.sprites[name] = new Sprite(params);
			this.sprites[name].parent = this;
			this.add_to_group(this.group_sprites, this.sprite_group, group, name);
		}

		return this.sprites[name];
	},

	add_to_group:function(groups, reverse_lookup, group, name) {

		groups[group] = this.merge(groups[group], []);
		reverse_lookup[name] = group;
		groups[group].push(name);
	},

	delete_sprite:function(name) {

		var group = this.sprite_group[name];

		delete this.sprite_group[name];

		// find in group array and delete
		for (var i = 0; i < this.group_sprites[group].length; i++) {

			if (this.group_sprites[group][i] == name) {

				delete this.group_sprites[group][i];
			}
		}

		delete this.sprites[name];
	},

	//
	// Interaction and animation
	//

	click:function(logic) {

		// store click logic
		this.click_logic = logic;

		// remove click handler, in case one already exists
		this.canvas.removeEventListener('mousedown', this.click_handler, false);

		// activate click handler
		this.canvas.addEventListener('mousedown', this.click_handler, false);
	},

	keypress:function(logic) {

		// store reference to object in document
		document.grout = this;

		// store keypress logic
		this.keypress_logic = logic;

		// activate key press handler
		document.onkeydown = this.key_handler;

		// activate key release handler
		document.onkeyup = this.key_release_handler;
	},

	key_handler:function(event) {

		// if key isn't already pressed, mark is as pressed and fire logic
		if (this.grout.keys_pressed[event.keyCode] == undefined
		  || this.key_repeat_interval == 0
		) {

			this.grout.keys_pressed[event.keyCode] = true;

			this.grout.key_cycle(event.keyCode);
		}
	},

	key_cycle:function(keycode) {

		var repeat_interval;

		if (this.keys_pressed[keycode] != undefined) {
	
			this.keypress_logic(keycode);

			// if key repetition management isn't disabled, allow repeat after interval
			if (this.key_repeat_interval != 0) {

				// allow for per-key repeat interval setting
				if (this.key_repeat_interval_for[keycode] != undefined) {
					repeat_interval = this.key_repeat_interval_for[keycode];
				}
				else {
					repeat_interval = this.key_repeat_interval;
				}

				setTimeout('document.grout.key_cycle(' + keycode + ')', repeat_interval);
			}
		}
	},

	key_release_handler:function(event) {

		delete this.grout.keys_pressed[event.keyCode];
	},

	click_handler:function(event) {

		// determine x and y in real pixels relative to canvas
		var relative_x = event.clientX - this.offsetLeft;
		var relative_y = event.clientY - this.offsetTop;

		if (this.grout.click_logic != undefined) {

			// execute global click logic
			this.grout.click_logic(relative_x, relative_y);
		}

		this.grout.click_children(
			this.grout.active_group,
			this.grout.group_maps,
			this.grout.maps,
			relative_x,
			relative_y
		);

		this.grout.click_children(
			this.grout.active_group,
			this.grout.group_sprites,
			this.grout.sprites,
			relative_x,
			relative_y
		);
	},

	click_children:function(group, group_objects, objects, relative_x, relative_y) {

		// execute pixel map click logic
		for (var item in objects) {

			if (group_objects[group] != undefined
			  && group_objects[group].indexOf(item) != -1) {

				// determine x and y in virtual pixels
				tile_x = Math.floor(relative_x /  objects[item].tile_width);
				tile_y = Math.floor(relative_y / objects[item].tile_height);

				if (objects[item].click_logic) {
					objects[item].click_logic(tile_x, tile_y);
				}
			}
		}
	},

	clear_canvas:function() {

		this.ctx.clearRect(0, 0, this.width, this.height);
	},

	draw_all:function(group) {

		var map;

		group = this.merge(group, 'main');

		this.clear_canvas();

		// set active group so map/sprite clicks are handled properly
		this.active_group = group;

		if (this.group_maps[group] != undefined) {

			for (var i = 0; i < this.group_maps[group].length; i++) {
				map = this.group_maps[group][i];

				if (map != undefined) {

					this.maps[map].draw();
				}
			}
		}

		if (this.group_sprites[group] != undefined) {

			for (var i = 0; i < this.group_sprites[group].length; i++) {
				sprite = this.group_sprites[group][i];

				if (sprite != undefined) {

					this.sprites[sprite].draw();
				}
			}
		}
	},

	animate:function(speed, logic) {

		if (!this.animate_logic) {
			this.animate_logic = logic;
		}

		if (!this.stopped) {

			this.animate_logic();

			// allow animation logic to stop itself
			if (!this.stopped) {
				this.draw_all();
			}
		}

		setTimeout('document.getElementById("' + this.canvas_id + '").grout.animate(' + speed + ')', speed);
	},

	start:function() {
		this.stopped = false;
		this.keys_pressed = {};		
	},

	stop:function() {
		this.stopped = true;
		this.keys_pressed = {};
	}
});
