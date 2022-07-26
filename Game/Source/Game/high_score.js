//
// This file contains the High Score screen.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//


class HighScore extends Screen {
  initialize(extra_param = null) {
    makeBlank(this, game.width, game.height, 0, 0, 0x000000);

    this.state = "entry";

    this.new_high_score = extra_param != null ? extra_param : game.score;

    // game.monitor_overlay.restore();

    this.high_score_palette = makeKeyboard({
      player: 1,
      parent: this, x: game.width / 2, y: game.height * 5/6 - 40,
      defense: null, 
      action: (letter) => {

        console.log("aha");
        if (this.state == "entry") {
          if (letter_array.includes(letter)) {
            this.key(letter);
          }

          if (letter === "Backspace") {
            this.hsDelete();
          }
      
          if (letter === "Enter") {
            this.enter();
          }
        }
      }
    });

    makeText("YOU GOT A HIGH SCORE!", {fontFamily: "Press Start 2P", fontSize: 48, fill: 0xFFFFFF, letterSpacing: 6, align: "left"},
      this, game.width / 2, 100, 0.5, 0.5);
    this.high_score_value = makeText(this.new_high_score + " POINTS", {fontFamily: "Press Start 2P", fontSize: 36, fill: 0xFFFFFF, letterSpacing: 6, align: "left"},
      this, game.width / 2, 300, 0.5, 0.5);


    this.name = [];
    this.name_cursor = 0;

    for (var i = 0; i < 6; i++) {
      let cursor = makeBlank(this, 67, 2, game.width / 2 + 70 * (i - 3), game.height * 8/16);
      cursor.anchor.set(0, 0.5);
      cursor.tint = 0x3cb0f3;
      cursor.alpha = (12 - i) / (12 + 4);

      let letter = makeText("", {fontFamily: "Press Start 2P", fontSize: 60, fill: 0xFFFFFF, letterSpacing: 6, align: "left"},
        this, game.width / 2 + 70 * (i - 3) + 35, game.height * 8/16 - 40, 0.5, 0.5);
      this.name.push(letter);
    }
  }

  keyDown(ev) {
    if (this.state === "entry") {
      let key = ev.key;
      keySound(key);

      for (i in lower_array) {
        if (key === lower_array[i] || key === letter_array[i]) {
          this.key(letter_array[i]);
        }
      }

      if (key === "Backspace" || key === "Delete") {
        this.hsDelete();
      }

      if (key === "Enter") {
        this.enter();
      }
    }
  }


  key(letter) {
    if (this.name_cursor <= 5) {
      this.name[this.name_cursor].text = letter;
      this.name_cursor += 1;
    }
  }


  hsDelete() {
    if (this.name_cursor > 0) {
      this.name_cursor -= 1;
      this.name[this.name_cursor].text = "";
    }
  }


  enter() {
    this.state = "finished";
    let name = "";
    for (var i = 0; i < 6; i++) {
      name += this.name[i].text;
    }
    if (name.length > 0) {
      game.addHighScore(name, this.new_high_score,
      () => {
        console.log("Successfully added a high score.");
        this.gotoLobby();
      },
      () => {
        console.log("Failed to add a high score");
        //game.showAlert("Oh no! Can't send \nhigh scores to server.", () => {
        this.gotoLobby();
        //});
      })
    }
  }


  gotoLobby() {
    game.score = 0;
    game.createScreen("lobby");
    game.switchScreens("high_score", "lobby");
  }


  update() {

  }
}






