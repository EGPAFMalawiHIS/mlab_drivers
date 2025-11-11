var Service = require("node-windows").Service;
var svc = new Service({
  name: "Horiba Pentra C400 Server Service",
  description:
    "A server service for sending out test results for Horiba Pentra C400 to connected clients through sockets.",
  script: "C:\\HORIBA-PENTRA-C400\\app.js",
});

svc.on("install", function () {
  svc.start();
});
svc.install();