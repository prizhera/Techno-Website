"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { FormPanel } from "@/components/ui/form-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import api from "@/lib/api";

type TeacherOption = {
  id: string;
  full_name: string;
  email?: string;
};

export default function CreateClassForm() {
  const router = useRouter();
  const { pushToast } = useToast();
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get<{ data: TeacherOption[] }>("/api/users?role=teacher")
      .then((res) => {
        const rows = Array.isArray(res.data) ? res.data : [];
        setTeachers(rows);
        if (rows[0]?.id) setTeacherId(rows[0].id);
      })
      .catch(() => {
        /* toast shown via empty-state banner below */
      })
      .finally(() => setLoadingTeachers(false));
  }, []);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();

    if (!className.trim()) {
      pushToast({
        variant: "error",
        title: "Class name required",
        message: "Enter a class name before creating.",
      });
      return;
    }

    if (!subject.trim()) {
      pushToast({
        variant: "error",
        title: "Subject required",
        message: "Enter a subject for this class.",
      });
      return;
    }

    if (!teacherId) {
      pushToast({
        variant: "error",
        title: "Teacher required",
        message: "No teacher account found. Please contact your administrator.",
      });
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/classes", {
        class_name: className.trim(),
        subject: subject.trim(),
        teacher_id: teacherId,
      });
      pushToast({
        variant: "success",
        title: "Class created",
        message: `${className} is ready for rosters and assessments.`,
      });
      setClassName("");
      setSubject("");
      router.refresh();
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "Check that the backend is running and try again.";
      pushToast({
        variant: "error",
        title: "Could not create class",
        message: message.includes("teacher")
          ? "Teacher account not found. Contact your administrator."
          : "Check that the backend is running and try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormPanel
      title="Create Class"
      description="Set up a new class section for assessments and analytics."
      triggerLabel="New Class"
    >
      <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Input
          placeholder="Class name (e.g. Section A - Algebra)"
          value={className}
          onChange={(event) => setClassName(event.target.value)}
        />
        <Input
          placeholder="Subject"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
        />
        <Select
          value={teacherId}
          onChange={(event) => setTeacherId(event.target.value)}
          disabled={loadingTeachers || teachers.length === 0}
        >
          <option value="" disabled>
            {loadingTeachers ? "Loading teachers..." : "Select teacher"}
          </option>
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.full_name}
            </option>
          ))}
        </Select>
        <Button type="submit" disabled={loading || !teacherId}>
          {loading ? "Creating..." : "Create Class"}
        </Button>
      </form>
      {!loadingTeachers && teachers.length === 0 ? (
        <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          No teachers found. Ask your administrator to set up a teacher account, then refresh this page.
        </p>
      ) : null}
    </FormPanel>
  );
}
