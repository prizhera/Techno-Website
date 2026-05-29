"use client";

import { useEffect, useState } from "react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  mistakeFrequencyData,
  questionDifficultyData,
  topicDifficultyData,
  trendData,
} from "@/data/mock-data";

const pieColors = ["#2563eb", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"];

function ChartShell({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-72 w-full rounded-xl bg-slate-100/80" aria-hidden />;
  }

  return <div className="h-72 w-full min-w-0">{children}</div>;
}

export function TopicDifficultyChart() {
  return (
    <ChartShell>
      <ResponsiveContainer width="100%" height={288} minWidth={0}>
        <BarChart data={topicDifficultyData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="topic" tick={{ fill: "#475569", fontSize: 12 }} />
          <YAxis tick={{ fill: "#475569", fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="difficulty" fill="#2563eb" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

export function MistakeFrequencyChart() {
  return (
    <ChartShell>
      <ResponsiveContainer width="100%" height={288} minWidth={0}>
        <PieChart>
          <Pie
            data={mistakeFrequencyData}
            dataKey="value"
            nameKey="name"
            innerRadius={58}
            outerRadius={96}
            paddingAngle={3}
          >
            {mistakeFrequencyData.map((entry, index) => (
              <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

export function PerformanceTrendChart() {
  return (
    <ChartShell>
      <ResponsiveContainer width="100%" height={288} minWidth={0}>
        <LineChart data={trendData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="assessment" tick={{ fill: "#475569", fontSize: 12 }} />
          <YAxis tick={{ fill: "#475569", fontSize: 12 }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#2563eb"
            strokeWidth={2.5}
            dot={{ fill: "#2563eb", r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="mistakes"
            stroke="#94a3b8"
            strokeWidth={2}
            dot={{ fill: "#94a3b8", r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}

export function QuestionDifficultyChart() {
  return (
    <ChartShell>
      <ResponsiveContainer width="100%" height={288} minWidth={0}>
        <BarChart data={questionDifficultyData} layout="vertical" margin={{ left: 12 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis type="number" tick={{ fill: "#475569", fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="question"
            tick={{ fill: "#475569", fontSize: 12 }}
            width={48}
          />
          <Tooltip />
          <Bar dataKey="incorrectRate" fill="#3b82f6" radius={[0, 8, 8, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartShell>
  );
}