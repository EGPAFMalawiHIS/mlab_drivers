#!/usr/bin/env node

"use strict"

const SerialPort = require("serialport").SerialPort;
const readLine = require('readline');

var port = new SerialPort({path: "/dev/ttyUSB0", autoOpen: false, baudRate: 9600, dataBits: 7, stopBits: 1, parity: 'none', rtscts: false });
var path = require("path");
var config = require(path.resolve(".", "config.json"));
var kx21n = require(path.resolve(".", "kx21n.json"));
var client = require('node-rest-client').Client;
//var parser = new Readline();

var sampleResult = "D1U201704250000000000000043000000000570049200145004480091100295003240031800409000920049900023000050002900477001330013400111003370";

//var cmd = Buffer.from([0x01]);
//console.log(cmd.toString());
var line = "";

var options_auth = {
						user: config.username,
						password: config.password
					};

var reading = false;
var urls = [];

function sendData(urls){
		var url = urls[0];
		urls.shift();

		(new client(options_auth)).get(url, function (data) {

			if(urls.length > 0){
				sendData(urls);
			}
    });
}

port.open(function (err) {

	if(err) {

		return console.log("Error opening port: ", err.message);

	}

	port.write('main screen turn on');

});

port.on('open', function() {
	console.log("Port open");	
});

var StringDecoder = require('string_decoder').StringDecoder;
var d = new StringDecoder('utf8');
var line  = "";
port.on('data', function(data) {	
	console.log(String(data));
	//console.log(/^\x1A/.test(String(data)));
	//console.log(String(data).charAt(String(data).length - 1));
	
	if(String(data).match(/^\x02/)) {

		console.log("Got STX");
		
		reading = true;
		
		line += String(data).replace(/^\x02/, "");

	} else if(String(data).charAt(String(data).length - 1).match(/^\x1A/)) {

		console.log("Got ETX");
		
		reading = false;
		
		console.log(line);
		
		var result = line;
		
		var id = result.substr(11, 10);
		
		var specimenId = id;
		
		console.log("Sample ID: %s", id);
			
		var base = 22;
		
		var tests = ["WBC","LYM#","MID#","GRAN#","LYM%","MID%","GRAN%","RBC","HGB", "MCHC", "MCV","MCH","RDW-CV","HCT","PLT","MPV","PDW","PCT","RDW-SD"];
		
		var results = {};
		
		var signs = {
			"0": "",
			"1": "",
			"2": "",
			"4": "",
			"3": ""
		};
		
		for(var i = 0; i < tests.length; i++) {
		
			var test = tests[i];
		//console.log(i);
		if (i == 0){
			results[test] = result.substr(34, 3) + "." + result.substr(37, 1);
						  
		   }else if(i == 1) {
			results[test] = result.substr(38, 3) + "." + result.substr(41, 1);
				
			}else if(i == 2) {
				results[test] = result.substr(42, 3) + "." + result.substr(45, 1);
					
			} else if (i == 3){
			
					 //results[test] = (isNaN(parseFloat(result.substr(32, 3))) ?
							  //          "" :  String(parseFloat(result.substr(32, 3))));
				  results[test] = result.substr(46, 3) + "." + result.substr(49, 1);
			//	results[test] = result.substr(36,2);
			}else if (i == 4){
				   results[test] = result.substr(50,2) + "." + result.substr(52,1);
				  
			} else if (i == 5){
				results[test] = result.substr(53,2) +"."+ result.substr(55,1);		
			
			}else if(i == 6){
			
				 results[test] = result.substr(56,2) + "." + result.substr(58,1) ;
			}else if(i == 7){
			
				results[test] = result.substr(59,1) +"."+result.substr(60,2) ;
		   } else if(i == 8){
			
				results[test] = result.substr(62,2) + "."+result.substr(64,1) ;
			   } else if(i == 9){
			
				results[test] = result.substr(65,3) +"." +  result.substr(68,1) ;
			   } else if(i == 10){
			
				results[test] = result.substr(69,3) + "." + result.substr(72,1) ;
			   }else if(i == 11){
			
				results[test] = result.substr(73,3) + "."+ result.substr(76,1);
			   }else if(i == 12){
			
				results[test] = result.substr(77,2) + "." + result.substr(79,1);
			   }else if(i == 13){
			
				results[test] = result.substr(80,2)  + "." + result.substr(82,1);
			   }else if(i == 14){
			
				results[test] = result.substr(83,4);
			   }else if(i == 15){
			
				results[test] = result.substr(87,2) + "." + result.substr(89,1);
			   }else if(i == 16){
			
				results[test] = result.substr(90,2) + "." + result.substr(92,1);
			   }else if(i == 17){
			
				results[test] = "0."+ result.substr(93,3);
			   }else if(i == 18){			
				results[test] = result.substr(97,2) +"."+ result.substr(99,1);
			   }
			   
			if(specimenId.trim().length > 0 && kx21n[test] != undefined) {
			
				var measureId = kx21n[test];
				var measureValue = results[test];		

				if(measureValue){				
					measureValue.replace(/undefined/, '');		
				}

				var url = config.protocol + "://" + 
					config.host + ":" + config.port + config.path + 
					"?specimen_id=" + encodeURIComponent(specimenId) +
					"&measure_id=" + encodeURIComponent(measureId) + 
					"&result=" + encodeURIComponent(measureValue) + 
					"&machine_name=" + encodeURIComponent(config.machineName);

				urls.push(url);
					
			}
		
			
			console.log("%s: %s", test, results[test]);
		
		}
		
		sendData(urls);
		line = "";

	} else {

		// process.stdout.write(String(data).trim());
		
			line += String(data);
		//console.log(line);
		
	}

});

console.log(line);
