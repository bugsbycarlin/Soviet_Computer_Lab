//
// This file contains the High Score screen.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//


class HighScore extends PIXI.Container {
  constructor(new_score) {
    super();
    this.new_high_score = new_score;
    this.initialize();
  }


  clear() {
    while(this.children[0]) {
      let x = this.removeChild(this.children[0]);
      x.destroy();
    }
  }


  initialize() {
    let background = PIXI.Sprite.from(PIXI.Texture.WHITE);
    background.width = game.width;
    background.height = game.height;
    background.tint = 0x000000;
    this.addChild(background);

    this.state = "entry";

    game.monitor_overlay.restore();

    this.high_score_palette = game.makeKeyboard({
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

    let score_label = new PIXI.Text("YOU GOT A HIGH SCORE!", {fontFamily: "Press Start 2P", fontSize: 48, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
    score_label.anchor.set(0.5,0.5);
    score_label.position.set(game.width / 2, 100);
    this.addChild(score_label);

    let score_text = new PIXI.Text(this.new_high_score + " POINTS", {fontFamily: "Press Start 2P", fontSize: 36, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
    score_text.anchor.set(0.5,0.5);
    score_text.position.set(game.width / 2, 300);
    this.addChild(score_text);

    this.name = [];
    this.name_cursor = 0;

    for (var i = 0; i < 6; i++) {
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






