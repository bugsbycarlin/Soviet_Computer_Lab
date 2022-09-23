
var cutscene_transition_speed = 1200;
var offscreen_width = 1536;
var offscreen_height = 1152;

Game.prototype.initializeCutscene = function(name = "intro") {
  let self = this;
  let screen = this.screens["cutscene"];
  this.clearScreen(screen);

  let background = PIXI.Sprite.from(PIXI.Texture.WHITE);
  background.width = this.width;
  background.height = this.height;
  background.tint = 0x000000;
  // slow moving desaturated background
  // let background = new PIXI.Sprite(PIXI.Texture.from("Art/Cutscenes/word_rockets_image_1280.png"));
  // background.width = this.width * 1.5;
  // background.height = this.height * 1.5;
  // let colorMatrix = new PIXI.filters.ColorMatrixFilter();
  // background.filters = [colorMatrix];
  // colorMatrix.desaturate();
  // colorMatrix.brightness(0.25, true);
  // let tween = new TWEEN.Tween(background.position)
  //   .to({x: -300, y: 100})
  //   .duration(100000)
  //   .start();
  screen.addChild(background);

  this.cutscene_pages = [];
  
  this.cutscene_container = new PIXI.Container();
  screen.addChild(this.cutscene_container);

  let cutscene_name = name;
  this.cutscene_items = scenes[cutscene_name];

  this.cutscene_state = "ready";
  this.cutscene_pagenum = 0;
  this.cutscene_name = name;

  this.sequence_num = 0;

  this.slideshow_number = -1;
  this.slideshow_timer = null;
  this.cutscene_mode = "interactive";

  let x = 0;
  let y = 0;
  let last_page = null;
  for (let i = 0; i < this.cutscene_items.length; i++) {
    let page = new PIXI.Container();
    page.position.set(x, y);
    page.appears = [];
    page.disappears = [];
    page.fade_out = [];
    page.fade_in = [];
    page.slide_right = [];
    page.sequence_max = 0;
    page.next = null;
    page.has_tournament_board = false;
    this.cutscene_container.addChild(page);
    this.cutscene_pages.push(page);

    let items = this.cutscene_items[i];
    
    for (let j = 0; j < items.length; j++) {
      let item = items[j];

      let artifact = null;
      if ("button" in item) {
        // {button: "Next", x: this.width - 90, y: this.height - 50, swipe_x: 1, swipe_y: -1}
        // Speech bubble version
        page.next = this.comicBubble(page, item.button, this.width - item.x, this.height - item.y);

        // page.next.interactive = true;
        // page.next.buttonMode = true;

        page.transition_x = -x;
        page.transition_y = -y;
        
        x += item.swipe_x * offscreen_width;
        y += item.swipe_y * offscreen_height;
        // page.next.on("pointerdown", function() {
        //   self.gotoCutscenePage(i+1);
        // });
        artifact = page.next;
        // if ("next_screen" in item) {
        //   this.cutscene_next_screen = item.next_screen; // last one is default
        //   page.next.on("pointerdown", function() {
        //     self.cutscene_next_screen = item.next_screen; // but you could have two and click one
        //     self.gotoCutscenePage(i+1);
        //   });
        // }
      } if ("no_button" in item) {
        // {button: "Next", x: this.width - 90, y: this.height - 50, swipe_x: 1, swipe_y: -1}
        
        page.transition_x = -x;
        page.transition_y = -y;
        
        x += item.swipe_x * offscreen_width;
        y += item.swipe_y * offscreen_height;
      } else if ("slideshow" in item) {
        this.slideshow_number = item.slideshow;
        page.transition_x = -x;
        page.transition_y = -y;
        x += offscreen_width;
        y += 0;
      } else if ("square" in item) {
        let square = PIXI.Sprite.from(PIXI.Texture.WHITE);
        square.anchor.set(0.5, 0.5);
        square.position.set(item.x, item.y);
        square.width = item.w;
        square.height = item.h;
        page.addChild(square);
        artifact = square;
      } else if ("text" in item) {
        let size = 36;
        if ("size" in item) size = item.size;
        let font_family = "Bangers";
        if ("font_family" in item) font_family = item.font_family;
        artifact = this.comicBubble(page, item.text, item.x, item.y, size, font_family);
      } else if ("credits" in item) {
        let words = item.credits;
        for (let l = 0; l < words.length; l++) {
          let letter = words[l];
          let tile = this.makePixelatedLetterTile(page, letter.toUpperCase(), "black");
          tile.x = item.x - 32 * words.length / 2 + 32 * l;
          tile.y = item.y;
          let tile2 = this.makePixelatedLetterTile(page, letter.toUpperCase(), "white");
          tile2.x = item.x - 32 * words.length / 2 + 32 * l - 2;
          tile2.y = item.y - 2;
        }

      } else if ("image" in item) {
        let image = new PIXI.Sprite(PIXI.Texture.from("Art/Cutscenes/" + item.image));
        image.anchor.set(0.5, 0.5);
        image.position.set(item.x, item.y);
        page.addChild(image);
        artifact = image;
      } else if ("tournament_board" in item) {
        let image = new PIXI.Sprite(PIXI.Texture.from("Art/Cutscenes/wng_computer_games_tournament.png"));
        image.anchor.set(0.5, 0.5);
        image.position.set(640, 480);
        page.addChild(image);
        page.has_tournament_board = true;

        this.tournament_board = new PIXI.Container();
        this.tournament_board.boards = [];
        this.tournament_board.complete = false;
        this.tournament_board.usa = null;
        this.tournament_board.above = null;
        artifact = this.tournament_board;
        page.addChild(this.tournament_board);

        this.tournament_board.usa_position = 9 - parseInt(name.replace("c", ""));
        let usa_position = this.tournament_board.usa_position;
        this.tournament_board.above_position = this.tournament_board.usa_position - 1;

        let country_list = ["USSR", "FRA", "GBR", "POL", "JPN", "CSK", "NOR"];
        country_list.splice(usa_position, 0, "USA");
        for (let i = 0; i < country_list.length; i++) {
          let board = new PIXI.Container();
          board.position.set(640, 480 - 110 + 55 * i)
          this.tournament_board.addChild(board)
          this.tournament_board.boards.push(board);
          
          let shadow_square = PIXI.Sprite.from(PIXI.Texture.WHITE);
          shadow_square.anchor.set(0.5, 0.5);
          shadow_square.position.set(3, 3);
          shadow_square.width = 400;
          shadow_square.height = 50;
          shadow_square.alpha = 0.3;
          shadow_square.tint = 0x000000;
          board.addChild(shadow_square);

          let black_square = PIXI.Sprite.from(PIXI.Texture.WHITE);
          black_square.anchor.set(0.5, 0.5);
          black_square.position.set(0, 0);
          black_square.width = 402;
          black_square.height = 52;
          black_square.tint = 0x000000;
          board.addChild(black_square);

          let square = PIXI.Sprite.from(PIXI.Texture.WHITE);
          square.anchor.set(0.5, 0.5);
          square.position.set(0, 0);
          square.width = 400;
          square.height = 50;
          board.addChild(square);

          let text = new PIXI.Text((i+1) + ".      " + country_list[i], {fontFamily: "Bebas Neue", fontSize: 36, fill: 0x000000, letterSpacing: 6, align: "left"});
          text.anchor.set(0,0.5);
          text.position.set(-190, 4);
          // text.text += country_list[i] == "USSR" ? "     " : "      ";
          // text.text += this.score;
          board.addChild(text);
          board.text = text;

          let flag = new PIXI.Sprite(PIXI.Texture.from("Art/Cutscenes/flag_" + country_list[i] + ".png"));
          flag.anchor.set(0.5, 0.5);
          flag.position.set(-128, 1);
          flag.scale.set(0.9, 0.9);
          board.addChild(flag);

          let score = Math.floor((this.score) * Math.pow(1.1, usa_position - i));
          if (i > usa_position) {
            score = Math.floor((this.score) / Math.pow(1.1, i - usa_position));
          }
          //score = Math.max(score, 100 * (9 - i));
          if (i == usa_position) score = this.score;
          let score_text = new PIXI.Text(score, {fontFamily: "Bebas Neue", fontSize: 36, fill: 0x000000, letterSpacing: 6, align: "right"});
          score_text.anchor.set(1,0.5);
          score_text.position.set(190, 4);
          board.addChild(score_text);

          if (i == usa_position) {
            console.log("yes, this is the usa");
            this.tournament_board.usa = board;
          }
          if (i == this.tournament_board.above_position) {
            this.tournament_board.above = board;
            this.tournament_board.above_country = country_list[i];
          }

        }
  //     {text: "       USSR       ", x: 640, y: 480 - 100},
  //     {text: "       FRA        ", x: 640, y: 480 - 45},
  //     {text: "       GBR        ", x: 640, y: 480 + 10},
  //     {text: "       USA        ", x: 640, y: 480 + 65},
  //     {text: "       POL        ", x: 640, y: 480 + 120},
  //     {text: "       JPN        ", x: 640, y: 480 + 175},
  //     {text: "       CSK        ", x: 640, y: 480 + 230},
  //     {text: "       NOR        ", x: 640, y: 480 + 285},
      }

      if ("drift" in item) {
        if (item.drift != "scale") {
          let x_d = 0;
          let y_d = 0;
          if (item.drift == "left") x_d = -100;
          if (item.drift == "right") x_d = 100;
          if (item.drift == "up") y_d = -100;
          if (item.drift == "down") y_d = 100;
          let x = artifact.x;
          let y = artifact.y;
          artifact.tween = new TWEEN.Tween(artifact.position)
            .to({x: x + x_d, y: y + y_d})
            .duration(60000)
            .start();
        } else {
          let s_x = artifact.scale.x;
          let s_y = artifact.scale.y;
          artifact.tween = new TWEEN.Tween(artifact.scale)
            .to({x: 1.1 * s_x, y: 1.1 * s_y})
            .duration(60000)
            .start();
        }
      }

      if ("appears" in item) {
        artifact.appears = item.appears;
        page.appears.push(artifact);
        page.sequence_max = Math.max(page.sequence_max, item.appears)
        artifact.visible = false;
        artifact.shaking = false;
        artifact.permanent_x = artifact.position.x;
        artifact.permanent_y = artifact.position.y;
      }

      if ("disappears" in item) {
        artifact.disappears = item.disappears;
        page.disappears.push(artifact);
        page.sequence_max = Math.max(page.sequence_max, item.disappears)
      }

      if ("fade_out" in item) {
        artifact.fade_out = item.fade_out;
        page.fade_out.push(artifact);
        page.sequence_max = Math.max(page.sequence_max, item.fade_out)
      }

      if ("fade_in" in item) {
        artifact.fade_in = item.fade_in;
        artifact.visible = false;
        page.fade_in.push(artifact);
        page.sequence_max = Math.max(page.sequence_max, item.fade_in)
      }

      if ("slide_right" in item) {
        artifact.slide_right = item.slide_right;
        page.slide_right.push(artifact);
        page.sequence_max = Math.max(page.sequence_max, item.slide_right)
      }
    }

    if (page.sequence_max > 0 && page.next != null) page.next.visible = false;

    last_page = page;
  }

  screen.interactive = true;
  screen.buttonMode = true;
  screen.on("pointertap", function() {
    if (self.cutscene_mode == "interactive") {
      self.gotoCutscenePage(self.cutscene_pagenum + 1);
    }
  });

  if (name != "c8") {
    setMusic("cutscene_song");
  } else {
    setMusic("final_song");
  }

  if (self.checkTournamentBoard()) {
    self.cutscene_state = "transitioning";
    self.tournament_board.parent.next.visible = false;
    delay(function() {
        self.setTournamentBoard();
    }, 1500);
  }

}


