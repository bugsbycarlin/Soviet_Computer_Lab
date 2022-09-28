//
// This file contains the Word Base subgame.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//

// Enemy speeds, in my experience:
// 1200, 600 is pretty hard to play against.
// 1800, 900 is inhuman
// 3000, 1500 is impossible
// 900, 450: 3 - 6, and many of the games were *very* close.
// 500, 250: pretty fun
// 100, 100: nice and easy.
//
// Remember, even on medium difficulty, level 15 needs to be eminently beatable.
// Hard difficulty can reach barely beatable around level 15.
// Beacon can be however hard you want.
//


var run_clock_when_winning = true;


class WordBase extends Screen {
  initialize() {
    freefalling = [];
    shakers = [];

    this.level = game.level != null ? game.level : 1;
    this.score = game.score != null ? game.score : 0;
    this.difficulty_level = game.difficulty_level != null ? game.difficulty_level : "MEDIUM";

    this.base_letters = [];
    this.base_letters[0] = [];
    this.base_letters[1] = [];

    this.played_words = {};
    this.played_squares = [];

    this.active_rockets = [];
    
    this.state = "pre_game";

    let difficulty_multiplier = this.difficulty_level == "EASY" ? 1 :
      this.difficulty_level == "MEDIUM" ? 2 :
      this.difficulty_level == "HARD" ? 3 : 5;

    // See top of file for a note about enemy speeds.
    this.enemy_move_speed = 100 + 50 * difficulty_multiplier + 25 * this.level * difficulty_multiplier;
    this.enemy_typing_speed = 50 + 25 * difficulty_multiplier + 10 * this.level * difficulty_multiplier;
    this.enemy_phase = "moving"; // moving, typing
    if (this.difficulty_level == "EASY" || this.difficulty_level == "MEDIUM") this.enemy_start_len = 3;
    if (this.difficulty_level == "HARD") this.enemy_start_len = 4;
    if (this.difficulty_level == "BEACON") this.enemy_start_len = 5;

    this.play_clock = 15;
    this.last_play = markTime();
    this.speed_play = false;

    this.can_play_word = [];
    this.word_to_play = [];
    this.can_play_word[0] = false;
    this.word_to_play[0] = "";
    this.can_play_word[1] = false;
    this.word_to_play[1] = "";

    this.tile_score = [];
    this.tile_score[0] = 0;
    this.tile_score[1] = 0;

    this.resetBoard();
    
    delay(() => {
      paused = false;
      pause_time = 0;
      this.start_time = markTime();
      this.state = "countdown";
      soundEffect("countdown");
    }, 1200);
  }


  resetBoard() {
    var far_background = new PIXI.Sprite(PIXI.Texture.from("Art/game_far_background.png"));
    far_background.anchor.set(0, 0);
    this.addChild(far_background);

    var near_background = new PIXI.Sprite(PIXI.Texture.from("Art/game_near_background.png"));
    near_background.anchor.set(0, 0);
    this.addChild(near_background);

    // the player's board
    this.player_area = new PIXI.Container();
    this.addChild(this.player_area);
    this.player_area.position.set(1280 * 1/2 - 370 - 32,520);

    this.player_live_area = new PIXI.Container();
    this.addChild(this.player_live_area);
    this.player_live_area.position.set(this.player_area.x, this.player_area.y);
    this.player_live_area.scale.set(this.player_area.scale.x, this.player_area.scale.y);

    let area = this.player_area;

    shakers = [this, this.player_area];

    // Sky and Ground
    let sky = makeSprite("Art/base_sky.png", area, -3 * 32, -13 * 32, 0, 1);
    let sky2 = makeSprite("Art/base_sky_2.png", area, 12*32, -13 * 32, 0, 1);
    let ground = makeSprite("Art/base_ground.png", area, -96, 0, 0, 1);
    ground.scale.set(20/14, 1);

    // Sidebar lands
    for (let i = 0; i <= 1; i++) {
      let shift = i == 0 ? 0 : 20 * 32;
      let sidebar_land = makeSprite("Art/sidebar_land_setback.png", area, -96 + shift, 0, 0, 1);
      sidebar_land.scale.set(i == 0 ? 1 : -1, 1);
    }

    // Board lines
    for (let i = -1; i < 14; i++) {
      let vertical = makeBlank(area, 4, 13 * 32 - 4, 32 * (i + 1) - 2, -13 * 32 + 2, 0x000000);
      vertical.alpha = 0.05;

      if (i > 0) {
        let horizontal = makeBlank(area, 14 * 32 - 4, 4, 2, 32 * (i - 13) - 2, 0x000000);
        horizontal.alpha = 0.05;
      }
    }

    this.player_area.underlayer = new PIXI.Container();
    this.player_area.addChild(this.player_area.underlayer)
    this.player_area.layers = [];
    for (let i = 0; i < 13; i++) {
      let c = new PIXI.Container();
      this.player_area.addChild(c);
      this.player_area.layers.push(c);
    }

    this.doodads = [];
    this.board = [];
    for (let x = 0; x < 14; x++) {
      this.board[x] = [];
      this.doodads[x] = [];
      for (let y = 0; y < 13; y++) {
        this.board[x][y] = "";
        this.doodads[x][y] = "";
        let dice = Math.random();
        if (x > 0 && x < 13 && y > 0 && y < 12 && dice < 0.03) {
          this.doodads[x][y] = makeSprite("Art/tree_" + Math.ceil(Math.random() * 2) + ".png", this.player_area.layers[y], 32 * x + 16, -13 * 32 + 32 * y + 16, 0.5, 0.95);
          this.doodads[x][y].type = "tree";
       } else if (x > 2 && x < 11 && y > 2 && y < 10 && dice > 0.96) {
          this.doodads[x][y] = makeRocketWithScaffolding(this.player_area.layers[y], 32 * x + 16, -13 * 32 + 32 * y);
          this.doodads[x][y].type = "rocket";
        }
      }
    }

    let font_16 = {fontFamily: "Press Start 2P", fontSize: 16, fill: 0xFFFFFF, letterSpacing: 3, align: "center", dropShadow: true, dropShadowColor: 0x000000, dropShadowDistance: 3};
    let font_18 = {fontFamily: "Press Start 2P", fontSize: 18, fill: 0xFFFFFF, letterSpacing: 3, align: "center", dropShadow: true, dropShadowColor: 0x000000, dropShadowDistance: 3};
    let font_36 = {fontFamily: "Press Start 2P", fontSize: 36, fill: 0x000000, lineHeight: 36, letterSpacing: 3, align: "center"};


    // level and score
    this.level_label = makeText("Level", font_16, this, 189, 184, 0.5, 0.5);
    this.level_text_box = makeText(this.level, font_18, this, 189, 217, 0.5, 0.5);
    this.tile_score_label = makeText("Tiles", font_16, this, 189, 344, 0.5, 0.5);
    this.player_tile_score_text_box = makeText(this.tile_score[0], font_18, this, 189, 377, 0.5, 0.5);
    this.dash_label = makeText("-", font_16, this, 189, 409, 0.5, 0.5);
    this.enemy_tile_score_text_box = makeText(this.tile_score[1], font_18, this, 189, 441, 0.5, 0.5);
    this.score_label = makeText("Score", font_16, this, 735, 184, 0.5, 0.5);
    this.score_text_box = makeText(this.score, font_18, this, 735, 217, 0.5, 0.5);
    this.play_clock_label = makeText("Clock", font_16, this, 735, 344, 0.5, 0.5);
    this.play_clock_text_box = makeText(this.play_clock, font_18, this, 735, 377, 0.5, 0.5);
    this.play_clock_text_box.visible = false;
    this.announcement = makeText("", font_36, this, 470, 78, 0.5, 0.5);
    this.escape_to_quit = makeText("PAUSED\n\nPRESS Q TO QUIT", font_18, this, 470, 303, 0.5, 0.5)

    this.play_clock_label.visible = false;
    this.escape_to_quit.visible = false;
    

    // let player_monitor_mask = new PIXI.Graphics();
    // player_monitor_mask.beginFill(0xFF3300);
    // player_monitor_mask.drawRect(129, 39, 669, 504);
    // player_monitor_mask.endFill();
    // this.player_area.mask = player_monitor_mask;

    let corners = [0, 1, 2, 3]; // bottom left, top left, top right, bottom right
    shuffleArray(corners);

    this.cursor = [];
    this.cursor[0] = new PIXI.Sprite(PIXI.Texture.from("Art/american_cursor_draft_3.png"));
    let pc = this.cursor[0];
    pc.anchor.set(0.5,0.5);
    let corner = corners[0];
    pc.x_tile = corner < 2 ? 0 : 13;
    pc.y_tile = corner == 1 || corner == 2 ? 12 : 0;
    pc.angle = corner < 2 ? 0 : 180;
    pc.position.set(32 * pc.x_tile + 16, -13 * 32 + 32 * pc.y_tile + 16);
    this.player_area.addChild(pc);
    pc.visible = false;

    this.cursor[1] = new PIXI.Sprite(PIXI.Texture.from("Art/soviet_cursor_draft_3.png"));
    let ec = this.cursor[1];
    ec.anchor.set(0.5,0.5);
    corner = corners[1];
    ec.x_tile = corner < 2 ? 0 : 13;
    ec.y_tile = corner == 1 || corner == 2 ? 12 : 0;
    ec.angle = corner < 2 ? 0 : 180;
    ec.position.set(32 * ec.x_tile + 16, -13 * 32 + 32 * ec.y_tile + 16);
    this.player_area.addChild(ec);
    if (corner == 0) ec.favor = ["down", "right"];
    if (corner == 1) ec.favor = ["up", "right"];
    if (corner == 2) ec.favor = ["up", "left"];
    if (corner == 3) ec.favor = ["down", "left"];
    ec.visible = false;
  }

