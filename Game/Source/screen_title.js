

Game.prototype.initializeTitle = function() {  
  var self = this;
  let screen = this.screens["title"];

  setMusic("title_song");

  this.monitor_overlay.visible = true;

  this.title_state = "active";

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
      "SINGLE": function(){
        self.switchFromTitleTo1pLobby();
      },
      "MULTI": {
        "QUICK PLAY": function(){},
        "CREATE GAME": function(){self.titleCreateGame("create")},
        "JOIN GAME": function(){self.switchFromTitleToMultiSetName("multi_set_name")},
      },
      "SETTINGS": function() {

      },
      "CREDITS": function() {
        self.switchFromTitleToCredits();
      },
      "QUIT": function() {
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

  this.updateSettingsMenu();

  this.title_choices.position.set(this.width / 2 - 5, this.height - 280);
  screen.addChild(this.title_choices);
  this.title_choices.visible = false;

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
}


Game.prototype.updateSettingsMenu = function() {
  let self = this;
  u_m = use_music ? "MUSIC: YES" : "MUSIC: NO";
  u_s = use_sound ? "SOUND: YES" : "SOUND: NO";
  this.title_choices.choice_list["SETTINGS"] = {};
  this.title_choices.choice_list["SETTINGS"][u_m] = function() {
    use_music = !use_music;
    if (use_music == false) {
      stopMusic();
    } else {
      setMusic("title_song");
    }
    localStorage.setItem("soviet_computer_lab_use_music", use_music);
    self.updateSettingsMenu();
  };
  this.title_choices.choice_list["SETTINGS"][u_s] = function() {
    use_sound = !use_sound;
    localStorage.setItem("soviet_computer_lab_use_sound", use_sound);
    self.updateSettingsMenu();
  };
  this.title_choices.renderList();
}


Game.prototype.titleCreateGame = function() {
  let self = this;
  this.title_state = "creating";
  this.network.createNewGame("quick_closed", function() {
      self.switchFromTitleToMultiSetName("multi_lobby");
    }, function() {
      console.log("Error with network call.");
      self.showAlert("Couldn't make game.\n Please try later.", function() {
        self.title_state = "active";
      });
    });
}


Game.prototype.switchFromTitleToCredits = function() {
  this.title_state = "transitioning";
  this.initializeCredits();
  this.switchScreens("title", "credits");
}


Game.prototype.switchFromTitleTo1pLobby = function() {
  let self = this;
  if (this.network.uid == null) {
    this.network.anonymousSignIn(function() {
      self.network.loadGlobalHighScores();
    });
  } else {
    this.network.loadGlobalHighScores();
  }
  this.initialize1pLobby();
  this.switchScreens("title", "1p_lobby");
}


// Game.prototype.switchFromTitleToMultiLobby = function(multi_type) {
//   this.title_state = "transitioning";
//   this.multi_type = multi_type;
//   this.initializeMultiLobby();
//   this.switchScreens("title", "multi_lobby");
// }


Game.prototype.switchFromTitleToMultiSetName = function(next_screen) {
  this.title_state = "transitioning";
  this.initializeMultiSetName(next_screen);
  this.switchScreens("title", "multi_set_name");
}


Game.prototype.titleKeyDown = function(ev) {
  if (this.title_state == "active") {
    if (ev.key === "ArrowDown") {
      this.title_choices.moveDown();
    } else if (ev.key === "ArrowUp") {
      this.title_choices.moveUp();
    } else if (ev.key === "Enter") {
      this.title_choices.choose();
    } else if (ev.key === "Escape") {
      this.title_choices.escape();
    }
  }
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

    // show the title menu
    delay(function() {
      self.title_choices.visible = true;
    }, 500);
  }
}