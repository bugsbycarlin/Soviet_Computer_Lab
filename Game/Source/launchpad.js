
class Launchpad {
  constructor(game, parent, player, player_bases, x, y, size) {
    this.tiles = [];
    this.cursor = 0;

    this.game = game;
    this.parent = parent;

    this.pad = new PIXI.Container();
    this.parent.addChild(this.pad);
    this.pad.position.set(x, y);

    this.size = size;

    console.log("making a launch pad");

    this.x = x;
    this.y = y;

    this.can_play = false;

    this.picker_speed = 200;

    this.player = player;
    this.player_bases = player_bases;

    // cursor markers
    this.cursors = [];
    for (var i = 0; i < board_width; i++) {
      var cursor = PIXI.Sprite.from(PIXI.Texture.WHITE);
      this.cursors[i] = cursor;
      cursor.width = size - 4;
      cursor.height = 2;
      cursor.anchor.set(0.5 , 0.5);
      cursor.position.set(this.xi(i), -4);
      cursor.tint = 0x3cb0f3;
      cursor.alpha = (board_width - i) / (board_width + 4);
      this.pad.addChild(cursor);
    }

    // mask to prevent overflow
    // let launchpad_mask = new PIXI.Graphics();
    // launchpad_mask.beginFill(0xFF3300);
    // launchpad_mask.drawRect(this.parent.x + this.x, this.parent.y + this.y - 32, this.parent.scale.x * this.outer_size * board_width, this.parent.scale.y * 150);
    // launchpad_mask.endFill();
    // this.pad.mask = launchpad_mask;

    this.underline_text = new PIXI.Text("TOO SHORT", {fontFamily: "Press Start 2P", fontSize: 12, fill: 0xc16363, letterSpacing: 3, align: "center",
        dropShadow: true, dropShadowColor: 0xFFFFFF, dropShadowDistance: 1});
    this.underline_text.position.set(6 * this.size, -48);
    this.underline_text.anchor.set(0.5,0.5);
    this.pad.addChild(this.underline_text);
    this.underline_text.visible = false;
    // this.underline_text.tint = 0xc16363;

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
    this.error = this.game.markTime();
    // flicker(this.underline_text, 300, 0xFFFFFF, 0xc16363);
    this.underline_text.shake = this.game.markTime();
  }


  checkError(){
    if (this.error != null) {
      if (this.game.timeSince(this.error) >= 150) {
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

    var tile = game.makePixelatedLetterTile(this.parent, letter, "white");
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
      game.freefalling.push(dead_tile);

      this.checkWord();
    }
  }


  clear() {
    let size = this.wordSize();
    for (i = 0; i < size; i++) {
      this.pop();
    }
  }


  // smallShiftRight(){
  //   if (!(this.wordSize() + this.shift >= board_width)) {
  //     this.shiftSet(this.shift + 1);

  //     this.checkWord();
  //   }
  // }


  // smallShiftLeft(){
  //   if (this.shift > 0) {
  //     this.shiftSet(this.shift - 1);

  //     this.checkWord();
  //   }
  // }


  // bigShiftRight(){
  //   if (!(this.wordSize() + this.shift >= board_width)) {
  //     if (this.wordSize() > 0) {
  //       this.shiftSet(board_width - this.wordSize());
  //     } else {
  //       this.shiftSet(board_width - 1);
  //     }

  //     this.checkWord();
  //   }
  // }


  // bigShiftLeft(){
  //   if (this.shift > 0) {
  //     this.shiftSet(0);

  //     this.checkWord();
  //   }
  // }


  // shiftSet(value) {
  //   if (value >= 0 && value <= board_width) {
  //     this.shift = value;
  //     for (var i = 0; i < this.tiles.length; i++) {
  //       var item = this.tiles[i];
  //       var x = this.xi(i + this.shift);
  //       var tween = new TWEEN.Tween(item.position)
  //         .to({x: x})
  //         .duration(200)
  //         .easing(TWEEN.Easing.Cubic.InOut)
  //         .start();
  //     }

  //     for (var i = 0; i < board_width; i++) {
  //       var cursor = this.cursors[i];
  //       var x = this.xi(i + this.shift);
  //       var tween = new TWEEN.Tween(cursor.position)
  //         .to({x: x})
  //         .duration(200)
  //         .easing(TWEEN.Easing.Cubic.InOut)
  //         .start();
  //     }
  //   }
  // }


  checkWord(){
    var word = this.word();

    this.can_play = true;

    if (word.length > 0 && word.length <= 3) {
      this.can_play = false;
      this.underline_text.text = "TOO SHORT";
    }

    //if(this.game.level_type == "normal") {
    if (word.length > 3 && !(word in game.legal_words)) {
      this.can_play = false;
      this.underline_text.text = "NOT A WORD";
    }
    //}

    if (word.length > 3 && (word in game.played_words)) {
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
      game.played_words[word] = 1;
        
      let match_base = null;
      for (let i = 0; i < this.player_bases.length; i++) {
        let base = this.player_bases[i];
        if (base.HP > 0 && base.text === word[0]) {
          match_base = base;
        }
      }

      this.game.queueLaunch(word, this.player, match_base)

      for (var i = 0; i < this.tiles.length; i++) {
        var pad_item = this.tiles[i];
        var letter = pad_item.text;
        // if (pad_item.broken === false) {
        //   let rocket_tile = game.makeRocketTile(area, letter, word.length, i, this.shift, this.player, this.size, this.size)
        //   game.rocket_letters.push(rocket_tile);
        // }

        this.parent.removeChild(pad_item);
      }

      game.wpm_history.push([word, game.markTime()]);

      this.tiles = [];
      this.cursor = 0;
    } else {
      this.flashError();
    }
  }
}
