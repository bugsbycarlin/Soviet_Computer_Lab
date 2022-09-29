//
// This file contains the name choosing screen for multiplayer.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//

Game.prototype.initializeMultiSetName = function(next_screen) {
  let self = this;
  let screen = this.screens["multi_set_name"];
  this.clearScreen(screen);

  this.set_name_screen_state = "active";
  this.set_name_next_screen = next_screen;

  let background = PIXI.Sprite.from(PIXI.Texture.WHITE);
  background.anchor.set(0, 0);
  background.width = this.width;
  background.height = this.height;
  background.tint = 0x1d2120;
  screen.addChild(background);


  let game_code_text = new PIXI.Text("CHOOSE YOUR NAME", {fontFamily: "Press Start 2P", fontSize: 32, fill: 0xFFFFFF, letterSpacing: 2, align: "center"});
  game_code_text.scaleMode = PIXI.SCALE_MODES.NEAREST;
  game_code_text.anchor.set(0.5,0.5);
  game_code_text.position.set(this.width/2, 300);
  screen.addChild(game_code_text);

  this.proposed_name = [];
  this.name_entry_cursor = 0;

  for (var i = 0; i < 8; i++) {
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
    letter.position.set(this.width / 2 + 70 * (i - 4) + 35, this.height * 8/16 - 40);
    screen.addChild(letter);
    this.proposed_name.push(letter);
  }
}


Game.prototype.switchFromMultiSetNameToNextScreen = function() {
  this.set_name_screen_state = "transitioning";
  this.initializeMultiLobby();
  this.switchScreens("multi_set_name", this.set_name_next_screen);
}


Game.prototype.multiSetNameKey = function(letter) {
  let self = this;
  if (this.name_entry_cursor < 5) {
    this.proposed_name[this.name_entry_cursor].text = letter;
    this.name_entry_cursor += 1;
  }
}


Game.prototype.multiSetNameDelete = function() {
  if (this.name_entry_cursor > 0) {
    this.name_entry_cursor -= 1;
    this.proposed_name[this.name_entry_cursor].text = "";
  }
}


Game.prototype.multiSetNameEnter = function() {
  var self = this;
  
  // this.set_name_screen_state = "trying_code";
  // let proposed_name = "";
  // for (var i = 0; i < 5; i++) {
  //   proposed_name += this.proposed_name[i].text;
  // }

  // this.network.SetName(proposed_name, function() {
  //   self.switchFromMultiSetNameToMultiLobby();
  // }, function(reason) {
  //   if (reason === "bad_code") {
  //     self.showAlert("Couldn't find code.\n Try again.", function() {
  //       self.set_name_screen_state = "active";
  //     });
  //   } else if (reason === "game_full") {
  //     self.showAlert("Can't join because\n game is full.", function() {
  //       self.set_name_screen_state = "active";
  //     });
  //   }
  // });

  // Just set the name, or ANON if empty, and move on
}


Game.prototype.multiSetNameKeyDown = function(ev) {
  let self = this;
  let screen = this.screens["multi_set_name"];

  if (this.set_name_screen_state == "active") {
    for (i in lower_array) {
      if (ev.key === lower_array[i] || ev.key === letter_array[i]) {
        this.multiSetNameKey(letter_array[i]);
      }
    }

    if (ev.key === "Backspace" || ev.key === "Delete") {
      this.multiSetNameDelete();
    }

    if (ev.key === "Enter") {
      this.multiSetNameEnter();
    }
  }
}