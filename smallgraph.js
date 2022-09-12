import { generateCanvas, clampNumber } from "./helpers.js";

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

  const addValueToBarLog = (value) => {
    barLog.push(value);
    if (barLog.length > maxDataPoints) {
      barLog = barLog.slice(-maxDataPoints);
    }
  };

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

  const drawFrame = () => {
    CTX.fillStyle = backgroundColor;
    CTX.fillRect(0, 0, graphWidth, graphHeight);

    if (style === "posneg") {
      CTX.strokeStyle = "red";
      CTX.beginPath();
      CTX.moveTo(0, graphHeight / 2);
      CTX.lineTo(graphWidth, graphHeight / 2);
      CTX.stroke();
    }

    const percentFill = getPercentFill();
    addValueToBarLog(percentFill);
    drawGraphPolygon(barLog);
    const bottomLabel = getBottomLabel();
    const bottomLabelWithOptions = showPercent
      ? `${bottomLabel} (${Math.round(percentFill * 1000) / 10}%)`
      : bottomLabel;

    CTX.fillStyle = "#000";
    CTX.font = "10px sans-serif";
    CTX.fillText(topLabel, 3, 12);
    CTX.fillText(bottomLabelWithOptions, 3, graphHeight - 5);

    window.requestAnimationFrame(drawFrame);
  };

  window.requestAnimationFrame(drawFrame);
};
