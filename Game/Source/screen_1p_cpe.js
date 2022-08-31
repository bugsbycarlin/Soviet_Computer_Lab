
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

  this.spawnWalker(true);

  // screen.buttonMode = true;
  // screen.interactive = true;
  // screen.hitArea = new PIXI.Rectangle(0, 0, 800, 600);
  // screen.defaultCursor = "url('Art/CPE/UI/cursor.png') 3 2, auto";

  // this.renderer.plugins.interaction.cursorStyles.default = "url('Art/CPE/UI/cursor.png'),auto";
  this.renderer.plugins.interaction.cursorStyles.default = "url('Art/CPE/UI/cursor.png'),auto";
  this.renderer.plugins.interaction.setCursorMode("url('Art/CPE/UI/cursor.png'),auto");

  // self.setMusic("marche_slav");

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
  layers["distraction"] = new PIXI.Container();
  layers["distraction"].scale.set(2, 2);
  screen.addChild(layers["distraction"]);
  layers["death"] = new PIXI.Container();
  layers["death"].scale.set(2, 2);
  screen.addChild(layers["death"]);
  layers["character"] = new PIXI.Container();
  layers["character"].scale.set(2, 2);
  screen.addChild(layers["character"]);
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
  this.cpeMakeDeathArea();
  
  this.cpeAddAnimations();

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

  // terrain["filled"].tint = 0xFF00FF;

  this.screen_vx = 0;
  this.screen_vy = 0;

  this.characters = [];

  const glyph_gap = 72;

  this.runner_glyph = new PIXI.Sprite(PIXI.Texture.from("Art/CPE/UI/runner_glyph.png"));
  this.runner_glyph.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.runner_glyph.position.set(this.width/2 - 7 * glyph_gap,this.height/2 - glyph_gap);
  this.runner_glyph.anchor.set(0, 0);
  this.runner_glyph.interactive = true;
  this.runner_glyph.on("pointertap", function() {
    self.glyph_cursor.visible = true;
    self.glyph_cursor.position.set(self.runner_glyph.x, self.runner_glyph.y);
    self.job_selection = "runner";
  });
  layers["display"].addChild(this.runner_glyph);

  this.traffic_right_glyph = new PIXI.Sprite(PIXI.Texture.from("Art/CPE/UI/traffic_right_glyph.png"));
  this.traffic_right_glyph.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.traffic_right_glyph.position.set(this.width/2 - 6 * glyph_gap,this.height/2 - glyph_gap);
  this.traffic_right_glyph.anchor.set(0, 0);
  this.traffic_right_glyph.anchor.set(0, 0);
  this.traffic_right_glyph.interactive = true;
  this.traffic_right_glyph.on("pointertap", function() {
    self.glyph_cursor.visible = true;
    self.glyph_cursor.position.set(self.traffic_right_glyph.x, self.traffic_right_glyph.y);
    self.job_selection = "traffic_right";
  });
  layers["display"].addChild(this.traffic_right_glyph);

  this.traffic_left_glyph = new PIXI.Sprite(PIXI.Texture.from("Art/CPE/UI/traffic_left_glyph.png"));
  this.traffic_left_glyph.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.traffic_left_glyph.position.set(this.width/2 - 5 * glyph_gap,this.height/2 - glyph_gap);
  this.traffic_left_glyph.anchor.set(0, 0);
  this.traffic_left_glyph.anchor.set(0, 0);
  this.traffic_left_glyph.interactive = true;
  this.traffic_left_glyph.on("pointertap", function() {
    self.glyph_cursor.visible = true;
    self.glyph_cursor.position.set(self.traffic_left_glyph.x, self.traffic_left_glyph.y);
    self.job_selection = "traffic_left";
  });
  layers["display"].addChild(this.traffic_left_glyph);

  this.traffic_down_glyph = new PIXI.Sprite(PIXI.Texture.from("Art/CPE/UI/traffic_down_glyph.png"));
  this.traffic_down_glyph.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.traffic_down_glyph.position.set(this.width/2 - 4 * glyph_gap,this.height/2 - glyph_gap);
  this.traffic_down_glyph.anchor.set(0, 0);
  this.traffic_down_glyph.anchor.set(0, 0);
  this.traffic_down_glyph.interactive = true;
  this.traffic_down_glyph.on("pointertap", function() {
    self.glyph_cursor.visible = true;
    self.glyph_cursor.position.set(self.traffic_down_glyph.x, self.traffic_down_glyph.y);
    self.job_selection = "traffic_down";
  });
  layers["display"].addChild(this.traffic_down_glyph);

  this.traffic_up_glyph = new PIXI.Sprite(PIXI.Texture.from("Art/CPE/UI/traffic_up_glyph.png"));
  this.traffic_up_glyph.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.traffic_up_glyph.position.set(this.width/2 - 3 * glyph_gap,this.height/2 - glyph_gap);
  this.traffic_up_glyph.anchor.set(0, 0);
  this.traffic_up_glyph.anchor.set(0, 0);
  this.traffic_up_glyph.interactive = true;
  this.traffic_up_glyph.on("pointertap", function() {
    self.glyph_cursor.visible = true;
    self.glyph_cursor.position.set(self.traffic_up_glyph.x, self.traffic_up_glyph.y);
    self.job_selection = "traffic_up";
  });
  layers["display"].addChild(this.traffic_up_glyph);

  this.policeman_glyph = new PIXI.Sprite(PIXI.Texture.from("Art/CPE/UI/policeman_glyph.png"));
  this.policeman_glyph.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.policeman_glyph.position.set(this.width/2 - 2 * glyph_gap,this.height/2 - glyph_gap);
  this.policeman_glyph.anchor.set(0, 0);
  this.policeman_glyph.anchor.set(0, 0);
  this.policeman_glyph.interactive = true;
  this.policeman_glyph.on("pointertap", function() {
    self.glyph_cursor.visible = true;
    self.glyph_cursor.position.set(self.policeman_glyph.x, self.policeman_glyph.y);
    self.job_selection = "policeman";
  });
  layers["display"].addChild(this.policeman_glyph);

  this.construction_glyph = new PIXI.Sprite(PIXI.Texture.from("Art/CPE/UI/construction_glyph.png"));
  this.construction_glyph.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.construction_glyph.position.set(this.width/2 - glyph_gap,this.height/2 - glyph_gap);
  this.construction_glyph.anchor.set(0, 0);
  this.construction_glyph.anchor.set(0, 0);
  this.construction_glyph.interactive = true;
  this.construction_glyph.on("pointertap", function() {
    self.glyph_cursor.visible = true;
    self.glyph_cursor.position.set(self.construction_glyph.x, self.construction_glyph.y);
    self.job_selection = "construction";
  });
  layers["display"].addChild(this.construction_glyph);


  this.glyph_cursor = new PIXI.Sprite(PIXI.Texture.from("Art/CPE/UI/glyph_cursor.png"));
  this.glyph_cursor.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.glyph_cursor.position.set(this.width/2 - 4 * glyph_gap,this.height/2 - glyph_gap);
  this.glyph_cursor.anchor.set(0, 0);
  layers["display"].addChild(this.glyph_cursor);
  this.glyph_cursor.visible = false;

  this.job_selection = null;
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



