"use client";

import { useEffect, useRef } from "react";
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      confirmRef.current?.focus();
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") onCancel();
      };
      document.addEventListener("keydown", handleEsc);
      return () => document.removeEventListener("keydown", handleEsc);
    }
  }, [open, onCancel]);

  if (!open) return null;

  const colors = {
    danger: { bg: "bg-red-50", border: "border-red-200", icon: "text-red-600", btn: "bg-red-600 hover:bg-red-700" },
    warning: { bg: "bg-amber-50", border: "border-amber-200", icon: "text-amber-600", btn: "bg-amber-600 hover:bg-amber-700" },
    info: { bg: "bg-sky-50", border: "border-sky-200", icon: "text-sky-600", btn: "bg-sky-600 hover:bg-sky-700" },
  };

  const c = colors[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onCancel}>
      <div
        className={`w-full max-w-md rounded-2xl border p-6 shadow-xl ${c.border} ${c.bg}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className={`mt-0.5 h-5 w-5 shrink-0 ${c.icon}`} />
            <div>
              <h3 className="text-base font-semibold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{message}</p>
            </div>
          </div>
          <button onClick={onCancel} className="shrink-0 text-slate-400 hover:text-slate-600" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button className={c.btn} onClick={onConfirm} ref={confirmRef}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
