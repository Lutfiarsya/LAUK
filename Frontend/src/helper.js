const baseWidth = 412;
const baseHeight = 917;

export const widthResponsive = (size) => {
  return `calc(${size} / ${baseWidth} * 100vw)`;
};

export const heightResponsive = (size) => {
  return `calc(${size} / ${baseHeight} * 100vh)`;
};