# GeneXpert_Machine_Driver

Machine driver for interfacing the Cepheid GeneXpert with IBLIS. The GeneXpert sends results (MTB/RIF, Viral Load, EID, HPV, SARS-CoV-2 and others) to this service over the network using the ASTM protocol, and the service uploads them to IBLIS automatically.

## Requirements

- Node.js **v18**
- npm
- Network connection between the computer running this service and the GeneXpert computer
- Access to the IBLIS system (API username and password, and the test IDs)

If you use nvm:

```bash
nvm install 18
nvm use 18
```

## Installation

Before you start, create the configuration files from the examples. Run these commands from inside the `GeneXpert_Machine_Driver` folder:

```bash
cp config/settings.json.example config/settings.json
cp config/mapping.json.example config/mapping.json
```

`config/settings.json` and `config/mapping.json` are ignored by git, so each site keeps its own copies and passwords are never committed. Only the `.example` files are in the repository.

1. Go into the driver folder and install the dependencies:

    ```bash
    cd GeneXpert_Machine_Driver
    npm install
    ```

2. Edit `config/settings.json` and `config/mapping.json` as described in [Configuration](#configuration).

3. Start the service from inside the folder:

    ```bash
    node app.js
    ```

    When the service starts, you will see:

    ```
    Server is listening on address ::  port: 3031
    ```

> `app.js` is the current driver. `xpert.js` is the older version, kept for reference; it ignores `settings.json` and always listens on port 3031.

## Upgrading a site that already runs this driver

Earlier versions committed `config/settings.json` and `config/mapping.json` to git. Pulling this version removes them from the repository, so **back them up before you pull** and put them back afterwards:

```bash
mkdir -p ~/GeneXpert_Machine_Driver-config-backup
cp config/settings.json config/mapping.json ~/GeneXpert_Machine_Driver-config-backup/
git pull
cp ~/GeneXpert_Machine_Driver-config-backup/* config/
```

On Windows, copy the same files to another folder in File Explorer before pulling, and copy them back afterwards.

## Configuration

| File                   | Purpose                                                               |
| ---------------------- | --------------------------------------------------------------------- |
| `config/settings.json` | IBLIS connection details and the port the service listens on         |
| `config/mapping.json`  | Links each GeneXpert result test code to its test ID in IBLIS        |

### settings.json

```json
{
  "lisPath": "http://127.0.0.1:8005/api/v1/interfacer?specimen_id=#{SPECIMEN_ID}&measure_id=#{MEASURE_ID}&result=#{RESULT}&dec=0&machine_name=GeneXpert",
  "lisUser": "username",
  "lisPassword": "password",
  "machineName": "GeneXpert",
  "port": 3031
}
```

| Key           | What to put                                                                                                                                                                  |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lisPath`     | The IBLIS URL that results are sent to. Replace `127.0.0.1:8005` with the IBLIS server address and port. Keep `#{SPECIMEN_ID}`, `#{MEASURE_ID}` and `#{RESULT}` as they are. The `machine_name` value must be the instrument name in IBLIS. |
| `lisUser`     | The username of the IBLIS API user.                                                                                                                                          |
| `lisPassword` | The password of the IBLIS API user.                                                                                                                                          |
| `machineName` | The machine name. Leave it empty (`""`) to use the name the GeneXpert sends in its messages.                                                                                 |
| `port`        | The port this service listens on. It must be the same as the port set on the GeneXpert (see [GeneXpert setup](#genexpert-setup)).                                            |

### mapping.json

Each entry has this form:

```json
{
  "<result test code exactly as sent by the GeneXpert>": "<test ID from IBLIS>"
}
```

For example:

```json
{
  "MTB": 202,
  "Rif Resistance": 203,
  "HPV 16": 335
}
```

**The name (left side)** must be exactly the same as the result test code the GeneXpert sends (with any digits removed), including capital letters and spaces. To find the exact codes:

1. Start the service and run a test on the GeneXpert.
2. Look at the service log. Each result is printed like this:

    ```
    {
      sampleId: '12345',
      hostTestCode: 'MTB-RIF',
      resultTestCode: 'MTB',
      resultValue: 'MTB DETECTED LOW',
      ...
    }
    ```

3. The value after `resultTestCode:` is the code to use as the name in `mapping.json`.
4. If the URL printed afterwards contains `measure_id=undefined`, that code is missing from `mapping.json` or spelled differently.

**The ID (right side)** must be the ID of that test in the IBLIS system.

Restart the service after changing `settings.json` or `mapping.json`.

### Firewall (ufw)

If ufw is enabled, allow the service port so the GeneXpert can connect:

```bash
sudo ufw allow 3031/tcp
```

Replace `3031` with your `port` if you changed it.

## GeneXpert setup

1. Leave the service running, go to the GeneXpert computer and log in as admin.
2. Go to **Setup > System Configuration**.
3. Open **Host Communication Settings** and set:
    - Tick **Enable Host Communication**.
    - Tick **Automatic Result Upload**.
    - Under communication settings:
        - **Protocol:** ASTM
        - **Run Host As:** Server
        - **Server IP Address:** the IP address of the computer running this service
        - **Port #:** the `port` in `settings.json` (default `3031`)
4. Save, then run a test and check the service log.

## Running with PM2 (recommended)

```bash
npm install -g pm2
pm2 start app.js --name "genexpert-driver"
pm2 save
pm2 startup
```

Then run the command that `pm2 startup` prints.

## Troubleshooting

- **`Server is Connected on address ...` never appears:** check the GeneXpert host settings (server IP and port), and that the port is allowed in the firewall.
- **`measure_id=undefined` in the log:** the result test code is missing from `mapping.json` or does not match exactly.
- **No result for a sample:** results without a sample ID, and log-value results (`LOG`), are skipped. Make sure the sample ID on the GeneXpert is the IBLIS accession number.
- **Results are not reaching IBLIS:** check `lisPath`, `lisUser`, `lisPassword` and the IDs in `mapping.json`.
