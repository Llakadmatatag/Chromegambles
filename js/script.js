/**
 * Main JavaScript file for ChromeGambles website
 * Contains all core functionality and UI interactions
 *
 * @version 1.0.0
 * @author ChromeGambles
 */

// Error handling utility function
function handleError(error, context) {
    // Remove console.error in production
    // console.error(`Error in ${context}:`, error);

    // Return a user-friendly message
    return {
        success: false,
        message: `Something went wrong. Please try again later.`,
        context: context
    };
}

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navbar = document.querySelector('.navbar');
    const loginBtn = document.querySelector('.login-btn');

    // Add click event for Discord login button
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('This feature is currently under development. Please check back soon!');
        });
    }

    // Discord join button in hero section now directly links to Discord

    // Add click event for Become a Member button in hero section
    const memberBtn = document.querySelector('.member-btn');
    if (memberBtn) {
        memberBtn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('This feature is currently under development. Please check back soon!');
        });
    }

    // Initialize floating coins for all pages
    const floatingCoinsElements = document.querySelectorAll('.floating-coins');
    if (floatingCoinsElements.length > 0) {
        floatingCoinsElements.forEach(element => {
            createFloatingCoins(element);
        });
    }

    // Add scroll event for navbar transparency effect
    window.addEventListener('scroll', function() {
        // Check if we're on mobile view
        const isMobile = window.innerWidth <= 768;

        if (isMobile) {
            // Keep solid black background on mobile
            navbar.style.backgroundColor = '#121212';
            navbar.style.backdropFilter = 'none';
            navbar.style.webkitBackdropFilter = 'none';
        } else {
            // Use transparent background with blur on desktop
            if (window.scrollY > 100) {
                navbar.style.backgroundColor = 'rgba(18, 18, 18, 0.9)';
                navbar.style.backdropFilter = 'blur(15px)';
                navbar.style.webkitBackdropFilter = 'blur(15px)';
            } else {
                navbar.style.backgroundColor = 'rgba(18, 18, 18, 0.7)';
                navbar.style.backdropFilter = 'blur(10px)';
                navbar.style.webkitBackdropFilter = 'blur(10px)';
            }
        }
    });

    // Also update navbar on window resize
    window.addEventListener('resize', function() {
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            navbar.style.backgroundColor = '#121212';
            navbar.style.backdropFilter = 'none';
            navbar.style.webkitBackdropFilter = 'none';
        } else {
            if (window.scrollY > 100) {
                navbar.style.backgroundColor = 'rgba(18, 18, 18, 0.9)';
                navbar.style.backdropFilter = 'blur(15px)';
                navbar.style.webkitBackdropFilter = 'blur(15px)';
            } else {
                navbar.style.backgroundColor = 'rgba(18, 18, 18, 0.7)';
                navbar.style.backdropFilter = 'blur(10px)';
                navbar.style.webkitBackdropFilter = 'blur(10px)';
            }
        }
    });

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            // Toggle navigation menu
            navLinks.classList.toggle('active');

            // Animate hamburger icon
            hamburger.classList.toggle('active');

            // Toggle hamburger animation
            const bars = hamburger.querySelectorAll('.bar');
            if (hamburger.classList.contains('active')) {
                bars[0].style.transform = 'translateY(8px) rotate(45deg)';
                bars[1].style.opacity = '0';
                bars[2].style.transform = 'translateY(-8px) rotate(-45deg)';
            } else {
                bars[0].style.transform = 'none';
                bars[1].style.opacity = '1';
                bars[2].style.transform = 'none';
            }
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navLinks.classList.contains('active') &&
            !e.target.closest('.nav-links') &&
            !e.target.closest('.hamburger')) {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');

            // Reset hamburger icon
            const bars = hamburger.querySelectorAll('.bar');
            bars[0].style.transform = 'none';
            bars[1].style.opacity = '1';
            bars[2].style.transform = 'none';
        }
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Close mobile menu if open
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    hamburger.classList.remove('active');

                    // Reset hamburger icon
                    const bars = hamburger.querySelectorAll('.bar');
                    bars[0].style.transform = 'none';
                    bars[1].style.opacity = '1';
                    bars[2].style.transform = 'none';
                }

                // Smooth scroll to target
                window.scrollTo({
                    top: targetElement.offsetTop - 70, // Adjust for navbar height
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add scroll animation for elements
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.feature-card, .card, .event-card, .stats-card, .testimonials');

        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;

            if (elementPosition < screenPosition) {
                element.style.opacity = '1';
                element.style.transform = element.classList.contains('testimonials')
                    ? 'translateY(30px)'
                    : 'translateY(0)';
            }
        });
    };

    // Set initial state for animated elements
    document.querySelectorAll('.feature-card, .card, .event-card, .stats-card, .testimonials').forEach(element => {
        element.style.opacity = '0';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        element.style.transform = 'translateY(20px)';
    });

    // Run animation on page load and scroll
    window.addEventListener('load', animateOnScroll);
    window.addEventListener('scroll', animateOnScroll);

    // Active navigation link based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        }
    });
});

