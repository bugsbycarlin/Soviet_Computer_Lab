

// GAME



  quickPlayGame() {
    var self = this;
    this.multiplayer.quickPlayGame(2, function() {
      self.resetSetupLobby();

      self.lobby.game_code.text = "GAME CODE " + self.game_code;

      self.multiplayer.setWatch();

      self.animateSceneSwitch("title", "lobby");
    }, function() {
      self.showAlert("Sorry, Quick Play isn't\nworking right now :-(", function() {

      })
    });
  }


  createGame() {
    this.player = 1;

    var self = this;

    this.multiplayer.createNewGame(self.choices["GAME TYPE"] == "COMPETITIVE" ? "code_comp" : "code_coop", 2, function() {
      self.resetSetupLobby();

      self.lobby.game_code.text = "GAME CODE " + self.game_code;

      self.multiplayer.setWatch();

      self.animateSceneSwitch("setup_create", "lobby");
    })
  }


  joinGame(game_code) {
    this.player = 2;

    var self = this;

    this.multiplayer.joinGame(game_code, function() {
      self.resetSetupLobby();

      self.multiplayer.setWatch();

      self.lobby.game_code.text = "GAME CODE " + self.game_code;

      self.animateSceneSwitch("setup_join", "lobby");
    }, function() {
      self.showAlert("Sorry, I can't find a\ngame with that code :-(", function() {

      })
    });
  }


  watchGame(game_code) {
    this.player = 7;

    var self = this;

    this.multiplayer.watchGame(game_code, function() {
      self.resetSetupLobby();

      self.lobby_ready_button.visible = false;

      self.multiplayer.setWatch();

      self.lobby.game_code.text = "GAME CODE " + self.game_code;

      if (self.state.volley_state != "none") {
        self.initializeVolleyScreen();
        self.setPriorWords();
        self.animateSceneSwitch("setup_watch", "volley");
      } else {
        self.animateSceneSwitch("setup_watch", "lobby");
      }
    }, function() {
      self.showAlert("Sorry, I can't find a\ngame with that code :-(", function() {

      })
    });
  }


  requestRematch() {

    if (this.player == 1) {
      this.multiplayer.update({
        player_1_state: "joined",
        origin: "",
        target: "",
        live_word: "",
        volley_state: "none",
      })
    } else if (this.player == 2) {
      this.multiplayer.update({
        player_2_state: "joined",
        origin: "",
        target: "",
        live_word: "",
        volley_state: "none",
      })
    }

    this.lobby_ready_button.enable();

    this.animateSceneSwitch("volley", "lobby");
  }





  showConclusion(winner) {
    var self = this;

    var text;

    if (winner == 3) {
      text = "Time's up! You got " + this.state.player_1_score + " volleys!";
    } else if (winner == 1) {
      if (this.player == 1) {
        text = "You win, " + this.state.player_1_name + "!";
      } else if (this.player == 2) {
        text = this.state.player_1_name + " wins! You lose.";
      } else {
        text = this.state.player_1_name + " wins!";
      }
    } else if (winner == 2) {
      if (this.player == 2) {
        text = "You win, " + this.state.player_2_name + "!";
      } else if (this.player == 1) {
        text = this.state.player_2_name + " wins! You lose.";
      } else {
        text = this.state.player_2_name + " wins!";
      }
    }

    this.volley.info_text.visible = false;
    this.volley.coop_score.visible = false;
    this.volley.hint_text.visible = false;
    this.volley.back_arrow.visible = false;
    this.play_button.visible = false;
    this.letter_palette.visible = false;
    this.ball.visible = false;
    this.live_word_container.visible = false;
    this.red_underline.visible = false;
    this.blue_underline.visible = false;

    this.conclusion_text.text = text;
    this.conclusion_text.visible = true;

    this.conclusion_rematch_button.visible = true;
    this.conclusion_quit_button.visible = true;
  
  }




