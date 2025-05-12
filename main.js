// Enhanced persistent audio player that works across page navigation
document.addEventListener('DOMContentLoaded', function() {
  // More robust audio state retrieval
  const audioState = {
    wasPlaying: localStorage.getItem('audioPlaying') === 'true',
    currentTime: parseFloat(localStorage.getItem('audioTime') || '0'),
    audioSource: 'audiosample.mp3'
  };
  
  console.log('Page loaded. Audio state:', audioState);
  
  // Create audio player
  const audioPlayer = createAudioPlayer(
    audioState.wasPlaying, 
    audioState.currentTime, 
    audioState.audioSource
  );
});

function createAudioPlayer(shouldPlay, startTime, audioSource) {
  // Create player elements
  const playerContainer = document.createElement('div');
  playerContainer.className = 'audio-player';
  playerContainer.id = 'audioPlayer';
  
  playerContainer.innerHTML = `
    <div class="dotted-circle">
      <div class="play-triangle" id="playIcon"></div>
      <div class="pause-bars" id="pauseIcon"></div>
    </div>
  `;
  
  // Create or retrieve existing audio element
  let audio = document.getElementById('persistentAudio');
  if (!audio) {
    audio = document.createElement('audio');
    audio.id = 'persistentAudio';
    audio.style.display = 'none';
    document.body.appendChild(audio);
  }
  
  // Set the audio source
  audio.src = audioSource;
  
  // Ensure the player is only added once
  if (!document.getElementById('audioPlayer')) {
    document.body.appendChild(playerContainer);
  }
  
  // Get UI elements
  const playIcon = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');
  
  // Normalize initial state
  function updateUIState(isPlaying) {
    playIcon.style.display = isPlaying ? 'none' : 'block';
    pauseIcon.style.display = isPlaying ? 'block' : 'none';
  }
  
  // Initial UI state
  updateUIState(shouldPlay);
  
  // Audio loading and initial playback
  audio.addEventListener('loadeddata', function() {
    console.log('Audio loaded successfully');
    
    // Set the saved time position
    if (startTime > 0 && !isNaN(startTime) && isFinite(startTime)) {
      try {
        audio.currentTime = startTime;
        console.log('Set audio position to', startTime);
      } catch (e) {
        console.error('Could not set audio position:', e);
        audio.currentTime = 0;
      }
    }
    
    // Attempt to play if it was playing before
    if (shouldPlay) {
      attemptPlay();
    }
  });
  
  // Play attempt function
  function attemptPlay() {
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('Auto-resumed audio playback');
          updateUIState(true);
          localStorage.setItem('audioPlaying', 'true');
        })
        .catch(err => {
          console.error('Could not auto-play:', err);
          updateUIState(false);
          localStorage.setItem('audioPlaying', 'false');
        });
    }
  }
  
  // Error handling
  audio.addEventListener('error', function(e) {
    console.error('Audio error:', e);
    alert('Audio error: Could not load or play the audio file.');
  });
  
  // Player click handling
  playerContainer.addEventListener('click', function() {
    if (audio.paused) {
      attemptPlay();
    } else {
      audio.pause();
      updateUIState(false);
      localStorage.setItem('audioPlaying', 'false');
    }
    
    // Always save current time
    localStorage.setItem('audioTime', audio.currentTime);
  });
  
  // Handle audio ending
  audio.addEventListener('ended', function() {
    updateUIState(false);
    localStorage.setItem('audioPlaying', 'false');
  });
  
  // Periodic state saving
  const stateSaveInterval = setInterval(function() {
    if (!audio.paused && !audio.ended) {
      localStorage.setItem('audioTime', audio.currentTime);
    }
  }, 5000);
  
  // Clean up listeners when page unloads
  window.addEventListener('beforeunload', function() {
    // Save final state
    localStorage.setItem('audioPlaying', !audio.paused && !audio.ended);
    localStorage.setItem('audioTime', audio.currentTime);
    clearInterval(stateSaveInterval);
  });
  
  return audio;
}
