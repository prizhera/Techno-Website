type ApiStudent = {
  id: string;
  student_number?: string;
  full_name?: string;
  name?: string;
  class_id?: string;
  status?: string;
  lastAssessment?: string;
};

type ApiClass = {
  id?: string;
  class_name?: string;
  className?: string;
  subject?: string;
  students?: ApiStudent[] | number;
  assessments?: { id: string; title: string; status?: string; created_at?: string }[];
  status?: string;
};

type ApiMistakeRow = {
  assessment?: { title?: string } | null;
  question?: { topic?: string } | null;
  mistake_label?: string;
  teacher_note?: string;
  assessment_title?: string;
  topic?: string;
  mistakeType?: string;
  teacherNote?: string;
};

type StudentRow = {
  id: string;
  student_number: string;
  name: string;
  status: string;
  lastAssessment: string;
};

type ClassCardData = {
  id?: string;
  className: string;
  subject: string;
  students: number;
  status: string;
  latestAssessmentDate: string;
  weakestTopic: string;
  studentsAtRisk: number;
};

type ProgressData = {
  weakestTopic: string;
  mostCommonMistake: string;
  recentAssessment: string;
  improvementTrend: string;
  mistakeDistribution: { name: string; value: number }[];
  topicProgress: { topic: string; mastery: number }[];
  trendData: { assessment: string; score: number; mistakes: number }[];
  aiFeedback: string;
  profile: { name: string; course: string; section: string; assessmentCount: number };
};

type RecommendationData = {
  topics: string[];
  practiceAreas: string[];
  guidance: string;
  reviewPriority: { priority: string; topic: string }[];
};

type MistakeHistoryEntry = {
  assessment: string;
  topic: string;
  mistakeType: string;
  teacherNote: string;
};

type DashboardMetrics = {
  mostFailedTopic: string;
  failedTopicRate: string;
  commonMistakeType: string;
  supportStudents: number;
  reviewedLabel: string;
};

const DEFAULT_STUDENT_PROGRESS: ProgressData = {
  weakestTopic: "—",
  mostCommonMistake: "—",
  recentAssessment: "—",
  improvementTrend: "—",
  mistakeDistribution: [],
  topicProgress: [],
  trendData: [],
  aiFeedback: "Track mistakes in Question Analysis to receive personalized AI feedback.",
  profile: { name: "Student", course: "—", section: "—", assessmentCount: 0 },
};

const DEFAULT_RECOMMENDATIONS: RecommendationData = {
  topics: [],
  practiceAreas: [],
  guidance: DEFAULT_STUDENT_PROGRESS.aiFeedback,
  reviewPriority: [],
};

export function normalizeStudentRow(raw: ApiStudent): StudentRow {
  return {
    id: raw.id ?? raw.student_number ?? "",
    student_number: raw.student_number ?? "",
    name: raw.full_name ?? raw.name ?? "Unknown",
    status: raw.status ?? "On Track",
    lastAssessment: raw.lastAssessment ?? "-",
  };
}

export function normalizeStudentRows(rows: ApiStudent[]): StudentRow[] {
  return rows.map(normalizeStudentRow);
}

export function normalizeClassCard(raw: ApiClass): ClassCardData {
  const studentList = Array.isArray(raw.students) ? raw.students : [];
  const assessments = raw.assessments ?? [];
  const latestAssessment = assessments[0];

  return {
    id: raw.id,
    className: raw.class_name ?? raw.className ?? "Unnamed Class",
    subject: raw.subject ?? "—",
    students: Array.isArray(raw.students) ? studentList.length : (raw.students as number) ?? 0,
    status: raw.status ?? (latestAssessment?.status === "reviewed" ? "Stable" : "Active"),
    latestAssessmentDate: latestAssessment?.created_at
      ? new Date(latestAssessment.created_at).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "—",
    weakestTopic: "—",
    studentsAtRisk: 0,
  };
}

export function buildClassOverviewFromApi(classes: ApiClass[]): ClassCardData[] {
  return classes.map(normalizeClassCard);
}

