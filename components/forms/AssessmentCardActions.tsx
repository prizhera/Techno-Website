"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import api from "@/lib/api";

type AssessmentCardActionsProps = {
  assessmentId: string;
  initialTitle: string;
};

export function AssessmentCardActions({ assessmentId, initialTitle }: AssessmentCardActionsProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const [confirmState, setConfirmState] = useState<{ resolve: (v: boolean) => void; message: string } | null>(null);
  const { pushToast } = useToast();

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await api.put(`/api/assessments/${assessmentId}`, { title });
      pushToast({ variant: "success", title: "Updated", message: "Assessment title updated." });
      setEditing(false);
      router.refresh();
    } catch {
      pushToast({ variant: "error", title: "Failed", message: "Could not update assessment." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await new Promise<boolean>((resolve) => setConfirmState({ resolve, message: "Delete this assessment and all its questions and mistake data?" }));
    if (!confirmed) return;
    setDeleting(true);
    try {
      await api.del(`/api/assessments/${assessmentId}`);
      pushToast({ variant: "success", title: "Deleted", message: "Assessment deleted." });
      router.refresh();
    } catch {
      pushToast({ variant: "error", title: "Failed", message: "Could not delete assessment." });
    } finally {
      setDeleting(false);
    }
  };

  if (editing) {
    return (
      <>
        <div className="flex gap-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Assessment title" className="text-sm" />
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
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
          <Pencil className="h-3 w-3 mr-1" />Edit
        </Button>
        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleDelete} disabled={deleting}>
          <Trash2 className="h-3 w-3 mr-1" />{deleting ? "..." : "Delete"}
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