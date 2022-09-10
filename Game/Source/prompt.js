

Game.prototype.makePrompt = function(parent, x, y, text, fixed = false, finished_callback = false) {
  var self = this;

  let prompt = new PIXI.Container();
  prompt.position.set(x, y);
  parent.addChild(prompt);

  prompt.setText = function(text) {
    // for uppercase version
    //text = text.toUpperCase();

    prompt.permanent_text = text;
    prompt.word_list = prompt.permanent_text.split(/([^A-Za-z']+)/).filter(x => x); // the filter is to remove empties

    prompt.word_number = 0;
    prompt.carat = 0;
    prompt.typing = "";
    prompt.correct = true;
    prompt.complete = false;
    prompt.prefix_correct_count = 0;
    prompt.next_word = prompt.word_list[prompt.word_number];
    prompt.active_text = text
    if (prompt.active_text.length > 60) {
      prompt.active_text = prompt.active_text.slice(0, 100);
    }

    prompt.remaining_text.text = prompt.active_text;
  }

  prompt.fixed = fixed;
  prompt.finished_callback = finished_callback;

  prompt.prior_text = new PIXI.Text("", {fontFamily: "Press Start 2P", fontSize: 14, fill: 0x058025, letterSpacing: 0, align: "left"});
  prompt.prior_text.anchor.set(0, 0.5);
  prompt.prior_text.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  prompt.addChild(prompt.prior_text);

  prompt.typing_text = new PIXI.Text("", {fontFamily: "Press Start 2P", fontSize: 14, fill: 0x3cb0f3, letterSpacing: 0, align: "left"});
  prompt.typing_text.anchor.set(0, 0.5);
  prompt.typing_text.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  prompt.addChild(prompt.typing_text);

  prompt.strikethrough = new PIXI.Sprite.from(PIXI.Texture.WHITE);
  prompt.strikethrough.tint = 0x3cb0f3;
  prompt.strikethrough.width = 100;
  prompt.strikethrough.height = 2;
  prompt.strikethrough.anchor.set(0, 0.5)
  prompt.strikethrough.visible = false;
  prompt.addChild(prompt.strikethrough);

  prompt.prior_strikethrough = new PIXI.Sprite.from(PIXI.Texture.WHITE);
  prompt.prior_strikethrough.tint = 0x058025;
  prompt.prior_strikethrough.width = 100;
  prompt.prior_strikethrough.height = 2;
  prompt.prior_strikethrough.anchor.set(0, 0.5)
  prompt.prior_strikethrough.visible = false;
  prompt.addChild(prompt.prior_strikethrough);

  //wordWrap: true, wordWrapWidth: 650
  prompt.remaining_text = new PIXI.Text("", {fontFamily: "Press Start 2P", fontSize: 14, fill: 0x3ff74f, letterSpacing: 0, align: "left"});
  prompt.remaining_text.anchor.set(0, 0.5);
  prompt.remaining_text.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
  prompt.addChild(prompt.remaining_text);
  if (prompt.fixed == true) {
    prompt.remaining_text.style.fill = 0x3ff74f;
  }

  prompt.setText(text);

  let space_met = new PIXI.TextMetrics.measureText(" ", prompt.typing_text.style);

  prompt.checkCorrectness = function() {
    prompt.prefix_correct_count = 0;
    prompt.correct = true;
    prompt.complete = false;
    for (let i = 0; i < prompt.typing.length; i++) {
      if (prompt.next_word.length > i && prompt.typing[i].toLowerCase() == prompt.next_word[i].toLowerCase()) {
        prompt.prefix_correct_count += 1;
      } else {
        prompt.correct = false;
        break;
      }
    }
    if (prompt.correct == true && prompt.prefix_correct_count == prompt.next_word.length) {
      prompt.complete = true;
    }
  }

  prompt.setPosition = function() {
    prompt.typing_text.text = prompt.typing;

    let met_1 = new PIXI.TextMetrics.measureText(prompt.prior_text.text, prompt.prior_text.style);
    prompt.typing_text.position.set(met_1.width, 0);
    
    let met_2 = new PIXI.TextMetrics.measureText(prompt.typing_text.text, prompt.typing_text.style);
    prompt.remaining_text.text = prompt.active_text.slice(prompt.prefix_correct_count);
    prompt.remaining_text.position.set(met_1.width + met_2.width, 0);

    if (prompt.correct) {
      prompt.strikethrough.visible = false;
    } else {
      prompt.strikethrough.position.set(met_1.width, 0);
      prompt.strikethrough.width = met_2.width;
      prompt.strikethrough.visible = true;
    }
  }

  if (prompt.fixed == true) {

    prompt.advance = function() {
      prompt.word_number += 2;

      prompt.prior_strikethrough.visible = false;

      if (prompt.word_number >= prompt.word_list.length) {
        let complete = prompt.complete;
        prompt.word_number = 0;
        prompt.carat = 0;
        prompt.prior_text.text = "";
        if (complete && prompt.finished_callback != null) {
          prompt.finished_callback();
          soundEffect("accept");
        } else if (!complete) {
          // I think these
          prompt.word_number = 0;
          prompt.carat = 0;
          prompt.prior_text.text = "";
          //////
          prompt.shake = self.markTime();
          prompt.remaining_text.style.fill = 0xdb5858;
          soundEffect("negative");
        }
      } else {
        prompt.carat += prompt.word_list[prompt.word_number - 2].length + prompt.word_list[prompt.word_number - 1].length
        prompt.prior_text.text += prompt.word_list[prompt.word_number - 2] + prompt.word_list[prompt.word_number - 1];
        if (!prompt.complete) {
          prompt.word_number = 0;
          prompt.carat = 0;
          prompt.prior_text.text = "";
          prompt.shake = self.markTime();
          prompt.remaining_text.style.fill = 0xdb5858;
          soundEffect("negative");
        } else {
          soundEffect("accept");
        }
      }

      prompt.active_text = prompt.permanent_text.slice(prompt.carat, prompt.permanent_text.length)

      prompt.typing = "";
      prompt.next_word = prompt.word_list[prompt.word_number];
      prompt.checkCorrectness();
      prompt.setPosition();
    }

  } else {
    prompt.advance = function() {
      prompt.word_number += 2;

      prompt.prior_strikethrough.visible = false;

      if (prompt.word_number >= prompt.word_list.length) {
        if (!prompt.complete) {
          soundEffect("negative");
        }
        prompt.word_number = 0;
        prompt.carat = 0;
        prompt.prior_text.text = "";
      } else {
        prompt.carat += prompt.word_list[prompt.word_number - 2].length + prompt.word_list[prompt.word_number - 1].length
        prompt.prior_text.text = prompt.word_list[prompt.word_number - 2] + prompt.word_list[prompt.word_number - 1];
        if (!prompt.complete) {
          soundEffect("negative");
          prompt.prior_strikethrough.visible = true;
          let met_1 = new PIXI.TextMetrics.measureText(prompt.word_list[prompt.word_number - 2], prompt.prior_text.style);
          prompt.prior_strikethrough.width = met_1.width;
        }
      }

      prompt.active_text = prompt.permanent_text.slice(prompt.carat, prompt.permanent_text.length) + " " + prompt.permanent_text.slice(0, prompt.carat);

      if (prompt.active_text.length > 60) {
        prompt.active_text = prompt.active_text.slice(0, 60);
      }
      prompt.typing = "";
      prompt.next_word = prompt.word_list[prompt.word_number];
      prompt.checkCorrectness();
      prompt.setPosition();
    }
  }

  prompt.setTyping = function(typing) {
    prompt.typing = typing;
    prompt.checkCorrectness();
    prompt.setPosition();
  }

  // prompt.addTyping = function(new_typing) {
  //   prompt.setTyping(prompt.typing + new_typing)
  // }

  // prompt.deleteTyping = function() {
  //   if (prompt.typing.length > 0) {
  //     prompt.setTyping(prompt.typing.slice(0, prompt.typing.length - 1));
  //   }
  // }

  prompt.clearTyping = function() {
    if (prompt.typing.length > 0) {
      prompt.setTyping("");
    }
  }

  prompt.setPosition();

  return prompt;
}