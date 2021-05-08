
export function getDotCounts ($container, { dotSize, leftSpacing, topSpacing }) {
  const containerWidth = $container.outerWidth(true)
    - parseInt($container.css('margin-left'))
    - parseInt($container.css('margin-right'));

  const containerHeight = $container.outerHeight(true)
    - parseInt($container.css('margin-top'))
    - parseInt($container.css('margin-bottom'));

  const totalDotWidth = dotSize + leftSpacing;
  const totalDotHeight = dotSize + topSpacing;

  const dotsPerRow = parseInt(containerWidth / totalDotWidth);
  const dotsPerColumn = parseInt(containerHeight / totalDotHeight);

  const dotCount = dotsPerRow * dotsPerColumn;

  return {
    dotsPerRow,
    dotsPerColumn,
    dotCount
  }
}

