# H7100 Hematology Analyzer Driver

This is a Node.js driver for the H7100 Hematology Analyzer that communicates using the HL7 protocol over TCP/IP.

## Features

- HL7 protocol support
- TCP/IP communication on port 5000
- Automatic message acknowledgment
- Error handling and retry mechanisms
- Configurable through environment variables
- Comprehensive logging

## Installation

```bash
npm install
```

## Configuration

The driver can be configured using environment variables:

- `PORT`: TCP port number (default: 5000)
- `HOST`: Host address to bind to (default: 0.0.0.0)
- `LOG_LEVEL`: Logging level (default: info)
- `RETRY_INTERVAL`: Milliseconds between retry attempts (default: 5000)
- `MAX_RETRIES`: Maximum number of retry attempts (default: 5)

## Usage

```javascript
const h7100Driver = require('./src/index');

const handleResults = (results) => {
    console.log('Received results:', results);
};

h7100Driver.start(handleResults);

```

## Result Format

The driver returns results in the following format:

```javascript
{
    messageType: string,
    messageTime: string,
    patientId: string,
    patientName: string,
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

## License

This project is licensed under the MIT License.
