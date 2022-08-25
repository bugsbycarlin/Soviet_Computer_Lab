
//
// This file contains code to run a math game.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//


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


let cell_offset_x = 151;
let cell_offset_y = 107;
let cell_width = 88;
let cell_height = 64;
let dark_color = 0x28281a;
let medium_color = 0x5d5d5d;

let stalin_phrase_list = [
  "Comrade Stalin disavows %s.",
  "\"%s never existed.\"",
  "\"%s is for Mensheviks.\"",
  "\"%s is subversive.\"",
  "\"%s is bourgeois.\"",
];

let subversive_list = [
  "carrying_1",
  "carrying_2",
  "carrying_3",
  "carrying_4",
  "carrying_5",
  "carrying_6",
  "carrying_7",
  "carrying_8",
  "child_1",
  "child_2",
  "child_3",
  "child_4",
  "child_5",
  "child_6",
  "child_7",
  "child_8",
  "elder_1",
  "elder_2",
  "elder_3",
  "elder_4",
  "townie_1",
  "townie_2",
  "townie_3",
  "grifter",
]

Game.prototype.initializeMathGame = function(new_score) {
  let self = this;
  let screen = this.screens["math_game"];

  this.freefalling = [];
  this.shakers = [];

  // if (this.level == null) this.level = 2;
  if (this.score == null) this.score = 0;

  this.math_game_lives = 4;

  this.display_score = this.score;
  this.next_score_bump = 20;
  this.score_bump_timer = this.markTime();

  this.mathGameResetBoard();

  this.math_game_state = "pre_game";

  if (dice(100) < 70) {
    delay(function() {
      self.mathGameSetChallenge();
    }, 5000 + dice(5000));
  }

  delay(function() {
    self.paused = false;
    self.pause_time = 0;
    self.start_time = self.markTime();
    self.math_game_state = "countdown";
    // self.soundEffect("countdown"); // need a better count down sound effect for math game
    self.setMusic("marche_slav");
    self.monitor_overlay.dissolve();
  }, 800);
}


Game.prototype.mathGameResetBoard = function() {
  let self = this;
  let screen = this.screens["math_game"];

  this.clearScreen(screen);

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

  this.rule_label = new PIXI.Text("Work begins in", {fontFamily: "Press Start 2P", fontSize: 18, fill: dark_color, letterSpacing: 2, align: "center"});
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

  this.stalin_text = new PIXI.Text("", {fontFamily: "Press Start 2P", fontSize: 16, fill: dark_color, letterSpacing: 2, align: "center"});
  this.stalin_text.anchor.set(0,0.5);
  this.stalin_text.position.set(110, 450);
  this.stalin_text.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.math_game_foreground_layer.addChild(this.stalin_text);
  
  this.stalin_icon = new PIXI.Sprite(PIXI.Texture.from("Art/Math_Game/stalin_icon.png"));
  this.stalin_icon.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.stalin_icon.position.set(673,301);
  this.math_game_background_layer.addChild(this.stalin_icon);

  this.stalin_icon.visible = false;

  this.life_stars = [];
  for (let i = 0; i < this.math_game_lives; i++) {
    let star = new PIXI.Sprite(PIXI.Texture.from("Art/Math_Game/star_4.png"));
    star.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
    star.position.set(734 - 26 * (this.math_game_lives - 1)/2 + 26 * i, 32);
    star.anchor.set(0.5, 0.5);
    this.math_game_background_layer.addChild(star);
    this.life_stars.push(star);
  }

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
  this.grigory.cell_y = 4;
  this.grigory.position.set(
    cell_offset_x + this.grigory.cell_x * cell_width,
    cell_offset_y + this.grigory.cell_y * cell_height
  );
  this.math_game_character_layer.addChild(this.grigory);
  this.shakers.push(this.grigory);


  this.subversives = [];
  this.last_subversive_add = this.markTime();
  this.next_subversive_add = 4000 + dice(6000);
}



