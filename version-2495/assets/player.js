import { H as Hls } from './hls-dru42stk.js';

function initPlayer(root) {
  const video = root.querySelector('video');
  const button = root.querySelector('[data-play-button]');
  const overlay = root.querySelector('[data-player-overlay]');
  const note = root.querySelector('[data-player-note]');
  const source = root.dataset.videoSrc;

  if (!video || !source) {
    return;
  }

  let hls = null;
  let initialized = false;

  function setNote(message) {
    if (note) {
      note.textContent = message;
    }
  }

  function initializeSource() {
    if (initialized) {
      return Promise.resolve();
    }

    initialized = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      setNote('播放器已使用浏览器原生 HLS 能力加载。');
      return Promise.resolve();
    }

    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });

      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (_, data) {
        if (data && data.fatal) {
          setNote('播放源加载遇到错误，可刷新页面或更换浏览器重试。');
        }
      });
      setNote('播放器已通过 HLS 模块加载播放源。');
      return Promise.resolve();
    }

    setNote('当前浏览器不支持 m3u8 播放，请使用最新版 Chrome、Edge、Safari 或移动端浏览器。');
    return Promise.resolve();
  }

  function playVideo() {
    initializeSource().then(function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      return video.play();
    }).catch(function () {
      setNote('浏览器阻止了自动播放，请点击视频控件中的播放按钮。');
    });
  }

  if (button) {
    button.addEventListener('click', playVideo);
  }

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}

document.querySelectorAll('[data-video-player]').forEach(initPlayer);
