

Game.prototype.makeTutorialScreen = function(parent, fade_in_time, box_left, box_top, box_right, box_bottom, text, text_x, text_y) {
  var self = this;

  let tutorial_screen = new PIXI.Container();
  parent.addChild(tutorial_screen);

  let right_mask = PIXI.Sprite.from(PIXI.Texture.WHITE);
  right_mask.anchor.set(0, 0.5);
  right_mask.height = this.height;
  right_mask.width = this.width - box_right;
  right_mask.position.set(box_right, this.height / 2)
  right_mask.alpha = 0.0;
  right_mask.tint = 0x000000;
  tutorial_screen.addChild(right_mask);
  new TWEEN.Tween(right_mask)
    .to({alpha: 0.6})
    .duration(fade_in_time)
    .start()

  let left_mask = PIXI.Sprite.from(PIXI.Texture.WHITE);
  left_mask.anchor.set(1, 0.5);
  left_mask.height = this.height;
  left_mask.width = box_left;
  left_mask.position.set(box_left, this.height / 2)
  left_mask.alpha = 0.0;
  left_mask.tint = 0x000000;
  tutorial_screen.addChild(left_mask);
  new TWEEN.Tween(left_mask)
    .to({alpha: 0.6})
    .duration(fade_in_time)
    .start()

  let bottom_mask = PIXI.Sprite.from(PIXI.Texture.WHITE);
  bottom_mask.anchor.set(0, 0);
  bottom_mask.height = this.height - box_bottom;
  bottom_mask.width = box_right - box_left;
  bottom_mask.position.set(box_left, box_bottom)
  bottom_mask.alpha = 0.0;
  bottom_mask.tint = 0x000000;
  tutorial_screen.addChild(bottom_mask);
  new TWEEN.Tween(bottom_mask)
    .to({alpha: 0.6})
    .duration(fade_in_time)
    .start()

  let top_mask = PIXI.Sprite.from(PIXI.Texture.WHITE);
  top_mask.anchor.set(0, 1);
  top_mask.height = box_top;
  top_mask.width = box_right - box_left;
  top_mask.position.set(box_left, box_top)
  top_mask.alpha = 0.0;
  top_mask.tint = 0x000000;
  tutorial_screen.addChild(top_mask);
  new TWEEN.Tween(top_mask)
    .to({alpha: 0.6})
    .duration(fade_in_time)
    .start()

  let tutorial_text = new PIXI.Text(text, {fontFamily: "Bebas Neue", fontSize: 30, fill: 0xFFFFFF, letterSpacing: 6, align: "left"});
  tutorial_text.anchor.set(0.5,0.5);
  tutorial_text.position.set(text_x, text_y);
  tutorial_screen.addChild(tutorial_text);
  tutorial_text.permanent_x = text_x;
  tutorial_text.permanent_y = text_y;
  tutorial_text.start_time = this.markTime();
  tutorial_text.alpha = 0
  tutorial_text.hover = function() {
    tutorial_text.position.set(tutorial_text.permanent_x, tutorial_text.permanent_y + 20 * Math.sin((self.timeSince(tutorial_text.start_time)) / 400));
  }
  tutorial_screen.tutorial_text = tutorial_text;
  new TWEEN.Tween(tutorial_text)
    .to({alpha: 1})
    .duration(fade_in_time)
    .start()

  tutorial_screen.fade = function(fade_out_time) {
    new TWEEN.Tween(tutorial_screen)
      .to({alpha: 0.0})
      .duration(fade_out_time)
      .onComplete(function() {
        parent.removeChild(tutorial_screen);
      })
      .start()
  }

  return tutorial_screen;
}


