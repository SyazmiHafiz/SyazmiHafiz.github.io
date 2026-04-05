document.addEventListener('DOMContentLoaded', () => {
    
    // --- Dark Mode Toggle ---
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Check local storage for theme preference, default to dark
    const currentTheme = localStorage.getItem('theme') || 'dark';
    
    if (currentTheme === 'light') {
        body.classList.remove('dark-mode');
    } else {
        body.classList.add('dark-mode');
    }
    
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        
        let theme = 'light';
        if (body.classList.contains('dark-mode')) {
            theme = 'dark';
        }
        localStorage.setItem('theme', theme);
    });

    // --- Intersection Observer for Animations ---
    const faders = document.querySelectorAll('.fade-in');
    
    const appearOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const appearOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                return;
            } else {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, appearOptions);

    faders.forEach(fader => {
        appearOnScroll.observe(fader);
    });

    // Initial check for elements in viewport on load
    setTimeout(() => {
        faders.forEach(fader => {
            const rect = fader.getBoundingClientRect();
            if(rect.top <= window.innerHeight) {
                fader.classList.add('visible');
            }
        });
    }, 100);

    // --- Futuristic Scroll-Linked Timeline ---
    const timeline = document.getElementById('experience-timeline');
    const progressBar = document.getElementById('timeline-progress-fill');
    const movingDot = document.getElementById('timeline-moving-dot');
    const timelineItems = document.querySelectorAll('.timeline-item');

    if (timeline && progressBar && movingDot) {
        let isTicking = false;

        window.addEventListener('scroll', () => {
            if (!isTicking) {
                window.requestAnimationFrame(() => {
                    const timelineRect = timeline.getBoundingClientRect();
                    const viewportHeight = window.innerHeight;
                    
                    // Percentage scrolled relative to the timeline visibility in the viewport
                    const timelineHeight = timelineRect.height;
                    
                    // Calculate progress (0 to 100)
                    let scrolled = (viewportHeight / 2) - timelineRect.top; 
                    let percentage = (scrolled / timelineHeight) * 100;
                    percentage = Math.max(0, Math.min(percentage, 100)); // Clamp
                    
                    progressBar.style.height = `${percentage}%`;
                    movingDot.style.top = `${percentage}%`;

                    // Active State for Items
                    timelineItems.forEach(item => {
                        const itemRect = item.getBoundingClientRect();
                        // When item reaches middle of viewport
                        if (itemRect.top < viewportHeight / 2 + 80) {
                            item.classList.add('active');
                        } else {
                            item.classList.remove('active');
                        }
                    });
                    
                    isTicking = false;
                });
                isTicking = true;
            }
        });
        
        // Initial trigger
        window.dispatchEvent(new Event('scroll'));
    }

    // --- Register Service Worker for PWA ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch(err => {
                    console.log('ServiceWorker registration failed: ', err);
                });
        });
    }
});
