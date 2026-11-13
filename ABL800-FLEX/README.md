# ABL800-FLEX

Machine driver for interfacing the Radiometer ABL800 FLEX blood gas analyzer with IBLIS. The analyzer exports each patient's results as text files (`PatInfo.txt` and `PatRes.txt`) to a folder; this driver watches that folder, reads the files, and uploads the results to IBLIS automatically.

## Requirements

- Node.js **v18** ([nodejs.org](https://nodejs.org/) on Windows)
- npm
- The ABL800 FLEX set to export patient results to a folder on this computer
- Access to the IBLIS system (API username and password, and the test IDs)

## Installation

1. Go into the ABL800-FLEX folder and install the dependencies. `chokidar` is needed but not listed in `package.json`, so install it too:

    ```bash
    cd ABL800-FLEX
    npm install
    npm install chokidar
    ```

2. Create the configuration files from the examples:

    ```bash
    cp config/settings.json.example config/settings.json
    cp config/mapping.json.example config/mapping.json
    ```

3. Edit `config/settings.json` and `config/mapping.json` as described in [Configuration](#configuration).

4. Start the driver from inside the ABL800-FLEX folder (the driver looks for `config` in the current folder):

    ```bash
    node app.js
    ```

    When the driver starts, you will see:

    ```
    ✨️ABL 800 FLEX Driver Running - Watching dir ./outputs for .txt file changes
    ```

`config/settings.json` and `config/mapping.json` are ignored by git, so each site keeps its own copies and passwords are never committed.

## Upgrading a site that already runs this driver

Earlier versions committed `config/mapping.json` to git. Pulling this version removes them from the repository, so **back them up before you pull** and put them back afterwards:

```bash
mkdir -p ~/ABL800-FLEX-config-backup
cp config/settings.json config/mapping.json ~/ABL800-FLEX-config-backup/
git pull
cp ~/ABL800-FLEX-config-backup/* config/
```

On Windows, copy the same files to another folder in File Explorer before pulling, and copy them back afterwards.

## Configuration

| File                   | Created from                   | Purpose                                                 |
| ---------------------- | ------------------------------ | ------------------------------------------------------- |
| `config/settings.json` | `config/settings.json.example` | IBLIS connection details and the folder to watch       |
| `config/mapping.json`  | `config/mapping.json.example`  | Links each test name to its test ID in IBLIS            |

### settings.json

```json
{
  "lisPath": "http://[IBLIS_IP_ADDRESS:PORT]/api/v1/interfacer?specimen_id=#{SPECIMEN_ID}&measure_id=#{MEASURE_ID}&result=#{RESULT}&dec=0",
  "lisUser": "[IBLIS_ADMIN_USERNAME]",
  "lisPassword": "[IBLIS_ADMIN_PASSWORD]",
  "outputDir": "./outputs"
}
```

| Key           | What to put                                                                                                                                        |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lisPath`     | The IBLIS URL that results are sent to. Replace `[IBLIS_IP_ADDRESS:PORT]` with the IBLIS server address and port. Keep `#{SPECIMEN_ID}`, `#{MEASURE_ID}` and `#{RESULT}` as they are. |
| `lisUser`     | The username of the IBLIS API user.                                                                                                                |
| `lisPassword` | The password of the IBLIS API user.                                                                                                                |
| `outputDir`   | The folder the ABL800 FLEX exports `PatInfo.txt` and `PatRes.txt` to.                                                                              |

The other keys in the example (`targetFolder`, `deleteWhenDone`, `instrumentJSONMapping`, `hostPort`) are not used by this driver.

### How results are read

- `PatInfo.txt`: the `Patient ID` value is used as the IBLIS accession number. Enter the accession number as the Patient ID on the analyzer.
- `PatRes.txt`: each line gives a test name, its value and its unit.

`PatInfo.txt` is deleted after its results are sent.

### mapping.json

Each entry has this form:

```json
{
  "<test name exactly as printed in the log>": <test ID from IBLIS>
}
```

**The name (left side)** must be exactly the same as the test name the driver reads from `PatRes.txt`. Characters that cannot be read, such as the subscripts in pCO₂, are replaced with `?`, so `pCO₂` becomes something like `?CO?`. To find the exact names:

1. Start the driver and export a patient result from the analyzer.
2. Look at the driver log. The results are printed like this:

    ```
    {
      accession_number: '123456',
      results: [ { test: 'pH', value: '7.40', unit: '' }, { test: '?CO?', value: '40', unit: 'mmHg' } ]
    }
    ```

3. The value after `test:` is the name to use in `mapping.json`, character for character.

**The ID (right side)** must be the ID of that test in the IBLIS system. The log prints each URL sent; `measure_id=undefined` means the name is missing from `mapping.json`.

Restart the driver after changing `settings.json` or `mapping.json`.

## Running as a Windows service

`service.js` installs the driver as a Windows service. It was copied from the BS120-CSV driver, so before using it edit `service.js`:

- set `script` to the full path of this driver's `app.js` (for example `C:\ABL800-FLEX\app.js`);
- change `name` and `description` from "BS120" to "ABL800 FLEX".

Then:

```bash
npm install node-windows
node service.js
```

## Troubleshooting

- **`Cannot find module 'chokidar'`:** run `npm install chokidar`.
- **`Patient ID not found.`:** the result was exported without a Patient ID. Enter the IBLIS accession number as the Patient ID.
- **`Something wrong happened while sending data to IBLIS!`:** check `lisPath`, `lisUser`, `lisPassword` and the IDs in `mapping.json`.