Game.prototype.tutorial1 = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];
  this.game_phase = "tutorial";
  this.tutorial_number = 1;

  this.tutorial_screen = this.makeTutorialScreen(screen, 2000, 80, 656, 856, 953, "HERE IS A KEYBOARD. PLEASE START TYPING.", this.width / 2, 620);

  this.tutorial_1_snide_clicks = 0;
  this.tutorial_1_snide_click_responses = [
    "NO, USE YOUR ACTUAL KEYBOARD, KID.",
    "STUBBORN!",
    "HEY, START TYPING ON KEYS.",
    "ACTUAL KEYS.",
    "HEY! LOOK DOWN. LOOK. DOWN.",
    "PRESS K. JUST DO IT.",
    "FINE, I GIVE UP.",
  ]

  for (var i = 0; i < 10; i++) {
    this.launchpad.cursors[i].visible = true;
  }
}


Game.prototype.tutorial2 = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];
  
  this.tutorial_number = 1.5;
  this.tutorial_screen.tutorial_text.text = "GOOD.";

  delay(function() {
    self.tutorial_screen.fade(500);
    self.tutorial_number = 2;
    self.tutorial_screen = self.makeTutorialScreen(screen, 500, 264, 479, 662, 545, "THIS IS THE LAUNCHPAD.", self.width / 2, 600);
  }, 2000);


  delay(function() {
    self.tutorial_screen.tutorial_text.text = "A WORD APPEARS HERE AS YOU TYPE.";
  }, 5000);

  delay(function() {
    self.tutorial_conditions = {};
    self.tutorial_number = 2.5;
    self.tutorial_screen.tutorial_text.text = "PRESS THE LEFT AND RIGHT KEYS TO MOVE YOUR WORD A BIT.";
  }, 8000);
}


Game.prototype.tutorial275 = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];

  this.tutorial_conditions = {};
  this.tutorial_number = 2.75;
  this.tutorial_screen.tutorial_text.text = "PRESS LEFT AND RIGHT SHIFT TO MOVE YOUR WORD ALL THE WAY TO THE SIDES.";
}


Game.prototype.tutorial3 = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];
  
  this.tutorial_number = 3;
  this.tutorial_screen.tutorial_text.text = "PRESS DELETE OR BACKSPACE TO DELETE A LETTER.";
}


Game.prototype.tutorial35 = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];
  
  this.tutorial_number = 3.5;
  this.tutorial_screen.tutorial_text.text = "PRESS ESCAPE TO DELETE THE WHOLE WORD.";
}


Game.prototype.tutorial4 = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];
  
  this.tutorial_number = 4;
  this.tutorial_screen.tutorial_text.text = "YOUR WORD MUST BE IN THE ENGLISH DICTIONARY.";

  delay(function() {
    self.tutorial_screen.tutorial_text.text = "IT CAN'T BE TOO SHORT, AND YOU CAN'T PLAY A WORD TWICE.";
  }, 4000);

  delay(function() {
    self.tutorial_screen.tutorial_text.text = "IF YOUR WORD IS INVALID, A RED MARKER WILL APPEAR UNDERNEATH.";
  }, 8000);

  delay(function() {
    self.tutorial_number = 4.2;
    self.tutorial_screen.tutorial_text.text = "IF YOUR WORD IS VALID, YOU CAN LAUNCH IT AT THE SOVIET PLAYER.";
  }, 12000);

  delay(function() {
    self.tutorial5();
  }, 16000);
}


Game.prototype.tutorial5 = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];
  
  this.tutorial_number = 5;
  this.tutorial_screen.tutorial_text.text = "GO AHEAD. MAKE A WORD AND PRESS ENTER TO LAUNCH IT.";
}


Game.prototype.tutorial6 = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];
  
  this.tutorial_number = 6;

  delay(function() {
    self.tutorial_screen.fade(250);
    self.tutorial_screen = self.makeTutorialScreen(screen, 250, 260, 30, 671, 531, "IT FLIES UP HERE...", 480, 275);
  }, 500);
}


Game.prototype.tutorial7 = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];
  console.log("I am in tutorial 7");
  
  this.tutorial_number = 7;

  self.tutorial_screen.fade(250);
  self.tutorial_screen = self.makeTutorialScreen(screen, 250, 958, 92, 1168, 348, "COMES DOWN HERE...", 700+350, 200+152);
}


