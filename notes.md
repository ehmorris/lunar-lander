# TODO

- Ticks on top to show how the control surfaces are divided on mobile
- Konami code on desktop?
- Use vmin instead of vw for headline size
- Make rest button svg border animation longer than the loading state timeout. This way the animations won't feel "stepped"
- Show score number and that flips are part of it
- Use broadcast channel to make a second screen a big dashboard of controls and graphs
- Add fuel
- Make terrain land-able
- When the lander explodes, show the nose cone as debris
- Extend ramp from lander on land
- Sound effects
- Confetti when grazing the bottom, or exceeding certain speeds
- "Mad dog" mode: start with very high rotation rate
- Generate image from canvas for sharing with all stats
- Add "copy stats" button on platforms that don't have navigator access

# Bugs

- Close path in trajectory file
- Rapid play/pause of audio causes game to stutter
- Make play speed consistent regardless of frame rate
  - On some screens the refresh rate is 120, on others 60. This changes the speed of play. The game is twice as fast on a new MacBook as on an iPhone. The animations are procedural, so to accomplish this, forces like thrust and gravity will have to be modified based on time elpased between frames. Unsure how to do this.
  - The gameplay target is the experience on a MacBook with a 120hz refresh rate. Phones could possibly be slower, or shorter screens in general - but this should be controlled and not incidental
- iOS safari "from" banner cuts off bottom of canvas
- Try touch-action: manipulation to prevent double taps from zooming stats
