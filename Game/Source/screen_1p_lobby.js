

Game.prototype.initialize1pLobby = function() {
  let self = this;
  let screen = this.screens["1p_lobby"];
  this.clearScreen(screen);

  this.lobby_sections = {};

  this.initializeSectionGameType();

  this.monitor_overlay.restore();

  this.lobby_state = "active";
}



Game.prototype.initializeSectionGameType = function() {
  let self = this;
  let screen = this.screens["1p_lobby"];
  this.lobby_sections.game_type = new PIXI.Container();
  
  let section = this.lobby_sections.game_type;
  screen.addChild(section);


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
  section.addChild(this.game_type_choices);
}


Game.prototype.returnToTitle = function() {
  this.lobby_state = "leaving";
  this.initializeTitle();
  this.switchScreens("1p_lobby", "title");
}


Game.prototype.switchToKeyboardKomandir = function() {
  this.lobby_state = "leaving";
  this.initialize1pWordRockets();
  this.switchScreens("1p_lobby", "1p_word_rockets");
}


Game.prototype.switchToWordBase = function() {
  this.lobby_state = "leaving";
  this.initialize1pBaseCapture();
  this.switchScreens("1p_lobby", "1p_base_capture");
}


Game.prototype.switchToFirstStrike = function() {
  this.lobby_state = "leaving";
  this.initialize1pLaunchCode();
  this.switchScreens("1p_lobby", "1p_launch_code");
}


Game.prototype.switchToPartyMath = function() {
  this.lobby_state = "leaving";
  this.initializeMathGame();
  this.switchScreens("1p_lobby", "math_game");
}


Game.prototype.switchToCentrallyPlannedEconomy = function() {
  this.lobby_state = "leaving";
  this.initialize1pCpe();
  this.switchScreens("1p_lobby", "1p_cpe");
}


Game.prototype.lobbyKeyDown = function(ev) {
  if (this.lobby_state == "active") {
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



Game.prototype.updateHighScoreDisplay = function() {
  // Not now, buddy
}


Game.prototype.singlePlayerLobbyUpdate = function(diff) {
  var self = this;
  var screen = this.screens["1p_lobby"];
}