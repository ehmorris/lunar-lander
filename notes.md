# TODO

- Move mobile boosters to one side?
- Add rings / bonus point areas to hit before landing
- Make terrain land-able
- Generate image from canvas for sharing with all stats

# Extras

- "Mad dog" mode: start with very high rotation rate
- Confetti when grazing the bottom, or exceeding certain speeds
- Confetti pieces that don't rotate, but "flip" in 3-D. Maybe diamond shaped, and flipping horizontally.
- Konami code on desktop?
- Use broadcast channel to make a second screen a big dashboard of controls and graphs

# Bugs

- Make play speed consistent regardless of frame rate
  - On some screens the refresh rate is 120, on others 60. This changes the speed of play. The game is twice as fast on a new MacBook as on an iPhone. The animations are procedural, so to accomplish this, forces like thrust and gravity will have to be modified based on time elpased between frames. Unsure how to do this.
  - The gameplay target is the experience on a MacBook with a 120hz refresh rate. Phones could possibly be slower, or shorter screens in general - but this should be controlled and not incidental
- iOS safari "from" banner cuts off bottom of canvas
