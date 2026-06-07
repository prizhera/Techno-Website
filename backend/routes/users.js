import * as controller from "../controllers/usersController.js";

export async function handle(req, res, requestUrl, pathname) {
  if (req.method === "GET" && pathname === "/api/users") {
    await controller.list(req, res, requestUrl);
    return true;
  }

  return false;
}
