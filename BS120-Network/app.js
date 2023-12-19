const config = require('./config/network.json');
const HttpFactory = require('./service/factory');

const factory = new HttpFactory(config.host, config.port);
factory.createServer();
