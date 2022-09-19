





Game.prototype.oldhandleKeyDown = function(ev) {
  if (ev.key === "Tab") {
    ev.preventDefault();
  }

  this.keymap[ev.key] = true;

  if(this.current_screen === "1p_word_rockets") {

    let key = ev.key;
    if (key === "Shift") {
      if (ev.code === "ShiftLeft") key = "LShift";
      if (ev.code === "ShiftRight") key = "RShift";
    }

    this.wordRocketsKeydown(key);

  } else if(this.current_screen === "1p_base_capture") {

    let key = ev.key;
    if (key === "Shift") {
      if (ev.code === "ShiftLeft") key = "LShift";
      if (ev.code === "ShiftRight") key = "RShift";
    }

    this.baseCaptureKeyDown(key);

  } else if(this.current_screen === "1p_launch_code") {

    let key = ev.key;
    if (key === "Shift") {
      if (ev.code === "ShiftLeft") key = "LShift";
      if (ev.code === "ShiftRight") key = "RShift";
    }

    this.launchCodeKeyDown(key);

  } else if (this.current_screen === "credits") {
    this.creditsKeyDown(ev);
  } else if (this.current_screen === "cutscene") {
    if (this.cutscene_mode == "interactive") {
      if (ev.key === "Enter" || ev.key === " ") {
        this.gotoCutscenePage(this.cutscene_pagenum + 1);
      }
    }

    if (ev.key === "Escape") {
      this.endCutscene();
    }
  } else if (this.current_screen === "multi_lobby") {
    this.multiLobbyKeyDown(ev);
  } else if (this.current_screen === "multi_join_game") {
    this.multiJoinGameKeyDown(ev);
  } else if (this.current_screen === "multi_set_name") {
    this.multiSetNameKeyDown(ev);
  } else if (this.current_screen === "alert") {
    if (ev.key === "Enter" || ev.key === "Escape") {
      this.alertBox._events.pointertap.fn()
    }
  } else if (this.current_screen === "1p_lobby_x") {
    if (this.lobby_mode === "difficulty") {
      if (ev.key === "ArrowRight") {
        soundEffect("switch_option");
        this.option_markers[this.difficulty_choice].tint = 0xFFFFFF;
        this.difficulty_choice = (this.difficulty_choice + 1) % 4;
        this.option_markers[this.difficulty_choice].tint = 0x75d3fe;
        this.option_info.setPartial(this.option_info_values[this.difficulty_choice].toUpperCase());
        this.updateHighScoreDisplay();
      } else if (ev.key === "ArrowLeft") {
        soundEffect("switch_option");
        this.option_markers[this.difficulty_choice].tint = 0xFFFFFF;
        this.difficulty_choice = (this.difficulty_choice + 3) % 4;
        this.option_markers[this.difficulty_choice].tint = 0x75d3fe;
        this.option_info.setPartial(this.option_info_values[this.difficulty_choice].toUpperCase());
        this.updateHighScoreDisplay();
      } else if (ev.key === "Enter") {
        this.lobby_go_button._events.pointertap.fn();
      } else if (ev.key === "Escape") {
        // this.initializeTitle();
        // this.switchScreens("1p_lobby", "title");
        this.lobby_difficulty_back_button._events.pointertap.fn();
      }
    } else if (this.lobby_mode === "game_type") {
      if (ev.key === "ArrowRight") {
        soundEffect("switch_option");
        this.game_type_selection += 1;
        this.game_type_selection = this.game_type_selection % 3;
        this.game_type_story_text.tint = this.game_type_selection == 0 ? 0x67d8ef : 0xFFFFFF;
        this.game_type_arcade_text.tint = this.game_type_selection == 1 ? 0x67d8ef : 0xFFFFFF;
        this.game_type_tutorial_text.tint = this.game_type_selection == 2 ? 0x67d8ef : 0xFFFFFF;
        let val = (this.game_type_selection == 0 ? 180 : (this.game_type_selection == 1 ? 500 : 820));
        var tween = new TWEEN.Tween(this.game_type_selection_box.position)
          .to({x: val + 140})
          .duration(200)
          .easing(TWEEN.Easing.Cubic.Out)
          .start();
      } else if (ev.key === "ArrowLeft") {
        soundEffect("switch_option");
        this.game_type_selection += 2;
        this.game_type_selection = this.game_type_selection % 3;
        this.game_type_story_text.tint = this.game_type_selection == 0 ? 0x67d8ef : 0xFFFFFF;
        this.game_type_arcade_text.tint = this.game_type_selection == 1 ? 0x67d8ef : 0xFFFFFF;
        this.game_type_tutorial_text.tint = this.game_type_selection == 2 ? 0x67d8ef : 0xFFFFFF;
        let val = (this.game_type_selection == 0 ? 180 : (this.game_type_selection == 1 ? 500 : 820));
        var tween = new TWEEN.Tween(this.game_type_selection_box.position)
          .to({x: val + 140})
          .duration(200)
          .easing(TWEEN.Easing.Cubic.Out)
          .start();
      } else if (ev.key === "Enter") {
        this.game_type_ok_button._events.pointertap.fn();
      } else if (ev.key === "Escape") {
        this.lobby_game_type_back_button._events.pointertap.fn();
      }
    } else if (this.lobby_mode === "arcade_type") {
      if (ev.key === "ArrowRight") {
        soundEffect("switch_option");
        this.arcade_type_selection += 1;
        this.arcade_type_selection = this.arcade_type_selection % 4;
        this.arcade_type_mixed_text.tint = this.arcade_type_selection == 0 ? 0x67d8ef : 0xFFFFFF;
        this.arcade_type_word_rockets_text.tint = this.arcade_type_selection == 1 ? 0x67d8ef : 0xFFFFFF;
        this.arcade_type_base_capture_text.tint = this.arcade_type_selection == 2 ? 0x67d8ef : 0xFFFFFF;
        this.arcade_type_launch_code_text.tint = this.arcade_type_selection == 3 ? 0x67d8ef : 0xFFFFFF;
        let val = (this.arcade_type_selection == 0 ? 640 - 360 : (this.arcade_type_selection == 1 ? 640 - 120 : (this.arcade_type_selection == 2 ? 640 + 120 : 640 + 360)));
        var tween = new TWEEN.Tween(this.arcade_type_selection_box.position)
          .to({x: val})
          .duration(200)
          .easing(TWEEN.Easing.Cubic.Out)
          .start();
      } else if (ev.key === "ArrowLeft") {
        soundEffect("switch_option");
        this.arcade_type_selection += 3;
        this.arcade_type_selection = this.arcade_type_selection % 4;
        this.arcade_type_mixed_text.tint = this.arcade_type_selection == 0 ? 0x67d8ef : 0xFFFFFF;
        this.arcade_type_word_rockets_text.tint = this.arcade_type_selection == 1 ? 0x67d8ef : 0xFFFFFF;
        this.arcade_type_base_capture_text.tint = this.arcade_type_selection == 2 ? 0x67d8ef : 0xFFFFFF;
        this.arcade_type_launch_code_text.tint = this.arcade_type_selection == 3 ? 0x67d8ef : 0xFFFFFF;
        let val = (this.arcade_type_selection == 0 ? 640 - 360 : (this.arcade_type_selection == 1 ? 640 - 120 : (this.arcade_type_selection == 2 ? 640 + 120 : 640 + 360)));
        var tween = new TWEEN.Tween(this.arcade_type_selection_box.position)
          .to({x: val})
          .duration(200)
          .easing(TWEEN.Easing.Cubic.Out)
          .start();
      } else if (ev.key === "Enter") {
        this.arcade_type_ok_button._events.pointertap.fn();
      } else if (ev.key === "Escape") {
        this.lobby_arcade_type_back_button._events.pointertap.fn();
      }
    }
  } 
}

