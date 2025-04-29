/**
 * Navigation functionality
 * This file handles all navigation-related functionality
 */

// Execute when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Navigation script loaded');

    // Mobile menu functionality
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('nav');
    const body = document.body;

    // Create menu overlay if it doesn't exist
    let menuOverlay = document.querySelector('.menu-overlay');
    if (!menuOverlay) {
        menuOverlay = document.createElement('div');
        menuOverlay.className = 'menu-overlay';
        body.appendChild(menuOverlay);
    }

    // Function to open mobile menu
    function openMobileMenu() {
        nav.classList.add('active');
        menuOverlay.classList.add('active');
        body.style.overflow = 'hidden';

        // Change icon to X
        const icon = mobileMenuToggle.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        }
    }

    // Function to close mobile menu
    function closeMobileMenu() {
        nav.classList.remove('active');
        menuOverlay.classList.remove('active');
        body.style.overflow = '';

        // Change icon back to bars
        const icon = mobileMenuToggle.querySelector('i');
        if (icon) {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    }

    // Toggle mobile menu
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            if (nav.classList.contains('active')) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
    }

    // Close menu when overlay is clicked
    menuOverlay.addEventListener('click', closeMobileMenu);

    // Close menu when ESC key is pressed
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && nav.classList.contains('active')) {
            closeMobileMenu();
        }
    });

    // Navigation menu functionality
    const navLinks = document.querySelectorAll('nav ul li a');
    const sections = document.querySelectorAll('.content-section');

    // Activate home section by default
    const homeSection = document.getElementById('home');
    if (homeSection) {
        homeSection.classList.add('active');
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);

            console.log('Navigation clicked:', targetId);

            // Remove active class from all links
            navLinks.forEach(navLink => {
                navLink.classList.remove('active');
            });

            // Add active class to clicked link
            link.classList.add('active');

            // Close mobile menu if open
            if (window.innerWidth <= 768) {
                closeMobileMenu();
            }

            // Smooth scroll to section
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth'
                });

                // Hide all sections
                sections.forEach(section => {
                    section.classList.remove('active');
                });

                // Show target section
                targetSection.classList.add('active');
            }
        });
    });

    // Leaderboard tabs functionality
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.leaderboard-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', async () => {
            // If already active, do nothing
            if (tab.classList.contains('active')) return;

            // Get the current active content
            const currentActive = document.querySelector('.leaderboard-content.active');
            const targetContent = document.getElementById(tab.dataset.tab);

            // Update tab states
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Smooth transition between tabs
            if (currentActive) {
                // Fade out current content
                currentActive.style.opacity = '0';
                currentActive.style.transform = 'translateY(10px)';

                // Wait for fade out animation
                setTimeout(() => {
                    currentActive.classList.remove('active');

                    // Show new content
                    targetContent.classList.add('active');

                    // Trigger reflow for animation
                    void targetContent.offsetWidth;

                    // Fade in new content
                    setTimeout(() => {
                        targetContent.style.opacity = '1';
                        targetContent.style.transform = 'translateY(0)';
                    }, 50);
                }, 300);
            } else {
                // If no current active, just show the new one
                targetContent.classList.add('active');
                setTimeout(() => {
                    targetContent.style.opacity = '1';
                    targetContent.style.transform = 'translateY(0)';
                }, 50);
            }

            // Get the platform from the tab
            const platform = tab.dataset.tab.toLowerCase();

            // Try to load leaderboard data if the service is available
            // This will be handled by the Firebase scripts when they load
            if (window.leaderboardService && typeof window.leaderboardService.renderLeaderboard === 'function') {
                try {
                    await window.leaderboardService.renderLeaderboard(
                        platform,
                        `${platform}-top-winners`,
                        `${platform}-other-winners`
                    );
                } catch (error) {
                    console.error(`Error loading ${platform} leaderboard:`, error);
                }
            } else {
                console.log(`Leaderboard service not available yet for ${platform}`);
            }
        });
    });

    // Function to show offline message for stream
    function showOfflineMessage() {
        const offlineMessage = document.querySelector('.offline-message');
        if (offlineMessage) {
            offlineMessage.style.display = 'flex';
        }
    }

    // Check if stream is offline
    const kickEmbed = document.querySelector('.kick-embed');
    if (kickEmbed) {
        kickEmbed.addEventListener('error', showOfflineMessage);
        // Show offline message by default, hide it if stream loads
        showOfflineMessage();
        kickEmbed.addEventListener('load', function() {
            const offlineMessage = document.querySelector('.offline-message');
            if (offlineMessage) {
                offlineMessage.style.display = 'none';
            }
        });
    }

    // Timer function
    function updateTimer(timerElement) {
        try {
            const endDate = new Date(timerElement.dataset.end);
            if (isNaN(endDate.getTime())) throw new Error('Invalid date format');

            function update() {
                const now = new Date().getTime();
                const distance = endDate - now;

                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                const timerValue = timerElement.querySelector('.timer-value');
                timerValue.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;

                if (distance < 0) {
                    timerValue.textContent = "COMPETITION ENDED";
                }
            }

            update();
            setInterval(update, 1000);
        } catch (error) {
            console.error('Timer error:', error);
            timerElement.querySelector('.timer-value').textContent = "TIMER ERROR";
        }
    }

    // Initialize all timers
    document.querySelectorAll('.countdown-timer').forEach(timer => {
        updateTimer(timer);
    });

    // Expose function to global scope
    window.showOfflineMessage = showOfflineMessage;
});
