export function getDotStyles ({ defaultDotStyle, index, dotProps }) {
  const { dotsPerRow, leftSpacing } = dotProps;

  const atEnd = index % dotsPerRow === dotsPerRow - 1;
  const possNewRightMargin = atEnd ? { marginRight: '0px' } : {};

  const inEvenRow = index % (dotsPerRow * 2) === 0;
  const possNewLeftSpacing = inEvenRow ? { marginLeft: leftSpacing + 'px' } : {};

  return {
    ...defaultDotStyle,
    ...possNewRightMargin,
    ...possNewLeftSpacing
  };
}
