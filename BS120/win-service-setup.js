if(process.argv.length > 2) {

    var Service = require('node-windows').Service;

// Create a new service object
    var svc = new Service({
        name: 'Erba XL 200 Server Service',
        description: 'A server service for sending out test results for Erba XL 200 to connected clients through sockets.',
        script: process.argv[2]
    });

// Listen for the "install" event, which indicates the
// process is available as a service.
    svc.on('install', function () {
        svc.start();
    });

    svc.install();

}