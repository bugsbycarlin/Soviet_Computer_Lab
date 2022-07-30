

let multi_lobby_x_left = 280;
let multi_lobby_y_top = 80;
let multi_lobby_y_span = 220;

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
  this.lobby_ranked_preferences = [];

  this.lobby_background_layer = new PIXI.Container();
  screen.addChild(this.lobby_background_layer);

  this.lobby_picture_layer = new PIXI.Container();
  screen.addChild(this.lobby_picture_layer);

  this.lobby_overlay_layer = new PIXI.Container();
  screen.addChild(this.lobby_overlay_layer);

  for (let i = 0; i < 4; i++) {
    let profile_border = PIXI.Sprite.from(PIXI.Texture.WHITE);
    profile_border.width = 160;
    profile_border.height = 160;
    profile_border.anchor.set(0, 0);
    profile_border.position.set(multi_lobby_x_left, multi_lobby_y_top + multi_lobby_y_span * i);
    profile_border.alpha = 0.5;
    this.lobby_background_layer.addChild(profile_border);
    this.lobby_profile_borders.push(profile_border);

    let profile_pic = PIXI.Sprite.from(PIXI.Texture.WHITE);
    profile_pic.visible = false;
    this.lobby_picture_layer.addChild(profile_pic);
    this.lobby_profile_pics.push(profile_pic);

    let profile_name = new PIXI.Text("", {fontFamily: "Press Start 2P", fontSize: 20, fill: 0xFFFFFF, letterSpacing: 2, align: "center",
    dropShadow: true, dropShadowColor: 0x000000, dropShadowDistance: 2, dropShadowAngle: Math.PI/4});
    profile_name.scaleMode = PIXI.SCALE_MODES.NEAREST;
    profile_name.anchor.set(0.5,0.5);
    profile_name.position.set(multi_lobby_x_left + 80, multi_lobby_y_top + multi_lobby_y_span * i + 180);
    this.lobby_overlay_layer.addChild(profile_name);
    this.lobby_profile_names.push(profile_name);

    let ranked_preference = new PIXI.Text("UNRANKED", {fontFamily: "Press Start 2P", fontSize: 10, fill: 0xFFFFFF, letterSpacing: 2, align: "center",
    dropShadow: true, dropShadowColor: 0x000000, dropShadowDistance: 2, dropShadowAngle: Math.PI/4});
    ranked_preference.scaleMode = PIXI.SCALE_MODES.NEAREST;
    ranked_preference.anchor.set(0.5,0.5);
    ranked_preference.position.set(multi_lobby_x_left + 80, multi_lobby_y_top + multi_lobby_y_span * i - 5);
    this.lobby_overlay_layer.addChild(ranked_preference);
    this.lobby_ranked_preferences.push(ranked_preference);

    let left_arrow = new PIXI.Sprite(PIXI.Texture.from("Art/Nav/arrow_pixelated.png"));
    left_arrow.scaleMode = PIXI.SCALE_MODES.NEAREST;
    left_arrow.scale.set(-0.75,0.75);
    left_arrow.anchor.set(0.5, 0.5);
    left_arrow.tint = 0xDEDEFF;
    left_arrow.position.set(multi_lobby_x_left, multi_lobby_y_top + multi_lobby_y_span * i + 155);
    this.lobby_overlay_layer.addChild(left_arrow);

    let right_arrow = new PIXI.Sprite(PIXI.Texture.from("Art/Nav/arrow_pixelated.png"));
    right_arrow.scaleMode = PIXI.SCALE_MODES.NEAREST;
    right_arrow.scale.set(0.75,0.75);
    right_arrow.anchor.set(0.5, 0.5);
    right_arrow.tint = 0xDEDEFF;
    right_arrow.position.set(multi_lobby_x_left + 160, multi_lobby_y_top + multi_lobby_y_span * i + 155);
    this.lobby_overlay_layer.addChild(right_arrow);
  }


  let game_code_text = new PIXI.Text("GAME CODE: " + this.game_code, {fontFamily: "Press Start 2P", fontSize: 32, fill: 0xFFFFFF, letterSpacing: 2, align: "center"});
  game_code_text.scaleMode = PIXI.SCALE_MODES.NEAREST;
  game_code_text.anchor.set(0.5,0.5);
  game_code_text.position.set(this.width/2, 120);
  this.lobby_overlay_layer.addChild(game_code_text);

  let multi_lobby_go_button = new PIXI.Text("GO", {fontFamily: "Press Start 2P", fontSize: 32, fill: 0x66EE66, letterSpacing: 2, align: "center"});
  multi_lobby_go_button.scaleMode = PIXI.SCALE_MODES.NEAREST;
  multi_lobby_go_button.anchor.set(0.5,0.5);
  multi_lobby_go_button.position.set(1350, 840);
  this.lobby_overlay_layer.addChild(multi_lobby_go_button);
  this.multi_lobby_go_button = multi_lobby_go_button;

  let no_go = new PIXI.Sprite(PIXI.Texture.from("Art/Nav/no_symbol_pixelated.png"));
  no_go.scaleMode = PIXI.SCALE_MODES.NEAREST;
  no_go.scale.set(1,1);
  no_go.anchor.set(0.5, 0.5);
  no_go.alpha = 0.6;
  no_go.position.set(1350, 837);
  this.lobby_overlay_layer.addChild(no_go);
  this.no_go = no_go;


  console.log(this.state)
  if (this.state.p1_state == "joined") {
    this.lobby_profile_names[0].text = this.state.p1_name;
    this.multiLobbySetPicture(1, this.state.p1_picture_number)
  }
}


Game.prototype.multiLobbySetPicture = function(player_num, picture_number) {
  let self = this;
  let screen = this.screens["multi_lobby"];
  
  this.lobby_picture_layer.removeChild(this.lobby_profile_pics[player_num - 1]);
  let profile_pic = null;
  if (picture_number != -1) {
    profile_pic = new PIXI.Sprite(PIXI.Texture.from("Art/Player_Pictures/" + picture_number + ".jpg"));
    profile_pic.scale.set(0.6, 0.6);
    profile_pic.anchor.set(0, 0);
    profile_pic.position.set(multi_lobby_x_left + 3, multi_lobby_y_top + multi_lobby_y_span * (player_num - 1) + 3);
  
    this.lobby_profile_borders[player_num - 1].alpha = 1;
  } else {
    profile_pic = PIXI.Sprite.from(PIXI.Texture.WHITE);
    profile_pic.visible = false;

    this.lobby_profile_borders[player_num - 1].alpha = 0.5;
  }
  this.lobby_picture_layer.addChild(profile_pic);
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