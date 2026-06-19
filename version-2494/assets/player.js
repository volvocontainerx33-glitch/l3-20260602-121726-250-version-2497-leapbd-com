(function () {
  window.bindPlayer = function (videoId, buttonId, overlayId, streamUrl) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var overlay = document.getElementById(overlayId);
    var prepared = false;
    var hlsInstance = null;

    function prepare() {
      if (!video || prepared) {
        return;
      }
      prepared = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function play() {
      prepare();
      if (overlay) {
        overlay.classList.add("hidden");
      }
      if (video) {
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {
            if (overlay) {
              overlay.classList.remove("hidden");
            }
          });
        }
      }
    }

    if (button) {
      button.addEventListener("click", play);
    }
    if (overlay) {
      overlay.addEventListener("click", play);
    }
    if (video) {
      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("hidden");
        }
      });
      video.addEventListener("pause", function () {
        if (video.currentTime === 0 && overlay) {
          overlay.classList.remove("hidden");
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  };
})();
