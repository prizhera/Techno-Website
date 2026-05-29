"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { mistakeTypes, type MistakeType, students } from "@/data/mock-data";

type Phase = "assessment" | "questions" | "select" | "tagging";
type AnalysisStep = "select" | "label";

type Assessment = {
  id: string;
  title: string;
  className: string;
  date: string;
  status: string;
  summary: string;
  questions: Question[];
};

type Question = {
  id: string;
  topic: string;
  prompt: string;
  incorrectCount: number;
  status: string;
  wrongStudentIds: string[];
  aiInsight: string;
};

type TaggingRow = {
  id: string;
  name: string;
  mistakeType: MistakeType | "";
};

const assessments: Assessment[] = [
  {
    id: "midterm-1",
    title: "Midterm Exam 1",
    className: "BSCE SC123 – Calculus 1",
    date: "March 18, 2026",
    status: "Partially Reviewed",
    summary: "20 Questions • 42 Students",
    questions: [
      {
        id: "Q1",
        topic: "Power Rule",
        prompt: "Differentiate f(x) = 5x^4 - 3x^2 + 7",
        incorrectCount: 4,
        status: "Reviewed",
        wrongStudentIds: ["2026-002", "2026-004", "2026-005", "2026-001"],
        aiInsight: "Most students applied the power rule correctly, but sign handling and coefficient simplification caused the final errors.",
      },
      {
        id: "Q2",
        topic: "Chain Rule",
        prompt: "Differentiate g(x) = (3x^2 + 1)^5",
        incorrectCount: 11,
        status: "Needs Review",
        wrongStudentIds: ["2026-001", "2026-003", "2026-005"],
        aiInsight: "Many answers missed the inner derivative after applying the chain rule to the composite function.",
      },
      {
        id: "Q3",
        topic: "Product Rule",
        prompt: "Differentiate h(x) = (x^2 + 3)(2x - 1)",
        incorrectCount: 7,
        status: "Reviewed",
        wrongStudentIds: ["2026-002", "2026-004"],
        aiInsight: "Several students differentiated only one factor and omitted the second product-rule term.",
      },
      {
        id: "Q4",
        topic: "Integration",
        prompt: "Evaluate ∫(4x^3 - 6x + 2) dx",
        incorrectCount: 8,
        status: "Needs Review",
        wrongStudentIds: ["2026-001", "2026-003", "2026-005"],
        aiInsight: "Students handled the main antiderivative correctly but lost constants and signs during integration.",
      },
    ],
  },
  {
    id: "quiz-2",
    title: "Quiz 2",
    className: "BSIT SC221 – Calculus 1",
    date: "March 14, 2026",
    status: "Reviewed",
    summary: "15 Questions • 36 Students",
    questions: [
      {
        id: "Q1",
        topic: "Limits",
        prompt: "Find lim x→2 (x^2 - 4)/(x - 2)",
        incorrectCount: 6,
        status: "Reviewed",
        wrongStudentIds: ["2026-001", "2026-004"],
        aiInsight: "Most students recognized the limit form but struggled to factor and cancel before substitution.",
      },
      {
        id: "Q2",
        topic: "Chain Rule",
        prompt: "Differentiate y = sin(4x^2)",
        incorrectCount: 9,
        status: "Needs Review",
        wrongStudentIds: ["2026-002", "2026-003", "2026-005"],
        aiInsight: "Several answers missed the derivative of the inner function or treated 4x^2 as a constant.",
      },
      {
        id: "Q3",
        topic: "Integration",
        prompt: "Evaluate ∫(2x + 1) dx",
        incorrectCount: 3,
        status: "Reviewed",
        wrongStudentIds: ["2026-004"],
        aiInsight: "The main issue is constant-of-integration handling rather than the antiderivative itself.",
      },
    ],
  },
  {
    id: "integral-drill",
    title: "Integration Drill",
    className: "BSMath SC102 – Calculus 1",
    date: "March 10, 2026",
    status: "Pending",
    summary: "5 Questions • 31 Students",
    questions: [
      {
        id: "Q1",
        topic: "U-Substitution",
        prompt: "Evaluate ∫2x(x^2 + 1)^4 dx",
        incorrectCount: 10,
        status: "Needs Review",
        wrongStudentIds: ["2026-001", "2026-003", "2026-005"],
        aiInsight: "Students set up the substitution, but several failed to carry the change of variables through consistently.",
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
        aiInsight: "Students need clearer guidance on interpreting area and choosing the correct approximation setup.",
      },
    ],
  },
];