Game.prototype.tutorial8 = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];
  console.log("I am in tutorial 8");
  
  this.tutorial_number = 8;
  this.enemy_last_action = this.markTime();

  self.tutorial_screen.fade(250);
  self.tutorial_screen = self.makeTutorialScreen(screen, 250, 867, 394, 1259, 548, "AND CRASHES INTO THE SOVIET'S KEYBOARD,\nTEMPORARILY DISABLING SOME KEYS.", 430+520, 500+66);
}


Game.prototype.tutorial9 = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];
  console.log("I am in tutorial 9");
  
  this.tutorial_number = 9;
  this.opponent_name = "an";
  this.addOpponentPicture(screen);

  self.tutorial_screen.fade(250);
  self.tutorial_screen = self.makeTutorialScreen(screen, 250, 958, 92, 1168, 348, "AHA! THE SOVIET WILL FIRE ROCKETS...", 700+250, 200+152);
}


Game.prototype.tutorial10 = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];
  
  this.tutorial_number = 10;

  delay(function() {
    self.tutorial_screen.fade(250);
    self.tutorial_screen = self.makeTutorialScreen(screen, 250, 260, 30, 666, 531, "WHICH COME DOWN ON YOU!", 470, 275);
  }, 500);
}


Game.prototype.tutorial11 = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];
  
  this.tutorial_number = 11;

  delay(function() {
    self.tutorial_screen.fade(250);
    self.tutorial_screen = self.makeTutorialScreen(screen, 250, 80, 656, 856, 953, "WHEN KEYS ARE DAMAGED, THEY'RE TEMPORARILY UNABLE TO MAKE ROCKETS.", self.width / 2, 620);
  }, 500);

  delay(function() {
    self.tutorial12();
  }, 4000);
}


Game.prototype.tutorial12 = function() {
  var self = this;
  var screen = this.screens["1p_word_rockets"];
  console.log("I am in tutorial 12");
  
  this.tutorial_number = 12;

  self.tutorial_screen.tutorial_text.text = "YOU HAVE 3 BLUE KEYS TO DEFEND.";

  delay(function() {
    self.tutorial_screen.fade(250);
    self.tutorial_screen = self.makeTutorialScreen(screen, 250, 867, 394, 1259, 548, "AND SO DOES THE SOVIET.", self.width / 2 + 50, 580);
  }, 4000);


  delay(function() {
    self.tutorial_screen.fade(250);
    self.tutorial_screen = self.makeTutorialScreen(screen, 250, 80, 656, 856, 953, "WHEN BLUE KEYS ARE HIT, THEY'RE PERMANENTLY DAMAGED.", self.width / 2, 620);
  }, 8000);


  delay(function() {
    self.tutorial_screen.fade(250);
    self.tutorial_screen = self.makeTutorialScreen(screen, 250, 264, 479, 662, 545, "HEY, GO GO GO! MAKE SOME WORDS!", self.width / 2, 600);
  }, 12000);


  delay(function() {
    self.tutorial_screen.tutorial_text.text = "DESTROY THE SOVIET'S BLUE KEYS BEFORE THEY DESTROY YOURS!";
  }, 16000); 


  delay(function() {
    self.tutorial_screen.fade(250);
    self.tutorial_screen = self.makeTutorialScreen(screen, 250, 0, 0, 0, 0, "OKAY. YOU GET THE IDEA, RIGHT?", self.width / 2, 600);
  }, 20000);


  delay(function() {
    self.tutorial_screen.tutorial_text.text = "TIME TO RESET AND PLAY FOR REAL. READY?";
  }, 24000);


  delay(function() {
    self.tutorial = false;
    self.initialize1pWordRockets();
  }, 28000); 
}



////
////
////
////