Game.prototype.cutsceneKeydown = function(ev) {
  if (this.cutscene_mode == "interactive") {
      if (ev.key === "Enter" || ev.key === " ") {
        this.gotoCutscenePage(this.cutscene_pagenum + 1);
      }
    }

    if (ev.key === "Escape") {
      this.endCutscene();
    }
}


Game.prototype.gotoCutscenePage = function(page_num) {
  var self = this;
  if (this.cutscene_state != "ready") {
    return;
  }

  console.log("Sequence Num Before: " + this.sequence_num);
  if (this.sequence_num < this.cutscene_pages[this.cutscene_pagenum].sequence_max) {
    this.sequence_num += 1;

    let something_appeared = false;
    for (let j = 0; j < this.cutscene_pages[this.cutscene_pagenum].appears.length; j++) {
      let artifact = this.cutscene_pages[this.cutscene_pagenum].appears[j];
      if (this.sequence_num == artifact.appears) {
        artifact.visible = true;
        artifact.shaking = true;
        delay(function() {
          self.cutscene_pages[self.cutscene_pagenum].appears[j].shaking = false;
        }, 100);
        something_appeared = true;
      }
    }

    if (something_appeared) soundEffect("slap_" + Math.ceil(Math.random() * 4));
    
    for (let j = 0; j < this.cutscene_pages[this.cutscene_pagenum].disappears.length; j++) {
      if (this.sequence_num == this.cutscene_pages[this.cutscene_pagenum].disappears[j].disappears) {
        this.cutscene_pages[this.cutscene_pagenum].disappears[j].visible = false;
      }
    }

    for (let j = 0; j < this.cutscene_pages[this.cutscene_pagenum].fade_out.length; j++) {
      if (this.sequence_num == this.cutscene_pages[this.cutscene_pagenum].fade_out[j].fade_out) {
        let artifact = this.cutscene_pages[this.cutscene_pagenum].fade_out[j];
        let fade_tween = new TWEEN.Tween(artifact)
          .to({alpha: 0})
          .duration(1000)
          .onComplete(function() {
            artifact = false;
          })
          .start();
      }
    }

    for (let j = 0; j < this.cutscene_pages[this.cutscene_pagenum].fade_in.length; j++) {
      if (this.sequence_num == this.cutscene_pages[this.cutscene_pagenum].fade_in[j].fade_in) {
        let artifact = this.cutscene_pages[this.cutscene_pagenum].fade_in[j];
        artifact.visible = true;
        artifact.alpha = 0.01;
        let fade_tween = new TWEEN.Tween(artifact)
          .to({alpha: 1})
          .duration(2000)
          .start();
      }
    }

    for (let j = 0; j < this.cutscene_pages[this.cutscene_pagenum].slide_right.length; j++) {
      if (this.sequence_num == this.cutscene_pages[this.cutscene_pagenum].slide_right[j].slide_right) {
        let artifact = this.cutscene_pages[this.cutscene_pagenum].slide_right[j];
        let x = artifact.x;
        let fade_tween = new TWEEN.Tween(artifact)
          .to({x: x + 266})
          .duration(1500)
          .onComplete(function() {
          })
          .start();
      }
    }

    console.log("Angel checks");
    console.log(this.slideshow_number);
    console.log(this.sequence_num);
    if (this.slideshow_number > 0 
      && this.sequence_num == this.slideshow_number) {
      console.log("it is now a slideshow");
      this.cutscene_mode = "slideshow";
      this.slideshow_timer = this.markTime();
    }

    console.log("Sequence Num After: " + this.sequence_num);
    return;
  }

  if (this.cutscene_mode == "interactive") {
    soundEffect("button_chirp");
  }
  
  if (page_num >= this.cutscene_items.length) {
    this.endCutscene(false);
    return;
  }

  this.cutscene_state = "transitioning";
  for (let p = 0; p < this.cutscene_items.length; p++) {
    if (p != page_num - 1 && p != page_num) {
      this.cutscene_pages[p].visible = false;
    } else {
      this.cutscene_pages[p].visible = true;
    }
    if (this.cutscene_pages[p].next != null) {
      this.cutscene_pages[p].next.interactive = false;
      this.cutscene_pages[p].next.visible = false;
    }
  }

  this.sequence_num = 0;
  for (let j = 0; j < this.cutscene_pages[page_num].appears.length; j++) {
    this.cutscene_pages[page_num].appears[j].visible = false;
  }

  // let m_x = this.cutscene_container.x;
  // let m_y = this.cutscene_container.y;
  let t_x = this.cutscene_pages[page_num].transition_x;
  let t_y = this.cutscene_pages[page_num].transition_y;
  let tween = new TWEEN.Tween(this.cutscene_container.position)
    .to({x: t_x, y: t_y})
    .duration(cutscene_transition_speed)
    .easing(TWEEN.Easing.Cubic.InOut)
    .onComplete(function() {
      delay(function() {
        for (var p = 0; p < self.cutscene_items.length; p++) {
          if (self.cutscene_pages[p].next != null) {
            self.cutscene_pages[p].next.interactive = true;
            if (self.cutscene_pages[p].sequence_max == 0) {
              self.cutscene_pages[p].next.visible = true;
            }
          }
        }
        console.log("end of tween");
        self.cutscene_state = "ready";
        self.cutscene_pagenum = self.cutscene_pagenum + 1;

        if(self.checkTournamentBoard()) {
          self.setTournamentBoard();
        }
      }, 200)})
    .start();
}


