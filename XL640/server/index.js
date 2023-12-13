const net = require('net');

/**
 * @class Server handles node server methods
 * @constructor null
 */
class Server {
    constructor(handleDataCallback) {
        this.handleDataCallback = handleDataCallback;
        this.server = net.createServer((socket) => {
            socket.on('data', (data) => {
                this.handleData(data, socket);
            });
        });
    }
    /**
     * @method start starts node server
     * @param {*} config
     */
    start(config) {
        this.server.listen(config.port, config.ipAddress, () => {
            console.log(`Started server on ${config.ipAddress}`);
        });
    }
    /**
     * @method stop interrupts the node server
     * @param null
     */
    stop() {
        this.server.close();
    }
    /**
     * @method handleData invoke callback
     * @param {*} data
     * @param {*} socket
     */
    handleData(data, socket) {
        this.handleDataCallback(data, socket);
    }
}

module.exports = Server;
