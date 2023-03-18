import { randomBetween, shuffleArray } from "./helpers/helpers.js";
import { LANDER_WIDTH } from "./helpers/constants.js";

export const makeTerrain = (state) => {
  const CTX = state.get("CTX");
  const canvasWidth = state.get("canvasWidth");
  const canvasHeight = state.get("canvasHeight");
  const maxHeight = canvasHeight - canvasHeight / 10;
  const minHeight = canvasHeight - 10;
  const numPoints = Math.max(canvasWidth / 60, 20);
  let landingZones = [];
  let landingSurfaces = [];
  let terrain = [];

  const generateLandingZonesList = () => {
    // Divide points into three sections with a little margin between.
    // Landing zones shouldn't start or end at the edge of the screen.
    landingZones = [
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

    shuffleArray(landingZones);
  };

  const generateLandingSurface = (widthUnit) => {
    const minWidthInPoints = Math.ceil(
      LANDER_WIDTH / (canvasWidth / numPoints)
    );
    const landingZone = landingZones.pop();
    const landingZoneWidth = landingZone.maxPoint - landingZone.minPoint;
    const widthInPoints = Math.min(
      minWidthInPoints * widthUnit,
      landingZoneWidth
    );
    const startPoint =
      widthInPoints === landingZoneWidth
        ? landingZone.minPoint
        : Math.floor(
            randomBetween(
              landingZone.minPoint,
              landingZone.maxPoint - widthInPoints
            )
          );

    return {
      startPoint,
      widthInPoints,
      height: randomBetween(minHeight, maxHeight),
    };
  };

  const getLandingData = () => {
    let landingSurfacesInPixels = [];

    landingSurfaces.forEach(({ startPoint, widthInPoints, height }) => {
      landingSurfacesInPixels.push({
        x: startPoint * (canvasWidth / numPoints),
        width: widthInPoints * (canvasWidth / numPoints),
        height,
      });
    });

    return {
      terrainHeight: maxHeight,
      landingSurfaces: landingSurfacesInPixels,
    };
  };

  const reGenerate = () => {
    // Generate three non-overlapping spans from which
    // generateLandingSurface pops a value
    generateLandingZonesList();

    // One narrow and one wide landing zone
    landingSurfaces = [generateLandingSurface(4), generateLandingSurface(1)];
    terrain = [];

    for (let index = 1; index < numPoints; index++) {
      const landingSurface = landingSurfaces.find(
        (surface) =>
          index >= surface.startPoint &&
          index <= surface.startPoint + surface.widthInPoints
      );

      if (landingSurface) {
        terrain.push({
          x: index * (canvasWidth / numPoints),
          y: landingSurface.height,
        });
      } else {
        terrain.push({
          x: index * (canvasWidth / numPoints),
          y: randomBetween(minHeight, maxHeight),
        });
      }
    }
  };
  reGenerate();

  const draw = () => {
    CTX.save();
    CTX.fillStyle = "gray";
    CTX.beginPath();
    CTX.moveTo(0, canvasHeight);
    CTX.lineTo(0, maxHeight);
    terrain.forEach((point) => {
      CTX.lineTo(point.x, point.y);
    });
    CTX.lineTo(canvasWidth, maxHeight);
    CTX.lineTo(canvasWidth, canvasHeight);
    CTX.closePath();
    CTX.fill();
    CTX.restore();

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

  return { draw, reGenerate, getLandingData };
};
