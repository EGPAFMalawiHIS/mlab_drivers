const machineConfig = require('./xl640.json');
const TCPIP = require('./server/tcpip');

if (machineConfig.connection === "TCP/IP") {
    const tcpipInstance = new TCPIP();
    tcpipInstance.start();
}
