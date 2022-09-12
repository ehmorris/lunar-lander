import {
  generateCanvas,
  degToRad,
  clampNumber,
  roundToNDigits,
} from "./helpers.js";
import { spawnEntityGraph } from "./smallgraph.js";

// SETUP AND CONSTS

const canvasProps = {
  width: 1080,
  height: 400,
};

const CTX = generateCanvas({
  width: canvasProps.width,
  height: canvasProps.height,
  attachNode: ".gameContainer",
});

const MAX_FUEL = 300;
const MAX_BOOSTER_FUEL = 300;
const THRUST_MAX = 0.1;
const SPEED_FACTOR = 15;
const SPEED_BOUND = 20;

// LANDER PROPS AND ACTIONS

const lander = {
  width: 20,
  height: 20,
  gravity: 0.04,
  speed: 0,
  heading: 90,
  rotation: 15,
  position: {
    x: 50,
    y: 0,
  },
  boosters: {
    thrust: 0,
    boosterAngle: 0,
    fuel: MAX_BOOSTER_FUEL,
    thrusting: false,
    startTime: null,
    start: function ({ angle }) {
      if (this.fuel > 0) {
        if (!this.thrusting) {
          this.startTime = Date.now();
          this.boosterAngle = angle;
          this.thrusting = true;
        }
        const timeDelta = (Date.now() - this.startTime) / 100;
        this.fuel = Math.max(this.fuel - timeDelta, 0);
        this.thrust = clampNumber({
          number: (THRUST_MAX / 4) * timeDelta,
          min: 0,
          max: THRUST_MAX,
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
  engine: {
    thrust: 0,
    fuel: MAX_FUEL,
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
          min: 0,
          max: THRUST_MAX,
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
  getHeadingAndRotation: function () {
    return new Promise((resolve) => {
      const timeDelta = (currentFrameTime - previousFrameTime) / 100;
      let newHeading = this.heading;
      let newRotation;
      if (this.boosters.boosterAngle < this.heading) {
        newRotation = this.rotation - this.boosters.thrust;
      } else {
        newRotation = this.rotation + this.boosters.thrust;
      }

      return resolve({ heading: newHeading, rotation: newRotation });
    });
  },
  getSpeed: function () {
    return new Promise((resolve) => {
      const timeDelta = (currentFrameTime - previousFrameTime) / 100;
      const isGrounded = this.position.y >= canvasProps.height - this.height;
      const boundedCurrentSpeed = isGrounded ? 0 : this.speed;
      const newSpeed =
        boundedCurrentSpeed - this.engine.thrust + this.gravity * timeDelta;
      const boundedNewSpeed = isGrounded ? Math.min(newSpeed, 0) : newSpeed;

      return resolve(boundedNewSpeed);
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
    this.getSpeed().then((newSpeed) => {
      this.speed = newSpeed;
      this.getHeadingAndRotation().then(({ heading, rotation }) => {
        this.heading = heading;
        this.rotation = rotation;
        this.getNextPosition().then((nextPosition) => {
          // ROTATE LANDER
          const shapeCenter = {
            x: this.position.x + this.width / 2,
            y: this.position.y + this.height / 2,
          };
          CTX.save();
          CTX.translate(shapeCenter.x, shapeCenter.y);
          CTX.rotate(degToRad(this.rotation));
          CTX.translate(-this.width / 2, -this.height / 2);
          // RENDER LANDER
          CTX.fillStyle = "green";
          CTX.fillRect(
            this.position.x,
            this.position.y,
            this.width,
            this.height
          );
          CTX.restore();
          this.position = nextPosition;
        });
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

window.requestAnimationFrame(drawFrame);

// CONTROLS

document.addEventListener("keydown", ({ key }) => {
  if (key === "ArrowUp") {
    lander.engine.start();
  }
  if (key === "ArrowLeft") {
    lander.boosters.start({ angle: 180 });
  }
  if (key === "ArrowRight") {
    lander.boosters.start({ angle: 0 });
  }
});

document.addEventListener("keyup", ({ key }) => {
  if (key === "ArrowUp") {
    lander.engine.end();
  }
  if (key === "ArrowLeft" || key === "ArrowRight") {
    lander.boosters.end();
  }
});

// OBSERVABILITY

spawnEntityGraph({
  attachNode: ".statsContainer",
  getNumerator: () => lander.engine.fuel,
  getDenominator: () => MAX_FUEL,
  topLabel: "FUEL",
  getBottomLabel: () => `${roundToNDigits(lander.engine.fuel, 1)} GALLONS`,
  backgroundColor: "#999",
  fillColor: "white",
  style: "area",
});

spawnEntityGraph({
  attachNode: ".statsContainer",
  getNumerator: () => lander.boosters.fuel,
  getDenominator: () => MAX_BOOSTER_FUEL,
  topLabel: "BOOSTER FUEL",
  getBottomLabel: () => `${roundToNDigits(lander.boosters.fuel, 1)} GALLONS`,
  backgroundColor: "#999",
  fillColor: "white",
  style: "area",
});

spawnEntityGraph({
  attachNode: ".statsContainer",
  getNumerator: () => lander.speed,
  getDenominator: () => SPEED_BOUND / SPEED_FACTOR,
  topLabel: "SPEED",
  getBottomLabel: () => `${roundToNDigits(lander.speed * SPEED_FACTOR, 0)}MPH`,
  backgroundColor: "#999",
  fillColor: "white",
  style: "posneg",
});

spawnEntityGraph({
  attachNode: ".statsContainer",
  getNumerator: () => lander.engine.thrust,
  getDenominator: () => THRUST_MAX,
  topLabel: "THRUST",
  getBottomLabel: () => roundToNDigits(lander.engine.thrust, 1),
  backgroundColor: "#999",
  fillColor: "white",
  style: "area",
});

spawnEntityGraph({
  attachNode: ".statsContainer",
  getNumerator: () => lander.heading,
  getDenominator: () => 360,
  topLabel: "HEADING",
  getBottomLabel: () => `${roundToNDigits(lander.heading, 1)}°`,
  backgroundColor: "#999",
  fillColor: "white",
  style: "line",
});
