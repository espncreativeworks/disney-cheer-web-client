/* global jQuery, document, FastClick, log */
jQuery(document).ready(function($){
  'use strict';

  // set logging level
  log.setLevel(log.levels.TRACE);

  // remove click delay on touch devices
  FastClick.attach(document.body);

  // play audio tracks
  $('#music').on('click', '[data-control-action="toggle-audio"]', function(e){
    var $this = $(e.target)
      , player = $this.siblings('.audio-player')[0];

    if (player.paused){
      $('#music .audio-player').each(function(){
        $(this).get(0).pause();
      });
      $('#music [data-control-action="toggle-audio"]').each(function(){
        $(this).text('Listen');
      });
      player.play();
      $this.text('Pause');
    } else {
      player.pause();
      $this.text('Listen');
    }
  });

});
