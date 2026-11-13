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

var parser = new Parser({ segmentSeperator: '\r' });
var clientOptions = {
  host: settings.machineHost || '192.168.1.100',
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

function processMessage(hl7Message){
  try {
    var ack = parser.parse(hl7Message);

    console.log('Parsed HL7 message:');
    console.log(ack.log());

    var sampleID = '';

    ack.segments.forEach(function(segment){
      if(segment.name == 'OBR'){
        sampleID = segment.fields[2].value[0][0].value[0];
        console.log('Sample ID:', sampleID);
      }
      if(segment.name == 'OBX'){
        var test_measure = segment.fields[2].value[0][1].value[0];
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
              console.log('Generated URL:', link);
              urls.push(link);
          }
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

function connectToMachine(){
    console.log('Attempting to connect to Mindray BC20 at ' + clientOptions.host + ':' + clientOptions.port);

    var app = net.createConnection(clientOptions, function () {
        console.log("Connected to Mindray BC20 at " + clientOptions.host + ":" + clientOptions.port);
    });

    var responseBuffer = '';

    app.on('data', function(data){
        responseBuffer += data.toString();
        console.log('Raw data received:', data.toString());

        var end;
        while ((end = responseBuffer.indexOf(FS + CR)) !== -1) {
          var start = responseBuffer.indexOf(VT);
          var hl7Message = responseBuffer.substring(start + 1, end);
          responseBuffer = responseBuffer.substring(end + 2);
          processMessage(hl7Message);
        }
    });

    app.on('error', function(err) {
        console.log('Connection error:', err.message);
    });

    app.on('end', function() {
        console.log('Connection ended by BC20');
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
console.log('Starting Mindray BC20 Driver...');
connectToMachine();
