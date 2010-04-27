var EDITOR_WIDTH_IN_TILES  = 30
var EDITOR_HEIGHT_IN_TILES = 30
var EDITOR_TILE_SIZE = 10
var PREVIEW_TILE_SIZE = 5

var THING = []

function spritemaker() {

	//var preview = spritemaker_preview()

	var editor = spritemaker_editor()

	var picker = grout_palette(
		{'preset': 'medium'},
		function (x, y) {
			var colour = this.pixels[x][y]
			spritemaker_set_color(colour)
			this.parent.draw_all()
        }
	)
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

function spritemaker_set_color(colour) {

	document.getElementById('colour').value = colour
	set_foreground_indicator(colour)
}

function set_foreground_indicator(colour) {

	var text_colour = (colour == 'black' || colour == '#000000') ? 'white' : 'black'
	document.getElementById('foreground_colour_indicator').style['color'] = text_colour
	document.getElementById('foreground_colour_indicator').style['background-color'] = colour
}

function spritemaker_pick_colour() {

	var editor = document.getElementById('editor').grout

	editor.state['mode'] = 'pick_color'
}
