const Net = require('net');
const Handler = require('../handlers/handler');
const ACK = '\x06'

class HttpFactory extends Handler {
    constructor(host, port) {
        super()
        this.host = host;
        this.port = port;
        this.server = null;
    }

    createServer() {
        this.server = Net.createServer()
            .listen(this.port, this.host);
        this.attachListeners(this.server)
    }

    attachListeners(server) {

        server.on('listening', () => {
            console.log(`✨️ server is listening on \x1b[33m${this.host}\x1b[0m port \x1b[35m${this.port}\x1b[0m`);
        });

        server.on('connection', (socket) => {

            console.log('new connection established.');

            socket.on('data', (data) => {
                console.log(`received data: ${data}`);
                this.process(data)
                socket.write(ACK);
            });

            socket.on('end', () => {
                console.log('connection ended.');
            });

            socket.on('error', (err) => {
                console.log(`error in connection: ${err.message}`);
            });
        });

        server.on('close', () => {
            console.log('Server is closed.');
        });

        server.on('error', (err) => {
            console.log(`Server error: ${err.message}`);
        });
    }

    closeServer() {
        this.server.close();
    }
}

module.exports = HttpFactory;