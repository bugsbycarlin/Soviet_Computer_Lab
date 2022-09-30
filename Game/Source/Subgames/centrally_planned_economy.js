//
// This file contains the Centrally Planned Economy subgame.
//
// In this game, you must demonstrate the power of centrally planned economies
// by guiding proletariat workers in the newly liberated city of London to their
// newly assigned factory jobs. If you do not guide them, these recently capitalist
// workers will literally walk off cliffs like lemmings.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//

cpe_character_types = ["walker", "runner", "construction", "policeman", "traffic", "academic", "partyboy", "businessman", "soldier"]


class CentrallyPlannedEconomy extends Screen {
  // Set up the game board
  initialize() {
    this.state = null;

    freefalling = [];
    shakers = [];
 
    this.level = game.level != null ? game.level : 1;
    this.score = game.score != null ? game.score : 0;
    this.difficulty_level = game.difficulty_level != null ? game.difficulty_level : "MEDIUM";

    this.display_score = this.score;
    this.next_score_bump = 20;
    this.score_bump_timer = markTime();

    this.config = cpe_level_config[this.level];

    this.num_awake = this.config.num_awake;
    this.num_to_wake = this.config.num_to_wake;
    this.num_required = this.config.num_required;
    this.num_arrived = this.config.num_arrived;

    this.screen_vx = 0;
    this.screen_vy = 0;

    this.characters = [];

    this.layers = {};
    let layers = this.layers;

    this.terrain = {};
    let terrain = this.terrain;

    layers["open"] = new PIXI.Container();
    layers["open"].scale.set(2, 2);
    this.addChild(layers["open"]);
    layers["filled"] = new PIXI.Container();
    layers["filled"].scale.set(2, 2);
    this.addChild(layers["filled"]);
    layers["distraction"] = new PIXI.Container();
    layers["distraction"].scale.set(2, 2);
    this.addChild(layers["distraction"]);
    layers["death"] = new PIXI.Container();
    layers["death"].scale.set(2, 2);
    this.addChild(layers["death"]);
    layers["character"] = new PIXI.Container();
    layers["character"].scale.set(2, 2);
    this.addChild(layers["character"]);
    layers["floating"] = new PIXI.Container();
    layers["floating"].scale.set(2, 2);
    this.addChild(layers["floating"]);
    layers["effect"] = new PIXI.Container();
    layers["effect"].scale.set(2, 2);
    this.addChild(layers["effect"]);
    layers["display"] = new PIXI.Container();
    layers["display"].scale.set(2, 2);
    this.addChild(layers["display"]);

    for (const item of ["open", "filled", "distraction", "death", "floating"]) {
      terrain[item] = makeSprite(
        "Art/CPE/Levels/cpe_level_" + this.level + "_" + item + ".png",
        layers[item], 0, 0);
    }

    this.level_width = terrain["open"].width;
    this.level_height = terrain["open"].height;

    if (this.level_width <= 1) {
      this.level_width = this.config.width;
      this.level_height = this.config.height;
    }

    for (const item of ["open", "filled", "distraction", "death", "floating", "character", "effect"]) {
      layers[item].position.set(0, 2 * (game.height/2 - this.level_height))
    }
    
    this.addPresetCharacters();
    this.addAnimations();
    this.addStartAndEndDoors();

    this.makeIllegalArea();
    this.makeDeathArea();
    this.makeDistractionArea();

    let font_16 = {fontFamily: "Press Start 2P", fontSize: 16, fill: dark_color, letterSpacing: 2, align: "left"};
    let font_bright_16 = {fontFamily: "Press Start 2P", fontSize: 16, fill: 0xFFFFFF, letterSpacing: 2, align: "center",
      dropShadow: true, dropShadowColor: 0x000000, dropShadowDistance: 2};

    this.countdown_text_backing = makeSprite("Art/CPE/UI/countdown_text_backing.png", layers["floating"], this.config.start[0] + 40, this.config.start[1] - 67, 0.5, 0);
    this.countdown_text_backing.scale.set(0.75, 0.75);

    this.countdown_text = makeText("Workers\nin " + Math.ceil(this.config.countdown / 1000), {fontFamily: "Press Start 2P", fontSize: 8, fill: dark_color, letterSpacing: 2, align: "center"},
      layers["floating"], this.config.start[0] + 20, this.config.start[1] - 60, 0.5, 0);

    this.info_text_backing = makeSprite("Art/CPE/UI/info_text_backing.png", layers["floating"], 11, 13);
    this.info_text_backing.scale.set(0.75, 0.75);

    this.info_text = makeText("", font_16, layers["display"], 20, 20, 0, 0);
    this.info_text.tint = dark_color;

    const glyph_gap = 54;

    this.time_clocks_backing = makeSprite("Art/CPE/UI/time_clocks_backing.png", layers["display"], 6, game.height/2 - glyph_gap);
    this.time_clocks_backing.scale.set(0.75, 0.75);
    this.time_clocks_backing.alpha = 0.75;

    this.time_clocks_text = makeText(countDownString(this.config.clock/1000), font_16, layers["display"], 44, game.height/2 - glyph_gap + 16);
    
    this.victory_text = makeText("SUCCESS! PRESS ENTER TO MOVE ON.", font_bright_16, layers["display"], game.width/4, game.height/12, 0.5, 0.5);
    this.victory_text.tint = 0x71d07d;
    this.victory_text.visible = false;

    this.q_to_quit = makeText("PAUSED\n\nPRESS Q TO QUIT", font_bright_16, layers["display"], game.width/4, game.height/12, 0.5, 0.5);
    this.q_to_quit.visible = false;

    this.failure_text = makeText("YOU FAILED. PRESS RESET TO TRY AGAIN\n OR ENTER TO MOVE ON.",
      {fontFamily: "Press Start 2P", fontSize: 16, fill: 0xdb5858, letterSpacing: 2, align: "center",
      dropShadow: true, dropShadowColor: 0x000000, dropShadowDistance: 2},
      layers["display"], game.width/4, game.height/12, 0.5, 0.5);
    this.failure_text.visible = false;

    this.time_clocks_graphic = makeAnimatedSprite("Art/CPE/UI/time_clocks.json", "time_clocks", 
      layers["display"], 14, game.height/2 - glyph_gap + 11);
    this.time_clocks_graphic.gotoAndStop(0);

    shakers.push(this.time_clocks_graphic);
    shakers.push(this.time_clocks_text);
    shakers.push(this.time_clocks_backing);

    this.play_pause_glyph = makeAnimatedSprite("Art/CPE/UI/play_pause_glyph.json", "play_pause",
      layers["display"], 76 + glyph_gap, game.height/2 - glyph_gap);
    this.play_pause_glyph.scale.set(0.75, 0.75)
    this.play_pause_glyph.alpha = 0.75;
    this.play_pause_glyph.gotoAndStop(0);
    this.play_pause_glyph.interactive = true;
    this.play_pause_glyph.on("pointertap", () => {
      if (this.paused) {
        soundEffect("move");
        this.play_pause_glyph.gotoAndStop(0);
        this.resume();
      } else {
        soundEffect("move");
        this.play_pause_glyph.gotoAndStop(1);
        this.pause();
      }
    })

    this.reset_glyph = makeSprite("Art/CPE/UI/reset_glyph.png", layers["display"], 76 + 2 * glyph_gap, game.height/2 - glyph_gap)
    this.reset_glyph.scale.set(0.75, 0.75);
    this.reset_glyph.interactive = true;
    this.reset_glyph.alpha = 0.75;
    this.reset_glyph.on("pointertap", () => {
      if (this.state == "pre_game" || this.state == "countdown" || this.state == "active") {
        this.clear();
        this.initialize();
        game.fadeFromBlack();
        //game.fadeScreens("centrally_planned_economy", "centrally_planned_economy", true, 800);
      }
    });

    this.quit_glyph = makeSprite("Art/CPE/UI/quit_glyph.png", layers["display"], 76 + 3 * glyph_gap, game.height/2 - glyph_gap);
    this.quit_glyph.scale.set(0.75, 0.75);
    this.quit_glyph.interactive = true;
    this.quit_glyph.alpha = 0.75;
    this.quit_glyph.on("pointertap", () => {
      if (this.state != "game_over") {
        this.state = "game_over";
        game.gameOver(2500, this.score);
      }
    });

    this.runner_glyph = makeSprite("Art/CPE/UI/runner_glyph.png", layers["display"], game.width/2 - 4 * glyph_gap, game.height/2 - glyph_gap);
    this.runner_glyph.scale.set(0.75, 0.75);
    this.runner_glyph.interactive = true;
    this.runner_glyph.alpha = 0.75;
    this.runner_glyph.on("pointertap", () => {
      soundEffect("move");
      this.glyph_cursor.visible = true;
      this.glyph_cursor.position.set(this.runner_glyph.x, this.runner_glyph.y);
      this.job_selection = "runner";
    });

    this.traffic_right_glyph = makeSprite("Art/CPE/UI/traffic_right_glyph.png", layers["display"], game.width/2 - 3 * glyph_gap, game.height/2 - glyph_gap);
    this.traffic_right_glyph.scale.set(0.75, 0.75);
    this.traffic_right_glyph.interactive = true;
    this.traffic_right_glyph.alpha = 0.75;
    this.traffic_right_glyph.on("pointertap", () => {
      soundEffect("move");
      this.glyph_cursor.visible = true;
      this.glyph_cursor.position.set(this.traffic_right_glyph.x, this.traffic_right_glyph.y);
      this.job_selection = "traffic";
    });

    this.policeman_glyph = makeSprite("Art/CPE/UI/policeman_glyph.png", layers["display"], game.width/2 - 2 * glyph_gap, game.height/2 - glyph_gap);
    this.policeman_glyph.scale.set(0.75, 0.75);
    this.policeman_glyph.interactive = true;
    this.policeman_glyph.alpha = 0.75;
    this.policeman_glyph.on("pointertap", () => {
      soundEffect("move");
      this.glyph_cursor.visible = true;
      this.glyph_cursor.position.set(this.policeman_glyph.x, this.policeman_glyph.y);
      this.job_selection = "policeman";
    });

    this.construction_glyph = makeSprite("Art/CPE/UI/construction_glyph.png", layers["display"], game.width/2 - glyph_gap, game.height/2 - glyph_gap);
    this.construction_glyph.scale.set(0.75, 0.75);
    this.construction_glyph.interactive = true;
    this.construction_glyph.alpha = 0.75;
    this.construction_glyph.on("pointertap", () => {
      soundEffect("move");
      this.glyph_cursor.visible = true;
      this.glyph_cursor.position.set(this.construction_glyph.x, this.construction_glyph.y);
      this.job_selection = "construction";
    });

    this.glyph_cursor = makeSprite("Art/CPE/UI/glyph_cursor.png", layers["display"], game.width/2 - 4 * glyph_gap, game.height/2 - glyph_gap);
    this.glyph_cursor.scale.set(0.75, 0.75);
    this.glyph_cursor.visible = false;

    this.job_selection = null;

    this.state = "pre_game";

    this.walker_spawn_delay = this.config.walker_spawn_delay;
    this.walker_last_spawn = markTime();

    // Change the cursor
    game.renderer.plugins.interaction.cursorStyles.default = "url('Art/CPE/UI/cursor.png'),auto";
    game.renderer.plugins.interaction.setCursorMode("url('Art/CPE/UI/cursor.png'),auto");

    delay(() => {
      paused = false;
      pause_time = 0;
      this.start_time = markTime();
      this.state = "countdown";
      setMusic("yablochko");
      game.monitor_overlay.dissolve();
    }, 500);
  }


