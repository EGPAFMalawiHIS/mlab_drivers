var Service = require("node-windows").Service;
var svc = new Service({
  name: "BS120 Server Service",
  description:
    "A server service for sending out test results for BS120 to connected clients through sockets.",
  script: "C:\\BS120-CSV\\app.js",
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on("install", function () {
  svc.start();
});
svc.install();
