
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

Game.prototype.initialize1pWordRockets = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];
  this.clearScreen(screen);

  this.freefalling = [];
  this.pickers = [];
  this.played_words = {};

  this.shakers = [];

  this.rocket_letters = [];

  this.launch_queue = [];

  this.pickBases();

  this.wpm_history = [];
  this.calculated_wpm = 0;
  this.display_wpm = 0;

  this.base_selection = [0, 4];
  this.base_selection_corners = [];

  this.resetBoard();

  if (this.tutorial) {
    this.tutorial1();
  } else {
    this.game_phase = "pre_game";

    delay(function() {
      self.paused = false;
      self.pause_time = 0;
      self.start_time = self.markTime();
      self.game_phase = "countdown";
      self.soundEffect("countdown");
    }, 1200);
  }
}


Game.prototype.resetBoard = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];

  console.log("Level is " + this.level);

  this.game_board = new PIXI.Container();
  screen.addChild(this.game_board);
  this.game_board.scale.set(2, 2);
  
  var map = new PIXI.Sprite(PIXI.Texture.from("Art/Word_Rockets/placeholder_map.png"));
  map.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  map.anchor.set(0, 0);
  this.game_board.addChild(map);

  this.smoke_layer = new PIXI.Container();
  this.game_board.addChild(this.smoke_layer);
  this.base_layer = new PIXI.Container();
  this.game_board.addChild(this.base_layer);
  this.rocket_layer = new PIXI.Container();
  this.game_board.addChild(this.rocket_layer);


  this.hud = new PIXI.Container();
  screen.addChild(this.hud);
  this.hud.scale.set(2, 2);

  var hud_background = new PIXI.Sprite(PIXI.Texture.from("Art/Word_Rockets/hud_background.png"));
  hud_background.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  hud_background.anchor.set(0, 0);
  this.game_board.addChild(hud_background);

  // the player's launchpad
  this.launchpad = new Launchpad(this, this.hud, 0, this.bases[0], 224, 480, 32, 32, false);

  this.base_selection_corners[0] = new PIXI.Sprite(PIXI.Texture.from("Art/Word_Rockets/selection_corners.png"));
  this.base_selection_corners[0].anchor.set(0.5, 0.5);
  console.log(this.base_points);
  console.log(this.base_selection);
  this.base_selection_corners[0].position.set(
    this.base_points[1][this.base_selection[0]][0],
    this.base_points[1][this.base_selection[0]][1]);
  this.base_selection_corners[0].visible = false;
  this.hud.addChild(this.base_selection_corners[0]);

  this.base_selection_corners[1] = new PIXI.Sprite(PIXI.Texture.from("Art/Word_Rockets/selection_corners.png"));
  this.base_selection_corners[1].anchor.set(0.5, 0.5);
  this.base_selection_corners[1].position.set(
    this.base_points[0][this.base_selection[1]][0],
    this.base_points[0][this.base_selection[1]][1]);
  this.base_selection_corners[1].visible = false;
  this.hud.addChild(this.base_selection_corners[1]);

  this.spelling_help = new PIXI.Text("", {fontFamily: "Press Start 2P", fontSize: 20, fill: 0xFFFFFF, letterSpacing: 12, align: "left"});
  this.spelling_help.position.set(6, -64);
  this.spelling_help.alpha = 0.4;
  // if (this.difficulty_level != "EASY") {
  //   this.spelling_help.visible = false;
  // }
  this.game_board.addChild(this.spelling_help);

  // level and score
  this.level_label = new PIXI.Text("Level", {fontFamily: "Press Start 2P", fontSize: 14, fill: 0xFFFFFF, letterSpacing: 3, align: "center",
    dropShadow: true, dropShadowColor: 0x000000, dropShadowDistance: 3});
  this.level_label.anchor.set(0.5,0.4);
  this.level_label.position.set(1.5 * 32, 4.5 * 32);
  this.level_label.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.hud.addChild(this.level_label);

  this.level_text_box = new PIXI.Text(this.level, {fontFamily: "Press Start 2P", fontSize: 16, fill: 0xFFFFFF, letterSpacing: 3, align: "center",
    dropShadow: true, dropShadowColor: 0x000000, dropShadowDistance: 3});
  this.level_text_box.anchor.set(0.5,0.4);
  this.level_text_box.position.set(1.5 * 32, 5.5 * 32);
  this.level_text_box.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.hud.addChild(this.level_text_box);

  this.score_label = new PIXI.Text("Score", {fontFamily: "Press Start 2P", fontSize: 14, fill: 0xFFFFFF, letterSpacing: 3, align: "center",
    dropShadow: true, dropShadowColor: 0x000000, dropShadowDistance: 3});
  this.score_label.anchor.set(0.5,0.4);
  this.score_label.position.set(1.5 * 32, 6.5 * 32);
  this.score_label.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.hud.addChild(this.score_label);

  this.score_text_box = new PIXI.Text(this.score, {fontFamily: "Press Start 2P", fontSize: 16, fill: 0xFFFFFF, letterSpacing: 3, align: "center",
    dropShadow: true, dropShadowColor: 0x000000, dropShadowDistance: 3});
  this.score_text_box.anchor.set(0.5,0.4);
  this.score_text_box.position.set(1.5 * 32, 7.5 * 32);
  this.score_text_box.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.hud.addChild(this.score_text_box);

  this.wpm_label = new PIXI.Text("WPM", {
    fontFamily: "Press Start 2P", fontSize: 14, fill: 0xFFFFFF, letterSpacing: 3, align: "center",
    dropShadow: true, dropShadowColor: 0x000000, dropShadowDistance: 3});
  this.wpm_label.anchor.set(0.5,0.4);
  this.wpm_label.position.set(1.5 * 32, 8.5 * 32);
  this.wpm_label.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.hud.addChild(this.wpm_label);

  this.wpm_text_box = new PIXI.Text(this.play_clock, {
    fontFamily: "Press Start 2P", fontSize: 16, fill: 0xFFFFFF, letterSpacing: 3, align: "center",
    dropShadow: true, dropShadowColor: 0x000000, dropShadowDistance: 3});
  this.wpm_text_box.anchor.set(0.5,0.4);
  this.wpm_text_box.position.set(1.5 * 32, 9.5 * 32);
  this.wpm_text_box.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.hud.addChild(this.wpm_text_box);

  this.difficulty_level = "HARD";
  this.setEnemyDifficulty(this.level, this.difficulty_level);

  this.enemy_last_action = this.markTime();

  for (var i = 0; i < board_width; i++) {
    this.launchpad.cursors[i].visible = false;
  }

  this.announcement = new PIXI.Text("", {fontFamily: "Press Start 2P", fontSize: 36, fill: 0xFFFFFF, letterSpacing: 3, align: "center",
    dropShadow: true, dropShadowColor: 0x000000, dropShadowDistance: 3});
  this.announcement.anchor.set(0.5,0.5);
  this.announcement.position.set(832 / 2, 480 / 2);
  this.announcement.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.announcement.style.lineHeight = 36;
  this.hud.addChild(this.announcement);


  this.escape_to_quit = new PIXI.Text("PRESS ESC TO QUIT", {fontFamily: "Press Start 2P", fontSize: 18, fill: 0xFFFFFF, letterSpacing: 3, align: "center",
    dropShadow: true, dropShadowColor: 0x000000, dropShadowDistance: 3});
  this.escape_to_quit.anchor.set(0.5,0.5);
  this.escape_to_quit.position.set(832 / 2, 480 / 2 + 60);
  this.escape_to_quit.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.escape_to_quit.style.lineHeight = 36;
  this.escape_to_quit.visible = false;
  this.hud.addChild(this.escape_to_quit);

  this.shakers = [screen, this.game_board];
}


