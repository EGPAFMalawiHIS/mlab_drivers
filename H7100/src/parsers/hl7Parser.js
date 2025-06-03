const hl7 = require('simple-hl7');
const logger = require('../utils/logger');

class HL7Parser {
    constructor() {
        this.parser = new hl7.Parser();
        this.server = hl7.tcp();
    }

    parse(message) {
        try {
            const msg = this.parser.parse(message);
            return this.extractResults(msg);
        } catch (error) {
            logger.error('Error parsing HL7 message:', error);
            throw new Error('Failed to parse HL7 message');
        }
    }

    extractResults(msg) {
        try {
            const pid = msg.getSegment('PID');
            const obx = msg.getSegments('OBX');

            const results = {
                patientId: pid.getComponent(1, 1),
                patientName: pid.getComponent(5, 1),
                results: []
            };

            obx.forEach(segment => {
                results.results.push({
                    testCode: segment.getComponent(3, 1),
                    value: segment.getComponent(5, 1),
                    units: segment.getComponent(6, 1),
                    referenceRange: segment.getComponent(7, 1),
                    flags: segment.getComponent(8, 1)
                });
            });

            return results;
        } catch (error) {
            logger.error('Error extracting results from HL7 message:', error);
            throw new Error('Failed to extract results from HL7 message');
        }
    }

    createACK(msg) {
        try {
            const ack = new hl7.Message(
                msg.header.getComponent(3, 1),     // Sending Application
                msg.header.getComponent(4, 1),     // Sending Facility
                msg.header.getComponent(1, 1),     // Receiving Application
                msg.header.getComponent(2, 1),     // Receiving Facility
                'ACK',                             // Message Type
                msg.header.getComponent(9, 1),     // Message Control ID
                'P',                               // Processing ID
                '2.5'                              // Version ID
            );

            // Add MSA segment
            ack.addSegment(
                'MSA',
                'AA',                              // Acknowledgment Code
                msg.header.getComponent(9, 1)      // Message Control ID
            );

            return ack.toString();
        } catch (error) {
            logger.error('Error creating ACK message:', error);
            throw new Error('Failed to create ACK message');
        }
    }
}

module.exports = new HL7Parser();
