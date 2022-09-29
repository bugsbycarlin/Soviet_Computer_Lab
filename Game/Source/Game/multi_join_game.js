//
// This file contains the multiplayer join game screen.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//

Game.prototype.initializeMultiJoinGame = function() {
  let self = this;
  let screen = this.screens["multi_join_game"];
  this.clearScreen(screen);

  this.join_game_screen_state = "active";

  let background = PIXI.Sprite.from(PIXI.Texture.WHITE);
  background.anchor.set(0, 0);
  background.width = this.width;
  background.height = this.height;
  background.tint = 0x1d2120;
  screen.addChild(background);


  let game_code_text = new PIXI.Text("ENTER GAME CODE", {fontFamily: "Press Start 2P", fontSize: 32, fill: 0xFFFFFF, letterSpacing: 2, align: "center"});
  game_code_text.scaleMode = PIXI.SCALE_MODES.NEAREST;
  game_code_text.anchor.set(0.5,0.5);
  game_code_text.position.set(this.width/2, 300);
  screen.addChild(game_code_text);

  this.proposed_join_code = [];
  this.join_code_entry_cursor = 0;

  for (var i = 0; i < 5; i++) {
    var cursor = PIXI.Sprite.from(PIXI.Texture.WHITE);
    cursor.width = 70 - 3;
    cursor.height = 2;
    cursor.anchor.set(0, 0.5);
    cursor.position.set(this.width / 2 + 70 * (i - 3), this.height * 8/16);
    cursor.tint = 0x3cb0f3;
    cursor.alpha = (12 - i) / (12 + 4);
    screen.addChild(cursor);

    let letter = new PIXI.Text("", {fontFamily: "Press Start 2P", fontSize: 60, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
    letter.anchor.set(0.5, 0.5);
    letter.position.set(this.width / 2 + 70 * (i - 3) + 35, this.height * 8/16 - 40);
    screen.addChild(letter);
    this.proposed_join_code.push(letter);
  }
}


Game.prototype.switchFromMultiJoinGameToMultiLobby = function() {
  this.join_game_screen_state = "transitioning";
  this.initializeMultiLobby();
  this.switchScreens("multi_join_game", "multi_lobby");
}


Game.prototype.multiJoinGameKey = function(letter) {
  let self = this;
  if (this.join_code_entry_cursor < 5) {
    this.proposed_join_code[this.join_code_entry_cursor].text = letter;
    this.join_code_entry_cursor += 1;
  }
}


Game.prototype.multiJoinGameDelete = function() {
  if (this.join_code_entry_cursor > 0) {
    this.join_code_entry_cursor -= 1;
    this.proposed_join_code[this.join_code_entry_cursor].text = "";
  }
}


Game.prototype.multiJoinGameEnter = function() {
  var self = this;
  this.join_game_screen_state = "trying_code";
  let proposed_join_code = "";
  for (var i = 0; i < 5; i++) {
    proposed_join_code += this.proposed_join_code[i].text;
  }

  this.network.joinGame(proposed_join_code, function() {
    self.switchFromMultiJoinGameToMultiLobby();
  }, function(reason) {
    if (reason === "bad_code") {
      self.showAlert("Couldn't find code.\n Try again.", function() {
        self.join_game_screen_state = "active";
      });
    } else if (reason === "game_full") {
      self.showAlert("Can't join because\n game is full.", function() {
        self.join_game_screen_state = "active";
      });
    }
  });
}


Game.prototype.multiJoinGameKeyDown = function(ev) {
  let self = this;
  let screen = this.screens["multi_join_game"];

  if (this.join_game_screen_state == "active") {
    for (i in lower_array) {
      if (ev.key === lower_array[i] || ev.key === letter_array[i]) {
        this.multiJoinGameKey(letter_array[i]);
      }
    }

    if (ev.key === "Backspace" || ev.key === "Delete") {
      this.multiJoinGameDelete();
    }

    if (ev.key === "Enter") {
      this.multiJoinGameEnter();
    }
  }
}