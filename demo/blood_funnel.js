var TILE_WIDTH  = 4
var TILE_HEIGHT = 4
var MAX_PLAYER_BULLETS = 2
var SCORE_MAX_WIDTH = 50
var MAP_SIZE_IN_TILES = 75

function standard_map(grout, map_name) {
	return grout.map(
		map_name,
		{
			'width':  MAP_SIZE_IN_TILES * 2,
			'height': MAP_SIZE_IN_TILES,
			'tile_width': TILE_WIDTH,
			'tile_height': TILE_HEIGHT
		}
	)
}

function chunky_interlude_map(grout, map_name) {

	var map = grout.map(
		map_name,
		{
			'group': map_name,
			'width': MAP_SIZE_IN_TILES / 2,
			'height': MAP_SIZE_IN_TILES / 4,
			'tile_width': TILE_WIDTH * 4,
			'tile_height': TILE_HEIGHT * 4
	})

	generate_simple_background_pattern(map)

	return map
}

function less_chunky_interlude_map(grout, map_name) {

	var map = less_chunky_map(grout, map_name, map_name)

	generate_simple_background_pattern(map)

	return map
}

function less_chunky_map(grout, map_name, group) {

	return grout.map(map_name, {
		'group': group,
		'width': MAP_SIZE_IN_TILES,
		'height': MAP_SIZE_IN_TILES / 2,
		'tile_width': TILE_WIDTH * 2,
		'tile_height': TILE_HEIGHT * 2
	})
}

function create_ship_related_sprites(grout) {

	// create sprite for ship
	var ship = grout.sprite(
		'ship', {
			'tile_width': TILE_WIDTH,
			'tile_height': TILE_HEIGHT
		}
	)
	.make_sprite(" \
		..*.. \
		.***. \
		**.** \
	")

    grout.sprite('lives', {
        'width': (3 * (ship.width + 1)),
        'height': ship.height,
        'tile_width': TILE_WIDTH,
        'tile_height': TILE_HEIGHT,
        'offset_x': (MAP_SIZE_IN_TILES * 2) - ((ship.width + 1) * 3),
        'offset_y': MAP_SIZE_IN_TILES - ship.height - 1
    })

    grout.sprite('score', {
        'width': MAP_SIZE_IN_TILES / 2,
        'height': 10,
        'tile_width': TILE_WIDTH,
        'tile_height': TILE_HEIGHT,
        'offset_x': 2,
        'offset_y': MAP_SIZE_IN_TILES - 6
    }).stamp_text('0', 0, 0, SCORE_MAX_WIDTH, '#444444')
}

