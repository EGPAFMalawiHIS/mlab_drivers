const Server = require('../server/index');
const { Handler } = require('../factory/handler')
const networkConfig = require('../config/connectivity.json');

const ackBuffer = 'ACK';

/**
 * @method proccessData involde handler data
 * @param {*} data
 * @param {*} socket
 */
function processData(data, socket) {
    const handler = new Handler(data);
    handler.processData()
    socket.write(ackBuffer);
}

/**
 * @class TCPIP handles tcp/ip connections
 * @extends Server class
 */
class TCPIP extends Server(processData) {
    /**
     * @method start starts the node server
     * @params null
     * @returns null
     */
    start() {
        this.server.start({
            ipAddress: networkConfig.host,
            port: networkConfig.port
        });
    }
}

module.exports = TCPIP;
