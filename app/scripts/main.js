/* global jQuery, document, FastClick, log, ga */
jQuery(document).ready(function($){
  'use strict';

  // set logging level
  log.setLevel(log.levels.TRACE);

  // remove click delay on touch devices
  FastClick.attach(document.body);

  // initialize Facebook SDK
  window.fbAsyncInit = function (){
    FB.init({
      appId: '671431436258759',
      status: true,
      xfbml: true,
      version: 'v2.0'
    });
  };

  // handle sharing
  $('[data-control-action="share-facebook"]').on('click', onFacebookShare);
  $('[data-control-action="share-twitter"]').on('click', onTwitterShare);

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

  // track audio downloads, plays
  $('#music').on('click', '[data-control-action="download"]', trackAudioDownload);
  $('.audio-player').each(function(){
    $(this).one('playing', trackAudioPlay);
  });

  // track video plays
  $('.video-player').each(function(){
    $(this).one('playing', trackVideoPlay);
  });

  // track routine downloads
  $('body.guidelines #welcome').on('click', '[data-control-action="download"]', trackGuidelinesDownload);

  function trackAudioDownload (e){
    var $track = $(e.target)
      , type = 'Audio'
      , description = 'Download'
      , label = $track.attr('href');

    ga('send', 'event', type, description, label);
  }

  function trackAudioPlay(e){
    var $track = $(e.target)
      , type = 'Audio'
      , description = 'Play'
      , label = $track.get(0).currentSrc;

    ga('send', 'event', type, description, label);
  }

  function trackVideoPlay(e){
    var $video = $(e.target)
      , type = 'Video'
      , description = 'Play'
      , label = $video.get(0).currentSrc;

    ga('send', 'event', type, description, label);
  }

  function trackGuidelinesDownload (e){
    var $doc = $(this)
      , type = 'Documents'
      , description = 'Download'
      , label = $doc.attr('href');

    ga('send', 'event', type, description, label);
  }

  function onFacebookShare (e){
    e.preventDefault();
    var url = $(this).attr('data-share-url');

    FB.ui({
      method: 'share',
      href: url
    }, function (response){
      if (response && !response.error_code){
        ga('send', {
          hitType: 'social',
          socialNetwork: 'Facebook',
          socialAction: 'Share',
          socialTarget: url,
          page: document.title
        });
      }
    });
  }

  function onTwitterShare (e){
    e.preventDefault();

    var $this = $(this)
      , params = {}
      , baseUrl = 'https://twitter.com/share'
      , tweetWindow = null
      , tweetWindowUrl = baseUrl + '?'
      , tweetWindowOptions = 'width=320,height=568,left=' + ($(window).width() - 320) / 2 + ',top=' + ($(window).height() - 568) / 2
      , url = $this.attr('data-tweet-url');

    params.url = url;
    params.text = $this.attr('data-tweet-text');
    params.hashtags = $this.attr('data-hashtags') || '';
    params.related = $this.attr('data-related-accounts') || '';

    tweetWindowUrl += $.param(params);
    tweetWindow = window.open(tweetWindowUrl, '_blank', tweetWindowOptions);

    ga('send', {
      hitType: 'social',
      socialNetwork: 'Twitter',
      socialAction: 'Tweet',
      socialTarget: params.url,
      page: document.title
    });
  }

});