Game.prototype.makeBase = function(x, y, letter, side) {
  var self = this;

  let base = this.makeLetterBuilding(this.base_layer, x, y, letter, side);
  
  base.HP = 20;
  base.scale.set(0.7, 0.7);
  
  var backing_black = PIXI.Sprite.from(PIXI.Texture.WHITE);
  backing_black.width = 32;
  backing_black.height = 4;
  backing_black.anchor.set(0, 0);
  backing_black.position.set(-16, 19);
  backing_black.tint = 0x000000;
  base.addChild(backing_black);
  
  base.health_bar = PIXI.Sprite.from(PIXI.Texture.WHITE);
  base.health_bar.width = 32;
  base.health_bar.height = 3;
  base.health_bar.anchor.set(0, 0);
  base.health_bar.position.set(-16, 19);
  base.health_bar.tint = 0x55be3c;
  base.addChild(base.health_bar);

  this.bases[side].push(base);
      
  this.makeSmoke(this.smoke_layer, x, y - 16, 1, 1);
}


Game.prototype.setEnemyDifficulty = function(level, difficulty_level) {
  let capped_level = Math.min(level, 26);
  let scale;
  let min_word;
  let med_word;
  let max_word;
  if (difficulty_level == "EASY") {
    scale = 0.7;
    min_word = 4;
    med_word = 5;
    max_word = 8;
  } else if (difficulty_level == "MEDIUM") {
    scale = 0.8;
    min_word = 4;
    med_word = 7;
    max_word = 9;
    console.log("medium");
  } else if (difficulty_level == "HARD") {
    scale = 1.2;
    min_word = 4;
    med_word = 9;
    max_word = 12;
  } else if (difficulty_level == "BEACON") {
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


Game.prototype.pickBases = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];

  shuffleArray(american_base_points);
  shuffleArray(soviet_base_points);

  this.bases = [];
  this.bases[0] = [];
  this.bases[1] = [];

  this.base_points = [];
  this.base_points[0] = american_base_points.slice(0, 5);
  this.base_points[1] = soviet_base_points.slice(0, 5);

  this.base_points[0].sort(function(a,b) {return a[0] - b[0]})
  this.base_points[1].sort(function(a,b) {return a[0] - b[0]})

  this.installed_bases = 0;

  let letters = shuffle_letters.slice(0, 23);
  shuffleArray(letters);
  this.picks = [];
  this.picks[0] = letters.slice(0, 5);
  this.picks[1] = letters.slice(6, 11);
}


