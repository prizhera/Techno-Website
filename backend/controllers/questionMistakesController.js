import * as service from "../services.js";
import { sendJson, readBody, badRequest } from "../utils/http.js";

export async function list(req, res, requestUrl) {
  sendJson(res, 200, {
    data: await service.listQuestionMistakes(requestUrl.searchParams.get("question_id") ?? undefined),
  });
}

export async function batchCreate(req, res) {
  const body = await readBody(req);
  if (!body.question_id || !body.mistake_label_id || !Array.isArray(body.student_ids) || !body.student_ids.length) {
    badRequest(res, "question_id, mistake_label_id, and a non-empty student_ids array are required");
    return;
  }

  sendJson(res, 201, { data: await service.createQuestionMistakeBatch(body) });
}
