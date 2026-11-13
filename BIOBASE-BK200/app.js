process.chdir(__dirname);

const path = require('path');
const hl7 = require('simple-hl7');
const client = require('node-rest-client').Client;

const settings = require(path.resolve('.', 'config', 'settings.json'));
const mapping = require(path.resolve('.', 'config', 'mapping.json'));
const parameters = require(path.resolve('.', 'config', 'parameters.json'));

const options_auth = {
    user: settings.lisUser,
    password: settings.lisPassword
};

const hl7Service = hl7.tcp();

const PORT = settings.port || 5500;
const MACHINE_NAME = settings.machineName || 'BIOBASE-BK200';

console.log(`========= BIOBASE BK200 HL7 SERVICE STARTED ON PORT ${PORT} =========`);

/**
 * Send results to IBLIS server
 * @param {Array} urls - Array of URLs to send
 */
function sendData(urls) {
    if (!urls || urls.length === 0) {
        console.log('No URLs to send');
        return;
    }

    console.info('Sending data to IBLIS...');
    const url = encodeURI(urls[0].replace("+", ""));
    const encodedUrl = url.replace("---", "");
    urls.shift();

    console.log(`Sending: ${encodedUrl}`);

    const restClient = new client(options_auth);

    restClient.get(encodedUrl, function (data, response) {
        if (response.statusCode === 200) {
            console.log('Data sent successfully');
        } else {
            console.log(`Warning: Response status ${response.statusCode}`);
        }

        if (urls.length > 0) {
            sendData(urls);
        }
    }).on('error', function (err) {
        console.error(`Error sending data: ${err.message}`);

        if (urls.length > 0) {
            console.log('Continuing with remaining URLs...');
            setTimeout(() => sendData(urls), 1000);
        }
    });
}

/**
 * Process HL7 message and extract results
 * @param {Object} msg - HL7 message object
 * @returns {Array} Array of URLs to send to IBLIS
 */
function processHL7Message(msg) {
    console.log('Processing HL7 message...');
    console.log('Message log:', msg.log());

    let urls = [];
    let sampleId = '';

    try {
        try {
            const pidSegment = msg.getSegment('PID');
            if (pidSegment && pidSegment.fields[2]) {
                sampleId = pidSegment.fields[2].value[0][0].value[0] || pidSegment.fields[2].value[0];
            }
        } catch (pidError) {
            console.log('PID segment not found or invalid, trying OBR...');
        }

        if (!sampleId) {
            try {
                const obrSegment = msg.getSegment('OBR');
                if (obrSegment && obrSegment.fields[2]) {
                    sampleId = obrSegment.fields[2].value[0];
                }
            } catch (obrError) {
                console.log('OBR segment not found or invalid');
            }
        }

        if (!sampleId) {
            console.error('Sample ID not found in HL7 message');
            return [];
        }

        const obxSegments = msg.getSegments('OBX');
        obxSegments.forEach((obx, index) => {
            try {

                // Extract the actual test name from the correct field path
                const testName = obx.fields[2]?.value[0][1]?.value[0] || '';
                const observationValue = obx.fields[4]?.value[0][0]?.value[0] || '';
                const units = obx.fields[5]?.value[0] || '';
                const referenceRange = obx.fields[6]?.value[0] || '';

                console.log(`Test Name: "${testName}"`);
                console.log(`Value: "${observationValue}"`);
                console.log(`Units: "${units}"`);
                console.log(`Reference Range: "${referenceRange}"`);

                if (testName && observationValue) {
                    // Check if we have a mapping for this test
                    const mappedParameter = parameters[testName];

                    if (mappedParameter && mapping[mappedParameter]) {
                        console.log(`✓ Test: ${testName} → ${mappedParameter} → Measure ID: ${mapping[mappedParameter]}`);

                        // Skip results with invalid values (--- means no result/error)
                        if (observationValue &&
                            observationValue !== '---' &&
                            observationValue !== '' &&
                            !observationValue.toString().startsWith('---')) {

                            let url = settings.lisPath;
                            url = url.replace('#{SPECIMEN_ID}', encodeURIComponent(sampleId));
                            url = url.replace('#{MEASURE_ID}', encodeURIComponent(mapping[mappedParameter]));
                            url = url.replace('#{RESULT}', encodeURIComponent(observationValue));
                            url = url.replace('#{MACHINE_NAME}', encodeURIComponent(MACHINE_NAME));

                            urls.push(url);
                            console.log(`✓ URL created for ${testName}`);
                        } else {
                            console.log(`⚠ Skipping invalid result for ${testName}: "${observationValue}"`);
                        }
                    } else {
                        console.log(`✗ No mapping found for test: "${testName}"`);
                        console.log('Available parameters:', Object.keys(parameters).slice(0, 10).join(', '));
                        console.log(`⚠ Consider adding "${testName}" to parameters.json`);
                    }
                }
            } catch (obxError) {
                console.error(`Error processing OBX segment ${index + 1}:`, obxError.message);
            }
        });

    } catch (error) {
        console.error('Error processing HL7 message:', error.message);
    }

    console.log(`Generated ${urls.length} URLs for transmission`);
    return urls;
}

hl7Service.use(function(req, res) {
    console.log('\n===== HL7 CONNECTION ESTABLISHED =====');
    console.log('Connected to BIOBASE BK200 machine');

    try {
        const urls = processHL7Message(req.msg);

        if (urls.length > 0) {
            console.log(`Sending ${urls.length} results to IBLIS...`);
            sendData(urls);
        } else {
            console.log('No valid results found in HL7 message');
        }
        res.end();
    } catch (error) {
        console.error('Error processing HL7 message:', error);
        res.end(new Error('Failed to process message'));
        console.log('NACK sent to machine due to error');
    }

    console.log('======================================\n');
});

hl7Service.on('error', function(err) {
    console.error('HL7 Service Error:', err);
});

hl7Service.start(PORT);

console.log(`BIOBASE BK200 HL7 Driver started successfully`);
console.log(`Server listening on port ${PORT}`);

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = hl7Service;