Game.prototype.disabledTime = function(letter) {
  if (this.difficulty_level != "BEACON") {
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


Game.prototype.spellingHelp = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];

  if (this.difficulty_level == "EASY") {
    this.spelling_help.position.set(this.launchpad.cursors[0].x - 10, -64);
    let word = this.launchpad.word();
    if (word in this.spelling_prediction) {
      this.spelling_help.text = this.spelling_prediction[word].slice(0, board_width - this.launchpad.shift);
    } else {
      this.spelling_help.text = "";
    }
  }
}


Game.prototype.countdownAndStart = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];

  if (this.game_phase == "countdown" && !this.paused) {
    let time_remaining = (2400 - (this.timeSince(this.start_time))) / 800;

    // make bases
    if (time_remaining < 0.5 * (6 - this.installed_bases) && this.installed_bases < 5) {
      let i = this.installed_bases;
      this.makeBase(this.base_points[0][i][0], this.base_points[0][i][1], this.picks[0][i], 0);
      this.makeBase(this.base_points[1][i][0], this.base_points[1][i][1], this.picks[1][i], 1);

      this.soundEffect("build");
      this.installed_bases += 1;
    }


    this.announcement.text = Math.ceil(time_remaining).toString();
    if (time_remaining <= 0) {
      
      this.game_phase = "active";

      this.announcement.text = "GO";
      delay(function() {self.announcement.text = "";}, 1600);

      this.base_selection_corners[0].visible = true;
      this.base_selection_corners[1].visible = true;
      
      for (var i = 0; i < board_width; i++) {
        this.launchpad.cursors[i].visible = true;
      }

      if ((this.difficulty_level == "EASY" && (this.level == 13 || this.level == 14))
        || (this.difficulty_level != "EASY" && (this.level == 19 || this.level == 20 || this.level == 21))) {
        this.setMusic("putzen_song");
      } else {
        this.setMusic("action_song_1");
      }
    }
  }
}


