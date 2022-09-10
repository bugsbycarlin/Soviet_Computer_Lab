

Game.prototype.initializeIntro = function() {
  let self = this;
  let screen = this.screens["intro"];
  this.clearScreen(screen);

  let background = PIXI.Sprite.from(PIXI.Texture.WHITE);
  background.width = this.width;
  background.height = this.height;
  background.tint = 0x000000;
  screen.addChild(background);

  this.intro_started = false;

  let image = new PIXI.Sprite(PIXI.Texture.from("Art/alpha_zoo_logo_v2.png"));
  // let image = new PIXI.Sprite(PIXI.Texture.from("Art/alpha_zoo_logo.png"));
  image.anchor.set(0.5, 0.5);
  image.position.set(this.width / 2, this.height / 2);
  image.alpha = 0;
  // image.scale.set(4, 4);
  // image.scaleMode = PIXI.SCALE_MODES.NEAREST;
  screen.addChild(image);
  let max_width = image.width;
  let max_height = image.height;
  let voxel_size = 6;

  this.intro_voxels = [];

  // console.log(PIXI.extract.webGL.pixels(image));
  let pixels = pixi.renderer.extract.pixels(image);
  for (var i = 0; i < pixels.length; i += 4) {
    let alpha = pixels[i + 3];
    if (alpha > 0) {
      let voxel = PIXI.Sprite.from(PIXI.Texture.WHITE);
      voxel.width = voxel_size;
      voxel.height = voxel_size;
      voxel.tint = 0xFFFFFF;
      let row = (i/4 - (i/4 % max_width)) / max_width;
      let col = i/4 % max_width;
      if (pixels[i] > 250 || pixels[i+1] > 250) {
        console.log("some");
        console.log(pixels[i]);
        console.log(pixels[i+1]);
        console.log(pixels[i+2]);
      }
      voxel.tint = PIXI.utils.rgb2hex([pixels[i] / 255, pixels[i + 1] / 255, pixels[i + 2] / 255]);
      voxel.alpha = alpha / 255;
      screen.addChild(voxel);
      let angle = Math.floor(Math.random() * 360);
      voxel.orig_x = this.width / 2 + voxel_size * col - voxel_size * max_width / 2;
      voxel.orig_y = this.height / 2 + voxel_size * row - 120;
      voxel.x_dir = Math.cos(angle * (180 / Math.PI));
      voxel.y_dir = Math.sin(angle * (180 / Math.PI));
      voxel.position.set(voxel.orig_x + 1200 * voxel.x_dir, voxel.orig_y + 1200 * voxel.y_dir);
      //voxel.alpha_wiggle = 1.5 + Math.random();
      //voxel.alpha = 0;
      this.intro_voxels.push(voxel);
    }

  }

  // use this if it's necessary to click to start the intro
  // background.interactive = true;
  // background.buttonMode = true;
  // background.on("pointerdown", function() {
  // });


  self.intro_started = true;
  self.intro_start_time = self.markTime();

  soundEffect("intro");

  delay(function() {
    self.initializeTitle();
    self.popScreens("intro", "title");
  }, 4500);
}


Game.prototype.introUpdate = function(diff) {
  var self = this;
  var screen = this.screens["intro"];

  if (this.intro_voxels != null && this.intro_started == true) {
    let t = this.timeSince(this.intro_start_time);

    let param = 1;
    if (t <= 1000) {
      param = Math.min(1,Math.pow(t / 1000, 2));
    } else if (t <= 2000) {
      // param = 1 + Math.max(0,0.001 * Math.sin((t - 200) / 20));
      param = 1;
    } else if (t > 2000) {
      param = Math.min(1,Math.pow((4000 - t) / 2000, 2));
    }

    for (var i = 0; i < this.intro_voxels.length; i++) {
      let voxel = this.intro_voxels[i];
      voxel.x = voxel.orig_x + 1200 * (1 - param) * voxel.x_dir;
      voxel.y = voxel.orig_y + 1200 * (1 - param) * voxel.y_dir;
      if (t > 3900) {
        voxel.alpha = 0;
      }
    }
    
  }
}