// Function to create floating coins animation for all pages
function createFloatingCoins(container) {
    // If no container is provided, exit the function
    if (!container) return;

    for (let i = 0; i < 12; i++) { // Reduced number of coins to avoid distraction
        const coin = document.createElement('div');
        coin.classList.add('coin');

        // Random positioning
        coin.style.left = `${Math.random() * 100}%`;
        coin.style.top = `${Math.random() * 100}%`;

        // More consistent size for favicon coins
        const size = 25 + Math.random() * 15; // Smaller range for more consistent size
        coin.style.width = `${size}px`;
        coin.style.height = `${size}px`;

        // Slower animation duration
        coin.style.animationDuration = `${15 + Math.random() * 25}s`;

        // Random animation delay
        coin.style.animationDelay = `${Math.random() * 5}s`;

        container.appendChild(coin);
    }
}

// RAINGG Bonus Popup Functions
function showRainggBonusPopup() {
    const popup = document.getElementById('raingg-bonus-popup');
    if (popup) {
        popup.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent scrolling when popup is open

        // Add event listener to close popup when clicking outside
        popup.addEventListener('click', function(event) {
            if (event.target === popup) {
                closeRainggBonusPopup();
            }
        });

        // Add escape key listener
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                closeRainggBonusPopup();
            }
        });
    }
}

function closeRainggBonusPopup() {
    const popup = document.getElementById('raingg-bonus-popup');
    if (popup) {
        popup.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
    }
}

// DICEBLOX Bonus Popup Functions
function showDicebloxBonusPopup() {
    const popup = document.getElementById('diceblox-bonus-popup');
    if (popup) {
        popup.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent scrolling when popup is open

        // Add event listener to close popup when clicking outside
        popup.addEventListener('click', function(event) {
            if (event.target === popup) {
                closeDicebloxBonusPopup();
            }
        });

        // Add escape key listener
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                closeDicebloxBonusPopup();
            }
        });
    }
}

function closeDicebloxBonusPopup() {
    const popup = document.getElementById('diceblox-bonus-popup');
    if (popup) {
        popup.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
    }
}

// HYPEBET Bonus Popup Functions
function showHypebetBonusPopup() {
    const popup = document.getElementById('hypebet-bonus-popup');
    if (popup) {
        popup.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent scrolling when popup is open

        // Add event listener to close popup when clicking outside
        popup.addEventListener('click', function(event) {
            if (event.target === popup) {
                closeHypebetBonusPopup();
            }
        });

        // Add escape key listener
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                closeHypebetBonusPopup();
            }
        });
    }
}

function closeHypebetBonusPopup() {
    const popup = document.getElementById('hypebet-bonus-popup');
    if (popup) {
        popup.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
    }
}

// SHOCK Bonus Popup Functions
function showShockBonusPopup() {
    const popup = document.getElementById('shock-bonus-popup');
    if (popup) {
        popup.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent scrolling when popup is open

        // Add event listener to close popup when clicking outside
        popup.addEventListener('click', function(event) {
            if (event.target === popup) {
                closeShockBonusPopup();
            }
        });

        // Add escape key listener
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                closeShockBonusPopup();
            }
        });
    }
}

function closeShockBonusPopup() {
    const popup = document.getElementById('shock-bonus-popup');
    if (popup) {
        popup.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
    }
}

// XFUN Bonus Popup Functions
function showXfunBonusPopup() {
    const popup = document.getElementById('xfun-bonus-popup');
    if (popup) {
        popup.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent scrolling when popup is open

        // Add event listener to close popup when clicking outside
        popup.addEventListener('click', function(event) {
            if (event.target === popup) {
                closeXfunBonusPopup();
            }
        });

        // Add escape key listener
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                closeXfunBonusPopup();
            }
        });
    }
}

function closeXfunBonusPopup() {
    const popup = document.getElementById('xfun-bonus-popup');
    if (popup) {
        popup.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling
    }
}
