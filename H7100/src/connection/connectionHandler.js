const hl7 = require('simple-hl7');
const logger = require('../utils/logger');
const settings = require('../../config/settings.json');
const iblisService = require('../services/iblisService');
const mapping = require('../../config/mapping.json')

class ConnectionHandler {
    constructor() {
        this.server = hl7.tcp();
    }

    start() {
        this.server.use((req, res, next) => {
            logger.info('New message received');
            try {
                const results = this.processMessage(req.msg);
                res.end();
                iblisService.sendResults(results);
            } catch (error) {
                logger.error('Error processing message:', error);
                res.end(new Error('Failed to process message'));
            }
        });

        this.server.start(settings.port, 'utf-8', { host: settings.host });
        logger.info(`Server listening on ${settings.host}:${settings.port}`);
    }

    processMessage(msg) {
        try {
            let sampleID = msg.getSegment('OBR').fields[2].value[0];
            let results = msg.getSegments('OBX');
            
            const processedResults = {
                sampleID: sampleID,
                results: []
            };
            
            results.forEach(result => {
                let measureName = result.fields[2].value[0][1].value[0];
                let measureResult = result.fields[4].value[0][0].value[0];
                let measureID = mapping[measureName] || ""
                
                processedResults.results.push({
                    name: measureName,
                    result: measureResult,
                    id: measureID
                });
            });            
            return processedResults;
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
