import * as controller from "../controllers/authController.js";

export async function handle(req, res, requestUrl, pathname) {
  if (req.method === "POST" && pathname === "/api/auth/login") {
    await controller.login(req, res);
    return true;
  }

  return false;
}
