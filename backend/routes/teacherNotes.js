import * as controller from "../controllers/teacherNotesController.js";

export async function handle(req, res, requestUrl, pathname) {
  if (req.method === "GET" && pathname === "/api/teacher-notes") {
    await controller.list(req, res, requestUrl);
    return true;
  }

  if (req.method === "POST" && pathname === "/api/teacher-notes") {
    await controller.create(req, res);
    return true;
  }

  return false;
}
