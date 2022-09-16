

Game.prototype.keyAction = function(letter) {
  let self = this;
  if (this.game_phase === "active" || this.game_phase === "tutorial") {
    if (this.difficulty_level === "BEACON") {
      if (this.player_palette.letters[letter].playable === true && !this.launchpad.full()) {
        this.launchpad.push(this.player_palette, letter);
      } else {
        this.launchpad.flashError();
      }
    } else {
      if (!this.launchpad.full()) {
        let tile = this.launchpad.push(this.player_palette, letter);
        // if (this.player_palette.letters[letter].playable === false) {
        //   tile.broken = true;
        //   tile.tint = 0xdb5858;
        // } else {
        //   tile.tint = 0x000000;
        // }
        tile.tint = 0x000000;
      }
    }
  }
}


Game.prototype.deleteAction = function() {
  if (this.game_phase === "active" || this.game_phase === "tutorial") {
    soundEffect("keyboard_click_1", 1.0);
    this.launchpad.pop();
    if (this.game_phase === "tutorial" && this.tutorial_number === 3) {
      this.tutorial35();
    }
  }
}


// Game.prototype.rightArrowAction = function() {
//   if (this.game_phase === "active" || this.game_phase === "tutorial") {
//     if (this.game_phase != "tutorial" || this.tutorial_number >= 2.5) {
//       this.launchpad.smallShiftRight();
//       if (this.game_phase === "tutorial" && this.tutorial_number === 2.5) {
//         this.tutorial_conditions["right"] = 1;
//         if (this.tutorial_conditions["right"] != null && this.tutorial_conditions["left"] != null) {
//           this.tutorial275();
//         }
//       }
//     }
//   }
// }


// Game.prototype.leftArrowAction = function() {
//   if (this.game_phase === "active" || this.game_phase === "tutorial") {
//     if (this.game_phase != "tutorial" || this.tutorial_number >= 2.5) {
//       this.launchpad.smallShiftLeft();
//       if (this.game_phase === "tutorial" && this.tutorial_number === 2.5) {
//         this.tutorial_conditions["left"] = 1;
//         if (this.tutorial_conditions["right"] != null && this.tutorial_conditions["left"] != null) {
//           this.tutorial275();
//         }
//       }
//     }
//   }
// }


Game.prototype.rightArrowAction = function() {
  console.log("happened")
  if (this.game_phase === "active" || this.game_phase === "tutorial") {
    console.log("yo")
    this.changeBaseSelection(0, 1);
    soundEffect("switch_option");
  }
}


Game.prototype.leftArrowAction = function() {
  if (this.game_phase === "active" || this.game_phase === "tutorial") {
    this.changeBaseSelection(0, -1);
    soundEffect("switch_option");
  }
}


Game.prototype.rightShiftAction = function() {
  if (this.game_phase === "active" || this.game_phase === "tutorial") {
    if (this.game_phase != "tutorial" || this.tutorial_number >= 2.75) {
      this.launchpad.bigShiftRight();
      if (this.game_phase === "tutorial" && this.tutorial_number === 2.75) {
        this.tutorial_conditions["right"] = 1;
        if (this.tutorial_conditions["right"] != null && this.tutorial_conditions["left"] != null) {
          this.tutorial3();
        }
      }
    }
  }
}


Game.prototype.leftShiftAction = function() {
  if (this.game_phase === "active" || this.game_phase === "tutorial") {
    if (this.game_phase != "tutorial" || this.tutorial_number >= 2.75) {
      this.launchpad.bigShiftLeft();
      if (this.game_phase === "tutorial" && this.tutorial_number === 2.75) {
        this.tutorial_conditions["left"] = 1;
        if (this.tutorial_conditions["right"] != null && this.tutorial_conditions["left"] != null) {
          this.tutorial3();
        }
      }
    }
  }
}


Game.prototype.clearAction = function() {
  if (this.game_phase === "active" || this.game_phase === "tutorial") {
    soundEffect("keyboard_click_1", 1.0);
    this.launchpad.clear();
    if (this.game_phase === "tutorial" && this.tutorial_number === 3.5) {
      this.tutorial4();
    }
  }
}


