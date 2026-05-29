import { Badge } from "@/components/ui/badge";
import { MistakeType } from "@/data/mock-data";

const variantByMistake: Record<
  MistakeType,
  "default" | "secondary" | "outline" | "destructive" | "success"
> = {
  "Conceptual Misunderstanding": "default",
  "Procedural Mistake": "secondary",
  "Calculation Error": "outline",
  "Sign Error": "destructive",
  "Interpretation Mistake": "outline",
  "Careless Mistake": "success",
};

export function MistakeTag({ mistake }: { mistake: MistakeType }) {
  return <Badge variant={variantByMistake[mistake]}>{mistake}</Badge>;
}