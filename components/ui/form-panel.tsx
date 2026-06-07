"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type FormPanelProps = {
  title: string;
  description?: string;
  triggerLabel: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

export function FormPanel({
  title,
  description,
  triggerLabel,
  children,
  defaultOpen = false,
}: FormPanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card className="overflow-hidden border-sky-100 bg-white/90 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
        </div>
        <Button
          type="button"
          variant={open ? "secondary" : "default"}
          size="sm"
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {open ? "Close" : triggerLabel}
        </Button>
      </CardHeader>
      {open ? (
        <CardContent className="border-t border-slate-100 pt-5">{children}</CardContent>
      ) : null}
    </Card>
  );
}
