# xn1000

Machine driver for interfacing the Sysmex XN-1000 hematology analyzer with IBLIS. The analyzer sends results to this service over the network, and the service uploads them to IBLIS automatically.

## Requirements

- Node.js **v18**
- npm
- Network connection between the computer running this service and the XN-1000
- Access to the IBLIS system (API username and password, and the test IDs)

If you use nvm:

```bash
nvm install 18
nvm use 18
```

## Installation

Before you start, create the configuration files from the examples. Run these commands from inside the `xn1000` folder:

```bash
cp config/settings.json.example config/settings.json
cp config/xnseries.json.example config/xnseries.json
```

`config/settings.json` and `config/xnseries.json` are ignored by git, so each site keeps its own copies and passwords are never committed. Only the `.example` files are in the repository.

1. Go into the xn1000 folder and install the dependencies:

    ```bash
    cd xn1000
    npm install
    ```

2. Edit the configuration as described in [Configuration](#configuration).

3. Start the service from inside the folder (the driver looks for `config` in the current folder):

    ```bash
    node xn1000.js
    ```

    When the service starts, you will see:

    ```
    Server started at 192.168.100.10:1234, listening...
    ```

## Upgrading a site that already runs this driver

Earlier versions committed `config/settings.json` and `config/xnseries.json` to git. Pulling this version removes them from the repository, so **back them up before you pull** and put them back afterwards:

```bash
mkdir -p ~/xn1000-config-backup
cp config/settings.json config/xnseries.json ~/xn1000-config-backup/
git pull
cp ~/xn1000-config-backup/* config/
```

On Windows, copy the same files to another folder in File Explorer before pulling, and copy them back afterwards.

## Configuration

| File                     | Purpose                                                    |
| ------------------------ | ---------------------------------------------------------- |
| `config/settings.json`   | IBLIS connection details and the address this service listens on |
| `config/xnseries.json`   | Links each test name to its test ID in IBLIS               |

### settings.json

```json
{
  "lisPath": "http://192.168.100.200:8005/api/v1/interfacer?specimen_id=#{SPECIMEN_ID}&measure_id=#{MEASURE_ID}&result=#{RESULT}&dec=0&machine_name=sysmex-xn1000",
  "lisUser": "username",
  "lisPassword": "password",
  "machineName": "sysmex-xn1000",
  "serverIp": "192.168.100.10",
  "serverPort": "1234"
}
```

| Key           | What to put                                                                                                                                                                 |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lisPath`     | The IBLIS URL that results are sent to. Replace the address and port with the IBLIS server's. Keep `#{SPECIMEN_ID}`, `#{MEASURE_ID}` and `#{RESULT}` as they are. The `machine_name` value must be the instrument name in IBLIS. |
| `lisUser`     | The username of the IBLIS API user.                                                                                                                                         |
| `lisPassword` | The password of the IBLIS API user.                                                                                                                                         |
| `machineName` | The machine name, for reference. The value used is the `machine_name` in `lisPath`.                                                                                         |
| `serverIp`    | The IP address of the computer running this service. Leave it out, or use `0.0.0.0`, to listen on all network cards. |
| `serverPort`  | The port this service listens on (default `1234`). It must be the same as the host port set on the XN-1000. |

On the XN-1000, set the host IP address to the IP address of the computer running this service and the port to `serverPort`.

### xnseries.json

Each entry has this form:

```json
{
  "<test name>": "<test ID from IBLIS>"
}
```

The XN-1000 sends results in fixed positions, so the test names come from the list in `xn1000.js`, not from the machine. **The name (left side)** must be one of those names, in **capital letters**, because the driver converts each name to capitals before looking it up. To see the names:

1. Start the service and run a sample on the XN-1000.
2. Look at the service log. Each result is printed on one line:

    ```
    WBC   : 6.52
    LYMPH%   : 30.1
    ```

3. The value before `:` is the test name (use it in capitals in `xnseries.json`).

A test that is not in `xnseries.json` is not sent to IBLIS. **The ID (right side)** must be the ID of that test in the IBLIS system.

Restart the service after changing any configuration file.

### Firewall (ufw)

If ufw is enabled, allow the service port so the machine can connect:

```bash
sudo ufw allow 1234/tcp
```

## Running with PM2 (recommended)

```bash
cd xn1000
npm install -g pm2
pm2 start xn1000.js --name "xn1000-driver"
pm2 save
pm2 startup
```

Then run the command that `pm2 startup` prints.

## Troubleshooting

- **`Error: listen EADDRNOTAVAIL`:** `serverIp` is not an address of this computer.
- **Nothing in the log when a sample finishes:** check the XN-1000 host IP and port, and that the port is allowed in the firewall.
- **A result does not reach IBLIS:** check that its name is in `xnseries.json` in capital letters, and check `lisPath`, `lisUser` and `lisPassword`.
