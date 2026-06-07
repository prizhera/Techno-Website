import * as health from "./routes/health.js";
import * as dashboard from "./routes/dashboard.js";
import * as classes from "./routes/classes.js";
import * as students from "./routes/students.js";
import * as assessments from "./routes/assessments.js";
import * as questions from "./routes/questions.js";
import * as labels from "./routes/labels.js";
import * as studentMistakes from "./routes/studentMistakes.js";
import * as questionMistakes from "./routes/questionMistakes.js";
import * as teacherNotes from "./routes/teacherNotes.js";
import * as analytics from "./routes/analytics.js";
import * as studentsInsights from "./routes/studentsInsights.js";
import * as users from "./routes/users.js";
import * as auth from "./routes/auth.js";
import * as ai from "./routes/ai.js";
import { sendJson } from "./utils/http.js";

const ROUTERS = [
  health,
  dashboard,
  users,
  auth,
  classes,
  students,
  assessments,
  questions,
  labels,
  studentMistakes,
  questionMistakes,
  teacherNotes,
  analytics,
  studentsInsights,
  ai,
];

export async function handleRequest(req, res, requestUrl, pathname) {
  for (const r of ROUTERS) {
    const handled = await r.handle(req, res, requestUrl, pathname);
    if (handled) return;
  }

  sendJson(res, 404, { error: "Not found" });
}
