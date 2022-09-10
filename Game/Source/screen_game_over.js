
Game.prototype.initializeGameOver = function() {
  let self = this;
  let screen = this.screens["game_over"];
  this.clearScreen(screen);

  let background = PIXI.Sprite.from(PIXI.Texture.WHITE);
  background.width = this.width;
  background.height = this.height;
  background.tint = 0x000000;
  screen.addChild(background);


  let game_over_label = new PIXI.Text("GAME OVER!", {fontFamily: "Press Start 2P", fontSize: 48, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  game_over_label.anchor.set(0.5,0.5);
  game_over_label.position.set(this.width / 2, 180);
  screen.addChild(game_over_label);

  // TO DO
  // game over characters


  let enter_to_continue_label = new PIXI.Text("PRESS ENTER TO CONTINUE", {fontFamily: "Press Start 2P", fontSize: 24, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  enter_to_continue_label.anchor.set(0.5,0.5);
  enter_to_continue_label.position.set(this.width / 2, 760);
  screen.addChild(enter_to_continue_label);


  let escape_to_start_over = new PIXI.Text("PRESS ESCAPE TO START OVER", {fontFamily: "Press Start 2P", fontSize: 24, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  escape_to_start_over.anchor.set(0.5,0.5);
  escape_to_start_over.position.set(this.width / 2, 800);
  screen.addChild(escape_to_start_over);
}



Game.prototype.gameOverEnter = function() {
  var self = this;

  soundEffect("button_accept");
  this.returnToLastCutscene();
}


Game.prototype.gameOverEscape = function() {
  var self = this;
  this.gameOverScreen(500, true);
}