Game.prototype.updateWPM = function() {

  let popping_wpm = true;
  while(popping_wpm) {
    if (this.wpm_history.length > 0 && this.timeSince(this.wpm_history[0][1]) > 60000) {
      this.wpm_history.shift();
    } else {
      popping_wpm = false;
    }
  }

  this.calculated_wpm = this.wpm_history.length;

  if (this.timeSince(this.start_time) - 2400 > 0 && this.timeSince(this.start_time) - 2400 < 60000) {
    this.calculated_wpm *= (60000 / (this.timeSince(this.start_time) - 2400));
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


Game.prototype.shakeDamage = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];

  // for (let item of [screen, this.player_area, this.enemy_area]) {
  for (let item of this.shakers) {
    if (item.shake != null) {
      if (item.permanent_x == null) item.permanent_x = item.position.x;
      if (item.permanent_y == null) item.permanent_y = item.position.y;
      item.position.set(item.permanent_x - 3 + Math.random() * 6, item.permanent_y - 3 + Math.random() * 6)
      if (this.timeSince(item.shake) >= 150) {
        item.shake = null;
        item.position.set(item.permanent_x, item.permanent_y)
      }
    }
  }
}


Game.prototype.freeeeeFreeeeeFalling = function(fractional) {
  var self = this;
  var screen = this.screens[this.current_screen];

  for (let i = 0; i < this.freefalling.length; i++) {
    let item = this.freefalling[i];
    item.position.x += item.vx * fractional;
    item.position.y += item.vy * fractional;
    if (item.type != "ember") {
      item.vy += this.gravity * fractional;
    } else {
      item.alpha *= 0.97;
      item.vy += this.gentle_drop * fractional;
      if (item.vy > this.gentle_limit) item.vy = this.gentle_limit;
    }

    // TODO: this needs to be 200 for the player areas and 960 for the screen in total.
    if (item.position.y > 960 || item.alpha < 0.04) {
      if (item.parent != null) {
        item.parent.removeChild(item);
      }
      item.status = "dead";
    }
  }

  let new_freefalling = [];
  for (let i = 0; i < this.freefalling.length; i++) {
    let item = this.freefalling[i];
    if (item.status != "dead") {
      new_freefalling.push(item);
    }
  }
  this.freefalling = new_freefalling;
}


