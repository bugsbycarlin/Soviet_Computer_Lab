
//
// This file contains code to test characters for Centrally Planned Economy.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//

cpe_character_types = ["walker", "runner", "construction", "policeman", "traffic", "academic", "partyboy", "businessman", "soldier"]

Game.prototype.initialize1pCpe = function(new_score) {
  let self = this;
  let screen = this.screens["1p_cpe"];

  this.freefalling = [];
  this.shakers = [];

  // if (this.level == null) this.level = 2;
  if (this.score == null) this.score = 0;

  this.display_score = this.score;
  this.next_score_bump = 20;
  this.score_bump_timer = this.markTime();

  this.CpeResetBoard();

  this.cpe_game_state = "pre_game";

  // delay(function() {
  //   self.paused = false;
  //   self.pause_time = 0;
  //   self.start_time = self.markTime();
  //   self.math_game_state = "countdown";
  //   // self.soundEffect("countdown"); // need a better count down sound effect for math game
  //   self.setMusic("marche_slav");
  //   self.monitor_overlay.dissolve();
  // }, 800);
}


Game.prototype.CpeResetBoard = function() {
  let self = this;
  let screen = this.screens["1p_cpe"];

  this.clearScreen(screen);

  this.cpe_background_layer = new PIXI.Container();
  this.cpe_background_layer.scale.set(2, 2);
  screen.addChild(this.cpe_background_layer);
  this.cpe_foreground_layer = new PIXI.Container();
  this.cpe_foreground_layer.scale.set(2, 2);
  screen.addChild(this.cpe_foreground_layer);
  this.cpe_character_layer = new PIXI.Container();
  this.cpe_character_layer.scale.set(2, 2);
  screen.addChild(this.cpe_character_layer);
  this.cpe_effect_layer = new PIXI.Container();
  this.cpe_effect_layer.scale.set(2, 2);
  screen.addChild(this.cpe_effect_layer);

  let background = new PIXI.Sprite(PIXI.Texture.from("Art/CPE/background.png"));
  background.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  background.position.set(0,0);
  this.cpe_background_layer.addChild(background);

  let level_text_backing = new PIXI.Sprite(PIXI.Texture.from("Art/Math_Game/level_text_backing.png"));
  level_text_backing.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  level_text_backing.position.set(734,107);
  level_text_backing.anchor.set(0.5, 0.5);
  this.cpe_background_layer.addChild(level_text_backing);

  let score_text_backing = new PIXI.Sprite(PIXI.Texture.from("Art/Math_Game/level_text_backing.png"));
  score_text_backing.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  score_text_backing.position.set(734,201);
  score_text_backing.anchor.set(0.5, 0.5);
  this.cpe_background_layer.addChild(score_text_backing);

  this.level_label = new PIXI.Text("LEVEL", {fontFamily: "Press Start 2P", fontSize: 18, fill: dark_color, letterSpacing: 2, align: "center"});
  this.level_label.anchor.set(0.5,0.5);
  this.level_label.position.set(level_text_backing.x, level_text_backing.y-11);
  this.level_label.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.cpe_foreground_layer.addChild(this.level_label);

  this.level_text = new PIXI.Text(this.level, {fontFamily: "Press Start 2P", fontSize: 18, fill: dark_color, letterSpacing: 2, align: "center"});
  this.level_text.anchor.set(0.5,0.5);
  this.level_text.position.set(level_text_backing.x, level_text_backing.y+14);
  this.level_text.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.cpe_foreground_layer.addChild(this.level_text);

  this.score_label = new PIXI.Text("SCORE", {fontFamily: "Press Start 2P", fontSize: 18, fill: dark_color, letterSpacing: 2, align: "center"});
  this.score_label.anchor.set(0.5,0.5);
  this.score_label.position.set(score_text_backing.x, score_text_backing.y-11);
  this.score_label.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.cpe_foreground_layer.addChild(this.score_label);

  this.score_text = new PIXI.Text(this.display_score, {fontFamily: "Press Start 2P", fontSize: 18, fill: dark_color, letterSpacing: 2, align: "center"});
  this.score_text.anchor.set(0.5,0.5);
  this.score_text.position.set(score_text_backing.x, score_text_backing.y+14);
  this.score_text.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.cpe_foreground_layer.addChild(this.score_text);

  this.pose_text = new PIXI.Text("idle?", {fontFamily: "Press Start 2P", fontSize: 18, fill: dark_color, letterSpacing: 2, align: "center"});
  this.pose_text.anchor.set(0,0);
  this.pose_text.position.set(20, 20);
  this.pose_text.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.cpe_foreground_layer.addChild(this.pose_text);

  this.test_character = this.makeCpeCharacter(cpe_character_types[0]);
  this.test_character.position.set(
    416, 240
  );
  this.cpe_character_layer.addChild(this.test_character);
  this.shakers.push(this.test_character);
}