Game.prototype.mathGameSetGameType = function() {
  let rule_options = [];

  if (this.level >= 1) {
    rule_options.push("multiples");
  }
  if (this.level >= 2) {
    rule_options.push(...["factors", "primes", "starts_with"]);
  }
  // if (this.level >= 5) {
  //   rule_options.push(...["less_than", "greater_than", "contains", "ends_with"]);
  // }
  // if (this.level >= 10) {
  //   rule_options.push(...["equals", "word_length", "phoneme"]);
  // }
  
  shuffleArray(rule_options);

  this.rule = rule_options[0];

  let hot_tile_array = [];
  for (let x = 0; x < 6; x++) {
    for (let y = 0; y < 5; y++) {
      hot_tile_array.push([x,y]);
    }
  }
  shuffleArray(hot_tile_array);
  hot_tile_array = hot_tile_array.slice(0, 5 + dice(3)); // refixfix
  hot_tile_dictionary = {};
  for (let i = 0; i < hot_tile_array.length; i++) {
    hot_tile_dictionary[hot_tile_array[i][0]+"-"+hot_tile_array[i][1]] = 1;
  }

  if (this.rule == "multiples") {
    this.rule_value = dice(Math.min(this.level, 10) + 5) + 1;
    this.rule_list = [];
    for (let i = 1; i <= this.level + 2; i++) {
      this.rule_list.push(i * this.rule_value);
    }

    for (let x = 0; x < 6; x++) {
      for (let y = 0; y < 5; y++) {
        let value = dice((this.level + 2) * this.rule_value);
        if (x + "-" + y in hot_tile_dictionary) {
          value = pick(this.rule_list);
        }
        this.cells[x][y].cell_value = value;
        this.cells[x][y].text = this.cells[x][y].cell_value
      }
    }
  } else if (this.rule == "factors") {
    this.rule_value = dice(Math.min(this.level, 20) + 10) + 3;
    this.rule_list = [];
    for (let i = 1; i <= this.rule_value; i++) {
      if (this.rule_value % i == 0) this.rule_list.push(i);
    }

    for (let x = 0; x < 6; x++) {
      for (let y = 0; y < 5; y++) {
        let value = dice(Math.min(this.level, 20) + 10) + 3;
        if (dice(100) < 45) {
          value = pick(this.rule_list);
        }
        this.cells[x][y].cell_value = value;
        this.cells[x][y].text = this.cells[x][y].cell_value
      }
    }
  } else if (this.rule == "primes") {
    this.rule_value = dice(Math.min(this.level, 20) + 10) + 3;
    this.rule_list = [];

    for (let i = 2; i <= this.rule_value; i++) {
      let prime = true;
      for (let j = 2; j < i; j++) {
        if (i % j == 0) prime = false;
      }
      if (prime) this.rule_list.push(i);
    }

    for (let x = 0; x < 6; x++) {
      for (let y = 0; y < 5; y++) {
        let value = dice(Math.min(this.level, 20) + 10) + 3;
        if (dice(100) < 40) {
          value = pick(this.rule_list);
        }
        this.cells[x][y].cell_value = value;
        this.cells[x][y].text = this.cells[x][y].cell_value
      }
    }
  } else if (this.rule == "starts_with") {
    shuffleArray(shuffle_letters);
    this.rule_value = shuffle_letters[0];
    this.rule_list = {};

    for (let k = 4; k <= 5; k++) {
      for (let i = 0; i < this.enemy_words[k].length; i++) {
        let word = this.enemy_words[k][i];
        if (word[0] == this.rule_value) this.rule_list[word] = 1;
      }
    }
    let matching_words = Object.keys(this.rule_list);
    shuffleArray(matching_words);
    for (let x = 0; x < 6; x++) {
      for (let y = 0; y < 5; y++) {
        words = this.enemy_words[dice(2)+3];
        let value = pick(words);
        if (dice(100) < 40) {
          value = pick(matching_words);
        }
        this.cells[x][y].style.fontSize = 12;
        this.cells[x][y].cell_value = value;
        this.cells[x][y].text = this.cells[x][y].cell_value
      }
    }
  }
}


