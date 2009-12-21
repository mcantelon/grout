function groutris() {

	var pixel_width     = 10;
	var pixel_map_width = 10;
	var canvas_width    = pixel_width * pixel_map_width;

	// create new grout
	var grout = new Grout({
		'width':  canvas_width,
		'height': canvas_width * 2
	});

	// grout's state array is a place for ad-hoc data
	grout.state['turns'] = 0;

	// create pixel map for background
	var background = grout.map('background', {
		'width':  pixel_map_width,
		'height': pixel_map_width * 2
	});

	// create pixel map for game pieces
	var piece = grout.sprite('piece');

	// set up keyboard handling
	grout.keypress(function(key) {

		var margin_space;
		var response;
		var will_collide_with_background;

		var keycode_response = {

			// left arrow key moves piece left
			37: {
				'shift_x': -1,
				'shift_y': 0,
				'margin_check_function': 'margin_left'
			},

			// right arrow key moves piece right
			39: {
				'shift_x': 1,
				'shift_y': 0,
				'margin_check_function': 'margin_right'
			},

			// down arrow key moves piece down	
			40: {
				'shift_x': 0,
				'shift_y': 1,
				'margin_check_function': 'margin_bottom'
			}
		}

		// up arrow key triggers rotation
		if (key == 38) {

			// create throwaway piece to test for validity of rotate
			var temp_piece = new Sprite();

			temp_piece.width    = piece.width;
			temp_piece.height   = piece.height;
			temp_piece.offset_x = piece.offset_x;
			temp_piece.offset_y = piece.offset_y;
			temp_piece.pixels   = piece.pixels;

			// rotate throwaway piece
			temp_piece.rotate();

			// if throwaway piece isn't now sticking out of background
			// and isn't colliding with anything in the background then
			// copy its pixels to our real piece
			if (!temp_piece.outside_of_map(background)
			  && !temp_piece.detect_collision_with_map(background)) {
				piece.pixels = temp_piece.pixels;
			}
			return;
		}

		// handle movement via arrow keys
		for (keycode in keycode_response) {

			response = keycode_response[keycode];

			// execute appropriate piece method to check space between piece and map edge
			margin_space = piece[response['margin_check_function']](background);

			// check to see if piece, when shifted, would collide with the background
			will_collide_with_background = piece.check_if_move_will_collide_with_pixels(
				response['shift_x'],
				response['shift_y'],
				background.pixels
			)

			// shift piece if key is pressed and there is space to shift it to
			if (key == keycode
			  && margin_space != 0
			  && !will_collide_with_background
			) {
				piece.move(response['shift_x'], response['shift_y']);
			}
		}
	});

	// set up game
	restart(background, piece, grout);

	// enter main loop
	grout.animate(100, function () {

		var full_rows;

		this.state['turns']++;

		if (this.state['turns'] % 10 == 0) {

			piece = this.sprites['piece'];

			if (piece.margin_bottom(background) != 0
			  && !piece.check_if_move_will_collide_with_pixels(0, 1, background.pixels)) {
				piece.move(0, 1);
			}
			else {

				// add piece to background
				background.stamp(piece.pixels, piece.offset_x, piece.offset_y);

				// if piece that has just dropped is at top of map, end game
				if (piece.margin_top(background) == 0) {

					alert('Game over');

					restart(background, piece);
				}
				else {

					shift_full_rows_down(background);

					reset_piece(piece, grout);
				}
			}
		}
	});
}

// restart logic
function restart(background, piece, grout) {

	background.clear();

	reset_piece(piece, grout);

	grout.draw_all();
}

// create new piece logic
function reset_piece(piece, grout) {

	// move piece to the top center
	piece.offset_x = 4;
	piece.offset_y = 0;

	// To-do: make it start flush with the top and properly centered

	// generate random piece
	new_shape = generate_piece(grout);

	// size piece according to shape size, assuming shape is square
	piece.width  = new_shape.length;
	piece.height = new_shape.length;

	// set pixels in piece to new shape
	piece.overwrite(new_shape);
}

// game piece generation logic
function generate_piece(grout) {

	// define color pallette for pieces
	var color_codes = {
		'C': 'cyan',
		'B': 'blue',
		'O': 'orange',
		'Y': 'yellow',
		'G': 'green',
		'P': 'purple',
		'R': 'red'
	}

	// we define a square of pixels so rotation is easy
	var pieces = [

		" \
    	.... \
    	B... \
    	BBBB \
    	.... \
  		",

		" \
    	.... \
    	...O \
    	OOOO \
    	.... \
  			",

		" \
		.... \
		CCCC \
		.... \
		.... \
  		",

		" \
		YY \
		YY \
  		",

		" \
		... \
		RR. \
		.RR \
  		",

		" \
		... \
		.GG \
		GG. \
  		",

		" \
		.P. \
		PPP \
		... \
  		"
  	];

	// pick a random piece
	var random_piece = Math.floor(Math.random() * pieces.length);

	// return the piece as a matrix of pixels
	return grout.make_sprite(pieces[random_piece], color_codes);
}

// find full rows
function find_full_rows(background) {

	var empty_pixel_found;
	var full_rows = [];

	for(var y = 0; y < background.height; y++) {

		empty_pixel_found = false;

		for (var x =0; x < background.width; x++) {

			if (!background.pixels[x][y]) {
				empty_pixel_found = true;
			}
		}

		if (!empty_pixel_found) {
			full_rows.push(y);
		}
	}

	return full_rows;
}

function shift_full_rows_down(background) {
		
	full_rows = find_full_rows(background);

	for (var i = 0; i < full_rows.length; i++) {

		// copy up to the row before the full row
		pixels_above_full_row = background.copy_pixel_row_range(0, full_rows[i] - 1);

		// clear up to the full row
		background.clear_range(0, 0, background.width - 1, full_rows[i]);

		// stamp the copy onto the background, shifted down 1 pixel
		background.stamp(pixels_above_full_row, 0, 1);
	}
}