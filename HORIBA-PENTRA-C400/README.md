# Horiba Pentra C400 Driver

Machine driver for interfacing Horiba Pentra C400 biochemistry analyzer with IBLIS for automatic results upload.

## Installation

1. Install Node.js (version 14 or higher recommended)
2. Clone or download this driver
3. Run `npm install` to install dependencies
4. Copy `config/settings.json.example` to `config/settings.json` and configure the settings
5. Run `npm start` to start the driver

## Configuration

Edit `config/settings.json` with your IBLIS server details:

- `lisPath`: URL to IBLIS API endpoint
- `lisUser`: IBLIS admin username
- `lisPassword`: IBLIS admin password
- `outputDir`: Directory where Horiba outputs CSV files
- `hostPort`: Port for the service

## Usage

The driver watches the specified output directory for CSV files from the Horiba Pentra C400 analyzer. When a new CSV file is detected, it parses the results, maps them to IBLIS test IDs, and uploads them automatically.

## CSV Format

Expected CSV columns:
- Sample ID / Accession / ID: The specimen accession number
- Test / Analyte: The test name
- Result / Value: The test result value
- Unit: Optional unit

## Mapping

Test names are mapped to IBLIS measure IDs in `config/mapping.json`. Update this file if your test names differ.

## Service Installation (Windows)

To install as a Windows service, run `node service.js` as administrator.