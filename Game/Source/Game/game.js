//
// This file contains the root game class for Soviet Computer Lab. This is the starting point.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//

'use strict';

var log_performance = true;
var performance_result = null;

// var first_screen = "magnitogorsk";
// var first_screen = "first_strike";
// var first_screen = "intro";
// var first_screen = "kuzkas_mother"
// var first_screen = "centrally_planned_economy";
// var first_screen = "party_math";
var first_screen = "title";
// var first_screen = "cutscene";

var multiplayer_name = null;
var multiplayer_picture_number = null;

var subgames = ["kuzkas_mother", "magnitogorsk", "party_math", "centrally_planned_economy", "first_strike", "mixed"];
var difficulty_levels = ["easy", "medium", "hard", "beacon"];

var pixi = null;
var game = null;

function initialize() {
  game = new Game();
  game.resetGame();
}

WebFont.load({
  google: {
    families: ['Bebas Neue', 'Press Start 2P', 'Bangers']
  }
});

var firebaseConfig = {
  apiKey: "AIzaSyCMdtQRBtOTeljFIiQs6ehicZXG8i-pk84",
  authDomain: "word-rockets.firebaseapp.com",
  databaseURL: "https://word-rockets-default-rtdb.firebaseio.com",
  projectId: "word-rockets",
  storageBucket: "word-rockets.appspot.com",
  messagingSenderId: "648323787326",
  appId: "1:648323787326:web:730fc5295f830f1fab7f6f",
  measurementId: "G-K6HHV5T2WN"
};
firebase.initializeApp(firebaseConfig);

firebase.analytics();

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    // User is signed in.
  } else {
    // No user is signed in.
  }
});


class Game {
  constructor() {
    this.tracking = {};

    this.basicInit();

    this.loadTypingPrompts();
    this.loadWords();

    this.auth_user = null;
    this.network = new Network(this);

    this.keymap = {};

    this.cpe_level_count = Object.keys(cpe_level_config).length;

    document.addEventListener("keydown", (ev) => {this.handleKeyDown(ev)}, false);
    document.addEventListener("keyup", (ev) => {this.handleKeyUp(ev)}, false);
    document.addEventListener("mousemove", (ev) => {this.handleMouseMove(ev)}, false);
    document.addEventListener("mousedown", (ev) => {this.handleMouseDown(ev)}, false);

    window.onfocus = (ev) => {
      if (this.keymap != null) {
        this.keymap["ArrowDown"] = null;
        this.keymap["ArrowUp"] = null;
        this.keymap["ArrowLeft"] = null;
        this.keymap["ArrowRight"] = null;
      }
    };
    window.onblur = (ev) => {
      if (this.keymap != null) {
        this.keymap["ArrowDown"] = null;
        this.keymap["ArrowUp"] = null;
        this.keymap["ArrowLeft"] = null;
        this.keymap["ArrowRight"] = null;
      }
    };

    this.freefalling = [];
    this.shakers = [];

    this.gravity = 3.8;
    this.boost = 0.18;
    this.gentle_drop = 0.05;
    this.gentle_limit = 6;
    this.boost_limit = -25;
    this.level = 1;

    this.lobby_mode = "game_type";

    use_music = localStorage.getItem("soviet_computer_lab_use_music") == "false" ? false : true;
    use_sound = localStorage.getItem("soviet_computer_lab_use_sound") == "false" ? false : true;;
    
    multiplayer_picture_number = localStorage.getItem("soviet_computer_lab_multiplayer_picture_number");
    if (multiplayer_picture_number == null) {
      multiplayer_picture_number = dice(128) - 1;
      localStorage.setItem("soviet_computer_lab_multiplayer_picture_number", multiplayer_picture_number);
    }

    multiplayer_name = localStorage.getItem("soviet_computer_lab_multiplayer_name");
    if (multiplayer_name == null) {
      multiplayer_name = "ANON";
      localStorage.setItem("soviet_computer_lab_multiplayer_name", multiplayer_name);
    }

    this.difficulty_level = localStorage.getItem("soviet_computer_lab_difficulty_level");
    if (this.difficulty_level == null) {
      this.difficulty_level = "easy";
      this.difficulty_choice = 0;
    } else {
      this.difficulty_choice = Math.max(0, difficulty_levels.indexOf(this.difficulty_level));
    }

    this.game_type_selection = localStorage.getItem("soviet_computer_lab_game_type_selection");
    if (this.game_type_selection == null) {
      this.game_type_selection = 0;
    } else {
      this.game_type_selection = parseInt(this.game_type_selection);
    }

    this.arcade_type_selection = localStorage.getItem("soviet_computer_lab_arcade_type_selection");
    if (this.arcade_type_selection == null) {
      this.arcade_type_selection = 0;
    } else {
      this.arcade_type_selection = parseInt(this.arcade_type_selection);
    }

    this.loadLocalHighScores();

    // if you're going to do cutscenes and story, this is where you need to do it.
    // this.initializeFlows();

    this.preloadAnimations(() => {
      this.initializeScreens();
    });

    // This is how you add an event listener for multiplayer sudden quits
    // window.addEventListener("unload", (ev) => {
    //   if (this.game_code != "" && this.player > 0) {
    //     this.network.leaveGame(this.game_code, this.player)
    //     this.resetTitle();
    //   }
    // })

    let mu = firebase.auth().currentUser;
    if (mu != null && mu.uid != null) {
      this.auth_user = mu;
      this.network.uid = mu.uid;
    }
    if (this.network.uid == null) {
      this.network.anonymousSignIn(() => {
        this.network.loadGlobalHighScores();
      });
    }
  }


