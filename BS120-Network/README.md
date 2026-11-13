# BS120-Network

Network listener for the Mindray BS-120 chemistry analyzer.

> **Status: capture only.** This driver does **not** send results to IBLIS yet. It accepts the machine's connection, acknowledges each message, prints it, and saves the latest message to `data.txt`. Use it to capture real messages from a BS-120 while a full network driver is developed. To upload BS-120 results to IBLIS today, use [BS120](../BS120/README.md) or [BS120-CSV](../BS120-CSV/README.md).

## Requirements

- Node.js **v18**
- npm
- Network connection between the computer running this service and the BS-120

If you use nvm:

```bash
nvm install 18
nvm use 18
```

## Installation

Before you start, create the configuration files from the examples. Run these commands from inside the `BS120-Network` folder:

```bash
cp config/iblis.json.example config/iblis.json
cp config/network.json.example config/network.json
```

`config/iblis.json` and `config/network.json` are ignored by git, so each site keeps its own copies and passwords are never committed. Only the `.example` files are in the repository.

1. Go into the BS120-Network folder and install the dependencies:

    ```bash
    cd BS120-Network
    npm install
    ```

2. Edit `config/network.json` (see below).

3. Start the service from inside the folder:

    ```bash
    node app.js
    ```

    When the service starts, you will see:

    ```
    ✨️ server is listening on 192.168.100.200 port 5150
    ```

## Upgrading a site that already runs this driver

Earlier versions committed `config/iblis.json` and `config/network.json` to git. Pulling this version removes them from the repository, so **back them up before you pull** and put them back afterwards:

```bash
mkdir -p ~/BS120-Network-config-backup
cp config/iblis.json config/network.json ~/BS120-Network-config-backup/
git pull
cp ~/BS120-Network-config-backup/* config/
```

On Windows, copy the same files to another folder in File Explorer before pulling, and copy them back afterwards.

## Configuration

### network.json

```json
{
  "host": "192.168.100.200",
  "port": 5150
}
```

| Key    | What to put                                                                                            |
| ------ | ------------------------------------------------------------------------------------------------------ |
| `host` | The IP address of the computer running this service. Use `0.0.0.0` to listen on all network cards.    |
| `port` | The port this service listens on. It must be the same as the LIS/host port set on the BS-120.         |

On the BS-120, set the LIS/host IP address to `host` and the port to `port`.

`config/iblis.json` holds IBLIS connection details for when result upload is added. It is not used yet.

### Firewall (ufw)

If ufw is enabled, allow the service port so the machine can connect:

```bash
sudo ufw allow 5150/tcp
```

## Output

Each message received is printed in the log (`received data: ...`) and written to `data.txt` in the BS120-Network folder. Each new message replaces the previous one in `data.txt`, so copy it somewhere else if you need to keep it.

## Troubleshooting

- **`Error: listen EADDRNOTAVAIL`:** `host` is not an address of this computer.
- **`new connection established.` never appears:** check the BS-120 LIS/host IP and port, and that the port is allowed in the firewall.
