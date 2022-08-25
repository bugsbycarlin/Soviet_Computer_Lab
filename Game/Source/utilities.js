
// Some colors
// Blue: 0x3cb0f3
// Yellow: 0xf3db3c
// Red: 0xdb5858
// Green: 0x71d07d
// Retro green: 0x3ff74f

const board_width = 12;

const special_level_duration = 60000;

const bomb_spawn_interval = 10000;

const letter_values = {
  "A": 1, "B": 2, "C": 1, "D": 1, "E": 1, "F": 2, "G": 1,
  "H": 2, "I": 1, "J": 3, "K": 2, "L": 1, "M": 1, "N": 1,
  "O": 1, "P": 1, "Q": 4, "R": 1, "S": 1, "T": 1, "U": 2,
  "V": 3, "W": 2, "X": 3, "Y": 2, "Z": 4,
}

var character_names = [
  "ALFIE", "BERT", "CALLIE", "DENZEL", "EMMA", "FATIMA",
  "GRETA", "HAKEEM", "INEZ", "JIN", "KRISHNA", "LIAN",
  "MARCUS", "NAOMI", "OMAR", "PABLO", "QUARREN", "RIYA",
  "SOPHIE", "TANIEL", "UBA", "VIJAY", "WINTER", "XAVIER",
  "YAIR", "ZHANG",
];

var opponents = [ "an", "zh", "iv", "ro", "fe"];

var fire_colors = [0xda5533, 0xf66931, 0xef912d, 0xfaae4b];

const letter_array = Object.keys(letter_values);
const lower_array = [];
for (i in letter_array) {
  lower_array.push(letter_array[i].toLowerCase());
}
const shuffle_letters = [];
for (i in letter_array) {
  shuffle_letters.push(letter_array[i]);
}


// This function picks a random number between 1 and N
function dice(number) {
  return Math.floor(Math.random() * number) + 1;
}



function distance(x1, y1, x2, y2) {
  return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
}


// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}


function detectMobileBrowser() {
  const toMatch = [
      /Android/i,
      /webOS/i,
      /iPhone/i,
      /iPad/i,
      /iPod/i,
      /BlackBerry/i,
      /Windows Phone/i
  ];

  return toMatch.some((toMatchItem) => {
      return navigator.userAgent.match(toMatchItem);
  });
}


// Wrap setTimeout so it has pause functionality.
delays = {};
unique = 0;
function delay(callback, delay_time) {
  var d = new Object();
  d.fixed_id = unique;
  unique += 1;
  d.callback = callback;
  d.delay_time = delay_time;
  d.start_time = Date.now();
  d.id = window.setTimeout(d.callback, d.delay_time);
  d.delete_id = window.setTimeout(function() {delete delays[d.fixed_id]}, d.delay_time);
  d.paused = false;
  delays[d.fixed_id] = d;
}


function pauseAllDelays() {
  console.log(delays);
  for ([id, value] of Object.entries(delays)) {
    let d = value;
    if (d.paused == false) {
      console.log("Pausing");
      window.clearTimeout(d.id);
      window.clearTimeout(d.delete_id);
      d.delay_time -= Date.now() - d.start_time;
      d.paused = true;
    }
  }
}


function resumeAllDelays() {
  for ([id, value] of Object.entries(delays)) {
    let d = value;
    if (d.paused == true) {
      d.start_time = Date.now();
      d.id = window.setTimeout(d.callback, d.delay_time);
      d.delete_id = window.setTimeout(function() {delete delays[d.fixed_id]}, d.delay_time);
    }
  }
}


// Assuming no duplicates in a list,
// find the value and return the next value,
// wrapping around if necessary.
function next(some_list, value) {
  if (some_list.length == 0) return null;
  if (some_list.length == 1 && some_list[0] != value) return null;
  // if (some_list.length == 1 && some_list[0] == value) return value;
  // if (some_list.indexOf(value) == -1) return some_list[0];

  let v_index = some_list.indexOf(value);
  let w_index = (v_index + 1) % some_list.length;
  return some_list[w_index];
}


// Assuming no duplicates in a list,
// find the value and return the previous value,
// wrapping around if necessary.
function prev(some_list, value) {
  if (some_list.length == 0) return null;
  if (some_list.length == 1 && some_list[0] != value) return null;
  if (some_list.length == 1 && some_list[0] == value) return value;
  if (some_list.indexOf(value) == -1) return some_list[0];

  let v_index = some_list.indexOf(value);
  let w_index = (v_index + some_list.length - 1) % some_list.length;
  return some_list[w_index];
}


function pick(some_list) {
  return some_list[Math.floor(Math.random() * some_list.length)]
}


function addDedupeSort(some_list, other_list) {
  other_list.forEach((score) => {
    let dupe = false;
    some_list.forEach((score2) => {
      if (score.name == score2.name && score.score == score2.score && score.uid == score2.uid) {
        dupe = true;
      }
    });
    if (!dupe) {
      some_list.push(score);
    }
    some_list.sort(function comp(a, b) {
      return (a.score < b.score || a.score == b.score && b.name < a.name) ? 1 : -1;
    })
  });
}


function flicker(item, duration, color_1, color_2) {
  item.flicker_junker = 0
  let color_counter = 0;
  var tween = new TWEEN.Tween(item)
    .to({flicker_junker: 80})
    .duration(duration)
    .onUpdate(function() {
      if (color_counter % 2 == 0) {
        item.tint = color_1;
      } else {
        item.tint = color_2;
      }
      color_counter += 1;
    })
    .onComplete(function() {
      item.tint = color_1;
    })
    .start();
}



