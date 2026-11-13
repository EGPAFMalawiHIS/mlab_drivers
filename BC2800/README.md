# BC2800

Machine driver for interfacing the Mindray BC-2800 hematology analyzer with IBLIS. The analyzer sends results over a serial cable, and the driver uploads them to IBLIS automatically.

For the Mindray BC-3000, use [bc3000](../bc3000/README.md). The two machines place results at different positions in their messages.

## Requirements

- Node.js **v18**
- npm
- A serial cable (or USB-to-serial adapter) between the BC-2800 and the computer running the driver
- Access to the IBLIS system (API username and password, and the test IDs)

If nvm is not installed yet:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
source ~/.bashrc
```

Then install and use Node.js 18:

```bash
nvm install 18
nvm use 18
```

## Installation

Before you start, create the configuration files from the examples. Run these commands from inside the `BC2800` folder:

```bash
cp config.json.example config.json
cp kx21n.json.example kx21n.json
```

`config.json` and `kx21n.json` are ignored by git, so each site keeps its own copies and passwords are never committed. Only the `.example` files are in the repository.

1. Go into the BC2800 folder and install the dependencies:

    ```bash
    cd BC2800
    npm install
    ```

2. Connect the BC-2800 to the computer with the serial cable. On an all-in-one PC, use the serial port on the side.

3. Allow your user to open the serial port, then log out and back in:

    ```bash
    sudo usermod -a -G dialout $USER
    ```

    For a quick test without logging out, you can instead run `sudo chmod 666 /dev/ttyUSB0`. That only lasts until the cable is unplugged or the computer restarts.

4. Edit `config.json` and `kx21n.json` as described in [Configuration](#configuration).

5. Start the driver from inside the BC2800 folder (the driver looks for its configuration in the current folder):

    ```bash
    node kx21n.js
    ```

    If the serial connection works, you will see:

    ```
    Port open
    ```

6. On the BC-2800, go to the transmission settings and enable **Auto Trans**.

7. Run a test sample and watch the log when the machine finishes.

## Upgrading a site that already runs this driver

Earlier versions committed `config.json` and `kx21n.json` to git. Pulling this version removes them from the repository, so **back them up before you pull** and put them back afterwards:

```bash
mkdir -p ~/BC2800-config-backup
cp config.json kx21n.json ~/BC2800-config-backup/
git pull
cp ~/BC2800-config-backup/* .
```

On Windows, copy the same files to another folder in File Explorer before pulling, and copy them back afterwards.

## Configuration

| File          | Purpose                                         |
| ------------- | ----------------------------------------------- |
| `config.json` | IBLIS connection details                        |
| `kx21n.json`  | Links each test name to its test ID in IBLIS    |
| `kx21n.js`    | The serial port (near the top of the file)      |

### Serial port

The serial port is set near the top of `kx21n.js`:

```js
var port = new SerialPort({
  path: "/dev/ttyUSB0",
  baudRate: 9600,
  ...
```

If your adapter appears under a different name, change `/dev/ttyUSB0`. To list serial ports:

```bash
ls /dev/ttyUSB* /dev/ttyS*
```

### config.json

```json
{
  "protocol": "http",
  "host": "192.168.100.200",
  "port": "8005",
  "username": "username",
  "password": "password",
  "path": "/api/v1/interfacer",
  "machineName": "mindray-BC2800"
}
```

| Key           | What to put                                                                             |
| ------------- | --------------------------------------------------------------------------------------- |
| `protocol`    | `http` or `https`, as used by the IBLIS server.                                         |
| `host`        | The IBLIS server address.                                                               |
| `port`        | The IBLIS server port.                                                                  |
| `username`    | The username of the IBLIS API user.                                                     |
| `password`    | The password of the IBLIS API user.                                                     |
| `path`        | The IBLIS interfacer API path.                                                          |
| `machineName` | The machine name sent to IBLIS. It must be the same as the instrument name in IBLIS.    |

### kx21n.json

Each entry has this form:

```json
{
  "<test name>": "<test ID from IBLIS>"
}
```

The BC-2800 sends results in fixed positions, so the test names come from the list in `kx21n.js`, not from the machine: `WBC`, `LYM#`, `MID#`, `GRAN#`, `LYM%`, `MID%`, `GRAN%`, `RBC`, `HGB`, `MCHC`, `MCV`, `MCH`, `RDW-CV`, `HCT`, `PLT`, `MPV`, `PDW`, `PCT`, `RDW-SD`.

**The name (left side)** must be exactly one of those names, with the same capital letters and symbols. The log shows each one after a sample finishes:

```
Sample ID: 1234567890
WBC: 6.5
LYM#: 2.1
```

A test that is not in `kx21n.json` is not sent to IBLIS. **The ID (right side)** must be the ID of that test in the IBLIS system.

Restart the driver after changing any configuration file.

## Running with PM2 (recommended)

```bash
cd BC2800
npm install -g pm2
pm2 start kx21n.js --name "bc2800-driver"
pm2 save
pm2 startup
```

Then run the command that `pm2 startup` prints.

## Troubleshooting

- **`Error opening port: ... Permission denied`:** your user cannot open the serial port. See [Installation](#installation), step 3.
- **`Error opening port: ... No such file or directory`:** the cable is not connected or the port has a different name. See [Serial port](#serial-port).
- **`Port open` appears but nothing happens after a test:** check that **Auto Trans** is enabled on the machine and that the cable is firmly connected.
- **`Sample ID:` is empty:** the sample was run without an ID. Enter the IBLIS accession number as the sample ID on the machine.
