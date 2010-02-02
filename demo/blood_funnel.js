var TILE_WIDTH  = 4;
var TILE_HEIGHT = 4;
var MAX_PLAYER_BULLETS = 2;

function blood_funnel() {

	var tile_map_width = 75;
	var canvas_width = TILE_WIDTH * tile_map_width;

	// create new grout
	var grout = new Grout({
		'width':  canvas_width * 2,
		'height': canvas_width,
		'key_repeat_interval': 25
	});

	// make the space bar and pause keys repeat slower
	grout.key_repeat_interval_for[32] = 500;
	grout.key_repeat_interval_for[80] = 500;

    // create pixel map for background pattern
	var background_pattern = grout.map(
	    'background_pattern', {
	    	'width': tile_map_width / 2,
	    	'height': tile_map_width / 4,
	        'tile_width': TILE_WIDTH * 4,
	        'tile_height': TILE_HEIGHT * 4
	    }
	);

	// create pixel map for background
	var background = grout.map('background', {
		'width':  tile_map_width * 2,
		'height': tile_map_width,
		'tile_width': TILE_WIDTH,
		'tile_height': TILE_HEIGHT
	});
	background.clear();

	// create pixel map for collision plane
	var collision_plane = grout.map('collision_plane', {
		'width':  background.width,
		'height': background.height,
		'tile_width': TILE_WIDTH,
		'tile_height': TILE_HEIGHT
	});

	// create pixel map for collision plane
	var collision_plane_2 = grout.map('collision_plane_2', {
		'width':  background.width,
		'height': background.height,
		'tile_width': TILE_WIDTH,
		'tile_height': TILE_HEIGHT
	});

	// create pixel map for collision plane
	var collision_plane_3 = grout.map('collision_plane_3', {
		'width':  background.width,
		'height': background.height,
		'tile_width': TILE_WIDTH,
		'tile_height': TILE_HEIGHT
	});

	// create sprite for ship
	var ship = grout.sprite('ship');

	ship.make_sprite(" \
		..*.. \
		.***. \
		**.** \
	");

	ship.tile_width  = TILE_WIDTH;
	ship.tile_height = TILE_HEIGHT;

	// create group for paused state
	var paused = grout.sprite('paused', {
		'group': 'paused',
		'tile_width': TILE_WIDTH,
		'tile_height': TILE_HEIGHT
	});
	paused.offset_x = 3;
	paused.offset_y = 5;

	paused.make_sprite(" \
		**...*..*.*..**.***.**. \
		*.*.*.*.*.*.*...*...*.* \
		**..***.*.*..*..**..*.* \
		*...*.*.*.*...*.*...*.* \
		*...*.*..*..**..***.**. \
	");

	// show start screen
	start_screen(grout);
}

// restart logic
function restart(grout) {

	grout.maps['background'].clear();

    //add_money_to_background(grout.maps['background'], 4);

	grout.sprites['ship'].offset_x = 30;
	grout.sprites['ship'].offset_y = grout.maps['background'].height - 11;

    grout.state['wave'] = 0;
	new_attack_wave(grout);

	grout.state['turns'] = 0;
	grout.state['ship_hit'] = false;
	grout.state['banker_dead'] = []

	clean_up_bullets(grout);

	grout.draw_all();
}

function add_money_to_background(background, rows) {
	
    var x_adjust = 0;

	background.clear_range(0, background.height - (rows * 2), background.width, background.height);

    for (var y = background.height - (rows * 2); y < background.height; y++) {

        if (y % 2) {
            for (var x = 0; x < background.width; x++) {
            	if ((x + x_adjust) % 3) {
      	            background.pixels[x][y] = 'green';
            	}
            }
        }

        x_adjust++;
        if (x_adjust == 3) {
        	x_adjust = 0;
        }
    }
}

function clean_up_bullets(grout) {

	clean_up_bullet_array(grout, grout.state['bullets_in_motion']);
	clean_up_bullet_array(grout, grout.state['banker_bullets_in_motion']);
}

function clean_up_bullet_array(grout, bullet_array) {

	if (bullet_array != undefined) {

		for (var i = 0; i < bullet_array.length; i++) {
			sprite_id = bullet_array[i];
			grout.delete_sprite(sprite_id);
			//delete grout.sprites[sprite_id];
		}

		bullet_array = [];
	}
}

