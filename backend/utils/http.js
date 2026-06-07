import { URL } from "url";

const FRONTEND_URL = process.env.FRONTEND_URL ?? "http://localhost:3000";

export function getCorsHeaders() {
  return {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": FRONTEND_URL,
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, getCorsHeaders());
  res.end(JSON.stringify(payload));
}

export function notFound(res) {
  sendJson(res, 404, { error: "Not found" });
}

export function badRequest(res, message) {
  sendJson(res, 400, { error: message });
}

export function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";

    req.on("data", (chunk) => {
      raw += chunk;
    });

    req.on("end", () => {
      if (!raw) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });

    req.on("error", reject);
  });
}

export function route(method, pathname) {
  return `${method} ${pathname}`;
}

export function pathTail(pathname, prefix) {
  if (!pathname.startsWith(prefix)) {
    return null;
  }

  const rest = pathname.slice(prefix.length);
  if (!rest || rest.includes("/")) {
    return null;
  }

  return rest;
}

export function pathSegment(pathname, prefix) {
  if (!pathname.startsWith(prefix)) {
    return null;
  }

  const rest = pathname.slice(prefix.length);
  const slash = rest.indexOf("/");
  return slash === -1 ? (rest || null) : rest.slice(0, slash) || null;
}