Game.prototype.cpeKeyDown = function(ev) {
  let self = this;
  let screen = this.screens["1p_cpe"];

  if (ev.key === "ArrowLeft") {
    this.test_character.nextPose();
    this.pose_text.text = this.test_character.direction;
  } else if (ev.key === "ArrowRight") {
    this.test_character.previousPose();
    this.pose_text.text = this.test_character.direction;
  } else if (ev.key === "ArrowUp") {
    let pose = this.test_character.direction;
    this.cpe_character_layer.removeChild(this.test_character);
    this.test_character = this.makeCpeCharacter(prev(cpe_character_types,this.test_character.character_name));
    this.test_character.position.set(
      416, 240
    );
    if (this.test_character.direction in this.test_character.character_sprite) {
      this.test_character.nextPose();
      this.pose_text.text = this.test_character.direction;
    } else {
      this.test_character.direction = pose;
      this.test_character.updateDirection();
    }
    this.cpe_character_layer.addChild(this.test_character);
  } else if (ev.key === "ArrowDown") {
    let pose = this.test_character.direction;
    this.cpe_character_layer.removeChild(this.test_character);
    this.test_character = this.makeCpeCharacter(next(cpe_character_types,this.test_character.character_name));
    this.test_character.position.set(
      416, 240
    );
    if (this.test_character.direction in this.test_character.character_sprite) {
      this.test_character.nextPose();
      this.pose_text.text = this.test_character.direction;
    } else {
      this.test_character.direction = pose;
      this.test_character.updateDirection();
    }
    this.cpe_character_layer.addChild(this.test_character);
  }
}



Game.prototype.CpeCountdownAndStart = function() {
  var self = this;
  var screen = this.screens["1p_cpe"];

  // if (this.math_game_state == "countdown" && !this.paused) {
  //   let time_remaining = (2400 - (this.timeSince(this.start_time))) / 800;

  //   //this.stalin_text.style.fontSize = 24;
  //   this.rule_label.text = Math.ceil(time_remaining).toString();
  //   if (time_remaining <= 0) {
  //     this.math_game_state = "active";

  //     this.rule_label.text = "Begin working.";
  //     delay(function() {
  //       if (self.rule == "multiples") self.rule_label.text = "Multiples of " + self.rule_value;
  //       if (self.rule == "factors") self.rule_label.text = "Factors of " + self.rule_value;
  //       if (self.rule == "primes") self.rule_label.text = "Prime numbers";
  //       if (self.rule == "starts_with") self.rule_label.text = "Starts with " + self.rule_value;
  //     }, 1600);
  //   }
  // }
}


Game.prototype.CpeUpdate = function(diff) {
  var self = this;
  var screen = this.screens["1p_cpe"];

  let fractional = diff / (1000/30.0);

  this.shakeDamage();
  this.freeeeeFreeeeeFalling(fractional);

  this.CpeCountdownAndStart();

  if (this.test_character == null) return;

  this.test_character.walk();
}



