// Lazy loading images with intersection observer
class LazyLoader {
    constructor() {
        this.observer = null;
        this.config = {
            rootMargin: '200px 0px',
            threshold: 0.01
        };
    }

    init() {
        // Check if IntersectionObserver is supported
        if (!('IntersectionObserver' in window)) {
            this.loadAllImages();
            return;
        }

        // Create observer
        this.observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.handleIntersect(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, this.config);

        // Observe all lazy images
        document.querySelectorAll('img[data-src], iframe[data-src]').forEach(el => {
            this.observer.observe(el);
        });
    }

    handleIntersect(element) {
        // Handle image loading
        if (element.tagName === 'IMG') {
            const src = element.getAttribute('data-src');
            if (src) {
                element.src = src;
                element.removeAttribute('data-src');
                
                // Handle srcset if exists
                const srcset = element.getAttribute('data-srcset');
                if (srcset) {
                    element.srcset = srcset;
                    element.removeAttribute('data-srcset');
                }

                // Add loaded class for transition effects
                element.addEventListener('load', () => {
                    element.classList.add('lazyloaded');
                });
            }
        } 
        // Handle iframe loading
        else if (element.tagName === 'IFRAME') {
            const src = element.getAttribute('data-src');
            if (src) {
                element.src = src;
                element.removeAttribute('data-src');
            }
        }
    }

    loadAllImages() {
        // Fallback for browsers without IntersectionObserver
        document.querySelectorAll('img[data-src], iframe[data-src]').forEach(el => {
            if (el.tagName === 'IMG') {
                el.src = el.getAttribute('data-src');
                el.removeAttribute('data-src');
                
                const srcset = el.getAttribute('data-srcset');
                if (srcset) {
                    el.srcset = srcset;
                    el.removeAttribute('data-srcset');
                }
            } else if (el.tagName === 'IFRAME') {
                el.src = el.getAttribute('data-src');
                el.removeAttribute('data-src');
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const lazyLoader = new LazyLoader();
    lazyLoader.init();
});
