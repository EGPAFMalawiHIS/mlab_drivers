require('dotenv').config();

module.exports = {
    port: process.env.PORT || 5000,
    host: process.env.HOST || '0.0.0.0',
    logLevel: process.env.LOG_LEVEL || 'info',
    retryInterval: process.env.RETRY_INTERVAL || 5000,
    maxRetries: process.env.MAX_RETRIES || 5,
    resultCallback: null
};
