/**
 * Cookie Consent Script for ChromeGambles
 * GDPR Compliant Cookie Consent Banner
 */

// Create cookie consent banner when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if user has already consented
    if (!localStorage.getItem('cookieConsent')) {
        createCookieConsentBanner();
    }
});

/**
 * Creates and displays the cookie consent banner
 */
function createCookieConsentBanner() {
    // Create banner element
    const banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.className = 'cookie-consent-banner';
    
    // Set banner content
    banner.innerHTML = `
        <div class="cookie-consent-content">
            <div class="cookie-consent-text">
                <h3>Cookie Notice</h3>
                <p>We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.</p>
            </div>
            <div class="cookie-consent-buttons">
                <button id="cookie-consent-customize" class="cookie-btn customize-btn">Customize</button>
                <button id="cookie-consent-accept" class="cookie-btn accept-btn">Accept All</button>
            </div>
        </div>
        <div class="cookie-consent-settings" style="display: none;">
            <div class="cookie-settings-header">
                <h3>Cookie Settings</h3>
                <button id="cookie-settings-close" class="cookie-settings-close">&times;</button>
            </div>
            <div class="cookie-settings-content">
                <div class="cookie-setting-item">
                    <div class="cookie-setting-info">
                        <h4>Essential Cookies</h4>
                        <p>These cookies are necessary for the website to function and cannot be switched off.</p>
                    </div>
                    <div class="cookie-setting-toggle">
                        <input type="checkbox" id="essential-cookies" checked disabled>
                        <label for="essential-cookies"></label>
                    </div>
                </div>
                <div class="cookie-setting-item">
                    <div class="cookie-setting-info">
                        <h4>Analytics Cookies</h4>
                        <p>These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site.</p>
                    </div>
                    <div class="cookie-setting-toggle">
                        <input type="checkbox" id="analytics-cookies" checked>
                        <label for="analytics-cookies"></label>
                    </div>
                </div>
                <div class="cookie-setting-item">
                    <div class="cookie-setting-info">
                        <h4>Marketing Cookies</h4>
                        <p>These cookies may be set through our site by our advertising partners to build a profile of your interests.</p>
                    </div>
                    <div class="cookie-setting-toggle">
                        <input type="checkbox" id="marketing-cookies" checked>
                        <label for="marketing-cookies"></label>
                    </div>
                </div>
            </div>
            <div class="cookie-settings-footer">
                <button id="cookie-settings-save" class="cookie-btn save-btn">Save Preferences</button>
            </div>
        </div>
    `;
    
    // Add banner styles
    const style = document.createElement('style');
    style.textContent = `
        .cookie-consent-banner {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: rgba(18, 18, 18, 0.95);
            color: #fff;
            z-index: 9999;
            box-shadow: 0 -5px 15px rgba(0, 0, 0, 0.3);
            font-family: 'Poppins', sans-serif;
        }
        
        .cookie-consent-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 2rem;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .cookie-consent-text {
            flex: 1;
        }
        
        .cookie-consent-text h3 {
            margin: 0 0 0.5rem;
            color: var(--primary-color);
        }
        
        .cookie-consent-text p {
            margin: 0;
            font-size: 0.9rem;
            opacity: 0.9;
        }
        
        .cookie-consent-buttons {
            display: flex;
            gap: 1rem;
            margin-left: 2rem;
        }
        
        .cookie-btn {
            padding: 0.5rem 1.5rem;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .customize-btn {
            background-color: transparent;
            border: 1px solid var(--primary-color);
            color: var(--primary-color);
        }
        
        .customize-btn:hover {
            background-color: rgba(0, 168, 107, 0.1);
        }
        
        .accept-btn {
            background-color: var(--primary-color);
            color: white;
        }
        
        .accept-btn:hover {
            background-color: #008f5b;
        }
        
        .cookie-consent-settings {
            padding: 1.5rem 2rem;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            max-width: 1200px;
            margin: 0 auto;
        }
        
        .cookie-settings-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
        }
        
        .cookie-settings-header h3 {
            margin: 0;
            color: var(--primary-color);
        }
        
        .cookie-settings-close {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            line-height: 1;
        }
        
        .cookie-setting-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .cookie-setting-info {
            flex: 1;
        }
        
        .cookie-setting-info h4 {
            margin: 0 0 0.5rem;
        }
        
        .cookie-setting-info p {
            margin: 0;
            font-size: 0.85rem;
            opacity: 0.8;
        }
        
        .cookie-setting-toggle {
            margin-left: 2rem;
        }
        
        .cookie-setting-toggle input[type="checkbox"] {
            display: none;
        }
        
        .cookie-setting-toggle label {
            display: inline-block;
            width: 50px;
            height: 26px;
            background-color: #ccc;
            border-radius: 13px;
            position: relative;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }
        
        .cookie-setting-toggle label::after {
            content: '';
            position: absolute;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background-color: white;
            top: 3px;
            left: 3px;
            transition: transform 0.3s ease;
        }
        
        .cookie-setting-toggle input[type="checkbox"]:checked + label {
            background-color: var(--primary-color);
        }
        
        .cookie-setting-toggle input[type="checkbox"]:checked + label::after {
            transform: translateX(24px);
        }
        
        .cookie-setting-toggle input[type="checkbox"]:disabled + label {
            opacity: 0.7;
            cursor: not-allowed;
        }
        
        .cookie-settings-footer {
            padding-top: 1.5rem;
            text-align: right;
        }
        
        .save-btn {
            background-color: var(--primary-color);
            color: white;
        }
        
        .save-btn:hover {
            background-color: #008f5b;
        }
        
        @media (max-width: 768px) {
            .cookie-consent-content {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .cookie-consent-buttons {
                margin-left: 0;
                margin-top: 1rem;
                width: 100%;
            }
            
            .cookie-btn {
                flex: 1;
                text-align: center;
            }
        }
    `;
    
    // Append style and banner to document
    document.head.appendChild(style);
    document.body.appendChild(banner);
    
    // Add event listeners
    document.getElementById('cookie-consent-accept').addEventListener('click', function() {
        acceptAllCookies();
        hideBanner();
    });
    
    document.getElementById('cookie-consent-customize').addEventListener('click', function() {
        toggleSettings();
    });
    
    document.getElementById('cookie-settings-close').addEventListener('click', function() {
        toggleSettings();
    });
    
    document.getElementById('cookie-settings-save').addEventListener('click', function() {
        savePreferences();
        hideBanner();
    });
}

