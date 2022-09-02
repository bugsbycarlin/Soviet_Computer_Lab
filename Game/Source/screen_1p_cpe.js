
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

  this.num_awake = this.config.num_awake;
  this.num_to_wake = this.config.num_to_wake;
  this.num_required = this.config.num_required;
  this.num_arrived = this.config.num_arrived;

  this.CpeResetBoard();

  this.cpe_game_state = "pre_game";

  this.walker_spawn_delay = this.config.walker_spawn_delay;
  this.walker_last_spawn = this.markTime();

  // this.spawnWalker(true);

  // screen.buttonMode = true;
  // screen.interactive = true;
  // screen.hitArea = new PIXI.Rectangle(0, 0, 800, 600);
  // screen.defaultCursor = "url('Art/CPE/UI/cursor.png') 3 2, auto";

  // this.renderer.plugins.interaction.cursorStyles.default = "url('Art/CPE/UI/cursor.png'),auto";
  this.renderer.plugins.interaction.cursorStyles.default = "url('Art/CPE/UI/cursor.png'),auto";
  this.renderer.plugins.interaction.setCursorMode("url('Art/CPE/UI/cursor.png'),auto");

  // self.setMusic("marche_slav");

  this.fadeFromBlack();
  delay(function() {
    self.paused = false;
    self.pause_time = 0;
    self.start_time = self.markTime();
    self.cpe_game_state = "countdown";
    // self.soundEffect("countdown"); // need a better count down sound effect for math game
    // self.setMusic("marche_slav");
    self.monitor_overlay.dissolve();
  }, 500);
}