function blood_funnel() {

	var canvas_width = TILE_WIDTH * MAP_SIZE_IN_TILES

	var grout = new Grout({
		'width':  canvas_width * 2,
		'height': canvas_width,
		'key_repeat_interval': 25,
		'render_mode': 'slow'
	})

	// add local sound effects
	var effects = {
		'shoot': 'demo/sound/blood_funnel_tweet.ogg',
		'death': 'demo/sound/bloodfunnel_death.ogg',
		'level': 'demo/sound/bloodfunnel_level.ogg'
	}

	for (effect in effects) {
		grout.add_sound(effect, [{
			'src': effects[effect],
			'type': 'audio/ogg'
		}])
	}

	// specify songs that should stream remotely
	grout
	.add_sound('intro_soundtrack', [{
		'src': 'http://mikecantelon.com/downloads/bloodfunnel/bloodfunnel_intro.ogg',
		'type': 'audio/ogg'
	}], 'loop="loop"')
	.add_sound('game_soundtrack', [{
		'src': 'http://mikecantelon.com/downloads/bloodfunnel/bloodfunnel_soundtrack.ogg',
		'type': 'audio/ogg'
	}], 'loop="loop"')

	// take note of original background color as we may mess with it
	grout.state.background_color = grout.canvas.style['background-color']

    // create pixel map for background pattern
	background_pattern = grout.map(
	    'background_pattern',
	    {
	    	'width': MAP_SIZE_IN_TILES / 2,
	    	'height': MAP_SIZE_IN_TILES / 4,
	        'tile_width': TILE_WIDTH * 4,
	        'tile_height': TILE_HEIGHT * 4
	    }
	)

	// create pixel map for background
	var background = standard_map(grout, 'background').clear()

	// create maps for collision detection
	for(var i = 1; i <= 3; i++) {
		standard_map(grout, 'collision_plane_' + i)
	}

	create_ship_related_sprites(grout)

	// create group for paused state
	grout.sprite('paused', {
		'group': 'paused',
		'width': 50,
		'height': 50,
		'tile_width': TILE_WIDTH,
		'tile_height': TILE_HEIGHT
	}).stamp_text('paused', 3, 3, 50)

	// set up chunky interludes
	chunky_interlude_map(grout, 'get_ready').stamp_text('get ready!', 3, 4, 50)
	chunky_interlude_map(grout, 'game_over').stamp_text('game over', 7, 4, 50)

	// set less chunky interludes
	less_chunky_interlude_map(grout, 'new_level')
	less_chunky_interlude_map(grout, 'infiltrated').stamp_text('infiltrated!', 3, 6, 50)

	// show start screen
	start_screen(grout)
}

// restart logic
function restart(grout) {

	grout.maps.background.clear()

	grout.sprites.ship.offset_x = 30
	grout.sprites.ship.offset_y = grout.maps.background.height - 11

	grout.state.score = 0
    grout.state.wave = 0
	grout.state.turns = 0
	grout.state.ship_hit = false
	grout.state.banker_dead = []
    grout.state.lives = 3

	clean_up_bankers(grout)
	clean_up_bullets(grout)
    update_lives(grout)

	grout.stop_sound('intro_soundtrack')
	grout.play_sound('game_soundtrack')

	new_attack_wave(grout)
}

function update_lives(grout) {

  grout.sprites.lives.clear()

  // stamp ship images onto life indicator sprite
  if (grout.state.lives > 0) {

    for (var i = 1; i <= grout.state.lives; i++) {

      grout.sprites.lives.stamp(
        grout.sprites.ship.pixels,
        grout.sprites.lives.width - (i * (grout.sprites.ship.width + 1)),
        0
      )
 	}
  }
}

function add_money_to_background(background, rows) {
	
    var x_adjust = 0

	background.clear_range(0, background.height - (rows * 2), background.width, background.height)

    for (var y = background.height - (rows * 2); y < background.height; y++) {

        if (y % 2) {
            for (var x = 0; x < background.width; x++) {
            	if ((x + x_adjust) % 3) {
      	            background.pixels[x][y] = '#008000'
            	}
            }
        }

        x_adjust++
        if (x_adjust == 3) {
        	x_adjust = 0
        }
    }
}

function clean_up_bankers(grout, diving_only) {

	var banker_id

	if (grout.state.bankers != undefined) {

		for (var i = 0; i < grout.state.bankers.length; i++) {

			banker_id = grout.state.bankers[i]

			if (diving_only) {

				banker = grout.sprites[banker_id]

				if (banker != undefined
				  && banker.state.diving != undefined
				  && banker.state.diving
				) {

					grout.delete_sprite(banker_id)
				}
			}
			else {

				grout.delete_sprite(banker_id)
			}
		}
	}
}

function clean_up_bullets(grout) {

	clean_up_bullet_array(grout, grout.state['bullets_in_motion'])
	clean_up_bullet_array(grout, grout.state['banker_bullets_in_motion'])
}

function clean_up_bullet_array(grout, bullet_array) {

	if (bullet_array != undefined) {

		for (var i = 0; i < bullet_array.length; i++) {
			sprite_id = bullet_array[i]
			grout.delete_sprite(sprite_id)
		}

		bullet_array = []
	}
}

