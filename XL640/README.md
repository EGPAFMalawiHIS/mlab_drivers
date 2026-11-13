# XL640

Machine driver for interfacing the Erba XL-640 chemistry analyzer with IBLIS over the network. The analyzer sends results to this service using the ASTM protocol, and the service uploads them to IBLIS automatically.

For sites that export result files from the XL-640 instead, use [XL640-XLS](../XL640-XLS/README.md).

## Requirements

- Node.js **v18**
- npm
- Network connection between the computer running this service and the XL-640
- Access to the IBLIS system (API username and password, and the test IDs)

If you use nvm:

```bash
nvm install 18
nvm use 18
```

## Installation

1. Go into the XL640 folder and install the dependencies:

    ```bash
    cd XL640
    npm install
    ```

2. Create the configuration files from the examples:

    ```bash
    cp config/network.json.example config/network.json
    cp config/iblis.json.example config/iblis.json
    ```

3. Edit the configuration as described in [Configuration](#configuration).

4. Start the service from inside the XL640 folder:

    ```bash
    node app.js
    ```

    When the service starts, you will see:

    ```
    ✨️ server is listening on 127.0.0.1 port 9202
    ```

`config/network.json` and `config/iblis.json` are ignored by git, so passwords are never committed.

## Configuration

| File                  | Created from                  | Purpose                                                 |
| --------------------- | ----------------------------- | ------------------------------------------------------- |
| `config/network.json` | `config/network.json.example` | The address and port this service listens on           |
| `config/iblis.json`   | `config/iblis.json.example`   | IBLIS connection details                                |
| `helpers/mapping.js`  | (in the repository)           | Links each test name sent by the machine to its IBLIS ID |

### network.json

```json
{
  "host": "127.0.0.1",
  "port": 9202
}
```

| Key    | What to put                                                                                              |
| ------ | -------------------------------------------------------------------------------------------------------- |
| `host` | The IP address of the computer running this service. Use `0.0.0.0` to listen on all network cards.      |
| `port` | The port this service listens on. It must be the same as the host (LIS) port set on the XL-640.         |

### iblis.json

```json
{
  "baseURL": "http://127.0.0.1:8005/api/v1/interfacer",
  "username": "username",
  "password": "password",
  "timeout": 5000,
  "machineName": "Erba XL640"
}
```

| Key           | What to put                                                                                  |
| ------------- | -------------------------------------------------------------------------------------------- |
| `baseURL`     | The IBLIS interfacer API URL. Replace `127.0.0.1:8005` with the IBLIS server address and port.   |
| `username`    | The username of the IBLIS API user.                                                          |
| `password`    | The password of the IBLIS API user.                                                          |
| `timeout`     | How long to wait for IBLIS, in milliseconds.                                                 |
| `machineName` | The machine name sent to IBLIS. It must be the same as the instrument name in IBLIS.         |

On the XL-640, set the host (LIS) IP address to the IP address of the computer running this service and the port to `port`.

### Test mapping (helpers/mapping.js)

The IBLIS test IDs for this driver are kept in `helpers/mapping.js`:

```js
var mapping = {
  "ALB": 140,
  "ALT": 133,
  "UREA": 142,
  ...
};
```

**The name (left side)** must be exactly the same as the test name the machine sends, including capital letters. To find the exact names:

1. Start the service and run a sample on the XL-640.
2. Look at the service log. Each result is printed on one line:

    ```
    Test: UREA, Value: 4.5, Unit: mmol/L
    ```

3. The value after `Test:` is the test name from the machine. Copy it exactly as the name in `mapping.js`.

**The ID (right side)** must be the ID of that test in the IBLIS system. A test whose ID is missing is sent with `measure_id=undefined` and is rejected by IBLIS.

Restart the service after changing any configuration file.

### Firewall (ufw)

If ufw is enabled, allow the service port so the machine can connect:

```bash
sudo ufw allow 9202/tcp
```

Replace `9202` with your `port` if you changed it.

## Running with PM2 (recommended)

```bash
cd XL640
npm install -g pm2
pm2 start app.js --name "xl640-driver"
pm2 save
pm2 startup
```

Then run the command that `pm2 startup` prints.

## Troubleshooting

- **`Cannot find module './config/network.json'`:** copy the `.example` files as shown in [Installation](#installation), step 2.
- **`new connection established` never appears:** check the XL-640 host IP and port, and that the port is allowed in the firewall.
- **`Error fetching data`:** check `iblis.json`, the IDs in `helpers/mapping.js`, and that the IBLIS server is reachable.
