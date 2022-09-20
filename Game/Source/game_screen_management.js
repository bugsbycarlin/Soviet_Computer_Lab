//
// The following Game class methods manage different screens;
// here a screen could mean a whole game mode, a cutscene,
// the title screen, lobby screen, etc.
//
// There's a method to initialize, and methods to handle
// several different types of transitions.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//


Game.prototype.createScreen = function(screen_name, extra_param = null, reset = false) {
  if (screen_name == "intro") {
    this.screens["intro"] = new Intro;
  } else if (screen_name == "title") {
    this.screens["title"] = new Title();
  } else if (screen_name == "lobby") {
    this.screens["lobby"] = new Lobby();
  } else if (screen_name == "high_score") {
    this.screens["high_score"] = new HighScore(extra_param);
  } else if (screen_name == "multi_set_name") {
    this.initializeMultiSetName();
  } else if (screen_name == "party_math") {
    this.screens["party_math"] = new PartyMath();
  } else if (screen_name == "centrally_planned_economy") {
    this.screens["centrally_planned_economy"] = new CentrallyPlannedEconomy();
  } else if (screen_name == "cpe_character_tester") {
    this.initializeCpeTester();
  } else if (screen_name == "credits") {
    this.initializeCredits();
  } else if (screen_name == "1p_word_rockets") {
    if (reset) this.resetGame();
    this.initialize1pWordRockets();
  } else if (screen_name == "1p_base_capture") {
    if (reset) this.resetGame();
    this.initialize1pBaseCapture();
  } else if (screen_name == "1p_launch_code") {
    if (reset) this.resetGame();
    this.initialize1pLaunchCode();
  } else if (screen_name == "cutscene") {
    this.initializeCutscene("t4");
  }

  console.log(screen_name);
  this.screens[screen_name].position.x = 0;
  pixi.stage.addChild(this.screens[screen_name]);
  pixi.stage.addChild(this.black);
  pixi.stage.addChild(this.monitor_overlay);
}


// Set up effects screens, then create and start with the first screen (defined in game.js).
Game.prototype.initializeScreens = function() {
  this.screens = [];

  this.black = PIXI.Sprite.from(PIXI.Texture.WHITE);
  this.black.width = 1664;
  this.black.height = 960;
  this.black.tint = 0x000000;
  this.black.visible = false;

  this.initializeMonitorOverlay();

  // this.alertMask = new PIXI.Container();
  // pixi.stage.addChild(this.alertMask);
  // this.alertBox = new PIXI.Container();
  // pixi.stage.addChild(this.alertBox);
  // this.initializeAlertBox();

  this.createScreen(first_screen, true);
  this.current_screen = first_screen;
}


// The monitor overlay is a visual effect that looks like an 80s monitor.
// It can dissolve and reform itself.
Game.prototype.initializeMonitorOverlay = function() {

  this.monitor_overlay = new PIXI.Container();
  this.monitor_overlay.graphic = new PIXI.Sprite(PIXI.Texture.from("Art/pixelated_computer_overlay_1664_960.png"));
  this.monitor_overlay.addChild(this.monitor_overlay.graphic);
  this.monitor_overlay.status = "visible";

  this.monitor_overlay.simpleRestore = function() {
    console.log("simple restore called");
    if (this.status != "visible") {
      console.log("simple restore enacted");
      this.addChild(this.graphic);
      this.visible = true;
      this.status = "visible";
    }
  }

  this.monitor_overlay.restore = function() {
    console.log("restore called");
    if (this.status != "visible") {
      console.log("restore enacted");
      this.visible = true;
      this.status = "visible";

      let chunk_size = this.restore_voxels.length / 30;
      console.log(chunk_size);

      var tween_1 = new TWEEN.Tween(this)
      .to({funk: 0})
      .duration(1000)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(() => {
        for (let i = 0; i < chunk_size; i++) {
          let v = this.restore_voxels.pop();
          if (v != undefined) this.addChild(v);
        }
      })
      .onComplete(() => {
        console.log("restore complete");
        while(this.children[0]) { 
          this.removeChild(this.children[0]);
        }
        this.addChild(this.graphic);
      })
      .start();
    }
  }

  this.monitor_overlay.dissolve = function() {
    console.log("dissolve called");
    if (this.status == "visible") {
      console.log("dissolve enacted");
      this.status = "invisible";
      let image = this.graphic;
      let max_width = this.graphic.width;
      let max_height = this.graphic.height;
      let voxel_size = 4;

      this.voxels = [];
      this.restore_voxels = [];

      let pixels = pixi.renderer.extract.pixels(image);
      for (var i = 0; i < pixels.length; i += 4) {
          let alpha = pixels[i + 3];
          let row = (i/4 - (i/4 % max_width)) / max_width;
          let col = i/4 % max_width;
          if (alpha > 0 && row % 4 == 0 && col % 4 == 0) {
              let voxel = PIXI.Sprite.from(PIXI.Texture.WHITE);
              voxel.width = voxel_size;
              voxel.height = voxel_size;
              
              voxel.tint = PIXI.utils.rgb2hex([pixels[i] / 255, pixels[i + 1] / 255, pixels[i + 2] / 255]);
              voxel.alpha = alpha / 255;
              this.addChild(voxel);
              voxel.orig_x = col;
              voxel.orig_y = row;
              voxel.position.set(voxel.orig_x, voxel.orig_y);
              this.voxels.push(voxel);
            
          }
      }

      this.removeChild(this.graphic);
      let chunk_size = this.voxels.length / 30;
      shuffleArray(this.voxels);

      var tween_1 = new TWEEN.Tween(this)
      .to({funk: 0})
      .duration(1000)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(() => {
        for (let i = 0; i < chunk_size; i++) {
          let v = this.voxels.pop();
          this.restore_voxels.push(v);
          this.removeChild(v);
        }
      })
      .onComplete(() => {
        console.log("dissolve complete");
        this.visible = false;
        while(this.children[0]) { 
          this.removeChild(this.children[0]);
        }
      })
      .start();
    }
  }

  pixi.stage.addChild(this.monitor_overlay);
}


