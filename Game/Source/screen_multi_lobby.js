

Game.prototype.initializeMultiLobby = function() {
  let self = this;
  let screen = this.screens["multi_lobby"];
  this.clearScreen(screen);

  this.lobby_sections = {};

  let background = PIXI.Sprite.from(PIXI.Texture.WHITE);
  background.anchor.set(0, 0);
  background.width = this.width;
  background.height = this.height;
  background.tint = 0x1d2120;
  screen.addChild(background);

  for (let i = 0; i < 4; i++) {
    let empty_profile = new PIXI.Sprite(PIXI.Texture.from("Art/dashed_rounded_box.png"));
    empty_profile.anchor.set(0, 0);
    empty_profile.position.set(this.height / 25, (1 + 6 * i) * this.height / 25);
    screen.addChild(empty_profile);
  }

  // Create a test game.
  // this.network.createNewGame("quick_open", function() {
  //   console.log("I did the network call successfully.")
  // }, function() {
  //   console.log("Error with network call.")
  // })
  this.network.joinGame("JJHHA", function() {
    console.log("YAS QWEEN");
  }, function() {
    console.log("NO QUEEN?");
  })
}