Game.prototype.updateFromMulti = function(snapshot) {
  // I don't know why this happens, but I need to cancel it.
  // if (this.state.volley_state == "interactive" && snapshot.val().volley_state == "start_volley") {
  //   this.state.live_word = snapshot.val().live_word;
  //   this.setLiveWord();
  //   return;
  // }

  var self = this;
  var old_state = this.state;
  var new_state = snapshot.val();
  this.state = new_state;
  var date = new Date();
  console.log(date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds() + ": Updating from multiplayer");
  console.log(old_state.volley_state);
  console.log(new_state.volley_state);

  // Player 1, notice player 2 joining or leaving the game
  if (game.player != 2) {
    if (old_state.player_2_state != "joined" && new_state.player_2_state == "joined") {
      this.lobby.info_text.anchor.set(0.5,0.5);
      this.lobby.info_text.position.set(this.width * 1/2, this.height * 4/16);
      this.lobby.info_text.text = "PLAYER 2 HAS JOINED. GET READY!";
      this.lobby.player_2_character.visible = true;
      this.lobby.player_2_name.visible = true;
    } else if (old_state.player_2_state != "quit" && new_state.player_2_state == "quit") {
      this.showAlert("Whoa. The other player\nhas left the game.", function() {
        // I should also leave, in an attempt to keep the game state coherent for later matching or cleanup
        self.multiplayer.leaveGame(self.game_code, self.player)
        self.resetTitle();
        self.animateSceneSwitch(self.current_scene, "title");
      })
    }
  }

  // Player 2, notice player 1 leaving the game
  if (game.player != 1) {
    if (old_state.player_1_state != "quit" && new_state.player_1_state == "quit") {
      this.showAlert("Whoa. The other player\nhas left the game.", function() {
        // I should also leave, in an attempt to keep the game state coherent for later matching or cleanup
        self.multiplayer.leaveGame(self.game_code, self.player)
        self.resetTitle();
        self.animateSceneSwitch(self.current_scene, "title");
      })
    }
  }

  // Update player's character, name, and score
  if (old_state.player_1_name != new_state.player_1_name) {
    this.lobby.player_1_name.text = new_state.player_1_name;
    this.lobby.player_1_character.text = new_state.player_1_name.substring(0,1);
  }
  if (old_state.player_2_name != new_state.player_2_name) {
    this.lobby.player_2_name.text = new_state.player_2_name;
    this.lobby.player_2_character.text = new_state.player_2_name.substring(0,1);
  }
  if (old_state.player_1_score != new_state.player_1_score) {
    if (this.volley != null) {
      this.volley.player_1_score.text = new_state.player_1_score;
      if (this.state.game_type == "code_coop") {
        console.log("score changed");
        if (new_state.player_1_score == 0) {
           console.log("score 0");
          this.volley.coop_score.text = "";
        } else if (new_state.player_1_score == 1){
           console.log("score 1");
          this.volley.coop_score.text = "1 Volley";
        } else {
          console.log("score 2+");
          this.volley.coop_score.text = new_state.player_1_score + " Volleys." 
            + ((Math.floor(Math.random() * 100 > 85)) ? (" " +exhortations[Math.floor(Math.random() * exhortations.length)]) : "");
        }
      }
    }
  }
  if (old_state.player_2_score != new_state.player_2_score) {
    if (this.volley != null) this.volley.player_2_score.text = new_state.player_2_score;
  }

  // Update the live word
  if (old_state.live_word != new_state.live_word && this.live_word_letters != null) {
    this.setLiveWord();
  }

  // If the origin or target change, show the new ones, and remake the live word container
  if (old_state.origin != new_state.origin || old_state.target != new_state.target) {
    if (this.current_scene == "volley") {
      // this.volley.statement.text = new_state.origin + "        " + new_state.target;
      this.remakeLiveWordContainer();
      this.setLiveWord();
      this.setPriorWords();
    }
  }

  // Start the proper game if both players register as ready
  if (old_state.player_1_state != new_state.player_1_state || old_state.player_2_state != new_state.player_2_state) {
    if (new_state.player_1_state == "ready" && new_state.player_2_state == "ready") {
      if (this.current_scene == "lobby" && this.player == 1) {
        console.log("From here I start the volley")
        this.setupVolley("start_volley");
      }
    }
  }

  // If we receive the start_volley state, make the actual transition to the volley scene and start us up.
  if (old_state.volley_state != new_state.volley_state && new_state.volley_state == "start_volley") {
    console.log("starting volley");
    this.initializeVolleyScreen();
    this.animateSceneSwitch("lobby", "volley");
    this.setPriorWords();
    this.volleyStateCountdown();
  }


  // If we receive the reset_volley state, go back to the countdown
  if (old_state.volley_state != new_state.volley_state && new_state.volley_state == "reset_volley") {
    console.log("resetting volley");
    this.volleyStateCountdown();
  }


  // If we receive the change_to_miss state, and we were not in the miss state, change to the miss state.
  if (old_state.volley_state != new_state.volley_state && new_state.volley_state == "change_to_miss") {
    if (old_state.volley_state == "miss") {
      this.state.volley_state = "miss";
    } else {
      this.volleyStateMiss();
    }
  }


  // If we receive the change_to_win, and we were not in the win state, change to the win state.
  if (old_state.volley_state != new_state.volley_state && new_state.volley_state == "change_to_win") {
    if (old_state.volley_state == "win") {
      this.state.volley_state = "win";
    } else {
      this.volleyStateWin();
    }
  }


  // If we receive change_to_lob, we are now the turn player and should prepare for the lob!
  if (old_state.volley_state != new_state.volley_state && new_state.volley_state == "change_to_lob") {
    if (old_state.volley_state != "lob") {
      console.log("changing to lob");
      var words = new_state.volley.split("-");
      var last_word = words[words.length - 1];
      this.ball.addWord(last_word);
      this.setPriorWords();
      this.volleyStateLob();
    }
  }

  // If we receive changeywee, we are now ready to stop the game as well
  if (old_state.volley_state != new_state.volley_state && new_state.volley_state == "changeywee") {
    if (old_state.volley_state != "ended") {
      console.log("I got a signal from the other guy to finish coop");
      this.finishCoop(false);
    }
  }

  console.log("Final volley state: " + this.state.volley_state);

}


Game.prototype.update = function() {
  if (this.state.length != 0 && (
    this.state.player_1_state == "quit" || this.state.player_2_state == "quit" ||
    this.state.player_1_state == "ended" || this.state.player_2_state == "ended" || this.state.volley_state == "ended")) {
    return;
  }

  if (this.current_scene == "volley") {
    this.ball.update();
  }

  var dots = Math.floor(4/1000.0 * (Date.now() - this.start_time)) % 3;
  if (this.current_scene == "lobby" && this.player != 2 && this.state.player_2_state == "empty") {
    this.lobby.info_text.text = "WAITING FOR PLAYER 2" + ".".repeat(dots + 1);
  }

  if (this.current_scene == "volley" && this.state.volley_state == "countdown") {
    var time_remaining = 5 - (Date.now() - this.volley_start) / 1000;
    if (time_remaining < 0) time_remaining = 0;
    
    if (this.state.game_type == "code_coop") {
      this.volley.info_text.text = "READY? " + Math.floor(time_remaining);
      if (time_remaining <= 0) {
        this.volley_start = Date.now();
        this.volleyStateLob(true);
      }
    } else {
      this.volley.info_text.text = "THE SECRET WORD IS " + this.state.target + ". READY? " + Math.floor(time_remaining);
      if (time_remaining <= 0) {
        this.volleyStateLob(true);
      }
    }
  }

  if (this.current_scene == "volley" && this.state.volley_state == "interactive") {
    var time_remaining = this.state.time_limit - (Date.now() - this.volley_start)/1000;
    if (time_remaining < 0) time_remaining = 0;
    
    var minutes = Math.floor(time_remaining / 60);
    var seconds = Math.floor(time_remaining - 60*minutes);
    this.volley.info_text.text = minutes + ":" + seconds.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
  
    if (this.state.game_type != "code_coop" && time_remaining <= 0 && this.player == this.state.turn) {
      this.volleyStateMiss();
    }

    if (this.state.game_type == "code_coop" && this.state.volley_state != "ended" && time_remaining <= 0 && this.player == this.state.turn) {
      this.finishCoop(true);
    }
  }

  if (this.state.game_type == "code_coop" && this.current_scene == "volley" && 
    (this.state.volley_state == "interactive" || this.state.volley_state == "lob" || this.state.volley_state == "miss")) {
    var time_remaining = this.state.time_limit - (Date.now() - this.volley_start)/1000;
    if (time_remaining < 0) time_remaining = 0;
    
    var minutes = Math.floor(time_remaining / 60);
    var seconds = Math.floor(time_remaining - 60*minutes);
    this.volley.info_text.text = minutes + ":" + seconds.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
  }
}


