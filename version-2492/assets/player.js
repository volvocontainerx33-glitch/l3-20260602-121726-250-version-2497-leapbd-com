(function() {
  window.bindMoviePlayer = function(streamUrl) {
    var video = document.querySelector('.player-video');
    var cover = document.querySelector('.player-cover');
    var button = document.querySelector('.player-button');
    var hls = null;

    function begin() {
      if (!video || !streamUrl) {
        return;
      }
      if (cover) {
        cover.classList.add('is-hidden');
      }
      if (window.Hls && window.Hls.isSupported()) {
        if (hls) {
          hls.destroy();
        }
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
          video.play().catch(function() {});
        });
        hls.on(window.Hls.Events.ERROR, function(event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            hls.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.play().catch(function() {});
      }
    }

    if (button) {
      button.addEventListener('click', begin);
    }
    if (cover) {
      cover.addEventListener('click', begin);
    }
    if (video) {
      video.addEventListener('click', function() {
        if (!video.src) {
          begin();
        }
      });
    }
  };
})();
