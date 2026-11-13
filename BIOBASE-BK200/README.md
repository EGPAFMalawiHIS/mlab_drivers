# BIOBASE-BK200

Machine driver for interfacing the BIOBASE BK200 hematology analyzer with IBLIS. The driver listens for HL7 (v2.3.1) messages from the machine over TCP/IP and uploads the results to IBLIS automatically.

## Requirements

- Node.js **v18**
- npm
- Network connection between the computer running this service and the BK200
- Access to the IBLIS system (API username and password, and the test IDs)

If you use nvm:

```bash
nvm install 18
nvm use 18
```

## Installation

1. Go into the BIOBASE-BK200 folder and install the dependencies:

    ```bash
    cd BIOBASE-BK200
    npm install
    ```

2. Create the configuration files from the examples:

    ```bash
    cp config/settings.json.example config/settings.json
    cp config/mapping.json.example config/mapping.json
    ```

3. Edit `config/settings.json`, `config/mapping.json` and, if needed, `config/parameters.json` as described in [Configuration](#configuration).

4. Start the service:

    ```bash
    node app.js
    ```

    When the service starts, you will see:

    ```
    ========= BIOBASE BK200 HL7 SERVICE STARTED ON PORT 5500 =========
    ```

`config/settings.json` and `config/mapping.json` are ignored by git, so passwords and site-specific IDs are never committed.

## Configuration

| File                     | Created from                   | Purpose                                                                     |
| ------------------------ | ------------------------------ | --------------------------------------------------------------------------- |
| `config/settings.json`   | `config/settings.json.example` | IBLIS connection details and the port the service listens on               |
| `config/parameters.json` | (in the repository)            | Translates each test name sent by the machine to a standard parameter name |
| `config/mapping.json`    | `config/mapping.json.example`  | Links each standard parameter name to its test ID in IBLIS                  |

### settings.json

```json
{
  "port": 5500,
  "host": "0.0.0.0",
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

| Key           | What to put                                                                                                                                                                 |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `port`        | The port this service listens on. It must be the same as the LIS/host port set on the BK200.                                                                                |
| `lisPath`     | The IBLIS URL that results are sent to. Replace `127.0.0.1:8005` with the IBLIS server address and port. Keep the `#{...}` placeholders exactly as they are; the driver fills them in. |
| `lisUser`     | The username of the IBLIS API user.                                                                                                                                         |
| `lisPassword` | The password of the IBLIS API user.                                                                                                                                         |
| `machineName` | The machine name sent to IBLIS in place of `#{MACHINE_NAME}`. It must be the same as the instrument name in IBLIS.                                                          |

The other keys (`host`, `timeout`, `socketTimeout`, `maxConnections`, `retryAttempts`, `retryDelay`) can be left at their defaults.

On the BK200, set the LIS/host IP address to the IP address of the computer running this service, and set the port to `port`.

### parameters.json and mapping.json

Each result goes through two lookups:

1. `parameters.json` translates the test name the machine sends into a standard parameter name. For example, the machine may send `LYM%`, which becomes `LYMPH%`:

    ```json
    { "LYM%": "LYMPH%" }
    ```

2. `mapping.json` links that standard name to the test's ID in IBLIS:

    ```json
    { "LYMPH%": "155" }
    ```

**The name on the left of `parameters.json`** must be exactly the same as the test name the machine sends. To find the exact names:

1. Start the service and run a sample on the BK200.
2. Look at the service log. For each result you will see:

    ```
    Test Name: "LYM%"
    ✓ Test: LYM% → LYMPH% → Measure ID: 155
    ```

    The value in `Test Name: "..."` is the exact name from the machine.
3. If you see `✗ No mapping found for test: "<name>"`, add `<name>` to `parameters.json`, and add its standard name with the IBLIS ID to `mapping.json`.

**The ID (right side of `mapping.json`)** must be the ID of that test in the IBLIS system.

Restart the service after changing any configuration file.

### Firewall (ufw)

If ufw is enabled, allow the service port so the machine can connect:

```bash
sudo ufw allow 5500/tcp
```

Replace `5500` with your `port` if you changed it.

## Running with PM2 (recommended)

```bash
npm install -g pm2
pm2 start app.js --name "bk200-driver"
pm2 save
pm2 startup
```

Then run the command that `pm2 startup` prints.

Useful commands:

```bash
pm2 logs bk200-driver      # view the log (used to get test names)
pm2 restart bk200-driver   # restart after changing configuration
```

## Troubleshooting

- **`Cannot find module '.../config/settings.json'`:** copy the `.example` files as shown in [Installation](#installation), step 2.
- **`HL7 CONNECTION ESTABLISHED` never appears:** check that the BK200 LIS/host IP and port match this computer's IP and `port`, and that the port is allowed in the firewall.
- **`Sample ID not found in HL7 message`:** the sample was run without an ID. Enter the IBLIS accession number as the sample ID on the machine.
- **`✗ No mapping found for test`:** see [parameters.json and mapping.json](#parametersjson-and-mappingjson).
- **`Warning: Response status ...` or no results in IBLIS:** check `lisPath`, `lisUser`, `lisPassword` and the IDs in `mapping.json`.
