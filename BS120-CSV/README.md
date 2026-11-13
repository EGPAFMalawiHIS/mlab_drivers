# BS120-CSV

Machine driver for interfacing the Mindray BS-120 chemistry analyzer with IBLIS using CSV exports. The BS-120 software exports results as CSV files to a folder; this driver watches that folder, reads each new CSV file, and uploads the results to IBLIS automatically. It is normally run on the Windows computer connected to the BS-120.

## Requirements

- Node.js **v18** ([nodejs.org](https://nodejs.org/) on Windows)
- npm
- The BS-120 software set to export results as CSV to a folder on this computer
- Access to the IBLIS system (API username and password, and the test IDs)

## Installation

Before you start, create the configuration files from the examples. Run these commands from inside the `BS120-CSV` folder:

```bash
cp config/settings.json.example config/settings.json
cp config/mapping.json.example config/mapping.json
```

`config/settings.json` and `config/mapping.json` are ignored by git, so each site keeps its own copies and passwords are never committed. Only the `.example` files are in the repository.

1. Go into the BS120-CSV folder and install the dependencies. `chokidar` is needed but not listed in `package.json`, so install it too:

    ```bash
    cd BS120-CSV
    npm install
    npm install chokidar
    ```

2. Edit `config/settings.json` and `config/mapping.json` as described in [Configuration](#configuration).

3. Start the driver from inside the BS120-CSV folder (the driver looks for `config` in the current folder):

    ```bash
    node app.js
    ```

    When the driver starts, you will see:

    ```
    ✨️BS120 Driver Running - Watching dir ./outputs for exported .csv file changes
    ```

4. Export results from the BS-120 software as CSV into the folder set in `outputDir`.

## Upgrading a site that already runs this driver

Earlier versions committed `config/settings.json` and `config/mapping.json` to git. Pulling this version removes them from the repository, so **back them up before you pull** and put them back afterwards:

```bash
mkdir -p ~/BS120-CSV-config-backup
cp config/settings.json config/mapping.json ~/BS120-CSV-config-backup/
git pull
cp ~/BS120-CSV-config-backup/* config/
```

On Windows, copy the same files to another folder in File Explorer before pulling, and copy them back afterwards.

## Configuration

| File                   | Purpose                                                    |
| ---------------------- | ---------------------------------------------------------- |
| `config/settings.json` | IBLIS connection details and the folder to watch          |
| `config/mapping.json`  | Links each test name in the CSV to its test ID in IBLIS    |

### settings.json

```json
{
  "lisPath": "http://127.0.0.1:8005/api/v1/interfacer?specimen_id=#{SPECIMEN_ID}&measure_id=#{MEASURE_ID}&result=#{RESULT}&dec=0",
  "lisUser": "iblis_username",
  "lisPassword": "iblis_password",
  "outputDir": "./outputs"
}
```

| Key           | What to put                                                                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lisPath`     | The IBLIS URL that results are sent to. Replace `127.0.0.1:8005` with the IBLIS server address and port. Keep `#{SPECIMEN_ID}`, `#{MEASURE_ID}` and `#{RESULT}` as they are. |
| `lisUser`     | The username of the IBLIS API user.                                                                                                               |
| `lisPassword` | The password of the IBLIS API user.                                                                                                               |
| `outputDir`   | The folder the BS-120 exports CSV files to.                                                                                                       |

The other keys in the file (`targetFolder`, `deleteWhenDone`, `instrumentJSONMapping`, `hostPort`) are not used by this driver.

### Expected CSV format

The driver reads tab-separated, UTF-16 CSV files (the BS-120 export format) and uses these columns:

| Column          | Used as                    |
| --------------- | -------------------------- |
| `Bar Code`      | The IBLIS accession number |
| `Test`          | The test name              |
| `Concentration` | The result                 |

Each CSV file is **deleted** after it has been processed.

### mapping.json

Each entry has this form:

```json
{
  "<test name exactly as in the Test column>": <test ID from IBLIS>
}
```

For example:

```json
{
  "ALT": 189,
  "UREA": 194,
  "CREA-J": 239
}
```

**The name (left side)** must be exactly the same as the value in the CSV's `Test` column, including capital letters and symbols. Open an export in a spreadsheet (before the driver deletes it, or with the driver stopped) to see the exact names.

**The ID (right side)** must be the ID of that test in the IBLIS system. The log prints each URL sent; `measure_id=undefined` means the test name is missing from `mapping.json` or spelled differently.

Restart the driver after changing `settings.json` or `mapping.json`.

## Running as a Windows service

`service.js` installs the driver as a Windows service. It expects the driver at `C:\BS120-CSV\app.js`; edit the `script` path in `service.js` if it is somewhere else. Then:

```bash
npm install node-windows
node service.js
```

## Troubleshooting

- **`Cannot find module 'chokidar'`:** run `npm install chokidar`.
- **No `File changed` message:** check that the BS-120 exports into `outputDir`.
- **`Error parsing CSV`:** the file is not in the BS-120 tab-separated UTF-16 format.
- **`measure_id=undefined` in the log:** the test name is missing from `mapping.json` or does not match exactly.
