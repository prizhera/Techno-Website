"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

type ClassOption = { id: string; class_name: string };

export function CreateAssessmentForm() {
  const [title, setTitle] = useState("");
  const [classId, setClassId] = useState("");
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { pushToast } = useToast();

  useEffect(() => {
    api
      .get<{ data: ClassOption[] }>("/api/classes")
      .then((res) => {
        const rows = Array.isArray(res.data) ? res.data : [];
        setClasses(rows);
        if (rows[0]?.id) setClassId(rows[0].id);
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !classId) {
      pushToast({
        variant: "error",
        title: "Missing fields",
        message: "Assessment title and class are required.",
      });
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/assessments", { title, class_id: classId });
      pushToast({
        variant: "success",
        title: "Assessment created",
        message: "Now add questions below.",
      });
      setTitle("");
      router.refresh();
    } catch {
      pushToast({
        variant: "error",
        title: "Failed",
        message: "Check backend connection.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-3">
      <Input
        placeholder="Assessment Title (e.g. Midterm Exam 1)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Select value={classId} onChange={(e) => setClassId(e.target.value)}>
        <option value="" disabled>Select class</option>
        {classes.map((c) => (
          <option key={c.id} value={c.id}>{c.class_name}</option>
        ))}
      </Select>
      <Button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Assessment"}
      </Button>
    </form>
  );
}