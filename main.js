// Enhanced audio player for cross-platform compatibility
document.addEventListener('DOMContentLoaded', function() {
  // Robust audio state management
  const audioState = {
    element: null,
    playerContainer: null,
    playIcon: null,
    pauseIcon: null,
    
    // Initialize the audio player
    init: function() {
      // Create audio element
      this.element = document.createElement('audio');
      this.element.id = 'persistentAudio';
      this.element.src = 'audiosample.mp3';
      this.element.style.display = 'none';
      
      // Preserve audio state across page loads
      const wasPlaying = localStorage.getItem('audioPlaying') === 'true';
      const currentTime = parseFloat(localStorage.getItem('audioTime') || '0');
      
      // Create player UI
      this.createPlayerUI();
      
      // Add audio to document
      document.body.appendChild(this.element);
      
      // Setup event listeners
      this.setupEventListeners(wasPlaying, currentTime);
    },
    
    // Create player UI elements
    createPlayerUI: function() {
      this.playerContainer = document.createElement('div');
      this.playerContainer.className = 'audio-player';
      this.playerContainer.id = 'audioPlayer';
      
      this.playerContainer.innerHTML = `
        <div class="dotted-circle">
          <div class="play-triangle" id="playIcon"></div>
          <div class="pause-bars" id="pauseIcon"></div>
        </div>
      `;
      
      document.body.appendChild(this.playerContainer);
      
      // Get UI elements
      this.playIcon = document.getElementById('playIcon');
      this.pauseIcon = document.getElementById('pauseIcon');
    },
    
    // Setup all event listeners
    setupEventListeners: function(wasPlaying, startTime) {
      const self = this;
      
      // Audio loaded event
      this.element.addEventListener('loadeddata', function() {
        console.log('Audio loaded successfully');
        
        // Set initial time
        if (startTime > 0) {
          self.element.currentTime = startTime;
        }
        
        // Attempt to play if it was playing before
        if (wasPlaying) {
          self.play();
        } else {
          self.updateUIState(false);
        }
      });
      
      // Player container click event
      this.playerContainer.addEventListener('click', function() {
        if (self.element.paused) {
          self.play();
        } else {
          self.pause();
        }
      });
      
      // Audio ended event
      this.element.addEventListener('ended', function() {
        self.updateUIState(false);
        localStorage.setItem('audioPlaying', 'false');
      });
      
      // Error handling
      this.element.addEventListener('error', function(e) {
        console.error('Audio error:', e);
      });
      
      // Handle page visibility changes
      document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'hidden') {
          // Save state when page is hidden
          localStorage.setItem('audioPlaying', !self.element.paused);
          localStorage.setItem('audioTime', self.element.currentTime);
        }
      });
    },
    
    // Play method with improved mobile compatibility
    play: function() {
      const self = this;
      
      // Use promise-based play with fallback
      const playPromise = this.element.play();
      
      if (playPromise !== undefined) {
        playPromise.then(() => {
          self.updateUIState(true);
          localStorage.setItem('audioPlaying', 'true');
          localStorage.setItem('audioTime', self.element.currentTime);
        }).catch((error) => {
          console.log('Autoplay was prevented:', error);
          self.updateUIState(false);
        });
      } else {
        // Fallback for older browsers
        try {
          this.element.play();
          self.updateUIState(true);
        } catch (error) {
          console.log('Play failed:', error);
          self.updateUIState(false);
        }
      }
    },
    
    // Pause method
    pause: function() {
      this.element.pause();
      this.updateUIState(false);
      localStorage.setItem('audioPlaying', 'false');
      localStorage.setItem('audioTime', this.element.currentTime);
    },
    
    // Update UI state
    updateUIState: function(isPlaying) {
      if (this.playIcon && this.pauseIcon) {
        this.playIcon.style.display = isPlaying ? 'none' : 'block';
        this.pauseIcon.style.display = isPlaying ? 'block' : 'none';
      }
    }
  };
  
  // Initialize the audio player
  audioState.init();
  
  // Make audio state globally accessible for potential cross-page persistence
  window.audioState = audioState;
});

// Global error handling
window.addEventListener('error', function(event) {
  console.error('Unhandled error:', event.error);
});
