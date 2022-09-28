
run_speeds = {
  0: {
    type: "static",
    animation_speed: 0.1,
    ground_speed: 0,
  },
  1: {
    type: "slow_run",
    animation_speed: 0.30,
    ground_speed: 2.4 * 0.75,
  },
  2: {
    type: "slow_run",
    animation_speed: 0.40,
    ground_speed: 2.4,
  },
  3: {
    type: "slow_run",
    animation_speed: 0.50,
    ground_speed: 2.4 * 1.25,
  },
  4: {
    type: "fast_run",
    animation_speed: 0.30,
    ground_speed: 5.77 * 0.75,
  },
  5: {
    type: "fast_run",
    animation_speed: 0.40,
    ground_speed: 5.77,
  },
  6: {
    type: "fast_run",
    animation_speed: 0.50,
    ground_speed: 5.77 * 1.25,
  },
  7: {
    type: "fast_run",
    animation_speed: 0.50,
    ground_speed: 5.77 * 1.25,
  },
}

runner_animation_speeds = {
  combat_fall: 0.35,
  combat_punch: 0.4,
  combat_ready: 0.13,
  combat_rise: 0.35,
  fast_run: 0.4,
  slow_run: 0.4,
  jump: 0.5,
  reverse_jump: 0.6,
  damage: 0.4,
  static: 0.1,
  terminal: 0.1,
}


punch_positions = {
  7: 70,
  8: 88,
  9: 88,
  10: 80,
  11: 70,
  15: 36,
  16: 64,
  17: 80,
  18: 86,
  19: 88,
  20: 78,
  21: 70,
  22: 58,
}


