//
// This file contains the First Strike subgame.
//
// This game is a typing race between you and an opponent.
// Type to move a runner through a military base, to be the
// one to launch (or stop the launch of) a nuclear missile.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//
//
// Run speed notes:
// this seems to be right for slow run at 0.4 animationSpeed
// this.run_ground_speed = 2.4;
//
// fast run seems like ground 7 and animationSpeed 0.5 is okay.
// same ground 5.77 and animationSpeed 0.4.
// 0.31, 4.52.
//
// let's say every word you add increases the dude's speed by 1
// on a scale in [slow 0.3, slow 0.4, slow 0.5, fast 0.3, fast 0.4, fast 0.5]
// and there's a decay that's faster at higher difficulties.
// let's default it to decay once every 2 seconds.
// also, the change can only happen on the foot marks, so it's not so jarring.
//


var run_clock_when_winning = true;
course_origin = {};
course_origin.x = 268;
course_origin.y = 375;


class FirstStrike extends Screen {
  initialize() {
    freefalling = [];
    shakers = [];

    this.level = game.level != null ? game.level : 1;
    this.score = game.score != null ? game.score : 0;
    this.difficulty_level = game.difficulty_level != null ? game.difficulty_level : "medium";

    this.state = "pre_game";

    this.launch_code_typing = "";

    this.word_count = 0;
    this.correct_word_count = 0;

    this.final_missile_pan = false;
    this.final_missile == null;
    this.final_missile_result = "explode";

    this.last_key_pressed = "A";
    this.last_key_pressed_time = markTime();

    let difficulty_multiplier = this.difficulty_level == "easy" ? 0.5 :
      this.difficulty_level == "medium" ? 0.75 :
      this.difficulty_level == "hard" ? 1 : 1.25;

    this.setDifficulty1(this.level, difficulty_multiplier);

    this.resetBoard();

    this.setDifficulty2(this.level, difficulty_multiplier); // must come after level creation so it can set player attributes

    shakers = [this, this.player_area, this.code_prompt];

    delay(() => {
      paused = false;
      pause_time = 0;
      this.start_time = markTime();
      this.state = "countdown";
      setMusic("action_song_3");

      this.runner[0].speed = 6;
      this.runner[0].changeSpeed();
      this.runner[0].last_speed_change = markTime();

      this.runner[1].speed = 6;
      this.runner[1].changeSpeed();
      this.runner[1].last_speed_change = markTime();
    }, 1200);
  }


  setDifficulty1(level, difficulty_multiplier) {
    this.chunk_types = ["flat", "flat", "flat", "flat", "flat", "flat", "flat", "flat", "rise", "box"];
    if (level > 1) {
      this.chunk_types[0] = "guard";
    }
    if (level > 3) {
      this.chunk_types[1] = "door";
    }
    if (level > 6) {
      this.chunk_types[2] = "guard";
      this.chunk_types[3] = pick(["door", "flat", "box", "rise"]);
    }
    if (level > 9) {
      this.chunk_types[4] = "box";
      this.chunk_types[5] = "rise";
    }

    this.launch_code_course_length = Math.floor((30 + 3 * level) * (0.75 + 0.5 * Math.random()));
    this.code_panel_difficulty = Math.min(12, Math.floor(level / 2));
  }


  setDifficulty2(level, difficulty_multiplier) {
    console.log("Difficulty multiplier is " + difficulty_multiplier);
    let gain = difficulty_multiplier < 1 ? 0 : (difficulty_multiplier == 1 ? 1 : 3);
    this.runner[1].max_speed = 3 + gain + Math.max(3, Math.floor(level / 5));
    this.runner[1].min_speed = 1 + gain + Math.max(2, Math.floor(level / 5));
    this.runner[1].jump_probability = Math.min(1, difficulty_multiplier * (0.4 + level * 0.05));
    this.runner[1].punch_probability = Math.min(1, difficulty_multiplier * (0.3 + level * 0.04));
    this.runner[1].terminal_delay = Math.max(3500 / difficulty_multiplier, (6000 - 300 * level) / difficulty_multiplier);
    this.runner[1].speed_change_time = Math.max(300, 1000 - 100 * level);
    this.runner[1].last_choice = markTime();

    this.runner[0].decay_time = Math.max(600, 1000 - 30 * level);
    this.runner[0].typing_boost = Math.max(0.4, (1.5 - level * 0.05) / difficulty_multiplier);
  }