  keyDown(ev) {

    let key = ev.key;

    if (key === "Shift") {
      if (ev.code === "ShiftLeft") key = "LShift";
      if (ev.code === "ShiftRight") key = "RShift";
    }

    let player = 0;
    if (!paused) {

      if (key === "ArrowRight") {
        this.moveCursor("right", player);
      }

      if (key === "ArrowLeft") {
        this.moveCursor("left", player);
      }

      if (key === "ArrowUp") {
        this.moveCursor("up", player);
      }

      if (key === "ArrowDown") {
        this.moveCursor("down", player);
      }

      if (key === "LShift") {
        let cursor = this.cursor[player];
        if (cursor.angle == "0" || cursor.angle == "180") {
          let x_tile = cursor.x_tile;
          while (this.inBounds(x_tile - 1, cursor.y_tile) && this.board[x_tile - 1][cursor.y_tile] != "") {
            x_tile -= 1;
          }
          if (x_tile != cursor.x_tile) {
            this.jumpCursor(player, x_tile, cursor.y_tile, "left");
          }
        } else if (cursor.angle == "90" || cursor.angle == "-90") {
          let y_tile = cursor.y_tile;
          while (this.inBounds(cursor.x_tile, y_tile - 1) && this.board[cursor.x_tile][y_tile - 1] != "") {
            y_tile -= 1;
          }
          if (y_tile != cursor.y_tile) {
            this.jumpCursor(player, cursor.x_tile, y_tile, "up");
          }
        }

      }

      if (key === "RShift") {
        let cursor = this.cursor[player];
        if (cursor.angle == "0" || cursor.angle == "180") {
          let x_tile = cursor.x_tile;
          while (this.inBounds(x_tile + 1, cursor.y_tile) && this.board[x_tile + 1][cursor.y_tile] != "") {
            x_tile += 1;
          }
          if (x_tile != cursor.x_tile) {
            this.jumpCursor(player, x_tile, cursor.y_tile, "right");
          }
        } else if (cursor.angle == "90" || cursor.angle == "-90") {
          let y_tile = cursor.y_tile;
          while (this.inBounds(cursor.x_tile, y_tile + 1) && this.board[cursor.x_tile][y_tile + 1] != "") {
            y_tile += 1;
          }
          if (y_tile != cursor.y_tile) {
            this.jumpCursor(player, cursor.x_tile, y_tile, "down");
          }
        }

      }

      for (i in lower_array) {
        if (key === lower_array[i] || key === letter_array[i]) {
          //if(this.player_palette.letters[letter_array[i]].playable === true) {
            this.addLetter(letter_array[i], player);
          //}
        }
      }

      if (key === "Backspace" || key === "Delete") {
        this.deleteAction(player);
      }

      if (key === "Tab") {
        this.clearWord(player);
      }

      if (key === "Enter") {
        this.enterAction(player);
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
      game.fadeToBlack(800);
      delay(() => {
        resume();
        game.score = this.score;
        game.createScreen("lobby");
        game.popScreens("word_base", "lobby");
        game.fadeFromBlack(800);
      }, 900)
    }

    if (key === "Escape" && (this.state == "active" || this.state == "countdown")) {
      if (!paused) {
        pause();
        this.announcement.visible = false;
        this.escape_to_quit.visible = true;
        pauseSoundEffect("countdown");
      } else {
        resumeSoundEffect("countdown");
        this.announcement.visible = true;
        this.escape_to_quit.visible = false;
        resume();
      }
    }
  }


  mouseDown(ev) {
    let mouse_data = pixi.renderer.plugins.interaction.mouse.global;

    if (ev.button == 0) {
      // click to move the cursor.
      let x_click = mouse_data.x - this.player_area.x;
      let y_click = mouse_data.y - this.player_area.y;
      let x_tile = Math.floor(x_click / 32);
      let y_tile = Math.floor((13 * 32 + y_click)/32);

      if (this.inBounds(x_tile, y_tile) && this.board[x_tile][y_tile] != "") {
        this.jumpCursor(0, x_tile, y_tile, null);
      }
    }
  }


  clearWord(player, drop_letters = true) {
    if (this.state != "active") {
      return;
    }
    for (let i = 0; i < this.base_letters[player].length; i++) {
      let dead_tile = this.base_letters[player][i];
      if (drop_letters) {
        dead_tile.vx = -10 + Math.random() * 20;
        dead_tile.vy = -4 - Math.random() * 14;
        freefalling.push(dead_tile);
      } else {
        this.player_area.removeChild(dead_tile);
      }
    }
    this.base_letters[player] = [];
  }


  deleteAction(player) {
    if (this.state != "active") {
      return;
    }
    if (this.base_letters[player].length == 0) {
      return;
    }

    let tile = this.base_letters[player].pop();
    tile.vx = -10 + Math.random() * 20;
    tile.vy = -4 - Math.random() * 14;
    freefalling.push(tile);

    let mod = this.board[this.cursor[player].x_tile][this.cursor[player].y_tile] != "" ? 1 : 0;

    if (this.cursor[player].angle == 180) {
      for (let i = 0; i < this.base_letters[player].length; i++) {
        let old_tile = this.base_letters[player][i];
        old_tile.x_tile += 1;
        let x = 32 * (this.cursor[player].x_tile - mod) + 16 - (this.base_letters[player].length - i) * 32;

        new TWEEN.Tween(old_tile)
          .to({x: x + 32})
          .duration(150)
          .easing(TWEEN.Easing.Quartic.Out)
          .start();
      }
    } else if (this.cursor[player].angle == 180 || this.cursor[player].angle == -90) {
      for (let i = 0; i < this.base_letters[player].length; i++) {
        let old_tile = this.base_letters[player][i];
        old_tile.y_tile += 1;
        let y = 16 - 13 * 32 + 32 * (this.cursor[player].y_tile - this.base_letters[player].length + i - mod);

        new TWEEN.Tween(old_tile)
          .to({y: y + 32})
          .duration(150)
          .easing(TWEEN.Easing.Quartic.Out)
          .start();
      }
    }

    this.checkWord(player);
  }


  enterAction(player) {
    if (this.state != "active") {
      return;
    }

    if (this.can_play_word[player] == false) {
      return;
    }

    // Oops, explode the word because it blocks something
    let fail_word = false;
    for (let i = 0; i < this.base_letters[player].length; i++) {
      let old_tile = this.base_letters[player][i];
      if (this.board[old_tile.x_tile][old_tile.y_tile] != "") {
        fail_word = true;
      }
    }
    if (fail_word) {
      this.clearWord(player);
      return;
    }

    this.player_area.shake = markTime();
    soundEffect("build");

    for (let i = 0; i < this.base_letters[player].length; i++) {
      let old_tile = this.base_letters[player][i];
      let o_x = old_tile.x_tile;
      let o_y = old_tile.y_tile;

      // x and y might be in the middle of moving, so we need to use the fixed values
      let x = 32 * o_x + 16
      let y = -13 * 32 + 32 * o_y + 16
      let building = makeLetterBuilding(this.player_area.layers[o_y], x, y, old_tile.text, player);
      building.x_tile = o_x;
      building.y_tile = o_y;
      building.player = player;
      this.board[o_x][o_y] = building;
      if (this.doodads[o_x][o_y] != "") {
        if (this.doodads[o_x][o_y].type == "tree") {
          this.player_area.layers[o_y].removeChild(this.doodads[o_x][o_y]);
          this.doodads[o_x][o_y] = "";
        } else if (this.doodads[o_x][o_y].type == "rocket") {
          this.makeRocket(player, o_x, o_y)
        }
      } else if (o_y < 12 && this.doodads[o_x][o_y + 1] != "") {
        this.doodads[o_x][o_y + 1].alpha = 0.7;
      } else if (o_y < 11 && this.doodads[o_x][o_y + 2] != "") {
        this.doodads[o_x][o_y + 2].alpha = 0.7;
      }

      makeSmoke(this.player_area.underlayer, x, y - 24, 1.5, 1.5);

      this.played_squares.push([o_x, o_y]);
    }

    // Add tile scores
    this.tile_score[player] += this.base_letters[player].length;
    if (player == 1) {
      this.enemy_tile_score_text_box.text = this.tile_score[player];
      // Update the other player's word validity
      this.checkWord(0);
    } else if (player == 0) {
      this.player_tile_score_text_box.text = this.tile_score[player];

      // Add to player score. Note here that you get credit for the whole word.
      this.score += 10 * this.word_to_play[player].length;
      this.score_text_box.text = this.score;
      // Update the other player's word validity
      this.checkWord(1);

      // if the score is good, add a swear word to the opponent's head
      if (this.base_letters[player].length >= 4 &&
        (Math.random() < 0.07) ||
        (this.tile_score[0] + this.tile_score[1] > 50 && this.tile_score[0] - this.tile_score[1] > 0) || 
        (this.tile_score[0] - this.tile_score[1] > 20 && this.tile_score[0] - this.tile_score[1] >= 10)) {
        swearing(this, 400, 400);
      }
    }

    if (this.tile_score[player] >= 50 && this.speed_play == false) {
      // Speed it up!
      this.speed_play = true;
      this.announcement.text = "SPEED IT UP!";
      this.last_play = markTime();
      delay(() => {
        this.announcement.text = "";
      }, 2000);
    }

    if (this.tile_score[0] >= 70 || this.tile_score[1] >= 70) {
      this.gameOver();
    }

    this.last_play = markTime();

    this.played_words[this.word_to_play[player]] = 1;

    this.clearWord(player, false); // false means the tiles just disappear instead of falling away.
  }


  makeRocket(player, o_x, o_y) {
    if (player != 0) return;
    soundEffect("rocket")
    let dead_tile = this.doodads[o_x][o_y];
    if (dead_tile != "") {
      dead_tile.rocket.visible = false;
      dead_tile.vx = -10 + Math.random() * 20;
      dead_tile.vy = -4 - Math.random() * 14;
      freefalling.push(dead_tile);
    }

    let rocket = new PIXI.Container();
    rocket.position.set(32 * o_x + 16 + this.player_area.x, -13 * 32 + 32 * o_y + this.player_area.y);

    rocket.fire_sprite = makeFire(rocket, 0, 34, 0.28, 0.24);
    rocket.fire_sprite.original_x = rocket.fire_sprite.x;
    rocket.fire_sprite.original_y = rocket.fire_sprite.y;

    rocket.rocket_sprite = makeSprite("Art/rocket_neutral.png", rocket, 0, 0, 0.5, 0.5)
    
    // calculations to prepare for odd parabolic flight
    let M = 760 - rocket.y;

    if (player == 0) {
      M = 470 - rocket.y;
    }

    rocket.b_val = 5 * (Math.sqrt(100 + M) + 10);
    rocket.a_val = -1 * rocket.b_val * rocket.b_val / 400;
    rocket.original_x = rocket.x;
    rocket.original_y = rocket.y;
    rocket.player = player;

    rocket.start_time = markTime();

    this.addChild(rocket);
    this.active_rockets.push(rocket);
  }


  moveCursor(direction, player) {
    if (this.state != "active") {
      return;
    }

    if (this.base_letters[player].length > 0) {
      this.clearWord(player);
    }

    let cursor = this.cursor[player];
    if (direction == "up" && cursor.y_tile > 0 && this.board[cursor.x_tile][cursor.y_tile - 1] != "") {
      cursor.y_tile -= 1;
    } else if (direction == "down" && cursor.y_tile < 12 && this.board[cursor.x_tile][cursor.y_tile + 1] != "") {
      cursor.y_tile += 1;
    } else if (direction == "left" && cursor.x_tile > 0 && this.board[cursor.x_tile - 1][cursor.y_tile] != "") {
      cursor.x_tile -= 1;
    } else if (direction == "right" && cursor.x_tile < 13 && this.board[cursor.x_tile + 1][cursor.y_tile] != "") {
      cursor.x_tile += 1;
    }

    // TO DO:
    // make this choose intelligently
    if (direction == "up") {
      cursor.angle = -90;
    } else if (direction == "down") {
      cursor.angle = 90;
    } else if (direction == "left") {
      cursor.angle = 180;
    } else if (direction == "right") {
      cursor.angle = 0;
    }

    new TWEEN.Tween(cursor)
      .to({x: 32 * cursor.x_tile + 16, y: 16 - 13 * 32 + 32 * cursor.y_tile})
      .duration(150)
      .easing(TWEEN.Easing.Quartic.Out)
      .start();
  }


  jumpCursor(player, x, y, direction = -1) {
    if (this.state != "active") {
      return;
    }
    if (this.base_letters[player].length > 0) {
      this.clearWord(player);
    }

    let cursor = this.cursor[player];
    cursor.x_tile = x;
    cursor.y_tile = y;

    if (direction == -1) {
      direction = pick(["up", "down", "left", "right"]);
    }
    if (direction == "up") {
      cursor.angle = -90;
    } else if (direction == "down") {
      cursor.angle = 90;
    } else if (direction == "left") {
      cursor.angle = 180;
    } else if (direction == "right") {
      cursor.angle = 0;
    }

    new TWEEN.Tween(cursor)
      .to({x: 32 * cursor.x_tile + 16, y: 16 - 13 * 32 + 32 * cursor.y_tile})
      .duration(150)
      .easing(TWEEN.Easing.Quartic.Out)
      .start();
  }


  addLetter(letter, player) {
    if (this.state != "active") {
      return;
    }

    let bpc = this.cursor[player];
    let letters = this.base_letters[player];
    let mod = this.board[bpc.x_tile][bpc.y_tile] != "" ? 1 : 0;

    // Bail out if we'd hit the edges of the board
    if (bpc.angle == 180 && letters.length + mod > bpc.x_tile) {
      return;
    }
    if (bpc.angle == -90 && letters.length + mod > bpc.y_tile) {
      return;
    }
    if (bpc.angle == 0 && letters.length + bpc.x_tile + mod >= 14) {
      return;
    }
    if (bpc.angle == 90 && letters.length + bpc.y_tile + mod >= 13) {
      return;
    }

    // Bail out if we'd hit another tile
    if (bpc.angle == 0 && this.board[bpc.x_tile + letters.length + mod][bpc.y_tile] != "") {
      return;
    }
    if (bpc.angle == 180 && this.board[bpc.x_tile - letters.length - mod][bpc.y_tile] != "") {
      return;
    }
    if (bpc.angle == -90 && this.board[bpc.x_tile][bpc.y_tile - letters.length - mod] != "") {
      return;
    }
    if (bpc.angle == 90 && this.board[bpc.x_tile][bpc.y_tile + letters.length + mod] != "") {
      return;
    }

    // Okay, we're good. Make the tile
    let tile = makePixelatedLetterTile(this.player_area, letter, "white");
    tile.text = letter;
    tile.parent = this.player_area;
    tile.tint = 0x000000;

    // Place the tile and adjust existing tiles
    if (bpc.angle == 0) {
      tile.position.set(
        32 * (bpc.x_tile + mod) + 16 + letters.length * 32,
        16 - 13 * 32 + 32 * bpc.y_tile
      );
      tile.x_tile = bpc.x_tile + letters.length + mod;
      tile.y_tile = bpc.y_tile;
    } else if (bpc.angle == 90) {
      tile.position.set(
        32 * bpc.x_tile + 16,
        16 - 13 * 32 + 32 * (bpc.y_tile + letters.length + mod)
      );
      tile.x_tile = bpc.x_tile;
      tile.y_tile = bpc.y_tile + letters.length + mod;
    } else if (bpc.angle == 180) {
      tile.position.set(
        32 * (bpc.x_tile - mod) + 16,
        16 - 13 * 32 + 32 * bpc.y_tile
      );
      tile.x_tile = bpc.x_tile - mod;
      tile.y_tile = bpc.y_tile;

      for (let i = 0; i < letters.length; i++) {
        let old_tile = letters[i];
        old_tile.x_tile -= 1;
        let x = tile.position.x - 32 * (letters.length - i);
        new TWEEN.Tween(old_tile)
          .to({x: x})
          .duration(150)
          .easing(TWEEN.Easing.Quartic.Out)
          .start();
      }
    } else if (bpc.angle == -90) {
      tile.position.set(
        32 * bpc.x_tile + 16,
        16 - 13 * 32 + 32 * (bpc.y_tile - mod));
      tile.x_tile = bpc.x_tile;
      tile.y_tile = bpc.y_tile - mod;

      for (let i = 0; i < letters.length; i++) {
        let old_tile = letters[i];
        old_tile.y_tile -= 1;
        let y = tile.position.y - 32 * (letters.length - i);
        new TWEEN.Tween(old_tile)
          .to({y: y})
          .duration(150)
          .easing(TWEEN.Easing.Quartic.Out)
          .start();
      }
    }

    // Add the tile to the list of tiles.
    letters.push(tile);

    // Now check the word and color it accordingly.
    this.checkWord(player);
  }


  checkWord(player) {
    this.can_play_word[player] = false;
    this.word_to_play[player] = "";
    let letters = this.base_letters[player];
    let bpc = this.cursor[player]

    if (letters.length == 0) {
      return;
    }

    // Check the word
    let word = this.buildWord(letters, bpc.angle);

    this.word_to_play[player] = word;
    this.can_play_word[player] = this.isLegalWord(word);

    // Check perpendicular words
    let perpendicular = bpc.angle == 180 || bpc.angle == 0 ? 90 : 0;
    for (let i = 0; i < letters.length; i++) {
      let perpendicular_word = this.buildWord([letters[i]], perpendicular);
      if (perpendicular_word.length >= 2) {
        if (!this.isLegalWord(perpendicular_word)) {
          console.log("fails on the perpendicular");
          this.can_play_word[player] = false;
        }
      }
    }

    if (this.can_play_word[player]) {
      for (let i = 0; i < letters.length; i++) {
        let letter = letters[i];
        letter.tint = 0x000000;
      }
    } else {
      for (let i = 0; i < letters.length; i++) {
        let letter = letters[i];
        letter.tint = 0xdb5858;
      }
    }
  }


  buildWord(word_list, angle) {
    // Get the word. It's everything in this.base_player_letters plus everything touching it in either direction.
    let word = [];
    for (let i = 0; i < word_list.length; i++) {
      let letter = word_list[i];
      word.push(letter.text);
    }

    // Add horizontal stuff
    if (angle == 180 || angle == 0) {
      let x = word_list[0].x_tile - 1;
      let y = word_list[0].y_tile;
      let more_letters = true;
      while (x >= 0 && more_letters) {
        if (this.board[x][y] != "") { 
          word.unshift(this.board[x][y].text);
          x -= 1;
        } else {
          more_letters = false;
        }
      }

      x = word_list[word_list.length - 1].x_tile + 1;
      more_letters = true;
      while (x < 14 && more_letters) {
        if (this.board[x][y] != "") { 
          word.push(this.board[x][y].text);
          x += 1;
        } else {
          more_letters = false;
        }
      }
    } else if (angle == 90 || angle == -90) {
      // Or add vertical stuff
      let x = word_list[0].x_tile;
      let y = word_list[0].y_tile - 1;
      let more_letters = true;
      while (y >= 0 && more_letters) {
        if (this.board[x][y] != "") { 
          word.unshift(this.board[x][y].text);
          y -= 1;
        } else {
          more_letters = false;
        }
      }

      y = word_list[word_list.length - 1].y_tile + 1;
      more_letters = true;
      while (y < 13 && more_letters) {
        if (this.board[x][y] != "") { 
          word.push(this.board[x][y].text);
          y += 1;
        } else {
          more_letters = false;
        }
      }
    }

    word = word.join("");

    return word;
  }


  isLegalWord(word) {
    if (word.length < 2) {
      return false;
    }

    if (!(word in game.legal_words)) {
      return false;
    }
    
    if (word in this.played_words) {
      return false;
    }

    return true;
  }


  updateDisplayInfo() {
    if (this.state == "countdown" && !paused) {
      let time_remaining = (2400 - (timeSince(this.start_time))) / 800;
      this.announcement.text = Math.ceil(time_remaining).toString();
      if (time_remaining <= 0) {
        
        this.state = "active";
        this.last_play = markTime();

        setMusic("action_song_2");

        this.announcement.text = "GO";
        this.cursor[0].visible = true;
        this.cursor[1].visible = true;
        delay(() => {this.announcement.text = "";}, 1600);
      }
    }
  }


  updatePlayClock() {
    if (this.state == "active" && !paused && this.speed_play == true) {
      this.play_clock_label.visible = true;
      this.play_clock_text_box.visible = true;
      let time_remaining = (this.play_clock*1000 - (timeSince(this.last_play))) / 1000;
      this.play_clock_text_box.text = Math.ceil(time_remaining).toString();
      // Green: 0x71d07d
      // Yellow: 0xf3db3c
      // Red: 0xdb5858
      if (time_remaining > 10) {
        this.play_clock_text_box.style.fill = 0x71d07d;
      } else if (time_remaining > 5) {
        this.play_clock_text_box.style.fill = 0xf3db3c;
      } else {
        this.play_clock_text_box.style.fill = 0xdb5858;
      }
      if (time_remaining <= 0) {
        this.gameOver();
      }
    } else {
      this.play_clock_label.visible = false;
      this.play_clock_text_box.visible = false;
    }
  }


  gameOver() {
    this.state = "gameover";

    this.announcement.style.fontSize = 36;

    let winning_player = 0;

    game.score = this.score;

    if (this.tile_score[0] < this.tile_score[1]) {
      this.announcement.text = "YOU LOSE";
      stopMusic();
      soundEffect("game_over");
      game.gameOver(10000, this.score);
      winning_player = 1;
    } else {
      this.announcement.text = "YOU WIN!";
      this.announcement.style.fill = 0xFFFFFF;
      flicker(this.announcement, 500, 0xFFFFFF, 0x67d8ef);
      soundEffect("victory");
      winning_player = 0;
      delay(() => {
        game.nextFlow();
      }, 10000);
    }

    let i = 1;
    for (let y = 3; y < 13; y += 3) {
      delay(() => {
        for (let x = 3; x < 14; x += 3) {
          this.doodads[x][y] = makeRocketWithScaffolding(this.player_area.layers[y], 32 * x + 16, -13 * 32 + 32 * y);
          this.doodads[x][y].type = "rocket";
          makeSmoke(this.player_area.underlayer, 32 * x + 16, -13 * 32 + 32 * y - 24, 1.5, 1.5);
        }
      }, i * 500);
      i += 1;
    }
    delay(() => {
      soundEffect("multibuild");
    }, 500);
    delay(() => {
      for (let x = 0; x < 14; x++) {
        for (let y = 0; y < 13; y++) {
          if (this.doodads[x][y] != "" && this.doodads[x][y].type == "rocket") {
            this.doodads[x][y].visible = false;
            this.makeRocket(winning_player, x, y);
          }
        }
      }
    }, 2500);
  }


  inBounds(x, y) {
    return (x >= 0 && x < 14 && y >= 0 && y < 13);
  }


  enemyAction() {
    if (this.state != "active") {
      return;
    }

    ////////////
    // STRATEGY
    //
    // First, if the cursor is over an empty spot, it's the beginning of the game,
    // the AI should immediately play a big word.
    //
    // Otherwise, the AI should move. Most of the time, it should move in the same
    // direction as the previous move. Some of the time, it should change direction.
    // A tiny amount of the time, it should leap around the board.
    //
    // If the AI is winning by 10 points and has more than 50, it should keep moving but mostly
    // not play, in order to run out the clock.
    //
    // After moving, the AI will be facing in a particular direction.
    // It should now attempt a word.
    // If the immediate next tile is filled or a wall, do nothing.
    // If the immediate preceding tile is filled, but there is some space ahead,
    // The candidate word should be drawn from the predictive spelling dictionary,
    // plus the suffixes "s", "er", "ers", and "ed".
    // If the immediate preceding tile is not filled, and a short distance ahead there
    // is another filled tile, the candidate word should be drawn from the bridge word
    // dictionary. If the bridge word dictionary fails, or there is not a filled tile
    // ahead, or there is a wall ahead, the AI should attempt to select a word of the
    // appropriate size. (For example, if there is clear space for 10 tiles to the wall,
    // the AI should target roughly 11 character words. However, if there is a wall just
    // one space away, the AI should look for 2 character words.)
    // 

    if (this.enemy_phase == "moving") {
      if(timeSince(this.enemy_last_action) <= 60000/this.enemy_move_speed) {
        return;
      } else {
        this.enemy_last_action = timeSince(0.2 * (60000/this.enemy_move_speed) - 0.4 * Math.random() * 60000/this.enemy_move_speed);
      }

      let tiles = null;
      let word = null;
      if (this.board[this.cursor[1].x_tile][this.cursor[1].y_tile] == "") {
        let move_set = [];
        move_set.push(this.cursor[1].favor[0]);
        move_set.push(this.cursor[1].favor[1]);
        let direction = pick(move_set);
        this.moveCursor(direction, 1);

        // We're at the beginning of the game. Make a big word right away.
        let word_size = this.enemy_start_len + Math.floor(Math.random() * (this.enemy_start_len + 2));
        let word_list = game.enemy_words[word_size];
        word = pick(word_list);

        tiles = this.wordList(word, this.cursor[1].x_tile, this.cursor[1].y_tile, this.cursor[1].angle);

        // if we fail to make the big word, because we got scooped, we've got to go a lot smaller.
        this.enemy_start_len = 2;
      } else {
        // Move, probably in the same direction as before, with a tiny chance of jumping around the board
        // and a larger chance of just changing direction.
        let dice = Math.random();
        if (dice <= 0.7) {
          let direction = "right";
          if (this.cursor[1].angle == 180) direction = "left";
          if (this.cursor[1].angle == 90) direction = "down";
          if (this.cursor[1].angle == -90) direction = "up";
          this.moveCursor(direction, 1);
        } else if (dice <= 0.75) {
          // Jump to another occupied board tile
          let spot = pick(this.played_squares);
          this.jumpCursor(1, spot[0], spot[1]);
        } else {
          let move_set = [];
          if (this.cursor[1].x_tile > 0) move_set.push("left");
          if (this.cursor[1].x_tile < 13) move_set.push("right");
          if (this.cursor[1].y_tile > 0) move_set.push("up");
          if (this.cursor[1].y_tile < 12) move_set.push("down");
          move_set.push(this.cursor[1].favor[0]);
          move_set.push(this.cursor[1].favor[1]);
          let direction = pick(move_set);
          this.moveCursor(direction, 1);
        }

        let angle = this.cursor[1].angle;
        let x_tile = this.cursor[1].x_tile;
        let y_tile = this.cursor[1].y_tile;
        let main_letter = this.board[x_tile][y_tile].text;
        let x_adj = 0;
        let y_adj = 0;

        if (angle == 0) x_adj = 1;
        if (angle == 180) x_adj = -1;
        if (angle == 90) y_adj = 1;
        if (angle == -90) y_adj = -1;

        let forward_room = 0;
        let m = 1;
        let terminus_is_letter = false;
        while (m > 0 && this.inBounds(x_tile + m * x_adj, y_tile + m * y_adj)) {
          if (this.board[x_tile + m * x_adj][y_tile + m * y_adj] == "") {
            forward_room += 1;
            m += 1;
          } else {
            terminus_is_letter = true;
            m = -100;
          }
        }

        let common_case = false;
        
        // Now we need to determine what kind of move we can make.
        if (!this.inBounds(x_tile + x_adj, y_tile + y_adj)
          || this.board[x_tile + x_adj][y_tile + y_adj] != "") {
          // Here, the tile ahead is taken or we are at a wall. Do nothing.
        } else if (this.inBounds(x_tile - x_adj, y_tile - y_adj)
          && this.board[x_tile - x_adj][y_tile - y_adj] != "") {
          // Since the tile opposite us is taken, we're either playing a prefix (180 or -90) or a suffix (0 or 90).
          let existing_word = this.buildWord([this.board[x_tile][y_tile]], angle);

          if (angle == 180 || angle == -90) {
            // Here we could play a prefix. Try prefixes.
            let prefixes = ["RE", "PRE", "DE", "ANTI", "BE", "DIS",
              "EXTRA", "IN", "INTRA", "INTER", "OUT", "BI", "TRI", 
              "OVER", "POST", "PRO", "SUB", "TRANS", "UN", "UNDER"];
            shuffleArray(prefixes);
            for (let i = 0; i < prefixes.length; i++) {
              let prefix = prefixes[i];
              if ((prefix + existing_word) in game.legal_words) {
                word = prefix;
                tiles = this.wordList(word, x_tile + x_adj, y_tile + y_adj, angle)
                if (tiles != null) {
                  break;
                }
              } 
            }
          } else {
            // Here we could play a suffix or an autocomplete.
            let suffixes = ["ERS", "ING", "INGLY", "ESQUE", "ION", "FUL", "ISH",
              "INGS", "EST", "IEST", "IER", "NESS", "MENT", "TY", "ITY", "SHIP",
              "IVE", "LESS", "Y", "S", "ES", "ER", "ED", "EN", ];
            shuffleArray(suffixes);
            for (let i = 0; i < suffixes.length; i++) {
              let suffix = suffixes[i];
              if ((existing_word + suffix) in game.legal_words) {
                word = suffix;
                tiles = this.wordList(word, x_tile + x_adj, y_tile + y_adj, angle)
                if (tiles != null) {
                  break;
                }
              } 
            }

            if (tiles == null) {
              if (existing_word in game.long_spelling_prediction) {
                word = game.long_spelling_prediction[existing_word].slice(existing_word.length);

                if (word.length > 0) {
                  tiles = this.wordList(word, x_tile + x_adj, y_tile + y_adj, angle);
                }
              }
            }
          }
        } else if (terminus_is_letter && forward_room > 0 && forward_room <= 5
          && (!this.inBounds(x_tile - x_adj, y_tile - y_adj) || this.board[x_tile - x_adj][y_tile - y_adj] == "")
          && (!this.inBounds(x_tile + (forward_room+2) * x_adj, y_tile + (forward_room+2) * y_adj) 
                || this.board[x_tile + (forward_room+2) * x_adj][y_tile + (forward_room+2) * y_adj] == "")) {
          // There is a gap of five letters or less!
          // We can try for a bridge word. Note that if this fails, we still want to hit the common case.

          let bridge_letter = this.board[x_tile + (forward_room+1) * x_adj][y_tile + (forward_room+1) * y_adj].text;
          let desired_length = forward_room + 2;
          let d = game.bridge_word_dictionaries[main_letter + bridge_letter];
          // NOTE: because of angles, it may be necessary to swap the main and bridge letters.
          if (angle == 180 || angle == -90) d = game.bridge_word_dictionaries[bridge_letter + main_letter];
          //console.log(main_letter + bridge_letter);
          //console.log(d);
          let candidate_word = null;
          // Not every pair has words in it! This was an actual bug I thankfully triggered pretty quickly.
          if (d.length > 0) {
            for (let z = 0; z < 20; z++) {
              let w = pick(d);
              if (w.length == desired_length) {
                candidate_word = w;
                break;
              }
            }
          }

          if (candidate_word != null) {
            word = candidate_word.slice(1,-1);
            tiles = this.wordList(word, x_tile + x_adj, y_tile + y_adj, angle)
          } else {
            common_case = true;
          }
        } else {
          // hit the common case.
          common_case = true;
        }

        if (common_case) {
          // This is the last and most common case. We're free to play ahead a certain distance, and will use it.

          let d = null;
          let tries = 20;
          if (forward_room >= 3) {
            if (angle == 0 || angle == 90) {
              d = game.starting_dictionaries[main_letter];
            } else {
              d = game.ending_dictionaries[main_letter];
            }
          } else {
            tries = 40;
            if (angle == 0 || angle == 90) {
              d = game.short_starting_dictionaries[main_letter];
            } else {
              d = game.short_ending_dictionaries[main_letter];
            }
          }

          for (let z = 0; z < tries; z++) {
            let w = pick(d);
            if (w.length < forward_room + 1) {
              if (angle == 0 || angle == 90) word = w.slice(1);
              if (angle == 180 || angle == -90) word = w.slice(0,-1);
              tiles = this.wordList(word, x_tile + x_adj, y_tile + y_adj, angle)
              if (forward_room < 4) {
              }
              break;
            }
          }
        }
      }


      // Now play what we've got

      if (tiles != null) {
        if(this.tile_score[1] >= 50 && this.tile_score[1] - this.tile_score[0] >= 10) {
          // Probably best not to play. Run the clock and let the player beat themselves.
          if (run_clock_when_winning) {
            if (Math.random() < 0.7) {
              return;
            }
          }
        }

        let angle = this.cursor[1].angle;
        let full_word = this.buildWord(tiles, angle);

        this.can_play_word[1] = this.isLegalWord(full_word);

        // Check perpendicular words
        let perpendicular = angle == 180 || angle == 0 ? 90 : 0;
        for (let i = 0; i < tiles.length; i++) {
          let perpendicular_word = this.buildWord([tiles[i]], perpendicular);
          if (perpendicular_word.length >= 2) {
            if (!this.isLegalWord(perpendicular_word)) {
              this.can_play_word[1] = false;
            }
          }
        }

        if (this.can_play_word[1] == true) {
          this.enemy_phase = "typing";
          this.enemy_typing_mark = 0;

          this.enemy_word = "";
          for (let i = 0; i < tiles.length; i++) {
            this.enemy_word += tiles[i].text;
          }
        }
      }

    } else if (this.enemy_phase == "typing") {
      if(timeSince(this.enemy_last_action) <= 60000/this.enemy_typing_speed) {
        return;
      } else {
        this.enemy_last_action = timeSince(0.2 * (60000/this.enemy_typing_speed) - 0.4 * Math.random() * 60000/this.enemy_typing_speed);
      }

      if (this.enemy_typing_mark < this.enemy_word.length) {
        // if (this.enemy_palette.letters[this.enemy_word[this.enemy_typing_mark]].playable) {
          this.addLetter(this.enemy_word[this.enemy_typing_mark], 1);
          this.enemy_typing_mark += 1;
        //} // otherwise just sit on your hands, opponent.
      } else {
        this.checkWord(1);
        if (this.can_play_word[1]) {
          this.enterAction(1);
          this.enemy_phase = "moving";
          this.enemy_typing_mark = 0;
          this.can_play_word[1] = false;
          this.enemy_word = "";
        } else {
          this.clearWord(1);
          this.enemy_phase = "moving";
          this.enemy_typing_mark = 0;
          this.can_play_word[1] = false;
          this.enemy_word = "";
        }
      }
    }
  }


  wordList(word, x_tile, y_tile, angle) {
    let tiles = [];
    for (let i = 0; i < word.length; i++) {
      let x = 0;
      let y = 0;
      if (angle == 0) {
        x = x_tile + i;
        y = y_tile;
      }
      if (angle == 180) {
        x = x_tile + i + 1 - word.length;
        y = y_tile;
      }
      if (angle == 90) {
        x = x_tile;
        y = y_tile + i;
      }
      if (angle == -90) {
        x = x_tile;
        y = y_tile + i + 1 - word.length;
      }
      if (x < 0 || y < 0 || x > 13 || y > 12) {
        // bad list
        return null;
      } else {
        tiles.push({
          x_tile: x,
          y_tile: y,
          text: word[i]
        });
      }
    }
    return tiles;
  }


  updateRockets() {
    if (this.state != "active" && this.state != "gameover") {
      return;
    }

    let new_active_rockets = [];
    for (let i = 0; i < this.active_rockets.length; i++) {
      //console.log("a rocket");
      let rocket = this.active_rockets[i];
      let t = timeSince(rocket.start_time) / 1000;
      if (t < 1.8) {
        t = Math.pow(2.2222 * t, 1.8) / Math.pow(1.8, 1.8);// parametrized to go faster at the end
        let old_x = rocket.position.x;
        let old_y = rocket.position.y;
        let x_width = 75;
        if (rocket.player == 0) x_width = 37.5;
        rocket.position.y = rocket.original_y - rocket.a_val * t * t - rocket.b_val * t;
        rocket.position.x = rocket.original_x + x_width * (-1 * (t - 2)*(t - 2) + 4);
        let angle = Math.atan2(rocket.position.y - old_y, rocket.position.x - old_x) + Math.PI / 2;
        rocket.rotation = angle;

        for (let d = 0; d < 2; d++) {
          // drop an ember
          let ember = PIXI.Sprite.from(PIXI.Texture.WHITE);
          let initial_velocity = -1 + Math.floor(Math.random() * 2);
          let initial_x_position = -16 + Math.floor(Math.random() * 32);
          
          ember.tint = pick(fire_colors);
          ember.width = 4;
          ember.height = 4;
          ember.vx = initial_velocity * Math.cos(angle + Math.PI);
          ember.vy = initial_velocity * Math.sin(angle + Math.PI);
          ember.vx = 0;
          ember.vy = 0;
          ember.type = "ember";
          ember.parent = this;
          ember.position.set(rocket.x + initial_x_position * Math.cos(angle) - 30 * Math.sin(angle), rocket.y + initial_x_position * Math.sin(angle) + 30 * Math.cos(angle));
          this.addChild(ember);
          freefalling.push(ember);
        }
        new_active_rockets.push(rocket);
      } else {
        // let palette = this.player_palette;
        // let radius = 100;
        // if (rocket.player == 0) {
        //   palette = this.enemy_palette;
        //   radius = 50;
        // }
        let radius = 100;
        let temp_palette = new PIXI.Container();
        temp_palette.x = 300;
        temp_palette.y = 300;
        //for(let l = 0; l < letter_array.length; l++) {
          //player_palette.letters
          // let letter = temp_palette.letters[letter_array[l]];
          // let letter_x = letter.x * temp_palette.scale.x + temp_palette.x;
          // let letter_y = letter.y * temp_palette.scale.y + temp_palette.y;
          //console.log(letter_array[l] +"," + letter_x + "," + letter_y);

          if (distance(rocket.position.x, rocket.position.y, temp_palette.x, temp_palette.y) < radius) {
            // blow up this letter for a while
            // if (letter.playable === true) {
            //   letter.disable();
            //   letter.playable = false;
              this.shake = markTime();
              soundEffect("explosion_3");
              if (rocket.player == 0 && this.state != "gameover") swearing(this, 400, 400);

              let electric = makeElectric(this, temp_palette.x, temp_palette.y, 1.5, 1.5);

              // letter.tint = 0x4c4c4c;
              // letter.angle = -10 + 20 * Math.random();

              let explosion = makeExplosion(this, 
                temp_palette.x,
                temp_palette.y,
              1, 1, function() {electric.visible = true; temp_palette.removeChild(explosion);});

              delay(() => {
                // letter.enable()
                // letter.playable = true;
                // letter.tint = 0xFFFFFF;
                // letter.angle = 0;
                this.removeChild(electric);
              }, 6000); 
            //}
          }
        //}

        this.removeChild(rocket);
      }
    }
    this.active_rockets = new_active_rockets;
  }


  update(diff) {
    let fractional = diff / (1000/30.0);

    shakeDamage();
    freeeeeFreeeeeFalling(fractional);

    this.updateDisplayInfo();
    this.updateRockets();

    // Skip the rest if we aren't in active gameplay
    if (this.state != "active") {
      return;
    }

    this.updatePlayClock();
    this.enemyAction();  
  }
}