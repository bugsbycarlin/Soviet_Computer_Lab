//
// This file contains the Title screen.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//


class Title extends PIXI.Container {
  constructor() {
    super();
    this.initialize();

    if (use_music) setMusic("title_song")
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

    let font = {fontFamily: "Press Start 2P", fontSize: 84, fill: 0xcd0000, letterSpacing: 2, align: "left",
      dropShadow: true, dropShadowColor: 0x440000, dropShadowDistance: 8, dropShadowAngle: Math.PI/4};

    this.soviet_text = makeText("", font, this, 574, 264, 0, 0.5);
    this.computer_text = makeText("", font, this, 473, 394, 0, 0.5);
    this.lab_text = makeText("", font, this, 690, 524, 0, 0.5);

    this.choices = new NestedOptionsList({
        "SINGLE": () => {
          this.switchFromTitleToLobby();
        },
        "MULTI": {
          "QUICK PLAY": () => {},
          "CREATE GAME": () => {this.titleCreateGame("create")},
          "JOIN GAME": () => {this.switchFromTitleToMultiSetName("multi_set_name")},
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
          this.switchFromTitleToCredits();
        },
        "QUIT": () => {
          window.close();
        },
      }, 
      (text) => {
        let entry_button = makeText(text, {fontFamily: "Press Start 2P", fontSize: 24, fill: 0xFFFFFF, letterSpacing: 2, align: "center"},
          null, 0, 0, 0.5, 0.5);
        entry_button.interactive = true;
        entry_button.buttonMode = true;
        return entry_button;
      }, () => {}, 40, 0xFFFFFF, 0xa10000
    );

    if (!use_music) this.choices.rename(["SETTINGS", "MUSIC ON"], "MUSIC OFF");
    if (!use_sound) this.choices.rename(["SETTINGS", "SOUND ON"], "SOUND OFF");

    this.choices.position.set(game.width / 2 - 5, game.height - 280);
    this.addChild(this.choices);
    this.choices.visible = false;

    this.start_time = markTime() - 5000;
  }


  switchFromTitleToLobby() {
    if (game.network.uid == null) {
      game.network.anonymousSignIn(() => {
        game.network.loadGlobalHighScores();
      });
    } else {
      game.network.loadGlobalHighScores();
    }
    this.state = "transitioning";
    game.createScreen("lobby");
    game.switchScreens("title", "lobby");
  }

  switchFromTitleToCredits() {
    this.state = "transitioning";
    game.createScreen("credits");
    game.switchScreens("title", "credits");
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
        delay(() => {
          this.soviet_text.text = "SOVIET".slice(0, i);
        }, rate * i);
      }
      for (let i = 1; i <= 8; i++) {
        delay(() => {
          this.computer_text.text = "COMPUTER".slice(0, i);
        }, 6*rate + rate * i);
      }
      for (let i = 1; i <= 3; i++) {
        delay(() => {
          this.lab_text.text = "LAB".slice(0, i);
        }, 14*rate + rate * i);
      }

      // show the title menu
      delay(() => {
        this.choices.visible = true;
      }, 500);
    }
  }
}

