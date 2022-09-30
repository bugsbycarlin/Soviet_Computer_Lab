//
// This file contains the Kuzka's Mother subgame.
//
// In this game, you type words to launch rockets
// at enemy bases.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//

var american_base_points = [
  [208, 38],
  [218, 118],
  [220, 169],
  [365, 30],
  [810, 462],
  [380, 168],
  [350, 228],
  [392, 275],
  [286, 241],
  [334, 273],
  [395, 371],
  [424, 430],
  [205, 274],
  [255, 300],
  [290, 366],
  [210, 365],
  [100, 390],
  [185, 425],
  [110, 458],
  [25, 430]
];

var soviet_base_points = [
  [440, 160],
  [428, 208],
  [460, 260],
  [496, 167],
  [525, 212],
  [516, 262],
  [523, 333],
  [570, 310],
  [607, 342],
  [645, 380],
  [642, 347],
  [632, 110],
  [650, 196],
  [720, 270],
  [695, 360],
  [697, 42],
  [702, 147],
  [788, 196],
  [815, 323],
  [784, 83]
];

var dominica_base_points = [
  
];
var st_lucia_base_points = [

];
var st_vincent_base_points = [

];
var grenada_base_points = [

];

var cornwallis_base_points = [
  [319, 44],
  [245, 64],
  [350, 83],
  [192, 131],
  [250, 110],
  [338, 146],
  [422, 137],
  [225, 129],
  [274, 170],
];

var disko_base_points = [
  [551, 160],
  [613, 198],
  [522, 229],
  [503, 277],
  [597, 281],
  [655, 277],
  [561, 367],
  [652, 357],
  [705, 320],
];

var stefansson_base_points = [
  [157, 282],
  [261, 307],
  [328, 318],
  [213, 327],
  [176, 341],
  [253, 365],
  [330, 383],
  [208, 409],
  [276, 428],
];


class KuzkasMother extends Screen {
  initialize() {
    freefalling = [];
    shakers = [];

    this.level = game.level != null ? game.level : 1;
    this.score = game.score != null ? game.score : 0;
    this.difficulty_level = game.difficulty_level != null ? game.difficulty_level : "medium";

    this.played_words = {};
    this.num_players = 2;
    this.player_number = 0;
    this.rocket_letters = [];
    this.launch_queue = [];

    this.pickBases();

    this.wpm_history = [];
    this.calculated_wpm = 0;
    this.display_wpm = 0;

    this.base_selection = [0, 4];
    this.base_selection_corners = [];

    this.queue_speed = 150;

    this.resetBoard();

    this.state = "pre_game";

    delay(() => {
      paused = false;
      pause_time = 0;
      this.start_time = markTime();
      this.state = "countdown";
      soundEffect("countdown"); 
    }, 1800);
  }


