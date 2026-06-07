import * as service from "../services.js";
import { sendJson, pathTail, pathSegment, notFound } from "../utils/http.js";

export async function assessmentSummary(req, res, pathname) {
  const assessmentId = pathTail(pathname, "/api/analytics/assessment/");
  if (!assessmentId) {
    notFound(res);
    return;
  }

  const summary = await service.listAssessmentQuestionSummary(assessmentId);
  if (!summary) {
    notFound(res);
    return;
  }

  sendJson(res, 200, { data: summary });
}

export async function assessmentItemAnalysis(req, res, pathname) {
  const assessmentId = pathSegment(pathname, "/api/analytics/assessment/");
  if (!assessmentId) {
    notFound(res);
    return;
  }

  const analysis = await service.listAssessmentItemAnalysis(assessmentId);
  if (!analysis) {
    notFound(res);
    return;
  }

  sendJson(res, 200, { data: analysis });
}

export async function assessmentDistribution(req, res, pathname) {
  const assessmentId = pathSegment(pathname, "/api/analytics/assessment/");
  if (!assessmentId) {
    notFound(res);
    return;
  }

  const dist = await service.listAssessmentDistribution(assessmentId);
  if (!dist) {
    notFound(res);
    return;
  }

  sendJson(res, 200, { data: dist });
}
