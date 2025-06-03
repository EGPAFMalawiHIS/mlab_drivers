const net = require('net');
const logger = require('../utils/logger');
const config = require('../config/config');
const hl7Parser = require('../parsers/hl7Parser');

class ConnectionHandler {
    constructor() {
        this.server = null;
        this.retryCount = 0;
    }

    start() {
        this.server = net.createServer((socket) => {
            logger.info('New connection established');

            let messageBuffer = '';
            const startMarker = '\x0b';
            const endMarker = '\x1c\x0d';

            socket.on('data', (data) => {
                try {
                    messageBuffer += data.toString();

                    if (messageBuffer.includes(startMarker) && messageBuffer.includes(endMarker)) {
                        const messages = messageBuffer.split(startMarker);

                        messages.forEach(msg => {
                            if (msg.includes(endMarker)) {
                                const cleanMsg = msg.split(endMarker)[0];
                                this.processMessage(cleanMsg, socket);
                            }
                        });

                        messageBuffer = messages[messages.length - 1];
                    }
                } catch (error) {
                    logger.error('Error processing data:', error);
                }
            });

            socket.on('error', (error) => {
                logger.error('Socket error:', error);
            });

            socket.on('close', () => {
                logger.info('Connection closed');
            });
        });

        this.server.on('error', (error) => {
            logger.error('Server error:', error);
            this.handleError(error);
        });

        this.server.listen(config.port, config.host, () => {
            logger.info(`Server listening on ${config.host}:${config.port}`);
            this.retryCount = 0;
        });
    }

    processMessage(message, socket) {
        try {
            const results = hl7Parser.parse(message);
            const ack = hl7Parser.createACK(message);
            socket.write(startMarker + ack + endMarker);

            if (config.resultCallback && typeof config.resultCallback === 'function') {
                config.resultCallback(results);
            }
        } catch (error) {
            logger.error('Error processing message:', error);
        }
    }

    handleError(error) {
        if (error.code === 'EADDRINUSE') {
            logger.error(`Port ${config.port} is already in use`);
            if (this.retryCount < config.maxRetries) {
                this.retryCount++;
                logger.info(`Retrying in ${config.retryInterval/1000} seconds...`);
                setTimeout(() => this.start(), config.retryInterval);
            } else {
                logger.error('Max retry attempts reached. Server failed to start.');
                process.exit(1);
            }
        }
    }

    stop() {
        if (this.server) {
            this.server.close(() => {
                logger.info('Server stopped');
            });
        }
    }
}

module.exports = new ConnectionHandler();
