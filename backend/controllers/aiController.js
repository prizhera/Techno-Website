import * as aiService from "../services/aiService.js";
import { updateQuestionAiInsight } from "../services.js";
import { sendJson, readBody, badRequest } from "../utils/http.js";

export async function generateQuestionInsight(req, res) {
  const body = await readBody(req);
  if (!body.question_text) {
    badRequest(res, "question_text is required");
    return;
  }

  const insight = await aiService.generateQuestionInsight(
    body.question_text,
    body.topic,
    body.mistake_distribution || {},
    body.teacher_note
  );

  if (body.question_id && insight) {
    updateQuestionAiInsight(body.question_id, insight);
  }

  sendJson(res, 200, { insight });
}

export async function generateStudentFeedback(req, res) {
  const body = await readBody(req);
  if (!body.student_name) {
    badRequest(res, "student_name is required");
    return;
  }

  const feedback = await aiService.generateStudentFeedback(
    body.student_name,
    body.mistakes || [],
    body.weakest_topic
  );

  sendJson(res, 200, { feedback });
}

export async function extractExamQuestions(req, res) {
  const body = await readBody(req);
  if (!body.exam_text) {
    badRequest(res, "exam_text is required");
    return;
  }

  const questions = await aiService.extractQuestionsFromExam(body.exam_text);
  sendJson(res, 200, { questions });
}

export async function extractPdfQuestions(req, res) {
  const body = await readBody(req);
  if (!body.pdf_base64) {
    badRequest(res, "pdf_base64 is required");
    return;
  }

  try {
    const text = await aiService.extractTextFromPdfBase64(body.pdf_base64);
    if (!text.trim()) {
      sendJson(res, 200, { questions: [], note: "Could not extract text from this PDF." });
      return;
    }
    const questions = await aiService.extractQuestionsFromExam(text);
    sendJson(res, 200, { questions });
  } catch (error) {
    sendJson(res, 500, { error: "Failed to process PDF: " + (error.message || "Unknown error") });
  }
}

export async function chat(req, res) {
  const body = await readBody(req);
  if (!body.messages?.length) {
    badRequest(res, "messages array is required");
    return;
  }

  const response = await aiService.chatCompletion(body.messages, body.context || null);
  sendJson(res, 200, { response });
}

export async function generateExam(req, res) {
  const body = await readBody(req);
  if (!body.topics?.length || !body.num_questions) {
    badRequest(res, "topics array and num_questions are required");
    return;
  }

  const questions = await aiService.generateExam(body.topics, body.num_questions, body.class_context || null);
  if (!questions.length) {
    sendJson(res, 200, { questions: [], note: "AI returned no questions. The API key may be missing, misconfigured, or rate-limited." });
    return;
  }
  sendJson(res, 200, { questions });
}