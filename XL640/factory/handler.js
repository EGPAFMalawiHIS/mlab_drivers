const regex = require('../helpers/regex');
const mappings = require('../helpers/mapping.json');
const parameterRegexMap = regex.parameterRegexMap;
const settings = require('../config/lis.json');

const AxiosInstance = require('../server/axios');

var ACCESSION_NUMBER = '';
var urls = new Array();

/**
 * @class Handler
 * @extends AxiosInstance
 * @constructor bufferData
 */
class Handler extends AxiosInstance {

    constructor(data) {
        this.data = data;
    };

    /**
     * @method proccessData gets buffer data to readable format
     * @params null
     * @returns null
     */
    processData() {
        const buffer = Buffer.from(data, 'utf8');
        const messages = buffer.toString('utf8').split('\r').map(message => message.trim());
        messages.forEach((data) => {
            const match = data.match(/(?<=O\|1\|)([0-9]+)(?=\|)/g);
            if (match) {
                console.log("accession number: ", match[0])
                ACCESSION_NUMBER = match[0]
            }
            for (const key of Object.keys(parameterRegexMap)) {
                const regex = parameterRegexMap[key];
                const match = data.match(regex);
                if (match) {
                    console.log(`${key}: `, match[1])
                    if (ACCESSION_NUMBER) {
                        const value = mappings.mapping[`${key}`];
                        var url = settings.protocol + "://" +
                            settings.host + ":" + settings.port + settings.path +
                            "?specimen_id=" + encodeURIComponent(ACCESSION_NUMBER) +
                            "&measure_id=" + encodeURIComponent(value) +
                            "&result=" + encodeURIComponent(parseFloat(match[1])) +
                            "&machine_name=" + encodeURIComponent(config.machineName);
                        urls.push(url)
                        /**
                         * invoke axios instance method
                         */
                        this.sendData(urls)
                    }
                }
            }
        });
    };
}


module.exports = { Handler };
