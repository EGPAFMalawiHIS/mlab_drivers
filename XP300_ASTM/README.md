# XP300_ASTM

Machine driver for interfacing the Sysmex XP-300 hematology analyzer with IBLIS. The analyzer sends results to this service over the network using the ASTM (low-level) protocol, and the service uploads them to IBLIS automatically. See the Sysmex XP-300 host transmission documentation for the machine side.

## Requirements

- Node.js **v18**
- npm
- Network connection between the computer running this service and the XP-300
- Access to the IBLIS system (API username and password, and the test IDs)

If you use nvm:

```bash
nvm install 18
nvm use 18
```

## Installation

Before you start, create the configuration files from the examples. Run these commands from inside the `XP300_ASTM` folder:

```bash
cp config/settings.json.example config/settings.json
cp config/mapping.json.example config/mapping.json
```

`config/settings.json` and `config/mapping.json` are ignored by git, so each site keeps its own copies and passwords are never committed. Only the `.example` files are in the repository.

1. Go into the driver folder and install the dependencies:

    ```bash
    cd XP300_ASTM
    npm install
    ```

2. Edit the configuration as described in [Configuration](#configuration).

3. Start the service from inside the folder (the driver looks for `config` in the current folder):

    ```bash
    node index.js
    ```

    When the service starts, you will see:

    ```
    Started server on 127.0.0.1
    ```

## Upgrading a site that already runs this driver

Earlier versions committed `config/settings.json` and `config/mapping.json` to git. Pulling this version removes them from the repository, so **back them up before you pull** and put them back afterwards:

```bash
mkdir -p ~/XP300_ASTM-config-backup
cp config/settings.json config/mapping.json ~/XP300_ASTM-config-backup/
git pull
cp ~/XP300_ASTM-config-backup/* config/
```

On Windows, copy the same files to another folder in File Explorer before pulling, and copy them back afterwards.

## Configuration

| File                     | Purpose                                                                      |
| ------------------------ | ---------------------------------------------------------------------------- |
| `config/xp300.json`      | The address and port this service listens on, and the machine name          |
| `config/settings.json`   | IBLIS connection details                                                     |
| `config/parameters.json` | Translates each test name sent by the machine to a standard parameter name  |
| `config/mapping.json`    | Links each standard parameter name to its test ID in IBLIS                   |

### xp300.json

```json
{
  "ipAddress": "127.0.0.1",
  "port": 1234,
  "machineName": "Sysmex-xp300"
}
```

| Key           | What to put                                                                                    |
| ------------- | ---------------------------------------------------------------------------------------------- |
| `ipAddress`   | The IP address of the computer running this service (`0.0.0.0` listens on all network cards). |
| `port`        | The port this service listens on. It must be the same as the host port set on the XP-300.     |
| `machineName` | The machine name sent to IBLIS. It must be the same as the instrument name in IBLIS.           |

### settings.json

```json
{
  "protocol": "http",
  "IblisIpAddress": "127.0.0.1",
  "port": "8005",
  "path": "/api/v1/interfacer",
  "username": "username",
  "password": "password"
}
```

| Key              | What to put                                      |
| ---------------- | ------------------------------------------------ |
| `protocol`       | `http` or `https`, as used by the IBLIS server.  |
| `IblisIpAddress` | The IBLIS server address.                        |
| `port`           | The IBLIS server port.                           |
| `path`           | The IBLIS interfacer API path.                   |
| `username`       | The username of the IBLIS API user.              |
| `password`       | The password of the IBLIS API user.              |

On the XP-300, set the host IP address to `ipAddress` and the port to `port`.

### parameters.json and mapping.json

Each result goes through two lookups:

1. `parameters.json` translates the test name the machine sends into a standard parameter name, for example `"LYM%": "LYMPH%"`.
2. `mapping.json` links that standard name to the test's ID in IBLIS, for example `"LYMPH%": "160"`.

**The name on the left of `parameters.json`** must be exactly the same as the test name the machine sends. To find the exact names:

1. Start the service and run a sample on the XP-300.
2. The log first prints the raw messages from the machine. The test name is between `^^^^` and `^1`. For example, in

    ```
    R|3|^^^^LYM%^1| 30.5|%|...
    ```

    the name is `LYM%`.
3. The log then prints the results the driver understood:

    ```
    { 'LYMPH%': { id: '160', value: '30.5' } }
    ```

    A test that is missing here is not in `parameters.json`. A test with `id: undefined` is not in `mapping.json`.

**The ID (right side of `mapping.json`)** must be the ID of that test in the IBLIS system.

Restart the service after changing any configuration file.

### Firewall (ufw)

If ufw is enabled, allow the service port so the machine can connect:

```bash
sudo ufw allow 1234/tcp
```

Replace `1234` with your `port` if you changed it.

## Running with PM2 (recommended)

```bash
cd XP300_ASTM
npm install -g pm2
pm2 start index.js --name "xp300-driver"
pm2 save
pm2 startup
```

Then run the command that `pm2 startup` prints.

## Troubleshooting

- **`Accession number not found`:** the sample was run without an ID. Enter the IBLIS accession number as the sample ID on the machine.
- **No raw messages in the log:** check the XP-300 host IP and port, and that the port is allowed in the firewall.
- **`Error sending data`:** check `settings.json` and that the IBLIS server is reachable.
