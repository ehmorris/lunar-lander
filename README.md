# About

A plain JavaScript, HTML, and CSS game with no dependencies.

Code and design: Edwin Morris

Music and sound: Max Kotelchuck

Thanks to [this guide](http://students.cs.ucl.ac.uk/schoolslab/projects/HT5/) for help with the basics.

# Running

Deployed to ehmorris.com via a git submodule.

See `launch.json` for running.

---

### Game Ideas

- Use number formatting https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
- Show rotation velocity / direction in HUD. Help users to stabilize.
- Move mobile booster controls to one side so they're easier to tap?
- Add rings / bonus point areas to hit before landing
- Make terrain land-able
- Generate a shareable image. Show stats in-canvas.

### Extras

- "Mad dog" mode: start with very high rotation rate
- Confetti when grazing the bottom, or exceeding certain speeds
- Konami code on desktop?
- Use broadcast channel to make a second screen a big dashboard of controls and graphs

### Refactor

- Move end-game logic into index
- Move landed and crashed data objects into state
- Sort out underscores - are they needed? Bit of clutter

### Bugs

- Make play speed consistent regardless of frame rate
  - On some screens the refresh rate is 120, on others 60. This changes the speed of play. The game is twice as fast on a new MacBook as on an iPhone. The animations are procedural, so to accomplish this, forces like thrust and gravity will have to be modified based on time elpased between frames. Unsure how to do this.
  - The gameplay target is the experience on a MacBook with a 120hz refresh rate. Phones could possibly be slower, or shorter screens in general - but this should be controlled and not incidental
- iOS safari "from" banner cuts off bottom of canvas
