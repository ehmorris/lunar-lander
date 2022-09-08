import { generateCanvas, degToRad, clampNumber } from "./helpers.js";
import { spawnEntityGraph } from "./smallgraph.js";

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
  gravity: 0.4,
  speed: 0,
  engine: {
    thrust: 0,
    fuel: 300,
    thrusting: false,
    startTime: null,
    start: function () {
      if (this.fuel > 0) {
        if (!this.thrusting) {
          this.startTime = Date.now();
          this.thrusting = true;
        }
        const timeDelta = (Date.now() - this.startTime) / 100;
        this.fuel = Math.max(this.fuel - timeDelta, 0);
        this.thrust = clampNumber({
          number: 0.05 * timeDelta,
          min: 0.05,
          max: 0.5,
        });
      } else {
        this.end();
      }
    },
    end: function () {
      this.thrusting = false;
      this.thrust = 0;
    },
  },
  heading: 90,
  position: {
    x: 50,
    y: 0,
  },
  getSpeed: function () {
    return new Promise((resolve) => {
      if (this.position.y > canvasProps.height - this.height) {
        return resolve(0);
      } else {
        const timeDelta = (currentFrameTime - previousFrameTime) / 100;
        const newSpeed =
          this.speed - this.engine.thrust + this.gravity * timeDelta;
        return resolve(newSpeed);
      }
    });
  },
  getNextPosition: function () {
    return new Promise((resolve) => {
      const prospectiveNewLocation = {
        x: this.position.x + this.speed * Math.cos(degToRad(this.heading)),
        y: this.position.y + this.speed * Math.sin(degToRad(this.heading)),
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
    this.getSpeed().then((newSpeed) => {
      this.speed = newSpeed;
      this.getNextPosition().then((nextPosition) => {
        CTX.fillStyle = "green";
        CTX.fillRect(this.position.x, this.position.y, this.width, this.height);
        CTX.restore();
        this.position = nextPosition;
      });
    });
  },
};

let previousFrameTime = Date.now();
let currentFrameTime = Date.now();
const drawFrame = () => {
  currentFrameTime = Date.now();
  CTX.clearRect(0, 0, canvasProps.width, canvasProps.height);

  lander.draw(CTX);

  previousFrameTime = Date.now();
  window.requestAnimationFrame(drawFrame);
};

document.addEventListener("keydown", ({ key }) => {
  if (key === "ArrowUp") {
    lander.engine.start();
  }
});

document.addEventListener("keyup", ({ key }) => {
  if (key === "ArrowUp") {
    lander.engine.end();
  }
});

window.requestAnimationFrame(drawFrame);

spawnEntityGraph({
  attachNode: ".statsContainer",
  getNumerator: () => lander.engine.fuel,
  getDenominator: () => 300,
  topLabel: "FUEL GALLONS: 300",
  bottomLabel: "REMAINING",
  showPercent: true,
  backgroundColor: "#999",
  fillColor: "white",
});
