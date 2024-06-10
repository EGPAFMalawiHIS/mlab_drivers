const AxiosInstance = require("./axios");
const IBlisConfig = require("../config/iblis.json");

class Sync extends AxiosInstance {
    constructor() {
        super(IBlisConfig.baseURL, IBlisConfig.timeout)
    }
    transmit(urls) {
        var url = urls[0];
        urls.shift();
        this.Axios.get(url)
            .then(response => {
                if (urls.length > 0) {
                    start(urls);
                }
                console.log(`\x1b[32m✨️ Success: ${url} - ${response.message}\x1b[0m`);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                if (urls.length > 0) {
                    start(urls);
                }
            });
    }
}

module.exports = Sync;
