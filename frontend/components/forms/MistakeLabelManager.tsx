"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import api from "@/lib/api";

type MistakeLabel = { id: string; label_name: string };

export function MistakeLabelManager() {
  const [labels, setLabels] = useState<MistakeLabel[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmState, setConfirmState] = useState<{ resolve: (v: boolean) => void; message: string } | null>(null);
  const { pushToast } = useToast();

  const loadLabels = async () => {
    try {
      const res = await api.get<{ data: MistakeLabel[] }>("/api/mistake-labels");
      setLabels(
        (Array.isArray(res.data) ? res.data : []).sort((a, b) =>
          a.label_name.localeCompare(b.label_name)
        )
      );
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLabels(); }, []);

  const handleAdd = async () => {
    if (!newLabel.trim()) return;
    setAdding(true);
    try {
      await api.post("/api/mistake-labels", { label_name: newLabel.trim() });
      pushToast({ variant: "success", title: "Label added", message: `"${newLabel.trim()}" created.` });
      setNewLabel("");
      loadLabels();
    } catch {
      pushToast({ variant: "error", title: "Failed", message: "Could not add label. It may already exist." });
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const ok = await new Promise<boolean>((resolve) => setConfirmState({ resolve, message: `Delete "${name}" label? This cannot be undone.` }));
    if (!ok) return;
    try {
      await api.del(`/api/mistake-labels/${id}`);
      pushToast({ variant: "success", title: "Deleted", message: `"${name}" removed.` });
      loadLabels();
    } catch {
      pushToast({ variant: "error", title: "Failed", message: "Label may be in use by existing mistakes." });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="New label name (e.g. Formula Misapplication)"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button onClick={handleAdd} disabled={adding || !newLabel.trim()}>
          <Plus className="h-4 w-4 mr-1" />{adding ? "..." : "Add"}
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading labels...</p>
      ) : labels.length === 0 ? (
        <p className="text-sm text-slate-500">No custom labels yet.</p>
      ) : (
        <div className="space-y-2">
          {labels.map((label) => (
            <div key={label.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm">
              <span className="font-medium text-slate-800">{label.label_name}</span>
              <Button size="sm" variant="ghost" className="text-red-500" aria-label={`Delete ${label.label_name}`} onClick={() => handleDelete(label.id, label.label_name)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
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
    </div>
  );
}