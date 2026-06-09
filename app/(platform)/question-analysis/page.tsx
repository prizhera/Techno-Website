"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Download, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { useDownloadPdf } from "@/lib/use-download-pdf";

import api from "@/lib/api";

type Phase = "assessment" | "questions" | "select" | "tagging";
type AnalysisStep = "select" | "label";

type Question = {
  id: string;
  topic: string;
  prompt: string;
  incorrectCount: number;
  status: string;
  wrongStudentIds: string[];
  aiInsight: string;
};

type Assessment = {
  id: string;
  title: string;
  className: string;
  date: string;
  status: string;
  summary: string;
  classId?: string;
  questions: Question[];
};

type TaggingRow = {
  id: string;
  name: string;
  mistakeType: string;
};

type StudentOption = { id: string; name: string; classId: string };
type MistakeLabel = { id: string; label_name: string };

function formatStatus(status?: string) {
  if (!status) return "Pending";
  return status.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function QuestionAnalysisPage() {
  const { pushToast } = useToast();
  const searchParams = useSearchParams();
  const selectedAssessmentIdRef = useRef<string | null>(null);
  const apiDataLoadedRef = useRef(false);
  const analysisRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("assessment");
  const [analysisStep, setAnalysisStep] = useState<AnalysisStep>("select");
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(searchParams.get("assessmentId") ?? null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [selectedWrongIds, setSelectedWrongIds] = useState<string[]>([]);
  const [taggingRows, setTaggingRows] = useState<TaggingRow[]>([]);
  const [teacherNotes, setTeacherNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [studentOptions, setStudentOptions] = useState<StudentOption[]>([]);
  const [mistakeLabels, setMistakeLabels] = useState<MistakeLabel[]>([]);
  const [studentPage, setStudentPage] = useState(1);
  const [studentSearch, setStudentSearch] = useState("");
  const [bulkLabelValue, setBulkLabelValue] = useState("");
  const [confirmState, setConfirmState] = useState<{ resolve: (v: boolean) => void; message: string } | null>(null);
  const STUDENTS_PER_PAGE = 20;

  const waitConfirm = (message: string) => new Promise<boolean>((resolve) => setConfirmState({ resolve, message }));

  useEffect(() => {
    let mounted = true;

    async function loadAnalysisData() {
      setLoading(true);

      try {
        const [assessmentsRes, classesRes, studentsRes, labelsRes] = await Promise.all([
          api.get<{ data: { id: string; title: string; class_id?: string; status?: string; created_at?: string }[] }>(
            "/api/assessments"
          ),
          api.get<{ data: { id: string; class_name: string }[] }>("/api/classes"),
          api.get<{ data: { id: string; full_name: string; student_number?: string; class_id: string }[] }>(
            "/api/students"
          ),
          api.get<{ data: MistakeLabel[] }>("/api/mistake-labels"),
        ]);

        const classMap = new Map(
          (Array.isArray(classesRes.data) ? classesRes.data : []).map((item) => [item.id, item.class_name])
        );
        const apiStudents = Array.isArray(studentsRes.data) ? studentsRes.data : [];
        const apiAssessments = Array.isArray(assessmentsRes.data) ? assessmentsRes.data : [];
        const labels = Array.isArray(labelsRes.data) ? labelsRes.data : [];

        if (!mounted) return;

        if (labels.length) setMistakeLabels(labels);
        if (apiStudents.length) {
          setStudentOptions(
            apiStudents.map((item) => ({
              id: item.id,
              name: item.full_name,
              classId: item.class_id,
            }))
          );
        }

        apiDataLoadedRef.current = Boolean(apiAssessments.length);
        if (!apiAssessments.length) return;

        const built: Assessment[] = [];
        for (const assessment of apiAssessments) {
          let questions: Question[] = [];
          try {
            const summaryRes = await api.get<{
              data: {
                questions: {
                  id: string;
                  question_number?: number;
                  question_text?: string;
                  topic?: string;
                  incorrect_count?: number;
                  ai_insight?: string | null;
                  mistake_distribution?: { label_name: string; count: number }[];
                }[];
              };
            }>(`/api/analytics/assessment/${assessment.id}`);

            questions = (summaryRes.data?.questions ?? []).map((question) => ({
              id: question.id,
              topic: question.topic ?? "General",
              prompt: question.question_text ?? "",
              incorrectCount: question.incorrect_count ?? 0,
              status: question.incorrect_count && question.incorrect_count > 0
                ? question.ai_insight ? "Analyzed" : "Needs Review"
                : "Not Started",
              wrongStudentIds: [],
              aiInsight:
                question.ai_insight ??
                (question.mistake_distribution?.length
                  ? `Top mistake pattern: ${question.mistake_distribution[0].label_name}.`
                  : "Tag incorrect students to generate insight patterns for this question."),
            }));
          } catch {
            /* keep empty questions for this assessment */
          }

          built.push({
            id: assessment.id,
            title: assessment.title,
            className: classMap.get(assessment.class_id ?? "") ?? "Class",
            date: assessment.created_at
              ? new Date(assessment.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              : "—",
            status: formatStatus(assessment.status),
            summary: `${questions.length} Questions • ${apiStudents.filter((s) => s.class_id === assessment.class_id).length} Students`,
            classId: assessment.class_id,
            questions,
          });
        }

        if (built.length) {
          setAssessments((prev) => {
            const selectedId = selectedAssessmentIdRef.current;
            if (selectedId && !built.find((a) => a.id === selectedId)) {
              const selected = prev.find((a) => a.id === selectedId);
              if (selected) return [...built, selected];
            }
            return built;
          });

          if (mounted && selectedAssessmentId && built.find((a) => a.id === selectedAssessmentId)) {
            selectedAssessmentIdRef.current = selectedAssessmentId;
            setPhase("questions");
          }
        }
      } catch {
        /* assessments remain unchanged */
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadAnalysisData();

    return () => {
      mounted = false;
    };
  }, []);

  const labelOptions = useMemo(() => {
    return mistakeLabels.map((label) => label.label_name);
  }, [mistakeLabels]);

  const labelIdByName = useMemo(() => {
    const map = new Map<string, string>();
    for (const label of mistakeLabels) {
      map.set(label.label_name, label.id);
    }
    return map;
  }, [mistakeLabels]);

  const selectedAssessment = useMemo(
    () => assessments.find((assessment) => assessment.id === selectedAssessmentId) ?? null,
    [assessments, selectedAssessmentId]
  );

  const selectedQuestion = useMemo(
    () => selectedAssessment?.questions.find((question) => question.id === selectedQuestionId) ?? null,
    [selectedAssessment, selectedQuestionId]
  );

  const rosterStudents = useMemo(() => {
    if (!selectedAssessment?.classId) return [];
    let list = studentOptions.filter((s) => s.classId === selectedAssessment.classId);
    if (studentSearch.trim()) {
      const q = studentSearch.trim().toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }
    return list;
  }, [selectedAssessment?.classId, studentOptions, studentSearch]);

  const classStudents = useMemo(() => {
    if (!selectedAssessment?.classId) return [];
    return studentOptions.filter((s) => s.classId === selectedAssessment.classId);
  }, [selectedAssessment?.classId, studentOptions]);

  const totalStudentPages = useMemo(() => Math.ceil(rosterStudents.length / STUDENTS_PER_PAGE), [rosterStudents]);
  const paginatedStudents = useMemo(() => {
    return rosterStudents.slice(
      (studentPage - 1) * STUDENTS_PER_PAGE,
      studentPage * STUDENTS_PER_PAGE
    );
  }, [rosterStudents, studentPage]);

  const beginAssessment = async (assessment: Assessment) => {
    if (hasUnsavedChanges && !(await waitConfirm("You have unsaved changes. Discard them?"))) return;
    selectedAssessmentIdRef.current = assessment.id;
    setSelectedAssessmentId(assessment.id);
    setSelectedQuestionId(null);
    setSelectedWrongIds([]);
    setTaggingRows([]);
    setTeacherNotes("");
    setAnalysisStep("select");
    setPhase("questions");
  };

  const beginQuestionAnalysis = async (question: Question) => {
    if (hasUnsavedChanges && !(await waitConfirm("You have unsaved changes for the current question. Discard them?"))) return;
    setSelectedQuestionId(question.id);
    setStudentPage(1);
    setAnalysisStep("select");
    setPhase("select");
    requestAnimationFrame(() => analysisRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));

    try {
      const mistakesRes = await api.get<{ data: { student_id: string; mistake_label_id: string; teacher_note?: string }[] }>(
        `/api/question-mistakes?question_id=${question.id}`
      );
      const existing = Array.isArray(mistakesRes.data) ? mistakesRes.data : [];
      const wrongIds = existing.map((m) => m.student_id);
      setSelectedWrongIds(wrongIds);

      const note = existing.find((m) => m.teacher_note)?.teacher_note ?? "";
      setTeacherNotes(note);

      const labelMap = new Map<string, string>();
      for (const label of mistakeLabels) {
        labelMap.set(label.id, label.label_name);
      }

      setTaggingRows(
        rosterStudents
          .filter((s) => wrongIds.includes(s.id))
          .map((s) => {
            const match = existing.find((m) => m.student_id === s.id);
            const labelName = match?.mistake_label_id ? labelMap.get(match.mistake_label_id) ?? "" : "";
            return { id: s.id, name: s.name, mistakeType: labelName };
          })
      );
    } catch {
      setSelectedWrongIds([]);
      setTaggingRows([]);
      setTeacherNotes("");
    }
  };

  const proceedToTagging = () => {
    if (!selectedQuestion || selectedWrongIds.length === 0) return;

    setTaggingRows(
      classStudents
        .filter((student) => selectedWrongIds.includes(student.id))
        .map((student) => ({ id: student.id, name: student.name, mistakeType: "" }))
    );
    setAnalysisStep("label");
    setPhase("tagging");
  };

  const resetToAssessmentSelection = async () => {
    if (hasUnsavedChanges && !(await waitConfirm("You have unsaved changes. Discard them?"))) return;
    selectedAssessmentIdRef.current = null;
    setPhase("assessment");
    setSelectedAssessmentId(null);
    setSelectedQuestionId(null);
    setSelectedWrongIds([]);
    setTaggingRows([]);
    setTeacherNotes("");
    setAnalysisStep("select");
  };

  const hasUnsavedChanges = selectedWrongIds.length > 0 || taggingRows.some((r) => r.mistakeType) || teacherNotes.trim().length > 0;

  const selectAllStudents = () => setSelectedWrongIds(rosterStudents.map((s) => s.id));
  const deselectAllStudents = () => setSelectedWrongIds([]);

  const selectedStudentRows =
    taggingRows.length > 0
      ? taggingRows
      : classStudents
          .filter((student) => selectedWrongIds.includes(student.id))
          .map((student) => ({ id: student.id, name: student.name, mistakeType: "" as const }));

  async function handleSaveAnalysis() {
    if (!selectedQuestionId || !selectedAssessmentId) return;

    const labeledRows = taggingRows.filter((row) => row.mistakeType);
    if (!labeledRows.length && !teacherNotes.trim()) {
      pushToast({
        variant: "error",
        title: "Nothing to save",
        message: "Assign at least one mistake label or add a teacher note.",
      });
      return;
    }

    setSaving(true);
    try {
      if (!apiDataLoadedRef.current) {
        pushToast({
          variant: "error",
          title: "Backend data not loaded",
          message: "Wait for assessments to load from the backend, then try again.",
        });
        setSaving(false);
        return;
      }

      if (labeledRows.length) {
        const grouped = new Map<string, string[]>();
        for (const row of labeledRows) {
          const labelId = labelIdByName.get(row.mistakeType);
          if (!labelId) continue;
          grouped.set(labelId, [...(grouped.get(labelId) ?? []), row.id]);
        }

        await Promise.all(
          [...grouped.entries()].map(([mistakeLabelId, studentIds]) =>
            api.post("/api/question-mistake-batch", {
              question_id: selectedQuestionId,
              mistake_label_id: mistakeLabelId,
              student_ids: studentIds,
              teacher_note: teacherNotes.trim(),
            })
          )
        );
      }

      if (teacherNotes.trim()) {
        await api.post("/api/teacher-notes", {
          assessment_id: selectedAssessmentId,
          question_id: selectedQuestionId,
          note_text: teacherNotes.trim(),
        });
      }

      // Reset state after successful save
      setSelectedWrongIds([]);
      setTaggingRows([]);
      setTeacherNotes("");

      pushToast({
        variant: "success",
        title: "Analysis saved",
        message: "Mistake labels and teacher notes were stored successfully.",
      });

      // Generate AI insight after saving
      if (selectedQuestion) {
        const distribution: Record<string, number> = {};
        for (const row of labeledRows) {
          distribution[row.mistakeType] = (distribution[row.mistakeType] ?? 0) + 1;
        }
        try {
          const aiRes = await api.post<{ insight: string }>("/api/ai/question-insight", {
            question_id: selectedQuestionId,
            question_text: selectedQuestion.prompt,
            topic: selectedQuestion.topic,
            mistake_distribution: distribution,
            teacher_note: teacherNotes.trim(),
          });
          if (aiRes?.insight) {
            setAssessments((prev) =>
              prev.map((assessment) =>
                assessment.id === selectedAssessmentId
                  ? {
                      ...assessment,
                      questions: assessment.questions.map((q) =>
                        q.id === selectedQuestionId ? { ...q, aiInsight: aiRes.insight } : q
                      ),
                    }
                  : assessment
              )
            );
          }
        } catch {
          /* AI insight optional */
        }
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error("Save error:", msg);
      pushToast({
        variant: "error",
        title: "Save failed",
        message: msg,
      });
    } finally {
      setSaving(false);
    }
  }

  const renderAssessmentSelection = () => (
    <div className="space-y-6">
      {loading ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-slate-200 bg-white shadow-sm">
              <CardContent className="space-y-4 p-5">
                <Skeleton className="h-6 w-44" />
                <Skeleton className="h-3 w-36" />
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Assessment Selection</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-3">
            {assessments.length ? assessments.map((assessment) => (
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
            )) : (
              <p className="col-span-3 text-center text-sm text-slate-500 py-8">No assessments found. Create one from the Assessments page.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderQuestionSelection = () => {
    if (!selectedAssessment) return null;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>{selectedAssessment.title}</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" onClick={async () => { if (hasUnsavedChanges && !(await waitConfirm("Go back to assessment list?"))) return; setPhase("assessment"); }}>
                  Back to Assessments
                </Button>
                <Button variant="outline" onClick={resetToAssessmentSelection}>
                  Change Assessment
                </Button>
              </div>
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
            {selectedAssessment.questions.length ? (
              selectedAssessment.questions.map((question, index) => (
                <Card key={question.id} className="border-slate-200 bg-white shadow-sm">
                  <CardHeader className="pb-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
                      Q{index + 1} Card
                    </p>
                    <CardTitle className="mt-2 text-lg text-slate-900">
                      Q{index + 1} — {question.topic}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-sm font-medium text-slate-500">Question</p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">{question.prompt}</p>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                      <div className="space-y-1">
                        <p className="font-semibold text-slate-900">
                          {question.incorrectCount} students incorrect
                        </p>
                        <p className="flex items-center gap-1.5">
                          {question.status === "Analyzed" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                              Analyzed
                            </span>
                          ) : (
                            <span className="text-slate-500">{question.status}</span>
                          )}
                        </p>
                      </div>
                      <Button variant="outline" onClick={() => beginQuestionAnalysis(question)}>
                        Analyze
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-slate-600">
                No questions found for this assessment yet. Add questions from the Assessments page.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderDetailedAnalysis = () => {
    if (!selectedAssessment || !selectedQuestion) return null;

    return (
      <div ref={analysisRef} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>
                  {selectedQuestion.topic}
                </CardTitle>
                <p className="mt-1 text-sm text-slate-600">{selectedQuestion.prompt}</p>
              </div>
              <Button variant="outline" onClick={async () => { if (hasUnsavedChanges && !(await waitConfirm("You have unsaved changes. Go back?"))) return; setPhase("questions"); requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" })); }}>
                Back to Question Overview
              </Button>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>Select Incorrect Students</CardTitle>
              <div className="flex items-center gap-2">
                {analysisStep === "select" ? (
                  <>
                    <Button variant="outline" size="sm" onClick={selectAllStudents}>
                      Select All
                    </Button>
                    {selectedWrongIds.length > 0 ? (
                      <Button variant="outline" size="sm" onClick={deselectAllStudents}>
                        Deselect All
                      </Button>
                    ) : null}
                  </>
                ) : null}
                <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                  {selectedWrongIds.length} selected
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-3">
              {analysisStep === "select" ? (
                <>
                  <input
                    value={studentSearch}
                    onChange={(e) => { setStudentSearch(e.target.value); setStudentPage(1); }}
                    placeholder="Search students..."
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                  />
                  {paginatedStudents.map((student) => {
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
                })}
                </>
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
              {analysisStep === "select" ? (
                <Pagination
                  currentPage={studentPage}
                  totalPages={Math.ceil(rosterStudents.length / STUDENTS_PER_PAGE)}
                  onPageChange={setStudentPage}
                />
              ) : null}
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
                  <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-sky-100 bg-sky-50 p-3">
                    <span className="text-xs font-medium text-sky-700">Apply to All:</span>
                    <select
                      value={bulkLabelValue}
                      onChange={(e) => setBulkLabelValue(e.target.value)}
                      className="rounded-lg border border-sky-200 bg-white px-3 py-1.5 text-sm outline-none"
                    >
                      <option value="">Select label...</option>
                      {labelOptions.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <button
                      disabled={!bulkLabelValue}
                      onClick={() => {
                        setTaggingRows((current) =>
                          current.map((item) => ({ ...item, mistakeType: bulkLabelValue }))
                        );
                      }}
                      className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-700 disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </div>
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
                                  const value = event.target.value;
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
                                {labelOptions.map((type) => (
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
              placeholder="Example: Several students missed the key substitution step — they applied the right formula but skipped a critical transformation."
              rows={5}
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button onClick={handleSaveAnalysis} disabled={saving}>
                {saving ? "Saving..." : "Save Analysis"}
              </Button>
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
            <div className="flex items-center justify-between gap-3">
              <CardTitle>AI Insight Preview</CardTitle>
              <DownloadInsightBtn question={selectedQuestion} assessmentTitle={selectedAssessment?.title ?? "Analysis"} />
            </div>
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
      {phase === "assessment" ? renderAssessmentSelection() : null}
      {phase !== "assessment" ? renderQuestionSelection() : null}
      {phase === "select" || phase === "tagging" ? renderDetailedAnalysis() : null}
      {confirmState ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { confirmState.resolve(false); setConfirmState(null); }}>
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm text-slate-600">{confirmState.message}</p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => { confirmState.resolve(false); setConfirmState(null); }} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
              <button onClick={() => { confirmState.resolve(true); setConfirmState(null); }} className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700">Confirm</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DownloadInsightBtn({ question, assessmentTitle }: { question: Question; assessmentTitle: string }) {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!pdfRef.current) return;
    setLoading(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const { default: jsPDF } = await import("jspdf");
      const canvas = await html2canvas(pdfRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      let heightLeft = pdfHeight;
      let position = 0;
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
      while (heightLeft > 0) {
        position -= pdf.internal.pageSize.getHeight();
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }
      pdf.save(`${assessmentTitle.replace(/\s+/g, "-").toLowerCase()}-insight.pdf`);
    } catch (err) {
      console.error("PDF failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div ref={pdfRef} className="fixed left-[-9999px] top-0 w-[800px] bg-white p-8">
        <h2 className="text-xl font-bold text-slate-900">{assessmentTitle}</h2>
        <h3 className="mt-2 text-base font-semibold text-slate-700">AI Insight Preview</h3>
        <p className="mt-4 text-sm text-slate-800 leading-relaxed">{question.prompt}</p>
        <p className="mt-6 text-sm italic text-slate-600 border-l-4 border-sky-300 pl-4">{question.aiInsight}</p>
        {question.incorrectCount > 0 && (
          <p className="mt-3 text-xs text-slate-400">{question.incorrectCount} students answered incorrectly — Topic: {question.topic}</p>
        )}
        <p className="mt-6 text-xs text-slate-400">Generated by TRACE — Teacher-assisted Remediation & Analytics for Conceptual Education</p>
      </div>
      <Button variant="outline" size="sm" onClick={handleDownload} disabled={loading}>
        <Download className="mr-2 h-4 w-4" />
        {loading ? "Generating..." : "Download PDF"}
      </Button>
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-12"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>}>
      <QuestionAnalysisPage />
    </Suspense>
  );
}
