
pixi = null;

function detectMob() {
  const toMatch = [
      /Android/i,
      /webOS/i,
      /iPhone/i,
      /iPad/i,
      /iPod/i,
      /BlackBerry/i,
      /Windows Phone/i
  ];

  return toMatch.some((toMatchItem) => {
      return navigator.userAgent.match(toMatchItem);
  });
}

letter_values = {
  "A": 1,
  "B": 4,
  "C": 3,
  "D": 2,
  "E": 1,
  "F": 5,
  "G": 3,
  "H": 4,
  "I": 1,
  "J": 7,
  "K": 4,
  "L": 2,
  "M": 3,
  "N": 2,
  "O": 1,
  "P": 3,
  "Q": 6,
  "R": 1,
  "S": 1,
  "T": 1,
  "U": 2,
  "V": 6,
  "W": 3,
  "X": 6,
  "Y": 4,
  "Z": 8,
}

const letter_array = Object.keys(letter_values);
const lower_array = [];
for (i in letter_array) {
  lower_array.push(letter_array[i].toLowerCase());
}
const shuffle_letters = [];
for (i in letter_array) {
  shuffle_letters.push(letter_array[i]);
}

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

class Game {
  constructor() {

    var self = this;

    // TODO: dynamically choose width and height according to aspect ratio.
    // Browser and iphone are 1280x720, and ipad is 1280x960.
    // Not yet sure what are the acceptable widths and heights of this game.
    this.width = 768;
    this.height = 1024;
    // this.width = 1024;
    // this.height = 768;
    if (detectMob()) {
      // this.width = 600;
      // this.height = 768;
      // document.getElementById("mainDiv").style.width = 1024;
      // document.getElementById("mainDiv").style.marginLeft = -512;
    }

    document.addEventListener("keydown", function(ev) {self.handleKeyDown(ev)}, false);

    this.loadWords();

    // Create the pixi application
    pixi = new PIXI.Application(this.width, this.height, {antialias: true});
    document.getElementById("mainDiv").appendChild(pixi.view);
    pixi.renderer.backgroundColor = 0xFFFFFF;
    pixi.renderer.resize(this.width,this.height);

    this.multiplayer = new Multiplayer(this);

    this.initialize();
    this.resetTitle();

    this.current_scene = "title";

    setInterval(function() {self.update()},33);

    window.addEventListener("unload", function(ev) {
      if (self.game_code != "" && self.player > 0) {
        self.multiplayer.leaveGame(self.game_code, self.player)
        self.resetTitle();
      }
    })
  }


  initialize() {
    var self = this;
    this.scenes = [];
    this.scenes["title"] = new PIXI.Container();
    this.scenes["setup_create"] = new PIXI.Container();
    this.scenes["setup_create"].position.x = this.width;
    this.scenes["setup_join"] = new PIXI.Container();
    this.scenes["setup_join"].position.x = this.width;
    this.scenes["setup_watch"] = new PIXI.Container();
    this.scenes["setup_watch"].position.x = this.width;
    this.scenes["lobby"] = new PIXI.Container();
    this.scenes["lobby"].position.x = this.width;
    this.scenes["volley"] = new PIXI.Container();
    this.scenes["volley"].position.x = 2 * this.width;
    pixi.stage.addChild(this.scenes["title"]);
    pixi.stage.addChild(this.scenes["setup_create"]);
    pixi.stage.addChild(this.scenes["setup_join"]);
    pixi.stage.addChild(this.scenes["setup_watch"]);
    pixi.stage.addChild(this.scenes["lobby"]);
    pixi.stage.addChild(this.scenes["volley"]);


    this.scenes["solo"] = new PIXI.Container();
    this.scenes["solo"].position.x = this.width;
    pixi.stage.addChild(this.scenes["solo"]);


    this.alertMask = new PIXI.Container();
    pixi.stage.addChild(this.alertMask);
    this.alertBox = new PIXI.Container();
    pixi.stage.addChild(this.alertBox);

    this.conclusionMask = new PIXI.Container();
    pixi.stage.addChild(this.conclusionMask);

    if (!PIXI.Loader.shared.resources["Art/fire.json"]) {
      PIXI.Loader.shared.add("Art/fire.json").load(function() {
        self.initializeTitleScreen();

        if (!PIXI.Loader.shared.resources["Art/explosion.json"]) {
          PIXI.Loader.shared.add("Art/explosion.json").load(function() {
          });
        }
      });
    }
    
    this.initializeAlertBox();
  }


