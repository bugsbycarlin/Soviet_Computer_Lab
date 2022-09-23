
class Lobby extends PIXI.Container {
  constructor() {
    super();
    this.initialize();  
  }


  clear() {
    while(this.children[0]) {
      let x = this.removeChild(this.children[0]);
      x.destroy();
    }
  }


  initialize() {
    this.sections = {};

    this.initializeSectionGameType();

    game.monitor_overlay.restore();

    fadeMusic(500); // fade the music when coming to the lobby
    game.level = 1; // reset the level when coming to the lobby

    this.state = "active";
  }


  initializeSectionGameType() {
    this.sections.game_type = new PIXI.Container();
    
    let section = this.sections.game_type;
    this.addChild(section);

    let choose_game_type = new PIXI.Text("GAME TYPE", {fontFamily: "Press Start 2P", fontSize: 32, fill: 0xFFFFFF, letterSpacing: 6, align: "right"});
    choose_game_type.anchor.set(0,0);
    choose_game_type.position.set(300, 200);
    section.addChild(choose_game_type);

    this.game_type_choices = new NestedOptionsList({
        "Kuzka's Mother": () => {
          this.giveEmKuzkasMother();
        },
        "Word Base": () => {
          this.switchToWordBase();
        },
        "Party Math": () => {
          this.switchToPartyMath();
        },
        "Centrally Planned Economy": () => {
          this.switchToCentrallyPlannedEconomy();
        },
        "First Strike": () => {
          this.switchToFirstStrike();
        },
        "Siberian Trail": () => {
        },
        "Where in the World is Leon Trotsky?": () => {
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
    game.createScreen("title");
    game.switchScreens("lobby", "title");
  }


  giveEmKuzkasMother() {
    game.game_type_selection = 1;
    this.state = "leaving";
    game.monitor_overlay.dissolve();
    delay(() => {
      game.createScreen("kuzkas_mother");
      game.fadeScreens("lobby", "kuzkas_mother", true, 800);
    }, 900);
  }


  switchToWordBase() {
    game.game_type_selection = 2;
    this.state = "leaving";
    game.monitor_overlay.dissolve();
    delay(() => {
      game.createScreen("word_base");
      game.fadeScreens("lobby", "word_base", true);
    }, 1000);
  }


  switchToPartyMath() {
    this.state = "leaving";
    game.game_type_selection = 3;
    game.monitor_overlay.dissolve();
    delay(() => {
      game.createScreen("party_math");
      game.fadeScreens("lobby", "party_math", true, 800);
    }, 1000);
  }


  switchToCentrallyPlannedEconomy() {
    this.state = "leaving";
    game.game_type_selection = 4;
    game.monitor_overlay.dissolve();
    delay(function() {
      game.createScreen("centrally_planned_economy");
      game.fadeScreens("lobby", "centrally_planned_economy", true, 800);
    }, 900);
  }


  switchToFirstStrike() {
    this.game_type_selection = 5;
    this.state = "leaving";
    game.monitor_overlay.dissolve();
    delay(() => {
      game.createScreen("first_strike");
      game.fadeScreens("lobby", "first_strike", true);
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