# Other TODO

- [ ] Add time-to-land as a stat
- [ ] Add more crash and landing categories like "sidewinder" and "drunk astronaut"
- [ ] Generate image from canvas for sharing

# Gameplay TODO

- [ ] Add fuel
- [ ] Add altimeter
- [ ] Add terrain
- [ ] When the lander explodes, show the nose cone as debris
- [ ] Sound effects
- [ ] Confetti when grazing the bottom, or exceeding certain speeds
- [ ] "Mad dog" mode: start with very high rotation rate
- [ ] Extend ramp from lander on land

# Bugs

- [ ] Make play speed consistent regardless of frame rate
  - On some screens the refresh rate is 120, on others 60. This changes the speed of play. The game is twice as fast on a new MacBook as on an iPhone. The animations are procedural, so to accomplish this, forces like thrust and gravity will have to be modified based on time elpased between frames. Unsure how to do this.
  - The gameplay target is the experience on a MacBook with a 120hz refresh rate. Phones could possibly be slower, or shorter screens in general - but this should be controlled and not incidental
- [ ] iOS safari "from" banner cuts off bottom of canvas
