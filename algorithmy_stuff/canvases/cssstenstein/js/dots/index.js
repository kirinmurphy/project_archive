import { getDots } from "./getDots.js";
import { startZipper } from "./startZipper.js";

const settings = {
  stagger: true,
  dotSize: 23,
  leftSpacing: 16,
  topSpacing: 11
};

document.addEventListener("DOMContentLoaded", () => {
  const $container = $('#dotLayer .rotate');
  const { $wrapper, dotProps, dotMap } = getDots($container, settings);
  $container.append($wrapper);
  
  // startZipper({ dotProps, dotMap, direction: 'right' });
  // startZipper({ dotProps, dotMap, direction: 'below' });
  // setTimeout(() => startZipper({ dotProps, dotMap, direction: 'left' }), 300);  
});
