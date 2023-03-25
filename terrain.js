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
  const maxHeight = canvasHeight * 0.7;
  const minHeight = canvasHeight * 0.8;
  const landingMaxHeight = canvasHeight * 0.8;
  const landingMinHeight = canvasHeight * 0.95;
  const numPoints = Math.max(canvasWidth / 60, 20);
  let landingZoneSpans = [];
  let landingSurfaces = [];
  let terrainPathArray = [];
  let terrainPath2D;

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

    seededShuffleArray(landingZoneSpans, state.get("seededRandom"));
  };

  const generateLandingSurface = (widthUnit) => {
    const seededRandom = state.get("seededRandom");

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
    };
  };

  const reGenerate = () => {
    generateLandingZoneSpans();
    landingSurfaces = [generateLandingSurface(4), generateLandingSurface(1)];

    const path = new Path2D();
    path.moveTo(0, canvasHeight);
    path.lineTo(0, maxHeight);
    terrainPathArray.push({ x: 0, y: maxHeight });

    // Draw terrain from left to right
    for (let index = 1; index < numPoints; index++) {
      // Get landing surface if we've reached its x position
      const landingSurface = landingSurfaces.find(
        (surface) =>
          index >= surface.startPoint &&
          index <= surface.startPoint + surface.widthInPoints
      );

      const x = index * (canvasWidth / numPoints);
      const y = landingSurface
        ? landingSurface.height
        : seededRandomBetween(minHeight, maxHeight, state.get("seededRandom"));

      path.lineTo(x, y);
      terrainPathArray.push({ x, y });
    }

    path.lineTo(canvasWidth, maxHeight);
    path.lineTo(canvasWidth, canvasHeight);
    path.closePath();
    terrainPathArray.push({ x: canvasWidth, y: maxHeight });

    terrainPath2D = path;
  };

  reGenerate();

  const draw = () => {
    CTX.save();
    CTX.fillStyle = "gray";
    CTX.fill(terrainPath2D);
    CTX.restore();

    // Highlight landing zones in white
    landingSurfaces.forEach((surfaces) => {
      CTX.save();
      CTX.lineWidth = 2;
      CTX.strokeStyle = "white";
      CTX.beginPath();
      CTX.moveTo(
        surfaces.startPoint * (canvasWidth / numPoints),
        surfaces.height
      );
      CTX.lineTo(
        surfaces.startPoint * (canvasWidth / numPoints) +
          surfaces.widthInPoints * (canvasWidth / numPoints),
        surfaces.height
      );
      CTX.closePath();
      CTX.stroke();
      CTX.restore();
    });
  };

  const getLandingData = () => {
    let landingSurfacesInPixels = [];

    landingSurfaces.forEach(({ startPoint, widthInPoints }) => {
      landingSurfacesInPixels.push({
        x: startPoint * (canvasWidth / numPoints),
        width: widthInPoints * (canvasWidth / numPoints),
      });
    });

    return {
      terrainPath2D,
      terrainHeight: maxHeight,
      terrainMinHeight: minHeight,
      landingSurfaces: landingSurfacesInPixels,
    };
  };

  const getSegmentAngleAtX = (x) => {
    const segmentNumber = Math.floor(x / (canvasWidth / numPoints));
    const segmentStart = terrainPathArray[segmentNumber];
    const segmentEnd = terrainPathArray[segmentNumber + 1];
    return getLineAngle(segmentStart, segmentEnd);
  };

  return { draw, reGenerate, getLandingData, getSegmentAngleAtX };
};
