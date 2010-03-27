function help_screen_background_pattern(grout, group) {

	var background_pattern = less_chunky_map(grout, group, group)

	generate_buildings_background_pattern(grout.maps[group], 3, 6)
   
	return background_pattern
}

function start_screen(grout) {

	grout.play_sound('intro_soundtrack')
	grout.stop_sound('game_soundtrack')

	help_screen_background_pattern(grout, 'start')
		.stamp_text('blood funnel', 5, 5, 50, '#444444')
    	.stamp_text('blood funnel', 4, 4, 50, '#ff0000')

	grout.sprite(
	    'author_credit', {
	        'group': 'start',
	        'width': 120,
	        'height': 20,
	        'tile_width': TILE_WIDTH,
	        'tile_height': TILE_HEIGHT,
	        'offset_x': 8,
	        'offset_y': 35
	    }
	)
	.stamp_text('(c)2010 by mike cantelon', 1, 1, 80, '#555555')
	.stamp_text('(c)2010 by mike cantelon', 0, 0, 80, '#888888')

    grout.sprite(
        'banker', {
        	'group': 'start',
        	'tile_width': TILE_WIDTH * 4,
        	'tile_height': TILE_HEIGHT * 4,
            'offset_x': 25,
            'offset_y': 7
        }
    )
    .make_sprite(" \
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
	", banker_color_map(
			banker_random_skin_color(),
			banker_random_hair_color()
		)
	)

	create_start_screen_start_button(grout)
	create_start_screen_help_button(grout)

	grout
	.reset_input_handling()
	.draw_all('start')
}

function create_start_screen_start_button(grout) {

	var start_button = grout.sprite(
	    'blue_button', {
	        'group': 'start',
	        'tile_width': TILE_WIDTH,
	        'tile_height': TILE_HEIGHT
	    }
	)
	.make_sprite(" \
		*********************** \
		*.....................* \
		*..**.***..*..**..***.* \
		*.*....*..*.*.*.*..*..* \
		*..*...*..***.**...*..* \
		*...*..*..*.*.*.*..*..* \
		*.**...*..*.*.*.*..*..* \
		*.....................* \
		*********************** \
	")
	.click_inside(function(grout) {
		main_screen(grout)
	})

	start_button.offset_x = 7
	start_button.offset_y = 60
}

function create_start_screen_help_button(grout) {

	var help_button = grout.sprite(
	    'red_button', {
	        'group': 'start',
	        'tile_width': TILE_WIDTH,
	        'tile_height': TILE_HEIGHT   
	    }
	)
	.make_sprite(" \
		******************* \
		*.................* \
		*.*.*.***.*...**..* \
		*.*.*.*...*...*.*.* \
		*.***.**..*...**..* \
		*.*.*.*...*...*...* \
		*.*.*.***.***.*...* \
		*.................* \
		******************* \
	")
	.click_inside(function(grout) {
		help_screen(grout)
	})

	help_button.offset_x = 34
	help_button.offset_y = 60
}

function create_help_text_map(grout, group) {

    return grout.map(
        group + '_text', {
        	 'group': group,
        	 'width': MAP_SIZE_IN_TILES * 2,
        	 'height': MAP_SIZE_IN_TILES,
        	 'tile_width': TILE_WIDTH,
        	 'tile_height': TILE_HEIGHT
        }
    )
}

function create_help_back_button(grout, group, click_function) {

	var help_button = grout.sprite(
	    group + '_back_button', {
	        'group': group,
	        'tile_width': TILE_WIDTH,
	        'tile_height': TILE_HEIGHT
	    }
	)
	.make_sprite(" \
		******************* \
		*.................* \
		*.**...*...**.*.*.* \
		*.*.*.*.*.*...*.*.* \
		*.**..***.*...**..* \
		*.*.*.*.*.*...*.*.* \
		*.**..*.*..**.*.*.* \
		*.................* \
		******************* \
	")
	.click_inside(function(grout) {
		click_function(grout)
	})

	help_button.offset_x = 7
	help_button.offset_y = 60

	//return help_button
}

function create_help_next_button(grout, group, click_function) {

	var next_button = grout.sprite(
	    group + '_next_button', {
	        'group': group,
	        'tile_width': TILE_WIDTH,
	        'tile_height': TILE_HEIGHT
	    }
	)
	.make_sprite(" \
		******************** \
		*..................* \
		*.*..*.***.*.*.***.* \
		*.**.*.*...*.*..*..* \
		*.*.**.**...*...*..* \
		*.*..*.*...*.*..*..* \
		*.*..*.***.*.*..*..* \
		*..................* \
		******************** \
	")
	.click_inside(function(grout) {
		click_function(grout)
	})

	next_button.offset_x = 30
	next_button.offset_y = 60

	//return next_button
}

function help_screen(grout) {

	var background_pattern = help_screen_background_pattern(grout, 'help')

    help_text = "\"The world's most powerful investment bank is a great "
      + "vampire squid wrapped around the face of humanity, relentlessly "
      + "jamming its blood funnel into anything that smells like money.\""

	create_help_text_map(grout, 'help')
      .stamp_text(help_text, 5, 3, 140, 'black')
      .stamp_text('-Matt Taibbi', 108, 55, 70, 'black')

	create_help_back_button(grout, 'help', start_screen)
	create_help_next_button(grout, 'help', help_screen_2)

	grout
	.reset_input_handling()
	.draw_all('help')
}

function help_screen_2(grout) {

	var background_pattern = help_screen_background_pattern(grout, 'help_2')

    help_text = "it is the year 2000. an evil cabal of bankers known as "
      + "goldman sacks is infiltrating world governments, enacting laws "
      + "that enable them to conduct massive swindles and loot the public "
      + "coffers."

	create_help_text_map(grout, 'help_2').stamp_text(help_text, 5, 3, 140, 'black')

	create_help_back_button(grout, 'help_2', help_screen)
	create_help_next_button(grout, 'help_2', help_screen_3)

	grout
	.reset_input_handling()
	.draw_all('help_2')
}

function help_screen_3(grout) {

	var background_pattern = help_screen_background_pattern(grout, 'help_3')

    help_text = "As they shoot their blood funnels into your money and "
      + "attempt to compromise public and private institutions, you must "
      + "fight them using any means necessary."

	create_help_text_map(grout, 'help_3').stamp_text(help_text, 5, 3, 140, 'black')

	create_help_back_button(grout, 'help_3', help_screen_2)
	create_help_next_button(grout, 'help_3', help_screen_4)

	grout
	.reset_input_handling()
	.draw_all('help_3')
}

function help_screen_4(grout) {

	var background_pattern = help_screen_background_pattern(grout, 'help_4')

    help_text = "Spacebar shoots. arrow keys move left and right. Bankers "
      + "won't kill you if you touch them so feel free to get close to "
      + "them and shoot if they are attempting to infiltrate."

	create_help_text_map(grout, 'help_4').stamp_text(help_text, 5, 3, 140, 'black')

	create_help_back_button(grout, 'help_4', help_screen_3)
	create_help_next_button(grout, 'help_4', start_screen)

	grout
	.reset_input_handling()
	.draw_all('help_4')
}