# BS430

Machine driver for interfacing the Mindray BS-430 (and BS-230) chemistry analyzer with IBLIS. The driver listens for HL7 messages from the machine and uploads the results to IBLIS automatically.

## Requirements

- Node.js **v18**
- npm
- Network connection between the computer running this service and the BS430 machine
- Access to the IBLIS system (API username and password, and the test IDs)

If you use nvm:

```bash
nvm install 18
nvm use 18
```

## Installation

Before you start, create the configuration files from the examples. Run these commands from inside the `BS430` folder:

```bash
cp config/settings.json.example config/settings.json
cp config/mapping.json.example config/mapping.json
```

`config/settings.json` and `config/mapping.json` are ignored by git, so each site keeps its own copies and passwords are never committed. Only the `.example` files are in the repository.

1. Go into the BS430 folder and install the dependencies:

    ```bash
    cd BS430
    npm install
    ```

2. Edit `config/settings.json` and `config/mapping.json` as described in [Configuration](#configuration).

3. Start the service:

    ```bash
    node app.js
    ```

    When the service starts, you will see:

    ```
    ========= SERVICE STARTED ON PORT 3020 =========
    ```

## Upgrading a site that already runs this driver

Earlier versions committed `config/settings.json` and `config/mapping.json` to git. Pulling this version removes them from the repository, so **back them up before you pull** and put them back afterwards:

```bash
mkdir -p ~/BS430-config-backup
cp config/settings.json config/mapping.json ~/BS430-config-backup/
git pull
cp ~/BS430-config-backup/* config/
```

On Windows, copy the same files to another folder in File Explorer before pulling, and copy them back afterwards.

## Configuration

| File                      | Purpose                                                              |
| ------------------------- | -------------------------------------------------------------------- |
| `config/settings.json`    | IBLIS connection details and the port the service listens on        |
| `config/mapping.json`     | Links each test name sent by the machine to its test ID in IBLIS     |
| `config/definitions.json` | Not used by the current driver. Leave it as it is.                   |

### settings.json

```json
{
  "iblsBaseURL": "http://127.0.0.1:8005/api/v1/interfacer",
  "iblisUsername": "admin",
  "iblisPassword": "pass",
  "bs430ServicePort": "3020"
}
```

| Key                | What to put                                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------------------- |
| `iblsBaseURL`      | The IBLIS interfacer API URL. Replace `127.0.0.1:8005` with the IBLIS server address and port.           |
| `iblisUsername`    | The username of the IBLIS API user.                                                                      |
| `iblisPassword`    | The password of the IBLIS API user.                                                                      |
| `bs430ServicePort` | The port this service listens on. It must be the same as the LIS/host port set on the BS430 machine.     |

> **Note:** The key is spelled `iblsBaseURL` (no second "i"). Keep this spelling, because the service looks the key up by that exact name.

On the BS430 machine, set the LIS/host IP address to the IP address of the computer running this service, and set the port to `bs430ServicePort`.

### mapping.json

Each entry has this form:

```json
{
  "<test name exactly as sent by the machine>": "<test ID from IBLIS>"
}
```

**The name (left side)** must be exactly the same as the test name the machine sends, including capital letters, spaces and symbols. To find the exact names:

1. Start the service and run a sample on the BS430.
2. Look at the service log. Each result is printed on one line:

    ```
    <test name>--><IBLIS ID>--><result>
    ```

    For example:

    ```
    ALT-->133-->25.4
    ```

3. The **first value** on the line (before the first `-->`) is the test name from the machine. Copy it exactly as the name in `mapping.json`.
4. If the second value is `undefined`, that name is missing from `mapping.json` or spelled differently, and the result is not sent to IBLIS.

**The ID (right side)** must be the ID of that test in the IBLIS system.

Restart the service after changing `settings.json` or `mapping.json`.

### Firewall (ufw)

If ufw is enabled, allow the service port so the machine can connect:

```bash
sudo ufw allow 3020/tcp
```

Replace `3020` with your `bs430ServicePort` if you changed it.

## Running with PM2 (recommended)

```bash
npm install -g pm2
pm2 start app.js --name "bs430-driver"
pm2 save
pm2 startup
```

Then run the command that `pm2 startup` prints.

Useful commands:

```bash
pm2 logs bs430-driver      # view the log (used to get test names for mapping.json)
pm2 restart bs430-driver   # restart after changing settings.json or mapping.json
```

## Troubleshooting

- **The "CONNECTED SUCCESSFULY" message never appears:** check that the BS430 LIS/host IP and port match this computer's IP and `bs430ServicePort`, and that the port is allowed in the firewall.
- **`undefined` in the log:** the test name is missing from `mapping.json` or does not match exactly.
- **Results are not reaching IBLIS:** check `iblsBaseURL`, `iblisUsername`, `iblisPassword` and the IDs in `mapping.json`.

## License

MIT. See the `LICENSE` file in the repository root.
