
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

  this.cpe_game_state = null;

  this.freefalling = [];
  this.shakers = [];

  if (this.level == null) this.level = 1;
  if (this.score == null) this.score = 0;

  this.display_score = this.score;
  this.next_score_bump = 20;
  this.score_bump_timer = this.markTime();

  this.config = cpe_level_config[this.level];

  this.CpeResetBoard();

  this.cpe_game_state = "pre_game";

  this.walker_spawn_delay = 1000;
  this.walker_last_spawn = this.markTime();

  this.spawnWalkers(true);

  delay(function() {
    self.paused = false;
    self.pause_time = 0;
    self.start_time = self.markTime();
    self.cpe_game_state = "countdown";
    // self.soundEffect("countdown"); // need a better count down sound effect for math game
    // self.setMusic("marche_slav");
    self.monitor_overlay.dissolve();
  }, 800);
}


Game.prototype.CpeResetBoard = function() {
  let self = this;
  let screen = this.screens["1p_cpe"];

  this.clearScreen(screen);

  this.cpe_layers = {};
  let layers = this.cpe_layers;

  this.terrain = {};
  let terrain = this.terrain;

  layers["open"] = new PIXI.Container();
  layers["open"].scale.set(2, 2);
  screen.addChild(layers["open"]);
  layers["filled"] = new PIXI.Container();
  layers["filled"].scale.set(2, 2);
  screen.addChild(layers["filled"]);
  layers["character"] = new PIXI.Container();
  layers["character"].scale.set(2, 2);
  screen.addChild(layers["character"]);
  layers["distraction"] = new PIXI.Container();
  layers["distraction"].scale.set(2, 2);
  screen.addChild(layers["distraction"]);
  layers["death"] = new PIXI.Container();
  layers["death"].scale.set(2, 2);
  screen.addChild(layers["death"]);
  layers["floating"] = new PIXI.Container();
  layers["floating"].scale.set(2, 2);
  screen.addChild(layers["floating"]);
  layers["effect"] = new PIXI.Container();
  layers["effect"].scale.set(2, 2);
  screen.addChild(layers["effect"]);
  layers["display"] = new PIXI.Container();
  layers["display"].scale.set(2, 2);
  screen.addChild(layers["display"]);

  for (const item of ["open", "filled", "distraction", "death", "floating"]) {
    console.log(item);
    console.log("Art/CPE/Levels/cpe_level_" 
      + this.level + "_"
      + item + ".png")
    terrain[item] = new PIXI.Sprite(
      PIXI.Texture.from("Art/CPE/Levels/cpe_level_" 
      + this.level + "_"
      + item + ".png"));
    terrain[item].texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
    terrain[item].position.set(0,0);
    layers[item].addChild(terrain[item])
  }

  this.level_width = terrain["open"].width;
  this.level_height = terrain["open"].height;

  for (const item of ["open", "filled", "distraction", "death", "floating", "character", "effect"]) {
    layers[item].position.set(0, 2 * (this.height/2 - this.level_height))
  }
 
  // this.cpeMakeVoxels();
  this.cpeMakeIllegalArea();
  

  // let level_text_backing = new PIXI.Sprite(PIXI.Texture.from("Art/Math_Game/level_text_backing.png"));
  // level_text_backing.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  // level_text_backing.position.set(734,107);
  // level_text_backing.anchor.set(0.5, 0.5);
  // this.cpe_open_layer.addChild(level_text_backing);

  // let score_text_backing = new PIXI.Sprite(PIXI.Texture.from("Art/Math_Game/level_text_backing.png"));
  // score_text_backing.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  // score_text_backing.position.set(734,201);
  // score_text_backing.anchor.set(0.5, 0.5);
  // this.cpe_open_layer.addChild(score_text_backing);

  // this.level_label = new PIXI.Text("LEVEL", {fontFamily: "Press Start 2P", fontSize: 18, fill: dark_color, letterSpacing: 2, align: "center"});
  // this.level_label.anchor.set(0.5,0.5);
  // this.level_label.position.set(level_text_backing.x, level_text_backing.y-11);
  // this.level_label.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  // this.cpe_fill_layer.addChild(this.level_label);

  // this.level_text = new PIXI.Text(this.level, {fontFamily: "Press Start 2P", fontSize: 18, fill: dark_color, letterSpacing: 2, align: "center"});
  // this.level_text.anchor.set(0.5,0.5);
  // this.level_text.position.set(level_text_backing.x, level_text_backing.y+14);
  // this.level_text.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  // this.cpe_fill_layer.addChild(this.level_text);

  // this.score_label = new PIXI.Text("SCORE", {fontFamily: "Press Start 2P", fontSize: 18, fill: dark_color, letterSpacing: 2, align: "center"});
  // this.score_label.anchor.set(0.5,0.5);
  // this.score_label.position.set(score_text_backing.x, score_text_backing.y-11);
  // this.score_label.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  // this.cpe_fill_layer.addChild(this.score_label);

  // this.score_text = new PIXI.Text(this.display_score, {fontFamily: "Press Start 2P", fontSize: 18, fill: dark_color, letterSpacing: 2, align: "center"});
  // this.score_text.anchor.set(0.5,0.5);
  // this.score_text.position.set(score_text_backing.x, score_text_backing.y+14);
  // this.score_text.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  // this.cpe_fill_layer.addChild(this.score_text);

  this.pose_text = new PIXI.Text("idle?", {fontFamily: "Press Start 2P", fontSize: 18, fill: dark_color, letterSpacing: 2, align: "center"});
  this.pose_text.anchor.set(0,0);
  this.pose_text.position.set(20, 20);
  this.pose_text.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  layers["display"].addChild(this.pose_text);

  terrain["filled"].tint = 0xFF00FF;

  this.screen_vx = 0;
  this.screen_vy = 0;

  this.walkers = [];
}


