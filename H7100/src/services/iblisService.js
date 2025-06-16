const utils = require('@egpafmalawi/machine-driver-utility');
const logger = require('../utils/logger');
const settings = require('../../config/settings.json');
const mapping = require('../../config/mapping.json');

class IblisService {
    constructor() {
        this.urls = [];
        this.settings = settings;
        this.mapping = mapping;
    }

    buildUrl(specimenId, testCode, result) {const url = this.settings.lisPath
            .replace('#{SPECIMEN_ID}', specimenId)
            .replace('#{MEASURE_ID}', this.mapping[testCode])
            .replace('#{RESULT}', result);

        this.urls.push(url);
    }

    async sendResults(results) {
        try {
            this.urls = [];
            const { sampleID, results: testResults } = results;

            testResults.forEach(result => {
                this.buildUrl(sampleID, result.id, result.value);
            });

            if (this.urls.length === 0) {
                logger.warn('No valid results to send to IBLIS');
                return;
            }

            logger.info(`Sending ${this.urls.length} results to IBLIS for patient ${sampleID}`);
            logger.info(this.urls)

            utils.sendDataToIBLIS(
                this.urls,
                this.settings.lisUser,
                this.settings.lisPassword
            );

            logger.info('Results successfully sent to IBLIS');
            this.urls = [];
        } catch (error) {
            logger.error('Error sending results to IBLIS:', error.message);
            this.urls = [];
            throw error;
        }
    }
}

module.exports = new IblisService();
