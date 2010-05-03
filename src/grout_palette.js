// for whole pallette trip maybe make it so it's not so fucking weird
// render one sub-palette at a time

function grout_palette_colour_ranges() {

	return [
			{'colour_action': 'g +', 'start_colour': [255, 0, 0]},
			{'colour_action': 'r -', 'start_colour': [255, 255, 0]},
			{'colour_action': 'b +', 'start_colour': [0, 255, 0]},
			{'colour_action': 'g -', 'start_colour': [0, 255, 255]},
			{'colour_action': 'r +', 'start_colour': [0, 0, 255]},
			{'colour_action': 'b -', 'start_colour': [255, 0, 255]}
		]
}

function grout_palette_preset(preset, click_logic) {

	var index,
		colour_ranges,
		colour_action,
		start_colour,
		x_start = 0,
		palette,
		offsets,
		x_offset,
		y_offset

	colour_ranges = grout_palette_colour_ranges()

	if (preset == 'small') {

		palette = grout_palette({
				'width': 306,
				'height': 17,
				'tile_width': 1,
				'tile_height': 1
			},
			click_logic
		)

		for(index in colour_ranges) {

			colour_action = colour_ranges[index]['colour_action']
			start_colour = colour_ranges[index]['start_colour']
			draw_colour_pallette(palette.maps['picker'], undefined, colour_action, start_colour, x_start, x_start + 51, 0, 17, 5, 15)

			x_start = x_start + 51
		}

		palette.draw_all()
	}

	if (preset == 'medium') {

		palette = grout_palette({
				'width': 34,
				'height': 51,
				'tile_width': 9,
				'tile_height': 3
			},
			click_logic
		)

		offsets = [
			{'x': 0, 'y': 0},
			{'x': 17, 'y': 0},
			{'x': 0, 'y': 17},
			{'x': 17, 'y': 17},
			{'x': 0, 'y': 34},
			{'x': 17, 'y': 34},
		]

		for(index in colour_ranges) {

			colour_action = colour_ranges[index]['colour_action']
			start_colour = colour_ranges[index]['start_colour']
			x_offset = offsets[index]['x']
			y_offset = offsets[index]['y']

			draw_colour_pallette(palette.maps['picker'], undefined, colour_action, start_colour, x_offset, x_offset + 17, y_offset, y_offset + 17, 15, 15)
		}

		palette.draw_all()
	}
	else if (preset == 'large') {

		palette = grout_palette({
				'width': 17,
				'height': 102,
				'tile_width': 18,
				'tile_height': 3
			},
			click_logic
		)

		offsets = [
			{'x': 0, 'y': 0},
			{'x': 0, 'y': 17},
			{'x': 0, 'y': 34},
			{'x': 0, 'y': 51},
			{'x': 0, 'y': 68},
			{'x': 0, 'y': 85},
		]

		for(index in colour_ranges) {

			colour_action = colour_ranges[index]['colour_action']
			start_colour = colour_ranges[index]['start_colour']
			x_offset = offsets[index]['x']
			y_offset = offsets[index]['y']

			draw_colour_pallette(palette.maps['picker'], undefined, colour_action, start_colour, x_offset, x_offset + 17, y_offset, y_offset + 17, 15, 15)
		}

		palette.draw_all()

		/*
		return grout_palette({
				'width': 34,
				'height': 68,
				'tile_width': 9,
				'tile_height': 3
			},
			click_logic,
    	    function (x, y, colour, current_colour_action) {
        		var shift_x,
        			shift_y,
        			colour_action_shift = {
        				0: {x: 0, y: 0},
        				1: {x: 0, y: 0},
       	 				2: {x: -34, y: 17},
        				3: {x: -34, y: 17},
        				4: {x: -68, y: 34},
        				5: {x: -68, y: 34}
        			}

				if (this.state['colour_action'] != current_colour_action) {
					alert(current_colour_action)
					this.state['colour_action'] = current_colour_action
				}

        		shift_x = colour_action_shift[current_colour_action].x
        		shift_y = colour_action_shift[current_colour_action].y

        		this.pixels[x + shift_x][y + shift_y] = colour
			}
		)
		*/
	}
}

function grout_palette(params, click_logic, render_logic) {

	if (params['preset'] != undefined) {

		return grout_palette_preset(params['preset'], click_logic)
	}
	else {

		// palette defaults
		var grout_params = {
			'width': 306,
			'height': 17,
			'canvas_id': 'picker'
		}

		var tile_width = params['tile_width'] || 3
		var tile_height = params['tile_height'] || 1

		// allow defaults to be overridden
		for (index in params)
			grout_params[index] = params[index]

		// establish grout as a global variable
		var picker = new Grout(grout_params)

		// create editor map
		var picker_map = picker.map(
			'picker', {
				'width': picker.width,
				'height': picker.height,
				'tile_width': tile_width,
				'tile_height': tile_height
			}
		)

		picker_map.clear()
		//draw_colour_pallette(picker_map, render_logic, params['x_step'])
		//picker.draw_all()

		if (click_logic != undefined) {
			picker_map.click(click_logic)
		}
		/*
		else {
			var colour = picker_map.pixels[x][y]
			alert('You clicked ' + colour + '.')
		}
		*/

		return picker
	}
}

	function draw_colour_pallette(picker_map, render_logic, colour_action, start_colour, x_start, x_end, y_start, y_end, x_factor, y_factor) {

		x_factor = x_factor || 5
		y_factor = y_factor || 15

		var next_colour_action = 0,
			current_colour_action = 0,
			r = start_colour[0],
			g = start_colour[1],
			b = start_colour[2],
			colour_alter,
			altered_r,
			alerted_g,
			alerted_b

		var colour

		// use colour actions to create a colour pallette
		for (var x = x_start; x < x_end; x++) {
			for (var y = y_start; y < y_end; y++) {

				colour_alter = 0 - ((y - y_start) * y_factor)

				altered_r = (r + colour_alter > 0) ? r + colour_alter : 0
				altered_g = (g + colour_alter > 0) ? g + colour_alter : 0
				altered_b = (b + colour_alter > 0) ? b + colour_alter : 0


				//if (render_logic == undefined) {
					picker_map.pixels[x][y] = [altered_r, altered_g, altered_b]
				/*
				}
				else {
					// call rendering function using picker_map as context
					render_logic.call(picker_map, x, y, [altered_r, altered_g, altered_b], current_colour_action)
				}
				*/
			}

			// change colour according to current action
			eval(colour_action + '= ' + x_factor)
		}
	}

	function grout_palette_hex_to_rgb(hex) {

		var r, g, b

		r = parseInt(hex.substring(1, 3), 16)
		g = parseInt(hex.substring(3, 5), 16)
		b = parseInt(hex.substring(5, 7), 16)

		return [r, g, b]
	}

	function grout_palette_rgb_to_hex(r, g, b) {

		var r_hex = decimalToHex(r, 2)
		var g_hex = decimalToHex(g, 2)
		var b_hex = decimalToHex(b, 2)
		return '#' + r_hex + g_hex + b_hex

		// http://stackoverflow.com/questions/57803/how-to-convert-decimal-to-hex-in-javascript
		function decimalToHex(d, padding) {

			var hex = Number(d).toString(16);		
			padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

			while (hex.length < padding) {
				hex = "0" + hex;
			}

			return hex;
		}
	}
