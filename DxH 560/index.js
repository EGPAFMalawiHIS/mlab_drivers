const net = require('net');
const path = require('path');
const client = require('node-rest-client').Client;

var config = require(path.resolve(".", "config", "DxH 560.json"));
var settings = require(path.resolve(".", "config", "settings.json"));


const regex = require('./helpers/regex');
const format = require('./helpers/format');

const EventEmitter = require('events');
const eventEmitter = new EventEmitter();

const parameterRegexMap = regex.parameterRegexMap;
const ACK = '\x06';
const genericMappings = {};

var ACCESSION_NUMBER = "";

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
        const match = message.match(/\|(\d+)!\|/);
        if (match) {
            ACCESSION_NUMBER = match[1];
        }
    });

    const result = format.format.map(item => {
        const key = Object.keys(item)[0];
        return { [key]: genericMappings[key] !== undefined ? genericMappings[key] : "NaN" };
    });

    eventEmitter.emit('dataProcessed', result);
};

var credentials = {
    username: settings.username,
    password: settings.password
};

function sendData(urls) {
    console.log("** sending data to server **")
    var url = urls[0];
    urls.shift();
    (new client(credentials)).get(url, function(){
        if (urls.length > 0) {
            sendData(urls);
        }
    });
}

eventEmitter.on('dataProcessed', (result) => {
    var urls = new Array();
    result.forEach((result) => {

        const key = Object.keys(result);
        const value = Object.values(result);

        var url = settings.protocol + "://" +
        config.host + ":" + config.port + config.path +
        "?specimen_id=" + encodeURIComponent(ACCESSION_NUMBER) +
        "&measure_id=" + encodeURIComponent(key) +
        "&result=" + encodeURIComponent(value) +
        "&machine_name=" + encodeURIComponent(config.machineName);

        urls.push(url);
    });
    sendData(urls)
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