export function normalizeMistakeHistoryEntry(raw: ApiMistakeRow): MistakeHistoryEntry {
  return {
    assessment: raw.assessment?.title ?? raw.assessment_title ?? "—",
    topic: raw.question?.topic ?? raw.topic ?? "—",
    mistakeType: raw.mistake_label ?? raw.mistakeType ?? "Procedural Mistake",
    teacherNote: raw.teacher_note ?? raw.teacherNote ?? "",
  };
}

export function buildStudentPortalData(
  insight: {
    student?: { full_name?: string; student_number?: string; class_id?: string };
    total_mistakes?: number;
    recurring_mistakes?: { label_name: string; count: number }[];
    mistake_history?: ApiMistakeRow[];
  } | null,
  classes: ApiClass[] = []
): {
  progress: ProgressData;
  recommendations: RecommendationData;
  mistakeHistory: MistakeHistoryEntry[];
  studentName: string;
} {
  if (!insight?.student) {
    return {
      progress: DEFAULT_STUDENT_PROGRESS,
      recommendations: DEFAULT_RECOMMENDATIONS,
      mistakeHistory: [],
      studentName: DEFAULT_STUDENT_PROGRESS.profile.name,
    };
  }

  const classRecord = classes.find((item) => item.id === insight.student?.class_id);
  const recurring = insight.recurring_mistakes ?? [];
  const history = (insight.mistake_history ?? []).map(normalizeMistakeHistoryEntry);

  const topicCounts = new Map<string, number>();
  for (const entry of history) {
    topicCounts.set(entry.topic, (topicCounts.get(entry.topic) ?? 0) + 1);
  }

  const weakestTopic =
    [...topicCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? DEFAULT_STUDENT_PROGRESS.weakestTopic;

  const mistakeDistribution = recurring.length
    ? recurring.map((item) => ({
        name: item.label_name.split(" ")[0],
        value: item.count,
      }))
    : DEFAULT_STUDENT_PROGRESS.mistakeDistribution;

  const topicProgress = history.length
    ? [...topicCounts.entries()].map(([topic, count]) => ({
        topic,
        mastery: Math.max(35, 100 - count * 8),
      }))
    : DEFAULT_STUDENT_PROGRESS.topicProgress;

  const progress: ProgressData = {
    ...DEFAULT_STUDENT_PROGRESS,
    weakestTopic,
    mostCommonMistake: recurring[0]?.label_name ?? DEFAULT_STUDENT_PROGRESS.mostCommonMistake,
    recentAssessment: history[0]?.assessment ?? DEFAULT_STUDENT_PROGRESS.recentAssessment,
    improvementTrend:
      insight.total_mistakes && insight.total_mistakes < 5
        ? "Improving steadily"
        : DEFAULT_STUDENT_PROGRESS.improvementTrend,
    mistakeDistribution,
    topicProgress,
    trendData: DEFAULT_STUDENT_PROGRESS.trendData,
    aiFeedback: history.length
      ? `Your most recurring issue is ${recurring[0]?.label_name ?? "procedural execution"}. Review teacher notes and focus on ${weakestTopic} next.`
      : DEFAULT_STUDENT_PROGRESS.aiFeedback,
    profile: {
      name: insight.student.full_name ?? DEFAULT_STUDENT_PROGRESS.profile.name,
      course: classRecord?.subject ?? DEFAULT_STUDENT_PROGRESS.profile.course,
      section: classRecord?.class_name ?? DEFAULT_STUDENT_PROGRESS.profile.section,
      assessmentCount: new Set(history.map((item) => item.assessment)).size || DEFAULT_STUDENT_PROGRESS.profile.assessmentCount,
    },
  };

  const recommendations: RecommendationData = {
    topics: topicProgress.slice(0, 3).map((item) => item.topic),
    practiceAreas: recurring.slice(0, 3).map((item) => item.label_name),
    guidance: progress.aiFeedback,
    reviewPriority: topicProgress.slice(0, 2).map((item, index) => ({
      priority: index === 0 ? "High" : "Medium",
      topic: item.topic,
    })),
  };

  return {
    progress,
    recommendations,
    mistakeHistory: history.length ? history : [],
    studentName: insight.student.full_name ?? DEFAULT_STUDENT_PROGRESS.profile.name,
  };
}

const DEFAULT_METRICS: DashboardMetrics = {
  mostFailedTopic: "—",
  failedTopicRate: "—",
  commonMistakeType: "—",
  supportStudents: 0,
  reviewedLabel: "0 of 0 Completed",
};

export function buildDashboardMetrics(
  analytics: {
    labelCounts?: { label_name: string; count: number }[];
    questionMistakeCounts?: { topic: string; incorrect_count: number }[];
  } | null,
  dashboard: { metrics?: { supportStudents?: number; reviewedAssessments?: number; assessments?: number } } | null
): DashboardMetrics {
  if (!analytics && !dashboard) return DEFAULT_METRICS;

  const labelCounts = analytics?.labelCounts ?? [];
  const questionCounts = analytics?.questionMistakeCounts ?? [];

  const topLabel = [...labelCounts].sort((a, b) => b.count - a.count)[0];
  const topicTotals = new Map<string, number>();
  for (const row of questionCounts) {
    topicTotals.set(row.topic, (topicTotals.get(row.topic) ?? 0) + row.incorrect_count);
  }
  const topTopic = [...topicTotals.entries()].sort((a, b) => b[1] - a[1])[0];

  const reviewed = dashboard?.metrics?.reviewedAssessments ?? 0;
  const totalAssessments = dashboard?.metrics?.assessments ?? 0;

  return {
    mostFailedTopic: topTopic?.[0] ?? DEFAULT_METRICS.mostFailedTopic,
    failedTopicRate: topTopic ? `${Math.min(95, topTopic[1] * 5)}%` : DEFAULT_METRICS.failedTopicRate,
    commonMistakeType: topLabel?.label_name ?? DEFAULT_METRICS.commonMistakeType,
    supportStudents: dashboard?.metrics?.supportStudents ?? DEFAULT_METRICS.supportStudents,
    reviewedLabel:
      totalAssessments > 0 ? `${reviewed} of ${totalAssessments} Completed` : DEFAULT_METRICS.reviewedLabel,
  };
}

export function buildActivityFeed(
  dashboard: {
    student_mistakes?: { created_at?: string }[];
    assessments?: { title?: string; status?: string }[];
  } | null
): string[] {
  if (!dashboard) return [];

  const items: string[] = [];
  for (const assessment of dashboard.assessments?.slice(0, 2) ?? []) {
    items.push(`${assessment.title}: status ${assessment.status ?? "pending"}.`);
  }
  if (dashboard.student_mistakes?.length) {
    items.push(`${dashboard.student_mistakes.length} student mistakes recorded in the system.`);
  }

  return items;
}

export function analyticsToTopicDifficulty(
  questionMistakeCounts: { topic: string; incorrect_count: number }[] = []
): { topic: string; difficulty: number }[] {
  if (!questionMistakeCounts.length) return [];

  const topicTotals = new Map<string, number>();
  for (const row of questionMistakeCounts) {
    topicTotals.set(row.topic, (topicTotals.get(row.topic) ?? 0) + row.incorrect_count);
  }

  return [...topicTotals.entries()].map(([topic, count]) => ({
    topic,
    difficulty: count,
  }));
}

export function analyticsToMistakeFrequency(
  labelCounts: { label_name: string; count: number }[] = []
): { name: string; value: number }[] {
  if (!labelCounts.length) return [];

  return labelCounts.map((row) => ({
    name: row.label_name.split(" ")[0],
    value: row.count,
  }));
}

export function analyticsToQuestionDifficulty(
  questionMistakeCounts: { question_number?: number; topic: string; incorrect_count: number }[] = []
): { question: string; topic: string; incorrectCount: number }[] {
  if (!questionMistakeCounts.length) return [];

  return questionMistakeCounts.map((row) => ({
    question: row.question_number ? `Q${row.question_number}` : row.topic,
    topic: row.topic,
    incorrectCount: row.incorrect_count,
  }));
}

export function normalizeQuestionBank(
  rows: { id?: string; question_number?: number; question_text?: string; topic?: string; prompt?: string; title?: string }[]
) {
  return rows.map((row) => ({
    id: row.id ?? `Q${row.question_number ?? ""}`,
    questionNumber: row.question_number ?? 0,
    title: row.topic ?? row.title ?? "Question",
    prompt: row.question_text ?? row.prompt ?? "",
  }));
}
