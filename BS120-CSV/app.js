const Watcher = require('./module/watcher');
const Factory = require('./module/factory')

var client = require('node-rest-client').Client;
var __path__ = require('path');
var mapping = require(__path__.resolve('.', 'config', 'mapping'));
var settings = require(__path__.resolve('.', 'config', 'settings'));
var options_auth = { user: settings.lisUser, password: settings.lisPassword };
const folderPath = settings.outputDir;

const watcher = new Watcher(folderPath);

function constructUrls(data) {
    let urls = [];
    Object.keys(data[0]).forEach(key => {
        data[0][key].map((t) => {
            var link = settings.lisPath
                .replace(/\#\{SPECIMEN_ID\}/, key)
                .replace(/\#\{MEASURE_ID\}/, mapping[t.measure])
                .replace(/\#\{RESULT\}/, t.value);
            urls.push(link);
        })
    })
    return urls;
}

function sendData(urls) {
    var url = urls[0];
    urls.shift();
    (new client(options_auth)).get(url, function (data, response) {
        if (urls.length > 0) {
            sendData(urls);
        }
        if (response.req.res.statusCode == 200) {
            console.log("\x1b[0mData sent to IBLIS!\x1b[0m");
        }
    });
}

watcher.watch((csvData) => {
    const factory = new Factory(csvData);
    factory.process((data) => {
        const urls = constructUrls(data);
        sendData(urls);
    })
});
