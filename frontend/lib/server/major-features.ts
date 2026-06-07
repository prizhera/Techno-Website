import {
  activityFeed,
  classOverview,
  metrics,
  mistakeFrequencyData,
  questionBank,
  questionDifficultyData,
  recentAssessments,
  studentMistakeHistory,
  studentProgress,
  studentRecommendations,
  students,
  topicDifficultyData,
  trendData,
  type MistakeType,
  mistakeTypes,
} from "@/data/mock-data";

type QuestionAnalysisQuestion = {
  id: string;
  topic: string;
  prompt: string;
  incorrectCount: number;
  status: string;
  wrongStudentIds: string[];
  aiInsight: string;
};

type QuestionAnalysisAssessment = {
  id: string;
  title: string;
  className: string;
  date: string;
  status: string;
  summary: string;
  questions: QuestionAnalysisQuestion[];
};

const questionAnalysisAssessments: QuestionAnalysisAssessment[] = [
  {
    id: "midterm-1",
    title: "Midterm Exam 1",
    className: "BSCE SC123 - Calculus 1",
    date: "March 18, 2026",
    status: "Partially Reviewed",
    summary: "20 Questions - 42 Students",
    questions: [
      {
        id: "Q1",
        topic: "Power Rule",
        prompt: "Differentiate f(x) = 5x^4 - 3x^2 + 7",
        incorrectCount: 4,
        status: "Reviewed",
        wrongStudentIds: ["2026-002", "2026-004", "2026-005", "2026-001"],
        aiInsight:
          "Most students applied the power rule correctly, but sign handling and coefficient simplification caused the final errors.",
      },
      {
        id: "Q2",
        topic: "Chain Rule",
        prompt: "Differentiate g(x) = (3x^2 + 1)^5",
        incorrectCount: 11,
        status: "Needs Review",
        wrongStudentIds: ["2026-001", "2026-003", "2026-005"],
        aiInsight:
          "Many answers missed the inner derivative after applying the chain rule to the composite function.",
      },
      {
        id: "Q3",
        topic: "Product Rule",
        prompt: "Differentiate h(x) = (x^2 + 3)(2x - 1)",
        incorrectCount: 7,
        status: "Reviewed",
        wrongStudentIds: ["2026-002", "2026-004"],
        aiInsight:
          "Several students differentiated only one factor and omitted the second product-rule term.",
      },
      {
        id: "Q4",
        topic: "Integration",
        prompt: "Evaluate ∫(4x^3 - 6x + 2) dx",
        incorrectCount: 8,
        status: "Needs Review",
        wrongStudentIds: ["2026-001", "2026-003", "2026-005"],
        aiInsight:
          "Students handled the main antiderivative correctly but lost constants and signs during integration.",
      },
    ],
  },
  {
    id: "quiz-2",
    title: "Quiz 2",
    className: "BSIT SC221 - Calculus 1",
    date: "March 14, 2026",
    status: "Reviewed",
    summary: "15 Questions - 36 Students",
    questions: [
      {
        id: "Q1",
        topic: "Limits",
        prompt: "Find lim x→2 (x^2 - 4)/(x - 2)",
        incorrectCount: 6,
        status: "Reviewed",
        wrongStudentIds: ["2026-001", "2026-004"],
        aiInsight:
          "Most students recognized the limit form but struggled to factor and cancel before substitution.",
      },
      {
        id: "Q2",
        topic: "Chain Rule",
        prompt: "Differentiate y = sin(4x^2)",
        incorrectCount: 9,
        status: "Needs Review",
        wrongStudentIds: ["2026-002", "2026-003", "2026-005"],
        aiInsight:
          "Several answers missed the derivative of the inner function or treated 4x^2 as a constant.",
      },
      {
        id: "Q3",
        topic: "Integration",
        prompt: "Evaluate ∫(2x + 1) dx",
        incorrectCount: 3,
        status: "Reviewed",
        wrongStudentIds: ["2026-004"],
        aiInsight:
          "The main issue is constant-of-integration handling rather than the antiderivative itself.",
      },
    ],
  },
  {
    id: "integral-drill",
    title: "Integration Drill",
    className: "BSMath SC102 - Calculus 1",
    date: "March 10, 2026",
    status: "Pending",
    summary: "5 Questions - 31 Students",
    questions: [
      {
        id: "Q1",
        topic: "U-Substitution",
        prompt: "Evaluate ∫2x(x^2 + 1)^4 dx",
        incorrectCount: 10,
        status: "Needs Review",
        wrongStudentIds: ["2026-001", "2026-003", "2026-005"],
        aiInsight:
          "Students set up the substitution, but several failed to carry the change of variables through consistently.",
      },
      {
        id: "Q2",
        topic: "Power Rule",
        prompt: "Evaluate ∫5x^4 dx",
        incorrectCount: 2,
        status: "Reviewed",
        wrongStudentIds: ["2026-002"],
        aiInsight: "Minor exponent and constant handling errors dominate this item.",
      },
      {
        id: "Q3",
        topic: "Area Under Curve",
        prompt: "Approximate area under y = x^2 from 0 to 2",
        incorrectCount: 8,
        status: "Needs Review",
        wrongStudentIds: ["2026-002", "2026-004"],
        aiInsight:
          "Students need clearer guidance on interpreting area and choosing the correct approximation setup.",
      },
    ],
  },
];

function toId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

const classRecords = classOverview.map((classItem) => ({
  id: toId(classItem.className),
  ...classItem,
}));

const assessmentRecords = recentAssessments.map((assessment) => ({
  id: toId(assessment.title),
  ...assessment,
}));

export function getDashboardData() {
  return {
    metrics,
    activityFeed,
    classOverview: classRecords,
    recentAssessments: assessmentRecords,
  };
}

export function getClassesData() {
  return {
    classes: classRecords,
    students,
  };
}

export function getAssessmentsData() {
  return {
    assessments: assessmentRecords,
    questionBank,
  };
}

export function getAnalyticsData() {
  return {
    metrics,
    topicDifficultyData,
    mistakeFrequencyData,
    trendData,
    questionDifficultyData,
  };
}

export function getQuestionAnalysisData() {
  return {
    assessments: questionAnalysisAssessments,
    mistakeTypes,
    students,
    questionDifficultyData,
  };
}

export function getStudentsData() {
  return {
    students,
    studentMistakeHistory,
    studentProgress,
    studentRecommendations,
  };
}

export function getFeatureCatalog() {
  return {
    dashboard: getDashboardData(),
    classes: getClassesData(),
    assessments: getAssessmentsData(),
    analytics: getAnalyticsData(),
    questionAnalysis: getQuestionAnalysisData(),
    students: getStudentsData(),
  };
}

export type { MistakeType };