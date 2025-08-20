const net = require("net");
const path = require("path");
const axios = require("axios");
const { access } = require("fs");

var config = require(path.resolve(".", "config", "xp300.json"));
var settings = require(path.resolve(".", "config", "settings.json"));
var fbcParameters = require(path.resolve(".", "config", "parameters.json"));
var mapping = require(path.resolve(".", "config", "mapping.json"));

const ACK = "\x06";

function generateUrls(measurements, accession_number) {
  const baseUrl = `${settings.protocol}://${settings.IblisIpAddress}:${settings.port}${settings.path}`;
  return Object.entries(measurements).map(([, { id, value }]) => {
    return `${baseUrl}?specimen_id=${accession_number}&measure_id=${id}&result=${value}&machine_name=${config.machineName}`;
  });
}

async function sendData(urls) {
  if (!urls.length) return; // Stop if no more URLs

  console.log("-- sending data to server --");

  const [getUrl, ...remainingUrls] = urls; // Destructure first URL
  console.log(getUrl);

  try {
      await axios.get(getUrl, {
          auth: {
              username: settings.username,
              password: settings.password
          }
      });
      sendData(remainingUrls); // Recursive call with remaining URLs
  } catch (error) {
      console.error("Error sending data:", error);
  }
}

function handleData(data) {
    const buffer = Buffer.from(data, 'utf8');
    const messages = buffer.toString('utf8').split('\r\n').map(message => message.trim() );
    console.log(messages)
    let genericMappings = {};
    let accession_number = "";
    messages.forEach((message) => {
        const accRegex = /(\d+)\^([A-Z])\|/;
        const match = message.toString().match(accRegex)
        if(match){
          accession_number = match[1]
        }
        const regex = /\|\^\^\^\^([\w%#-]+)\^1\|\s+([\d.]+)/;
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
    if (accession_number == "" || accession_number == null || accession_number == undefined) {
        console.log("Accession number not found");
        return [];
    }else{
        console.log("Accession number found");
        console.log(accession_number)
        console.log(genericMappings)
        let urls = generateUrls(genericMappings, accession_number)
        return urls
    }
};


const server = net.createServer((socket) => {
    socket.on('data', (data) => {
        let urls = handleData(data);
        if (urls.length > 0) {
            sendData(urls);
        }
        socket.write(ACK);
    });
});

server.listen(config.port, config.ipAddress, () => {
    console.log(`Started server on ${config.ipAddress}`);
});
