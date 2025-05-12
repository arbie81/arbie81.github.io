// main.js - Simplified version
document.addEventListener('DOMContentLoaded', function createAudioPlayer() {
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
        <source src="Audio%20Sample.mp3" type="audio/mpeg">
      </audio>
    `;
    
    // Add to the body
    document.body.appendChild(playerContainer);
    
    // Get references to elements
    const audio = document.getElementById('persistentAudio');
    
    // Set src directly as well (redundant but can help with some browsers)
    audio.src = "Audio Sample.mp3"; 
    
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    
    // Add debug event listeners
    audio.addEventListener('loadeddata', () => {
      console.log('Audio loaded successfully');
    });
    audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
    });
    
    // Initialize the player state
    pauseIcon.style.display = 'none';
    playIcon.style.display = 'block';
    
    // Add click event
    playerContainer.addEventListener('click', function() {
      console.log('Player clicked');
      
      if (audio.paused) {
        // Try playing with a user interaction
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
    });
  }
}

function setupSPANavigation() {
  // Set up click handlers for all internal links
  document.querySelectorAll('a').forEach(function(link) {
    // Only handle links to the same site
    if (link.hostname === window.location.hostname && !link.hasAttribute('target')) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const url = this.;
        
        console.log('Navigating to:', url);
        
        // Load the new page content
        fetch(url)
          .then(response => response.text())
          .then(html => {
            // Parse the HTML
            const parser = new DOMParser();
            const newDoc = parser.parseFromString(html, 'text/html');
            
            // Find the content container in the new page
            const newContent = newDoc.querySelector('.dada-container');
            
            if (newContent) {
              // Update the current page's content
              document.querySelector('.dada-container').innerHTML = newContent.innerHTML;
              
              // Update page title
              document.title = newDoc.title;
              
              // Update URL
              history.pushState({path: url}, newDoc.title, url);
              
              // Re-attach event handlers to the new content
              setupSPANavigation();
            } else {
              console.error('No .dada-container found in the loaded page');
              window.location. = url; // Fallback
            }
          })
          .catch(error => {
            console.error('Error loading page:', error);
            window.location. = url; // Fallback
          });
      });
    }
  });
  
  // Handle browser back/forward buttons
  window.addEventListener('popstate', function(e) {
    if (e.state && e.state.path) {
      // Load the page content without pushing a new state
      fetch(e.state.path)
        .then(response => response.text())
        .then(html => {
          const parser = new DOMParser();
          const newDoc = parser.parseFromString(html, 'text/html');
          const newContent = newDoc.querySelector('.dada-container');
          
          if (newContent) {
            document.querySelector('.dada-container').innerHTML = newContent.innerHTML;
            document.title = newDoc.title;
            setupSPANavigation();
          } else {
            window.location. = e.state.path; // Fallback
          }
        })
        .catch(error => {
          console.error('Error loading page:', error);
          window.location. = e.state.path; // Fallback
        });
    }
  });
}