  loadWords() {
    var self = this;
    this.legal_words = {};
    let enemy_word_dict = {};
    for (var i = 0; i <= 10; i++) {
      enemy_word_dict[i] = {};
    }

    var request = new XMLHttpRequest();
    request.open("GET", "Dada/legal_words.txt.gz", true);
    request.responseType = "arraybuffer";
    request.onload = function(e) {

      var word_list = new TextDecoder("utf-8").decode(
        new Zlib.Gunzip(
          new Uint8Array(this.response)
        ).decompress()
      );
      word_list = word_list.split(/\n/);
      for (var i = 0; i < word_list.length; i++) {
        var thing = word_list[i].split(",");
        var word = thing[0];
        var common = thing[1];
        if (word != null && word.length >= 3) {
          self.legal_words[word.toUpperCase()] = 1;
        }
        if (word != null && word.length <= 10) {
          enemy_word_dict[word.length][word.toUpperCase()] = 1;
        }
      }

      self.enemy_words = {};
      for (var i = 0; i <= 10; i++) {
        self.enemy_words[i] = Object.keys(enemy_word_dict[i]);
      }

    };
    request.send();
  }


  quickPlayGame() {
    var self = this;
    this.multiplayer.quickPlayGame(2, function() {
      self.resetSetupLobby();

      self.lobby.game_code.text = "GAME CODE " + self.game_code;

      self.multiplayer.setWatch();

      self.animateSceneSwitch("title", "lobby");
    }, function() {
      self.showAlert("Sorry, Quick Play isn't\nworking right now :-(", function() {

      })
    });
  }


  createGame() {
    this.player = 1;

    var self = this;

    this.multiplayer.createNewGame(self.choices["GAME TYPE"] == "COMPETITIVE" ? "code_comp" : "code_coop", 2, function() {
      self.resetSetupLobby();

      self.lobby.game_code.text = "GAME CODE " + self.game_code;

      self.multiplayer.setWatch();

      self.animateSceneSwitch("setup_create", "lobby");
    })
  }


  joinGame(game_code) {
    this.player = 2;

    var self = this;

    this.multiplayer.joinGame(game_code, function() {
      self.resetSetupLobby();

      self.multiplayer.setWatch();

      self.lobby.game_code.text = "GAME CODE " + self.game_code;

      self.animateSceneSwitch("setup_join", "lobby");
    }, function() {
      self.showAlert("Sorry, I can't find a\ngame with that code :-(", function() {

      })
    });
  }


  watchGame(game_code) {
    this.player = 7;

    var self = this;

    this.multiplayer.watchGame(game_code, function() {
      self.resetSetupLobby();

      self.lobby_ready_button.visible = false;

      self.multiplayer.setWatch();

      self.lobby.game_code.text = "GAME CODE " + self.game_code;

      if (self.state.volley_state != "none") {
        self.initializeVolleyScreen();
        self.setPriorWords();
        self.animateSceneSwitch("setup_watch", "volley");
      } else {
        self.animateSceneSwitch("setup_watch", "lobby");
      }
    }, function() {
      self.showAlert("Sorry, I can't find a\ngame with that code :-(", function() {

      })
    });
  }


  soloGame() {
    this.player = 1;

    var self = this;

    self.initializeSoloScreen();
    self.animateSceneSwitch("title", "solo");
  }


  requestRematch() {

    if (this.player == 1) {
      this.multiplayer.update({
        player_1_state: "joined",
        origin: "",
        target: "",
        live_word: "",
        volley_state: "none",
      })
    } else if (this.player == 2) {
      this.multiplayer.update({
        player_2_state: "joined",
        origin: "",
        target: "",
        live_word: "",
        volley_state: "none",
      })
    }

    this.lobby_ready_button.enable();

    this.animateSceneSwitch("volley", "lobby");
  }


