#!/usr/bin/env node

"use strict"

var net = require('net');
var path = require("path");
var settings = require(path.resolve(".", "config", "settings.json"));
var mapping = require(path.resolve(".", "config", "xnseries.json"));
var client = require('node-rest-client').Client;
var line = "";

var reading = false;
var sampleResult = "D2U    XN-550^111340000000004000            18001389390101200395001190039400997003010030220297002104006240713400070000840021340006340072140000700000840142005100011500101002590015500612001350086500115000200003000000000000000000540005400000002020     0000";

var net = require('net');

var line = "";
var cur_pos;
var urls = [];

var options_auth = {
		user: settings.lisUser,
		password: settings.lisPassword
	};

function sendData(urls){
		var url = encodeURI(urls[0].replace("+", "---"));
		url = url.replace("---", "%2B");
		urls.shift();
		//console.log(url);
		(new client(options_auth)).get(url, function (data) {
			if(urls.length > 0){
				sendData(urls);
			}
    });
}

function getResult(l, f){
	var bare_f = f.replace(".", "");
	var block = l.substr(cur_pos, (bare_f.length + 1));
	var block_val = l.substr(cur_pos, f.length);
	cur_pos += bare_f.length + 1;
	
	var signs = {
			"0": "",
			"1": "+",
			"2": "-",
			"4": "*"
		};
	
	var sign = signs[block.substr((block.length - 1), 1)];
	var value = "";
	if (f.match(/\./)){
		
		var left = f.split(/\./)[0].length;
		var right = f.split(/\./)[1].length;

		value = parseFloat(block_val.substr(0, left) + "." + block_val.substr(left, right));
	}else{
		value = parseInt(block_val);
	}

	if (String(sign).match(/\+|\-|\*/)){value = value + " " + sign}
	return value;
}

var server = net.createServer(function(socket) {

	socket.on('data', function(data) {
			
			var line = String(data);		
			line = line.replace(/^\x02/, "");
			line = line.replace(/\x03$/, "");
			console.log(line);			
			if (line.match("D1U")){
				return;
			}			

			urls = [];
			var specimen_id = line.substr(44, 10);
			console.log(specimen_id);
			cur_pos = (44 + 10); //10 for length of specimen idZzma;luwa

			var format = [
				["WBC", "***.**"],
				['RBC', '**.**'],
				['HGB', '***.*'],
				['HCT', '***.*'],
				['MCV', '***.*'],
				['MCH', '***.*'],
				['MCHC', '***.*'],
				['PLT', '****'],
				['LYMPH%', '***.*'],
				['MONO%', '***.*'],
				['NEUT%', '***.*'],
				['EO%', '***.*'],
				['BASO%', '***.*'],
				['LYMPH#', '***.**'],
				['MONO#', '***.**'],
				['NEUT#', '***.**'],
				['EO#', '***.**'],
				['BASO#', '***.**'],
				['RDW-CV', '**.**'],
				['RDW-SD', '**.**'],
				['PDW', '**.**'],
				['MPV', '**.**'],
				['P-LCR', '**.**'],
				['RET%', '**.**'],	
				['RET#', '.****'],
				['IRF', '***.*'],
				['LFR', '***.*'],
				['MFR', '***.*'],
				['HFR', '***.*'],
				['PCT', '**.**'],
				['NRBC%', '****.*'],
				['NRBC#', '***.**'],
				['IG#', '***.**'],
				['IG%', '***.*'],
				['blank', '*****'],
				['RET-He', '***.*']
			]
		

		var link = settings.lisPath;
		link = link.replace(/\#\{SPECIMEN_ID\}/, specimen_id);

		for(var i = 0; i < format.length; i++){
			
				var parameter = format[i][0].toUpperCase().trim();	
			var result = getResult(line, format[i][1]);
			console.log(format[i][0] + "   : " + result);

			var measure_id = mapping[parameter];

			var uri = link.replace(/\#\{MEASURE_ID\}/, measure_id);
			uri = uri.replace(/\#\{RESULT\}/, result.toString().replace(" -", "").replace(" +", "").replace(" *", ""));
			if(measure_id != undefined){
				urls.push(uri);
			}
		}
		
		console.log("Sending Data to Server")

		sendData(urls);
		urls = [];
		line = "";		
	});
});

console.info(`Server started at ${settings.serverIp}:${settings.serverPort}, listening...`);
server.listen(settings.severPort, settings.severIp)