// This method turns the fill background into a 2d map of
// 2x2 pixel tiles which can be used to block walkers
// and can also be destroyed by bulldozers.
// It's a map so we can skip every other x and every other y.
Game.prototype.cpeMakeVoxels = function() {
  let self = this;
  let terrain = this.terrain;
  let layers = this.cpe_layers;
  
  let pixels = pixi.renderer.extract.pixels(terrain["filled"]);
  this.voxels = {};

  for (let i = 0; i < this.level_width; i += 2) {
    this.voxels[i] = {};
  }

  for (j = 0; j < this.level_height; j += 2) {
    for (let i = 0; i < this.level_width; i += 2) {
      let p0 = (this.level_width * j + i) * 4;
      let p1 = (this.level_width * j + i + 1) * 4;
      let p2 = (this.level_width * (j+1) + i) * 4;
      let p3 = (this.level_width * (j+1) + i+1) * 4;
      if(pixels[p0 + 3] > 40 || pixels[p1 + 3] > 40 || pixels[p2 + 3] > 40 || pixels[p3 + 3] > 40) {
        let voxel = PIXI.Sprite.from(PIXI.Texture.WHITE);
        voxel.width = 2;
        voxel.height = 2;
        voxel.tint = 0xFF0000;
        voxel.position.set(i, j);
        voxel.alpha = 0.4;
        this.voxels[i][j] = voxel;
        layers["filled"].addChild(voxel);
      }
    }
  }
}

Game.prototype.cpeMakeIllegalArea = function() {
  let self = this;
  let terrain = this.terrain;
  let layers = this.cpe_layers;
  
  let pixels = pixi.renderer.extract.pixels(terrain["filled"]);
  this.illegal_area = {};

  for (let i = 0; i < this.level_width; i += 2) {
    this.illegal_area[i] = {};
  }

  for (j = 0; j < this.level_height; j += 2) {
    for (let i = 0; i < this.level_width; i += 2) {
      let p0 = (this.level_width * j + i) * 4;
      let p1 = (this.level_width * j + i + 1) * 4;
      let p2 = (this.level_width * (j+1) + i) * 4;
      let p3 = (this.level_width * (j+1) + i+1) * 4;
      if(pixels[p0 + 3] > 40 || pixels[p1 + 3] > 40 || pixels[p2 + 3] > 40 || pixels[p3 + 3] > 40) {
        this.illegal_area[i][j] = true;
      }
    }
  }
}


