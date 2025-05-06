/**
 * Enhanced security utility functions for sanitizing input and output
 * This module provides comprehensive data validation and sanitization
 * to protect against XSS, injection attacks, and data corruption.
 */

// Create our own robust sanitizer with enhanced security features
const sanitize = {
    /**
     * Escape HTML special characters to prevent XSS
     * @param {string} str - The string to escape
     * @returns {string} - The escaped string
     */
    escapeHTML: function(str) {
        if (str === undefined || str === null) {
            return '';
        }
        
        // Convert to string if it's not already
        const safeStr = String(str);
        
        return safeStr
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    },
    
    /**
     * Create a safe DOM element with sanitized attributes and content
     * @param {string} tagName - The tag name of the element to create
     * @param {Object} attributes - The attributes to set on the element
     * @param {string} [content] - Optional text content for the element
     * @returns {HTMLElement} - The created element
     */
    createSafeElement: function(tagName, attributes, content) {
        // Whitelist of allowed tags
        const allowedTags = [
            'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li', 'a', 'button', 'i', 'img', 'table',
            'tr', 'td', 'th', 'thead', 'tbody', 'style'
        ];
        
        // Whitelist of allowed attributes
        const allowedAttributes = [
            'id', 'class', 'href', 'src', 'alt', 'title', 'target',
            'rel', 'type', 'value', 'placeholder', 'aria-label',
            'aria-hidden', 'role', 'tabindex', 'disabled'
        ];
        
        // Ensure the tag is allowed
        if (!allowedTags.includes(tagName.toLowerCase())) {
            console.error(`Tag not allowed: ${tagName}`);
            return document.createTextNode('');
        }
        
        // Create the element
        const element = document.createElement(tagName);
        
        // Set sanitized attributes
        if (attributes && typeof attributes === 'object') {
            Object.keys(attributes).forEach(attr => {
                const attrLower = attr.toLowerCase();
                
                // Check if attribute is allowed
                if (allowedAttributes.includes(attrLower) || attrLower.startsWith('data-')) {
                    // Sanitize attribute value
                    const value = this.escapeHTML(attributes[attr]);
                    
                    // Special handling for href to prevent javascript: URLs
                    if (attrLower === 'href' && value.toLowerCase().startsWith('javascript:')) {
                        element.setAttribute(attr, '#');
                    } else {
                        element.setAttribute(attr, value);
                    }
                }
            });
        }
        
        // Set sanitized content if provided
        if (content !== undefined) {
            element.textContent = content;
        }
        
        return element;
    },
    
    /**
     * Sanitize a number value
     * @param {number|string} value - The value to sanitize
     * @param {number} defaultValue - The default value to use if parsing fails
     * @returns {number} - The sanitized number
     */
    sanitizeNumber: function(value, defaultValue = 0) {
        if (value === undefined || value === null) {
            return defaultValue;
        }
        
        let num;
        
        if (typeof value === 'string') {
            // Remove any non-numeric characters except decimal point and minus sign
            const cleanStr = value.replace(/[^0-9.-]/g, '');
            num = parseFloat(cleanStr);
        } else if (typeof value === 'number') {
            num = value;
        } else {
            return defaultValue;
        }
        
        // Check if the result is a valid number
        if (isNaN(num) || !isFinite(num)) {
            return defaultValue;
        }
        
        return num;
    },
    
    /**
     * Validate and sanitize a URL
     * @param {string} url - The URL to validate
     * @param {string} defaultUrl - The default URL to use if validation fails
     * @returns {string} - The sanitized URL
     */
    validateUrl: function(url, defaultUrl = '#') {
        if (!url || typeof url !== 'string') {
            return defaultUrl;
        }
        
        // Check if the URL is relative or has a safe protocol
        const safeProtocols = ['http:', 'https:'];
        try {
            const urlObj = new URL(url, window.location.origin);
            if (!safeProtocols.includes(urlObj.protocol)) {
                console.warn(`Unsafe URL protocol: ${urlObj.protocol}`);
                return defaultUrl;
            }
            return urlObj.href;
        } catch (e) {
            console.error('Invalid URL:', e);
            return defaultUrl;
        }
    }
};
