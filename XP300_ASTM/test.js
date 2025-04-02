const net = require("net");
const path = require("path");
const axios = require("axios");

var config = require(path.resolve(".", "config", "xp300.json"));
var settings = require(path.resolve(".", "config", "settings.json"));
var fbcParameters = require(path.resolve(".", "config", "parameters.json"));
var mapping = require(path.resolve(".", "config", "mapping.json"));

const EventEmitter = require("events");
const eventEmitter = new EventEmitter();
const ACK = "\x06";
const genericMappings = {};
var ACCESSION_NUMBER = "";

const data = [['H|\\^&|||XP-300^00-07^^^^A1573^AP807129||||||||E1394-97'],
['P|1'],
[ 'O|1||^^  PDH2500000003^M|^^^^WBC\\^^^^RBC\\^^^^HGB\\^^^^HCT\\^^^^MCV\\^^^^MCH\\^^^^MCHC\\^^^^PLT\\^^^^LYM%\\^^^^MXD%\\^^^^NEUT%\\^^^^LYM#\\^^^^MXD#\\^^^^NEUT#\\^^^^RDW-SD\\^^^^RDW-CV\\^^^^PDW\\^^^^MPV\\^^^^P-LCR\\^^^^PCT|||||||N||||||||||||||F\rR|1|^^^^WBC^1|  5.3|10*3/uL||N||||GOOD           ||20250402105500\rR|2|^^^^RBC^1| 3.35|10*6/uL||N||||GOOD           ||20250402105500\rR|3|^^^^HGB^1|  9.8|g/dL||N||||GOOD           ||20250402105500\rR|4|^^^^HCT^1| 28.5|%||N||||GOOD           ||20250402105500\rR|5|^^^^MCV^1| 85.1|fL||L||||GOOD           ||20250402105500\rR|6|^^^^MCH^1| 29.3|pg||N||||GOOD           ||20250402105500\rR|7|^^^^MCHC^1| 34.4|g/dL||N||||GOOD           ||20250402105500\rR|8|^^^^PLT^1|  151|10*3/uL||N||||GOOD           ||20250402105500\rR|9|^^^^LYM%^1| 32.4|%||N||||GOOD           ||20250402105500\rR|10|^^^^MXD%^1| 19.2|%||N||||GOOD           ||20250402105500\rR|11|^^^^NEUT%^1| 48.4|%||N||||GOOD           ||20250402105500\rR|12|^^^^LYM#^1|  1.7|10*3/uL||N||||GOOD           ||20250402105500\rR|13|^^^^MXD#^1|  1.0|10*3/uL||N||||GOOD           ||20250402105500\rR|14|^^^^NEUT#^1|  2.6|10*3/uL||N||||GOOD           ||20250402105500\rR|15|^^^^RDW-SD^1| 49.5|fL||N||||GOOD           ||20250402105500\rR|16|^^^^RDW-CV^1| 15.6|%||N||||GOOD           ||20250402105500\rR|17|^^^^PDW^1| 13.6|fL||N||||GOOD           ||20250402105500\rR|18|^^^^MPV^1| 10.3|fL||N||||GOOD           ||20250402105500\rR|19|^^^^P-LCR^1| 28.4|%||N||||GOOD           ||20250402105500\rR|20|^^^^'],
[
  'R|15|^^^^RDW-SD^1| 41.1|fL||N||||WESLEY         ||20231115103722\rR|16|^^^^RDW-CV^1| 11.8|%||N||||WESLEY         ||20231115103722\rR|17|^^^^PDW^1| 21.1|fL||H||||WESLEY         ||20231115103722\rR|18|^^^^MPV^1| 12.1|fL||N||||WESLEY         ||20231115103722\rR|19|^^^^P-LCR^1| 39.6|%||N||||WESLEY         ||20231115103722\rR|20|^^^^PCT^1| 0.10|%||W||||WESLEY         ||20231115103722\rL|1|N'
]]

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
      console.error("Error sending data:", error.message);
  }
}