  basicInit() {
    this.width = 1664;
    this.height = 960;

    // Create the pixi application
    pixi = new PIXI.Application(this.width, this.height, {antialias: true});
    this.renderer = pixi.renderer;
    document.getElementById("mainDiv").appendChild(pixi.view);
    pixi.renderer.backgroundColor = 0xFFFFFF;
    pixi.renderer.resize(this.width,this.height);
    pixi.renderer.backgroundColor = 0x000000;

    // Set up rendering and tweening loop
    let ticker = PIXI.Ticker.shared;
    ticker.autoStart = false;
    ticker.stop();

    let fps_counter = 0;
    let last_frame = 0;
    let last_performance_update = 0;

    let animate = now => {
      
      fps_counter += 1;
      let diff = now - last_frame;
      last_frame = now

      if (!this.paused == true) {
        this.trackStart("tween");
        TWEEN.update(now);
        this.trackStop("tween");

        this.trackStart("update");
        this.update(diff);
        this.trackStop("update");

        this.trackStart("animate");
        ticker.update(now);
        pixi.renderer.render(pixi.stage);
        this.trackStop("animate");

        if (now - last_performance_update > 3000 && log_performance) {
          //There were 3000 milliseconds, so divide fps_counter by 3
          // console.log("FPS: " + fps_counter / 3);
          // this.trackPrint(["update", "tween", "animate"]);
          fps_counter = 0;
          last_performance_update = now;
        }
      }

      requestAnimationFrame(animate);
    }
    animate(0);
  }


  //
  // Tracking functions, useful for testing the timing of things.
  //
  trackStart(label) {
    if (!(label in this.tracking)) {
      this.tracking[label] = {
        start: 0,
        total: 0
      }
    }
    this.tracking[label].start = Date.now();
  }


  trackStop(label) {
    if (this.tracking[label].start == -1) {
      console.log("ERROR! Tracking for " + label + " stopped without having started.")
    }
    this.tracking[label].total += Date.now() - this.tracking[label].start;
    this.tracking[label].start = -1
  }


