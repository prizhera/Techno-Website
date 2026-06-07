import * as controller from "../controllers/assessmentsController.js";

export async function handle(req, res, requestUrl, pathname) {
  if (req.method === "GET" && pathname === "/api/assessments") {
    await controller.list(req, res, requestUrl);
    return true;
  }

  if (req.method === "POST" && pathname === "/api/assessments") {
    await controller.create(req, res);
    return true;
  }

  if (req.method === "PUT" && pathname.startsWith("/api/assessments/") && pathname.split("/").length === 4) {
    await controller.update(req, res, pathname);
    return true;
  }

  if (req.method === "DELETE" && pathname.startsWith("/api/assessments/") && pathname.split("/").length === 4) {
    await controller.remove(req, res, pathname);
    return true;
  }

  return false;
}
