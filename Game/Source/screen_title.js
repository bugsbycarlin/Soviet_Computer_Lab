

Game.prototype.initializeTitle = function() {  
  var self = this;
  let screen = this.screens["title"];

  this.title_choice = 0;

  let bg = PIXI.Sprite.from(PIXI.Texture.WHITE);
  bg.width = this.width;
  bg.height = 960;
  // bg.tint = 0x313b87;
  // bg.tint = 0xcd0000;
  bg.tint = 0x999999;
  screen.addChild(bg);

  // ! flags
  let right_flag = new PIXI.Sprite(PIXI.Texture.from("Art/Title/flag_soviet.png"));
  right_flag.anchor.set(0.5,0.5);
  right_flag.scale.set(3,3);
  right_flag.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  right_flag.position.set(790+192, this.height - 710);
    // new TWEEN.Tween(right_flag.position)
    //     .to({y: this.height - 710})
    //     .duration(9000)
    //     .easing(TWEEN.Easing.Quadratic.Out)
    //     .start();
  screen.addChild(right_flag);

  let left_flag = new PIXI.Sprite(PIXI.Texture.from("Art/Title/flag_american.png"));
  left_flag.anchor.set(0.5,0.5);
  left_flag.scale.set(-3,3);
  left_flag.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  left_flag.position.set(485+192, this.height - 710);
    // new TWEEN.Tween(left_flag.position)
    //     .to({y: this.height - 710})
    //     .duration(9000)
    //     .easing(TWEEN.Easing.Quadratic.Out)
    //     .start();
  screen.addChild(left_flag);

  // ! brandenburg
  let brandenburg = new PIXI.Sprite(PIXI.Texture.from("Art/Title/brandenburg.png"));
  // brandenburg.tint = 0x212b67;
  // brandenburg.tint = 0xa10000;
  brandenburg.tint = 0x767676;
  brandenburg.scale.set(6,6);
  brandenburg.anchor.set(0.5,0.5);
  brandenburg.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  brandenburg.position.set(this.width / 2, this.height - 520);
  // new TWEEN.Tween(brandenburg.position)
  //       .to({y: this.height - 520})
  //       .duration(9000)
  //       .easing(TWEEN.Easing.Quadratic.Out)
  //       .start();
  screen.addChild(brandenburg);

  // ! players
  let right_player = new PIXI.Sprite(PIXI.Texture.from("Art/Title/player.png"));
  // right_player.tint = 0x111b57;
  // right_player.tint = 0x840000;
  right_player.tint = 0x676767;
  right_player.scale.set(4,4);
  right_player.anchor.set(0.5,0.5);
  right_player.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  right_player.position.set(this.width / 2 + 314, this.height - 192);
  // new TWEEN.Tween(right_player.position)
  //     .to({x: this.width / 2 + 314})
  //     .duration(9000)
  //     .easing(TWEEN.Easing.Quadratic.Out)
  //     .start();
  screen.addChild(right_player);

  let left_player = new PIXI.Sprite(PIXI.Texture.from("Art/Title/player.png"));
  // left_player.tint = 0x111b57;
  // left_player.tint = 0x840000;
  left_player.tint = 0x676767;
  left_player.scale.set(-4,4);
  left_player.anchor.set(0.5,0.5);
  left_player.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  left_player.position.set(this.width / 2 - 314, this.height - 192);
  // new TWEEN.Tween(left_player.position)
  //     .to({x: this.width / 2 - 314})
  //     .duration(9000)
  //     .easing(TWEEN.Easing.Quadratic.Out)
  //     .start();
  screen.addChild(left_player);

  // this.cold_war_text = new PIXI.Text("", {fontFamily: "Press Start 2P", fontSize: 84, fill: 0x0e1744, letterSpacing: 2, align: "left",
  //   dropShadow: true, dropShadowColor: 0x09102f, dropShadowDistance: 8, dropShadowAngle: Math.PI/4});
  // this.cold_war_text.scaleMode = PIXI.SCALE_MODES.NEAREST;
  // this.cold_war_text.anchor.set(0.0,0.5);
  // this.cold_war_text.position.set(294, 364);
  // screen.addChild(this.cold_war_text);

  // this.keyboards_text = new PIXI.Text("", {fontFamily: "Press Start 2P", fontSize: 84, fill: 0x0e1744, letterSpacing: 2, align: "left",
  //   dropShadow: true, dropShadowColor: 0x09102f, dropShadowDistance: 8, dropShadowAngle: Math.PI/4});
  // this.keyboards_text.scaleMode = PIXI.SCALE_MODES.NEAREST;
  // this.keyboards_text.anchor.set(0.0,0.5);
  // this.keyboards_text.position.set(253, 514);
  // screen.addChild(this.keyboards_text);

  this.soviet_text = new PIXI.Text("", {fontFamily: "Press Start 2P", fontSize: 84, fill: 0xcd0000, letterSpacing: 2, align: "left",
    dropShadow: true, dropShadowColor: 0xa10000, dropShadowDistance: 8, dropShadowAngle: Math.PI/4});
  this.soviet_text.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.soviet_text.anchor.set(0.0,0.5);
  this.soviet_text.position.set(574, 264);
  screen.addChild(this.soviet_text);

  this.computer_text = new PIXI.Text("", {fontFamily: "Press Start 2P", fontSize: 84, fill: 0xcd0000, letterSpacing: 2, align: "left",
    dropShadow: true, dropShadowColor: 0xa10000, dropShadowDistance: 8, dropShadowAngle: Math.PI/4});
  this.computer_text.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.computer_text.anchor.set(0.0,0.5);
  this.computer_text.position.set(473, 394);
  screen.addChild(this.computer_text);

  this.lab_text = new PIXI.Text("", {fontFamily: "Press Start 2P", fontSize: 84, fill: 0xcd0000, letterSpacing: 2, align: "left",
    dropShadow: true, dropShadowColor: 0xa10000, dropShadowDistance: 8, dropShadowAngle: Math.PI/4});
  this.lab_text.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.lab_text.anchor.set(0.0,0.5);
  this.lab_text.position.set(690, 524);
  screen.addChild(this.lab_text);

  this.cold_war_time = this.markTime() - 5000;

  let single_player_button = new PIXI.Text("SINGLE", {fontFamily: "Press Start 2P", fontSize: 24, fill: 0xFFFFFF, letterSpacing: 2, align: "center"});
  single_player_button.tint = 0xa10000;
  single_player_button.scaleMode = PIXI.SCALE_MODES.NEAREST;
  single_player_button.anchor.set(0.5,0.5);
  single_player_button.position.set(this.width / 2 - 5, this.height - 280);
  screen.addChild(single_player_button);
  single_player_button.interactive = true;
  single_player_button.buttonMode = true;
  single_player_button.on("pointerdown", function() {
    self.soundEffect("button_accept");
    self.single_player_button.tint = 0xFFFFFF;
    self.multiplayer_button.tint = 0xFFFFFF;
    flicker(single_player_button, 500, 0xFFFFFF, 0xa10000);
    self.tutorial = false;
    if (self.network.uid == null) {
      self.network.anonymousSignIn(function() {
        self.network.loadGlobalHighScores();
      });
    } else {
      self.network.loadGlobalHighScores();
    }
    self.initialize1pLobby();
    self.switchScreens("title", "1p_lobby");
  });

  let multiplayer_button = new PIXI.Text("MULTI (coming soon)", {fontFamily: "Press Start 2P", fontSize: 16, fill: 0xFFFFFF, letterSpacing: 2, align: "center"});
  multiplayer_button.scaleMode = PIXI.SCALE_MODES.NEAREST;
  multiplayer_button.anchor.set(0.5,0.5);
  multiplayer_button.position.set(this.width / 2 - 5, this.height - 240);
  screen.addChild(multiplayer_button);
  multiplayer_button.interactive = true;
  multiplayer_button.buttonMode = true;
  multiplayer_button.on("pointerdown", function() {
    self.showAlert("Sorry! Multiplayer \nNot Yet Available.", function(){});
    console.log("points");
  });


  single_player_button.visible = false;
  multiplayer_button.visible = false;
  this.single_player_button = single_player_button;
  this.multiplayer_button = multiplayer_button;

  // ! black bars
  let top_bar = PIXI.Sprite.from(PIXI.Texture.WHITE);
  top_bar.width = this.width;
  top_bar.height = 80;
  top_bar.tint = 0x000000;
  screen.addChild(top_bar);

  let bottom_bar = PIXI.Sprite.from(PIXI.Texture.WHITE);
  bottom_bar.width = this.width;
  bottom_bar.height = 80;
  bottom_bar.position.set(0,880);
  bottom_bar.tint = 0x000000;
  screen.addChild(bottom_bar);

  // all settings.
  // music on/off, sound on/off, keyboard layout, credits, sign in/out
  let gear_button = new PIXI.Sprite(PIXI.Texture.from("Art/Nav/gear_button.png"));
  gear_button.tint = 0x404040;
  gear_button.position.set(15, this.height - 65);
  gear_button.scale.set(0.5, 0.5);
  screen.addChild(gear_button);

  let settings = false;

  let left_side = -750;

  let settings_panel = new PIXI.Container();
  settings_panel.position.set(left_side, this.height - 65);
  screen.addChild(settings_panel);

  let settings_mask = new PIXI.Graphics();
  settings_mask.beginFill(0x000000);
  settings_mask.drawRect(70, this.height - 200, -1 * left_side, this.height);
  settings_mask.endFill();
  settings_panel.mask = settings_mask;

  gear_button.interactive = true;
  gear_button.buttonMode = true;
  gear_button.on("pointerdown", function() {
    if (settings == false) {
      settings = true;
      var tween = new TWEEN.Tween(settings_panel.position)
        .to({x: 80})
        .duration(300)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();
    } else {
      settings = false;
      var tween = new TWEEN.Tween(settings_panel.position)
        .to({x: left_side})
        .duration(300)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();
    }
  });

  let music_button_container = new PIXI.Container();
  music_button_container.position.set(0, 0);
  music_button_container.scale.set(0.5, 0.5);
  settings_panel.addChild(music_button_container);

  let music_button = new PIXI.Sprite(PIXI.Texture.from("Art/Nav/music_button.png"));
  music_button.tint = 0x404040;
  music_button_container.addChild(music_button);

  let music_button_no_bar = new PIXI.Sprite(PIXI.Texture.from("Art/Nav/no_bar.png"));
  music_button_no_bar.tint = 0x404040;
  music_button_no_bar.visible = !use_music;
  music_button_container.addChild(music_button_no_bar);

  music_button.interactive = true;
  music_button.buttonMode = true;
  music_button.on("pointerdown", function() {
    use_music = !use_music;
    if (use_music == false) {
      self.stopMusic();
    } else {
      self.setMusic("title_song");
    }
    localStorage.setItem("cold_war_keyboards_use_music", use_music);
    music_button_no_bar.visible = !use_music;
  });


  let sound_button_container = new PIXI.Container();
  sound_button_container.position.set(50, 0);
  sound_button_container.scale.set(0.5, 0.5);
  settings_panel.addChild(sound_button_container);

  let sound_button = new PIXI.Sprite(PIXI.Texture.from("Art/Nav/sound_button.png"));
  sound_button.tint = 0x404040;
  sound_button_container.addChild(sound_button);

  let sound_button_no_bar = new PIXI.Sprite(PIXI.Texture.from("Art/Nav/no_bar.png"));
  sound_button_no_bar.tint = 0x404040;
  sound_button_no_bar.visible = !use_sound;
  sound_button_container.addChild(sound_button_no_bar);

  sound_button.interactive = true;
  sound_button.buttonMode = true;
  sound_button.on("pointerdown", function() {
    use_sound = !use_sound;
    localStorage.setItem("cold_war_keyboards_use_sound", use_sound);
    sound_button_no_bar.visible = !use_sound;
  });

  let bar_one = PIXI.Sprite.from(PIXI.Texture.WHITE);
  bar_one.width = 1;
  bar_one.height = 50;
  bar_one.position.set(104,0);
  bar_one.tint = 0x404040;
  settings_panel.addChild(bar_one);

  let keyboard_button_container = new PIXI.Container();
  keyboard_button_container.position.set(122, 0);
  settings_panel.addChild(keyboard_button_container);

  let keyboard_icon = new PIXI.Sprite(PIXI.Texture.from("Art/Nav/keyboard_icon.png"));
  keyboard_icon.scale.set(0.5, 0.5);
  keyboard_icon.anchor.set(0, 0);
  keyboard_icon.tint = 0x404040;
  keyboard_button_container.addChild(keyboard_icon);

  let keyboard_button_text = new PIXI.Text(this.keyboard_mode, {fontFamily: "Press Start 2P", fontSize: 18, fill: 0x404040, letterSpacing: 2, align: "center"});
  keyboard_button_text.scaleMode = PIXI.SCALE_MODES.NEAREST;
  keyboard_button_text.anchor.set(0.0,0);
  keyboard_button_text.position.set(100, 15);
  keyboard_button_container.addChild(keyboard_button_text);

  keyboard_button_container.interactive = true;
  keyboard_button_container.buttonMode = true;
  keyboard_button_container.on("pointerdown", function() {
    self.keyboard_mode = self.keyboard_mode == "QWERTY" ? "DVORAK" : "QWERTY";
    keyboard_button_text.text = self.keyboard_mode;
  });

  let bar_two = PIXI.Sprite.from(PIXI.Texture.WHITE);
  bar_two.width = 1;
  bar_two.height = 50;
  bar_two.position.set(360,0);
  bar_two.tint = 0x404040;
  settings_panel.addChild(bar_two);

  let credits_button = new PIXI.Text("CREDITS", {fontFamily: "Press Start 2P", fontSize: 18, fill: 0x404040, letterSpacing: 2, align: "center"});
  credits_button.scaleMode = PIXI.SCALE_MODES.NEAREST;
  credits_button.anchor.set(0,0);
  credits_button.position.set(380, 15);
  settings_panel.addChild(credits_button);

  credits_button.interactive = true;
  credits_button.buttonMode = true;
  credits_button.on("pointerdown", function() {
    self.initializeCredits();
    self.switchScreens("title", "credits");
  });

  // this.sign_in_button = new PIXI.Text(this.auth_user == null ? "SIGN-IN" : "SIGN-OUT", {fontFamily: "Press Start 2P", fontSize: 18, fill: 0x404040, letterSpacing: 2, align: "center"});
  // this.sign_in_button.scaleMode = PIXI.SCALE_MODES.NEAREST;
  // this.sign_in_button.anchor.set(1,0);
  // this.sign_in_button.position.set(this.width - 140, this.height - 50);
  // screen.addChild(this.sign_in_button);

  // this.sign_in_button.interactive = true;
  // this.sign_in_button.buttonMode = true;
  // this.sign_in_button.on("pointerdown", function() {
  //   if (self.auth_user == null) {
  //     self.network.googleSignIn();
  //   } else {
  //     self.network.signOut();
  //   }
  // });

  // let bar_three = PIXI.Sprite.from(PIXI.Texture.WHITE);
  // bar_three.width = 1;
  // bar_three.height = 50;
  // bar_three.position.set(this.width - 120, this.height - 65);
  // bar_three.tint = 0x404040;
  // screen.addChild(bar_three);

  let quit_button = new PIXI.Text("QUIT", {fontFamily: "Press Start 2P", fontSize: 18, fill: 0x404040, letterSpacing: 2, align: "center"});
  quit_button.scaleMode = PIXI.SCALE_MODES.NEAREST;
  quit_button.anchor.set(0,0);
  quit_button.position.set(this.width - 100, this.height - 50);
  screen.addChild(quit_button);
  quit_button.interactive = true;
  quit_button.buttonMode = true;
  quit_button.on("pointerdown", function() {
    console.log("Quit doesn't work in browsers.")
    // TO DO: close this when it's a real app
    // window.close();
  });

  this.setMusic("title_song");

  // uncomment for trailer purposes
  // gear_button.visible = false;
  // quit_button.visible = false;
  // single_player_button.visible = false;
  // multiplayer_button.visible = false;
}

Game.prototype.titleUpdate = function(diff) {
  var self = this;
  var screen = this.screens["intro"];

  if (this.timeSince(this.cold_war_time) > 4155) {
    this.cold_war_time = this.markTime();
    this.soviet_text.text = "";
    this.computer_text.text = "";
    this.lab_text.text = "";

    let rate = 100;
    for (let i = 1; i <= 6; i++) {
      delay(function() {
        self.soviet_text.text = "SOVIET".slice(0, i);
      }, rate * i);
    }
    for (let i = 1; i <= 8; i++) {
      delay(function() {
        self.computer_text.text = "COMPUTER".slice(0, i);
      }, 6*rate + rate * i);
    }
    for (let i = 1; i <= 3; i++) {
      delay(function() {
        self.lab_text.text = "LAB".slice(0, i);
      }, 14*rate + rate * i);
    }

    // add the buttons
    // comment out for trailer
    delay(function() {
      self.single_player_button.visible = true;
      self.multiplayer_button.visible = true;
    }, 2000);
  }
}