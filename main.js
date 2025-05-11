// main.js - Fixed version
document.addEventListener('DOMContentLoaded', function() {
  // Initialize audio player
  initAudioPlayer();
  
  // Handle navigation
  document.querySelectorAll('a:not([target="_blank"])').forEach(link => {
    if (link.hostname === window.location.hostname) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        loadPage(href);
      });
    }
  });
  
  // Handle back/forward browser buttons
  window.addEventListener('popstate', function(e) {
    if (e.state && e.state.path) {
      loadPage(e.state.path, false);
    }
  });
  
  // Load initial page content
  history.replaceState({path: window.location.pathname}, '', window.location.pathname);
});

function initAudioPlayer() {
  // Only create audio player if it doesn't exist
  if (!document.getElementById('persistentAudio')) {
    const audioContainer = document.createElement('div');
    audioContainer.className = 'audio-player';
    audioContainer.id = 'audioPlayer';
    
    audioContainer.innerHTML = `
      <div class="dotted-circle">
        <div class="play-triangle" id="playIcon"></div>
        <div class="pause-bars" id="pauseIcon"></div>
      </div>
      <audio id="persistentAudio" preload="metadata">
        <source src="/Audio Sample.mp3" type="audio/mpeg">
        Your browser does not support the audio element.
      </audio>
    `;
    
    document.body.appendChild(audioContainer);
    
    // Make sure these are loaded into variables AFTER they're added to the DOM
    const audioSample = document.getElementById('persistentAudio');
    const playIcon = document.getElementById('playIcon');
    const pauseIcon = document.getElementById('pauseIcon');
    
    // Initialize player state
    pauseIcon.style.display = 'none';
    playIcon.style.display = 'block';
    
    // Add a debug check to ensure audio element is working
    console.log('Audio element loaded:', audioSample);
    console.log('Audio source:', audioSample.querySelector('source').src);
    
    // Use event delegation for better click handling
    audioContainer.addEventListener('click', function() {
      console.log('Audio player clicked');
      if (audioSample.paused) {
        // Try to play and handle any errors
        const playPromise = audioSample.play();
        
        if (playPromise !== undefined) {
          playPromise.then(_ => {
            // Playback started successfully
            console.log('Audio playback started');
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
          })
          .catch(error => {
            // Auto-play was prevented
            console.error('Playback failed:', error);
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
          });
        }
      } else {
        audioSample.pause();
        console.log('Audio paused');
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
      }
    });
    
    audioSample.addEventListener('ended', function() {
      console.log('Audio playback ended');
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
    });
  }
}

function loadPage(url, pushState = true) {
  fetch(url)
    .then(response => response.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Get the main content area
      const newContent = doc.querySelector('.dada-container');
      const currentContent = document.querySelector('.dada-container');
      
      // Update only the content area, preserving audio player
      if (newContent && currentContent) {
        currentContent.innerHTML = newContent.innerHTML;
      }
      
      // Update page title
      document.title = doc.title;
      
      // Update URL in browser if needed
      if (pushState) {
        history.pushState({path: url}, doc.title, url);
      }
      
      // Reattach event listeners to new content
      document.querySelectorAll('a:not([target="_blank"])').forEach(link => {
        if (link.hostname === window.location.hostname) {
          link.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            loadPage(href);
          });
        }
      });
    })
    .catch(error => {
      console.error('Error loading page:', error);
      window.location.href = url; // Fallback to normal navigation
    });
}
