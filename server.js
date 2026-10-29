// A tiny web server with NO dependencies (nothing to npm install).
const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");

const PORT = process.env.PORT || 3000;
const VERSION = process.env.APP_VERSION || "local"; // set in k8s.yaml
const startedAt = Date.now();
let served = 0; // requests answered by THIS pod

const page = fs.readFileSync(path.join(__dirname, "index.html"));

const server = http.createServer((req, res) => {
  // The page calls this every second to learn which pod answered.
  if (req.url === "/api/info") {
    served++;
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      Connection: "close", // new connection each time, so Kubernetes can pick a different pod
    });
    return res.end(
      JSON.stringify({
        pod: os.hostname(), // inside Kubernetes, the hostname IS the pod name
        version: VERSION,
        uptime: Math.round((Date.now() - startedAt) / 1000),
        served,
      })
    );
  }

  // Kubernetes calls this to ask "are you ready for traffic?"
  if (req.url === "/health") {
    res.writeHead(200);
    return res.end("ok");
  }

  // DEMO ONLY: kills this pod so you can watch Kubernetes bring it back.
  if (req.url === "/crash" && req.method === "POST") {
    res.writeHead(202);
    res.end("crashing");
    return setTimeout(() => process.exit(1), 300);
  }

  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(page);
});

server.listen(PORT, () => console.log(`listening on ${PORT} (pod ${os.hostname()})`));
