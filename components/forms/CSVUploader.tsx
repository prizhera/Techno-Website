"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, FileText } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { Select } from "@/components/ui/select";
import api from "@/lib/api";

type ClassOption = { id: string; class_name: string };

export function CSVUploader({ defaultClassId }: { defaultClassId?: string }) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [selectedClassId, setSelectedClassId] = useState(defaultClassId ?? "");
  const router = useRouter();
  const { pushToast } = useToast();

  useEffect(() => {
    api
      .get<{ data: ClassOption[] }>("/api/classes")
      .then((res) => {
        const rows = Array.isArray(res.data) ? res.data : [];
        setClasses(rows);
        const target =
          defaultClassId && rows.some((r) => r.id === defaultClassId)
            ? defaultClassId
            : rows[0]?.id ?? "";
        if (target) setSelectedClassId(target);
      })
      .catch(() => {});
  }, [defaultClassId]);

  const handleFileUpload = async (file: File) => {
    if (!selectedClassId) {
      pushToast({
        variant: "error",
        title: "No class selected",
        message: "Select a class before uploading.",
      });
      return;
    }

    setUploading(true);
    try {
      const text = await file.text();
      const lines = text.split("\n").filter(line => line.trim());
      if (lines.length < 2) {
        throw new Error("CSV must have at least a header row and one data row");
      }

      const students = lines.slice(1).map(line => {
        const values = line.split(",").map(v => v.trim());
        return {
          student_number: values[0] || "",
          full_name: values[1] || values[0] || "",
        };
      }).filter(s => s.student_number && s.full_name);

      if (!students.length) {
        throw new Error("No valid students found in CSV");
      }

      await api.post("/api/students/bulk", {
        class_id: selectedClassId,
        students,
      });

      pushToast({
        variant: "success",
        title: "Students uploaded",
        message: `Added ${students.length} students to the class.`,
      });
      router.refresh();
    } catch (error) {
      console.error(error);
      pushToast({
        variant: "error",
        title: "Upload failed",
        message: error instanceof Error ? error.message : "Check CSV format: Student ID, Full Name",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file && (file.type === "text/csv" || file.name.endsWith(".csv"))) {
      handleFileUpload(file);
    } else {
      pushToast({
        variant: "error",
        title: "Invalid file",
        message: "Please upload a CSV file.",
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
    e.target.value = "";
  };

  return (
    <div className="space-y-4">
      <Select
        value={selectedClassId}
        onChange={(e) => setSelectedClassId(e.target.value)}
      >
        <option value="" disabled>Select target class</option>
        {classes.map((c) => (
          <option key={c.id} value={c.id}>{c.class_name}</option>
        ))}
      </Select>

      <div
        className={`grid place-items-center rounded-2xl border-2 border-dashed transition-colors p-10 text-center ${
          dragActive
            ? "border-sky-400 bg-sky-50"
            : "border-slate-300 bg-slate-50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <label className="cursor-pointer">
          <input
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileSelect}
            disabled={uploading || !selectedClassId}
          />
          {uploading ? (
            <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-sky-600" />
          ) : dragActive ? (
            <FileText className="mx-auto mb-3 h-6 w-6 text-sky-600" />
          ) : (
            <Upload className="mx-auto mb-3 h-6 w-6 text-sky-600" />
          )}
          <p className="font-medium text-slate-700">
            {uploading ? "Uploading..." : dragActive ? "Drop CSV file here" : "Drop CSV/Excel student list here"}
          </p>
          <p className="mt-1 text-sm text-slate-500">Format: Student ID, Full Name</p>
        </label>
      </div>
    </div>
  );
}