  resetBoard() {
    this.game_board = new PIXI.Container();
    this.addChild(this.game_board);
    this.game_board.scale.set(2, 2);
    
    let map = makeSprite("Art/Kuzkas_Mother/map_" + this.num_players + "_player.png", this.game_board, -100, 0);

    this.smoke_layer = new PIXI.Container();
    this.game_board.addChild(this.smoke_layer);
    this.base_layer = new PIXI.Container();
    this.game_board.addChild(this.base_layer);
    this.rocket_layer = new PIXI.Container();
    this.game_board.addChild(this.rocket_layer);
    this.selection_layer = new PIXI.Container();
    this.game_board.addChild(this.selection_layer);

    this.hud = new PIXI.Container();
    this.addChild(this.hud);
    this.hud.scale.set(2, 2);

    let hud_background = makeSprite("Art/Kuzkas_Mother/hud_background.png", this.hud, 0, 0);

    // the player's launchpad
    this.launchpad = new Launchpad(this, this.hud, this.player_number, this.bases[this.player_number], 224, 480, 32, 32, false);

    const font_1 = {fontFamily: "Press Start 2P", fontSize: 20, fill: 0xFFFFFF, letterSpacing: 12, align: "left"};
    const font_2 = {fontFamily: "Press Start 2P", fontSize: 14, fill: 0xFFFFFF, letterSpacing: 3, align: "center", dropShadow: true, dropShadowColor: 0x000000, dropShadowDistance: 3}
    const font_3 = {fontFamily: "Press Start 2P", fontSize: 16, fill: 0xFFFFFF, letterSpacing: 3, align: "center", dropShadow: true, dropShadowColor: 0x000000, dropShadowDistance: 3}
    const font_4 = {fontFamily: "Press Start 2P", fontSize: 36, lineHeight: 36, fill: 0xFFFFFF, letterSpacing: 3, align: "center", dropShadow: true, dropShadowColor: 0x000000, dropShadowDistance: 3}
    const font_5 = {fontFamily: "Press Start 2P", fontSize: 18, lineHeight: 36, fill: 0xFFFFFF, letterSpacing: 3, align: "center", dropShadow: true, dropShadowColor: 0x000000, dropShadowDistance: 3}

    this.spelling_help = makeText("", font_1, this.game_board, 6, -64);
    this.spelling_help.alpha = 0.4;

    // level and score
    this.level_label = makeText("Level", font_2, this.hud, 1.5 * 32, 4.5 * 32, 0.5, 0.4);
    this.level_text_box = makeText(this.level, font_3, this.hud, 1.5 * 32, 5.5 * 32, 0.5, 0.4);
    this.score_label = makeText("Score", font_2, this.hud, 1.5 * 32, 6.5 * 32, 0.5, 0.4);
    this.score_text_box = makeText(this.score, font_3, this.hud, 1.5 * 32, 7.5 * 32, 0.5, 0.4);
    this.wpm_label = makeText("WPM", font_2, this.hud, 1.5 * 32, 8.5 * 32, 0.5, 0.4);
    this.wpm_text_box = makeText(this.play_clock, font_3, this.hud, 1.5 * 32, 9.5 * 32, 0.5, 0.4);
    this.announcement = makeText("", font_4, this.hud, 832 / 2, 480 / 2, 0.5, 0.5);
    this.q_to_quit = makeText("PAUSED\n\nPRESS Q TO QUIT", font_5, this.hud, 832 / 2, 480 / 2, 0.5, 0.5);
    this.q_to_quit.visible = false;

    // NO MULTI
    this.setEnemyDifficulty(this.level, this.difficulty_level);
    this.enemy_last_action = markTime();

    for (var i = 0; i < board_width; i++) {
      this.launchpad.cursors[i].visible = false;
    }

    shakers = [this.game_board, this.launchpad.underline_text];
  }


  makeBase(x, y, letter, side) {
    let base = makeLetterBuilding(this.base_layer, x, y, letter, side);
    
    base.HP = 20;
    base.scale.set(0.7, 0.7);
    
    base.backing_black = makeBlank(base, 32, 4, -16, 19, 0x000000);
    base.health_bar = makeBlank(base, 32, 3, -16, 19, 0x55be3c);

    this.bases[side].push(base);
        
    makeSmoke(this.smoke_layer, x, y - 16, 1, 1);
  }


  makeBaseSelectionCorners() {
    for (let i = 0; i < this.num_players; i++) {
      let p = this.base_points[(i + 1 + this.num_players) % this.num_players][this.base_selection[i]];
      this.base_selection_corners[i] = makeSprite("Art/Kuzkas_Mother/selection_corners.png",
        this.selection_layer, p[0], p[1], 0.5, 0.5);
      this.base_selection_corners[i].visible = true;
    }
  }


