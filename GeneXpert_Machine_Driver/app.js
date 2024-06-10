/*Author: Hopson Gausi
 *Org: Elizabeth Glazer Pediatric Foundation
 *
 *Driver for Genexpert Machine, a machine that analyzes Viral load, TB, HPV, Covid
 *This driver is built around ASTM protocol, therefore relays on acknwoledgment upon every data byte being transfered.
 *Take note, the bytes being transfered has start point, the message body and finally the end point, therefore this driver checks for this to determine the actual message
 *
 */

let path = require("path");
const {
  getTargetSegment,
  getResults,
  getResultUrls,
} = require("./utils/functions");
const { sendData, buildUrl } = require("./utils/send");

let mapping = require(path.resolve(".", "config", "mapping.json"));
let settings = require(path.resolve(".", "config", "settings.json"));
let machineName = settings.machineName;
let port = settings.port;

let net = require("net");
const ACK_BUFFER = new Buffer([6]);
const ENQ = 5;
const STX = 2;
const LF = 10;
const CR = 13;
const EOT = 4;
var transmission = [];
var server = net.createServer();

function processData(rawData) {
  if (rawData.length == 0) return;
  let data = rawData
    .join("")
    .replace(/\x02/g, "<STX>")
    .replace(/\x03/g, "<ETX>")
    .replace(/\x04/g, "<EOT>")
    .replace(/\x17/g, "<ETB>")
    .replace(/\n/g, "<LF>")
    .replace(/\r/g, "<CR>")
    .replace(/<ETB>\w{2}<CR><LF>/g, "")
    .replace(/<STX>/g, "")
    .split(/<CR>/);
  let targetSegments = [...new Set(data.filter(getTargetSegment))];
  console.log(targetSegments);

  let results = getResults(targetSegments);
  console.log(results);

  let urls = getResultUrls(results, mapping, machineName, buildUrl);
  return urls;
}

function handleData(data, socket) {
  let received = data.toString("ascii");
  let code = received.charCodeAt(0);
  transmission.push(received);
  if (code == ENQ) {
    transmission = [];
    socket.write(ACK_BUFFER);
  } else if (code == EOT) {
    let urls = processData(transmission);
    console.log(urls);
    if (urls.length > 0) {
      sendData(urls);
    }
    socket.write(ACK_BUFFER);
    transmission = [];
  } else if (code == STX) {
    socket.write(ACK_BUFFER);
  }
}

server.on("connection", function (socket) {
  let address = server.address();
  console.log(
    `Server is Connected on address ${address.address}  port: ${address.port}`
  );
  socket.on("data", function (data) {
    handleData(data, socket);
  });
});

server.on("close", function () {
  console.log("Server closed!");
});

server.on("error", function (error) {
  console.log(`Error: ${error}`);
});

server.on("listening", function () {
  let address = server.address();
  console.log(
    `Server is listening on address ${address.address}  port: ${address.port}`
  );
});

server.maxConnections = 10;
server.listen(port);