Game.prototype.checkVictory = function() {
  var self = this;

  // var show = false;
  // var text = "";
  // var character = "";

       
  // if (this.state.player_1_score >= 6 && this.state.player_1_score - this.state.player_2_score >= 2) {
  //   this.state.volley_state = "ended";
  //   show = true;
  //   character = this.state.player_1_name.substring(0,1);

  //   if (this.state.player == 1) {
  //     this.multiplayer.finishGame(this.game_code, this.player, this.player)
  //     text = "You win, " + this.state.player_1_name + "!";
  //   } else if (this.state.player == 2) {
  //     text = this.state.player_1_name + " wins! You lose.";
  //   } else {
  //     text = this.state.player_1_name + " wins!";
  //   }
  // } else if (this.state.player_2_score >= 6 && this.state.player_2_score - this.state.player_1_score >= 2) {
  //   this.state.volley_state = "ended";
  //   show = true;
  //   character = this.state.player_2_name.substring(0,1);

  //   if (this.state.player == 2) {
  //     this.multiplayer.finishGame(this.game_code, this.player, this.player)
  //     text = "You win, " + this.state.player_2_name + "!";
  //   } else if (this.state.player == 1) {
  //     text = this.state.player_2_name + " wins! You lose.";
  //   } else {
  //     text = this.state.player_2_name + " wins!";
  //   }
  // }

  if (this.state.player_1_score >= 6 && this.state.player_1_score - this.state.player_2_score >= 2) {
    this.state.volley_state = "ended";
    if (this.player == 1) {
      this.multiplayer.finishGame(this.game_code, this.player, this.player)
    }
    this.showConclusion(1);
  } else if (this.state.player_2_score >= 6 && this.state.player_2_score - this.state.player_1_score >= 2) {
    this.state.volley_state = "ended";
    if (this.player == 2) {
      this.multiplayer.finishGame(this.game_code, this.player, this.player)
    }
    this.showConclusion(2);
  }
}


Game.prototype.finishCoop = function(update_others) {
  var self = this;

  this.state.volley_state = "ended";

  if (update_others == true) {
    console.log("Updating others about finish game");
    this.multiplayer.finishGame(this.game_code, this.player, this.player);
  }

  // this.showConclusion(text, character, function() {
  //   self.resetTitle();
  //   self.animateSceneSwitch(self.current_scene, "title");
  // });
  self.showConclusion(3);
}


Game.prototype.setupVolley = function(new_volley_state) {
  if (this.state.volley_state == "ended") {
    return;
  }
  var choice_size = this.state.word_size
  if (choice_size == 1) {
    choice_size = Math.floor(Math.random() * 3) + 4;
  }

  var words = Object.keys(this.common_words[choice_size]);
  var origin = words[Math.floor(Math.random() * words.length)];
  var target = words[Math.floor(Math.random() * words.length)];

  var tries = 3;
  while(target == origin && tries > 0) {
    target = words[Math.floor(Math.random() * words.length)];
    tries -= 1;
  }

  var turn = 1 + Math.floor(Math.random() * 2);
  if (new_volley_state == "reset_volley") {
    turn = this.state.turn == 1 ? 2 : 1;
  }

  var player_1_score = this.state.player_1_score;
  var player_2_score = this.state.player_2_score;
  if (new_volley_state == "start_volley") {
    player_1_score = 0;
    player_2_score = 0;
  }

  console.log("From here i update the state when i setup volley in setupvolley")
  this.multiplayer.update({
    origin: origin,
    target: target,
    volley: origin,
    live_word: origin,
    turn: turn,
    player_1_score: player_1_score,
    player_2_score: player_2_score,
    volley_state: new_volley_state, // should be start_volley or reset_volley
  });
}


Game.prototype.volleyStateCountdown = function() {
  this.state.volley_state = "countdown";
  this.volley_start = Date.now();
}


Game.prototype.volleyStateLob = function(reset=false) {
  this.state.volley_state = "lob";
  if (reset) {
    this.ball.clear();
    this.ball.addWord(this.state.origin);
  }
  if (this.state.turn == 2) {
    this.ball.words[0].position.set(this.width * 1/4, this.height * 4/16);
    this.ball.words[0].rotation = Math.atan2(-15, 26.4);
    this.ball.smasha(1, 640, 640/7, 800);
  } else if (this.state.turn == 1) {
    this.ball.words[0].position.set(this.width * 3/4, this.height * 4/16);
    this.ball.words[0].rotation = Math.atan2(-15, -26.4);
    this.ball.smasha(-1, 640, 640/7, 800);
  }
  if (this.state.game_type != "code_coop") {
    this.volley.info_text.text = "";
  }
  this.ball.show();

  // this.hideHint();
  this.play_button.visible = false;
  this.play_button.disable();
  var self = this;
  setTimeout(function() {
    self.volleyStateInteractive();
  }, 800)
}


Game.prototype.volleyStateInteractive = function() {
  var self = this;
  this.state.volley_state = "interactive";
  if (this.state.game_type != "code_coop") {
    this.volley_start = Date.now();
  }
  this.live_word_letter_choice = 0;
  this.setLiveWord();

  // this.findHint();
  // setTimeout(function() {
  //   self.showHint();
  // }, Math.max(30, this.state.time_limit * 1000 - 7000));

  if (this.player == this.state.turn) {
    for (var i = 0; i < this.letter_palette.letters.length; i++) {
      this.letter_palette.letters[i].enable();
    }
    this.live_word_letter_choice = 0
    for (var i = 0; i < this.live_word_letters.length; i++) {
      this.live_word_letters[i].backing.tint = (i == this.live_word_letter_choice ? 0xf1e594 : 0xFFFFFF);
    }
  } else {
    for (var i = 0; i < this.letter_palette.letters.length; i++) {
      this.letter_palette.letters[i].disable();
    }
    for (var i = 0; i < this.live_word_letters.length; i++) {
      this.live_word_letters[i].backing.tint = 0xFFFFFF;
    }
  }
}


