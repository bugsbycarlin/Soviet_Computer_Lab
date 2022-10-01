//
// This file contains the game lobby, where subgame and difficulty
// are chosen and high scores are displayed.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//

class Lobby extends Screen {
  initialize() {
    this.kuzkas_mother_bg = makeAnimatedSprite("Art/Big_Animations/kuzkas_mother_bg.json", "kuzkas_mother", this, 1100 - 50, game.height, 0.5, 1);
    this.kuzkas_mother_bg.scale.set(7, 7);
    this.kuzkas_mother_bg.alpha = 0.35;
    this.kuzkas_mother_bg.animationSpeed = 0.15;
    this.kuzkas_mother_bg.loop = true;
    this.kuzkas_mother_bg.play();
    this.kuzkas_mother_bg.visible = false;

    this.party_math_bg = makeAnimatedSprite("Art/Big_Animations/party_math_bg.json", "party_math", this, 1100, game.height, 0.5, 1);
    this.party_math_bg.scale.set(7, 7);
    this.party_math_bg.alpha = 0.35;
    this.party_math_bg.animationSpeed = 0.15;
    this.party_math_bg.loop = true;
    this.party_math_bg.play();
    this.party_math_bg.visible = false;

    this.choice_bg = makeBlank(this, 600, 960, 38, 0, 0x000000);

    // makeBlank(this, game.width, game.height, 0, 0, 0xf3db3c);

    let font = {fontFamily: "Press Start 2P", fontSize: 48, fill: 0xFFFFFF, letterSpacing: 6, align: "right"};

    this.section = makeText("GAME TYPE", font, this, 78, 40, 0, 0);

    this.game_type_choices = new NestedOptionsList({
        "Kuzka's Mother": {
          "Easy": () => {this.startGame(1, "easy");},
          "Medium": () => {this.startGame(1, "medium");},
          "Hard": () => {this.startGame(1, "hard");},
          "Beacon": () => {this.startGame(1, "beacon");},
        },
        "Magnitogorsk": {
          "Easy": () => {this.startGame(2, "easy");},
          "Medium": () => {this.startGame(2, "medium");},
          "Hard": () => {this.startGame(2, "hard");},
          "Beacon": () => {this.startGame(2, "beacon");},
        },
        "Party Math": {
          "Easy": () => {this.startGame(3, "easy");},
          "Medium": () => {this.startGame(3, "medium");},
          "Hard": () => {this.startGame(3, "hard");},
          "Beacon": () => {this.startGame(3, "beacon");},
        },
        "Planned Economy": {
          "Easy": () => {this.startGame(4, "easy");},
          "Medium": () => {this.startGame(4, "medium");},
          "Hard": () => {this.startGame(4, "hard");},
          "Beacon": () => {this.startGame(4, "beacon");},
        },
        "First Strike": {
          "Easy": () => {this.startGame(5, "easy");},
          "Medium": () => {this.startGame(5, "medium");},
          "Hard": () => {this.startGame(5, "hard");},
          "Beacon": () => {this.startGame(5, "beacon");},
        },
        "Siberian Trail": {
          "Easy": () => {this.startGame(6, "easy");},
          "Medium": () => {this.startGame(6, "medium");},
          "Hard": () => {this.startGame(6, "hard");},
          "Beacon": () => {this.startGame(6, "beacon");},
        },
        "Where in the\nWorld is Leon\nTrotsky?": {
          "Easy": () => {this.startGame(7, "easy");},
          "Medium": () => {this.startGame(7, "medium");},
          "Hard": () => {this.startGame(7, "hard");},
          "Beacon": () => {this.startGame(7, "beacon");},
        },
        "Party Congress!": {
          "Easy": () => {this.startGame(8, "easy");},
          "Medium": () => {this.startGame(8, "medium");},
          "Hard": () => {this.startGame(8, "hard");},
          "Beacon": () => {this.startGame(8, "beacon");},
        },
        "Mixed Mode": {
          "Easy": () => {this.startGame(9, "easy");},
          "Medium": () => {this.startGame(9, "medium");},
          "Hard": () => {this.startGame(9, "hard");},
          "Beacon": () => {this.startGame(9, "beacon");},
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
      () => { this.returnToTitle() }, 72, 40, 0xFFFFFF, 0x67d8ef
    );
    this.game_type_choices.position.set(78, 180);
    this.addChild(this.game_type_choices);

    this.tvs_dark = makeSprite("Art/tvs_hollow.png", this, 1022, 1280, 0.5, 1);
    this.tvs_dark.scale.set(16, 16);

    fadeMusic(500); // fade the music when coming to the lobby
    game.level = 1; // reset the level when coming to the lobby

    this.state = "active";
  }


  returnToTitle() {
    this.state = "leaving";
    game.createScreen("title", true);
    game.popScreens("lobby", "title");
  }


  startGame(game_type, difficulty_level) {
    game.level = 0;
    game.game_type_selection = game_type;
    game.difficulty_level = difficulty_level;
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
    this.party_math_bg.visible = this.game_type_choices.choice[0] == 2 ? true : false;

    if (this.game_type_choices.choice.length > 1) {
      this.section.text = "DIFFICULTY";
    } else {
      this.section.text = "GAME TYPE";
    }
  } 
}