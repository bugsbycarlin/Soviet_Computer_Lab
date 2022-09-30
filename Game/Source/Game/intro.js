//
// This file contains the Intro screen (with the animated alpha zoo logo).
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//


class Intro extends Screen {
  initialize() {
    makeBlank(this, game.width, game.height, 0, 0, 0x000000);

    this.state = null;

    game.fadeFromBlack(1200);

    this.lenin_and_flag = makeAnimatedSprite("Art/lenin_and_flag.json", "lenin_and_flags", this, game.width/2, game.height, 0.5, 1);
    this.lenin_and_flag.scale.set(6, 6);
    this.lenin_and_flag.animationSpeed = 0.2;
    this.lenin_and_flag.loop = false;
    this.lenin_and_flag.play();

    let font_48 = {fontFamily: "Press Start 2P", fontSize: 48, fill: 0xFFFFFF, letterSpacing: 2, align: "left",
      dropShadow: true, dropShadowColor: 0x444444, dropShadowDistance: 4, dropShadowAngle: Math.PI/4};

    this.alpha_zoo_text = makeText("ALPHA ZOO", font_48, this, 300, 250, 0.5, 0.5);
    this.alpha_zoo_text.visible = false;
    this.alpha_zoo_text.alpha = 0.01;
    delay(() => {
      this.alpha_zoo_text.visible = true;
      var tween = new TWEEN.Tween(this.alpha_zoo_text)
        .to({alpha: 1})
        .duration(1000)
        .easing(TWEEN.Easing.Cubic.InOut)
        .start();
    }, 2000);

    this.presents_text = makeText("PRESENTS", font_48, this, 300, 350, 0.5, 0.5);
    this.presents_text.visible = false;
    this.presents_text.alpha = 0.01;
    delay(() => {
      this.presents_text.visible = true;
      var tween = new TWEEN.Tween(this.presents_text)
        .to({alpha: 1})
        .duration(1000)
        .easing(TWEEN.Easing.Cubic.InOut)
        .start();
    }, 3500);

    // let image = makeSprite("Art/alpha_zoo_logo_v2.png", this, game.width/2, game.height/2, 0.5, 0.5);
    // image.alpha = 0;

    // let voxel_size = 6;

    // this.logo_voxels = [];

    // let pixels = pixi.renderer.extract.pixels(image);
    // for (var i = 0; i < pixels.length; i += 4) {
    //   let alpha = pixels[i + 3];
    //   if (alpha > 0) {
    //     let voxel = PIXI.Sprite.from(PIXI.Texture.WHITE);
    //     voxel.width = voxel_size;
    //     voxel.height = voxel_size;
    //     voxel.tint = 0xFFFFFF;
    //     let row = (i/4 - (i/4 % image.width)) / image.width;
    //     let col = i/4 % image.width;
    //     voxel.tint = PIXI.utils.rgb2hex([pixels[i] / 255, pixels[i + 1] / 255, pixels[i + 2] / 255]);
    //     voxel.alpha = alpha / 255;
    //     this.addChild(voxel);
    //     let angle = Math.floor(Math.random() * 360);
    //     voxel.orig_x = game.width / 2 + voxel_size * col - voxel_size * image.width / 2;
    //     voxel.orig_y = game.height / 2 + voxel_size * row - 120;
    //     voxel.x_dir = Math.cos(angle * (180 / Math.PI));
    //     voxel.y_dir = Math.sin(angle * (180 / Math.PI));
    //     voxel.position.set(voxel.orig_x + 1200 * voxel.x_dir, voxel.orig_y + 1200 * voxel.y_dir);
    //     this.logo_voxels.push(voxel);
    //   }

    // }

    // // dissolve the monitor secretly in the background so that
    // // it can be resolved when we switch to title. Note that this
    // // has to happen a second late so that the game has time to
    // // render the monitor overlay for the first time and load the
    // // texture. otherwise, the pixel extraction in the dissolve
    // // won't pick up any pixels.
    // game.monitor_overlay.visible = false;
    // delay(()=> {
    //   game.monitor_overlay.dissolve();
    // }, 1000);

    // this.state = "active";
    // this.start_time = markTime();

    // soundEffect("intro");

    delay(() => {
      game.fadeToBlack(1200);
    }, 5500);

    delay(() => {
      game.createScreen("title");
      game.popScreens("intro", "title");
      // game.monitor_overlay.restore();
    }, 6700);
  }


  update(diff) {
    // if (this.logo_voxels != null && this.state == "active") {
    //   let t = timeSince(this.start_time);

    //   let param = 1;
    //   if (t <= 1000) {
    //     param = Math.min(1,Math.pow(t / 1000, 2));
    //   } else if (t <= 2000) {
    //     // param = 1 + Math.max(0,0.001 * Math.sin((t - 200) / 20));
    //     param = 1;
    //   } else if (t > 2000) {
    //     param = Math.min(1,Math.pow((4000 - t) / 2000, 2));
    //   }

    //   for (var i = 0; i < this.logo_voxels.length; i++) {
    //     let voxel = this.logo_voxels[i];
    //     voxel.x = voxel.orig_x + 1200 * (1 - param) * voxel.x_dir;
    //     voxel.y = voxel.orig_y + 1200 * (1 - param) * voxel.y_dir;
    //     if (t > 3900) {
    //       voxel.alpha = 0;
    //     }
    //   }
    // }
  }
}

