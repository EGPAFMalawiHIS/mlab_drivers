const Sync = require("../service/sync");
const path = require('path')
const mappings = require("./../helpers/mapping");
var settings = require(path.resolve(".", "config", "iblis.json"));
// var settings = require(path.resolve(".", "config", "settings.json"));

class Handler extends Sync {
  static getInstance() {
    if (!Handler.instance) {
      Handler.instance = new Handler();
    }
    return Handler.instance;
  }

  async process(messages) {
    let urls = new Array();
    messages.forEach((line) => {
      let accessionNumber = ''
      const accessionNumberRegex = /\|0\rO\|1\|([a-zA-Z0-9]+)\^/;
      const accessionNumberMatch = line.match(accessionNumberRegex);
      if (accessionNumber == "") {
        if (accessionNumberMatch) {
          accessionNumber = accessionNumberMatch[1];
        }
      }
      let segments = line.split('Instrument Flag').map(part => part.trim())
      for (const segment of segments) {
        if (segment.trim() == '') {
          continue;
        }
        const regex = /\|\^\^\^([^|]+)\|([^|]+)\|([^|]+)\|/;
        const match = segment.match(regex);
        if (match) {
          const [, test, value, unit] = match;
          console.log(`Test: ${test}, Value: ${value}, Unit: ${unit}`);
          const measureId = mappings.mapping[`${test}`];
          let url =
            settings.baseURL +
            "?specimen_id=" +
            encodeURIComponent(accessionNumber) +
            "&measure_id=" +
            encodeURIComponent(measureId) +
            "&result=" +
            encodeURIComponent(parseFloat(value)) +
            "&machine_name=" +
            encodeURIComponent(settings.machineName);
          if (value != 'NA') {
            urls.push(url);
          }
        }
      }
    });
    if (urls.length > 0) {
      this.transmit(urls);
    }
  }
}

module.exports = Handler;
