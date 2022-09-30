//
// This file contains the multiplayer lobby, where options and chosen and players
// gather and wait before an actual game is played.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//


const multi_lobby_x_left = 280;
const multi_lobby_y_top = 80;
const multi_lobby_y_span = 220;

class MultiLobby extends Screen {
  initialize() {
    this.state = "active";

    let background = makeBlank(this, game.width, game.height, 0, 0, 0x1d2120);

    this.profile_borders = [];
    this.profile_pics = [];
    this.profile_names = [];
    this.ranked_preferences = [];

    this.background_layer = new PIXI.Container();
    this.addChild(this.background_layer);

    this.picture_layer = new PIXI.Container();
    this.addChild(this.picture_layer);

    this.overlay_layer = new PIXI.Container();
    this.addChild(this.overlay_layer);

    let font = (size) => {return {fontFamily: "Press Start 2P", fontSize: size, fill: 0xFFFFFF, letterSpacing: 2, align: "center", dropShadow: true, dropShadowColor: 0x000000, dropShadowDistance: 2, dropShadowAngle: Math.PI/4}};

    for (let i = 0; i < 4; i++) {
      let profile_border = makeBlank(this.background_layer, 160, 160, multi_lobby_x_left, multi_lobby_y_top + multi_lobby_y_span * i);
      profile_border.alpha = 0.5;
      this.profile_borders.push(profile_border);

      let profile_pic = makeBlank(this.picture_layer, 1, 1, 0, 0);
      profile_pic.visible = false;
      this.profile_pics.push(profile_pic);

      let profile_name = makeText("", font(20), this.overlay_layer, multi_lobby_x_left + 80, multi_lobby_y_top + multi_lobby_y_span * i + 180, 0.5, 0.5);
      this.profile_names.push(profile_name);

      let ranked_preference = makeText("UNRANKED", font(10), this.overlay_layer, multi_lobby_x_left + 80, multi_lobby_y_top + multi_lobby_y_span * i - 5, 0.5, 0.5);
      this.ranked_preferences.push(ranked_preference);

      let left_arrow = makeSprite("Art/Nav/arrow_pixelated.png", this.overlay_layer, multi_lobby_x_left, multi_lobby_y_top + multi_lobby_y_span * i + 155, 0.5, 0.5);
      left_arrow.scale.set(-0.75,0.75);
      left_arrow.tint = 0xDEDEFF;

      let right_arrow = makeSprite("Art/Nav/arrow_pixelated.png", this.overlay_layer, multi_lobby_x_left + 160, multi_lobby_y_top + multi_lobby_y_span * i + 155, 0.5, 0.5);
      right_arrow.scale.set(0.75,0.75);
      right_arrow.tint = 0xDEDEFF;
    }

    let font_32 = {fontFamily: "Press Start 2P", fontSize: 32, fill: 0xFFFFFF, letterSpacing: 2, align: "center"};
    let font_33 = {fontFamily: "Press Start 2P", fontSize: 32, fill: 0x66EE66, letterSpacing: 2, align: "center"};

    let game_code_text = makeText("GAME CODE: " + this.game_code, font_32, this.overlay_layer, game.width/2, 120, 0.5, 0.5);
    
    let go_button = makeText("GO", font_33, this.overlay_layer, 1350, 840, 0.5, 0.5);
    this.go_button = go_button;

    let no_go = makeSprite("Art/Nav/no_symbol_pixelated.png", this.overlay_layer, 1350, 837, 0.5, 0.5);
    no_go.alpha = 0.6;
    this.no_go = no_go;

    if (this.state.p1_state == "joined") {
      this.profile_names[0].text = this.state.p1_name;
      this.setPicture(1, this.state.p1_picture_number)
    }
  }


  setPicture(player_num, picture_number) {
    this.picture_layer.removeChild(this.profile_pics[player_num - 1]);
    let profile_pic = null;
    if (picture_number != -1) {
      profile_pic = makeSprite("Art/Player_Pictures/" + picture_number + ".jpg", this.picture_layer, multi_lobby_x_left + 3, multi_lobby_y_top + multi_lobby_y_span * (player_num - 1) + 3, 0.6, 0.6);
      this.profile_borders[player_num - 1].alpha = 1;
    } else {
      profile_pic = makeBlank(this.picture_layer, 1, 1, 0, 0);
      profile_pic.visible = false;
      this.profile_borders[player_num - 1].alpha = 0.5;
    }
    delete this.profile_pics[player_num - 1];
    this.profile_pics[player_num - 1] = profile_pic;
  }


  keyDown(ev) {
    if (this.state == "active") {
      if (ev.key === "ArrowLeft") {
        multiplayer_picture_number = (multiplayer_picture_number + 127) % 128;
        localStorage.setItem("soviet_computer_lab_multiplayer_picture_number", multiplayer_picture_number);
      
        this.setPicture(this.player_number, multiplayer_picture_number)
        // gotta update it in multi as well  

      } else if (ev.key === "ArrowRight") {
        multiplayer_picture_number = (multiplayer_picture_number + 129) % 128;
        localStorage.setItem("soviet_computer_lab_multiplayer_picture_number", multiplayer_picture_number);
      
        this.setPicture(this.player_number, multiplayer_picture_number)
        // gotta update it in multi as well  
      }

      // else if (ev.key === "Enter") {
      //   this.title_choices.choose();
      // } else if (ev.key === "Escape") {
      //   this.title_choices.escape();
      // }
    }
  }
}