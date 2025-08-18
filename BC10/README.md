# BC10
Machine driver for interfacing Mindray BC10 lab machine with IBLIS for automatic results upload to IBLIS

## Description
This driver interfaces with the Mindray BC10 hematology analyzer to automatically capture test results and upload them to IBLIS (Integrated Basic Laboratory Information System). The driver listens for HL7 messages from the BC10 analyzer and processes them to extract test results.

## Features
- Real-time connection to Mindray BC10 via TCP/IP
- HL7 message parsing
- Automatic result upload to IBLIS
- Connection monitoring and auto-reconnection
- Support for all standard CBC parameters

## Requirements
- Node.js >= v8.4.0
- Network connectivity to the Mindray BC10 analyzer
- Access to IBLIS server

## Installation
1. Navigate to the BC10 directory:
   ```bash
   cd BC10
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the settings:
   - Copy `config/settings.json.example` to `config/settings.json`
   - Update the configuration with your specific settings

## Configuration
Edit `config/settings.json` to match your environment:

```json
{
    "lisPath": "http://your-iblis-server:8001/api/update_result.php?specimen_id=#{SPECIMEN_ID}&measure_id=#{MEASURE_ID}&result=#{RESULT}&dec=0",
    "lisUser": "your-username",
    "lisPassword": "your-password",
    "instrumentJSONMapping": "mapping.json",
    "hostPort": "3018",
    "machineHost": "192.168.1.100",
    "machinePort": 5100
}
```

## Usage
Run the driver:
```bash
npm start
```

Or:
```bash
node bc10.js
```

## Supported Tests
The BC10 driver supports the following CBC parameters:
- WBC (White Blood Cell Count)
- RBC (Red Blood Cell Count)
- HGB (Hemoglobin)
- HCT (Hematocrit)
- MCV (Mean Corpuscular Volume)
- MCH (Mean Corpuscular Hemoglobin)
- MCHC (Mean Corpuscular Hemoglobin Concentration)
- PLT (Platelet Count)
- Lymphocyte percentage and absolute count
- Neutrophil percentage and absolute count
- Monocyte percentage and absolute count
- RDW (Red Cell Distribution Width)
- MPV (Mean Platelet Volume)
- PDW (Platelet Distribution Width)
- PCT (Plateletcrit)

## Troubleshooting
1. Ensure the BC10 analyzer is configured to send HL7 messages to the correct IP and port
2. Check network connectivity between the driver machine and the analyzer
3. Verify IBLIS server accessibility
4. Check the logs for any connection or parsing errors

## License
ISC