  resetBoard() {
    var far_background = makeSprite("Art/game_far_background.png", this, 0, 0);

    var near_background = makeSprite("Art/game_near_background.png", this, 0, 0);

    // the player's board
    this.player_area = new PIXI.Container();
    this.addChild(this.player_area);
    this.player_area.position.set(129, 39);
    this.player_area.ox = this.player_area.position.x;
    this.player_area.oy = this.player_area.position.y;

    let area = this.player_area;

    let player_monitor_mask = new PIXI.Graphics();
    player_monitor_mask.beginFill(0xFF3300);
    player_monitor_mask.drawRect(129, 39, 669, 504);
    player_monitor_mask.endFill();
    this.player_area.mask = player_monitor_mask;

    this.launch_code_missiles = [];

    this.parallax_course_bg = new PIXI.Container();
    this.parallax_course_bg.position.set(0, 0); // shift it so y = 0 matches the player's origin.
    area.addChild(this.parallax_course_bg);
    let bg = this.parallax_course_bg;
    for (var i = 0; i < this.launch_code_course_length / 3; i++) {
      makeSprite("Art/Course/parallax_upper_shade.png", bg, 1280 * 1 * i, -480, 0, 1);
      makeSprite("Art/Course/parallax_lower_shade.png", bg, 1280 * 1 * i, 480, 0, 1);
      makeSprite("Art/Course/parallax_upper_girders.png", bg, 1280 * 1 * i, -480, 0, 1);
      makeSprite("Art/Course/parallax_lower_girders.png", bg, 1280 * 1 * i, 480, 0, 1);

      let missile = makeSprite("Art/Course/missile.png", bg, 1280 * 1 * i + 535, 880, 0, 1);
      missile.scale.set(0.75,0.75);
      this.launch_code_missiles.push(missile);
    }

    this.parallax_course_foreground = new PIXI.Container();
    this.parallax_course_foreground.position.set(0, 0);

    this.makeCoursesAndPlayers();

    // this comes later so it's in front of the other level stuff.
    // the definition comes earlier so we can add things to it during level construction.
    area.addChild(this.parallax_course_foreground);

    this.red_light = makeSprite("Art/red_light.png", area, 672, 0, 0.5, 0.5);
    this.red_light.scale.set(4, 4);
    this.red_light.rotation = 0;
    this.red_light.alpha = 0.5;

    this.white_flash = makeBlank(area, 1280, 960, 0, 0);
    this.white_flash.alpha = 0.0;
    area.addChild(this.white_flash);

    this.makeCodePanel();

    let run_prompt_backing = makeBlank(area, 669, 60, 0, 444, 0x000000);

    shuffleArray(game.typing_prompts);
    this.run_prompt = this.makePrompt(area, 10, 474, game.typing_prompts[0]);
    this.run_prompt.visible = false;

    this.intro_overlay = new PIXI.Container();
    this.intro_overlay.position.set(0, 0);
    area.addChild(this.intro_overlay);
    this.intro_overlay.background = makeBlank(this.intro_overlay, 1280*3, 960, 0, -100, 0x000000);

    this.intro_overlay.rope = makeSprite("Art/wick.png", this.intro_overlay, 268, 200);
    let rope_mask = new PIXI.Graphics();
    rope_mask.beginFill(0xFF3300);
    rope_mask.drawRect(394, 0, 500, 800);
    rope_mask.endFill();
    this.intro_overlay.rope.mask = rope_mask;

    var screen_cover_background = makeSprite("Art/game_screen_cover_background.png", this, 0, 0);

    let font_36 = {fontFamily: "Press Start 2P", fontSize: 36, fill: 0xFFFFFF, lineHeight: 36, letterSpacing: 3, align: "center"};
    let font_18 = {fontFamily: "Press Start 2P", fontSize: 18, fill: 0xdb5858, lineHeight: 18, letterSpacing: 3, align: "center"};
    let font_16 = {fontFamily: "Press Start 2P", fontSize: 16, fill: 0xFFFFFF, letterSpacing: 3, align: "center", dropShadow: true, dropShadowColor: 0x000000, dropShadowDistance: 3}

    this.announcement = makeText("", font_36, this, 470, 78, 0.5, 0.5);
    this.launch_code_countdown = makeText("", font_18, this, 470, 118, 0.5, 0.5);
    this.runner_arrow = makeSprite("Art/Nav/arrow_pixelated.png", this, 0, 0, 0.5, 0.5);
    this.runner_arrow.scale.set(0.5, 0.5);
    this.mini_runner = makeSprite("Art/mini_runner.png", this, 0, 0, 0.5, 0.5);
    this.runner_text = makeText("0", font_16, this, 0, 0, 0.5, 0.5);
    this.score_label = makeText("Score", font_16, this, 204, 62, 0.5, 0.5);
    this.score_text_box = makeText(this.score, font_16, this, 204, 87, 0.5, 0.5);
    this.level_label = makeText("Level", font_16, this, 742, 62, 0.5, 0.5);
    this.level_text_box = makeText(this.level, font_16, this, 742, 87, 0.5, 0.5);
    this.type_to_run = makeSprite("Art/Nav/type_to_run_v3.png", area, 170 - 129, 150 - 39, 0, 0.5);
    this.double_tap_to_act = makeSprite("Art/Nav/double_tap_action_v4.png", area, 320 - 129, 200 - 39, 0, 0.5);
    this.q_to_quit = makeText("PAUSED\n\nPRESS Q TO QUIT", font_18, this, 470, 303, 0.5, 0.5);

    this.runner_arrow.visible = false;
    this.mini_runner.visible = false;
    this.runner_text.visible = false;
    this.score_label.visible = false;
    this.score_text_box.visible = false;
    this.level_label.visible = false;
    this.level_text_box.visible = false;
    this.type_to_run.visible = false;
    this.double_tap_to_act.visible = false;
    this.q_to_quit.visible = false;
  }


