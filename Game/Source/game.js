'use strict';

var use_music = true;
var use_sound = true;
var use_scores = false;
var log_performance = true;

// open -a Google\ Chrome\ Canary --args --disable-web-security --autoplay-policy=no-user-gesture-required --user-data-dir=/Users/bugsbycarlin/Projects/Messy
// 

// var first_screen = "1p_base_capture";
// var first_screen = "1p_launch_code";
var first_screen = "intro";
// var first_screen = "1p_word_rockets"
// var first_screen = "1p_lobby";
// var first_screen = "title";
// var first_screen = "cutscene";

var performance_result = null;

var pixi = null;
var game = null;

function initialize() {
  game = new Game();
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

    var self = this;

    this.tracking = {};

    this.basicInit();

    this.loadPrompts();
    this.loadWords();

    this.auth_user = null;
    this.network = new Network(this);

    document.addEventListener("keydown", function(ev) {self.handleKeyDown(ev)}, false);
    document.addEventListener("mousemove", function(ev) {self.handleMouseMove(ev)}, false);
    document.addEventListener("mousedown", function(ev) {self.handleMouseDown(ev)}, false);

    this.keyboard_mode = "QWERTY";

    this.paused = false;
    this.pause_time = 0;

    this.freefalling = [];
    this.shakers = [];

    this.gravity = 3.8;
    this.boost = 0.18;
    this.gentle_drop = 0.05;
    this.gentle_limit = 6;
    this.boost_limit = -25;

    this.lobby_mode = "game_type";

    use_music = localStorage.getItem("cold_war_keyboards_use_music") == "false" ? false : true;
    use_sound = localStorage.getItem("cold_war_keyboards_use_sound") == "false" ? false : true;;

    this.difficulty_level = localStorage.getItem("cold_war_keyboards_difficulty_level");
    if (this.difficulty_level == null) {
      this.difficulty_level = "EASY";
      this.difficulty_choice = 0;
    } else {
      this.difficulty_choice = Math.max(0, ["EASY", "MEDIUM", "HARD", "BEACON"].indexOf(this.difficulty_level));
    }

    this.game_type_selection = localStorage.getItem("cold_war_keyboards_game_type_selection");
    if (this.game_type_selection == null) {
      this.game_type_selection = 0;
    } else {
      this.game_type_selection = parseInt(this.game_type_selection);
    }

    this.arcade_type_selection = localStorage.getItem("cold_war_keyboards_arcade_type_selection");
    if (this.arcade_type_selection == null) {
      this.arcade_type_selection = 0;
    } else {
      this.arcade_type_selection = parseInt(this.arcade_type_selection);
    }

    this.loadLocalHighScores();

    this.initializeFlows();

    this.initializeScreens();
    this.initializeAnimations();

    // this.current_screen = "cutscene";

    // This is how you add an event listener for multiplayer sudden quits
    // window.addEventListener("unload", function(ev) {
    //   if (self.game_code != "" && self.player > 0) {
    //     self.network.leaveGame(self.game_code, self.player)
    //     self.resetTitle();
    //   }
    // })

    let mu = firebase.auth().currentUser;
    if (mu != null && mu.uid != null) {
      this.auth_user = mu;
      this.network.uid = mu.uid;
    }
    if (this.network.uid == null) {
      this.network.anonymousSignIn(function() {
        self.network.loadGlobalHighScores();
      });
    }
  }


  basicInit() {
    var self = this;

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

    function animate(now) {
      
      fps_counter += 1;
      let diff = now - last_frame;
      last_frame = now

      if (!self.paused == true) {
        self.trackStart("tween");
        TWEEN.update(now);
        self.trackStop("tween");

        self.trackStart("update");
        self.update(diff);
        self.trackStop("update");

        self.trackStart("animate");
        ticker.update(now);
        pixi.renderer.render(pixi.stage);
        self.trackStop("animate");

        if (now - last_performance_update > 3000 && log_performance) {
          //There were 3000 milliseconds, so divide fps_counter by 3
          //console.log("FPS: " + fps_counter / 3);
          //self.trackPrint(["update", "tween", "animate"]);
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

  initializeFlows() {
    this.flow = {};
    this.flow_marker = -1;

    // game type is story
    this.flow[0] = {};
    this.flow[0]["EASY"] = [
      "cut:c1", "wr:1:an", "wr:2:an", "cut:c2", "bc:3:zh", "bc:4:zh",
      "cut:c3", "lc:5:iv", "lc:6:iv", "cut:c4", "wr:7:ro", "wr:8:ro",
      "cut:c5", "bc:9:fe", "bc:10:fe", "cut:c6", "lc:11:fe", "lc:12:fe",
      "cut:c7", "wr:13:pu", "wr:14:pu", "cut:c8"
    ];
    this.flow[0]["MEDIUM"] = [
      "cut:c1", "wr:1:an", "wr:2:an", "wr:3:an", "cut:c2", "bc:4:zh", "bc:5:zh", "bc:6:zh",
      "cut:c3", "lc:7:iv", "lc:8:iv", "lc:9:iv", "cut:c4", "wr:10:ro", "wr:11:ro", "wr:12:ro",
      "cut:c5", "bc:13:fe", "bc:14:fe", "bc:15:fe", "cut:c6", "lc:16:fe", "lc:17:fe", "lc:18:fe",
      "cut:c7", "wr:19:pu", "wr:20:pu", "wr:21:pu", "cut:c8"
    ];
    this.flow[0]["HARD"] = [
      "cut:c1", "wr:1:an", "wr:2:an", "wr:3:an", "cut:c2", "bc:4:zh", "bc:5:zh", "bc:6:zh",
      "cut:c3", "lc:7:iv", "lc:8:iv", "lc:9:iv", "cut:c4", "wr:10:ro", "wr:11:ro", "wr:12:ro",
      "cut:c5", "bc:13:fe", "bc:14:fe", "bc:15:fe", "cut:c6", "lc:16:fe", "lc:17:fe", "lc:18:fe",
      "cut:c7", "wr:19:pu", "wr:20:pu", "wr:21:pu", "cut:c8"
    ];
    this.flow[0]["BEACON"] = [
      "cut:c1", "wr:1:an", "wr:2:an", "wr:3:an", "cut:c2", "bc:4:zh", "bc:5:zh", "bc:6:zh",
      "cut:c3", "lc:7:iv", "lc:8:iv", "lc:9:iv", "cut:c4", "wr:10:ro", "wr:11:ro", "wr:12:ro",
      "cut:c5", "bc:13:fe", "bc:14:fe", "bc:15:fe", "cut:c6", "lc:16:fe", "lc:17:fe", "lc:18:fe",
      "cut:c7", "wr:19:pu", "wr:20:pu", "wr:21:pu", "cut:c8"
    ];

    this.flow[2] = {};
    this.flow[2]["EASY"] = [
      "cut:t1", "wr:1", "cut:t2", "bc:1:an", "cut:t3", "lc:1:an", "cut:t4"
    ];
  }


  returnToLastCutscene() {
    if (this.last_cutscene != null && this.last_flow_marker != null) {
      console.log("switching to cutscene");
      this.flow_marker = this.last_flow_marker;
      //this.fadeMusic();
      this.initializeCutscene(this.last_cutscene);
      if (this.current_screen != "cutscene") {
        this.switchScreens(this.current_screen, "cutscene");
      }
    } else {
      this.resetGame();
      this.nextFlow();
    }
  }


  nextFlow() {
    this.flow_marker += 1;

    if (this.game_type_selection == 0 || this.game_type_selection == 2) {
      // Story mode
      if (this.flow_marker < this.flow[this.game_type_selection][this.difficulty_level].length) {
        if (this.game_type_selection == 2) {
          this.tutorial = true;
          this.difficulty_level = "EASY";
        }

        let [next_type, next_value, extra_value] = this.flow[this.game_type_selection][this.difficulty_level][this.flow_marker].split(":");
        
        if (next_type == "wr") {
          this.level = parseInt(next_value);
          this.opponent_name = typeof extra_value !== "undefined" ? extra_value : null;
          if (this.current_screen != "1p_word_rockets") {
            //this.fadeMusic();
            this.initializeScreen("1p_word_rockets");
            this.switchScreens(this.current_screen, "1p_word_rockets");
          } else {
            this.initializeScreen("1p_word_rockets");
          }
        } else if (next_type == "bc") {
          this.level = parseInt(next_value);
          this.opponent_name = typeof extra_value !== "undefined" ? extra_value : null;
          if (this.current_screen != "1p_base_capture") {
            this.fadeMusic();
            this.initializeScreen("1p_base_capture");
            this.switchScreens(this.current_screen, "1p_base_capture");
          } else {
            this.initializeScreen("1p_base_capture");
          }
        } else if (next_type == "lc") {
          this.level = parseInt(next_value);
          this.opponent_name = typeof extra_value !== "undefined" ? extra_value : null;
          if (this.current_screen != "1p_launch_code") {
            this.fadeMusic();
            this.initializeScreen("1p_launch_code");
            this.switchScreens(this.current_screen, "1p_launch_code");
          } else {
            this.initializeScreen("1p_launch_code");
          }
        } else if (next_type == "cut") {
          if (this.current_screen != "cutscene") {
            this.last_flow_marker = this.flow_marker;
            this.last_cutscene = next_value;
            //this.fadeMusic();
            this.initializeCutscene(next_value);
            this.switchScreens(this.current_screen, "cutscene");
          } else {
            this.initializeCutscene(next_value);
          }
        }
      } else {
        // return to 1p_lobby
        // this.initializeScreen("1p_lobby");
        // this.updateHighScoreDisplay();
        // this.switchScreens(this.current_screen, "1p_lobby");
        this.score = 9999;
        this.gameOverScreen(500, true);
      }
    } else if (this.game_type_selection == 1) {
      // Arcade mode
      this.level = this.flow_marker + 1;
      let type = "";
      shuffleArray(opponents)
      this.opponent_name = opponents[0];
      console.log(opponents);
      if (this.arcade_type_selection == 0) {
        if (this.level % 9 == 1 || this.level % 9 == 2 || this.level % 9 == 3) {
          type = "1p_word_rockets";
        } else if (this.level % 9 == 4 || this.level % 9 == 5 || this.level % 9 == 6) {
          type = "1p_base_capture";
        } else if (this.level % 9 == 7 || this.level % 9 == 8 || this.level % 9 == 0) {
          type = "1p_launch_code";
        }
      } else if (this.arcade_type_selection == 1) {
        type = "1p_word_rockets";
      } else if (this.arcade_type_selection == 2) {
        type = "1p_base_capture";
      } else if (this.arcade_type_selection == 3) {
        type = "1p_launch_code";
      }

      if (this.current_screen != type) {
        this.initializeScreen(type);
        this.switchScreens(this.current_screen, type);
      } else {
        this.initializeScreen(type);
      }
    }
  }


  getModeName() {
    if (this.game_type_selection === 0) {
      return "story";
    } else if (this.game_type_selection === 1) {
      return ["mixed", "wr", "bc", "lc"][this.arcade_type_selection];
    }

    throw "Error: I was unable to determine the game mode.";
  }


  initializeScreen(screen_name, reset = false) {
    if (screen_name == "intro") {
      this.initializeIntro();
    } else if (screen_name == "title") {
      this.initializeTitle();
    } else if (screen_name == "1p_lobby") {
      this.initialize1pLobby();
    } else if (screen_name == "high_score") {
      this.initializeHighScore();
    } else if (screen_name == "game_over") {
      this.initializeGameOver();
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
  }


  initializeAnimations() {
    var self = this;
    PIXI.Loader.shared
      .add("Art/alpha_zoo_logo_v2.png")
      .add("Art/fire.json")
      .add("Art/explosion.json")
      .add("Art/electric.json")
      .add("Art/smoke.json")
      .load(function() {
        self.initializeScreen(first_screen, true);

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


  loadPrompts() {
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


  resetGame() {
    this.level = 1;
    this.score = 0;
    this.continues = 1;

    this.flow_marker = -1;

    this.player_bombs = 0;
    this.enemy_bombs = 0;
  }


  update(diff) {
    if (this.current_screen == "1p_word_rockets") {
      this.singlePlayerGameUpdate(diff);
    } else if (this.current_screen == "1p_base_capture") {
      this.singlePlayerBaseCaptureUpdate(diff);
    } else if (this.current_screen == "1p_launch_code") {
      this.singlePlayerLaunchCodeUpdate(diff);
    } else if(this.current_screen == "1p_lobby") {
      this.singlePlayerLobbyUpdate(diff);
    } else if (this.current_screen == "cutscene") {
      this.cutsceneUpdate(diff);
    } else if (this.current_screen == "intro") {
      this.introUpdate(diff);
    } else if (this.current_screen == "title") {
      this.titleUpdate(diff);
    }
  }


  soundEffect(effect_name, volume = 0.6) {
    if (use_sound) {
      var sound_effect = document.getElementById(effect_name);
      sound_effect.volume = volume;
      sound_effect.play();
    }
  }


  setMusic(music_name) {
    if (use_music) {
      if (this.music_name == music_name) {
        return;
      }
      var self = this;
      let crossfade = false;
      if (this.music != null && this.music_name != music_name) {
        crossfade = true;
        this.fadeMusic();
      }
      this.music = document.getElementById(music_name);
      this.music.loop = true;
      this.music.pause();
      this.music.currentTime = 0;
      if (crossfade) {
        for (let i = 0; i < 14; i++) {
          delay(function() {
            self.music.volume = i / 20;
          }, 50 * i);
        }
      } else {
        this.music.volume = 0.6;
      }
      this.music_name = music_name;
      this.music.play();
    }
  }


  stopMusic() {
    if (this.music != null) {
      this.music.pause();
      this.music.currentTime = 0;
    }
  }


  fadeMusic(delay_time = 0) {
    if (this.music != null) {
      this.old_music = this.music;
      this.music = null;
      //this.old_music.done = true;
      var self = this;
      for (let i = 0; i < 14; i++) {
        delay(function() {
          self.old_music.volume = (13 - i) / 20;
        }, delay_time + 50 * i);
      }
      setTimeout(function() {
        // TO DO
        // DELETE OLD MUSIC
        this.old_music = null;
      }, 1500);
    }
  }


  pause() {
    this.paused = true;
    this.pause_moment = Date.now();
    this.paused_tweens = [];
    let tweens = TWEEN.getAll();
    for (var i = 0; i < tweens.length; i++) {
      var tween = tweens[i];
      tween.pause();
      this.paused_tweens.push(tween);
    }
    if (this.music != null) {
      this.music.pause();
    }
    let countdown_sound = document.getElementById("countdown");
    if (countdown_sound.paused == false) {
      countdown_sound.hold_up = true;
      countdown_sound.pause();
    }
    this.prev_announcement_text = this.announcement.text;
    this.announcement.text = "PAUSED";
    this.escape_to_quit.visible = true;
    pauseAllDelays();

  }


  resume() {
    this.paused = false;
    this.pause_time += Date.now() - this.pause_moment;
    for (var i = 0; i < this.paused_tweens.length; i++) {
      var tween = this.paused_tweens[i];
      tween.resume();
    }
    this.paused_tweens = [];
    if (this.music != null) {
      this.music.play();
    }
    let countdown_sound = document.getElementById("countdown");
    if (countdown_sound.hold_up == true) {
      countdown_sound.hold_up = null;
      countdown_sound.play();
    }
    this.announcement.text = this.prev_announcement_text;
    this.escape_to_quit.visible = false;
    resumeAllDelays();
  }


  markTime() {
    return Date.now() - this.pause_time;
  }


  timeSince(mark) {
    return this.markTime() - mark;
  }


  loadLocalHighScores() {
    var self = this;
    this.local_high_scores = JSON.parse(localStorage.getItem("cold_war_keyboards_local_high_scores"));
    
    if (this.local_high_scores == null) {
      this.local_high_scores = {};

      ["story", "mixed", "wr", "bc", "lc"].forEach((val) => {
        if (self.local_high_scores[val] == null) self.local_high_scores[val] = {};
        ["easy", "medium", "hard", "beacon"].forEach((val2) => {
          if (self.local_high_scores[val][val2] == null) self.local_high_scores[val][val2] = [];
        });
      });
    }
  }


  // loadGlobalHighScores(callback) {
  //   var self = this;
  //   // load in cloud
  //   this.global_high_scores = {};
  //   this.network.getGlobalHighScores(function(value) {
  //     self.global_high_scores = value

  //     console.log(self.global_high_scores);

  //     if (self.global_high_scores == null) {
  //       self.global_high_scores = {};
  //       ["story", "mixed", "wr", "bc", "lc"].forEach((val) => {
  //         if (self.global_high_scores[val] == null) self.global_high_scores[val] = {};
  //         ["easy", "medium", "hard", "beacon"].forEach((val2) => {
  //           if (self.global_high_scores[val][val2] == null) self.global_high_scores[val][val2] = [];
  //         });
  //       });
  //     }
  //   });
  // }

 
  addHighScore(name, score, callback, error_callback = null) {
    var self = this;
    let mode = this.getModeName();
    let difficulty = this.difficulty_level.toLowerCase();
    console.log("Adding high score.");
    console.log(name);
    console.log(score);
    console.log(mode);
    console.log(difficulty);

    this.local_high_scores[mode][difficulty].push({name: name, score: score})
    this.local_high_scores[mode][difficulty].sort((a,b) => (a.score < b.score) ? 1 : -1)
    this.local_high_scores[mode][difficulty] = this.local_high_scores[mode][difficulty].slice(0,10);

    localStorage.setItem("cold_war_keyboards_local_high_scores", JSON.stringify(this.local_high_scores));
    
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
