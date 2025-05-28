/**
 * Application Configuration - Production
 * 
 * WARNING: This file contains sensitive configuration.
 * Never commit this file to version control.
 */

// Environment detection
const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

const CONFIG = {
    // Debug mode - only enable in development
    DEBUG: isLocalhost,
    
    // API Configuration
    API: {
        ENDPOINT: isLocalhost 
            ? 'http://localhost:3000/api' 
            : 'https://api.chromegambles.com/api',
        TIMEOUT: 15000 // 15 seconds
    },
    
    // Security Settings
    SECURITY: {
        // Set secure flag for cookies in production
        SECURE_COOKIES: !isLocalhost,
        // Enable CSP in production
        USE_CSP: !isLocalhost,
        // Enable HSTS in production
        USE_HSTS: !isLocalhost
    },
    
    // Feature Flags
    FEATURES: {
        // Disable debug features in production
        DEBUG_LOGGING: isLocalhost,
        // Disable performance monitoring in production
        PERFORMANCE_MONITORING: !isLocalhost
    }
};

// Freeze the config to prevent modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.API);
Object.freeze(CONFIG.SECURITY);
Object.freeze(CONFIG.FEATURES);

// Export to window
window.CONFIG = CONFIG;