function banker_color_map() {

	return {
		'H': banker_hair_colors[banker_hair],
		'B': '#330',
		'F': banker_skin_colors[banker_skin],
		'K': 'black',
		'N': 'navy'
	};
}

function new_banker(grout, banker_id) {

	banker = grout.sprite(banker_id);

	banker_skin_colors = ['#F2EBC9', '#D9B166', '#A66B38'];
    banker_skin = Math.floor(Math.random() * 3);

    banker_hair_colors = ['#000000', '#271F2E'];
    banker_hair = Math.floor(Math.random() * 2);

	add_banker_frames(banker);
	banker.set_frame(0);

	banker.width = 10;
	banker.height = 11;
	banker.tile_width  = TILE_WIDTH;
	banker.tile_height = TILE_HEIGHT;

	return banker;
}

function add_banker_frames(banker) {

	banker.add_frame_from_string(" \
		...HHH.... \
		...FFF.... \
		...FFF.... \
		..NNKNN... \
		.N.NKN.N.. \
		N..NNN..F. \
		F..KKK..BB \
		..NN.NN.BB \
		..N...N.BB \
		..K...N... \
		......K... \
	", banker_color_map());

	banker.add_frame_from_string(" \
		...HHH.... \
		...FFF.... \
		...FFF.... \
		..NNKNN... \
		.N.NKN.N.. \
		F..NNN..N. \
		...KKK..F. \
		..NN.NN.BB \
		..N...N.BB \
		..N...K.BB \
		..K....... \
	", banker_color_map());

	banker.add_frame_from_string(" \
		F..HHH..F. \
		N..FFF..N. \
		.N.FFF.N.. \
		..NNKNN... \
		...NKN.... \
		...NNN.... \
		...KKK.... \
		..NN.NN... \
		..N...N.BB \
		..N...N.BB \
		..K...K.BB \
	", banker_color_map());
}

function generate_buildings_background_pattern(grout, map_name, width_min, width_max) {

  var rel_x = 0;
  var building_width = 0;
  var possible_height;
  var building_height;
  var start_y;
  var pixel_color;

  grout.maps[map_name].clear();

  for (possible_width = width_min; possible_width < width_max; possible_width = possible_width + 2) {

    for (var x = 0; x < Math.floor(grout.maps[map_name].width); x++) {

      // 
      if (rel_x >= building_width) {

        rel_x = 0;
        building_width = Math.floor(Math.random() * possible_width) + 1;

        possible_height = Math.floor(grout.maps[map_name].height) - 1;
        building_height = Math.floor(Math.random() * possible_height);
        start_y = Math.floor(grout.maps[map_name].height) - building_height;
      }

      rel_x++;

      for (var y = start_y; y < possible_height; y++) {

        // closer buildings are the lighter grey they are
        pixel_color = '#' + ((possible_width + 2) * 111111);

        // logic for window placement and yellow coloring
        if ((y > start_y) && (y % 2 == 0) && (rel_x % 2 == 0) && (rel_x > 1) && (rel_x < building_width)) {
        	pixel_color = '#' + ((possible_width + 4) * 1111) + '00';
        }

        grout.maps[map_name].pixels[x][y] = pixel_color;
      }
    }
  }
}