  makeCodePanel() {
    this.code_panel = new PIXI.Container();
    this.code_panel.position.set(129 + 356, 39 + 237 - 100);
    this.code_panel.backing = new PIXI.Container();
    this.code_panel.addChild(this.code_panel.backing);
    this.code_panel.backing.setWidth = (width) => {
      clearScreen(this.code_panel.backing);

      for (let i = 1; i <= 4; i++) {
        let backing = makeBlank(this.code_panel.backing, width, 56, i == 1 ? -2 : (i == 2 ? 2 : 0), -10 + (i == 3 ? -2 : (i == 4 ? 2 : 0)), 0x000000, 0.5, 0.5);
      }

      for (let i = 1; i <= 4; i++) {
        let dot = makeBlank(this.code_panel.backing, 4, 4, 0, 0, 0xFFFFFF, 0.5, 0.5);
        if (i == 1) {
          dot.position.set(4 - width/2, -34);
        } else if (i == 2) {
          dot.position.set(4 - width/2, 14);
        } else if (i == 3) {
          dot.position.set(width/2 - 4, -34);
        } else if (i == 4) {
          dot.position.set(width/2 - 4, 14);
        } 
      }

      let top_line = makeBlank(this.code_panel.backing, width - 16, 2, 0, -34, 0xFFFFFF, 0.5, 0.5);
      let bottom_line = makeBlank(this.code_panel.backing, width - 16, 2, 0, 14, 0xFFFFFF, 0.5, 0.5);
      let left_line = makeBlank(this.code_panel.backing, 2, 40, 4 - width/2, -10, 0xFFFFFF, 0.5, 0.5);
      let right_line = makeBlank(this.code_panel.backing, 2, 40, width/2 - 4, -10, 0xFFFFFF, 0.5, 0.5);

      // WHY THIS?
      let enter_measure = new PIXI.TextMetrics.measureText("Enter Code", this.code_prompt.remaining_text.style);
      let black_gap = makeBlank(this.code_panel.backing, 180, 6, 0, -34, 0x000000, 0.5, 0.5);
    }
    
    let font = {fontFamily: "Press Start 2P", fontSize: 14, fill: 0xFFFFFF, letterSpacing: 3, align: "center"};

    let code_panel_label = makeText("Enter Code", font, this.code_panel, 0, -30, 0.5, 0.5);

    this.addChild(this.code_panel);
    this.code_prompt = this.makePrompt(this.code_panel, -200, -6, this.chooseLaunchCode(), true,
      () => {
        this.code_prompt.parent_chunk.setState("open");
        soundEffect("door");
        this.runner[0].setState("static");
        this.state = "active";
        new TWEEN.Tween(this.code_panel)
          .to({alpha: 0})
          .duration(200)
          .start();
      });
    let measure = new PIXI.TextMetrics.measureText(this.code_prompt.remaining_text.text, this.code_prompt.remaining_text.style);
    this.code_prompt.position.set(-1 * measure.width / 2, -6);
    this.code_panel.backing.setWidth(measure.width + 40);
    this.code_panel.visible = false;
  }


  makeCoursesAndPlayers() {
    let list = this.makeCourseList(this.launch_code_course_length);
    this.course = [];
    this.runner = [];
    this.course[1] = this.makeCourse(1, list, course_origin.x, course_origin.y - 60, "red");
    this.course[0] = this.makeCourse(0, list, course_origin.x, course_origin.y, "blue");

    this.runner[0] = this.course[0].runner;
    this.runner[1] = this.course[1].runner;

    this.course[1].scale.set(0.6666, 0.6666);
  }


  makeCourseList(size) {
    
    let list = [];
    for (let i = 0; i < size; i++) {
      let chunk_type = "flat";
      if (i == size - 1) {
        chunk_type = "end";
      } else if (i < 8 || i % 3 != 0 || i > size - 5) {
        // flat is good.
      } else {
        shuffleArray(this.chunk_types);
        chunk_type = this.chunk_types[0];
      }
      list.push(chunk_type);
    }
    for (let i = 0; i < 8; i++) {
      list.push("flat");
    }

    return list;
  }


  makeCourse(player_number, list, origin_x, origin_y, player_color) {
    let course = new PIXI.Container();
    course.player_number = player_number;
    course.ox = origin_x;
    course.oy = origin_y;
    course.position.set(course.ox, course.oy); // shift it so y = 0 matches the player's origin.
    this.player_area.addChild(course);

    let poles = [];

    course.items = [];
    let height = 0;
    for (let i = 0; i < list.length; i++) {
      // size of each chunk is 167*2 = 334.
      let chunk_type = list[i];
      let chunk = null;
      if (chunk_type != "door") {
        chunk = makeSprite("Art/Course/" + (chunk_type == "guard" ? "flat" : chunk_type) + ".png", null, 0, 0, 0, 1);
      } else if (chunk_type == "door") {
        //let sheet = PIXI.Loader.shared.resources["Art/Course/door_animated.json"].spritesheet;
        
        chunk = new PIXI.Container();
        chunk.scaleMode = PIXI.SCALE_MODES.NEAREST;

        chunk.door = makeSprite("Art/Course/door.png", chunk, 0, 0, 0, 1);

        if (player_number == 1) {
          chunk.door.tint = 0xBBBBBB;
        }

        let door = chunk.door;

        poles.push([334 * i + 164, height + 2])

        door.electricity = {};
        for (let m = 1; m <= 4; m++) {
          door.electricity[m] = makeSprite("Art/Course/door_elec_" + m + ".png", door, 76, -276 - 22 * (m-1), 0, 0.5);
        }

        chunk.setState = function(state) {
          if (state == "open") {
            chunk.door_state = "open";
            for (let m = 1; m <= 4; m++) {
              chunk.door.electricity[m].visible = false;
            }
          } else if (state == "closed") {
            chunk.door_state = "closed";
          }
        }

        chunk.setState("closed");
      }

      chunk.scale.set(2, 2);
      chunk.position.set(334 * i, height + 508);
      chunk.lx = 334 * i;
      chunk.ly = height;

      if (player_number == 1) {
        chunk.tint = 0xBBBBBB;
      }

      chunk.chunk_type = chunk_type;
      course.addChild(chunk);
      course.items.push(chunk);

      if (chunk.chunk_type == "end") {
        this.final_lx = 334 * i + 167 - 75;
        this.final_ly = height;
      }

      if (chunk_type == "guard") {
        let guard = this.makeRunner(course, "grey", 1.5, 334 * i + 167, height, 0, false);
        if (player_number == 0) guard.sound = true;
        guard.lx = 334 * i + 167;
        guard.ly = height;
        guard.ly_floor = height;
        guard.scale.set(-1.5, 1.5);
        guard.setState("static")
        chunk.guard = guard;
      }

      if (chunk_type == "rise") height -= 100;

      if (Math.random() < 0.1) {
        let number = Math.floor(Math.random() * 3) + 1;
        let doodad = makeSprite("Art/Course/doodad_" + number + ".png", this.parallax_course_foreground, 668 * i + Math.random(668), 150 + height, 0, 1);
      }
    }

    course.runner = this.makeRunner(course, player_color, 1.5, 0, 0, 0, true);
    if (player_number == 0) course.runner.sound = true;

    // add the foreground poles
    for (let i = 0; i < poles.length; i++) {
      let pole = makeSprite("Art/Course/pole.png", course, poles[i][0], poles[i][1], 0, 1);
      pole.scale.set(2,2);
      if (player_number == 1) {
        pole.tint = 0xBBBBBB;
      }
    }

    return course;
  }