  trackPrint(labels) {
    var sum_of_totals = 0;
    for (var label of labels) {
      sum_of_totals += this.tracking[label].total;
    }
    for (var label of labels) {
      var fraction = this.tracking[label].total / sum_of_totals;
      console.log(label + ": " + Math.round(fraction * 100).toFixed(2) + "%");
    }
  }


  // Simple version of next flow with no story or cutscenes.
  // It just moves you to the next level in whatever subgame
  // you've chosen, and randomly chooses game types if you're
  // playing the mixed mode.
  nextFlow() {
    this.flow_marker = this.level;
    this.level = this.flow_marker + 1;

    let type = "";

    if (this.game_type_selection == 1) {
      type = "kuzkas_mother";
    } else if (this.game_type_selection == 2) {
      type = "magnitogorsk";
    } else if (this.game_type_selection == 3) {
      type = "party_math";
    } else if (this.game_type_selection == 4) {
      if (this.level <= this.cpe_level_count) {
        type = "centrally_planned_economy";
      } else {
        type = "lobby";
      }
    } else if (this.game_type_selection == 5) {
      type = "first_strike";
    } else if (this.game_type_selection == 8) {
      // Mixed Mode
      let choice_list = ["kuzkas_mother", "magnitogorsk", "party_math", "first_strike"];
      if (this.level <= this.cpe_level_count) {
        choice_list.push("centrally_planned_economy");
      }
      type = pick(choice_list)
    }

    if (this.current_screen != type) {
      this.createScreen(type);
      this.fadeScreens(this.current_screen, type, true, 800);
    } else {
      let old_screen = this.screens[type];
      this.createScreen(type);
      pixi.stage.removeChild(old_screen);
      old_screen.destroy();
    }
  }


  getModeName() {
    if (this.game_type_selection == 1) {
      return "kuzkas_mother";
    } else if (this.game_type_selection == 2) {
      return "magnitogorsk";
    } else if (this.game_type_selection == 3) {
      return "party_math";
    } else if (this.game_type_selection == 4) {
      return "centrally_planned_economy";
    } else if (this.game_type_selection == 5) {
      return "first_strike";
    } else if (this.game_type_selection == 8) {
      return "mixed";
    }

    throw "Error: I was unable to determine the game mode.";
  }


  resetGame() {
    this.level = 1;
    this.score = 0;
    this.continues = 1;

    this.flow_marker = -1;

    this.player_bombs = 0;
    this.enemy_bombs = 0;
  }


