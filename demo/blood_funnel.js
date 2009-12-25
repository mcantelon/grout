function blood_funnel() {

	var pixel_width     = 3;
	var pixel_height    = 3;
	var pixel_map_width = 50;
	var canvas_width    = pixel_width * pixel_map_width;

	// create new grout
	var grout = new Grout({
		'width':  canvas_width * 2,
		'height': canvas_width
	});

	grout.state['pixel_width']  = pixel_width;
	grout.state['pixel_height'] = pixel_height;

	// create pixel map for background
	var background = grout.map('background', {
		'width':  pixel_map_width * 2,
		'height': pixel_map_width,
		'pixel_width': pixel_width,
		'pixel_height': pixel_height
	});
	background.clear();

	// create pixel map for collision plane
	var collision_plane = grout.map('collision_plane', {
		'width':  background.width,
		'height': background.height,
		'pixel_width': pixel_width,
		'pixel_height': pixel_height
	});

	// create pixel map for collision plane
	var collision_plane_2 = grout.map('collision_plane_2', {
		'width':  background.width,
		'height': background.height,
		'pixel_width': pixel_width,
		'pixel_height': pixel_height
	});

	// create sprite for ship
	var ship = grout.sprite('ship');

	ship.make_sprite(" \
		..*.. \
		.***. \
		**.** \
	");

	ship.pixel_width  = pixel_width;
	ship.pixel_height = pixel_height;

	// set up keyboard handling
	grout.keypress(function(key) {

		var margin_space;
		var response;

		var keycode_response = {

			// left arrow key moves ship left
			37: {
				'shift_x': -1,
				'shift_y': 0,
				'margin_check_function': 'margin_left'
			},

			// right arrow key moves ship right
			39: {
				'shift_x': 1,
				'shift_y': 0,
				'margin_check_function': 'margin_right'
			}
		}

		// up arrow key triggers shooting
		if (key == 32) {

			shoot_bullet(grout, ship);
			return;
		}

		// handle movement via arrow keys
		for (keycode in keycode_response) {

			response = keycode_response[keycode];

			// execute appropriate piece method to check space between piece and map edge
			margin_space = ship[response['margin_check_function']](background);

			// shift piece if key is pressed and there is space to shift it to
			if (key == keycode
			  && margin_space != 0
			) {
				ship.move(response['shift_x'], response['shift_y']);
			}
		}
	});

	restart(background, ship, grout);

	// enter main loop
	grout.animate(25, function () {

		this.state['turns']++;

		if (this.state['turns'] % 10 == 0) {

			move_bankers(this);
		}

		move_bullets(this);
	});
}

// restart logic
function restart(background, ship, grout) {

	background.clear();

	ship.offset_x = 15;
	ship.offset_y = 40;

	new_attack_wave(grout);

	grout.state['turns'] = 0;

	grout.draw_all();
}

function new_banker(grout, banker_id) {

	banker = grout.sprite(banker_id);

	banker.make_sprite(" \
		..*.. \
		***** \
		*.*.* \
		*.*.* \
	");

	banker.width = 5;
	banker.height = 5;
	banker.pixel_width  = grout.state['pixel_width'];
	banker.pixel_height = grout.state['pixel_height'];

	return banker;
}

function new_attack_wave(grout) {

	var banker_number = 1;

	grout.state['bankers'] = [];
	grout.state['banker_direction'] = 'right';

	for (var row = 1; row <= 3; row++) {

		for (var i = 0; i < 5; i++) {

			banker_id = 'banker_' + banker_number;

			// note that a new banker exists
			grout.state['bankers'].push(banker_id);

			// set banker pixels
			banker = new_banker(grout, banker_id);

			// distribute bankers evenly horizintal, but stagger vertically
			banker.offset_x = (1 + (i * 6));
			banker.offset_y = (5 * row) + ((i % 2) * 2) - 3;

			// set banker movement logic
			banker.state['move_logic'] = function (banker, background) {

				var direction = banker.state['direction'];
				var move_x;

				// allow individual bankers to have different directions
				// in case we want to implement at some point
				if (direction == undefined) {

					direction = banker.parent.state['banker_direction'];
				}

				move_x = (direction == 'right') ? 1 : -1;

				banker.offset_x += move_x;
			}

			banker_number++;
		}
	}
}

