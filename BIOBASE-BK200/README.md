# BIOBASE BK200 Hematology Analyzer Driver

Machine driver for interfacing BIOBASE BK200 hematology analyzer with IBLIS for automatic results upload using HL7 protocol.

## Features

- HL7 v2.3.1 protocol support
- TCP/IP communication
- Automatic message acknowledgment (ACK/NACK)
- Erro├── config/
    ├── settings.json           # IBLIS connection settings
    ├── mapping.json           # IBLIS measure ID mapping
    └── parameters.json        # Parameter name translation
```

### Adding New Parameters
1. Add parameter mapping to `config/parameters.json`
2. Add corresponding IBLIS measure ID to `config/mapping.json`
3. Test with machine to ensure proper HL7 parsing

### Testing
1. Use HL7 simulator to test driver functionality
2. Monitor console output for proper message handling
3. Verify data reaches IBLIS correctly
4. Test with actual BK200 machine HL7 messagestry mechanisms
- Configurable through settings.json
- Comprehensive logging
- IBLIS integration
- Real-time result processing

## Requirements

- Node.js (version 14+ recommended)
- Network connection between BK200 machine and host computer
- Access to IBLIS server

## Dependencies

The driver uses the following key dependencies:
- `simple-hl7`: For HL7 message parsing and handling
- `node-rest-client`: For HTTP communication with IBLIS
- `path`: For file path operations

## Installation

1. Navigate to the BIOBASE-BK200 directory:
```bash
cd BIOBASE-BK200
```

2. Install dependencies:
```bash
npm install
```

## Configuration

### 1. Configure IBLIS Connection

Copy the example configuration and edit with your IBLIS server details:

```bash
cp config/settings.json.example config/settings.json
cp config/mapping.json.example config/mapping.json
```

Edit `config/settings.json`:

```json
{
  "port": 9201,
  "host": "192.168.1.195",
  "lisPath": "http://127.0.0.1:8005/api/v1/interfacer?specimen_id=#{SPECIMEN_ID}&measure_id=#{MEASURE_ID}&result=#{RESULT}&dec=0&machine_name=#{MACHINE_NAME}",
  "lisUser": "username",
  "lisPassword": "password",
  "machineName": "BIOBASE-BK200",
  "timeout": 30000,
  "socketTimeout": 30000,
  "maxConnections": 10,
  "retryAttempts": 3,
  "retryDelay": 5000
}
```

### 2. Parameter Mapping

Edit `config/mapping.json` with your IBLIS measure IDs:

```json
{
  "WBC": "169",
  "RBC": "147",
  "HGB": "151",
  "HCT": "149",
  "MCV": "161",
  "MCH": "159",
  "MCHC": "162",
  "PLT": "142",
  "LYMPH": "154",
  "LYMPH%": "155",
  "LYMPH#": "156",
  "MONO": "157",
  "MONO%": "158",
  "MONO#": "160",
  "NEUT": "163",
  "NEUT%": "164",
  "NEUT#": "165",
  "EOS": "166",
  "EOS%": "167",
  "EOS#": "168",
  "BASO": "170",
  "BASO%": "171",
  "BASO#": "172",
  "RDW-CV": "148",
  "RDW-SD": "173",
  "PDW": "174",
  "MPV": "175",
  "P-LCR": "176",
  "PCT": "177"
}
```

### 3. Parameter Translation

The `config/parameters.json` file contains the mapping between BK200 parameter names and standardized names. This handles variations in parameter naming from the machine.

## Machine Setup

1. Configure the BK200 machine to send data via TCP/IP using HL7 protocol
2. Set the host IP to the computer running this driver
3. Set the port to match `port` in settings.json (default: 9201)
4. Configure HL7 protocol communication
5. Enable automatic result transmission
6. Ensure machine sends HL7 v2.3.1 formatted messages

## Running the Driver

### Development/Testing
```bash
npm start
```

or

```bash
node app.js
```

### Development with auto-restart
```bash
npm run dev
```

### Production (with PM2)
```bash
# Install PM2 globally
npm install -g pm2

# Start the driver
pm2 start app.js --name "biobase-bk200-driver"

# Save PM2 configuration
pm2 save

