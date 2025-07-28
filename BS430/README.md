# BS430
Machine driver for interfacing Mindray BS430 lab machine with IBLIS for automatic results upload to IBLIS
## Install and run(requires node v8.4.0)
 `npm install` \
 `node app.js`

## Configuration
1. Rename the `config.example.json` file to `config.json`.
2. Update the `config.json` file with the appropriate settings for your environment.

## Usage
1. Ensure the Mindray BS430/BS230 machine is properly connected via Ethernet.
Machine driver for interfacing Mindray BS430 lab machine with IBLIS for automatic results upload to IBLIS

## Install and run (requires Node.js v8.4.0)
```bash
npm install
node app.js
```

## Setting up with PM2
PM2 is a process manager for Node.js applications that allows you to keep your app running in the background.

1. Install PM2 globally:
    ```bash
    npm install -g pm2
    ```
2. Start the application using PM2:
    ```bash
    pm2 start app.js --name "bs430-driver"
    ```
3. To ensure the application restarts on system reboot, save the PM2 process list and configure startup:
    ```bash
    pm2 save
    pm2 startup
    ```

## Configuration
1. Rename the `config.example.json` file to `config.json`.
2. Update the `config.json` file with the appropriate settings for your environment.

## Usage
1. Ensure the Mindray BS430/BS230 machine is properly connected via Ethernet.
2. Start the application using `node app.js` or PM2 as described above.
3. Monitor the logs for successful data uploads to IBLIS.

## Troubleshooting
- If the application fails to start, verify that all dependencies are installed using `npm install`.
- Check the `config.json` file for any misconfigurations.
- Ensure the Mindray BS430 machine is powered on and connected.
- For PM2-specific issues, refer to the [PM2 documentation](https://pm2.keymetrics.io/).

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.
3. Monitor the logs for successful data uploads to IBLIS.

## Troubleshooting
- If the application fails to start, verify that all dependencies are installed using `npm install`.
- Check the `config.json` file for any misconfigurations.
- Ensure the Mindray BS430 machine is powered on and connected.

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.