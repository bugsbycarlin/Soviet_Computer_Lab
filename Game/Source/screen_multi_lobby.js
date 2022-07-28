

Game.prototype.initializeMultiLobby = function() {
  let self = this;
  let screen = this.screens["multi_lobby"];
  this.clearScreen(screen);

  this.lobby_sections = {};

  this.multi_lobby_state = "active";

  let background = PIXI.Sprite.from(PIXI.Texture.WHITE);
  background.anchor.set(0, 0);
  background.width = this.width;
  background.height = this.height;
  background.tint = 0x1d2120;
  screen.addChild(background);

  this.lobby_profile_borders = [];
  this.lobby_profile_pics = [];
  this.lobby_profile_names = [];

  this.profile_background_layer = new PIXI.Container();
  screen.addChild(this.profile_background_layer);

  this.profile_picture_layer = new PIXI.Container();
  screen.addChild(this.profile_picture_layer);

  this.profile_overlay_layer = new PIXI.Container();
  screen.addChild(this.profile_overlay_layer);

  for (let i = 0; i < 4; i++) {
    let profile_border = PIXI.Sprite.from(PIXI.Texture.WHITE);
    profile_border.width = 160;
    profile_border.height = 160;
    profile_border.anchor.set(0, 0);
    profile_border.position.set(280, 120 + 200 * i);
    profile_border.alpha = 0.5;
    this.profile_background_layer.addChild(profile_border);
    this.lobby_profile_borders.push(profile_border);

    let profile_pic = PIXI.Sprite.from(PIXI.Texture.WHITE);
    profile_pic.visible = false;
    this.profile_picture_layer.addChild(profile_pic);
    this.lobby_profile_pics.push(profile_pic);

    let profile_name = new PIXI.Text("", {fontFamily: "Press Start 2P", fontSize: 20, fill: 0xFFFFFF, letterSpacing: 2, align: "center",
    dropShadow: true, dropShadowColor: 0x000000, dropShadowDistance: 8, dropShadowAngle: Math.PI/4});
    profile_name.scaleMode = PIXI.SCALE_MODES.NEAREST;
    profile_name.anchor.set(0.5,0.5);
    profile_name.position.set(280 + 80, 120 + 200 * i + 160);
    this.profile_overlay_layer.addChild(profile_name);
    this.lobby_profile_names.push(profile_name);

    let left_arrow = new PIXI.Sprite(PIXI.Texture.from("Art/Nav/arrow_pixelated.png"));
    left_arrow.scaleMode = PIXI.SCALE_MODES.NEAREST;
    left_arrow.scale.set(-0.75,0.75);
    left_arrow.anchor.set(0.5, 0.5);
    left_arrow.position.set(280, 120 + 200 * i + 160);
    this.profile_overlay_layer.addChild(left_arrow);

    let right_arrow = new PIXI.Sprite(PIXI.Texture.from("Art/Nav/arrow_pixelated.png"));
    right_arrow.scaleMode = PIXI.SCALE_MODES.NEAREST;
    right_arrow.scale.set(0.75,0.75);
    right_arrow.anchor.set(0.5, 0.5);
    right_arrow.position.set(280 + 160, 120 + 200 * i + 160);
    this.profile_overlay_layer.addChild(right_arrow);
  }

  console.log(this.state)
  if (this.state.p1_state == "joined") {
    this.lobby_profile_names[0].text = this.state.p1_name;
    this.multiLobbySetPicture(1, this.state.p1_picture_number)
  }


  //   if (i != this.player_number - 1) profile_border.alpha = 0.5;

  //   console.log(this.player_number - 1);
  //   if (i == this.player_number - 1) {
  //     let profile_pic = new PIXI.Sprite(PIXI.Texture.from("Art/Player_Pictures/" + multiplayer_picture_number + ".jpg"));
  //     profile_pic.scale.set(0.6, 0.6);
  //     profile_pic.anchor.set(0, 0);
  //     profile_pic.position.set(280 + 3, 120 + 200 * i + 3);
  //     screen.addChild(profile_pic);
  //     this.lobby_profile_pics.push(profile_pic);

  //   }
  // }


  // Create a test game.
  // if (this.multi_type == "quick" || this.multi_type == "create") {
  //   this.network.createNewGame("quick_open", function() {
  //     console.log("I did the network call successfully.")
  //   }, function() {
  //     console.log("Error with network call.")
  //   });
  // } else if (this.multi_type == "join") {
  //   this.network.joinGame("JJHHA", function() {
  //     console.log("YAS QWEEN");
  //   }, function() {
  //     console.log("NO QUEEN?");
  //   });
  // }
}


Game.prototype.multiLobbySetPicture = function(player_num, picture_number) {
  let self = this;
  let screen = this.screens["multi_lobby"];
  
  this.profile_picture_layer.removeChild(this.lobby_profile_pics[player_num - 1]);
  let profile_pic = null;
  if (picture_number != -1) {
    profile_pic = new PIXI.Sprite(PIXI.Texture.from("Art/Player_Pictures/" + picture_number + ".jpg"));
    profile_pic.scale.set(0.6, 0.6);
    profile_pic.anchor.set(0, 0);
    profile_pic.position.set(280 + 3, 120 + 200 * (player_num - 1) + 3);
  
    this.lobby_profile_borders[player_num - 1].alpha = 1;
  } else {
    profile_pic = PIXI.Sprite.from(PIXI.Texture.WHITE);
    profile_pic.visible = false;

    this.lobby_profile_borders[player_num - 1].alpha = 0.5;
  }
  this.profile_picture_layer.addChild(profile_pic);
  delete this.lobby_profile_pics[player_num - 1];
  this.lobby_profile_pics[player_num - 1] = profile_pic;
}


Game.prototype.multiLobbyKeyDown = function(ev) {
  let self = this;
  let screen = this.screens["multi_lobby"];

  if (this.multi_lobby_state == "active") {
    if (ev.key === "ArrowLeft") {
      multiplayer_picture_number = (multiplayer_picture_number + 127) % 128;
      localStorage.setItem("soviet_computer_lab_multiplayer_picture_number", multiplayer_picture_number);
    
      this.multiLobbySetPicture(this.player_number, multiplayer_picture_number)
      // gotta update it in multi as well  

    } else if (ev.key === "ArrowRight") {
      multiplayer_picture_number = (multiplayer_picture_number + 129) % 128;
      localStorage.setItem("soviet_computer_lab_multiplayer_picture_number", multiplayer_picture_number);
    
      this.multiLobbySetPicture(this.player_number, multiplayer_picture_number)
      // gotta update it in multi as well  
    }

    // else if (ev.key === "Enter") {
    //   this.title_choices.choose();
    // } else if (ev.key === "Escape") {
    //   this.title_choices.escape();
    // }
  }
}