import { generateCanvas, degToRad } from "./helpers.js";

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
    x: 50,
    y: 0,
  },
  getNextPosition: function () {
    return new Promise((resolve) => {
      const prospectiveNewLocation = {
        x: this.position.x + this.velocity * Math.cos(degToRad(this.heading)),
        y: this.position.y + this.velocity * Math.sin(degToRad(this.heading)),
      };

      if (prospectiveNewLocation.y > canvasProps.height - this.height) {
        return resolve({
          x: prospectiveNewLocation.x,
          y: canvasProps.height - this.height,
        });
      } else {
        return resolve(prospectiveNewLocation);
      }
    });
  },
  draw: function (CTX) {
    CTX.save();
    this.getNextPosition().then((nextPosition) => {
      CTX.fillStyle = "green";
      CTX.fillRect(this.position.x, this.position.y, this.width, this.height);
      CTX.restore();
      this.position = nextPosition;
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
