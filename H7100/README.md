# H7100

Machine driver for interfacing the Erba H7100 hematology analyzer with IBLIS. The driver listens for HL7 messages from the machine over TCP/IP and uploads the results to IBLIS automatically.

## Requirements

- Node.js **v18**
- npm
- Network connection between the computer running this service and the H7100
- Access to the IBLIS system (API username and password, and the test IDs)

If you use nvm:

```bash
nvm install 18
nvm use 18
```

## Installation

1. Go into the H7100 folder and install the dependencies:

    ```bash
    cd H7100
    npm install
    ```

2. Create the configuration files from the examples:

    ```bash
    cp config/settings.json.example config/settings.json
    cp config/mapping.json.example config/mapping.json
    ```

3. Edit `config/settings.json` and `config/mapping.json` as described in [Configuration](#configuration).

4. Start the service from inside the H7100 folder:

    ```bash
    npm start
    ```

    When the service starts, you will see:

    ```
    Server listening on 0.0.0.0:5000
    H7100 Driver started successfully
    ```

`config/settings.json` and `config/mapping.json` are ignored by git, so passwords and site-specific IDs are never committed.

## Configuration

| File                   | Created from                   | Purpose                                                          |
| ---------------------- | ------------------------------ | ---------------------------------------------------------------- |
| `config/settings.json` | `config/settings.json.example` | IBLIS connection details and the port the service listens on    |
| `config/mapping.json`  | `config/mapping.json.example`  | Links each test name sent by the machine to its test ID in IBLIS |

### settings.json

```json
{
  "port": 5000,
  "host": "0.0.0.0",
  "lisPath": "http://[IBLIS_IP_ADDRESS]:[PORT]/api/v1/interfacer?specimen_id=#{SPECIMEN_ID}&measure_id=#{MEASURE_ID}&result=#{RESULT}&dec=0&machine_name=Erba-H7100",
  "lisUser": "[IBLIS_USERNAME]",
  "lisPassword": "[IBLIS_PASSWORD]",
  "instrumentJSONMapping": "mapping.json",
  "logLevel": "info",
  "retryInterval": 5000,
  "maxRetries": 5
}
```

| Key           | What to put                                                                                                                                                                       |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `port`        | The port this service listens on. It must be the same as the LIS/host port set on the H7100.                                                                                      |
| `host`        | The address to listen on. Leave it as `0.0.0.0` to accept connections on all network cards.                                                                                       |
| `lisPath`     | The IBLIS URL that results are sent to. Replace `[IBLIS_IP_ADDRESS]:[PORT]` with the IBLIS server address and port. Keep `#{SPECIMEN_ID}`, `#{MEASURE_ID}` and `#{RESULT}` as they are. The `machine_name` value must be the instrument name in IBLIS. |
| `lisUser`     | The username of the IBLIS API user.                                                                                                                                               |
| `lisPassword` | The password of the IBLIS API user.                                                                                                                                               |
| `logLevel`    | How much to log: `info` (default), `debug`, `warn` or `error`.                                                                                                                    |

On the H7100, set the LIS/host IP address to the IP address of the computer running this service, and set the port to `port`.

### mapping.json

Each entry has this form:

```json
{
  "<test name exactly as sent by the machine>": "<test ID from IBLIS>"
}
```

Replace every `[IBLIS_MEASURE_ID]` in the example with the test's ID in IBLIS, for example `"WBC": "169"`.

**The name (left side)** must be exactly the same as the test name the machine sends, including capital letters and symbols such as `#` and `%`. To find the exact names:

1. Start the service and run a sample on the H7100.
2. Look at the service log. Each result is printed like this:

    ```
    results:  { name: 'WBC', result: '6.5', id: '169' }
    ```

3. The value after `name:` is the test name from the machine. Copy it exactly as the name in `mapping.json`.
4. If `id` is `''` (empty), that name is missing from `mapping.json` or spelled differently.

**The ID (right side)** must be the ID of that test in the IBLIS system.

Restart the service after changing `settings.json` or `mapping.json`.

### Firewall (ufw)

If ufw is enabled, allow the service port so the machine can connect:

```bash
sudo ufw allow 5000/tcp
```

Replace `5000` with your `port` if you changed it.

## Running with PM2 (recommended)

Start it from inside the H7100 folder, so the log files are written there:

```bash
npm install -g pm2
pm2 start src/index.js --name "h7100-driver"
pm2 save
pm2 startup
```

Then run the command that `pm2 startup` prints.

## Logs

Logs are written to the console, to `h7100.log` (all levels) and to `h7100-error.log` (errors only), in the H7100 folder.

## Troubleshooting

- **`Cannot find module '../../config/settings.json'`:** copy the `.example` files as shown in [Installation](#installation), step 2.
- **`New message received` never appears:** check that the H7100 LIS/host IP and port match this computer's IP and `port`, and that the port is allowed in the firewall.
- **`id: ''` in the log:** the test name is missing from `mapping.json` or does not match exactly.
- **`No valid results to send to IBLIS` or no results in IBLIS:** check `lisPath`, `lisUser`, `lisPassword` and the IDs in `mapping.json`.

## License

MIT. See the `LICENSE` file in the repository root.
