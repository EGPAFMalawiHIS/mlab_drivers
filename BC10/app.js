process.chdir(__dirname);
var __path__ = require('path');
var net = require('net');
var Parser = require('simple-hl7/lib/hl7/parser');
var client = require('node-rest-client').Client;
var urls = [];
var settings = require(__path__.resolve('.', 'config', 'settings'));
var map = require(__path__.resolve('.', 'config', settings.instrumentJSONMapping));
var options_auth = {user: settings.lisUser, password: settings.lisPassword};

var VT = String.fromCharCode(0x0b);
var FS = String.fromCharCode(0x1c);
var CR = String.fromCharCode(0x0d);
var responseBuffer = '';

var parser = new Parser({ segmentSeperator: '\r' });
var clientOptions = {
  host: settings.machineHost || '192.168.1.156',
  port: settings.machinePort || 5100
}

function sendData(urls){
  var url = urls[0];
  urls.shift();
  (new client(options_auth)).get(url, function (data, response) {
    console.log('Result sent to IBLIS:', response.statusCode);
    if(urls.length > 0){
      sendData(urls);
    }
  }).on('error', function(err) {
    console.log('Error sending to IBLIS:', err.message);
    if(urls.length > 0){
      sendData(urls);
    }
  });
}

function connectToMachine(){
    console.log('Attempting to connect to Mindray BC10 at ' + clientOptions.host + ':' + clientOptions.port);

    var app = net.createConnection(clientOptions, function () {
        console.log("Connected to Mindray BC10 at " + clientOptions.host + ":" + clientOptions.port);
    });

    app.on('data', function(data){
        var responseBuffer = '';
        responseBuffer += data.toString();
        console.log('Raw data received:', responseBuffer);

        if (responseBuffer.substring(responseBuffer.length - 2, responseBuffer.length) == FS + CR) {
          try {
            var hl7Message = responseBuffer.substring(1, responseBuffer.length - 2);
            var ack = parser.parse(hl7Message);

            // BC10 test parameters in order they appear in OBX segments
            var tests = ["WBC", "LYM#", "LYM%", "MONO#", "MONO%", "NEUT#", "NEUT%", "EOS#", "EOS%", "BASO#", "BASO%", "RBC", "HGB", "HCT", "MCV", "MCH", "MCHC", "RDW-CV", "RDW-SD", "PLT", "MPV", "PDW", "PCT", "P-LCR"];

            console.log('Parsed HL7 message:');
            console.log(ack.log());

            var sampleID = '';
            var counter = 0;

            ack.segments.forEach(function(segment){
              if(segment.name == 'OBR'){
                sampleID = segment.fields[2].value[0];
                console.log('Sample ID:', sampleID);
              }
              if(segment.name == 'OBX'){
                var test_measure = tests[counter];
                var valueType = segment.fields[1].value[0][0].value[0];
                var observationID = segment.fields[2].value[0][0].value[0].toString();

                if(valueType == 'NM' && observationID !== '30525-0'){
                  var obsResult = segment.fields[4].value[0][0].value[0];
                  var measureID = map[test_measure];

                  console.log('Processing:', test_measure, '=', obsResult, 'MeasureID:', measureID);

                  if(sampleID && measureID && obsResult){
                    var link = settings.lisPath
                        .replace(/\#\{SPECIMEN_ID\}/, sampleID)
                        .replace(/\#\{MEASURE_ID\}/, measureID)
                        .replace(/\#\{RESULT\}/, obsResult);
                      urls.push(link);
                  }
                  counter = counter + 1;
                }
              }
            });

            if(urls.length > 0){
              console.log('Sending', urls.length, 'results to IBLIS');
              sendData(urls);
              urls = [];
            } else {
              console.log("No results to send to IBLIS");
            }
          } catch(error) {
            console.log('Error parsing HL7 message:', error.message);
          }
        }
    });

    app.on('error', function(err) {
        console.log('Connection error:', err.message);
        reconnect();
    });

    app.on('end', function() {
        console.log('Connection ended by BC10');
        reconnect();
    });

    app.on('close', function() {
        console.log('Connection closed');
        reconnect();
    });
}

function reconnect(){
    console.log('Attempting to reconnect in 5 seconds...');
    setTimeout(function() {
        connectToMachine();
    }, 5000);
}

// Start the driver
console.log('Starting Mindray BC10 Driver...');
connectToMachine();