Game.prototype.bc_tutorial1 = function() {
  var self = this;
  var screen = this.screens["1p_base_capture"];
  this.game_phase = "tutorial";
  this.tutorial_number = 1;

  this.tutorial_screen = this.makeTutorialScreen(screen, 2000, 80, 0, 860, 585, "WELCOME TO BASE CAPTURE!", this.width / 2, 720);


  delay(function() {
    self.tutorial_screen.tutorial_text.text = "IN THIS GAME, YOU BUILD A BASE OUT OF \nCROSSWORD PUZZLE STYLE WORDS.";
  }, 4000);

  delay(function() {
    self.tutorial_number = 1.1;
    self.tutorial_screen.tutorial_text.text = "PLEASE START TYPING TO MAKE YOUR FIRST WORD.";
  }, 10000);
}


Game.prototype.bc_tutorial2 = function() {
  var self = this;
  var screen = this.screens["1p_base_capture"];

  this.tutorial_number = 1.5;
  this.tutorial_screen.tutorial_text.text = "OKAY!";

  delay(function() {
    self.tutorial_number = 2;
    self.tutorial_screen.tutorial_text.text = "WHEN YOU LIKE YOUR WORD, \nYOU CAN HIT ENTER TO PLACE IT ON THE BOARD."
  }, 2000);
}


Game.prototype.bc_tutorial3 = function() {
  var self = this;
  var screen = this.screens["1p_base_capture"];

  this.tutorial_number = 3;
  this.tutorial_screen.tutorial_text.text = "YOUR WORD HAS TURNED INTO BUILDINGS. \nTHESE ARE YOUR TERRITORY.";

  delay(function() {
    self.tutorial_number = 3.1;
    self.tutorial_screen.tutorial_text.text = "YOU CAN CROSS THIS WORD WITH ANOTHER WORD."
  }, 4000);

  delay(function() {
    self.tutorial_number = 3.2;
    self.tutorial_screen.tutorial_text.text = "FIRST, YOU'LL NEED TO FIND A GOOD SPOT."
  }, 8000);

  delay(function() {
    self.bc_tutorial4();
    
  }, 12000);
}


Game.prototype.bc_tutorial4 = function() {
  var self = this;
  var screen = this.screens["1p_base_capture"];

  this.tutorial_number = 4;
  this.tutorial_screen.tutorial_text.text = "HERE'S YOUR CURSOR. PRESS LEFT, RIGHT, UP AND DOWN TO MOVE IT.";

  this.tutorial_cursor_arrow = new PIXI.Sprite(PIXI.Texture.from("Art/Nav/arrow2.png"));
  this.tutorial_cursor_arrow.anchor.set(0.5, 0.5);
  this.tutorial_cursor_arrow.scale.set(0.6, 0.6);
  this.tutorial_cursor_arrow.position.set(this.cursor[0].x - 32, this.cursor[0].y - 32);
  this.tutorial_cursor_arrow.tint = 0xf3db3c;
  this.tutorial_cursor_arrow.angle = 45;
  this.player_area.addChild(this.tutorial_cursor_arrow);
}


Game.prototype.bc_tutorial5 = function() {
  var self = this;
  var screen = this.screens["1p_base_capture"];

  this.tutorial_cursor_arrow.visible = false;
  this.tutorial_number = 5;
  this.tutorial_screen.tutorial_text.text = "GOOD! KEEP MOVING.";

  delay(function() {
    self.tutorial_screen.tutorial_text.text = "YOU CAN ALSO PRESS LEFT OR RIGHT SHIFT TO MOVE YOUR CURSOR QUICKLY.";
  }, 4000);
}


Game.prototype.bc_tutorial6 = function() {
  var self = this;
  var screen = this.screens["1p_base_capture"];

  this.tutorial_number = 6;
  delay(function() {
    self.tutorial_screen.tutorial_text.text = "YOU CAN USE YOUR MOUSE TO MAKE YOUR CURSOR JUMP AROUND, TOO.";
  }, 500);

  delay(function() {
    self.tutorial_screen.tutorial_text.text = "PLEASE CLICK ON A DIFFERENT LETTER TO MOVE YOUR CURSOR.";
  }, 4000);
}


