//
// This file contains the Launchpad for the Kuzka's Mother subgame.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//

class Launchpad {
  constructor(subgame, parent, player, player_bases, x, y, size) {
    this.tiles = [];
    this.cursor = 0;

    this.parent = parent;

    // TO DO: ech.
    this.subgame = subgame;

    this.pad = new PIXI.Container();
    this.parent.addChild(this.pad);
    this.pad.position.set(x, y);

    this.size = size;

    this.x = x;
    this.y = y;

    this.can_play = false;

    this.picker_speed = 200;

    this.player = player;
    this.player_bases = player_bases;

    // cursor markers
    this.cursors = [];
    for (var i = 0; i < board_width; i++) {
      let cursor = makeBlank(this.pad, size - 4, 2, this.xi(i), -4, 0x3cb0f3)
      cursor.anchor.set(0.5 , 0.5);
      cursor.alpha = (board_width - i) / (board_width + 4);
      this.cursors[i] = cursor;
    }

    const font_1 = {fontFamily: "Press Start 2P", fontSize: 16, fill: 0xc16363, letterSpacing: 3, align: "center",
        dropShadow: true, dropShadowColor: 0xFFFFFF, dropShadowDistance: 2};

    this.underline_text = makeText("TOO SHORT", font_1, this.pad, 6 * this.size, -48, 0.5, 0.5);
    this.underline_text.visible = false;
  }


  wordSize() {
    return this.tiles.length;
  }


  word() {
    var word = "";
    for (var i = 0; i < this.tiles.length; i++) {
      word += this.tiles[i].text;
    }
    return word;
  }


  flashError(){
    soundEffect("negative");
    this.error = markTime();
    // flicker(this.underline_text, 300, 0xFFFFFF, 0xc16363);
    this.underline_text.shake = markTime();
  }


  checkError(){
    if (this.error != null) {
      if (timeSince(this.error) >= 150) {
        this.error = null;
        // this.pad_mat.tint = 0x000000; //0x2c3130;
      }
    }
  }


  full() {
    return this.wordSize() >= board_width;
  }


  xi(number) {
    return this.size * (number) + this.size / 2;
  }


  push(palette, letter) {
    var target_x = this.x + this.xi(this.cursor);
    var target_y = this.y - this.size / 2;

    // var start_x = (palette.letters[letter].position.x + palette.position.x - this.parent.position.x) / this.parent.scale.x;
    // var start_y = (palette.letters[letter].position.y + palette.position.y - this.parent.position.y) / this.parent.scale.y;

    var tile = makePixelatedLetterTile(this.parent, letter, "white");
    tile.text = letter;
    tile.parent = this.parent;
    this.tiles.push(tile);
    this.cursor += 1;
    tile.parent = this.parent;
    tile.broken = false;

    this.checkWord();

    tile.position.set(-100, target_y);
    // tile.position.set(target_x, target_y);
    // tile.alpha = 0.01;
    new TWEEN.Tween(tile.position)
      .to({x: target_x})
      .duration(this.picker_speed)
      .start()

    if (this.wordSize() > board_width) {
      this.smallShiftLeft();
    }

    return tile;
  }


  pop() {
    if (this.wordSize() > 0) {
      var dead_tile = this.tiles.pop();
      this.cursor -= 1;
      dead_tile.vx = -10 + Math.random() * 20;
      dead_tile.vy = -4 - Math.random() * 14;
      freefalling.push(dead_tile);

      this.checkWord();
    }
  }


  clear() {
    let size = this.wordSize();
    for (i = 0; i < size; i++) {
      this.pop();
    }
  }


  checkWord(){
    var word = this.word();

    this.can_play = true;

    if (word.length > 0 && word.length <= 3) {
      this.can_play = false;
      this.underline_text.text = "TOO SHORT";
    }

    if (word.length > 3 && !(word in game.legal_words)) {
      this.can_play = false;
      this.underline_text.text = "NOT A WORD";
    }

    if (word.length > 3 && (word in this.subgame.played_words)) {
      this.can_play = false;
      this.underline_text.text = "ALREADY PLAYED";
    }

    if (word.length > 3) {
      let match_letter = false;
      let allowed_letters = [];
      for (let i = 0; i < this.player_bases.length; i++) {
        let base = this.player_bases[i];
        if (base.HP > 0 && base.text === word[0]) {
          match_letter = true;
        }
        if (base.HP > 0) allowed_letters.push(base.text);
      }
      if (!match_letter) {
        this.can_play = false;
        this.underline_text.text = "START WITH " + allowed_letters.join(",");
      }
    }


    if (this.can_play) {
      this.underline_text.visible = false;
      for (var i = 0; i < board_width; i++) {
        this.cursors[i].tint = 0x3cb0f3;
      }
    } else {
      this.underline_text.visible = true;
      for (var i = 0; i < board_width; i++) {
        this.cursors[i].tint = 0xc16363;
      }
    }
  }


  launch(area) {
    this.checkWord();
    var word = this.word();
    if (this.can_play == true) {
      this.subgame.played_words[word] = 1;
        
      let match_base = null;
      for (let i = 0; i < this.player_bases.length; i++) {
        let base = this.player_bases[i];
        if (base.HP > 0 && base.text === word[0]) {
          match_base = base;
        }
      }

      this.subgame.queueLaunch(word, this.player, match_base)

      for (var i = 0; i < this.tiles.length; i++) {
        var pad_item = this.tiles[i];
        var letter = pad_item.text;

        this.parent.removeChild(pad_item);
      }

      this.subgame.wpm_history.push([word, markTime()]);

      this.tiles = [];
      this.cursor = 0;
    } else {
      this.flashError();
    }
  }
}
