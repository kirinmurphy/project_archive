
(function($) {
	$.fn.makeSomeDots = function(options) {
		var settings = {
      stagger: true,
      dotSize: 23,
      leftSpacing: 16,
      topSpacing: 11
		};
		
		return this.each(function () {
      if ( options ) { $.extend(settings,options); }  

      var $container = $(this);
      const dotProps = getDotCounts($container, settings);
      const { $wrapper, dotMap } =  getDots({ ...dotProps, ...settings });

      $container.append($wrapper);

      // startHorizontalZipper({ dotProps, dotMap });
		});
	}
})(jQuery);

function startHorizontalZipper ({ dotProps, dotMap }) {
  setTimeout(() => {
    const { dotsPerRow, dotsPerColumn } = dotProps; 
    const randomColumn = Math.floor(Math.random() * dotsPerColumn);
    const leftStarter = randomColumn * dotsPerRow;
    dotMap[leftStarter].addClass('active');
    setDotter(dotMap, leftStarter);
    startHorizontalZipper({ dotProps, dotMap }); 
  }, 8000);

}

function setDotter (dotMap, previousIndex) {
  setTimeout(() => {
    const previousDot = dotMap[previousIndex];
    const { right } = previousDot.data('neighbors');
    previousDot.removeClass('active');
  
    if ( right ) { 
      const newIndex = dotMap[right];
      newIndex.addClass('active'); 
      setDotter(dotMap, right);
    }  
  }, 50);
}

function getDots (props) {
  const { 
    dotsPerRow, 
    dotsPerColumn,
    dotCount, 
    dotSize, 
    leftSpacing, 
    topSpacing,
    stagger 
  } = props;

  const $wrapper = $('<div/>', { 'class':'clr' });

  let dotMap = {};

  for ( var index = 0; index < dotCount; index++ ) {
    const neighbors = getNeighbors({ index, dotsPerRow, dotsPerColumn });

    var $em = $('<em/>')
      .css('height',dotSize + 'px')
      .css('width', dotSize + 'px')
      .css('margin-right', leftSpacing)
      .css('margin-bottom', topSpacing)
      .data('neighbors', neighbors)
      .appendTo($wrapper);

    if ( stagger ) {
      const atEnd = index % dotsPerRow === dotsPerRow - 1;
      const addLeftSpacing = ( index % (dotsPerRow * 2) === 0 );
      if ( atEnd ) { $em.css('margin-right', 0); }
      if ( addLeftSpacing ) { $em.css('margin-left', leftSpacing); }
    }

    dotMap[index] = $em;
  }

  return { $wrapper, dotMap };
}

function getNeighbors ({ index, dotsPerRow, dotsPerColumn }) {
  return {
    left: index % dotsPerRow === 0 ? null : index - 1,
    right: index % dotsPerRow === dotsPerRow-1 ? null : index + 1
  }
}

function getDotCounts ($container, { dotSize, leftSpacing, topSpacing }) {
  var containerWidth = $container.outerWidth(true)
    - parseInt($container.css('margin-left'))
    - parseInt($container.css('margin-right'));

  var containerHeight = $container.outerHeight(true)
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


