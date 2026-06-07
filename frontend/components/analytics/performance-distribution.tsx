"use client";

import { useMemo } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

function normalPdf(x: number, mean: number, stdDev: number): number {
  const z = (x - mean) / stdDev;
  return Math.exp(-0.5 * z * z) / (stdDev * Math.sqrt(2 * Math.PI));
}

function mockScoreDistribution() {
  const mean = 68;
  const stdDev = 14;
  const n = 25;
  const bins = [
    { binStart: 0, binEnd: 9 },
    { binStart: 10, binEnd: 19 },
    { binStart: 20, binEnd: 29 },
    { binStart: 30, binEnd: 39 },
    { binStart: 40, binEnd: 49 },
    { binStart: 50, binEnd: 59 },
    { binStart: 60, binEnd: 69 },
    { binStart: 70, binEnd: 79 },
    { binStart: 80, binEnd: 89 },
    { binStart: 90, binEnd: 100 },
  ];
  const center = (b: { binStart: number; binEnd: number }) => (b.binStart + b.binEnd) / 2;
  const totalWeight = bins.reduce((s, b) => s + normalPdf(center(b), mean, stdDev), 0);
  const counts = bins.map((b) => Math.round((normalPdf(center(b), mean, stdDev) / totalWeight) * n));
  const remainder = n - counts.reduce((s, c) => s + c, 0);
  const maxIdx = counts.reduce((mi, c, i, a) => (c > a[mi] ? i : mi), 0);
  counts[maxIdx] += remainder;
  return { histogram: bins.map((b, i) => ({ ...b, count: counts[i] })), mean, stdDev, totalStudents: n };
}

export function PerformanceDistributionChart() {
  const mock = useMemo(() => mockScoreDistribution(), []);
  const { histogram, mean, stdDev, totalStudents } = mock;

  const maxCount = Math.max(...histogram.map((b) => b.count), 1);
  const binMidpoints = histogram.map((b) => (b.binStart + b.binEnd) / 2);
  const pdfValues = binMidpoints.map((x) => normalPdf(x, mean, stdDev));
  const maxPdf = Math.max(...pdfValues, 1);
  const scaleFactor = maxCount / maxPdf;

  const chartData = histogram.map((bin, i) => ({
    label:
      bin.binStart === bin.binEnd
        ? `${bin.binStart}`
        : `${bin.binStart}–${bin.binEnd}`,
    count: bin.count,
    normal: Math.round(pdfValues[i] * scaleFactor * 100) / 100,
  }));

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">
        Mock score distribution (illustrative normal curve).
      </p>
      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-1.5">
          <span className="text-xs text-slate-400">Mean</span>
          <p className="font-semibold text-slate-800">{mean}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-1.5">
          <span className="text-xs text-slate-400">Std Dev</span>
          <p className="font-semibold text-slate-800">{stdDev}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-1.5">
          <span className="text-xs text-slate-400">Students</span>
          <p className="font-semibold text-slate-800">{totalStudents}</p>
        </div>
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              label={{ value: "Score", position: "insideBottom", offset: -4, style: { fontSize: 11, fill: "#94a3b8" } }}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "#64748b" }}
              tickLine={false}
              axisLine={{ stroke: "#e2e8f0" }}
              label={{ value: "Students", angle: -90, position: "insideLeft", offset: 4, style: { fontSize: 11, fill: "#94a3b8" } }}
            />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 12 }}
              formatter={(value, name) => {
                if (name === "normal") return [value ?? 0, "Expected (normal)"];
                return [value ?? 0, "Students"];
              }}
            />
            <Legend
              formatter={(value: string) => {
                if (value === "normal") return "Expected (Normal)";
                return value === "count" ? "Students" : value;
              }}
            />
            <Bar dataKey="count" name="count" fill="#6366f1" radius={[3, 3, 0, 0]} opacity={0.35} />
            <Line type="monotone" dataKey="normal" name="normal" stroke="#6366f1" strokeWidth={2} dot={false} connectNulls={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs text-slate-500">
        Histogram shows the number of students in each score range. The blue curve is a normal
        distribution fit (μ={mean}, σ={stdDev}). Once student scores are uploaded, this chart will
        display real data.
      </p>
    </div>
  );
}
