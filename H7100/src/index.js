const connectionHandler = require('./connection/connectionHandler');
const config = require('./config/config');
const logger = require('./utils/logger');

class H7100Driver {
    constructor() {
        logger.info('Initializing H7100 Driver');
    }

    start(resultCallback) {
        try {
            config.resultCallback = resultCallback;
            connectionHandler.start();

            logger.info('H7100 Driver started successfully');
        } catch (error) {
            logger.error('Failed to start H7100 Driver:', error);
            throw error;
        }
    }

    stop() {
        try {
            connectionHandler.stop();
            logger.info('H7100 Driver stopped');
        } catch (error) {
            logger.error('Error stopping H7100 Driver:', error);
            throw error;
        }
    }
}

module.exports = new H7100Driver();
