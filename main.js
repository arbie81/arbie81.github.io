// Simplified solution - just creates the persistent audio player
document.addEventListener('DOMContentLoaded', function() {
  // Check for existing audio state in localStorage
  const wasPlaying = localStorage.getItem('audioPlaying') === 'true';
  const currentTime = parseFloat(localStorage.getItem('audioTime') || '0');
  
  console.log('Page loaded. Audio was playing:', wasPlaying, 'Time:', currentTime);
  
  // Create audio player
  createAudioPlayer(wasPlaying, currentTime);
  
  // Before user leaves the page, save audio state
  window.addEventListener('beforeunload', saveAudioState);
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
      audio.play()
        .then(() => console.log('Auto-resumed audio playback'))
        .catch(err => {
          console.error('Could not auto-play:', err);
          // Reset UI if auto-play fails
          playIcon.style.display = 'block';
          pauseIcon.style.display = 'none';
        });
    }
  });
  
  audio.addEventListener('error', function(e) {
    console.error('Audio error:', e);
    console.error('Error code:', audio.error ? audio.error.code : 'unknown');
    console.error('Error message:', audio.error ? audio.error.message : 'unknown');
    alert('Audio error: Could not load or play the audio file. Please check the console for details.');
  });
  
  // Handle click on the player
  playerContainer.addEventListener('click', function() {
    console.log('Player clicked');
    
    if (audio.paused) {
      audio.play()
        .then(() => {
          console.log('Audio started playing');
          playIcon.style.display = 'none';
          pauseIcon.style.display = 'block';
        })
        .catch(err => {
          console.error('Play failed:', err);
          alert('Could not play the audio. Please make sure the file exists and is a valid audio file.');
        });
    } else {
      audio.pause();
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
      console.log('Paused audio');
    }
  });
  
  // Handle audio ending
  audio.addEventListener('ended', function() {
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
    console.log('Audio ended');
  });
}

function saveAudioState() {
  const audio = document.getElementById('persistentAudio');
  if (audio) {
    // Save if the audio was playing
    localStorage.setItem('audioPlaying', !audio.paused);
    // Save the current position
    localStorage.setItem('audioTime', audio.currentTime);
    console.log('Saved audio state:', !audio.paused, audio.currentTime);
  }
}
