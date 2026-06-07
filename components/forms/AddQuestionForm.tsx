"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { FormPanel } from "@/components/ui/form-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import api from "@/lib/api";

type AssessmentOption = { id: string; title: string };

export default function AddQuestionForm({ assessmentId }: { assessmentId?: string }) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [topic, setTopic] = useState("");
  const [questionNumber, setQuestionNumber] = useState("1");
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(assessmentId ?? "");
  const [assessments, setAssessments] = useState<AssessmentOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get<{ data: AssessmentOption[] }>("/api/assessments")
      .then((res) => {
        const rows = Array.isArray(res.data) ? res.data : [];
        setAssessments(rows);
        if (!assessmentId && rows[0]?.id) setSelectedAssessmentId(rows[0].id);
      })
      .catch(() => {
        /* keep empty list */
      });
  }, [assessmentId]);

  async function handleAdd(event: React.FormEvent) {
    event.preventDefault();

    if (!prompt || !selectedAssessmentId) {
      pushToast({
        variant: "error",
        title: "Missing fields",
        message: "Question text and assessment are required.",
      });
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/questions", {
        assessment_id: selectedAssessmentId,
        question_number: Number(questionNumber) || 1,
        question_text: prompt,
        topic: topic || "General",
      });
      pushToast({
        variant: "success",
        title: "Question added",
        message: "The question was added to the assessment structure.",
      });
      setPrompt("");
      setTopic("");
      router.refresh();
    } catch (error) {
      console.error(error);
      pushToast({
        variant: "error",
        title: "Could not add question",
        message: "Check that the backend is running and try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormPanel
      title="Add Question"
      description="Extend the assessment with a new question and topic tag."
      triggerLabel="Add Question"
    >
      <form onSubmit={handleAdd} className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {!assessmentId ? (
          <Select
            value={selectedAssessmentId}
            onChange={(event) => setSelectedAssessmentId(event.target.value)}
          >
            <option value="" disabled>
              Select assessment
            </option>
            {assessments.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </Select>
        ) : null}
        <Input
          placeholder="Question #"
          value={questionNumber}
          onChange={(event) => setQuestionNumber(event.target.value)}
        />
        <Input
          placeholder="Topic"
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
        />
        <Input
          placeholder="Question prompt"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          className="md:col-span-2 xl:col-span-2"
        />
        <Button type="submit" disabled={loading || !selectedAssessmentId}>
          {loading ? "Adding..." : "Save Question"}
        </Button>
      </form>
    </FormPanel>
  );
}
