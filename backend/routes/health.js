import { sendJson } from "../utils/http.js";

export async function handle(req, res, requestUrl, pathname) {
  if (req.method === "GET" && pathname === "/health") {
    sendJson(res, 200, { ok: true, service: "technoweb-backend" });
    return true;
  }

  return false;
}
