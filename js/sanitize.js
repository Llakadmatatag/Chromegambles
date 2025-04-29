/**
 * Security utility functions for sanitizing input and output
 */

// DOMPurify is a library for sanitizing HTML, but we'll create our own simple sanitizer
const sanitize = {
    /**
     * Sanitize a string to prevent XSS attacks
     * @param {string} input - The input string to sanitize
     * @returns {string} - The sanitized string
     */
    escapeHTML: function(input) {
        if (!input || typeof input !== 'string') {
            return '';
        }
        
        return input
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },
    
    /**
     * Sanitize a string for use in a URL
     * @param {string} input - The input string to sanitize
     * @returns {string} - The sanitized string
     */
    escapeURL: function(input) {
        if (!input || typeof input !== 'string') {
            return '';
        }
        
        return encodeURIComponent(input);
    },
    
    /**
     * Create a safe HTML element with sanitized content
     * @param {string} tag - The HTML tag to create
     * @param {object} attributes - The attributes to add to the element
     * @param {string|HTMLElement|Array} content - The content to add to the element
     * @returns {HTMLElement} - The created element
     */
    createSafeElement: function(tag, attributes = {}, content = '') {
        // Create the element
        const element = document.createElement(tag);
        
        // Add attributes
        for (const [key, value] of Object.entries(attributes)) {
            // Skip event handlers (on*)
            if (key.startsWith('on')) {
                console.warn(`Skipping potentially unsafe attribute: ${key}`);
                continue;
            }
            
            // Skip javascript: URLs
            if ((key === 'href' || key === 'src') && 
                typeof value === 'string' && 
                value.toLowerCase().trim().startsWith('javascript:')) {
                console.warn(`Skipping potentially unsafe URL: ${value}`);
                continue;
            }
            
            // Set the attribute
            element.setAttribute(key, value);
        }
        
        // Add content
        if (content) {
            if (typeof content === 'string') {
                element.textContent = content;
            } else if (content instanceof HTMLElement) {
                element.appendChild(content);
            } else if (Array.isArray(content)) {
                content.forEach(item => {
                    if (typeof item === 'string') {
                        const textNode = document.createTextNode(item);
                        element.appendChild(textNode);
                    } else if (item instanceof HTMLElement) {
                        element.appendChild(item);
                    }
                });
            }
        }
        
        return element;
    },
    
    /**
     * Validate and sanitize a number
     * @param {any} input - The input to validate and sanitize
     * @param {number} defaultValue - The default value to return if the input is not a valid number
     * @param {number} min - The minimum allowed value
     * @param {number} max - The maximum allowed value
     * @returns {number} - The sanitized number
     */
    sanitizeNumber: function(input, defaultValue = 0, min = null, max = null) {
        let num = Number(input);
        
        if (isNaN(num)) {
            return defaultValue;
        }
        
        if (min !== null && num < min) {
            return min;
        }
        
        if (max !== null && num > max) {
            return max;
        }
        
        return num;
    },
    
    /**
     * Validate and sanitize a date string
     * @param {string} input - The input date string to validate and sanitize
     * @param {string} defaultValue - The default value to return if the input is not a valid date
     * @returns {string} - The sanitized date string in ISO format
     */
    sanitizeDate: function(input, defaultValue = '') {
        if (!input || typeof input !== 'string') {
            return defaultValue;
        }
        
        const date = new Date(input);
        
        if (isNaN(date.getTime())) {
            return defaultValue;
        }
        
        return date.toISOString();
    }
};

// Make the sanitize object available globally
window.sanitize = sanitize;
