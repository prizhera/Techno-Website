import { AssessmentViewer } from "@/components/forms/AssessmentViewer";
import { CreateAssessmentForm } from "@/components/forms/CreateAssessmentForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";

export default async function AssessmentsPage() {
  let assessments: { id: string; title: string }[] = [];

  try {
    const assessmentsRes = await api.get("/api/assessments");
    assessments = Array.isArray(assessmentsRes.data) ? assessmentsRes.data : [];
  } catch {
    /* assessments remain empty */
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="text-sm font-medium text-slate-700">Assessment Setup</div>
          <CardTitle>Build the assessment structure</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateAssessmentForm />
        </CardContent>
      </Card>

      <AssessmentViewer initialAssessments={assessments} />
    </div>
  );
}