  setEnemyDifficulty(level, difficulty_level) {
    let capped_level = Math.min(level, 26);
    let scale;
    let min_word;
    let med_word;
    let max_word;
    if (difficulty_level == "easy") {
      scale = 0.7;
      min_word = 4;
      med_word = 5;
      max_word = 8;
    } else if (difficulty_level == "medium") {
      scale = 0.8;
      min_word = 4;
      med_word = 7;
      max_word = 9;
    } else if (difficulty_level == "hard") {
      scale = 1.2;
      min_word = 4;
      med_word = 9;
      max_word = 12;
    } else if (difficulty_level == "beacon") {
      scale = 2;
      min_word = 4;
      med_word = 10;
      max_word = 12;
    }
    this.enemy_wpm = 10 + 1.25 * scale * capped_level;
    this.enemy_rerolls = (4 + scale * capped_level / 2) * 4;

    console.log("WPM is " + this.enemy_wpm);

    this.enemy_short_word = min_word
    this.enemy_long_word = Math.min(max_word, med_word + Math.floor((max_word - med_word) * capped_level / 17));
  }


  pickBases() {
    let base_point_collection = [];
    let num_bases_per_player = 5;
    this.bases = [];
    this.base_points = [];
    let letters = shuffle_letters.slice(0, 23);
    shuffleArray(letters);
    this.picks = [];
    this.installed_bases = 0;

    if (this.num_players == 2) {

      shuffleArray(american_base_points);
      shuffleArray(soviet_base_points);
      base_point_collection = [american_base_points, soviet_base_points];
    } else if (this.num_players == 3) {
      shuffleArray(cornwallis_base_points);
      shuffleArray(disko_base_points);
      shuffleArray(stefansson_base_points);
      base_point_collection = [cornwallis_base_points, disko_base_points, stefansson_base_points];
    } else if (this.num_players == 4) {
      shuffleArray(dominica_base_points);
      shuffleArray(st_lucia_base_points);
      shuffleArray(st_vincent_base_points);
      shuffleArray(grenada_base_points);
      base_point_collection = [
        dominica_base_points,
        st_lucia_base_points,
        st_vincent_base_points,
        grenada_base_points
      ];
    }

    for (let i = 0; i < this.num_players; i++) {
      this.bases[i] = [];
      this.base_points[i] = base_point_collection[i].slice(0, num_bases_per_player);
      this.base_points[i].sort(function(a,b) {return a[0] - b[0]})
      this.picks[i] = letters.slice(i * num_bases_per_player, (i+1) * num_bases_per_player);
    }
  }


  disabledTime(letter) {
    if (this.difficulty_level != "beacon") {
      if (["A", "E", "I", "O", "U"].includes(letter)) {
        return 2000;
      } else {
        return 3000;
      }
    } else {
      if (["A", "E", "I", "O", "U"].includes(letter)) {
        return 1000;
      } else {
        return 2000;
      }
    }
  }


  spellingHelp() {
    if (this.difficulty_level == "easy") {
      this.spelling_help.position.set(this.launchpad.cursors[0].x - 10, -64);
      let word = this.launchpad.word();
      if (word.length > 0 && word in game.spelling_prediction) {
        this.spelling_help.text = game.spelling_prediction[word].slice(0, board_width - this.launchpad.shift);
      } else {
        this.spelling_help.text = "";
      }
    }
  }


  countdownAndStart() {
    if (this.state == "countdown" && !paused) {
      let time_remaining = (2400 - (timeSince(this.start_time))) / 800;

      // make bases
      if (time_remaining < 0.5 * (6 - this.installed_bases) && this.installed_bases < 5) {
        let b = this.installed_bases;
        for (let i = 0; i < this.num_players; i++) {
          this.makeBase(this.base_points[i][b][0], this.base_points[i][b][1], this.picks[i][b], i);
        }

        soundEffect("build");
        this.installed_bases += 1;
      }

      this.announcement.text = Math.ceil(time_remaining).toString();
      if (time_remaining <= 0) {
        
        this.state = "active";

        this.announcement.text = "GO";
        delay(() => {this.announcement.text = "";}, 1600);

        this.makeBaseSelectionCorners();
        
        for (var i = 0; i < board_width; i++) {
          this.launchpad.cursors[i].visible = true;
        }

        if ((this.difficulty_level == "easy" && (this.level == 13 || this.level == 14))
          || (this.difficulty_level != "easy" && (this.level == 19 || this.level == 20 || this.level == 21))) {
          setMusic("putzen_song");
        } else {
          setMusic("action_song_1");
        }
      }
    }
  }


