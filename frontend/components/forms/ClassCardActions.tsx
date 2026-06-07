"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Pencil, Trash2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import api from "@/lib/api";

type ClassCardActionsProps = {
  classId: string;
  initialName: string;
  initialSubject: string;
};

export function ClassCardActions({ classId, initialName, initialSubject }: ClassCardActionsProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [subject, setSubject] = useState(initialSubject);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const [confirmState, setConfirmState] = useState<{ resolve: (v: boolean) => void; message: string } | null>(null);
  const { pushToast } = useToast();

  const handleSave = async () => {
    if (!name.trim() || !subject.trim()) return;
    setSaving(true);
    try {
      await api.put(`/api/classes/${classId}`, { class_name: name, subject });
      pushToast({ variant: "success", title: "Updated", message: "Class updated." });
      setEditing(false);
      router.refresh();
    } catch {
      pushToast({ variant: "error", title: "Failed", message: "Could not update class." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await new Promise<boolean>((resolve) => setConfirmState({ resolve, message: "Delete this class and all associated data?" }));
    if (!confirmed) return;
    setDeleting(true);
    try {
      await api.del(`/api/classes/${classId}`);
      pushToast({ variant: "success", title: "Deleted", message: "Class deleted." });
      router.refresh();
    } catch {
      pushToast({ variant: "error", title: "Failed", message: "Could not delete class." });
    } finally {
      setDeleting(false);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditing(true);
  };

  const preventNav = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); };

  const dialog = confirmState ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { confirmState.resolve(false); setConfirmState(null); }}>
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <p className="text-sm text-slate-600">{confirmState.message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={() => { confirmState.resolve(false); setConfirmState(null); }} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
          <button onClick={() => { confirmState.resolve(true); setConfirmState(null); }} className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700">Confirm</button>
        </div>
      </div>
    </div>
  ) : null;

  if (editing) {
    return (
      <>
        <div className="space-y-2" onClick={preventNav}>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Class name" />
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" />
          <div className="flex gap-2">
            <Button size="sm" onClick={(e) => { preventNav(e); handleSave(); }} disabled={saving}>
              <Check className="h-3 w-3 mr-1" />{saving ? "..." : "Save"}
            </Button>
            <Button size="sm" variant="outline" onClick={(e) => { preventNav(e); setEditing(false); }}>
              <X className="h-3 w-3 mr-1" />Cancel
            </Button>
          </div>
        </div>
        {dialog}
      </>
    );
  }

  return (
    <>
      <div className="flex gap-2" onClick={preventNav}>
        <Button size="sm" variant="outline" onClick={handleEditClick}>
          <Pencil className="h-3 w-3 mr-1" />Edit
        </Button>
        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={(e) => { preventNav(e); handleDelete(); }} disabled={deleting}>
          <Trash2 className="h-3 w-3 mr-1" />{deleting ? "..." : "Delete"}
        </Button>
      </div>
      {dialog}
    </>
  );
}