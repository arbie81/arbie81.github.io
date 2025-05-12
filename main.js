// main.js - Simplified version
document.addEventListener('DOMContentLoaded', function() {
  // Create persistent audio player that works across all pages
  createAudioPlayer();
  
  // Set up SPA navigation
  setupSPANavigation();
});

function createAudioPlayer() {
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
        <source src="Audio Sample.mp3" type="audio/mpeg">
      </audio>
    `;
    
    // Add to the body
    document.body.appendChild(playerContainer);
    
    // Get references to elements
    const audio = document.getElementById('persistentAudio');
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    
    // Initialize the player state
    pauseIcon.style.display = 'none';
    playIcon.style.display = 'block';
    
    // Add click event
    playerContainer.addEventListener('click', function() {
      console.log('Player clicked');
      
      if (audio.paused) {
        audio.play();
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
        console.log('Playing audio');
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
        const url = this.href;
        
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
              window.location.href = url; // Fallback
            }
          })
          .catch(error => {
            console.error('Error loading page:', error);
            window.location.href = url; // Fallback
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
            window.location.href = e.state.path; // Fallback
          }
        })
        .catch(error => {
          console.error('Error loading page:', error);
          window.location.href = e.state.path; // Fallback
        });
    }
  });
}
