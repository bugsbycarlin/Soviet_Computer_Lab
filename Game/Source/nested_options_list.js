


class NestedOptionsList extends PIXI.Container {
  constructor(choice_list, format, spacing, unselected_tint, selected_tint) {
    super();
    this.choice_list = choice_list;
    this.choice = [0];
    this.spacing = spacing;
    this.format = format;
    this.unselected_tint = unselected_tint;
    this.selected_tint = selected_tint;

    this.sub_list = null;

    this.renderList();
  }

  renderList() {
    while(this.children[0]) { 
      this.removeChild(this.children[0]);
    }

    this.sub_list = Object.entries(this.choice_list);
    console.log(this.sub_list);
    for (let i = 0; i < this.choice.length - 1; i++) {
      this.sub_list = Object.entries(this.sub_list[this.choice[i]][1]);
      console.log("hey");
      console.log(this.sub_list);
    }

    let count = 0;
    for (const [key, value] of this.sub_list) {
      console.log(key);
      let entry = this.format(key);
      entry.position.y = count * this.spacing;
      if (count == this.choice[this.choice.length - 1]) {
        entry.tint = this.selected_tint;
      } else {
        entry.tint = this.unselected_tint;
      }

      this.addChild(entry);

      count += 1;
    }
  }


  updateChoice() {
    console.log("With " + this.choice[this.choice.length - 1]);
    for (let i = 0; i < this.children.length; i++) {
      console.log(i);
      let entry = this.children[i];
      console.log(entry);
      if (i == this.choice[this.choice.length - 1]) {
        entry.tint = this.selected_tint;
      } else {
        entry.tint = this.unselected_tint;
      }
    }
  }


  moveUp() {
    this.choice[this.choice.length - 1] += this.sub_list.length - 1;
    this.choice[this.choice.length - 1] = this.choice[this.choice.length - 1] % this.sub_list.length;
  
    this.updateChoice()
  }


  moveDown() {
    console.log("Yonan")
    console.log(this.choice[this.choice.length - 1]);
    this.choice[this.choice.length - 1] += 1;
    this.choice[this.choice.length - 1] = this.choice[this.choice.length - 1] % this.sub_list.length;
    console.log(this.sub_list.length);
    console.log(this.choice[this.choice.length - 1]);
  
    this.updateChoice();
  }


  choose() {
    let next_thing = this.sub_list[this.choice[this.choice.length - 1]][1];
    console.log(next_thing);
    console.log(typeof next_thing);
    console.log("reee");
    if (typeof next_thing === "function") {
      flicker(this.children[this.choice[this.choice.length - 1]], 300, this.selected_tint, this.unselected_tint);
      next_thing();
    } else if (next_thing != null) {
      this.choice.push(0);
      this.renderList();
    } else {
      flicker(this.children[this.choice[this.choice.length - 1]], 300, this.selected_tint, this.unselected_tint);
    }
  }


  escape() {
    if (this.choice.length > 1) {
      this.choice.pop();
      this.renderList();
    }
  }
}