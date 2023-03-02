import { LANDER_WIDTH } from "../helpers/constants.js";

export const drawLanderGradient = (CTX, width = LANDER_WIDTH) => {
  const gradient = CTX.createLinearGradient(-width / 2, 0, width / 2, 0);
  gradient.addColorStop(0, "#DFE5E5");
  gradient.addColorStop(0.3, "#BDBCC3");
  gradient.addColorStop(0.6, "#4A4E6F");
  gradient.addColorStop(1, "#3D4264");

  return gradient;
};
