import * as aiController from "../controllers/aiController.js";

export async function handle(req, res, requestUrl, pathname) {
  if (req.method === "POST" && pathname === "/api/ai/question-insight") {
    await aiController.generateQuestionInsight(req, res);
    return true;
  }

  if (req.method === "POST" && pathname === "/api/ai/student-feedback") {
    await aiController.generateStudentFeedback(req, res);
    return true;
  }

  if (req.method === "POST" && pathname === "/api/ai/extract-questions") {
    await aiController.extractExamQuestions(req, res);
    return true;
  }

  if (req.method === "POST" && pathname === "/api/ai/extract-pdf") {
    await aiController.extractPdfQuestions(req, res);
    return true;
  }

  if (req.method === "POST" && pathname === "/api/ai/chat") {
    await aiController.chat(req, res);
    return true;
  }

  if (req.method === "POST" && pathname === "/api/ai/generate-exam") {
    await aiController.generateExam(req, res);
    return true;
  }

  return false;
}