document.addEventListener("DOMContentLoaded", function () {
    const audio = document.getElementById('bgAudio');
    const btn = document.getElementById('musicBtn');
    const icon = document.getElementById('musicIcon');
    const volSlider = document.getElementById('volSlider');

    const playlist = [
        "music/song1.mp3",
        "music/song2.mp3",
        "music/song3.mp3"
    ];

    let currentSongIdx = parseInt(localStorage.getItem('currentSongIdx')) || 0;
    let savedTime = parseFloat(localStorage.getItem('musicTime')) || 0;
    let savedVol = parseFloat(localStorage.getItem('musicVol')); 
    let shouldPlay = localStorage.getItem('musicPlaying') === 'true';

    if (isNaN(savedVol)) savedVol = 0.1;

    if (playlist.length > 0) {
        if (currentSongIdx >= playlist.length) currentSongIdx = 0;

        audio.src = playlist[currentSongIdx];
        audio.volume = savedVol;
        volSlider.value = savedVol;
        
        audio.addEventListener('loadedmetadata', function() {
            if (savedTime < audio.duration) {
                audio.currentTime = savedTime;
            }
        });
    }

    function updateIcon(isPlaying) {
        if (isPlaying) {
            icon.classList.remove('bi-volume-mute-fill');
            icon.classList.add('bi-volume-up-fill');
        } else {
            icon.classList.remove('bi-volume-up-fill');
            icon.classList.add('bi-volume-mute-fill');
        }
    }

    btn.addEventListener('click', function() {
        if (audio.paused) {
            audio.play().then(() => {
                updateIcon(true);
                localStorage.setItem('musicPlaying', 'true');
            }).catch(error => {
                if(error.name === "NotSupportedError" || audio.error) {
                    alert("Error: File audio tidak ditemukan atau format salah.");
                }
            });
        } else {
            audio.pause();
            updateIcon(false);
            localStorage.setItem('musicPlaying', 'false');
        }
    });

    if (shouldPlay) {
        audio.play().then(() => updateIcon(true)).catch(() => {
            updateIcon(false);
        });
    } else {
        updateIcon(false);
    }

    audio.addEventListener('ended', function () {
        currentSongIdx++;
        if (currentSongIdx >= playlist.length) currentSongIdx = 0;
        
        localStorage.setItem('currentSongIdx', currentSongIdx);
        localStorage.setItem('musicTime', 0);
        
        audio.src = playlist[currentSongIdx];
        audio.load();
        audio.play().then(() => updateIcon(true));
    });

    audio.addEventListener('timeupdate', () => {
        if(audio.currentTime > 0) localStorage.setItem('musicTime', audio.currentTime);
    });

    volSlider.addEventListener('input', function () {
        audio.volume = this.value;
        localStorage.setItem('musicVol', this.value);
        if (audio.volume === 0) updateIcon(false);
        else if (!audio.paused) updateIcon(true);
    });
});