function banker_color_map(banker_skin_color, banker_hair_color) {

	return {
		'H': banker_hair_color,
		'B': '#222200',
		'F': banker_skin_color,
		'K': '#000000',
		'N': '#000080'
	}
}

function banker_random_skin_color() {

	var banker_skin_colors = ['#323021', '#D9B166', '#A66B38']
    var banker_skin = Math.floor(Math.random() * 3)

    return banker_skin_colors[banker_skin]
}

function banker_random_hair_color() {
	
    var banker_hair_colors = ['#000000', '#271F2E']
    var banker_hair = Math.floor(Math.random() * 2)

    return banker_hair_colors[banker_hair]
}

function new_banker(grout, banker_id) {

	banker = grout.sprite(banker_id)

	banker.tile_width  = TILE_WIDTH
	banker.tile_height = TILE_HEIGHT // need to do something about this requirement
	add_banker_frames(banker, banker_random_skin_color(), banker_random_hair_color())
	banker.set_frame(0)

	banker.width = 10
	banker.height = 11

	return banker
}

function add_banker_frames(banker, banker_skin_color, banker_hair_color) {

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
	", banker_color_map(
			banker_skin_color,
			banker_hair_color
		)
	)
	.add_frame_from_string(" \
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
	", banker_color_map(
			banker_skin_color,
			banker_hair_color
		)
	)
	.add_frame_from_string(" \
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
	", banker_color_map(
			banker_skin_color,
			banker_hair_color
		)
	)
}

function generate_buildings_background_pattern(map, width_min, width_max) {

  var rel_x = 0
  var building_width = 0
  var possible_height
  var building_height
  var start_y
  var pixel_color

  map.clear()

  for (possible_width = width_min; possible_width < width_max; possible_width = possible_width + 2) {

    for (var x = 0; x < Math.floor(map.width); x++) {

      // if starting a building or completing a building, randomize factors
      if (rel_x >= building_width) {

        rel_x = 0
        building_width = Math.floor(Math.random() * possible_width) + 1

        possible_height = Math.floor(map.height) - 1
        building_height = Math.floor(Math.random() * possible_height)
        start_y = Math.floor(map.height) - building_height
      }

      rel_x++

      // draw a stripe of the building using current factors
      for (var y = start_y; y < possible_height; y++) {

        // closer buildings are the lighter grey they are
        pixel_color = '#' + ((possible_width + 2) * 111111)

        // logic for window placement and yellow coloring
        if ((y > start_y) && (y % 2 == 0) && (rel_x % 2 == 0) && (rel_x > 1) && (rel_x < building_width)) {
        	pixel_color = '#' + ((possible_width + 4) * 1111) + '00'
        }

        map.pixels[x][y] = pixel_color
      }
    }
  }
}

function generate_simple_background_pattern(map) {

	map.clear()

	map.cycle_through_pixels(function(that, x, y, params) {
		
		if (Math.floor(Math.random() * 2) == 1) {
			that.pixels[x][y] = '#777777'
		}
	})

	return map
}