  updateWPM() {

    let popping_wpm = true;
    while(popping_wpm) {
      if (this.wpm_history.length > 0 && timeSince(this.wpm_history[0][1]) > 60000) {
        this.wpm_history.shift();
      } else {
        popping_wpm = false;
      }
    }

    this.calculated_wpm = this.wpm_history.length;

    if (timeSince(this.start_time) - 2400 > 0 && timeSince(this.start_time) - 2400 < 60000) {
      this.calculated_wpm *= (60000 / (timeSince(this.start_time) - 2400));
    }

    if (this.display_wpm < this.calculated_wpm) this.display_wpm += 1;
    if (this.display_wpm > this.calculated_wpm) this.display_wpm -= 1;

    this.wpm_text_box.text = this.display_wpm;
    if (this.display_wpm > 35) {
        this.wpm_text_box.style.fill = 0x55be3c;
    } else {
      this.wpm_text_box.style.fill = 0xFFFFFF;
    }
  }


  enemyAction() {
    if(timeSince(this.enemy_last_action) <= 60000/this.enemy_wpm) {
      return;
    } else {
      this.enemy_last_action = timeSince(0.2 * (60000/this.enemy_wpm) - 0.4 * Math.random() * 60000/this.enemy_wpm);
      this.score += 1;
      this.score_text_box.text = this.score;
    }

    if (dice(100) < 10 + 2 * this.level) {
      if (dice(100) < 50) {
        this.changeBaseSelection(1, 1);
      } else {
        this.changeBaseSelection(1, -1);
      }
      // this.enemy_base_selection = dice(5) - 1;
      // let target_x = this.base_points[0][this.base_selection[1]][0];
      // let target_y = this.base_points[0][this.base_selection[1]][1];
      // this.enemy_base_selection_corners.position.set(target_x, target_y);
    }

    let rerolls = this.enemy_rerolls;

    let word_choice = null;
    let word_base = null;

    for (let i = 0; i < rerolls; i++) {
      let word_size = this.enemy_short_word + Math.floor(Math.random() * (1 + this.enemy_long_word - this.enemy_short_word));
      let word_list = game.enemy_words[word_size];
      let candidate_word = pick(word_list);

      // let legal_keys = true;
      // for (let j = 0; j < candidate_word.length; j++) {
      //   if (this.enemy_palette.letters[candidate_word[j]].playable == false) legal_keys = false;
      // }
      let legal_starting_letter = false;
      for (let j = 0; j < this.bases[1].length; j++) {
        let base = this.bases[1][j];
        if (base.HP > 0 && candidate_word[0] === base.text) {
          legal_starting_letter = true;
          word_base = base;
        }
      }

      let legit = (legal_starting_letter && !(candidate_word in this.played_words));

      if (legit) {
        if (word_choice == null) {
          word_choice = candidate_word;
        }

        if (word_choice[0] == this.bases[1][this.base_selection[0]].text) {
          word_choice = candidate_word;
          break;
        }
      }
    }

    if (word_choice != null && word_base != null) {
      this.queueLaunch(word_choice, 1, word_base)
    }
  }