  preloadAnimations(and_then) {
    PIXI.Loader.shared
      .add("Art/alpha_zoo_logo_v2.png")
      .add("Art/fire.json")
      .add("Art/explosion.json")
      .add("Art/electric.json")
      .add("Art/smoke.json")
      .add("Art/fireworks_blue.json")
      .add("Art/fireworks_orange.json")
      .add("Art/pop.json")
      .add("Art/Party_Math/Characters/grigory.json")
      .add("Art/Party_Math/Characters/carrying_1.json")
      .add("Art/Party_Math/Characters/carrying_2.json")
      .add("Art/Party_Math/Characters/carrying_3.json")
      .add("Art/Party_Math/Characters/carrying_4.json")
      .add("Art/Party_Math/Characters/carrying_5.json")
      .add("Art/Party_Math/Characters/carrying_6.json")
      .add("Art/Party_Math/Characters/carrying_7.json")
      .add("Art/Party_Math/Characters/carrying_8.json")
      .add("Art/Party_Math/Characters/child_1.json")
      .add("Art/Party_Math/Characters/child_2.json")
      .add("Art/Party_Math/Characters/child_3.json")
      .add("Art/Party_Math/Characters/child_4.json")
      .add("Art/Party_Math/Characters/child_5.json")
      .add("Art/Party_Math/Characters/child_6.json")
      .add("Art/Party_Math/Characters/child_7.json")
      .add("Art/Party_Math/Characters/child_8.json")
      .add("Art/Party_Math/Characters/elder_1.json")
      .add("Art/Party_Math/Characters/elder_2.json")
      .add("Art/Party_Math/Characters/elder_3.json")
      .add("Art/Party_Math/Characters/elder_4.json")
      .add("Art/Party_Math/Characters/townie_1.json")
      .add("Art/Party_Math/Characters/townie_2.json")
      .add("Art/Party_Math/Characters/townie_3.json")
      .add("Art/Party_Math/Characters/grifter.json")
      .add("Art/Party_Math/Characters/executioner.json")
      .add("Art/CPE/Characters/walker.json")
      .add("Art/CPE/Characters/runner.json")
      .add("Art/CPE/Characters/construction.json")
      .add("Art/CPE/Characters/policeman.json")
      .add("Art/CPE/Characters/traffic.json")
      .add("Art/CPE/Characters/academic.json")
      .add("Art/CPE/Characters/partyboy.json")
      .add("Art/CPE/Characters/businessman.json")
      .add("Art/CPE/Characters/soldier.json")

      .add("Art/CPE/Animations/billboard.json")
      .add("Art/CPE/Animations/buoy_1.json")
      .add("Art/CPE/Animations/buoy_2.json")
      .add("Art/CPE/Animations/drinking_fountain.json")
      .add("Art/CPE/Animations/fishes_1.json")
      .add("Art/CPE/Animations/fridge_1.json")
      .add("Art/CPE/Animations/cat.json")
      .add("Art/CPE/Animations/butterfly_1.json")
      .add("Art/CPE/Animations/butterfly_2.json")
      .add("Art/CPE/Animations/butterfly_3.json")

      .add("Art/CPE/Animations/door_1.json")
      .add("Art/CPE/Animations/door_2.json")
      .add("Art/CPE/Animations/door_3.json")

      .add("Art/CPE/UI/dot_dot_dot.json")
      .add("Art/CPE/UI/red_arrow.json")
      .add("Art/CPE/UI/time_clocks.json")
      .add("Art/CPE/UI/play_pause_glyph.json")

      .add("Art/CPE/Levels/cpe_level_1_open.png")
      .add("Art/CPE/Levels/cpe_level_1_death.png")
      .add("Art/CPE/Levels/cpe_level_1_distraction.png")
      .add("Art/CPE/Levels/cpe_level_1_filled.png")
      .add("Art/CPE/Levels/cpe_level_1_floating.png")
      .load(function() {
        and_then();

        PIXI.Loader.shared
          .add("Art/Runner/grey_runner_combat_fall.json")
          .add("Art/Runner/grey_runner_combat_punch.json")
          .add("Art/Runner/grey_runner_combat_rise.json")
          .add("Art/Runner/grey_runner_combat_ready.json")
          .add("Art/Runner/grey_runner_fast_run.json")
          .add("Art/Runner/grey_runner_slow_run.json")
          .add("Art/Runner/grey_runner_jump.json")
          .add("Art/Runner/grey_runner_static.json")
          .add("Art/Runner/grey_runner_terminal.json")
          .add("Art/Runner/red_runner_combat_fall.json")
          .add("Art/Runner/red_runner_combat_punch.json")
          .add("Art/Runner/red_runner_combat_rise.json")
          .add("Art/Runner/red_runner_combat_ready.json")
          .add("Art/Runner/red_runner_fast_run.json")
          .add("Art/Runner/red_runner_slow_run.json")
          .add("Art/Runner/red_runner_jump.json")
          .add("Art/Runner/red_runner_static.json")
          .add("Art/Runner/red_runner_terminal.json")
          .add("Art/Runner/blue_runner_combat_fall.json")
          .add("Art/Runner/blue_runner_combat_punch.json")
          .add("Art/Runner/blue_runner_combat_rise.json")
          .add("Art/Runner/blue_runner_combat_ready.json")
          .add("Art/Runner/blue_runner_fast_run.json")
          .add("Art/Runner/blue_runner_slow_run.json")
          .add("Art/Runner/blue_runner_jump.json")
          .add("Art/Runner/blue_runner_static.json")
          .add("Art/Runner/blue_runner_terminal.json")
          .load(function() {});
      });
  }


