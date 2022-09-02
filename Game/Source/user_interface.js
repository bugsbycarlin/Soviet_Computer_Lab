
//
//
// Game UI tools
//
//

Game.prototype.makeRocketTile2 = function(parent, letter, score_value, base, target_base, player) {
  var self = this;
  let rocket_tile = new PIXI.Container();
  parent.addChild(rocket_tile);

  rocket_tile.velocity = 0;
  rocket_tile.scale.set(0.5, 0.55);
  rocket_tile.rotation = Math.atan2(target_base.y - base.y, target_base.x - base.x) + Math.PI / 2;
  rocket_tile.position.set(base.x + 16 * Math.cos(rocket_tile.rotation - Math.PI / 2), base.y + 16 * Math.sin(rocket_tile.rotation - Math.PI / 2));

  let fire_sprite = this.makeFire(rocket_tile, 0, 34, 0.32, 0.24);
  fire_sprite.original_x = fire_sprite.x;
  fire_sprite.original_y = fire_sprite.y;
  fire_sprite.visible = false;

  let rocket_file = "rocket_american";
  if (player == 1) rocket_file = "rocket_soviet";
  var rocket_proper = new PIXI.Sprite(PIXI.Texture.from("Art/" + rocket_file + ".png"));
  rocket_proper.anchor.set(0.5, 0.5);
  rocket_tile.addChild(rocket_proper);

  var tile = this.makePixelatedLetterTile(rocket_tile, letter, "white");
  tile.tint = 0x38351e;
  tile.scale.set(1.1,1);

  rocket_tile.fire_sprite = fire_sprite;
  rocket_tile.start_time = this.markTime() - Math.floor(Math.random() * 300);
  rocket_tile.parent = parent;
  rocket_tile.value_text = tile.value_text;

  rocket_tile.status = "active";

  rocket_tile.player = player;
  rocket_tile.letter = letter;

  rocket_tile.score_value = score_value;

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


Game.prototype.addOpponentPicture = function(screen) {
  if(this.opponent_name != null) {
    let name = "";
    if (this.opponent_name == "zh") {
      name = "zhukov";
    } else if (this.opponent_name == "an") {
      name = "andy";
    } else if (this.opponent_name == "iv") {
      name = "ivan";
    } else if (this.opponent_name == "ro") {
      name = "rogov";
    } else if (this.opponent_name == "fe") {
      name = "fedor";
    } else if (this.opponent_name == "pu") {
      name = "putin";
    }
    this.opponent_image = new PIXI.Sprite(PIXI.Texture.from("Art/Opponents/" + name + ".png"));
    this.opponent_image.anchor.set(0.5, 0.5);
    this.opponent_image.position.set(1100, 304);
    this.opponent_image.alpha = 0.7;
  } else {
    this.opponent_image = new PIXI.Container();
  }
  screen.addChild(this.opponent_image);
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


Game.prototype.makeSmoke = function(parent, x, y, xScale, yScale) {
  let sheet = PIXI.Loader.shared.resources["Art/smoke.json"].spritesheet;
  let smoke_sprite = new PIXI.AnimatedSprite(sheet.animations["smoke"]);
  smoke_sprite.anchor.set(0.5,0.5);
  smoke_sprite.position.set(x, y);
  // smoke_sprite.angle = Math.random() * 360;
  parent.addChild(smoke_sprite);
  smoke_sprite.animationSpeed = 0.4; 
  smoke_sprite.scale.set(xScale, yScale);

  // smoke_sprite.onLoop = function() {
  //   this.angle = Math.random() * 360;
  // }
  // console.log("But abba tho");
  parent.addChild(smoke_sprite);
  smoke_sprite.loop = false;
  smoke_sprite.onComplete = function() {
    parent.removeChild(smoke_sprite);
  }
  smoke_sprite.play();
  return smoke_sprite;
}


Game.prototype.makePop = function(parent, x, y, xScale, yScale) {
  let sheet = PIXI.Loader.shared.resources["Art/pop.json"].spritesheet;
  let pop_sprite = new PIXI.AnimatedSprite(sheet.animations["pop"]);
  pop_sprite.anchor.set(0.5,0.5);
  pop_sprite.position.set(x, y);
  // pop_sprite.angle = Math.random() * 360;
  parent.addChild(pop_sprite);
  pop_sprite.animationSpeed = 0.4;
  pop_sprite.scale.set(xScale, yScale);

  // pop_sprite.onLoop = function() {
  //   this.angle = Math.random() * 360;
  // }
  // console.log("But abba tho");
  parent.addChild(pop_sprite);
  pop_sprite.loop = false;
  pop_sprite.onComplete = function() {
    parent.removeChild(pop_sprite);
  }
  pop_sprite.play();
  return pop_sprite;
}


Game.prototype.makePixelatedLetterTile = function(parent, text, color) {
  var tile = new PIXI.Sprite(PIXI.Texture.from("Art/PixelatedKeys/pixelated_" + color + "_" + text + ".png"));
  parent.addChild(tile);
  tile.anchor.set(0.5,0.5);
  tile.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  return tile;
}


Game.prototype.makeLetterBuilding = function(parent, x, y, letter, team) {
  let letter_building = new PIXI.Container();
  parent.addChild(letter_building);
  letter_building.position.set(x, y);

  letter_building.text = letter;

  let team_name = "american";
  if (team == 1 || team == 3) team_name = "soviet";
  let building_sprite = new PIXI.Sprite(PIXI.Texture.from("Art/" + team_name + "_building_draft_2.png"));
  building_sprite.anchor.set(0.5, 0.5);
  building_sprite.position.set(0, 0);
  letter_building.addChild(building_sprite);
  

  let letter_image = this.makePixelatedLetterTile(letter_building, letter, "white");
  letter_image.anchor.set(0.5, 0.5);
  letter_image.position.set(0, -6);
  if (team == 1 || team == 3) { 
    letter_image.tint = 0x000000;
  }

  return letter_building;
}


Game.prototype.makeRocketWithScaffolding = function(parent, x, y) {
  let container = new PIXI.Container();
  parent.addChild(container);
  container.position.set(x, y);

  container.scaffolding = new PIXI.Sprite(PIXI.Texture.from("Art/rocket_scaffolding.png"));
  container.scaffolding.anchor.set(0.5, 0.5);
  container.scaffolding.position.set(0,-8);
  container.addChild(container.scaffolding);

  container.rocket = new PIXI.Sprite(PIXI.Texture.from("Art/rocket_neutral.png"));
  container.rocket.anchor.set(0.5, 0.5);
  container.addChild(container.rocket);

  return container;
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


Game.prototype.swearing = function() {
  var self = this;
  var screen = this.screens[this.current_screen];

  if (this.opponent_image == null) return;

  let word = "";
  for (let i = 0; i < 5; i++) {
    let num = Math.floor(Math.random() * 5);
    word += "#$%&*".slice(num, num+1);
  }
  word += "!";
  let bub = this.comicBubble(screen, word, 1100 - 150 + 300 * Math.random(), 100 - 50 + 100 * Math.random(), 24);
  delay(function() {
    screen.removeChild(bub);
  }, 500 + Math.random(500));
  if (this.shakers != null) this.shakers.push(bub);
  bub.shake = this.markTime();
  this.opponent_image.shake = this.markTime();
}


Game.prototype.updateEnemyScreenTexture = function() {
  var self = this;
  var screen = this.screens[this.current_screen];

  let texture = PIXI.RenderTexture.create({width: 800, height: 600});

  this.renderer.render(this.player_area, texture);

  if (this.enemy_area.sprite == null) {
    let sprite = PIXI.Sprite.from(texture);
    sprite.position.set(-240,-520);
    sprite.anchor.set(0, 0);
    this.enemy_area.removeChild[0];
    this.enemy_area.addChild(sprite);
    this.enemy_area.sprite = sprite;
  } else {
    this.enemy_area.sprite.texture = texture;
  }
}


//
//
// Meta UI tools
//
//

Game.prototype.initializeScreens = function() {
  var self = this;
  this.screens = [];

  this.makeScreen("intro");
  this.makeScreen("title");
  this.makeScreen("1p_lobby");
  this.makeScreen("1p_word_rockets");
  this.makeScreen("1p_base_capture");
  this.makeScreen("1p_launch_code");
  this.makeScreen("math_game");
  this.makeScreen("1p_cpe");
  this.makeScreen("cpe_character_tester");
  this.makeScreen("multi_lobby");
  this.makeScreen("multi_set_name");
  this.makeScreen("multi_join_game");
  this.makeScreen("cutscene");
  this.makeScreen("high_score");
  this.makeScreen("game_over");
  this.makeScreen("credits");

  this.black = PIXI.Sprite.from(PIXI.Texture.WHITE);
  this.black.width = 1664;
  this.black.height = 960;
  this.black.tint = 0x000000;

  this.screens[first_screen].position.x = 0;
  this.current_screen = first_screen;

  this.alertMask = new PIXI.Container();
  pixi.stage.addChild(this.alertMask);
  this.alertBox = new PIXI.Container();
  pixi.stage.addChild(this.alertBox);
  this.initializeAlertBox();

  this.monitor_overlay = new PIXI.Container();
  this.monitor_overlay.graphic = new PIXI.Sprite(PIXI.Texture.from("Art/pixelated_computer_overlay_1664_960.png"));
  this.monitor_overlay.addChild(this.monitor_overlay.graphic);
  pixi.stage.addChild(this.monitor_overlay);
  this.monitor_overlay.visible = false;
  this.monitor_overlay.dissolve = function() {


    let image = this.graphic;
    let max_width = this.graphic.width;
    let max_height = this.graphic.height;
    let voxel_size = 4;

    this.voxels = [];

    // console.log(PIXI.extract.webGL.pixels(image));
    let pixels = pixi.renderer.extract.pixels(image);
    for (var i = 0; i < pixels.length; i += 4) {
        let alpha = pixels[i + 3];
        let row = (i/4 - (i/4 % max_width)) / max_width;
        let col = i/4 % max_width;
        if (alpha > 0 && row % 4 == 0 && col % 4 == 0) {
            let voxel = PIXI.Sprite.from(PIXI.Texture.WHITE);
            voxel.width = voxel_size;
            voxel.height = voxel_size;
            
            voxel.tint = PIXI.utils.rgb2hex([pixels[i] / 255, pixels[i + 1] / 255, pixels[i + 2] / 255]);
            voxel.alpha = alpha / 255;
            this.addChild(voxel);
            voxel.orig_x = col;
            voxel.orig_y = row;
            voxel.position.set(voxel.orig_x, voxel.orig_y);
            this.voxels.push(voxel);
          
        }
    }

    this.removeChild(this.graphic);
    let chunk_size = this.voxels.length / 30;
    shuffleArray(this.voxels);
    let overlay_self = this;

    var tween_1 = new TWEEN.Tween(this)
    .to({funk: 0})
    .duration(1000)
    .easing(TWEEN.Easing.Cubic.InOut)
    .onUpdate(function() {
      for (let i = 0; i < chunk_size; i++) {
        let v = overlay_self.voxels.pop();
        overlay_self.removeChild(v);
      }
    })
    .onComplete(function() {
      overlay_self.visible = false;
      while(overlay_self.children[0]) { 
        overlay_self.removeChild(overlay_self.children[0]);
      }
      overlay_self.addChild(overlay_self.graphic);
    })
    .start();
  }
}


Game.prototype.makeScreen = function(name) {
  this.screens[name] = new PIXI.Container();
  this.screens[name].name = name;
  this.screens[name].position.x = this.width;
  pixi.stage.addChild(this.screens[name]);
}


Game.prototype.clearScreen = function(screen) {
  while(screen.children[0]) {
    let x = screen.removeChild(screen.children[0]);
    x.destroy();
  }
}


Game.prototype.switchScreens = function(old_screen, new_screen) {
  var self = this;

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


Game.prototype.fadeScreens = function(old_screen, new_screen, double_fade = false) {
  var self = this;
  console.log("switching from " + old_screen + " to " + new_screen);
  pixi.stage.removeChild(this.screens[old_screen]);
  pixi.stage.removeChild(this.screens[new_screen]);
  pixi.stage.addChild(this.screens[new_screen]);
  if (double_fade) {  
    pixi.stage.addChild(this.black);
    this.black.alpha = 1;
  }
  pixi.stage.addChild(this.screens[old_screen]);
  this.screens[old_screen].position.x = 0;
  this.screens[new_screen].position.x = 0;
  for (var i = 0; i < this.screens.length; i++) {
    if (this.screens[i] == new_screen || this.screens[i] == old_screen) {
      this.screens[i].visible = true;
    } else {
      this.screens[i].visible = false;
      this.clearScreen(this.screens[i]);
    }
  }
  pixi.stage.addChild(this.monitor_overlay);

  var tween = new TWEEN.Tween(this.screens[old_screen])
    .to({alpha: 0})
    .duration(1000)
    // .easing(TWEEN.Easing.Linear)
    .onComplete(function() {
      if (!double_fade) {
        self.clearScreen(self.screens[old_screen]);
      } else {
        var tween2 = new TWEEN.Tween(self.black)
        .to({alpha: 0})
        .duration(1000)
        .onComplete(function() {
          self.clearScreen(self.screens[old_screen]);
          self.current_screen = new_screen;
          pixi.stage.removeChild(self.black);
        })
        .start();
      }
    })
    .start();
  
}


Game.prototype.fadeFromBlack = function(fade_time=1500) {
  let self = this;
  pixi.stage.addChild(this.black);
  this.black.alpha = 1;

  var tween = new TWEEN.Tween(self.black)
    .to({alpha: 0})
    .duration(fade_time)
    .onComplete(function() {
      pixi.stage.removeChild(self.black);
    })
    .start();
}


Game.prototype.popScreens = function(old_screen, new_screen) {
  var self = this;
  console.log("switching from " + old_screen + " to " + new_screen);
  pixi.stage.removeChild(this.screens[old_screen]);
  pixi.stage.removeChild(this.screens[new_screen]);
  pixi.stage.addChild(this.screens[old_screen]);
  pixi.stage.addChild(this.screens[new_screen]);
  pixi.stage.addChild(this.monitor_overlay);
  this.screens[old_screen].position.x = 0;
  this.screens[new_screen].position.x = 0;
  for (var i = 0; i < this.screens.length; i++) {
    if (this.screens[i] == new_screen) {
      this.screens[i].visible = true;
    } else {
      this.screens[i].visible = false;
      this.clearScreen(this.screens[i]);
    }
  }
  this.clearScreen(this.screens[old_screen]);
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
  outline.width = 850;
  outline.height = 230;
  outline.anchor.set(0.5, 0.5);
  outline.position.set(-1, -1);
  outline.tint = 0xDDDDDD;
  this.alertBox.addChild(outline);
  this.alertBox.outline = outline;

  var backingGrey = PIXI.Sprite.from(PIXI.Texture.WHITE);
  backingGrey.width = 850;
  backingGrey.height = 230;
  backingGrey.anchor.set(0.5, 0.5);
  backingGrey.position.set(4, 4);
  backingGrey.tint = PIXI.utils.rgb2hex([0.8, 0.8, 0.8]);
  this.alertBox.addChild(backingGrey);
  this.alertBox.backingGrey = backingGrey;

  var backingWhite = PIXI.Sprite.from(PIXI.Texture.WHITE);
  backingWhite.width = 850;
  backingWhite.height = 230;
  backingWhite.anchor.set(0.5, 0.5);
  backingWhite.position.set(0,0);
  backingWhite.tint = 0xFFFFFF;
  this.alertBox.addChild(backingWhite);
  this.alertBox.backingWhite = backingWhite;

  this.alertBox.alertText = new PIXI.Text("EH. OKAY.", {fontFamily: "Press Start 2P", fontSize: 36, fill: 0x000000, letterSpacing: 6, align: "center"});
  this.alertBox.alertText.anchor.set(0.5,0.5);
  this.alertBox.alertText.position.set(0, 0);
  this.alertBox.addChild(this.alertBox.alertText);

  this.alertBox.interactive = true;
  this.alertBox.buttonMode = true;
}


Game.prototype.gameOverScreen = function(delay_time, force_exit = false) {
  let self = this;

  delay(function() {
    if (!force_exit && self.game_type_selection == 0 
      && (self.difficulty_level == "EASY" || self.difficulty_level == "MEDIUM"
          || (self.difficulty_level == "HARD" && self.continues > 0))) {
      if (self.difficulty_level == "HARD") {
        self.continues -= 1;
      }
      self.initializeGameOver();
      self.switchScreens(self.current_screen, "game_over");
    } else {
      let low_high = self.local_high_scores[self.getModeName()][self.difficulty_level.toLowerCase()][9];
      if (low_high == null || low_high.score < self.score) {
        self.initializeHighScore(self.score);
        self.switchScreens(self.current_screen, "high_score");
      } else {
        self.initialize1pLobby();
        self.switchScreens(self.current_screen, "1p_lobby");
      }
    }

    
  }, delay_time);

}


Game.prototype.showAlert = function(text, action) {
  var self = this;
  pixi.stage.addChild(this.alertMask);
  pixi.stage.addChild(this.alertBox);
  this.alert_last_screen = this.current_screen;
  this.current_screen = "alert";
  this.alertBox.alertText.text = text;

  let measure = new PIXI.TextMetrics.measureText(text, this.alertBox.alertText.style);
  this.alertBox.backingWhite.width = measure.width + 80;
  this.alertBox.backingGrey.width = measure.width + 80;
  this.alertBox.outline.width = measure.width + 80;
  this.alertBox.backingWhite.height = measure.height + 80;
  this.alertBox.backingGrey.height = measure.height + 80;
  this.alertBox.outline.height = measure.height + 80;

  this.alertBox.removeAllListeners();
  this.alertBox.on("pointertap", function() {
    action();
    self.alertBox.visible = false
    self.alertMask.visible = false
    self.current_screen = self.alert_last_screen
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


Game.prototype.comicBubble = function(parent, text, x, y, size=36, font_family="Bangers") {
  let comic_container = new PIXI.Container();
  comic_container.position.set(x, y);
  parent.addChild(comic_container);

  let comic_text = new PIXI.Text(" " + text + " ", {fontFamily: font_family, fontSize: size, fill: 0x000000, letterSpacing: 6, align: "center"});
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

  comic_container.is_comic_bubble = true;

  comic_container.cacheAsBitmap = true;

  return comic_container;
}



