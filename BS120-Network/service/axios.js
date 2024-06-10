
const axios = require('axios');

/**
 * @class AxiosInstance
 * @constructor baseURL, timeout
 * @method GlobalAxios axios instance
 */
class AxiosInstance {
    constructor(baseURL, timeout) {
        this.baseURL = baseURL;
        this.timeout = timeout;
    }

    Axios = axios.create({
        baseURL: `${this.baseURL}`,
        timeout: this.timeout,
        headers: {
            'Content-Type': 'application/json'
        }
    });
}


module.exports = AxiosInstance;
