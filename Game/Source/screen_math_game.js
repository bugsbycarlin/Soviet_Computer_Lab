

let cell_offset_x = 151;
let cell_offset_y = 107;
let cell_width = 88;
let cell_height = 64;
let dark_color = 0x28281a;
let medium_color = 0x5d5d5d;


/*
  Rules:

  multiples of x
  factors of x
  primes
  equality (add subtract mult divide)
  less than X
  greater than Y

  starts with A
  contains A
  ends with A
  oo as in book
*/

/*
  Subversives:

  straight line
  random
  indolent
  seeker

*/

Game.prototype.initializeMathGame = function(new_score) {
  let self = this;
  let screen = this.screens["math_game"];

  this.freefalling = [];
  this.shakers = [];

  if (this.level == null) this.level = 2;
  if (this.score == null) this.score = 0;

  this.display_score = this.score;

  this.mathGameResetBoard();
}


Game.prototype.mathGameResetBoard = function() {
  let self = this;
  let screen = this.screens["math_game"];

  this.clearScreen(screen);
  
  this.math_game_state = "pre_game";

  this.math_game_background_layer = new PIXI.Container();
  this.math_game_background_layer.scale.set(2, 2);
  screen.addChild(this.math_game_background_layer);
  this.math_game_foreground_layer = new PIXI.Container();
  this.math_game_foreground_layer.scale.set(2, 2);
  screen.addChild(this.math_game_foreground_layer);
  this.math_game_character_layer = new PIXI.Container();
  this.math_game_character_layer.scale.set(2, 2);
  screen.addChild(this.math_game_character_layer);
  this.math_game_effect_layer = new PIXI.Container();
  this.math_game_effect_layer.scale.set(2, 2);
  screen.addChild(this.math_game_effect_layer);

  let background = new PIXI.Sprite(PIXI.Texture.from("Art/Math_Game/background.png"));
  background.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  background.position.set(0,0);
  this.math_game_background_layer.addChild(background);

  let board = new PIXI.Sprite(PIXI.Texture.from("Art/Math_Game/board.png"));
  board.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  board.position.set(0,0);
  this.math_game_background_layer.addChild(board);

  let rule_text_backing = new PIXI.Sprite(PIXI.Texture.from("Art/Math_Game/rule_text_backing.png"));
  rule_text_backing.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  rule_text_backing.position.set(369,32);
  rule_text_backing.anchor.set(0.5, 0.5);
  this.math_game_background_layer.addChild(rule_text_backing);

  let level_text_backing = new PIXI.Sprite(PIXI.Texture.from("Art/Math_Game/level_text_backing.png"));
  level_text_backing.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  level_text_backing.position.set(734,107);
  level_text_backing.anchor.set(0.5, 0.5);
  this.math_game_background_layer.addChild(level_text_backing);

  let score_text_backing = new PIXI.Sprite(PIXI.Texture.from("Art/Math_Game/level_text_backing.png"));
  score_text_backing.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  score_text_backing.position.set(734,201);
  score_text_backing.anchor.set(0.5, 0.5);
  this.math_game_background_layer.addChild(score_text_backing);

  this.rule_label = new PIXI.Text("Multiples of 2", {fontFamily: "Press Start 2P", fontSize: 18, fill: dark_color, letterSpacing: 2, align: "center"});
  this.rule_label.anchor.set(0.5,0.5);
  this.rule_label.position.set(rule_text_backing.x, rule_text_backing.y+2);
  this.rule_label.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.math_game_foreground_layer.addChild(this.rule_label);

  this.level_label = new PIXI.Text("LEVEL", {fontFamily: "Press Start 2P", fontSize: 18, fill: dark_color, letterSpacing: 2, align: "center"});
  this.level_label.anchor.set(0.5,0.5);
  this.level_label.position.set(level_text_backing.x, level_text_backing.y-11);
  this.level_label.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.math_game_foreground_layer.addChild(this.level_label);

  this.level_text = new PIXI.Text(this.level, {fontFamily: "Press Start 2P", fontSize: 18, fill: dark_color, letterSpacing: 2, align: "center"});
  this.level_text.anchor.set(0.5,0.5);
  this.level_text.position.set(level_text_backing.x, level_text_backing.y+14);
  this.level_text.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.math_game_foreground_layer.addChild(this.level_text);

  this.score_label = new PIXI.Text("SCORE", {fontFamily: "Press Start 2P", fontSize: 18, fill: dark_color, letterSpacing: 2, align: "center"});
  this.score_label.anchor.set(0.5,0.5);
  this.score_label.position.set(score_text_backing.x, score_text_backing.y-11);
  this.score_label.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.math_game_foreground_layer.addChild(this.score_label);

  this.score_text = new PIXI.Text(this.display_score, {fontFamily: "Press Start 2P", fontSize: 18, fill: dark_color, letterSpacing: 2, align: "center"});
  this.score_text.anchor.set(0.5,0.5);
  this.score_text.position.set(score_text_backing.x, score_text_backing.y+14);
  this.score_text.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.math_game_foreground_layer.addChild(this.score_text);

  this.stalin_text = new PIXI.Text("Comrade Stalin says 2+2=5.", {fontFamily: "Press Start 2P", fontSize: 16, fill: dark_color, letterSpacing: 2, align: "center"});
  this.stalin_text.anchor.set(0,0.5);
  this.stalin_text.position.set(110, 450);
  this.stalin_text.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.math_game_foreground_layer.addChild(this.stalin_text);
  let stalin_icon = new PIXI.Sprite(PIXI.Texture.from("Art/Math_Game/stalin_icon.png"));
  stalin_icon.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  stalin_icon.position.set(673,301);
  this.math_game_background_layer.addChild(stalin_icon);

  this.cells = [];
  for (let x = 0; x < 6; x++) {
    this.cells[x] = [];
    for (let y = 0; y < 5; y++) {
      this.cells[x][y] = new PIXI.Text("", {fontFamily: "Press Start 2P", fontSize: 18, fill: dark_color, letterSpacing: 2, align: "center"});
      this.cells[x][y].anchor.set(0.5,0.5);
      this.cells[x][y].position.set(
        cell_offset_x + x * cell_width, cell_offset_y + y * cell_height);
      this.cells[x][y].texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
      this.math_game_foreground_layer.addChild(this.cells[x][y]);
    }
  }

  this.mathGameSetGameType();

  this.grigory = this.makeCharacter("grigory");
  this.grigory.cell_x = 2;
  this.grigory.cell_y = 2;
  this.grigory.position.set(
    cell_offset_x + this.grigory.cell_x * cell_width,
    cell_offset_y + this.grigory.cell_y * cell_height
  );
  this.math_game_character_layer.addChild(this.grigory);
}



