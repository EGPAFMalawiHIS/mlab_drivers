const connectionHandler = require('./connection/connectionHandler');
const logger = require('./utils/logger');

process.chdir(__dirname);

class H7100Driver {
    constructor() {
        logger.info('Initializing H7100 Driver');
    }

    start() {
        try {
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

// Create and start the driver immediately
const driver = new H7100Driver();
driver.start();

module.exports = driver;
