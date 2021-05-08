import { getDotCounts } from "./getDotCounts.js";
import { getDotStyles } from "./getDotStyles.js";

export function getDots ($container, settings) {
  const dotProps = { 
    ...settings, 
    ...getDotCounts($container, settings) 
  };

  const { 
    dotsPerRow, 
    dotsPerColumn,
    dotCount, 
    dotSize, 
    leftSpacing, 
    topSpacing,
  } = dotProps;

  const defaultDotStyle = {
    height: dotSize + 'px',
    width: dotSize + 'px',
    marginRight: leftSpacing + 'px',
    marginBottom: topSpacing + 'px'
  };

  const wrapper = document.createElement('div', {
    class: 'clr'
  });

  const $wrapper = $(wrapper);

  let dotMap = {};

  for ( let index = 0; index < dotCount; index++ ) {
    const em = document.createElement('em');
    
    const emStyles = getDotStyles({ defaultDotStyle, index, dotProps });
    Object.assign(em.style, emStyles);

    const neighbors = getNeighbors({ index, dotsPerRow, dotsPerColumn });

    const $em = $(em)
      .data('neighbors', neighbors)
      .appendTo($wrapper);

    dotMap[index] = $em;
  }

  return { 
    $wrapper, 
    dotProps, 
    dotMap 
  };
}


function getNeighbors ({ index, dotsPerRow, dotCount }) {
  return {
    below: index <= dotsPerRow ? index + dotsPerRow : null,
    above: index < dotCount - dotsPerRow ? index + dotsPerRow : null,
    left: index % dotsPerRow === 0 ? null : index - 1,
    right: index % dotsPerRow === dotsPerRow-1 ? null : index + 1
    
  }
}
