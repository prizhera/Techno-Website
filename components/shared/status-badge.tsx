import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();

  if (normalized.includes("reviewed") || normalized.includes("on track")) {
    return <Badge variant="success">{status}</Badge>;
  }

  if (normalized.includes("support") || normalized.includes("needs")) {
    return <Badge variant="destructive">{status}</Badge>;
  }

  if (normalized.includes("pending")) {
    return <Badge variant="secondary">{status}</Badge>;
  }

  return <Badge variant="outline">{status}</Badge>;
}