// Preload critical assets
function preloadAssets() {
    // Preload fonts
    const fontFiles = [
        'https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&family=Crimson+Pro:wght@400;600&display=swap',
        'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
    ];

    // Preload critical images
    const imageFiles = [
        'assets/images/main-logo.png',
        'assets/images/hero-bg.jpg'
    ];

    // Create link elements for preloading
    function createPreloadLink(href, as, type) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = href;
        if (as) link.as = as;
        if (type) link.type = type;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
    }

    // Preload fonts
    fontFiles.forEach(href => {
        createPreloadLink(href, 'style', 'text/css');
    });

    // Preload images
    imageFiles.forEach(src => {
        createPreloadLink(src, 'image');
    });

    // Load non-critical CSS asynchronously
    const styles = document.querySelectorAll('link[rel="stylesheet"]');
    styles.forEach(style => {
        if (!style.media) {
            style.media = 'print';
            style.onload = () => { style.media = 'all'; };
        }
    });
}

// Execute when DOM is fully loaded
document.addEventListener('DOMContentLoaded', preloadAssets);
