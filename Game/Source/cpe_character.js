
//
// The character class makes characters and has methods
// for making them move around. Actual input/control is handled elsewhere.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//

var default_walk_speed = 4.5;
var frame_time = 50;

var cpe_frames = [0, 1, 2, 3, 4, 5];

Game.prototype.makeCpeCharacter = function(character_name) {
  let character = new PIXI.Container();
  character.position.set(0,0);

  character.type = "character";
  character.character_name = character_name;
  character.sprite_count = 10;
  // if (character_name == "grigory") character.sprite_count = 7;

  // character.red_circle = new PIXI.Sprite(PIXI.Texture.from("Art/red_circle.png"));
  // character.red_circle.anchor.set(0.5,0.78125);
  // character.red_circle.position.set(0,0);
  // character.red_circle.visible = false;
  // character.addChild(character.red_circle);
  let sheet = PIXI.Loader.shared.resources["Art/CPE/Characters/" + character_name + ".json"].spritesheet;
  console.log(sheet.animations);
  character.character_sprite = {};
  for(const key in sheet.animations) {
    character.character_sprite[key] = new PIXI.AnimatedSprite(sheet.animations[key]);
    character.character_sprite[key].anchor.set(0.5,0.82);
    character.character_sprite[key].position.set(0, 0);
    character.addChild(character.character_sprite[key]);
    character.character_sprite[key].visible = false;
  }

  character.state = "stopped";

  character.frame_time = frame_time;
  character.last_image_time = null;
  character.walk_speed = default_walk_speed;

  character.step_value = 0;

  character.move = function(direction) {

    character.direction = direction;
    if (direction == "left") character.target_x = character.x - cell_width;
    if (direction == "right") character.target_x = character.x + cell_width;
    if (direction == "up") character.target_y = character.y - cell_height;
    if (direction == "down") character.target_y = character.y + cell_height;

    character.updateDirection();
    character.state = "walking";
  }


  character.previousPose = function() {
    if (character.direction == null) {
      character.direction = Object.keys(character.character_sprite)[0];
    } else {
      character.direction = prev(Object.keys(character.character_sprite), character.direction);
    }
    character.updateDirection();
  }


  character.nextPose = function() {
    if (character.direction == null) {
      character.direction = Object.keys(character.character_sprite)[0];
    } else {
      character.direction = next(Object.keys(character.character_sprite), character.direction);
    }
    character.updateDirection();
  }


  character.walk = function() {
    character.showCorrect();

    if (character.direction == "down") {
      character.y += character.walk_speed;
      if (character.y >= character.target_y) {
        character.state = "stopped";
        character.y = character.target_y;
      }
    } else if (character.direction == "up") {
      character.y -= character.walk_speed;
      if (character.y <= character.target_y) {
        character.state = "stopped";
        character.y = character.target_y;
      }
    } else if (character.direction == "left") {
      character.x -= character.walk_speed;
      if (character.x <= character.target_x) {
        character.state = "stopped";
        character.x = character.target_x;
      }
    } else if (character.direction == "right") {
      character.x += character.walk_speed;
      if (character.x >= character.target_x) {
        character.state = "stopped";
        character.x = character.target_x;
      }
    }


    if (character.last_image_time == null) {
      character.last_image_time = Date.now();
    } else if (Date.now() - character.last_image_time > character.frame_time) {
      character.step_value = (character.step_value + 1) % cpe_frames.length;
      character.character_sprite[character.direction].gotoAndStop(cpe_frames[character.step_value]);
      character.last_image_time = Date.now();
    }
  } 


  character.setPose = function(pose_name) {
    if (pose_name == null) return;

    character.direction = pose_name;
    character.showCorrect();
    character.character_sprite[character.direction].gotoAndStop(1);
    character.last_image_time = Date.now();
  }


  character.updateDirection = function() {
    if (character.direction == null) return;

    character.showCorrect();
    character.character_sprite[character.direction].gotoAndStop(1);
    character.last_image_time = Date.now();
  }


  character.showCorrect = function() {
    for(const key in character.character_sprite) {
      if (key == character.direction) {
        character.character_sprite[key].visible = true;
      } else {
        character.character_sprite[key].visible = false;
      }
    }
  }

  // character.character_sprite[character.direction].gotoAndStop(1);
  character.nextPose();
  return character;
}