Game.prototype.endCutscene = function(play_sound = true) {
  if (this.cutscene_state != "ready") {
    return;
  }
  if (play_sound) {
    soundEffect("button_chirp");
  }
  this.cutscene_state = "transitioning";
  for (var p = 0; p < this.cutscene_items.length; p++) {
    if (p != this.cutscene_pagenum) {
      this.cutscene_pages[p].visible = false;
    }
    if (this.cutscene_pages[p].next != null) {
      this.cutscene_pages[p].next.interactive = false;
      this.cutscene_pages[p].next.visible = false;
    }
  }

  this.slideshow_timer = null;
  
  this.nextFlow();

  // if (this.cutscene_next_screen != "title") {
  //   fadeMusic(0);
  // }

  // this.initializeScreen(this.cutscene_next_screen);
  // if (this.cutscene_next_screen != "title") {
  //   this.switchScreens("cutscene", this.cutscene_next_screen);
  // } else {
  //   this.fadeScreens("cutscene", this.cutscene_next_screen, true);
  // }
}


Game.prototype.checkTournamentBoard = function() {
  let self = this;
  console.log("in the function");
  if (this.cutscene_pages[this.cutscene_pagenum].has_tournament_board == true 
    && this.tournament_board != null
    && this.cutscene_name != "c1"
    && this.tournament_board.visible == true
    && this.tournament_board.complete == false) {
    return true;
  }
}

