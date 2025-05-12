// Universal Persistent Audio Player
(function() {
  // Configuration
  const AUDIO_CONFIG = {
    source: 'audiosample.mp3',
    storageKeys: {
      playing: 'arb_audio_playing',
      time: 'arb_audio_time'
    }
  };

  // Global audio and UI elements
  let audio = null;
  let playIcon = null;
  let pauseIcon = null;
  let playerContainer = null;

  // Initialize function
  function initAudioPlayer() {
    // Create or find audio element
    audio = document.getElementById('persistentAudio');
    if (!audio) {
      audio = document.createElement('audio');
      audio.id = 'persistentAudio';
      audio.src = AUDIO_CONFIG.source;
      audio.style.display = 'none';
      document.body.appendChild(audio);
    }

    // Create or find player UI
    playerContainer = document.getElementById('audioPlayer');
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
    }

    // Find UI elements
    playIcon = document.getElementById('playIcon');
    pauseIcon = document.getElementById('pauseIcon');

    // Add click event listener
    playerContainer.removeEventListener('click', togglePlayback);
    playerContainer.addEventListener('click', togglePlayback);

    // Restore previous state
    restoreAudioState();

    // Setup additional event listeners
    setupEventListeners();
  }

  // Toggle playback function
  function togglePlayback() {
    if (!audio) return;

    if (audio.paused) {
      playAudio();
    } else {
      pauseAudio();
    }
  }

  // Play audio
  function playAudio() {
    if (!audio) return;

    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise.then(() => {
        updateUIState(true);
        saveAudioState();
      }).catch(error => {
        console.error('Playback failed:', error);
        updateUIState(false);
      });
    }
  }

  // Pause audio
  function pauseAudio() {
    if (!audio) return;

    audio.pause();
    updateUIState(false);
    saveAudioState();
  }

  // Update UI state
  function updateUIState(isPlaying) {
    if (playIcon && pauseIcon) {
      playIcon.style.display = isPlaying ? 'none' : 'block';
      pauseIcon.style.display = isPlaying ? 'block' : 'none';
    }
  }

  // Save audio state to localStorage
  function saveAudioState() {
    if (!audio) return;

    localStorage.setItem(
      AUDIO_CONFIG.storageKeys.playing, 
      (!audio.paused && !audio.ended).toString()
    );
    localStorage.setItem(
      AUDIO_CONFIG.storageKeys.time, 
      audio.currentTime.toString()
    );
  }

  // Restore audio state from localStorage
  function restoreAudioState() {
    if (!audio) return;

    // Restore time
    const savedTime = parseFloat(
      localStorage.getItem(AUDIO_CONFIG.storageKeys.time) || '0'
    );
    if (savedTime > 0) {
      try {
        audio.currentTime = savedTime;
      } catch (e) {
        console.error('Could not set saved audio time:', e);
      }
    }

    // Restore playing state
    const wasPlaying = localStorage.getItem(
      AUDIO_CONFIG.storageKeys.playing
    ) === 'true';

    if (wasPlaying) {
      playAudio();
    } else {
      updateUIState(false);
    }
  }

  // Setup event listeners
  function setupEventListeners() {
    if (!audio) return;

    // Handle audio ending
    audio.addEventListener('ended', () => {
      updateUIState(false);
      localStorage.setItem(AUDIO_CONFIG.storageKeys.playing, 'false');
    });

    // Save state periodically and on page events
    audio.addEventListener('timeupdate', saveAudioState);
    
    window.addEventListener('beforeunload', saveAudioState);
    
    // Additional mobile-friendly state preservation
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        saveAudioState();
      }
    });
  }

  // Initialize on page load
  function init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAudioPlayer);
    } else {
      initAudioPlayer();
    }
  }

  // Start initialization
  init();
})();
