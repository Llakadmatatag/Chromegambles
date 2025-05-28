/**
 * Secure Logger
 * 
 * A safe logging utility that prevents sensitive data leakage in production.
 * All debug logs are automatically stripped in production builds.
 */

// Only create the logger if it doesn't exist
if (!window.SecureLogger) {
    class SecureLogger {
        constructor() {
            this.levels = {
                error: 0,
                warn: 1,
                info: 2,
                debug: 3,
                trace: 4
            };
            
            // Default log level based on environment
            this.logLevel = window.CONFIG?.DEBUG ? 'debug' : 'error';
            
            // Bind methods
            this.error = this.error.bind(this);
            this.warn = this.warn.bind(this);
            this.info = this.info.bind(this);
            this.debug = this.debug.bind(this);
            this.trace = this.trace.bind(this);
        }

        /**
         * Check if logging is enabled for the given level
         * @private
         */
        _shouldLog(level) {
            if (!window.CONFIG) return false;
            if (level === 'error') return true; // Always log errors
            return this.levels[level] <= this.levels[this.logLevel];
        }

        /**
         * Format log message with timestamp and level
         * @private
         */
        _formatMessage(level, message) {
            const timestamp = new Date().toISOString();
            return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        }

        /**
         * Log error message
         * @param {string} message - The message to log
         * @param {Error} [error] - Optional error object
         * @param {Object} [data] - Additional data to log
         */
        error(message, error, data) {
            if (this._shouldLog('error')) {
                const formatted = this._formatMessage('error', message);
                if (error) {
                    console.error(formatted, error, data || '');
                } else {
                    console.error(formatted, data || '');
                }
            }
        }

        /**
         * Log warning message
         * @param {string} message - The message to log
         * @param {Object} [data] - Additional data to log
         */
        warn(message, data) {
            if (this._shouldLog('warn')) {
                console.warn(this._formatMessage('warn', message), data || '');
            }
        }

        /**
         * Log info message
         * @param {string} message - The message to log
         * @param {Object} [data] - Additional data to log
         */
        info(message, data) {
            if (this._shouldLog('info')) {
                console.info(this._formatMessage('info', message), data || '');
            }
        }

        /**
         * Log debug message (only in development)
         * @param {string} message - The message to log
         * @param {Object} [data] - Additional data to log
         */
        debug(message, data) {
            if (this._shouldLog('debug')) {
                console.debug(this._formatMessage('debug', message), data || '');
            }
        }

        /**
         * Log trace message (only in development)
         * @param {string} message - The message to log
         * @param {Object} [data] - Additional data to log
         */
        trace(message, data) {
            if (this._shouldLog('trace')) {
                console.trace(this._formatMessage('trace', message), data || '');
            }
        }
    }

    // Create singleton instance
    window.SecureLogger = new SecureLogger();
    
    // Override console methods in production
    if (!window.CONFIG?.DEBUG) {
        // Save original console methods
        const originalConsole = {
            log: console.log,
            debug: console.debug,
            info: console.info,
            warn: console.warn,
            error: console.error,
            trace: console.trace
        };

        // Override console methods
        console.log = function() {
            if (window.CONFIG?.FEATURES?.DEBUG_LOGGING) {
                originalConsole.log.apply(console, arguments);
            }
        };

        console.debug = function() {
            // Disable debug logs in production
            if (window.CONFIG?.DEBUG) {
                originalConsole.debug.apply(console, arguments);
            }
        };

        console.info = function() {
            if (window.CONFIG?.FEATURES?.DEBUG_LOGGING) {
                originalConsole.info.apply(console, arguments);
            }
        };

        // Keep warnings and errors in production
        console.warn = originalConsole.warn.bind(console);
        console.error = originalConsole.error.bind(console);
        
        // Disable trace in production
        console.trace = function() {
            if (window.CONFIG?.DEBUG) {
                originalConsole.trace.apply(console, arguments);
            }
        };
        
        // Prevent console method overrides
        Object.defineProperty(window, 'console', {
            value: console,
            writable: false,
            configurable: false
        });
    }
}