  changeBaseSelection(player, adjustment) {
    let opponent_dead = true;
    let opponent = 0;
    if (player == 0) opponent = 1;
    for (var i = 0; i < this.bases[opponent].length; i++) {
      if (this.bases[opponent][i].HP > 0) {
        opponent_dead = false;
      }
    }

    if (opponent_dead) {
      this.base_selection_corners[0].visible = false;
      this.base_selection_corners[1].visible = false;
    }

    if (!opponent_dead && this.state == "active") {
      
      this.base_selection[player] = (this.base_selection[player] + 5 + adjustment) % 5;

      let count = 0;
      while(this.bases[opponent][this.base_selection[player]].HP == 0 && count < 6) {
        this.base_selection[player] = (this.base_selection[player] + 5 + adjustment) % 5;
        count += 1;
      }

      let target_x = this.base_points[opponent][this.base_selection[player]][0];
      let target_y = this.base_points[opponent][this.base_selection[player]][1];

      this.base_selection_corners[player].position.set(target_x, target_y);
    }
  }


  queueLaunch(word, player, base) {
    let opponent = 0;
    if (player == 0) opponent = 1; // this is dumb
    let target_base = this.bases[opponent][this.base_selection[player]];
    this.launch_queue.push({
      word:word,
      score_value:Math.floor(Math.pow(word.length, 1.5)/5),
      player:player,
      base:base,
      target_base:target_base,
      time:markTime() - this.queue_speed
    });
  }


  launchLettersFromQueue() {
    for (let i = 0; i < this.launch_queue.length; i++) {
      let item = this.launch_queue[i];
      if (item.word.length > 0 && item.base.HP > 0 && timeSince(item.time) > this.queue_speed) {
        let letter = item.word[0];
        item.word = item.word.slice(1);
        let rocket_tile = makeRocketTile2(this.rocket_layer, letter, item.score_value, item.base, item.target_base, item.player)
        item.time = markTime();
        this.rocket_letters.push(rocket_tile);

        this.moveGameBoard(item.player, 5);
      }
    }

    let new_queue = [];
    for (let i = 0; i < this.launch_queue.length; i++) {
      let item = this.launch_queue[i];
      if (item.word.length > 0) {
        new_queue.push(item);
      }
    }
    this.launch_queue = new_queue;
  }


  checkEndCondition(bypass = false) {
    if (this.state == "active") {
      
      let player_dead = true;
      for (var i = 0; i < this.bases[0].length; i++) {
        if (this.bases[0][i].HP > 0) {
          player_dead = false;
        } else if (i == this.base_selection[1]) {
          this.changeBaseSelection(1, 1);
        }
      }

      let enemy_dead = true;
      for (var i = 0; i < this.bases[1].length; i++) {
        if (this.bases[1][i].HP > 0) {
          enemy_dead = false;
        } else if (i == this.base_selection[0]) {
          this.changeBaseSelection(0, 1);
        }
      }

      if (enemy_dead === true || player_dead === true || bypass === true) {
        this.announcement.style.fontSize = 36;
        game.score = this.score;

        if (player_dead === true || bypass === true) { //regardless of whether enemy is dead
          this.announcement.text = "YOU LOSE";
          stopMusic();
          soundEffect("game_over");
          game.gameOver(4000);
        } else if (enemy_dead == true) {
          this.announcement.text = "YOU WIN!";
          soundEffect("victory");
          flicker(this.announcement, 500, 0xFFFFFF, 0x67d8ef);
          delay(() => {
            game.nextFlow();
          }, 4000);
        }

        this.base_selection_corners[0].visible = false;
        this.base_selection_corners[1].visible = false;

        this.state = "gameover";

        let size = this.launchpad.wordSize();
        for (var i = 0; i < size; i++) {
          this.launchpad.pop();
        }

        for (var i = 0; i < this.rocket_letters.length; i++) {
          let rocket = this.rocket_letters[i];
          rocket.status = "falling";
          rocket.vx = -10 + Math.random() * 20;
          rocket.vy = -4 - Math.random() * 14;
          freefalling.push(rocket);
        }
      }
    }
  }


