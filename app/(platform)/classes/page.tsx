import { Plus, Upload } from "lucide-react";

import { StudentTable } from "@/components/tables/student-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { classOverview, students } from "@/data/mock-data";

export default function ClassesPage() {
  const selectedClass = classOverview[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Manage rosters, assessments, and insights</h2>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          Create Class
        </Button>
      </div>

      <section className="grid gap-6 lg:grid-cols-3">
        {classOverview.map((classItem) => (
          <Card key={classItem.className}>
            <CardHeader>
              <CardTitle className="text-base">{classItem.className}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <p>Subject: {classItem.subject}</p>
              <p>Students: {classItem.students}</p>
              <p>Recent Assessment Status: {classItem.status}</p>
              <div className="rounded-xl border border-sky-100 bg-white p-3 text-slate-700">
                <p className="font-medium text-slate-800">Latest assessment date</p>
                <p>{classItem.latestAssessmentDate}</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Weakest Topic</p>
                  <p className="mt-1 font-semibold text-slate-900">{classItem.weakestTopic}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Students at Risk</p>
                  <p className="mt-1 font-semibold text-slate-900">{classItem.studentsAtRisk}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Card className="border-sky-100 bg-sky-50/40">
        <CardHeader>
          <CardTitle>{selectedClass.className} Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-sky-100 bg-white p-4">
              <p className="text-sm font-medium text-slate-500">Uploaded Students</p>
              <div className="mt-3">
                <StudentTable rows={students} />
              </div>
            </div>
            <div className="rounded-2xl border border-sky-100 bg-white p-4">
              <p className="text-sm font-medium text-slate-500">Recent Assessments</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li>Calculus 1 Midterm 1 - reviewed</li>
                <li>Calculus 1 Quiz 4 - insights pending</li>
                <li>Calculus 1 Drill - reviewed</li>
              </ul>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-sky-100 bg-white p-4">
              <p className="text-sm font-medium text-slate-500">Recent Insights</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li>Chain Rule remains the weakest topic for this class.</li>
                <li>Procedural errors are more common than calculation errors.</li>
                <li>9 students are currently flagged for support.</li>
              </ul>
            </div>
            <div className="grid place-items-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-10 text-center">
              <Upload className="mb-3 h-6 w-6 text-sky-600" />
              <p className="font-medium text-slate-700">Drop CSV/Excel student list here</p>
              <p className="mt-1 text-sm text-slate-500">Accepted format: Student ID, Full Name, Section</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}