/**
 * Logger Service
 * Standardized logging with timestamps and levels.
 */
class Logger {
    static info(module, message, data = '') {
        const timestamp = new Date().toISOString();
        const dataStr = data ? (typeof data === 'object' ? JSON.stringify(data) : data) : '';
        console.log(`[${timestamp}] [INFO] [${module}] ${message} ${dataStr}`);
    }

    static error(module, message, error = '') {
        const timestamp = new Date().toISOString();
        const errStr = error ? (error.stack || error) : '';
        console.error(`[${timestamp}] [ERROR] [${module}] ${message} ${errStr}`);
    }

    static debug(module, message, data = '') {
        // Can be toggled via Config later
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [DEBUG] [${module}] ${message}`);
    }
}

module.exports = Logger;
