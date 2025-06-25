const utils = require("@egpafmalawi/machine-driver-utility");
const logger = require("../utils/logger");
const settings = require("../../config/settings.json");
const mapping = require("../../config/mapping.json");
var client = require("node-rest-client").Client;
var options_auth = { user: settings.lisUser, password: settings.lisPassword };

class IblisService {
  constructor() {
    this.urls = [];
    this.settings = settings;
    this.mapping = mapping;
  }

  buildUrl(specimenId, testCode, result) {
    const url = this.settings.lisPath
      .replace("#{SPECIMEN_ID}", specimenId)
      .replace("#{MEASURE_ID}", testCode)
      .replace("#{RESULT}", result);

    this.urls.push(url);
  }

  sendData(urls) {
    var url = urls[0];
    console.info(url);
    urls.shift();
    const self = this;

    new client(options_auth).get(url, function (data, response) {
      if (urls.length > 0) {
        self.sendData(urls);
      }
      if (response.req.res.statusCode == 200) {
        console.log("Data sent to IBLIS!");
      }
    });
  }

  async sendResults(results) {
    try {
      this.urls = [];
      const { sampleID, results: testResults } = results;

      testResults.forEach((result) => {
        console.log("results: ", result);
        this.buildUrl(sampleID, result.id, result.result);
      });

      if (this.urls.length === 0) {
        logger.warn("No valid results to send to IBLIS");
        return;
      }

      logger.info(
        `Sending ${this.urls.length} results to IBLIS for patient ${sampleID}`
      );
      this.sendData(this.urls);
      this.urls = [];
    } catch (error) {
      logger.error("Error sending results to IBLIS:", error.message);
      this.urls = [];
      throw error;
    }
  }
}

module.exports = new IblisService();
