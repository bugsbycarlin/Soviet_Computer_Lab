
//
// EASY difficulty means a ten year old could beat it with some work.
// The stunned keys just make gaps in the rocket volley.
// There are no special phases.
// Difficulty ramps up slower than what I've been doing.
// There is spelling help.
// Jin or Joey should be able to beat it, or else I should re-tune.
//
// MEDIUM difficulty means I can beat it without trying harder than current.
// The stunned keys just make gaps in the rocket volley.
// There are special phases, if I've programmed them.
// Difficulty ramps up a little slower than what I've got so far;
// I should calibrate for level 17 of the old game, assuming
// the gap thing doesn't make that too easy.
// 
// HARD should be a little beyond my current ability to beat.
// The stunned keys just make gaps in the rocket volley. <- consider whether this is good or not.
// There are special phases, if I've programmed them.
// Difficulty as currently exists, provided the final level is playable.
//
// BEACON is very very hard. I don't think I'll ever beat it.
// The stunned keys don't work.
// There are special phases, if I've programmed them.
// Difficulty is harder than currently exists. I'd like to struggle to reach level 10.
// But I need to make sure the final level is playable. Perhaps it'll just be
// all really long words.
//

let lobby_offscreen_x = 1700;
let lobby_onscreen_x = 192;

Game.prototype.initialize1pLobby = function() {
  let self = this;
  let screen = this.screens["1p_lobby"];
  this.clearScreen(screen);

  this.lobby_sections = {};

  // let background = new PIXI.Sprite(PIXI.Texture.from("Art/setup_background.png"));
  // background.anchor.set(0, 0);
  // screen.addChild(background);

  this.lobby_monitor_mask = new PIXI.Graphics();
  this.lobby_monitor_mask.beginFill(0xFF3300);
  this.lobby_monitor_mask.drawRect(165, 50, 1500, 960);
  this.lobby_monitor_mask.endFill();

  this.initializeSectionDifficulty();
  this.initializeSectionGameType();
  this.initializeSectionArcadeType();

  this.lobby_sections.game_type.x = lobby_onscreen_x;
  this.lobby_sections.arcade_type.x = lobby_offscreen_x;
  this.lobby_sections.difficulty.x = lobby_offscreen_x;

  // this.lobby_mode = "game_type";
  if (this.lobby_mode == "arcade_type") {
    this.lobby_sections.game_type.x = lobby_offscreen_x;
    this.lobby_sections.arcade_type.x = lobby_onscreen_x;
    this.lobby_sections.difficulty.x = lobby_offscreen_x;
  } else if (this.lobby_mode == "difficulty") {
    this.lobby_sections.game_type.x = lobby_offscreen_x;
    this.lobby_sections.arcade_type.x = lobby_offscreen_x;
    this.lobby_sections.difficulty.x = lobby_onscreen_x;
  }

  if (use_music) {
    this.setMusic("title_song");
  }
}

