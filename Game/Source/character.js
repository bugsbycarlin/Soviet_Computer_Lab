
//
// The character class makes characters and has methods
// for making them move around. Actual input/control is handled elsewhere.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//

var mg_default_walk_speed = 4.5;
var mg_frame_time = 50;

var sprites = ["down", "left", "up", "right", "victory", "work", "defeat"]
var walk_frames = [0, 1, 2, 1];
var work_frames = [0, 1, 2, 1, 0];
var victory_frames = [0, 1, 2, 1];
var defeat_frames = [0, 1, 2, 1];

Game.prototype.makeCharacter = function(character_name) {
  let character = new PIXI.Container();
  character.position.set(0,0);

  character.type = "character";
  character.character_name = character_name;
  character.sprite_count = 4;
  if (character_name == "grigory") character.sprite_count = 7;

  // character.red_circle = new PIXI.Sprite(PIXI.Texture.from("Art/red_circle.png"));
  // character.red_circle.anchor.set(0.5,0.78125);
  // character.red_circle.position.set(0,0);
  // character.red_circle.visible = false;
  // character.addChild(character.red_circle);
  let sheet = PIXI.Loader.shared.resources["Art/Math_Game/Characters/" + character_name + ".json"].spritesheet;
  character.character_sprite = {};
  for(let i = 0; i < character.sprite_count; i++) {
    character.character_sprite[sprites[i]] = new PIXI.AnimatedSprite(sheet.animations[sprites[i]]);
    character.character_sprite[sprites[i]].anchor.set(0.5,0.82);
    character.character_sprite[sprites[i]].position.set(0, 0);
    character.addChild(character.character_sprite[sprites[i]]);
    character.character_sprite[sprites[i]].visible = false;
  }

  character.state = "stopped";

  character.character_sprite["down"].visible = true;

  character.direction = "down";
  character.frame_time = mg_frame_time;
  character.last_image_time = null;
  character.walk_speed = mg_default_walk_speed;

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


  character.walk = function() {
    for(let i = 0; i < character.sprite_count; i++) {
      if (sprites[i] == character.direction) {
        character.character_sprite[sprites[i]].visible = true;
      } else {
        character.character_sprite[sprites[i]].visible = false;
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
    } else if (Date.now() - character.last_image_time > character.frame_time) {
      character.step_value = (character.step_value + 1) % walk_frames.length;
      character.character_sprite[character.direction].gotoAndStop(walk_frames[character.step_value]);
      character.last_image_time = Date.now();
    }
  } 


  character.updateDirection = function() {
    if (character.direction == null) return;

    for(let i = 0; i < character.sprite_count; i++) {
      if (sprites[i] == character.direction) {
        character.character_sprite[sprites[i]].visible = true;
      } else {
        character.character_sprite[sprites[i]].visible = false;
      }
    }

    character.character_sprite[character.direction].gotoAndStop(1);
    character.last_image_time = Date.now();
  }


  character.startWork = function() {
    if (character.character_name != "grigory") return;

    character.state = "working";
    character.step_value = 0;

    for(let i = 0; i < character.sprite_count; i++) {
      if (sprites[i] == "work") {
        character.character_sprite[sprites[i]].visible = true;
      } else {
        character.character_sprite[sprites[i]].visible = false;
      }
    }

    character.character_sprite["work"].gotoAndStop(0);
    character.last_image_time = Date.now();
  }


  character.work = function() {
    if (character.character_name != "grigory") return;

    if (character.last_image_time == null) {
      character.last_image_time = Date.now();
    } else if (Date.now() - character.last_image_time > character.frame_time) {
      character.step_value = character.step_value + 1;
      if (character.step_value < work_frames.length) {
        character.character_sprite["work"].gotoAndStop(work_frames[character.step_value]);
        character.last_image_time = Date.now();
        console.log("Work stopping on frame " + work_frames[character.step_value])
      } else {
        character.state = "stopped";
        character.updateDirection();
      }
    }
  }


  character.startVictory = function() {
    if (character.character_name != "grigory") return;

    character.state = "victory";
    character.step_value = 0;
    character.frame_time *= 2;

    for(let i = 0; i < character.sprite_count; i++) {
      if (sprites[i] == "victory") {
        character.character_sprite[sprites[i]].visible = true;
      } else {
        character.character_sprite[sprites[i]].visible = false;
      }
    }

    character.character_sprite["victory"].gotoAndStop(0);
    character.last_image_time = Date.now();
  }


  character.victory = function() {
    if (character.character_name != "grigory") return;

    if (character.last_image_time == null) {
      character.last_image_time = Date.now();
    } else if (Date.now() - character.last_image_time > character.frame_time) {
      character.step_value = (character.step_value + 1) % victory_frames.length;
      character.character_sprite["victory"].gotoAndStop(victory_frames[character.step_value]);
      character.last_image_time = Date.now();
      console.log("Victory frame " + victory_frames[character.step_value])
    }
  } 


  character.startDefeat = function() {
    if (character.character_name != "grigory") return;

    character.state = "defeat";
    character.step_value = 0;
    character.frame_time *= 3;

    for(let i = 0; i < character.sprite_count; i++) {
      if (sprites[i] == "defeat") {
        character.character_sprite[sprites[i]].visible = true;
      } else {
        character.character_sprite[sprites[i]].visible = false;
      }
    }

    character.character_sprite["defeat"].gotoAndStop(0);
    character.last_image_time = Date.now();
  }


  character.defeat = function() {
    if (character.character_name != "grigory") return;

    if (character.last_image_time == null) {
      character.last_image_time = Date.now();
    } else if (Date.now() - character.last_image_time > character.frame_time) {
      character.step_value = (character.step_value + 1) % defeat_frames.length;
      character.character_sprite["defeat"].gotoAndStop(defeat_frames[character.step_value]);
      character.last_image_time = Date.now();
    }
  }


  character.character_sprite[character.direction].gotoAndStop(1);
  return character;
}