  chooseLaunchCode(length = 5, difficulty = 0) {
    let code = "";
    let letter = letter_array[Math.floor(Math.random() * 26)];
    let dict_1 = game.short_starting_dictionaries[letter];
    let dict_2 = game.starting_dictionaries[letter];
    for (let i = 0; i < length; i++) {
      let dict = (this.difficulty_level == "easy" || i % 2 == 0) ? dict_1 : dict_2;
      let word = pick(dict).toLowerCase();
      for (let j = 0; j < 10; j++) {
        if (word.length > 3 + difficulty / 2) word = pick(dict).toLowerCase();
      }
      word = word[0].toUpperCase() + word.substring(1);
      code += " " + word;
    }
    code = code.substring(1);
    return code;
  }


  gameOver(win = false) {
    if (this.state == "gameover") {
      return;
    }
    
    this.state = "gameover";

    this.score = Math.floor(this.score);
    game.score = this.score;

    this.final_pan_x = 0.6666 * (this.runner[0].lx - this.final_lx) + this.player_area.ox;
    this.final_pan_y = 0.6666 * (this.runner[0].ly - this.final_ly) + this.player_area.oy;

    if (win == true) {
      this.final_missile_result = "explode";
      this.announcement.text = "YOU WIN!";
      soundEffect("victory");
      this.score += 500;
      this.score_text_box.text = this.score;
      flicker(this.announcement, 500, 0xFFFFFF, 0x67d8ef);
      delay(() => {
        game.nextFlow();
      }, 10000);
    } else {
      this.final_missile_result = "launch";
      this.announcement.text = "YOU LOSE";
      stopMusic();
      soundEffect("game_over");

      game.gameOver(10000);
    }
  }


  terminal(chunk, runner, player_number) {
    runner.setState("terminal");
    runner.last_speed = 0;
    runner.speed = 0;
    runner.ground_speed = 0;
    runner.ly = runner.ly_floor;

    if (player_number == 0) {
      this.setTyping("");
      this.code_panel.visible = true;
      this.code_panel.alpha = 1;
      this.code_prompt.setText(this.chooseLaunchCode(5, this.code_panel_difficulty));
      let measure = new PIXI.TextMetrics.measureText(this.code_prompt.remaining_text.text, this.code_prompt.remaining_text.style);
      this.code_prompt.position.set(-1 * measure.width / 2, -6);
      this.code_panel.backing.setWidth(measure.width + 40);
      this.code_prompt.parent_chunk = chunk;

      this.state = "terminal";
    } else {
      runner.terminal_chunk = chunk;
      runner.terminal_time = markTime();
      runner.current_terminal_delay = runner.terminal_delay * (0.8 + 0.4 * Math.random());
      runner.final_terminal = false;
    }
  }


  finalTerminal(chunk, runner, player_number) {
    runner.setState("terminal");
    runner.speed = 0;
    runner.ground_speed = 0;
    runner.ly = runner.ly_floor;

    if (player_number == 0) {
      this.setTyping("");
      // this.code_prompt.prior_text.style.fontSize = 12;
      // this.code_prompt.typing_text.style.fontSize = 12;
      // this.code_prompt.remaining_text.style.fontSize = 12;
      this.code_panel.position.x -= 50;
      this.code_panel.visible = true;
      this.code_panel.alpha = 1;
      this.code_prompt.setText(this.chooseLaunchCode(7, this.code_panel_difficulty));
      let measure = new PIXI.TextMetrics.measureText(this.code_prompt.remaining_text.text, this.code_prompt.remaining_text.style);
      this.code_prompt.position.set(-1 * measure.width / 2, -6);
      this.code_panel.backing.setWidth(measure.width + 40);
      this.code_prompt.parent_chunk = chunk;

      this.code_prompt.finished_callback = () => {
        this.gameOver(true);
        new TWEEN.Tween(this.code_panel)
          .to({alpha: 0})
          .duration(200)
          .start();
      };

      this.state = "terminal";
    } else {
      runner.terminal_chunk = chunk;
      runner.terminal_time = markTime();
      runner.current_terminal_delay = runner.terminal_delay * 1.5 * (0.8 + 0.4 * Math.random());
      runner.final_terminal = true;
    }

    
  }


