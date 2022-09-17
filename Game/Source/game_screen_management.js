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


// Set up effects screens, then create and start with the first screen (defined in game.js).
Game.prototype.initializeScreens = function() {
  this.screens = [];

  this.black = PIXI.Sprite.from(PIXI.Texture.WHITE);
  this.black.width = 1664;
  this.black.height = 960;
  this.black.tint = 0x000000;
  this.black.visible = false;

  this.initializeMonitorOverlay();
  this.monitor_overlay.visible = true;

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
  this.monitor_overlay.visible = false;
  this.monitor_overlay.status = "visible";

  this.monitor_overlay.simple_restore = function() {
    if (this.status != "visible") {
      this.addChild(this.graphic);
      this.visible = true;
      this.status = "visible";
    }
  }

  this.monitor_overlay.restore = function() {
    if (this.status != "visible") {
      
      this.visible = true;
      this.status = "visible";

      let chunk_size = this.restore_voxels.length / 30;

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
        while(this.children[0]) { 
          this.removeChild(this.children[0]);
        }
        this.addChild(this.graphic);
      })
      .start();
    }
  }

  this.monitor_overlay.dissolve = function() {
    if (this.status == "visible") {
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


// Go to the game over screen or the high score screen.
Game.prototype.gameOverScreen = function(delay_time, score, force_exit = false) {
  delay(() => {
    if (!force_exit && this.game_type_selection == 0 
      && (this.difficulty_level == "EASY" || this.difficulty_level == "MEDIUM"
          || (this.difficulty_level == "HARD" && this.continues > 0))) {
      if (this.difficulty_level == "HARD") {
        this.continues -= 1;
      }
      this.initializeGameOver();
      this.createScreen("game_over");
      this.fadeScreens(this.current_screen, "game_over", true, 800);
    } else {
      let low_high = this.local_high_scores[this.getModeName()][this.difficulty_level.toLowerCase()][9];
      if (low_high == null || low_high.score < score) {
        this.createScreen("high_score");
        this.screens["high_score"].score = score;
        this.fadeScreens(this.current_screen, "high_score", true, 800);
      } else {
        this.createScreen("lobby");
        this.fadeScreens(this.current_screen, "lobby", true, 800);
      }
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

