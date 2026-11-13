# MLAB DRIVERS

Machine drivers that connect laboratory analyzers to IBLIS (MLAB). Each driver receives results from one type of machine and uploads them to IBLIS automatically, so results do not have to be typed in by hand.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
![Node.js](https://img.shields.io/badge/logo-node.js-blue?logo=nodejs)
![JavaScript](https://img.shields.io/badge/logo-javascript-blue?logo=javascript)
[![Security scan](https://github.com/EGPAFMalawiHIS/mlab_drivers/actions/workflows/security-scan.yml/badge.svg)](https://github.com/EGPAFMalawiHIS/mlab_drivers/actions/workflows/security-scan.yml)

## Drivers

Each driver lives in its own folder and has its own README with installation and configuration steps.

### Hematology

| Driver | Machine | How it gets results | README |
| ------ | ------- | ------------------- | ------ |
| `BC10` | Mindray BC-10 | Driver connects to the machine over the network (HL7) | [BC10/README.md](BC10/README.md) |
| `BC20` | Mindray BC-20 | Driver connects to the machine over the network (HL7) | [BC20/README.md](BC20/README.md) |
| `BC2800` | Mindray BC-2800 | Serial cable | [BC2800/README.md](BC2800/README.md) |
| `bc3000` | Mindray BC-3000 | Serial cable | [bc3000/README.md](bc3000/README.md) |
| `BIOBASE-BK200` | BIOBASE BK200 | Machine sends to the driver over the network (HL7) | [BIOBASE-BK200/README.md](BIOBASE-BK200/README.md) |
| `DxH 560` | Beckman Coulter DxH 560 | Machine sends to the driver over the network (ASTM) | [DxH 560/README.md](DxH%20560/README.md) |
| `H7100` | Erba H7100 | Machine sends to the driver over the network (HL7) | [H7100/README.md](H7100/README.md) |
| `XP300_ASTM` | Sysmex XP-300 | Machine sends to the driver over the network (ASTM) | [XP300_ASTM/README.md](XP300_ASTM/README.md) |
| `xn1000` | Sysmex XN-1000 | Machine sends to the driver over the network | [xn1000/README.md](xn1000/README.md) |
| `xn530` | Sysmex XN-530 / XN-550 | Machine sends to the driver over the network | [xn530/README.md](xn530/README.md) |
| `xq320` | Sysmex XQ-320 | Machine sends to the driver over the network | [xq320/README.md](xq320/README.md) |

### Chemistry

| Driver | Machine | How it gets results | README |
| ------ | ------- | ------------------- | ------ |
| `BS120` | Mindray BS-120 | Watches a folder for exported result files | [BS120/README.md](BS120/README.md) |
| `BS120-CSV` | Mindray BS-120 | Watches a folder for exported CSV files | [BS120-CSV/README.md](BS120-CSV/README.md) |
| `BS120-Network` | Mindray BS-120 | Machine sends to the driver over the network (capture only, see README) | [BS120-Network/README.md](BS120-Network/README.md) |
| `BS240` | Mindray BS-240 | Machine sends to the driver over the network (HL7) | [BS240/README.md](BS240/README.md) |
| `BS430` | Mindray BS-430 / BS-230 | Machine sends to the driver over the network (HL7) | [BS430/README.md](BS430/README.md) |
| `CHEMRAY-120` | Rayto Chemray 120 | Machine sends to the driver over the network (HL7) | [CHEMRAY-120/README.md](CHEMRAY-120/README.md) |
| `XL200` | Erba XL-200 | Watches a folder for exported Excel files | [XL200/README.md](XL200/README.md) |
| `XL640` | Erba XL-640 | Machine sends to the driver over the network (ASTM) | [XL640/README.md](XL640/README.md) |
| `XL640-XLS` | Erba XL-640 | Watches a folder for exported `.xls` files | [XL640-XLS/README.md](XL640-XLS/README.md) |

### Blood gas, microbiology and molecular

| Driver | Machine | How it gets results | README |
| ------ | ------- | ------------------- | ------ |
| `ABL800-FLEX` | Radiometer ABL800 FLEX | Watches a folder for exported result files | [ABL800-FLEX/README.md](ABL800-FLEX/README.md) |
| `BD-BACTEC-FX40` | BD BACTEC FX40 | Serial cable | [BD-BACTEC-FX40/README.md](BD-BACTEC-FX40/README.md) |
| `GeneXpert_Machine_Driver` | Cepheid GeneXpert | Machine sends to the driver over the network (ASTM) | [GeneXpert_Machine_Driver/README.md](GeneXpert_Machine_Driver/README.md) |

`CL-1000i` has no code in this repository. The folder is an empty link to another repository.

## Requirements

- Node.js **v18** for all drivers
- npm
- Access to the IBLIS system: an API username and password, and the IBLIS ID of each test

If you use nvm:

```bash
nvm install 18
nvm use 18
```

## How every driver is set up

The steps are the same for every driver. The driver's own README has the details.

1. Go into the driver's folder and install its dependencies:

    ```bash
    cd <driver folder>
    npm install
    ```

2. Configure the driver:
    - **Settings:** the IBLIS address, username and password, and how the driver reaches the machine (network address, port, serial port or folder).
    - **Mapping:** a list that links each test name the machine sends to the ID of that test in IBLIS. The test name must be **exactly** the same as the name the machine sends, and the ID must be the test's ID in IBLIS. Each README explains where the driver prints the machine's test names in its log, so you can copy them exactly.

    Where a driver has `.example` configuration files, copy them first and edit the copies. Those copies are ignored by git, so passwords are never committed.

3. Start the driver, run a test sample on the machine, and check the log.

4. Keep it running with PM2:

    ```bash
    npm install -g pm2
    pm2 start <entry file> --name "<driver>-driver"
    pm2 save
    pm2 startup
    ```

5. If the machine connects to the driver over the network and ufw is enabled, allow the driver's port:

    ```bash
    sudo ufw allow <port>/tcp
    ```

## Security scan

Every push and pull request runs the [Security scan](.github/workflows/security-scan.yml) workflow. It checks all source files for signs of injected, obfuscated malware, such as code hidden after long runs of spaces, loaders that use `eval`, or blockchain-based command-and-control addresses. The check fails if anything is found.

Run the same scan locally before pushing:

```bash
node .github/scripts/scan-malware.js
```

## License

MIT. See [LICENSE](LICENSE).
