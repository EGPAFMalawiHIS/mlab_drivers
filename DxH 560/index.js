const net = require('net');
const path = require('path');

var config = require(path.resolve(".", "config", "DxH 560.json"));
const regex = require('./helpers/regex');
const format = require('./helpers/format');

const EventEmitter = require('events');
const eventEmitter = new EventEmitter();

const parameterRegexMap = regex.parameterRegexMap;
const ACK = '\x06';
const genericMappings = {};

const PORT = settings.bs430ServicePort;
const PASSWORD = settings.iblisPassword;
const USERNAME = settings.iblisUsername;
const BASE_URL = settings.iblsBaseURL;


function handleData(data) {
    const buffer = Buffer.from(data, 'utf8');
    const messages = buffer.toString('utf8').split('\r\n').map(message => message.trim());
    messages.forEach((message) => {
        for (const key of Object.keys(parameterRegexMap)) {
            const regex = parameterRegexMap[key];
            const match = message.match(regex);
            if (match) {
                genericMappings[key] = parseFloat(match[1]);
            }
        }
    });

    console.log(messages.toString());

    const result = format.format.map(item => {
        const key = Object.keys(item)[0];
        return { [key]: genericMappings[key] !== undefined ? genericMappings[key] : "NaN" };
    });

    eventEmitter.emit('dataProcessed', result);
};

eventEmitter.on('dataProcessed', (result) => {
    // console.log('Data processing finished. Result:', result);
});

const server = net.createServer((socket) => {
    socket.on('data', (data) => {
        handleData(data);
        socket.write(ACK);
    });
});

server.listen(config.port, config.ipAddress, () => {
    console.log(`Started server on ${config.ipAddress}`);
});
