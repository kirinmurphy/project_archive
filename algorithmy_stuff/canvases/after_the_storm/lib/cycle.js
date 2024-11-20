
import { images } from "./images.js"; 

const frameDelay = 3000;
const cycleTime = 10000;
const frameCount = 5;

let frameIndex = 0;
let cycleIndex = 0;
let slideTimeout;
let $frameWrappers;

document.addEventListener('DOMContentLoaded', () => {
  $frameWrappers = $('.hair-slow-zoom');  
  makSlides({ onReady: () => {
    $('#video').addClass('ready');
    $frameWrappers.on('click', () => { runCycle({ delay: 0 }); });  
    runCycle();
  }});    
});

function makSlides ({ onReady }) {
  setTimeout(function () {
    frameIndex++;
    const $newFrame = $('<span/>', { text: '' });
    updateSlideIndex({ $selector: $newFrame, cycleIndex: 0 });
    $frameWrappers.append($newFrame);
    if ( frameIndex < frameCount ) { makSlides({ onReady }); }
    if ( frameIndex === 1 ) { onReady(); }
  }, frameDelay);
}

function runCycle ({ delay = cycleTime } = {}) {
  clearTimeout(slideTimeout);
  slideTimeout = setTimeout(function () {
    cycleIndex = cycleIndex === (images.length - 1) ? 0 : cycleIndex + 1;
    for ( let i = 0; i < frameCount; i++ ) {
      setTimeout(() => {
        updateSlideIndex({ $selector: $frameWrappers.find(`span:eq(${frameCount - i - 1})`), cycleIndex });
      }, 500 * i);
    }
    runCycle();
  }, delay);
}

function updateSlideIndex ({ $selector, cycleIndex }) {
  $selector.css('background-image', `url("${images[cycleIndex]}")`);
}
