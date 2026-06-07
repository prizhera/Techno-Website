import { Sparkles } from "lucide-react";

export function TopicLabel({ topic }: { topic: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
      <Sparkles className="h-3.5 w-3.5" />
      {topic}
    </span>
  );
}