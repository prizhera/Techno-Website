import * as controller from "../controllers/studentMistakesController.js";

export async function handle(req, res, requestUrl, pathname) {
  if (req.method === "GET" && pathname === "/api/student-mistakes") {
    await controller.list(req, res, requestUrl);
    return true;
  }

  if (req.method === "POST" && pathname === "/api/student-mistakes") {
    await controller.create(req, res);
    return true;
  }

  return false;
}