  setTyping(new_typing) {
    this.launch_code_typing = new_typing;

    let prompt = null;
    if (this.state == "active") {
      prompt = this.run_prompt;
    } else {
      prompt = this.code_prompt;
    }

    prompt.typing = this.launch_code_typing;
    prompt.checkCorrectness();
    prompt.setPosition();
  }


  advance() {
    this.launch_code_typing = "";

    let prompt = null;
    if (this.state == "active") {
      prompt = this.run_prompt;
    } else {
      prompt = this.code_prompt;
    }

    prompt.checkCorrectness();

    if (prompt.typing.length > 0) {
      let complete = prompt.complete;
      //this.run_label.tint = complete == true ? 0x3cb0f3 : 0xdb5858;
      //this.run_label.position.y = this.run_label.fixed_y + 2;
      //this.run_label.press_count = 6;
      prompt.advance();
      if (this.state == "active") {
        this.word_count += 1;
        if (complete) {
          this.correct_word_count += 1;
          this.runner[0].speed += this.runner[0].typing_boost;
          if (this.runner[0].speed >= 7) {
            this.runner[0].speed = 7;
          }
          this.runner[0].last_speed_change = markTime();
          if (this.runner[0].current_state == "static") this.runner[0].changeSpeed();
          if (this.type_to_run.status != "falling") {
            this.type_to_run.status = "falling";
            this.type_to_run.vx = -10 + 20 * Math.random();
            this.type_to_run.vy = -5 - 10 * Math.random();
            freefalling.push(this.type_to_run);
          }
        } else {
          this.runner[0].speed -= 1.5;
          if (this.runner[0].speed <= 0) {
            this.runner[0].speed = 0;
            this.runner[0].changeSpeed(); // immediately stop if we get to zero
          }
        }
      } else if (this.state == "terminal") {

      }
    }
  }


  act() {
    let target = null;
    for (let i = 0; i < this.course[0].items.length; i++) {
      let chunk = this.course[0].items[i];
      if (chunk.chunk_type == "guard" 
        && this.runner[0].lx >= chunk.position.x && this.runner[0].lx <= chunk.position.x + 334) {
        target = chunk.guard;
      }
    }

    if (target == null) {
      soundEffect("grunt");
      this.runner[0].jump();
    } else {
      soundEffect("grunt");
      this.runner[0].punch(target, true);
    }

    if (this.double_tap_to_act.status != "falling") {
      this.double_tap_to_act.status = "falling";
      this.double_tap_to_act.vx = -10 + 20 * Math.random();
      this.double_tap_to_act.vy = -5 - 10 * Math.random();
      freefalling.push(this.double_tap_to_act);
    }
  }


  keyDown(ev) {
    let player = 0;
    let key = ev.key;

    if (!paused && (this.state == "active")
      && this.runner[0].current_state != "combat_fall"
      && this.runner[0].current_state != "combat_rise") {

      // this.pressKey(this.player_palette, key);

      // if (key === "ArrowUp") {
      //   soundEffect("grunt");
      //   this.runner[0].jump();
      // }

      // if (key === "Enter") {
      //   let target = null;
      //   for (let i = 0; i < this.course[0].items.length; i++) {
      //     let chunk = this.course[0].items[i];
      //     if (chunk.chunk_type == "guard" 
      //       && this.runner[0].lx >= chunk.position.x && this.runner[0].lx <= chunk.position.x + 334) {
      //       target = chunk.guard;
      //     }
      //   }
      //   soundEffect("grunt");
      //   this.runner[0].punch(target, true);
      // }

      if (key === "Enter") {
        this.act();
      }

      for (i in lower_array) {
        if (key === lower_array[i]) {
          this.setTyping(this.launch_code_typing + lower_array[i]);
        } else if (key === letter_array[i]) {
          this.setTyping(this.launch_code_typing + letter_array[i]);
        }
        // for uppercase version
        // if (key === lower_array[i] || key === letter_array[i]) {
        //   this.setTyping(this.launch_code_typing + letter_array[i]);
        // }
      }

      if (key === "'") {
        this.setTyping(this.launch_code_typing + "'");
      }

      if (key === " ") {
        if (this.last_key_pressed != " " || timeSince(this.last_key_pressed_time) > 400) {
          this.advance();
        } else {
          this.act();
        }
      }

      if (key === "Backspace" || key === "Delete") {
        if (this.launch_code_typing.length > 0) {
          let new_typing = this.launch_code_typing.slice(0, this.launch_code_typing.length - 1)
          this.setTyping(new_typing);
        }
      }

      if (key === "Escape") {
        this.setTyping("");
      }

      this.last_key_pressed = key;
      this.last_key_pressed_time = markTime();
    }

    if (!paused && this.state == "terminal") {

      // this.pressKey(this.player_palette, key);

      for (i in lower_array) {
        if (key === lower_array[i]) {
          this.setTyping(this.launch_code_typing + lower_array[i]);
        } else if (key === letter_array[i]) {
          this.setTyping(this.launch_code_typing + letter_array[i]);
        }
        // for uppercase version
        // if (key === lower_array[i] || key === letter_array[i]) {
        //   this.setTyping(this.launch_code_typing + letter_array[i]);
        // }
      }

      if (key === " ") {
        this.advance();
      }

      if (key === "Backspace" || key === "Delete") {
        if (this.launch_code_typing.length > 0) {
          let new_typing = this.launch_code_typing.slice(0, this.launch_code_typing.length - 1)
          this.setTyping(new_typing);
        }
      }

      if (key === "Tab") {
        this.setTyping("");
      }
    }

    if (paused && key === "q") {
      if (sound_data["countdown"] != null && sound_data["countdown"].hold_up == true) {
        sound_data["countdown"].hold_up = null;
        sound_data["countdown"].stop();
      }
      game.monitor_overlay.restore();
      this.state = "none";
      fadeMusic(500);
      resume();
      game.score = this.score;
      game.gameOver(0);
    }

    if (key === "Escape" && (this.state == "active" || this.state == "countdown" || this.state == "terminal")) {
      if (!paused) {
        pause();
        this.announcement.visible = false;
        this.q_to_quit.visible = true;
      } else {
        this.announcement.visible = true;
        this.q_to_quit.visible = false;
        resume();
      }
    }
  }


