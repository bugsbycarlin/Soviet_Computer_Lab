
var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

class Network {
  constructor(game) {
    this.database = firebase.database();
    this.game = game;
    this.high_scores_last_loaded = 0;
  }


  anonymousSignIn(callback) {
    console.log("Using anonymous sign in for global high scores");
    var self = this;
    firebase.auth().signInAnonymously()
      .then(() => {
        callback();
      })
      .catch((error) => {
        console.log("Error with anonymous sign in!")
        console.log(error);
      });

  }


  loadGlobalHighScores() {
    var self = this;
    console.log("Loading global high scores");

    if (Date.now() - this.high_scores_last_loaded < 60000) {
      console.log("Skipping because global high scores were successfully loaded within the last minute");
      return;
    }
    
    this.game.global_high_scores = {};
    ["story", "mixed", "wr", "bc", "lc"].forEach((mode) => {
      self.game.global_high_scores[mode] = {};
      ["easy", "medium", "hard", "beacon"].forEach((difficulty) => {
        self.game.global_high_scores[mode][difficulty] = [];

        console.log("making a high score call");
        this.database.ref("/high_scores/" + mode + "/" + difficulty).orderByChild("score").limitToLast(10).once("value").then((result) => {
          if (result.exists()) {
            self.game.global_high_scores[mode][difficulty] = Object.values(result.val());
            self.game.global_high_scores[mode][difficulty].sort((a,b) => (a.score < b.score) ? 1 : -1);
            self.high_scores_last_loaded = Date.now();
          } else {
            console.log("Could not look up global high scores for " + mode + "/" + difficulty);
          }
        }).catch((error) => {
          console.log("Error looking up global high scores for " + mode + "/" + difficulty);
          console.log(error);
        });;
      });
    });
  }


  addGlobalHighScore(name, score, mode, difficulty, callback, error_callback = null) {
    var self = this;

    let r = firebase.database().ref("high_scores/" + mode + "/" + difficulty).push();
    r.set({name: name, score: score}, (error) =>{
      if (error) {
        console.log("Failed to save global high scores to the cloud.");
        console.log(error);
        if (error_callback != null) {
          error_callback();
        }
      } else {
        console.log("Saved global high scores to the cloud.");
        callback();
      }
    });
  }

  // I used this to seed the global high scores.
  seedHighScores() {
    var self = this;

    ["story", "mixed", "wr", "bc", "lc"].forEach((mode) => {
      ["easy", "medium", "hard", "beacon"].forEach((difficulty) => {
        for (var i = 0; i < 50; i++) {
          let name = ""
          for(var j = 0; j < 8; j++) {
            let t = namez[Math.floor(Math.random() * namez.length)].split(" ")[0];
            if(t.length <= 6) name = t.toUpperCase();
          }
          let score = 5500 - 100 * i - Math.floor(Math.random() * 30);
          this.addGlobalHighScore(name, score, mode, difficulty, function(){}, function(){});
        }
      });
    });
  }


  generateGameCode() {
    
    var name = "";
    for (var i = 0; i < 5; i++) {
      name += alphabet.charAt(Math.floor(Math.random() * alphabet.length));

    }
    return name;
  }


  createNewGame(game_type, tries_left, callback) {
    var self = this;
    var game_code = this.generateGameCode();
  }


  joinGame(game_code, yes_callback, no_callback) {
    var self = this;
  }


  quickPlayGame(tries_left, yes_callback, no_callback) {
    var self = this;
  }


  setWatch() {
    this.ref_state_change = this.database.ref("games/" + game.game_code);
    // this.watch = this.ref_state_change.on("value", (snapshot) => {game.updateFromMulti(snapshot)});
  }


  stopWatch() {
    if (this.watch) {
      this.ref_state_change.off("value", this.watch);
      this.watch = null;
    }
  }


  finishGame(code, player, winner) {
    var sheet = {}

    // if (this.game.state.game_type != "code_coop") {
    //   if (player == 1 && player == winner) {
    //     sheet["player_1_state"] = "win";
    //     sheet["player_2_state"] = "ended";
    //     sheet["volley_state"] = "ended";
    //   } else if (player == 2 && player == winner) {
    //     sheet["player_2_state"] = "win";
    //     sheet["player_1_state"] = "ended";
    //     sheet["volley_state"] = "ended";
    //   }
    //   // } else if (player == 1) {
    //   //   sheet["player_1_state"] = "ended";
    //   // } else if (player == 2) {
    //   //   sheet["player_2_state"] = "ended";
    //   // }
    //   if (this.game.state.game_type == "quick_open") {
    //     sheet["game_type"] = "quick_closed";
    //   }
    // } else {
    //   sheet["player_2_state"] = "ended";
    //   sheet["player_1_state"] = "ended";
    //   sheet["volley_state"] = "changeywee";
    // }

    this.database.ref("games/" + code).update(sheet);
  }


