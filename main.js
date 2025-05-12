// main.js - Fixed version
document.addEventListener('DOMContentLoaded', function() {
  // Create persistent audio player that works across all pages
  createAudioPlayer();
});

function createAudioPlayer() {
  console.log('Initializing audio player...');
  
  // Create the audio player if it doesn't exist yet
  if (!document.getElementById('persistentAudio')) {
    console.log('Creating audio player...');
    
    // Create the container
    const playerContainer = document.createElement('div');
    playerContainer.className = 'audio-player';
    playerContainer.id = 'audioPlayer';
    
    // Create the HTML structure
    playerContainer.innerHTML = `
      <div class="dotted-circle">
        <div class="play-triangle" id="playIcon"></div>
        <div class="pause-bars" id="pauseIcon"></div>
      </div>
      <audio id="persistentAudio">
        <source src="audiosample.mp3" type="audio/mpeg">
      </audio>
    `;
    
    // Add to the body
    document.body.appendChild(playerContainer);
    
    // Get references to elements
    const audio = document.getElementById('persistentAudio');
    audio.src = "audiosample.mp3"; // Set src directly as well
    
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    
    // Add debugging
    audio.addEventListener('loadeddata', () => {
      console.log('Audio loaded successfully');
    });
    
    audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      console.error('Error code:', audio.error ? audio.error.code : 'unknown');
    });
    
    // Initialize the player state
    pauseIcon.style.display = 'none';
    playIcon.style.display = 'block';
    
    // Add click event
    playerContainer.addEventListener('click', function() {
      console.log('Player clicked');
      
      if (audio.paused) {
        let playPromise = audio.play();
        
        if (playPromise !== undefined) {
          playPromise.then(() => {
            console.log('Audio playing successfully');
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
          }).catch(error => {
            console.error('Play failed:', error);
          });
        }
      } else {
        audio.pause();
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        console.log('Paused audio');
      }
    });
    
    // Handle when audio ends
    audio.addEventListener('ended', function() {
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
      console.log('Audio ended');
    });
  }
}

// Add an event listener for page changes
window.addEventListener('popstate', function() {
  console.log('Page changed, ensuring audio player exists');
  createAudioPlayer();
});

// For links within the site, prevent page refresh and maintain audio
document.addEventListener('click', function(e) {
  // Find closest anchor tag if the click was on a child element
  const link = e.target.closest('a');
  
  if (link && link.hostname === window.location.hostname && !link.hasAttribute('target')) {
    const href = link.getAttribute('href');
    
    // Only handle HTML pages
    if (href && href.endsWith('.html')) {
      console.log('Internal link clicked:', href);
      e.preventDefault();
      
      // Keep the audio player state
      const audio = document.getElementById('persistentAudio');
      const wasPlaying = audio ? !audio.paused : false;
      
      // Load the new page
      fetch(href)
        .then(response => response.text())
        .then(html => {
          // Extract just the content
          const parser = new DOMParser();
          const newDoc = parser.parseFromString(html, 'text/html');
          
          // Find the content in the loaded page
          const newContent = newDoc.querySelector('.dada-container');
          const currentContent = document.querySelector('.dada-container');
          
          if (newContent && currentContent) {
            // Update just the content, not the whole page
            currentContent.innerHTML = newContent.innerHTML;
            document.title = newDoc.title;
            history.pushState(null, newDoc.title, href);
            
            // If audio was playing, keep it playing
            if (wasPlaying && audio) {
              audio.play()
                .then(() => console.log('Audio continued playing after navigation'))
                .catch(err => console.error('Failed to continue audio:', err));
            }
          } else {
            // Fallback to full page load if container not found
            window.location.href = href;
          }
        })
        .catch(err => {
          console.error('Error loading page:', err);
          window.location.href = href; // Fallback
        });
    }
  }
});
