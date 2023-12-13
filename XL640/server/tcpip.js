const Server = require('../server/index');
const { Handler } = require('../factory/handler')
const networkConfig = require('../config/connectivity.json');

function processData(data, socket) {
    const handler = new Handler(data);
    handler.processData()
    socket.write('ACK');
}

class TCPIP {
    constructor() {
        this.server = new Server(processData);
    }
    start() {
        this.server.start({
            ipAddress: networkConfig.host,
            port: networkConfig.port
        });
    }
}

module.exports = TCPIP;
