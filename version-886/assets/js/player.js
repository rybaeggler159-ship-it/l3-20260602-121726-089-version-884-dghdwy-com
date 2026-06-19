(() => {
  const startButton = document.querySelector('[data-video-target]');

  if (!startButton) {
    return;
  }

  const video = document.getElementById(startButton.dataset.videoTarget);
  const stream = startButton.dataset.stream;

  if (!video || !stream) {
    return;
  }

  const start = async () => {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (globalThis.Hls && globalThis.Hls.isSupported()) {
      const hls = new globalThis.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(stream);
      hls.attachMedia(video);
    } else {
      video.src = stream;
    }

    startButton.classList.add('is-hidden');

    try {
      await video.play();
    } catch (error) {
      startButton.classList.remove('is-hidden');
    }
  };

  startButton.addEventListener('click', start, { once: false });
})();
