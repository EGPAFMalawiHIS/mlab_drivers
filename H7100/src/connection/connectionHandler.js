const hl7 = require('simple-hl7');
const logger = require('../utils/logger');
const settings = require('../../config/settings.json');
const iblisService = require('../services/iblisService');

class ConnectionHandler {
    constructor() {
        this.server = hl7.tcp();
    }

    start() {
        this.server.use((req, res, next) => {
            logger.info('New message received');

            try {
                const results = this.processMessage(req.msg);

                // Send acknowledgment
                res.end();

                // Send results to IBLIS
                iblisService.sendResults(results);
            } catch (error) {
                logger.error('Error processing message:', error);
                res.end(new Error('Failed to process message'));
            }
        });

        this.server.start(settings.port, settings.host);
        logger.info(`Server listening on ${settings.host}:${settings.port}`);
    }

    processMessage(msg) {
        try {
            const pid = msg.getSegment('PID');
            const obx = msg.getSegments('OBX');

            const results = {
                patientId: pid.getComponent(1, 1),
                results: []
            };

            obx.forEach(segment => {
                results.results.push({
                    testCode: segment.getComponent(3, 1),
                    value: segment.getComponent(5, 1)
                });
            });

            return results;
        } catch (error) {
            logger.error('Error processing message:', error);
            throw error;
        }
    }

    stop() {
        if (this.server) {
            this.server.stop();
            logger.info('Server stopped');
        }
    }
}

module.exports = new ConnectionHandler();