  updateDisplayInfo() {
    if (this.state == "countdown" && !paused) {
      let time_remaining = (2400 - (timeSince(this.start_time))) / 800;
      // this.announcement.text = Math.ceil(time_remaining).toString();
      if (time_remaining <= 0) {
        
        this.state = "active";
        this.last_play = markTime();

        this.announcement.style.fill = 0xFFFFFF;
        this.announcement.text = "GO";

        this.score_label.visible = true;
        this.score_text_box.visible = true;
        this.level_label.visible = true;
        this.level_text_box.visible = true;
        this.type_to_run.visible = true;
        this.double_tap_to_act.visible = true;
        this.run_prompt.visible = true;
        delay(() => {this.announcement.text = "";}, 1600);

        new TWEEN.Tween(this.intro_overlay.background)
          .to({alpha: 0})
          .duration(150)
          // .easing(TWEEN.Easing.Quartic.Out)
          .start();
      }
    }

    if (timeSince(this.start_time) > 4000 && (this.state == "active" || this.state == "terminal")) {
      let percent = Math.floor(100 * this.runner[0].lx / this.final_lx);
      this.announcement.text = percent + "%";

      if (this.runner[1].final_terminal == true) {

        let remaining = (this.runner[1].current_terminal_delay - timeSince(this.runner[1].terminal_time)) / 1000;
        if (remaining < 0) remaining = 0;
        
        this.launch_code_countdown.text = remaining.toFixed(2);
      }
    }

    if (this.state == "active") {
      // Add to the score
      if (this.runner[0].lx > this.runner[0].last_x) {
        this.score += 0.1;
        if (this.runner[0].lx > this.runner[1].lx) {
          this.score += 0.1;
        }
        if (this.runner[0].speed >= 6) {
          this.score += 0.1;
        }
        this.score_text_box.text = Math.floor(this.score);
      }
    }

    if (this.runner[0].lx > this.runner[1].lx + 400) {
      this.runner_arrow.visible = true;
      this.runner_arrow.angle = 180;
      this.runner_arrow.position.set(160, 234);
      this.runner_arrow.tint = 0x71d07d;
      this.mini_runner.visible = true;
      this.mini_runner.position.set(190, 235);
      this.runner_text.visible = true;
      this.runner_text.position.set(235, 236);
      this.runner_text.tint = 0x71d07d;
      this.runner_text.text = Math.floor((this.runner[0].lx - this.runner[1].lx) / 100);
    } else if (this.runner[0].lx + 600 < this.runner[1].lx) {
      this.runner_arrow.visible = true;
      this.runner_arrow.angle = 0;
      this.runner_arrow.position.set(775, 234);
      this.runner_arrow.tint = 0xdb5858;
      this.mini_runner.visible = true;
      this.mini_runner.position.set(745, 235);
      this.runner_text.visible = true;
      this.runner_text.position.set(700, 238);
      this.runner_text.tint = 0xdb5858;
      this.runner_text.text = Math.floor((this.runner[1].lx - this.runner[0].lx) / 100);
    } else {
      this.runner_arrow.visible = false;
      this.runner_text.visible = false;
      this.mini_runner.visible = false;
    }

    if (this.state != "active" && this.state != "terminal") {
      this.runner_arrow.visible = false;
      this.runner_text.visible = false;
      this.mini_runner.visible = false;
    }
  }


  makeEmbers() {
    if (timeSince(this.start_time) < 3000) {
      // let alternator = Math.floor(timeSince(this.start_time) / 107.14);
      let quantity = 14 + Math.floor(Math.random() * 14);
      let adjustment = timeSince(this.start_time) <= 20*107.14 ? 20 * Math.sin(0.5 * timeSince(this.start_time) * 2 * Math.PI / 107.14) : 0;

      for (var i = 0; i < quantity; i++) {
        let jitter_x = -2 + Math.random() * 4;
        let jitter_y = -2 + Math.random() * 4;
        let ember = makeBlank(this.intro_overlay, 4, 4, 268 + this.runner[0].lx + jitter_x, 250 + adjustment + jitter_y, Math.random() > 0.6 ? pick(fire_colors) : 0xFFFFFF);
        ember.vx = -6 + Math.random() * 12;
        ember.vy = -9 + Math.random() * 12;
        ember.type = "ember";        
        freefalling.push(ember);
      }
    }
  }


  decayPlayerRunnerSpeed() {
    if (timeSince(this.runner[0].last_speed_change) > this.runner[0].decay_time && this.runner[0].speed > 0) {
      this.runner[0].speed -= 0.5;
      if (this.runner[0].speed <= 0) {
        this.runner[0].speed = 0;
        this.runner[0].changeSpeed(); // immediately stop if we get to zero
      }
      this.runner[0].last_speed_change = markTime();
    }
  }


