import * as service from "../services.js";
import { sendJson } from "../utils/http.js";

export async function list(req, res, requestUrl) {
  const role = requestUrl.searchParams.get("role") ?? undefined;
  sendJson(res, 200, { data: await service.listUsers(role) });
}
