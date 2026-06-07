import * as service from "../services.js";
import { sendJson, readBody, badRequest, notFound } from "../utils/http.js";

export async function list(req, res, requestUrl) {
  sendJson(res, 200, {
    data: await service.listQuestions(requestUrl.searchParams.get("assessment_id") ?? undefined),
  });
}

export async function create(req, res) {
  const body = await readBody(req);
  if (!body.assessment_id || body.question_number == null || !body.question_text || !body.topic) {
    badRequest(res, "assessment_id, question_number, question_text, and topic are required");
    return;
  }

  sendJson(res, 201, { data: await service.createQuestion(body) });
}

export async function update(req, res, pathname) {
  try {
    const id = pathname.split("/")[3];
    const body = await readBody(req);
    const record = await service.updateQuestion(id, body);
    if (!record) {
      notFound(res);
      return;
    }
    sendJson(res, 200, { data: record });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Failed to update question" });
  }
}

export async function remove(req, res, pathname) {
  try {
    const id = pathname.split("/")[3];
    const record = await service.pickQuestionById(id);
    if (!record) {
      notFound(res);
      return;
    }
    await service.deleteQuestion(id);
    sendJson(res, 200, { success: true });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Failed to delete question" });
  }
}

export async function bulkCreate(req, res) {
  try {
    const body = await readBody(req);
    if (!body.assessment_id || !Array.isArray(body.questions) || !body.questions.length) {
      badRequest(res, "assessment_id and questions array are required");
      return;
    }

    const records = await service.createQuestionsBulk(body.assessment_id, body.questions);
    sendJson(res, 201, { data: records });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Failed to bulk create questions" });
  }
}
