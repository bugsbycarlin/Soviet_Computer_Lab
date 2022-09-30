//
// This file contains the game lobby, where subgame and difficulty
// are chosen and high scores are displayed.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//

class Lobby extends Screen {
  initialize() {
    this.sections = {};

    this.initializeSectionGameType();

    // game.monitor_overlay.restore();

    fadeMusic(500); // fade the music when coming to the lobby
    game.level = 1; // reset the level when coming to the lobby

    this.state = "active";
  }


  initializeSectionGameType() {
    this.sections.game_type = new PIXI.Container();

    let section = this.sections.game_type;
    this.addChild(section);

    this.tvs_dark = makeSprite("Art/tvs_hollow.png", this, 1022, 1280, 0.5, 1);
    this.tvs_dark.scale.set(16, 16);

    this.kuzkas_mother_bg = makeAnimatedSprite("Art/Big_Animations/kuzkas_mother_bg.json", "kuzkas_mother", section, game.width/2, game.height, 0.5, 1);
    this.kuzkas_mother_bg.scale.set(6, 6);
    this.kuzkas_mother_bg.alpha = 0.35;
    this.kuzkas_mother_bg.animationSpeed = 0.15;
    this.kuzkas_mother_bg.loop = true;
    this.kuzkas_mother_bg.play();

    // makeBlank(section, game.width, game.height, 0, 0, 0xf3db3c);

    let font_32 = {fontFamily: "Press Start 2P", fontSize: 64, fill: 0xFFFFFF, letterSpacing: 6, align: "right"};

    let choose_game_type = makeText("GAME TYPE", font_32, section, 120, 80, 0, 0);

    this.game_type_choices = new NestedOptionsList({
        "Kuzka's Mother": () => {
          this.startGame(1);
        },
        "Magnitogorsk": () => {
          this.startGame(2);
        },
        "Party Math": () => {
          this.startGame(3);
        },
        "Planned Economy": () => {
          this.startGame(4);
        },
        "First Strike": () => {
          this.startGame(5);
        },
        "Siberian Trail": () => {
        },
        "Where in the World\nis Leon Trotsky?": () => {
        },
        "Mixed Mode": () => {
          this.startGame(8);
        },
      }, 
      (text) => {
        let entry_button = new PIXI.Text(text, {fontFamily: "Press Start 2P", fontSize: 32, lineHeight: 40, fill: 0xFFFFFF, letterSpacing: 2, align: "left"});
        entry_button.scaleMode = PIXI.SCALE_MODES.NEAREST;
        entry_button.anchor.set(0,0);
        entry_button.interactive = true;
        entry_button.buttonMode = true;
        return entry_button;
      },
      () => { this.returnToTitle() }, 64, 40, 0xFFFFFF, 0x67d8ef
    );
    this.game_type_choices.position.set(120, 220);
    section.addChild(this.game_type_choices);
  }


  returnToTitle() {
    this.state = "leaving";
    game.createScreen("title", true);
    game.popScreens("lobby", "title");
  }


  startGame(game_type) {
    game.level = 0;
    game.game_type_selection = game_type;
    this.state = "leaving";
    game.monitor_overlay.dissolve();
    delay(() => {
      game.nextFlow();
    }, 1000);
  }


  keyDown(ev) {
    if (this.state == "active") {
      if (ev.key === "ArrowDown") {
        this.game_type_choices.moveDown();
      } else if (ev.key === "ArrowUp") {
        this.game_type_choices.moveUp();
      } else if (ev.key === "Enter") {
        this.game_type_choices.choose();
      } else if (ev.key === "Escape") {
        this.game_type_choices.escape();
      }
    }
  }


  updateHighScoreDisplay() {
    // Not now, buddy
  }


  update(diff) {
    this.kuzkas_mother_bg.visible = this.game_type_choices.choice[0] == 0 ? true : false;
  } 
}