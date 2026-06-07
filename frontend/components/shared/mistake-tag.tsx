import { Badge } from "@/components/ui/badge";

const presetVariants: Record<string, "default" | "secondary" | "outline" | "destructive" | "success"> = {
  "Conceptual Misunderstanding": "default",
  "Procedural Mistake": "secondary",
  "Calculation Error": "outline",
  "Sign Error": "destructive",
  "Interpretation Mistake": "outline",
  "Careless Mistake": "success",
};

const colorCycle: ("default" | "secondary" | "outline" | "success")[] = [
  "default",
  "secondary",
  "outline",
  "success",
];

function hashString(s: string): number {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function MistakeTag({ mistake }: { mistake: string }) {
  const variant = presetVariants[mistake] ?? colorCycle[hashString(mistake) % colorCycle.length];
  return <Badge variant={variant}>{mistake}</Badge>;
}