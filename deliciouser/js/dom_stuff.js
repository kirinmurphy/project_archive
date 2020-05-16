// straight DOM stuff, need to make these knockoutified

(function (window,google,$,ko) {
  // make entire content area clickable for the li
  $('article')
    .live('click', function () {
      var href = $(this).find('.title').attr('href');
      window.open(href);
      return false;
    }).live('mouseenter',function () {
      $(this).find('h4 a').css('textDecoration','underline');
    }).live('mouseleave',function () {
      $(this).find('h4 a').css('textDecoration','none');
    });

  // don't underline the link when hovering on the tags
  $('article').find('.tags')
    .live('mouseenter', function () {
      $(this).closest('article').find('h4 a').css('textDecoration','none');
    }).live('mouseleave',function () {
      $(this).closest('article').find('h4 a').css('textDecoration','underline');
    });

  // jquery to change position of scroll on keyup down and up arrows
  // @fix - need to turn this into a custom binding
  var $tagmenu = $('.tag-menu');
  $('#filter-input').live('keyup',function (event) {
    if ( $tagmenu.is(':visible') ) {

      var menuheight = $tagmenu.outerHeight(true);

      var $hilightedTag = $tagmenu.find('.hilighted');

      // @fix - position includes height, why?
      var hilightedTagBottomOffset = $hilightedTag.position().top;

      if ( event.keyCode === 38) {
      } else if ( event.keyCode === 40 && hilightedTagBottomOffset > menuheight ) {
          $tagmenu.scrollTop(hilightedTagBottomOffset - menuheight);
      }
    }
  });

  $tagmenu.scrollTop(0);

})(window,google,jQuery,ko);


