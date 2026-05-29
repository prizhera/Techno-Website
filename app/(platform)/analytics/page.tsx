import { AnalyticsCard } from "@/components/analytics/analytics-card";
import {
  MistakeFrequencyChart,
  PerformanceTrendChart,
  QuestionDifficultyChart,
  TopicDifficultyChart,
} from "@/components/analytics/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2">
        <AnalyticsCard
          title="Recurring Misconception"
          value="70% struggled with Chain Rule"
          note="Common gap: derivative of inner function"
        />
        <AnalyticsCard
          title="Most Common Error"
          value="Procedural Mistake"
          note="Observed in 41% of tagged wrong answers"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Topic Difficulty</CardTitle>
          </CardHeader>
          <CardContent>
            <TopicDifficultyChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Mistake Frequency</CardTitle>
          </CardHeader>
          <CardContent>
            <MistakeFrequencyChart />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Student Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceTrendChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Question Difficulty Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <QuestionDifficultyChart />
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Weakest Topics and Remediation Focus</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <p className="font-semibold text-slate-800">Chain Rule</p>
            <p className="mt-1 text-slate-600">Focus on nested function recognition and inner derivative rules.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <p className="font-semibold text-slate-800">Integration</p>
            <p className="mt-1 text-slate-600">Frequent procedural errors in substitution and simplification steps.</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <p className="font-semibold text-slate-800">Product Rule</p>
            <p className="mt-1 text-slate-600">Students skip the second term during expansion and reduction.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}