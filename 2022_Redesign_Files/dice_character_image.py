
import sys
from PIL import Image

width = 16
height = 32
#margin = 2

im = Image.open(sys.argv[1])

poses = {
  "stand_right": [0, 32, 6],
  "stand_up": [width * 6, 32, 6],
  "stand_left": [width * 12, 32, 6],
  "stand_down": [width * 18, 32, 6],
  "walk_right": [0, 64, 6],
  "walk_up": [width * 6, 64, 6],
  "walk_left": [width * 12, 64, 6],
  "walk_down": [width * 18, 64, 6],
  "sit_right": [0, 128, 6],
  "sit_left": [width * 6, 128, 6],
  "doze_right": [0, 160, 6],
  "doze_left": [width * 6, 160, 6],
  "read": [0, 224, 6],
  "turn_page": [width * 6, 224, 6],
  "carry_right": [0, 256, 6],
  "carry_up": [width * 6, 256, 6],
  "carry_left": [width * 12, 256, 6],
  "carry_down": [width * 18, 256, 6],
  "pickup_right": [0, 288, 12],
  "pickup_up": [width * 12, 288, 12],
  "pickup_left": [width * 24, 288, 12],
  "pickup_down": [width * 36, 288, 12],
  "give_right": [0, 320, 10],
  "give_up": [width * 10, 320, 10],
  "give_left": [width * 20, 320, 10],
  "give_down": [width * 30, 320, 10],
  "equip_right": [0, 352, 14],
  "equip_up": [width * 14, 352, 14],
  "equip_left": [width * 28, 352, 14],
  "equip_down": [width * 42, 352, 14],
  "unequip_right": [0, 384, 14],
  "unequip_up": [width * 14, 384, 14],
  "unequip_left": [width * 28, 384, 14],
  "unequip_down": [width * 42, 384, 14],
  "punch_1_right": [0, 416, 6],
  "punch_1_up": [width * 6, 416, 6],
  "punch_1_left": [width * 12, 416, 6],
  "punch_1_down": [width * 18, 416, 6],
  "punch_2_right": [0, 448, 6],
  "punch_2_up": [width * 6, 448, 6],
  "punch_2_left": [width * 12, 448, 6],
  "punch_2_down": [width * 18, 448, 6],
  "punch_3_right": [0, 480, 6],
  "punch_3_up": [width * 6, 480, 6],
  "punch_3_left": [width * 12, 480, 6],
  "punch_3_down": [width * 18, 480, 6],
  "gun_1_right": [0, 512, 4],
  "gun_1_up": [width * 4, 512, 4],
  "gun_1_left": [width * 8, 512, 4],
  "gun_1_down": [width * 12, 512, 4],
  "gun_2_right": [0, 544, 6],
  "gun_2_up": [width * 6, 544, 6],
  "gun_2_left": [width * 12, 544, 6],
  "gun_2_down": [width * 18, 544, 6],
  "gun_3_right": [0, 576, 3],
  "gun_3_up": [width * 3, 576, 3],
  "gun_3_left": [width * 6, 576, 3],
  "gun_3_down": [width * 9, 576, 3],
  "hurt_right": [0, 608, 3],
  "hurt_up": [width * 3, 608, 3],
  "hurt_left": [width * 6, 608, 3],
  "hurt_down": [width * 9, 608, 3],
  }

print(poses)
for pose in poses:
  info = poses[pose]
  for i in range(0, info[2]):
    box = (info[0] + width * i, info[1], info[0] + width * (i+1), info[1] + height)
    a = im.crop(box)
    # + sys.argv[1].replace(".png","") + "_"
    a.save("./Character_Workspace/" + pose + "_0" + str(i) + ".png")
#box = (, i, j+width, i+height)
#a = im.crop(box)
#            a.save(os.path.join(Path,"PNG","%s" % page,"IMG-%s.png" % k))