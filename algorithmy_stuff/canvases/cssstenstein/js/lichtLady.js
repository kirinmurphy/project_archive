(function () {
  const LICHT_INTERVAL = 4500;

  const activeIntervals = [
    { offset: 4, duration: 2 },
    { offset: 16, duration: 8 },
    { offset: 48, duration: 3 },
    { offset: 74, duration: 5 }
  ];
  
  const lichtLady = document.getElementById('licht-lady');
  let incrementer = 1;
  window.requestAnimationFrame(step);	
  
  function step () {
    const inAnActiveInterval = activeIntervals.find(interval => inActiveInterval(interval, incrementer)); 
    const position = inAnActiveInterval ? '0vh' : '200vh';
    Object.assign(lichtLady.style, { transform: `translateY(${position}` });
    incrementer++;
    window.requestAnimationFrame(step);
  }  
  
  function inActiveInterval(interval, incrementer) {
    const { offset, duration } = interval;
    const currentOffset =  incrementer % LICHT_INTERVAL; 
    const notBeforeFirstOffset = incrementer > LICHT_INTERVAL;
    const afterOffsetStart = currentOffset > offset;
    const beforeOffsetEnd = currentOffset < offset + duration;
    return notBeforeFirstOffset && afterOffsetStart && beforeOffsetEnd;
  }  
})();
