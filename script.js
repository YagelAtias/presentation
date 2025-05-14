// Presentation Navigation Script

// Variables to track slide state
let currentSlideIndex = 0;
let slides;
let totalSlides;
let prevButton;
let nextButton;
let progressContainer;
let progressDots = [];

// Initialize the presentation when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get all slides and navigation elements
    slides = document.querySelectorAll('.slide');
    totalSlides = slides.length;
    prevButton = document.getElementById('prevBtn');
    nextButton = document.getElementById('nextBtn');
    progressContainer = document.querySelector('.slide-progress');
    const fullscreenButton = document.getElementById('fullscreenBtn');

    // Add click event listeners to navigation buttons
    prevButton.addEventListener('click', () => changeSlide(-1));
    nextButton.addEventListener('click', () => changeSlide(1));

    // Add click event listener to fullscreen button
    if (fullscreenButton) {
        fullscreenButton.addEventListener('click', toggleFullscreen);

        // Update fullscreen button icon when fullscreen state changes
        document.addEventListener('fullscreenchange', updateFullscreenButtonIcon);
        document.addEventListener('webkitfullscreenchange', updateFullscreenButtonIcon);
        document.addEventListener('mozfullscreenchange', updateFullscreenButtonIcon);
        document.addEventListener('MSFullscreenChange', updateFullscreenButtonIcon);
    }

    // Create progress dots
    createProgressDots();

    // Initial setup
    showSlide(currentSlideIndex);

    // Set up keyboard navigation
    setupKeyboardNavigation();

    // Set up touch navigation for mobile
    setupTouchNavigation();
});

/**
 * Creates progress dots for each slide
 */
function createProgressDots() {
    // Clear any existing dots
    progressContainer.innerHTML = '';
    progressDots = [];

    // Create a dot for each slide
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.className = 'progress-dot';
        dot.setAttribute('aria-hidden', 'true');

        // Add click event to navigate to that slide
        dot.addEventListener('click', () => {
            if (i !== currentSlideIndex) {
                currentSlideIndex = i;
                showSlide(i);
            }
        });

        progressContainer.appendChild(dot);
        progressDots.push(dot);
    }

    // Add a counter text for screen readers
    const counter = document.createElement('span');
    counter.className = 'sr-only';
    counter.id = 'slide-counter';
    counter.textContent = `Slide 1 of ${totalSlides}`;
    progressContainer.appendChild(counter);
}

/**
 * Shows a specific slide by index
 * @param {number} index - The index of the slide to show
 */
function showSlide(index) {
    // Hide all slides
    slides.forEach(slide => {
        slide.classList.remove('active');
    });

    // Show the target slide
    if (slides[index]) { // Check if slide exists
        slides[index].classList.add('active');

        // Update progress dots
        progressDots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });

        // Update screen reader counter
        const counter = document.getElementById('slide-counter');
        if (counter) {
            counter.textContent = `Slide ${index + 1} of ${totalSlides}`;
        }

        // Announce slide change for screen readers
        announceSlideChange(index);
    } else {
        console.error("Slide index out of bounds:", index);
        currentSlideIndex = 0; // Reset to first slide if index is invalid
        if (slides[0]) slides[0].classList.add('active');
    }

    // Update button states
    prevButton.disabled = index === 0;
    nextButton.disabled = index === totalSlides - 1;
}

/**
 * Announces slide change for screen readers
 * @param {number} index - The index of the current slide
 */
function announceSlideChange(index) {
    const slideTitle = slides[index].querySelector('h1, h2')?.textContent || `Slide ${index + 1}`;
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = `Now viewing: ${slideTitle}`;

    document.body.appendChild(announcement);

    // Remove after announcement is read
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

/**
 * Changes the current slide by the given direction
 * @param {number} direction - The direction to move (-1 for previous, 1 for next)
 */
function changeSlide(direction) {
    const newIndex = currentSlideIndex + direction;
    // Check boundaries
    if (newIndex >= 0 && newIndex < totalSlides) {
        currentSlideIndex = newIndex;
        showSlide(currentSlideIndex);
    }
}

/**
 * Sets up keyboard navigation for the presentation
 */
function setupKeyboardNavigation() {
    document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
            changeSlide(-1); // Go to previous slide
        } else if (event.key === 'ArrowRight') {
            changeSlide(1); // Go to next slide
        } else if (event.key === 'Home') {
            currentSlideIndex = 0;
            showSlide(currentSlideIndex); // Go to first slide
        } else if (event.key === 'End') {
            currentSlideIndex = totalSlides - 1;
            showSlide(currentSlideIndex); // Go to last slide
        } else if (event.key === 'f' || event.key === 'F') {
            toggleFullscreen(); // Toggle fullscreen mode
        }
    });
}

/**
 * Sets up touch navigation for mobile devices
 */
function setupTouchNavigation() {
    const container = document.getElementById('presentationContainer');
    let touchStartX = 0;
    let touchEndX = 0;

    container.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50; // Minimum distance for a swipe
        const swipeDistance = touchEndX - touchStartX;

        if (swipeDistance > swipeThreshold) {
            // Swiped right, go to previous slide
            changeSlide(-1);
        } else if (swipeDistance < -swipeThreshold) {
            // Swiped left, go to next slide
            changeSlide(1);
        }
    }
}

/**
 * Toggles fullscreen mode
 */
function toggleFullscreen() {
    if (!document.fullscreenElement && 
        !document.webkitFullscreenElement && 
        !document.mozFullScreenElement && 
        !document.msFullscreenElement) {
        // Enter fullscreen
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) { /* Safari */
            document.documentElement.webkitRequestFullscreen();
        } else if (document.documentElement.msRequestFullscreen) { /* IE11 */
            document.documentElement.msRequestFullscreen();
        }
    } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE11 */
            document.msExitFullscreen();
        }
    }
}

/**
 * Updates the fullscreen button icon based on fullscreen state
 */
function updateFullscreenButtonIcon() {
    const fullscreenButton = document.getElementById('fullscreenBtn');
    if (!fullscreenButton) return;

    const isFullscreen = document.fullscreenElement || 
                         document.webkitFullscreenElement || 
                         document.mozFullScreenElement || 
                         document.msFullscreenElement;

    if (isFullscreen) {
        // Show exit fullscreen icon
        fullscreenButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
            </svg>
        `;
        fullscreenButton.setAttribute('aria-label', 'Exit fullscreen mode');
    } else {
        // Show enter fullscreen icon
        fullscreenButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
            </svg>
        `;
        fullscreenButton.setAttribute('aria-label', 'Enter fullscreen mode');
    }
}