  loadTypingPrompts() {
    var self = this;
    let request;

    this.typing_prompts = [];

    request = new XMLHttpRequest();
    request.open("GET", "Text/typing_prompts.txt", true);
    request.responseType = "arraybuffer";
    request.onload = function(e) {
      let raw_prompt_text = new TextDecoder("utf-8").decode(
        this.response
      );
      self.typing_prompts = raw_prompt_text.split("\n\n");
    }
    request.send();
  }


  loadWords() {
    var self = this;
    let request;

    this.special_dictionaries = {
      "animals": {},
      "plants": {},
      "foods": {},
      "colors": {},
      "numbers_and_shapes": {},
    };

    for (const [special_key, special_dict] of Object.entries(this.special_dictionaries)) {
      request = new XMLHttpRequest();
      request.open("GET", "Text/" + special_key + "_words.txt.gz", true);
      request.responseType = "arraybuffer";
      request.onload = function(e) {
        let word_list = new TextDecoder("utf-8").decode(
          new Zlib.Gunzip(
            new Uint8Array(this.response)
          ).decompress()
        );
        word_list = word_list.split(/\n/);

        for (let i = 0; i < word_list.length; i++) {
          let word = word_list[i];

          if (word != null && word.length >= 3) {
            special_dict[word.toUpperCase()] = 1;
          }
        }
      }
      request.send();
    }

    this.special_dictionaries["verbs"] = {};

    this.special_levels = Object.keys(this.special_dictionaries);
    shuffleArray(this.special_levels);

    this.legal_words = {};
    let enemy_word_dict = {};
    for (let i = 0; i <= board_width; i++) {
      enemy_word_dict[i] = {};
    }

    this.spelling_prediction = {};
    this.long_spelling_prediction = {};

    this.starting_dictionaries = [];
    this.ending_dictionaries = [];
    this.short_starting_dictionaries = [];
    this.short_ending_dictionaries = [];
    this.bridge_word_dictionaries = [];
    for (let i = 0; i < letter_array.length; i++) {
      this.starting_dictionaries[letter_array[i]] = [];
      this.ending_dictionaries[letter_array[i]] = [];
      this.short_starting_dictionaries[letter_array[i]] = [];
      this.short_ending_dictionaries[letter_array[i]] = [];
      for (let j = 0; j < letter_array.length; j++)
      this.bridge_word_dictionaries[letter_array[i]+letter_array[j]] = [];
    }

    request = new XMLHttpRequest();
    request.open("GET", "Text/legal_words.txt.gz", true);
    request.responseType = "arraybuffer";
    request.onload = function(e) {

      let word_list = new TextDecoder("utf-8").decode(
        new Zlib.Gunzip(
          new Uint8Array(this.response)
        ).decompress()
      );
      word_list = word_list.split(/\n/);
      for (let i = 0; i < word_list.length; i++) {
        let thing = word_list[i].split(",");
        let word = thing[0];
        let common = thing[1];
        let parts_of_speech = thing[2];
        if (word != null && word.length >= 2) {

          self.addPredictiveSpelling(word.toUpperCase());

          self.legal_words[word.toUpperCase()] = 1;
          
          if (parts_of_speech.includes("v")) {
            self.special_dictionaries["verbs"][word.toUpperCase()] = 1;
          }

          let first = word.toUpperCase()[0];
          let last = word.toUpperCase()[word.length - 1];
          if (word.length >= 2 && word.length <= 9) self.starting_dictionaries[first].push(word.toUpperCase());
          if (word.length >= 2 && word.length <= 9) self.ending_dictionaries[last].push(word.toUpperCase());
          if (word.length >= 2 && word.length < 4) self.short_starting_dictionaries[first].push(word.toUpperCase());
          if (word.length >= 2 && word.length < 4) self.short_ending_dictionaries[last].push(word.toUpperCase());
          if (word.length >= 3 && word.length <= 6) self.bridge_word_dictionaries[first+last].push(word.toUpperCase());    
        }
        if (word != null && word.length <= board_width) {
          enemy_word_dict[word.length][word.toUpperCase()] = 1;
        }
      }

      self.enemy_words = {};
      for (let i = 0; i <= board_width; i++) {
        self.enemy_words[i] = Object.keys(enemy_word_dict[i]);
      }

    };
    request.send();
  }