Game.prototype.volleyStateMiss = function() {
  var self = this;

  this.state.volley_state = "miss";

  if (this.player == this.state.turn) {
    var player_1_score = this.state.player_1_score;
    var player_2_score = this.state.player_2_score;

    if (this.state.game_type != "code_coop") {
      if (this.player == 1) {
        player_2_score += 1;
      } else if (this.player == 2) {
        player_1_score += 1;
      }
    }

    this.multiplayer.update({
      player_1_score: player_1_score,
      player_2_score: player_2_score,
      volley_state: "change_to_miss",
      live_word: "",
    })
  }

  // this.hideHint();
  this.play_button.visible = false;

  if (this.state.game_type != "code_coop") {
    this.volley.info_text.text = "";
  }
  this.state.live_word = "";
  this.setLiveWord();
  this.red_underline.visible = false;
  this.blue_underline.visible = false;

  this.ball.words[0].vx = this.ball.last_vx;
  this.ball.words[0].vy = this.ball.last_vy;
  this.ball.words[0].rotation = this.ball.last_rotation;
  this.ball.bottom_bound = this.height * 7/16 + 80;
  this.ball.flying = true;
  this.ball.bounce = true;

  setTimeout(function() {
    self.ball.flying = false;
    self.ball.bounce = false;
    self.ball.bottom_bound = self.ball.permanent_bottom_bound;
    self.ball.clear();

    if (self.state.game_type != "code_coop") {
      self.checkVictory();
    }

    if (self.player == 1 && self.state.game_type != "code_coop") {
      console.log("I shouldn't reach here from miss in a coop game");
      self.setupVolley("reset_volley");
    }
  }, 800);

  
}


Game.prototype.volleyStateWin = function() {
  var self = this;
  this.state.volley_state = "win";
  this.state.volley = this.state.volley + "-" + this.state.live_word;

  if (this.player == this.state.turn) {
    var player_1_score = this.state.player_1_score;
    var player_2_score = this.state.player_2_score;

    if (this.player == 1) {
      player_1_score += 3;
    } else if (this.player == 2) {
      player_2_score += 3;
    }

    this.multiplayer.update({
      player_1_score: player_1_score,
      player_2_score: player_2_score,
      volley_state: "change_to_win",
      volley: this.state.volley,
      live_word: "",
    })
  }

  // this.hideHint();
  this.play_button.visible = false;
  
  this.volley.info_text.text = "";
  this.state.live_word = "";
  this.setLiveWord();
  this.red_underline.visible = false;
  this.blue_underline.visible = false;

  if (this.state.turn == 1) {
    this.ball.words[0].position.set(this.width * 1/4, this.height * 4/16);
    this.ball.words[0].rotation = Math.atan2(-15, 26.4);
    this.ball.smasha(1, 1600, 640/7, 600, true);
  } else if (this.state.turn == 2) {
    this.ball.words[0].position.set(this.width * 3/4, this.height * 4/16);
    this.ball.words[0].rotation = Math.atan2(-15, -26.4);
    this.ball.smasha(-1, 1600, 640/7, 600, true);
  }
  this.ball.words[0].vy *= 0;
  this.ball.bottom_bound = 5000;
  this.ball.show();

  setTimeout(function() {
    self.ball.flying = false;
    self.ball.bounce = false;
    self.ball.bottom_bound = self.ball.permanent_bottom_bound;
    self.ball.clear();

    self.checkVictory();
    if (self.player == 1) {
      self.setupVolley("reset_volley");
    }
  }, 800);
}


Game.prototype.returnVolley = function() {
  var self = this;

  if (this.player == this.state.turn) {
    if (this.state.game_type == "code_coop" || this.state.live_word != this.state.target) { // regular volley

      this.state.volley = this.state.volley + "-" + this.state.live_word;
      this.state.turn = this.state.turn == 1 ? 2 : 1;
      //this.state.live_word = ;

      var words = this.state.volley.split("-");
      var last_word = words[words.length - 1];
      this.ball.addWord(last_word);

      var player_1_score = this.state.player_1_score;
      var player_2_score = this.state.player_2_score;
      if (this.state.game_type == "code_coop") {
        player_2_score += 1;
        player_1_score += 1;
      }

      this.setPriorWords();
      this.volleyStateLob();
      this.setLiveWord();
        
      console.log("It can't be here surely")
      this.multiplayer.update({
        player_1_score: player_1_score,
        player_2_score: player_2_score,
        volley_state: "change_to_lob",
        volley: this.state.volley,
        turn: this.state.turn,
        live_word: this.state.live_word,
      });
    } else { // winning shot
      this.volleyStateWin();
    }
  }
}


Game.prototype.setLiveWord = function() {
  if (this.state.volley_state == "interactive" && this.live_word_letters != null && this.player == this.state.turn) {
    for (var i = 0; i < this.live_word_letters.length; i++) {
      this.live_word_letters[i].text.text = this.state.live_word[i];
      this.live_word_letters[i].backing.tint = (i == this.live_word_letter_choice ? 0xf1e594 : 0xFFFFFF);
    }
    this.live_word_container.visible = true;
  } else {
    for (var i = 0; i < this.live_word_letters.length; i++) {
      this.live_word_letters[i].text.text = this.state.live_word[i];
      this.live_word_letters[i].backing.tint = 0xFFFFFF;
    }
    this.live_word_container.visible = false;
  }
}


Game.prototype.setPriorWords = function() {
  this.priorWords = this.state.volley.split("-");
}


Game.prototype.checkRedUnderline = function() {
  return !(this.state.live_word in this.legal_words[this.state.origin.length]);
}


Game.prototype.checkBlueUnderline = function() {
  return (this.priorWords.includes(this.state.live_word));
}


Game.prototype.findHint = function() {
  var base_word = this.ball.words[0].text;
  this.hint_text = "";
  for (const [key, value] of Object.entries(this.legal_words[base_word.length])) {
    if (this.distance(key, base_word) == 1 && !this.priorWords.includes(key)) {
      this.hint_text = key;
      break;
    }
  }
}


Game.prototype.distance = function(word1, word2) { //assumes same length
  var distance = 0;
  for (var i = 0; i < word1.length; i++) {
    if (word1[i] != word2[i]) distance += 1;
  }
  return distance;
}


Game.prototype.showHint = function() {
  if (this.state.turn == 1) {
    this.volley.hint_text.position.set(this.width * 1/8, this.height * 7/16 + 190);
  } else if (this.state.turn == 2) {
    this.volley.hint_text.position.set(this.width * 7/8, this.height * 7/16 + 190);
  }
  this.volley.hint_text.text = this.hint_text == "" ? "OUT OF LUCK" : this.hint_text;
  this.volley.hint_text.visible = true;

  new TWEEN.Tween(this.volley.hint_text)
      .to({rotation: Math.PI / 60.0})
      .duration(70)
      .yoyo(true)
      .repeat(3)
      .start()
}


Game.prototype.hideHint = function() {
  this.volley.hint_text.text = "";
  this.volley.hint_text.visible = false;
}




