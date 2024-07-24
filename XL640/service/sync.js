const AxiosInstance = require("./axios");
const settings = require("../config/iblis.json");

class Sync extends AxiosInstance {
    constructor() {
        super(settings.baseURL, settings.timeout, settings.username, settings.password)
    }
    transmit(urls) {
        if (urls.length === 0) {
          console.log("All URLs processed.");
          return;
        }
    
        const url = urls[0];
        urls.shift();
    
        this.Axios.get(url)
          .then((response) => {
            console.log(
              `\x1b[32m✨️ Success: ${url} - ${response.statusText}\x1b[0m`
            );
            this.transmit(urls);
          })
          .catch((error) => {
            console.error("Error fetching data:", error.message);
            this.transmit(urls);
          });
      }
}

module.exports = Sync;
