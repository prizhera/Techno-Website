import * as controller from "../controllers/studentsController.js";

export async function handle(req, res, requestUrl, pathname) {
  if (req.method === "GET" && pathname === "/api/students") {
    await controller.list(req, res, requestUrl);
    return true;
  }

  if (req.method === "POST" && pathname === "/api/students") {
    await controller.create(req, res);
    return true;
  }

  if (req.method === "POST" && pathname === "/api/students/bulk") {
    await controller.bulkCreate(req, res);
    return true;
  }

  if (req.method === "PUT" && pathname.startsWith("/api/students/") && pathname.split("/").length === 4) {
    await controller.update(req, res, pathname);
    return true;
  }

  if (req.method === "DELETE" && pathname.startsWith("/api/students/") && pathname.split("/").length === 4) {
    await controller.remove(req, res, pathname);
    return true;
  }

  return false;
}
