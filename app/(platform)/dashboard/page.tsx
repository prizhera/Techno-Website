import { AnalyticsCard } from "@/components/analytics/analytics-card";
import { MistakeFrequencyChart, TopicDifficultyChart } from "@/components/analytics/charts";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { activityFeed, classOverview, metrics, recentAssessments } from "@/data/mock-data";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AnalyticsCard
          title="Most Failed Topic"
          value={`${metrics.mostFailedTopic} (${metrics.failedTopicRate})`}
          note="Across 3 recent Calculus 1 assessments"
        />
        <AnalyticsCard
          title="Common Mistake Type"
          value={metrics.commonMistakeType}
          note="Dominant in derivative and integration tasks"
        />
        <AnalyticsCard
          title="Assessments Reviewed"
          value="2 of 3 Completed"
          note="Insights generated for reviewed assessments"
        />
        <AnalyticsCard
          title="Students Requiring Support"
          value={`${metrics.supportStudents}`}
          note="11 students flagged for recurring procedural and conceptual errors."
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Topic Difficulty Snapshot</CardTitle>
          </CardHeader>
          <CardContent>
            <TopicDifficultyChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Mistake Frequency Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <MistakeFrequencyChart />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activityFeed.map((activity) => (
              <div key={activity} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
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
            {classOverview.map((classItem) => (
              <div key={classItem.className} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-slate-800">{classItem.className}</h3>
                  <StatusBadge status={classItem.status} />
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {classItem.subject} • {classItem.students} students
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}