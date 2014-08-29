/*global window, document, jQuery, log, Mimer, espncw */
jQuery(document).ready(function ($){
  'use strict';

  var opts = {}
    , isValidMimeType = function (file){
      var validMimeTypes, mimeType;

      validMimeTypes = [
        'video/mov',
        'video/quicktime', 'video/x-quicktime',
        'video/mp4',
        'video/mpeg',
        'video/m4v', 'video/x-m4v',
        'video/wmv', 'video/x-ms-wmv',
        'video/ogv', 'audio/ogg',
        'video/3pp',
        'video/webm', 'video/x-webm'
      ];

      if (!file.type || file.type === ''){
        mimeType = Mimer(file.name);
      } else {
        mimeType = file.type;
      }

      log.info(mimeType);
      log.info(file.type);
      log.info(validMimeTypes.indexOf(mimeType));

      return validMimeTypes.indexOf(mimeType) > -1;
    }
    , isValidFileSize = function (file){
      var maxFileSize = 15728460; // 15MB
      if (!file.size) {
        return false;
      }
      return file.size <= maxFileSize;
    }
    , updateProgress = function ($el, completed){
      var _completed = Math.floor((completed * 100), 10);
      $el.css({ width: _completed.toString() + '%' });
    }
    , onselectvideo = function (){
      $(this).prev('input[type="file"]').trigger('click');
    }
    , onfilechange = function (e){
      var _input, _file, _fileReader, $feedbackContainer, $thumbnail, $message, $progress, $submitBtn, _loaded, _minLoaded; //, $video, $canvas;
      _loaded = 0;
      _minLoaded = 0.02;
      _input = e.originalEvent.target;
      _file = _input.files[0];
      _fileReader = new FileReader();
      $feedbackContainer = $('.feedback-container').first();
      $thumbnail = $feedbackContainer.find('.thumbnail-placeholder').first();
      $message = $feedbackContainer.find('.message').first();
      $progress = $feedbackContainer.find('.progress').first();
      $submitBtn = $('[data-control-action="submit-video"]');

      _fileReader.onloadstart = function (){
        $feedbackContainer.removeClass('has-message has-file-info').addClass('has-progress');
        updateProgress($progress, _minLoaded);
      };

      _fileReader.onprogress = function (evt){
        if (evt.lengthComputable){
          _loaded = evt.loaded / evt.total;
          if (_loaded < 100){
            updateProgress($progress, _loaded);
          }
        }
      };

      _fileReader.onerror = function (){
        $feedbackContainer.removeClass('has-progress has-file-info').addClass('has-message');
        $message.text('An error occured. Please try again');
        $submitBtn.attr('disabled', true);
      };

      _fileReader.onabort = function (){
        $feedbackContainer.removeClass('has-progress has-file-info').addClass('has-message');
        $message.text('Operation aborted. Please try again');
        $submitBtn.attr('disabled', true);
      };

      _fileReader.onload = function (){
        var _url, _mimeType, _validMimeType, _validFileSize, $fileInfo; //, $source; //, _thumbnailURL;
        _url = _fileReader.result;
        _validMimeType = isValidMimeType(_file);
        _validFileSize = isValidFileSize(_file);
        _mimeType = _file.type === '' ? Mimer(_file.name) : _file.type;

        log.info(_file);

        if (_validMimeType && _validFileSize){
          $fileInfo = $feedbackContainer.find('.file-info');
          $fileInfo.find('#file-name').text(_file.name);
          $fileInfo.find('#file-size').text(window.espncw.humanReadable.fromBytes(_file.size));
          $feedbackContainer.removeClass('has-progress has-message').addClass('has-file-info');
          $submitBtn.removeAttr('disabled');
        } else if (!_validMimeType){
          $message.text('Invalid file type. Please select a video with a valid file type.');
          $feedbackContainer.removeClass('has-progress has-file-info').addClass('has-message');
          $submitBtn.attr('disabled', true);
        } else if (!_validFileSize){
          $message.text('Invalid file size. Please select a smaller video.');
          $feedbackContainer.removeClass('has-progress has-file-info').addClass('has-message');
          $submitBtn.attr('disabled', true);
        }

        updateProgress($progress, 0);
      };

      _fileReader.onloadend = function (){
        updateProgress($progress, 0);
      };

      _fileReader.readAsDataURL(_file);

    }
    , onTransloaditStart = function (assembly){
      log.info('[transloadit Start]');
      log.info(assembly);
    }, onTransloaditFileSelect = function (fileName, $fileInputField){
      log.info('[transloadit FileSelect]');
      log.info(fileName);
      log.info($fileInputField.get(0));
    }, onTransloaditProgress = function (bytesReceived, bytesExpected){
      log.info('[transloadit Progress](' + (Math.round(bytesReceived / bytesExpected) * 100) + '%)');
    }, onTransloaditUpload = function (upload){
      log.info('[transloadit Upload]');
      log.info(upload);
    }, onTransloaditResult = function (step, result){
      log.info('[transloadit Result](' + step + ')');
      log.info(result);
    }, onTransloaditCancel = function (){
      log.warn('[transloadit Canceled]');
    }, onTransloaditError = function (assembly){
      log.error('[transloadit Error]');
      log.info(assembly);
    }, onTransloaditSuccess = function(assembly){
      log.info('[transloadit Success]');
      log.info(assembly);
    };

  function init(){
    if ($('body').hasClass('upload')){

      var $form = $('#video-upload');
      opts.transloadit = {
        modal: true,
        wait: false,
        params: {
          auth: {
            key: '49da6390d7ad11e384e6098c9e639d65',
            max_size: 15728460
          },
          template_id: '083fea402ef111e490f5a527a6105c1c',
          notify_url: $form.attr('data-notify-url')
        },
        fields: true,
        processZeroFiles: false,
        debug: false,
        onStart: onTransloaditStart,
        onFileSelect: onTransloaditFileSelect,
        onProgress: onTransloaditProgress,
        onUpload: onTransloaditUpload,
        onResult: onTransloaditResult,
        onCancel: onTransloaditCancel,
        onError: onTransloaditError,
        onSuccess: onTransloaditSuccess
      };
      $form.transloadit(opts.transloadit);

      // attach for tab + enter accessibility
      $('[data-control-action="select-video"]').on('click', onselectvideo);

      $('input[type="file"][name="video-file"]').on('change', onfilechange);

      $('input[type="file"][name="video-file"]').on('mouseenter', function(){
        $(this).next('.btn').addClass('hover');
      });

      $('input[type="file"][name="video-file"]').on('mouseleave', function(){
        $(this).next('.btn').removeClass('hover');
      });

      $('input[type="file"][name="video-file"]').on('focusin', function(){
        $(this).next('.btn').addClass('focus');
      });

      $('input[type="file"][name="video-file"]').on('focusout', function(){
        $(this).next('.btn').removeClass('focus');
      });

      $('input[type="file"][name="video-file"]').on('mousedown', function(){
        $(this).next('.btn').addClass('active');
      });

      $('input[type="file"][name="video-file"]').on('mouseup', function(){
        $(this).next('.btn').removeClass('active');
      });
    }
    log.info('upload.js initialized');
  }

  init();
});
