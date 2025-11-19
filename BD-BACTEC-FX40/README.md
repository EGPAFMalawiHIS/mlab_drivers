# BD BACTEC FX40 Driver

Machine driver for interfacing BD BACTEC FX40 blood culture instrument with LIS for automatic results upload via serial connection.

## Features

- Serial communication with BD BACTEC FX40 blood culture analyzer
- Automatic detection of positive/negative cultures
- Real-time transmission of results to LIS
- Support for standard blood culture parameters

## Requirements

- Node.js >= 12.0.0
- Serial connection to BD BACTEC FX40 (typically using a USB-to-Serial adapter)

## Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Configure the application:
   - Copy `config/settings.json.example` to `config/settings.json`
   - Update the serial port configuration (`path`, `baudRate`, etc.) to match your setup
   - Update LIS connection details (`lisPath`, `lisUser`, `lisPassword`)

## Running the Application

```bash
node app.js
```

## Running as a Service

### Linux
You can use PM2 to run the application as a service:

```bash
npm install pm2 -g
pm2 start app.js --name bd-bactec-fx40
pm2 save
pm2 startup
```

### Windows
You can install as a Windows service:

```bash
node service.js
```

## Configuration

Edit `config/settings.json` to configure:

- Serial port settings
- LIS connection details
- Mapping of results to LIS codes

## Troubleshooting

If the driver fails to connect to the BD BACTEC FX40:

1. Verify the serial port path is correct
2. Ensure the port settings match the instrument (baud rate, data bits, etc.)
3. Check serial cable connections

For LIS connection issues:

1. Verify the LIS URL is correct
2. Check that the username and password are valid
3. Confirm network connectivity to the LIS

## License

MIT
