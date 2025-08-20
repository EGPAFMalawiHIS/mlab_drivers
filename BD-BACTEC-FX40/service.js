const Service = require('node-windows').Service;
const path = require('path');

const svc = new Service({
  name: 'BD BACTEC FX40 Driver',
  description: 'BD BACTEC FX40 serial driver for sending results to LIS',
  script: path.join(__dirname, 'app.js'),
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
  ]
});

svc.on('install', function() {
  svc.start();
  console.log('Service installed successfully');
});

svc.on('start', function() {
  console.log('Service started');
});

svc.on('alreadyinstalled', function() {
  console.log('Service is already installed');
});

svc.on('error', function(error) {
  console.error('Service error:', error);
});

svc.install();
