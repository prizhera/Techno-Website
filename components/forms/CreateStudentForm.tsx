"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { FormPanel } from "@/components/ui/form-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import api from "@/lib/api";

type ClassOption = { id: string; class_name: string };

export default function CreateStudentForm() {
  const router = useRouter();
  const { pushToast } = useToast();
  const [name, setName] = useState("");
  const [studentNumber, setStudentNumber] = useState("");
  const [classId, setClassId] = useState("");
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get<{ data: ClassOption[] }>("/api/classes")
      .then((res) => {
        const rows = Array.isArray(res.data) ? res.data : [];
        setClasses(rows);
        if (rows[0]?.id) setClassId(rows[0].id);
      })
      .catch(() => {
        /* fallback: form stays disabled until classes load */
      });
  }, []);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();

    if (!name || !studentNumber || !classId) {
      pushToast({
        variant: "error",
        title: "Missing fields",
        message: "Student number, full name, and class are required.",
      });
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/students", {
        student_number: studentNumber,
        full_name: name,
        class_id: classId,
      });
      pushToast({
        variant: "success",
        title: "Student added",
        message: `${name} was added to the roster.`,
      });
      setName("");
      setStudentNumber("");
      router.refresh();
    } catch (error) {
      console.error(error);
      pushToast({
        variant: "error",
        title: "Could not create student",
        message: "Check that the backend is running and try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormPanel
      title="Add Student"
      description="Register a new student to a class roster."
      triggerLabel="New Student"
    >
      <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Input
          placeholder="Student number (e.g. 2026-001)"
          value={studentNumber}
          onChange={(event) => setStudentNumber(event.target.value)}
        />
        <Input
          placeholder="Full name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Select value={classId} onChange={(event) => setClassId(event.target.value)}>
          <option value="" disabled>
            Select class
          </option>
          {classes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.class_name}
            </option>
          ))}
        </Select>
        <Button type="submit" disabled={loading || !classId}>
          {loading ? "Creating..." : "Create Student"}
        </Button>
      </form>
    </FormPanel>
  );
}
