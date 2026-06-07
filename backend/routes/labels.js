import * as controller from "../controllers/labelsController.js";

export async function handle(req, res, requestUrl, pathname) {
  if (req.method === "GET" && pathname === "/api/mistake-labels") {
    await controller.list(req, res);
    return true;
  }

  if (req.method === "POST" && pathname === "/api/mistake-labels") {
    await controller.create(req, res);
    return true;
  }

  if (req.method === "DELETE" && pathname.startsWith("/api/mistake-labels/") && pathname.split("/").length === 4) {
    await controller.remove(req, res, pathname);
    return true;
  }

  return false;
}