Game.prototype.enterAction = function() {
  if (this.game_phase === "active" || this.game_phase === "tutorial") {
    if (this.game_phase != "tutorial" || this.tutorial_number >= 5) {
      this.launchpad.launch(this.player_area);
      if (this.game_phase === "tutorial" && this.tutorial_number === 5) {
        this.tutorial6();
      }
    }
  }
}


Game.prototype.bombAction = function() {
  if (this.game_phase === "active" && this.player_bombs > 0) {
    this.player_bombs -= 1;
    this.explodeArea(this.player_area, 2);
    this.player_palette.setBombs(this.player_bombs);
  }
}


Game.prototype.pressKey = function(palette, key) {
  if (key in palette.keys) {
    let keyboard_key = palette.keys[key];
    let click_sound = "keyboard_click_" + ((key.charCodeAt(0) % 5)+1).toString();
    soundEffect(click_sound, 1.0);
    if (keyboard_key.key_pressed != true) {
      keyboard_key.key_pressed = true;
      // let old_y = keyboard_key.position.y;
      keyboard_key.position.y += 3;
      let old_tint = keyboard_key.tint;
      keyboard_key.tint = 0xDDDDDD;
      setTimeout(function() {
        keyboard_key.key_pressed = false;
        keyboard_key.position.y -= 3;
        keyboard_key.tint = old_tint;
      }, 50);
    }
  }
}


Game.prototype.gameplayKeyDown = function(key) {
  let self = this;

  if (!this.paused) {
    //this.pressKey(this.player_palette, key);

    if (this.game_phase === "tutorial" && this.tutorial_number === 1) {
      this.tutorial2();
    }

    for (i in lower_array) {
      if (key === lower_array[i] || key === letter_array[i]) {
        this.keyAction(letter_array[i]);
      }
    }

    if (key === "Backspace" || key === "Delete") {
      this.deleteAction();
    }

    if (key === "ArrowRight") {
      this.rightArrowAction();
    }

    if (key === "ArrowLeft") {
      this.leftArrowAction();
    }

    // if (key === "ArrowRight") {
    //   this.rightArrowAction();
    // }

    // if (key === "ArrowLeft") {
    //   this.leftArrowAction();
    // }

    // if (key === "RShift") {
    //   this.rightShiftAction();
    // }

    // if (key === "LShift") {
    //   this.leftShiftAction();
    // }

    if (key === "Escape") {
      this.clearAction();
    }

    if (key === " ") {
      this.bombAction();
    }

    if (key === "Enter") {
      this.enterAction();
    }
  }

  if (key === "Tab" && (this.game_phase === "active" || this.game_phase === "countdown")) {
    if (this.paused) {
      this.resume();
    } else {
      this.pause();
    }
    // this.checkEndCondition(true); // for testing, switch to this to make tab force gameovers.
  }

  if (this.paused && key === "Escape") {
    let x = document.getElementById("countdown")
    if (x != null) x.hold_up = null;
    this.monitor_overlay.restore();
    this.game_phase = "none";
    this.resume();
    fadeMusic(500);
    delay(function() {
      self.initialize1pLobby();
      self.fadeScreens("1p_word_rockets", "1p_lobby", true, 800);
    }, 900)
  }
}


Game.prototype.handleKeyUp = function(ev) {
  ev.preventDefault();

  this.keymap[ev.key] = null;
}


