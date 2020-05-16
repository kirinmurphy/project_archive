


(function() {
  var imageList = [
    { name: 'images/rainbow-rings.gif' },
    { name: 'images/industrial-waste.gif' },
    { name: 'images/calling-all-cars.gif' },
    { name: 'images/boogie-nights.gif' },
    { name: 'images/boston_skyline.gif' },
    { name: 'images/night_space_sky.gif' },
    { name: 'images/bladerunning_glassbreaking.gif' },
    { name: 'images/beach_burnout.gif' },
    { name: 'images/animatrix_robot_riot1.gif' },
    { name: 'images/animatrix_robot_riot2.gif' },
    { name: 'images/sun_tracker.gif' },
    { name: 'images/retro_explo.gif' },
    // { name: '/images/honey_bunny_standoff.gif' },
    // { name: '/images/cloud_motion.gif', opacity: .6 }
  ];

  $(imageList).each(function(){
    $('<img/>')[0].src = this.name;
  });

  var $slides = $('#slides');
  var cycleRate = 16000;
  var scaleRate = 1;

  setImageCss();
  makeAllSlides();
  setTimeout(function () { setNewSlide(); }, 1000);

  // -- SET SLIDES ------------------------------------- //
  var slideTimeout;
  $('body').on('click', function () {
    clearTimeout(slideTimeout);
    setNewSlide();
  });

  function setNewSlide () {
    var currentPic = parseInt($slides.attr('data-pic')) || 0;
    var newPic = currentPic < imageList.length ? currentPic + 1 : 1;
    $slides.attr('data-pic', newPic);
    slideTimeout = setTimeout(function () { setNewSlide(); }, cycleRate);

    var cycleRateReduction;
    if ( cycleRate > 2000 ) { cycleRateReduction = .91; }
    if ( cycleRate <= 2000 ) { cycleRateReduction = .965; }

    if ( cycleRate < 100 ) {
      scaleRate = scaleRate + .001;
      $('#slides').css('transform', 'scale(' + scaleRate + ')');
    }

    // if ( cycleRate <= 1000 ) { cycleRateReduction = .995; }
    console.log('cycleRate', cycleRate);
    cycleRate = cycleRate * cycleRateReduction;

  }

  // -- BUILD SLIDES --------------------------------- //
  function makeAllSlides () {
    makeSlides(1, 'left top', 'corner');
    makeSlides(2, 'center top', 'columns');
    makeSlides(1, 'right top', 'corner');
    makeSlides(2, 'left middle', 'rows');
    makeSlides(4, 'center middle', 'nucleus');
    makeSlides(2, 'right middle', 'rows');
    makeSlides(1, 'left bottom', 'corner');
    makeSlides(2, 'center bottom', 'columns');
    makeSlides(1, 'right bottom', 'corner');
  }

  function makeSlides (qty, positions, cellType) {
    var frames = [];
    var i = 0;

    while (i < qty) {
      frames.push(makeSlide(i + 1));
      i++;
    }

    var $wrapInner = $('<div/>', { 'class': 'inner' }).html(frames.join(""));

    var $wrap = $('<div/>', { 'class': 'cell ' + positions })
      .attr('data-cell-type', cellType || "").html($wrapInner);

    return $slides.append($wrap);
  };

  function makeSlide (index) {
    return '<em data-frame="' + index + '"><span></span></em>';
  };

  // -- Set Images ------------------------------------- //
  function setImageCss () {
    $('head').append('<style>\n' + getImageStyles() + '\n</style>\n');
  }

  function getImageStyles () {
    return imageList.map(getImageStyle).join('');
  }

  function getImageStyle (item, index) {
    var slidePrefix = '#slides[data-pic="' + (index + 1) + '"]';
    var backgroundImage = '{ background-image: url(' + item.name + '); }\n';
    var style1 = slidePrefix + ' span ' + backgroundImage;
    var style2 = slidePrefix + ':after ' + backgroundImage;
    var style3 = item.opacity ? slidePrefix + ':after { opacity: ' + item.opacity + ' }' : '';
    return style1 + style2 + style3;
  }

})();