  addPredictiveSpelling(word) {
    for (var i = 0; i < word.length; i++) {
      let slice = word.slice(0, i+1);
      if (!(slice in this.spelling_prediction) || word.length < this.spelling_prediction[slice].length) {
        this.spelling_prediction[slice] = word;
      }
      if (!(slice in this.long_spelling_prediction) || word.length > this.long_spelling_prediction[slice].length && word.length <= 12) {
        this.long_spelling_prediction[slice] = word;
      } 
    }
  }


  handleMouseMove(ev) {
    if (this.screens != null
      && this.current_screen != null
      && this.screens[this.current_screen].mouseMove != null) {
      this.screens[this.current_screen].mouseMove(ev);
    }
  }


  handleMouseDown(ev) {
    if (this.screens != null
      && this.current_screen != null
      && this.screens[this.current_screen].mouseDown != null) {
      this.screens[this.current_screen].mouseDown(ev);
    }
  }


  handleKeyUp(ev) {
    ev.preventDefault();

    this.keymap[ev.key] = null;

    if (this.screens != null
      && this.current_screen != null
      && this.screens[this.current_screen].keyUp != null) {
      this.screens[this.current_screen].keyUp(ev);
    }
  }


  handleKeyDown(ev) {
    if (ev.key === "Tab") {
      ev.preventDefault();
    }

    this.keymap[ev.key] = true;

    if (this.screens != null
      && this.current_screen != null
      && this.screens[this.current_screen].keyDown != null) {
      this.screens[this.current_screen].keyDown(ev);
    }
  }


  update(diff) {
    if (this.screens != null && this.current_screen != null) {
      this.screens[this.current_screen].update(diff);
    }
  }


  loadLocalHighScores() {
    this.local_high_scores = JSON.parse(localStorage.getItem("soviet_computer_lab_local_high_scores"));
    
    if (this.local_high_scores == null) {
      this.local_high_scores = {};

      subgames.forEach((val) => {
        if (this.local_high_scores[val] == null) this.local_high_scores[val] = {};
        difficulty_levels.forEach((val2) => {
          if (this.local_high_scores[val][val2] == null) this.local_high_scores[val][val2] = [];
        });
      });
    }
  }

 
  addHighScore(name, score, callback, error_callback = null) {
    let mode = this.getModeName();
    let difficulty = this.difficulty_level.toLowerCase();

    this.local_high_scores[mode][difficulty].push({name: name, score: score})
    this.local_high_scores[mode][difficulty].sort((a,b) => (a.score < b.score) ? 1 : -1)
    this.local_high_scores[mode][difficulty] = this.local_high_scores[mode][difficulty].slice(0,10);

    localStorage.setItem("soviet_computer_lab_local_high_scores", JSON.stringify(this.local_high_scores));
    
    let low_high = this.global_high_scores[mode][difficulty][9];

    if (low_high == null || low_high.score < score) { // submit a global high score
      this.global_high_scores[mode][difficulty].push({name: name, score: score})
      this.global_high_scores[mode][difficulty].sort((a,b) => (a.score < b.score) ? 1 : -1)
      this.global_high_scores[mode][difficulty] = this.global_high_scores[mode][difficulty].slice(0,10);

      this.network.addGlobalHighScore(name, score, mode, difficulty, callback, error_callback);
    } else {
      if (callback != null) callback();
    }
  }

}
