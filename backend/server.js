import "dotenv/config";

import http from "http";
import { URL } from "url";
import { getCorsHeaders } from "./utils/http.js";
import { handleRequest } from "./router.js";

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
});

const PORT = Number(process.env.PORT ?? 4000);

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
  const pathname = requestUrl.pathname;

  if (req.method === "OPTIONS") {
    res.writeHead(204, getCorsHeaders());
    res.end();
    return;
  }

  try {
    await handleRequest(req, res, requestUrl, pathname);
  } catch (error) {
    console.error("Unhandled error:", error);
    res.writeHead(500, getCorsHeaders());
    res.end(JSON.stringify({ error: error.message || "Internal server error" }));
  }
});

server.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