Game.prototype.bc_tutorial7 = function() {
  var self = this;
  var screen = this.screens["1p_base_capture"];

  this.tutorial_number = 7;

  delay(function() {
    self.tutorial_screen.tutorial_text.text = "FIND A SPOT YOU LIKE, AND START TYPING A NEW WORD.";
  }, 500);

  delay(function() {
    self.tutorial_number = 7.1
    self.tutorial_screen.tutorial_text.text = "WHEN YOU LIKE YOUR WORD, \nYOU CAN HIT ENTER TO PLACE IT ON THE BOARD.";
  }, 4500);
}


Game.prototype.bc_tutorial8 = function() {
  var self = this;
  var screen = this.screens["1p_base_capture"];

  this.tutorial_number = 8;
  this.tutorial_screen.tutorial_text.text = "THE RULES FOR MAKING WORDS ARE THE SAME AS WORD ROCKETS.";

  delay(function() {
    self.tutorial_screen.tutorial_text.text = "YOUR WORD MUST BE IN THE ENGLISH DICTIONARY.";
  }, 4000);

  delay(function() {
    self.tutorial_screen.tutorial_text.text = "IT CAN'T BE TOO SHORT, AND YOU CAN'T PLAY IT TWICE.";
  }, 8000);

  delay(function() {
    self.bc_tutorial9();
  }, 12000);
}


Game.prototype.bc_tutorial9 = function() {
  var self = this;
  var screen = this.screens["1p_base_capture"];

  this.tutorial_number = 9;
  this.tutorial_screen.tutorial_text.text = "OH, LOOK! YOUR OPPONENT HAS WOKEN UP.";

  delay(function() {
    self.tutorial_screen.tutorial_text.text = "YOU AND YOUR OPPONENT COMPETE TO SEE \nWHO CAN GRAB THE MOST TERRITORY.";
  }, 4000);

  delay(function() {
    self.tutorial_screen.tutorial_text.text = "YOU GET A POINT FOR EACH BUILDING.";
  }, 9000);

  delay(function() {
    self.tutorial_screen.tutorial_text.text = "IF YOU BUILD ON TOP OF A ROCKET, IT FLIES OUT \nOF THE SCREEN AND STUNS THE OTHER PLAYER.";
  }, 13000);  

  delay(function() {
    self.tutorial_screen.tutorial_text.text = "THE FIRST TO 70 POINTS WINS.";
  }, 19000);

  delay(function() {
    self.speed_play = true;
    self.tutorial_screen.tutorial_text.text = "AFTER EITHER PLAYER GETS 50 POINTS, A TIME LIMIT IS IMPOSED.";
  }, 23000);

  delay(function() {
    self.speed_play = true;
    self.tutorial_screen.tutorial_text.text = "IF NOBODY PLAYS FOR 15 SECONDS, THE GAME ENDS, \nAND THE PLAYER WITH THE MOST POINTS WINS.";
  }, 27000);

  delay(function() {
    self.speed_play = true;
    self.tutorial_screen.tutorial_text.text = "TIME TO RESET AND PLAY FOR REAL. READY?";
  }, 33000);

  delay(function() {
    self.tutorial = false;
    self.initialize1pBaseCapture();
  }, 37000); 
}


//
//
//
//

Game.prototype.lc_tutorial1 = function() {
  var self = this;
  var screen = this.screens["1p_launch_code"];
  this.game_phase = "tutorial";
  this.tutorial_number = 1;

  this.tutorial_screen = this.makeTutorialScreen(screen, 2000, 80, 0, 860, 585, "WELCOME TO LAUNCH CODE!", this.width / 2 - 180, 620);
//Game.prototype.makeTutorialScreen = function(parent, fade_in_time, box_left, box_top, box_right, box_bottom, text, text_x, text_y) {


  delay(function() {
    self.tutorial_screen.tutorial_text.text = "IN THIS GAME, YOU RACE TO STOP A MISSILE \nBEFORE THE SOVIET CAN LAUNCH IT.";
  }, 6000);


  delay(function() {
    self.lc_tutorial2();
  }, 12000);
}


