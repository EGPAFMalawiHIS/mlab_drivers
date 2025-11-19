process.chdir(__dirname);
var __path__ = require('path');
var hl7 = require('simple-hl7');
var utils = require('@egpafmalawi/machine-driver-utility');

let settings = require(__path__.resolve('.', 'config', 'settings'));
let mapping = require(__path__.resolve('.', 'config','mapping'));
let definitions = require(__path__.resolve('.', 'config', 'definitions'));
let hl7Service = hl7.tcp();

const PORT = settings.bs430ServicePort;
const PASSWORD = settings.iblisPassword;
const USERNAME = settings.iblisUsername;
const BASE_URL = settings.iblsBaseURL;

console.log(`========= SERVICE STARTED ON PORT ${PORT} =========`);
hl7Service.use(function(req, res, next) {
    console.log('===CONNECTED SUCCESSFULY TO BS430 MINDRAY MACHINE====');
    console.log(`${req.msg.log()} \n`);
    // let sampleID = req.msg.getSegment('OBR').fields[2].value[0];
    let sampleID = req.msg.getSegment('PID').fields[1].value[0][0].value[0];
    console.log(`Sample ID: ${sampleID}`);
    let results = req.msg.getSegments('OBX');
    results.forEach(result => {
      let measureName = result.fields[3].value[0][0].value[0];
      let measureResult = result.fields[4].value[0][0].value[0];
      let measureID = mapping[measureName];
      console.log(`${measureName}-->${measureID}-->${measureResult}`);
      utils.buildUrl(BASE_URL, sampleID, measureID, measureResult);
  });
  console.log(utils.urls);
  utils.sendDataToIBLIS(utils.urls, USERNAME, PASSWORD);
});

hl7Service.start(PORT);