// Slide the old screen off to the side, and slide the new one into place.
Game.prototype.switchScreens = function(old_screen, new_screen) {
  var direction = -1;
  if (new_screen == "title") direction = 1;
  this.screens[new_screen].position.x = direction * -1 * this.width;
  for (var i = 0; i < this.screens.length; i++) {
    if (this.screens[i] == new_screen || this.screens[i] == old_screen) {
      this.screens[i].visible = true;
    } else {
      this.screens[i].visible = false;
      this.screens[i].clear();
    }
  }
  pixi.stage.addChild(this.monitor_overlay);
  var tween_1 = new TWEEN.Tween(this.screens[old_screen].position)
    .to({x: direction * (this.width + 200)})
    .duration(1000)
    .easing(TWEEN.Easing.Cubic.InOut)
    .onComplete(() => {this.screens[old_screen].clear();})
    .start();
  var tween_2 = new TWEEN.Tween(this.screens[new_screen].position)
    .to({x: 0})
    .duration(1000)
    .easing(TWEEN.Easing.Cubic.InOut)
    .start();
  this.current_screen = new_screen;
}


// Fade the old screen to the new screen. If it's a double fade,
// fade to black then fade in. Otherwise, it's a direct fade from one to the other.
Game.prototype.fadeScreens = function(old_screen, new_screen, double_fade = false, fade_time = 1000) {
  if (this.screens[old_screen] != null) pixi.stage.removeChild(this.screens[old_screen]);
  if (this.screens[new_screen] != null) pixi.stage.removeChild(this.screens[new_screen]);
  pixi.stage.addChild(this.screens[new_screen]);
  if (double_fade) {  
    pixi.stage.addChild(this.black);
    this.black.alpha = 1;
    this.black.visible = true;
  }
  pixi.stage.addChild(this.screens[old_screen]);
  this.screens[old_screen].position.x = 0;
  this.screens[new_screen].position.x = 0;
  for (var i = 0; i < this.screens.length; i++) {
    if (this.screens[i] == new_screen || this.screens[i] == old_screen) {
      this.screens[i].visible = true;
    } else {
      this.screens[i].visible = false;
      this.screens[i].clear();
    }
  }
  pixi.stage.addChild(this.monitor_overlay);

  this.screens[old_screen].alpha = 1
  this.screens[new_screen].alpha = 1

  var tween = new TWEEN.Tween(this.screens[old_screen])
    .to({alpha: 0})
    .duration(fade_time)
    // .easing(TWEEN.Easing.Linear)
    .onComplete(() => {
      if (!double_fade) {
        if (old_screen != new_screen) this.screens[old_screen].clear();
        this.current_screen = new_screen;
      } else {
        var tween2 = new TWEEN.Tween(this.black)
        .to({alpha: 0})
        .duration(fade_time)
        .onComplete(() => {
          if (old_screen != new_screen) this.screens[old_screen].clear();
          this.current_screen = new_screen;
          pixi.stage.removeChild(this.black);
        })
        .start();
      }
    })
    .start();
  
}


// Fade in from the black screen.
Game.prototype.fadeFromBlack = function(fade_time=1500) {
  pixi.stage.addChild(this.black);
  this.black.alpha = 1;

  var tween = new TWEEN.Tween(this.black)
    .to({alpha: 0})
    .duration(fade_time)
    .onComplete(() => {
      pixi.stage.removeChild(this.black);
    })
    .start();
}


// Instantly pop from one screen to the other.
Game.prototype.popScreens = function(old_screen, new_screen) {
  pixi.stage.removeChild(this.screens[old_screen]);
  pixi.stage.removeChild(this.screens[new_screen]);
  pixi.stage.addChild(this.screens[old_screen]);
  pixi.stage.addChild(this.screens[new_screen]);
  pixi.stage.addChild(this.monitor_overlay);
  this.screens[old_screen].position.x = 0;
  this.screens[new_screen].position.x = 0;
  for (var i = 0; i < this.screens.length; i++) {
    if (this.screens[i] == new_screen) {
      this.screens[i].visible = true;
    } else {
      this.screens[i].visible = false;
      this.screens[i].clear();
    }
  }
  this.screens[old_screen].clear();
  this.current_screen = new_screen;
}


// Go to the lobby or the high score screen.
Game.prototype.gameOver = function(delay_time, score) {
  delay(() => {
    let low_high = this.local_high_scores[this.getModeName()][this.difficulty_level.toLowerCase()][9];
    if (low_high == null || low_high.score < score) {
      this.createScreen("high_score", score);
      this.fadeScreens(this.current_screen, "high_score", true, 800);
    } else {
      this.createScreen("lobby");
      this.fadeScreens(this.current_screen, "lobby", true, 800);
    }
  }, delay_time);
}




// Game.prototype.makeScreen = function(name) {
//   this.screens[name] = new PIXI.Container();
//   this.screens[name].name = name;
//   this.screens[name].position.x = this.width;
//   pixi.stage.addChild(this.screens[name]);
// }


// Game.prototype.clearScreen = function(screen) {
//   while(screen.children[0]) {
//     let x = screen.removeChild(screen.children[0]);
//     x.destroy();
//   }
// }

