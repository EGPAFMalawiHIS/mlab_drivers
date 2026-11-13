# XL640-XLS

Machine driver for interfacing the Erba XL-640 chemistry analyzer with IBLIS using file exports. The XL-640 software exports results as `.xls` files to a folder; this driver watches that folder, reads each new file, and uploads the results to IBLIS automatically. It is normally run on the Windows computer connected to the XL-640.

For a network connection to the XL-640 instead, use [XL640](../XL640/README.md).

## Requirements

- Node.js **v18** ([nodejs.org](https://nodejs.org/) on Windows)
- npm
- The XL-640 software set to export results as `.xls` files to a folder on this computer
- Access to the IBLIS system (API username and password, and the test IDs)

## Installation

Before you start, create the configuration files from the examples. Run these commands from inside the `XL640-XLS` folder:

```bash
cp config/settings.json.example config/settings.json
cp config/mapping.json.example config/mapping.json
```

`config/settings.json` and `config/mapping.json` are ignored by git, so each site keeps its own copies and passwords are never committed. Only the `.example` files are in the repository.

1. Go into the XL640-XLS folder and install the dependencies. `chokidar` is needed but not listed in `package.json`, so install it too:

    ```bash
    cd XL640-XLS
    npm install
    npm install chokidar
    ```

2. Edit `config/settings.json` and `config/mapping.json` as described in [Configuration](#configuration).

3. Start the driver from inside the XL640-XLS folder (the driver looks for `config` in the current folder):

    ```bash
    node app.js
    ```

    When the driver starts, you will see:

    ```
    ✨️BS120 Node Driver Running - Watching dir ./outputDir for .csv file changes
    ```

    (The start-up message mentions BS120 and `.csv`, but the driver reads `.xls` files.)

4. Export results from the XL-640 software into the folder set in `outputDir`.

## Upgrading a site that already runs this driver

Earlier versions committed `config/settings.json` and `config/mapping.json` to git. Pulling this version removes them from the repository, so **back them up before you pull** and put them back afterwards:

```bash
mkdir -p ~/XL640-XLS-config-backup
cp config/settings.json config/mapping.json ~/XL640-XLS-config-backup/
git pull
cp ~/XL640-XLS-config-backup/* config/
```

On Windows, copy the same files to another folder in File Explorer before pulling, and copy them back afterwards.

## Configuration

| File                   | Purpose                                                       |
| ---------------------- | ------------------------------------------------------------- |
| `config/settings.json` | IBLIS connection details and the folder to watch             |
| `config/mapping.json`  | Links each test name in the export to its test ID in IBLIS    |

### settings.json

```json
{
  "deleteWhenDone": false,
  "lisPath": "http://<server_ip>:8005/api/v1/interfacer?specimen_id=#{SPECIMEN_ID}&measure_id=#{MEASURE_ID}&result=#{RESULT}&dec=0&machine_name=XL640",
  "lisUser": "username",
  "lisPassword": "password",
  "outputDir": "./outputDir"
}
```

| Key              | What to put                                                                                                                                                                 |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `deleteWhenDone` | `true` deletes each export file after its results are sent; `false` keeps it.                                                                                               |
| `lisPath`        | The IBLIS URL that results are sent to. Replace `<server_ip>:8005` with the IBLIS server address and port. Keep `#{SPECIMEN_ID}`, `#{MEASURE_ID}` and `#{RESULT}` as they are. The `machine_name` value must be the instrument name in IBLIS. |
| `lisUser`        | The username of the IBLIS API user.                                                                                                                                         |
| `lisPassword`    | The password of the IBLIS API user.                                                                                                                                         |
| `outputDir`      | The folder the XL-640 exports `.xls` files to.                                                                                                                              |

### Expected file format

The XL-640 `.xls` export is a text file with one result per line, separated by tabs or spaces:

```
Sr #   Sample ID   [Patient name]   Test   Result   Unit   Flag   Date   Time
```

The `Sample ID` is used as the IBLIS accession number. Results of `NA` are skipped.

### mapping.json

Each entry has this form:

```json
{
  "<test name exactly as in the export>": <test ID from IBLIS>
}
```

For example:

```json
{
  "UREA": 142,
  "CRE": 143,
  "SGOT": 134
}
```

**The name (left side)** must be exactly the same as the test name in the export, including capital letters. To find the exact names:

1. Start the driver and export results from the XL-640.
2. Look at the driver log. Each record is printed like this:

    ```
    {
      sr_number: '1',
      accession_number: '123456',
      measure: 'UREA',
      result: '4.5',
      ...
    }
    ```

3. The value after `measure:` is the test name to use in `mapping.json`.

**The ID (right side)** must be the ID of that test in the IBLIS system. A test missing from `mapping.json` is sent with `measure_id=undefined` and rejected by IBLIS.

Restart the driver after changing `settings.json` or `mapping.json`.

## Running as a Windows service

`win-service.js` installs the driver as the **XL640** Windows service. It expects the driver at `C:\XL640-XLS\app.js`; edit the `script` path in `win-service.js` if it is somewhere else. Then:

```bash
npm install node-windows
node win-service.js
```

## Troubleshooting

- **`Cannot find module 'chokidar'`:** run `npm install chokidar`.
- **No `File changed` message:** check that the XL-640 exports into `outputDir`.
- **`0 records processed`:** the file's lines did not match the expected format. Check that it is the XL-640 results export.
- **`Something wrong happened while sending data to IBLIS!`:** check `lisPath`, `lisUser`, `lisPassword` and the IDs in `mapping.json`.
