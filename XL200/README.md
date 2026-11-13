# XL200

Machine driver for interfacing the Erba XL-200 chemistry analyzer with IBLIS. The XL-200 software exports results as Excel files to a folder; this driver watches that folder, reads each new file, and uploads the results to IBLIS automatically.

## Requirements

- Node.js **v18** ([nodejs.org](https://nodejs.org/) on Windows)
- npm
- The XL-200 software set to export results as Excel files to a folder on this computer
- Access to the IBLIS system (API username and password, and the test IDs)

## Installation

Before you start, create the configuration files from the examples. Run these commands from inside the `XL200` folder:

```bash
cp config/settings.json.example config/settings.json
cp config/mapping.json.example config/mapping.json
```

`config/settings.json` and `config/mapping.json` are ignored by git, so each site keeps its own copies and passwords are never committed. Only the `.example` files are in the repository.

1. Go into the XL200 folder and install the dependencies:

    ```bash
    cd XL200
    npm install
    ```

2. Edit `config/settings.json` and `config/mapping.json` as described in [Configuration](#configuration).

3. Start the driver from inside the XL200 folder (the driver looks for `config` in the current folder):

    ```bash
    node app.js
    ```

    When the driver starts, you will see:

    ```
    Watching folder "./data" for any file changes...
    ```

4. Export results from the XL-200 software into the folder set in `outputDir`. The log shows `File found: ...` and the URLs sent.

## Upgrading a site that already runs this driver

Earlier versions committed `config/settings.json` and `config/mapping.json` to git. Pulling this version removes them from the repository, so **back them up before you pull** and put them back afterwards:

```bash
mkdir -p ~/XL200-config-backup
cp config/settings.json config/mapping.json ~/XL200-config-backup/
git pull
cp ~/XL200-config-backup/* config/
```

On Windows, copy the same files to another folder in File Explorer before pulling, and copy them back afterwards.

## Configuration

| File                   | Purpose                                                       |
| ---------------------- | ------------------------------------------------------------- |
| `config/settings.json` | IBLIS connection details and the folder to watch             |
| `config/mapping.json`  | Links each test name in the export to its test ID in IBLIS    |

`config/definitions.json` and `config/definitions_.json` are not used by this driver.

### settings.json

```json
{
  "lisPath": "http://192.168.3.2:8005/api/v1/interfacer?specimen_id=#{SPECIMEN_ID}&measure_id=#{MEASURE_ID}&result=#{RESULT}&dec=0",
  "lisUser": "username",
  "lisPassword": "password",
  "outputDir": "./data"
}
```

| Key           | What to put                                                                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lisPath`     | The IBLIS URL that results are sent to. Replace `192.168.3.2:8005` with the IBLIS server address and port. Keep `#{SPECIMEN_ID}`, `#{MEASURE_ID}` and `#{RESULT}` as they are. |
| `lisUser`     | The username of the IBLIS API user.                                                                                                               |
| `lisPassword` | The password of the IBLIS API user.                                                                                                               |
| `outputDir`   | The folder the XL-200 exports Excel files to. The folder must exist before the driver starts.                                                     |

The other keys in the file (`targetFolder`, `deleteWhenDone`, `instrumentJSONMapping`, `hostPort`) are not used by this driver.

### Expected Excel format

The driver reads the first sheet. It starts at the row containing `Sr #` and, for every row after it, uses:

| Column | Used as                    |
| ------ | -------------------------- |
| B      | The IBLIS accession number |
| D      | The test name              |
| E      | The result                 |

### mapping.json

Each entry has this form:

```json
{
  "<test name exactly as in column D>": <test ID from IBLIS>
}
```

**The name (left side)** must be exactly the same as the test name in column D of the export, including capital letters and symbols. Open an export file to see the exact names.

**The ID (right side)** must be the ID of that test in the IBLIS system. The log prints each URL sent; `measure_id=undefined` means the test name is missing from `mapping.json` or spelled differently.

Restart the driver after changing `settings.json` or `mapping.json`.

## Running with PM2

```bash
cd XL200
npm install -g pm2
pm2 start app.js --name "xl200-driver"
pm2 save
```

On Windows, `pm2 startup` is not supported; use a Windows service tool such as `node-windows` or the Task Scheduler to start the driver at boot.

## Troubleshooting

- **`Error: ENOENT ... watch './data'`:** the `outputDir` folder does not exist. Create it.
- **`Error reading Excel file`:** the file is not an Excel export, or it was still being written. Export it again.
- **`No result sent to BLIS!!`:** no rows were found after the `Sr #` header.
- **`measure_id=undefined` in the log:** the test name is missing from `mapping.json` or does not match exactly.
