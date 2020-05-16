
(function($) {

  $.fn.displayEulerTests = function() {

    var settings = {
      idPrefix:'question'
    }

    return this.each(function(){
      var $list = $('<ul/>');

      $.each(eulerTests.questions, function(index, item){

        var $question = $('<div/>', { html:'<b>'+ item.id + ':</b> ' + item.question }).attr('class','question');

        if ( item.links !== undefined && item.links.length > 0 ) {
          var $links = $('<div/>').attr('class','links');
          $.each(item.links, function(index,item) {
            $('<a/>', { text:item.label, href:item.url, target:'_blank' })
              .appendTo($links);
          })
          $question.append($links)
        }

        var $answer = $('<span/>', { text:'Show Answer' }).attr('class','answer undisplayed')
          .click(function(){
            var $this = $(this);
            if ( $this.hasClass('undisplayed') ) {

              console.time(('question' + item.id +': '));

              $this.text('Calculating...').addClass('loading')
                .removeClass('undisplayed');

              /* need setTimeout to allow for loading msg, or function execution may freeze UI before displayed */
              setTimeout(function(){
                var answer = item.fn();

                console.timeEnd(('question' + item.id +': '));

                if ( answer === undefined ) {
                  $this.addClass('noanswer').text('Not Answered');
                } else if ( answer === eulerTests.answers[item.id-1] ) {
                  $this.addClass('correct').text(answer);
                } else {
                  $this.addClass('incorrect').text(answer);
                }
                $this.removeClass('loading');

              },50);

              return false;
            }
          });

        $('<li/>', { id:settings.idPrefix + item.id })
          .append( $question )
          .append( $answer )
          .prependTo($list);  // prepend loads in descending order
      });

      var $listitems = $list.children('li');

      /* Auto execute functions for the this IDs */
      $.each(eulerTests.autoAnswerThese, function(index,item){
        $list.find('#'+ settings.idPrefix + item )
          .find('.answer').click();
      });

      // Create link to answer all questions
      var $showAll = $('<a/>', { href:'#', text:'Show All Answers' }).addClass('showall')
        .click(function(){
          var $this = $(this);
          if (!$this.hasClass('disabled') ) {
            $this.addClass('disabled');
            $list.find('.undisplayed').click();
          }
          return false;
        });

      // Adds content to parent DOM element (plugin target)
      $(this).append($list.add($showAll));
    })
  };

})(jQuery);