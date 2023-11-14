const net = require("net");
const path = require("path");
const client = require("node-rest-client").Client;

var config = require(path.resolve(".", "config", "machine_settings.json"));
var settings = require(path.resolve(".", "config", "iblis_settings.json"));
var fbcParameters = require(path.resolve(".", "config", "fbcparams.json"));
var mapping = require(path.resolve(".", "config", "mapping.json"));

const regex = require("./helpers/regex");
const format = require("./helpers/format");

const EventEmitter = require("events");
const eventEmitter = new EventEmitter();

const parameterRegexMap = regex.parameterRegexMap;
const ACK = "\x06";
const genericMappings = {};
var ACCESSION_NUMBER = "";

const data = [
  "O|1||^^     2300013103^A|^^^^WBC\\^^^^RBC\\^^^^HGB\\^^^^HCT\\^^^^MCV\\^^^^MCH\\^^^^MCHC\\^^^^PLT\\^^^^LYM%\\^^^^MXD%\\^^^^NEUT%\\^^^^LYM#\\^^^^MXD#\\^^^^NEUT#\\^^^^RDW-SD\\^^^^RDW-CV\\^^^^PDW\\^^^^MPV\\^^^^P-LCR\\^^^^PCT|||||||N||||||||||||||F\rR|1|^^^^WBC^1| 11.6|10*3/uL||H||||SABINA         ||20231113124746\rR|2|^^^^RBC^1| 2.96|10*6/uL||L||||SABINA         ||20231113124746\rR|3|^^^^HGB^1|  8.3|g/dL||L||||SABINA         ||20231113124746\rR|4|^^^^HCT^1| 25.4|%||L||||SABINA         ||20231113124746\rR|5|^^^^MCV^1| 85.8|fL||N||||SABINA         ||20231113124746\rR|6|^^^^MCH^1| 28.0|pg||N||||SABINA         ||20231113124746\rR|7|^^^^MCHC^1| 32.7|g/dL||L||||SABINA         ||20231113124746\rR|8|^^^^PLT^1|  251|10*3/uL||W||||SABINA         ||20231113124746\rR|9|^^^^LYM%^1| 17.8|%||L||||SABINA         ||20231113124746\rR|10|^^^^MXD%^1| 10.4|%||N||||SABINA         ||20231113124746\rR|11|^^^^NEUT%^1| 71.8|%||H||||SABINA         ||20231113124746\rR|12|^^^^LYM#^1|  2.1|10*3/uL||N||||SABINA         ||20231113124746\rR|13|^^^^MXD#^1|  1.2|10*3/uL||N||||SABINA         ||20231113124746\rR|14|^^^^NEUT#^1|  8.3|10*3/uL||H||||SABINA         ||20231113124746\rR|15|^^^^RDW-SD^1| 42.7|fL||N||||SABINA         ||20231113124746\rR|16|^^^^RDW-CV^1| 15.0|%||N||||SABINA         ||20231113124746\rR|17|^^^^PDW^1| 14.4|fL||N||||SABINA         ||20231113124746\rR|18|^^^^MPV^1| 10.3|fL||N||||SABINA         ||20231113124746\rR|19|^^^^P-LCR^1| 29.2|%||N||||SABINA         ||20231113124746\rR|20|^^^^PCT^1| 0.26|%||W||||SABINA         ||20231113124746\rL|1|N",
];

// console.log(data[0].toString().split(/R\|\d+/));
// fbcRegex = /([A-Z]+.*?)\^1\| ([\d.]+)/;
const accRegex = /(\d+)\^A\|/;
const [, accessionNumber] = data[0].match(accRegex);
fbcRegex = /\|\^\^\^\^(\w+.*?)\^1\|[\s]*([\d.]+)/;
data[0]
  .toString()
  .split(/R\|\d+/)
  .forEach((str) => {
    const match = str.match(fbcRegex);
    if (match) {
      let [, parameter, value] = match;
      parameter = parameter;
      param = fbcParameters[parameter];
      // console.log("Parameter:", parameter);
      // console.log("Mapped Parameter:", param);
      // console.log("Value:", value);
      // console.log('Accession Number:', accessionNumber);
      if (param) {
        genericMappings[param] = { id: mapping[param], value: value };
      }
    }
  });

function generateUrls(measurements) {
  const baseUrl = `${settings.protocol}://${settings.IblisIpAddress}:${settings.port}${settings.path}`;
  return Object.entries(measurements).map(([measure, { id, value }]) => {
    return `${baseUrl}?specimen_id=${accessionNumber}&measure_id=${id}&result=${value}`;
  });
}

const urls = generateUrls(genericMappings);
console.log(genericMappings);
console.log(urls);
