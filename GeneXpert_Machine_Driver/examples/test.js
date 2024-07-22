let path = require("path");
const { getTargetSegment, getResults, getResultUrls } = require("../utils/functions");
const { MTBRIF, MTBXDR, VL, EID } = require("./sample_results");
const { sendData, buildUrl } = require("../utils/send");
let mapping = require(path.resolve("./", "config", "mapping.json"));
let settings = require(path.resolve("./", "config", "settings.json"));

let machineName = settings.machineName;

// MTB XDR results
let targetSegments = [...new Set(MTBRIF.filter(getTargetSegment))];
let results = getResults(targetSegments);

// MTB RIF results
targetSegments = [...new Set(MTBXDR.filter(getTargetSegment))];
let results1 = getResults(targetSegments);

// VL results
targetSegments = [...new Set(VL.filter(getTargetSegment))];
let results2 = getResults(targetSegments);

// EID results
targetSegments = [...new Set(EID.filter(getTargetSegment))];
let results3 = getResults(targetSegments);

let combinedResults = [...new Set([...results, ...results1, ...results2, ...results3])];
console.log(combinedResults);

// build urls
let urls = getResultUrls(combinedResults, mapping, machineName, buildUrl);
console.log(urls);
sendData(urls)