Game.prototype.CpeResetBoard = function() {
  let self = this;
  let screen = this.screens["1p_cpe"];

  this.clearScreen(screen);

  this.screen_vx = 0;
  this.screen_vy = 0;

  this.characters = [];

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
  
  this.cpeAddPresetCharacters();
  this.cpeAddAnimations();
  this.cpeAddStartAndEndAnimations();

  this.countdown_text_backing = new PIXI.Sprite(PIXI.Texture.from("Art/CPE/UI/countdown_text_backing.png"));
  this.countdown_text_backing.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.countdown_text_backing.position.set(this.config.start[0] + 40, this.config.start[1] - 67);
  this.countdown_text_backing.anchor.set(0.5, 0);
  this.countdown_text_backing.scale.set(0.75, 0.75);
  layers["floating"].addChild(this.countdown_text_backing);

  this.countdown_text = new PIXI.Text("Workers\nin " + Math.ceil(this.config.countdown / 1000), {fontFamily: "Press Start 2P", fontSize: 8, fill: dark_color, letterSpacing: 2, align: "center"});
  this.countdown_text.anchor.set(0.5,0);
  this.countdown_text.position.set(this.config.start[0] + 20, this.config.start[1] - 60);
  this.countdown_text.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  layers["floating"].addChild(this.countdown_text);

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

  this.info_text_backing = new PIXI.Sprite(PIXI.Texture.from("Art/CPE/UI/info_text_backing.png"));
  this.info_text_backing.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.info_text_backing.position.set(11, 13);
  this.info_text_backing.scale.set(0.75, 0.75);
  layers["display"].addChild(this.info_text_backing);

  this.info_text = new PIXI.Text("", {fontFamily: "Press Start 2P", fontSize: 16, fill: dark_color, letterSpacing: 2, align: "left"});
  this.info_text.anchor.set(0,0);
  this.info_text.position.set(20, 20);
  this.info_text.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  layers["display"].addChild(this.info_text);

  // terrain["filled"].tint = 0xFF00FF;

  const glyph_gap = 54;

  this.time_clocks_backing = new PIXI.Sprite(PIXI.Texture.from("Art/CPE/UI/time_clocks_backing.png"));
  this.time_clocks_backing.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.time_clocks_backing.position.set(2 * glyph_gap,this.height/2 - glyph_gap);
  this.time_clocks_backing.anchor.set(1, 0);
  this.time_clocks_backing.scale.set(0.75, 0.75);
  this.time_clocks_backing.alpha = 0.75;
  layers["display"].addChild(this.time_clocks_backing);

  this.time_clocks_text = new PIXI.Text("1:00", {fontFamily: "Press Start 2P", fontSize: 16, fill: dark_color, letterSpacing: 2, align: "left"});
  this.time_clocks_text.anchor.set(0,0);
  this.time_clocks_text.position.set(2 * glyph_gap - 80,this.height/2 - glyph_gap + 16);
  this.time_clocks_text.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  layers["display"].addChild(this.time_clocks_text);

  let sheet = PIXI.Loader.shared.resources["Art/CPE/UI/time_clocks.json"].spritesheet;
  let time_clocks_graphic = new PIXI.AnimatedSprite(sheet.animations["time_clocks"]);
  time_clocks_graphic.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  time_clocks_graphic.position.set(2 * glyph_gap - 100,this.height/2 - glyph_gap + 16);
  time_clocks_graphic.anchor.set(0, 0)
  layers["display"].addChild(time_clocks_graphic);
  time_clocks_graphic.gotoAndStop(0);
  this.time_clocks_graphic = time_clocks_graphic;

  this.runner_glyph = new PIXI.Sprite(PIXI.Texture.from("Art/CPE/UI/runner_glyph.png"));
  this.runner_glyph.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.runner_glyph.position.set(this.width/2 - 4 * glyph_gap,this.height/2 - glyph_gap);
  this.runner_glyph.anchor.set(0, 0);
  this.runner_glyph.scale.set(0.75, 0.75);
  this.runner_glyph.interactive = true;
  this.runner_glyph.alpha = 0.75;
  this.runner_glyph.on("pointertap", function() {
    self.glyph_cursor.visible = true;
    self.glyph_cursor.position.set(self.runner_glyph.x, self.runner_glyph.y);
    self.job_selection = "runner";
  });
  layers["display"].addChild(this.runner_glyph);

  this.traffic_right_glyph = new PIXI.Sprite(PIXI.Texture.from("Art/CPE/UI/traffic_right_glyph.png"));
  this.traffic_right_glyph.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.traffic_right_glyph.position.set(this.width/2 - 3 * glyph_gap,this.height/2 - glyph_gap);
  this.traffic_right_glyph.anchor.set(0, 0);
  this.traffic_right_glyph.scale.set(0.75, 0.75);
  this.traffic_right_glyph.interactive = true;
  this.traffic_right_glyph.alpha = 0.75;
  this.traffic_right_glyph.on("pointertap", function() {
    self.glyph_cursor.visible = true;
    self.glyph_cursor.position.set(self.traffic_right_glyph.x, self.traffic_right_glyph.y);
    self.job_selection = "traffic";
  });
  layers["display"].addChild(this.traffic_right_glyph);

  this.policeman_glyph = new PIXI.Sprite(PIXI.Texture.from("Art/CPE/UI/policeman_glyph.png"));
  this.policeman_glyph.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.policeman_glyph.position.set(this.width/2 - 2 * glyph_gap,this.height/2 - glyph_gap);
  this.policeman_glyph.anchor.set(0, 0);
  this.policeman_glyph.scale.set(0.75, 0.75);
  this.policeman_glyph.interactive = true;
  this.policeman_glyph.alpha = 0.75;
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
  this.construction_glyph.scale.set(0.75, 0.75);
  this.construction_glyph.interactive = true;
  this.construction_glyph.alpha = 0.75;
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
  this.glyph_cursor.scale.set(0.75, 0.75);
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


Game.prototype.cpeAddPresetCharacters = function() {
  let self = this;
  let terrain = this.terrain;
  let layers = this.cpe_layers;

  for (let i = 0; i < this.config.characters.length; i++) {
    let [name, behavior, x, y] = this.config.characters[i];

    let character = this.makeCpeCharacter(name);
    character.position.set(x, y);
    layers["character"].addChild(character);
    character.setState(behavior);
    this.characters.push(character);
  }
}


Game.prototype.cpeAddAnimations = function() {
  let self = this;
  let terrain = this.terrain;
  let layers = this.cpe_layers;

  this.cpe_animations = [];

  for (let i = 0; i < this.config.animations.length; i++) {
    let [name, layer, x, y, speed, delay_time] = this.config.animations[i];

    let sheet = PIXI.Loader.shared.resources["Art/CPE/Animations/" + name + ".json"].spritesheet;
    let animation = new PIXI.AnimatedSprite(sheet.animations[Object.keys(sheet.animations)[0]]);
    console.log(name);
    animation.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
    animation.position.set(x, y);
    animation.name = name;
    if (animation.name.includes("butterfly")) {
      let angle = dice(358) + 1;
      animation.vx = Math.cos(angle * Math.PI / 180);
      animation.vy = Math.sin(angle * Math.PI / 180);
    }
    if (delay_time > 0) {
      console.log("okay bro");
      animation.onLoop = function() {
        animation.stop();
        delay(function() {animation.play()}, delay_time);
      }
    }
    layers[layer].addChild(animation);
    animation.animationSpeed = speed;
    animation.play();
    this.cpe_animations.push(animation);
  }
}


Game.prototype.cpeAddStartAndEndAnimations = function() {
  let self = this;
  let layers = this.cpe_layers;

  this.doors = {};

  let start_door = this.makeCpeDoor(this.config.start_door[0], this.config.start_door[1], this.config.start_door[2]);
  layers.filled.addChild(start_door);
  this.doors.start = start_door;

  let end_door = this.makeCpeDoor(this.config.end_door[0],this.config.end_door[1], this.config.end_door[2]);
  layers.filled.addChild(end_door);
  this.doors.end = end_door;

  this.doors.death = [];
  for (let i = 0; i < this.config.death_doors.length; i++) {
    let [number, x, y] = this.config.death_doors[i];
    let death_door = this.makeCpeDoor(number, x, y);
    layers.filled.addChild(death_door);
    this.doors.death.push(death_door);
  }

  let sheet = PIXI.Loader.shared.resources["Art/CPE/UI/red_arrow.json"].spritesheet;
  let red_arrow = new PIXI.AnimatedSprite(sheet.animations["red_arrow"]);
  red_arrow.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  red_arrow.position.set(this.config.end[0], this.config.end[1] - 50);
  red_arrow.anchor.set(0.5, 0.5)
  red_arrow.name = "red_arrow";
  layers["floating"].addChild(red_arrow);
  red_arrow.animationSpeed = 0.035;
  red_arrow.play();
  this.cpe_animations.push(red_arrow);
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
        if (c.clickable == true && x > c.x - 12 && x < c.x + 12 && y > c.y - 30 && y < c.y + 10) {
          let d = distance(x, y, c.x, c.y);
          if (min_char == null || d < min_dist) {
            min_char = c;
            min_dist = d;
          }
        }
      //}
    }

    if (min_char != null) {
      if (this.job_selection == "runner" && min_char.character_name != "runner") {
        this.upgradeToRunner(min_char);
      } else if (this.job_selection.includes("traffic")
        && min_char.character_name != this.job_selection) {
        this.upgradeToTraffic(min_char, "right")
      } else if (this.job_selection.includes("traffic")
        && min_char.character_name == this.job_selection) {
        let direction = min_char.getDirection();
        if (direction == "right") {
          min_char.setState("traffic", "down");
        } else if (direction == "down") {
          min_char.setState("traffic", "left");
        } else if (direction == "left") {
          min_char.setState("traffic", "up");
        } else if (direction == "up") {
          min_char.setState("traffic", "right");
        }
      } else if (this.job_selection == "policeman") {
        this.upgradeToPoliceman(min_char)
      }
    }
  }
}


