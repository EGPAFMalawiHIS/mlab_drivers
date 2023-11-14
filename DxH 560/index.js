const net = require('net');
const path = require('path');

const axios = require('axios');

var config = require(path.resolve(".", "config", "DxH 560.json"));
var settings = require(path.resolve(".", "config", "settings.json"));

const regex = require('./helpers/regex');
const mappings = require('./helpers/mapping');

const parameterRegexMap = regex.parameterRegexMap;
const ACK = '\x06';

var ACCESSION_NUMBER = "";

var urls = new Array();

function handleData(data) {
    const buffer = Buffer.from(data, 'utf8');
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
                if (ACCESSION_NUMBER) {
                    const value = mappings.mapping[`${key}`];
                    var url = settings.protocol + "://" +
                        settings.host + ":" + settings.port + settings.path +
                        "?specimen_id=" + encodeURIComponent(ACCESSION_NUMBER) +
                        "&measure_id=" + encodeURIComponent(value) +
                        "&result=" + encodeURIComponent(parseFloat(match[1])) +
                        "&machine_name=" + encodeURIComponent(config.machineName);
                    urls.push(url)
                    sendData(urls)
                }
            }
        }
    });

};


function sendData(urls) {
    console.log("-- sending data to server --")
    var getUrl = urls[0];
    urls.shift();
    axios.get(getUrl, {
        auth: {
            username: settings.username,
            password: settings.password
        }
    }).then(() => {
        sendData(getUrl)
    }).catch(() => {

    })
}


const server = net.createServer((socket) => {
    socket.on('data', (data) => {
        handleData(data);
        socket.write(ACK);
    });
});

server.listen(config.port, config.ipAddress, () => {
    console.log(`Started server on ${config.ipAddress}`);
});