Game.prototype.setTournamentBoard = function() {
  let self = this;
  this.tournament_board.complete = false;
  this.cutscene_state = "transitioning";
  this.tournament_board.parent.next.visible = false;

  console.log("in the if block");
  let y1 = this.tournament_board.usa.position.y;
  let y2 = this.tournament_board.above.position.y;
  let tween = new TWEEN.Tween(this.tournament_board.usa.position)
    .to({y: y2})
    .duration(500)
    .easing(TWEEN.Easing.Cubic.InOut)
    .onComplete(function() {
      self.cutscene_state = "ready";
    })
    .start();
  let tween2 = new TWEEN.Tween(this.tournament_board.above.position)
    .to({y: y1})
    .duration(500)
    .easing(TWEEN.Easing.Cubic.InOut)
    .onComplete(function() {
    })
    .start();
  delay(function() {
    self.tournament_board.usa.text.text = (self.tournament_board.above_position+1) + ".      " + "USA";
    self.tournament_board.above.text.text = (self.tournament_board.usa_position+1) + ".      " + self.tournament_board.above_country;
  }, 250);
  delay(function() {
    self.tournament_board.complete = true;
    self.tournament_board.parent.next.visible = true;
  }, 1000)
}


Game.prototype.cutsceneUpdate = function(diff) {
  var self = this;
  var screen = this.screens["cutscene"];

  if (this.cutscene_pages != null && this.cutscene_pages.length > 0) {
    for (let j = 0; j < this.cutscene_pages[this.cutscene_pagenum].appears.length; j++) {
      let artifact = this.cutscene_pages[this.cutscene_pagenum].appears[j];
      if (artifact.shaking) {
        artifact.position.set(
          artifact.permanent_x - 2 + Math.floor(Math.random() * 4),
          artifact.permanent_y - 2 + Math.floor(Math.random() * 4)
        );
      } else {
        artifact.position.set(artifact.permanent_x, artifact.permanent_y);
      }
    }
  }

  if (this.slideshow_timer != null && this.timeSince(this.slideshow_timer) > 6000) {
    this.slideshow_timer = this.markTime();
    this.gotoCutscenePage(this.cutscene_pagenum + 1);
  }
}




