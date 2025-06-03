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

    buildUrl(specimenId, testCode, result) {
        if (!this.mapping[testCode]) {
            logger.error(`No mapping found for test code: ${testCode}`);
            return;
        }

        const url = this.settings.lisPath
            .replace('#{SPECIMEN_ID}', specimenId)
            .replace('#{MEASURE_ID}', this.mapping[testCode])
            .replace('#{RESULT}', result);

        this.urls.push(url);
    }

    async sendResults(results) {
        try {
            this.urls = [];
            const { patientId, results: testResults } = results;

            testResults.forEach(result => {
                this.buildUrl(patientId, result.testCode, result.value);
            });

            if (this.urls.length === 0) {
                logger.warn('No valid results to send to IBLIS');
                return;
            }

            logger.info(`Sending ${this.urls.length} results to IBLIS for patient ${patientId}`);

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
