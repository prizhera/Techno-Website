import * as service from "../services.js";
import { sendJson } from "../utils/http.js";

export async function handle(req, res, requestUrl, pathname) {
  if (req.method === "GET" && pathname === "/api/dashboard") {
    sendJson(res, 200, { data: await service.listDashboard() });
    return true;
  }

  if (req.method === "GET" && pathname === "/api/analytics") {
    sendJson(res, 200, { data: await service.listAnalytics() });
    return true;
  }

  return false;
}
