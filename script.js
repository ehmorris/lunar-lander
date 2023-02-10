import { generateCanvas, roundToNDigits, animate } from "./helpers.js";
import { spawnEntityGraph } from "./smallgraph.js";
import { makeLander } from "./lander.js";

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

const lander = makeLander(CTX, canvasProps);

animate((currentFrameTime, previousFrameTime) => {
  CTX.clearRect(0, 0, canvasProps.width, canvasProps.height);
  lander.draw(currentFrameTime, previousFrameTime);
});

// CONTROLS

document.addEventListener("keydown", ({ key }) => {
  if (key === "ArrowUp") {
    lander.startEngine();
  }
  if (key === "ArrowLeft") {
    lander.startBooster({ angle: 180 });
  }
  if (key === "ArrowRight") {
    lander.startBooster({ angle: 0 });
  }
});

document.addEventListener("keyup", ({ key }) => {
  if (key === "ArrowUp") {
    lander.endEngine();
  }
  if (key === "ArrowLeft" || key === "ArrowRight") {
    lander.endBooster();
  }
});

// OBSERVABILITY

spawnEntityGraph({
  attachNode: ".statsContainer",
  getNumerator: () => lander.engineProps.fuel,
  getDenominator: () => lander.props.MAX_FUEL,
  topLabel: "FUEL",
  getBottomLabel: () => `${roundToNDigits(lander.engineProps.fuel, 1)} GALLONS`,
  backgroundColor: "#999",
  fillColor: "white",
  style: "area",
});

spawnEntityGraph({
  attachNode: ".statsContainer",
  getNumerator: () => lander.boosterProps.fuel,
  getDenominator: () => lander.props.MAX_BOOSTER_FUEL,
  topLabel: "BOOSTER FUEL",
  getBottomLabel: () =>
    `${roundToNDigits(lander.boosterProps.fuel, 1)} GALLONS`,
  backgroundColor: "#999",
  fillColor: "white",
  style: "area",
});

const SPEED_FACTOR = 15;
const SPEED_BOUND = 20;
spawnEntityGraph({
  attachNode: ".statsContainer",
  getNumerator: () => lander.props.speed,
  getDenominator: () => SPEED_BOUND / SPEED_FACTOR,
  topLabel: "SPEED",
  getBottomLabel: () =>
    `${roundToNDigits(lander.props.speed * SPEED_FACTOR, 0)}MPH`,
  backgroundColor: "#999",
  fillColor: "white",
  style: "posneg",
});

spawnEntityGraph({
  attachNode: ".statsContainer",
  getNumerator: () => lander.engineProps.thrust,
  getDenominator: () => lander.props.THRUST_MAX,
  topLabel: "THRUST",
  getBottomLabel: () => roundToNDigits(lander.engineProps.thrust, 1),
  backgroundColor: "#999",
  fillColor: "white",
  style: "area",
});

spawnEntityGraph({
  attachNode: ".statsContainer",
  getNumerator: () => lander.props.heading,
  getDenominator: () => 360,
  topLabel: "HEADING",
  getBottomLabel: () => `${roundToNDigits(lander.props.heading, 1)}°`,
  backgroundColor: "#999",
  fillColor: "white",
  style: "line",
});
