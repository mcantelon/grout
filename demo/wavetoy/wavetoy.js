var GROUT_WIDTH  = 100
var GROUT_HEIGHT = 100
var DEFAULT_PLOT_LOGIC = 'sin((x + step) / wavelength) * amplitude'
var grout

function wavetoy_init() {

	// establish grout as a global variable
	grout = new Grout({
		'width':  GROUT_WIDTH,
		'height': GROUT_HEIGHT
	})

	set_plot_logic(grout, DEFAULT_PLOT_LOGIC)
}

function set_plot_logic(grout, logic) {

	// we create a new function rather than use eval because the eval is slow...
	// within the function we create we use local variables as aliases to Math methods
	grout.state.plot_logic = new Function('x', 'step', 'wavelength', 'amplitude', 'var sin = Math.sin; var cos = Math.cos; var tan=Math.tan; var abs = Math.abs; return ' + logic)
}

function shuffle_wave_colour_patterns() {

	// wave colour patterns (one green-ish, one red-ish, one blue-ish)
	var available_wave_colour_patterns = ['#ff****', '#**ff**', '#****bb'],
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

// wave plotting logic
function wave_plot(sprite, step, colour) {

	var wavelength = sprite.state['wavelength'],
		amplitude = sprite.state['amplitude'],
		plot_logic

	// oscillate amplitude
	amplitude = Math.abs(Math.sin(step / 32)) * amplitude

	// plot each tile of wave
	for (var x = 0; x < sprite.width; x++) {
		plot_logic = grout.state.plot_logic
		if (plot_logic) {
			var y = plot_logic(x, step, wavelength, amplitude) + (sprite.height / 2)
			sprite.pixels[Math.round(x)][Math.round(y)] = colour
		}
	}
}

function wavetoy(params) {

	var number_of_waves = parseInt(params.number_of_waves || 2)
	var tile_size = parseInt(params.tile_size || 2)
	var number_of_iterations_to_show = parseInt(params.number_of_iterations_to_show || 7)
	var steps_between_iterations = parseInt(params.steps_between_iterations || 2)

	var wave_colour_patterns = shuffle_wave_colour_patterns()

	// clear animations and sprites in case some are already running
	grout.clear_animation()
	grout.delete_sprites()

	// make wave sprites and give them random characteristics
	for (var i = 0; i < number_of_waves; i++) {

		// create sprite for wave
		var wave_sprite = grout.sprite(
			'wave_' + i, {
				'width': GROUT_WIDTH,
				'height': GROUT_HEIGHT,
				'tile_width': tile_size,
				'tile_height': tile_size
			}
		)

		// use wave sprite's state to give unique characteristics
		wave_sprite.state = {
			'wavelength': Math.floor(Math.random() * 16) + 2,
			'step': 0,
			'amplitude': Math.floor(Math.random() * (wave_sprite.height / 2)),
			'colour_pattern': wave_colour_patterns[i % wave_colour_patterns.length]
		}

		// animate by different intervals to make things more interesting
		var animation_interval = (i + 1) * 30

		// activate animation channel for wave sprite
		grout.animate(animation_interval, function() {

			// we use the channel name to determine which sprite
			// to update
			var wave_sprite = this.sprites[this.current_queue]

			// clear sprite pixels
			wave_sprite.clear()

			// plot a number of steps of the wave in different colours
			for (
				var i = 0;
				i < (number_of_iterations_to_show * steps_between_iterations);
				i += steps_between_iterations
			) {
				// replace "*"s in colour pattern with other values to give colour shades
				var colour = wave_sprite.state['colour_pattern'].replace(/\*/g, i.toString(16))
				wave_plot(wave_sprite, wave_sprite.state['step'] - i, colour)
			}

			wave_sprite.state['step']++;

		}, 'wave_' + i) // the channel is given same name as wave sprite
	}
}