  enemyAction() {
    let runner = this.course[1].runner;
    let last_x = runner.last_x;
    let x = runner.lx;

    if (runner.current_state == "combat_punch"
      || runner.current_state == "combat_fall"
      || runner.current_state == "combat_rise"
      || runner.current_state == "jump"
      || runner.current_state == "damage") {
      return;
    }

    if (runner.current_state == "terminal") {
      if (runner.terminal_time != null && timeSince(runner.terminal_time) > runner.current_terminal_delay) {
        if (runner.final_terminal == false) {
          runner.terminal_chunk.setState("open");
          runner.speed = 2;
          runner.changeSpeed();
          runner.terminal_time = null;
        } else {
          this.gameOver(false);
          runner.terminal_time = null;
        }
      }
      return;
    }

    // Jump over boxes and rises.
    //////
    for (let i = 0; i < this.course[1].items.length; i++) {
      let chunk = this.course[1].items[i];

      if ((chunk.chunk_type == "rise" || chunk.chunk_type == "box")
        && x >= chunk.position.x && x <= chunk.position.x + 167 && runner.current_state != "jump"
        && timeSince(runner.last_choice) > 500) {
        runner.last_choice = markTime();
        let dice = Math.random();
        if (dice <= runner.jump_probability) {
          runner.jump();
        }
      }
    }
    ///////


    // Punch out that guard!
    //////
    for (let i = 0; i < this.course[1].items.length; i++) {
      let chunk = this.course[1].items[i];

      if (chunk.chunk_type == "guard"
        && runner.current_state != "combat_punch"
        && chunk.guard.current_state != "combat_fall"
        && x >= chunk.position.x + 70 && x <= chunk.position.x + 167
        && timeSince(runner.last_choice) > 200) {
        runner.last_choice = markTime();
        let dice = Math.random();
        if (dice <= runner.punch_probability) {
          runner.punch(chunk.guard, true);
        }
      }
    }
    ///////


    // Speed changes
    if (timeSince(runner.last_speed_change) > runner.speed_change_time) {

      let last_speed = runner.speed;
      if (runner.speed < runner.min_speed) {
        runner.speed += 1;
      } else if (runner.speed > runner.max_speed) {
        runner.speed -= 1;
      } else if (runner.speed == 0) {
        if (Math.random() < 0.75) runner.speed += 1;
      } else {
        let dice = Math.random();
        if (dice <= 0.2) runner.speed -= 1;
        if (dice >= 0.7) runner.speed += 1;
        if (runner.jump_probability < 0.75 && dice > 0.49 && dice < 0.54) runner.jump();
      }
      runner.speed = Math.min(7, Math.max(0, runner.speed));

      if (last_speed != runner.speed && (last_speed == 0 || runner.speed == 0)) {
        runner.changeSpeed();
      }

      runner.last_speed_change = markTime();
    }
  }


  updateCourse(course) {
    let runner = course.runner;

    runner.last_x = runner.lx;
    runner.lx += runner.ground_speed;
    runner.position.set(runner.lx, runner.ly);
    course.position.set(course.ox - course.scale.x * runner.lx, course.oy - course.scale.y * runner.ly);

    let last_x = runner.last_x;
    let x = runner.lx;

    if (timeSince(this.start_time) > 5000 && this.state == "active" && Math.random() < 0.0045) {
      if (course.player_number == 0) {
        soundEffect("explosion_3");
        this.player_area.shake = markTime();
      }
      let new_explosion = makeExplosion(course, runner.lx + 50 + 100 * Math.random(), runner.ly - 200 + 100 * Math.random(), 2, 2,
        () => {
          course.removeChild(new_explosion)
      });
    }

    for (let i = 0; i < course.items.length; i++) {
      let chunk = course.items[i];

      if (x > chunk.position.x && x < chunk.position.x + 334) {
        //chunk.tint = 0x44FF44;
      } else {
        //chunk.tint = 0xFFFFFF;
      }

      if (chunk.chunk_type == "box" 
        && last_x <= chunk.position.x + 167 && x >= chunk.position.x + 167
        && (runner.current_state != "jump" || runner.ly > chunk.position.y - 70)) {
        if (course.player_number == 0) {
          this.player_area.shake = markTime();
          soundEffect("hurt");
        } else {
          swearing(this, 400, 400);
        }
        runner.damage();
      }

      if (chunk.chunk_type == "rise" 
        && last_x <= chunk.position.x + 167 && x >= chunk.position.x + 167) {
        if (runner.current_state != "jump" || runner.ly > chunk.position.y - 85) {
          if (course.player_number == 0) {
            this.player_area.shake = markTime();
            soundEffect("hurt");
          } else {
            swearing(this, 400, 400);
          }
          runner.damage();
        } else if (runner.current_state == "jump") {
          runner.ly_floor = chunk.ly - 100;
        }
      }

      if (chunk.chunk_type == "door" && chunk.door_state == "closed" && Math.random() < 0.25) {
        let vals = [0, 22, 44, 66];
        let door = chunk.door;
        shuffleArray(vals);
        for (let m = 1; m <= 4; m++) {
          door.electricity[m].position.set(76, -276 - vals[m-1]);
        }
      }

      if (chunk.chunk_type == "door" && chunk.door_state == "closed"
        && runner.current_state != "terminal"
        && last_x <= chunk.position.x + 167 - 50 && x >= chunk.position.x + 167 - 50) {
        runner.lx = chunk.position.x + 167 - 50;
        this.terminal(chunk, runner, course.player_number);
      }

      if (chunk.chunk_type == "end"
        && runner.current_state != "terminal"
        && last_x <= chunk.position.x + 167 - 75 && x >= chunk.position.x + 167 - 75) {
        runner.lx = chunk.position.x + 167 - 75;
        this.finalTerminal(chunk, runner, course.player_number);
      }

      if (chunk.chunk_type == "guard" 
        && x >= chunk.position.x - 167 && x <= chunk.position.x + 167 + 10
        && chunk.guard.current_state == "static") {
        chunk.guard.setState("combat_ready");
        chunk.guard.lastReady = markTime() - 300;
      } else if (chunk.chunk_type == "guard"
        && x >= chunk.position.x + 167 + 40
        && chunk.guard.current_state == "combat_ready") {
        chunk.guard.setState("static");
        chunk.guard.scale.set(1.5, 1.5); // turn the beat cop around
      }

      if (chunk.chunk_type == "guard" 
        && x >= chunk.position.x && x <= chunk.position.x + 167 + 10
        && chunk.guard.current_state == "combat_ready"
        && chunk.guard.lastReady != null && timeSince(chunk.guard.lastReady) > 500) {
        chunk.guard.punch(runner, false);
      }
    }
  }

