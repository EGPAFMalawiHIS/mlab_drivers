const net = require('net');

class Server {
    constructor(handleDataCallback) {
        this.handleDataCallback = handleDataCallback;
        this.server = net.createServer((socket) => {
            socket.on('data', (data) => {
                this.handleData(data, socket);
            });
        });
    }

    start(config) {
        this.server.listen(config.port, config.ipAddress, () => {
            console.log(`Started server on ${config.ipAddress}`);
        });
    }

    stop() {
        this.server.close();
    }

    handleData(data, socket) {
        this.handleDataCallback(data, socket);
    }
}

module.exports = Server;
