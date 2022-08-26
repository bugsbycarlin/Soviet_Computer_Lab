
//
// The character class makes characters for Centrally Planned Economy.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//

var default_walk_speed = 1.0;
var frame_time = 100;

Game.prototype.makeCpeCharacter = function(character_name) {
  let character = new PIXI.Container();
  character.position.set(0,0);

  character.type = "character";
  character.character_name = character_name;

  PIXI.utils.clearTextureCache();
  let sheet = PIXI.Loader.shared.resources["Art/CPE/Characters/" + character_name + ".json"].spritesheet;
  console.log(sheet.animations);
  character.poses = {};
  for(const key in sheet.animations) {
    character.poses[key] = new PIXI.AnimatedSprite(sheet.animations[key]);
    character.poses[key].anchor.set(0.5,0.82);
    character.poses[key].position.set(0, 0);
    character.addChild(character.poses[key]);
    character.poses[key].visible = false;
    console.log(key);
  }

  character.x_heading = 1;
  character.y_heading = 0;

  character.frame_time = frame_time;
  character.last_image_time = null;
  character.walk_speed = default_walk_speed;

  character.step_value = 0;


  character.getDirection = function() {
    if (Math.abs(character.x_heading) > Math.abs(character.y_heading)) {
      if (character.x_heading >= 0) {
        return "right"
      } else {
        return "left";
      }
    } else {
      if (character.y_heading >= 0) {
        return "down";
      } else {
        return "up";
      }
    }
  }


  character.setState = function(state, direction) {
    character.state = state;

    if (character.state == "standing") character.setAction("stand");

    if (character.state == "directed_walk") {
      if (direction == "right") {
        character.x_heading = 1;
        character.y_heading = 0;
      } else if (direction == "left") {
        character.x_heading = -1;
        character.y_heading = 0;
      } else if (direction == "up") {
        character.x_heading = 0;
        character.y_heading = -1;
      } else if (direction == "down") {
        character.x_heading = 0;
        character.y_heading = 1;
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

      character.x_heading = Math.cos(angle * 180 / Math.PI);
      character.y_heading = Math.sin(angle * 180 / Math.PI);

      character.setAction("walk");
    }
  }


  character.setAction = function(action) {
    character.action = action;
    let direction = character.getDirection();
    let desired_pose = action + "_" + character.getDirection();
    if (!(desired_pose in character.poses)) {
      if (character.x_heading >= 0) {
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


  character.update = function(illegal_area, width, height) {

    
    if (character.action == "walk") {
      character.last_x = character.x;
      character.last_y = character.y;
      character.x += character.walk_speed * character.x_heading;
      character.y += character.walk_speed * character.y_heading;

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
        if (x_int in illegal_area && illegal_area[x_int][y_int] != null) {
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
  } 

  character.setState("standing");
  return character;
}
