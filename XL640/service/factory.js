const Net = require("net");
const ACK = "\x06";

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
    });

    server.on("connection", (socket) => {
      console.log("✨️ new connection established ✨️");
      socket.on("data", (data) => {
        const buffer = Buffer.from(data, "utf8");
        const messages = buffer
          .toString("utf8")
          .split("\r\n")
          .map((message) => message.trim());
        this.process(messages);
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
