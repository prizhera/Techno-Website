"use client";

import { useEffect, useState } from "react";
import { Upload, Loader2, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AddQuestionForm from "@/components/forms/AddQuestionForm";
import { AssessmentCardActions } from "@/components/forms/AssessmentCardActions";
import { QuestionCardActions } from "@/components/forms/QuestionCardActions";
import { QuestionCard } from "@/components/shared/question-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import api from "@/lib/api";
import { normalizeQuestionBank } from "@/lib/adapters";
import { useToast } from "@/components/ui/toast";

type ParsedQuestion = { question_number: number; question_text: string; topic: string };

export function AssessmentViewer({ initialAssessments }: { initialAssessments: { id: string; title: string }[] }) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(initialAssessments[0]?.id ?? "");
  const assessments = initialAssessments;
  const [questions, setQuestions] = useState<ReturnType<typeof normalizeQuestionBank>>([]);
  const [loading, setLoading] = useState(false);
  const [showExamUpload, setShowExamUpload] = useState(false);
  const [examText, setExamText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [creating, setCreating] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);

  function fetchQuestions() {
    if (!selectedAssessmentId) {
      setQuestions([]);
      return;
    }
    setLoading(true);
    api
      .get<{ data: unknown[] }>(`/api/questions?assessment_id=${selectedAssessmentId}`)
      .then((res) => {
        setQuestions(Array.isArray(res.data) ? normalizeQuestionBank(res.data as Parameters<typeof normalizeQuestionBank>[0]) : []);
      })
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchQuestions(); }, [selectedAssessmentId]);

  const assessmentsKey = initialAssessments.map((a) => a.id).join(",");
  useEffect(() => { if (assessmentsKey) fetchQuestions(); }, [assessmentsKey]);

  const selectedAssessment = assessments.find((a) => a.id === selectedAssessmentId);

  async function handleParseExam() {
    if (!examText.trim()) {
      pushToast({ variant: "error", title: "Empty text", message: "Paste your exam paper text first." });
      return;
    }
    setParsing(true);
    setParsedQuestions([]);
    try {
      const res = await api.post<{ questions: ParsedQuestion[] }>("/api/ai/extract-questions", { exam_text: examText });
      if (res?.questions?.length) {
        setParsedQuestions(res.questions);
      } else {
        pushToast({ variant: "error", title: "No questions detected", message: "The AI could not extract questions from this text." });
      }
    } catch {
      pushToast({ variant: "error", title: "Parse failed", message: "Check the backend and AI key, then try again." });
    } finally {
      setParsing(false);
    }
  }

  async function handleParsePdf() {
    if (!selectedPdf) {
      pushToast({ variant: "error", title: "No file", message: "Select a PDF file first." });
      return;
    }
    setParsing(true);
    setParsedQuestions([]);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(selectedPdf);
      });
      const res = await api.post<{ questions: ParsedQuestion[]; note?: string }>("/api/ai/extract-pdf", { pdf_base64: base64 });
      if (res?.questions?.length) {
        setParsedQuestions(res.questions);
      } else {
        pushToast({ variant: "error", title: "No questions detected", message: res?.note ?? "The AI could not extract questions from this PDF." });
      }
    } catch {
      pushToast({ variant: "error", title: "PDF parse failed", message: "Check the backend and AI key, then try again." });
    } finally {
      setParsing(false);
    }
  }

  async function handleCreateQuestions() {
    if (!selectedAssessmentId || !parsedQuestions.length) return;
    setCreating(true);
    try {
      await api.post("/api/questions/bulk", {
        assessment_id: selectedAssessmentId,
        questions: parsedQuestions,
      });
      pushToast({ variant: "success", title: "Questions created", message: `${parsedQuestions.length} questions added to the assessment.` });
      setParsedQuestions([]);
      setExamText("");
      setShowExamUpload(false);
      router.refresh();
    } catch {
      pushToast({ variant: "error", title: "Failed to create", message: "Could not create questions. Check the backend and try again." });
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      {assessments.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Select Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Select
                value={selectedAssessmentId}
                onChange={(e) => setSelectedAssessmentId(e.target.value)}
                className="max-w-md"
              >
                <option value="" disabled>Select an assessment</option>
                {assessments.map((a) => (
                  <option key={a.id} value={a.id}>{a.title}</option>
                ))}
              </Select>
              <Link href={selectedAssessmentId ? `/question-analysis?assessmentId=${selectedAssessmentId}` : "#"}>
                <Button disabled={!selectedAssessmentId}>Analyze This Assessment</Button>
              </Link>
            </div>
            {selectedAssessment ? (
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <span className="font-medium text-slate-800">{selectedAssessment.title}</span>
                <AssessmentCardActions assessmentId={selectedAssessment.id} initialTitle={selectedAssessment.title} />
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Question Structure</CardTitle>
              <p className="text-sm text-slate-600">
                {selectedAssessment
                  ? `Questions for "${selectedAssessment.title}"`
                  : "Select an assessment above to view its questions."}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!selectedAssessmentId ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-slate-600 text-center">
              Create an assessment first, then select it to see questions.
            </div>
          ) : loading ? (
            <div className="flex items-center gap-2 text-sm text-sky-700">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading questions...
            </div>
          ) : questions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-sm text-slate-600 text-center">
              No questions yet. Use the form below to add questions, or upload an exam paper.
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {questions.map((question) => (
                <QuestionCard
                  key={question.id}
                  id={question.id}
                  questionNumber={question.questionNumber}
                  title={question.title}
                  prompt={question.prompt}
                  actions={<QuestionCardActions questionId={question.id} initialTopic={question.title} initialPrompt={question.prompt} />}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddQuestionForm assessmentId={selectedAssessmentId} />

      <Button variant="outline" onClick={() => { if (!selectedAssessmentId) { pushToast({ variant: "error", title: "No assessment", message: "Select an assessment first." }); return; } setShowExamUpload((v) => !v); }}>
        <Upload className="h-4 w-4" />
        {showExamUpload ? "Close Exam Upload" : "Upload Exam Paper"}
      </Button>

      {showExamUpload ? (
        <Card className="border-sky-200 bg-sky-50/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upload Exam Paper</CardTitle>
              <button onClick={() => { setShowExamUpload(false); setParsedQuestions([]); setExamText(""); }}>
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>
            <p className="text-sm text-slate-600">
              Paste your exam paper text below, then click Parse to let AI extract questions and topics.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-slate-600">Option 1:</span>
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-sky-200 bg-white px-4 py-2 text-sm text-sky-700 hover:bg-sky-50">
                <Upload className="h-4 w-4" />
                Choose PDF File
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => setSelectedPdf(e.target.files?.[0] ?? null)}
                />
              </label>
              {selectedPdf ? <span className="text-sm text-slate-500">{selectedPdf.name}</span> : null}
              <Button onClick={handleParsePdf} disabled={parsing || !selectedPdf} size="sm">
                {parsing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Parsing...</> : "Parse PDF"}
              </Button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs text-slate-400">
                <span className="bg-sky-50/30 px-2">or paste exam text</span>
              </div>
            </div>
            <textarea
              value={examText}
              onChange={(e) => setExamText(e.target.value)}
              placeholder={`Example:\nQ1. Find dy/dx if y = x^2 + 3x - 7 (5 marks)\nQ2. Differentiate f(x) = (2x+1)(x-3) (5 marks)`}
              rows={6}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
            />
            <Button onClick={handleParseExam} disabled={parsing || !examText.trim()}>
              {parsing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Parsing...</> : "Parse Text"}
            </Button>

            {parsedQuestions.length > 0 ? (
              <div className="space-y-4">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">#</th>
                        <th className="px-4 py-3 font-medium">Question</th>
                        <th className="px-4 py-3 font-medium">Topic</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedQuestions.map((q) => (
                        <tr key={q.question_number} className="border-t border-slate-200">
                          <td className="px-4 py-3 text-slate-600">Q{q.question_number}</td>
                          <td className="px-4 py-3 text-slate-800">{q.question_text}</td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">
                              {q.topic}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleCreateQuestions} disabled={creating}>
                    {creating ? "Creating..." : `Create All ${parsedQuestions.length} Questions`}
                  </Button>
                  <Button variant="outline" onClick={() => { setParsedQuestions([]); setExamText(""); }}>
                    Clear & Try Again
                  </Button>
                </div>
              </div>
            ) : parsedQuestions.length === 0 && !parsing ? (
              <p className="text-sm text-slate-500">
                Parsed questions will appear here after clicking Parse.
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-sky-100 bg-sky-50/40">
        <CardHeader>
          <CardTitle>Proceed to Question Analysis</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-700">
            Move from assessment setup into class-wide mistake tagging and remediation analysis.
          </p>
          <Link href={selectedAssessmentId ? `/question-analysis?assessmentId=${selectedAssessmentId}` : "/question-analysis"}>
            <Button disabled={!selectedAssessmentId}>Proceed to Question Analysis</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}