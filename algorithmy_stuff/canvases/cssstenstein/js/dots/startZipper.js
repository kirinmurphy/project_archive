const DOT_JUMP_DELAY = 50;
const ZIPPER_START_INCREMENT = 1000;
    
export function startZipper ({ dotProps, dotMap, direction }) {
  setTimeout(() => {
    const { dotCount, dotsPerRow, dotsPerColumn } = dotProps; 
    const randomRow = Math.floor(Math.random() * dotsPerColumn);
    const randomColumn = Math.floor(Math.random() * dotsPerRow);

    const starterIndexes = {
      'right': randomRow * dotsPerRow,
      'left': randomRow * dotsPerRow + dotsPerRow-1,
      'below': randomColumn - 1,
      'above': dotCount - dotsPerRow + randomColumn - 1
    };

    const starterIndex = starterIndexes[direction];
    dotMap[starterIndex].addClass('active'); 

    console.log('----------------------------');
    console.log('starterIndex - ', direction, ': ', starterIndex);
    // console.log('');

    jumpADot(dotMap, starterIndex, direction);

    startZipper({ dotProps, dotMap, direction }); 

  }, ZIPPER_START_INCREMENT);
}

function jumpADot (dotMap, currentIndex, direction) {
  setTimeout(() => {
    const currentDot = dotMap[currentIndex];
    const nextNeighborIndex = currentDot.data('neighbors')[direction];
    console.log(direction, ' neighbors: ', nextNeighborIndex);
    
    setTimeout(() => currentDot.removeClass('active'), DOT_JUMP_DELAY);


    
    if ( nextNeighborIndex ) { 
      const nextNeighbor = dotMap[nextNeighborIndex];
      nextNeighbor.addClass('active'); 
      jumpADot(dotMap, nextNeighborIndex, direction);
    }  
  }, DOT_JUMP_DELAY);
}
