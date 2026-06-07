import * as controller from "../controllers/analyticsController.js";

export async function handle(req, res, requestUrl, pathname) {
  if (req.method === "GET" && pathname.endsWith("/distribution") && pathname.startsWith("/api/analytics/assessment/")) {
    await controller.assessmentDistribution(req, res, pathname);
    return true;
  }

  if (req.method === "GET" && pathname.endsWith("/item-analysis") && pathname.startsWith("/api/analytics/assessment/")) {
    await controller.assessmentItemAnalysis(req, res, pathname);
    return true;
  }

  if (req.method === "GET" && pathname.startsWith("/api/analytics/assessment/")) {
    await controller.assessmentSummary(req, res, pathname);
    return true;
  }

  return false;
}
