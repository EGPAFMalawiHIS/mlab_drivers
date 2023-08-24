// To test for mlab do the following:
// 1. Make sure send_data_mlab.js is in the same directory as this file
// 2. in config/settings.json add the following configs: 
//    1. 	"mlabBaseURL": "http://127.0.0.1:3004/api/v1/interfacer",
//    2. 	"mlabUsername": "administrator",
//    3.  "mlabPassword": "kchlims",
// 3. in app.js add code from lines: 13, 24-26, 64, 67 and 69

process.chdir(__dirname);
var __path__ = require('path');
var utils = require('@egpafmalawi/machine-driver-utility');
const hl7 = require('simple-hl7'); 
const mlab = require('./send_data_mlab.js');

let settings = require(__path__.resolve('.', 'config', 'settings'));
let mapping = require(__path__.resolve('.', 'config','mapping'));
let definitions = require(__path__.resolve('.', 'config', 'definitions'));
let hl7Service = hl7.tcp();

const PORT = settings.bs430ServicePort;
const PASSWORD = settings.iblisPassword;
const USERNAME = settings.iblisUsername;
const BASE_URL = settings.iblsBaseURL;
const MLAB_URL = settings.mlabBaseURL;
const MLAB_USER = settings.mlabUsername;
const MLAB_PASSWORD = settings.mlabPassword;

var parser = new hl7.Parser();
function parseHL7Message(segments) {
    const messageString = segments.join('\r');
    console.log(messageString);
    return parser.parse((new hl7.Message(messageString)).toString());
}

// Example messages array
const savedMessages = [
    "MSH|^~\\&|||||20230823110506||ORU^R01|105|P|2.3.1||||0||ASCII|||",
    "PID|43|2300595887|||Patient A|||F|||||||||||||||||||||||",
    "OBR|68||34|^|N|20230823110300|20230823110210|20230823110210||1^34||||20230823110210|Serum|||||||||||||||||||||||||||||||||",
    "OBX|1|NM||Bilirubin Total (VOX Method)|0.154504|mg/dL|-|N|||F||0.154504|20230823112804|||0|",
    "OBX|2|NM||Bilirubin Direct (VOX Method)|-0.083976|mg/dL|-|N|||F||-0.083976|20230823112813|||0|",
    "OBX|3|NM||Alanine Aminotransferase|10.235592|U/L|-|N|||F||10.235592|20230823112804|||0|",
    "OBX|4|NM||Aspartate Aminotransferase|26.035724|U/L|-|N|||F||26.035724|20230823112813|||0|",
    "OBX|5|NM||Alkaline Phosphatase|68.000000|U/L|-|N|||F||68.000000|20230823112813|||0|",
    "OBX|6|NM||Total Protein|7.000000|g/dL|-|N|||F||7.000000|20230823112813|||0|",
    "OBX|7|NM||Albumin|4.000000|g/dL|-|N|||F||4.000000|20230823112813|||0|",
    "OBX|8|NM||AST/ALT|3.000000|g/dL|-|N|||F||3.000000|20230823112813|||0|",
    "OBX|12|NM||IBIL-V|4.080000|�mol/L|-|N|||F||4.080000|||||",
    "OBX|14|NM||A/G ?|1.056522||-|N|||F||1.056522|||||"
];

const recreatedMsg = parseHL7Message(savedMessages);
console.log(recreatedMsg);
console.log(recreatedMsg.log());
let sampleID = recreatedMsg.getSegment('PID').fields[1].value[0][0].value[0];
console.log(`Sample ID: ${sampleID}`);
let results = recreatedMsg.getSegments('OBX');
results.forEach(result => {
  let measureName = result.fields[3].value[0][0].value[0];
  let measureResult = result.fields[4].value[0][0].value[0];
  let measureID = mapping[definitions[measureName]];
  console.log(`${measureName}-->${definitions[measureName]}-->${measureID}-->${measureResult}`);
  utils.buildUrl(BASE_URL, sampleID, measureID, measureResult, USERNAME, PASSWORD);
  mlab.buildUrlForMlab(MLAB_URL, sampleID, measureID, measureResult, MLAB_USER, MLAB_PASSWORD);
});
console.log(utils.urls);
console.log(mlab.urls);
utils.sendDataToIBLIS(utils.urls, USERNAME, PASSWORD);
mlab.sendDataToMlab(mlab.urls, MLAB_USER, MLAB_PASSWORD);