const Watcher = require("./module/watcher");
const Factory = require("./module/factory");
const fs = require("fs");

var client = require("node-rest-client").Client;
var __path__ = require("path");
var mapping = require(__path__.resolve(".", "config", "mapping"));
var settings = require(__path__.resolve(".", "config", "settings"));
var options_auth = { user: settings.lisUser, password: settings.lisPassword };
const folderPath = settings.outputDir;

const watcher = new Watcher(folderPath);

let urls = [];

function constructUrls(data) {
    console.log(data.length + " records to send");
  data.forEach((t) => {
    console.log(t);
    // Skip if result is 'NA'
    if (t.result === "NA") {
      console.log(
        `Skipping record with NA result: ${t.accession_number} - ${t.measure}`
      );
      return; // Skip to next iteration
    }
    var link = settings.lisPath
      .replace(/\#\{SPECIMEN_ID\}/, encodeURIComponent(t.accession_number))
      .replace(/\#\{MEASURE_ID\}/, encodeURIComponent(mapping[t.measure]))
      .replace(/\#\{RESULT\}/, encodeURIComponent(t.result));
    urls.push(link);
  });
}

function sendData(urls) {
  var url = urls[0];
  urls.shift();
  if (url !== undefined) {
    new client(options_auth).get(url, function (data, response) {
      if (urls.length > 0) {
        sendData(urls);
      }
      if (response.req.res.statusCode == 200) {
        console.log("\x1b[0mData sent to IBLIS!\x1b[0m");
      } else {
        console.error("Something wrong happened while sending data to IBLIS!");
      }
    });
  }
}

watcher.watch((csvData, __path__) => {
  const factory = new Factory(csvData);
  factory.process((data) => {
    constructUrls(data);
    console.log(urls);
    console.log(`\x1b[33mSending ${urls.length} records to IBLIS\x1b[0m`);
    sendData(urls);
    if (settings.deleteWhenDone) {
      fs.unlink(__path__, (error) => {
        console.error(error);
      });
    }
  });
});
