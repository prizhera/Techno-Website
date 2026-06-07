import * as controller from "../controllers/questionsController.js";

export async function handle(req, res, requestUrl, pathname) {
  if (req.method === "GET" && pathname === "/api/questions") {
    await controller.list(req, res, requestUrl);
    return true;
  }

  if (req.method === "POST" && pathname === "/api/questions") {
    await controller.create(req, res);
    return true;
  }

  if (req.method === "PUT" && pathname.startsWith("/api/questions/") && pathname.split("/").length === 4) {
    await controller.update(req, res, pathname);
    return true;
  }

  if (req.method === "DELETE" && pathname.startsWith("/api/questions/") && pathname.split("/").length === 4) {
    await controller.remove(req, res, pathname);
    return true;
  }

  if (req.method === "POST" && pathname === "/api/questions/bulk") {
    await controller.bulkCreate(req, res);
    return true;
  }

  return false;
}
