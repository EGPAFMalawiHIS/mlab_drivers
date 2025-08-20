#!/usr/bin/env node

"use strict";

process.chdir(__dirname);
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const path = require('path');
const axios = require('axios');
const fs = require('fs');

const settings = require(path.resolve('.', 'config', 'settings.json'));
const mapping = require(path.resolve('.', 'config', settings.instrumentJSONMapping));

const port = new SerialPort({
    path: settings.serialPort.path,
    baudRate: settings.serialPort.baudRate,
    dataBits: settings.serialPort.dataBits,
    stopBits: settings.serialPort.stopBits,
    parity: settings.serialPort.parity,
    autoOpen: false
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

const ACK = String.fromCharCode(0x06);
const NAK = String.fromCharCode(0x15);
const ENQ = String.fromCharCode(0x05);
const STX = String.fromCharCode(0x02);
const ETX = String.fromCharCode(0x03);
const EOT = String.fromCharCode(0x04);
const ETB = String.fromCharCode(0x17);
const CR = String.fromCharCode(0x0D);
const LF = String.fromCharCode(0x0A);

let dataBuffer = '';
let currentSampleId = '';
let resultsBuffer = [];
let urls = [];

port.open(function (err) {
    if (err) {
        return console.error('Error opening port:', err.message);
    }
    console.log(`Connected to BD BACTEC FX40 on ${settings.serialPort.path} at ${settings.serialPort.baudRate} baud`);
});

port.on('open', () => console.log('Serial port open'));
port.on('close', () => console.log('Serial port closed'));
port.on('error', (err) => console.error('Serial port error:', err));

parser.on('data', (data) => {
    console.log('Received:', data);

    if (data === ENQ) {
        console.log('Received ENQ, sending ACK');
        port.write(ACK);
        dataBuffer = '';
        return;
    }

    if (data === EOT) {
        console.log('Received EOT, communication complete');
        processCompleteBuffer();
        dataBuffer = '';
        return;
    }

    if (data.startsWith(STX)) {
        const frameData = data.substring(1, data.length - 1);
        dataBuffer += frameData;
        port.write(ACK);
        return;
    }

    dataBuffer += data + '\r\n';
});

function processCompleteBuffer() {
    console.log('Processing complete buffer:', dataBuffer);

    try {
        const lines = dataBuffer.split('\r\n');

        let sampleId = '';
        let results = {};

        for (const line of lines) {
            const sampleIdMatch = line.match(/(?:SAMPLE|ID)[:\s]+([A-Za-z0-9-]+)/i);
            if (sampleIdMatch) {
                sampleId = sampleIdMatch[1];
            }

            const resultMatch = line.match(/(?:RESULT|STATUS)[:\s]+([A-Za-z]+)/i);
            if (resultMatch) {
                const result = resultMatch[1].toUpperCase();
                if (mapping[result]) {
                    results['RESULT'] = result;
                }
            }

            const detectionTimeMatch = line.match(/DETECTION[:\s]+([0-9:.]+)/i);
            if (detectionTimeMatch) {
                results['DETECTION_TIME'] = detectionTimeMatch[1];
            }

            const bottleTypeMatch = line.match(/BOTTLE[:\s]+([A-Za-z0-9-]+)/i);
            if (bottleTypeMatch) {
                results['BOTTLE_TYPE'] = bottleTypeMatch[1];
            }

            const protocolMatch = line.match(/PROTOCOL[:\s]+([A-Za-z0-9-]+)/i);
            if (protocolMatch) {
                results['PROTOCOL_NAME'] = protocolMatch[1];
            }
        }

        if (sampleId && Object.keys(results).length > 0) {
            urls = generateUrls(results, sampleId);
            sendDataToLIS(urls);
        }
    } catch (error) {
        console.error('Error processing data buffer:', error);
    }
}

function generateUrls(results, sampleId) {
    const generatedUrls = [];

    for (const [key, value] of Object.entries(results)) {
        if (mapping[key] || (key === 'RESULT' && mapping[value])) {
            const measureId = key === 'RESULT' ? mapping[value] : mapping[key];
            const resultValue = key === 'RESULT' ? 'TRUE' : value;

            const url = settings.lisPath
                .replace(/\#\{SPECIMEN_ID\}/, encodeURIComponent(sampleId))
                .replace(/\#\{MEASURE_ID\}/, encodeURIComponent(measureId))
                .replace(/\#\{RESULT\}/, encodeURIComponent(resultValue));

            generatedUrls.push(url);
        }
    }

    return generatedUrls;
}

async function sendDataToLIS(urls) {
    if (!urls || urls.length === 0) {
        console.log('No URLs to send');
        return;
    }

    console.log(`Sending ${urls.length} results to LIS...`);

    for (const url of urls) {
        try {
            console.log(`Sending request to: ${url}`);
            const response = await axios.get(url, {
                auth: {
                    username: settings.lisUser,
                    password: settings.lisPassword
                }
            });
            console.log('Response:', response.status, response.data);
        } catch (error) {
            console.error('Error sending data to LIS:', error.message);
        }
    }

    console.log('Finished sending data to LIS');
}

process.on('SIGINT', () => {
    console.log('Closing serial port connection...');
    port.close();
    process.exit();
});

console.log('BD BACTEC FX40 driver started');
