(function () {

  $('window').resize(function () {
    console.log('ee');
    setFrameHeight();
  });

  function setFrameHeight () {
    var height = $(window).height();
    $('section.title').css('height', height);
    $('section:not(.title)').css('min-height', height);
  }


  // ---------------------------------------------- //
  showSection($('section:first'));

  $('body').on('keydown', function (event) {
    var $currentSection = $('section:visible');
    switch (event.keyCode) {
      case 37: goBack($currentSection); break;
      case 39: goNext($currentSection); break;
    };
  });

  function goBack ($currentSection) {
    var $possNewSection = $currentSection.prev();
    console.log('BACK', $possNewSection.find('h1').text());
    if ( $possNewSection.length ) { showSection($possNewSection); }
  }

  function goNext ($currentSection) {
    var $possNewSection = $currentSection.next();
    console.log('NEXT', $possNewSection.find('h1').text());
    if ( $possNewSection.length ) { showSection($possNewSection); }
  }

  function showSection ($newSection) {
    $('section').hide();
    console.log('afta', $newSection.find('h1').text());
    $newSection.show();
    setFrameHeight();
  }

  $('#view').show();

})();