function move_bankers(grout) {

	var banker_id;
	var live_bankers = 0;

	var leftmost_x = 9999;
	var rightmost_x = 0;

	var drop;

	var background = grout.map('background');

	var lowest_x_position    = {};
	var lowest_at_x_position = {};

	// trigger move logic for each banks, noting
	// position and which are still alive
	for (var i = 0; i < grout.state['bankers'].length; i++) {

		banker_id = grout.state['bankers'][i];
		banker = grout.sprite(banker_id);

		if (banker.state['move_logic'] != undefined) {

			banker.state['move_logic'](banker, grout);

			if (banker.offset_x < leftmost_x) {
				leftmost_x = banker.offset_x;
			}

			if ((banker.offset_x + banker.width) > rightmost_x) {
				rightmost_x = banker.offset_x + banker.width;
			}

			// see if banker is the lowest at this x position
			if (lowest_x_position[banker.offset_x] == undefined
			  || banker.offset_y > lowest_x_position[banker.offset_x]) {
					
				lowest_x_position[banker.offset_x]    = banker.offset_y;
				lowest_at_x_position[banker.offset_x] = banker_id;
			}

			live_bankers++;
		}
	}

	// possibly fire bullet from one of the lowest bankers
	for (var x in lowest_at_x_position) {
	}

	// change direction of bankers if we near
	// the edge of the background
	if (rightmost_x > (background.width - 2)) {
		drop = true;
		grout.state['banker_direction'] = 'left';
	}

	if (leftmost_x < 2) {
		drop = true;
		grout.state['banker_direction'] = 'right';
	}

	// if we've changed directions, drop bankers down
	if (drop) {

		for (var i = 0; i < grout.state['bankers'].length; i++) {

			banker_id = grout.state['bankers'][i];
			banker = grout.sprite(banker_id);

			banker.offset_y++;
		}
	}

	// if all bankers are dead, set up new attack wave
	if (!live_bankers) {
		new_attack_wave(grout);
	}
}

function shoot_bullet(grout, ship) {

	var bullet_id;
	var bullet;

	// only let player have 5 bullets in motion
	if (grout.state['bullets_in_motion'] == undefined
	  || grout.state['bullets_in_motion'].length < 5) {

		// get next bullet ID
		grout.state['bullet_id'] = (grout.state['bullet_id'] == undefined)
		  ? 1
		  : grout.state['bullet_id'] + 1;

		// create new bullet sprite corresponding to ID
		bullet_id = 'bullet_' + grout.state['bullet_id']
		bullet = grout.sprite(bullet_id);

		bullet.make_sprite("*");
		bullet.offset_x = ship.offset_x + 2;
		bullet.offset_y = ship.offset_y;
		bullet.pixel_width  = grout.state['pixel_width'];
		bullet.pixel_height = grout.state['pixel_height'];

		// add bullet ID to list 
		if (grout.state['bullets_in_motion'] == undefined) {

			grout.state['bullets_in_motion'] = [];
		}

		// note that bullet is in motion
		grout.state['bullets_in_motion'].push(bullet_id);
	}
}

function move_bullets(grout) {

	var bullet;
	var bullets_still_in_motion;
	var bullet_id;

	var collision_plane   = grout.map('collision_plane');
	var collision_plane_2 = grout.map('collision_plane_2');

	// we stamp bullets on one map to simply collision detection, and bankers on another map
	collision_plane.clear();
	collision_plane_2.clear();

	if (grout.state['bullets_in_motion'] != undefined) {

		bullets_still_in_motion = [];

		// move each bullet
		for (var i = 0; i < grout.state['bullets_in_motion'].length; i++) {

			bullet_id = grout.state['bullets_in_motion'][i];
			bullet = grout.sprites[bullet_id];

			// if bullet hasn't reached top of screen move it, otherwise delete it	
			if (bullet != undefined) {

				if (bullet.offset_y > 0) {

					bullet.move(0, -1);

					collision_plane.stamp(bullet.pixels, bullet.offset_x, bullet.offset_y);					

					bullets_still_in_motion.push(bullet_id);
				}
				else {

					delete grout.sprites[bullet_id];
				}
			}
		}

		// update list of buttets still in play
		grout.state['bullets_in_motion'] = bullets_still_in_motion;

		// see if any bankers have been hit
		var banker_id;

		for (var i = 0; i < grout.state['bankers'].length; i++) {

			banker_id = grout.state['bankers'][i];
			banker = grout.sprite(banker_id);

			if (banker.detect_collision_with_map(collision_plane)) {

				// make note that this banker has collided and put onto new collision plane
				// so we can delete any bullets that hit it
				collision_plane_2.stamp(banker.pixels, banker.offset_x, banker.offset_y);

				// instead of just deleting them we should add them to a "dying" queue
				// or, better yet, change their state to "dying"
				delete grout.sprites[banker_id];
			}
		}

		// see if any bullets have hit bankers
		for (var i = 0; i < bullets_still_in_motion.length; i++) {

			bullet_id = bullets_still_in_motion[i];
			bullet = grout.sprites[bullet_id];

			if (bullet.detect_collision_with_map(collision_plane_2)) {

				delete grout.sprites[bullet_id];
			}
		}
	}
}
