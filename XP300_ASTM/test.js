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
[
  'O|1||^^     2300013216^B|^^^^WBC\\^^^^RBC\\^^^^HGB\\^^^^HCT\\^^^^MCV\\^^^^MCH\\^^^^MCHC\\^^^^PLT\\^^^^LYM%\\^^^^MXD%\\^^^^NEUT%\\^^^^LYM#\\^^^^MXD#\\^^^^NEUT#\\^^^^RDW-SD\\^^^^RDW-CV\\^^^^PDW\\^^^^MPV \\^^^^P-LCR\\^^^^PCT|||||||N||||||||||||||F\rR|1|^^^^WBC^1|  4.8|10*3/uL||W||||WESLEY         ||20231115103722\rR|2|^^^^RBC^1| 3.69|10*6/uL||L||||WESLEY         ||20231115103722\rR|3|^^^^HGB^1| 11.8|g/dL||N||||WESLEY         ||20231115103722\rR|4|^^^^HCT^1| 35.6|%||N||||WESLEY         ||20231115103722\rR|5|^^^^MCV^1| 96.5|fL||H||||WESLEY         ||20231115103722\rR|6|^^^^MCH^1| 32.0|pg||N||||WESLEY     ||0231115103722\rR|7|^^^^MCHC^1| 33.1|g/dL||N||||WESLEY         ||20231115103722\rR|8|^^^^PLT^1|   78|10*3/uL||W||||WESLEY         ||20231115103722\rR|9|^^^^LYM%^1| 54.1|%||W||||WESLEY         ||20231115103722\rR|10|^^^^MXD%^1|  8.7|%||W||||WESLEY         ||20231115103722\rR|11|^^^^NEUT%^1| 37.2|%||W||||WESLEY         ||20231115103722\rR|12|^^^^LYM#^1|  2.6|10*3/uL||W||||WESLEY         ||20231115103722\rR|13|^^^^MXD#^1|  0.4|10*3/uL||W||||WESLEY         ||20231115103722\rR|14|^^^^NEUT#^1|  1.8|10*3/uL||W||||WESLEY         ||20231115103722'
],
[
  'R|15|^^^^RDW-SD^1| 41.1|fL||N||||WESLEY         ||20231115103722\rR|16|^^^^RDW-CV^1| 11.8|%||N||||WESLEY         ||20231115103722\rR|17|^^^^PDW^1| 21.1|fL||H||||WESLEY         ||20231115103722\rR|18|^^^^MPV^1| 12.1|fL||N||||WESLEY         ||20231115103722\rR|19|^^^^P-LCR^1| 39.6|%||N||||WESLEY         ||20231115103722\rR|20|^^^^PCT^1| 0.10|%||W||||WESLEY         ||20231115103722\rL|1|N'
]]

function handleData(data) {
  const buffer = Buffer.from(data, 'utf8');
  const messages = buffer.toString('utf8').split('\r\n').map(message => message.trim());
  console.log(messages)
  messages.forEach((message) => {
    const accRegex = /(\d+)\^([A-Z])\|/;
    const match = message.toString().match(accRegex)
    if (match) {
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
  });
}
urls = generateUrls(genericMappings)
sendData(urls)                                                                                                                                                                                         

data.forEach((message) => {
  message.forEach((item) => {
    const match = item.toString().match(/(\d+)\^([A-Z])\|/)
    if (match) {
      console.log(match[1])
    }
  })
})

// console.log(data[0].toString().split(/R\|\d+/));
// fbcRegex = /([A-Z]+.*?)\^1\| ([\d.]+)/;
// const accRegex = /(\d+)\^A\|/;
// const [, accessionNumber] = data[0].match(accRegex);
// fbcRegex = /\|\^\^\^\^(\w+.*?)\^1\|[\s]*([\d.]+)/;
// data[0]
//   .toString()
//   .split(/R\|\d+/)
//   .forEach((str) => {
//     const match = str.match(fbcRegex);
//     if (match) {
//       let [, parameter, value] = match;
//       parameter = parameter;
//       param = fbcParameters[parameter];
//       if (param) {
//         genericMappings[param] = { id: mapping[param], value: value };
//       }
//     }
//   });

function generateUrls(measurements) {
  const baseUrl = `${settings.protocol}://${settings.IblisIpAddress}:${settings.port}${settings.path}`;
  return Object.entries(measurements).map(([measure, { id, value }]) => {
    return `${baseUrl}?specimen_id=${accessionNumber}&measure_id=${id}&result=${value}`;
  });
}

// const urls = generateUrls(genericMappings);
// console.log(genericMappings);
// console.log(urls);