# Setup auto-start on boot
pm2 startup
```

## HL7 Protocol Implementation

This driver implements the HL7 v2.3.1 standard for laboratory data communication with the following features:

### Protocol Flow
1. **Connection** - Machine establishes TCP connection
2. **HL7 Message** - Machine sends formatted HL7 message with results
3. **ACK** - Driver sends acknowledgment for successful processing
4. **NACK** - Driver sends negative acknowledgment for errors
5. **Disconnect** - Connection closes after processing

### Message Types
- **MSH**: Message Header - Contains message control information
- **PID**: Patient Identification - Patient demographic information
- **PV1**: Patient Visit - Visit information
- **OBR**: Observation Request - Order information with sample ID
- **OBX**: Observation Result - Individual test results with values, units, and reference ranges

### Message Structure
```
MSH|^~\&|AC 610|Hematology Analyzer|||timestamp||ORU^R01|message_id|P|2.3.1
PID|1||sample_id^^^^||||||
PV1|1|Outpatient ID||||||||||||||||||Own expense
OBR|1||order_id|test_battery||timestamp||||||||||||||||
OBX|seq|data_type|test_code^test_name^coding_system||result_value|units|reference_range|flags|||status||
```

### Key HL7 Fields Processed
- **Sample ID**: Extracted from PID-3 or OBR-3
- **Test Name**: Extracted from OBX-3 (observation identifier)
- **Result Value**: Extracted from OBX-5 (observation value)
- **Units**: Extracted from OBX-6 (units)
- **Reference Range**: Extracted from OBX-7 (reference range)

## Supported Parameters

The driver processes the following hematology parameters:

### Complete Blood Count (CBC)
- WBC (White Blood Cells)
- RBC (Red Blood Cells)
- HGB (Hemoglobin)
- HCT (Hematocrit)
- MCV (Mean Corpuscular Volume)
- MCH (Mean Corpuscular Hemoglobin)
- MCHC (Mean Corpuscular Hemoglobin Concentration)
- PLT (Platelets)

### Differential Count
- LYMPH%, LYMPH# (Lymphocytes) - LYM%, LYM#
- MONO%, MONO# (Monocytes) - MON%, MON#
- NEUT%, NEUT# (Neutrophils) - NEU%, NEU#
- EOS%, EOS# (Eosinophils)
- BASO%, BASO# (Basophils) - BAS%, BAS#

### Red Blood Cell Indices
- RDW-CV, RDW-SD (Red Cell Distribution Width)

### Platelet Indices
- PDW (Platelet Distribution Width)
- MPV (Mean Platelet Volume)
- P-LCR (Platelet Large Cell Ratio)
- PCT (Plateletcrit)
- PLCC (Platelet Large Cell Count)

### Special Parameters
- ALY%, ALY# (Atypical Lymphocytes)
- LIC%, LIC# (Large Immature Cells)

## Data Flow

1. BK200 sends HL7 v2.3.1 formatted messages via TCP/IP
2. Driver receives and parses HL7 message using simple-hl7 library
3. Driver extracts data from HL7 segments:
   - Sample ID from PID or OBR segments
   - Test results from OBX segments (test name, value, units, reference range)
4. Driver maps machine parameter names to IBLIS measure IDs using configuration files
5. Driver validates results (skips invalid values like "---")
6. Driver sends valid results to IBLIS via HTTP API
7. Driver sends ACK response to machine for successful processing

## Error Handling

The driver includes comprehensive error handling:
- Automatic ACK/NACK responses to HL7 messages
- Invalid message parsing error recovery
- Network error recovery with retry mechanisms
- IBLIS communication error handling with retry logic
- Socket timeout management
- Graceful shutdown handling
- Detailed error logging for troubleshooting

## Logging

Monitor the console output for:
- Server startup confirmation
- Incoming HL7 messages from BK200
- Message parsing results (sample ID, test names, values)
- Parameter mapping status
- Data transmission status to IBLIS
- Error messages and warnings
- ACK/NACK responses sent to machine

## Troubleshooting

### Connection Issues
1. Verify `port` in settings.json matches machine configuration
2. Check network connectivity between BK200 and driver host
3. Ensure firewall allows connections on configured port

### Authentication Errors
1. Check `lisUser` and `lisPassword` credentials in settings.json
2. Verify IBLIS server is accessible
3. Test IBLIS endpoint manually

### Missing Results
1. Ensure parameter mapping in `mapping.json` is correct for your IBLIS installation
2. Check that parameter names in `parameters.json` match BK200 HL7 output
3. Verify machine is configured to send all required parameters
4. Check for "---" values which indicate invalid/missing results from machine

### HL7 Communication Issues
1. Check machine HL7 protocol settings
2. Verify HL7 version is set to 2.3.1
3. Ensure machine is configured for TCP/IP communication
4. Verify message format matches expected HL7 structure

## Development

### File Structure
```
BIOBASE-BK200/
├── app.js                 # Main driver application
├── package.json           # Node.js dependencies and scripts
├── README.md             # This documentation
└── config/
    ├── settings.json.example    # Example configuration
    ├── settings.json           # IBLIS connection settings
    ├── mapping.json.example    # Example parameter mapping
    ├── mapping.json           # IBLIS measure ID mapping
    └── parameters.json        # Parameter name translation
```

### Adding New Parameters
1. Add parameter mapping to `config/parameters.json`
2. Add corresponding IBLIS measure ID to `config/mapping.json`
3. Test with machine to ensure proper parsing

### Testing
1. Use ASTM simulator to test driver functionality
2. Monitor console output for proper message handling
3. Verify data reaches IBLIS correctly

## License

This project is licensed under the ISC License.

## Support

For support and questions:
- Check the troubleshooting section above
- Review console logs for error messages
- Verify configuration files are correct
- Test network connectivity

## Version History

- v2.0.0 - Updated to HL7 v2.3.1 protocol implementation with enhanced parameter support
- v1.0.0 - Initial release with ASTM ACK protocol support (deprecated)
