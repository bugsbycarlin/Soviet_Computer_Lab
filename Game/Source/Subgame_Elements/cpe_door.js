//
// The door class makes doors for Centrally Planned Economy.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//

CentrallyPlannedEconomy.prototype.makeDoor = function(number, x, y) {
  let door = new PIXI.Container();
  door.position.set(0,0);

  door.type = "door";
  door.number = number;

  PIXI.utils.clearTextureCache();
  door.animations = {};

  let path = "Art/CPE/Animations/door_" + number + ".json";
  let sheet = PIXI.Loader.shared.resources[path].spritesheet;
  for(const key in sheet.animations) {
    door.animations[key] = makeAnimatedSprite(path, key, door, 0, 0);
    door.animations[key].loop = false;
    door.animations[key].animationSpeed = 0.14;
    door.animations[key].visible = false;
  }

  door.position.set(x, y);

  door.animations["open"].visible = true;
  door.animations["open"].gotoAndStop(0);
  door.state = "closed";

  if (number == 1) {
    door.trigger_x = door.x + 27;
    door.trigger_y = door.y + 34;
  } else if (number == 2) {
    door.trigger_x = door.x + 16;
    door.trigger_y = door.y + 28;
  } else if (number == 3) {
    door.trigger_x = door.x + 8;
    door.trigger_y = door.y + 28;
  }

  door.open = function() {
    door.animations["open"].visible = true;
    door.animations["close"].visible = false;
    door.animations["open"].gotoAndStop(0);
    door.animations["open"].play();
    door.state = "open";
    soundEffect("door");
  }


  door.close = function() {
    door.animations["open"].visible = false;
    door.animations["close"].visible = true;
    door.animations["close"].gotoAndStop(0);
    door.animations["close"].play();
    door.state = "closed";
    soundEffect("door"); // wrong sound effect depending on door type
  }


  door.animating = function() {
    return (door.animations["open"].playing || door.animations["close"].playing);
  }

  return door;
}
