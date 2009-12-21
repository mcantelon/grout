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

	// create pixel map for collision plane
	var collision_plane = grout.map('collision_plane', {
		'width':  background.width,
		'height': background.height
	});

	// create sprite for ship
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
	grout.animate(100, function () {

		move_bankers(this);

		move_bullets(this);
	});
}

// restart logic
function restart(background, ship, grout) {

	background.clear();

	ship.offset_x = 15;
	ship.offset_y = 20;

	new_attack_wave(grout);

	grout.draw_all();
}

function new_attack_wave(grout) {

	grout.state['bankers'] = [];

	for (var i = 0; i < 5; i++) {

		banker_id = 'banker_' + (i + 1);

		banker = grout.sprite(banker_id);
		grout.state['bankers'].push(banker_id);

		banker.pixels = grout.make_sprite(" \
			..*.. \
			***** \
			*.*.* \
			*.*.* \
		");

		banker.width = 5;
		banker.height = 5;

		banker.offset_x = (1 + (i * 6));
		banker.offset_y = 2 + ((i % 2) * 2);

		banker.state['direction'] = 'right';
		banker.state['move_logic'] = function (banker, background) {
			//if (banker.state['direction'] == 'right') {
			//}
		}
	}
}

function move_bankers(grout) {

/*
for each banker,
  let banker know wave direction
  let banker move according to the wave direction
  after movement of banks see if direction should be changed
*/

	var banker_id;

	for (var i = 0; i < grout.state['bankers'].length; i++) {

		banker_id = grout.state['bankers'][i];
		banker = grout.sprite(banker_id);

		if (banker.state['move_logic'] != undefined) {
			banker.state['move_logic'](banker, grout);
		}
	}

	/*
	for (var i = 0; i < 5; i++) {

		banker = grout.sprite('banker_' + (i + 1));

		alert(banker.goat);
		alert(banker.offset_x);
	}
	*/

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

		bullet.pixels = grout.make_sprite("*");
		bullet.offset_x = ship.offset_x + 2;
		bullet.offset_y = ship.offset_y;

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

	var collision_plane = grout.map('collision_plane');

	// we simply bullet/banker collision detection by stamping all bullets on a map
	collision_plane.clear();

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

		// see if we've hit any bankers
		var banker_id;

		for (var i = 0; i < grout.state['bankers'].length; i++) {

			banker_id = grout.state['bankers'][i];
			banker = grout.sprite(banker_id);

			if (banker.detect_collision_with_map(collision_plane)) {

				delete grout.sprites[banker_id];
				//banker.state['move_logic'](banker, grout);
			}
		}

		//bullets = collision_plane.count_pixels(0, 0, collision_plane.width, collision_plane.height);

		//console.log(bullets);
	}
}