Game.prototype.handleKeyDown = function(ev) {
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

    this.gameplayKeyDown(key);

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
  } else if (this.current_screen === "high_score") {
    let key = ev.key;
    if (key === "Shift") {
      if (ev.code === "ShiftLeft") key = "LShift";
      if (ev.code === "ShiftRight") key = "RShift";
    }

    this.pressKey(this.high_score_palette, key);

    if (this.high_score_state === "entry") {
      for (i in lower_array) {
        if (ev.key === lower_array[i] || ev.key === letter_array[i]) {
          this.highScoreKey(letter_array[i]);
        }
      }

      if (ev.key === "Backspace" || ev.key === "Delete") {
        this.highScoreDelete();
      }

      if (ev.key === "Enter") {
        this.highScoreEnter();
      }
    }
  } else if (this.current_screen === "game_over") {
    let key = ev.key;

    if (ev.key === "Escape") {
      this.gameOverEscape();
    }

    if (ev.key === "Enter") {
      this.gameOverEnter();
    }
  } else if (this.current_screen === "cutscene") {
    if (this.cutscene_mode == "interactive") {
      if (ev.key === "Enter" || ev.key === " ") {
        this.gotoCutscenePage(this.cutscene_pagenum + 1);
      }
    }

    if (ev.key === "Escape") {
      this.endCutscene();
    }
  } else if (this.current_screen === "title") {
    this.titleKeyDown(ev);
  } else if (this.current_screen === "multi_lobby") {
    this.multiLobbyKeyDown(ev);
  } else if (this.current_screen === "multi_join_game") {
    this.multiJoinGameKeyDown(ev);
  } else if (this.current_screen === "multi_set_name") {
    this.multiSetNameKeyDown(ev);
  } else if (this.current_screen === "math_game") {
    this.mathGameKeyDown(ev);
  } else if (this.current_screen === "1p_cpe") {
    this.cpeKeyDown(ev);
  } else if (this.current_screen === "cpe_character_tester") {
    this.cpeTesterKeyDown(ev);
  } else if (this.current_screen === "alert") {
    if (ev.key === "Enter" || ev.key === "Escape") {
      this.alertBox._events.pointertap.fn()
    }
  } else if (this.current_screen === "1p_lobby") {
    this.lobbyKeyDown(ev);
    // if (ev.key === "ArrowUp") {
    //   soundEffect("switch_option");
    //   this.option_markers[this.difficulty_choice].tint = 0xFFFFFF;
    //   this.difficulty_choice = (this.difficulty_choice + 1) % 4;
    //   this.option_markers[this.difficulty_choice].tint = 0x75d3fe;
    //   this.option_info.setPartial(this.option_info_values[this.difficulty_choice].toUpperCase());
    //   this.updateHighScoreDisplay();
    // } else if (ev.key === "ArrowDown") {
    //   soundEffect("switch_option");
    //   this.option_markers[this.difficulty_choice].tint = 0xFFFFFF;
    //   this.difficulty_choice = (this.difficulty_choice + 3) % 4;
    //   this.option_markers[this.difficulty_choice].tint = 0x75d3fe;
    //   this.option_info.setPartial(this.option_info_values[this.difficulty_choice].toUpperCase());
    //   this.updateHighScoreDisplay();
    // } else if (ev.key === "Enter") {
    //   this.lobby_go_button._events.pointertap.fn();
    // } 
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


Game.prototype.handleMouseMove = function(ev) {
  if(this.current_screen === "1p_base_capture" 
    || this.current_screen === "1p_word_rockets"
    || this.current_screen === "1p_launch_code") {
    this.mouseMove(ev);
  } 
}


Game.prototype.handleMouseDown = function(ev) {
  let self = this;
  if(this.current_screen === "1p_base_capture" 
    || this.current_screen === "1p_word_rockets"
    || this.current_screen === "1p_launch_code") {
    if (ev.button >= 0 && ev.button <= 2) {
      let mouse_button = this.mouse_tester.buttons[ev.button];

      self.soundEffect("keyboard_click_1", 1.0);
      if (mouse_button.button_pressed != true) {
        mouse_button.button_pressed = true;
        mouse_button.position.y += 3;
        delay(function() {
          mouse_button.button_pressed = false;
          mouse_button.position.y -= 3;
        }, 50);
      }
    }
  }

  if(this.current_screen === "1p_base_capture") {
    this.baseCaptureMouseDown(ev);
  }

  if (this.current_screen === "1p_cpe") {
    this.cpeMouseDown(ev);
  }
}