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

    this.tvs_dark = makeSprite("Art/Title/tvs_dark.png", this, 1022, 1280, 0.5, 1);
    this.tvs_dark.scale.set(16, 16);

    let choose_game_type = new PIXI.Text("GAME TYPE", {fontFamily: "Press Start 2P", fontSize: 32, fill: 0xFFFFFF, letterSpacing: 6, align: "right"});
    choose_game_type.anchor.set(0,0);
    choose_game_type.position.set(300, 200);
    section.addChild(choose_game_type);

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
        "Centrally Planned Economy": () => {
          this.startGame(4);
        },
        "First Strike": () => {
          this.startGame(5);
        },
        "Siberian Trail": () => {
        },
        "Where in the World is Leon Trotsky?": () => {
        },
        "Party Congress (Mixed Mode)": () => {
          this.startGame(8);
        },
      }, 
      (text) => {
        let entry_button = new PIXI.Text(text, {fontFamily: "Press Start 2P", fontSize: 24, fill: 0xFFFFFF, letterSpacing: 2, align: "center"});
        entry_button.scaleMode = PIXI.SCALE_MODES.NEAREST;
        entry_button.anchor.set(0,0);
        entry_button.interactive = true;
        entry_button.buttonMode = true;
        return entry_button;
      },
      () => { this.returnToTitle() }, 40, 0xFFFFFF, 0x67d8ef
    );
    this.game_type_choices.position.set(300, 280);
    this.addChild(this.game_type_choices);
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
  }
}