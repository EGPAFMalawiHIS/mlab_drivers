# BS120

Machine driver for interfacing the Mindray BS-120 chemistry analyzer with IBLIS. The BS-120 software exports result files to a folder; this driver watches that folder, reads each new file, and uploads the results to IBLIS automatically. It is normally run on the Windows computer connected to the BS-120.

For other ways to connect a BS-120, see [BS120-CSV](../BS120-CSV/README.md) (CSV exports) and [BS120-Network](../BS120-Network/README.md).

## Requirements

- Node.js **v18** ([nodejs.org](https://nodejs.org/) on Windows)
- npm
- The BS-120 software set to export results to a folder on this computer
- Access to the IBLIS system (API username and password, and the test IDs)

## Installation

Before you start, create the configuration files from the examples. Run these commands from inside the `BS120` folder:

```bash
cp config/settings.json.example config/settings.json
cp config/mapping.json.example config/mapping.json
```

`config/settings.json` and `config/mapping.json` are ignored by git, so each site keeps its own copies and passwords are never committed. Only the `.example` files are in the repository.

1. Go into the BS120 folder and install the dependencies:

    ```bash
    cd BS120
    npm install
    ```

2. Edit `config/settings.json`, `config/definitions.json` and `config/mapping.json` as described in [Configuration](#configuration).

3. Start the driver:

    ```bash
    node app.js
    ```

    When the driver starts, you will see:

    ```
    ✔ Server running on port 3018 in development mode
    ```

4. Export results from the BS-120 software into the folder set in `targetFolder`. The log shows `New file added ...` and the results sent.

## Upgrading a site that already runs this driver

Earlier versions committed `config/settings.json` and `config/mapping.json` to git. Pulling this version removes them from the repository, so **back them up before you pull** and put them back afterwards:

```bash
mkdir -p ~/BS120-config-backup
cp config/settings.json config/mapping.json ~/BS120-config-backup/
git pull
cp ~/BS120-config-backup/* config/
```

On Windows, copy the same files to another folder in File Explorer before pulling, and copy them back afterwards.

## Configuration

| File                      | Purpose                                                                  |
| ------------------------- | ------------------------------------------------------------------------ |
| `config/settings.json`    | IBLIS connection details and the folder to watch                        |
| `config/definitions.json` | Links each BS-120 test number (`ItemID`) to a test name                  |
| `config/mapping.json`     | Links each test name to its test ID in IBLIS                             |

### settings.json

```json
{
  "targetFolder": "results",
  "deleteWhenDone": true,
  "lisPath": "http://10.43.180.10:8001/api/update_result.php?specimen_id=#{SPECIMEN_ID}&measure_id=#{MEASURE_ID}&result=#{RESULT}&dec=0&machine_name=Mindray+BS120",
  "lisUser": "username",
  "lisPassword": "password",
  "instrumentJSONMapping": "mapping.json",
  "hostPort": "3018"
}
```

| Key              | What to put                                                                                                                                                                 |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `targetFolder`   | The folder the BS-120 exports results to. A relative path is inside the BS120 folder.                                                                                       |
| `deleteWhenDone` | `true` deletes each export file after its results are sent; `false` keeps it.                                                                                               |
| `lisPath`        | The IBLIS URL that results are sent to. Replace the address and port with the IBLIS server's. Keep `#{SPECIMEN_ID}`, `#{MEASURE_ID}` and `#{RESULT}` as they are. The `machine_name` value must be the instrument name in IBLIS. |
| `lisUser`        | The username of the IBLIS API user.                                                                                                                                         |
| `lisPassword`    | The password of the IBLIS API user.                                                                                                                                         |
| `hostPort`       | The port for the driver's small status server. If it is in use, the next free port is used.                                                                                 |

### definitions.json and mapping.json

The export file identifies each test by number (the `ItemID` column), so each result goes through two lookups:

1. `definitions.json` links the BS-120 test number to a test name, for example `"2": "ALT"`.
2. `mapping.json` links that test name to the test's ID in IBLIS, for example `"ALT": 189`.

**The numbers in `definitions.json`** must match the test numbers set up on the BS-120 (see the test list in the BS-120 software, or the `ItemID` column of an export file).

**The names in `mapping.json`** must be the names from `definitions.json` written in **capital letters** (the driver converts names to capitals before looking them up). For example, `"12": "Ca"` in `definitions.json` needs `"CA": 241` in `mapping.json`.

**The ID (right side of `mapping.json`)** must be the ID of that test in the IBLIS system.

The log prints each URL sent to IBLIS. If a URL has a test name (for example `measure_id=CK-MB`) instead of a number, that name is missing from `mapping.json`.

Restart the driver after changing any configuration file.

## Running as a Windows service

`win-service-setup.js` installs the driver as a Windows service. Install `node-windows` first, then pass the full path to `app.js`:

```bash
npm install node-windows
node win-service-setup.js C:\BS120\app.js
```

The service is created with the name "Erba XL 200 Server Service". Edit `name` and `description` in `win-service-setup.js` before running it if you want a BS-120 name.

## Troubleshooting

- **No `New file added` message:** check that the BS-120 exports into `targetFolder`, and that the folder exists.
- **`No result sent to BLIS!!`:** the file had no results the driver could match to a sample. Check that samples were run with the IBLIS accession number as the sample ID.
- **`measure_id` is a name instead of a number:** add that name (in capitals) to `mapping.json`.