// old MULTIPLAYER class

var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

class Multiplayer {
  constructor(game) {
    this.database = firebase.database();
    this.game = game;
  }


  generateGameCode() {
    
    var name = "";
    for (var i = 0; i < 5; i++) {
      name += alphabet.charAt(Math.floor(Math.random() * alphabet.length));

    }
    return name;
  }


  createNewGame(game_type, tries_left, callback) {
    var self = this;
    var game_code = this.generateGameCode();

    // Quick play defaults
    var word_size = 4;
    var time_limit = 10; // 10, 5 for fast testing

    var type = game.choices["GAME TYPE"];
    var difficulty = game.choices["DIFFICULTY"];

    if (type == "COMPETITIVE") {
      game_type = "code_comp";
      if (difficulty == "EASY") {
        word_size = 4;
        time_limit = 10;
      } else if (difficulty == "MEDIUM") {
        word_size = 1;
        time_limit = 20;
      } else if (difficulty == "HARD") {
        word_size = 7;
        time_limit = 20;
      }
    } else if (type == "COOPERATIVE") {
      game_type = "code_coop";

      if (difficulty == "EASY") {
        word_size = 4;
        time_limit = 120; // 120, 30 for fast testing
      } else if (difficulty == "MEDIUM") {
        word_size = 1;
        time_limit = 60;
      } else if (difficulty == "HARD") {
        word_size = 7;
        time_limit = 60;
      }
    }


    game.state = {
      game_type: game_type,
      player_1_state: "joined",
      player_2_state: "empty", 
      player_1_name: "ALFIE",
      player_2_name: "BERT",
      player_1_score: 0,
      player_2_score: 0,
      time_limit: time_limit + 1, // one second to make it nicer
      word_size: word_size,
      live_word: "",
      origin: "",
      target: "",
      volley: "",
      turn: 1,
      volley_state: "none",
      timestamp: firebase.database.ServerValue.TIMESTAMP,
    };
    console.log(game.state);

    this.database.ref("/games/" + game_code).set(game.state, (error) => {
      if (error) {
        console.log("Failed to create game " + game_code + " on try number " + tries_left);
        console.log(error);
        if (tries_left > 0) {
          self.createNewGame(game_type, tries_left - 1, callback)
        } else {
          self.game.showAlert("Sorry! I could'nt make\na game. Please try later.", function() {});
        }
      } else {
        console.log("Created game " + game_code)
        self.game.game_code = game_code;
        callback();
      }
    });
  }


  joinGame(game_code, yes_callback, no_callback) {
    var self = this;
    this.database.ref("/games/" + game_code).once("value").then((result) => {
      if (result.exists()) {
        self.game.game_code = game_code;
        this.database.ref("games/" + game_code).update({
          player_2_state: "joined",
        }, (error) => {
          if (error) {
            console.log("Could not join game " + game_code);
            no_callback();
          } else {
            console.log("Managed to join game " + game_code);
            this.database.ref("/games/" + game_code).once("value").then((result) => {
              self.game.state = result.val();
              if (self.game.state.game_type == "quick_open") {
                self.update({game_type: "quick_closed"})
              }
              yes_callback();
            });
          }
        });
      } else {
        console.log("Could not find game " + game_code);
        no_callback();
      }
    });
  }


  watchGame(game_code, yes_callback, no_callback) {
    var self = this;
    this.database.ref("/games/" + game_code).once("value").then((result) => {
      if (result.exists()) {
        self.game.game_code = game_code;
        self.database.ref("/games/" + game_code).once("value").then((result) => {
          self.game.state = result.val();
          if (self.game.state.game_type == "quick_open") {
            self.update({game_type: "quick_closed"})
          }
          yes_callback();
        });
      } else {
        console.log("Could not find game " + game_code);
        no_callback();
      }
    });
  }


//.orderByChild("game_type").equalTo("quick_open")
  quickPlayGame(tries_left, yes_callback, no_callback) {
    var self = this;
    this.database.ref().child("games").orderByChild("game_type").equalTo("quick_open").limitToLast(20).once("value").then((result) => {
      console.log(result);
      if (result.exists()) {
        self.game.player = 2;
        console.log("Found quick play games to join.");
        var game_codes = Object.keys(result.val());
        console.log(game_codes);
        var game_code = game_codes[Math.floor(Math.random() * game_codes.length)];
        console.log(game_code);
        self.joinGame(game_code, yes_callback, function() {
          if (tries_left > 0) {
            self.quickPlayGame(tries_left - 1, yes_callback, no_callback);
          } else {
            no_callback();
          }
        })
      } else {
        console.log("Found no quick play games to join. Must create one.");
        // no_callback();
        self.choices = {
          "GAME_TYPE": "",
          "DIFFICULTY": "",
        };
        self.game.player = 1;
        self.createNewGame("quick_open", 2, yes_callback)
      }
    });

  }


  setWatch() {
    this.ref_state_change = this.database.ref("games/" + game.game_code);
    this.watch = this.ref_state_change.on("value", (snapshot) => {game.updateFromMulti(snapshot)});
  }


  stopWatch() {
    if (this.watch) {
      this.ref_state_change.off("value", this.watch);
      this.watch = null;
    }
  }


  finishGame(code, player, winner) {
    var sheet = {}

    if (this.game.state.game_type != "code_coop") {
      if (player == 1 && player == winner) {
        sheet["player_1_state"] = "win";
        sheet["player_2_state"] = "ended";
        sheet["volley_state"] = "ended";
      } else if (player == 2 && player == winner) {
        sheet["player_2_state"] = "win";
        sheet["player_1_state"] = "ended";
        sheet["volley_state"] = "ended";
      }
      // } else if (player == 1) {
      //   sheet["player_1_state"] = "ended";
      // } else if (player == 2) {
      //   sheet["player_2_state"] = "ended";
      // }
      if (this.game.state.game_type == "quick_open") {
        sheet["game_type"] = "quick_closed";
      }
    } else {
      sheet["player_2_state"] = "ended";
      sheet["player_1_state"] = "ended";
      sheet["volley_state"] = "changeywee";
    }
    console.log(sheet);
    console.log(code);

    this.database.ref("games/" + code).update(sheet);
  }


  leaveGame(code, player) {
    var sheet = {}
    if (player == 1) {
      console.log("Player 1 leaving the game");
      sheet["player_1_state"] = "quit";
    } else if (player == 2) {
      console.log("Player 2 leaving the game");
      sheet["player_2_state"] = "quit";
    }
    if (this.game.state.game_type == "quick_open") {
      sheet["game_type"] = "quick_closed";
    }
    this.database.ref("games/" + code).update(sheet);
  }


