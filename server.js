const http = require("http");
const os = require("os");

// Get environment variables
const greeting = process.env.GREETING || "Hello";
const port = process.env.PORT || 3000;

http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end(`${greeting}, World! From pod: ${os.hostname()}\n`);
  })
  .listen(port);

console.log(`Server running at http://0.0.0.0:${port}/`);
