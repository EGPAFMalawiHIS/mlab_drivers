var Service = require('node-windows').Service;

var svc = new Service({
  name:'XL640',
  description: 'XL640 machine driver',
  script: 'C:\\XL640-XLS\\app.js',
});
svc.on('install',function(){
  svc.start();
});

svc.install();