  update(sheet) {
    this.database.ref("games/" + this.game.game_code).update(sheet);
  }

  googleSignIn() {
    var self = this;
    var provider = new firebase.auth.GoogleAuthProvider();
    console.log(provider);
    firebase.auth()
      .signInWithPopup(provider)
      .then((result) => {
        /** @type {firebase.auth.OAuthCredential} */

        var credential = result.credential;
        var token = credential.accessToken;
        var user = result.user;

        self.game.auth_user = user;

        self.game.sign_in_button.disable();
        self.game.sign_in_button.visible = false;
        self.game.sign_out_button.enable();
        self.game.sign_out_button.visible = true;
        // ...
      }).catch((error) => {
        console.log("Error with google sign in!")
        console.log(error);
      });
  }

  anonymousSignIn(callback) {
    console.log("Using anonymous sign in");
    var self = this;
    firebase.auth().signInAnonymously()
      .then(() => {
        callback();
      })
      .catch((error) => {
        console.log("Error with anonymous sign in!")
        console.log(error);
      });

  }

  signOut() {
    var self = this;
    firebase.auth().signOut().then(() => {
      self.game.sign_out_button.disable();
      self.game.sign_out_button.visible = false;
      self.game.sign_in_button.enable();
      self.game.sign_in_button.visible = true;
      self.game.auth_user = null;
    }).catch((error) => {
      console.log("Error signing out!");
      console.log(error);
    });
  }
}



/// setup scene creation



// My colors
// Blue: 0x3cb0f3
// Yellow: 0xf3db3c
// Red: 0xdb5858
// Green: 0x71d07d


Game.prototype.backArrow = function(current, old, action=null) {
  var self = this;
  var arrow = new PIXI.Sprite(PIXI.Texture.from("Art/left_arrow.png"));
  arrow.position.set(64, 48);
  arrow.anchor.set(0.5, 0.5);
  arrow.scale.set(0.4, 0.4);
  arrow.interactive = true;
  arrow.buttonMode = true;
  arrow.on("pointertap", function() {
    if (action != null) {
      action();
    }
    self.animateSceneSwitch(current, old)
  });
  this.scenes[current].addChild(arrow);
  return arrow;
}

var character_names = [
  "ALFIE",
  "BERT",
  "CALLIE",
  "DENZEL",
  "EMMA",
  "FATIMA",
  "GRETA",
  "HAKEEM",
  "INEZ",
  "JIN",
  "KRISHNA",
  "LIAN",
  "MARCUS",
  "NAOMI",
  "OMAR",
  "PABLO",
  "QUARREN",
  "RIYA",
  "SOPHIE",
  "TANIEL",
  "UBA",
  "VIJAY",
  "WINTER",
  "XAVIER",
  "YAIR",
  "ZHANG",
];
Game.prototype.changeCharacterArrow = function(scene, player, direction, x, y) {
  var self = this;
  var arrow = new PIXI.Sprite(PIXI.Texture.from("Art/left_arrow.png"));
  arrow.position.set(x, y);
  arrow.anchor.set(0.5, 0.5);
  arrow.scale.set(0.2, 0.4);
  arrow.rotation = Math.PI / 2;
  if (direction == -1) {
    arrow.rotation = Math.PI / -2;
  }
  arrow.interactive = true;
  arrow.buttonMode = true;
  arrow.on("pointertap", function() {
    var alphabetArray = alphabet.split('');
    if (player == 1) {
      var old_character = self.state.player_1_name.substring(0,1);
      var position = alphabetArray.indexOf(old_character);
      var new_character = alphabetArray[(position + alphabetArray.length + 1 * direction) % 26];
      var new_name = character_names[(position + alphabetArray.length + 1 * direction) % 26];
      self.lobby.player_1_character.text = new_character;
      self.multiplayer.update({player_1_name: new_name});
    } else if (player == 2) {
      var old_character = self.state.player_2_name.substring(0,1);;
      var position = alphabetArray.indexOf(old_character);
      var new_character = alphabetArray[(position + alphabetArray.length + 1 * direction) % 26];
      var new_name = character_names[(position + alphabetArray.length + 1 * direction) % 26];
      self.lobby.player_2_character.text = new_character;
      self.multiplayer.update({player_2_name: new_name});
    }
  });
  this.scenes[scene].addChild(arrow);
}



Game.prototype.initializeSetupCreate = function() {
  this.clearScene(this.scenes["setup_create"]);

  var create_button = this.makeButton(
    this.scenes["setup_create"],
    this.width * 1/2, this.height * 21/24,
    "CREATE", 60, 6, 0xFFFFFF,
    256, 90, 0x3cb0f3,
    function() {
      if (self.auth_user == null) {
        self.multiplayer.anonymousSignIn(function() {self.createGame()});
      } else {
        self.createGame()
      }
    }
  );
  create_button.disable();

  var self = this;

  this.makeOptionChooser(this.scenes["setup_create"], this.width * 2/6, this.height * 4/24, ["COOPERATIVE", "COMPETITIVE"], "GAME TYPE", create_button);
  this.makeOptionChooser(this.scenes["setup_create"], this.width * 4/6, this.height * 4/24, ["EASY", "MEDIUM", "HARD"], "DIFFICULTY", create_button);
  // this.makeOptionChooser(this.scenes["setup_create"], this.width * 19/24, this.height * 1/6, ["SHORT", "LONG"], "TIME LIMIT", create_button);

  this.options_text_box = new PIXI.Text("", {fontFamily: "Bebas Neue", fontSize: 30, fill: 0x000000, letterSpacing: 6, align: "left"});
  this.options_text_box.anchor.set(0,0.5);
  this.options_text_box.position.set(this.width * 9/48, this.height * 31/48);
  this.scenes["setup_create"].addChild(this.options_text_box);



  this.backArrow("setup_create", "title", function() {self.resetTitle();})
}