export default function QuestionAnalysisPage() {
  const [phase, setPhase] = useState<Phase>("assessment");
  const [analysisStep, setAnalysisStep] = useState<AnalysisStep>("select");
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [selectedWrongIds, setSelectedWrongIds] = useState<string[]>([]);
  const [taggingRows, setTaggingRows] = useState<TaggingRow[]>([]);
  const [teacherNotes, setTeacherNotes] = useState("");

  const selectedAssessment = useMemo(
    () => assessments.find((assessment) => assessment.id === selectedAssessmentId) ?? null,
    [selectedAssessmentId]
  );

  const selectedQuestion = useMemo(
    () => selectedAssessment?.questions.find((question) => question.id === selectedQuestionId) ?? null,
    [selectedAssessment, selectedQuestionId]
  );

  const beginAssessment = (assessment: Assessment) => {
    setSelectedAssessmentId(assessment.id);
    setSelectedQuestionId(null);
    setSelectedWrongIds([]);
    setTaggingRows([]);
    setTeacherNotes("");
    setAnalysisStep("select");
    setPhase("questions");
  };

  const beginQuestionAnalysis = (question: Question) => {
    setSelectedQuestionId(question.id);
    setSelectedWrongIds([]);
    setTaggingRows([]);
    setTeacherNotes("");
    setAnalysisStep("select");
    setPhase("select");
  };

  const proceedToTagging = () => {
    if (!selectedQuestion || selectedWrongIds.length === 0) {
      return;
    }

    setTaggingRows(
      students
        .filter((student) => selectedWrongIds.includes(student.id))
        .map((student) => ({ id: student.id, name: student.name, mistakeType: "" }))
    );
    setAnalysisStep("label");
    setPhase("tagging");
  };

  const resetToAssessmentSelection = () => {
    setPhase("assessment");
    setSelectedAssessmentId(null);
    setSelectedQuestionId(null);
    setSelectedWrongIds([]);
    setTaggingRows([]);
    setTeacherNotes("");
    setAnalysisStep("select");
  };

  const selectedStudentRows =
    taggingRows.length > 0
      ? taggingRows
      : students
          .filter((student) => selectedWrongIds.includes(student.id))
          .map((student) => ({ id: student.id, name: student.name, mistakeType: "" }));

  const renderAssessmentSelection = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assessment Selection</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-3">
          {assessments.map((assessment) => (
            <Card key={assessment.id} className="border-slate-200 bg-white shadow-sm">
              <CardContent className="space-y-4 p-5">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">{assessment.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{assessment.className}</p>
                </div>
                <div className="text-sm text-slate-600">
                  <p>{assessment.summary}</p>
                  <p className="mt-1">{assessment.status}</p>
                </div>
                <Button className="w-full" onClick={() => beginAssessment(assessment)}>
                  Open Analysis
                </Button>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderQuestionSelection = () => {
    if (!selectedAssessment) {
      return null;
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>{selectedAssessment.title}</CardTitle>
                </div>
              <Button variant="outline" onClick={resetToAssessmentSelection}>
                Change Assessment
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-sm font-medium text-slate-500">Class</p>
              <p className="mt-1 text-base font-semibold text-slate-900">{selectedAssessment.className}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Date</p>
              <p className="mt-1 text-base font-semibold text-slate-900">{selectedAssessment.date}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Status</p>
              <p className="mt-1 text-base font-semibold text-slate-900">{selectedAssessment.status}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Question Selection Grid</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-2">
            {selectedAssessment.questions.map((question) => (
              <Card key={question.id} className="border-slate-200 bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
                    {question.id} Card
                  </p>
                  <CardTitle className="mt-2 text-lg text-slate-900">
                    {question.id} — {question.topic}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-medium text-slate-500">Question</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{question.prompt}</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                    <div>
                      <p className="font-semibold text-slate-900">{question.incorrectCount} students incorrect</p>
                      <p className="text-slate-500">{question.status}</p>
                    </div>
                    <Button variant="outline" onClick={() => beginQuestionAnalysis(question)}>
                      Analyze
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderDetailedAnalysis = () => {
    if (!selectedAssessment || !selectedQuestion) {
      return null;
    }

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>{selectedQuestion.id} — {selectedQuestion.topic}</CardTitle>
                <p className="mt-1 text-sm text-slate-600">{selectedQuestion.prompt}</p>
              </div>
              <Button variant="outline" onClick={resetToAssessmentSelection}>
                Back to Question Overview
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>Select Incorrect Students</CardTitle>
              <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                {selectedWrongIds.length} selected
              </span>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-3">
              {analysisStep === "select" ? (
                students.map((student) => {
                  const isSelected = selectedWrongIds.includes(student.id);

                  return (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() => {
                        setSelectedWrongIds((current) =>
                          current.includes(student.id)
                            ? current.filter((id) => id !== student.id)
                            : [...current, student.id]
                        );
                      }}
                      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm shadow-sm transition ${
                        isSelected
                          ? "border-sky-300 bg-sky-50 text-sky-900"
                          : "border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      <span className="font-medium">{student.name}</span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          isSelected ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {isSelected ? "Wrong" : "Select"}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-500">Selected Incorrect Students</p>
                    <Button variant="outline" size="sm" onClick={() => setAnalysisStep("select")}>
                      Edit Selection
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudentRows.map((student) => (
                      <span
                        key={student.id}
                        className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700"
                      >
                        {student.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-500">Mistake Assignment</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Only selected incorrect students will appear here.
                  </p>
                </div>
                <Button onClick={proceedToTagging} disabled={selectedWrongIds.length === 0}>
                  Proceed to Label Assignment
                </Button>
              </div>

              {analysisStep === "label" ? (
                <div className="space-y-3">
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-500">
                        <tr>
                          <th className="px-4 py-3 font-medium">Student</th>
                          <th className="px-4 py-3 font-medium">Mistake Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedStudentRows.map((student) => (
                          <tr key={student.id} className="border-t border-slate-200">
                            <td className="px-4 py-3 font-medium text-slate-800">{student.name}</td>
                            <td className="px-4 py-3">
                              <Select
                                value={student.mistakeType ?? ""}
                                onChange={(event) => {
                                  const value = event.target.value as MistakeType;
                                  setTaggingRows((current) =>
                                    current.map((item) =>
                                      item.id === student.id ? { ...item, mistakeType: value } : item
                                    )
                                  );
                                }}
                                className="max-w-72"
                              >
                                <option value="" disabled>
                                  Select Mistake Type
                                </option>
                                {mistakeTypes.map((type) => (
                                  <option key={type} value={type}>
                                    {type}
                                  </option>
                                ))}
                              </Select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
                  Select the students who got this question wrong, then open the label assignment table.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Teacher Observation Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={teacherNotes}
              onChange={(event) => setTeacherNotes(event.target.value)}
              placeholder="Example: Many students forgot to multiply by the derivative of the inner function when applying the chain rule."
              rows={5}
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button>Save Analysis</Button>
              {phase === "select" ? (
                <Button variant="outline" onClick={proceedToTagging} disabled={selectedWrongIds.length === 0}>
                  Assign Mistake Labels
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card className="border-sky-100 bg-sky-50/50">
          <CardHeader>
            <CardTitle>AI Insight Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-slate-700">{selectedQuestion.aiInsight}</p>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page header removed — title and subtitle are shown in the top navbar */}

      {phase === "assessment" ? renderAssessmentSelection() : null}
      {phase !== "assessment" ? renderQuestionSelection() : null}
      {phase === "select" || phase === "tagging" ? renderDetailedAnalysis() : null}
    </div>
  );
}
