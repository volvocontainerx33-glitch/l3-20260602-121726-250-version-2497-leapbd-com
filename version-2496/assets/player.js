function initMoviePlayer(source) {
    var root = document.querySelector("[data-player]");
    if (!root) {
        return;
    }
    var video = root.querySelector("video");
    var startButton = root.querySelector("[data-player-start]");
    var toggleButton = root.querySelector("[data-player-toggle]");
    var muteButton = root.querySelector("[data-player-mute]");
    var fullButton = root.querySelector("[data-player-fullscreen]");
    var message = root.querySelector("[data-player-message]");
    var mediaReady = false;
    var hls = null;

    function showMessage(text) {
        if (message) {
            message.textContent = text;
            message.classList.add("is-visible");
        }
    }

    function loadMedia() {
        if (mediaReady || !video) {
            return;
        }
        mediaReady = true;
        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (!data || !data.fatal) {
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                    return;
                }
                if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                    return;
                }
                showMessage("播放暂时不可用，请稍后重试");
            });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else {
            showMessage("播放暂时不可用，请更换浏览器重试");
        }
    }

    function playVideo() {
        loadMedia();
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
            playPromise.catch(function () {
                showMessage("点击页面后可继续播放");
            });
        }
    }

    function togglePlay() {
        if (video.paused) {
            playVideo();
        } else {
            video.pause();
        }
    }

    function syncState() {
        var playing = !video.paused && !video.ended;
        root.classList.toggle("is-playing", playing);
        if (toggleButton) {
            toggleButton.textContent = playing ? "暂停" : "▶";
        }
    }

    if (startButton) {
        startButton.addEventListener("click", playVideo);
    }
    if (toggleButton) {
        toggleButton.addEventListener("click", togglePlay);
    }
    if (muteButton) {
        muteButton.addEventListener("click", function () {
            video.muted = !video.muted;
            muteButton.textContent = video.muted ? "静音" : "声音";
        });
    }
    if (fullButton) {
        fullButton.addEventListener("click", function () {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else if (root.requestFullscreen) {
                root.requestFullscreen();
            }
        });
    }
    video.addEventListener("click", togglePlay);
    video.addEventListener("play", syncState);
    video.addEventListener("pause", syncState);
    video.addEventListener("ended", syncState);
    loadMedia();
    syncState();
}
