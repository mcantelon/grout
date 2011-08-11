Grout: make things with chunky pixels on canvas

If you want to have some fun with canvas and make chunky things Grout is
a friend to you.

Features:
 * functionality for making chunky pixel art and games
 * two rendering modes ("fast" and blurry, or "sharp" and less performant)
 * allows you to use ASCII art to define sprites
 * supports simple sprite animation
 * provides a pixel font with word wrap

## Defining sprites

Grout lets you define sprites using ASCII.

Below is an example in which we create a draw a little man:

    var width_in_tiles = 6
    var height_in_tiles = 11
    var tile_size = 8

    var grout = new Grout({
      'width':  width_in_tiles,
      'height': height_in_tiles,
      'tile_width':  tile_size,
      'tile_height': tile_size
    })

    var man = grout.sprite(
      'man', {
        'tile_width': tile_size,
        'tile_height': tile_size
      }
    )
    .make_sprite(" \
      .***.. \
      .***.. \
      ..*... \
      .***.. \
      *.*.*. \
      *.*.*. \
      ..*... \
      ..**.. \
      ..*.*. \
      ***..* \
      .....* \
    ")

    grout.draw_all()

## Adding color to sprites

If we wanted to make a color version of the little man in the example above
we can do it by adding an argument to "make_sprite" that maps letters to
colors. 

    var man_colors = {
      'H': '#271F2E', // hair color
      'S': '#D9B166', // skin color
      'C': '#000080', // clothing color
      'B': '#000000'  // belt color
    }

    var man = grout.sprite(
      'man', {
        'tile_width': tile_size,
        'tile_height': tile_size
      }
    )
    .make_sprite(" \
      .HHH.. \
      .SSS.. \
      ..S... \
      .CCC.. \
      C.C.C. \
      C.C.C. \
      ..B... \
      ..CC.. \
      ..C.C. \
      CCC..C \
      .....C \
  ", man_colors)

## Animating sprites

## Adding pixel text

Grout comes with some functionality to make pixelized text (and will wrap it
from line to line).

Include the "src/grout_text.js" library will extend the Map and Sprite classes,
adding a "stamp_text" function.

Below is an example of using "stamp_text" to add text to a map:

    var width_in_tiles = 30
    var height_in_tiles = 12
    var tile_size = 8

    var my_grout = new Grout({
      'width':  width_in_tiles,
      'height': height_in_tiles,
      'tile_width':  tile_size,
      'tile_height': tile_size
    })

    // add a map and stamp some white text on it in the upper left corner
    my_grout.map(
      'my_map', {
        'width':  width_in_tiles,
        'height': height_in_tiles,
      }
    ).stamp_text('hello world', 0, 0, 30, '#ffffff')

    my_grout.draw_all()

Each character is 5 pixels wide by 5 pixel high (with one pixel uses for
vertical and horizontal spacing.

Note that the word wrap takes effect as the map is only 5 characters wide
(30 tiles can contain five characters that are six pixels wide).
