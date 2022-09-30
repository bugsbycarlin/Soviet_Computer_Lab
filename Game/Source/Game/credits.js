//
// This file contains the credits screen.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//

class Credits extends Screen {
  initialize(extra_param = null) {
    makeBlank(this, game.width, game.height, 0, 0, 0x000000);

    let credits_y = 180;

    this.state = "active";

    this.tvs_dark = makeSprite("Art/Title/tvs_dark.png", this, 1022, 1280, 0.5, 1);
    this.tvs_dark.scale.set(16, 16);

    let font = (size) => {return {fontFamily: "Press Start 2P", fontSize: size, fill: 0xFFFFFF, letterSpacing: 6, align: "center"}};

    makeText("DESIGN, ART, PROGRAMMING", font(36), this, game.width / 2, credits_y, 0.5, 0.5);
    makeText("MATT CARLIN", font(24), this, game.width / 2, credits_y + 40, 0.5, 0.5);
    makeText("SOUND", font(36), this, game.width / 2, credits_y + 200, 0.5, 0.5);
    makeText("FREESOUND.ORG", font(18), this, game.width / 2, credits_y + 240, 0.5, 0.5);
    makeText("SPLICE.COM", font(18), this, game.width / 2, credits_y + 270, 0.5, 0.5);
    makeText("MUSIC", font(36), this, game.width / 2, credits_y + 400, 0.5, 0.5);
    makeText("FESLIYAN STUDIOS \n(DAVID FESLYIYAN AND DAVID RENDA)", font(18), this, game.width / 2, credits_y + 450, 0.5, 0.5);
    makeText("OPENGAMEART.ORG \n(SPRING AND NENE)", font(18), this, game.width / 2, credits_y + 520, 0.5, 0.5);
    makeText("ABSTRACTIONMUSIC.COM \n(LUDUM DARE 28, TRACKS 3 and 8)", font(18), this, game.width / 2, credits_y + 590, 0.5, 0.5);


    var left_shark = makeSprite("Art/rocket_american.png", this, 300, game.height / 2, 0.5, 0.5);
    left_shark.angle = -20;
    left_shark.scale.set(2, 2);
    this.left_shark_tween = new TWEEN.Tween(left_shark)
      .to({angle: 20})
      .repeat(Infinity)
      .yoyo(true)
      .duration(500)
      .easing(TWEEN.Easing.Quartic.InOut)
      .start()


    var right_shark = makeSprite("Art/rocket_soviet.png", this, game.width - 300, game.height / 2, 0.5, 0.5);
    right_shark.scale.set(2, 2);
    this.right_shark_tween = new TWEEN.Tween(right_shark)
      .to({angle: 359})
      .repeat(Infinity)
      .duration(2000)
      .start()


    let back_button = makeText("OK, WHATEVS", font(15), this, game.width/2, credits_y + 700, 0.5, 0.5);
    back_button.interactive = true;
    back_button.buttonMode = true;
    back_button.on("pointertap", ()=> {
      this.creditsBackToTitle();
    });
  }


  keyDown(ev) {
    if (ev.key === "Escape" && this.state != "leaving") {
      this.state = "leaving";
      this.creditsBackToTitle();
    }
  }


  creditsBackToTitle() {
    this.left_shark_tween.stop();
    this.right_shark_tween.stop();
    game.createScreen("title", true);
    game.popScreens("credits", "title");
  }
}


