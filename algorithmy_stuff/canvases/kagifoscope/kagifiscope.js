


(function() {
  var imageList = [
    // { name: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.pinimg.com%2Foriginals%2F31%2F53%2F42%2F315342e9f31e362ea24c05fdcecdc186.gif&f=1&nofb=1&ipt=83c6b9a485b33b2f598e5efb8feac6feac49c8dd000532b662a71c952a8fbee2&ipo=images" },
    { name: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.pinimg.com%2Foriginals%2F20%2F28%2Fe5%2F2028e569dfda375456bc36172ab4cd5d.gif&f=1&nofb=1&ipt=be46a305aa00c19ed563480aa5f2938cb3fe506068c336100882e44426183261&ipo=images" },
    // { name: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fmedia1.tenor.com%2Fimages%2F65cf2fae3c9167c43e08c93c581b631d%2Ftenor.gif%3Fitemid%3D11918844&f=1&nofb=1&ipt=8a4468947d8952bff671ab0aecd94b77f5f1e45b9c75dc58b3600990359c0be2&ipo=images" },
    // { name: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.pinimg.com%2Foriginals%2F5f%2Fc4%2Fc0%2F5fc4c02ce36ead80f663fc506dee54fe.gif&f=1&nofb=1&ipt=f89c8c2fb564d40058eb1ca4e5ede89fb9279920b0a55e6f695fef6cb2bc21e5&ipo=images" },
    { name: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.gifer.com%2Forigin%2F99%2F99e3c0015ba0420f8472b5c32aa53f36_w200.gif&f=1&nofb=1&ipt=fd75dbc3ae993f05dfabb0f770d1c0666480aa4d05874d224ca06637e6a65430&ipo=images" },
    { name: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fmedia.giphy.com%2Fmedia%2FxT0GqKurRBk0V67B5K%2Fgiphy.gif&f=1&nofb=1&ipt=146ae54b654e4788c382e4dd7bc6037bce0d80a0e1d6c8439d8a3b9dee3fb474&ipo=images" },
    { name: 'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExeGVyYW85ZTNtZjdjY2trdjg3eHo3OXA5bTYwcXdnYjlpejZhN3czciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/TtTLEPsb3PvQQ/giphy.gif' },
    { name: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2F64.media.tumblr.com%2F2616e6d8d9ec5ebbb6606df1dc20a5c4%2Ftumblr_n7lkzubw6B1tre1zbo1_500.gif&f=1&nofb=1&ipt=188c5b1df8906f05e30c7064200230ba914ae0b9cb6271cf39f22b246dd6bbac&ipo=images" },
    // { name: "https://64.media.tumblr.com/33edc168d7374e77dc97805051fe97b8/tumblr_o1hcyjhxd21qdim8eo1_500.gifv" },
    { name: "https://c.tenor.com/a-pB-tiaSU0AAAAC/tenor.gif" },
    // { name: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.kinja-img.com%2Fgawker-media%2Fimage%2Fupload%2Fs--L5ZupMyC--%2Fc_scale%2Cf_auto%2Cfl_progressive%2Cq_80%2Cw_800%2F814825482726990921.gif&f=1&nofb=1&ipt=cb2bacb0ba5fb351ee5535a31e90ea172cf3728197d298fc892aa361d288e444&ipo=images" },
    // { name: 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExb2RqYXpzbDFzM2hncXdka3Y4M216bDI5M3pzdWFvcGY0Y2h2Mm4xNyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l3V0iU0s9WkauP5N6/giphy.gif' },
    // { name: 'images/rainbow-rings.gif' },
    // { name: 'images/industrial-waste.gif' },
    // { name: 'images/calling-all-cars.gif' },
    // { name: 'images/boogie-nights.gif' },
    { name: 'images/boston_skyline.gif' },
    { name: 'images/night_space_sky.gif' },
    { name: 'images/bladerunning_glassbreaking.gif' },
    { name: 'images/beach_burnout.gif' },
    // { name: 'images/animatrix_robot_riot1.gif' },
    { name: 'images/animatrix_robot_riot2.gif' },
    { name: 'images/sun_tracker.gif' },
    { name: 'images/retro_explo.gif' },
    { name: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fgiffiles.alphacoders.com%2F985%2F98533.gif&f=1&nofb=1&ipt=a9722ccae77692cc30621699148b6b984f35badf902b0f7140b5a84ef539b1a8&ipo=images" },

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
    if ( cycleRate > 2000 ) { cycleRateReduction = .75; }
    if ( cycleRate <= 2000 ) { cycleRateReduction = .9; }

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
