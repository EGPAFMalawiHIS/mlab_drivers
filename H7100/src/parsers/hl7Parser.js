const hl7 = require('hl7');
const logger = require('../utils/logger');

class HL7Parser {
    constructor() {
        this.parser = new hl7.Parser();
    }

    parse(message) {
        try {
            const parsed = this.parser.parse(message);
            return this.extractResults(parsed);
        } catch (error) {
            logger.error('Error parsing HL7 message:', error);
            throw new Error('Failed to parse HL7 message');
        }
    }

    extractResults(parsedMessage) {
        try {
            const msh = parsedMessage.getSegment('MSH');
            const pid = parsedMessage.getSegment('PID');
            const obx = parsedMessage.getSegments('OBX');

            const results = {
                messageType: msh.getField(9),
                messageTime: msh.getField(7),
                patientId: pid.getField(3),
                patientName: pid.getField(5),
                results: []
            };

            obx.forEach(segment => {
                results.results.push({
                    testCode: segment.getField(3),
                    value: segment.getField(5),
                    units: segment.getField(6),
                    referenceRange: segment.getField(7),
                    flags: segment.getField(8)
                });
            });

            return results;
        } catch (error) {
            logger.error('Error extracting results from HL7 message:', error);
            throw new Error('Failed to extract results from HL7 message');
        }
    }

    createACK(message) {
        try {
            const msh = message.getSegment('MSH');
            const ackMessage = new hl7.Message();

            ackMessage.addSegment(
                'MSH',
                '|',
                '^~\\&',
                'H7100',
                msh.getField(5),
                msh.getField(6),
                msh.getField(7),
                '',
                'ACK',
                message.getControl(),
                'P',
                '2.5'
            );

            ackMessage.addSegment(
                'MSA',
                'AA',
                message.getControl()
            );

            return ackMessage.toString();
        } catch (error) {
            logger.error('Error creating ACK message:', error);
            throw new Error('Failed to create ACK message');
        }
    }
}

module.exports = new HL7Parser();
