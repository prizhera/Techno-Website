import { ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AnalyticsCardProps = {
  title: string;
  value: string;
  note: string;
};

export function AnalyticsCard({ title, value, note }: AnalyticsCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-3">
          <p className="text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
          <ArrowUpRight className="h-5 w-5 text-sky-600" />
        </div>
        <p className="mt-2 text-xs text-slate-500">{note}</p>
      </CardContent>
    </Card>
  );
}