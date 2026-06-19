import { H as Hls } from './hls.js';

function setStatus(shell, message) {
  var status = shell.querySelector('[data-player-status]');

  if (status) {
    status.textContent = message;
  }
}

function attachPlayer(video) {
  var source = video.getAttribute('data-src');
  var shell = video.closest('.player-shell');
  var playButton = shell ? shell.querySelector('[data-play-button]') : null;

  if (!source || !shell) {
    return;
  }

  function markReady() {
    shell.classList.add('is-ready');
    setStatus(shell, '播放源已就绪');
  }

  if (Hls.isSupported()) {
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });

    hls.loadSource(source);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      markReady();
    });

    hls.on(Hls.Events.ERROR, function (eventName, data) {
      if (data && data.fatal) {
        setStatus(shell, '视频加载失败，请稍后重试');
      }
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    video.addEventListener('loadedmetadata', markReady, { once: true });
  } else {
    setStatus(shell, '当前浏览器不支持 HLS 播放');
  }

  function togglePlay() {
    if (video.paused) {
      video.play().then(function () {
        shell.classList.add('is-playing');
      }).catch(function () {
        setStatus(shell, '浏览器阻止了自动播放，请再次点击视频');
      });
    } else {
      video.pause();
      shell.classList.remove('is-playing');
    }
  }

  if (playButton) {
    playButton.addEventListener('click', togglePlay);
  }

  video.addEventListener('play', function () {
    shell.classList.add('is-playing');
  });

  video.addEventListener('pause', function () {
    shell.classList.remove('is-playing');
  });
}

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.hls-player').forEach(attachPlayer);
});
