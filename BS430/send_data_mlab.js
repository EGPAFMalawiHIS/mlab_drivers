var Client = require('node-rest-client').Client;
let count = 0;
let response = ''

UNAUTHORIZED_ACTION = 'Check if MLAB username and password correct';
ERROR_ACTION = 'Check if MLAB Ip Address and port are Correct';
URL_ERROR = 'Check if MLAB URL is correct';

function log({request=NaN, urls=[], response=NaN, count=0}) {
    if(request) {
        res = `Status Code: ${response.statusCode}  --> Message: ${response.statusMessage}`;
        request.on('error', function(err){
            console.log("=========No Results Sent to MLAB==========");
            console.error(`ERROR: ${err.code} --> Message: ${err.message} --> ACTION: ${ERROR_ACTION}`);  
        });
        if (urls.length == 0 && response.statusCode == 401){
            console.log("=========No Results Sent to MLAB==========");
            console.log(`${res}  --> ACTION: ${UNAUTHORIZED_ACTION}`);
        }else if (urls.length == 0 && response.statusCode == 404){
            console.log("=========No Results Sent to MLAB==========");
            console.log(`${res}  --> ACTION: ${URL_ERROR}`);
        }else if(urls.length == 0 && response.statusCode == 200){
            console.log(`========= ${count} Results sent to MLAB =================`);
            console.log(res);
        }else if (urls.length == 0 && !response.statusCode == 200 && !response.statusCode == 401){
            console.log("=========No Results Sent to MLAB==========");
            console.log(res);
        }
    }else {
        console.log("=========No Results Sent to MLAB==========");
    }
}
function round (num) {
  var m = Number((Math.abs(num) * 100).toPrecision(15));
  if(isNaN(m)){
      return num;
  }else{
      return Math.round(m) / 100 * Math.sign(num);
  }
}

function sendDataToMlab(urls, username, password){
  let args = {
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(username + ':' + password).toString('base64')
    }
  }
  let client = new Client();
  if (urls.length > 0) {
      let url = urls[0];
      var request = client.post(url, args, function(data, res){
        response = res;
          urls.shift();
          log({request, urls, response, count});
        
          if (urls.length > 0) {
            sendDataToMlab(urls, username, password)
          }
      })
      log({request, urls, response, count});
      count++;
  }
  else{
      log({request, urls, response, count});
  }
}
let urls = []
function buildUrlForMlab(lisBaseURL, sampleID='', measureID='', result='', username, password) {
    if(sampleID && measureID){
        let newURL = new URL(lisBaseURL);
        newURL.searchParams.append('accession_number', sampleID);
        newURL.searchParams.append('measure_id', measureID);
        newURL.searchParams.append('result', round(result));
        newURL.searchParams.append('machine_name', 'BS430');
        newURL.searchParams.append('dec',0);
        urls.push(newURL.href);   
    }
}

module.exports = {buildUrlForMlab, sendDataToMlab, urls}