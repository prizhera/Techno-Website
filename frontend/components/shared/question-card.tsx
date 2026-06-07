import { BookOpenText } from "lucide-react";

import { TopicLabel } from "@/components/shared/topic-label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type QuestionCardProps = {
  id: string;
  title: string;
  prompt: string;
  questionNumber?: number;
  actions?: React.ReactNode;
};

export function QuestionCard({ id, title, prompt, questionNumber, actions }: QuestionCardProps) {
  return (
    <Card className="border-slate-200 bg-white shadow-sm transition hover:border-sky-200 hover:shadow-md">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">Q{questionNumber ?? id} Card</p>
            <CardTitle className="mt-2 text-lg text-slate-900">Question</CardTitle>
            <p className="mt-2 text-sm leading-6 text-slate-600">{prompt}</p>
          </div>
          <BookOpenText className="h-5 w-5 text-sky-600" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Assigned Topic</p>
        <TopicLabel topic={title} />
      </CardContent>
      {actions ? (
        <CardContent className="border-t border-slate-100 pt-4">
          {actions}
        </CardContent>
      ) : null}
    </Card>
  );
}