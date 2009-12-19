function blood_funnel() {

	var pixel_width     = 10;
	var pixel_map_width = 25;
	var canvas_width    = pixel_width * pixel_map_width;

	// create new grout
	var grout = new Grout({
		'width':  canvas_width * 2,
		'height': canvas_width
	});

	// create pixel map for background
	var background = grout.map('background', {
		'width':  pixel_map_width * 2,
		'height': pixel_map_width
	});
	background.clear();

	// create pixel map for game pieces
	var ship = grout.sprite('ship');

	ship.pixels = grout.make_sprite(" \
		..*.. \
		.***. \
		**.** \
	");

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
		if (key == 32) {

			// get next bullet ID
			if (grout.state['bullet_id'] == undefined) {

				grout.state['bullet_id'] = 1
			}
			else {

				grout.state['bullet_id']++;
			}

			// create new bullet sprite corresponding to ID
			var bullet_id = 'bullet_' + grout.state['bullet_id']
			var bullet = grout.sprite(bullet_id);
			bullet.pixels = grout.make_sprite("*");
			bullet.offset_x = ship.offset_x + 2;
			bullet.offset_y = ship.offset_y - 1;

			// add bullet ID to list 
			if (grout.state['bullets_in_motion'] == undefined) {

				grout.state['bullets_in_motion'] = [];
			}

			// note that bullet is in motion
			grout.state['bullets_in_motion'].push(bullet_id);
		}

		// handle movement via arrow keys
		for (keycode in keycode_response) {

			response = keycode_response[keycode];

			// execute appropriate piece method to check space between piece and map edge
			margin_space = ship[response['margin_check_function']](background);

			// check to see if piece, when shifted, would collide with the background
			will_collide_with_background = ship.check_if_move_will_collide_with_pixels(
				response['shift_x'],
				response['shift_y'],
				background.pixels
			);

			// create new bullet
			if (keycode == 32) {

				/*
				alert('meh');

				// get next bullet ID
				if (grout.state['bullet_id'] == undefined) {

					grout.state['bullet_id'] = 1
				}
				else {

					grout.state['bullet_id']++;
				}

				alert('AAAABID:' + grout.state['bullet_id']);

				// create new bullet sprite corresponding to ID
				var bullet_id = 'bullet_' + grout.state['bullet_id']
				var bullet = grout.sprite(bullet_id);
				bullet.pixels = grout.make_sprite('*');

				alert('bb');

				// add bullet ID to list 
				if (grout.state['bullets_in_motion'] == undefined) {

					grout.state['bullets_in_motion'] = [];
				}

				alert('cc');

				alert('dddd ' + bullet_id);
				// note that bullet is in motion
				grout.state['bullets_in_motion'].push(bullet_id);
				*/
			}

			// shift piece if key is pressed and there is space to shift it to
			if (key == keycode
			  && margin_space != 0
			  && !will_collide_with_background
			) {
				ship.move(response['shift_x'], response['shift_y']);
			}
		}
	});

	restart(background, ship, grout);

	// enter main loop
	grout.animate(100, function () {

		var bullet;

		if (this.state['bullets_in_motion'] != undefined) {

			for (var i = 0; i < this.state['bullets_in_motion'].length; i++) {

				var bullet_id = this.state['bullets_in_motion'][i];

				if (bullet_id != null) {

					bullet = this.sprites[bullet_id];
					
					if (bullet != undefined) {

						if (bullet.offset_y > 0) {
							bullet.move(0, -1);
						}
						else {
							this.state['bullets_in_motion'][i] = null;
						}
					}
				}
			}
		}
	});
}

// restart logic
function restart(background, ship, grout) {

	background.clear();

	ship.offset_x = 15;
	ship.offset_y = 20;

	grout.draw_all();
}