Game.prototype.resetOptionsText = function() {
    var options_text = [];
    // for (const [key,value] of Object.entries(this.choices)) {
    //   var choice_strings = this.choice_strings[key];
    //   if (this.choices[key] in choice_strings) {
    //     options_text.append(this.choices[key][value])
    //   }
    // }
    if (this.choices["GAME TYPE"] == "COMPETITIVE") {
      options_text = options_text.concat(["Play by changing one letter to make a new word.",
        "1 point if the other player drops.",
        "3 points for spelling the special word.",
        "First to 6, win by 2."])
    
      if (this.choices["DIFFICULTY"] == "EASY") {
        options_text = options_text.concat(["4 letter words", "10 seconds per turn."])
      } else if (this.choices["DIFFICULTY"] == "MEDIUM") {
        options_text = options_text.concat(["4 to 6 letter words", "20 seconds per turn."])
      } else if (this.choices["DIFFICULTY"] == "HARD") {
        options_text = options_text.concat(["7 letter words", "20 seconds per turn."])
      }
    } else if (this.choices["GAME TYPE"] == "COOPERATIVE") {
      options_text = options_text.concat(["Play by changing one letter to make a new word.",
        "Cooperate to make as many new words as you can."])

      if (this.choices["DIFFICULTY"] == "EASY") {
        options_text = options_text.concat(["4 letter words", "2 minute game."])
      } else if (this.choices["DIFFICULTY"] == "MEDIUM") {
        options_text = options_text.concat(["4 to 6 letter words", "1 minute game."])
      } else if (this.choices["DIFFICULTY"] == "HARD") {
        options_text = options_text.concat(["7 letter words", "1 minute game."])
      }
    }
   
    for (var i = 0; i < options_text.length; i++) {
      options_text[i] = "- " + options_text[i];
    }
    this.options_text_box.text = options_text.join("\n");
  }


Game.prototype.initializeSetupJoin = function() {
  this.clearScene(this.scenes["setup_join"]);

  var your_game_code_give_it_to_me = new PIXI.Text("YOUR CODES. GIVE DEM TO ME.", {fontFamily: "Bebas Neue", fontSize: 36, fill: 0x000000, letterSpacing: 6, align: "center"});
  your_game_code_give_it_to_me.anchor.set(0.5,0.5);
  your_game_code_give_it_to_me.position.set(this.width * 1/2, this.height * 1/5 - 60);
  this.scenes["setup_join"].addChild(your_game_code_give_it_to_me);

  var self = this;

  this.game_code_letters = [];

  var join_button = this.makeButton(
    this.scenes["setup_join"],
    this.width * 1/2, this.height * 5/6,
    "JOIN", 60, 6, 0x000000,
    256, 90, 0xf3db3c,
    function() {
      var potential_game_code = "";
      for (var i = 0; i < 5; i++) {
        potential_game_code += self.game_code_letters[i].text.text;
      }
      if (self.auth_user == null) {
        self.multiplayer.anonymousSignIn(function() {self.joinGame(potential_game_code);});
      } else {
        self.joinGame(potential_game_code);
      }
    }
  );
  join_button.disable();
  
  this.game_code_letter_choice = 0;
  for (var i = 0; i < 5; i++) {
    let choice_num = i;
    this.game_code_letters.push(this.makeButton(
      this.scenes["setup_join"],
      this.width * 1/2 - 200 + 100*i , this.height * 1/5 + 40,
      "", 100, 6, 0x000000,
      98, 100, (i == 0 ? 0xf1e594 : 0xFFFFFF),
      function() {
        self.game_code_letter_choice = choice_num
        for (var i = 0; i < 5; i++) {
          self.game_code_letters[i].backing.tint = (i == self.game_code_letter_choice ? 0xf1e594 : 0xFFFFFF);
        }
      }
    ));
  }

  this.makeLetterPalette(this.scenes["setup_join"], this.width * 9/16, this.height * 9/16, function(letter) {
    self.game_code_letters[self.game_code_letter_choice].text.text = letter;
    if (self.game_code_letter_choice < 4) {
      self.game_code_letter_choice += 1;
    }
    join_button.enable();
    for (var i = 0; i < 5; i++) {
      if (self.game_code_letters[i].text.text == "") {
        join_button.disable();
      }
      self.game_code_letters[i].backing.tint = (i == self.game_code_letter_choice ? 0xf1e594 : 0xFFFFFF);
    }
  });

  this.backArrow("setup_join", "title", function() {self.resetTitle();});
}



Game.prototype.initializeSetupWatch = function() {
  this.clearScene(this.scenes["setup_watch"]);

  var your_game_code_give_it_to_me = new PIXI.Text("YOUR CODES. GIVE DEM TO ME.", {fontFamily: "Bebas Neue", fontSize: 36, fill: 0x000000, letterSpacing: 6, align: "center"});
  your_game_code_give_it_to_me.anchor.set(0.5,0.5);
  your_game_code_give_it_to_me.position.set(this.width * 1/2, this.height * 1/5 - 60);
  this.scenes["setup_watch"].addChild(your_game_code_give_it_to_me);

  var self = this;

  this.game_code_letters = [];

  var watch_button = this.makeButton(
    this.scenes["setup_watch"],
    this.width * 1/2, this.height * 5/6,
    "WATCH", 60, 6, 0xFFFFFF,
    256, 90, 0xdb5858,
    function() {
      var potential_game_code = "";
      for (var i = 0; i < 5; i++) {
        potential_game_code += self.game_code_letters[i].text.text;
      }
      if (self.auth_user == null) {
        self.multiplayer.anonymousSignIn(function() {self.watchGame(potential_game_code);});
      } else {
        self.watchGame(potential_game_code);
      }
    }
  );
  watch_button.disable();
  
  this.game_code_letter_choice = 0;
  for (var i = 0; i < 5; i++) {
    let choice_num = i;
    this.game_code_letters.push(this.makeButton(
      this.scenes["setup_watch"],
      this.width * 1/2 - 200 + 100*i , this.height * 1/5 + 40,
      "", 100, 6, 0x000000,
      98, 100, (i == 0 ? 0xf1e594 : 0xFFFFFF),
      function() {
        self.game_code_letter_choice = choice_num
        for (var i = 0; i < 5; i++) {
          self.game_code_letters[i].backing.tint = (i == self.game_code_letter_choice ? 0xf1e594 : 0xFFFFFF);
        }
      }
    ));
  }

  this.makeLetterPalette(this.scenes["setup_watch"], this.width * 9/16, this.height * 9/16, function(letter) {
    self.game_code_letters[self.game_code_letter_choice].text.text = letter;
    if (self.game_code_letter_choice < 4) {
      self.game_code_letter_choice += 1;
    }
    watch_button.enable();
    for (var i = 0; i < 5; i++) {
      if (self.game_code_letters[i].text.text == "") {
        watch_button.disable();
      }
      self.game_code_letters[i].backing.tint = (i == self.game_code_letter_choice ? 0xf1e594 : 0xFFFFFF);
    }
  });

  this.backArrow("setup_watch", "title", function() {self.resetTitle();});
}