scenes = {
  t1: [
    [
      {text: "Welcome to Cold War Keyboards!", x: 640, y: 200},
      {text: "In this retro typing game, a group of \nAmerican teenagers are thrown into \n a video game tournament against the USSR.", x: 640, y: 375},
      {text: "There are three games within the game.", x: 640, y: 550},
      {text: "The first is Word Rockets. \nLet's go learn to play it.", x: 640, y: 700},
      {button: "OK", x: 90, y: 50, swipe_x: 1, swipe_y: 0}
    ],
  ],
  t2: [
    [
      {text: "Good job!", x: 640, y: 200},
      {text: "The second game is Base Capture.", x: 640, y: 375},
      {text: "Let's learn that too.", x: 640, y: 550},
      {button: "OK", x: 90, y: 50, swipe_x: 1, swipe_y: 0}
    ],
  ],
  t3: [
    [
      {text: "Excellent.", x: 640, y: 200},
      {text: "I particularly liked that one play you made.", x: 640, y: 375},
      {text: "The last game is Launch Code.", x: 640, y: 550},
      {text: "Ready to learn it?", x: 640, y: 700},
      {button: "YEP", x: 90, y: 50, swipe_x: 1, swipe_y: 0}
    ],
  ],
  t4: [
    [
      {text: "Nice work!", x: 640, y: 200},
      {text: "You now have the skills you need \nto play Cold War Keyboards.", x: 640, y: 375},
      {text: "Good luck!", x: 640, y: 550},
      {button: "BYE", x: 90, y: 50, swipe_x: 1, swipe_y: 0}
    ],
  ],
  c1: [
    [
      {image: "1988.png", x: 600, y: 440},
      {text: "1988", x: 180, y: 160, drift: "right"},
      {text: "Crazy time to live in Berlin.", x: 890, y: 720, drift: "left"},
      {button: "Next", x: 90, y: 50, swipe_x: 0, swipe_y: 1}
    ],
    [
      {image: "fight_image.png", x: 690, y: 480},
      {text: "Tensions were high at the first \nWorld Nerd Games.", x: 360, y: 160, drift: "right"},
      {text: "The opening ceremonies were chaos.", x: 810, y: 810, drift: "left"},
      {button: "Next", x: 90, y: 50, swipe_x: 0, swipe_y: 1}
    ],
    [
      {image: "lab_image.png", x: 640, y: 410, drift: "up"},
      {text: "The US and USSR flouted the rules, fielding \nteams of elite professionals.", x: 630, y: 760, drift: "down"},
      {button: "Next", x: 90, y: 50, swipe_x: 1, swipe_y: 0}
    ],
    [
      {image: "games_image.png", x: 660, y: 510},
      {text: "Mathletes and chess masters competed alongside \ncube solvers and tetris champions.", x: 590, y: 200, drift: "up"},
      {text: "But one computer game had us all in thrall.", x: 730, y: 790, drift: "down"},
      {button: "Next", x: 90, y: 50, swipe_x: -1, swipe_y: 1}
    ],
    [
      {image: "word_rockets.png", x: 640, y: 480, drift: "scale"},
      {text: "Mavis Bennett's \"Word Rockets\" used \nadvanced LASER technology...", x: 420, y: 60},
      {text: "to give digital objects physical form.", x: 810, y: 460},
      {text: "My class was addicted.", x: 1000, y: 660},
      {button: "Next", x: 90, y: 50, swipe_x: 1, swipe_y: 0}
    ],
    [
      {text: "But just before the games began...", x: 640, y: 480},
      {button: "Next", x: 90, y: 50, swipe_x: 0, swipe_y: 1}
    ],
    [
      {image: "building_image.png", x: 660, y: 450, drift: "right"},
      {text: "An accident!", x: 360, y: 180, drift: "up"},
      {text: "The US team was killed in a training exercise \nwhen their computers launched streams of \nchemical names, causing an explosion.", x: 720, y: 760, drift: "down"},
      {button: "Next", x: 90, y: 50, swipe_x: 1, swipe_y: 0}
    ],
    [
      {image: "putzen_class_image_v4.png", x: 660, y: 450},
      {text: "Our teacher, Mr Putzen, brought our entire \nclass to the training facility...", x: 480, y: 120, drift: "down"},
      {text: "and offered us as last minute replacements.", x: 800, y: 800, drift: "up"},
      {button: "Next", x: 90, y: 50, swipe_x: 0, swipe_y: 1}
    ],
    [
      {image: "us_vs_them.png", x: 620, y: 450},
      {text: "So we went up against the Russians. \nThey were bigger, they were stronger, \nthey were really good typists...", x: 430, y: 120},
      {text: "But god damnit*, we were Americans.", x: 850, y: 750, drift: "left"},
      {text: "*Sorry, Mom", x: 200, y: 900},
      {button: "Next", x: 120, y: 50, swipe_x: 0, swipe_y: 1}
    ],
    [
      {button: "Go go go!", x: 120, y: 40, swipe_x: 1, swipe_y: 0},
      {tournament_board: "okay!"}
    ],
  ],
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
  c2: [
    [
      {button: "Next", x: 120, y: 40, swipe_x: 1, swipe_y: 0},
      {tournament_board: "okay!"}
    ],
    [
      {image:"lighted_stage.png", x: 640, y: 480},
      {image: "andy_loses.png", x: 640, y: 480},
      {text: "I lost... \nto a kid.", x: 580, y: 420},
      {button: "Next", x: 120, y: 50, swipe_x: 0, swipe_y: 1}
    ],
    [
      {button: "Next", x: 90, y: 50, swipe_x: 1, swipe_y: 0},
      {text: "Moskva...", x: 640, y: 480}
    ],
    [
      {image: "zhukov.png", x: 690, y: 420},
      {appears: 1, disappears: 4, text: "You are obsessed with this *game*, \nGeorgy. It is unhealthy.", size: 36, x: 860, y: 150},
      {appears: 2, disappears: 4, text: "It is the perfect combination of strategy and combat. \nThe Americans will use this to raise an unstoppable \ngeneral staff. I must go to the competition.", size: 36, x: 580, y: 800},
      {appears: 3, disappears: 4, text: "I must destroy them.", size: 36, x: 870, y: 900},
      // {appears: 8, button: "Next", x: 90, y: 50, swipe_x: 1, swipe_y: -1},
      {appears: 5, text: "But you're too old.", size: 36, x: 990, y: 180},
      {appears: 6, text: "The fuck I am.", size: 36, x: 510, y: 800},
      {appears: 7, text: "Look at my high score.", size: 36, x: 850, y: 840},
      {appears: 8, button: "Next", x: 90, y: 50, swipe_x: 0, swipe_y: 1},
    ],
    [
      {button: "Next", x: 90, y: 50, swipe_x: 1, swipe_y: 0},
      {text: "Berlin...", x: 640, y: 480}
    ],
    [
      {image:"official.png", x: 255, y: 520},
      {appears: 1, text: "For the Base Capture portion of the \ncompetition, the USSR selects...", size: 36, x: 420, y: 100},
      {appears: 2, text: "Moskva High student Georgy Zhukov.", size: 36, x: 640, y: 860},
      {appears: 2, image:"zhukov_2b.png", x: 640, y: 450},
      {appears: 3, image:"surprised_kid.png", x: 1000, y: 520},
      {appears: 4, button: "Go go go!", x: 130, y: 50, swipe_x: 1, swipe_y: 0},
    ],
  ],
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------  
  c3: [
    [
      {button: "Next", x: 120, y: 40, swipe_x: 1, swipe_y: 0},
      {tournament_board: "okay!"}
    ],
    [
      {image:"lighted_stage.png", x: 640, y: 480},
      {disappears: 1, image:"zhukov_loses_1.png", x: 640, y: 480},
      {appears: 1, image:"zhukov_loses_2.png", x: 640, y: 480},
      {appears: 2, text: "Good job! You have my respect, \n and a bright future in computers.", size: 36, x: 780, y: 240},
      {appears: 3, button: "Next", x: 90, y: 50, swipe_x: 0, swipe_y: 1},
    ],
    [
      {disappears: 1, image:"ivan_breaks_keyboard_1.png", x: 640, y: 480},
      {appears: 1, image:"ivan_breaks_keyboard_2.png", x: 640, y: 480},
      {appears: 1, text: "I must break you!", size: 36, x: 700, y: 280},
      {appears: 2, button: "Go go go!", x: 130, y: 50, swipe_x: 0, swipe_y: 1},
    ],
  ],
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
  c4: [
    [
      {button: "Next", x: 120, y: 40, swipe_x: 1, swipe_y: 0},
      {tournament_board: "okay!"}
    ],
    [
      {image:"lighted_stage.png", x: 640, y: 480},
      {image: "ivan_loses.png", x: 640, y: 480},
      {appears: 2, disappears: 3, text: "You broke me.", x: 540, y: 320},
      {appears: 3, disappears: 4, text: "Well... both teams \nplayed hard, man.", x: 940, y: 240},
      {appears: 4, button: "Next", x: 120, y: 50, swipe_x: 0, swipe_y: 1},
    ],
    [
      {image:"kids_are_tired.png", x: 640, y: 480},
      {disappears: 1, text: "Inspirational Speech Time.", size: 36, x: 400, y: 100},
      {appears: 1, disappears: 2, text: "Mister Putzen, we're so tired. \nWe need a miracle.", size: 36, x: 500, y: 380},
      {appears: 2, image:"putzen_hand.png", x: 640, y: 480},
      {appears: 2, disappears: 3, text: "Nobody should pin their hopes \n       on a miracle.", size: 36, x: 800, y: 220},
      {appears: 3, button: "Next", x: 90, y: 50, swipe_x: 0, swipe_y: 1},
    ],
    [
      {image:"official.png", x: 255, y: 450},
      {appears: 1, disappears: 3, text: "For the second round of Word Rockets, \nthe USSR selects Count - ", size: 36, x: 420, y: 100},
      {appears: 2, disappears: 3, text: "Ahem, Comrade Tiron Rogov.", size: 36, x: 840, y: 140},
      {appears: 2, disappears: 4, image:"montoya_0.png", x: 1000, y: 450},
      {appears: 2, disappears: 3, image:"comrade_tiron_rogov.png", x: 580, y: 520},
      {appears: 3, image:"comrade_tiron_rogov_2.png", x: 580, y: 520},
      {appears: 4, disappears: 5, image:"montoya_1.png", x: 1000, y: 450},
      {appears: 4, disappears: 5, text: "Hey bro, isn't this \nthe guy who killed your father?.", size: 36, x: 860, y: 100},
      {appears: 5, image:"montoya_2.png", x: 1000, y: 450},
      {appears: 5, text: "Shut up, dude.", size: 36, x: 900, y: 140},
      {appears: 6, button: "Go go go!", x: 130, y: 50, swipe_x: 1, swipe_y: 0},
    ],
  ],
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
  c5: [
    [
      {button: "Next", x: 120, y: 40, swipe_x: 1, swipe_y: 0},
      {tournament_board: "okay!"}
    ],
    [
      {image:"lighted_stage.png", x: 640, y: 480},
      {image: "rogov_loses.png", x: 640, y: 480},
      {appears: 2, disappears: 3, text: "Who would have thought a six \nfingered hand could cramp this badly?", x: 500, y: 320},
      {appears: 3, disappears: 4, text: "What's your secret? \nWhere do you get your speed?", x: 500, y: 320},
      {appears: 4, disappears: 5, text: "Honestly? Metallica.", x: 940, y: 240},
      {appears: 5, disappears: 6, text: "Metallic what?.", x: 540, y: 320},
      {appears: 6, disappears: 7, text: "Metallica. The band. \nMaster of Puppets? Battery? \nCreeping Death?", x: 940, y: 240},
      {appears: 7, disappears: 8, text: "You should try it, bro.", x: 940, y: 240},
      {appears: 8, disappears: 9, text: "Oh, I will.", x: 500, y: 320},
      {appears: 9, button: "Next", x: 120, y: 50, swipe_x: 0, swipe_y: 1},
      
    ],
    [
      {image:"kids_are_tired_2.png", x: 640, y: 480},
      {appears: 1, disappears: 2, text: "Guys, is going to be okay.", size: 36, x: 600, y: 280},
      {appears: 2, disappears: 3, text: "I sent a ringer to enemy team. \nYou can't lose against him.", size: 36, x: 800, y: 220},
      {appears: 3, button: "Next", x: 90, y: 50, swipe_x: 0, swipe_y: 1},
    ],
    [
      {image:"official.png", x: 255, y: 450},
      {appears: 1, disappears: 3, text: "For the semifinal found, \nthe USSR chooses", size: 36, x: 420, y: 100},
      {appears: 2, disappears: 3, text: "Volga Technical student FEDOR Avtomat", size: 36, x: 610, y: 180},
      {appears: 2, image:"fedor_avtomat.png", x: 580, y: 520},
      {appears: 3, disappears: 4, text: "FEDOR.", size: 36, x: 710, y: 320},
      {appears: 4, disappears: 6, image:"surprised_kid_2.png", x: 1000, y: 590},
      {appears: 5, disappears: 6, text: "Sigh.", size: 36, x: 1110, y: 370},
      {appears: 6, image:"determined_kid.png", x: 1000, y: 590},
      {appears: 7, button: "Go go go!", x: 130, y: 50, swipe_x: 1, swipe_y: 0},
    ],
  ],
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
  c6: [
    [
      {button: "Next", x: 120, y: 40, swipe_x: 1, swipe_y: 0},
      {tournament_board: "okay!"}
    ],
    [
      {image:"stage_lights_background.png", x: 640, y: 480},
      {disappears: 4, image:"kids_struggling.png", x: 640, y: 480},
      {appears: 1, image:"fedor_frustrated.png", x: 640, y: 480},
      {appears: 2, disappears: 3, text: "She's not human.", size: 36, x: 350, y: 180},
      {appears: 3, disappears: 4, text: "She's like a piece of iron.", size: 36, x: 350, y: 280},
      {appears: 5, image:"hooded_figure.png", x: 640, y: 480},
      {appears: 6, text: "Hold out for one more round.", size: 36, x: 750, y: 180},
      {appears: 7, text: "Then I will be ready.", size: 36, x: 870, y: 250},
      {appears: 8, text: "DUN", size: 36, x: 900, y: 700},
      {appears: 9, text: "DUN", size: 36, x: 1020, y: 730},
      {appears: 10, text: "DUN!", size: 36, x: 1150, y: 760},
      {appears: 11, button: "Go go go!", x: 120, y: 50, swipe_x: 0, swipe_y: 1},
    ],
  ],
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
  c7: [
    [
      {button: "Next", x: 120, y: 40, swipe_x: 1, swipe_y: 0},
      {tournament_board: "okay!"}
    ],
    [
      {image:"lighted_stage.png", x: 640, y: 480},
      {image: "fedor_defeated.png", x: 640, y: 480},
      {appears: 1, disappears: 8, image: "girl_victorious.png", x: 640, y: 480},
      {appears: 1, disappears: 2, text: "I did it!", size: 36, x: 400, y: 160},
      {appears: 2, disappears: 3, image: "boy_victorious.png", x: 640, y: 480},
      {appears: 3, image: "official_reveals_putin.png", x: 640, y: 480},
      {appears: 3, disappears: 8, image: "putin_revealed.png", x: 640, y: 480},
      {appears: 3, disappears: 8, image: "boy_surprised.png", x: 640, y: 480},
      {appears: 4, disappears: 5, text: "You're", size: 36, x: 740, y: 160},
      {appears: 5, disappears: 6, text: "Yes.", size: 36, x: 940, y: 180},
      {appears: 6, text: "Final competitor for the USSR...", size: 36, x: 900, y: 100},
      {appears: 7, text: "Wladimir Putin.", size: 36, x: 1060, y: 160},
      {appears: 8, image: "boy_intimidated.png", x: 640, y: 480},
      {appears: 8, image: "putin_smiles.png", x: 640, y: 480},
      {appears: 9, button: "Go go go!", x: 140, y: 50, swipe_x: 0, swipe_y: 1},
    ],
  ],
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------
  c8: [
    [
      {button: "Next", x: 120, y: 40, swipe_x: 1, swipe_y: 0},
      {tournament_board: "okay!"}
    ],
    [
      {image:"lighted_stage.png", x: 640, y: 480},
      {disappears: 3, slide_right: 2, image: "putin_loses.png", x: 640, y: 480},
      {fade_out: 2, image: "kids_victorious.png", x: 640, y: 480},
      {disappears: 1, text: "We win!!! We win!!!", size: 36, x: 900, y: 160},
      {appears: 1, disappears: 2, text: "I lose...", size: 36, x: 450, y: 300},
      {appears: 3, disappears: 8, image: "putin_accepts.png", x: 640, y: 480},
      {appears: 3, disappears: 4, text: "Ah well.", size: 36, x: 700, y: 280},
      {fade_in: 4, disappears: 8, image: "russians_gathered.png", x: 640, y: 480},
      {appears: 5, disappears: 6, text: "Sir, what does this mean for Soviet dominance? \nWill we be okay? What will you do?", size: 36, x: 750, y: 100},
      {appears: 6, disappears: 7, text: "Everything will probably never be okay. \nBut you have to try.", size: 36, x: 600, y: 160},
      {appears: 7, disappears: 8, text: "As for me...", size: 36, x: 650, y: 180},
      {appears: 8, image: "putin_rides.png", x: 640, y: 480},
      {appears: 9, fade_out: 10, text: "I'm going \nhome.", size: 36, x: 1100, y: 160},
      {fade_in: 10, image: "black_bars.png", x: 640, y: 480},
      {slideshow: 10},
    ],
    [
      {image:"word_rockets.png", x: 640, y: 480, drift: "right"},
      {image: "black_bars.png", x: 640, y: 480},
      {credits:"PROGRAMMING", x: 340, y: 420},
      {credits:"MATT CARLIN", x: 930, y: 560},
      {no_button: "Next", swipe_x: 1, swipe_y: 1},
      // {button: "Next", x: 120, y: 50, swipe_x: 0, swipe_y: 1},
    ],
    [
      {image:"games_image.png", x: 640, y: 400, drift: "down"},
      {image: "black_bars.png", x: 640, y: 480},
      {credits:"DESIGN", x: 630, y: 270},
      {credits:"MATT CARLIN", x: 630, y: 700},
      {no_button: "Next", swipe_x: 0, swipe_y: 1},
    ],
    [
      {image:"zhukov.png", x: 640, y: 480, drift: "left"},
      // {image: "black_bars.png", x: 640, y: 480},
      {credits:"ART", x: 380, y: 220},
      {credits:"MATT CARLIN", x: 870, y: 220},
      {no_button: "Next", swipe_x: 1, swipe_y: 0},
    ],
    [
      {image:"building_image.png", x: 640, y: 480, drift: "up"},
      // {image: "black_bars.png", x: 640, y: 480},
      {credits:"SOUND", x: 950, y: 300},
      {credits:"FREESOUND", x: 950, y: 600},
      {credits:"SPLICE", x: 950, y: 630},
      {no_button: "Next", swipe_x: 1, swipe_y: 1},
    ],
    [
      {image:"1988.png", x: 640, y: 480, drift: "right"},
      // {image: "black_bars.png", x: 640, y: 480},
      {credits:"MUSIC", x: 350, y: 350},
      {credits:"FESLIYAN STUDIOS", x: 850, y: 260},
      {credits:"OPEN GAME ART", x: 850, y: 290},
      {credits:"ABSTRACTION MUSIC", x: 850, y: 320},
      {no_button: "Next", swipe_x: 1, swipe_y: 0},
    ],
    [
      {image:"putin_rides.png", x: 640, y: 400},
      {image: "black_bars.png", x: 640, y: 480},
      {credits:"THE END", x: 640, y: 440},
      {credits:"THANK YOU FOR PLAYING", x: 640, y: 520},
      {no_button: "Next", swipe_x: 0, swipe_y: 1},
    ],
    // Sound
    // Freesound.org, Splice.com
    // Music
    // "FESLIYAN STUDIOS \n(DAVID FESLYIYAN AND DAVID RENDA)", {fontFamily: "Press Start 2P", fontSize: 18, fill: 0xFFFFFF, letterSpacing: 6, align: "center"});
    // "OPENGAMEART.ORG \n(SPRING AND NENE)", {fontFamily: "Press Start 2P", fontSize: 18, fill: 0xFFFFFF, letterSpacing: 6, align: "center"});
    // "ABSTRACTIONMUSIC.COM \n(LUDUM DARE 28, TRACKS 3 and 8)", {fontFamily: "Press Start 2P", fontSize: 18, fill: 0xFFFFFF, letterSpacing: 6, align: "center"});
    // The End.
  ],
}