Game.prototype.cpeCountdownAndStart = function() {
  var self = this;
  var screen = this.screens["1p_cpe"];

  if (this.cpe_game_state == "countdown" && !this.paused) {
    let time_remaining = (this.config.countdown - (this.timeSince(this.start_time))) / 1000;

    this.countdown_text.text = "Workers\nin " + Math.ceil(time_remaining).toString();
    //this.stalin_text.style.fontSize = 24;
    // this.rule_label.text = Math.ceil(time_remaining).toString();
    if (time_remaining <= 0) {
      this.doors.start.open();
      this.cpe_game_state = "active";
      this.walker_last_spawn = this.markTime();

      this.countdown_text.visible = false;
      this.countdown_text_backing.visible = false;
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

  if (force || (this.cpe_game_state == "active" 
    && this.timeSince(this.walker_last_spawn) > this.walker_spawn_delay
    && this.num_awake < this.num_to_wake)) {
    let walker = this.makeCpeCharacter("walker");
    walker.position.set(
      this.config.start[0], this.config.start[1] - 16
    );
    layers["character"].addChild(walker);
    walker.setState("entry_walk");
    this.shakers.push(walker);
    this.characters.push(walker);
    this.num_awake += 1;

    // walker.interactive == true;
    // walker.on("pointertap", function() {
    //   console.log("clicked me");
    //   if (self.job_selection == "runner" && walker.state == "directed_walk" || "random_walk") {
    //     self.upgradeToRunner(walker);
    //   }
    // });

    this.walker_last_spawn = this.markTime();
  } else if (this.cpe_game_state == "active" 
    && this.timeSince(this.walker_last_spawn) > this.walker_spawn_delay
    && this.num_awake >= this.num_to_wake) {
    if (this.doors.start.state == "open") {
      this.doors.start.close();
    }
  }
}


Game.prototype.upgradeToWalker = function(character) {
  let self = this;
  let layers = this.cpe_layers;

  let x = character.x;
  let y = character.y;

  let walker = this.makeCpeCharacter("walker");
  walker.x = character.x;
  walker.y = character.y;
  walker.vx = character.vx;
  walker.vy = character.vy;
  walker.state = character.state;
  walker.setAction(character.action);
  walker.setState("random_walk", pick(["left","right","up","down"]));

  this.deleteCharacter(character);

  layers["character"].addChild(walker);
  this.shakers.push(walker);
  this.characters.push(walker);
}


Game.prototype.upgradeToRunner = function(character) {
  let self = this;
  let layers = this.cpe_layers;

  let x = character.x;
  let y = character.y;

  let runner = this.makeCpeCharacter("runner");
  runner.x = character.x;
  runner.y = character.y;
  runner.vx = character.vx;
  runner.vy = character.vy;
  runner.state = character.state;
  runner.setAction(character.action);
  runner.setState("directed_walk", character.getDirection());

  this.deleteCharacter(character);

  layers["character"].addChild(runner);
  this.shakers.push(runner);
  this.characters.push(runner);
}


Game.prototype.upgradeToTraffic = function(character, direction) {
  let self = this;
  let layers = this.cpe_layers;

  let x = character.x;
  let y = character.y;

  let traffic = this.makeCpeCharacter("traffic");
  traffic.x = character.x;
  traffic.y = character.y;
  traffic.vx = character.vx;
  traffic.vy = character.vy;
  traffic.setState("traffic", direction);

  this.deleteCharacter(character);

  layers["character"].addChild(traffic);
  this.shakers.push(traffic);
  this.characters.push(traffic);
}


Game.prototype.upgradeToPoliceman = function(character) {
  let self = this;
  let layers = this.cpe_layers;

  let x = character.x;
  let y = character.y;

  let policeman = this.makeCpeCharacter("policeman");
  policeman.x = character.x;
  policeman.y = character.y;
  policeman.vx = character.vx;
  policeman.vy = character.vy;
  policeman.state = character.state;
  policeman.setAction(character.action);
  policeman.setState("random_walk", character.getDirection());

  this.deleteCharacter(character);

  layers["character"].addChild(policeman);
  this.shakers.push(policeman);
  this.characters.push(policeman);
}


Game.prototype.upgradeToAcademicHaHa = function(character) {
  let self = this;
  let layers = this.cpe_layers;

  let x = character.x;
  let y = character.y;

  let academic = this.makeCpeCharacter("academic");
  academic.x = character.x;
  academic.y = character.y;
  academic.vx = character.vx;
  academic.vy = character.vy;
  academic.state = character.state;
  academic.setAction(character.action);
  academic.setState("read");

  this.num_awake -= 1;
  this.num_to_wake -= 1;

  this.deleteCharacter(character);

  layers["character"].addChild(academic);
  this.shakers.push(academic);
  this.characters.push(academic);
}


Game.prototype.deleteCharacter = function(character) {
  let layers = this.cpe_layers;
  character.visible = false;
  character.state = "dead";

  let new_shakers = [];
  for (let i = 0; i < this.shakers.length; i++) {
    if (this.shakers[i].state != "dead") {
      new_shakers.push(this.shakers[i]);
    }
  }
  this.shakers = new_shakers;

  let new_characters = [];
  for (let i = 0; i < this.characters.length; i++) {
    if (this.characters[i].state != "dead") {
      new_characters.push(this.characters[i]);
    }
  }
  this.characters = new_characters;

  layers["character"].removeChild(character);
}


Game.prototype.updateCharacters = function() {
  let self = this;
  let layers = this.cpe_layers;

  for (let i = 0; i < this.characters.length; i++) {
    let old_state = this.characters[i].state;

    this.characters[i].update(this.illegal_area, this.death_area, this.level_width, this.level_height);
  
    if (old_state != "dying" && this.characters[i].state == "dying") {
      this.characters[i].y -= 16;
      this.characters[i].vy = -3;
      this.characters[i].vx = -2 + 4 * Math.random();
      this.characters[i].personal_gravity = 1.4;
      this.freefalling.push(this.characters[i]);
      this.num_awake -= 1;
      this.num_to_wake -= 1;
    }
  }


  let new_characters = [];
  for (let i = 0; i < this.characters.length; i++) {
    if (this.characters[i].state != "exiting" && (this.characters[i].state != "dying" || this.characters[i].y < this.level_height + 100)) {
      new_characters.push(this.characters[i]);
    } else {
      if (this.characters[i].state == "exiting") {
        this.num_awake -= 1;
        this.num_to_wake -= 1;
        if (this.characters[i].door_valence == 1) {
          this.num_arrived += 1;
        }
      }
      this.cpe_layers["character"].removeChild(this.characters[i]);
    }
  }
  this.characters = new_characters;

  for (let i = 0; i < this.characters.length; i++) {
    if (this.characters[i].character_name == "academic") {
      if (this.characters[i].action == "read") {
        this.characters[i].dot_dot_dot_animation.visible = true;
        this.characters[i].dot_dot_dot_animation.position.set(
          this.characters[i].x - 8, this.characters[i].y - 30
        );
        layers["floating"].addChild(this.characters[i].dot_dot_dot_animation);
      } else {
        this.characters[i].dot_dot_dot_animation.visible = false;
      }
    }
  }


  for (let i = 0; i < this.characters.length; i++) {
    let character = this.characters[i];
    if (character.state != "dying" && character.state != "exiting") {
      if (character.character_name == "walker" || character.character_name == "runner") {
        character.nearest_academic = null;
        for (let j = 0; j < this.characters.length; j++) {
          let comp_character = this.characters[j];
          if (comp_character.character_name == "traffic") {
            if (distance(character.x,character.y,
              comp_character.x, comp_character.y) < 20) {
              if (character.state != "standing" && 
                (character.state != "directed_walk" ||
                  character.getDirection() != comp_character.getDirection())) {
                character.setState("directed_walk", comp_character.getDirection())
                // TO DO: make the walker align a little closer with the traffic director
                character.drift_x = comp_character.x - character.x;
                character.drift_y = comp_character.y - character.y;
              }
            }
          } else if (comp_character.character_name == "academic" && 
              comp_character.state != "dying" &&
              distance(character.x,character.y,
                comp_character.x, comp_character.y) < 20) {
            character.nearest_academic = comp_character;
            if (character.state != "standing" && comp_character.state != "random_walk") {
                character.clickable = false;
                character.setState("standing");
                let sheet = PIXI.Loader.shared.resources["Art/CPE/UI/dot_dot_dot.json"].spritesheet;
                if (character.dot_dot_dot_animation == null) {
                  let animation = new PIXI.AnimatedSprite(sheet.animations["dot_dot_dot"]);
                  animation.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
                  animation.position.set(character.x - 8, character.y - 30);
                  animation.animationSpeed = 0.035;
                  animation.play();
                  character.dot_dot_dot_animation = animation;
                  layers["floating"].addChild(animation);
                }
                character.academic_countdown_start = this.markTime();
            }
          }
        }

        if (character.academic_countdown_start != null 
          && character.state == "standing"
          && character.nearest_academic != null) {
          character.vx = character.nearest_academic.x - character.x;
          character.vy = character.nearest_academic.y - character.y;
          character.setAction("stand");
        }

        if (character.academic_countdown_start != null && this.timeSince(character.academic_countdown_start) > 5000) {
          if (character.dot_dot_dot_animation != null) {
            layers["floating"].removeChild(character.dot_dot_dot_animation);
            character.dot_dot_dot_animation = null;
          }
          if (character.nearest_academic != null) {
            this.upgradeToAcademicHaHa(character);
          } else {
            character.clickable = true;
            character.academic_countdown_start = null;
            character.setState("directed_walk", character.getDirection());
          }
        }
      }

      if (character.character_name == "policeman" && character.state != "punch") {
        let closest_char = null;
        let min_d = null;
        for (let j = 0; j < this.characters.length; j++) {
          let comp_character = this.characters[j];
          if (comp_character.character_name == "academic" && comp_character.state != "dying") {
            let d = distance(character.x, character.y, comp_character.x, comp_character.y);
            if (d < 90) {
              if (closest_char == null || d < min_d) {
                min_d = d;
                closest_char = comp_character;
              }
            }
          }
        }
        if (closest_char != null) {
          character.vx = closest_char.x - character.x;
          character.vy = closest_char.y - character.y;
          norm = Math.sqrt(character.vx*character.vx + character.vy*character.vy)
          if (norm != 0) {
            character.vx /= norm;
            character.vy /= norm;
          }
          if (character.state != "standing") {
            if (min_d > 15) {
              character.state = "directed_walk";
              character.setAction("walk");
            } else {
              character.setState("standing");
              character.clickable = false;
              if (character.dot_dot_dot_animation == null) {
                let sheet = PIXI.Loader.shared.resources["Art/CPE/UI/dot_dot_dot.json"].spritesheet;
                let animation = new PIXI.AnimatedSprite(sheet.animations["dot_dot_dot"]);
                animation.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
                animation.position.set(character.x - 8, character.y - 30);
                animation.animationSpeed = 0.035;
                animation.play();
                character.dot_dot_dot_animation = animation;
                layers["floating"].addChild(animation);
              }
              character.police_countdown_start = this.markTime();
            }
          }
        }

        if (character.police_countdown_start != null && this.timeSince(character.police_countdown_start) > 1000) {
          if (character.dot_dot_dot_animation != null) {
            layers["floating"].removeChild(character.dot_dot_dot_animation);
            character.dot_dot_dot_animation = null;
          }

          character.police_countdown_start = null;
          
          if (closest_char != null && closest_char.state != "dying" && character.state == "standing" && min_d < 15) {
            //this.upgradeToAcademicHaHa(character);
            if (dice(100) <= 50) {
              character.setState("punch");
              closest_char.setState("dying");
              closest_char.y -= 16;
              closest_char.vy = -3;
              closest_char.vx = -2 + 4 * Math.random();
              closest_char.personal_gravity = 1.4;
              this.freefalling.push(closest_char);
            } else {
              this.upgradeToWalker(closest_char);
              character.clickable = true;
              character.setState("random_walk", pick(["left","right","up","down"]));
            }
          } else {
            character.clickable = true;
            character.setState("random_walk", pick(["left","right","up","down"]));
          }
        }
      }
    }
  }


  // For some reason, removing and adding doesn't work here the way it normally does. I must be doing something elsewhere.
  this.characters.sort(function(a,b) { return a.y - b.y });
  // this.cpe_layers["character"].removeChildren();
  while(layers["character"].children[0]) {
    let x = layers["character"].removeChild(layers["character"].children[0]);
  }
  for (let i = 0; i < this.characters.length; i++) {
    this.cpe_layers["character"].addChild(this.characters[i]);
  }
  
  // for (let i = 0; i < this.characters; i++) {
  //   layers["character"].addChild(this.characters[i]);
  // }
}


Game.prototype.updateSpecialAnimations = function(fractional) {
  let self = this;
  let layers = this.cpe_layers;

  for (let i = 0; i < this.cpe_animations.length; i++) {
    let animation = this.cpe_animations[i];
    if (animation.name.includes("butterfly")) {
      animation.x += fractional * animation.vx;
      animation.y += fractional * animation.vy;
    }
    if (dice(100) < 3) {
      let angle = dice(358) + 1;
      animation.vx = Math.cos(angle * Math.PI / 180);
      animation.vy = Math.sin(angle * Math.PI / 180);
    }
  }

  let close_door = true;
  for (let i = 0; i < this.characters.length; i++) {
    let character = this.characters[i];
    if (distance(character.x, character.y, 
        this.doors.end.trigger_x, this.doors.end.trigger_y) < 40) {
      close_door = false;
      if (this.doors.end.state == "closed" && this.doors.end.animating() == false) {
        this.doors.end.open();
      }
      if (character.state != "exit_walk" && character.state != "exiting" && character.state != "dying") {
        character.setState("exit_walk", [this.doors.end.trigger_x, this.doors.end.trigger_y, 1])
      }
    }
  }
  // TO DO: hold open for longer.
  if (close_door && this.doors.end.state == "open" && this.doors.end.animating() == false) {
    this.doors.end.close();
  }

  for (let i = 0; i < this.doors.death.length; i++) {
    let death_door = this.doors.death[i];
    for (let j = 0; j < this.characters.length; j++) {
      let character = this.characters[j];
      if (distance(character.x, character.y, 
          death_door.trigger_x, death_door.trigger_y) < 40) {
        close_door = false;
        if (death_door.state == "closed" && death_door.animating() == false) {
          death_door.open();
        }
        if (character.state != "exit_walk" && character.state != "exiting" && character.state != "dying") {
          character.setState("exit_walk", [death_door.trigger_x, death_door.trigger_y, -1])
        }
      }
    }
  }
}


Game.prototype.updateInfo = function() {
  var self = this;
  // this.num_awake = 0;
  // this.num_to_wake = 50;
  // this.num_required = 40;
  // this.num_arrived = 0;


  this.info_text.text = 
    "YOU HAVE: " + this.num_awake + "/" + this.num_to_wake + "\n" +
    "WE NEED:  " + this.num_arrived + "/" + this.num_required;
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

  this.updateSpecialAnimations(fractional);

  this.updateInfo();
}