Game.prototype.resetSetupLobby = function() {
  var self = this;

  this.clearScene(this.scenes["lobby"]);

  this.lobby = [];

  this.lobby.player_1_character = new PIXI.Text(this.state.player_1_name.substring(0,1), {fontFamily: "Bebas Neue", fontSize: 144, fill: 0x3cb0f3, letterSpacing: 6, align: "center"});
  this.lobby.player_1_character.anchor.set(0.5,0.5);
  this.lobby.player_1_character.position.set(this.width * 1/8, this.height * 1/2);
  this.scenes["lobby"].addChild(this.lobby.player_1_character);

  this.lobby.player_1_name = new PIXI.Text(this.state.player_1_name, {fontFamily: "Bebas Neue", fontSize: 36, fill: 0x3cb0f3, letterSpacing: 6, align: "center"});
  this.lobby.player_1_name.anchor.set(0.5,0.5);
  this.lobby.player_1_name.position.set(this.width * 1/8, this.height * 1/2 + 80);
  this.scenes["lobby"].addChild(this.lobby.player_1_name);

  if (this.player == 1) {
    this.changeCharacterArrow("lobby", 1, 1, this.width * 1/8, this.height * 1/2 - 100);
    this.changeCharacterArrow("lobby", 1, -1, this.width * 1/8, this.height * 1/2 + 120);
  }

  this.lobby.player_2_character = new PIXI.Text(this.state.player_2_name.substring(0,1), {fontFamily: "Bebas Neue", fontSize: 144, fill: 0xf3db3c, letterSpacing: 6, align: "center"});
  this.lobby.player_2_character.anchor.set(0.5,0.5);
  this.lobby.player_2_character.position.set(this.width * 7/8, this.height * 1/2);
  this.scenes["lobby"].addChild(this.lobby.player_2_character);

  this.lobby.player_2_name = new PIXI.Text(this.state.player_2_name, {fontFamily: "Bebas Neue", fontSize: 36, fill: 0xf3db3c, letterSpacing: 6, align: "center"});
  this.lobby.player_2_name.anchor.set(0.5,0.5);
  this.lobby.player_2_name.position.set(this.width * 7/8, this.height * 1/2 + 80);
  this.scenes["lobby"].addChild(this.lobby.player_2_name);

  if (this.player == 2) {
    this.changeCharacterArrow("lobby", 2, 1, this.width * 7/8, this.height * 1/2 - 100);
    this.changeCharacterArrow("lobby", 2, -1, this.width * 7/8, this.height * 1/2 + 120);
  }

  this.lobby.game_code = new PIXI.Text("GAME CODE DFGHS", {fontFamily: "Bebas Neue", fontSize: 96, fill: 0x000000, letterSpacing: 6, align: "center"});
  this.lobby.game_code.anchor.set(0.5,0.5);
  this.lobby.game_code.position.set(this.width * 1/2, this.height * 2/16);
  this.scenes["lobby"].addChild(this.lobby.game_code);
  this.lobby.game_code.visible = true;

  this.lobby.info_text = new PIXI.Text("WAITING FOR PLAYER 2", {fontFamily: "Bebas Neue", fontSize: 36, fill: 0x000000, letterSpacing: 6, align: "center"});
  this.lobby.info_text.anchor.set(0,0.5);
  this.lobby.info_text.position.set(this.width * 1/2 - 180, this.height * 4/16);
  this.scenes["lobby"].addChild(this.lobby.info_text);
  
  if (this.player != 2) {
    if (this.state.player_2_state == "empty") {
      this.lobby.player_2_character.visible = false;
      this.lobby.player_2_name.visible = false;
    }
  } else {
    this.lobby.info_text.text = "GET IN THE CHOPPER!";
    this.lobby.info_text.anchor.set(0.5,0.5);
    this.lobby.info_text.position.set(this.width * 1/2, this.height * 4/16);
  }

  this.options_text_box = new PIXI.Text("", {fontFamily: "Bebas Neue", fontSize: 24, fill: 0x000000, letterSpacing: 6, align: "left"});
  this.options_text_box.anchor.set(0,0.5);
  this.options_text_box.position.set(this.width * 11/48, this.height * 1/2);
  this.scenes["lobby"].addChild(this.options_text_box);


  if (this.state.game_type == "code_comp") {
    if (this.state.word_size == 4) {
      this.choices["GAME TYPE"] = "COMPETITIVE";
      this.choices["DIFFICULTY"] = "EASY";
    } else if (this.state.word_size == 1) {
      this.choices["GAME TYPE"] = "COMPETITIVE";
      this.choices["DIFFICULTY"] = "MEDIUM";
    } else if (this.state.word_size == 7) {
      this.choices["GAME TYPE"] = "COMPETITIVE";
      this.choices["DIFFICULTY"] = "HARD";
    }
  } else if (this.state.game_type == "code_coop") {
    if (this.state.word_size == 4) {
      this.choices["GAME TYPE"] = "COOPERATIVE";
      this.choices["DIFFICULTY"] = "EASY";
    } else if (this.state.word_size == 1) {
      this.choices["GAME TYPE"] = "COOPERATIVE";
      this.choices["DIFFICULTY"] = "MEDIUM";
    } else if (this.state.word_size == 7) {
      this.choices["GAME TYPE"] = "COOPERATIVE";
      this.choices["DIFFICULTY"] = "HARD";
    }
  } else if (this.state.game_type == "quick_open" || this.state.game_type == "quick_closed") {
    this.choices["GAME TYPE"] = "COMPETITIVE";
    this.choices["DIFFICULTY"] = "MEDIUM";
  }
  

  this.resetOptionsText();

  this.backArrow("lobby", "title", function() {
    self.multiplayer.leaveGame(self.game_code, self.player)
    self.resetTitle();
  });

  this.lobby_ready_button = this.makeButton(
    this.scenes["lobby"],
    this.width * 1/2, this.height * 14/16,
    "READY", 60, 6, 0xFFFFFF,
    256, 90, 0x3cb0f3,
    function() {
      if (self.player == 1) self.multiplayer.update({player_1_state: "ready"});
      if (self.player == 2) self.multiplayer.update({player_2_state: "ready"});
      this.disable();
    }
  );
}



//// 


