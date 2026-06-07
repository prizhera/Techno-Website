"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import api from "@/lib/api";

type StudentRowInput = {
  name?: string;
  full_name?: string;
  id?: string;
  student_number?: string;
  status?: string;
  lastAssessment?: string;
  class_id?: string;
};

function StudentRowActions({ student }: { student: { id: string; name: string; student_number?: string } }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(student.name);
  const [studentNumber, setStudentNumber] = useState(student.student_number ?? "");
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const [confirmState, setConfirmState] = useState<{ resolve: (v: boolean) => void; message: string } | null>(null);
  const { pushToast } = useToast();

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await api.put(`/api/students/${student.id}`, { full_name: name, student_number: studentNumber });
      pushToast({ variant: "success", title: "Updated", message: "Student updated." });
      setEditing(false);
      router.refresh();
    } catch {
      pushToast({ variant: "error", title: "Failed", message: "Could not update student." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await new Promise<boolean>((resolve) => setConfirmState({ resolve, message: `Remove ${student.name} from the roster?` }));
    if (!confirmed) return;
    setDeleting(true);
    try {
      await api.del(`/api/students/${student.id}`);
      pushToast({ variant: "success", title: "Deleted", message: "Student removed." });
      router.refresh();
    } catch {
      pushToast({ variant: "error", title: "Failed", message: "Could not delete student." });
    } finally {
      setDeleting(false);
    }
  };

  if (editing) {
    return (
      <>
        <div className="flex items-center gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} className="h-8 text-xs w-28" />
          <Input value={studentNumber} onChange={(e) => setStudentNumber(e.target.value)} className="h-8 text-xs w-20" />
          <Button size="sm" onClick={handleSave} disabled={saving}><Check className="h-3 w-3" /></Button>
          <Button size="sm" variant="outline" onClick={() => setEditing(false)}><X className="h-3 w-3" /></Button>
        </div>
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
      </>
    );
  }

  return (
    <>
      <div className="flex gap-1">
        <Button size="sm" variant="ghost" aria-label="Edit" onClick={() => setEditing(true)}><Pencil className="h-3 w-3" /></Button>
        <Button size="sm" variant="ghost" className="text-red-500" aria-label="Delete" onClick={handleDelete} disabled={deleting}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
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
    </>
  );
}

export function StudentTable({ rows }: { rows: StudentRowInput[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student Name</TableHead>
          <TableHead>ID</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((student) => {
          const id = student.id || "";
          const name = student.full_name || student.name || "";
          const studentNumber = student.student_number || id;
          return (
            <TableRow key={id}>
              <TableCell className="font-medium text-slate-800">{name}</TableCell>
              <TableCell>{studentNumber}</TableCell>
              <TableCell>
                <StudentRowActions student={{ id, name, student_number: studentNumber }} />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}