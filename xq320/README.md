# Sysmex XQ320 Hematology Analyzer Driver

Machine driver for interfacing Sysmex XQ320 hematology analyzer with IBLIS for automatic results upload.

## Requirements

- Node.js (version 11+ recommended based on dependencies)
- Network connection between XQ320 machine and host computer
- Access to IBLIS server

## Installation

1. Navigate to the XQ320 directory on the server:
```bash
cd xq320
```

2. Install dependencies:
```bash
npm install
```

## Configuration

### 1. Configure IBLIS Connection

Edit `config/settings.json` with your IBLIS server details:

````json path=xq320/config/settings.json mode=EDIT
{
    "lisPath": "http://YOUR_IBLIS_IP:8005/api/v1/interfacer?specimen_id=#{SPECIMEN_ID}&measure_id=#{MEASURE_ID}&result=#{RESULT}&dec=0&machine_name=sysmex-xq320",
    "lisUser": "your_username",
    "lisPassword": "your_password",
    "machineName": "sysmex-xq320",
    "serverIp": "127.0.0.1",
    "serverPort": "1234"
}
````

### 2. Parameter Mapping

The `config/xnseries.json` file contains the mapping between XQ320 parameters and IBLIS measure IDs. Update if needed for your IBLIS installation.

## Machine Setup

1. Configure the XQ320 machine to send data via TCP/IP
2. Set the host IP to the computer running this driver
3. Set the port to match `serverPort` in settings.json (default: 1234)
4. Enable automatic result transmission

## Running the Driver

### Development/Testing
```bash
node xq320.js
```

### Production (with PM2)
```bash
# Install PM2 globally
npm install -g pm2

# Start the driver
pm2 start xq320.js --name "xq320-driver"

# Save PM2 configuration
pm2 save

# Setup auto-start on boot
pm2 startup
```

## Supported Parameters

The driver processes the following hematology parameters:
- WBC, RBC, HGB, HCT, MCV, MCH, MCHC, PLT
- Differential counts (LYMPH%, MONO%, NEUT%, EO%, BASO%)
- Absolute counts (LYMPH#, MONO#, NEUT#, EO#, BASO#)
- RDW-CV, RDW-SD, PDW, MPV, P-LCR, PCT
- Reticulocyte parameters (RET%, RET#, IRF, LFR, MFR, HFR, RET-He)
- NRBC%, NRBC#, IG#, IG%

## Troubleshooting

1. **Connection Issues**: Verify `serverIp` and `serverPort` in settings.json match machine configuration
2. **Authentication Errors**: Check `lisUser` and `lisPassword` credentials
3. **Missing Results**: Ensure parameter mapping in `xnseries.json` is correct for your IBLIS installation

## Logs

Monitor the console output for:
- Server startup confirmation
- Incoming data from XQ320
- Parameter parsing results
- Data transmission status to IBLIS
