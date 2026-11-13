# BC10

Machine driver for interfacing the Mindray BC10 hematology analyzer with IBLIS. The driver connects to the analyzer over the network, receives HL7 result messages and uploads the results to IBLIS automatically.

## Requirements

- Node.js **v18**
- npm
- Network connection between the computer running this driver and the BC10 analyzer
- Access to the IBLIS system (API username and password, and the test indicator IDs)

Check your Node.js version:

```bash
node -v
```

If you use nvm, install and switch to Node.js 18:

```bash
nvm install 18
nvm use 18
```

## Installation

1. Go into the BC10 folder:

    ```bash
    cd BC10
    ```

2. Install the dependencies:

    ```bash
    npm install
    ```

3. Create the configuration files from the examples in the `config` folder:

    ```bash
    cp config/settings.json.example config/settings.json
    cp config/mapping.json.example config/mapping.json
    ```

4. Edit `config/settings.json` and `config/mapping.json` as described in the [Configuration](#configuration) section below.

5. Start the driver:

    ```bash
    node app.js
    ```

    When the driver starts and reaches the analyzer, you will see:

    ```
    Starting Mindray BC10 Driver...
    Attempting to connect to Mindray BC10 at 192.168.1.100:5100
    Connected to Mindray BC10 at 192.168.1.100:5100
    ```

`config/settings.json` and `config/mapping.json` are ignored by git, so each site keeps its own copies and they are never committed. Only the `.example` files are in the repository.

## Configuration

The driver reads two files from the `config` folder:

| File            | Created from                   | Purpose                                                          |
| --------------- | ------------------------------ | ---------------------------------------------------------------- |
| `settings.json` | `config/settings.json.example` | IBLIS connection details and the analyzer's network address      |
| `mapping.json`  | `config/mapping.json.example`  | Links each test name sent by the machine to its test ID in IBLIS |

### settings.json

```json
{
  "lisPath": "http://192.168.100.200:8005/api/v1/interfacer?specimen_id=#{SPECIMEN_ID}&measure_id=#{MEASURE_ID}&result=#{RESULT}&dec=0",
  "lisUser": "admin",
  "lisPassword": "password",
  "instrumentJSONMapping": "mapping.json",
  "hostPort": "3018",
  "machineHost": "192.168.1.100",
  "machinePort": 5100
}
```

| Key                     | What to put                                                                                                                                                                       |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lisPath`               | The IBLIS URL that results are sent to. Replace `192.168.100.200:8005` with the IBLIS server address and port. Keep `#{SPECIMEN_ID}`, `#{MEASURE_ID}` and `#{RESULT}` exactly as they are; the driver fills them in for each result. |
| `lisUser`               | The username of the IBLIS API user.                                                                                                                                               |
| `lisPassword`           | The password of the IBLIS API user.                                                                                                                                               |
| `instrumentJSONMapping` | The name of the mapping file in the `config` folder. Leave it as `mapping.json`.                                                                                                  |
| `hostPort`              | Not used by this driver. Leave it as it is.                                                                                                                                       |
| `machineHost`           | The IP address of the BC10 analyzer.                                                                                                                                              |
| `machinePort`           | The LIS (HL7) port configured on the BC10 analyzer. The default is `5100`.                                                                                                        |

The driver connects **to** the analyzer, so make sure the BC10 has a fixed IP address and that its LIS/HL7 port matches `machinePort`.

### mapping.json

Each entry in `mapping.json` has this form:

```json
{
  "<test name exactly as sent by the machine>": "<test ID from IBLIS>"
}
```

For example:

```json
{
  "WBC": "169",
  "HGB": "148",
  "PLT": "153"
}
```

**The name (left side)** must be exactly the same as the test name the machine sends. That includes spelling, capital letters and symbols such as `#` and `%`. To find the exact names:

1. Start the driver and run a sample on the BC10.
2. Look at the driver log. Each result is printed on one line in this format:

    ```
    Processing: <test name> = <result> MeasureID: <IBLIS ID>
    ```

    For example:

    ```
    Processing: WBC = 6.5 MeasureID: 169
    ```

3. The **first value** on the line (right after `Processing:`) is the test name from the machine. Copy it exactly as the name in `mapping.json`.
4. If `MeasureID` shows `undefined`, that test name is not in `mapping.json` yet, or it is spelled differently, and the result is not sent to IBLIS. For example:

    ```
    Processing: LYM# = 2.1 MeasureID: undefined
    ```

**The ID (right side)** must be the ID of that test from the IBLIS system. Look up the ID for each test in IBLIS and put it as the value.

After changing `settings.json` or `mapping.json`, restart the driver so it picks up the changes.

## Running with PM2 (recommended)

PM2 keeps the driver running in the background and restarts it after a reboot.

1. Install PM2 globally:

    ```bash
    npm install -g pm2
    ```

2. Start the driver from inside the BC10 folder:

    ```bash
    pm2 start app.js --name "bc10-driver"
    ```

3. Save the process list and enable start-up on boot:

    ```bash
    pm2 save
    pm2 startup
    ```

    Then run the command that `pm2 startup` prints.

Useful commands:

```bash
pm2 logs bc10-driver      # view the driver log (used to get test names for mapping.json)
pm2 restart bc10-driver   # restart after changing settings.json or mapping.json
pm2 status                # check that the driver is running
```

## Troubleshooting

- **`Cannot find module '.../config/settings'` or `'.../config/mapping.json'`:** the configuration files have not been created. Copy the `.example` files as shown in [Installation](#installation), step 3.
- **`Connection error: connect ECONNREFUSED` or `ETIMEDOUT`, repeating every 5 seconds:** the driver cannot reach the analyzer. Check `machineHost` and `machinePort`, that the BC10 is on and on the network, and that its LIS/HL7 port is enabled. The driver keeps retrying on its own.
- **`MeasureID: undefined` in the log:** the test name is missing from `mapping.json` or does not match exactly. See [mapping.json](#mappingjson).
- **`Error sending to IBLIS` or a status code other than `200`:** check `lisPath`, `lisUser`, `lisPassword` and the IBLIS IDs in `mapping.json`, and that the IBLIS server is reachable from this computer.
- **The Age result is not sent:** this is expected. The driver skips the patient age (`30525-0`) that the analyzer includes with the results.
