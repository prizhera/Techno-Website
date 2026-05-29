"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  History,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  TrendingUp,
  UserCircle2,
  BookOpenCheck,
} from "lucide-react";
import Image from "next/image";
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import { MistakeTag } from "@/components/shared/mistake-tag";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import {
  studentMistakeHistory,
  studentProgress,
  studentRecommendations,
  recentAssessments,
  trendData,
} from "@/data/mock-data";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "assessments", label: "Assessments", icon: BookOpenCheck },
  { id: "mistakes", label: "Mistake History", icon: History },
  { id: "recommendations", label: "Recommendations", icon: Lightbulb },
  { id: "progress", label: "Progress", icon: TrendingUp },
  { id: "profile", label: "Profile", icon: UserCircle2 },
] as const;

type TabId = (typeof tabs)[number]["id"];

const pieColors = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"];

function ChartShell({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-72 w-full rounded-2xl bg-slate-100/80" aria-hidden />;
  }

  return <div className="h-72 w-full">{children}</div>;
}

export default function StudentsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("dashboard");
  const [topicFilter, setTopicFilter] = useState("All Topics");
  const [mistakeFilter, setMistakeFilter] = useState("All Mistakes");
  const [assessmentFilter, setAssessmentFilter] = useState("All Assessments");

  const filteredHistory = useMemo(() => {
    return studentMistakeHistory.filter((entry) => {
      const topicMatch = topicFilter === "All Topics" || entry.topic === topicFilter;
      const mistakeMatch = mistakeFilter === "All Mistakes" || entry.mistakeType === mistakeFilter;
      const assessmentMatch =
        assessmentFilter === "All Assessments" || entry.assessment === assessmentFilter;

      return topicMatch && mistakeMatch && assessmentMatch;
    });
  }, [assessmentFilter, mistakeFilter, topicFilter]);

  const topicOptions = ["All Topics", ...new Set(studentMistakeHistory.map((entry) => entry.topic))];
  const mistakeOptions = ["All Mistakes", ...new Set(studentMistakeHistory.map((entry) => entry.mistakeType))];
  const assessmentOptions = ["All Assessments", ...new Set(studentMistakeHistory.map((entry) => entry.assessment))];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-3xl border border-slate-200 bg-white/90 px-6 py-5 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <Image
                  src="/trace-logo.png"
                  alt="TRACE"
                  width={360}
                  height={120}
                  className="h-15 w-auto sm:h-15"
                />
              </div>

            <nav className="flex flex-wrap gap-2 rounded-2xl bg-slate-50 p-2">
              {tabs.map((tab) => {
                const active = activeTab === tab.id;
                const Icon = tab.icon;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition ${
                      active
                        ? "bg-sky-600 text-white shadow"
                        : "text-slate-600 hover:bg-white hover:text-slate-900"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </header>

        {/* Welcome text moved below the header to reduce header height */}
        <div className="mt-4">
          <h1 className="text-2xl font-semibold text-slate-900">Welcome back, Maria.</h1>
          <p className="mt-1 text-sm text-slate-600">Here is your latest learning insight summary.</p>
        </div>

        {activeTab === "dashboard" ? (
          <div className="space-y-6">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Weakest Topic</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{studentProgress.weakestTopic}</p>
                  <p className="mt-1 text-sm text-slate-500">Focus on composite function structure.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Most Common Mistake</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{studentProgress.mostCommonMistake}</p>
                  <p className="mt-1 text-sm text-slate-500">Procedural slips appear most often.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Recent Assessment</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{studentProgress.recentAssessment}</p>
                  <p className="mt-1 text-sm text-slate-500">Latest teacher feedback is available.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Improvement Trend</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{studentProgress.improvementTrend}</p>
                  <p className="mt-1 text-sm text-emerald-600">Improvement is moving in the right direction.</p>
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Mistake Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartShell>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={studentProgress.mistakeDistribution}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={58}
                          outerRadius={96}
                          paddingAngle={3}
                        >
                          {studentProgress.mistakeDistribution.map((entry, index) => (
                            <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartShell>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Topic Performance Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartShell>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={studentProgress.topicProgress}>
                        <XAxis dataKey="topic" tick={{ fill: "#475569", fontSize: 12 }} />
                        <YAxis tick={{ fill: "#475569", fontSize: 12 }} />
                        <Line
                          type="monotone"
                          dataKey="mastery"
                          stroke="#2563eb"
                          strokeWidth={2.5}
                          dot={{ fill: "#2563eb", r: 4 }}
                        />
                        <Tooltip />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartShell>
                </CardContent>
              </Card>
            </section>

            <Card className="border-sky-100 bg-sky-50/50">
              <CardHeader>
                <CardTitle>AI Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="max-w-3xl text-sm leading-7 text-slate-700">{studentProgress.aiFeedback}</p>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {activeTab === "assessments" ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assessments</CardTitle>
                <p className="mt-1 text-sm text-slate-600">All submitted assessments and status overview.</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {recentAssessments.map((a) => {
                    const matching = trendData.find((t) => a.title.includes(t.assessment));
                    const score = matching ? `${matching.score ?? matching.score}%` : "—";
                    return (
                      <div key={a.title} className="rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="text-sm font-medium text-slate-500">{a.className}</p>
                        <p className="mt-1 font-semibold text-slate-900">{a.title}</p>
                        <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
                          <span>{a.date}</span>
                          <span className="font-medium">{a.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {activeTab === "mistakes" ? (
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>Mistake History</CardTitle>
                  <p className="mt-1 text-sm text-slate-600">
                    Review categorized mistakes, teacher notes, and recurring patterns.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <Select value={topicFilter} onChange={(event) => setTopicFilter(event.target.value)}>
                  {topicOptions.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </Select>
                <Select value={mistakeFilter} onChange={(event) => setMistakeFilter(event.target.value)}>
                  {mistakeOptions.map((mistake) => (
                    <option key={mistake} value={mistake}>
                      {mistake}
                    </option>
                  ))}
                </Select>
                <Select value={assessmentFilter} onChange={(event) => setAssessmentFilter(event.target.value)}>
                  {assessmentOptions.map((assessment) => (
                    <option key={assessment} value={assessment}>
                      {assessment}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Assessment</th>
                      <th className="px-4 py-3 font-medium">Topic</th>
                      <th className="px-4 py-3 font-medium">Mistake Type</th>
                      <th className="px-4 py-3 font-medium">Teacher Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((entry) => (
                      <tr key={`${entry.assessment}-${entry.topic}`} className="border-t border-slate-200">
                        <td className="px-4 py-3 text-slate-700">{entry.assessment}</td>
                        <td className="px-4 py-3 text-slate-700">{entry.topic}</td>
                        <td className="px-4 py-3">
                          <MistakeTag mistake={entry.mistakeType} />
                        </td>
                        <td className="px-4 py-3 text-slate-600">{entry.teacherNote}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {activeTab === "recommendations" ? (
          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recommended Topics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {studentRecommendations.topics.map((topic) => (
                  <div key={topic} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800">
                    {topic}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Suggested Practice Areas</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {studentRecommendations.practiceAreas.map((area) => (
                  <span key={area} className="rounded-full bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700">
                    {area}
                  </span>
                ))}
              </CardContent>
            </Card>

            <Card className="xl:col-span-2 border-sky-100 bg-sky-50/50">
              <CardHeader>
                <CardTitle>AI Study Guidance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="max-w-3xl text-sm leading-7 text-slate-700">{studentRecommendations.guidance}</p>
              </CardContent>
            </Card>

            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle>Suggested Review Priority</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {studentRecommendations.reviewPriority.map((item) => (
                  <div key={item.topic} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm">
                    <span className="font-medium text-slate-800">{item.priority}</span>
                    <span className="text-slate-600">{item.topic}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ) : null}

        {activeTab === "progress" ? (
          <div className="space-y-6">
            <section className="grid gap-4 md:grid-cols-3">
              {studentProgress.topicProgress.map((item) => (
                <Card key={item.topic}>
                  <CardContent className="space-y-3 p-6">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-slate-800">{item.topic}</p>
                      <span className="text-sm font-semibold text-sky-700">{item.mastery}%</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100">
                      <div
                        className="h-3 rounded-full bg-sky-600"
                        style={{ width: `${item.mastery}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Mistake Reduction Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartShell>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={studentProgress.trendData}>
                        <Line
                          type="monotone"
                          dataKey="mistakes"
                          stroke="#2563eb"
                          strokeWidth={2.5}
                          dot={{ fill: "#2563eb", r: 4 }}
                        />
                        <Tooltip />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartShell>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Positive Reinforcement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-slate-700">
                  <p className="rounded-2xl bg-emerald-50 p-4 text-emerald-900">
                    Fewer procedural mistakes detected compared to previous assessment.
                  </p>
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="font-semibold text-slate-800">Focus for next week</p>
                    <p className="mt-1 text-slate-600">
                      Keep practicing chain rule setups and check the inner function before every derivative.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        ) : null}

        {activeTab === "profile" ? (
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
                <div>
                  <p className="text-sm font-medium text-slate-500">Student</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{studentProgress.profile.name}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Course</p>
                    <p className="mt-1 font-semibold text-slate-900">{studentProgress.profile.course}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Section</p>
                    <p className="mt-1 font-semibold text-slate-900">{studentProgress.profile.section}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">Assessments</p>
                    <p className="mt-1 font-semibold text-slate-900">{studentProgress.profile.assessmentCount}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <Button variant="outline" className="w-full justify-start">
                  <CheckCircle2 className="h-4 w-4" />
                  Settings
                </Button>
                <Button variant="outline" className="w-full justify-start text-slate-700">
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