Game.prototype.initializeSectionDifficulty = function() {
  let self = this;
  let screen = this.screens["1p_lobby"];
  this.lobby_sections.difficulty = new PIXI.Container();
  let section = this.lobby_sections.difficulty;
  section.mask = this.lobby_monitor_mask;
  screen.addChild(section);

  this.option_values = ["EASY", "MEDIUM", "HARD", "BEACON"];

  this.option_info_values = [
    "Spelling aid on. Special levels off. Short game. Continues. Stunned keys still work. For novice typists.",
    "Spelling aid off. Special levels on. Long game. Continues. Stunned keys still work. For seasoned typists.",
    "Spelling aid off. Special levels on. Long game. 1 Continue. Stunned keys still work. Much faster enemy. For very good typists.",
    "So fast. Stunned keys don't work. Long game. No continues. Whoever you are, this is more than you can handle."
  ];

  let center_x = 640;

  let difficulty_label = new PIXI.Text("DIFFICULTY", {fontFamily: "Press Start 2P", fontSize: 36, fill: 0xFFFFFF, letterSpacing: 6, align: "center"});
  difficulty_label.anchor.set(0.5,0.5);
  difficulty_label.position.set(center_x,125);
  section.addChild(difficulty_label);

  this.option_info = new PIXI.Text("", {fontFamily: "Press Start 2P", fontSize: 18, fill: 0xFFFFFF, letterSpacing: 6, align: "left", wordWrap: true, wordWrapWidth: 910});
  this.option_info.anchor.set(0,0);
  this.option_info.position.set(180,265);
  this.option_info.partial_value = 0;
  this.option_info.partial_text = "";
  this.option_info.updatePartial = function() {
    this.partial_value += 0.35;
    if (this.partial_value > this.partial_text.length + 1) {
      this.partial_value = this.partial_text.length + 1;
    } else {
      this.text = this.partial_text.slice(0, Math.floor(this.partial_value));
    }
  }
  this.option_info.setPartial = function(new_str) {
    this.partial_value = 0;
    this.partial_text = new_str;
  }
  section.addChild(this.option_info);

  this.option_markers = [];
  for (let i = 0; i < this.option_values.length; i++) {
    let option = this.option_values[i];

    this.option_markers[i] = new PIXI.Text(option, {fontFamily: "Press Start 2P", fontSize: 24, fill: 0xFFFFFF, letterSpacing: 6, align: "center"});
    this.option_markers[i].anchor.set(0.5,0.5);
    this.option_markers[i].position.set(center_x - 400 + 250 * i,200);
    if (i == this.difficulty_choice) {
      this.option_markers[i].tint = 0x75d3fe;
      this.option_info.setPartial(this.option_info_values[i].toUpperCase());
    }
    this.option_markers[i].interactive = true;
    this.option_markers[i].buttonMode = true;
    this.option_markers[i].on("pointertap", function() {
      self.soundEffect("switch_option");
      self.option_markers[self.difficulty_choice].tint = 0xFFFFFF;
      self.difficulty_choice = i;
      self.option_markers[self.difficulty_choice].tint = 0x75d3fe;
      self.option_info.setPartial(self.option_info_values[self.difficulty_choice].toUpperCase());
      self.updateHighScoreDisplay();
    });
    section.addChild(this.option_markers[i]);
  }

  let local_high_scores_label = new PIXI.Text("Local High Scores", {fontFamily: "Press Start 2P", fontSize: 18, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  local_high_scores_label.anchor.set(0,0.5);
  local_high_scores_label.position.set(180,420);
  section.addChild(local_high_scores_label);

  let global_high_scores_label = new PIXI.Text("Global High Scores", {fontFamily: "Press Start 2P", fontSize: 18, fill: 0xFFFFFF, letterSpacing: 6, align: "right"});
  global_high_scores_label.anchor.set(0,0.5);
  global_high_scores_label.position.set(703,420);
  section.addChild(global_high_scores_label);

  //this.updateHighScoreDisplay();

  this.lobby_difficulty_back_button = new PIXI.Text("<", {fontFamily: "Press Start 2P", fontSize: 36, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  this.lobby_difficulty_back_button.anchor.set(0.5,0.5);
  this.lobby_difficulty_back_button.position.set(185, 125);
  section.addChild(this.lobby_difficulty_back_button);
  this.lobby_difficulty_back_button.interactive = true;
  this.lobby_difficulty_back_button.buttonMode = true;
  this.lobby_difficulty_back_button.on("pointertap", function() {
    //self.initializeTitle();
    //self.switchScreens("1p_lobby", "title");
    if (self.game_type_selection == 0) {
      self.lobby_mode = "game_type";
      self.lobby_sections.difficulty.x = lobby_onscreen_x;
      self.lobby_sections.game_type.x = - lobby_offscreen_x;
      var tween = new TWEEN.Tween(self.lobby_sections.difficulty.position)
        .to({x: lobby_offscreen_x})
        .duration(800)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();
      var tween = new TWEEN.Tween(self.lobby_sections.game_type.position)
        .to({x: lobby_onscreen_x})
        .duration(800)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();
    } else if (self.game_type_selection == 1) {
      self.lobby_mode = "arcade_type";
      self.lobby_sections.difficulty.x = lobby_onscreen_x;
      self.lobby_sections.arcade_type.x = - lobby_offscreen_x;
      var tween = new TWEEN.Tween(self.lobby_sections.difficulty.position)
        .to({x: lobby_offscreen_x})
        .duration(800)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();
      var tween = new TWEEN.Tween(self.lobby_sections.arcade_type.position)
        .to({x: lobby_onscreen_x})
        .duration(800)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();
    }
  });

  let go_button = new PIXI.Text("GO!", {fontFamily: "Press Start 2P", fontSize: 36, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  go_button.anchor.set(0.5,0.5);
  go_button.position.set(center_x - 10,810);
  section.addChild(go_button);
  go_button.interactive = true;
  go_button.buttonMode = true;
  go_button.on("pointertap", function() {
    self.soundEffect("button_accept");
    //self.fadeMusic(0);
    //self.stopMusic();
    flicker(go_button, 500, 0xFFFFFF, 0x67d8ef);
    self.difficulty_level = self.option_values[self.difficulty_choice];
    self.resetGame();
    // self.initializeCutscene();
    // self.switchScreens("1p_lobby", "cutscene");
    self.nextFlow();
  });
  this.lobby_go_button = go_button;

}


Game.prototype.initializeSectionGameType = function() {
  let self = this;
  let screen = this.screens["1p_lobby"];
  this.lobby_sections.game_type = new PIXI.Container();
  let section = this.lobby_sections.game_type;
  section.mask = this.lobby_monitor_mask;
  screen.addChild(section);

  //this.game_type_selection = 0;

  let choose_game_type = new PIXI.Text("GAME TYPE", {fontFamily: "Press Start 2P", fontSize: 48, fill: 0xFFFFFF, letterSpacing: 6, align: "right"});
  choose_game_type.anchor.set(0.5,0.5);
  choose_game_type.position.set(this.width / 2, 160);
  section.addChild(choose_game_type);

  this.game_type_story_button = new PIXI.Sprite(PIXI.Texture.from("Art/game_type_story.png"));
  this.game_type_story_button.anchor.set(0.5, 0.5);
  this.game_type_story_button.position.set(180 + 128, 300 + 128);
  section.addChild(this.game_type_story_button);
  this.game_type_story_button.interactive = true;
  this.game_type_story_button.buttonMode = true;
  this.game_type_story_button.on("pointertap", function() {
    self.soundEffect("switch_option");
    self.game_type_selection = 0;
    self.game_type_story_text.tint = 0x67d8ef;
    self.game_type_arcade_text.tint = 0xFFFFFF;
    self.game_type_tutorial_text.tint = 0xFFFFFF;
    var tween = new TWEEN.Tween(self.game_type_selection_box.position)
      .to({x: 180 + 140})
      .duration(200)
      .easing(TWEEN.Easing.Cubic.Out)
      .start();
  });

  this.game_type_arcade_button = new PIXI.Sprite(PIXI.Texture.from("Art/game_type_arcade.png"));
  this.game_type_arcade_button.anchor.set(0.5, 0.5);
  this.game_type_arcade_button.position.set(500 + 128, 300 + 128);
  section.addChild(this.game_type_arcade_button);
  this.game_type_arcade_button.interactive = true;
  this.game_type_arcade_button.buttonMode = true;
  this.game_type_arcade_button.on("pointertap", function() {
    self.soundEffect("switch_option");
    self.game_type_selection = 1;
    self.game_type_story_text.tint = 0xFFFFFF;
    self.game_type_arcade_text.tint = 0x67d8ef;
    self.game_type_tutorial_text.tint = 0xFFFFFF;
    var tween = new TWEEN.Tween(self.game_type_selection_box.position)
      .to({x: 500 + 140})
      .duration(200)
      .easing(TWEEN.Easing.Cubic.Out)
      .start();
  });

  this.game_type_tutorial_button = new PIXI.Sprite(PIXI.Texture.from("Art/game_type_tutorial.png"));
  this.game_type_tutorial_button.anchor.set(0.5, 0.5);
  this.game_type_tutorial_button.position.set(820 + 128, 300 + 128);
  section.addChild(this.game_type_tutorial_button);
  this.game_type_tutorial_button.interactive = true;
  this.game_type_tutorial_button.buttonMode = true;
  this.game_type_tutorial_button.on("pointertap", function() {
    self.soundEffect("switch_option");
    self.game_type_selection = 2;
    self.game_type_story_text.tint = 0xFFFFFF;
    self.game_type_arcade_text.tint = 0xFFFFFF;
    self.game_type_tutorial_text.tint = 0x67d8ef;
    var tween = new TWEEN.Tween(self.game_type_selection_box.position)
      .to({x: 820 + 140})
      .duration(200)
      .easing(TWEEN.Easing.Cubic.Out)
      .start();
  });

  this.game_type_story_text = new PIXI.Text("STORY", {fontFamily: "Press Start 2P", fontSize: 24, fill: 0xFFFFFF, letterSpacing: 6, align: "right"});
  this.game_type_story_text.anchor.set(0.5,0);
  this.game_type_story_text.position.set(320, 630);
  this.game_type_story_text.tint = this.game_type_selection == 0 ? 0x67d8ef : 0xFFFFFF;
  section.addChild(this.game_type_story_text);

  this.game_type_arcade_text = new PIXI.Text("ARCADE", {fontFamily: "Press Start 2P", fontSize: 24, fill: 0xFFFFFF, letterSpacing: 6, align: "right"});
  this.game_type_arcade_text.anchor.set(0.5,0);
  this.game_type_arcade_text.position.set(625, 630);
  this.game_type_arcade_text.tint = this.game_type_selection == 1 ? 0x67d8ef : 0xFFFFFF
  section.addChild(this.game_type_arcade_text);

  this.game_type_tutorial_text = new PIXI.Text("TUTORIAL", {fontFamily: "Press Start 2P", fontSize: 24, fill: 0xFFFFFF, letterSpacing: 6, align: "right"});
  this.game_type_tutorial_text.anchor.set(0.5,0);
  this.game_type_tutorial_text.position.set(960, 630);
  this.game_type_tutorial_text.tint = this.game_type_selection == 2 ? 0x67d8ef : 0xFFFFFF
  section.addChild(this.game_type_tutorial_text);

  this.game_type_selection_box = new PIXI.Sprite(PIXI.Texture.from("Art/selection_box.png"));
  this.game_type_selection_box.anchor.set(0.5, 0.5);
  this.game_type_selection_box.position.set(180 + 140 + 320 * this.game_type_selection, 300 + 140);
  this.game_type_selection.tint = 0x67d8ef;
  section.addChild(this.game_type_selection_box);

  let ok_button = new PIXI.Text("OK", {fontFamily: "Press Start 2P", fontSize: 36, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  ok_button.anchor.set(0.5,0.5);
  ok_button.position.set(640 - 10,810);
  section.addChild(ok_button);
  ok_button.interactive = true;
  ok_button.buttonMode = true;
  ok_button.on("pointertap", function() {
    self.soundEffect("button_accept");
    localStorage.setItem("soviet_computer_lab_game_type_selection", self.game_type_selection);
    flicker(ok_button, 500, 0xFFFFFF, 0x67d8ef);
    flicker(self.game_type_selection_box, 500, 0xFFFFFF, 0x67d8ef);
    if (self.game_type_selection == 0) {
      self.updateHighScoreDisplay();
      flicker(self.game_type_story_text, 500, 0xFFFFFF, 0x67d8ef);
      flicker(self.game_type_story_button, 500, 0xFFFFFF, 0x67d8ef);
      // Proceed to difficulty screen
      self.option_info_values = [
        "Spelling aid on. Special levels off. Short game. Continues. Stunned keys still work. For novice typists.",
        "Spelling aid off. Special levels on. Long game. Continues. Stunned keys still work. For seasoned typists.",
        "Spelling aid off. Special levels on. Long game. 1 Continue. Stunned keys still work. Much faster enemy. For very good typists.",
        "So fast. Stunned keys don't work. Long game. No Continues. Whoever you are, this is more than you can handle."
      ];
      self.option_info.setPartial(self.option_info_values[self.difficulty_choice].toUpperCase());
      self.lobby_mode = "none";
      delay(function() {
        var tween = new TWEEN.Tween(self.lobby_sections.game_type.position)
          .to({x: -lobby_offscreen_x})
          .duration(800)
          .easing(TWEEN.Easing.Cubic.Out)
          .start();
        var tween = new TWEEN.Tween(self.lobby_sections.difficulty.position)
          .to({x: lobby_onscreen_x})
          .duration(800)
          .easing(TWEEN.Easing.Cubic.Out)
          .start();
        self.lobby_mode = "difficulty";
      }, 200);
    } else if (self.game_type_selection == 1) {
      flicker(self.game_type_arcade_text, 500, 0xFFFFFF, 0x67d8ef);
      flicker(self.game_type_arcade_button, 500, 0xFFFFFF, 0x67d8ef);
      // Proceed to arcade type screen
      self.lobby_mode = "none";
      self.option_info_values = [
        "Spelling aid on. Special levels off. Stunned keys still work. For novice typists.",
        "Spelling aid off. Special levels on. Stunned keys still work. For seasoned typists.",
        "Spelling aid off. Special levels on. Stunned keys still work. Much faster enemy. For very good typists.",
        "So fast. Stunned keys don't work. Whoever you are, this is more than you can handle."
      ];
      self.option_info.setPartial(self.option_info_values[self.difficulty_choice].toUpperCase());
      delay(function() {
        var tween = new TWEEN.Tween(self.lobby_sections.game_type.position)
          .to({x: -lobby_offscreen_x})
          .duration(800)
          .easing(TWEEN.Easing.Cubic.Out)
          .start();
        var tween = new TWEEN.Tween(self.lobby_sections.arcade_type.position)
          .to({x: lobby_onscreen_x})
          .duration(800)
          .easing(TWEEN.Easing.Cubic.Out)
          .start();
        self.lobby_mode = "arcade_type";
      }, 200);
    } else if (self.game_type_selection == 2) {
      // Proceed directly to tutorials
      self.tutorial = true;
      self.difficulty_level = "EASY";
      flicker(self.game_type_tutorial_text, 500, 0xFFFFFF, 0x67d8ef);
      flicker(self.game_type_tutorial_button, 500, 0xFFFFFF, 0x67d8ef);
      self.soundEffect("button_accept");
      //self.stopMusic();
      localStorage.setItem("soviet_computer_lab_difficulty_level", self.difficulty_level);
      self.resetGame();
      self.nextFlow();
    }
  });
  this.game_type_ok_button = ok_button;

  this.lobby_game_type_back_button = new PIXI.Text("<", {fontFamily: "Press Start 2P", fontSize: 36, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  this.lobby_game_type_back_button.anchor.set(0.5,0.5);
  this.lobby_game_type_back_button.position.set(185, 125);
  section.addChild(this.lobby_game_type_back_button);
  this.lobby_game_type_back_button.interactive = true;
  this.lobby_game_type_back_button.buttonMode = true;
  this.lobby_game_type_back_button.on("pointertap", function() {
    self.initializeTitle();
    self.switchScreens("1p_lobby", "title");
  });
}


Game.prototype.initializeSectionArcadeType = function() {
  let self = this;
  let screen = this.screens["1p_lobby"];
  this.lobby_sections.arcade_type = new PIXI.Container();
  let section = this.lobby_sections.arcade_type;
  section.mask = this.lobby_monitor_mask;
  screen.addChild(section);

  let choose_game_type = new PIXI.Text("ARCADE TYPE", {fontFamily: "Press Start 2P", fontSize: 48, fill: 0xFFFFFF, letterSpacing: 6, align: "right"});
  choose_game_type.anchor.set(0.5,0.5);
  choose_game_type.position.set(this.width / 2, 160);
  section.addChild(choose_game_type);

  this.arcade_type_mixed_button = new PIXI.Sprite(PIXI.Texture.from("Art/arcade_type_mixed.png"));
  this.arcade_type_mixed_button.anchor.set(0.5, 0.5);
  this.arcade_type_mixed_button.position.set(640 - 360, 450);
  section.addChild(this.arcade_type_mixed_button);
  this.arcade_type_mixed_button.interactive = true;
  this.arcade_type_mixed_button.buttonMode = true;
  this.arcade_type_mixed_button.on("pointertap", function() {
    self.soundEffect("switch_option");
    self.arcade_type_selection = 0;
    self.arcade_type_mixed_text.tint = 0x67d8ef;
    self.arcade_type_word_rockets_text.tint = 0xFFFFFF;
    self.arcade_type_base_capture_text.tint = 0xFFFFFF;
    self.arcade_type_launch_code_text.tint = 0xFFFFFF;
    var tween = new TWEEN.Tween(self.arcade_type_selection_box.position)
      .to({x: 640 - 360})
      .duration(200)
      .easing(TWEEN.Easing.Cubic.Out)
      .start();
  });

  this.arcade_type_word_rockets_button = new PIXI.Sprite(PIXI.Texture.from("Art/arcade_type_word_rockets.png"));
  this.arcade_type_word_rockets_button.anchor.set(0.5, 0.5);
  this.arcade_type_word_rockets_button.position.set(640 - 120, 450);
  section.addChild(this.arcade_type_word_rockets_button);
  this.arcade_type_word_rockets_button.interactive = true;
  this.arcade_type_word_rockets_button.buttonMode = true;
  this.arcade_type_word_rockets_button.on("pointertap", function() {
    self.soundEffect("switch_option");
    self.arcade_type_selection = 1;
    self.arcade_type_mixed_text.tint = 0xFFFFFF;
    self.arcade_type_word_rockets_text.tint = 0x67d8ef;
    self.arcade_type_base_capture_text.tint = 0xFFFFFF;
    self.arcade_type_launch_code_text.tint = 0xFFFFFF;
    var tween = new TWEEN.Tween(self.arcade_type_selection_box.position)
      .to({x: 640 - 120})
      .duration(200)
      .easing(TWEEN.Easing.Cubic.Out)
      .start();
  });

  this.arcade_type_base_capture_button = new PIXI.Sprite(PIXI.Texture.from("Art/arcade_type_base_capture.png"));
  this.arcade_type_base_capture_button.anchor.set(0.5, 0.5);
  this.arcade_type_base_capture_button.position.set(640 + 120, 450);
  section.addChild(this.arcade_type_base_capture_button);
  this.arcade_type_base_capture_button.interactive = true;
  this.arcade_type_base_capture_button.buttonMode = true;
  this.arcade_type_base_capture_button.on("pointertap", function() {
    self.soundEffect("switch_option");
    self.arcade_type_selection = 2;
    self.arcade_type_mixed_text.tint = 0xFFFFFF;
    self.arcade_type_word_rockets_text.tint = 0xFFFFFF;
    self.arcade_type_base_capture_text.tint = 0x67d8ef;
    self.arcade_type_launch_code_text.tint = 0xFFFFFF;
    var tween = new TWEEN.Tween(self.arcade_type_selection_box.position)
      .to({x: 640 + 120})
      .duration(200)
      .easing(TWEEN.Easing.Cubic.Out)
      .start();
  });

  this.arcade_type_launch_code_button = new PIXI.Sprite(PIXI.Texture.from("Art/arcade_type_launch_code.png"));
  this.arcade_type_launch_code_button.anchor.set(0.5, 0.5);
  this.arcade_type_launch_code_button.position.set(640 + 360, 450);
  section.addChild(this.arcade_type_launch_code_button);
  this.arcade_type_launch_code_button.interactive = true;
  this.arcade_type_launch_code_button.buttonMode = true;
  this.arcade_type_launch_code_button.on("pointertap", function() {
    self.soundEffect("switch_option");
    self.arcade_type_selection = 3;
    self.arcade_type_mixed_text.tint = 0xFFFFFF;
    self.arcade_type_word_rockets_text.tint = 0xFFFFFF;
    self.arcade_type_base_capture_text.tint = 0xFFFFFF;
    self.arcade_type_launch_code_text.tint = 0x67d8ef;
    var tween = new TWEEN.Tween(self.arcade_type_selection_box.position)
      .to({x: 640 + 360})
      .duration(200)
      .easing(TWEEN.Easing.Cubic.Out)
      .start();
  });

  this.arcade_type_mixed_text = new PIXI.Text("MIXED", {fontFamily: "Press Start 2P", fontSize: 24, fill: 0xFFFFFF, letterSpacing: 6, align: "right"});
  this.arcade_type_mixed_text.anchor.set(0.5,0);
  this.arcade_type_mixed_text.position.set(640 - 360, 630);
  // this.arcade_type_mixed_text.tint = 0x67d8ef;
  section.addChild(this.arcade_type_mixed_text);

  this.arcade_type_word_rockets_text = new PIXI.Text("ROCKETS", {fontFamily: "Press Start 2P", fontSize: 24, fill: 0xFFFFFF, letterSpacing: 6, align: "right"});
  this.arcade_type_word_rockets_text.anchor.set(0.5,0);
  this.arcade_type_word_rockets_text.position.set(640 - 120, 630);
  // this.arcade_type_word_rockets_text.tint = 0x67d8ef;
  section.addChild(this.arcade_type_word_rockets_text);

  this.arcade_type_base_capture_text = new PIXI.Text("BASE", {fontFamily: "Press Start 2P", fontSize: 24, fill: 0xFFFFFF, letterSpacing: 6, align: "right"});
  this.arcade_type_base_capture_text.anchor.set(0.5,0);
  this.arcade_type_base_capture_text.position.set(640 + 120, 630);
  // this.arcade_type_base_capture_text.tint = 0x67d8ef;
  section.addChild(this.arcade_type_base_capture_text);

  this.arcade_type_launch_code_text = new PIXI.Text("LAUNCH", {fontFamily: "Press Start 2P", fontSize: 24, fill: 0xFFFFFF, letterSpacing: 6, align: "right"});
  this.arcade_type_launch_code_text.anchor.set(0.5,0);
  this.arcade_type_launch_code_text.position.set(640 + 360, 630);
  // this.arcade_type_launch_code_text.tint = 0x67d8ef;
  section.addChild(this.arcade_type_launch_code_text);

  this.arcade_type_mixed_text.tint = this.arcade_type_selection == 0 ? 0x67d8ef : 0xFFFFFF;
  this.arcade_type_word_rockets_text.tint = this.arcade_type_selection == 1 ? 0x67d8ef : 0xFFFFFF;
  this.arcade_type_base_capture_text.tint = this.arcade_type_selection == 2 ? 0x67d8ef : 0xFFFFFF;
  this.arcade_type_launch_code_text.tint = this.arcade_type_selection == 3 ? 0x67d8ef : 0xFFFFFF;


  this.arcade_type_selection_box = new PIXI.Sprite(PIXI.Texture.from("Art/selection_box.png"));
  this.arcade_type_selection_box.anchor.set(0.5, 0.5);
  this.arcade_type_selection_box.scale.set(0.75, 0.75);
  this.arcade_type_selection_box.position.set(640 - 360, 450);
  this.arcade_type_selection.tint = 0x67d8ef;
  section.addChild(this.arcade_type_selection_box);

  let val = (this.arcade_type_selection == 0 ? 640 - 360 : (this.arcade_type_selection == 1 ? 640 - 120 : (this.arcade_type_selection == 2 ? 640 + 120 : 640 + 360)));
  this.arcade_type_selection_box.position.set(val, 450);


  let ok_button = new PIXI.Text("OK", {fontFamily: "Press Start 2P", fontSize: 36, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  ok_button.anchor.set(0.5,0.5);
  ok_button.position.set(640 - 10,810);
  section.addChild(ok_button);
  ok_button.interactive = true;
  ok_button.buttonMode = true;
  ok_button.on("pointertap", function() {
    self.soundEffect("button_accept");
    localStorage.setItem("soviet_computer_lab_arcade_type_selection", self.arcade_type_selection);
    self.updateHighScoreDisplay();
    flicker(ok_button, 500, 0xFFFFFF, 0x67d8ef);
    flicker(self.arcade_type_selection_box, 500, 0xFFFFFF, 0x67d8ef);
    if (self.arcade_type_selection == 0) {
      flicker(self.arcade_type_mixed_button, 500, 0xFFFFFF, 0x67d8ef);
      flicker(self.arcade_type_mixed_text, 500, 0xFFFFFF, 0x67d8ef);
    } else if (self.arcade_type_selection == 1) {
      flicker(self.arcade_type_word_rockets_button, 500, 0xFFFFFF, 0x67d8ef);
      flicker(self.arcade_type_word_rockets_text, 500, 0xFFFFFF, 0x67d8ef);
    } else if (self.arcade_type_selection == 2) {
      flicker(self.arcade_type_base_capture_button, 500, 0xFFFFFF, 0x67d8ef);
      flicker(self.arcade_type_base_capture_text, 500, 0xFFFFFF, 0x67d8ef);
    } else if (self.arcade_type_selection == 3) {
      flicker(self.arcade_type_launch_code_button, 500, 0xFFFFFF, 0x67d8ef);
      flicker(self.arcade_type_launch_code_text, 500, 0xFFFFFF, 0x67d8ef);
    } 
    // Proceed to difficulty screen
    self.lobby_mode = "none";
    self.lobby_sections.difficulty.position.x = lobby_offscreen_x;
    delay(function() {
      var tween = new TWEEN.Tween(self.lobby_sections.arcade_type.position)
        .to({x: -lobby_offscreen_x})
        .duration(800)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();
      var tween = new TWEEN.Tween(self.lobby_sections.difficulty.position)
        .to({x: lobby_onscreen_x})
        .duration(800)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();
      self.lobby_mode = "difficulty";
    }, 200);
  });
  this.arcade_type_ok_button = ok_button;

  this.lobby_arcade_type_back_button = new PIXI.Text("<", {fontFamily: "Press Start 2P", fontSize: 36, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  this.lobby_arcade_type_back_button.anchor.set(0.5,0.5);
  this.lobby_arcade_type_back_button.position.set(185, 125);
  section.addChild(this.lobby_arcade_type_back_button);
  this.lobby_arcade_type_back_button.interactive = true;
  this.lobby_arcade_type_back_button.buttonMode = true;
  this.lobby_arcade_type_back_button.on("pointertap", function() {
    self.lobby_mode = "game_type";
    self.lobby_sections.arcade_type.x = lobby_onscreen_x;
    self.lobby_sections.game_type.x = - lobby_offscreen_x;
    var tween = new TWEEN.Tween(self.lobby_sections.arcade_type.position)
      .to({x: lobby_offscreen_x})
      .duration(800)
      .easing(TWEEN.Easing.Cubic.Out)
      .start();
    var tween = new TWEEN.Tween(self.lobby_sections.game_type.position)
      .to({x: lobby_onscreen_x})
      .duration(800)
      .easing(TWEEN.Easing.Cubic.Out)
      .start();
  });
}


Game.prototype.singlePlayerLobbyUpdate = function(diff) {
  var self = this;
  var screen = this.screens["1p_lobby"];

  this.option_info.updatePartial();
}


Game.prototype.updateHighScoreDisplay = function() {
  var self = this;
  var screen = this.screens["1p_lobby"];
  var mode = this.getModeName();
  var section = this.lobby_sections.difficulty;

  if (this.local_high_scores_texts != null) {
    for (let i = 0; i <= this.local_high_scores_texts.length; i++) {
      section.removeChild(this.local_high_scores_texts[i]);
    }
  }
  if (this.global_high_scores_texts != null) {
    for (let i = 0; i <= this.global_high_scores_texts.length; i++) {
      section.removeChild(this.global_high_scores_texts[i]);
    }
  }

  let difficulty = this.option_values[this.difficulty_choice].toLowerCase();

  this.local_high_scores_texts = [];
  for (let i = 0; i <= 9; i++) {
    let text = (i+1) + ".------ --------";
    let entry = this.local_high_scores[mode][difficulty][i]
    if (entry != null) {
      text = (i+1) + "." + entry.name.padEnd(6) + " " + entry.score;
    }
    let lhs = new PIXI.Text(text, {fontFamily: "Press Start 2P", fontSize: 18, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
    lhs.anchor.set(0,0.5);
    lhs.position.set(180,460 + 24*i);
    section.addChild(lhs);
    this.local_high_scores_texts.push(lhs);
  }

  this.global_high_scores_texts = [];
  for (let i = 0; i <= 9; i++) {
    let text = (i+1) + ".------ --------";
    let entry = this.global_high_scores[mode][difficulty][i]
    if (entry != null) {
      text = (i+1) + "." + entry.name.padEnd(6) + " " + entry.score;
    }
    let ghs = new PIXI.Text(text, {fontFamily: "Press Start 2P", fontSize: 18, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
    ghs.anchor.set(0,0.5);
    ghs.position.set(703,460 + 24*i);
    section.addChild(ghs);
    this.global_high_scores_texts.push(ghs);
  }
}