  moveGameBoard(player, value) {
    if (player == 0) {
      this.game_board.x -= value;
      if (this.game_board.x < -100) this.game_board.x = -100;

    } else if (player == 1) {
      this.game_board.x += value;
      if (this.game_board.x > 100) this.game_board.x = 100;
    }
  }


  boostRockets(fractional) {
    for (var i = 0; i < this.rocket_letters.length; i++) {
      let rocket = this.rocket_letters[i];
      if (rocket.status == "active") {
        if (rocket.velocity < 0.7) {
          rocket.velocity += 0.07 * fractional;
          rocket.fire_sprite.visible = true;
        }
        else {
          // rocket.fire_sprite.visible = false;
          rocket.velocity += 1.0 * fractional;
          if (rocket.velocity > 8) rocket.velocity = 8;
        }
        rocket.position.x += rocket.velocity * fractional * Math.cos(rocket.rotation - Math.PI / 2);
        rocket.position.y += rocket.velocity * fractional * Math.sin(rocket.rotation - Math.PI / 2);
      
        if (Math.random() * 100 > 60) {
          // drop an ember
          let ember = makeBlank(rocket.parent, 4, 4, rocket.x - 5 + 10 * Math.random(), rocket.y - 5 + 10 * Math.random(), pick(fire_colors))
          ember.vx = -5 * Math.cos(rocket.rotation - Math.PI / 2) - 1 + 2 * Math.random();
          ember.vy = -5 * Math.sin(rocket.rotation - Math.PI / 2) - 1 + 2 * Math.random();
          ember.type = "ember";
          freefalling.push(ember);
        }
      }
    }
  }


  checkRocketCollisions() {
    for (var i = 0; i < this.rocket_letters.length; i++) {
      var rocket_1 = this.rocket_letters[i];
      for (var j = 0; j < this.rocket_letters.length; j++) {
        var rocket_2 = this.rocket_letters[j];

        if (rocket_1.player != rocket_2.player && rocket_1.status == "active" && rocket_2.status == "active") {
          if (distance(rocket_1.x, rocket_1.y, rocket_2.x, rocket_2.y) < 30) {

            if (Math.random() * 100 < 50) {
              soundEffect("explosion_1");
            } else {
              soundEffect("explosion_2");
            }

            rocket_1.status = "falling";
            rocket_1.vx = -10 + Math.random() * 20;
            rocket_1.vy = -4 - Math.random() * 14;
            freefalling.push(rocket_1);
          
            rocket_2.status = "falling";
            rocket_2.vx = -10 + Math.random() * 20;
            rocket_2.vy = -4 - Math.random() * 14;
            freefalling.push(rocket_2);

            let explosion_layer = this.rocket_layer;
            let explosion = makeExplosion(explosion_layer, 
              (rocket_1.x + rocket_2.x) / 2,
              (rocket_1.y + rocket_2.y) / 2,
            1, 1, function() {explosion_layer.removeChild(explosion)});


            this.game_board.shake = markTime();
          }
        }
      }
    }
  }


