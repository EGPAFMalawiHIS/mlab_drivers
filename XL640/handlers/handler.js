const Sync = require("../service/sync");
const mappings = require("./../helpers/mapping");
var config = require(path.resolve(".", "config", "iblis.json"));
var settings = require(path.resolve(".", "config", "settings.json"));

class Handler extends Sync {
  static getInstance() {
    if (!Handler.instance) {
      Handler.instance = new Handler();
    }
    return Handler.instance;
  }

  async process(messages) {
    var ACCESSION_NUMBER = "";
    var urls = new Array();
    messages.forEach((line) => {
      const accessionNumberRegex = /P\|(\d+)/;
      const accessionNumberMatch = line.match(accessionNumberRegex);
      if (ACCESSION_NUMBER == "") {
        if (accessionNumberMatch) {
          ACCESSION_NUMBER = accessionNumberMatch[1];
        }
      }
      const match = line.match(regex);
      if (match) {
        const [, test, value ] = match;
        const measureId = mappings.mapping[`${test}`];
        // console.log(`Test: ${test}, Value: ${value}, Unit: ${unit}`);
        var url =
          settings.protocol +
          "://" +
          settings.host +
          ":" +
          settings.port +
          settings.path +
          "?specimen_id=" +
          encodeURIComponent(ACCESSION_NUMBER) +
          "&measure_id=" +
          encodeURIComponent(measureId) +
          "&result=" +
          encodeURIComponent(parseFloat(value)) +
          "&machine_name=" +
          encodeURIComponent(config.machineName);
        urls.push(url);
        this.transmit(urls);
      }
    });
  }
}

module.exports = Handler;
