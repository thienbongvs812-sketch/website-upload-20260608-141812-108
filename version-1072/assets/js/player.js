document.addEventListener('DOMContentLoaded', function () {
    var players = document.querySelectorAll('[data-movie-player]');

    players.forEach(function (player) {
        initializePlayer(player);
    });
});

function initializePlayer(container) {
    var video = container.querySelector('video');
    var overlay = container.querySelector('[data-player-overlay]');
    var status = container.querySelector('[data-player-status]');
    var playButton = container.querySelector('[data-player-play]');
    var videoSource = video ? video.getAttribute('data-video-src') : '';

    if (!video || !videoSource) {
        updateStatus(status, '当前影片暂未配置播放源。');
        return;
    }

    function attachSource() {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = videoSource;
            updateStatus(status, '播放源已就绪，点击播放按钮即可观看。');
            return;
        }

        loadHlsLibrary()
            .then(function () {
                if (!window.Hls || !window.Hls.isSupported()) {
                    updateStatus(status, '当前浏览器暂不支持 HLS 播放，请更换 Chrome、Edge、Safari 或 Firefox。');
                    return;
                }

                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });

                hls.loadSource(videoSource);
                hls.attachMedia(video);

                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    updateStatus(status, '播放源已就绪，点击播放按钮即可观看。');
                });

                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        updateStatus(status, '视频加载失败，请刷新页面或稍后重试。');
                    }
                });
            })
            .catch(function () {
                updateStatus(status, '播放器组件加载失败，请检查网络后重试。');
            });
    }

    function startPlayback() {
        var playPromise = video.play();

        if (playPromise && typeof playPromise.then === 'function') {
            playPromise
                .then(function () {
                    if (overlay) {
                        overlay.classList.add('hidden');
                    }
                })
                .catch(function () {
                    updateStatus(status, '浏览器阻止了自动播放，请再次点击播放按钮。');
                });
        } else if (overlay) {
            overlay.classList.add('hidden');
        }
    }

    if (playButton) {
        playButton.addEventListener('click', startPlayback);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            startPlayback();
        } else {
            video.pause();
        }
    });

    video.addEventListener('play', function () {
        if (overlay) {
            overlay.classList.add('hidden');
        }
    });

    video.addEventListener('pause', function () {
        if (overlay) {
            overlay.classList.remove('hidden');
        }
    });

    video.addEventListener('error', function () {
        updateStatus(status, '视频播放遇到错误，请刷新页面或稍后再试。');
    });

    attachSource();
}

function updateStatus(statusElement, message) {
    if (statusElement) {
        statusElement.textContent = message;
    }
}

function loadHlsLibrary() {
    if (window.Hls) {
        return Promise.resolve();
    }

    if (window.__hlsLoadingPromise) {
        return window.__hlsLoadingPromise;
    }

    window.__hlsLoadingPromise = new Promise(function (resolve, reject) {
        var script = document.createElement('script');
        var timeout = window.setTimeout(function () {
            reject(new Error('HLS library loading timeout'));
        }, 12000);

        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
        script.async = true;

        script.onload = function () {
            window.clearTimeout(timeout);
            resolve();
        };

        script.onerror = function () {
            window.clearTimeout(timeout);
            reject(new Error('HLS library loading failed'));
        };

        document.head.appendChild(script);
    });

    return window.__hlsLoadingPromise;
}
