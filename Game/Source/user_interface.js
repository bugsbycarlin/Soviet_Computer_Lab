
//
//
// Game UI tools
//
//

Game.prototype.makeRocketTile = function(parent, letter, word_length, letter_number, shift, player, inner_size, outer_size) {
  var self = this;
  let rocket_tile = new PIXI.Container();
  parent.addChild(rocket_tile);
  let gap = outer_size - inner_size;
  let start_y = inner_size / 2 - outer_size;
  let start_x = gap / 2 + outer_size * (letter_number + shift) + inner_size / 2;

  rocket_tile.position.set(start_x, start_y);
  rocket_tile.vy = 0;

  let fire_sprite = this.makeFire(rocket_tile, 0, 34, 0.32, 0.24);
  fire_sprite.original_x = fire_sprite.x;
  fire_sprite.original_y = fire_sprite.y;
  fire_sprite.visible = false;

  let parachute_sprite = this.makeParachute(rocket_tile, 0, -56, 1, 1);
  parachute_sprite.visible = false;


  let rocket_file = "rocket_soviet";
  if (player == 1) rocket_file = "rocket_american";
  var rocket_proper = new PIXI.Sprite(PIXI.Texture.from("Art/" + rocket_file + ".png"));
  rocket_proper.anchor.set(0.5, 0.5);
  rocket_tile.addChild(rocket_proper);

  var tile = this.makePixelatedLetterTile(rocket_tile, letter, "white");
  tile.tint = 0x38351e;

  rocket_tile.fire_sprite = fire_sprite;
  rocket_tile.parachute_sprite = parachute_sprite;
  rocket_tile.start_time = this.markTime() - Math.floor(Math.random() * 300);
  rocket_tile.parent = parent;
  rocket_tile.value_text = tile.value_text;

  rocket_tile.status = "load";

  new TWEEN.Tween(rocket_tile.position)
    .to({y: start_y - inner_size})
    .duration(350)
    .onComplete(function() {fire_sprite.visible = true; rocket_tile.status = "rocket"; self.soundEffect("rocket");})
    .start()

  rocket_tile.column = letter_number + shift;
  rocket_tile.player = player;
  rocket_tile.letter = letter;
  rocket_tile.value = letter_values[letter];
  rocket_tile.score_value = Math.floor(Math.pow(word_length, 1.5));

  return rocket_tile;
}


Game.prototype.makeFire = function(parent, x, y, xScale, yScale) {
  var sheet = PIXI.Loader.shared.resources["Art/fire.json"].spritesheet;
  let fire_sprite = new PIXI.AnimatedSprite(sheet.animations["fire"]);
  fire_sprite.anchor.set(0.5,0.5);
  fire_sprite.scaleMode = PIXI.SCALE_MODES.NEAREST;
  fire_sprite.position.set(x, y);
  parent.addChild(fire_sprite);
  fire_sprite.animationSpeed = 0.35; 
  fire_sprite.scale.set(xScale, yScale);
  fire_sprite.play();
  return fire_sprite;
}


Game.prototype.makeParachute = function(parent, x, y, xScale, yScale) {
  let parachute_sprite = new PIXI.Sprite(PIXI.Texture.from("Art/parachute.png"));
  parachute_sprite.anchor.set(0.5, 0.5);
  parachute_sprite.scale.set(xScale, yScale);
  parachute_sprite.position.set(x, y);
  parent.addChild(parachute_sprite);
  return parachute_sprite;
}


Game.prototype.makeBomb = function(parent, x, y, xScale, yScale) {
  let bomb_sprite = new PIXI.Sprite(PIXI.Texture.from("Art/bomb.png"));
  bomb_sprite.anchor.set(0.5, 0.5);
  bomb_sprite.scale.set(xScale, yScale);
  bomb_sprite.position.set(x, y);
  bomb_sprite.angle = 10;
  parent.addChild(bomb_sprite);
  return bomb_sprite;
}


Game.prototype.makeExplosion = function(parent, x, y, xScale, yScale, action) {
  let sheet = PIXI.Loader.shared.resources["Art/explosion.json"].spritesheet;
  let explosion_sprite = new PIXI.AnimatedSprite(sheet.animations["explosion"]);
  explosion_sprite.anchor.set(0.5,0.5);
  explosion_sprite.position.set(x, y);
  parent.addChild(explosion_sprite);
  explosion_sprite.animationSpeed = 0.5; 
  explosion_sprite.scale.set(xScale, yScale);
  explosion_sprite.loop = false;
  explosion_sprite.play();
  explosion_sprite.onComplete = function() {
    action();
  }
  return explosion_sprite;
}


