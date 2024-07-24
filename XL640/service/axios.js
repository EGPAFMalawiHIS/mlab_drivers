const axios = require('axios');

/**
 * @class AxiosInstance
 * @constructor baseURL, timeout
 * @method GlobalAxios axios instance
 */
class AxiosInstance {
    constructor(baseURL, timeout, username, password) {
        this.baseURL = baseURL;
        this.timeout = timeout;
        this.username = username;
        this.password = password;

        this.Axios = axios.create({
            baseURL: this.baseURL,
            timeout: this.timeout,
            headers: {
                'Content-Type': 'application/json'
            },
            auth: {
                username: this.username,
                password: this.password
            }
        });
    }
}

module.exports = AxiosInstance;
