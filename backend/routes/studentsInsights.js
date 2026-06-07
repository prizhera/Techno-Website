import * as controller from "../controllers/studentsInsightsController.js";

export async function handle(req, res, requestUrl, pathname) {
  if (req.method === "GET" && pathname.startsWith("/api/students/") && pathname.endsWith("/insights")) {
    await controller.getInsight(req, res, pathname);
    return true;
  }

  return false;
}
