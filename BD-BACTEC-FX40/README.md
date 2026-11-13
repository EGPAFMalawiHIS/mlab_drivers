# BD-BACTEC-FX40

Machine driver for interfacing the BD BACTEC FX40 blood culture instrument with IBLIS. The instrument sends results over a serial cable, and the driver uploads them to IBLIS automatically.

> **Security note:** versions of `app.js` from commit `02c0645` (May 2026) until the cleanup commit contained injected malware. If this driver ran on a computer during that time, check that computer before using it again. See the [Security scan](../README.md#security-scan) section of the main README.

## Requirements

- Node.js **v18**
- npm
- A serial cable (usually a USB-to-serial adapter) between the FX40 and the computer running the driver
- Access to the IBLIS system (API username and password, and the test IDs)

If you use nvm (Linux):

```bash
nvm install 18
nvm use 18
```

On Windows, install Node.js 18 from [nodejs.org](https://nodejs.org/).

## Installation

1. Go into the BD-BACTEC-FX40 folder and install the dependencies:

    ```bash
    cd BD-BACTEC-FX40
    npm install
    ```

2. Create the configuration files from the examples:

    ```bash
    cp config/settings.json.example config/settings.json
    cp config/mapping.json.example config/mapping.json
    ```

3. Edit `config/settings.json` and `config/mapping.json` as described in [Configuration](#configuration).

4. On Linux, allow your user to open the serial port, then log out and back in:

    ```bash
    sudo usermod -a -G dialout $USER
    ```

5. Start the driver:

    ```bash
    node app.js
    ```

    If the serial connection works, you will see:

    ```
    BD BACTEC FX40 driver started
    Connected to BD BACTEC FX40 on /dev/ttyUSB0 at 9600 baud
    ```

## Upgrading a site that already runs this driver

Earlier versions committed `config/settings.json` and `config/mapping.json` to git. Pulling this version removes them from the repository, so **back them up before you pull** and put them back afterwards:

```bash
mkdir -p ~/BD-BACTEC-FX40-config-backup
cp config/settings.json config/mapping.json ~/BD-BACTEC-FX40-config-backup/
git pull
cp ~/BD-BACTEC-FX40-config-backup/* config/
```

On Windows, copy the same files to another folder in File Explorer before pulling, and copy them back afterwards.

## Configuration

| File                   | Purpose                                                    |
| ---------------------- | ---------------------------------------------------------- |
| `config/settings.json` | IBLIS connection details and the serial port settings     |
| `config/mapping.json`  | Links each result and field to its test ID in IBLIS        |

### settings.json

```json
{
  "lisPath": "http://192.168.100.200:8005/api/v1/interfacer?specimen_id=#{SPECIMEN_ID}&measure_id=#{MEASURE_ID}&result=#{RESULT}&dec=0",
  "lisUser": "admin",
  "lisPassword": "password",
  "instrumentJSONMapping": "mapping.json",
  "serialPort": {
    "path": "/dev/ttyUSB0",
    "baudRate": 9600,
    "dataBits": 8,
    "stopBits": 1,
    "parity": "none"
  },
  "machineName": "BD_BACTEC_FX40"
}
```

| Key                     | What to put                                                                                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `lisPath`               | The IBLIS URL that results are sent to. Replace `192.168.100.200:8005` with the IBLIS server address and port. Keep `#{SPECIMEN_ID}`, `#{MEASURE_ID}` and `#{RESULT}` as they are. |
| `lisUser`               | The username of the IBLIS API user.                                                                                                                          |
| `lisPassword`           | The password of the IBLIS API user.                                                                                                                          |
| `instrumentJSONMapping` | The name of the mapping file in the `config` folder. Leave it as `mapping.json`.                                                                             |
| `serialPort.path`       | The serial port: for example `/dev/ttyUSB0` on Linux or `COM3` on Windows.                                                                                   |
| `serialPort.baudRate`, `dataBits`, `stopBits`, `parity` | Must match the serial settings on the FX40.                                                                                  |
| `machineName`           | The machine name, for reference.                                                                                                                             |

To list serial ports on Linux:

```bash
ls /dev/ttyUSB* /dev/ttyS*
```

On Windows, open Device Manager and look under **Ports (COM & LPT)**.

### mapping.json

```json
{
  "POSITIVE": "201",
  "NEGATIVE": "202",
  "PENDING": "203",
  "INCONCLUSIVE": "204",
  "ERROR": "205",
  "DETECTION_TIME": "207",
  "PROTOCOL_NAME": "208",
  "BOTTLE_TYPE": "209"
}
```

The names on the left are fixed by the driver:

- `POSITIVE`, `NEGATIVE`, `PENDING`, `INCONCLUSIVE`, `ERROR`: the culture status the instrument reports. The driver sends `TRUE` to the IBLIS test with this ID.
- `DETECTION_TIME`, `PROTOCOL_NAME`, `BOTTLE_TYPE`: extra fields. The driver sends the value to the IBLIS test with this ID.

**The ID (right side)** must be the ID of that test in the IBLIS system. Remove an entry if you do not want that field sent.

The log prints everything the instrument sends (`Received: ...`) and the buffer it processes (`Processing complete buffer: ...`). Use it to check that the sample ID and status are being read from the instrument's messages.

Restart the driver after changing `settings.json` or `mapping.json`.

## Running as a service

### Linux (PM2)

```bash
npm install -g pm2
pm2 start app.js --name "bd-bactec-fx40"
pm2 save
pm2 startup
```

Then run the command that `pm2 startup` prints.

### Windows

Install `node-windows` and then the service:

```bash
npm install node-windows
node service.js
```

This installs and starts the **BD BACTEC FX40 Driver** Windows service.

## Troubleshooting

- **`Error opening port`:** check `serialPort.path`, that the cable is connected, and (on Linux) that your user is in the `dialout` group.
- **Data is received but nothing is sent:** check in the log that the sample ID and status are present in `Processing complete buffer: ...`, and that the status is listed in `mapping.json`.
- **`Error sending data to LIS`:** check `lisPath`, `lisUser`, `lisPassword` and that the IBLIS server is reachable.
