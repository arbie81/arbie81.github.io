// Robust Persistent Audio Player
(function() {
  // Audio configuration
  const AUDIO_CONFIG = {
    source: 'audiosample.mp3',
    storageKeys: {
      playing: 'arb_audio_playing',
      time: 'arb_audio_time'
    }
  };

  // Singleton audio player
  class PersistentAudioPlayer {
    constructor() {
      // Ensure single instance
      if (PersistentAudioPlayer.instance) {
        return PersistentAudioPlayer.instance;
      }
      PersistentAudioPlayer.instance = this;

      // Initialize audio element
      this.audio = this.createAudioElement();
      this.playerUI = this.createPlayerUI();
      
      // Bind methods
      this.togglePlayback = this.togglePlayback.bind(this);
      this.updateUIState = this.updateUIState.bind(this);
      this.saveState = this.saveState.bind(this);

      // Set up event listeners
      this.setupEventListeners();

      // Restore previous state
      this.restoreState();
    }

    createAudioElement() {
      let audio = document.getElementById('persistentAudio');
      if (!audio) {
        audio = document.createElement('audio');
        audio.id = 'persistentAudio';
        audio.src = AUDIO_CONFIG.source;
        audio.style.display = 'none';
        document.body.appendChild(audio);
      }
      return audio;
    }

    createPlayerUI() {
      let playerContainer = document.getElementById('audioPlayer');
      if (!playerContainer) {
        playerContainer = document.createElement('div');
        playerContainer.id = 'audioPlayer';
        playerContainer.className = 'audio-player';
        
        playerContainer.innerHTML = `
          <div class="dotted-circle">
            <div class="play-triangle" id="playIcon"></div>
            <div class="pause-bars" id="pauseIcon"></div>
          </div>
        `;
        
        document.body.appendChild(playerContainer);
        playerContainer.addEventListener('click', this.togglePlayback);
      }
      return playerContainer;
    }

    setupEventListeners() {
      // Persistent state saving
      this.audio.addEventListener('timeupdate', this.saveState);
      this.audio.addEventListener('ended', () => {
        this.updateUIState(false);
        localStorage.setItem(AUDIO_CONFIG.storageKeys.playing, 'false');
      });

      // Cross-page state preservation
      window.addEventListener('beforeunload', this.saveState);
    }

    togglePlayback() {
      if (this.audio.paused) {
        this.play();
      } else {
        this.pause();
      }
    }

    play() {
      this.audio.play()
        .then(() => {
          this.updateUIState(true);
          localStorage.setItem(AUDIO_CONFIG.storageKeys.playing, 'true');
        })
        .catch(error => {
          console.error('Playback failed:', error);
          this.updateUIState(false);
        });
    }

    pause() {
      this.audio.pause();
      this.updateUIState(false);
      localStorage.setItem(AUDIO_CONFIG.storageKeys.playing, 'false');
    }

    updateUIState(isPlaying) {
      const playIcon = document.getElementById('playIcon');
      const pauseIcon = document.getElementById('pauseIcon');

      if (playIcon && pauseIcon) {
        playIcon.style.display = isPlaying ? 'none' : 'block';
        pauseIcon.style.display = isPlaying ? 'block' : 'none';
      }
    }

    restoreState() {
      const wasPlaying = localStorage.getItem(AUDIO_CONFIG.storageKeys.playing) === 'true';
      const savedTime = parseFloat(localStorage.getItem(AUDIO_CONFIG.storageKeys.time) || '0');

      // Set audio time first
      if (savedTime > 0) {
        try {
          this.audio.currentTime = savedTime;
        } catch (e) {
          console.error('Could not set saved audio time:', e);
        }
      }

      // Then attempt to play if it was playing
      if (wasPlaying) {
        this.play();
      } else {
        this.updateUIState(false);
      }
    }

    saveState() {
      if (this.audio) {
        localStorage.setItem(AUDIO_CONFIG.storageKeys.time, this.audio.currentTime.toString());
        localStorage.setItem(
          AUDIO_CONFIG.storageKeys.playing, 
          (!this.audio.paused && !this.audio.ended).toString()
        );
      }
    }
  }

  // Initialize on page load
  document.addEventListener('DOMContentLoaded', () => {
    new PersistentAudioPlayer();
  });
})();
