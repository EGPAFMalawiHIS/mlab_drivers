# DxH 560

Machine driver for interfacing the Beckman Coulter DxH 560 hematology analyzer with IBLIS. The analyzer sends results to this service over the network using the ASTM (low-level) protocol, and the service uploads them to IBLIS automatically. See the DxH 500 series host transmission documentation for the machine side.

## Requirements

- Node.js **v18**
- npm
- Network connection between the computer running this service and the DxH 560
- Access to the IBLIS system (API username and password, and the test IDs)

If you use nvm:

```bash
nvm install 18
nvm use 18
```

## Installation

Before you start, create the configuration files from the examples. Run these commands from inside the `DxH 560` folder:

```bash
cp config/settings.json.example config/settings.json
```

`config/settings.json` are ignored by git, so each site keeps its own copies and passwords are never committed. Only the `.example` files are in the repository.

1. Go into the driver folder and install the dependencies:

    ```bash
    cd "DxH 560"
    npm install
    ```

2. Edit the configuration as described in [Configuration](#configuration).

3. Start the service from inside the folder (the driver looks for `config` in the current folder):

    ```bash
    node index.js
    ```

    When the service starts, you will see:

    ```
    Started server on 10.40.3.131
    ```

## Upgrading a site that already runs this driver

Earlier versions committed `config/settings.json` to git. Pulling this version removes them from the repository, so **back them up before you pull** and put them back afterwards:

```bash
mkdir -p ~/DxH-560-config-backup
cp config/settings.json ~/DxH-560-config-backup/
git pull
cp ~/DxH-560-config-backup/* config/
```

On Windows, copy the same files to another folder in File Explorer before pulling, and copy them back afterwards.

## Configuration

| File                    | Purpose                                                               |
| ----------------------- | --------------------------------------------------------------------- |
| `config/DxH 560.json`   | The address and port this service listens on, and the machine name  |
| `config/settings.json`  | IBLIS connection details                                              |
| `helpers/mapping.js`    | Links each test name to its test ID in IBLIS                          |
| `helpers/regex.js`      | Tells the driver how to find each test name in the machine's messages |

### DxH 560.json

```json
{
  "ipAddress": "10.40.3.131",
  "port": 1234,
  "machineName": "Bechman Coulter DxH 560 Hematology Analyzer"
}
```

| Key           | What to put                                                                                        |
| ------------- | -------------------------------------------------------------------------------------------------- |
| `ipAddress`   | The IP address of the computer running this service.                                               |
| `port`        | The port this service listens on. It must be the same as the host port set on the DxH 560.         |
| `machineName` | The machine name sent to IBLIS. It must be the same as the instrument name in IBLIS.               |

### settings.json

```json
{
  "protocol": "http",
  "host": "10.40.2.10",
  "port": "8001",
  "path": "/api/update_result.php",
  "username": "administrator",
  "password": "password",
  "servicePort": "3110"
}
```

| Key           | What to put                                                  |
| ------------- | ------------------------------------------------------------ |
| `protocol`    | `http` or `https`, as used by the IBLIS server.              |
| `host`        | The IBLIS server address.                                    |
| `port`        | The IBLIS server port.                                       |
| `path`        | The IBLIS result API path.                                   |
| `username`    | The username of the IBLIS API user.                          |
| `password`    | The password of the IBLIS API user.                          |
| `servicePort` | Not used by this driver. Leave it as it is.                  |

On the DxH 560, set the host (LIS) IP address to `ipAddress` and the port to `port`.

### Test mapping (helpers/mapping.js)

The IBLIS test IDs for this driver are kept in `helpers/mapping.js`:

```js
var mapping = {
    "WBC": "169",
    "RBC": "147",
    "LYMPH%": "160",
    ...
}
```

**The name (left side)** must be exactly the same as the name used in `helpers/regex.js`. `regex.js` links each name to the code the machine sends; for example `"LYMPH%": /LY%\|.../` means the machine sends `LY%`, which the driver calls `LYMPH%`.

**The ID (right side)** must be the ID of that test in the IBLIS system.

To check what the machine sends, look at the raw message in the log, or at the documentation, and make sure every code there has an entry in `regex.js` and a matching name in `mapping.js`.

Restart the service after changing any of these files.

### Firewall (ufw)

If ufw is enabled, allow the service port so the machine can connect:

```bash
sudo ufw allow 1234/tcp
```

Replace `1234` with your `port` if you changed it.

## Running with PM2 (recommended)

```bash
cd "DxH 560"
npm install -g pm2
pm2 start index.js --name "dxh560-driver"
pm2 save
pm2 startup
```

Then run the command that `pm2 startup` prints.

## Troubleshooting

- **`Error: listen EADDRNOTAVAIL`:** `ipAddress` in `DxH 560.json` is not an address of this computer.
- **`-- sending data to server --` never appears:** check the DxH 560 host IP and port, that the port is allowed in the firewall, and that the sample was run with an accession number.
- **Results are not reaching IBLIS:** check `settings.json` and the IDs in `helpers/mapping.js`.
