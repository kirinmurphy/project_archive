(function() {

  checkForUserAgent();

  var $pageWrapper = $('.page-wrapper');

  $pageWrapper.find('.slideshow').backdropSlideshow({ delay: 10000 });

  setFrameHeights();
  $(window).on('resize', function() { setFrameHeights(); });

  $pageWrapper.show();

  function setFrameHeights() {
    var windowHeight = $(window).height()
    $('[data-frame]').css('height', windowHeight);
  };

  function checkForUserAgent () {
    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile/i.test(navigator.userAgent)
    var isChrome = /Chrome/i.test(navigator.userAgent)
    if (isMobile) { $('body').addClass('mobile-device'); }
    if (!isMobile && isChrome) { $('body').addClass('desktop-chrome'); }
  };

})();
