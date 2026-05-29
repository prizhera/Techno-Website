import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-slate-600">
        Placeholder settings for future authentication, class policy defaults, and custom mistake label management.
      </CardContent>
    </Card>
  );
}