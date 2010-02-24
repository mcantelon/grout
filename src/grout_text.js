var grout_pixel_font_data = {}

var grout_pixel_font = {

  'a': "..C.. \
        .C.C. \
        CCCCC \
        C...C \
        C...C",

  'b': "CCCC. \
        C...C \
        CCCC. \
        C...C \
        CCCC.",

  'c': ".CCCC \
        C.... \
        C.... \
        C.... \
        .CCCC",

  'd': "CCC.. \
        C..C. \
        C...C \
        C..C. \
        CCC..",

  'e': "CCCCC \
        C.... \
        CCC.. \
        C.... \
        CCCCC",

  'f': "CCCCC \
        C.... \
        CCC.. \
        C.... \
        C....",

  'g': ".CCCC \
        C.... \
        C.CCC \
        C...C \
        .CCC.",

  'h': "C...C \
        C...C \
        CCCCC \
        C...C \
        C...C",

  'i': ".CCC. \
        ..C.. \
        ..C.. \
        ..C.. \
        .CCC.",

  'j': "....C \
        ....C \
        ....C \
        C...C \
        .CCC.",

  'k': "C...C \
        C..C. \
        CCC.. \
        C..C. \
        C...C",

  'l': "C.... \
        C.... \
        C.... \
        C.... \
        CCCCC",

  'm': "C...C \
        CC.CC \
        C.C.C \
        C...C \
        C...C",

  'n': "C...C \
        CC..C \
        C.C.C \
        C..CC \
        C...C",

  'o': ".CCC. \
        C...C \
        C...C \
        C...C \
        .CCC.",

  'p': "CCCC. \
        C...C \
        CCCC. \
        C.... \
        C....",

  'q': ".CCC. \
        C...C \
        C...C \
        C..C. \
        .CC.C",

  'r': "CCCC. \
        C...C \
        CCCC. \
        C...C \
        C...C",

  's': ".CCCC \
        C.... \
        .CCC. \
        ....C \
        CCCC.",

  't': "CCCCC \
        ..C.. \
        ..C.. \
        ..C.. \
        ..C..",

  'u': "C...C \
        C...C \
        C...C \
        C...C \
        .CCC.",

  'v': "C...C \
        C...C \
        C...C \
        .C.C. \
        ..C..",

  'w': "C...C \
        C...C \
        C...C \
        C.C.C \
        .C.C.",

  'x': "C...C \
        .C.C. \
        ..C.. \
        .C.C. \
        C...C",

  'y': "C...C \
        C...C \
        .C.C. \
        ..C.. \
        ..C..",

  'z': "CCCCC \
        ...C. \
        ..C.. \
        .C... \
        CCCCC",

  '0': ".CCC. \
        C...C \
        C...C \
        C...C \
        .CCC.",

  '1': ".CC.. \
        ..C.. \
        ..C.. \
        ..C.. \
        .CCC.",

  '2': ".CCC. \
        C...C \
        ..CC. \
        .C... \
        CCCCC",

  '3': ".CCC. \
        C...C \
        ..CC. \
        C...C \
        .CCC.",

  '4': "C...C \
        C...C \
        CCCCC \
        ....C \
        ....C",

  '5': "CCCCC \
        C.... \
        CCCC. \
        ....C \
        CCCC.",

  '6': ".CCCC \
        C.... \
        CCCC. \
        C...C \
        .CCC.",

  '7': "CCCCC \
        ....C \
        ...C. \
        ..C.. \
        .C...",

  '8': ".CCC. \
        C...C \
        .CCC. \
        C...C \
        .CCC.",

  '9': ".CCC. \
        C...C \
        .CCCC \
        ....C \
        CCCC.",

  '.': "..... \
        ..... \
        ..... \
        ..... \
        .C...",

  '!': ".C... \
        .C... \
        .C... \
        ..... \
        .C...",

  '?': ".CCC. \
        C...C \
        ..CC. \
        ..... \
        ..C..",

  ',': "..... \
        ..... \
        ..... \
        ..C.. \
        .C...",

  '(': "...C. \
        ..C.. \
        ..C.. \
        ..C.. \
        ...C.",

  ')': ".C... \
        ..C.. \
        ..C.. \
        ..C.. \
        .C...",

  "'": "..C.. \
        ..C.. \
        ..... \
        ..... \
        .....",

  '"': ".C.C. \
        .C.C. \
        ..... \
        ..... \
        .....",

  '-': "..... \
        ..... \
        .CCC. \
        ..... \
        .....",

  ':': "..... \
        ..C.. \
        ..... \
        ..C.. \
        ....."
}

var grout_pixeL_font_single_letter_data;

// add tolower
var grout_text_stamp_text = function(text, offset_x, offset_y, max_width, text_color, pixels_between_letters) {

  var words = text.toLowerCase().split(' ');
  var word;
  var x = 0;
  var y = 0;

  var text_color = this.merge(text_color, true);
  var pixels_between_letters = this.merge(pixels_between_letters, 1);

  // parse pixel font into pixel arrays for speed
  for(var letter in grout_pixel_font) {

    var grout_pixeL_font_single_letter_data = this.pixels_and_size_from_string(
      grout_pixel_font[letter], {'C': text_color});

    grout_pixel_font_data[letter] = grout_pixeL_font_single_letter_data.pixels;
  }

  for (var i = 0; i < words.length; i++) {

   word = words[i];

   if (i > 0) {
      // add space
      x = x + 5 + pixels_between_letters;
   }

   // each letter is 5 pixels wide with 1 pixel margin
    word_pixel_width = word.length * 6;

    // wrap if word will go beyond max width
    if ((x + word_pixel_width) > max_width) {
      x = 0;
     // each letter is 5 pixels hight with 1 pixel margin
      y = y + 5 + pixels_between_letters;
    }

    // stamp each letter of text
    for (var j = 0; j < word.length; j++) {

      this.stamp(grout_pixel_font_data[word[j]], offset_x + x, offset_y+ y);
      x = x + 5 + pixels_between_letters;
    }
  }

  return this;
}

Map.prototype.stamp_text = grout_text_stamp_text;
Sprite.prototype.stamp_text = grout_text_stamp_text;
