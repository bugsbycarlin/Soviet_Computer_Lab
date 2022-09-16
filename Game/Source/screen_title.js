
class Title extends PIXI.Container {
  constructor() {
    super();
    this.initialize();

    // setMusic("title_song")
  }


  clear() {
    while(this.children[0]) {
      let x = this.removeChild(this.children[0]);
      x.destroy();
    }
  }


  initialize() {
    let self = this;

    this.state = "active";

    this.soviet_text = new PIXI.Text("", {fontFamily: "Press Start 2P", fontSize: 84, fill: 0xcd0000, letterSpacing: 2, align: "left",
      dropShadow: true, dropShadowColor: 0x440000, dropShadowDistance: 8, dropShadowAngle: Math.PI/4});
    this.soviet_text.scaleMode = PIXI.SCALE_MODES.NEAREST;
    this.soviet_text.anchor.set(0.0,0.5);
    this.soviet_text.position.set(574, 264);
    this.addChild(this.soviet_text);

    this.computer_text = new PIXI.Text("", {fontFamily: "Press Start 2P", fontSize: 84, fill: 0xcd0000, letterSpacing: 2, align: "left",
      dropShadow: true, dropShadowColor: 0x440000, dropShadowDistance: 8, dropShadowAngle: Math.PI/4});
    this.computer_text.scaleMode = PIXI.SCALE_MODES.NEAREST;
    this.computer_text.anchor.set(0.0,0.5);
    this.computer_text.position.set(473, 394);
    this.addChild(this.computer_text);

    this.lab_text = new PIXI.Text("", {fontFamily: "Press Start 2P", fontSize: 84, fill: 0xcd0000, letterSpacing: 2, align: "left",
      dropShadow: true, dropShadowColor: 0x440000, dropShadowDistance: 8, dropShadowAngle: Math.PI/4});
    this.lab_text.scaleMode = PIXI.SCALE_MODES.NEAREST;
    this.lab_text.anchor.set(0.0,0.5);
    this.lab_text.position.set(690, 524);
    this.addChild(this.lab_text);

    this.choices = new NestedOptionsList({
        "SINGLE": function(){
          self.switchFromTitleToLobby();
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
      },
      function() {}, 40, 0xFFFFFF, 0xa10000
    );

    this.choices.position.set(game.width / 2 - 5, game.height - 280);
    this.addChild(this.choices);
    this.choices.visible = false;

    this.start_time = markTime() - 5000;
  }


  switchFromTitleToLobby() {
    let self = this;
    this.state = "switching";
    game.createScreen("lobby");
    game.switchScreens("title", "lobby");
    // if (game.network.uid == null) {
    //   game.network.anonymousSignIn(function() {
    //     game.network.loadGlobalHighScores();
    //   });
    // } else {
    //   game.network.loadGlobalHighScores();
    // }
    // this.state = "switching";
    // this.initialize1pLobby();
    // this.switchScreens("title", "lobby");
  }


  keyDown(ev) {
    if (this.state == "active") {
      if (ev.key === "ArrowDown") {
        this.choices.moveDown();
      } else if (ev.key === "ArrowUp") {
        this.choices.moveUp();
      } else if (ev.key === "Enter") {
        this.choices.choose();
      } else if (ev.key === "Escape") {
        this.choices.escape();
      }
    }
  }


  update(diff) {
    let self = this;

    if (timeSince(this.start_time) > 4155) {
      this.start_time = markTime();
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
        self.choices.visible = true;
      }, 500);
    }
  }
}


// Game.prototype.initializeTitle = function() {  
//   var self = this;
//   let screen = this.screens["title"];

//   // setMusic("title_song");

//   this.monitor_overlay.visible = true;

//   this.title_state = "active";

//   this.soviet_text = new PIXI.Text("", {fontFamily: "Press Start 2P", fontSize: 84, fill: 0xcd0000, letterSpacing: 2, align: "left",
//     dropShadow: true, dropShadowColor: 0x440000, dropShadowDistance: 8, dropShadowAngle: Math.PI/4});
//   this.soviet_text.scaleMode = PIXI.SCALE_MODES.NEAREST;
//   this.soviet_text.anchor.set(0.0,0.5);
//   this.soviet_text.position.set(574, 264);
//   screen.addChild(this.soviet_text);

//   this.computer_text = new PIXI.Text("", {fontFamily: "Press Start 2P", fontSize: 84, fill: 0xcd0000, letterSpacing: 2, align: "left",
//     dropShadow: true, dropShadowColor: 0x440000, dropShadowDistance: 8, dropShadowAngle: Math.PI/4});
//   this.computer_text.scaleMode = PIXI.SCALE_MODES.NEAREST;
//   this.computer_text.anchor.set(0.0,0.5);
//   this.computer_text.position.set(473, 394);
//   screen.addChild(this.computer_text);

//   this.lab_text = new PIXI.Text("", {fontFamily: "Press Start 2P", fontSize: 84, fill: 0xcd0000, letterSpacing: 2, align: "left",
//     dropShadow: true, dropShadowColor: 0x440000, dropShadowDistance: 8, dropShadowAngle: Math.PI/4});
//   this.lab_text.scaleMode = PIXI.SCALE_MODES.NEAREST;
//   this.lab_text.anchor.set(0.0,0.5);
//   this.lab_text.position.set(690, 524);
//   screen.addChild(this.lab_text);

//   this.title_time = this.markTime() - 5000;