Game.prototype.enemyAction = function() {
  // guard
  if (this.game_phase == "tutorial" && this.tutorial_number < 8) {
    return;
  }

  if(this.timeSince(this.enemy_last_action) <= 60000/this.enemy_wpm) {
    return;
  } else {
    console.log(this.timeSince(this.enemy_last_action));
    this.enemy_last_action = this.timeSince(0.2 * (60000/this.enemy_wpm) - 0.4 * Math.random() * 60000/this.enemy_wpm);
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

  let targeting = this.game_phase != "tutorial";
  let rerolls = this.enemy_rerolls;

  let word_choice = null;
  let word_base = null;

  for (let i = 0; i < rerolls; i++) {
    let word_size = this.enemy_short_word + Math.floor(Math.random() * (1 + this.enemy_long_word - this.enemy_short_word));
    let word_list = this.enemy_words[word_size];
    let candidate_word = word_list[Math.floor(Math.random() * word_list.length)];

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


Game.prototype.changeBaseSelection = function(player, adjustment) {
  var self = this;

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

  if (!opponent_dead && this.game_phase == "active") {
    
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

let queue_speed = 150;
Game.prototype.queueLaunch = function(word, player, base) {
  let opponent = 0;
  if (player == 0) opponent = 1; // this is dumb
  let target_base = this.bases[opponent][this.base_selection[player]];
  this.launch_queue.push({
    word:word,
    score_value:Math.floor(Math.pow(word.length, 1.5)/5),
    player:player,
    base:base,
    target_base:target_base,
    time:this.markTime() - queue_speed
  });
}


Game.prototype.launchLettersFromQueue = function() {
  for (let i = 0; i < this.launch_queue.length; i++) {
    let item = this.launch_queue[i];
    if (item.word.length > 0 && item.base.HP > 0 && this.timeSince(item.time) > queue_speed) {
      let letter = item.word[0];
      item.word = item.word.slice(1);
      let rocket_tile = game.makeRocketTile2(this.rocket_layer, letter, item.score_value, item.base, item.target_base, item.player)
      item.time = this.markTime();
      this.rocket_letters.push(rocket_tile);
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


Game.prototype.checkEndCondition = function(bypass = false) {
  var self = this;
  if (this.game_phase == "active") {
    
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
      if (player_dead === true || bypass === true) { //regardless of whether enemy is dead
        this.announcement.text = "YOU LOSE";
        this.stopMusic();
        this.soundEffect("game_over");
        this.gameOverScreen(4000);
      } else if (enemy_dead == true) {
        this.announcement.text = "YOU WIN!";
        this.soundEffect("victory");
        flicker(this.announcement, 500, 0xFFFFFF, 0x67d8ef);
        delay(function() {
          self.nextFlow();
        }, 4000);
      }

      this.base_selection_corners[0].visible = false;
      this.base_selection_corners[1].visible = false;

      this.game_phase = "gameover";

      let size = this.launchpad.wordSize();
      for (var i = 0; i < size; i++) {
        this.launchpad.pop();
      }

      for (var i = 0; i < this.rocket_letters.length; i++) {
        let rocket = this.rocket_letters[i];
        rocket.status = "falling";
        rocket.vx = -10 + Math.random() * 20;
        rocket.vy = -4 - Math.random() * 14;
        this.freefalling.push(rocket);
      }
    }
  }
}


Game.prototype.boostRockets = function(fractional) {
  var self = this;

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
        let ember = PIXI.Sprite.from(PIXI.Texture.WHITE);
        
        ember.tint = fire_colors[Math.floor(Math.random()*fire_colors.length)];
        ember.width = 4;
        ember.height = 4;
        ember.vx = -5 * Math.cos(rocket.rotation - Math.PI / 2) - 1 + 2 * Math.random();
        ember.vy = -5 * Math.sin(rocket.rotation - Math.PI / 2) - 1 + 2 * Math.random();
        ember.type = "ember";
        ember.parent = rocket.parent;
        ember.position.set(rocket.x - 5 + 10 * Math.random(), rocket.y - 5 + 10 * Math.random());
        this.rocket_layer.addChild(ember);
        this.freefalling.push(ember);
        // this.rocket_layer.push(ember);
      }
    }
  }
}


Game.prototype.boostRocketsOld = function(fractional) {
  var self = this;
  var screen = this.screens["1p_word_rockets"];

  for (var i = 0; i < this.rocket_letters.length; i++) {
    var rocket = this.rocket_letters[i];
    if (rocket.status === "rocket") {
      rocket.position.y += rocket.vy * fractional;
      rocket.vy -= this.boost * fractional;
      if (rocket.vy < this.boost_limit) rocket.vy = this.boost_limit;

      rocket.fire_sprite.position.set(
        rocket.fire_sprite.original_x - 1 + 2 * Math.random(),
        rocket.fire_sprite.original_y - 1 + 2 * Math.random());

      if (Math.random() * 100 > Math.min(-0.6 * rocket.y, 95)) {
        // drop an ember
        let ember = PIXI.Sprite.from(PIXI.Texture.WHITE);
        
        ember.tint = fire_colors[Math.floor(Math.random()*fire_colors.length)];
        ember.width = 4;
        ember.height = 4;
        ember.vx = -1 + Math.floor(Math.random() * 2);
        ember.vy = 0;
        ember.type = "ember";
        ember.parent = rocket.parent;
        ember.position.set(rocket.x - 16 + Math.floor(Math.random() * 32), rocket.y + 30);
        rocket.parent.addChild(ember);
        this.freefalling.push(ember);
      }
    } else if (rocket.status === "descent") {
      rocket.position.y += rocket.vy * fractional;
      rocket.vy += this.gentle_drop * fractional;
      if (rocket.vy > this.gentle_limit) rocket.vy = this.gentle_limit;
    }
  }
}


Game.prototype.checkRocketCollisions = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];

  for (var i = 0; i < this.rocket_letters.length; i++) {
    var rocket_1 = this.rocket_letters[i];
    for (var j = 0; j < this.rocket_letters.length; j++) {
      var rocket_2 = this.rocket_letters[j];

      if (rocket_1.player != rocket_2.player && rocket_1.status == "active" && rocket_2.status == "active") {
        if (distance(rocket_1.x, rocket_1.y, rocket_2.x, rocket_2.y) < 30) {

          if (Math.random() * 100 < 50) {
            this.soundEffect("explosion_1");
          } else {
            this.soundEffect("explosion_2");
          }

          rocket_1.status = "falling";
          rocket_1.vx = -10 + Math.random() * 20;
          rocket_1.vy = -4 - Math.random() * 14;
          this.freefalling.push(rocket_1);
        
          rocket_2.status = "falling";
          rocket_2.vx = -10 + Math.random() * 20;
          rocket_2.vy = -4 - Math.random() * 14;
          this.freefalling.push(rocket_2);

          let explosion_layer = this.rocket_layer;
          let explosion = self.makeExplosion(explosion_layer, 
            (rocket_1.x + rocket_2.x) / 2,
            (rocket_1.y + rocket_2.y) / 2,
          1, 1, function() {explosion_layer.removeChild(explosion)});


          this.game_board.shake = this.markTime();
        }
      }
    }
  }
}


Game.prototype.checkBaseCollisions = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];

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
            this.soundEffect("explosion_1");
          } else {
            this.soundEffect("explosion_2");
          }

          this.game_board.shake = this.markTime();

          rocket.status = "falling";
          rocket.vx = -10 + Math.random() * 20;
          rocket.vy = -4 - Math.random() * 14;
          this.freefalling.push(rocket);

          let explosion_layer = this.rocket_layer;
          let explosion = self.makeExplosion(explosion_layer, base.x, base.y,
          1, 1, function() {explosion_layer.removeChild(explosion)});

          if (base.HP > 0) {
            if (rocket.player == 0) {
              this.score += rocket.score_value;
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
              var crater = new PIXI.Sprite(PIXI.Texture.from("Art/Word_Rockets/base_crater.png"));
              crater.anchor.set(0.5, 0.5);
              crater.scale.set(0.7, 0.7);
              crater.position.set(base.x, base.y);
              this.base_layer.addChild(crater);

              for (let m = 0; m < 3; m++) {
                let explosion = self.makeExplosion(explosion_layer, base.x - 10 + 20 * Math.random(), base.y - 10 + 20 * Math.random(),
                1, 1, function() {explosion_layer.removeChild(explosion)});
              }
            }
          }
        }
      }
    }
  }
}


