import {
  seededShuffleArray,
  seededRandomBetween,
  getLineAngle,
} from "./helpers/helpers.js";
import { LANDER_WIDTH } from "./helpers/constants.js";

export const makeTerrain = (state) => {
  const CTX = state.get("CTX");
  const canvasWidth = state.get("canvasWidth");
  const canvasHeight = state.get("canvasHeight");
  const seededRandom = state.get("seededRandom");

  const targetHeight = canvasHeight * 0.8;
  const landingMaxHeight = targetHeight;
  const landingMinHeight = canvasHeight - 20;
  const numPoints = Math.max(Math.round(canvasWidth / 60), 20);
  let landingZoneSpans = [];
  let landingSurfaces = [];
  let terrainPathArray = [];
  let terrainPath2D;
  let showLandingSurfaces = false;

  // Divide the canvas into three spans with some margin between the spans
  // and between the spans and the edge of the canvas. This array will be
  // `pop()`d by `generateLandingSurface()`, so it's shuffled to prevent the
  // large surface from always being in one region of the screen.
  const generateLandingZoneSpans = () => {
    landingZoneSpans = [
      { minPoint: 1, maxPoint: Math.floor(numPoints / 3) },
      {
        minPoint: Math.floor(numPoints / 3) + 1,
        maxPoint: Math.floor((numPoints / 3) * 2),
      },
      {
        minPoint: Math.floor((numPoints / 3) * 2) + 1,
        maxPoint: numPoints - 1,
      },
    ];

    seededShuffleArray(landingZoneSpans, seededRandom);
  };

  const generateLandingSurface = (widthUnit, name) => {
    // Determine how many points are needed to at least be as wide as the
    // lander, and then use that as a basis for the passed width unit
    const minWidthInPoints = Math.ceil(
      (LANDER_WIDTH * 1.5) / (canvasWidth / numPoints)
    );
    const landingZone = landingZoneSpans.pop();
    const landingZoneWidth = landingZone.maxPoint - landingZone.minPoint;

    // Ensure the surface is no wider than the zone
    const widthInPoints = Math.min(
      minWidthInPoints * widthUnit,
      landingZoneWidth
    );

    // Only create an offset startPoint if there's enough width to render
    // the widthInPoints
    const startPoint =
      widthInPoints === landingZoneWidth
        ? landingZone.minPoint
        : Math.floor(
            seededRandomBetween(
              landingZone.minPoint,
              landingZone.maxPoint - widthInPoints,
              seededRandom
            )
          );

    return {
      startPoint,
      widthInPoints,
      height: seededRandomBetween(
        landingMinHeight,
        landingMaxHeight,
        seededRandom
      ),
      name,
    };
  };

  const reGenerate = () => {
    generateLandingZoneSpans();
    landingSurfaces = [
      generateLandingSurface(3, "largeLandingSurface"),
      generateLandingSurface(1, "smallLandingSurface"),
    ];

    terrainPathArray = generateTerrainY(
      numPoints,
      targetHeight,
      canvasHeight / 10,
      0.75,
      seededRandom
    ).map((y, index) => {
      // Get landing surface if we've reached its x position
      const landingSurface = landingSurfaces.find(
        (surface) =>
          index >= surface.startPoint &&
          index <= surface.startPoint + surface.widthInPoints
      );

      return {
        x: index * (canvasWidth / numPoints),
        y: landingSurface ? landingSurface.height : y,
      };
    });
    terrainPathArray[0] = { x: 0, y: targetHeight };
    terrainPathArray[numPoints] = { x: canvasWidth, y: targetHeight };

    const terrainPath = new Path2D();
    terrainPath.moveTo(0, canvasHeight);
    terrainPathArray.forEach(({ x, y }) => terrainPath.lineTo(x, y));
    terrainPath.lineTo(canvasWidth, canvasHeight);
    terrainPath.closePath();

    terrainPath2D = terrainPath;
  };

  reGenerate();

  const draw = () => {
    CTX.save();
    CTX.fillStyle = state.get("theme").terrain;
    CTX.fill(terrainPath2D);
    CTX.restore();

    if (showLandingSurfaces) {
      landingSurfaces.forEach((surface) => {
        const startPixel = surface.startPoint * (canvasWidth / numPoints);
        const widthInPixels = surface.widthInPoints * (canvasWidth / numPoints);
        const text = `+${state
          .get("bonusPointsManager")
          .getPointValue(surface.name)}`;

        CTX.save();
        CTX.fillStyle = state.get("theme").infoFontColor;
        CTX.font = "400 14px -apple-system, BlinkMacSystemFont, sans-serif";
        CTX.fillText(
          text,
          startPixel + widthInPixels / 2 - CTX.measureText(text).width / 2,
          surface.height - 10
        );
        CTX.lineWidth = 2;
        CTX.strokeStyle = "white";
        CTX.beginPath();
        CTX.moveTo(startPixel, surface.height);
        CTX.lineTo(startPixel + widthInPixels, surface.height);
        CTX.closePath();
        CTX.stroke();
        CTX.restore();
      });
    }
  };

  const getLandingData = () => {
    let landingSurfacesInPixels = [];

    landingSurfaces.forEach(({ startPoint, widthInPoints, name }) => {
      landingSurfacesInPixels.push({
        x: startPoint * (canvasWidth / numPoints),
        width: widthInPoints * (canvasWidth / numPoints),
        name,
      });
    });

    return {
      terrainPath2D,
      numPoints,
      terrainHeight: terrainPathArray.reduce(
        (min, { y }) => (y < min ? y : min),
        canvasHeight
      ),
      terrainAvgHeight: targetHeight,
      landingSurfaces: landingSurfacesInPixels,
    };
  };

  const getSegmentAngleAtX = (x) => {
    const segmentNumber = Math.floor(x / (canvasWidth / numPoints));
    const segmentStart = terrainPathArray[segmentNumber];
    const segmentEnd = terrainPathArray[segmentNumber + 1];
    return getLineAngle(segmentStart, segmentEnd);
  };

  return {
    draw,
    reGenerate,
    getLandingData,
    getSegmentAngleAtX,
    setShowLandingSurfaces: () => (showLandingSurfaces = true),
  };
};

// Generate terrain with midpoint displacement
function generateTerrainY(width, height, displace, roughness, seededRandom) {
  let points = [];
  let power = Math.pow(2, Math.ceil(Math.log(width) / Math.log(2)));

  points[0] = height + seededRandom.getSeededRandom() * displace * 2 - displace;
  points[power] =
    height + seededRandom.getSeededRandom() * displace * 2 - displace;

  displace *= roughness;

  for (let i = 1; i < power; i *= 2) {
    for (let j = power / i / 2; j < power; j += power / i) {
      points[j] = (points[j - power / i / 2] + points[j + power / i / 2]) / 2;
      points[j] += seededRandom.getSeededRandom() * displace * 2 - displace;
    }

    displace *= roughness;
  }

  return points;
}