//   this.title_choices = new NestedOptionsList({
//       "SINGLE": function(){
//         self.switchFromTitleTo1pLobby();
//       },
//       "MULTI": {
//         "QUICK PLAY": function(){},
//         "CREATE GAME": function(){self.titleCreateGame("create")},
//         "JOIN GAME": function(){self.switchFromTitleToMultiSetName("multi_set_name")},
//       },
//       "SETTINGS": function() {

//       },
//       "CREDITS": function() {
//         self.switchFromTitleToCredits();
//       },
//       "QUIT": function() {
//         window.close();
//       },
//     }, 
//     function(text) {
//       let entry_button = new PIXI.Text(text, {fontFamily: "Press Start 2P", fontSize: 24, fill: 0xFFFFFF, letterSpacing: 2, align: "center"});
//       entry_button.scaleMode = PIXI.SCALE_MODES.NEAREST;
//       entry_button.anchor.set(0.5,0.5);
//       entry_button.interactive = true;
//       entry_button.buttonMode = true;
//       return entry_button;
//     },
//     function() {}, 40, 0xFFFFFF, 0xa10000
//   );

//   this.updateSettingsMenu();

//   this.title_choices.position.set(this.width / 2 - 5, this.height - 280);
//   screen.addChild(this.title_choices);
//   this.title_choices.visible = false;

//   // ! black bars
//   let top_bar = PIXI.Sprite.from(PIXI.Texture.WHITE);
//   top_bar.width = this.width;
//   top_bar.height = 80;
//   top_bar.tint = 0x000000;
//   screen.addChild(top_bar);

//   let bottom_bar = PIXI.Sprite.from(PIXI.Texture.WHITE);
//   bottom_bar.width = this.width;
//   bottom_bar.height = 80;
//   bottom_bar.position.set(0,880);
//   bottom_bar.tint = 0x000000;
//   screen.addChild(bottom_bar);
// }


// Game.prototype.updateSettingsMenu = function() {
//   let self = this;
//   u_m = use_music ? "MUSIC: YES" : "MUSIC: NO";
//   u_s = use_sound ? "SOUND: YES" : "SOUND: NO";
//   this.title_choices.choice_list["SETTINGS"] = {};
//   this.title_choices.choice_list["SETTINGS"][u_m] = function() {
//     use_music = !use_music;
//     if (use_music == false) {
//       stopMusic();
//     } else {
//       // setMusic("title_song");
//     }
//     localStorage.setItem("soviet_computer_lab_use_music", use_music);
//     self.updateSettingsMenu();
//   };
//   this.title_choices.choice_list["SETTINGS"][u_s] = function() {
//     use_sound = !use_sound;
//     localStorage.setItem("soviet_computer_lab_use_sound", use_sound);
//     self.updateSettingsMenu();
//   };
//   this.title_choices.renderList();
// }


// Game.prototype.titleCreateGame = function() {
//   let self = this;
//   this.title_state = "creating";
//   this.network.createNewGame("quick_closed", function() {
//       self.switchFromTitleToMultiSetName("multi_lobby");
//     }, function() {
//       console.log("Error with network call.");
//       self.showAlert("Couldn't make game.\n Please try later.", function() {
//         self.title_state = "active";
//       });
//     });
// }


// Game.prototype.switchFromTitleToCredits = function() {
//   this.title_state = "transitioning";
//   this.initializeCredits();
//   this.switchScreens("title", "credits");
// }


// Game.prototype.switchFromTitleTo1pLobby = function() {
//   let self = this;
//   if (this.network.uid == null) {
//     this.network.anonymousSignIn(function() {
//       self.network.loadGlobalHighScores();
//     });
//   } else {
//     this.network.loadGlobalHighScores();
//   }
//   this.initialize1pLobby();
//   this.switchScreens("title", "1p_lobby");
// }


// // Game.prototype.switchFromTitleToMultiLobby = function(multi_type) {
// //   this.title_state = "transitioning";
// //   this.multi_type = multi_type;
// //   this.initializeMultiLobby();
// //   this.switchScreens("title", "multi_lobby");
// // }


// Game.prototype.switchFromTitleToMultiSetName = function(next_screen) {
//   this.title_state = "transitioning";
//   this.initializeMultiSetName(next_screen);
//   this.switchScreens("title", "multi_set_name");
// }


// Game.prototype.titleKeyDown = function(ev) {
//   if (this.title_state == "active") {
//     if (ev.key === "ArrowDown") {
//       this.title_choices.moveDown();
//     } else if (ev.key === "ArrowUp") {
//       this.title_choices.moveUp();
//     } else if (ev.key === "Enter") {
//       this.title_choices.choose();
//     } else if (ev.key === "Escape") {
//       this.title_choices.escape();
//     }
//   }
// }


// Game.prototype.titleUpdate = function(diff) {
//   var self = this;
//   var screen = this.screens["intro"];

//   if (this.timeSince(this.title_time) > 4155) {
//     this.title_time = this.markTime();
//     this.soviet_text.text = "";
//     this.computer_text.text = "";
//     this.lab_text.text = "";

//     let rate = 100;
//     for (let i = 1; i <= 6; i++) {
//       delay(function() {
//         self.soviet_text.text = "SOVIET".slice(0, i);
//       }, rate * i);
//     }
//     for (let i = 1; i <= 8; i++) {
//       delay(function() {
//         self.computer_text.text = "COMPUTER".slice(0, i);
//       }, 6*rate + rate * i);
//     }
//     for (let i = 1; i <= 3; i++) {
//       delay(function() {
//         self.lab_text.text = "LAB".slice(0, i);
//       }, 14*rate + rate * i);
//     }

//     // show the title menu
//     delay(function() {
//       self.title_choices.visible = true;
//     }, 500);
//   }
// }