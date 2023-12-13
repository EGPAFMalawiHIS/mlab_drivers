const config = require('./xl640.json');
const TCPIP = require('./server/tcpip');

/**
 * Checks the connection type
 * from the configuration file
 * and starts TCP/IP communication
 * if it's specified.
 */
if (config.connection.toLowerCase() === "tcp/ip") {
    const tcpipInstance = new TCPIP();
    tcpipInstance.start();
}
