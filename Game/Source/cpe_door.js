
//
// The door class makes doors for Centrally Planned Economy.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//

Game.prototype.makeCpeDoor = function(number) {
  let door = new PIXI.Container();
  door.position.set(0,0);

  door.type = "door";
  door.number = number;

  PIXI.utils.clearTextureCache();
  let sheet = PIXI.Loader.shared.resources["Art/CPE/Animations/door_" + number + ".json"].spritesheet;
  door.animations = {};
  for(const key in sheet.animations) {
    door.animations[key] = new PIXI.AnimatedSprite(sheet.animations[key]);
    door.animations[key].texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
    door.animations[key].position.set(0, 0);
    door.animations[key].loop = false;
    door.animations[key].animationSpeed = 0.14;
    door.addChild(door.animations[key]);
    door.animations[key].visible = false;
  }

  door.animations["open"].visible = true;
  door.animations["open"].gotoAndStop(0);
  door.state = "closed";


  door.open = function() {
    door.animations["open"].visible = true;
    door.animations["close"].visible = false;
    door.animations["open"].gotoAndStop(0);
    door.animations["open"].play();
    door.state = "open";
  }


  door.close = function() {
    door.animations["open"].visible = false;
    door.animations["close"].visible = true;
    door.animations["close"].gotoAndStop(0);
    door.animations["close"].play();
    door.state = "closed";
  }


  door.animating = function() {
    return (door.animations["open"].playing || door.animations["close"].playing);
  }

  return door;
}
