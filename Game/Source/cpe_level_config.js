
cpe_level_config = {
  1: {
    "start": [30, 512],
    "end": [983, 111],
    "start_door": [1, 5, 476],
    "end_door": [2, 968, 83],
    "countdown": 5000,
    "width": 1032,
    "height": 700,
    "clock": 180000,
    // "end_door": ["2", 435, 383],
    "death_doors": [
      [2, 713, 138],
      [2, 809, 138],
      [3, 597, 401],
      [3, 708, 402],
    ],
    "animations": [
      ["billboard", "floating", 507, -19, 0.07, 400],
      ["buoy_2", "death", 187, 683, 0.07, 0],
      ["buoy_1", "death", 803, 686, 0.07, 0],
      ["drinking_fountain", "floating", 952, 354, 0.07, 0],
      ["fishes_1", "death", 355, 684, 0.07, 2100],
      ["fridge_1", "filled", 659, 136, 0.07, 3000],
      ["cat", "distraction", 567, 279, 0.07, 1300],
      ["butterfly_" + dice(3), "floating", dice(1000), dice(600), 0.13, 0],
      ["butterfly_" + dice(3), "floating", dice(1000), dice(600), 0.13, 0],
    ],
    "characters": [
      ["academic", "read", 932, 402],
      // ["academic", "read", 265, 531],
    ],
    "num_awake": 0,
    "num_to_wake": 50,
    "num_required": 30,
    "num_arrived": 0,
    "walker_spawn_delay": 1000,
  }




}