  gameOverPan() {
    this.runner[1].sprites[this.runner[1].current_state].stop();
    this.runner[0].sprites[this.runner[0].current_state].stop();

    this.red_light.rotation = Math.PI / 2;
    this.white_flash.alpha = 0;

    if (Math.abs(this.final_pan_y - this.player_area.position.y) > 5) {
      this.player_area.position.y = 0.94 * this.player_area.position.y + 0.06 * this.final_pan_y;
    }

    if (Math.abs(this.final_pan_x - this.player_area.position.x) > 5) {
      this.player_area.position.x = 0.94 * this.player_area.position.x + 0.06 * this.final_pan_x;
    } else if (this.final_missile_pan == false) {
      this.final_missile_pan = true;
      for (let c = 0; c < this.launch_code_missiles.length; c++) {
        let missile = this.launch_code_missiles[c];
        let x = missile.position.x + this.parallax_course_bg.position.x + this.player_area.position.x;
        if (x >= 0 && x <= 1280 && x >= 400) {
          let diff = 400 - x;
          this.final_pan_x += diff;
          this.final_missile = missile;
          this.final_missile.vy = 0;
          soundEffect("big_rocket");
        }
      }
    }

    if (this.final_missile != null) {
      if (this.final_missile_result == "launch") {
        this.final_missile.y += this.final_missile.vy;
        this.final_missile.vy -= 0.02;

        let dice = Math.ceil(Math.random() * 3);
        for (let d = 0; d < dice; d++) {
          let new_explosion = makeExplosion(this.parallax_course_bg, 
            this.final_missile.x + 130 - 75 + 150 * Math.random(),
            this.final_missile.y - 25 + 50 * Math.random(), 2, 2, () => {
              this.parallax_course_bg.removeChild(new_explosion)
          });
        }
      } else if (this.final_missile_result == "explode") {
        let dice = Math.ceil(Math.random() * 3);
        this.final_missile.alpha *= 0.993;
        for (let d = 0; d < dice; d++) {
          let new_explosion = makeExplosion(this.parallax_course_bg, 
            this.final_missile.x + 130 - 75 + 150 * Math.random(),
            this.final_missile.y - 1600 * Math.random(), 2, 2, () => {
              this.parallax_course_bg.removeChild(new_explosion)
          });
        }
      }
    }
  }


  update(diff) {
    let fractional = diff / (1000/30.0);

    shakeDamage();
    freeeeeFreeeeeFalling(fractional);

    this.updateDisplayInfo();
    this.makeEmbers();

    if (this.code_prompt.shake == null) {
      this.code_prompt.remaining_text.style.fill = 0x3ff74f;
    }

    if (this.runner[0].current_state == "combat_fall") {
      this.setTyping("");
    }

    if (this.state == "gameover") {
      // move the camera towards the other player, and pause the animations
      this.gameOverPan();
      return;
    }

    this.updateCourse(this.course[0]);
    this.updateCourse(this.course[1]);
    this.course[1].position.y = this.course[1].oy - this.course[1].scale.y * this.runner[0].ly //this.course[0].position.y - 80;
    this.course[1].position.x -= 0.6666 * (this.runner[0].lx - this.runner[1].lx)
    this.intro_overlay.position.set(-1 * this.runner[0].lx, 0);
    this.parallax_course_bg.position.set(-0.25 * this.runner[0].lx, -0.25 * this.runner[0].ly)
    this.parallax_course_foreground.position.set(-2 * this.runner[0].lx, -1 * this.runner[0].ly);

    this.red_light.rotation = -2 * Math.PI * 1.5 * timeSince(this.start_time) / 1000;
    let rotation = (-1 * this.red_light.rotation * 180.0 / Math.PI) % 1080;
    if (rotation > 360) this.red_light.rotation = 0;
    // Flashes of white light. Haven't quite got this worked out.
    // if (rotation < 45) {
    //   this.white_flash.alpha = (rotation) / 10.0;
    // } else if (rotation < 90) {
    //   this.white_flash.alpha = (45 - rotation) / 10.0;
    // } else {
    //   this.white_flash.alpha = 0;
    // }

    // Skip the rest if we aren't in active gameplay
    if (this.state != "active" && this.state != "terminal") {
      return;
    }

    this.enemyAction();
    this.decayPlayerRunnerSpeed();
  }
}