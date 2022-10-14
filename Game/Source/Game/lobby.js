//
// This file contains the game lobby, where subgame and difficulty
// are chosen and high scores are displayed.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//

game_type_explanations = {
  "Kuzka's Mother":  "It's war with the West! Type words to launch missiles at enemy bases. Give 'em Kuzka's Mother!",
  "Magnitogorsk":    "Build a planned industrial city in this tile based word game.",
  "Party Math":      "Help Grigory to do his work by cleaning up matching numbers and avoiding subversive persons.",
  "Planned Economy": "Show the west the power of a centrally planned economy! Guide formerly capitalist lemmings safely to their new factory jobs.",
  "First Strike":    "In this typing based platformer, Secret Agent Karlov races to launch the decisive missile strike in an all out war! ",
  "Siberian Trail":  "Experience glorious history in this realistic simulator of brave pioneers on their totally voluntary journey to colonize Siberia.",
  "Where in the\nWorld is Leon\nTrotsky?": 
                     "Nothing here yet.",
  "Party Congress!": "Nothing here yet.",
  "Mixed Mode":      "Nothing here yet.",
}

class Lobby extends Screen {
  initialize() {
    this.kuzkas_mother_bg = makeAnimatedSprite("Art/Big_Animations/kuzkas_mother_bg.json", "kuzkas_mother", this, 1100, 0, 0.5, 0);
    this.kuzkas_mother_bg.scale.set(4, 4);
    this.kuzkas_mother_bg.alpha = 0.35;
    this.kuzkas_mother_bg.animationSpeed = 0.15;
    this.kuzkas_mother_bg.loop = true;
    this.kuzkas_mother_bg.play();
    this.kuzkas_mother_bg.visible = false;

    this.party_math_bg = makeAnimatedSprite("Art/Big_Animations/party_math_bg.json", "party_math", this, 1100, 0, 0.5, 0);
    this.party_math_bg.scale.set(4, 4);
    this.party_math_bg.alpha = 0.35;
    this.party_math_bg.animationSpeed = 0.15;
    this.party_math_bg.loop = true;
    this.party_math_bg.play();
    this.party_math_bg.visible = false;

    this.choice_bg = makeBlank(this, 600, 960, 38, 0, 0x000000);

    // makeBlank(this, game.width, game.height, 0, 0, 0xf3db3c);

    let font = {fontFamily: "Press Start 2P", fontSize: 48, fill: 0xFFFFFF, letterSpacing: 6, align: "right"};
    let font_32 = {fontFamily: "Press Start 2P", fontSize: 32, lineHeight: 40, fill: 0xFFFFFF, letterSpacing: 2, align: "left"};
    let font_32a = {fontFamily: "Press Start 2P", fontSize: 32, lineHeight: 44, fill: 0xFFFFFF, letterSpacing: 2, align: "left"};

    this.section = makeText("GAME TYPE", font, this, 78, 40, 0, 0);
    this.explanation = makeTypewriterText("", font_32a, this, 680, 680, 0, 0, 880);

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
        let entry_button = new PIXI.Text(text, font_32);
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

    this.local_high_scores_section = new PIXI.Container();
    this.addChild(this.local_high_scores_section);
    this.global_high_scores_section = new PIXI.Container();
    this.addChild(this.global_high_scores_section);

    this.local_high_scores_section.position.set(710, 190);
    this.global_high_scores_section.position.set(1170, 190);

    let hs_font = {fontFamily: "Press Start 2P", fontSize: 20, fill: 0xFFFFFF, letterSpacing: 6, align: "left"}
    makeText("Local", hs_font, this.local_high_scores_section, 0, 0, 0, 0.5);
    makeText("Global", hs_font, this.global_high_scores_section, 0, 0, 0, 0.5);

    this.tvs_dark = makeSprite("Art/tvs_hollow.png", this, 1022, 1280, 0.5, 1);
    this.tvs_dark.scale.set(16, 16);

    fadeMusic(500); // fade the music when coming to the lobby
    game.level = 1; // reset the level when coming to the lobby

    this.state = "active";

    this.updateChoice();
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
        this.updateChoice();
      } else if (ev.key === "ArrowUp") {
        this.game_type_choices.moveUp();
        this.updateChoice();
      } else if (ev.key === "Enter") {
        this.game_type_choices.choose();
        this.updateChoice();
      } else if (ev.key === "Escape") {
        this.game_type_choices.escape();
        this.updateChoice();
      }
    }
  }


  updateChoice() {
    if (this.game_type_choices.choice.length == 1) {
      let explanation = game_type_explanations[this.game_type_choices.sub_list[this.game_type_choices.choice[0]][0]];
      this.explanation.setPartial(explanation);
    }

    this.kuzkas_mother_bg.visible = this.game_type_choices.choice[0] == 0 ? true : false;
    this.party_math_bg.visible = this.game_type_choices.choice[0] == 2 ? true : false;

    if (this.game_type_choices.choice.length > 1) {
      this.section.text = "DIFFICULTY";

      this.local_high_scores_section.visible = true;
      this.global_high_scores_section.visible = true;
    } else {
      this.section.text = "GAME TYPE";

      this.local_high_scores_section.visible = false;
      this.global_high_scores_section.visible = false;
    }

    if (this.game_type_choices.choice.length > 1) {
      this.updateHighScoreDisplay();
    }
  }


  updateHighScoreDisplay() {
    // Not now, buddy
    console.log(this.game_type_choices.choice[0] + 1);
    let mode = game.getModeName(this.game_type_choices.choice[0] + 1);
    let difficulty_level = difficulty_levels[this.game_type_choices.choice[1]];
    console.log(mode);
    console.log(difficulty_level);

    if (this.local_high_scores_texts != null) {
      for (let i = 0; i <= this.local_high_scores_texts.length; i++) {
        this.local_high_scores_section.removeChild(this.local_high_scores_texts[i]);
      }
    }
    if (this.global_high_scores_texts != null) {
      for (let i = 0; i <= this.global_high_scores_texts.length; i++) {
        this.global_high_scores_section.removeChild(this.global_high_scores_texts[i]);
      }
    }

    this.local_high_scores_texts = [];
    for (let i = 0; i <= 9; i++) {
      let text = i == 9 ? "X." : (i+1) + ".";
      let entry = game.local_high_scores[mode][difficulty_level][i]
      if (entry != null) {
        text += entry.name.padEnd(6) + " " + entry.score;
      } else {
        text += "______ ______";
      }
      let lhs = new PIXI.Text(text, {fontFamily: "Press Start 2P", fontSize: 20, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
      lhs.anchor.set(0,0.5);
      lhs.position.set(0,24*(i+1));
      this.local_high_scores_section.addChild(lhs);
      this.local_high_scores_texts.push(lhs);
    }

    this.global_high_scores_texts = [];
    for (let i = 0; i <= 9; i++) {
      let text = i == 9 ? "X." : (i+1) + ".";
      let entry = game.global_high_scores[mode][difficulty_level][i]
      if (entry != null) {
        text += entry.name.padEnd(6) + " " + entry.score;
      } else {
        text += "______ ______";
      }
      let ghs = new PIXI.Text(text, {fontFamily: "Press Start 2P", fontSize: 20, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
      ghs.anchor.set(0,0.5);
      ghs.position.set(0,24*(i+1));
      this.global_high_scores_section.addChild(ghs);
      this.global_high_scores_texts.push(ghs);
    }
  }


  update(diff) {
    if (this.state == "active") {
      this.explanation.updatePartial();
    }
  } 
}