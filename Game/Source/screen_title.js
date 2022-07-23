

Game.prototype.initializeTitle = function() {  
  var self = this;
  let screen = this.screens["title"];

  this.title_choice = 0;

  this.monitor_overlay.visible = true;

  // let bg = PIXI.Sprite.from(PIXI.Texture.WHITE);
  // bg.width = this.width;
  // bg.height = 960;
  // bg.tint = 0x999999;
  // screen.addChild(bg);

  // let right_flag = new PIXI.Sprite(PIXI.Texture.from("Art/Title/flag_soviet.png"));
  // right_flag.anchor.set(0.5,0.5);
  // right_flag.scale.set(3,3);
  // right_flag.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  // right_flag.position.set(790+192, this.height - 710);
  // screen.addChild(right_flag);

  // let left_flag = new PIXI.Sprite(PIXI.Texture.from("Art/Title/flag_american.png"));
  // left_flag.anchor.set(0.5,0.5);
  // left_flag.scale.set(-3,3);
  // left_flag.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  // left_flag.position.set(485+192, this.height - 710);
  // screen.addChild(left_flag);

  // let brandenburg = new PIXI.Sprite(PIXI.Texture.from("Art/Title/brandenburg.png"));
  // brandenburg.tint = 0x767676;
  // brandenburg.scale.set(6,6);
  // brandenburg.anchor.set(0.5,0.5);
  // brandenburg.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  // brandenburg.position.set(this.width / 2, this.height - 520);
  // screen.addChild(brandenburg);

  // let right_player = new PIXI.Sprite(PIXI.Texture.from("Art/Title/player.png"));
  // right_player.tint = 0x676767;
  // right_player.scale.set(4,4);
  // right_player.anchor.set(0.5,0.5);
  // right_player.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  // right_player.position.set(this.width / 2 + 314, this.height - 192);
  // screen.addChild(right_player);

  // let left_player = new PIXI.Sprite(PIXI.Texture.from("Art/Title/player.png"));
  // left_player.tint = 0x676767;
  // left_player.scale.set(-4,4);
  // left_player.anchor.set(0.5,0.5);
  // left_player.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  // left_player.position.set(this.width / 2 - 314, this.height - 192);
  // screen.addChild(left_player);

  this.soviet_text = new PIXI.Text("", {fontFamily: "Press Start 2P", fontSize: 84, fill: 0xcd0000, letterSpacing: 2, align: "left",
    dropShadow: true, dropShadowColor: 0x440000, dropShadowDistance: 8, dropShadowAngle: Math.PI/4});
  this.soviet_text.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.soviet_text.anchor.set(0.0,0.5);
  this.soviet_text.position.set(574, 264);
  screen.addChild(this.soviet_text);

  this.computer_text = new PIXI.Text("", {fontFamily: "Press Start 2P", fontSize: 84, fill: 0xcd0000, letterSpacing: 2, align: "left",
    dropShadow: true, dropShadowColor: 0x440000, dropShadowDistance: 8, dropShadowAngle: Math.PI/4});
  this.computer_text.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.computer_text.anchor.set(0.0,0.5);
  this.computer_text.position.set(473, 394);
  screen.addChild(this.computer_text);

  this.lab_text = new PIXI.Text("", {fontFamily: "Press Start 2P", fontSize: 84, fill: 0xcd0000, letterSpacing: 2, align: "left",
    dropShadow: true, dropShadowColor: 0x440000, dropShadowDistance: 8, dropShadowAngle: Math.PI/4});
  this.lab_text.scaleMode = PIXI.SCALE_MODES.NEAREST;
  this.lab_text.anchor.set(0.0,0.5);
  this.lab_text.position.set(690, 524);
  screen.addChild(this.lab_text);

  this.title_time = this.markTime() - 5000;

  this.title_choices = new NestedOptionsList({
      "SINGLE": {
        "STORY": {
          "OLD STORY": null,
          "NEW STORY": null,
          "DUMB STORY": null,
          "CUTE STORY": null,
        },
        "ARCADE": function(){console.log("emotional damage!")},
      },
      "MULTI": {
        "QUICK PLAY": function(){console.log("overwhelming emotional damage!")},
        "CREATE GAME": null,
        "JOIN GAME": null,
      },
      "QUIT": function() {
        console.log("Quit doesn't work in browsers.");
        window.close();
      },
    }, 
    function(text) {
      let entry_button = new PIXI.Text(text, {fontFamily: "Press Start 2P", fontSize: 24, fill: 0xFFFFFF, letterSpacing: 2, align: "center"});
      entry_button.scaleMode = PIXI.SCALE_MODES.NEAREST;
      entry_button.anchor.set(0.5,0.5);
      entry_button.interactive = true;
      entry_button.buttonMode = true;
      return entry_button;
    }, 40, 0xFFFFFF, 0xa10000
  );
  this.title_choices.position.set(this.width / 2 - 5, this.height - 280);
  screen.addChild(this.title_choices);
  this.title_choices.visible = false;
    
  // this.title_choices = [
  //   ["SINGLE", "MULTI", "QUIT"],
  //   ["QUICK PLAY", "CREATE GAME", "JOIN GAME"]
  // ]

  // for (let i = 0; i < this.title_choices.length; i++) {
  //   let button_panel
  // }

  // let single_player_button = new PIXI.Text("SINGLE", {fontFamily: "Press Start 2P", fontSize: 24, fill: 0xFFFFFF, letterSpacing: 2, align: "center"});
  // single_player_button.tint = 0xa10000;
  // single_player_button.scaleMode = PIXI.SCALE_MODES.NEAREST;
  // single_player_button.anchor.set(0.5,0.5);
  // single_player_button.position.set(this.width / 2 - 5, this.height - 280);
  // screen.addChild(single_player_button);
  // single_player_button.interactive = true;
  // single_player_button.buttonMode = true;
  // single_player_button.on("pointerdown", function() {
  //   self.soundEffect("button_accept");
  //   self.single_player_button.tint = 0xFFFFFF;
  //   self.multiplayer_button.tint = 0xFFFFFF;
  //   flicker(single_player_button, 500, 0xFFFFFF, 0xa10000);
  //   self.tutorial = false;
  //   if (self.network.uid == null) {
  //     self.network.anonymousSignIn(function() {
  //       self.network.loadGlobalHighScores();
  //     });
  //   } else {
  //     self.network.loadGlobalHighScores();
  //   }
  //   self.initialize1pLobby();
  //   self.switchScreens("title", "1p_lobby");
  // });

  // let multiplayer_button = new PIXI.Text("MULTI", {fontFamily: "Press Start 2P", fontSize: 24, fill: 0xFFFFFF, letterSpacing: 2, align: "center"});
  // multiplayer_button.scaleMode = PIXI.SCALE_MODES.NEAREST;
  // multiplayer_button.anchor.set(0.5,0.5);
  // multiplayer_button.position.set(this.width / 2 - 5, this.height - 240);
  // screen.addChild(multiplayer_button);
  // multiplayer_button.interactive = true;
  // multiplayer_button.buttonMode = true;
  // multiplayer_button.on("pointerdown", function() {
  //   self.soundEffect("button_accept");
  //   self.single_player_button.tint = 0xFFFFFF;
  //   self.multiplayer_button.tint = 0xFFFFFF;
  //   flicker(multiplayer_button, 500, 0xFFFFFF, 0x67d8ef);
  //   self.tutorial = false;
  //   self.initializeMultiLobby();
  //   self.switchScreens("title", "multi_lobby");
  // });


  // single_player_button.visible = false;
  // multiplayer_button.visible = false;
  // this.single_player_button = single_player_button;
  // this.multiplayer_button = multiplayer_button;

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
  let settings_hidden_x = -450;
  let settings_visible_x = 400;
  let settings_y = this.height - 75;

  let gear_button = new PIXI.Sprite(PIXI.Texture.from("Art/Nav/gear_button.png"));
  gear_button.tint = 0x404040;
  gear_button.position.set(settings_visible_x - 65, settings_y);
  gear_button.scale.set(0.5, 0.5);
  screen.addChild(gear_button);

  let settings = false;

  let settings_panel = new PIXI.Container();
  settings_panel.position.set(settings_hidden_x, settings_y);
  screen.addChild(settings_panel);

  let settings_mask = new PIXI.Graphics();
  settings_mask.beginFill(0x000000);
  settings_mask.drawRect(settings_visible_x - 10, settings_y - 100, -1 * settings_hidden_x, settings_y + 100);
  settings_mask.endFill();
  settings_panel.mask = settings_mask;

  gear_button.interactive = true;
  gear_button.buttonMode = true;
  gear_button.on("pointerdown", function() {
    if (settings == false) {
      settings = true;
      var tween = new TWEEN.Tween(settings_panel.position)
        .to({x: settings_visible_x})
        .duration(300)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();
    } else {
      settings = false;
      var tween = new TWEEN.Tween(settings_panel.position)
        .to({x: settings_hidden_x})
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
    localStorage.setItem("soviet_computer_lab_use_music", use_music);
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
    localStorage.setItem("soviet_computer_lab_use_sound", use_sound);
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


Game.prototype.titleKeyDown = function(ev) {
  if (ev.key === "ArrowDown") {
    this.title_choices.moveDown();
  } else if (ev.key === "ArrowUp") {
    this.title_choices.moveUp();
  } else if (ev.key === "Enter") {
    this.title_choices.choose();
  } else if (ev.key === "Escape") {
    this.title_choices.escape();
  }
  // if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
  //     this.soundEffect("switch_option");
  //     this.title_choice = this.title_choice === 0 ? 1 : 0;
  //     if (this.title_choice === 0) {
  //       this.single_player_button.tint = 0xa10000;
  //       this.multiplayer_button.tint = 0xFFFFFF;
  //     } else {
  //       this.single_player_button.tint = 0xFFFFFF;
  //       this.multiplayer_button.tint = 0xa10000;
  //     }
  //   } else if (ev.key === "Enter") {
  //     this.single_player_button.tint = 0xFFFFFF;
  //     this.multiplayer_button.tint = 0xFFFFFF;
  //     if (this.title_choice === 0) {
  //       this.single_player_button._events.pointerdown.fn()
  //     } else {
  //       this.multiplayer_button._events.pointerdown.fn()
  //     }
  //   }
}


Game.prototype.titleUpdate = function(diff) {
  var self = this;
  var screen = this.screens["intro"];

  if (this.timeSince(this.title_time) > 4155) {
    this.title_time = this.markTime();
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
      // self.single_player_button.visible = true;
      // self.multiplayer_button.visible = true;
      self.title_choices.visible = true;
    }, 500);
  }
}