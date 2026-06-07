import { AnalyticsView } from "@/components/analytics/analytics-view";

import api from "@/lib/api";

export default async function AnalyticsPage() {
  let initialData: {
    labelCounts?: { label_name: string; count: number }[];
    questionMistakeCounts?: { topic: string; incorrect_count: number; question_number?: number }[];
  } | null = null;
  let classes: { id: string; class_name: string }[] = [];
  let assessments: { id: string; title: string; status?: string; class_id?: string }[] = [];

  try {
    const analyticsRes = await api.get<{
      data: {
        labelCounts?: { label_name: string; count: number }[];
        questionMistakeCounts?: { topic: string; incorrect_count: number; question_number?: number }[];
      };
    }>("/api/analytics");
    initialData = analyticsRes.data ?? null;
  } catch {
    /* initialData remains null */
  }

  try {
    const classesRes = await api.get("/api/classes");
    classes = Array.isArray(classesRes.data) ? classesRes.data : [];
  } catch {}

  try {
    const assessmentsRes = await api.get("/api/assessments");
    assessments = Array.isArray(assessmentsRes.data) ? assessmentsRes.data : [];
  } catch {}

  return (
    <AnalyticsView
      initialData={initialData}
      initialClasses={classes}
      initialAssessments={assessments}
    />
  );
}