Game.prototype.mathGameSetGameType = function() {
  let rule_options = [];

  if (this.level == 1) {
    rule_options.push("multiples");
  }
  if (this.level >= 2) {
    console.log("yep")
    rule_options.push(...["factors", "primes", "starts_with"]);
  }
  if (this.level >= 5) {
    console.log("yeeeee");
    rule_options.push(...["less_than", "greater_than", "contains", "ends_with"]);
  }
  if (this.level >= 10) {
    rule_options.push(...["equals", "word_length", "phoneme"]);
  }
  
  shuffleArray(rule_options);

  this.rule = rule_options[0];
  this.rule = "multiples";

  if (this.rule == "multiples") {
    this.rule_value = dice(Math.min(this.level, 10) + 5) + 1;
    this.rule_label.text = "Multiples of " + this.rule_value;
    this.rule_list = [];
    for (let i = 1; i <= this.level + 2; i++) {
      this.rule_list.push(i * this.rule_value);
    }

    for (let x = 0; x < 6; x++) {
      for (let y = 0; y < 5; y++) {
        let value = dice((this.level + 2) * this.rule_value);
        if (dice(100) <= 50) {
          let value = this.rule_list[Math.floor(Math.random() * this.rule_list.length)];
        }
        this.cells[x][y].cell_value = value;
        this.cells[x][y].text = this.cells[x][y].cell_value
      }
    }
  } else if (this.rule == "factors") {
    this.rule_value = dice(Math.min(this.level, 20) + 10) + 3;
    this.rule_label.text = "Factors of " + this.rule_value;
    this.rule_list = [];
    for (let i = 1; i <= this.rule_value; i++) {
      if (this.rule_value % i == 0) this.rule_list.push(i);
    }

    for (let x = 0; x < 6; x++) {
      for (let y = 0; y < 5; y++) {
        let value = dice(this.rule_value);
        if (dice(10) <= 5) {
          let value = this.rule_list[Math.floor(Math.random() * this.rule_list.length)];
        }
        this.cells[x][y].cell_value = value;
        this.cells[x][y].text = this.cells[x][y].cell_value
      }
    }
  } else if (this.rule == "primes") {
    this.rule_value = dice(Math.min(this.level, 20) + 10) + 3;
    this.rule_label.text = "Prime numbers"
    this.rule_list = [];

    for (let i = 1; i <= this.rule_value; i++) {
      let prime = true;
      for (let j = 2; j < i; j++) {
        if (i % j == 0) prime = false;
      }
      if (prime) this.rule_list.push(i);
    }

    for (let x = 0; x < 6; x++) {
      for (let y = 0; y < 5; y++) {
        let value = dice(this.rule_value);
        if (dice(10) <= 5) {
          let value = this.rule_list[Math.floor(Math.random() * this.rule_list.length)];
        }
        this.cells[x][y].cell_value = value;
        this.cells[x][y].text = this.cells[x][y].cell_value
      }
    }
  } else if (this.rule == "starts_with") {
    shuffleArray(shuffle_letters);
    this.rule_value = shuffle_letters[0];
    this.rule_label.text = "Starts with " + this.rule_value;
    this.rule_list = {};

    for (let k = 4; k <= 5; k++) {
      for (let i = 0; i < this.enemy_words[k].length; i++) {
        let word = this.enemy_words[k][i];
        if (word[0] == this.rule_value) this.rule_list[word] = 1;
      }
    }
    let matching_words = Object.keys(this.rule_list);
    shuffleArray(matching_words);
    console.log(matching_words);
    for (let x = 0; x < 6; x++) {
      for (let y = 0; y < 5; y++) {
        words = this.enemy_words[dice(2)+3];
        let value = words[Math.floor(Math.random() * words.length)];
        if (dice(100) <= 50) {
          value = matching_words[Math.floor(Math.random() * matching_words.length)];
        }
        console.log(value);
        this.cells[x][y].style.fontSize = 12;
        this.cells[x][y].cell_value = value;
        this.cells[x][y].text = this.cells[x][y].cell_value
      }
    }
  }
}


