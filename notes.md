# Other TODO

- [ ] Add instructions for controls and store whether the user has seen them
- [ ] Detect and count flips, include this data in the end-of-game readout and share text
- [ ] Add time-to-land as a stat
- [ ] Add more crash and landing categories like "sidewinder" and "drunk astronaut"
- [ ] Add overall grade, letter-style

# Gameplay TODO

- [ ] Make play speed consistent regardless of frame rate
  - On some screens the refresh rate is 120, on others 60. This changes the speed of play. The game is twice as fast on a new MacBook as on an iPhone. The animations are procedural, so to accomplish this, forces like thrust and gravity will have to be modified based on time elpased between frames. Unsure how to do this.
  - The gameplay target is the experience on a MacBook with a 120hz refresh rate. Phones could possibly be slower, or shorter screens in general - but this should be controlled and not incidental
- [ ] Add fuel
- [ ] Add terrain
- [ ] When the lander explodes, show the nose cone as debris
- [ ] Sound effects
- [ ] Confetti during gameplay after events like flipping and grazing the bottom, or exceeding certain speeds
- [ ] Combos that effect score, like landing after a flip
- [ ] "Mad dog" start with very high rotation rate
