var EDITOR_WIDTH_IN_TILES  = 30
var EDITOR_HEIGHT_IN_TILES = 30
var EDITOR_TILE_SIZE = 10
var PREVIEW_TILE_SIZE = 5

function spritemaker() {

	//var preview = spritemaker_preview()
	var editor = spritemaker_editor()
	var picker = spritemaker_colour_picker()
}

function spritemaker_editor() {

	// establish grout as a global variable
	var editor = new Grout({
		'width':  EDITOR_WIDTH_IN_TILES * EDITOR_TILE_SIZE,
		'height': EDITOR_HEIGHT_IN_TILES * EDITOR_TILE_SIZE,
		'canvas_id': 'editor'
	})

	// create editor map
	var editor_map = editor.map(
		'editor', {
			'width': EDITOR_WIDTH_IN_TILES,
			'height': EDITOR_HEIGHT_IN_TILES,
			'tile_width': EDITOR_TILE_SIZE,
			'tile_height': EDITOR_TILE_SIZE
		}
	)

	editor_map.clear()

	editor_map.click(function (x, y) {

		if (this.parent.state['mode'] == 'pick_color') {

			if (this.pixels[x][y]) {
				spritemaker_set_color(this.pixels[x][y])
			}
			this.parent.state['mode'] = ''
		}
		else {

			//var preview = document.getElementById('preview').grout

			// toggle pixel in editor and preview
			this.toggle(x, y, this.parent.doc_get('colour').value)
			//preview.maps.preview.toggle(x, y, this.parent.doc_get('colour').value)

			// refresh editor and preview
			this.parent.draw_all()
			//preview.draw_all()
		}
	})

	return editor
}

function spritemaker_clear() {

	if (confirm('Are you sure?')) {

		var editor = document.getElementById('editor').grout

		editor.maps['editor'].clear()
		editor.draw_all()

		var preview = document.getElementById('preview').grout

		preview.maps['preview'].clear()
		preview.draw_all()
	}
}

function spritemaker_export() {

	var editor = document.getElementById('editor').grout
	var export_data = editor.maps['editor'].export_pixels()
	document.getElementById('import_export_area').innerHTML = export_data
}

function spritemaker_import() {

	var editor = document.getElementById('editor').grout
	var preview = document.getElementById('preview').grout 
	var data_to_import = document.getElementById('import_export_area').value

	if (data_to_import) {
		editor.maps['editor'].import_pixels(data_to_import)
		editor.draw_all()
		preview.maps['preview'].import_pixels(data_to_import)
		preview.draw_all()
	}
}

function spritemaker_preview() {

	// establish grout as a global variable
	var preview = new Grout({
		'width':  EDITOR_WIDTH_IN_TILES * PREVIEW_TILE_SIZE,
		'height': EDITOR_HEIGHT_IN_TILES * PREVIEW_TILE_SIZE,
		'canvas_id': 'preview'		
	})

	// create editor map
	var preview_map = preview.map(
		'preview', {
			'width': EDITOR_WIDTH_IN_TILES,
			'height': EDITOR_HEIGHT_IN_TILES,
			'tile_width': PREVIEW_TILE_SIZE,
			'tile_height': PREVIEW_TILE_SIZE
		}
	)
}

function spritemaker_colour_picker() {
	
	// establish grout as a global variable
	var picker = new Grout({
		'width':  306,
		'height': 17,
		'canvas_id': 'picker'
	})

	// create editor map
	var picker_map = picker.map(
		'picker', {
			'width': picker.width,
			'height': picker.height,
			'tile_width': 1,
			'tile_height': 1
		}
	)

	picker_map.clear()
	draw_colour_pallette(picker_map)
	picker.draw_all()

	picker_map.click(function (x, y) {
		var colour = this.pixels[x][y]
		spritemaker_set_color(colour)
		this.parent.draw_all()
	})

	return picker
}

function spritemaker_set_color(colour) {

	document.getElementById('colour').value = colour
	set_foreground_indicator(colour)
}

function spritemaker_pick_colour() {

	var editor = document.getElementById('editor').grout

	editor.state['mode'] = 'pick_color'
}

function set_foreground_indicator(colour) {

	var text_colour = (colour == 'black' || colour == '#000000') ? 'white' : 'black'
	document.getElementById('foreground_colour_indicator').style['color'] = text_colour
	document.getElementById('foreground_colour_indicator').style['background-color'] = colour
}

function draw_colour_pallette(picker_map) {

	var current_colour_action = 0,
		r = 255,
		g = 0,
		b = 0,
		x_step = 5,
		colour_alter,
		altered_r,
		alerted_g,
		alerted_b

	var colour_actions = [
		'g +',
		'r -',
		'b +',
		'g -',
		'r +',
		'b -'
	]

	// use colour actions to create a colour pallette
	for (var x = 0; x < picker_map.width; x++) {

		// every time a colour action has changed colour 255 shades,
		// change current colour action
		if (x % (255 / x_step) == 0) {

			var colour_action = colour_actions[current_colour_action]

			if (current_colour_action < (colour_actions.length - 1)) {
				current_colour_action++
			}
		}

		function colour_alter_calc(colour, colour_alter) {
			return (colour + colour_alter > 0) ? colour + colour_alter : 0
		}

		for (var y = 0; y < picker_map.height; y++) {
			colour_alter = 0 - (y * 15)
			altered_r = (r + colour_alter > 0) ? r + colour_alter : 0
			altered_g = (g + colour_alter > 0) ? g + colour_alter : 0
			altered_b = (b + colour_alter > 0) ? b + colour_alter : 0
			picker_map.poke(x, y, rgb_to_hex(altered_r, altered_g, altered_b))
		}

		// change colour according to current action
		eval(colour_action + '= ' + x_step)
	}
}

function rgb_to_hex(r, g, b) {

	var r_hex = decimalToHex(r, 2)
	var g_hex = decimalToHex(g, 2)
	var b_hex = decimalToHex(b, 2)
	return '#' + r_hex + g_hex + b_hex
}

// http://stackoverflow.com/questions/57803/how-to-convert-decimal-to-hex-in-javascript
function decimalToHex(d, padding) {

	var hex = Number(d).toString(16);		
	padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

	while (hex.length < padding) {
		hex = "0" + hex;
	}

	return hex;
}
