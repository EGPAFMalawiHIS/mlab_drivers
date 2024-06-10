var client = require('node-rest-client').Client;
var path = require("path");
var settings = require(path.resolve("./", "config", "settings.json"));

var options_auth = {
  user: settings.lisUser,
  password: settings.lisPassword,
};

var lisPath = settings.lisPath;

function buildUrl(sampleId, meausureId, result, machineName) {
  lisPath = lisPath.replace(/\#\{SPECIMEN_ID\}/, sampleId);
  let uri = lisPath.replace(/\#\{MEASURE_ID\}/, meausureId);
  uri = uri.replace(/\#\{RESULT\}/, result);
  return uri;
}

function sendData(urls) {
  var url = encodeURI(urls[0].replace("+", "---"));
  url = url.replace("---", "%2B");
  urls.shift();
  new client(options_auth).get(url, function (data) {
    if (urls.length > 0) {
      sendData(urls);
    }
  });
}

module.exports = {
  sendData,
  buildUrl,
};
