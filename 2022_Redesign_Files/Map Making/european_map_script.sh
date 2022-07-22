
gmt begin Cold_War_Europe png
  # United Kingdom, France, West Germany, Italy, Spain, Portugal, Turkey, Greece, Norway, Netherlands, Belgium, Denmark, Luxembourg
  color1='80/107/177'
  # East Germany, Poland, Czechoslovakia, USSR, Hungary, Romania, Bulgaria
  color2='181/86/83'

  # Projection
  projection=B15/45/30/60/8i

  # R values
  rval=-15/30/65/60r

  # 1. draw background
  # 2. clip to coastline
  # 3. draw topography
  # 4. end clipping
  gmt coast -R${rval} -Dh -J${projection} -G60/60/60 -S0/0/0 -A150.0
  gmt coast -R${rval} -Dh -J${projection} -G -A150.0
  gmt grdimage @earth_relief_01m -R${rval} -J${projection} -Cdark_land_shading.cpt
  gmt coast -Q

  gmt coast -R${rval} -Dh -J${projection} -W1/0.5p,80/80/80 -A150.0 -t60

  gmt coast -R${rval} -Dh -J${projection} -I1/0.5p,120/120/120 -A150.0 -t80

  #gmt coast -R${rval} -Dh -J${projection} -t80 \
  #-E${colorgroup1}+g${color1} \
  #-E${colorgroup2}+g${color2}

  #gmt coast -R${rval} -Dh -J${projection} \
  #-E${colorgroup1}+p0.5,${color1} \
  #-E${colorgroup2}+p0.5,${color2}


  gmt plot cold_war_red_shapes.gmt -G${color2} -t80
  gmt plot cold_war_blue_shapes.gmt -G${color1} -t80
  gmt plot cold_war_red_shapes.gmt -W0.5,${color2} 
  gmt plot cold_war_blue_shapes.gmt -W0.5,${color1}

gmt end show
