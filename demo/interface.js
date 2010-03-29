function interface() {

	var tile_width     = 10;
	var width_in_tiles = 11;
	var canvas_width   = tile_width * width_in_tiles;

	var grout = new Grout({
		'width':  canvas_width,
		'height': canvas_width
	});

	// show start screen
	start_screen(grout);

	// start screen has a blue button, which leads to another screen, and a red button
	function start_screen(grout) {

		var blue_button = grout.sprite('blue_button', {'group': 'start'});
		var blue_button_colors = {'B': 'blue', 'G': 'grey'};

		blue_button.make_sprite(" \
			BBBB \
			BGGB \
			BBBB \
		", blue_button_colors);

		blue_button.offset_x = 1;
		blue_button.offset_y = 1;

		// sprite click_inside logic receives clicks within margin
		blue_button.click_inside(function(grout) {

			alert('You clicked the blue button!');
			another_screen(grout);
		});

		var red_button = grout.sprite('red_button', {'group': 'start'});
		var red_button_colors = {'R': 'red', 'G': 'grey'};

		red_button.make_sprite(" \
			RRRR \
			RGGR \
			RRRR \
		", red_button_colors);

		red_button.offset_x = 6;
		red_button.offset_y = 1;

		// sprite click logic receives x, y in tiles
		red_button.click(function(x, y) {

			if (this.inside_margins(x, y)) {
				alert('You clicked the red button!');
			}
		});

		// global click logic receives x, y in pixels
		grout.click(function (x, y) {

			// global click gets real pixel coordinates
			alert('You clicked x=' + x + ', y=' + y);
		});

		// set up keyboard handling
		grout.keypress(function(key) {

			alert('You pressed key ' + key);
		});

		grout.draw_all('start');
	}

	// another screen has a yellow button which leads to the start screen
	function another_screen(grout) {

		var yellow_button = grout.sprite('yellow_button', {'group': 'another'});
		var yellow_button_colors = {'Y': 'yellow', 'G': 'grey'};

		yellow_button.make_sprite(" \
			YYYYYY \
			YGGGGY \
			YYYYYY \
		", yellow_button_colors);

		yellow_button.offset_x = 1;
		yellow_button.offset_y = 1;

		// sprite click logic receives x, y in tiles
		yellow_button.click(function(x, y) {

			if (this.inside_margins(x, y)) {

				alert('You clicked the yellow button!');

				start_screen(grout);
			}
		});

		// global click logic receives x, y in pixels
		grout.click(function (x, y) {

			// global click gets real pixel coordinates
			alert('This is a different global click handler!');
		});

		// set up keyboard handling
		grout.keypress(function(key) {

			alert('This is a different key handler!');
		});

		grout.draw_all('another');
	}
}