function set_attack_wave_properties(grout, wave) {

	var change_state_to = 0
	var changed_state

	// 0 is default, others override if they exist
	var level_attributes = {
		0: {
			'state':
			{
				'banker_pixel_movement': 1,
				'banker_bullet_fire_probability': 6,
				'banker_dive_probability': 100,
				'turns_until_banker_move': 10,
				'banker_bullet_movement_turns': 3
			},
			'other':
			{
				'banker_rows': 2,
				'banker_columns': 4,
				'money_rows': 3
			}
		},
		2: {
			'state':
			{
				'banker_pixel_movement': 1,
				'banker_bullet_fire_probability': 5,
				'banker_dive_probability': 100,
				'turns_until_banker_move': 8,
				'banker_bullet_movement_turns': 1
			},
			'other':
			{
				'banker_rows': 2,
				'banker_columns': 8,
				'money_rows': 1
			}
		},
		3: {
			'state':
			{
				'banker_pixel_movement': 1,
				'banker_bullet_fire_probability': 5,
				'banker_dive_probability': 100,
				'turns_until_banker_move': 6,
				'banker_bullet_movement_turns': 1
			},
			'other':
			{
				'banker_rows': 3,
				'banker_columns': 8,
				'money_rows': 1
			}
		},
		4: {
			'state':
			{
				'banker_pixel_movement': 2,
				'banker_bullet_fire_probability': 5,
				'banker_dive_probability': 80,
				'turns_until_banker_move': 6,
				'banker_bullet_movement_turns': 1
			},
			'other':
			{
				'banker_rows': 4,
				'banker_columns': 8,
				'money_rows': 1
			}
		}
	}

	if (level_attributes[wave] != undefined
	  && level_attributes[wave].state != undefined
	) {

		change_state_to = wave
	}

	for(changed_state in level_attributes[change_state_to].state) {
		grout.state[changed_state] = level_attributes[change_state_to].state[changed_state]
		//alert('change state ' + changed_state + ' to ' + level_attributes[change_state_to].state[changed_state]);
	}

	return level_attributes[change_state_to].other
}

function new_attack_wave(grout) {

    var banker_rows, banker_columns, money_rows, level_settings

    grout.state['wave']++

    generate_buildings_background_pattern(grout.maps['background_pattern'], 1, 4)

	level_settings = set_attack_wave_properties(grout, grout.state['wave'])
	banker_rows = level_settings.banker_rows
	banker_columns = level_settings.banker_columns
	money_rows = level_settings.money_rows
	// does money row differentiations, etc., work?

	grout.state['banker_deaths_until_pixel_movement_increase'] = 3

	/*
    // determine number of banker rows
    if (grout.state['wave'] >= 4) {
    	banker_rows = 5;
    }
    else if (grout.state['wave'] >= 2) {
    	banker_rows = 4;
    }
    else {
    	banker_rows = 3;
banker_columns = 3;
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
	*/

	clean_up_bullets(grout)
    add_money_to_background(grout.maps['background'], money_rows)
    generate_bankers(grout, banker_rows, banker_columns)
}

function generate_bankers(grout, banker_rows, banker_columns) {

	var banker_number = 1

	grout.state['bankers'] = []
	grout.state['banker_direction'] = 'right'
	grout.state['banker_dying'] = []

	for (var row = 1; row <= banker_rows; row++) {

		for (var i = 0; i < banker_columns; i++) {

			banker_id = 'banker_' + banker_number

			// note that a new banker exists
			grout.state['bankers'].push(banker_id)

			// set banker pixels
			banker = new_banker(grout, banker_id)

			// distribute bankers evenly horizintal, but stagger vertically
			banker.offset_x = (1 + (i * 11))
			banker.offset_y = (12 * row) + ((i % 2) * 2) - 11

			// set banker movement logic
			banker.state['move_logic'] = function (banker, background) {

				var direction = banker.state['direction']
				var move_x

				// allow individual bankers to have different directions
				// in case we want to implement at some point
				if (direction == undefined) {

					direction = banker.parent.state['banker_direction']
				}

				move_x = (direction == 'right')
				  ? banker.parent.state['banker_pixel_movement']
				  : 0 - banker.parent.state['banker_pixel_movement']

				banker.offset_x += move_x

                if (banker.state['diving'] != undefined
                  && banker.state['diving']) {
                  	if (banker.offset_y > banker.parent.maps['background'].height) {

                  		banker.parent.delete_sprite(banker.state['banker_id'])
                  		infiltrated_interlude(banker.parent)
                  	}
                  	else {
                  	    banker.offset_y += 1
                  	}
                }
			}

			banker_number++
		}
	}
}

