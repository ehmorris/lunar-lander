import { animate, generateCanvas } from "./helpers.js";

const maxDataPoints = 200;
const graphWidth = 200;
const graphHeight = 100;

export const spawnEntityGraph = ({
  attachNode,
  getNumerator,
  getDenominator,
  topLabel,
  getBottomLabel,
  showPercent,
  backgroundColor,
  fillColor,
  style,
}) => {
  const getPercentFill = () =>
    style === "posneg"
      ? (getNumerator() + getDenominator()) / (getDenominator() * 2)
      : getNumerator() / getDenominator();

  let barLog = Array(maxDataPoints).fill(getPercentFill());

  const CTX = generateCanvas({
    width: graphWidth,
    height: graphHeight,
    attachNode: attachNode,
  });

  const drawDataPoints = (arrayOfNums) => {
    arrayOfNums.forEach((barHeightPercent, index) => {
      CTX.lineTo(
        (graphWidth / (arrayOfNums.length - 1)) * index,
        graphHeight - graphHeight * barHeightPercent
      );
    });
  };

  const drawGraphPolygon = (arrayOfNums) => {
    if (style === "area") {
      CTX.fillStyle = fillColor;
      CTX.beginPath();
      CTX.moveTo(0, graphHeight);
      drawDataPoints(arrayOfNums);
      CTX.lineTo(graphWidth, graphHeight);
      CTX.closePath();
      CTX.fill();
    }

    if (style === "line" || style === "posneg") {
      CTX.strokeStyle = fillColor;
      CTX.beginPath();
      drawDataPoints(arrayOfNums);
      CTX.stroke();
    }
  };

  animate(() => {
    CTX.fillStyle = backgroundColor;
    CTX.fillRect(0, 0, graphWidth, graphHeight);

    if (style === "posneg") {
      // SAFE ZONE
      CTX.save();
      const safeZoneSize = 15;
      CTX.strokeStyle = "rgb(0, 255, 0, .5)";
      CTX.lineWidth = safeZoneSize;
      CTX.beginPath();
      CTX.moveTo(0, graphHeight / 2 - safeZoneSize / 2);
      CTX.lineTo(graphWidth, graphHeight / 2 - safeZoneSize / 2);
      CTX.stroke();

      // POS/NEG DIVIDER
      CTX.strokeStyle = "black";
      CTX.lineWidth = 1;
      CTX.beginPath();
      CTX.moveTo(0, graphHeight / 2);
      CTX.lineTo(graphWidth, graphHeight / 2);
      CTX.stroke();
      CTX.restore();
    }

    barLog.push(getPercentFill());
    if (barLog.length > maxDataPoints) {
      barLog = barLog.slice(-maxDataPoints);
    }

    drawGraphPolygon(barLog);

    const bottomLabel = getBottomLabel();
    const bottomLabelWithOptions = showPercent
      ? `${bottomLabel} (${Math.round(getPercentFill() * 1000) / 10}%)`
      : bottomLabel;

    CTX.save();
    CTX.fillStyle = "#000";
    CTX.font = "10px sans-serif";
    CTX.fillText(topLabel, 3, 12);
    CTX.fillText(bottomLabelWithOptions, 3, graphHeight - 5);
    CTX.restore();
  });
};
