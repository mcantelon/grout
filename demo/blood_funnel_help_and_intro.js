// start screen has a blue button, which leads to another screen, and a red button
function start_screen(grout) {

	grout.play_sound('intro_soundtrack')
	grout.stop_sound('game_soundtrack')

    // create pixel map for background pattern
	var background_pattern = grout.map(
	    'start_screen_background_pattern', {
	    	'group': 'start',
	    	'width': MAP_SIZE_IN_TILES,
	    	'height': MAP_SIZE_IN_TILES / 2,
	        'tile_width': TILE_WIDTH * 2,
	        'tile_height': TILE_HEIGHT * 2
	    }
	)

    generate_buildings_background_pattern(grout.maps['start_screen_background_pattern'], 3, 6)

    background_pattern.stamp_text('blood funnel', 5, 5, 50, '#444444')
    background_pattern.stamp_text('blood funnel', 4, 4, 50, '#ff0000')

	var author_credit = grout.sprite(
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

    var banker = grout.sprite(
        'banker', {
        	'group': 'start',
        	'tile_width': TILE_WIDTH * 4,
        	'tile_height': TILE_HEIGHT * 4,
            'offset_x': 25,
            'offset_y': 7
        }
    )

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
	", banker_color_map(banker_random_skin_color(), banker_random_hair_color()))

	var start_button = grout.sprite(
	    'blue_button', {
	        'group': 'start',
	        'tile_width': TILE_WIDTH,
	        'tile_height': TILE_HEIGHT
	    }
	)

	var start_button_colors = {'B': 'blue', 'G': 'grey'}

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
	", start_button_colors)

	start_button.offset_x = 7
	start_button.offset_y = 60

	// sprite click logic receives x, y in tiles
	start_button.click(function(x, y) {

		if (this.inside_margins(x, y)) {

			main_screen(this.parent)
		}
	})

	var help_button = grout.sprite(
	    'red_button', {
	        'group': 'start',
	        'tile_width': TILE_WIDTH,
	        'tile_height': TILE_HEIGHT   
	    }
	)

	var help_button_colors = {'R': 'red', 'G': 'grey'}

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
	", help_button_colors)

	help_button.offset_x = 34
	help_button.offset_y = 60

	// sprite click logic receives x, y in tiles
	help_button.click(function(x, y) {

		if (this.inside_margins(x, y)) {

			help_screen(this.parent)
		}
	})

	// shouldn't need to have this... :[
	// global click logic receives x, y in pixels
	grout.click(function (x, y) {
	})

	// negate keyboard handling
	grout.keypress(function(key) {
	})

	grout.draw_all('start')
}

function help_screen_background_pattern(grout, group) {

    // create pixel map for background pattern
	var background_pattern = grout.map(
	    group, {
	    	'group': group,
	    	'width': MAP_SIZE_IN_TILES,
	    	'height': MAP_SIZE_IN_TILES / 2,
	        'tile_width': TILE_WIDTH * 2,
	        'tile_height': TILE_HEIGHT * 2
	    }
	)

	generate_buildings_background_pattern(grout.maps[group], 3, 6)
   
	return background_pattern
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

	var help_button_colors = {'B': 'blue', 'G': 'grey'}

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
	", help_button_colors)

	help_button.offset_x = 7
	help_button.offset_y = 60

	// sprite click logic receives x, y in tiles
	help_button.click(function(x, y) {

		if (this.inside_margins(x, y)) {

			click_function(this.parent)
		}
	})

	return help_button
}

function create_help_next_button(grout, group, click_function) {

	var next_button = grout.sprite(
	    group + '_next_button', {
	        'group': group,
	        'tile_width': TILE_WIDTH,
	        'tile_height': TILE_HEIGHT
	    }
	)

	var next_button_colors = {'R': 'red', 'G': 'grey'}

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
	", next_button_colors)

	next_button.offset_x = 30
	next_button.offset_y = 60

	// sprite click logic receives x, y in tiles
	next_button.click(function(x, y) {

		if (this.inside_margins(x, y)) {

			click_function(this.parent)
		}
	})

	return next_button
}

// start screen has a blue button, which leads to another screen, and a red button
function help_screen(grout) {

	var background_pattern = help_screen_background_pattern(grout, 'help')

    help_text = "\"The world's most powerful investment bank is a great vampire squid wrapped around the face of humanity, relentlessly jamming its blood funnel into anything that smells like money.\""

	var help_text_map = create_help_text_map(grout, 'help')
      .stamp_text(help_text, 5, 3, 140, 'black')
      .stamp_text('-Matt Taibbi', 108, 55, 70, 'black')

	var help_button = create_help_back_button(grout, 'help', start_screen)
	var next_button = create_help_next_button(grout, 'help', help_screen_2)

	// shouldn't need to have this... :[
	// global click logic receives x, y in pixels
	grout.click(function (x, y) {
	})

	// negate keyboard handling
	grout.keypress(function(key) {
	})

	grout.draw_all('help')
}

// start screen has a blue button, which leads to another screen, and a red button
function help_screen_2(grout) {

	var background_pattern = help_screen_background_pattern(grout, 'help_2')

    help_text = 'it is the year 2000. an evil cabal of bankers known as goldman sacks is infiltrating world governments, enacting laws that enable them to conduct massive swindles and loot the public coffers.'

	var help_text_map = create_help_text_map(grout, 'help_2').stamp_text(help_text, 5, 3, 140, 'black')

	var help_button = create_help_back_button(grout, 'help_2', help_screen)
	var next_button = create_help_next_button(grout, 'help_2', help_screen_3)

	// shouldn't need to have this... :[
	// global click logic receives x, y in pixels
	grout.click(function (x, y) {
	})

	// negate keyboard handling
	grout.keypress(function(key) {
	})

	grout.draw_all('help_2')
}

// start screen has a blue button, which leads to another screen, and a red button
function help_screen_3(grout) {

	var background_pattern = help_screen_background_pattern(grout, 'help_3')

    help_text = 'As they shoot their blood funnels into your money and attempt to compromise public and private institutions, you must fight them using any means necessary.'

	var help_text_map = create_help_text_map(grout, 'help_3').stamp_text(help_text, 5, 3, 140, 'black')

	var help_button = create_help_back_button(grout, 'help_3', help_screen_2)
	var next_button = create_help_next_button(grout, 'help_3', help_screen_4)

	// shouldn't need to have this... :[
	// global click logic receives x, y in pixels
	grout.click(function (x, y) {
	})

	// negate keyboard handling
	grout.keypress(function(key) {
	})

	grout.draw_all('help_3')
}

// start screen has a blue button, which leads to another screen, and a red button
function help_screen_4(grout) {

	var background_pattern = help_screen_background_pattern(grout, 'help_4')

    help_text = "Spacebar shoots. arrow keys move left and right. Bankers won't kill you if you touch them so feel free to get close to them and shoot if they are attempting to infiltrate."

	var help_text_map = create_help_text_map(grout, 'help_4').stamp_text(help_text, 5, 3, 140, 'black')

	var help_button = create_help_back_button(grout, 'help_4', help_screen_3)
	var next_button = create_help_next_button(grout, 'help_4', start_screen)

	// shouldn't need to have this... :[
	// global click logic receives x, y in pixels
	grout.click(function (x, y) {
	})

	// negate keyboard handling
	grout.keypress(function(key) {
	})

	grout.draw_all('help_4')
}