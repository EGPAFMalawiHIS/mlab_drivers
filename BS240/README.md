# BS240

Machine driver for interfacing the Mindray BS240 chemistry analyzer with IBLIS. The driver listens for HL7 messages from the machine and uploads the results to IBLIS automatically.

## Requirements

- Node.js **v18**
- npm
- Network connection between the computer running this service and the BS240 machine
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

1. Go into the BS240 folder:

    ```bash
    cd BS240
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

5. Start the service:

    ```bash
    node app.js
    ```

    When the service starts, you will see:

    ```
    ========= SERVICE STARTED ON PORT 3040 =========
    ```

## Configuration

The service reads two files from the `config` folder:

| File            | Created from                   | Purpose                                                          |
| --------------- | ------------------------------ | ---------------------------------------------------------------- |
| `settings.json` | `config/settings.json.example` | IBLIS connection details and the port the service listens on    |
| `mapping.json`  | `config/mapping.json.example`  | Links each test name sent by the machine to its test ID in IBLIS |

### settings.json

```json
{
  "iblsBaseURL": "http://127.0.0.1:8005/api/v1/interfacer?machine_name=MainLab-Mindray-BS240",
  "iblisUsername": "user",
  "iblisPassword": "pass",
  "machineServicePort": "3040",
  "machineName": "Mindray-BS240"
}
```

| Key                  | What to put                                                                                                                                                                                              |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `iblsBaseURL`        | The IBLIS interfacer API URL. Replace `127.0.0.1:8005` with the IBLIS server address and port. The `machine_name` value must be exactly the same as the instrument name registered in IBLIS. |
| `iblisUsername`      | The username of the IBLIS API user.                                                                                                                                                                      |
| `iblisPassword`      | The password of the IBLIS API user.                                                                                                                                                                      |
| `machineServicePort` | The port this service listens on. It must be the same as the LIS/host port configured on the BS240 machine.                                                                                              |
| `machineName`        | The name of this machine. It must be exactly the same as the machine name used in IBLIS.                                                                                                                |

> **Note:** The key is spelled `iblsBaseURL` (no second "i"). Keep this spelling, because the service looks the key up by that exact name.

On the BS240 machine, set the LIS/host IP address to the IP address of the computer running this service, and set the port to `machineServicePort`.

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
  "Alanine Aminotransferase": "133",
  "Aspartate Aminotransferase": "134",
  "Urea": "142"
}
```

**The name (left side)** must be exactly the same as the test name the machine sends. That includes spelling, capital letters, spaces, brackets and symbols. To find the exact names:

1. Start the service and run a sample on the BS240.
2. Look at the service log. Each result is printed on one line in this format:

    ```
    <test name>--><IBLIS ID>--><raw result>--><parsed result>
    ```

    For example:

    ```
    Urea-->142-->4.530000-->4.53
    ```

3. The **first value** on the line (before the first `-->`) is the test name from the machine. Copy it exactly as the name in `mapping.json`.
4. If the second value shows `undefined`, that test name is not in `mapping.json` yet, or it is spelled differently. For example:

    ```
    Total Bilirubin-->undefined-->12.100000-->12.1
    ```

**The ID (right side)** must be the ID of that test from the IBLIS system. Look up the ID for each test in IBLIS and put it as the value.

After changing `settings.json` or `mapping.json`, restart the service so it picks up the changes.

## Running with PM2 (recommended)

PM2 keeps the service running in the background and restarts it after a reboot.

1. Install PM2 globally:

    ```bash
    npm install -g pm2
    ```

2. Start the service from inside the BS240 folder:

    ```bash
    pm2 start app.js --name "bs240-driver"
    ```

3. Save the process list and enable start-up on boot:

    ```bash
    pm2 save
    pm2 startup
    ```

    Then run the command that `pm2 startup` prints.

Useful commands:

```bash
pm2 logs bs240-driver      # view the service log (used to get test names for mapping.json)
pm2 restart bs240-driver   # restart after changing settings.json or mapping.json
pm2 status                 # check that the service is running
```

## Troubleshooting

- **`Cannot find module '.../config/settings'` or `'.../config/mapping'`:** the configuration files have not been created. Copy the `.example` files as shown in [Installation](#installation), step 3.
- **The connection message never appears in the log:** check that the BS240 LIS/host IP and port match this computer's IP and `machineServicePort`, and that no firewall is blocking the port.
- **A result shows `undefined` in the log and does not reach IBLIS:** the test name is missing from `mapping.json` or does not match exactly. See [mapping.json](#mappingjson).
- **Results are sent but rejected by IBLIS:** check `iblsBaseURL`, `iblisUsername`, `iblisPassword` and the IBLIS IDs in `mapping.json`.
- **Results of `-268435455` are skipped:** this is expected. The machine sends this value when it has no result for a test.
