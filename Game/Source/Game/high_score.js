//
// This file contains the High Score screen.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//


class HighScore extends Screen {
  constructor() {
    super();

    this.new_high_score = game.score;
    this.high_score_value.text = this.new_high_score + " POINTS";
  }

  initialize() {
    makeBlank(this, game.width, game.height, 0, 0, 0x000000);

    this.state = "entry";

    game.monitor_overlay.restore();

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
    this.high_score_value = makeText("", {fontFamily: "Press Start 2P", fontSize: 36, fill: 0xFFFFFF, letterSpacing: 6, align: "left"},
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
      for (i in lower_array) {
        if (ev.key === lower_array[i] || ev.key === letter_array[i]) {
          this.key(letter_array[i]);
        }
      }

      if (ev.key === "Backspace" || ev.key === "Delete") {
        this.hsDelete();
      }

      if (ev.key === "Enter") {
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
      game.addHighScore(name, this.new_high_score, () => {
        console.log("Successfully added a high score.");
        game.createScreen("lobby");
        game.switchScreens("high_score", "lobby");
        //game.updateHighScoreDisplay();
      }, function() {
        console.log("Failed to add a high score");
        game.showAlert("Oh no! Can't send \nhigh scores to server.", () => {
          game.createScreen("lobby");
          game.switchScreens("high_score", "lobby");
          //game.updateHighScoreDisplay();
        });
      })
    }
  }


  update() {

  }
}






