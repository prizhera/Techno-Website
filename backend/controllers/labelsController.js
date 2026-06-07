import * as service from "../services.js";
import { sendJson, readBody, badRequest, notFound } from "../utils/http.js";

export async function list(req, res) {
  sendJson(res, 200, { data: await service.listMistakeLabels() });
}

export async function create(req, res) {
  const body = await readBody(req);
  if (!body.label_name) {
    badRequest(res, "label_name is required");
    return;
  }

  sendJson(res, 201, { data: await service.createMistakeLabel(body) });
}

export async function remove(req, res, pathname) {
  try {
    const id = pathname.split("/")[3];
    const record = await service.pickMistakeLabelById(id);
    if (!record) {
      notFound(res);
      return;
    }
    await service.deleteMistakeLabel(id);
    sendJson(res, 200, { success: true });
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Failed to delete label" });
  }
}
