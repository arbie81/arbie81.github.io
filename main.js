// Simplified solution - creates the persistent audio player
document.addEventListener('DOMContentLoaded', function() {
  // Check for existing audio state in localStorage
  const wasPlaying = localStorage.getItem('audioPlaying') === 'true';
  const currentTime = parseFloat(localStorage.getItem('audioTime') || '0');
  
  console.log('Page loaded. Audio was playing:', wasPlaying, 'Time:', currentTime);
  
  // Create audio player
  createAudioPlayer(wasPlaying, currentTime);
});

function createAudioPlayer(shouldPlay, startTime) {
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
  
  // Create audio element separately (more reliable)
  const audio = document.createElement('audio');
  audio.id = 'persistentAudio';
  
  // Add audio to page but keep it hidden
  audio.style.display = 'none';
  document.body.appendChild(audio);
  
  // Set the audio source - make sure this file exists!
  audio.src = 'audiosample.mp3';
  
  // Add the player UI to the page
  document.body.appendChild(playerContainer);
  
  // Get UI elements
  const playIcon = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');
  
  // Set initial UI state
  playIcon.style.display = shouldPlay ? 'none' : 'block';
  pauseIcon.style.display = shouldPlay ? 'block' : 'none';
  
  // Add debugging
  audio.addEventListener('loadeddata', function() {
    console.log('Audio loaded successfully');
    
    // Set the saved time position
    if (startTime > 0) {
      audio.currentTime = startTime;
      console.log('Set audio position to', startTime);
    }
    
    // Start playing if it was playing before
    if (shouldPlay) {
      // Use more explicit play method for mobile
      audio.play().catch(function(error) {
        console.log('Autoplay was prevented');
        console.log(error);
      });
    }
  });
  
  audio.addEventListener('error', function(e) {
    console.error('Audio error:', e);
    console.error('Error code:', audio.error ? audio.error.code : 'unknown');
    console.error('Error message:', audio.error ? audio.error.message : 'unknown');
  });
  
  // Handle click on the player
  playerContainer.addEventListener('click', function() {
    console.log('Player clicked');
    
    // Ensure audio is unlocked on mobile
    if (audio.paused) {
      audio.play().then(function() {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
        localStorage.setItem('audioPlaying', 'true');
      }).catch(function(error) {
        console.log('Play was prevented');
        console.log(error);
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
      });
    } else {
      audio.pause();
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
      localStorage.setItem('audioPlaying', 'false');
    }
    
    // Always save current time
    localStorage.setItem('audioTime', audio.currentTime);
  });
  
  // Handle audio ending
  audio.addEventListener('ended', function() {
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
    localStorage.setItem('audioPlaying', 'false');
  });
  
  // Additional mobile compatibility
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
      // Save state when page is hidden
      localStorage.setItem('audioPlaying', !audio.paused);
      localStorage.setItem('audioTime', audio.currentTime);
    }
  });
}

// Optional: Add global error handling
window.addEventListener('error', function(event) {
  console.error('Unhandled error:', event.error);
});
