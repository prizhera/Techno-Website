import * as service from "../services.js";
import { sendJson, notFound } from "../utils/http.js";

export async function getInsight(req, res, pathname) {
  const studentId = pathname.replace("/api/students/", "").replace("/insights", "");
  if (!studentId || studentId.includes("/")) {
    notFound(res);
    return;
  }

  const insight = await service.listStudentInsight(studentId);
  if (!insight) {
    notFound(res);
    return;
  }

  sendJson(res, 200, { data: insight });
}