Game.prototype.cpeMakeDeathArea = function() {
  let self = this;
  let terrain = this.terrain;
  let layers = this.cpe_layers;
  
  let pixels = pixi.renderer.extract.pixels(terrain["death"]);
  this.death_area = {};

  for (let i = 0; i < this.level_width; i += 2) {
    this.death_area[i] = {};
  }

  for (j = 0; j < this.level_height; j += 2) {
    for (let i = 0; i < this.level_width; i += 2) {
      let p0 = (this.level_width * j + i) * 4;
      let p1 = (this.level_width * j + i + 1) * 4;
      let p2 = (this.level_width * (j+1) + i) * 4;
      let p3 = (this.level_width * (j+1) + i+1) * 4;
      if(pixels[p0 + 3] > 40 || pixels[p1 + 3] > 40 || pixels[p2 + 3] > 40 || pixels[p3 + 3] > 40) {
        this.death_area[i][j] = true;
      }
    }
  }
}


Game.prototype.cpeAddAnimations = function() {
  let self = this;
  let terrain = this.terrain;
  let layers = this.cpe_layers;

  for (let i = 0; i < this.config.animations.length; i++) {
    let [name, layer, x, y, speed] = this.config.animations[i];

    let sheet = PIXI.Loader.shared.resources["Art/CPE/Animations/" + name + ".json"].spritesheet;
    let animation = new PIXI.AnimatedSprite(sheet.animations[Object.keys(sheet.animations)[0]]);
    animation.position.set(x, y);
    layers[layer].addChild(animation);
    animation.animationSpeed = speed;
    animation.play();
  }
}


