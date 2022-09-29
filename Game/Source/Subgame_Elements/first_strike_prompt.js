//
// This file contains the typing prompt for the First Strike subgame.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//

FirstStrike.prototype.makePrompt = function(parent, x, y, text, fixed = false, finished_callback = false) {
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

  prompt.prior_text = makeText("", {fontFamily: "Press Start 2P", fontSize: 14, fill: 0x058025, letterSpacing: 0, align: "left"}, prompt, 0, 0, 0, 0.5);
  prompt.typing_text = makeText("", {fontFamily: "Press Start 2P", fontSize: 14, fill: 0x3cb0f3, letterSpacing: 0, align: "left"}, prompt, 0, 0, 0, 0.5);

  prompt.strikethrough = makeBlank(prompt, 100, 2, 0, 0, 0x3cb0f3, 0, 0.5);
  prompt.strikethrough.visible = false;

  prompt.prior_strikethrough = makeBlank(prompt, 100, 2, 0, 0, 0x058025, 0, 0.5);
  prompt.prior_strikethrough.visible = false;

  //wordWrap: true, wordWrapWidth: 650
  prompt.remaining_text = makeText("", {fontFamily: "Press Start 2P", fontSize: 14, fill: 0x3ff74f, letterSpacing: 0, align: "left"}, prompt, 0, 0, 0, 0.5);

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
          prompt.shake = markTime();
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
          prompt.shake = markTime();
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