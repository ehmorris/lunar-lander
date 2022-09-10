import { generateCanvas, clampNumber } from "./helpers.js";

const maxDataPoints = 200;
const graphWidth = 200;
const graphHeight = 100;

export const spawnPosNegGraph = ({
  attachNode,
  getNumerator,
  getDenominator,
  topLabel,
  getBottomLabel,
  showPercent,
  backgroundColor,
  fillColor,
}) => {
  let barLog = Array(maxDataPoints).fill(
    (getNumerator() + getDenominator()) / (getDenominator() * 2)
  );
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

  const drawGraphPolygon = (arrayOfNums) => {
    CTX.strokeStyle = fillColor;
    CTX.beginPath();
    arrayOfNums.forEach((barHeightPercent, index) => {
      CTX.lineTo(
        (graphWidth / (arrayOfNums.length - 1)) * index,
        graphHeight - graphHeight * barHeightPercent
      );
    });
    CTX.stroke();
  };

  const drawFrame = () => {
    CTX.fillStyle = backgroundColor;
    CTX.fillRect(0, 0, graphWidth, graphHeight);

    // middle line
    CTX.strokeStyle = "red";
    CTX.beginPath();
    CTX.moveTo(0, graphHeight / 2);
    CTX.lineTo(graphWidth, graphHeight / 2);
    CTX.stroke();

    const percentFill =
      (getNumerator() + getDenominator()) / (getDenominator() * 2);
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