Game.prototype.cpeKeyDown = function(ev) {
  let self = this;
  let screen = this.screens["1p_cpe"];  
}


Game.prototype.cpeMouseDown = function(ev) {
  let self = this;
  let layers = this.cpe_layers;

  let mouse_data = pixi.renderer.plugins.interaction.mouse.global;

  if (ev.button == 0) {
    // click to move the cursor.
    // let x_click = mouse_data.x - this.player_area.x;
    // let y_click = mouse_data.y - this.player_area.y;
    // let x_tile = Math.floor(x_click / 32);
    // let y_tile = Math.floor((13 * 32 + y_click)/32);

    // if (this.baseCaptureInBounds(x_tile, y_tile) && this.baseCaptureBoard[x_tile][y_tile] != "") {
    //   if (this.game_phase == "tutorial" && this.tutorial_number == 6 
    //     && (x_tile != this.cursor[0].x_tile || y_tile != this.cursor[0].y_tile)) {
    //     this.bc_tutorial7();
    //   }

    //   this.baseCaptureJumpCursor(0, x_tile, y_tile, null);
    // }
    let x = Math.floor(mouse_data.x / 2) - layers["character"].x/2;
    let y = Math.floor(mouse_data.y / 2) - layers["character"].y/2;
    let min_char = null;
    let min_dist = null;
    for (let i = 0; i < this.characters.length; i++) {
      let c = this.characters[i];
      //if (c.character_name == "walker") {
        if (x > c.x - 12 && x < c.x + 12 && y > c.y - 30 && y < c.y + 10) {
          let d = distance(x, y, c.x, c.y);
          if (min_char == null || d < min_dist) {
            min_char = c;
            min_dist = d;
          }
        }
      //}
    }

    if (min_char != null) {
      if (this.job_selection == "runner" && min_char.character_name == "walker") {
        this.upgradeToRunner(min_char);
      } else if (this.job_selection.includes("traffic")
        && (min_char.character_name == "walker" || min_char.character_name == "runner")) {
        let direction = this.job_selection.split("_")[1]
        console.log("IN BRIEF");
        console.log(direction);
        this.upgradeToTraffic(min_char, direction)
      }
    }
  }
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


Game.prototype.spawnWalker = function(force=false) {
  let self = this;
  let layers = this.cpe_layers;

  if (force || (this.cpe_game_state == "active" && this.timeSince(this.walker_last_spawn) > this.walker_spawn_delay)) {
    let walker = this.makeCpeCharacter("walker");
    walker.position.set(
      this.config.start[0], this.config.start[1]
    );
    layers["character"].addChild(walker);
    walker.setState("directed_walk", "right");
    this.shakers.push(walker);
    this.characters.push(walker);

    // walker.interactive == true;
    // walker.on("pointertap", function() {
    //   console.log("clicked me");
    //   if (self.job_selection == "runner" && walker.state == "directed_walk" || "random_walk") {
    //     self.upgradeToRunner(walker);
    //   }
    // });

    this.walker_last_spawn = this.markTime();
  }
}


Game.prototype.upgradeToRunner = function(walker) {
  let self = this;
  let layers = this.cpe_layers;

  let x = walker.x;
  let y = walker.y;

  let runner = this.makeCpeCharacter("runner");
  runner.x = walker.x;
  runner.y = walker.y;
  runner.vx = walker.vx;
  runner.vy = walker.vy;
  runner.state = walker.state;
  runner.setAction(walker.action);
  runner.setState("directed_walk", walker.getDirection());

  this.deleteWalker(walker);

  layers["character"].addChild(runner);
  this.shakers.push(runner);
  this.characters.push(runner);
  console.log("made one");
}


Game.prototype.upgradeToTraffic = function(walker, direction) {
  let self = this;
  let layers = this.cpe_layers;

  let x = walker.x;
  let y = walker.y;

  let traffic = this.makeCpeCharacter("traffic");
  traffic.x = walker.x;
  traffic.y = walker.y;
  traffic.vx = walker.vx;
  traffic.vy = walker.vy;
  traffic.setState("traffic", direction);

  this.deleteWalker(walker);

  layers["character"].addChild(traffic);
  this.shakers.push(traffic);
  this.characters.push(traffic);
  console.log("made one");
}


Game.prototype.deleteWalker = function(walker) {
  let layers = this.cpe_layers;
  walker.visible = false;
  walker.state = "dead";

  let new_shakers = [];
  for (let i = 0; i < this.shakers.length; i++) {
    if (this.shakers[i].state != "dead") {
      new_shakers.push(this.shakers[i]);
    }
  }
  this.shakers = new_shakers;

  let new_walkers = [];
  for (let i = 0; i < this.characters.length; i++) {
    if (this.characters[i].state != "dead") {
      new_walkers.push(this.characters[i]);
    }
  }
  this.characters = new_walkers;

  layers["character"].removeChild(walker);
}


Game.prototype.updateCharacters = function() {
  for (let i = 0; i < this.characters.length; i++) {
    let old_state = this.characters[i].state;

    this.characters[i].update(this.illegal_area, this.death_area, this.level_width, this.level_height);
  
    if (old_state != "dying" && this.characters[i].state == "dying") {
      this.characters[i].y -= 16;
      this.characters[i].vy = -3.5;
      // need a gentler fall.
      this.characters[i].personal_gravity = 2.1;
      this.freefalling.push(this.characters[i]);
    }
  }


  let new_characters = [];
  for (let i = 0; i < this.characters.length; i++) {
    if (this.characters[i].state != "dying" || this.characters[i].y < this.level_height + 100) {
      new_characters.push(this.characters[i]);
    } else {
      this.cpe_layers["character"].removeChild(this.characters[i]);
    }
  }
  this.characters = new_characters;


  for (let i = 0; i < this.characters.length; i++) {
    if (this.characters[i].state != "dying") {
      if (this.characters[i].character_name == "walker" || this.characters[i].character_name == "runner") {
        for (let j = 0; j < this.characters.length; j++) {
          if (this.characters[j].character_name == "traffic") {
            if (distance(this.characters[i].x,this.characters[i].y,
              this.characters[j].x, this.characters[j].y) < 20) {
              if (this.characters[i].state != "directed_walk"
                || this.characters[i].getDirection() != this.characters[j].getDirection()) {
                this.characters[i].setState("directed_walk", this.characters[j].getDirection())
                // TO DO: make the walker align a little closer with the traffic director
                this.characters[i].drift_x = this.characters[j].x - this.characters[i].x;
                this.characters[i].drift_y = this.characters[j].y - this.characters[i].y;
              }
            }
          }
        }
      }
    }
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
  this.spawnWalker();
  this.updateCharacters();
}



