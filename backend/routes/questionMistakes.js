import * as controller from "../controllers/questionMistakesController.js";

export async function handle(req, res, requestUrl, pathname) {
  if (req.method === "GET" && pathname === "/api/question-mistakes") {
    await controller.list(req, res, requestUrl);
    return true;
  }

  if (req.method === "POST" && pathname === "/api/question-mistake-batch") {
    await controller.batchCreate(req, res);
    return true;
  }

  return false;
}
