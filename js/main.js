// Main JavaScript file

// Import security utilities
const { escapeHtml, safeTextContent } = window.SecurityUtils || {
    escapeHtml: str => str,
    safeTextContent: (el, text) => { if (el) el.textContent = text; }
};

// Mobile menu functionality
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;
    
    if (!mobileMenuBtn || !navLinks) return;
    
    // Create backdrop element with safe DOM manipulation
    const backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    
    // Sanitize and append backdrop
    if (document.body) {
        document.body.appendChild(backdrop);
    }
    
    // Toggle mobile menu
    function toggleMenu() {
        const isOpening = !navLinks.classList.contains('active');
        
        // Toggle active class
        mobileMenuBtn.classList.toggle('active');
        navLinks.classList.toggle('active');
        backdrop.classList.toggle('active', isOpening);
        
        // Toggle body scroll lock
        if (isOpening) {
            // Save scroll position
            const scrollY = window.scrollY;
            body.classList.add('menu-open');
            body.style.top = `-${scrollY}px`;
        } else {
            // Restore scroll position
            const scrollY = body.style.top;
            body.classList.remove('menu-open');
            body.style.top = '';
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
            }
        }
    }
    
    // Toggle menu on button click with CSRF protection
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function(e) {
            if (e && typeof e.stopPropagation === 'function') {
                e.stopPropagation();
            }
            toggleMenu();
        });
    }
    
    // Close menu when clicking on backdrop
    backdrop.addEventListener('click', toggleMenu);
    
    // Close menu when clicking on a link with CSRF protection
    const navLinkElements = document.querySelectorAll('.nav-links a');
    if (navLinkElements && navLinkElements.length > 0) {
        navLinkElements.forEach(link => {
            if (link && typeof link.addEventListener === 'function') {
                link.addEventListener('click', function(e) {
                    // Only close menu if it's not an external link or anchor
                    if (!this.getAttribute('target') && !this.getAttribute('href').startsWith('#')) {
                        e.preventDefault();
                    }
                    toggleMenu();
                });
            }
        });
    }
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
                toggleMenu();
            }
        }, 250);
    });
    
    // Handle Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navLinks.classList.contains('active')) {
            toggleMenu();
        }
    });
}

// Smooth scrolling for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#' || targetId === '#!') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Adjust for fixed header
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initSmoothScroll();
});
