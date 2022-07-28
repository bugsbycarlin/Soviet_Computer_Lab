
Game.prototype.initializeCredits = function() {
  let self = this;
  let screen = this.screens["credits"];
  this.clearScreen(screen);

  let background = PIXI.Sprite.from(PIXI.Texture.WHITE);
  background.width = this.width;
  background.height = this.height;
  background.tint = 0x000000;
  screen.addChild(background);


  let credits_y = 180;


  let derp = new PIXI.Text("DESIGN, ART, PROGRAMMING", {fontFamily: "Press Start 2P", fontSize: 36, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  derp.anchor.set(0.5,0.5);
  derp.position.set(this.width / 2, credits_y);
  screen.addChild(derp);

  let me_thang = new PIXI.Text("MATT CARLIN", {fontFamily: "Press Start 2P", fontSize: 24, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  me_thang.anchor.set(0.5,0.5);
  me_thang.position.set(this.width / 2, credits_y + 40);
  screen.addChild(me_thang);

  let sound_derp = new PIXI.Text("SOUND", {fontFamily: "Press Start 2P", fontSize: 36, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  sound_derp.anchor.set(0.5,0.5);
  sound_derp.position.set(this.width / 2, credits_y + 200);
  screen.addChild(sound_derp);

  let open_thang = new PIXI.Text("FREESOUND.ORG", {fontFamily: "Press Start 2P", fontSize: 18, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  open_thang.anchor.set(0.5,0.5);
  open_thang.position.set(this.width / 2, credits_y + 240);
  screen.addChild(open_thang);

  let splice_thang = new PIXI.Text("SPLICE.COM", {fontFamily: "Press Start 2P", fontSize: 18, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  splice_thang.anchor.set(0.5,0.5);
  splice_thang.position.set(this.width / 2, credits_y + 270);
  screen.addChild(splice_thang);

  let music_derp = new PIXI.Text("MUSIC", {fontFamily: "Press Start 2P", fontSize: 36, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  music_derp.anchor.set(0.5,0.5);
  music_derp.position.set(this.width / 2, credits_y + 400);
  screen.addChild(music_derp);

  let fes_thang = new PIXI.Text("FESLIYAN STUDIOS \n(DAVID FESLYIYAN AND DAVID RENDA)", {fontFamily: "Press Start 2P", fontSize: 18, fill: 0xFFFFFF, letterSpacing: 6, align: "center"});
  fes_thang.anchor.set(0.5,0.5);
  fes_thang.position.set(this.width / 2, credits_y + 450);
  screen.addChild(fes_thang);

  let oga_thang = new PIXI.Text("OPENGAMEART.ORG \n(SPRING AND NENE)", {fontFamily: "Press Start 2P", fontSize: 18, fill: 0xFFFFFF, letterSpacing: 6, align: "center"});
  oga_thang.anchor.set(0.5,0.5);
  oga_thang.position.set(this.width / 2, credits_y + 520);
  screen.addChild(oga_thang);

  let abstraction_thang = new PIXI.Text("ABSTRACTIONMUSIC.COM \n(LUDUM DARE 28, TRACKS 3 and 8)", {fontFamily: "Press Start 2P", fontSize: 18, fill: 0xFFFFFF, letterSpacing: 6, align: "center"});
  abstraction_thang.anchor.set(0.5,0.5);
  abstraction_thang.position.set(this.width / 2, credits_y + 590);
  screen.addChild(abstraction_thang);


  var left_shark = new PIXI.Sprite(PIXI.Texture.from("Art/rocket_american.png"));
  // left_shark.anchor.set(0.5, 0.5);
  left_shark.position.set(300, this.height / 2);
  left_shark.angle = -20;
  left_shark.scale.set(2, 2);
  left_shark.scaleMode = PIXI.SCALE_MODES.NEAREST;
  left_shark.anchor.set(0.5, 0.5);
  screen.addChild(left_shark);
  this.left_shark_tween = new TWEEN.Tween(left_shark)
    .to({angle: 20})
    .repeat(Infinity)
    .yoyo(true)
    .duration(500)
    .easing(TWEEN.Easing.Quartic.InOut)
    .start()


  var right_shark = new PIXI.Sprite(PIXI.Texture.from("Art/rocket_soviet.png"));
  right_shark.position.set(this.width - 300, this.height / 2);
  right_shark.anchor.set(0.5, 0.5);
  right_shark.scale.set(2, 2);
  right_shark.scaleMode = PIXI.SCALE_MODES.NEAREST;
  screen.addChild(right_shark);
  this.right_shark_tween = new TWEEN.Tween(right_shark)
    .to({angle: 359})
    .repeat(Infinity)
    .duration(2000)
    .start()


  let back_button = new PIXI.Text("OK, WHATEVS", {fontFamily: "Press Start 2P", fontSize: 15, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  back_button.anchor.set(0.5,0.5);
  back_button.position.set(this.width/2, credits_y + 700);
  screen.addChild(back_button);
  back_button.interactive = true;
  back_button.buttonMode = true;
  back_button.on("pointertap", function() {
    self.creditsBackToTitle();
  });
}


Game.prototype.creditsKeyDown = function(ev) {
  if (ev.key === "Escape") {
    this.creditsBackToTitle();
  }
}


Game.prototype.creditsBackToTitle = function() {
  this.left_shark_tween.stop();
  this.right_shark_tween.stop();
  this.initializeTitle();
  this.switchScreens("credits", "title");
  this.title_screen = "active";
}