function generateUrls(measurements) {
  const baseUrl = `${settings.protocol}://${settings.IblisIpAddress}:${settings.port}${settings.path}`;
  return Object.entries(measurements).map(([measure, { id, value }]) => {
    return `${baseUrl}?specimen_id=${ACCESSION_NUMBER}&measure_id=${id}&result=${value}`;
  });
}

function handleData(data) {
  // const buffer = Buffer.from(data, 'utf8');
  // const messages = buffer.toString('utf8').split('\r\n').map(message => message.trim() );
  const messages = [ 'O|1||^^  PDH2500000003^M|^^^^WBC\\^^^^RBC\\^^^^HGB\\^^^^HCT\\^^^^MCV\\^^^^MCH\\^^^^MCHC\\^^^^PLT\\^^^^LYM%\\^^^^MXD%\\^^^^NEUT%\\^^^^LYM#\\^^^^MXD#\\^^^^NEUT#\\^^^^RDW-SD\\^^^^RDW-CV\\^^^^PDW\\^^^^MPV\\^^^^P-LCR\\^^^^PCT|||||||N||||||||||||||F\rR|1|^^^^WBC^1|  5.3|10*3/uL||N||||GOOD           ||20250402105500\rR|2|^^^^RBC^1| 3.35|10*6/uL||N||||GOOD           ||20250402105500\rR|3|^^^^HGB^1|  9.8|g/dL||N||||GOOD           ||20250402105500\rR|4|^^^^HCT^1| 28.5|%||N||||GOOD           ||20250402105500\rR|5|^^^^MCV^1| 85.1|fL||L||||GOOD           ||20250402105500\rR|6|^^^^MCH^1| 29.3|pg||N||||GOOD           ||20250402105500\rR|7|^^^^MCHC^1| 34.4|g/dL||N||||GOOD           ||20250402105500\rR|8|^^^^PLT^1|  151|10*3/uL||N||||GOOD           ||20250402105500\rR|9|^^^^LYM%^1| 32.4|%||N||||GOOD           ||20250402105500\rR|10|^^^^MXD%^1| 19.2|%||N||||GOOD           ||20250402105500\rR|11|^^^^NEUT%^1| 48.4|%||N||||GOOD           ||20250402105500\rR|12|^^^^LYM#^1|  1.7|10*3/uL||N||||GOOD           ||20250402105500\rR|13|^^^^MXD#^1|  1.0|10*3/uL||N||||GOOD           ||20250402105500\rR|14|^^^^NEUT#^1|  2.6|10*3/uL||N||||GOOD           ||20250402105500\rR|15|^^^^RDW-SD^1| 49.5|fL||N||||GOOD           ||20250402105500\rR|16|^^^^RDW-CV^1| 15.6|%||N||||GOOD           ||20250402105500\rR|17|^^^^PDW^1| 13.6|fL||N||||GOOD           ||20250402105500\rR|18|^^^^MPV^1| 10.3|fL||N||||GOOD           ||20250402105500\rR|19|^^^^P-LCR^1| 28.4|%||N||||GOOD           ||20250402105500\rR|20|^^^^']
  messages.forEach((message) => {
      const accRegex = /(\d+)\^([A-Z])\|/;
      const match = message.toString().match(accRegex)
      if(match){
          ACCESSION_NUMBER = match[1]
      }
      console.log(ACCESSION_NUMBER)
      const regex = /\|\^\^\^\^([\w%#-]+)\^1\|\s+([\d.]+)/;
      message
      .toString()
      .split(/R\|\d+/)
      .forEach((str) => {
        console.log(str)
        const match = str.match(regex);
          if (match) {
              let [, parameter, value] = match;
              parameter = parameter;
              console.log(parameter)
              param = fbcParameters[parameter];
              if (param) {
                  genericMappings[param] = { id: mapping[param], value: value };
              }
          }
      });
  })
  urls = generateUrls(genericMappings)
  console.log(genericMappings)
  console.log(urls)
  sendData(urls)
}                                                                                                                                              

handleData(data)
