function grout_palette(params, click_logic, render_logic) {

	var grout_params = {
		'width': 306,
		'height': 17,
		'canvas_id': 'picker'
	}

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
			'tile_width': 1,
			'tile_height': 1
		}
	)

	picker_map.clear()
	draw_colour_pallette(picker_map, render_logic)
	picker.draw_all()

	if (click_logic != undefined) {
		picker_map.click(click_logic)
	}
	else {
		var colour = this.pixels[x][y]
		alert('You clicked ' + colour + '.')
	}

	return picker

	function draw_colour_pallette(picker_map, render_logic) {

		var current_colour_action = 0,
			r = 255,
			g = 0,
			b = 0,
			x_step = 5,
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

				var colour_action = colour_actions[current_colour_action]

				if (current_colour_action < (colour_actions.length - 1)) {
					current_colour_action++
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
					render_logic(x, y, colour, current_colour_action)
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