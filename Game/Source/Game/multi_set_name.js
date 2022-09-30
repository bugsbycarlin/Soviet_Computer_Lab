//
// This file contains the name choosing screen for multiplayer.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//

class MultiSetName extends Screen {
  initialize() {
    this.state = "active";

    let background = makeBlank(this, game.width, game.height, 0, 0, 0x1d2120);

    let font_32 = {fontFamily: "Press Start 2P", fontSize: 32, fill: 0xFFFFFF, letterSpacing: 2, align: "center"};
    let font_60 = {fontFamily: "Press Start 2P", fontSize: 60, fill: 0xFFFFFF, letterSpacing: 6, align: "left"};

    let game_code_text = makeText("CHOOSE YOUR NAME", font_32, this, game.width/2, 300, 0.5, 0.5);

    this.proposed_name = [];
    this.name_entry_cursor = 0;

    for (var i = 0; i < 8; i++) {
      var cursor = makeBlank(this, 67, 2, game.width / 2 + 70 * (i - 3), game.height * 8/16, 0x3cb0f3, 0, 0.5);
      cursor.alpha = (12 - i) / (12 + 4);

      let letter = makeText("", font_60, this, game.width / 2 + 70 * (i - 4) + 35, game.height * 8/16 - 40, 0.5, 0.5);
      this.proposed_name.push(letter);
    }
  }


  switchToNextScreen() {
    this.state = "transitioning";
    this.createScreen(this.next_screen);
    this.switchScreens("multi_set_name", this.next_screen);
  }


  addLetter(letter) {
    if (this.state != "active") return;
    if (this.name_entry_cursor < 8) {
      this.proposed_name[this.name_entry_cursor].text = letter;
      this.name_entry_cursor += 1;
    }
  }


  deleteLetter() {
    if (this.state != "active") return;
    if (this.name_entry_cursor > 0) {
      this.name_entry_cursor -= 1;
      this.proposed_name[this.name_entry_cursor].text = "";
    }
  }


  enter() {
    this.state = "trying_code";
    let proposed_name = "";
    for (var i = 0; i < 5; i++) {
      proposed_name += this.proposed_name[i].text;
    }

    game.network.SetName(proposed_name, () => {
      this.switchToNextScreen();
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

    // Just set the name, or ANON if empty, and move on
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