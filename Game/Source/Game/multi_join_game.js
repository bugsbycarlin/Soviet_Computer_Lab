//
// This file contains the multiplayer join game screen.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//

class MultiJoinGame extends Screen {
  initialize() {
    this.state = "active";

    let background = PIXI.Sprite.from(PIXI.Texture.WHITE);
    background.anchor.set(0, 0);
    background.width = game.width;
    background.height = game.height;
    background.tint = 0x1d2120;
    this.addChild(background);


    let game_code_text = new PIXI.Text("ENTER GAME CODE", {fontFamily: "Press Start 2P", fontSize: 32, fill: 0xFFFFFF, letterSpacing: 2, align: "center"});
    game_code_text.scaleMode = PIXI.SCALE_MODES.NEAREST;
    game_code_text.anchor.set(0.5,0.5);
    game_code_text.position.set(game.width/2, 300);
    this.addChild(game_code_text);

    this.proposed_join_code = [];
    this.join_code_entry_cursor = 0;

    for (var i = 0; i < 5; i++) {
      var cursor = PIXI.Sprite.from(PIXI.Texture.WHITE);
      cursor.width = 70 - 3;
      cursor.height = 2;
      cursor.anchor.set(0, 0.5);
      cursor.position.set(game.width / 2 + 70 * (i - 3), game.height * 8/16);
      cursor.tint = 0x3cb0f3;
      cursor.alpha = (12 - i) / (12 + 4);
      this.addChild(cursor);

      let letter = new PIXI.Text("", {fontFamily: "Press Start 2P", fontSize: 60, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
      letter.anchor.set(0.5, 0.5);
      letter.position.set(game.width / 2 + 70 * (i - 3) + 35, game.height * 8/16 - 40);
      this.addChild(letter);
      this.proposed_join_code.push(letter);
    }
  }


  switchToMultiLobby() {
    this.state = "transitioning";
    this.createScreen("multi_lobby");
    this.switchScreens("multi_join_game", "multi_lobby");
  }


  addLetter(letter) {
    if (this.join_code_entry_cursor < 5) {
      this.proposed_join_code[this.join_code_entry_cursor].text = letter;
      this.join_code_entry_cursor += 1;
    }
  }


  deleteLetter() {
    if (this.join_code_entry_cursor > 0) {
      this.join_code_entry_cursor -= 1;
      this.proposed_join_code[this.join_code_entry_cursor].text = "";
    }
  }


  enter() {
    this.state = "trying_code";
    let proposed_join_code = "";
    for (var i = 0; i < 5; i++) {
      proposed_join_code += this.proposed_join_code[i].text;
    }

    game.network.joinGame(proposed_join_code, () => {
      this.switchToMultiLobby();
    }, (reason) => {
      if (reason === "bad_code") {
        this.showAlert("Couldn't find code.\n Try again.", () => {
          this.state = "active";
        });
      } else if (reason === "game_full") {
        this.showAlert("Can't join because\n game is full.", () => {
          this.state = "active";
        });
      }
    });
  }


  keyDown(ev) {
    if (this.state == "active") {
      for (i in lower_array) {
        if (ev.key === lower_array[i] || ev.key === letter_array[i]) {
          this.addLetter(letter_array[i]);
        }
      }

      if (ev.key === "Backspace" || ev.key === "Delete") {
        this.deleteLetter();
      }

      if (ev.key === "Enter") {
        this.enter();
      }
    }
  }
}