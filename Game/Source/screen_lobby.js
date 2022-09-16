
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
    let self = this;

    this.sections = {};

    this.initializeSectionGameType();

    game.monitor_overlay.restore();

    fadeMusic(500); // fade the music when coming to the lobby
    game.level = 1; // reset the level when coming to the lobby

    this.state = "active";
  }


  initializeSectionGameType() {
    let self = this;

    this.sections.game_type = new PIXI.Container();
    
    let section = this.sections.game_type;
    this.addChild(section);

    let choose_game_type = new PIXI.Text("GAME TYPE", {fontFamily: "Press Start 2P", fontSize: 32, fill: 0xFFFFFF, letterSpacing: 6, align: "right"});
    choose_game_type.anchor.set(0,0);
    choose_game_type.position.set(300, 200);
    section.addChild(choose_game_type);

    this.game_type_choices = new NestedOptionsList({
        "Keyboard Kommandir": function(){
          self.switchToKeyboardKomandir();
        },
        "Word Base": function(){
          self.switchToWordBase();
        },
        "Party Math": function(){
          self.switchToPartyMath();
        },
        "Centrally Planned Economy": function(){
          self.switchToCentrallyPlannedEconomy();
        },
        "First Strike": function(){
          self.switchToFirstStrike();
        },
        "Siberian Trail": function(){
        },
        "Where in the World is Leon Trotsky?": function(){
        },
      }, 
      function(text) {
        let entry_button = new PIXI.Text(text, {fontFamily: "Press Start 2P", fontSize: 24, fill: 0xFFFFFF, letterSpacing: 2, align: "center"});
        entry_button.scaleMode = PIXI.SCALE_MODES.NEAREST;
        entry_button.anchor.set(0,0);
        entry_button.interactive = true;
        entry_button.buttonMode = true;
        return entry_button;
      },
      function() { self.returnToTitle() }, 40, 0xFFFFFF, 0x67d8ef
    );
    this.game_type_choices.position.set(300, 280);
    this.addChild(this.game_type_choices);
  }


  returnToTitle() {
    this.state = "leaving";
    game.createScreen("title");
    game.switchScreens("lobby", "title");
  }


  switchToKeyboardKomandir() {
    let self = this;
    this.game_type_selection = 1;
    this.state = "leaving";
    game.monitor_overlay.dissolve();
    delay(function() {
      self.initialize1pWordRockets();
      self.fadeScreens("lobby", "1p_word_rockets", true, 800);
    }, 900);
  }


  switchToWordBase() {
    let self = this;
    this.game_type_selection = 2;
    this.state = "leaving";
    game.monitor_overlay.dissolve();
    delay(function() {
      self.initialize1pBaseCapture();
      self.fadeScreens("lobby", "1p_base_capture", true);
    }, 1000);
  }


  switchToPartyMath() {
    let self = this;
    this.game_type_selection = 3;
    this.state = "leaving";
    game.monitor_overlay.dissolve();
    delay(function() {
      self.initializeMathGame();
      self.fadeScreens("lobby", "math_game", true, 800);
    }, 1000);
  }


  switchToCentrallyPlannedEconomy() {
    let self = this;
    this.game_type_selection = 4;
    this.state = "leaving";
    game.monitor_overlay.dissolve();
    delay(function() {
      self.initialize1pCpe();
      self.fadeScreens("lobby", "1p_cpe", true, 800);
    }, 900);
  }


  switchToFirstStrike() {
    let self = this;
    this.game_type_selection = 5;
    this.state = "leaving";
    game.monitor_overlay.dissolve();
    delay(function() {
      self.initialize1pLaunchCode();
      self.fadeScreens("lobby", "1p_launch_code", true);
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
    var self = this;
  }
}