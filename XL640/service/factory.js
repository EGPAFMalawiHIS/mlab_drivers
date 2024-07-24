const Net = require("net");
const Handler = require("../handlers/handler")
const ACK = "\x06";


const handler = new Handler()

class HttpFactory {
  constructor(host, port) {
    this.host = host;
    this.port = port;
    this.server = null;
  }

  createServer() {
    this.server = Net.createServer().listen(this.port, this.host);
    this.attachListeners(this.server);
  }

  attachListeners(server) {
    server.on("listening", () => {
      console.log(
        `✨️ server is listening on \x1b[33m${this.host}\x1b[0m port \x1b[35m${this.port}\x1b[0m`
      );
      const messages = [ '\u00021H|`^&||||||||||P|E 1394-97|20240723194727\rP|1|0|||VICTORIA MWAWA|||U||||||||0|0\rO|1|2400771062^01^1^16||^^^Na`^^^K`^^^Cl`^^^ALT`^^^AST`^^^CKN`^^^PHO`^^^BID`^^^UREA`^^^CRE`^^^TG`^^^CHOL`^^^UASR`^^^CA`^^^ALB`^^^MGXB`^^^FE|||||||||||SERUM\rR|1|^^^ALB|NA|g/dL||A|N|F||||20240723181951\rC|1|I|Instrument Flag A,A\rR|2|^^^ALT|NA|U/L||A|N|F||||20240723181746\rC|1|I|Instrument Flag A,A\rR|3|^^^AST|NA|U/L||A|N|F||||20240723181754\rC|1|I|Instrument Flag A,A\rR|4|^^^BID|NA|mg/dL||A|N|F||||20240723181830\rC|1|I|Instrument Flag A,A\rR|5|^^^CA|NA|mg/dL||A|N|F||||20240723181942\rC|1|I|Instrument Flag A,A\rR|6|^^^CHOL|124|mg/dL|^DEFAULT|A|N|F||||20240723181906\rC|1|I|Instrument Flag A\rR|7|^^^CKN|NA|U/L||A|N|F||||20240723181803\rC|1|I|Instrument Flag A,A\rR|8|^^^Cl|-2.80|mmol/L||<|N|F||||20240723180829\rC|1|I|Instrument Flag <\rR|9|^^^CRE|NA|mg/dL||A|N|F||||20240723181848\rC|1|I|Instrument Flag A,A\rR|10|^^^FE|NA|µg/dL||A|N|F||||20240723182018\rC|1|I|Instrument Flag A,HV!,A\rR|11|^^^K|2.07|mmol/L|^DEFAULT|L|N|F||||20240723180829\rC|1|I|Instrument F\u001777','']
      handler.process(messages)
    });

    server.on("connection", (socket) => {
      console.log("✨️ new connection established ✨️");
      socket.on("data", (data) => {
        const buffer = Buffer.from(data, "utf8");
        const messages = [ '\u00021H|`^&||||||||||P|E 1394-97|20240723194727\rP|1|0|||VICTORIA MWAWA|||U||||||||0|0\rO|1|2400771062^01^1^16||^^^Na`^^^K`^^^Cl`^^^ALT`^^^AST`^^^CKN`^^^PHO`^^^BID`^^^UREA`^^^CRE`^^^TG`^^^CHOL`^^^UASR`^^^CA`^^^ALB`^^^MGXB`^^^FE|||||||||||SERUM\rR|1|^^^ALB|NA|g/dL||A|N|F||||20240723181951\rC|1|I|Instrument Flag A,A\rR|2|^^^ALT|NA|U/L||A|N|F||||20240723181746\rC|1|I|Instrument Flag A,A\rR|3|^^^AST|NA|U/L||A|N|F||||20240723181754\rC|1|I|Instrument Flag A,A\rR|4|^^^BID|NA|mg/dL||A|N|F||||20240723181830\rC|1|I|Instrument Flag A,A\rR|5|^^^CA|NA|mg/dL||A|N|F||||20240723181942\rC|1|I|Instrument Flag A,A\rR|6|^^^CHOL|124|mg/dL|^DEFAULT|A|N|F||||20240723181906\rC|1|I|Instrument Flag A\rR|7|^^^CKN|NA|U/L||A|N|F||||20240723181803\rC|1|I|Instrument Flag A,A\rR|8|^^^Cl|-2.80|mmol/L||<|N|F||||20240723180829\rC|1|I|Instrument Flag <\rR|9|^^^CRE|NA|mg/dL||A|N|F||||20240723181848\rC|1|I|Instrument Flag A,A\rR|10|^^^FE|NA|µg/dL||A|N|F||||20240723182018\rC|1|I|Instrument Flag A,HV!,A\rR|11|^^^K|2.07|mmol/L|^DEFAULT|L|N|F||||20240723180829\rC|1|I|Instrument F\u001777',
          '' ]
        // const messages = buffer
        //   .toString("utf8")
        //   .split("\r\n")
        //   .map((message) => message.trim());
        handler.process(messages)
        socket.write(ACK);
      });

      socket.on("end", () => {
        console.log("connection ended.");
      });

      socket.on("error", (err) => {
        throw new Error(`error in connection: ${err.message}`);
      });
    });

    server.on("close", () => {
      console.log("server is closed.");
    });

    server.on("error", (err) => {
      throw new Error(`server error: ${err.message}`);
    });
  }

  closeServer() {
    this.server.close();
  }
}

module.exports = HttpFactory;
