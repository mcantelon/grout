var CANVAS_WIDTH  = 200
var CANVAS_HEIGHT = 200
var DEFAULT_TILE_SIZE = 2
var DEFAULT_PLOT_LOGIC = 'Math.sin((x + step) / wavelength) * amplitude'
var grout

function wavetoy_init() {

	// establish grout as a global variable
	grout = new Grout({
		'width':  CANVAS_WIDTH,
		'height': CANVAS_HEIGHT,
		'key_repeat_interval': 25
	})

	grout.state.plot_logic = new Function('x', 'step', 'wavelength', 'amplitude', 'return ' + DEFAULT_PLOT_LOGIC)

	wavetoy(2, DEFAULT_TILE_SIZE)
}

function shuffle_wave_colour_patterns() {

	// sine wave colour patterns (one green-ish, one red-ish, one blue-ish)
	var available_wave_colour_patterns = ['f**', '*f*', '**b'],
		wave_colour_patterns = [],
		pattern_index,
		colour_pattern

	// shuffle colour_patterns
	for (pattern_index in available_wave_colour_patterns) {
		colour_pattern = available_wave_colour_patterns[pattern_index]
		if (Math.random() * 2 >= 1) {
			wave_colour_patterns.push(colour_pattern)
		}
		else {
			wave_colour_patterns.unshift(colour_pattern)
		}
	}

	return wave_colour_patterns
}

// sine wave plotting logic
function wave_plot(sprite, step, colour) {

	var wavelength = sprite.state['wavelength'],
		amplitude = sprite.state['amplitude'],
		plot_logic

	// oscillate amplitude
	amplitude = Math.abs(Math.sin(step / 32)) * amplitude

	// plot each dot of sine
	for (var x = 0; x < sprite.width; x++) {
		plot_logic = grout.state.plot_logic
		if (plot_logic) {
			var top_y = plot_logic(x, step, wavelength, amplitude) + (sprite.height / 2)
			sprite.pixels[Math.round(x)][Math.round(top_y)] = colour
		}
	}
}

function wavetoy(number_of_waves, tile_size) {

    // create pixel map for background pattern
	background = grout.map(
	    'background', {
	    	'width': CANVAS_WIDTH / DEFAULT_TILE_SIZE,
	    	'height': CANVAS_HEIGHT / DEFAULT_TILE_SIZE,
	        'tile_width': DEFAULT_TILE_SIZE,
	        'tile_height': DEFAULT_TILE_SIZE
	    }
	)

	var wave_colour_patterns = shuffle_wave_colour_patterns()

	// clear animations and sprites in case some are already running
	grout.clear_animation()
	grout.delete_sprites()

	// make sine sprites and give them random characteristics
	for (var i = 0; i < number_of_waves; i++) {

		// create sprite for sine wave
		var wave_sprite = grout.sprite(
			'sine_' + i, {
				'width': CANVAS_WIDTH / tile_size,
				'height': CANVAS_HEIGHT / tile_size,
				'tile_width': tile_size,
				'tile_height': tile_size
			}
		)

		// use sine wave sprite's state to give unique characteristics
		wave_sprite.state = {
			'wavelength': Math.floor(Math.random() * 16) + 2,
			'step': 0,
			'amplitude': Math.floor(Math.random() * (wave_sprite.height / 2)),
			'colour_pattern': wave_colour_patterns[i % wave_colour_patterns.length]
		}

		// animate by different intervals to make things more interesting
		var animation_interval = (i + 1) * 30

		// activate animation channel for sine wave sprite
		grout.animate(animation_interval, function() {

			// we use the channel name to determine which sprite
			// to update
			var wave_sprite = this.sprites[this.current_queue]

			// clear sprite pixels
			wave_sprite.clear()

			// plot a number of steps of the sine in different colours
			for (var i = 0; i < 14; i += 2) {
				// replace "*"s in colour pattern with other values to give colour shades
				var colour = wave_sprite.state['colour_pattern'].replace(/\*/g, i.toString(16))
				wave_plot(wave_sprite, wave_sprite.state['step'] - i, colour)
			}

			wave_sprite.state['step']++;

		}, 'sine_' + i) // the channel is given same name as wave sprite
	}
}