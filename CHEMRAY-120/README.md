# CHEMRAY-120

Machine driver for interfacing the Chemray 120 biochemistry analyzer with IBLIS. The driver listens for HL7 messages from the machine and uploads the results to IBLIS automatically.

## Requirements

- Node.js **v18**
- npm
- Network connection between the computer running this service and the Chemray 120
- Access to the IBLIS system (API username and password, and the test IDs)

If you use nvm:

```bash
nvm install 18
nvm use 18
```

## Installation

Before you start, create the configuration files from the examples. Run these commands from inside the `CHEMRAY-120` folder:

```bash
cp config/settings.json.example config/settings.json
cp config/mapping.json.example config/mapping.json
```

`config/settings.json` and `config/mapping.json` are ignored by git, so each site keeps its own copies and passwords are never committed. Only the `.example` files are in the repository.

1. Go into the CHEMRAY-120 folder and install the dependencies:

    ```bash
    cd CHEMRAY-120
    npm install
    ```

2. Edit `config/settings.json` and `config/mapping.json` as described in [Configuration](#configuration).

3. Start the service:

    ```bash
    node app.js
    ```

    When the service starts, you will see:

    ```
    ========= SERVICE STARTED ON PORT 5050 =========
    ```

## Upgrading a site that already runs this driver

Earlier versions committed `config/settings.json` and `config/mapping.json` to git. Pulling this version removes them from the repository, so **back them up before you pull** and put them back afterwards:

```bash
mkdir -p ~/CHEMRAY-120-config-backup
cp config/settings.json config/mapping.json ~/CHEMRAY-120-config-backup/
git pull
cp ~/CHEMRAY-120-config-backup/* config/
```

On Windows, copy the same files to another folder in File Explorer before pulling, and copy them back afterwards.

## Configuration

| File                   | Purpose                                                          |
| ---------------------- | ---------------------------------------------------------------- |
| `config/settings.json` | IBLIS connection details and the port the service listens on    |
| `config/mapping.json`  | Links each test name sent by the machine to its test ID in IBLIS |

### settings.json

```json
{
  "iblsBaseURL": "http://127.0.0.1:8001/api/update_result.php",
  "iblisUsername": "admin",
  "iblisPassword": "pass",
  "servicePort": "5050"
}
```

| Key             | What to put                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------ |
| `iblsBaseURL`   | The IBLIS result API URL. Replace `127.0.0.1:8001` with the IBLIS server address and port.                   |
| `iblisUsername` | The username of the IBLIS API user.                                                                          |
| `iblisPassword` | The password of the IBLIS API user.                                                                          |
| `servicePort`   | The port this service listens on. It must be the same as the LIS/host port set on the Chemray 120.           |

> **Note:** The key is spelled `iblsBaseURL` (no second "i"). Keep this spelling, because the service looks the key up by that exact name.

On the Chemray 120, set the LIS/host IP address to the IP address of the computer running this service, and set the port to `servicePort`.

### mapping.json

Each entry has this form:

```json
{
  "<test name exactly as sent by the machine>": "<test ID from IBLIS>"
}
```

For example:

```json
{
  "UREA": 142,
  "CREATININE": 329,
  "BIL T": 138
}
```

**The name (left side)** must be exactly the same as the test name the machine sends, including capital letters and spaces. To find the exact names:

1. Start the service and run a sample on the Chemray 120.
2. Look at the service log. Each result is printed on one line:

    ```
    <test name>--><IBLIS ID>--><result>
    ```

    For example:

    ```
    UREA-->142-->4.5
    ```

3. The **first value** on the line (before the first `-->`) is the test name from the machine. Copy it exactly as the name in `mapping.json`.
4. If the second value is `undefined`, that name is missing from `mapping.json` or spelled differently, and the result is not sent to IBLIS.

**The ID (right side)** must be the ID of that test in the IBLIS system.

Restart the service after changing `settings.json` or `mapping.json`.

### Firewall (ufw)

If ufw is enabled, allow the service port so the machine can connect:

```bash
sudo ufw allow 5050/tcp
```

Replace `5050` with your `servicePort` if you changed it.

## Running with PM2 (recommended)

```bash
npm install -g pm2
pm2 start app.js --name "chemray120-driver"
pm2 save
pm2 startup
```

Then run the command that `pm2 startup` prints.

## Troubleshooting

- **The "CONNECTED SUCCESSFULY" message never appears:** check that the analyzer's LIS/host IP and port match this computer's IP and `servicePort`, and that the port is allowed in the firewall.
- **`undefined` in the log:** the test name is missing from `mapping.json` or does not match exactly.
- **Results are not reaching IBLIS:** check `iblsBaseURL`, `iblisUsername`, `iblisPassword` and the IDs in `mapping.json`.
