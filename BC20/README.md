# BC20

Machine driver for interfacing the Mindray BC20 hematology analyzer with IBLIS. The driver connects to the analyzer over the network, receives HL7 result messages and uploads the results to IBLIS automatically.

## Requirements

- Node.js **v18**
- npm
- Network connection between the computer running this driver and the BC20 analyzer
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

1. Go into the BC20 folder:

    ```bash
    cd BC20
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
    Starting Mindray BC20 Driver...
    Attempting to connect to Mindray BC20 at 192.168.1.100:5100
    Connected to Mindray BC20 at 192.168.1.100:5100
    ```

`config/settings.json` and `config/mapping.json` are ignored by git, so each site keeps its own copies and they are never committed. Only the `.example` files are in the repository.

### Upgrading a site that already runs the BC20 driver

Earlier versions committed `config/settings.json` and `config/mapping.json` to git. Pulling this version removes them from the repository, so **back them up before you pull** and put them back afterwards:

```bash
cp config/settings.json /tmp/bc20-settings.json
cp config/mapping.json /tmp/bc20-mapping.json
git pull
cp /tmp/bc20-settings.json config/settings.json
cp /tmp/bc20-mapping.json config/mapping.json
```

Then add `machineHost` and `machinePort` to `config/settings.json` (see below).

The driver used to be started with `bc20.js`. That file has been removed, so if PM2 still runs `bc20.js`, start it again with `app.js` (see [Running with PM2](#running-with-pm2-recommended)).

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
| `machineHost`           | The IP address of the BC20 analyzer.                                                                                                                                              |
| `machinePort`           | The LIS (HL7) port configured on the BC20 analyzer. The default is `5100`.                                                                                                        |

The driver connects **to** the analyzer, so make sure the BC20 has a fixed IP address and that its LIS/HL7 port matches `machinePort`.

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

1. Start the driver and run a sample on the BC20.
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

2. Start the driver from inside the BC20 folder:

    ```bash
    pm2 start app.js --name "bc20-driver"
    ```

3. Save the process list and enable start-up on boot:

    ```bash
    pm2 save
    pm2 startup
    ```

    Then run the command that `pm2 startup` prints.

Useful commands:

```bash
pm2 logs bc20-driver      # view the driver log (used to get test names for mapping.json)
pm2 restart bc20-driver   # restart after changing settings.json or mapping.json
pm2 status                # check that the driver is running
```

## Optional: network monitor service

`monitor_bc_20.sh` pings a server every 60 seconds and restarts the driver through PM2 when the network comes back after an outage. `monitor_bc20_service.service` runs that script as a systemd service.

1. In `monitor_bc_20.sh`, set:
    - `IP_ADDRESS` to the address to watch (for example the BC20's IP).
    - `PM2_PROCESS_ID` to the driver's ID shown by `pm2 status`.
2. In `monitor_bc20_service.service`, set `User` and `WorkingDirectory` to the user and the BC20 folder on this computer.
3. Install and start the service:

    ```bash
    sudo cp monitor_bc20_service.service /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable --now monitor_bc20_service
    ```

The driver already reconnects to the analyzer on its own every 5 seconds, so this monitor is only needed if you also want PM2 restarts after network outages.

## Troubleshooting

- **`Cannot find module '.../config/settings'` or `'.../config/mapping.json'`:** the configuration files have not been created. Copy the `.example` files as shown in [Installation](#installation), step 3.
- **`Connection error: connect ECONNREFUSED` or `ETIMEDOUT`, repeating every 5 seconds:** the driver cannot reach the analyzer. Check `machineHost` and `machinePort`, that the BC20 is on and on the network, and that its LIS/HL7 port is enabled. The driver keeps retrying on its own.
- **`MeasureID: undefined` in the log:** the test name is missing from `mapping.json` or does not match exactly. See [mapping.json](#mappingjson).
- **`Error sending to IBLIS` or a status code other than `200`:** check `lisPath`, `lisUser`, `lisPassword` and the IBLIS IDs in `mapping.json`, and that the IBLIS server is reachable from this computer.
- **The Age result is not sent:** this is expected. The driver skips the patient age (`30525-0`) that the analyzer includes with the results.