  animateSceneSwitch(old_scene, new_scene) {
    console.log("switching from " + old_scene + " to " + new_scene);
    var direction = -1;
    if (new_scene == "title" || old_scene == "gameplay") direction = 1;
    this.scenes[new_scene].position.x = direction * -1 * this.width;
    for (var i = 0; i < this.scenes.length; i++) {
      if (this.scenes[i] == new_scene || this.scenes[i] == old_scene) {
        this.scenes[i].visible = true;
      } else {
        this.scenes[i].visible = false;
        this.clearScene(this.scenes[i]);
      }
    }
    var tween_1 = new TWEEN.Tween(this.scenes[old_scene].position)
      .to({x: direction * this.width})
      .duration(1000)
      .easing(TWEEN.Easing.Cubic.InOut)
      .start();
    var tween_2 = new TWEEN.Tween(this.scenes[new_scene].position)
      .to({x: 0})
      .duration(1000)
      .easing(TWEEN.Easing.Cubic.InOut)
      .start();
    this.current_scene = new_scene;
  }


  showAlert(text, action) {
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


  showConclusion(winner) {
    var self = this;

    var text;

    if (winner == 3) {
      text = "Time's up! You got " + this.state.player_1_score + " volleys!";
    } else if (winner == 1) {
      if (this.player == 1) {
        text = "You win, " + this.state.player_1_name + "!";
      } else if (this.player == 2) {
        text = this.state.player_1_name + " wins! You lose.";
      } else {
        text = this.state.player_1_name + " wins!";
      }
    } else if (winner == 2) {
      if (this.player == 2) {
        text = "You win, " + this.state.player_2_name + "!";
      } else if (this.player == 1) {
        text = this.state.player_2_name + " wins! You lose.";
      } else {
        text = this.state.player_2_name + " wins!";
      }
    }

    this.volley.info_text.visible = false;
    this.volley.coop_score.visible = false;
    this.volley.hint_text.visible = false;
    this.volley.back_arrow.visible = false;
    this.play_button.visible = false;
    this.letter_palette.visible = false;
    this.ball.visible = false;
    this.live_word_container.visible = false;
    this.red_underline.visible = false;
    this.blue_underline.visible = false;

    this.conclusion_text.text = text;
    this.conclusion_text.visible = true;

    this.conclusion_rematch_button.visible = true;
    this.conclusion_quit_button.visible = true;
  
  }


  makeTutorialScreen(parent, fade_time, box_left, box_top, box_right, box_bottom, text, text_x, text_y) {

    let tutorial_screen = new PIXI.Container();
    parent.addChild(tutorial_screen);

    let right_mask = PIXI.Sprite.from(PIXI.Texture.WHITE);
    right_mask.anchor.set(0, 0.5);
    right_mask.height = this.height;
    right_mask.width = this.width - box_right;
    right_mask.position.set(box_right, this.height / 2)
    right_mask.alpha = 0.0;
    right_mask.tint = 0x000000;
    tutorial_screen.addChild(right_mask);
    new TWEEN.Tween(right_mask)
      .to({alpha: 0.6})
      .duration(fade_time)
      .start()

    let left_mask = PIXI.Sprite.from(PIXI.Texture.WHITE);
    left_mask.anchor.set(1, 0.5);
    left_mask.height = this.height;
    left_mask.width = box_left;
    left_mask.position.set(box_left, this.height / 2)
    left_mask.alpha = 0.0;
    left_mask.tint = 0x000000;
    tutorial_screen.addChild(left_mask);
    new TWEEN.Tween(left_mask)
      .to({alpha: 0.6})
      .duration(fade_time)
      .start()

    let bottom_mask = PIXI.Sprite.from(PIXI.Texture.WHITE);
    bottom_mask.anchor.set(0, 0);
    bottom_mask.height = this.height - box_bottom;
    bottom_mask.width = box_right - box_left;
    bottom_mask.position.set(box_left, box_bottom)
    bottom_mask.alpha = 0.0;
    bottom_mask.tint = 0x000000;
    tutorial_screen.addChild(bottom_mask);
    new TWEEN.Tween(bottom_mask)
      .to({alpha: 0.6})
      .duration(fade_time)
      .start()

    let top_mask = PIXI.Sprite.from(PIXI.Texture.WHITE);
    top_mask.anchor.set(0, 1);
    top_mask.height = box_top;
    top_mask.width = box_right - box_left;
    top_mask.position.set(box_left, box_top)
    top_mask.alpha = 0.0;
    top_mask.tint = 0x000000;
    tutorial_screen.addChild(top_mask);
    new TWEEN.Tween(top_mask)
      .to({alpha: 0.6})
      .duration(fade_time)
      .start()

    let tutorial_text = new PIXI.Text(text, {fontFamily: "Bebas Neue", fontSize: 30, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
    tutorial_text.anchor.set(0.5,0.5);
    tutorial_text.position.set(text_x, text_y);
    tutorial_screen.addChild(tutorial_text);
    tutorial_text.permanent_x = text_x;
    tutorial_text.permanent_y = text_y;
    tutorial_text.start_time = Date.now();
    tutorial_text.alpha = 0
    tutorial_text.hover = function() {
      tutorial_text.position.set(tutorial_text.permanent_x, tutorial_text.permanent_y + 20 * Math.sin((Date.now() - tutorial_text.start_time) / 400))
    }
    tutorial_screen.tutorial_text = tutorial_text;
    new TWEEN.Tween(tutorial_text)
      .to({alpha: 1})
      .duration(fade_time)
      .start()

    tutorial_screen.fade = function() {
      new TWEEN.Tween(tutorial_screen)
        .to({alpha: 0.0})
        .duration(500)
        .onComplete(function() {
          parent.removeChild(tutorial_screen);
        })
        .start()
    }

    return tutorial_screen;
  }


  makeRocketTile(parent, letter, word_length, letter_number, shift, player, inner_size, outer_size) {
    var self = this;
    let rocket_tile = new PIXI.Container();
    parent.addChild(rocket_tile);
    let gap = outer_size - inner_size;
    let start_y = inner_size / 2 - outer_size;
    let start_x = gap / 2 + outer_size * (letter_number + shift) + inner_size / 2;

    rocket_tile.position.set(start_x, start_y);
    rocket_tile.vy = 0;

    let fire_sprite = this.makeFire(rocket_tile, 0, 48, 0.2, -0.2);
    fire_sprite.visible = false;

    let parachute_sprite = this.makeParachute(rocket_tile, 0, -50, 0.3, 0.3);
    parachute_sprite.visible = false;

    var tile = this.makeTile(rocket_tile, 0, 0, letter, inner_size, inner_size, inner_size, 0xFFFFFF, "", function() {});
    rocket_tile.fire_sprite = fire_sprite;
    rocket_tile.parachute_sprite = parachute_sprite;
    rocket_tile.start_time = Date.now() - Math.floor(Math.random() * 300);
    rocket_tile.parent = parent;
    rocket_tile.value_text = tile.value_text;

    rocket_tile.status = "load";

    new TWEEN.Tween(rocket_tile.position)
      .to({y: start_y - inner_size})
      .duration(400)
      .onComplete(function() {fire_sprite.visible = true; rocket_tile.status = "rocket"; self.soundEffect("rocket");})
      .start()

    rocket_tile.column = letter_number + shift;
    rocket_tile.player = player;
    rocket_tile.letter = letter;
    rocket_tile.value = letter_values[letter];
    rocket_tile.score_value = Math.floor(Math.pow(word_length, 1.5));

    return rocket_tile;
  }


  makeFire(parent, x, y, xScale, yScale) {
    var sheet = PIXI.Loader.shared.resources["Art/fire.json"].spritesheet;
    let fire_sprite = new PIXI.AnimatedSprite(sheet.animations["fire"]);
    fire_sprite.anchor.set(0.5,0.5);
    fire_sprite.position.set(x, y);
    parent.addChild(fire_sprite);
    fire_sprite.animationSpeed = 0.5; 
    fire_sprite.scale.set(xScale, yScale);
    fire_sprite.play();
    return fire_sprite;
  }


  makeParachute(parent, x, y, xScale, yScale) {
    let parachute_sprite = new PIXI.Sprite(PIXI.Texture.from("Art/parachute_v1.png"));
    parachute_sprite.anchor.set(0.5, 0.5);
    parachute_sprite.scale.set(xScale, yScale);
    parachute_sprite.position.set(x, y);
    parent.addChild(parachute_sprite);
    return parachute_sprite;
  }


  makeExplosion(parent, x, y, xScale, yScale, action) {
    var sheet = PIXI.Loader.shared.resources["Art/explosion.json"].spritesheet;
    let explosion_sprite = new PIXI.AnimatedSprite(sheet.animations["explosion"]);
    explosion_sprite.anchor.set(0.5,0.5);
    explosion_sprite.position.set(x, y);
    parent.addChild(explosion_sprite);
    explosion_sprite.animationSpeed = 0.5; 
    explosion_sprite.scale.set(xScale, yScale);
    explosion_sprite.play();
    explosion_sprite.loop = false;
    explosion_sprite.onComplete = function() {
      action();
    }
    return explosion_sprite;
  }


  makeTile(parent, x, y, text, text_size, backing_width, backing_height, backing_color, value, action) {
    var button = this.makeButton(parent, x, y, text, text_size, 6, 0x000000, backing_width, backing_height, backing_color, action);
    button.value_text = new PIXI.Text(value.toString(), {fontFamily: "Bebas Neue", fontSize: text_size / 3, fill: 0xAAAAAA, letterSpacing: 6, align: "center"});
    button.value_text.anchor.set(1,1);
    button.value_text.position.set(backing_width / 2 - 2, backing_height / 2 - 2);
    button.addChild(button.value_text);

    return button;
  }


  makeButton(parent, x, y, text, text_size, text_spacing, text_color, backing_width, backing_height, backing_color, action) {
    var button = new PIXI.Container();
    parent.addChild(button);
    button.position.set(x, y);
    // var button_image = new PIXI.Sprite(PIXI.Texture.from("Art/" + backing_color + "_button_backing.png"));
    // button_image.anchor.set(0.5,0.5);
    button.backing = PIXI.Sprite.from(PIXI.Texture.WHITE);
    button.backing.width = backing_width;
    button.backing.height = backing_height;
    button.backing.anchor.set(0.5, 0.5);
    button.backing.tint = backing_color;
    button.text = new PIXI.Text(text, {fontFamily: "Bebas Neue", fontSize: text_size, fill: text_color, letterSpacing: text_spacing, align: "center"});
    button.text.anchor.set(0.5,0.42);
    button.fronting = PIXI.Sprite.from(PIXI.Texture.WHITE);
    button.fronting.width = backing_width;
    button.fronting.height = backing_height;
    button.fronting.anchor.set(0.5, 0.5);
    button.fronting.alpha = 0.7;
    button.addChild(button.backing);
    button.addChild(button.text);
    button.addChild(button.fronting)
    button.fronting.visible = false;

    button.interactive = true;
    button.buttonMode = true;
    button.hitArea = button.backing.hitArea;
    // button.action = action;
    button.on("pointertap", action);

    button.disable = function() {
      this.fronting.visible = true;
      this.interactive = false;
    }

    button.enable = function() {
      this.fronting.visible = false;
      this.interactive = true;
    }

    return button;
  }


  makeLetterPalette(parent, x, y, action) {
    var palette = new PIXI.Container();
    parent.addChild(palette);
    palette.position.set(x, y);

    palette.letters = [];

    var mat = PIXI.Sprite.from(PIXI.Texture.WHITE);
    mat.width = 13 * 80;
    mat.height = 160;
    mat.anchor.set(0.5, 0.5);
    mat.position.set(-80, 0);
    mat.tint = 0xCCCCCC;
    palette.addChild(mat)

    var letters = [];
    var size = 80;
    letters[0] = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M"];
    letters[1] = ["N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

    for (var h = 0; h < 2; h++) {
      for (var i = 0; i < 13; i++) {
        let letter = letters[h][i];
        var button = this.makeButton(
          palette,
          -7*size + i*size, (h == 0 ? -size/2 : size/2),
          letter, size, 6, 0x000000,
          size, size, ((i+h) % 2 == 0 ? 0xF0F0F0 : 0xFFFFFF),
          //((i+h) % 2 == 0 ? 0xf1e594 : 0xFFFFFF)
          function() {
            if (action != null) {
              new TWEEN.Tween(this)
                .to({rotation: Math.PI / 20.0})
                .duration(70)
                // .easing(TWEEN.Easing.Linear.In)
                .yoyo(true)
                .repeat(1)
                
                .chain(new TWEEN.Tween(this)
                  .to({rotation: Math.PI / -20.0})
                  .duration(70)
                  // .easing(TWEEN.Easing.Linear.In)
                  .yoyo(true)
                  .repeat(1)
                  )
                .start()
              action(letter);
            }
          }
        );
        palette.letters.push(button);
      }
    }
    return palette;
  }


  makeQwertyPalette(parent, size, x, y, action) {
    var palette = new PIXI.Container();
    parent.addChild(palette);
    palette.position.set(x, y);

    palette.letters = {};

    // var size = 72;
    var nominal_width = 10;

    var letters = [];
    letters[0] = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"];
    letters[1] = ["A", "S", "D", "F", "G", "H", "J", "K", "L"];
    letters[2] = ["Z", "X", "C", "V", "B", "N", "M"];

    var mat = PIXI.Sprite.from(PIXI.Texture.WHITE);
    mat.width = nominal_width * size;
    mat.height = size * letters.length;
    mat.anchor.set(0.5, 0.5);
    mat.position.set(0, 0);
    mat.tint = 0xFFFFFF;
    palette.addChild(mat)

    for (var h = 0; h < letters.length; h++) {
      for (var i = 0; i < letters[h].length; i++) {
        let letter = letters[h][i];
        //makeButton(parent, x, y, text, text_size, text_spacing, text_color, backing_width, backing_height, backing_color, action)
        var button = this.makeTile(
          palette,
          -nominal_width/2*size + (i+0.5)*size + (h/2 * size), -1/2 * (letters.length * size) + ((h+0.5) * size),
          letter, size,
          size, size, ((i+h) % 2 == 0 ? 0xF0F0F0 : 0xFFFFFF), "",
          //((i+h) % 2 == 0 ? 0xf1e594 : 0xFFFFFF)
          function() {
            if (this.inner_action != null) {
              new TWEEN.Tween(this)
                .to({rotation: Math.PI / 20.0})
                .duration(70)
                // .easing(TWEEN.Easing.Linear.In)
                .yoyo(true)
                .repeat(1)
                
                .chain(new TWEEN.Tween(this)
                  .to({rotation: Math.PI / -20.0})
                  .duration(70)
                  // .easing(TWEEN.Easing.Linear.In)
                  .yoyo(true)
                  .repeat(1)
                  )
                .start()
              this.inner_action(letter);
            }
          }
        );
        button.inner_action = action;

        palette.letters[letter] = button;
      }
    }
    return palette;
  }


  makeOptionChooser(parent, x, y, options, option_name, button_to_enable) {
    var self = this;
    this.choosers[option_name] = {};
    this.choices[option_name] = -1;
    this.choice_strings[option_name] = options;

    var option_text = new PIXI.Text(option_name, {fontFamily: "Bebas Neue", fontSize: 48, fill: 0x000000, letterSpacing: 6, align: "center"});
    option_text.anchor.set(0.5,0.5);
    option_text.position.set(x, y);
    parent.addChild(option_text);
    
    var option_marker = new PIXI.Sprite(PIXI.Texture.from("Art/blue_check.png"));
    option_marker.anchor.set(0.5, 0.5);
    option_marker.position.set(x - 160, y);
    option_marker.visible = false;
    parent.addChild(option_marker);

    // var x_positions = [];
    // if (options.length == 2) {
    //   x_positions = [self.width * 2/5, self.width * 3/5];
    // } else {
    //   for (var i = 0; i < options.length; i++) {
    //     x_positions.push(self.width * (i+1)/(options.length + 1));
    //   }
    // }
    var left_most_x = x;
    for (var i = 0; i < options.length; i++) {
      let choice_num = i;
      if (x - 10 * (1 + options[i].length) - 20 < left_most_x) {
        left_most_x = x - 10 * (1 + options[i].length) - 20;
      }
      this.makeButton(
        parent,
        x, y + (i+1) * 64,
        options[i], 36, 6, 0x3cb0f3,
        20 * (1 + options[i].length), 60, 0xFFFFFF,
        function() {
          self.choices[option_name] = options[choice_num];
          self.resetOptionsText();
          if (option_marker.visible == false) {
            option_marker.visible = true;
            option_marker.position.y = y + (choice_num+1) * 64;
            option_marker.position.x = left_most_x;
          } else {
            var tween = new TWEEN.Tween(option_marker.position)
              .to({y: y + (choice_num+1) * 64})
              .duration(200)
              .easing(TWEEN.Easing.Cubic.Out)
              .start();
          }
          for (const [key,value] of Object.entries(self.choices)) {
            let enable = true;
            if (value == -1) {
              enable = false;
            }
            if (enable) {
              button_to_enable.enable();
            } else {
              button_to_enable.disable();
            }
          }
        }
      );
    }
  }


  resetTitle() {
    this.player = 0;
    this.state  = {};
    this.choosers = {};
    this.choices = {
      "GAME_TYPE": -1,
      "DIFFICULTY": -1,
    };
    this.choice_strings = {};
    this.game_code = "";
    this.start_time = Date.now();
    this.game_code_letter_choice = 0;
    this.multiplayer.stopWatch();
  }


  clearScene(scene) {
    while(scene.children[0]) { scene.removeChild(scene.children[0]); }
  }


  randomWord() {
    var characters = "abcdefghijklmnopqrstuvwxyz";
    var word = "";
    for (var i = 0; i < 4; i++) {
      word += characters.charAt(Math.floor(Math.random() * characters.length));

    }
    return word;
  }


  render() {
    pixi.renderer.render(pixi.stage);
  }

  handleMouse(ev) {
    // ev.preventDefault();
    // var rect = canvas.getBoundingClientRect();
    // var click_x = Math.floor(ev.clientX - rect.left);
    // var click_y = Math.floor(ev.clientY - rect.top);
    // console.log(click_x + ", " + click_y);

    // if (click_x >= canvas.width * 3/4 - 100 && click_x <= canvas.width * 3/4 + 100
    //   && click_y >= canvas.height * 1/2 - 38 && click_y <= canvas.height * 1/2 + 38) {
    //   console.log("button");
    //  this.multiplayer.updateVolley(this.volley + "-" + this.randomWord());
    // }
  }

  handleKeyDown(ev) {
    // ev.preventDefault();

    if (this.current_scene == "solo" && (this.game_phase == "active" || this.game_phase == "tutorial")) {

      // if the launchpad isn't full, we can keep adding letters
      if (!this.launchpad.full()) {
        for (i in lower_array) {
          if (ev.key === lower_array[i] || ev.key === letter_array[i]) {

            if (this.player_palette.letters[letter_array[i]].interactive == true) {
              this.launchpad.push(this.player_palette, letter_array[i]);
            } else {
              this.soundEffect("negative");
              this.launchpad.flashError();
              this.player_palette.letters[letter_array[i]].error = 5;
            }

            if (this.game_phase == "tutorial" && this.tutorial_number == 1) {
              this.tutorial2();
            }
          }
        }
      }

      if (ev.key === "Backspace" || ev.key === "Delete") {
        this.launchpad.pop();
      }

      if (ev.key === "ArrowRight") {
        this.launchpad.shiftRight();
      }

      if (ev.key === "ArrowLeft") {
        this.launchpad.shiftLeft();
      }

      if (ev.key === "Enter") {
        this.launchpad.launch(this.player_area);
      }

    }
  }


  soundEffect(effect_name) {
    var sound_effect = document.getElementById(effect_name);
    sound_effect.volume = 0.6;
    sound_effect.play();
  }


  setMusic(music_name) {
    var self = this;
    this.music = document.getElementById(music_name);
    this.music.loop = true;
    this.music.volume = 0.7;
    this.music.play();

    // this.music.unbind("ended");
    // this.music.bind("ended", function(){
    //   self.music.trigger("play");
    // });
  }


  fadeMusic(delay) {
    if (this.music != null) {
      var self = this;
      for (let i = 0; i < 14; i++) {
        setTimeout(function() {self.music.volume = (13 - i) / 20;}, delay + 50 * i);
      }
    }
  }
}

function twanimate(time) {
    window.requestAnimationFrame(twanimate);
    TWEEN.update(time);
}
window.requestAnimationFrame(twanimate);

var firebaseConfig = {
  apiKey: "AIzaSyBlhNihmc39kLoWKY-MlG49ItSGJcpXSfQ",
  authDomain: "wordvolley-ccdb6.firebaseapp.com",
  projectId: "wordvolley-ccdb6",
  databaseURL: "https://wordvolley-ccdb6-default-rtdb.firebaseio.com",
  storageBucket: "wordvolley-ccdb6.appspot.com",
  messagingSenderId: "591926001792",
  appId: "1:591926001792:web:d6078dc492a6156604e665",
  measurementId: "G-FB1JPHYKJN",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

game = null;
function initialize() {
  game = new Game();
}
