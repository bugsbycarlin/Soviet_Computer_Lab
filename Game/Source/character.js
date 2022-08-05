
//
// The character class makes characters and has methods
// for making them move around. Actual input/control is handled elsewhere.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//

var default_walk_speed = 4.5;
var walk_frame_time = 50;

var directions = ["down", "left", "up", "right"]

Game.prototype.makeCharacter = function(character_name) {
  let character = new PIXI.Container();
  character.position.set(0,0);

  character.type = "character";
  character.character_name = character_name;

  // character.red_circle = new PIXI.Sprite(PIXI.Texture.from("Art/red_circle.png"));
  // character.red_circle.anchor.set(0.5,0.78125);
  // character.red_circle.position.set(0,0);
  // character.red_circle.visible = false;
  // character.addChild(character.red_circle);

  let sheet = PIXI.Loader.shared.resources["Art/Math_Game/grigory.json"].spritesheet;
  console.log(sheet);
  character.character_sprite = {};
  for(let i = 0; i < 4; i++) {
    character.character_sprite[directions[i]] = new PIXI.AnimatedSprite(sheet.animations[directions[i]]);
    character.character_sprite[directions[i]].anchor.set(0.5,0.82);
    character.character_sprite[directions[i]].position.set(0, 0);
    character.addChild(character.character_sprite[directions[i]]);
    character.character_sprite[directions[i]].visible = false;
  }

  character.state = "stopped";

  character.character_sprite["down"].visible = true;

  character.direction = "down";
  character.walk_frame_time = walk_frame_time;
  character.last_image_time = null;
  character.walk_speed = default_walk_speed;

  character.step_value = 0;
  character.step_list = [0, 1, 2, 1];

  character.move = function(direction) {

    character.direction = direction;
    if (direction == "left") character.target_x = character.x - cell_width;
    if (direction == "right") character.target_x = character.x + cell_width;
    if (direction == "up") character.target_y = character.y - cell_height;
    if (direction == "down") character.target_y = character.y + cell_height;

    character.updateDirection();
    character.state = "walking";
  }


  character.walk = function() {
    for(let i = 0; i < 4; i++) {
      if (directions[i] == character.direction) {
        character.character_sprite[directions[i]].visible = true;
      } else {
        character.character_sprite[directions[i]].visible = false;
      }
    }

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
    } else if (Date.now() - character.last_image_time > character.walk_frame_time) {
      character.step_value = (character.step_value + 1) % character.step_list.length;
      character.character_sprite[character.direction].gotoAndStop(character.step_list[character.step_value]);
      character.last_image_time = Date.now();
    }
  } 


  character.updateDirection = function() {
    if (character.direction == null) return;

    for(let i = 0; i < 4; i++) {
      if (directions[i] == character.direction) {
        character.character_sprite[directions[i]].visible = true;
      } else {
        character.character_sprite[directions[i]].visible = false;
      }
    }

    character.character_sprite[character.direction].gotoAndStop(1);
    character.last_image_time = Date.now();
  }


  character.character_sprite[character.direction].gotoAndStop(1);
  return character;
}