function add_to_score(grout, amount) {

	grout.state.score += amount

	grout.sprites.score.clear().stamp_text(grout.state.score + '', 0, 0, SCORE_MAX_WIDTH, '#444444')
}

function move_bankers(grout) {

	var banker_id, drop, current_frame
	var live_bankers = 0

	var leftmost_x = 9999
	var rightmost_x = 0

	var lowest_x_position    = {}
	var lowest_at_x_position = {}

	var background = grout.map('background')
	var new_direction = ''

	if (grout.state['banker_bullets_in_motion'] == undefined) {
		grout.state['banker_bullets_in_motion'] = []
	}

	if (grout.state['banker_bullet_id'] == undefined) {
		grout.state['banker_bullet_id'] = 1
	}

	// trigger move logic for each banker, noting
	// position and which are still alive
	for (var i = 0; i < grout.state['bankers'].length; i++) {

		banker_id = grout.state['bankers'][i]
		banker = grout.sprite(banker_id)

		if (banker.state['move_logic'] != undefined) {

			if (grout.state['banker_dying'].indexOf(banker_id) != -1) {

				grout.state['banker_death_counter']++

				if (grout.state['banker_death_counter'] % grout.state['banker_deaths_until_pixel_movement_increase']) {
					if (grout.state['turns_until_banker_move'] > 5) {
						grout.state['turns_until_banker_move']--
					}
					else if(grout.state['banker_pixel_movement'] < 5) {
						grout.state['banker_pixel_movement']++
					}
				}
				grout.delete_sprite(banker_id)
				add_to_score(grout, 10)
			}
			else {

				if (grout.state['banker_dying'].indexOf(banker_id) == -1) {
					banker.next_frame(1)
				}

				banker.state['move_logic'](banker, grout)

				if (banker.offset_x < leftmost_x) {
					leftmost_x = banker.offset_x
				}

				if ((banker.offset_x + banker.width) > rightmost_x) {
					rightmost_x = banker.offset_x + banker.width
				}

				// see if banker is the lowest at this x position
				if (lowest_x_position[banker.offset_x] == undefined
				  || banker.offset_y > lowest_x_position[banker.offset_x]) {
					
					lowest_x_position[banker.offset_x]    = banker.offset_y
					lowest_at_x_position[banker.offset_x] = banker_id
				}

				live_bankers++
			}
		}
	}

	// possibly fire bullet from one of the lowest bankers
	for (var x in lowest_at_x_position) {

		banker_id = lowest_at_x_position[x]

        // diving bankers can get destroyed during their movement loop
        if (grout.sprites[banker_id] != undefined) {
			banker_chance_to_shoot_bullet(grout, banker_id)
		}
	}

	// change direction of bankers if we near edge of the background
	if (rightmost_x > (background.width - (grout.state['banker_pixel_movement'] + 1))) {
		new_direction = 'left'
	} else if (leftmost_x < (grout.state['banker_pixel_movement'] + 1)) {
		new_direction = 'right'
	}

	// if we've changed direction, drop bankers down a bit
	if (new_direction != '') {
		bankers_move_vertically(grout, 1)
		grout.state['banker_direction'] = new_direction
	}

	// if all bankers are dead, set up new attack wave
	if (!live_bankers) {
		new_level_interlude(grout)
	}
}

function bankers_move_vertically(grout, y_offset) {

	var banker_id, banker

	for (var i = 0; i < grout.state['bankers'].length; i++) {

		banker_id = grout.state['bankers'][i]
		banker = grout.sprite(banker_id)

		banker.offset_y++
	}
}

