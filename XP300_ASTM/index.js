const net = require("net");
const path = require("path");
const axios = require("axios");

var config = require(path.resolve(".", "config", "xp300.json"));
var settings = require(path.resolve(".", "config", "settings.json"));
var fbcParameters = require(path.resolve(".", "config", "parameters.json"));
var mapping = require(path.resolve(".", "config", "mapping.json"));

const ACK = "\x06";

const genericMappings = {};

var ACCESSION_NUMBER = "";

function generateUrls(measurements) {
  const baseUrl = `${settings.protocol}://${settings.IblisIpAddress}:${settings.port}${settings.path}`;
  return Object.entries(measurements).map(([, { id, value }]) => {
    return `${baseUrl}?specimen_id=${ACCESSION_NUMBER}&measure_id=${id}&result=${value}`;
  });
}

var urls = new Array();

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

function handleData(data) {
    const buffer = Buffer.from(data, 'utf8');
    const messages = buffer.toString('utf8').split('\r\n').map(message => message.trim() );
    console.log(messages)
    messages.forEach((message) => {
        const accRegex = /(\d+)\^([A-Z])\|/;
        const match = message.toString().match(accRegex)
        if(match){
            ACCESSION_NUMBER = match[1]
        }
        const regex = /\|\^\^\^\^(\w+.?)\^1\|[\s]([\d.]+)/;
        message
        .toString()
        .split(/R\|\d+/)
        .forEach((str) => {
            const match = str.match(regex);
            if (match) {
                let [, parameter, value] = match;
                parameter = parameter;
                param = fbcParameters[parameter];
                if (param) {
                    genericMappings[param] = { id: mapping[param], value: value };
                }
            }
        });
    })
    urls = generateUrls(genericMappings)
    sendData(urls)
};


const server = net.createServer((socket) => {
    socket.on('data', (data) => {
        handleData(data);
        socket.write(ACK);
    });
});

server.listen(config.port, config.ipAddress, () => {
    console.log(`Started server on ${config.ipAddress}`);
});