  // Turn the fill background into a 2d map of 2x2 pixel tiles which can
  // be used to block walkers and can also be destroyed by bulldozers.
  // It's a map so we can skip every other x and every other y.
  makeVoxels() {
    let terrain = this.terrain;
    let layers = this.layers;
    
    let pixels = pixi.renderer.extract.pixels(terrain["filled"]);
    this.voxels = {};

    for (let i = 0; i < this.level_width; i += 2) {
      this.voxels[i] = {};
    }

    for (let j = 0; j < this.level_height; j += 2) {
      for (let i = 0; i < this.level_width; i += 2) {
        let p0 = (this.level_width * j + i) * 4;
        let p1 = (this.level_width * j + i + 1) * 4;
        let p2 = (this.level_width * (j+1) + i) * 4;
        let p3 = (this.level_width * (j+1) + i+1) * 4;
        if(pixels[p0 + 3] > 40 || pixels[p1 + 3] > 40 || pixels[p2 + 3] > 40 || pixels[p3 + 3] > 40) {
          let voxel = makeBlank(layers["filled"], 2, 2, i, j, 0xFF0000);
          voxel.alpha = 0.4;
          this.voxels[i][j] = voxel;
        }
      }
    }
  }


  // Determine the filled area where characters can't walk.
  makeIllegalArea() {
    let terrain = this.terrain;
    let layers = this.layers;
    
    let pixels = pixi.renderer.extract.pixels(terrain["filled"]);
    this.illegal_area = {};

    for (let i = 0; i < this.level_width; i += 2) {
      this.illegal_area[i] = {};
    }

    for (let j = 0; j < this.level_height; j += 2) {
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


  // Determine the death area where characters will die if they walk.
  makeDeathArea() {
    let terrain = this.terrain;
    let layers = this.layers;
    
    let pixels = pixi.renderer.extract.pixels(terrain["death"]);
    this.death_area = {};

    for (let i = 0; i < this.level_width; i += 2) {
      this.death_area[i] = {};
    }

    for (let j = 0; j < this.level_height; j += 2) {
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


  // Determine the distraction area where characters will get distracted if they walk.
  makeDistractionArea() {
    let terrain = this.terrain;
    let layers = this.layers;
    
    this.distraction_area = {};

    for (let i = 0; i < this.level_width; i += 2) {
      this.distraction_area[i] = {};
    }
    
    // Do distraction area using all the extra elements, not just the terrain.
    // If there's a cat animation that's been added to the distraction layer,
    // we need to see it (at least frame 0 of it) and mark the territory accordingly.
    for (const value in layers["distraction"].children) {
      let child = layers["distraction"].children[value];

      let pixels = null;
      let width = 0;
      let height = 0;
      if (child.animationSpeed != null) {
        pixels = pixi.renderer.extract.pixels(child);
        width = child.textures[0].width;
        height = child.textures[0].height;
      } else {
        pixels = pixi.renderer.extract.pixels(child);
        width = child.width;
        height = child.height;
      }

      for (let j = 0; j < height; j += 2) {
        for (let i = 0; i < width; i += 2) {
          let p0 = (width * j + i) * 4;
          let p1 = (width * j + i + 1) * 4;
          let p2 = (width * (j+1) + i) * 4;
          let p3 = (width * (j+1) + i+1) * 4;
          if(pixels[p0 + 3] > 40 || pixels[p1 + 3] > 40 || pixels[p2 + 3] > 40 || pixels[p3 + 3] > 40) {
            this.distraction_area[i + 2 * Math.floor(child.x/2)][j + 2 * Math.floor(child.y/2)] = true;
          }
        }
      }
    }
  }


  // Read the level config file and add any preset characters, like academics or soldiers.
  addPresetCharacters() {
    let terrain = this.terrain;
    let layers = this.layers;

    for (let i = 0; i < this.config.characters.length; i++) {
      let [name, behavior, x, y] = this.config.characters[i];

      let character = this.makeCharacter(name);
      character.position.set(x, y);
      character.player_owned = false;
      layers["character"].addChild(character);
      character.setState(behavior);
      this.characters.push(character);
    }
  }


  // Read the level config file and add any animations, such as billboards, butterflies and cats.
  addAnimations() {
    let terrain = this.terrain;
    let layers = this.layers;

    this.animations = [];

    for (let i = 0; i < this.config.animations.length; i++) {
      let [name, layer, x, y, speed, delay_time] = this.config.animations[i];

      let animation = makeAnimatedSprite("Art/CPE/Animations/" + name + ".json", null, layers[layer], x, y);
      animation.name = name;
      if (animation.name.includes("butterfly")) {
        let angle = dice(358) + 1;
        animation.vx = Math.cos(angle * Math.PI / 180);
        animation.vy = Math.sin(angle * Math.PI / 180);
      }
      if (delay_time > 0) {
        animation.onLoop = function() {
          animation.stop();
          delay(function() {animation.play()}, delay_time);
        }
      }
      animation.animationSpeed = speed;
      animation.play();
      this.animations.push(animation);
    }
  }


  // Read the level config file and add the start and ending door animations.
  addStartAndEndDoors() {
    let layers = this.layers;

    this.doors = {};

    let start_door = this.makeDoor(this.config.start_door[0], this.config.start_door[1], this.config.start_door[2]);
    layers.filled.addChild(start_door);
    this.doors.start = start_door;

    let end_door = this.makeDoor(this.config.end_door[0],this.config.end_door[1], this.config.end_door[2]);
    layers.filled.addChild(end_door);
    this.doors.end = end_door;

    this.doors.death = [];
    for (let i = 0; i < this.config.death_doors.length; i++) {
      let [number, x, y] = this.config.death_doors[i];
      let death_door = this.makeDoor(number, x, y);
      layers.filled.addChild(death_door);
      this.doors.death.push(death_door);
    }

    let red_arrow = makeAnimatedSprite("Art/CPE/UI/red_arrow.json", "red_arrow",
      layers["floating"], this.config.end[0], this.config.end[1] - 50, 0.5, 0.5);
    red_arrow.animationSpeed = 0.035;
    red_arrow.name = "red_arrow";
    red_arrow.play();
    this.animations.push(red_arrow);
  }


  // Handle keys
  keyDown(ev) {
    if (this.state == "none") return;

    let key = ev.key;

    // if (key === "Enter" && this.state != "vack") {
    //   this.state = "vack";
    //   soundEffect("fireworks")
    //   let num_fireworks = 4 + dice(4);
    //     for (let i = 0; i < num_fireworks; i++) {
    //       delay(() => {
    //         let color = pick(["blue", "orange"]);
    //         game.makeFireworks(this.layers["display"], color, game.width/8 + dice(game.width/4), game.height/8 + dice(game.height/4), 0.5, 0.5); 
    //       }, 300 * i + dice(150))
    //     }
    // }

    game.score = this.score;
    if (this.state == "victory" && key === "Enter") {
      soundEffect("button_accept");
      this.victory_text.visible = false;
      this.state = "post_victory_exit";
      game.nextFlow();  // this needs changing
    } else if (this.failure_text.visible = true && key === "Enter") {
      this.failure_text.visible = false;
      for (let i = 0; i < this.characters.length; i++) {
        let character = this.characters[i];
        if (character.state != "dying") {
          character.setState("dying");
          character.y -= 16;
          character.vy = -3;
          character.vx = -2 + 4 * Math.random();
          character.personal_gravity = 1.4;
          character.shake = markTime();
          freefalling.push(character);
        }
      }
      soundEffect("descending_plinks");
      this.state = "game_over";
      game.gameOver(2500);
    }


    if (paused && key === "q") {
      if (sound_data["countdown"] != null && sound_data["countdown"].hold_up == true) {
        sound_data["countdown"].hold_up = null;
        sound_data["countdown"].stop();
      }
      // game.monitor_overlay.restore();
      this.state = "none";
      fadeMusic(500);
      resume();
      game.score = this.score;
      game.gameOver(0);
    }

    if (key === "Escape" && (this.state == "pre_game" || this.state == "countdown" || this.state == "active")) {
      if (!paused) {
        pause();
        this.q_to_quit.visible = true;
      } else {
        this.q_to_quit.visible = false;
        resume();
      }
    }
  }


  // Handle mouse clicks
  mouseDown(ev) {
    let layers = this.layers;

    if (this.state == "none") return;

    let mouse_data = pixi.renderer.plugins.interaction.mouse.global;

    if (ev.button == 0) {
      let x = Math.floor(mouse_data.x / 2) - layers["character"].x/2;
      let y = Math.floor(mouse_data.y / 2) - layers["character"].y/2;
      let min_char = null;
      let min_dist = null;
      for (let i = 0; i < this.characters.length; i++) {
        let c = this.characters[i];
        if (c.clickable == true && x > c.x - 12 && x < c.x + 12 && y > c.y - 30 && y < c.y + 10) {
          let d = distance(x, y, c.x, c.y);
          if (min_char == null || d < min_dist) {
            min_char = c;
            min_dist = d;
          }
        }
      }

      if (min_char != null && this.job_selection != null) {

        // If the job selection is traffic in particular, take a moment to look
        // for a nearby traffic director, and switch the target of the click to
        // them instead if one is found.
        if (this.job_selection.includes("traffic")) {

          // let alt_min = null;
          let min_dist = 1000;
          for (let i = 0; i < this.characters.length; i++) {
            let c = this.characters[i];
            if (c.character_name.includes("traffic")) {
              let d = distance(x, y, c.x, c.y);
              if (c.clickable == true && d < 20 && d < min_dist) {
                min_char = c;
                min_dist = d;
              }
            }
          }
        }

        // If we've got a traffic person, take another moment to reset all the
        // recent traffic direction info nearby, so nearby people can be directed
        // by this new traffic person.
        if (this.job_selection.includes("traffic")
          && min_char.character_name.includes("traffic")) {
          for (let i = 0; i < this.characters.length; i++) {
            let c = this.characters[i];
            let d = distance(x, y, c.x, c.y);
            if (c.clickable == true && d < 40) {
              c.last_traffic_direction = null;
            }
          }
        }

        if (this.job_selection == "runner" && min_char.character_name != "runner") {
          this.replaceWithRunner(min_char);
        } else if (this.job_selection.includes("traffic")
          && min_char.character_name != this.job_selection) {
          this.replaceWithTraffic(min_char, "right");
        } else if (this.job_selection.includes("traffic")
          && min_char.character_name == this.job_selection) {
          soundEffect("move");
          makeSmoke(layers["open"], min_char.x, min_char.y, 0.25, 0.25);
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
          this.replaceWithPoliceman(min_char)
        }
      }
    }
  }


  // Print a countdown and start the main action of the level
  countDownAndStart() {
    if (this.state == "countdown" && !this.paused) {
      let time_remaining = (this.config.countdown - (timeSince(this.start_time))) / 1000;

      this.countdown_text.text = "Workers\nin " + Math.ceil(time_remaining).toString();

      if (time_remaining <= 0) {
        this.doors.start.open();
        this.state = "active";
        this.walker_last_spawn = markTime();

        soundEffect("alarm_clock");
        this.time_clocks_text.shake = markTime();
        this.time_clocks_graphic.shake = markTime();
        this.time_clocks_backing.shake = markTime();

        this.countdown_text.visible = false;
        this.countdown_text_backing.visible = false;
      }
    }
  }


  // Move the screen according to the arrow keys.
  // By moving the layers, it appears as though we're moving around the level.
  moveScreen(fractional) {
    let keymap = game.keymap;
    let layers = this.layers;

    if (this.state == "none") return;

    const screen_acceleration = 3.5;
    const screen_max_speed = 18;

    if (keymap["ArrowRight"]) {
      this.screen_vx += screen_acceleration;
      if (this.screen_vx > screen_max_speed) this.screen_vx = screen_max_speed;
    }
    if (keymap["ArrowLeft"]) {
      this.screen_vx -= screen_acceleration;
      if (this.screen_vx < -screen_max_speed) this.screen_vx = -screen_max_speed;
    }
    if (keymap["ArrowUp"]) {
      this.screen_vy -= screen_acceleration;
      if (this.screen_vy < -screen_max_speed) this.screen_vy = -screen_max_speed;
    }
    if (keymap["ArrowDown"]) {
      this.screen_vy += screen_acceleration;
      if (this.screen_vy > screen_max_speed) this.screen_vy = screen_max_speed;
    }
    
    for (const item of ["open", "filled", "distraction", "death", "floating", "character", "effect"]) {
      layers[item].x -= this.screen_vx * fractional;
      layers[item].y -= this.screen_vy * fractional;

      if (layers[item].x < 2 * (game.width/2 - this.level_width)) {
        layers[item].x = 2 * (game.width/2 - this.level_width);
      }
      if (layers[item].x > 0) {
        layers[item].x = 0;
      }

      if (layers[item].y < 2 * (game.height/2 - this.level_height)) {
        layers[item].y = 2 * (game.height/2 - this.level_height);
      }
      if (layers[item].y > 0) {
        layers[item].y = 0;
      }
    }

    this.screen_vx *= 0.93;
    this.screen_vy *= 0.93;
  }


  // Create a walking character
  spawnWalker(force=false) {
    let layers = this.layers;

    if (force || (this.state == "active" 
      && timeSince(this.walker_last_spawn) > this.walker_spawn_delay
      && this.num_awake < this.num_to_wake)) {
      let walker = this.makeCharacter("walker");
      walker.position.set(
        this.config.start[0], this.config.start[1] - 16
      );
      layers["character"].addChild(walker);
      walker.setState("entry_walk");
      shakers.push(walker);
      this.characters.push(walker);
      this.num_awake += 1;

      this.walker_last_spawn = markTime();
    } else if (this.state == "active" 
      && timeSince(this.walker_last_spawn) > this.walker_spawn_delay
      && this.num_awake >= this.num_to_wake) {
      if (this.doors.start.state == "open") {
        this.doors.start.close();
      }
    }
  }


  // Replace a character with a walker
  replaceWithWalker(character) {
    let layers = this.layers;

    let x = character.x;
    let y = character.y;

    let walker = this.makeCharacter("walker");
    walker.x = character.x;
    walker.y = character.y;
    walker.vx = character.vx;
    walker.vy = character.vy;
    walker.player_owned = character.player_owned;
    walker.state = character.state;
    walker.setAction(character.action);
    walker.setState("random_walk", pick(["left","right","up","down"]));

    soundEffect("move");

    this.deleteCharacter(character);

    layers["character"].addChild(walker);
    shakers.push(walker);
    this.characters.push(walker);

    return walker;
  }


  // Replace a character with a runner
  replaceWithRunner(character) {
    let layers = this.layers;

    let x = character.x;
    let y = character.y;

    let runner = this.makeCharacter("runner");
    runner.x = character.x;
    runner.y = character.y;
    runner.vx = character.vx;
    runner.vy = character.vy;
    runner.player_owned = character.player_owned;
    runner.state = character.state;
    runner.setAction(character.action);
    runner.setState("directed_walk", character.getDirection());

    soundEffect("move");
    soundEffect("hyah_2");
    makeSmoke(layers["open"], x, y, 0.25, 0.25);

    this.deleteCharacter(character);

    layers["character"].addChild(runner);
    shakers.push(runner);
    this.characters.push(runner);

    return runner;
  }


  // Replace a character with a traffic director
  replaceWithTraffic(character, direction) {
    let layers = this.layers;

    let x = character.x;
    let y = character.y;

    let traffic = this.makeCharacter("traffic");
    traffic.x = character.x;
    traffic.y = character.y;
    traffic.vx = character.vx;
    traffic.vy = character.vy;
    traffic.player_owned = character.player_owned;
    traffic.setState("traffic", direction);

    soundEffect("move");
    soundEffect("hey");
    makeSmoke(layers["open"], x, y, 0.25, 0.25);

    this.deleteCharacter(character);

    layers["character"].addChild(traffic);
    shakers.push(traffic);
    this.characters.push(traffic);

    return traffic;
  }


  // Replace the character with a policeman
  replaceWithPoliceman(character) {
    let layers = this.layers;

    let x = character.x;
    let y = character.y;

    let policeman = this.makeCharacter("policeman");
    policeman.x = character.x;
    policeman.y = character.y;
    policeman.vx = character.vx;
    policeman.vy = character.vy;
    policeman.player_owned = character.player_owned;
    policeman.state = character.state;
    policeman.setAction(character.action);
    policeman.setState("random_walk", character.getDirection());

    soundEffect("move");
    soundEffect("listen");
    makeSmoke(layers["open"], x, y, 0.25, 0.25);

    this.deleteCharacter(character);

    layers["character"].addChild(policeman);
    shakers.push(policeman);
    this.characters.push(policeman);

    return policeman;
  }


  // Replace a character with an academic
  replaceWithAcademicHaHa(character) {
    let layers = this.layers;

    let x = character.x;
    let y = character.y;

    let academic = this.makeCharacter("academic");
    academic.x = character.x;
    academic.y = character.y;
    academic.vx = character.vx;
    academic.vy = character.vy;
    academic.player_owned = character.player_owned;
    academic.state = character.state;
    academic.setAction(character.action);
    academic.setState("read");
    academic.dot_dot_dot_animation.visible = false;

    soundEffect("move");
    soundEffect("academic_mumble_" + dice(4));
    makeSmoke(layers["open"], x, y, 0.25, 0.25);

    this.deleteCharacter(character);

    layers["character"].addChild(academic);
    shakers.push(academic);
    this.characters.push(academic);

    return academic;
  }


  // Delete a character
  deleteCharacter(character) {
    let layers = this.layers;
    character.visible = false;
    character.state = "dead";

    let new_shakers = [];
    for (let i = 0; i < shakers.length; i++) {
      if (shakers[i].state != "dead") {
        new_shakers.push(shakers[i]);
      }
    }
    shakers = new_shakers;

    let new_characters = [];
    for (let i = 0; i < this.characters.length; i++) {
      if (this.characters[i].state != "dead") {
        new_characters.push(this.characters[i]);
      }
    }
    this.characters = new_characters;

    layers["character"].removeChild(character);
  }


  // General update function for all the characters
  updateCharacters() {
    let layers = this.layers;

    // Drop the dying ones off the screen
    for (let i = 0; i < this.characters.length; i++) {
      let old_state = this.characters[i].state;

      this.characters[i].update(this.illegal_area, this.death_area, this.distraction_area, this.level_width, this.level_height);
    
      if (old_state != "dying" && this.characters[i].state == "dying") {
        this.characters[i].y -= 16;
        this.characters[i].vy = -3;
        this.characters[i].vx = -2 + 4 * Math.random();
        this.characters[i].personal_gravity = 1.4;
        freefalling.push(this.characters[i]);
        if (this.characters[i].player_owned) {
          this.num_awake -= 1;
          this.num_to_wake -= 1;
        }
      }
    }

    // copy non-dying, non exiting characters,
    // and tally up exiting characters
    let new_characters = [];
    for (let i = 0; i < this.characters.length; i++) {
      if (this.characters[i].state != "exiting" && (this.characters[i].state != "dying" || this.characters[i].y < this.level_height + 100)) {
        new_characters.push(this.characters[i]);
      } else {
        if (this.characters[i].state == "exiting") {
          if (this.characters[i].player_owned) {
            this.num_awake -= 1;
            this.num_to_wake -= 1;
          }
          if (this.characters[i].door_valence == 1) {
            if (this.characters[i].player_owned) {
              this.num_arrived += 1;
            }
            soundEffect("accept");
          } else {
            soundEffect("negative_1");
          }
        }
        this.layers["character"].removeChild(this.characters[i]);
      }
    }
    this.characters = new_characters;

    // put characters who are close to academics in thrall to those academics.
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

    // do basic patterns for walkers and runners,
    for (let i = 0; i < this.characters.length; i++) {
      let character = this.characters[i];
      if (character.state != "dying" && character.state != "exiting") {
        if (character.character_name == "walker" || character.character_name == "runner") {
          character.nearest_academic = null;
          for (let j = 0; j < this.characters.length; j++) {
            let comp_character = this.characters[j];
            if (comp_character.character_name == "traffic" 
              && (character.last_traffic_direction == null
                || timeSince(character.last_traffic_direction) > 500
                )) {
              if (distance(character.x,character.y,
                comp_character.x, comp_character.y) < 20) {
                if (character.state != "standing" && 
                  (character.state != "directed_walk" ||
                    character.getDirection() != comp_character.getDirection())) {
                  character.setState("directed_walk", comp_character.getDirection())
                  character.last_traffic_direction = markTime();
                  character.drift_x = comp_character.x - character.x;
                  character.drift_y = comp_character.y - character.y;
                }
              }
              // do basic patterns for academics,
            } else if (comp_character.character_name == "academic" && 
                comp_character.state != "dying" &&
                distance(character.x,character.y,
                  comp_character.x, comp_character.y) < 20) {
              character.nearest_academic = comp_character;
              if (character.state != "standing" && comp_character.state != "random_walk") {
                  character.clickable = false;
                  character.setState("standing");
                  if (character.dot_dot_dot_animation == null) {
                    let animation = makeAnimatedSprite("Art/CPE/UI/dot_dot_dot.json", "dot_dot_dot",
                      layers["floating"], character.x - 8, character.y - 30);
                    animation.animationSpeed = 0.035;
                    animation.play();
                    character.dot_dot_dot_animation = animation;
                  }
                  character.academic_countdown_start = markTime();
              }
            }
          }

          // keep characters in thrall to academics in thrall to academics
          if (character.academic_countdown_start != null 
            && character.state == "standing"
            && character.nearest_academic != null) {
            character.vx = character.nearest_academic.x - character.x;
            character.vy = character.nearest_academic.y - character.y;
            character.setAction("stand");
          }

          // when their countdown is up, either put them back to normal, if
          // there are no longer academics nearby, or convert them into academics.
          if (character.academic_countdown_start != null && timeSince(character.academic_countdown_start) > 5000) {
            if (character.dot_dot_dot_animation != null) {
              layers["floating"].removeChild(character.dot_dot_dot_animation);
              character.dot_dot_dot_animation = null;
            }
            if (character.nearest_academic != null) {
              let academic = this.replaceWithAcademicHaHa(character);
              academic.shake = markTime();
            } else {
              character.clickable = true;
              character.academic_countdown_start = null;
              character.setState("directed_walk", character.getDirection());
            }
          }
        }

        // do policeman behaviors; seek the academic and punch em normal or dead
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
                  let animation = makeAnimatedSprite("Art/CPE/UI/dot_dot_dot.json", "dot_dot_dot",
                    layers["floating"], character.x - 8, character.y - 30);
                  animation.animationSpeed = 0.035;
                  animation.play();
                  character.dot_dot_dot_animation = animation;
                }
                character.police_countdown_start = markTime();
              }
            }
          }

          if (character.police_countdown_start != null && timeSince(character.police_countdown_start) > 1000) {
            if (character.dot_dot_dot_animation != null) {
              layers["floating"].removeChild(character.dot_dot_dot_animation);
              character.dot_dot_dot_animation = null;
            }

            character.police_countdown_start = null;
            
            if (closest_char != null && closest_char.state != "dying" && character.state == "standing" && min_d < 15) {
              if (closest_char.dot_dot_dot_animation != null) {
                closest_char.dot_dot_dot_animation.visible = false;
              }
              if (dice(100) <= 50 || character.player_owned == false) {
                character.setState("punch");
                soundEffect("slap_1");
                closest_char.setState("dying");
                closest_char.setAction("hurt");
                closest_char.y -= 16;
                closest_char.vy = -3;
                closest_char.vx = -2 + 4 * Math.random();
                closest_char.personal_gravity = 1.4;
                closest_char.shake = markTime();
                freefalling.push(closest_char);
                if (closest_char.player_owned == true) {
                  this.num_awake -= 1;
                  this.num_to_wake -= 1;
                }
              } else {
                soundEffect("slap_1");
                let walker = this.replaceWithWalker(closest_char);
                walker.shake = markTime();
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
    while(layers["character"].children[0]) {
      let x = layers["character"].removeChild(layers["character"].children[0]);
    }
    for (let i = 0; i < this.characters.length; i++) {
      this.layers["character"].addChild(this.characters[i]);
    }
  }


  // Update doors and butterflies and other special stuff.
  updateSpecialAnimations(fractional) {
    let layers = this.layers;

    for (let i = 0; i < this.animations.length; i++) {
      let animation = this.animations[i];
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


  updateInfoAndCheckEndConditions() {
    if (this.state == "pre_game") return;

    this.info_text.text = 
      "AWAKE: " + this.num_awake + "/" + this.num_to_wake + "\n" +
      "QUOTA: " + this.num_arrived + "/" + this.num_required;

    if (this.state != "victory" && this.state != "post_victory_exit") {
      let time_remaining = Math.min(
        Math.floor(this.config.clock + 
          this.config.countdown - (timeSince(this.start_time))) / 1000,
          this.config.clock / 1000);
      let portion = time_remaining * 1000 / this.config.clock;
      if (time_remaining >= 0) {
        this.time_clocks_text.text = countDownString(time_remaining);
        this.time_clocks_graphic.gotoAndStop(Math.max(Math.floor(1 - portion * 8) - 1), 0);
      }

      if (time_remaining <= 0 && time_remaining >= -100) {
        this.time_clocks_text.shake = markTime();
        this.time_clocks_graphic.shake = markTime();
        this.time_clocks_backing.shake = markTime();
      }

      if (this.num_to_wake < this.num_required - this.num_arrived) {
        this.failure_text.visible = true;
        this.info_text.tint = 0xdb5858;
      }

      if (time_remaining <= 0 && this.state != "game_over") {
        for (let i = 0; i < this.characters.length; i++) {
          let character = this.characters[i];
          if (character.state != "dying") {
            character.setState("dying");
            character.y -= 16;
            character.vy = -3;
            character.vx = -2 + 4 * Math.random();
            character.personal_gravity = 1.4;
            character.shake = markTime();
            freefalling.push(character);
          }
        }
        soundEffect("descending_plinks");
        this.state = "game_over";
        game.gameOver(2500, this.score);
      }

      if (this.num_arrived >= this.num_required && this.state != "victory") {
        this.state = "victory";
        soundEffect("victory_3");
        this.victory_text.visible = true;
        flicker(this.victory_text, 500, 0x71d07d, 0xFFFFFF);
        this.time_clocks_text.text = "-:--";
        this.time_clocks_graphic.gotoAndStop(0);

        soundEffect("fireworks")
        let num_fireworks = 6 + dice(6);
          for (let i = 0; i < num_fireworks; i++) {
            delay(() => {
              let color = pick(["blue", "orange"]);
              makeFireworks(this.layers["display"], color, game.width/8 + dice(game.width/4), game.height/8 + dice(game.height/4), 1, 1); 
            }, 300 * i + dice(150))
          }
      }
    }
  }


  update(diff) {
    let fractional = diff / (1000/30.0);

    shakeDamage();
    freeeeeFreeeeeFalling(fractional);

    this.countDownAndStart();

    if (this.state == null) return;

    this.moveScreen(fractional);
    this.spawnWalker();
    this.updateCharacters();

    this.updateSpecialAnimations(fractional);

    this.updateInfoAndCheckEndConditions();
  }
}














