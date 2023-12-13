const axios = require('axios');
const settings = require('../config/lis.json');

const DEBUG_TAG = "AxiosInstance";

/**
 * @class AxiosInstance holds axios method for sending data
 * @constructor null
 */
class AxiosInstance {
    /**
     * @method sendData sends formatted urls to lis server
     * @param {*} urls
     * @returns null
     */
    sendData(urls) {
        console.info(DEBUG_TAG, "-- sending data to server --")
        var getUrl = urls[0];
        urls.shift();
        axios.get(getUrl, {
            auth: {
                username: settings.username,
                password: settings.password
            }
        }).then(() => {
            sendData(getUrl);
        }).catch((e) => {
            console.error(DEBUG_TAG, e);
        })
    };
};

module.exports = AxiosInstance;
