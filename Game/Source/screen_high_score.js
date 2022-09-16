
Game.prototype.initializeHighScore = function(new_score) {
  let self = this;
  let screen = this.screens["high_score"];
  this.clearScreen(screen);

  let background = PIXI.Sprite.from(PIXI.Texture.WHITE);
  background.width = this.width;
  background.height = this.height;
  background.tint = 0x000000;
  screen.addChild(background);

  this.new_high_score = new_score;

  this.high_score_state = "entry";

  this.high_score_palette = this.makeKeyboard({
    player: 1,
    parent: screen, x: this.width / 2, y: this.height * 5/6,
    defense: null, 
    action: function(letter) {

      if (self.high_score_state == "entry") {
        if (letter_array.includes(letter)) {
          self.highScoreKey(letter);
        }

        if (letter === "Backspace") {
          self.highScoreDelete();
        }
    
        if (letter === "Enter") {
          self.highScoreEnter();
        }
      }
    }
  });

  let high_score_label = new PIXI.Text("YOU GOT A HIGH SCORE!", {fontFamily: "Press Start 2P", fontSize: 48, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  high_score_label.anchor.set(0.5,0.5);
  high_score_label.position.set(this.width / 2, 100);
  screen.addChild(high_score_label);

  let score_text = new PIXI.Text(this.new_high_score + " POINTS", {fontFamily: "Press Start 2P", fontSize: 36, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  score_text.anchor.set(0.5,0.5);
  score_text.position.set(this.width / 2, 300);
  screen.addChild(score_text);

  this.high_score_name = [];
  this.high_score_name_cursor = 0;

  for (var i = 0; i < 6; i++) {
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
    this.high_score_name.push(letter);
  }
}


Game.prototype.highScoreKey = function(letter) {
  let self = this;
  if (this.high_score_name_cursor <= 5) {
    this.high_score_name[this.high_score_name_cursor].text = letter;
    this.high_score_name_cursor += 1;
  }
}


Game.prototype.highScoreDelete = function() {
  if (this.high_score_name_cursor > 0) {
    this.high_score_name_cursor -= 1;
    this.high_score_name[this.high_score_name_cursor].text = "";
  }
}


Game.prototype.highScoreEnter = function() {
  var self = this;
  this.high_score_state = "finished";
  let name = "";
  for (var i = 0; i < 6; i++) {
    name += this.high_score_name[i].text;
  }
  this.addHighScore(name, this.new_high_score, function() {
    console.log("Successfully added a high score.");
    self.initialize1pLobby();
    self.updateHighScoreDisplay();
    self.fadeScreens("high_score", "1p_lobby", true, 800);
  }, function() {
    console.log("Failed to add a high score");
    self.showAlert("Oh no! Can't send \nhigh scores to server.", function() {
      self.initialize1pLobby();
      self.updateHighScoreDisplay();
      self.fadeScreens("high_score", "1p_lobby", true, 800);
    });
  })
}



