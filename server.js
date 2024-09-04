const http = require("http");
const os = require("os");

// Get environment variables
const greeting = process.env.GREETING || "Hello";
const port = process.env.PORT || 3000;

http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/plain" });

    let response = `${greeting} -- From pod: ${os.hostname()}\n\n`;

    // If secret Recipe, display it
    if (process.env.SECRET_RECIPE) {
      response += `The secret recipe is: ${process.env.SECRET_RECIPE}\n`;
    } else {
      response += "No secret recipe found\n";
    }

    res.end(response);
  })
  .listen(port);

console.log(`Server running at http://0.0.0.0:${port}/`);
