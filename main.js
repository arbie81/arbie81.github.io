// Enhanced persistent audio player that works across page navigation
document.addEventListener('DOMContentLoaded', function() {
  // Check for existing audio state in localStorage
  const wasPlaying = localStorage.getItem('audioPlaying') === 'true';
  const currentTime = parseFloat(localStorage.getItem('audioTime') || '0');
  const audioSource = 'audiosample.mp3'; // Keep audio source in one place
  
  console.log('Page loaded. Audio was playing:', wasPlaying, 'Time:', currentTime);
  
  // Create audio player
  createAudioPlayer(wasPlaying, currentTime, audioSource);
  
  // More aggressive state saving for mobile
  window.addEventListener('beforeunload', saveAudioState);
  window.addEventListener('pagehide', saveAudioState); // Important for iOS
  window.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
      saveAudioState();
    }
  });
  
  // Save state periodically while playing (every 2 seconds)
  setInterval(function() {
    const audio = document.getElementById('persistentAudio');
    if (audio && !audio.paused) {
      saveAudioState();
    }
  }, 2000);
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
  
  // Create audio element separately (more reliable)
  const audio = document.createElement('audio');
  audio.id = 'persistentAudio';
  
  // Add audio to page but keep it hidden
  audio.style.display = 'none';
  document.body.appendChild(audio);
  
  // Set the audio source - make sure this file exists!
  audio.src = audioSource;
  
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
    
    // Set the saved time position with better error handling
    if (startTime > 0 && !isNaN(startTime) && isFinite(startTime)) {
      try {
        audio.currentTime = startTime;
        console.log('Set audio position to', startTime);
      } catch (e) {
        console.error('Could not set audio position:', e);
        // If setting time fails, start from beginning
        audio.currentTime = 0;
      }
    }
    
    // Start playing if it was playing before
    if (shouldPlay) {
      // For mobile, we need to check if autoplay is allowed
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Auto-resumed audio playback');
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
          })
          .catch(err => {
            console.error('Could not auto-play:', err);
            // Reset UI if auto-play fails
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
            
            // On mobile, this is likely due to autoplay policy
            console.log('This is likely due to mobile autoplay restrictions');
          });
      }
    }
  });
  
  audio.addEventListener('error', function(e) {
    console.error('Audio error:', e);
    console.error('Error code:', audio.error ? audio.error.code : 'unknown');
    console.error('Error message:', audio.error ? audio.error.message : 'unknown');
    alert('Audio error: Could not load or play the audio file. Please check the console for details.');
  });
  
  // Handle click on the player with better mobile support
  playerContainer.addEventListener('click', function() {
    console.log('Player clicked');
    
    if (audio.paused) {
      // Save that we're attempting to play
      localStorage.setItem('audioPlaying', 'true');
      
      audio.play()
        .then(() => {
          console.log('Audio started playing');
          playIcon.style.display = 'none';
          pauseIcon.style.display = 'block';
        })
        .catch(err => {
          console.error('Play failed:', err);
          localStorage.setItem('audioPlaying', 'false');
          alert('Could not play the audio. This might be due to mobile browser restrictions. Try tapping again.');
        });
    } else {
      audio.pause();
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
      localStorage.setItem('audioPlaying', 'false');
      console.log('Paused audio');
    }
    
    // Always save the current time when toggling
    localStorage.setItem('audioTime', audio.currentTime);
  });
  
  // Handle audio ending
  audio.addEventListener('ended', function() {
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
    localStorage.setItem('audioPlaying', 'false');
    console.log('Audio ended');
  });
  
  // Additional event for tracking time (useful for mobile)
  audio.addEventListener('timeupdate', function() {
    // Only update occasionally to reduce writes
    if (Math.round(audio.currentTime) % 5 === 0) { // every 5 seconds
      localStorage.setItem('audioTime', audio.currentTime);
    }
  });
}

function saveAudioState() {
  const audio = document.getElementById('persistentAudio');
  if (audio) {
    // Save if the audio was playing
    localStorage.setItem('audioPlaying', !audio.paused && !audio.ended);
    // Save the current position
    localStorage.setItem('audioTime', audio.currentTime);
    console.log('Saved audio state:', !audio.paused, audio.currentTime);
  }
}