/**
 * Accepts all cookies
 */
function acceptAllCookies() {
    const cookiePreferences = {
        essential: true,
        analytics: true,
        marketing: true,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('cookieConsent', JSON.stringify(cookiePreferences));
}

/**
 * Saves user cookie preferences
 */
function savePreferences() {
    const cookiePreferences = {
        essential: true, // Always required
        analytics: document.getElementById('analytics-cookies').checked,
        marketing: document.getElementById('marketing-cookies').checked,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('cookieConsent', JSON.stringify(cookiePreferences));
}

/**
 * Toggles cookie settings visibility
 */
function toggleSettings() {
    const content = document.querySelector('.cookie-consent-content');
    const settings = document.querySelector('.cookie-consent-settings');
    
    if (settings.style.display === 'none') {
        content.style.display = 'none';
        settings.style.display = 'block';
    } else {
        content.style.display = 'flex';
        settings.style.display = 'none';
    }
}

/**
 * Hides the cookie consent banner
 */
function hideBanner() {
    const banner = document.getElementById('cookie-consent-banner');
    banner.style.animation = 'fadeOut 0.5s ease forwards';
    
    setTimeout(function() {
        banner.remove();
    }, 500);
}

/**
 * Gets the current cookie preferences
 * @returns {Object} Cookie preferences
 */
function getCookiePreferences() {
    const preferences = localStorage.getItem('cookieConsent');
    return preferences ? JSON.parse(preferences) : null;
}

// Export functions for external use
window.CookieConsent = {
    getPreferences: getCookieConsent,
    showBanner: createCookieConsentBanner,
    hasConsent: function() {
        return localStorage.getItem('cookieConsent') !== null;
    }
};
