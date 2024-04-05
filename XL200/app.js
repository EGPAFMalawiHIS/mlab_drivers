const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
var __path__ = require('path');

var client = require('node-rest-client').Client;

var mapping = require(__path__.resolve('.', 'config', 'mapping'));
var settings = require(__path__.resolve('.', 'config', 'settings'));
var options_auth = { user: settings.lisUser, password: settings.lisPassword };
const folderPath = settings.outputDir;
let file = '';

function checkFileExists(filePath) {
    try {
        return fs.existsSync(filePath);
    } catch (err) {
        console.error('Error checking file existence:', err);
        return false;
    }
}

function extractBlocksStartingFromSerial(data, startSerial) {
    let found = false;
    const blocks = [];
    for (const block of data) {
        if (found || (Array.isArray(block) && block.includes(startSerial))) {
            found = true;
            blocks.push(block);
        }
    }
    return blocks;
}

function groupByAccessionNumber(data) {
    return data.reduce((acc, item) => {
        const accessionNumber = item.accession_number.toString();
        if (!acc[accessionNumber]) {
            acc[accessionNumber] = [];
        }
        acc[accessionNumber].push(item);
        return acc;
    }, {});
}


function sendData(urls) {
    var url = urls[0];
    urls.shift();
    (new client(options_auth)).get(url, function (data, response) {
        if (urls.length > 0) {
            sendData(urls);
        }
        if (response.req.res.statusCode == 200) {
            console.log("Data sent to IBLIS!");
        }
    });
}

function readExcel(filePath) {
    const measureResults = [];
    try {
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
        const results = extractBlocksStartingFromSerial(data, 'Sr #');
        results.forEach((result, index) => {
            if (index != 0) {
                measureResults.push({
                    "accession_number": result[1],
                    "measure": result[3],
                    "value": result[4]
                })
            }
        })
    } catch (err) {
        console.error('Error reading Excel file:', err);
    }
    const groupedResults = groupByAccessionNumber(measureResults);
    let urls = [];
    Object.keys(groupedResults).forEach(key => {
        groupedResults[key].map((t) => {
            var link = settings.lisPath
                .replace(/\#\{SPECIMEN_ID\}/, key)
                .replace(/\#\{MEASURE_ID\}/, mapping[t.measure])
                .replace(/\#\{RESULT\}/, t.value);
            urls.push(link);
        })

    });
    if (urls.length > 0) {
        console.log(urls);
        sendData(urls);
        urls = [];
    } else {
        console.log("No result sent to BLIS!!")
    }
}

function watchFolder(folderPath) {
    fs.watch(folderPath, (eventType, filename) => {
        if (eventType === 'rename') {
            const filePath = path.join(folderPath, filename);
            if (checkFileExists(filePath)) {
                console.log('File found:', filePath);
                file = filePath;
                readExcel(filePath);
            }
        }
    });
    console.log(`Watching folder "${folderPath}" for any file changes...`);
}

watchFolder(folderPath);
