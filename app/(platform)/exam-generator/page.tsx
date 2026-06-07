"use client";

import { useState, useRef } from "react";
import { Sparkles, X, Loader2, AlertCircle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getApiBaseUrl } from "@/lib/api";

type Question = { question_number: number; question_text: string; topic: string; answer: string };

export default function ExamGeneratorPage() {
  const [topicsInput, setTopicsInput] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [numQuestions, setNumQuestions] = useState(10);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);

  function formatAsText() {
    return generatedQuestions
      .map((q, i) => {
        const header = `Q${q.question_number || i + 1}. ${q.question_text} [${q.topic}]`;
        return q.answer ? `${header}\n   Answer: ${q.answer}` : header;
      })
      .join("\n\n");
  }

  async function copyText() {
    try {
      await navigator.clipboard.writeText(formatAsText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback — select textarea */ }
  }

  function addTopic() {
    const t = topicsInput.trim();
    if (t && !topics.includes(t)) {
      setTopics([...topics, t]);
      setTopicsInput("");
      setError("");
    }
  }

  function removeTopic(topic: string) {
    setTopics(topics.filter((t) => t !== topic));
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      addTopic();
    }
  }

  async function generate() {
    if (!topics.length) return;
    setGenerating(true);
    setGeneratedQuestions([]);
    setError("");

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/ai/generate-exam`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topics, num_questions: numQuestions }),
      });
      const data = await res.json();
      if (data.questions?.length) {
        setGeneratedQuestions(data.questions);
      } else {
        setError("AI returned no questions. Check your API key or try different topics.");
      }
    } catch {
      setError("Network error — could not reach the server.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-sky-600" />
            AI Exam Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Target Topics</label>
            <p className="text-xs text-slate-500">
              Add topics you want the exam to focus on (check your Analytics page for weak topics).
            </p>
            <div className="flex gap-2">
              <Input
                value={topicsInput}
                onChange={(e) => setTopicsInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Differentiation of Polynomials"
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={addTopic} disabled={!topicsInput.trim()}>
                Add
              </Button>
            </div>
            {topics.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {topics.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700"
                  >
                    {t}
                    <button onClick={() => removeTopic(t)} className="text-sky-400 hover:text-sky-600">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="w-48 space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Number of Questions</label>
            <Input
              type="number"
              min={1}
              max={20}
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value) || 10)}
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <Button onClick={generate} disabled={!topics.length || generating}>
            {generating ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="h-4 w-4" /> Generate Exam</>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedQuestions.length > 0 && (
        <Card className="border-sky-200 bg-sky-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-sky-600" />
              Generated Questions ({generatedQuestions.length})
              <div className="ml-auto flex gap-2">
                <Button size="sm" variant="outline" onClick={copyText}>
                  {copied ? <><Check className="h-4 w-4" /> Copied</> : <><Copy className="h-4 w-4" /> Copy All</>}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setGeneratedQuestions([])}>
                  Clear
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <textarea
              ref={textRef}
              readOnly
              value={formatAsText()}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 focus:outline-none"
              rows={Math.min(generatedQuestions.length * 3, 20)}
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            />

            <div className="space-y-3">
              {generatedQuestions.map((q, i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-slate-800">
                      Q{q.question_number || i + 1}. {q.question_text}
                    </p>
                    <span className="shrink-0 rounded-full bg-sky-50 px-2 py-0.5 text-xs text-sky-700">
                      {q.topic}
                    </span>
                  </div>
                  {q.answer && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs font-medium text-slate-500 hover:text-slate-700">
                        Show answer
                      </summary>
                      <p className="mt-1 text-sm text-slate-600">{q.answer}</p>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