Game.prototype.mathGameSetChallenge = function() {
  if (this.rule == "multiples" || this.rule == "factors" || this.rule == "primes") {
    this.anti_rule = pick(this.rule_list);
    this.stalin_text.text = pick(stalin_phrase_list).replace("%s", this.anti_rule);
  } else if (this.rule == "starts_with") {
    // shouldn't be the rule letter.
    let choices = [];
    for (let i = 0; i < 26; i++) {
      if (lower_array[i] != this.rule) choices.push(lower_array[i]);
    }
    this.anti_rule = pick(choices).toUpperCase();
    this.stalin_text.text = pick(stalin_phrase_list).replace("%s", "letter " + this.anti_rule);
  }

  
  this.stalin_icon.visible = true;
  this.soundEffect("ding_ding_ding");

  // Have to do this because Stalin might ban all the things you still need to pick up.
  if (this.mathGameCheckVictory()) {
    this.grigory.victorious = true;
  }
}


Game.prototype.mathGameKeyDown = function(ev) {
  let self = this;
  let screen = this.screens["math_game"];

  if (this.grigory == null) return;

  if (this.math_game_state != "active") return;

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
        this.mathGameConsumeCell(this.grigory.cell_x, this.grigory.cell_y)
      }
    }
  } else if (this.grigory.state == "walking" || this.grigory.state == "working") {
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


Game.prototype.mathGameConsumeCell = function(cell_x, cell_y) {
  let result = this.mathGameCheckCellValidity(cell_x, cell_y);

  if (result == true) {

    this.soundEffect("success");
    this.cells[cell_x][cell_y].cell_value = null;
    this.cells[cell_x][cell_y].text = "";
    this.grigory.startWork();
    this.score += this.next_score_bump;
    this.next_score_bump = 20;
    this.score_bump_timer = this.markTime();
    if (this.mathGameCheckVictory()) {
      this.grigory.victorious = true;
    }
  } else {
    this.mathGameHurtCharacter();
  }
}


Game.prototype.mathGameCheckCellValidity = function(cell_x, cell_y) {
  let cell = this.cells[cell_x][cell_y];
  let value = cell.cell_value;
  if (this.rule == "multiples" || this.rule == "factors" || this.rule == "primes") {
    return this.rule_list.includes(value) && (this.anti_rule == null || value != this.anti_rule);
  } else if (this.rule == "starts_with") {
    return value in this.rule_list && (this.anti_rule == null || !value.includes(this.anti_rule));
  }
}


Game.prototype.mathGameCheckVictory = function() {
  let victory = true;
  for (let x = 0; x < 6; x++) {
    for (let y = 0; y < 5; y++) {
      if (this.cells[x][y].cell_value != null && this.mathGameCheckCellValidity(x, y)) victory = false;
    }
  }
  return victory;
}


Game.prototype.mathGameCountdownAndStart = function() {
  var self = this;
  var screen = this.screens["math_game"];

  if (this.math_game_state == "countdown" && !this.paused) {
    let time_remaining = (2400 - (this.timeSince(this.start_time))) / 800;

    //this.stalin_text.style.fontSize = 24;
    this.rule_label.text = Math.ceil(time_remaining).toString();
    if (time_remaining <= 0) {
      this.math_game_state = "active";

      this.rule_label.text = "Begin working.";
      delay(function() {
        if (self.rule == "multiples") self.rule_label.text = "Multiples of " + self.rule_value;
        if (self.rule == "factors") self.rule_label.text = "Factors of " + self.rule_value;
        if (self.rule == "primes") self.rule_label.text = "Prime numbers";
        if (self.rule == "starts_with") self.rule_label.text = "Starts with " + self.rule_value;
      }, 1600);
    }
  }
}


Game.prototype.mathGameAddSubversives = function() {
  if (this.timeSince(this.last_subversive_add) > this.next_subversive_add
    && this.subversives.length < 3) {

    this.last_subversive_add = this.markTime();
    this.next_subversive_add = 2000 + dice(6000);

    let subversive_type = pick(subversive_list);
    let subversive = this.makeCharacter(subversive_type);
    subversive.behavior = subversive_type.split("_")[0];
    subversive.last_move = this.markTime();
    subversive.next_move = 1500 + dice(1500);
    if (subversive.behavior == "elder") {
      subversive.frame_time *= 2;
      subversive.walk_speed *= 0.5;
    }

    // TO DO: fix this so the grifter never appears atop the player or a good square.
    if (subversive.behavior == "grifter") {
      subversive.cell_x = dice(6) - 1;
      subversive.cell_y = dice(2);
      subversive.position.set(
        cell_offset_x + subversive.cell_x * cell_width,
        cell_offset_y + subversive.cell_y * cell_height
      );
    } else {
      let side = pick(["up", "down", "left", "right"]);
      if (side == "up") {
        subversive.cell_y = -1;
        subversive.cell_x = dice(6) - 1;
      } else if (side == "down") {
        subversive.cell_y = 5;
        subversive.cell_x = dice(6) - 1;
      } else if (side == "left") {
        subversive.cell_x = -1;
        subversive.cell_y = dice(5) - 1;
      } else if (side == "right") {
        subversive.cell_x = 6;
        subversive.cell_y = dice(5) - 1;
      }

      if (subversive.behavior == "carrying") {
        if (side == "up") subversive.walk_target = "down";
        if (side == "down") subversive.walk_target = "up";
        if (side == "left") subversive.walk_target = "right";
        if (side == "right") subversive.walk_target = "left";
      }

      subversive.position.set(
        cell_offset_x + subversive.cell_x * cell_width,
        cell_offset_y + subversive.cell_y * cell_height
      );
      subversive.alpha = 0;
      subversive.state = "offscreen_start";
    }

    this.math_game_character_layer.addChild(subversive);
    this.subversives.push(subversive);
  }
}


Game.prototype.mathGameUpdateSubversives = function() {
  var self = this;
  var screen = this.screens["math_game"];

  if (this.math_game_state == "active") {
    for(let i = 0; i < this.subversives.length; i++) {
      let subversive = this.subversives[i];
      if (subversive.state == "offscreen_start") {
        if (subversive.cell_y == -1) {
          subversive.move("down");
          subversive.cell_y += 1;
        } else if (subversive.cell_y == 5) {
          subversive.move("up");
          subversive.cell_y -= 1;
        } else if (subversive.cell_x == -1) {
          subversive.move("right");
          subversive.cell_x += 1;
        } else if (subversive.cell_x == 6) {
          subversive.move("left");
          subversive.cell_x -= 1;
        }
        new TWEEN.Tween(subversive)
          .to({alpha: 1})
          .duration(1000)
          .easing(TWEEN.Easing.Quartic.Out)
          .start();
      } else if (subversive.state == "stopped") {
        if (this.timeSince(subversive.last_move) > subversive.next_move) {
          if (subversive.behavior == "child" || subversive.behavior == "elder") {
            move = dice(4);
            if (move == 1 && (subversive.cell_y < 4 || dice(100) < 20)) {
              subversive.move("down");
              subversive.cell_y += 1;
            } else if (move == 2 && (subversive.cell_x > 0 || dice(100) < 20)) {
              subversive.move("left");
              subversive.cell_x -= 1;
            } else if (move == 3 && (subversive.cell_x < 5 || dice(100) < 20)) {
              subversive.move("right");
              subversive.cell_x += 1;
            } else if (move == 4 && (subversive.cell_y > 0 || dice(100) < 20)) {
              subversive.move("up");
              subversive.cell_y -= 1;
            } 

          } else if (subversive.behavior == "townie") {
            move = dice(9);
            if (move <= 4 && subversive.cell_y < this.grigory.cell_y) {
              subversive.move("down");
              subversive.cell_y += 1;
            } else if (move <= 4 && subversive.cell_y > this.grigory.cell_y) {
              subversive.move("up");
              subversive.cell_y -= 1;
            } else if (move <= 8 && subversive.cell_x < this.grigory.cell_x) {
              subversive.move("right");
              subversive.cell_x += 1;
            } else if (move <= 8 && subversive.cell_x > this.grigory.cell_x) {
              subversive.move("left");
              subversive.cell_x -= 1;
            } else if (move == 9) {  // one third of the time, do a normal move
              move = dice(4);
              if (move == 1 && (subversive.cell_y < 4 || dice(100) < 20)) {
                subversive.move("down");
                subversive.cell_y += 1;
              } else if (move == 2 && (subversive.cell_x > 0 || dice(100) < 20)) {
                subversive.move("left");
                subversive.cell_x -= 1;
              } else if (move == 3 && (subversive.cell_x < 5 || dice(100) < 20)) {
                subversive.move("right");
                subversive.cell_x += 1;
              } else if (move == 4 && (subversive.cell_y > 0 || dice(100) < 20)) {
                subversive.move("up");
                subversive.cell_y -= 1;
              } 
            }
          } else if (subversive.behavior == "carrying") {
            if (this.timeSince(subversive.last_move) > subversive.next_move) {
              subversive.move(subversive.walk_target);
              if (subversive.walk_target == "down") subversive.cell_y += 1;
              if (subversive.walk_target == "up") subversive.cell_y -= 1;
              if (subversive.walk_target == "left") subversive.cell_x -= 1;
              if (subversive.walk_target == "right") subversive.cell_x += 1;
            }
          } else if (subversive.behavior == "grifter") {

          }

          if (subversive.cell_y == -1 || subversive.cell_y == 5
            || subversive.cell_x == -1 || subversive.cell_x == 6) {
            new TWEEN.Tween(subversive)
              .to({alpha: 0.01})
              .duration(400)
              .easing(TWEEN.Easing.Quartic.Out)
              .onComplete(function() {
                subversive.state = "finished"
              })
              .start();
          } 

          subversive.last_move = this.markTime();
          subversive.next_move = 1500 + dice(1500);
          if (subversive.behavior == "elder") subversive.next_move = 3000 + dice(2000);
          if (subversive.behavior == "townie") subversive.next_move = 1000 + dice(1000);
        }
      }
    }
  }

  for(let i = 0; i < this.subversives.length; i++) {
    if (this.subversives[i].state == "walking") {
      this.subversives[i].walk();
    }
  }
}


Game.prototype.mathGameCheckSubversiveHit = function() {
  if (this.grigory.state == "stopped") {
    for(let i = 0; i < this.subversives.length; i++) {
      if (this.subversives[i].state == "stopped" 
        && this.subversives[i].cell_x == this.grigory.cell_x
        && this.subversives[i].cell_y == this.grigory.cell_y) {
        this.makePop(this.math_game_effect_layer, 
          this.subversives[i].x,
          this.subversives[i].y, 0.5, 0.5
        );
        this.mathGameHurtCharacter();
        this.subversives[i].state = "finished";
      }
    }
  }

  let new_subversives = [];
  for(let i = 0; i < this.subversives.length; i++) {
    if (this.subversives[i].state != "finished") {
      new_subversives.push(this.subversives[i]);
    } else {
      this.math_game_character_layer.removeChild(this.subversives[i]);
      this.last_subversive_add = this.markTime();
    }
  }
  this.subversives = new_subversives;
}


Game.prototype.mathGameHurtCharacter = function() {
  var self = this;

  flicker(this.grigory.character_sprite[this.grigory.direction], 200, 0xFFFFFF, 0xcd0000);
  this.soundEffect("hurt");
  this.grigory.state = "ouch";
  this.grigory.ouch_time = this.markTime();
  this.grigory.shake = this.markTime();
  this.life_stars[this.math_game_lives - 1].visible = false;
  this.makePop(this.math_game_effect_layer, 
    this.life_stars[this.math_game_lives - 1].x,
    this.life_stars[this.math_game_lives - 1].y, 0.4, 0.4
  );
  this.math_game_lives -= 1;
  if (this.math_game_lives == 0) {
    this.rule_label.text = "Suspicious...";
    this.soundEffect("game_over");
    this.math_game_state = "post_game_defeat";
    this.grigory.startDefeat();

    for (let i = 0; i < this.subversives.length; i++) {
      let subversive = this.subversives[i];
      new TWEEN.Tween(subversive)
        .to({alpha: 0.01})
        .duration(400)
        .easing(TWEEN.Easing.Quartic.Out)
        .onComplete(function() {
          subversive.visible = false;
        })
        .start();
    }

    this.executioner = this.makeCharacter("executioner");
    this.shakers.push(this.executioner);
    this.executioner.last_move = this.markTime();
    this.executioner.next_move = 500 + dice(500);

    this.executioner.cell_y = this.grigory.cell_y;
    if (this.grigory.cell_x > 2) {
      this.executioner.cell_x = -1;
      this.executioner.walk_target = "right";
    } else {
      this.executioner.cell_x = 6;
      this.executioner.walk_target = "left";
    }

    this.executioner.position.set(
      cell_offset_x + this.executioner.cell_x * cell_width,
      cell_offset_y + this.executioner.cell_y * cell_height
    );
    this.executioner.alpha = 0;
    this.executioner.state = "offscreen_start";
    this.executioner.sequence = "approach";

    this.math_game_character_layer.addChild(this.executioner);
  }
}


Game.prototype.mathGameUpdateExecutioner = function() {
  var self = this;
  var screen = this.screens["math_game"];

  if (this.math_game_state == "post_game_defeat") {
    if (this.timeSince(this.executioner.last_move) > this.executioner.next_move) {
      if (this.executioner.state == "offscreen_start") {
        new TWEEN.Tween(this.executioner)
          .to({alpha: 1})
          .duration(1000)
          .easing(TWEEN.Easing.Quartic.Out)
          .start();
      }

      if (this.executioner.sequence == "approach") {
        if (this.executioner.walk_target == "right" 
          && this.executioner.cell_x < this.grigory.cell_x - 1) {
          this.executioner.move("right");
          this.executioner.cell_x += 1;
        } else if (this.executioner.walk_target == "left" 
          && this.executioner.cell_x > this.grigory.cell_x + 1) {
          this.executioner.move("left");
          this.executioner.cell_x -= 1;
        }

        if ((this.executioner.walk_target == "left" 
          && this.executioner.cell_x == this.grigory.cell_x + 1)
        || (this.executioner.walk_target == "right" 
          && this.executioner.cell_x == this.grigory.cell_x - 1)) {
          this.executioner.sequence = "engage_1";
          this.rule_label.text = "Party traitor!";
        }
      } else if (this.executioner.sequence == "engage_1") {
        this.executioner.shake = this.markTime();
        this.executioner.sequence = "engage_2";
      } else if (this.executioner.sequence == "engage_2") {
        this.executioner.shake = this.markTime();
        this.executioner.sequence = "arrest";
        this.rule_label.text = "Come with me.";
      } else if (this.executioner.sequence == "arrest") {
        if (this.executioner.walk_target == "right") {
          this.executioner.move("right");
          this.executioner.cell_x += 1;
          this.grigory.move("right");
          this.grigory.cell_x += 1;
        } else if (this.executioner.walk_target == "left") {
          this.executioner.move("left");
          this.executioner.cell_x -= 1;
          this.grigory.move("left");
          this.grigory.cell_x -= 1;
        }

        if (this.grigory.cell_x == -1 || this.grigory.cell_x == 6) {
          new TWEEN.Tween(this.grigory)
            .to({alpha: 0.01})
            .duration(400)
            .easing(TWEEN.Easing.Quartic.Out)
            .start();
          //this.rule_label.text = "Grigory has vanished.";
        }

        if (this.executioner.cell_x == -1 || this.executioner.cell_x == 6) {
          new TWEEN.Tween(this.executioner)
            .to({alpha: 0.01})
            .duration(400)
            .easing(TWEEN.Easing.Quartic.Out)
            .start();
          this.executioner.sequence = "after_arrest";
          this.gameOverScreen(800);
        }
      }

      this.executioner.last_move = this.markTime();
      this.executioner.next_move = 400 + dice(500);
    }

    if (this.executioner.state == "walking") {
      this.executioner.walk();
    }
  }
}


Game.prototype.mathGameUpdate = function(diff) {
  var self = this;
  var screen = this.screens["math_game"];

  let fractional = diff / (1000/30.0);

  this.shakeDamage();
  this.freeeeeFreeeeeFalling(fractional);

  this.mathGameCountdownAndStart();

  if (this.grigory == null) return;

  if (this.grigory.state == "stopped" && this.grigory.victorious == true) {
    this.rule_label.text = "Worker Victory!";
    this.soundEffect("victory");
    this.math_game_state = "post_game_victory";
    this.grigory.startVictory();

    for (let i = 0; i < this.subversives.length; i++) {
      new TWEEN.Tween(this.subversives[i])
        .to({alpha: 0.01})
        .duration(400)
        .easing(TWEEN.Easing.Quartic.Out)
        .start();
    }

    //flicker(this.stalin_text, 500, 0xFFFFFF, 0x67d8ef);
    delay(function() {
      self.nextFlow();
    }, 2000);
  }

  if (this.grigory.state == "victory") {
    this.grigory.victory();
  } else if (this.grigory.state == "defeat") {
    this.grigory.defeat();
    this.stopMusic();
  } else if (this.grigory.state == "walking") {
    this.grigory.walk();
    if (this.grigory.state == "stopped" && this.queued_move != null) {
      this.mathGameKeyDown({key: this.queued_move})
      this.queued_move = null;
    }
  } else if (this.grigory.state == "working") {
    this.grigory.work();
    if (this.grigory.state == "stopped" 
      && this.queued_move != null
      && this.math_game_state == "active") {
      this.mathGameKeyDown({key: this.queued_move})
      this.queued_move = null;
    }
  } else if (this.grigory.state == "ouch" && this.timeSince(this.grigory.ouch_time) > 200) {
    this.grigory.state = "stopped";
  }

  if (this.math_game_state == "active") this.mathGameAddSubversives();
  this.mathGameUpdateSubversives();
  if (this.math_game_state == "active") this.mathGameCheckSubversiveHit();

  if (this.math_game_state == "post_game_defeat") {
    this.mathGameUpdateExecutioner();
  }

  if (this.math_game_state == "active") {
    if (this.timeSince(this.score_bump_timer) > 500) {
      this.next_score_bump -= 1;
      if (this.next_score_bump < 5) this.next_score_bump = 5;
      this.score_bump_timer = this.markTime();
    }

    if (this.display_score < this.score) this.display_score += 1;

    this.score_text.text = this.display_score;
  }

  // this.spellingHelp();
  // this.updateWPM();
  // this.shakeDamage();
  // this.launchpad.checkError();
  // this.freeeeeFreeeeeFalling(fractional);

  // this.enemyAction();

  // this.launchLettersFromQueue();
  // this.boostRockets(fractional);
  // this.checkRocketCollisions();
  // this.checkBaseCollisions();
  // this.checkEndCondition();
  // this.cleanRockets();
}



