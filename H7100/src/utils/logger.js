const winston = require('winston');
const settings = require('../../config/settings.json');

const logger = winston.createLogger({
    level: settings.logLevel,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        }),
        new winston.transports.File({ filename: 'h7100-error.log', level: 'error' }),
        new winston.transports.File({ filename: 'h7100.log' })
    ]
});

module.exports = logger;