Game.prototype.checkRocketAttacks = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];

  for (var i = 0; i < this.rocket_letters.length; i++) {
    let rocket = this.rocket_letters[i];
    let disabled_letter = rocket.letter;

    if (rocket.status == "descent" && rocket.y > 0) {

      rocket.status = "final_burn";
      rocket.vy = 0;
      rocket.vx = 0;
      let target_x = 0;
      let target_y = 0;
      let old_x = rocket.x;
      let old_y = rocket.y;
      if (rocket.player == 1) {
        this.enemy_area.removeChild(rocket);
        this.enemy_live_area.addChild(rocket);
        rocket.position.set(old_x,old_y);
        target_x = (this.enemy_palette.letters[disabled_letter].x * this.enemy_palette.scale.x + this.enemy_palette.position.x - this.enemy_area.position.x) / this.enemy_area.scale.x;
        target_y = (this.enemy_palette.letters[disabled_letter].y * this.enemy_palette.scale.y + this.enemy_palette.position.y - this.enemy_area.position.y) / this.enemy_area.scale.y;
        if (this.game_phase == "tutorial" && this.tutorial_number == 7) this.tutorial8();
      } else if (rocket.player == 2) {
        this.player_area.removeChild(rocket);
        this.player_live_area.addChild(rocket);
        rocket.position.set(old_x,old_y);
        target_x = (this.player_palette.letters[disabled_letter].x * this.player_palette.scale.x + this.player_palette.position.x - this.player_area.position.x) / this.player_area.scale.x;
        target_y = (this.player_palette.letters[disabled_letter].y * this.player_palette.scale.y + this.player_palette.position.y - this.player_area.position.y) / this.player_area.scale.y;
        if (this.game_phase == "tutorial" && this.tutorial_number == 10) this.tutorial11();
      }
      let angle = Math.atan2(target_y - rocket.y, target_x - rocket.x) + Math.PI / 2;
      rocket.parachute_sprite.visible = false;
      new TWEEN.Tween(rocket)
        .to({rotation: angle})
        .duration(100)
        .easing(TWEEN.Easing.Quartic.Out)
        .onComplete(function() {rocket.fire_sprite.visible = true; self.soundEffect("rocket");})
        .chain(new TWEEN.Tween(rocket.position)
          .to({y: target_y, x: target_x})
          .duration(200)
          .easing(TWEEN.Easing.Quadratic.In)
          .onComplete(function() {

              rocket.status = "falling";
              self.freefalling.push(rocket);
              rocket.vx = -10 + Math.random() * 20;
              rocket.vy = -4 - Math.random() * 14;
              if (rocket.player == 1) {
                if (self.enemy_palette.letters[disabled_letter].playable === true) {
                  self.enemy_palette.letters[disabled_letter].disable();
                  self.enemy_palette.letters[disabled_letter].playable = false;
                  self.soundEffect("explosion_3");

                  let electric = self.makeElectric(self.enemy_live_area, 
                    target_x,
                    target_y,
                    0.75, 0.75);

                  let explosion = self.makeExplosion(self.enemy_live_area, 
                    target_x,
                    target_y,
                  0.3125, 0.3125, function() {electric.visible = true; self.enemy_live_area.removeChild(explosion)});

                  self.enemy_palette.letters[disabled_letter].tint = 0x4c4c4c;
                  self.enemy_palette.letters[disabled_letter].angle = -10 + 20 * Math.random();

                  if (!self.enemy_defense.includes(disabled_letter)) {
                    self.score += rocket.score_value;
                    self.score_text_box.text = self.score;
                    delay(function() {
                      self.enemy_live_area.removeChild(electric);
                      self.enemy_palette.letters[disabled_letter].enable();
                      self.enemy_palette.letters[disabled_letter].playable = true;
                      self.enemy_palette.letters[disabled_letter].tint = 0xFFFFFF;
                      self.enemy_palette.letters[disabled_letter].angle = 0;
                    }, self.disabledTime(disabled_letter));
                  } else {
                    self.swearing();
                    self.score += Math.floor(Math.pow(rocket.score_value, 1.5));
                    self.score_text_box.text = self.score;
                    self.checkEndCondition();
                  }
                }
              } else {
                if (self.player_palette.letters[disabled_letter].playable === true) {
                  self.player_palette.letters[disabled_letter].disable();
                  self.player_palette.letters[disabled_letter].playable = false;
                  screen.shake = self.markTime();
                  self.soundEffect("explosion_3");

                  let electric = self.makeElectric(self.player_palette.letters[disabled_letter], 
                    0,
                    0,
                    1.5, 1.5);

                  self.player_palette.letters[disabled_letter].tint = 0x4c4c4c;
                  self.player_palette.letters[disabled_letter].angle = -10 + 20 * Math.random();

                  let explosion = self.makeExplosion(self.player_palette, 
                    self.player_palette.letters[disabled_letter].x,
                    self.player_palette.letters[disabled_letter].y,
                  1, 1, function() {electric.visible = true; self.player_palette.removeChild(explosion);});

                  if (!self.player_defense.includes(disabled_letter)) {
                    delay(function() {
                      self.player_palette.letters[disabled_letter].enable()
                      self.player_palette.letters[disabled_letter].playable = true;
                      self.player_palette.letters[disabled_letter].tint = 0xFFFFFF;
                      self.player_palette.letters[disabled_letter].angle = 0;
                      self.player_palette.letters[disabled_letter].removeChild(electric);
                    }, self.disabledTime(disabled_letter));
                  } else {
                    self.checkEndCondition();
                  }   
                }
              }

          })
        )
        .start()
    }
  }
}


Game.prototype.cleanRockets = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];

  let new_rocket_letters = [];
  for (var i = 0; i < this.rocket_letters.length; i++) {
    var rocket = this.rocket_letters[i];

    if (rocket.status == "active") {
      new_rocket_letters.push(rocket);
    }
  }
  this.rocket_letters = new_rocket_letters;
}


Game.prototype.singlePlayerGameUpdate = function(diff) {
  var self = this;
  var screen = this.screens["1p_word_rockets"];

  let fractional = diff / (1000/30.0);

  if (this.game_phase == "tutorial") {
    this.tutorial_screen.tutorial_text.hover();
  }

  if (this.launchpad == null) return;

  this.spellingHelp();
  this.countdownAndStart();
  this.updateWPM();
  this.shakeDamage();
  this.launchpad.checkError();
  this.freeeeeFreeeeeFalling(fractional);

  // Skip the rest if we aren't in active gameplay
  if (this.game_phase != "active" && (this.game_phase != "tutorial" || this.tutorial_number < 5)) {
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