FirstStrike.prototype.makeRunner = function(parent, color, scale, x, y, speed, get_up) {
  let runner = new PIXI.Container();
  runner.position.set(x, y);
  runner.scale.set(scale, scale);
  parent.addChild(runner);

  runner.states = ["combat_fall", "combat_punch", "combat_ready", "combat_rise", "fast_run", "slow_run", "jump", "static", "terminal"];
  runner.current_state = "static";

  runner.lx = 0;
  runner.ly = 0;
  runner.ly_floor = 0;
  runner.speed = speed;
  runner.ground_speed = 0;
  runner.get_up = get_up;
  runner.last_choice = markTime();
  runner.color = color;

  runner.sound = false;

  // Add main sprites
  runner.sprites = {};
  runner.states.forEach((state) => {
    // the anchor 0.5, 0.71 is set to the feet
    runner.sprites[state] = makeAnimatedSprite("Art/Runner/" + color + "_runner_" + state + ".json", state, runner, 0, 0, 0.5, 0.71);
    runner.sprites[state].visible = false;
  });

  // Add damage sprite
  runner.states.push("damage");
  runner.sprites["damage"] = makeAnimatedSprite("Art/Runner/" + color + "_runner_combat_rise.json", "damage", runner, 0, 0, 0.5, 0.71);
  runner.sprites["damage"].visible = false;

  // Add zappy bits to damage sprite
  for (var i = 0; i < 4; i++) {
    let angle = 90 * i - 45 + Math.floor(Math.random() * 90);
    let zap_sprite = makeSprite("Art/zappy.png", runner.sprites["damage"], 15 * Math.cos(angle * Math.PI / 180), -55 + 30 * Math.sin(angle * Math.PI / 180), 0.5, 0.5);
    zap_sprite.angle = angle;
  }


  // Functions
  runner.setState = function(new_state) {
    runner.states.forEach((state) => {
      if (new_state == state) {
        runner.sprites[runner.current_state].gotoAndStop(0);
        runner.sprites[runner.current_state].visible = false;

        runner.current_state = new_state;
        runner.sprites[runner.current_state].visible = true;
        runner.sprites[runner.current_state].animationSpeed = runner_animation_speeds[runner.current_state]; 
        runner.sprites[runner.current_state].play();
      } else {
        runner.sprites[state].visible = false;
      }
    });
  }


  runner.damage = function() {
    if (runner.current_state != "damage") {
      runner.setState("damage");
      runner.old_base_height = runner.base_height;
      runner.speed = -1 * 6;
      runner.ground_speed = -1 * run_speeds[6].ground_speed;

      runner.sprites["damage"].onLoop = function() {
        runner.setState("static");
        runner.speed = 0;
        runner.ground_speed = 0;
        runner.ly = runner.ly_floor;
      }
      runner.sprites["damage"].onFrameChange = function() {
        let t = this.currentFrame;
        runner.ly = 2.5 * ((t - 4)*(t - 4) - 16) + runner.ly_floor;
      }
    }
  }


  runner.jump = function() {
    if (runner.current_state != "combat_punch"
      && runner.current_state != "jump"
      && runner.current_state != "combat_fall"
      && runner.current_state != "combat_rise") {
      runner.last_state = runner.current_state;
      runner.setState("jump");
      runner.jump_initial_floor = runner.ly_floor;
      runner.last_speed = runner.speed;
      runner.speed = Math.max(runner.speed, 4);
      runner.ground_speed = Math.max(runner.ground_speed, run_speeds[4].ground_speed);
      runner.sprites["jump"].onLoop = function() {
        runner.setState(runner.last_state);
        if (runner.last_state == "static") {
          runner.speed = Math.ceil(Math.max(runner.last_speed, 2));
          runner.ground_speed = run_speeds[runner.speed].ground_speed;
          runner.setState("slow_run");
        }
        runner.last_state = null;
        runner.ly = runner.ly_floor;
      }
      runner.sprites["jump"].onFrameChange = function() {
        if (this.currentFrame >= 2 && this.currentFrame <= 27) {
          let t = this.currentFrame - 2;
          runner.ly = 0.8 * ((t - 12)*(t - 12) - 144) + runner.jump_initial_floor;
          if (runner.ly > runner.ly_floor) {
            runner.ly = runner.ly_floor;
            runner.sprites["jump"].onLoop(); // end the jump
          }
        } else if (this.currentFrame < 2) {
          runner.ly = runner.jump_initial_floor;
        } else if (this.currentFrame > 27) {
          runner.ly = runner.ly_floor;
        }
      }
    }
  }


  runner.knockout = function() {
    if (runner.current_state != "combat_fall") {
      runner.fall_vy = -24;
      runner.setState("combat_fall");
      runner.ground_speed = 0;
      runner.speed = 0;
    }
  }


  runner.punch = function(punch_target, dash = false) {
    if (runner.current_state != "combat_punch"
      && runner.current_state != "jump"
      && runner.current_state != "combat_fall"
      && runner.current_state != "combat_rise") {
      runner.last_speed = runner.speed;
      runner.punch_target = punch_target;
      runner.dash_punch = dash;
      runner.speed = 0;
      runner.ground_speed = 0;
      runner.setState("combat_punch");
    }
  }


  runner.changeSpeed = function() {
    let speed_marker = Math.ceil(runner.speed);
    let speed_option = run_speeds[speed_marker];

    runner.setState(speed_option.type);
    runner.sprites[runner.current_state].animationSpeed = speed_option.animation_speed;
    runner.ground_speed = speed_option.ground_speed;
  }


  runner.sprites["combat_punch"].onFrameChange = function() {
    let t = this.currentFrame;
    if (runner.dash_punch == true && (t == 7 || t == 8 || t == 9)) {
      runner.lx += 15;
    }

    // test for punching the target
    if (runner.punch_target != null) {
      if (t in punch_positions 
        && Math.abs(runner.lx - runner.punch_target.lx) <= punch_positions[t] + 5
        && (runner.lx - runner.punch_target.lx) * runner.scale.x < 0) {
        if (runner.punch_target.current_state == "combat_punch") {
          let t2 = runner.punch_target.sprites["combat_punch"].currentFrame;
          if (t2 in punch_positions
            // 40 here is for the fact that the head moves in on punch frames, so there's a more generous buffer
            && Math.abs(runner.lx - runner.punch_target.lx) <= punch_positions[t2] + 40
            && (runner.punch_target.lx - runner.lx) * runner.punch_target.scale.x < 0) {
            if (runner.punch_target.color == "blue") {
              this.player_area.shake = markTime();
            } else {
              swearing(this, 400, 400);
            }
            runner.knockout();
          }
        }

        if (runner.sound) soundEffect("slap_" + Math.ceil(Math.random() * 4));
        if (runner.punch_target.color == "blue") {
          this.player_area.shake = markTime();
        } else {
          swearing(this, 400, 400);
        }
        runner.punch_target.knockout();
      }
    }
  }


  runner.sprites["combat_punch"].onLoop = function() {
    if (runner.scale.x > 0) { // hack to filter for rightward facing runners.
      runner.speed = Math.max(2, runner.last_speed);
      runner.changeSpeed();
    }
    runner.last_state = null;
  }


  runner.sprites["combat_fall"].onFrameChange = function() {
    runner.ly += runner.fall_vy;
    runner.fall_vy += 4;
    if (runner.ly < runner.ly_floor) {
      runner.lx -= 5;
    } else {
      runner.ly = runner.ly_floor;
      runner.fall_vy = 0;
    }
  }


  runner.sprites["combat_fall"].onLoop = function() {
    runner.sprites["combat_fall"].gotoAndStop(26);
    if (runner.get_up) {
      delay(function() {
        runner.setState("combat_rise");
        runner.sprites["combat_rise"].onLoop = function() {
          runner.setState("static");
        }
      }, 500);
      runner.next_state = null;
      runner.last_state = null;
    }
  }


  // Add event listeners to change the run speed.
  // We do it this way so there isn't a sudden frame jump.
  runner.sprites["slow_run"].onLoop = function() { runner.changeSpeed(); }
  runner.sprites["fast_run"].onLoop = function() { runner.changeSpeed(); }


  // Final setup
  runner.sprites[runner.current_state].visible = true;
  runner.sprites[runner.current_state].animationSpeed = runner_animation_speeds[runner.current_state]; 
  runner.sprites[runner.current_state].play();

  runner.last_speed_change = markTime();
  runner.changeSpeed();

  return runner;
}