Game.prototype.cpeKeyDown = function(ev) {
  let self = this;
  let screen = this.screens["1p_cpe"];  
}



Game.prototype.cpeCountdownAndStart = function() {
  var self = this;
  var screen = this.screens["1p_cpe"];

  if (this.cpe_game_state == "countdown" && !this.paused) {
    let time_remaining = (2400 - (this.timeSince(this.start_time))) / 800;

    //this.stalin_text.style.fontSize = 24;
    // this.rule_label.text = Math.ceil(time_remaining).toString();
    if (time_remaining <= 0) {
      this.cpe_game_state = "active";
      this.walker_last_spawn = this.markTime();

      // this.rule_label.text = "Begin working.";
    }
  }
}


Game.prototype.cpeMoveScreen = function(fractional) {
  let self = this;
  let keymap = this.keymap;
  let layers = this.cpe_layers;

  const cpe_screen_acceleration = 3.5;
  const cpe_screen_max_speed = 18;

  if (keymap["ArrowRight"]) {
    this.screen_vx += cpe_screen_acceleration;
    if (this.screen_vx > cpe_screen_max_speed) this.screen_vx = cpe_screen_max_speed;
  }
  if (keymap["ArrowLeft"]) {
    this.screen_vx -= cpe_screen_acceleration;
    if (this.screen_vx < -cpe_screen_max_speed) this.screen_vx = -cpe_screen_max_speed;
  }
  if (keymap["ArrowUp"]) {
    this.screen_vy -= cpe_screen_acceleration;
    if (this.screen_vy < -cpe_screen_max_speed) this.screen_vy = -cpe_screen_max_speed;
  }
  if (keymap["ArrowDown"]) {
    this.screen_vy += cpe_screen_acceleration;
    if (this.screen_vy > cpe_screen_max_speed) this.screen_vy = cpe_screen_max_speed;
  }
  
  for (const item of ["open", "filled", "distraction", "death", "floating", "character", "effect"]) {
    layers[item].x -= this.screen_vx * fractional;
    layers[item].y -= this.screen_vy * fractional;

    if (layers[item].x < 2 * (this.width/2 - this.level_width)) {
      layers[item].x = 2 * (this.width/2 - this.level_width);
    }
    if (layers[item].x > 0) {
      layers[item].x = 0;
    }

    if (layers[item].y < 2 * (this.height/2 - this.level_height)) {
      layers[item].y = 2 * (this.height/2 - this.level_height);
    }
    if (layers[item].y > 0) {
      layers[item].y = 0;
    }
  }

  this.screen_vx *= 0.93;
  this.screen_vy *= 0.93;
}


Game.prototype.spawnWalkers = function(force=false) {
  let layers = this.cpe_layers;

  if (force || (this.cpe_game_state == "active" && this.timeSince(this.walker_last_spawn) > this.walker_spawn_delay)) {
    let walker = this.makeCpeCharacter("walker");
    walker.position.set(
      this.config.start[0], this.config.start[1]
    );
    layers["character"].addChild(walker);
    walker.setState("directed_walk", "right");
    this.shakers.push(walker);
    this.walkers.push(walker);

    this.walker_last_spawn = this.markTime();
  }
}


Game.prototype.updateWalkers = function() {
  for (let i = 0; i < this.walkers.length; i++) {
    this.walkers[i].update(this.illegal_area, this.level_width, this.level_height);
  }
}


Game.prototype.CpeUpdate = function(diff) {
  var self = this;
  var screen = this.screens["1p_cpe"];

  let fractional = diff / (1000/30.0);

  this.shakeDamage();
  this.freeeeeFreeeeeFalling(fractional);

  this.cpeCountdownAndStart();

  if (this.cpe_game_state == null) return;

  this.cpeMoveScreen(fractional);
  this.spawnWalkers();
  this.updateWalkers();
}



