export type MistakeType =
  | "Conceptual Misunderstanding"
  | "Procedural Mistake"
  | "Calculation Error"
  | "Sign Error"
  | "Interpretation Mistake"
  | "Careless Mistake";

export const mistakeTypes: MistakeType[] = [
  "Conceptual Misunderstanding",
  "Procedural Mistake",
  "Calculation Error",
  "Sign Error",
  "Interpretation Mistake",
  "Careless Mistake",
];

export const metrics = {
  mostFailedTopic: "Chain Rule",
  failedTopicRate: "70%",
  commonMistakeType: "Procedural Mistake",
  supportStudents: 11,
};

export const recentAssessments = [
  { title: "Calculus 1 Midterm 1", className: "BSCE SC123", date: "May 24, 2026", status: "Reviewed" },
  { title: "Calculus 1 Quiz 4", className: "BSIT SC221", date: "May 20, 2026", status: "Pending Insights" },
  { title: "Calculus 1 Drill", className: "BSMath SC102", date: "May 18, 2026", status: "Reviewed" },
];

export const classOverview = [
  {
    className: "BSCE SC123 - Calculus 1",
    subject: "Calculus 1",
    students: 42,
    status: "New misconceptions flagged",
    latestAssessmentDate: "May 24, 2026",
    weakestTopic: "Chain Rule",
    studentsAtRisk: 9,
  },
  {
    className: "BSIT SC221 - Calculus 1",
    subject: "Calculus 1",
    students: 36,
    status: "Stable",
    latestAssessmentDate: "May 20, 2026",
    weakestTopic: "Power Rule",
    studentsAtRisk: 4,
  },
  {
    className: "BSMath SC102 - Calculus 1",
    subject: "Calculus 1",
    students: 31,
    status: "Needs remediation",
    latestAssessmentDate: "May 18, 2026",
    weakestTopic: "Integration",
    studentsAtRisk: 7,
  },
];

export const topicDifficultyData = [
  { topic: "Power Rule", difficulty: 34 },
  { topic: "Chain Rule", difficulty: 70 },
  { topic: "Product Rule", difficulty: 55 },
  { topic: "Integration", difficulty: 62 },
  { topic: "U-Substitution", difficulty: 58 },
];

export const mistakeFrequencyData = [
  { name: "Procedural", value: 41 },
  { name: "Conceptual", value: 24 },
  { name: "Calculation", value: 17 },
  { name: "Sign", value: 8 },
  { name: "Interpretation", value: 6 },
  { name: "Careless", value: 4 },
];

export const trendData = [
  { assessment: "Quiz 1", score: 72, mistakes: 28 },
  { assessment: "Quiz 2", score: 74, mistakes: 24 },
  { assessment: "Quiz 3", score: 76, mistakes: 21 },
  { assessment: "Midterm", score: 79, mistakes: 19 },
  { assessment: "Quiz 4", score: 81, mistakes: 16 },
];

export const questionDifficultyData = [
  { question: "Q1", topic: "Power Rule", incorrectRate: 36 },
  { question: "Q2", topic: "Chain Rule", incorrectRate: 70 },
  { question: "Q3", topic: "Product Rule", incorrectRate: 52 },
  { question: "Q4", topic: "Integration", incorrectRate: 61 },
];

export const activityFeed = [
  "BSCE SC123: 9 students flagged for Chain Rule procedural errors.",
  "Integration Drill analytics generated with 3 recurring misconception clusters.",
  "Teacher note added: students confuse inner derivative handling in composite functions.",
  "AI recommendation updated: include step-by-step substitution warmups.",
];

export const questionBank = [
  { id: "Q1", title: "Power Rule", prompt: "Differentiate f(x) = 5x^4 - 3x^2 + 7" },
  { id: "Q2", title: "Chain Rule", prompt: "Differentiate g(x) = (3x^2 + 1)^5" },
  { id: "Q3", title: "Product Rule", prompt: "Differentiate h(x) = (x^2 + 3)(2x - 1)" },
  { id: "Q4", title: "Integration", prompt: "Evaluate ∫(4x^3 - 6x + 2) dx" },
];

export const students = [
  { name: "Juan Dela Cruz", id: "2026-001", status: "Needs Support", lastAssessment: "Midterm 1" },
  { name: "Maria Santos", id: "2026-002", status: "Improving", lastAssessment: "Midterm 1" },
  { name: "Alex Rivera", id: "2026-003", status: "Needs Support", lastAssessment: "Midterm 1" },
  { name: "Leah Fernandez", id: "2026-004", status: "On Track", lastAssessment: "Midterm 1" },
  { name: "Noah Garcia", id: "2026-005", status: "Needs Support", lastAssessment: "Midterm 1" },
];

export const studentMistakeHistory = [
  {
    assessment: "Midterm Exam 1",
    topic: "Chain Rule",
    mistakeType: "Procedural Mistake" as MistakeType,
    teacherNote: "Forgot to apply the derivative of the inner function.",
  },
  {
    assessment: "Quiz 2",
    topic: "Integration",
    mistakeType: "Calculation Error" as MistakeType,
    teacherNote: "Sign error during simplification.",
  },
  {
    assessment: "Integration Drill",
    topic: "U-Substitution",
    mistakeType: "Conceptual Misunderstanding" as MistakeType,
    teacherNote: "Did not identify the composite function correctly.",
  },
  {
    assessment: "Midterm Exam 1",
    topic: "Power Rule",
    mistakeType: "Sign Error" as MistakeType,
    teacherNote: "Coefficient sign flipped during differentiation.",
  },
];

export const studentRecommendations = {
  topics: ["Chain Rule", "U-Substitution", "Power Rule"],
  practiceAreas: ["Nested functions", "Derivative simplification", "Sign checking"],
  guidance:
    "Practice identifying composite functions before applying differentiation rules. Break each problem into structure first, then compute the derivative step by step.",
  reviewPriority: [
    { priority: "High", topic: "Chain Rule" },
    { priority: "Medium", topic: "Integration" },
  ],
};

export const studentProgress = {
  weakestTopic: "Chain Rule",
  mostCommonMistake: "Procedural Mistake",
  recentAssessment: "Midterm Exam 1",
  improvementTrend: "+12% fewer procedural errors",
  mistakeDistribution: [
    { name: "Procedural", value: 38 },
    { name: "Conceptual", value: 22 },
    { name: "Calculation", value: 18 },
    { name: "Sign", value: 12 },
    { name: "Interpretation", value: 10 },
  ],
  topicProgress: [
    { topic: "Power Rule", mastery: 85 },
    { topic: "Chain Rule", mastery: 54 },
    { topic: "Integration", mastery: 61 },
    { topic: "U-Substitution", mastery: 57 },
  ],
  trendData: [
    { assessment: "Quiz 1", mistakes: 28 },
    { assessment: "Quiz 2", mistakes: 25 },
    { assessment: "Quiz 3", mistakes: 22 },
    { assessment: "Midterm", mistakes: 18 },
    { assessment: "Quiz 4", mistakes: 16 },
  ],
  aiFeedback:
    "You consistently understand differentiation concepts but struggle with procedural execution in Chain Rule problems. Focus on identifying inner functions before differentiation.",
  profile: {
    name: "Maria Santos",
    course: "Calculus 1",
    section: "BSIT SC221",
    assessmentCount: 5,
  },
};