function banker_chance_to_shoot_bullet(grout, banker_id) {

	var bullet_id, diving
	var bullet_shot = Math.floor(Math.random() * grout.state['banker_bullet_fire_probability']) == 1

	if (bullet_shot) {

		bullet_id = 'banker_bullet_' + grout.state['banker_bullet_id']

		diving = Math.floor(Math.random() * grout.state['banker_dive_probability']) == 1

		if (diving) {
			// need banker to know it's own ID so it can destroy itself at end of dive
			grout.sprites[banker_id].state['banker_id'] = banker_id
			grout.sprites[banker_id].state['diving'] = true
		}

		make_bullet_sprite(
			grout,
			bullet_id,
			grout.sprites[banker_id].offset_x + 8,
			grout.sprites[banker_id].offset_y + 9,
			'R \
			 R',
			{'R': '#ff0000'}
		)

		grout.state['banker_bullets_in_motion'].push(bullet_id)
		grout.state['banker_bullet_id']++
	}
}

function shoot_bullet(grout, ship) {

	var bullet_id
	var bullet

	// only let player have a certain number of bullets in motion
	if (grout.state['bullets_in_motion'] == undefined
	  || grout.state['bullets_in_motion'].length < MAX_PLAYER_BULLETS) {

		grout.play_sound('shoot')

		// get next bullet ID
		grout.state['bullet_id'] = (grout.state['bullet_id'] == undefined)
		  ? 1
		  : grout.state['bullet_id'] + 1

		// create new bullet sprite corresponding to ID
		bullet_id = 'bullet_' + grout.state['bullet_id']

		make_bullet_sprite(
			grout,
			bullet_id,
			ship.offset_x + 2,
			ship.offset_y,
			'B',
			{'B': [0, 0, 0]}
		)

		// add bullet ID to list 
		if (grout.state['bullets_in_motion'] == undefined) {

			grout.state['bullets_in_motion'] = []
		}

		// note that bullet is in motion
		grout.state['bullets_in_motion'].push(bullet_id)
	}
}

function make_bullet_sprite(grout, bullet_id, x, y, definition, color_map) {

	bullet = grout.sprite(bullet_id)

	bullet.make_sprite(definition, color_map)

	bullet.offset_x = x
	bullet.offset_y = y
	bullet.tile_width  = TILE_WIDTH
	bullet.tile_height = TILE_HEIGHT

	return bullet
}