Game.prototype.mathGameKeyDown = function(ev) {
  let self = this;
  let screen = this.screens["math_game"];

  console.log(ev);

  if (this.grigory == null) return;

  if (this.grigory.state == "stopped") {
    if (ev.key === "ArrowDown" && this.grigory.cell_y < 4) {
      this.grigory.move("down");
      this.grigory.cell_y += 1;
    } else if (ev.key === "ArrowUp" && this.grigory.cell_y > 0) {
      this.grigory.move("up");
      this.grigory.cell_y -= 1;
    } else if (ev.key === "ArrowLeft" && this.grigory.cell_x > 0) {
      this.grigory.move("left");
      this.grigory.cell_x -= 1;
    } else if (ev.key === "ArrowRight" && this.grigory.cell_x < 5) {
      this.grigory.move("right");
      this.grigory.cell_x += 1;
    } else if (ev.key === " ") {
      if (this.cells[this.grigory.cell_x][this.grigory.cell_y].cell_value != null) {
        this.mathGameGetCell(this.grigory.cell_x, this.grigory.cell_y)
      }
    }
  } else if (this.grigory.state == "walking") {
    if (ev.key === "ArrowDown" && this.grigory.cell_y < 4) {
      this.queued_move = "ArrowDown";
    } else if (ev.key === "ArrowUp" && this.grigory.cell_y > 0) {
      this.queued_move = "ArrowUp";
    } else if (ev.key === "ArrowLeft" && this.grigory.cell_x > 0) {
      this.queued_move = "ArrowLeft";
    } else if (ev.key === "ArrowRight" && this.grigory.cell_x < 5) {
      this.queued_move = "ArrowRight";
    } else if (ev.key === " ") {
      this.queued_move = " ";
    }
  }
}


Game.prototype.mathGameGetCell = function(cell_x, cell_y) {
  let cell = this.cells[cell_x][cell_y];
  let value = cell.cell_value;
  if (this.rule == "multiples") {
    console.log(value);
    console.log(this.rule_value);
    if (value % this.rule_value == 0) {
      // Good!
      this.soundEffect("success");
      cell.cell_value = null;
      cell.text = "";
    } else {
      flicker(this.grigory, 200, 0xFFFFFF, 0xcd0000);
      this.soundEffect("negative");
    }

  }
}


Game.prototype.mathGameUpdate = function(diff) {
  var self = this;
  var screen = this.screens["math_game"];

  let fractional = diff / (1000/30.0);

  this.shakeDamage();
  this.freeeeeFreeeeeFalling(fractional);

  if (this.grigory == null) return;

  if (this.grigory.state == "walking") {
    this.grigory.walk();
    if (this.grigory.state == "stopped" && this.queued_move != null) {
      console.log("DOING QUEUED MOVE " + this.queued_move);
      this.mathGameKeyDown({key: this.queued_move})
      this.queued_move = null;
    }
  }

  // this.spellingHelp();
  // this.countdownAndStart();
  // this.updateWPM();
  // this.shakeDamage();
  // this.launchpad.checkError();
  // this.freeeeeFreeeeeFalling(fractional);

  // // Skip the rest if we aren't in active gameplay
  // if (this.game_phase != "active" && (this.game_phase != "tutorial" || this.tutorial_number < 5)) {
  //   return;
  // }

  // this.enemyAction();

  // this.launchLettersFromQueue();
  // this.boostRockets(fractional);
  // this.checkRocketCollisions();
  // this.checkBaseCollisions();
  // this.checkEndCondition();
  // this.cleanRockets();
}



