"use client";

type Item = {
  id: string;
  question_number: number;
  topic: string;
  question_text: string;
  incorrect_count: number;
  difficulty_index: number;
  difficulty_label: string;
  discrimination_index: number;
  unique_students_affected: number;
  mistake_distribution: { label_name: string; count: number }[];
  flags: string[];
};

const difficultyColors: Record<string, string> = {
  Easy: "bg-emerald-500",
  Moderate: "bg-amber-400",
  Difficult: "bg-orange-500",
  "Very Difficult": "bg-red-500",
};

const flagDescriptions: Record<string, string> = {
  "Very Difficult": ">80% of students answered incorrectly",
  Difficult: "60–80% of students answered incorrectly",
  "Low Discrimination": "Fails to distinguish between high and low performers (<0.10 index)",
  "Dominant Distractor": "One mistake type accounts for >50% of all wrong answers",
};

const flagColors: Record<string, string> = {
  "Very Difficult": "bg-red-100 text-red-700 border-red-200",
  Difficult: "bg-orange-100 text-orange-700 border-orange-200",
  "Low Discrimination": "bg-amber-100 text-amber-700 border-amber-200",
  "Dominant Distractor": "bg-purple-100 text-purple-700 border-purple-200",
};

function difficultyBarColor(index: number) {
  if (index >= 80) return "bg-red-500";
  if (index >= 60) return "bg-orange-500";
  if (index >= 30) return "bg-amber-400";
  return "bg-emerald-500";
}

export function ItemAnalysis({ items, totalStudents }: { items: Item[]; totalStudents: number }) {
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
        No items to analyze. Tag student mistakes first.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Based on <span className="font-semibold text-slate-800">{totalStudents}</span> students in this class.
      </p>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Question</th>
              <th className="px-4 py-3 font-medium">Topic</th>
              <th className="px-4 py-3 font-medium" title="Percentage of students who answered incorrectly (higher = harder)">
                Difficulty
              </th>
              <th className="px-4 py-3 font-medium" title="How well the question distinguishes high from low performers. Ratio of bottom-third mistakes to top-third mistakes. Higher = better.">
                Discrimination
              </th>
              <th className="px-4 py-3 font-medium">Mistake Distribution</th>
              <th className="px-4 py-3 font-medium" title="Automated flags that highlight item quality concerns">Flags</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-t border-slate-200">
                <td className="px-4 py-3 font-medium text-slate-800">
                  Q{item.question_number}
                  <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">{item.question_text}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{item.topic}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700">{item.difficulty_index}%</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      item.difficulty_label === "Easy" ? "bg-emerald-50 text-emerald-700" :
                      item.difficulty_label === "Moderate" ? "bg-amber-50 text-amber-700" :
                      item.difficulty_label === "Difficult" ? "bg-orange-50 text-orange-700" :
                      "bg-red-50 text-red-700"
                    }`}>
                      {item.difficulty_label}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 w-full rounded-full bg-slate-100">
                    <div
                      className={`h-2 rounded-full ${difficultyBarColor(item.difficulty_index)}`}
                      style={{ width: `${item.difficulty_index}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{item.incorrect_count} of {totalStudents} incorrect</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-sm font-semibold ${
                    item.discrimination_index >= 0.3 ? "text-emerald-600" :
                    item.discrimination_index >= 0.15 ? "text-amber-600" :
                    "text-slate-400"
                  }`}>
                    {item.discrimination_index.toFixed(2)}
                  </span>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {item.discrimination_index >= 0.3 ? "Good" :
                     item.discrimination_index >= 0.15 ? "Fair" : "Poor"}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {item.mistake_distribution.map((d) => (
                      <span
                        key={d.label_name}
                        className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600"
                      >
                        {d.label_name} ({d.count})
                      </span>
                    ))}
                    {!item.mistake_distribution.length ? (
                      <span className="text-xs text-slate-400">None</span>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {item.flags.map((flag) => (
                      <span
                        key={flag}
                        className={`rounded-full border px-2 py-0.5 text-xs font-medium ${flagColors[flag] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}
                      >
                        {flag}
                      </span>
                    ))}
                    {!item.flags.length ? (
                      <span className="text-xs text-slate-400">—</span>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <details className="text-xs text-slate-500">
        <summary className="cursor-pointer select-none font-medium text-slate-600">
          What do these metrics mean?
        </summary>
        <div className="mt-2 space-y-1.5 pl-1">
          <p>
            <strong>Difficulty</strong> — The percentage of students who answered the question
            incorrectly. Higher = harder. Above 80% flags as <em>Very Difficult</em>.
          </p>
          <p>
            <strong>Discrimination</strong> — Students are split into top-performing and
            bottom-performing thirds by total mistakes. A discrimination index of{" "}
            <em>0.30+</em> means bottom-third students got it wrong much more often than
            top-third students — the question is doing its job. <em>Below 0.10</em> means
            the question barely differentiates and is flagged.
          </p>
          <p>
            <strong>Flags</strong> — Automated quality indicators:
          </p>
          <ul className="list-inside list-disc space-y-0.5 pl-2">
            {Object.entries(flagDescriptions).map(([flag, desc]) => (
              <li key={flag}>
                <span className="font-medium text-slate-700">{flag}</span>: {desc}
              </li>
            ))}
          </ul>
        </div>
      </details>
    </div>
  );
}