  checkBaseCollisions() {
    for (var i = 0; i < this.rocket_letters.length; i++) {
      var rocket = this.rocket_letters[i];
      
      if (rocket.status == "active") {
        let opponent = 0;
        if (rocket.player == 0) opponent = 1;
        let bases = this.bases[opponent];

        for (var j = 0; j < bases.length; j++) {
          let base = bases[j];
          if (base.HP > 0 && distance(rocket.x, rocket.y, base.x, base.y) < 20) {
            if (Math.random() * 100 < 50) {
              soundEffect("explosion_1");
            } else {
              soundEffect("explosion_2");
            }

            this.game_board.shake = markTime();

            // this.moveGameBoard(rocket.player, 100);

            rocket.status = "falling";
            rocket.vx = -10 + Math.random() * 20;
            rocket.vy = -4 - Math.random() * 14;
            freefalling.push(rocket);

            let explosion_layer = this.rocket_layer;
            let explosion = makeExplosion(explosion_layer, base.x, base.y,
            1, 1, function() {explosion_layer.removeChild(explosion)});

            if (base.HP > 0) {
              if (rocket.player == 0) {
                this.score += 2 * rocket.score_value;
                this.score_text_box.text = this.score;
              }

              base.HP -= 1;
              base.health_bar.width = 32 * base.HP / 20;
              if (base.HP > 13) base.health_bar.tint = 0x55be3c;
              if (base.HP > 7 && base.HP <= 13) base.health_bar.tint = 0xf6db0d;
              if (base.HP <= 7) base.health_bar.tint = 0xeb0027;

              if (base.HP <= 0) {
                base.HP = 0;
                base.visible = false;
                var crater = makeSprite("Art/Kuzkas_Mother/base_crater.png", this.base_layer, base.x, base.y, 0.5, 0.5);
                crater.scale.set(0.7, 0.7);

                for (let m = 0; m < 3; m++) {
                  let explosion = makeExplosion(explosion_layer, base.x - 10 + 20 * Math.random(), base.y - 10 + 20 * Math.random(),
                  1, 1, function() {explosion_layer.removeChild(explosion)});
                }
              }
            }
          }
        }
      }
    }
  }


  cleanRockets() {
    let new_rocket_letters = [];
    for (var i = 0; i < this.rocket_letters.length; i++) {
      var rocket = this.rocket_letters[i];

      if (rocket.x < -200 || rocket.y < -200 || rocket.x > 1032 || rocket.y > 680) {
        rocket.status = "dead";
      }

      if (rocket.status == "active") {
        new_rocket_letters.push(rocket);
      }
    }
    this.rocket_letters = new_rocket_letters;
  }


  keyDown(ev) {
    let key = ev.key;
    if (!paused && this.state === "active") {
      for (i in lower_array) {
        if (key === lower_array[i] || key === letter_array[i]) {
          if (!this.launchpad.full()) {
            keySound(key);
            let tile = this.launchpad.push(this.player_palette, letter_array[i]);
            tile.tint = 0x000000;
          }
        }
      }

      if (key === "Backspace" || key === "Delete") {
        soundEffect("keyboard_click_" + dice(5), 1.0);
        this.launchpad.pop();
      }

      if (key === "ArrowRight") {
        this.changeBaseSelection(0, 1);
        soundEffect("switch_option");
      }

      if (key === "ArrowLeft") {
        this.changeBaseSelection(0, -1);
        soundEffect("switch_option");
      }

      if (key === "Tab") {
        soundEffect("keyboard_click_1", 1.0);
        this.launchpad.clear();
      }

      if (key === "Enter") {
        this.launchpad.launch(this.player_area);
      }
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


    if (key === "Escape" && (this.state === "active" || this.state === "countdown")) {
      if (!paused) {
        pause();
        this.announcement.visible = false;
        this.q_to_quit.visible = true;
        pauseSoundEffect("countdown");
      } else {
        resumeSoundEffect("countdown");
        this.announcement.visible = true;
        this.q_to_quit.visible = false;
        resume();
      }
    }  
  }


  update(diff) {
    let fractional = diff / (1000/30.0);

    if (this.state == "none") return;

    if (this.launchpad == null) return;
    if (paused) return;

    this.spellingHelp();
    this.countdownAndStart();
    this.updateWPM();
    shakeDamage();
    this.launchpad.checkError();
    freeeeeFreeeeeFalling(fractional);

    // Skip the rest if we aren't in active gameplay
    if (this.state != "active") {
      return;
    }

    this.enemyAction();
    this.launchLettersFromQueue();
    this.boostRockets(fractional);
    this.checkRocketCollisions();
    this.checkBaseCollisions();
    this.checkEndCondition();
    this.cleanRockets();
  }
}
