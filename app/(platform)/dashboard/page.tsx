import { AnalyticsCard } from "@/components/analytics/analytics-card";
import { MistakeFrequencyChart, TopicDifficultyChart } from "@/components/analytics/charts";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import api from "@/lib/api";
import {
  analyticsToMistakeFrequency,
  analyticsToTopicDifficulty,
  buildActivityFeed,
  buildClassOverviewFromApi,
  buildDashboardMetrics,
} from "@/lib/adapters";

export default async function DashboardPage() {
  let analyticsPayload: { data?: unknown } | null = null;
  let dashboardPayload: {
    data?: {
      metrics?: { supportStudents?: number; reviewedAssessments?: number; assessments?: number };
      classes?: { id: string; class_name: string; subject: string }[];
      students?: { class_id?: string }[];
      assessments?: { title?: string; status?: string; class_id?: string }[];
      student_mistakes?: { created_at?: string }[];
    };
  } | null = null;

  try {
    analyticsPayload = await api.get<{ data: unknown }>("/api/analytics");
  } catch {
    /* analytics remain empty */
  }

  try {
    dashboardPayload = await api.get<{
      data: {
        metrics?: { supportStudents?: number; reviewedAssessments?: number; assessments?: number };
        classes?: { id: string; class_name: string; subject: string }[];
        students?: { class_id?: string }[];
        assessments?: { title?: string; status?: string; class_id?: string }[];
        student_mistakes?: { created_at?: string }[];
      };
    }>("/api/dashboard");
  } catch {
    /* dashboard remains empty */
  }

  const analytics = (analyticsPayload?.data ?? null) as {
    labelCounts?: { label_name: string; count: number }[];
    questionMistakeCounts?: { topic: string; incorrect_count: number }[];
  } | null;

  const dashboard = dashboardPayload?.data ?? null;

  const metrics = buildDashboardMetrics(analytics, dashboard);
  const activityFeed = buildActivityFeed(dashboard);
  const topicDifficultyData = analyticsToTopicDifficulty(analytics?.questionMistakeCounts);
  const mistakeFrequencyData = analyticsToMistakeFrequency(analytics?.labelCounts ?? []);
  const classOverview = dashboard?.classes?.length
    ? buildClassOverviewFromApi(
        dashboard.classes.map((item) => ({
          ...item,
          students: dashboard.students?.filter((student) => student.class_id === item.id).length,
          assessments: dashboard.assessments?.filter((assessment) => assessment.class_id === item.id) as
            | { id: string; title: string; status?: string; created_at?: string }[]
            | undefined,
        })) as Parameters<typeof buildClassOverviewFromApi>[0]
      )
    : [];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AnalyticsCard
          title="Most Failed Topic"
          value={`${metrics.mostFailedTopic} (${metrics.failedTopicRate})`}
          note="Across recent assessments"
        />
        <AnalyticsCard
          title="Common Mistake Type"
          value={metrics.commonMistakeType}
          note="Most frequent across tagged mistakes"
        />
        <AnalyticsCard
          title="Assessments Reviewed"
          value={metrics.reviewedLabel}
          note="Insights generated for reviewed assessments"
        />
        <AnalyticsCard
          title="Students Requiring Support"
          value={`${metrics.supportStudents}`}
          note="Flagged for recurring errors"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Topic Difficulty Snapshot</CardTitle>
          </CardHeader>
          <CardContent>
            <TopicDifficultyChart data={topicDifficultyData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Mistake Frequency Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <MistakeFrequencyChart data={mistakeFrequencyData} />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activityFeed.map((activity: string, index: number) => (
              <div
                key={`${activity}-${index}`}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700"
              >
                {activity}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Class Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {classOverview.map((classItem: { className: string; status?: string; subject?: string; students?: number }) => (
              <div key={classItem.className} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-slate-800">{classItem.className}</h3>
                  <StatusBadge status={classItem.status ?? ""} />
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {classItem.subject ?? ""} • {classItem.students ?? "-"} students
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
