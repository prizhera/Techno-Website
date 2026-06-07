import * as controller from "../controllers/classesController.js";

export async function handle(req, res, requestUrl, pathname) {
  if (req.method === "GET" && pathname === "/api/classes") {
    await controller.list(req, res);
    return true;
  }

  if (req.method === "POST" && pathname === "/api/classes") {
    await controller.create(req, res);
    return true;
  }

  if (req.method === "GET" && pathname.startsWith("/api/classes/") && pathname.split("/").length === 4) {
    await controller.getById(req, res, pathname);
    return true;
  }

  if (req.method === "PUT" && pathname.startsWith("/api/classes/") && pathname.split("/").length === 4) {
    await controller.update(req, res, pathname);
    return true;
  }

  if (req.method === "DELETE" && pathname.startsWith("/api/classes/") && pathname.split("/").length === 4) {
    await controller.remove(req, res, pathname);
    return true;
  }

  return false;
}