function new_attack_wave(grout) {

	var banker_number = 1;
    var banker_rows;
    var banker_columns = 7
    var money_rows;

    grout.state['wave']++;

    generate_buildings_background_pattern(grout, 'background_pattern', 1, 4);

    /*
    grout.maps['background_pattern'].clear();

    grout.maps['background_pattern'].cycle_through_pixels(function(that, x, y, params) {

        if (Math.floor(Math.random() * 2) == 1) {

            that.pixels[x][y] = '#777777';
        }
    });
    */

    grout.state['banker_pixel_movement'] = 1;
    grout.state['banker_bullet_fire_probability'] = 5;
	grout.state['banker_dive_probability'] = 100;

    // determine number of banker rows
    if (grout.state['wave'] >= 4) {
    	banker_rows = 5;
    }
    else if (grout.state['wave'] >= 2) {
    	banker_rows = 4;
    }
    else {
    	banker_rows = 3;
    }

    // determine number of turns until banker bullet moves
    if (grout.state['wave'] >= 2) {

        grout.state['banker_bullet_movement_turns'] = 1;
    }
    else {
       	grout.state['banker_bullet_movement_turns'] = 2;
    }

    // add rows of money
    if (grout.state['wave'] > 2) {

        money_rows = 3;
    }
    else {
        money_rows = 4;
    }


    add_money_to_background(grout.maps['background'], money_rows);

	grout.state['bankers'] = [];
	grout.state['banker_direction'] = 'right';
	grout.state['banker_dying'] = []

	for (var row = 1; row <= banker_rows; row++) {

		for (var i = 0; i < banker_columns; i++) {

			banker_id = 'banker_' + banker_number;

			// note that a new banker exists
			grout.state['bankers'].push(banker_id);

			// set banker pixels
			banker = new_banker(grout, banker_id);

			// distribute bankers evenly horizintal, but stagger vertically
			banker.offset_x = (1 + (i * 11));
			banker.offset_y = (12 * row) + ((i % 2) * 2) - 11;

			// set banker movement logic
			banker.state['move_logic'] = function (banker, background) {

				var direction = banker.state['direction'];
				var move_x;

				// allow individual bankers to have different directions
				// in case we want to implement at some point
				if (direction == undefined) {

					direction = banker.parent.state['banker_direction'];
				}

				move_x = (direction == 'right')
				  ? banker.parent.state['banker_pixel_movement']
				  : 0 - banker.parent.state['banker_pixel_movement'];

				banker.offset_x += move_x;

                if (banker.state['diving'] != undefined
                  && banker.state['diving']) {
                  	if (banker.offset_y > banker.parent.maps['background'].height) {
                  		banker.parent.delete_sprite(banker.state['banker_id']);
                  	}
                  	else {
                  	    banker.offset_y += 1;
                  	}
                }
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

	var current_frame;

	if (grout.state['banker_bullets_in_motion'] == undefined) {

		grout.state['banker_bullets_in_motion'] = [];
	}

	if (grout.state['banker_bullet_id'] == undefined) {

		grout.state['banker_bullet_id'] = 1;
	}

	// trigger move logic for each banker, noting
	// position and which are still alive
	for (var i = 0; i < grout.state['bankers'].length; i++) {

		banker_id = grout.state['bankers'][i];
		banker = grout.sprite(banker_id);

		if (banker.state['move_logic'] != undefined) {

			if (grout.state['banker_dying'].indexOf(banker_id) != -1) {

				grout.delete_sprite(banker_id);
			}
			else {

				if (grout.state['banker_dying'].indexOf(banker_id) == -1) {
					banker.next_frame(1);
				}

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
	}

	// possibly fire bullet from one of the lowest bankers
	for (var x in lowest_at_x_position) {

		banker_id = lowest_at_x_position[x];

        // diving bankers can get destroyed during their movement loop
        if (grout.sprites[banker_id] != undefined) {

			var bullet_shot = Math.floor(Math.random() * grout.state['banker_bullet_fire_probability']) == 1;

			if (bullet_shot) {

				bullet_id = 'banker_bullet_' + grout.state['banker_bullet_id'];

				var diving = Math.floor(Math.random() * grout.state['banker_dive_probability']) == 1;

				if (diving) {
					// need banker to know it's own ID so it can destroy itself at end of dive
					grout.sprites[banker_id].state['banker_id'] = banker_id;
					grout.sprites[banker_id].state['diving'] = true;
				}

				make_bullet_sprite(
					grout,
					bullet_id,
					grout.sprites[banker_id].offset_x + 8,
					grout.sprites[banker_id].offset_y + 9,
					'R \
					 R',
					{'R': 'red'}
				);

				grout.state['banker_bullets_in_motion'].push(bullet_id);
				grout.state['banker_bullet_id']++;
			}
		}
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

	// only let player have a certain number of bullets in motion
	if (grout.state['bullets_in_motion'] == undefined
	  || grout.state['bullets_in_motion'].length < MAX_PLAYER_BULLETS) {

		// get next bullet ID
		grout.state['bullet_id'] = (grout.state['bullet_id'] == undefined)
		  ? 1
		  : grout.state['bullet_id'] + 1;

		// create new bullet sprite corresponding to ID
		bullet_id = 'bullet_' + grout.state['bullet_id']

		make_bullet_sprite(
			grout,
			bullet_id,
			ship.offset_x + 2,
			ship.offset_y,
			'B',
			{'B': 'black'}
		);

		// add bullet ID to list 
		if (grout.state['bullets_in_motion'] == undefined) {

			grout.state['bullets_in_motion'] = [];
		}

		// note that bullet is in motion
		grout.state['bullets_in_motion'].push(bullet_id);
	}
}

function make_bullet_sprite(grout, bullet_id, x, y, definition, color_map) {

	bullet = grout.sprite(bullet_id);

	bullet.make_sprite(definition, color_map);

	bullet.offset_x = x;
	bullet.offset_y = y;
	bullet.tile_width  = TILE_WIDTH;
	bullet.tile_height = TILE_HEIGHT;

	return bullet;
}

function move_banker_bullets(grout) {

	var bullet_id;
	var bullets_still_in_motion = [];
	var bullet_movement_result;

    if (grout.state['banker_bullets_in_motion'] == undefined) {
        grout.state['banker_bullets_in_motion'] = [];
    }

    // see if any bullets have hit bottom
    for (var i = 0; i < grout.state['banker_bullets_in_motion'].length; i++) {

        bullet_id = grout.state['banker_bullets_in_motion'][i];

        if (grout.sprites[bullet_id] != undefined) {
            bullet = grout.sprites[bullet_id];

            if (bullet.offset_y == (grout.maps['background'].height - 1)) {
                // REGISTER A HIT
            }
        }
    }

	bullet_movement_result = move_bullet_sprites(
		grout,
		grout.state['banker_bullets_in_motion'],
		1,
		grout.map('background').height,
		grout.maps['collision_plane_3']
	);

	grout.maps['collision_plane_3'] = bullet_movement_result['collision_plane_map'];
	bullets_still_in_motion = bullet_movement_result['bullets_still_in_motion'];

	// if a banker's bullet has hit the ship, note this
	if (grout.sprites['ship'].detect_collision_with_map(grout.maps['collision_plane_3'])) {
        grout.state['ship_hit'] = true;
	}

    // if any banker's bullet has hit the pile of money, go through each
    // bullet and, if it has hit the pile, knock a chunk out of the pile
	if (grout.maps['background'].detect_collision_with_pixels(grout.maps['collision_plane_3'].pixels)) {

        for (var i = 0; i < bullets_still_in_motion.length; i++) {

            bullet_id = bullets_still_in_motion[i];

            bullet = grout.sprites[bullet_id];

            if (bullet.detect_collision_with_map(grout.maps['background'])) {

                // ACTUALLY, IF BULLETS STILL IN MOTION DIFFERENT THAN IN MOTION
                // THEN BULLET HAS GONE THROUGH MONEY

                // erase money pixel
                grout.maps['background'].pixels[bullet.offset_x][bullet.offset_y + 1] = false;
                grout.delete_sprite(bullet_id);
                // remove from bullets still in motion
            }
        }
    }

	grout.state['banker_bullets_in_motion'] = bullets_still_in_motion;

	return false;
}

function move_bullets(grout) {

	var bullet;
	var bullets_still_in_motion;
	var bullet_id;

	var collision_plane   = grout.map('collision_plane');
	var collision_plane_2 = grout.map('collision_plane_2');

	var bullet_movement_result;

	// we stamp bullets on one map to simply collision detection, and bankers on another map
	collision_plane.clear();
	collision_plane_2.clear();

	if (grout.state['bullets_in_motion'] != undefined) {

		bullet_movement_result = move_bullet_sprites(grout, grout.state['bullets_in_motion'], -1, 0, collision_plane);

		collision_plane = bullet_movement_result['collision_plane_map'];
		grout.state['bullets_in_motion'] = bullet_movement_result['bullets_still_in_motion'];

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
				grout.state['banker_dying'].push(banker_id);
				banker.set_frame(2);

				//grout.delete_sprite(banker_id);
				//delete grout.sprites[banker_id];
			}
		}

		if (grout.state['bullets_in_motion'] != undefined) {

			// see if any bullets have hit bankers
			for (var i = 0; i < grout.state['bullets_in_motion'].length; i++) {

				bullet_id = grout.state['bullets_in_motion'][i];
				bullet = grout.sprites[bullet_id];

				if (bullet.detect_collision_with_map(collision_plane_2)) {

					grout.delete_sprite(bullet_id);
					//delete grout.sprites[bullet_id];
				}
			}
		}
	}
}

function move_bullet_sprites(grout, bullets_in_motion, y_adjustment, max_y, collision_plane_map) {

	var bullets_still_in_motion = [];

	collision_plane_map.clear();

	if (bullets_in_motion != undefined) {

		for (var i = 0; i < bullets_in_motion.length; i++) {

			bullet_id = bullets_in_motion[i];

			bullet = grout.sprites[bullet_id];

			// if bullet hasn't reached top of screen move it, otherwise delete it	
			if (bullet != undefined) {

				if ((max_y > 0 && bullet.offset_y < grout.map('background').height)
				  || (max_y == 0 && bullet.offset_y > 0)) {

					bullet.move(0, y_adjustment);

					collision_plane_map.stamp(bullet.pixels, bullet.offset_x, bullet.offset_y);

					bullets_still_in_motion.push(bullet_id);
				}
				else {

					grout.delete_sprite(bullet_id);
					//delete grout.sprites[bullet_id];
				}
			}
		}
	}

	return {
		'collision_plane_map':     collision_plane_map,
		'bullets_still_in_motion': bullets_still_in_motion
	}
}

// start screen has a blue button, which leads to another screen, and a red button
function start_screen(grout) {

	var tile_map_width = 75;

    // create pixel map for background pattern
	var background_pattern = grout.map(
	    'start_screen_background_pattern', {
	    	'group': 'start',
	    	'width': tile_map_width,
	    	'height': tile_map_width / 2,
	        'tile_width': TILE_WIDTH * 2,
	        'tile_height': TILE_HEIGHT * 2
	    }
	);

    generate_buildings_background_pattern(grout, 'start_screen_background_pattern', 3, 6);

    for (var i = 0; i < 6; i++) {

        //background_pattern.stamp_text('blood funnel', 5 + i, 5 + i, 50, '#' + ((6 - i) * 111111));
    }
    background_pattern.stamp_text('blood funnel', 5, 5, 50, '#444444');
    background_pattern.stamp_text('blood funnel', 4, 4, 50, '#ff0000');

    /* below four lines repetitive */
	banker_skin_colors = ['#F2EBC9', '#D9B166', '#A66B38'];
    banker_skin = Math.floor(Math.random() * 3);

    banker_hair_colors = ['#000000', '#271F2E'];
    banker_hair = Math.floor(Math.random() * 2);

    var banker = grout.sprite(
        'banker', {
        	'group': 'start',
        	'tile_width': TILE_WIDTH * 4,
        	'tile_height': TILE_HEIGHT * 4,
            'offset_x': 25,
            'offset_y': 7
        }
    );

	banker.make_sprite(" \
		...HHH.... \
		...FFF.... \
		...FFF.... \
		..NNKNN... \
		.N.NKN.N.. \
		N..NNN..N. \
		F..KKK..F. \
		..NN.NN.BB \
		..N...N.BB \
		..N...N.BB \
		..K...K... \
	", banker_color_map());

    //grout.maps['start_screen_background_pattern'].shift(0, 10);

	var start_button = grout.sprite(
	    'blue_button', {
	        'group': 'start',
	        'tile_width': TILE_WIDTH,
	        'tile_height': TILE_HEIGHT
	    }
	);

	var start_button_colors = {'B': 'blue', 'G': 'grey'};

	start_button.make_sprite(" \
		*********************** \
		*.....................* \
		*..**.***..*..**..***.* \
		*.*....*..*.*.*.*..*..* \
		*..*...*..***.**...*..* \
		*...*..*..*.*.*.*..*..* \
		*.**...*..*.*.*.*..*..* \
		*.....................* \
		*********************** \
	", start_button_colors);

	start_button.offset_x = 7;
	start_button.offset_y = 58;

	// sprite click logic receives x, y in tiles
	start_button.click(function(x, y) {

		if (this.inside_margins(x, y)) {

			main_screen(this.parent);
		}
	});

	var help_button = grout.sprite(
	    'red_button', {
	        'group': 'start',
	        'tile_width': TILE_WIDTH,
	        'tile_height': TILE_HEIGHT   
	    }
	);

	var help_button_colors = {'R': 'red', 'G': 'grey'};

	help_button.make_sprite(" \
		******************* \
		*.................* \
		*.*.*.***.*...**..* \
		*.*.*.*...*...*.*.* \
		*.***.**..*...**..* \
		*.*.*.*...*...*...* \
		*.*.*.***.***.*...* \
		*.................* \
		******************* \
	", help_button_colors);

	help_button.offset_x = 34;
	help_button.offset_y = 58;

	// sprite click logic receives x, y in tiles
	help_button.click(function(x, y) {

		if (this.inside_margins(x, y)) {

			help_screen(this.parent);
		}
	});

	// shouldn't need to have this... :[
	// global click logic receives x, y in pixels
	grout.click(function (x, y) {
	});

	// negate keyboard handling
	grout.keypress(function(key) {
	});

	grout.draw_all('start');
}

// start screen has a blue button, which leads to another screen, and a red button
function help_screen(grout) {

	var tile_map_width = 75;

    // create pixel map for background pattern
	var background_pattern = grout.map(
	    'help_screen_background_pattern', {
	    	'group': 'help',
	    	'width': tile_map_width,
	    	'height': tile_map_width / 2,
	        'tile_width': TILE_WIDTH * 2,
	        'tile_height': TILE_HEIGHT * 2
	    }
	);

    generate_buildings_background_pattern(grout, 'help_screen_background_pattern', 3, 6);

    var help_text_map = grout.map(
        'help_screen_text', {
        	 'group': 'help',
        	 'width': tile_map_width * 2,
        	 'height': tile_map_width,
        	 'tile_width': TILE_WIDTH,
        	 'tile_height': TILE_HEIGHT
        }
    );

    help_text = 'it is the year 2000. an evil cabal of bankers known as goldman sacks has infiltrated the state, enacting laws that enable them to steal from the populice.';

    help_text_map.stamp_text(help_text, 5, 5, 140, 'black');

	var help_button = grout.sprite(
	    'help_button', {
	        'group': 'help',
	        'tile_width': TILE_WIDTH,
	        'tile_height': TILE_HEIGHT
	    }
	);

	var help_button_colors = {'B': 'blue', 'G': 'grey'};

	help_button.make_sprite(" \
		******************* \
		*.................* \
		*.**...*...**.*.*.* \
		*.*.*.*.*.*...*.*.* \
		*.**..***.*...**..* \
		*.*.*.*.*.*...*.*.* \
		*.**..*.*..**.*.*.* \
		*.................* \
		******************* \
	", help_button_colors);

	help_button.offset_x = 7;
	help_button.offset_y = 58;

	// sprite click logic receives x, y in tiles
	help_button.click(function(x, y) {

		if (this.inside_margins(x, y)) {

			start_screen(this.parent);
		}
	});

	var next_button = grout.sprite(
	    'next_button', {
	        'group': 'help',
	        'tile_width': TILE_WIDTH,
	        'tile_height': TILE_HEIGHT
	    }
	);

	var next_button_colors = {'R': 'red', 'G': 'grey'};

	next_button.make_sprite(" \
		******************** \
		*..................* \
		*.*..*.***.*.*.***.* \
		*.**.*.*...*.*..*..* \
		*.*.**.**...*...*..* \
		*.*..*.*...*.*..*..* \
		*.*..*.***.*.*..*..* \
		*..................* \
		******************** \
	", next_button_colors);

	next_button.offset_x = 34;
	next_button.offset_y = 58;

	// sprite click logic receives x, y in tiles
	next_button.click(function(x, y) {

		if (this.inside_margins(x, y)) {

			help_screen_2(this.parent);
		}
	});

	// shouldn't need to have this... :[
	// global click logic receives x, y in pixels
	grout.click(function (x, y) {
	});

	// negate keyboard handling
	grout.keypress(function(key) {
	});

	grout.draw_all('help');
}

// start screen has a blue button, which leads to another screen, and a red button
function help_screen_2(grout) {

	var tile_map_width = 75;

    // create pixel map for background pattern
	var background_pattern = grout.map(
	    'help_screen_background_pattern_2', {
	    	'group': 'help_2',
	    	'width': tile_map_width,
	    	'height': tile_map_width / 2,
	        'tile_width': TILE_WIDTH * 2,
	        'tile_height': TILE_HEIGHT * 2
	    }
	);

    generate_buildings_background_pattern(grout, 'help_screen_background_pattern_2', 3, 6);

    var help_text_map = grout.map(
        'help_screen_2_text', {
        	 'group': 'help_2',
        	 'width': tile_map_width * 2,
        	 'height': tile_map_width,
        	 'tile_width': TILE_WIDTH,
        	 'tile_height': TILE_HEIGHT
        }
    );

    help_text = 'while pretending they strive to strengthen the economy, they instead shoot their blood funnels into your cash. expose and destroy them!';

    help_text_map.stamp_text(help_text, 5, 5, 140, 'black');

	var help_button = grout.sprite(
	    'help_button_2', {
	        'group': 'help_2',
	        'tile_width': TILE_WIDTH,
	        'tile_height': TILE_HEIGHT
	    }
	);

	var help_button_colors = {'B': 'blue', 'G': 'grey'};

	help_button.make_sprite(" \
		******************* \
		*.................* \
		*.**...*...**.*.*.* \
		*.*.*.*.*.*...*.*.* \
		*.**..***.*...**..* \
		*.*.*.*.*.*...*.*.* \
		*.**..*.*..**.*.*.* \
		*.................* \
		******************* \
	", help_button_colors);

	help_button.offset_x = 7;
	help_button.offset_y = 58;

	// sprite click logic receives x, y in tiles
	help_button.click(function(x, y) {

		if (this.inside_margins(x, y)) {

			start_screen(this.parent);
		}
	});

	var next_button = grout.sprite(
	    'next_button_2', {
	        'group': 'help_2',
	        'tile_width': TILE_WIDTH,
	        'tile_height': TILE_HEIGHT
	    }
	);

	var next_button_colors = {'R': 'red', 'G': 'grey'};

	next_button.make_sprite(" \
		******************** \
		*..................* \
		*.*..*.***.*.*.***.* \
		*.**.*.*...*.*..*..* \
		*.*.**.**...*...*..* \
		*.*..*.*...*.*..*..* \
		*.*..*.***.*.*..*..* \
		*..................* \
		******************** \
	", next_button_colors);

	next_button.offset_x = 34;
	next_button.offset_y = 58;

	// sprite click logic receives x, y in tiles
	next_button.click(function(x, y) {

		if (this.inside_margins(x, y)) {

			help_screen_2(this.parent);
		}
	});

	// shouldn't need to have this... :[
	// global click logic receives x, y in pixels
	grout.click(function (x, y) {
	});

	// negate keyboard handling
	grout.keypress(function(key) {
	});

	grout.draw_all('help_2');
}

function main_screen(grout) {

	var background = grout.maps['background'];
	var ship = grout.sprites['ship'];

	// set up keyboard handling
	grout.keypress(function(key) {

		var margin_space;
		var response;

		// pause/unpause
		if (key == 80) {

			grout.stopped = !grout.stopped;

			if (grout.stopped) {

				grout.draw_all('paused');
			}

			return;
		}

		if (!grout.stopped) {

			// space bar triggers shooting
			if (key == 32) {

				shoot_bullet(grout, ship);
				return;
			}

			// specified movement criteria
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
		}
	});

	restart(grout);

	// start animation loop if it isn't paused
	if (!grout.stopped) {

// for level advances, bring down animate delay 2 and every two levels maybe
// lower pile of money (can just lower state point by one and it'll do same thing)

// need to have some kind of logic for when player loses a life

// should see how things work when things are higher res, more bankers

		grout.animate(5, function () {

			this.state['turns']++;

			if (this.state['turns'] % 10 == 0) {

				move_bankers(this);
			}

            // if banker bullets allowed to move this turn, move them
			if (this.state['turns'] % this.state['banker_bullet_movement_turns'] == 0) {

				move_banker_bullets(this);
			}

			if (grout.state['ship_hit']) {
				alert('Game over');
				this.stop();
				start_screen(this);
			}
			else {

				move_bullets(this);
			}
		});
	}
	else {

		// restart animation
		grout.start();
	}
}