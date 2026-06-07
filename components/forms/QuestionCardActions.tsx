"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import api from "@/lib/api";

export function QuestionCardActions({ questionId, initialTopic, initialPrompt }: { questionId: string; initialTopic: string; initialPrompt: string }) {
  const [editing, setEditing] = useState(false);
  const [topic, setTopic] = useState(initialTopic);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const [confirmState, setConfirmState] = useState<{ resolve: (v: boolean) => void; message: string } | null>(null);
  const { pushToast } = useToast();

  const handleSave = async () => {
    if (!topic.trim() || !prompt.trim()) return;
    setSaving(true);
    try {
      await api.put(`/api/questions/${questionId}`, { topic, question_text: prompt });
      pushToast({ variant: "success", title: "Updated", message: "Question updated." });
      setEditing(false);
      router.refresh();
    } catch {
      pushToast({ variant: "error", title: "Failed", message: "Could not update question." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = await new Promise<boolean>((resolve) => setConfirmState({ resolve, message: "Delete this question and all its mistake data?" }));
    if (!confirmed) return;
    setDeleting(true);
    try {
      await api.del(`/api/questions/${questionId}`);
      pushToast({ variant: "success", title: "Deleted", message: "Question deleted." });
      router.refresh();
    } catch {
      pushToast({ variant: "error", title: "Failed", message: "Could not delete question." });
    } finally {
      setDeleting(false);
    }
  };

  if (editing) {
    return (
      <>
        <div className="space-y-2">
          <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Topic" className="text-sm" />
          <Input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Question text" className="text-sm" />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={saving}><Check className="h-3 w-3 mr-1" />Save</Button>
            <Button size="sm" variant="outline" onClick={() => setEditing(false)}><X className="h-3 w-3 mr-1" />Cancel</Button>
          </div>
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