function grout_palette_preset(preset, click_logic) {

	if (preset == 'large') {

		return grout_palette({
				'height': 17 * 18,
				'tile_width': 18,
				'tile_height': 3
			},
			click_logic,
        	function (x, y, colour, current_colour_action) {
        		var shift_x,
        			shift_y,
        			colour_action_shift = {
        				0: {x: 0, y: 0},
        				1: {x: -17, y: 17},
        				2: {x: -34, y: 34},
        				3: {x: -51, y: 51},
        				4: {x: -68, y: 68},
        				5: {x: -85, y: 85}
        			}

				//shift_x = 0
				shift_y = 0
        		shift_x = colour_action_shift[current_colour_action].x
        		shift_y = colour_action_shift[current_colour_action].y

       	 		this.poke(x + shift_x, y + shift_y, colour)
			}
		)
	}
	else if (preset == 'medium') {

		return grout_palette({
				'height': 17 * 9,
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

        		shift_x = colour_action_shift[current_colour_action].x
        		shift_y = colour_action_shift[current_colour_action].y

        		this.poke(x + shift_x, y + shift_y, colour)
        	}
		)
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
		draw_colour_pallette(picker_map, render_logic)
		picker.draw_all()

		if (click_logic != undefined) {
			picker_map.click(click_logic)
		}
		else {
			var colour = picker_map.pixels[x][y]
			alert('You clicked ' + colour + '.')
		}

		return picker
	}

	function draw_colour_pallette(picker_map, render_logic) {

		var next_colour_action = 0,
			current_colour_action = 0,
			r = 255,
			g = 0,
			b = 0,
			x_step = 15,
			colour_alter,
			altered_r,
			alerted_g,
			alerted_b

		var colour_actions = [
			'g +',
			'r -',
			'b +',
			'g -',
			'r +',
			'b -'
		]

		var colour

		// use colour actions to create a colour pallette
		for (var x = 0; x < picker_map.width; x++) {

			// every time a colour action has changed colour 255 shades,
			// change current colour action
			if (x % (255 / x_step) == 0) {

				var colour_action = colour_actions[next_colour_action]
				current_colour_action = next_colour_action

				if (next_colour_action < (colour_actions.length - 1)) {
					next_colour_action++
				}
			}

			function colour_alter_calc(colour, colour_alter) {
				return (colour + colour_alter > 0) ? colour + colour_alter : 0
			}

			for (var y = 0; y < picker_map.height; y++) {
				colour_alter = 0 - (y * 15)
				altered_r = (r + colour_alter > 0) ? r + colour_alter : 0
				altered_g = (g + colour_alter > 0) ? g + colour_alter : 0
				altered_b = (b + colour_alter > 0) ? b + colour_alter : 0

				colour = grout_palette_rgb_to_hex(altered_r, altered_g, altered_b)

				if (render_logic == undefined) {
					picker_map.poke(x, y, colour)
				}
				else {
					// call rendering function using picker_map as context
					render_logic.call(picker_map, x, y, colour, current_colour_action)
				}
			}

			// change colour according to current action
			eval(colour_action + '= ' + x_step)
		}
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
}