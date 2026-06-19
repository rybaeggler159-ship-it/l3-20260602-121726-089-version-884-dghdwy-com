import { H as Hls } from './hls.js';

export function initPlayer(source) {
  const stage = document.querySelector('[data-player-stage]');
  if (!stage) {
    return;
  }
  const video = stage.querySelector('video');
  const cover = stage.querySelector('[data-player-cover]');
  const button = stage.querySelector('[data-play-button]');
  let loaded = false;

  function loadVideo() {
    if (!video || loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (Hls && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }
  }

  function playVideo() {
    loadVideo();
    if (cover) {
      cover.classList.add('is-hidden');
    }
    const attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(() => {});
    }
  }

  if (button) {
    button.addEventListener('click', playVideo);
  }
  if (cover) {
    cover.addEventListener('click', playVideo);
  }
  if (video) {
    video.addEventListener('click', () => {
      if (!loaded) {
        playVideo();
      }
    });
  }
}