  leaveGame(code, player) {
    var sheet = {}
    // if (player == 1) {
    //   console.log("Player 1 leaving the game");
    //   sheet["player_1_state"] = "quit";
    // } else if (player == 2) {
    //   console.log("Player 2 leaving the game");
    //   sheet["player_2_state"] = "quit";
    // }
    // if (this.game.state.game_type == "quick_open") {
    //   sheet["game_type"] = "quick_closed";
    // }
    this.database.ref("games/" + code).update(sheet);
  }


  update(sheet) {
    this.database.ref("games/" + this.game.game_code).update(sheet);
  }
}

namez = ["leticia kim",
"jamal barrera",
"brady castillo",
"coby forbes",
"bailey gilmore",
"kanye sosa",
"audrey richmond",
"james randolph",
"kate erickson",
"arnav miranda",
"rodolfo tyson",
"blanca fletcher",
"irving rosario",
"kayla walter",
"gianni dorsey",
"lucia kidd",
"gideon atkins",
"rowan johnson",
"miles vaughan",
"marquez malone",
"raul goodman",
"kelsey walker",
"rachael tyson",
"declan morse",
"jazmyn farley",
"keyon serrano",
"justice massey",
"dylan salas",
"mia adkins",
"gordon marquez",
"tessa roberts",
"sanaa buchanan",
"xiomara lowery",
"harley ingram",
"jennifer spencer",
"montana ramsey",
"elias campos",
"nasir garner",
"carol riley",
"harley goodwin",
"jayden mcclain",
"loren franklin",
"amelia carey",
"shayna torres",
"maddison oconnor",
"melina parsons",
"javen bowers",
"tariq estes",
"cristian nunez",
"noah wagner",
"karl vasquez",
"lukas holman",
"elisa cash",
"kendrick byers",
"parker dorsey",
"deonte shepard",
"kane stanley",
"maleah luna",
"deshawn collier",
"cordell mcintosh",
"aubree sharpe",
"jakayla gallegos",
"paris holmes",
"marissa sweet",
"yair dodson",
"jasper green",
"jakayla hayes",
"nash hinton",
"weston vaughan",
"elijah watson",
"brody bright",
"alondra bernard",
"norman whitney",
"emmett bryan",
"antonio francis",
"haylie horne",
"kaya stephenson",
"melanie gibson",
"miles myers",
"marisol roach",
"anahi stout",
"raymundo orr",
"jacob goodwin",
"quincy levine",
"alvin peters",
"guadalupe howe",
"jack horton",
"tristin vance",
"mathias salazar",
"alexander rivers",
"giselle andrews",
"jadon morrison",
"allen richard",
"jean graves",
"liana lloyd",
"maryam warner",
"ricky morin",
"brady wilkerson",
"cannon christensen",
"bradyn norris",
"anaya daugherty",
"adeline house",
"domenic church",
"amari cunningham",
"joan young",
"hailie horne",
"blaze jennings",
"luciano day",
"cornelius mcgowan",
"emilee maynard",
"quincy gaines",
"jordan craig",
"omari delgado",
"dana duffy",
"devyn oneil",
"esteban gardner",
"leila stark",
"tobias cochran",
"paul woods",
"colby noel",
"amy taylor",
"kaitlyn dunn",
"derek murphy",
"tiffany cobb",
"angelina hobbs",
"bernardo larson",
"douglas nunez",
"susana case",
"devyn walton",
"esteban daniels",
"colten orr",
"catherine eaton",
"amelia potter",
"albert love",
"chanel burks",
"cameron moore",
"mikayla perkins",
"jagger mckinney",
"ralph ingram",
"elise hale",
"joey acevedo",
"cory obrien",
"juan sargent",
"rayna hester",
"misael barnes",
"trenton joyce",
"devyn coffey",
"johnathon yates",
"yoselin whitaker",
"sage barnett",
"ashlee myers",
"christian church",
"delilah rosario",
"bridget weber",
"regina nichols",
"layne conway",
"brayden jennings",
"geoffrey dixon",
"tomas roth",
"irvin nielsen",
"kailyn rosales",
"christiana sharpe",
"jerry suarez",
"warren patton",
"cristopher trujillo",
"caiden nicholson",
"lincoln mckee",
"madelynn kirkland",
"heather diaz",
"bruno howell",
"marisa cleveland",
"braydon wiley",
"nora moses",
"ryder robertson",
"logan walsh",
"lilly nieves",
"brielle beck",
"nya stafford",
"renee richardson",
"jason case",
"brittany mcintyre",
"deacon galloway",
"ramon odom",
"presley villarreal",
"mara sykes",
"gustavo pickett",
"avery cole",
"gustavo rosales",
"sylvia holcomb",
"devyn osborn",
"kathryn sexton",
"shakira ashley",
"milton middleton",
"cody maldonado",
"madeline vasquez",
"london pearson",
"kara mccarty",
"mateo guy",
"derick allen",
"sergio hancock",
"javen beard",
"cecilia baldwin",
"rebecca bridges",
"victor turner",
"marley stanley",
"derick cervantes",
"carissa cross",
"domenic king",
"ryder simpson",
"jaiden wade",
"charlie trevino",
"shyann campbell",
"morgan maldonado",
"heriberto mayo",
"mallory madden",
"waylon sheppard",
"zain mcgee",
"reece robertson",
"aliyah cotton",
"guillermo mack",
"howard ruiz",
"mikel johns",
"tucker pierce",
"katharine armstrong",
"gwendolyn barron",
"javion patrick",
"alvaro cantrell",
"jarod campos",
"tre browning",
"savana ross",
"sadie harrington",
"rey wall",
"lamar simmons",
"andreas burch",
"kade holman",
"brendan mccray",
"kaden marshall",
"joe mcpherson",
"julia puckett",
"amari rose",
"malachi howard",
"annabel franco",
"joaquin hull",
"shayla french",
"renee klein",
"heidi stanton",
"ralph summers",
"carol contreras",
"daniel raymond",
"jordy mccoy",
"boston nielsen",
"nataly hays",
"marshall bush",
"mary garrett",
"cole jacobson",
"deshaun stuart",
"jaiden cabrera",
"juliana langley",
"paxton sullivan",
"jagger thornton",
"catherine phillips",
"tyler barnes",
"kamron klein",
"nasir patrick",
"ricky patel",
"kaia valdez",
"bailey abbott",
"julianna monroe",
"deanna larson",
"collin levy",
"jaime knox",
"kasandra dudley",
"carter blair",
"willow terry",
"paloma gilbert",
"mohammad vincent",
"hailee sykes",
"allison wyatt",
"aidan baird",
"brendan smith",
"demarion booth",
"armani roy",
"adonis pope",
"austen collier",
"cora warner",
"nicholas moon",
"zachariah harvey",
"sydni goodman",
"drew strong",
"kale stanley",
"trevor adams",
"tania robbins",
"breana dotson",
"javon bean",
"diego meadows",
"nicole mathews",
"sherlyn gibson",
"sammy bishop",
"stephon mullins",
"lexi roach",
"raquel norris",
"presley booker",
"elvis gonzales",
"lainey mills",
"lamar hawkins",
"angel chan",
"gisselle wallace",
"braiden barnett",
"miguel hunt",
"saniyah wong",
"elian jordan",
"yadira davidson",
"cameron adkins",
"salma duke",
"linda diaz",
"diego meadows",
"nicole mathews",
"sherlyn gibson",
"sammy bishop",
"stephon mullins",
"lexi roach",
"raquel norris",
"presley booker",
"elvis gonzales",
"lainey mills",
"lamar hawkins",
"angel chan",
"gisselle wallace",
"braiden barnett",
"miguel hunt",
"saniyah wong",
"elian jordan",
"yadira davidson",
"cameron adkins",
"salma duke",
"linda diazbrenna hensley",
"aleah park",
"avery hester",
"brenna goff",
"makenna espinoza",
"davon roberts",
"ismael sharp",
"tony hall",
"kolton nunez",
"jaime weiss",
"garrett decker",
"jabari gray",
"gracie sykes",
"liana foster",
"jaidyn keller",
"elian craig",
"ashlyn bentley",
"alexis gilliam",
"sierra mckee",
"sarah fox",
"ashton jennings",]

