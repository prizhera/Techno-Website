import { MistakeLabelManager } from "@/components/forms/MistakeLabelManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mistake Label Manager</CardTitle>
          <p className="text-sm text-slate-600">Add or remove custom mistake labels used during question analysis.</p>
        </CardHeader>
        <CardContent>
          <MistakeLabelManager />
        </CardContent>
      </Card>
    </div>
  );
}