Game.prototype.makeElectric = function(parent, x, y, xScale, yScale) {
  let sheet = PIXI.Loader.shared.resources["Art/electric.json"].spritesheet;
  let electric_sprite = new PIXI.AnimatedSprite(sheet.animations["electric"]);
  electric_sprite.anchor.set(0.5,0.5);
  electric_sprite.position.set(x, y);
  electric_sprite.angle = Math.random() * 360;
  parent.addChild(electric_sprite);
  electric_sprite.animationSpeed = 0.4; 
  electric_sprite.scale.set(xScale, yScale);
  electric_sprite.play();
  electric_sprite.onLoop = function() {
    this.angle = Math.random() * 360;
  }
  return electric_sprite;
}


Game.prototype.makePixelatedLetterTile = function(parent, text, color) {
  var tile = new PIXI.Sprite(PIXI.Texture.from("Art/PixelatedKeys/pixelated_" + color + "_" + text + ".png"));
  parent.addChild(tile);
  tile.anchor.set(0.5,0.5);
  tile.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  return tile;
}


//
//
// Keyboard UI tools
//
//


Game.prototype.makeKeyboard = function(options) {
  let self = this;

  let parent = options.parent;
  let x = options.x == null ? 0 : options.x;
  let y = options.y == null ? 0 : options.y;
  let defense = options.defense == null ? [] : options.defense;
  let action = options.action == null ? function(){} : options.action;
  let player = options.player;

  let keyboard = new PIXI.Container();
  parent.addChild(keyboard);
  keyboard.position.set(x, y);
  keyboard.scale.set(0.625, 0.625);
  keyboard.letters = {};
  keyboard.keys = {};
  keyboard.error = 0;

  let keys = [];
  if (this.keyboard_mode == "QWERTY") {
    keys[0] = ["Escape_1_esc", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-_1_minus", "=_1_equals", "Backspace_2_backspace"];
    keys[1] = ["Tab_1.5_tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[_1_leftbracket", "]_1_rightbracket", "\\_1.5_backslash"];
    keys[2] = ["CapsLock_2_capslock", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";_1_semicolon", "'_1_quote", "Enter_2_enter"];
    keys[3] = ["LShift_2.5_shift", "Z", "X", "C", "V", "B", "N", "M", ",_1_comma", "._1_period", "/_1_forwardslash", "RShift_2.5_shift"];
    keys[4] = ["Control_1.5_ctrl", "Alt_1_alt", "Meta_1.5_cmd", " _6_spacebar", "Fn_1_fn", "ArrowLeft_1_left", "ArrowUp_1_up", "ArrowDown_1_down", "ArrowRight_1_right"];
  } else if (this.keyboard_mode == "DVORAK") {
    keys[0] = ["Escape_1_esc", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "[_1_leftbracket", "]_1_rightbracket", "Backspace_2_backspace"];
    keys[1] = ["Tab_1.5_tab", "'_1_quote", ",_1_comma", "._1_period", "P", "Y", "F", "G", "C", "R", "L", "/_1_forwardslash", "=_1_equals", "\\_1.5_backslash"];
    keys[2] = ["CapsLock_2_capslock", "A", "O", "E", "U", "I", "D", "H", "T", "N", "S", "-_1_minus", "Enter_2_enter"];
    keys[3] = ["LShift_2.5_shift", ";_1_semicolon", "Q", "J", "K", "X", "B", "M", "W", "V", "Z", "RShift_2.5_shift"];
    keys[4] = ["Control_1.5_ctrl", "Alt_1_alt", "Meta_1.5_cmd", " _6_spacebar", "Fn_1_fn", "ArrowLeft_1_left", "ArrowUp_1_up", "ArrowDown_1_down", "ArrowRight_1_right"];
  }

  let background = new PIXI.Sprite(PIXI.Texture.from("Art/Keyboard/keyboard_background.png"));
  background.anchor.set(0.5, 0.5);
  keyboard.addChild(background);
  keyboard.background = background;

  for (var h = 0; h < keys.length; h++) {
    var k_x = -610 + 10;
    var k_y = -230 + 50 + 82 * h;
    for (var i = 0; i < keys[h].length; i++) {
      let info = keys[h][i];
      
      let letter = info;
      let size = 1;
      let filename = "key_" + letter;
      if (info.includes("_")) {
        let s = info.split("_");
        letter = s[0];
        size = parseFloat(s[1]);
        filename = "key_" + s[2];
      }

      if (defense.includes(letter)) filename = "blue_" + filename;

      let button = this.makeKey(
        keyboard,
        k_x + size * 40, k_y, filename, size, function() { 
          if (player == 1) {
            self.pressKey(keyboard, letter);
            action(letter);
          }
        },
      );

      k_x += 80 * size;

      keyboard.keys[letter] = button;
      if (letter_array.includes(letter)) {
        keyboard.keys[letter.toLowerCase()] = button;
        keyboard.letters[letter] = button;
      }
    }
  }

  keyboard.setBombs = function (number){
    console.log("Setting " + number + " bombs");
    let spacekey = this.keys[" "];

    if(spacekey.bombs != null) {
      for (let i = 0; i < spacekey.bombs.length; i++) {
        let bomb = spacekey.bombs[i];
        let x = spacekey.removeChild(bomb);
        x.destroy();
      }
    }
    spacekey.bombs = [];
    for (let i = 0; i < number; i++) {
      let bomb = self.makeBomb(spacekey, 54 * i - 27 * (number - 1), 0, 0.8, 0.8);
      bomb.alpha = 0.6;
      spacekey.bombs.push(bomb);
    }
  }

  return keyboard;
}


Game.prototype.makeKey = function(parent, x, y, filename, size, action) {
  var self = this;
  var key_button = new PIXI.Container();
  var key_sprite = new PIXI.Sprite(PIXI.Texture.from("Art/Keyboard/" + filename + ".png"));
  key_sprite.anchor.set(0.5, 0.5);
  key_button.position.set(x, y);
  parent.addChild(key_button);
  key_button.addChild(key_sprite);

  key_button.playable = true;
  key_button.interactive = true;
  key_button.buttonMode = true;
  key_button.on("pointerdown", action);

  key_button.action = action;

  key_button.disable = function() {
    this.interactive = false;
    this.disable_time = self.markTime();
    console.log(this.disable_time);
  }

  key_button.enable = function() {
    this.interactive = true;
  }

  return key_button;
}



//
//
// Meta UI tools
//
//

Game.prototype.initializeScreens = function() {
  var self = this;
  this.screens = [];

  this.makeScreen("title");
  this.makeScreen("1p_lobby");
  this.makeScreen("1p_game");
  this.makeScreen("cutscene");
  this.makeScreen("high_score");
  this.makeScreen("credits");
  
  this.initializeCutscene();
  this.screens["cutscene"].position.x = 0;
  this.current_screen = "cutscene";

  this.alertMask = new PIXI.Container();
  pixi.stage.addChild(this.alertMask);
  this.alertBox = new PIXI.Container();
  pixi.stage.addChild(this.alertBox);
}


Game.prototype.makeScreen = function(name) {
  this.screens[name] = new PIXI.Container();
  this.screens[name].name = name;
  this.screens[name].position.x = this.width;
  pixi.stage.addChild(this.screens[name]);
}


Game.prototype.clearScreen = function(screen) {
  console.log("here i am cleaning " + screen.name);
  while(screen.children[0]) {
    let x = screen.removeChild(screen.children[0]);
    x.destroy();
  }
}


Game.prototype.switchScreens = function(old_screen, new_screen) {
  var self = this;
  console.log("switching from " + old_screen + " to " + new_screen);
  var direction = -1;
  if (new_screen == "title") direction = 1;
  this.screens[new_screen].position.x = direction * -1 * this.width;
  for (var i = 0; i < this.screens.length; i++) {
    if (this.screens[i] == new_screen || this.screens[i] == old_screen) {
      this.screens[i].visible = true;
    } else {
      this.screens[i].visible = false;
      this.clearScreen(this.screens[i]);
    }
  }
  var tween_1 = new TWEEN.Tween(this.screens[old_screen].position)
    .to({x: direction * this.width})
    .duration(1000)
    .easing(TWEEN.Easing.Cubic.InOut)
    .onComplete(function() {self.clearScreen(self.screens[old_screen]);})
    .start();
  var tween_2 = new TWEEN.Tween(this.screens[new_screen].position)
    .to({x: 0})
    .duration(1000)
    .easing(TWEEN.Easing.Cubic.InOut)
    .start();
  this.current_screen = new_screen;
}


Game.prototype.initializeAlertBox = function() {
  this.alertBox.position.set(this.width / 2, this.height / 2);
  this.alertBox.visible = false;

  this.alertMask.position.set(this.width / 2, this.height / 2);
  this.alertMask.visible = false;
  this.alertMask.interactive = true;
  this.alertMask.buttonMode = true;
  this.alertMask.on("pointertap", function() {
  });


  var mask = PIXI.Sprite.from(PIXI.Texture.WHITE);
  mask.width = this.width;
  mask.height = this.height;
  mask.anchor.set(0.5, 0.5);
  mask.alpha = 0.2;
  mask.tint = 0x000000;
  this.alertMask.addChild(mask);

  var outline = PIXI.Sprite.from(PIXI.Texture.WHITE);
  outline.width = this.width * 2/5;
  outline.height = this.height * 2/5;
  outline.anchor.set(0.5, 0.5);
  outline.position.set(-1, -1);
  outline.tint = 0xDDDDDD;
  this.alertBox.addChild(outline);

  for (var i = 0; i < 4; i++) {
    var backingGrey = PIXI.Sprite.from(PIXI.Texture.WHITE);
    backingGrey.width = this.width * 2/5;
    backingGrey.height = this.height * 2/5;
    backingGrey.anchor.set(0.5, 0.5);
    backingGrey.position.set(4 - i, 4 - i);
    backingGrey.tint = PIXI.utils.rgb2hex([0.8 - 0.1*i, 0.8 - 0.1*i, 0.8 - 0.1*i]);
    this.alertBox.addChild(backingGrey);
  }

  var backingWhite = PIXI.Sprite.from(PIXI.Texture.WHITE);
  backingWhite.width = this.width * 2/5;
  backingWhite.height = this.height * 2/5;
  backingWhite.anchor.set(0.5, 0.5);
  backingWhite.position.set(0,0);
  backingWhite.tint = 0xFFFFFF;
  this.alertBox.addChild(backingWhite);

  this.alertBox.alertText = new PIXI.Text("EH. OKAY.", {fontFamily: "Bebas Neue", fontSize: 36, fill: 0x000000, letterSpacing: 6, align: "center"});
  this.alertBox.alertText.anchor.set(0.5,0.5);
  this.alertBox.alertText.position.set(0, 0);
  this.alertBox.addChild(this.alertBox.alertText);

  this.alertBox.interactive = true;
  this.alertBox.buttonMode = true;
}


Game.prototype.showAlert = function(text, action) {
  var self = this;
  this.alertBox.alertText.text = text;
  this.alertBox.on("pointertap", function() {
    action();
    self.alertBox.visible = false
    self.alertMask.visible = false
  });
  this.alertBox.visible = true;
  this.alertMask.visible = true;
  new TWEEN.Tween(this.alertBox)
    .to({rotation: Math.PI / 60.0})
    .duration(70)
    .yoyo(true)
    .repeat(3)
    .start()
}


Game.prototype.comicBubble = function(parent, text, x, y) {
  let comic_container = new PIXI.Container();
  comic_container.position.set(x, y);
  parent.addChild(comic_container);

  let comic_text = new PIXI.Text(" " + text + " ", {fontFamily: "Bangers", fontSize: 36, fill: 0x000000, letterSpacing: 6, align: "center"});
  comic_text.anchor.set(0.5,0.53);

  let black_fill = PIXI.Sprite.from(PIXI.Texture.WHITE);
  black_fill.width = comic_text.width + 16;
  black_fill.height = comic_text.height + 16;
  black_fill.anchor.set(0.5, 0.5);
  black_fill.tint = 0x000000;
  
  let white_fill = PIXI.Sprite.from(PIXI.Texture.WHITE);
  white_fill.width = comic_text.width + 10;
  white_fill.height = comic_text.height + 10;
  white_fill.anchor.set(0.5, 0.5);
  white_fill.tint = 0xFFFFFF;

  comic_container.addChild(black_fill); 
  comic_container.addChild(white_fill);
  comic_container.addChild(comic_text);

  return comic_container;
}



