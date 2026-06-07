"use client";

import { useState, useEffect } from "react";
import { AnalyticsCard } from "./analytics-card";
import {
  MistakeFrequencyChart,
  QuestionDifficultyChart,
  TopicDifficultyChart,
} from "./charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import api from "@/lib/api";
import { ItemAnalysis } from "./item-analysis";
import { PerformanceDistributionChart } from "./performance-distribution";
import {
  analyticsToMistakeFrequency,
  analyticsToQuestionDifficulty,
  analyticsToTopicDifficulty,
} from "@/lib/adapters";

type Assessment = { id: string; title: string; status?: string; class_id?: string };
type ClassInfo = { id: string; class_name: string };

type AnalyticsData = {
  labelCounts?: { label_name: string; count: number }[];
  questionMistakeCounts?: { topic: string; incorrect_count: number; question_number?: number }[];
};

type AnalyticsViewProps = {
  initialData: AnalyticsData | null;
  initialClasses: ClassInfo[];
  initialAssessments: Assessment[];
};

export function AnalyticsView({ initialData, initialClasses, initialAssessments }: AnalyticsViewProps) {
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedAssessmentId, setSelectedAssessmentId] = useState("");
  const [assessmentData, setAssessmentData] = useState<AnalyticsData | null>(null);
  const [allData, setAllData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [itemAnalysis, setItemAnalysis] = useState<{ items: unknown[]; total_students: number } | null>(null);
  const [itemAnalysisLoading, setItemAnalysisLoading] = useState(false);


  const filteredAssessments = selectedClassId
    ? initialAssessments.filter((a) => a.class_id === selectedClassId)
    : initialAssessments;

  const effectiveData = selectedAssessmentId ? (assessmentData ?? initialData) : (allData ?? initialData);

  const labelCounts = effectiveData?.labelCounts ?? [];
  const questionMistakeCounts = effectiveData?.questionMistakeCounts ?? [];

  const topicDifficultyData = analyticsToTopicDifficulty(questionMistakeCounts);
  const mistakeFrequencyData = analyticsToMistakeFrequency(labelCounts);
  const questionDifficultyData = analyticsToQuestionDifficulty(questionMistakeCounts);

  const sortedTopics = [...questionMistakeCounts].sort(
    (a, b) => b.incorrect_count - a.incorrect_count
  );
  const topTopic = sortedTopics[0]?.topic ?? "—";

  const sortedLabels = [...labelCounts].sort((a, b) => b.count - a.count);
  const topLabel = sortedLabels[0]?.label_name ?? "—";

  useEffect(() => {
    setLoading(true);

    if (selectedAssessmentId) {
      api
        .get<{
          data: {
            questions: {
              id: string;
              question_number: number;
              question_text: string;
              topic: string;
              incorrect_count: number;
              mistake_distribution?: { label_name: string; count: number }[];
            }[];
          };
        }>(`/api/analytics/assessment/${selectedAssessmentId}`)
        .then((res) => {
          const questions = res.data?.questions ?? [];
          const labelTotals = new Map<string, number>();
          for (const q of questions) {
            for (const entry of q.mistake_distribution ?? []) {
              labelTotals.set(entry.label_name, (labelTotals.get(entry.label_name) ?? 0) + entry.count);
            }
          }
          setAssessmentData({
            questionMistakeCounts: questions.map((q) => ({
              topic: q.topic,
              incorrect_count: q.incorrect_count,
              question_number: q.question_number,
            })),
            labelCounts: [...labelTotals.entries()].map(([label_name, count]) => ({ label_name, count })),
          });
          setAllData(null);
        })
        .catch(() => {
          setAssessmentData(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      api
        .get<{
          data: {
            labelCounts?: { label_name: string; count: number }[];
            questionMistakeCounts?: { topic: string; incorrect_count: number; question_number?: number }[];
          };
        }>("/api/analytics")
        .then((res) => {
          setAllData(res.data ?? null);
          setAssessmentData(null);
        })
        .catch(() => {
          setAllData(null);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [selectedAssessmentId]);

  useEffect(() => {
    if (!selectedAssessmentId) {
      setItemAnalysis(null);
      return;
    }
    setItemAnalysisLoading(true);

    api
      .get<{ data: { items: unknown[]; total_students: number } }>(
        `/api/analytics/assessment/${selectedAssessmentId}/item-analysis`
      )
      .then((res) => setItemAnalysis(res.data ?? null))
      .catch(() => setItemAnalysis(null))
      .finally(() => setItemAnalysisLoading(false));
  }, [selectedAssessmentId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <div className="w-64">
          <Select
            value={selectedClassId}
            onChange={(e) => {
              setSelectedClassId(e.target.value);
              setSelectedAssessmentId("");
            }}
          >
            <option value="">All Classes</option>
            {initialClasses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.class_name}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-64">
          <Select
            value={selectedAssessmentId}
            onChange={(e) => setSelectedAssessmentId(e.target.value)}
            disabled={loading}
          >
            <option value="">All Assessments</option>
            {filteredAssessments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </Select>
        </div>
        {loading && (
          <p className="self-center text-sm text-slate-500">Loading...</p>
        )}
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <AnalyticsCard
          title="Recurring Misconception"
          value={`Students struggled most with ${topTopic}`}
          note="Most challenging topic across tagged responses"
        />
        <AnalyticsCard
          title="Most Common Error"
          value={topLabel}
          note="Observed in tagged wrong answers across assessments"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Topic Difficulty</CardTitle>
          </CardHeader>
          <CardContent>
            <TopicDifficultyChart data={topicDifficultyData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Mistake Frequency</CardTitle>
          </CardHeader>
          <CardContent>
            <MistakeFrequencyChart data={mistakeFrequencyData} />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Student Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-72 items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-500">
              Tag student mistakes to see performance trends over time.
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Question Difficulty Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <QuestionDifficultyChart data={questionDifficultyData} />
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Weakest Topics and Remediation Focus</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {topicDifficultyData.slice(0, 3).map((item) => (
            <div
              key={item.topic}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm"
            >
              <p className="font-semibold text-slate-800">{item.topic}</p>
              <p className="mt-1 text-slate-600">
                {item.difficulty} student{item.difficulty === 1 ? "" : "s"} tagged incorrect.
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {selectedAssessmentId ? (
        <Card className="border-indigo-100 bg-indigo-50/30">
          <CardHeader>
            <CardTitle>Item Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            {itemAnalysisLoading ? (
              <p className="text-sm text-slate-500">Loading item analysis...</p>
            ) : itemAnalysis ? (
              <ItemAnalysis items={itemAnalysis.items as any} totalStudents={itemAnalysis.total_students} />
            ) : (
              <p className="text-sm text-slate-500">Select an assessment to view item analysis.</p>
            )}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Score Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <PerformanceDistributionChart />
        </CardContent>
      </Card>
    </div>
  );
}
