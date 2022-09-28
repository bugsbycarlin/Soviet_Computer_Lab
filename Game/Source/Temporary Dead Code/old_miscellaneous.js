
// PERFORMANCE TRACKING

if (performance.measureUserAgentSpecificMemory != null) {
  performance.measureUserAgentSpecificMemory().then(function(result){performance_result = result});
}

if (performance_result != null) {
  console.log("Mem total: " + (performance_result.bytes / 1000000).toFixed(2) + "mb");
  var breakdown = "";
  for (var i = 0; i < performance_result.breakdown.length; i++) {
    if (performance_result.breakdown[i].types.length > 0) {
      breakdown += performance_result.breakdown[i].types[0] + ":" + (performance_result.breakdown[i].bytes / 1000000).toFixed(2) + ",";
    } else if (performance_result.breakdown[i].bytes > 10) {
      breakdown += "N/A:" + (performance_result.breakdown[i].bytes / 1000000).toFixed(2) + ",";
    }
  }
  console.log(breakdown);
}





const exhortations = [
  "Wow!",
  "Zowie!",
  "Jeezy Creezy.",
  "Wowsers!",
  "Jeepers!",
  "Dangles!",
  "Dang!",
  "Win-go, man!",
  "Zappa zappa.",
  "Zam!",
  "Blam!",
  "Shazaam!",
  "Keep going!",
  "Go go go!",
  "Wheeeee!",
  "Yay!",
];