Game.prototype.lc_tutorial2 = function() {
  var self = this;
  var screen = this.screens["1p_launch_code"];
  this.game_phase = "tutorial";
  this.tutorial_number = 2;

  this.tutorial_screen.fade(500);
  this.tutorial_screen = this.makeTutorialScreen(screen, 2000, 110, 470, 805, 550, "TO RUN, TYPE THE WORDS IN THIS PROMPT", this.width / 2 - 180, 620);
}


Game.prototype.lc_tutorial3 = function() {
  var self = this;
  var screen = this.screens["1p_launch_code"];
  this.game_phase = "tutorial";
  this.tutorial_number = 3;

  this.tutorial_screen.tutorial_text.text = "GOOD! MORE WORDS MEAN FASTER RUNNING."

  delay(function() {
    self.lc_tutorial4();
  }, 5000);  
}


Game.prototype.lc_tutorial4 = function() {
  var self = this;
  var screen = this.screens["1p_launch_code"];
  this.game_phase = "tutorial";
  this.tutorial_number = 4;

  this.tutorial_screen.fade(500);
  this.tutorial_screen = this.makeTutorialScreen(screen, 2000, 280, 750, 840, 940, "TO JUMP OR PUNCH, TAP ENTER OR DOUBLE TAP SPACE", this.width / 2 - 180, 620);
}


Game.prototype.lc_tutorial5 = function() {
  var self = this;
  var screen = this.screens["1p_launch_code"];
  this.game_phase = "tutorial";
  this.tutorial_number = 5;

  this.tutorial_screen.tutorial_text.text = "VERY GOOD! YOUR CHARACTER WILL JUMP OR PUNCH, \nDEPENDING ON THE CONTEXT."

  delay(function() {
    self.lc_tutorial6();
  }, 5000);
}


Game.prototype.lc_tutorial6 = function() {
  var self = this;
  var screen = this.screens["1p_launch_code"];
  this.game_phase = "tutorial";
  this.tutorial_number = 6;

  this.tutorial_screen.fade(500);
  this.tutorial_screen = this.makeTutorialScreen(screen, 2000, 80, 0, 860, 585, "TO WIN, BE FIRST TO GET THROUGH THE LEVEL AND \nENTER YOUR CODE IN THE LAUNCH COMPUTER.", this.width / 2 - 180, 620);

  delay(function() {
    self.lc_tutorial7();
  }, 8000);
}


Game.prototype.lc_tutorial7 = function() {
  var self = this;
  var screen = this.screens["1p_launch_code"];
  this.game_phase = "tutorial";
  this.tutorial_number = 7;

  this.tutorial_screen.tutorial_text.text = "TIME TO RESET AND PLAY FOR REAL. READY?"

  delay(function() {
    self.tutorial = false;
    self.initialize1pLaunchCode();
  }, 4000); 
}



/*

Base capture tutorial script.

welcome to base capture.
in this game, you will build a base out of crossword puzzle style words.
please start typing to make your first word.

okay!

when you like your word, you can hit Enter to place it on the board.

your word has turned into buildings. these are your territory.

you can cross this word with another word.

first, you'll need to find a good spot.
you have a cursor (point to cursor) which moves around the board.
when you type, words start or end at this cursor.

press up, down, left, or right to move your cursor.

you can press left or right shift to move your cursor quickly.
please press left or right shift.

you can also use your mouse to make your cursor jump around.
please click here to move your cursor (point to new spot)


find a spot you like, and start typing a new word that crosses the first word.

when you like your word, you can hit Enter to place it on the board.

the rules for making words are the same as Word Rockets:
your word must be in the English dictionary.
It can't be too short, and you can't play it twice.

oh, look! your opponent has woken up and is making words.

you and your opponent will compete to see who can grab the most territory.
you get a point for each building.

the first player to 70 points wins.
after either player gets to 50, a time limit will be imposed.
if nobody plays for 15 seconds, the game will end and
the player with the most points will win.

if you build a word on top of a rocket, the rocket will fly out of the screen
and stun the keyboard of the other player.

TIME TO RESET AND PLAY FOR REAL. READY?


*/




