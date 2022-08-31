
//
// The character class makes characters for Centrally Planned Economy.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//

// Without worring about frame rate slipping
// OR foot animation slipping,
// For a 6 frame walk cycle where
// a 16 pixel character moves 2x his own distance,
// (6 * frame_time / 1000) * 60 * walk_speed = 32
// So walk_speed = (32000/360) / frame_time
// var default_walk_speed = 0.6;
// I would like a fudge factor to slow the character
// down while having faster animation, and I don't 
// care that much about slippage, sooooo,
// Make it 24000.
var frame_time = 100;
var default_walk_speed = (24000/360)/frame_time;

Game.prototype.makeCpeCharacter = function(character_name) {
  let character = new PIXI.Container();
  character.position.set(0,0);

  character.type = "character";
  character.character_name = character_name;

  PIXI.utils.clearTextureCache();
  let sheet = PIXI.Loader.shared.resources["Art/CPE/Characters/" + character_name + ".json"].spritesheet;
  character.poses = {};
  for(const key in sheet.animations) {
    character.poses[key] = new PIXI.AnimatedSprite(sheet.animations[key]);
    character.poses[key].anchor.set(0.5,0.82);
    character.poses[key].position.set(0, 0);
    character.addChild(character.poses[key]);
    character.poses[key].visible = false;
  }

  character.vx = 1;
  character.vy = 0;

  character.frame_time = frame_time;
  character.last_image_time = null;
  character.walk_speed = default_walk_speed;

  if (character.character_name == "runner") {
    character.frame_time /= 2;
    character.walk_speed *= 2;
  } else if (character.character_name == "traffic") {
    character.frame_time /= 2;
    character.walk_speed *= 2;
  }

  character.step_value = 0;


  character.getDirection = function() {
    if (Math.abs(character.vx) > Math.abs(character.vy)) {
      if (character.vx >= 0) {
        return "right"
      } else {
        return "left";
      }
    } else {
      if (character.vy >= 0) {
        return "down";
      } else {
        return "up";
      }
    }
  }


  character.setState = function(state, direction) {
    if (character.state == "dying") return;

    character.state = state;

    if (character.state == "standing") character.setAction("stand");

    if (character.state == "traffic") {
      character.arrow = new PIXI.Sprite(PIXI.Texture.from("Art/CPE/UI/arrow.png"));
      character.arrow.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
      character.arrow.anchor.set(0.5, 0.5)
      if (direction == "right") {
        character.vx = 1;
        character.vy = 0;
        character.arrow.position.set(16,-4);
        character.arrow.angle = 0;
      } else if (direction == "left") {
        character.vx = -1;
        character.vy = 0;
        character.arrow.position.set(-16,-4);
        character.arrow.angle = 180;
      } else if (direction == "up") {
        character.vx = 0;
        character.vy = -1;
        character.arrow.position.set(0,-24);
        character.arrow.angle = 270;
      } else if (direction == "down") {
        character.vx = 0;
        character.vy = 1;
        character.arrow.position.set(0,12);
        character.arrow.angle = 90;
      }
      character.arrow.px = character.arrow.x;
      character.arrow.py = character.arrow.y;
      character.addChild(character.arrow);
      character.setAction("point");
    } else if (character.state == "directed_walk") {
      if (direction == "right") {
        character.vx = 1;
        character.vy = 0;
      } else if (direction == "left") {
        character.vx = -1;
        character.vy = 0;
      } else if (direction == "up") {
        character.vx = 0;
        character.vy = -1;
      } else if (direction == "down") {
        character.vx = 0;
        character.vy = 1;
      }
      character.setAction("walk");
    } else if (character.state == "random_walk") {
      let angle = dice(360) - 1;

      const random_angle_span = 60;

      if (direction == "right") {
        let angle = -random_angle_span + dice(2 * random_angle_span);
      } else if (direction == "left") {
        let angle = 180 - random_angle_span + dice(2 * random_angle_span);
      } else if (direction == "up") {
        let angle = 90 - random_angle_span + dice(2 * random_angle_span);
      } else if (direction == "down") {
        let angle = 270 - random_angle_span + dice(2 * random_angle_span);
      }

      character.vx = Math.cos(angle * 180 / Math.PI);
      character.vy = Math.sin(angle * 180 / Math.PI);

      character.setAction("walk");
    } else if (character.state == "dying") {
      for(const key in sheet.animations) {
        character.poses[key].scale.set(1, -1);
      }
    }
  }


  character.setAction = function(action) {
    character.action = action;
    let direction = character.getDirection();
    let desired_pose = action + "_" + character.getDirection();
    if (!(desired_pose in character.poses)) {
      if (character.vx >= 0) {
        desired_pose = action + "_right";
      } else {
        desired_pose = action + "_left";
      }
    }
    if (!(desired_pose in character.poses)) {
      desired_pose = Object.keys(character.poses)[0];
      console.log("Warning: could not find pose " + desired_pose + " for " + character.character_name);
    }

    character.setPose(desired_pose);
  }


  character.setPose = function(pose_name) {
    if (pose_name == null) return;

    character.pose = pose_name;
    character.updatePose();
    character.poses[character.pose].gotoAndStop(1);
    character.last_image_time = Date.now();
  }


  character.updatePose = function() {
    for(const key in character.poses) {
      if (key == character.pose) {
        character.poses[key].visible = true;
      } else {
        character.poses[key].visible = false;
      }
    }

    if (character.last_image_time == null) {
      character.last_image_time = Date.now();
    } else if (Date.now() - character.last_image_time > character.frame_time) {
      character.step_value = (character.step_value + 1) % character.poses[character.pose].totalFrames;
      character.poses[character.pose].gotoAndStop(character.step_value);
      character.last_image_time = Date.now();
    }
  }

  character.previousPose = function() {
    if (character.pose == null) {
      character.setPose(Object.keys(character.poses)[0]);
    } else {
      character.setPose(prev(Object.keys(character.poses), character.pose));
    }
  }


  character.nextPose = function() {
    if (character.pose == null) {
      character.setPose(Object.keys(character.poses)[0]);
    } else {
      character.setPose(next(Object.keys(character.poses), character.pose));
    }
  }


  character.update = function(illegal_area, death_area, width, height) {

    if (character.action == "walk" && character.state != "dying") {
      character.last_x = character.x;
      character.last_y = character.y;
      character.x += character.walk_speed * character.vx;
      character.y += character.walk_speed * character.vy;

      if (character.drift_x && Math.abs(character.drift_x) >= 0.5) {
        if (character.drift_x > 0) {
          character.x += 0.5;
          character.drift_x -= 0.5;
        } else {
          character.x -= 0.5;
          character.drift_x += 0.5;
        }
      }
      if (character.drift_y && Math.abs(character.drift_y) >= 0.5) {
        if (character.drift_y > 0) {
          character.y += 0.5;
          character.drift_y -= 0.5;
        } else {
          character.y -= 0.5;
          character.drift_y += 0.5;
        }
      }

      if (character.x > width) {
        character.x = character.last_x;
        character.y = character.last_y;
        character.setState("random_walk", "left");
      } else if (character.x < 0) {
        character.x = character.last_x;
        character.y = character.last_y;
        character.setState("random_walk", "right");
      } else if (character.y > height) {
        character.x = character.last_x;
        character.y = character.last_y;
        character.setState("random_walk", "up");
      } else if (character.y < 0) {
        character.x = character.last_x;
        character.y = character.last_y;
        character.setState("random_walk", "down");
      } else {
        let x_int = Math.floor(character.x/2) * 2;
        let y_int = Math.floor(character.y/2) * 2;

        if (x_int in death_area && death_area[x_int][y_int] != null) {
          // Dead!
          character.setState("dying");
        } else if (x_int in illegal_area && illegal_area[x_int][y_int] != null) {
          character.x = character.last_x;
          character.y = character.last_y;
          let direction = character.getDirection();
          if (direction == "left") {
            character.setState("random_walk", "right");
          } else if (direction == "right") {
            character.setState("random_walk", "left");
          } else if (direction == "down") {
            character.setState("random_walk", "up");
          } else if (direction == "up") {
            character.setState("random_walk", "down");
          }
        }
      }
    }
    
    character.updatePose();

    if (character.action == "point") {
      let direction = character.getDirection();
      if (direction == "right") {
        character.arrow.x = character.arrow.px + 1.5 * (character.step_value % character.poses[character.pose].totalFrames);
      } else if (direction == "left") {
        character.arrow.x = character.arrow.px - 1.5 * (character.step_value % character.poses[character.pose].totalFrames);
      } else if (direction == "up") {
        character.arrow.y = character.arrow.py - 1.5 * (character.step_value % character.poses[character.pose].totalFrames);
      } else if (direction == "down") {
        character.arrow.y = character.arrow.py + 1.5 * (character.step_value % character.poses[character.pose].totalFrames);
      }
    }
  } 

  character.setState("standing");
  return character;
}
