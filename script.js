import { generateCanvas, nextPositionAlongHeading } from "./helpers.js";

const canvasProps = {
  width: 400,
  height: 400,
};

const CTX = generateCanvas({
  width: canvasProps.width,
  height: canvasProps.height,
  attachNode: ".gameContainer",
});

const lander = {
  width: 20,
  height: 20,
  velocity: 0,
  thrust: 0,
  heading: 90,
  position: {
    x: 0,
    y: 0,
  },
  draw: function (CTX) {
    CTX.save();
    CTX.fillStyle = "green";
    CTX.fillRect(this.position.x, this.position.y, this.width, this.height);
    CTX.restore();

    this.position = nextPositionAlongHeading({
      position: this.position,
      velocity: this.velocity,
      headingInDeg: this.heading,
    });
  },
};

let frameCount = 0;
const gravity = 0.08;
const drawFrame = () => {
  CTX.clearRect(0, 0, canvasProps.width, canvasProps.height);

  lander.draw(CTX);
  lander.velocity = (gravity - lander.thrust) * frameCount;

  frameCount += 1;
  window.requestAnimationFrame(drawFrame);
};

document.addEventListener("keydown", ({ key }) => {
  if (key === "ArrowUp") {
    lander.thrust += 0.1;
  }
});

document.addEventListener("keyup", ({ key }) => {
  if (key === "ArrowUp") {
    lander.thrust = 0;
  }
});

window.requestAnimationFrame(drawFrame);
