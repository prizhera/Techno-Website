import * as service from "../services.js";
import { sendJson, readBody, badRequest } from "../utils/http.js";

export async function list(req, res, requestUrl) {
  sendJson(res, 200, {
    data: await service.listTeacherNotes({
      assessment_id: requestUrl.searchParams.get("assessment_id") ?? undefined,
      question_id: requestUrl.searchParams.get("question_id") ?? undefined,
    }),
  });
}

export async function create(req, res) {
  const body = await readBody(req);
  if (!body.assessment_id || !body.note_text) {
    badRequest(res, "assessment_id and note_text are required");
    return;
  }

  sendJson(res, 201, { data: await service.createTeacherNote(body) });
}
