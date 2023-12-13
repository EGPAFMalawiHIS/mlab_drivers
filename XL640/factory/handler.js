const regex = require('../helpers/regex');
const parameterRegexMap = regex.parameterRegexMap;
const ACCESSION_NUMBER = '';

class Handler {
    constructor(data) {
        this.data = data;
    };

    processData() {
        let f = [ '\u00021H|`^&||||||||||P|E 1394-97|20231213084551\rP|1|0|||MERCY CHADZA|||F||||||||0|0\rO|1|2300669053||^^^CRE|||||||||||SERUM\rR|1|^^^CRE|0.64|mg/dl|^DEFAULT|N|N|F||||20231213084529\rC|1|I|Instrument Flag N\rL|1|N\r\u00032C',
                7|XL640    |   '' ]
        const buffer = Buffer.from(f, 'utf8');
        const messages = buffer.toString('utf8').split('\r\n').map(message => message.trim());
        messages.forEach((message) => {
            const match = message.match(/\|(\d+)!\|/);
            if (match) {
                ACCESSION_NUMBER = match[1];
            }
            for (const key of Object.keys(parameterRegexMap)) {
                const regex = parameterRegexMap[key];
                const match = message.match(regex);
                if (match) {
                    console.log(match)
                }
            }
        });
    };
}


module.exports = { Handler };
