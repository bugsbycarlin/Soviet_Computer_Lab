//
// This file contains the Title screen.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//


class Title extends Screen {
  initialize(extra_param = null) {
    if (use_music) setMusic("title_song")

    // makeSprite("Art/Title/lab_screen_tester_with_stock_photo.png", this, 0, 0, 0, 0);
    this.tvs = makeAnimatedSprite("Art/Big_Animations/soviet_tvs_unlicensed.json", "tvs", this, game.width/2 + 30, game.height + 40, 0.5, 1);
    this.tvs.scale.set(6, 6);
    this.tvs.animationSpeed = 0.34;
    this.tvs.loop = false;

    let post_animation_delay = 4800;
    if (extra_param == null) {
      game.fadeFromBlack(800);
      delay(() => {
        this.tvs.play();
      }, 800); 
    } else {
      this.tvs.gotoAndStop(143);
      post_animation_delay = 0;
    }

    this.state = "pre_game";

    let font = {fontFamily: "Press Start 2P", fontSize: 40, fill: 0xfcba03, letterSpacing: 2, align: "left",
      dropShadow: true, dropShadowColor: 0xdc9a03, dropShadowDistance: 4, dropShadowAngle: Math.PI/4};

    delay(() => {

      this.soviet_text = makeText("", font, this, 726, 524, 0, 0.5);
      this.computer_text = makeText("", font, this, 684, 584, 0, 0.5);
      this.lab_text = makeText("", font, this, 790, 644, 0, 0.5);

      this.choices = new NestedOptionsList({
          "SINGLE": () => {
            this.switchFromTitleTo("lobby");
          },
          "MULTI": {
            "QUICK PLAY": () => {},
            "CREATE GAME": () => {this.titleCreateGame("create")},
            "JOIN GAME": () => {this.switchFromTitleToMultiSetName("multi_lobby")},
          },
          "SETTINGS": {
            "MUSIC ON": () => {
              use_music = !use_music
              localStorage.setItem("soviet_computer_lab_use_music", use_music);
              if (use_music) {
                this.choices.rename(["SETTINGS", "MUSIC OFF"], "MUSIC ON")
                setMusic("title_song");
              } else {
                this.choices.rename(["SETTINGS", "MUSIC ON"], "MUSIC OFF")
                stopMusic();
              }
            },
            "SOUND ON": () => {
              use_sound = !use_sound
              localStorage.setItem("soviet_computer_lab_use_sound", use_sound);
              if (use_sound) {
                this.choices.rename(["SETTINGS", "SOUND OFF"], "SOUND ON")
                soundEffect("button_accept");
              } else {
                stopAllSound();
                this.choices.rename(["SETTINGS", "SOUND ON"], "SOUND OFF")
              }
            },
          },
          "CREDITS": () =>  {
            this.switchFromTitleTo("credits");
          },
          "QUIT": () => {
            window.close();
          },
        }, 
        (text) => {
          let entry_button = makeText(text, {fontFamily: "Press Start 2P", fontSize: 24, fill: 0xFFFFFF, letterSpacing: 2, align: "left"},
            null, 0, 0, 0, 0.5);
          entry_button.interactive = true;
          entry_button.buttonMode = true;
          return entry_button;
        }, () => {}, 40, 24, 0xFFFFFF, 0xfcba03
      );

      if (!use_music) this.choices.rename(["SETTINGS", "MUSIC ON"], "MUSIC OFF");
      if (!use_sound) this.choices.rename(["SETTINGS", "SOUND ON"], "SOUND OFF");

      this.choices.position.set(737, 720);
      this.addChild(this.choices);
      // this.choices.visible = false;

      this.start_time = markTime() - 5000;

      this.state = "active";

      this.tvs_dark = makeSprite("Art/tvs_dark.png", this, this.tvs.x, this.tvs.y, 0.5, 1);
      this.tvs_dark.scale.set(6, 6);
      this.tvs_dark.visible = false;
    }, post_animation_delay);

    
  }


  animateTitleTransition() {
    this.tvs_dark.alpha = 0.01;
    this.tvs_dark.visible = true;
    let top_y = this.tvs.y;
    let top_x = this.tvs.x;
    var tween = new TWEEN.Tween(this.tvs_dark)
      .to({alpha: 1})
      .duration(800)
      .easing(TWEEN.Easing.Cubic.InOut)
      .start();
    delay(() => {
      var tween = new TWEEN.Tween(this.tvs)
      .to({x: 1022, y: 1280})
      .easing(TWEEN.Easing.Cubic.InOut)
      .duration(2000)
      .start();
      var tween = new TWEEN.Tween(this.tvs_dark)
        .to({x: 1022, y: 1280})
        .easing(TWEEN.Easing.Cubic.InOut)
        .duration(2000)
        .start();
      var tween = new TWEEN.Tween(this.tvs_dark.scale)
        .to({x: 16, y: 16})
        .easing(TWEEN.Easing.Cubic.InOut)
        .duration(2000)
        .start();
      var tween = new TWEEN.Tween(this.tvs.scale)
        .to({x: 16, y: 16})
        .easing(TWEEN.Easing.Cubic.InOut)
        .duration(2000)
        .start();
    }, 800)
  }


  switchFromTitleTo(next_screen) {
    if (game.network.uid == null) {
      game.network.anonymousSignIn(() => {
        game.network.loadGlobalHighScores();
      });
    } else {
      game.network.loadGlobalHighScores();
    }
    this.state = "transitioning";
    this.animateTitleTransition();
    delay(() => {
      game.createScreen(next_screen);
      game.popScreens("title", next_screen);
      game.fadeFromBlack(800);
    }, 3200);
  }


  titleCreateGame() {
    this.state = "creating";
    game.network.createNewGame("quick_closed", () => {
      this.switchFromTitleToMultiSetName("multi_lobby");
    }, () => {
      console.log("Error with network call.");
      //self.showAlert("Couldn't make game.\n Please try later.", function() {
        this.state = "active";
      //});
    });
  }


  switchFromTitleToMultiLobby(multi_type) {
    this.state = "transitioning";
    this.multi_type = multi_type;
    game.createScreen("multi_lobby");
    game.switchScreens("title", "multi_lobby");
  }


  switchFromTitleToMultiSetName(next_screen) {
    this.state = "transitioning";
    game.createScreen("multi_set_name");
    game.switchScreens("title", "multi_set_name");
    game.screens["multi_set_name"].next_screen = next_screen;
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
    if (this.state == "active" && timeSince(this.start_time) > 500 && this.soviet_text.text == "") {
      this.start_time = markTime();
      // this.soviet_text.text = "";
      // this.computer_text.text = "";
      // this.lab_text.text = "";

      let rate = 100;

      let texts = [this.soviet_text, this.computer_text, this.lab_text, null,
        this.choices.children[0], this.choices.children[1], this.choices.children[2],
        this.choices.children[3], this.choices.children[4]
      ]
      let values = ["SOVIET", "COMPUTER", "LAB", "  ", "SINGLE", "MULTI",
        "SETTINGS", "CREDITS", "QUIT"
      ]

      let delay_marker = 0;
      for (let i = 0; i < texts.length; i++) {
        let t = texts[i];
        let v = values[i];
        if (t != null) {
          t.text = "";
          for (let j = 1; j <= v.length; j++) {
            delay(() => {
              t.text = v.slice(0, j);
            }, delay_marker*rate + rate * j);
          }
        }
        delay_marker += v.length;
      }

      // show the title menu
      // delay(() => {
      //   this.choices.visible = true;
      // }, 500);
    }
  }
}

