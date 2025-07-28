# H7100 Hematology Analyzer Driver

This is a Node.js driver for Erba H7100 Hematology Analyzer that communicates using the HL7 protocol over TCP/IP.

## Features

- HL7 protocol support
- TCP/IP communication on port 5000
- Automatic message acknowledgment
- Error handling and retry mechanisms
- Configurable through settings.json
- Comprehensive logging
- IBLIS integration

## Installation

```bash
npm install
```

## Configuration

1. Copy the example configuration files:
```bash
cp config/settings.json.example config/settings.json
cp config/mapping.json.example config/mapping.json
```

2. Edit `config/settings.json` with your specific settings:
- `port`: TCP port number (default: 5000)
- `host`: Host address to bind to (default: 0.0.0.0)
- `lisPath`: IBLIS API endpoint URL
- `lisUser`: IBLIS username
- `lisPassword`: IBLIS password
- `logLevel`: Logging level (default: info)
- `retryInterval`: Milliseconds between retry attempts (default: 5000)
- `maxRetries`: Maximum number of retry attempts (default: 5)

3. Edit `config/mapping.json` with your IBLIS measure IDs:
Replace each `[IBLIS_MEASURE_ID]` with the corresponding IBLIS measure ID for each test parameter. For example:
```json
{
    "WBC": "169",
    "RBC": "147",
    ...
}
```

## IBLIS Integration

The driver is configured to send results to IBLIS using the interfacer API. The test codes are mapped to IBLIS measure IDs in `config/mapping.json`. Make sure to:
1. Configure the correct IBLIS endpoint in settings.json
2. Set up proper authentication credentials
3. Map all test codes to their corresponding IBLIS measure IDs

## Usage

```javascript
const h7100Driver = require('./src/index');

// The driver will automatically start and listen for connections
```

## Result Format

The driver returns results in the following format:

```javascript
{
    patientId: string,
    results: [
        {
            testCode: string,
            value: string,
            units: string,
            referenceRange: string,
            flags: string
        }
    ]
}
```

## Logging

Logs are written to:
- Console (all levels)
- h7100.log (all levels)
- h7100-error.log (error level only)

## Error Handling

The driver includes comprehensive error handling:
- Automatic retry on connection failures
- Invalid message handling
- HL7 parsing error handling
- Socket error management

## Development

When developing or deploying:
1. Use settings.json.example and mapping.json.example as templates
2. Create your own settings.json and mapping.json with actual values
3. Never commit settings.json or mapping.json (they're in .gitignore)
4. Keep mapping.json updated with correct IBLIS measure IDs for your installation
5. Document any new test codes added to mapping.json

## License

This project is licensed under the MIT License.
