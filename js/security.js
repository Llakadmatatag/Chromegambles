/**
 * Security utilities for ChromeGambles
 * Provides protection against XSS and CSRF attacks
 */

// XSS Protection
const SecurityUtils = {
    /**
     * Sanitize HTML to prevent XSS attacks
     * @param {string} str - The string to be sanitized
     * @returns {string} Sanitized string safe for HTML output
     */
    escapeHtml: function(str) {
        if (typeof str !== 'string') return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    },

    /**
     * Safely set text content of an element
     * @param {Element} element - The DOM element
     * @param {string} text - The text to set
     */
    safeTextContent: function(element, text) {
        if (!element || !element.textContent) return;
        element.textContent = text;
    },

    /**
     * Safely set innerHTML of an element with sanitized content
     * @param {Element} element - The DOM element
     * @param {string} html - The HTML to set (will be sanitized)
     */
    safeInnerHTML: function(element, html) {
        if (!element || !element.innerHTML) return;
        element.innerHTML = this.escapeHtml(html);
    },

    // CSRF Protection
    csrfToken: null,

    /**
     * Generate a CSRF token
     * @returns {string} A random token
     */
    generateCSRFToken: function() {
        const array = new Uint32Array(10);
        window.crypto.getRandomValues(array);
        return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
    },

    /**
     * Initialize CSRF protection
     * Should be called when the page loads
     */
    initCSRF: function() {
        // Get existing token or generate a new one
        this.csrfToken = localStorage.getItem('csrfToken') || this.generateCSRFToken();
        localStorage.setItem('csrfToken', this.csrfToken);
        
        // Add token to all forms
        document.querySelectorAll('form').forEach(form => {
            this.addCSRFField(form);
        });
        
        // Add token to all fetch requests
        this.interceptFetch();
    },
    
    /**
     * Add CSRF token to a form
     * @param {HTMLFormElement} form - The form element
     */
    addCSRFField: function(form) {
        // Don't add if already exists
        if (form.querySelector('input[name="_csrf"]')) return;
        
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_csrf';
        csrfInput.value = this.csrfToken;
        form.appendChild(csrfInput);
    },
    
    /**
     * Intercept fetch requests to add CSRF token
     */
    interceptFetch: function() {
        const originalFetch = window.fetch;
        
        window.fetch = async function(resource, init = {}) {
            // Add CSRF token to headers if this is a same-origin request
            if (typeof resource === 'string' && resource.startsWith('/')) {
                init.headers = {
                    ...init.headers,
                    'X-CSRF-Token': SecurityUtils.csrfToken
                };
            }
            
            return originalFetch(resource, init);
        };
    }
};

// Initialize CSRF protection when the script loads
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        SecurityUtils.initCSRF();
    });
}
