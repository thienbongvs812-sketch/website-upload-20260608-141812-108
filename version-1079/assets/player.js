function initMoviePlayer(streamUrl) {
    var video = document.getElementById('moviePlayer');
    var shell = document.getElementById('playerShell');
    var button = document.getElementById('playButton');
    var hlsInstance = null;

    if (!video || !streamUrl) {
        return;
    }

    function attachStream() {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (video.getAttribute('src') !== streamUrl) {
                video.setAttribute('src', streamUrl);
            }
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            if (!hlsInstance) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            }
            return;
        }

        if (video.getAttribute('src') !== streamUrl) {
            video.setAttribute('src', streamUrl);
        }
    }

    function startPlayback() {
        attachStream();
        if (shell) {
            shell.classList.add('is-playing');
        }
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
            attempt.catch(function () {
                if (shell) {
                    shell.classList.remove('is-playing');
                }
            });
        }
    }

    if (button) {
        button.addEventListener('click', startPlayback);
    }

    video.addEventListener('play', function () {
        if (shell) {
            shell.classList.add('is-playing');
        }
    });

    video.addEventListener('pause', function () {
        if (shell && video.currentTime === 0) {
            shell.classList.remove('is-playing');
        }
    });

    video.addEventListener('ended', function () {
        if (shell) {
            shell.classList.remove('is-playing');
        }
    });

    attachStream();
}
