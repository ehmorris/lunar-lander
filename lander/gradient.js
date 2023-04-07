import { LANDER_WIDTH } from "../helpers/constants.js";

export const drawLanderGradient = (CTX, width = LANDER_WIDTH) => {
  const gradient = CTX.createLinearGradient(-width / 2, 0, width / 2, 0);
  gradient.addColorStop(0, "#FFE9DC");
  gradient.addColorStop(0.3, "#FDD1B6");
  gradient.addColorStop(0.6, "#5E5B7A");
  gradient.addColorStop(1, "#44354A");

  return gradient;
};
