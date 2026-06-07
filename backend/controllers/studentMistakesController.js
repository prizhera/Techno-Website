import * as service from "../services.js";
import { sendJson, readBody, badRequest } from "../utils/http.js";

export async function list(req, res, requestUrl) {
  sendJson(res, 200, {
    data: await service.listStudentMistakes(requestUrl.searchParams.get("student_id") ?? undefined),
  });
}

export async function create(req, res) {
  const body = await readBody(req);
  if (!body.student_id || !body.question_id || !body.mistake_label_id) {
    badRequest(res, "student_id, question_id, and mistake_label_id are required");
    return;
  }

  sendJson(res, 201, { data: await service.createStudentMistake(body) });
}