function move_banker_bullets(grout) {

	var bullet_id
	var bullets_still_in_motion = []
	var bullet_movement_result

    if (grout.state['banker_bullets_in_motion'] == undefined) {
        grout.state['banker_bullets_in_motion'] = []
    }

    // see if any bullets have hit bottom
    for (var i = 0; i < grout.state['banker_bullets_in_motion'].length; i++) {

        bullet_id = grout.state['banker_bullets_in_motion'][i]

        if (grout.sprites[bullet_id] != undefined) {
            bullet = grout.sprites[bullet_id]

            if (bullet.offset_y == (grout.maps['background'].height - 1)) {
            	background_flash(grout)
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
	)

	grout.maps['collision_plane_3'] = bullet_movement_result['collision_plane_map']
	bullets_still_in_motion = bullet_movement_result['bullets_still_in_motion']

	// if a banker's bullet has hit the ship, note this
	if (grout.sprites['ship'].detect_collision_with_map(grout.maps['collision_plane_3'])) {
        grout.state['ship_hit'] = true
	}

    // if any banker's bullet has hit the pile of money, go through each
    // bullet and, if it has hit the pile, knock a chunk out of the pile
	if (grout.maps['background'].detect_collision_with_pixels(grout.maps['collision_plane_3'].pixels)) {

        for (var i = 0; i < bullets_still_in_motion.length; i++) {

            bullet_id = bullets_still_in_motion[i]

            bullet = grout.sprites[bullet_id]

            if (bullet.detect_collision_with_map(grout.maps['background'])) {

                // ACTUALLY, IF BULLETS STILL IN MOTION DIFFERENT THAN IN MOTION
                // THEN BULLET HAS GONE THROUGH MONEY

                // erase money pixel
                grout.maps['background'].pixels[bullet.offset_x][bullet.offset_y + 1] = false
                grout.delete_sprite(bullet_id)
                // remove from bullets still in motion
            }
        }
    }

	grout.state['banker_bullets_in_motion'] = bullets_still_in_motion

	return false
}

function move_player_bullets(grout) {

	var bullet
	var bullets_still_in_motion
	var bullet_id

	var collision_plane   = grout.map('collision_plane_1')
	var collision_plane_2 = grout.map('collision_plane_2')

	var bullet_movement_result

	// we stamp bullets on one map to simply collision detection, and bankers on another map
	collision_plane.clear()
	collision_plane_2.clear()

	if (grout.state['bullets_in_motion'] != undefined) {

		bullet_movement_result = move_bullet_sprites(grout, grout.state['bullets_in_motion'], -1, 0, collision_plane)

		collision_plane = bullet_movement_result['collision_plane_map']
		grout.state['bullets_in_motion'] = bullet_movement_result['bullets_still_in_motion']

		// see if any bankers have been hit
		var banker_id

		for (var i = 0; i < grout.state['bankers'].length; i++) {

			banker_id = grout.state['bankers'][i]
			banker = grout.sprite(banker_id)

			if (banker.detect_collision_with_map(collision_plane)) {

				// make note that this banker has collided and put onto new collision plane
				// so we can delete any bullets that hit it
				collision_plane_2.stamp(banker.pixels, banker.offset_x, banker.offset_y)

				// instead of just deleting them we should add them to a "dying" queue
				// or, better yet, change their state to "dying"
				grout.state['banker_dying'].push(banker_id)
				banker.set_frame(2)
			}
		}

		if (grout.state['bullets_in_motion'] != undefined) {

			// see if any bullets have hit bankers
			for (var i = 0; i < grout.state['bullets_in_motion'].length; i++) {

				bullet_id = grout.state['bullets_in_motion'][i]
				bullet = grout.sprites[bullet_id]

				if (bullet.detect_collision_with_map(collision_plane_2)) {

					grout.delete_sprite(bullet_id)
				}
			}
		}
	}
}

function move_bullet_sprites(grout, bullets_in_motion, y_adjustment, max_y, collision_plane_map) {

	var bullets_still_in_motion = []

	collision_plane_map.clear()

	if (bullets_in_motion != undefined) {

		for (var i = 0; i < bullets_in_motion.length; i++) {

			bullet_id = bullets_in_motion[i]

			bullet = grout.sprites[bullet_id]

			// if bullet hasn't reached top of screen move it, otherwise delete it	
			if (bullet != undefined) {

				if ((max_y > 0 && bullet.offset_y < grout.map('background').height)
				  || (max_y == 0 && bullet.offset_y > 0)) {

					bullet.move(0, y_adjustment)

					collision_plane_map.stamp(bullet.pixels, bullet.offset_x, bullet.offset_y)

					bullets_still_in_motion.push(bullet_id)
				}
				else {

					grout.delete_sprite(bullet_id)
				}
			}
		}
	}

	return {
		'collision_plane_map':     collision_plane_map,
		'bullets_still_in_motion': bullets_still_in_motion
	}
}

function main_screen(grout) {

	var background = grout.maps['background']
	var ship = grout.sprites['ship']

	// make the space bar and pause keys repeat slower
	grout.key_repeat_interval_for[32] = 500
	grout.key_repeat_interval_for[80] = 500

	// specify keyboard handling logic
	grout.keypress(function(key) {

		var margin_space
		var response

		// pause/unpause handling
		if (key == 80) {

			grout.stopped = !grout.stopped

			if (grout.stopped) {

				grout.pause_sound('game_soundtrack')
				grout.draw_all('paused')
			}
			else {
				
				grout.play_sound('game_soundtrack')
			}

			return
		}

		// game input handling if unpaused
		if (!grout.stopped) {

			// space bar triggers shooting
			if (key == 32) {

				shoot_bullet(grout, ship)
				return
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

				response = keycode_response[keycode]

				// execute appropriate piece method to check space between piece and map edge
				margin_space = ship[response['margin_check_function']](background)

				// shift piece if key is pressed and there is space to shift it to
				if (key == keycode
				  && margin_space != 0
				) {
					ship.move(response['shift_x'], response['shift_y'])
				}
			}
		}
	})

	restart(grout)

	// start animation loop if it isn't paused --- WHAT HAPPEN IF THIS GONE?
	if (!grout.stopped) {

		grout.animate(25, function () {

			if (!this.stopped) {

				this.state['turns']++

				if (this.state['turns'] % grout.state['turns_until_banker_move'] == 0) {

					move_bankers(this)
				}

        	    // if banker bullets allowed to move this turn, move them
				if (this.state['turns'] % this.state['banker_bullet_movement_turns'] == 0) {

					move_banker_bullets(this)
				}

				if (grout.state['ship_hit']) {

					ship_hit(grout)
				}

				move_player_bullets(this)
			}
		})
	}
	else {

		// restart animation --- EH?
		grout.start()
	}

	// let player know game is starting
	get_ready_interlude(grout)
}

function kill_player(grout) {
	
	clean_up_bullets(grout)

	grout.state['lives']--
	update_lives(grout)

	clean_up_bullets(grout)
	clean_up_bankers(grout, true)

	grout.state['ship_hit'] = false

	if (grout.state['lives'] > 0) {

		get_ready_interlude(grout)
	}
	else {

		game_over_interlude(grout)
	}
}

function ship_hit(grout) {

	grout.sequence('death', [
		["this.play_sound('death')"],
		["this.sprites['ship'].tile_width = 6"],
		["this.draw_all()", 100],
		["this.sprites['ship'].tile_width = TILE_WIDTH"],
		["this.draw_all()", 100],
		["this.sprites['ship'].tile_width = 6"],
		["this.draw_all()", 100],
		["this.sprites['ship'].tile_width = TILE_WIDTH"],
		["this.draw_all()", 100],
		["this.sprites['ship'].tile_width = 6"],
		["this.draw_all()", 100],
		["this.sprites['ship'].tile_width = TILE_WIDTH"],
		["this.draw_all()", 100],
		["kill_player(this)"]
	])
}

function get_ready_interlude(grout) {

	grout.sequence('get_ready', [
		["this.stop()"],
		["this.draw_all('get_ready')", 3000],
		["this.draw_all()"],
		["this.start()"]
	])
}

function infiltrated_interlude(grout) {

	grout.sequence('infiltrated', [
		["this.stop()"],
		["this.draw_all('infiltrated')", 3000],
		["this.draw_all()"],
		["kill_player(this)"]
	])
}

function game_over_interlude(grout) {

	grout.sequence('game_over', [
		["this.stop()"],
		["this.draw_all('game_over')", 3000],
		["start_screen(this)"]
	])
}

function new_level_interlude(grout) {

	var bonus = grout.maps.background.count_pixels(0, 0, grout.maps.background.width, grout.maps.background.height)
	add_to_score(grout, bonus)

	grout.maps['new_level'].clear()
	generate_simple_background_pattern(grout.maps['new_level'])

	grout.maps['new_level']
	  .stamp_text('level ' + (grout.state['wave'] + 1), 12, 12, 50)
	  .stamp_text('bonus:' + bonus, 12, 22, 80)

	grout.sequence('new_level', [
		["this.stop()"],
		["this.play_sound('level')"],
		["this.draw_all('new_level')", 3000],
		["new_attack_wave(this)"],
		["this.start()"]
	])
}

function background_flash(grout) {

	grout.sequence('background_flash', [
		["this.canvas.style['background-color'] = 'red'", 25],
		["this.canvas.style['background-color'] = this.state['background_color']"]
	])
}
