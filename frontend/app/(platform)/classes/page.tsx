import CreateClassForm from "@/components/forms/CreateClassForm";
import CreateStudentForm from "@/components/forms/CreateStudentForm";
import { StudentTable } from "@/components/tables/student-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CSVUploader } from "@/components/forms/CSVUploader";
import { ClassCardActions } from "@/components/forms/ClassCardActions";
import api from "@/lib/api";
import { normalizeStudentRows } from "@/lib/adapters";

export default async function ClassesPage({
  searchParams,
}: {
  searchParams?: Promise<{ classId?: string }>;
}) {
  const params = await searchParams;
  let classes: { id: string; class_name: string; subject: string }[] = [];
  let allStudents: { id: string; student_number: string; full_name: string; class_id: string }[] = [];
  let assessments: { id: string; title: string; status?: string; class_id?: string }[] = [];

  try {
    const classesRes = await api.get("/api/classes");
    classes = Array.isArray(classesRes.data) ? classesRes.data : [];
  } catch {}

  try {
    const studentsRes = await api.get("/api/students");
    allStudents = Array.isArray(studentsRes.data) ? studentsRes.data : [];
  } catch {}

  try {
    const assessmentsRes = await api.get("/api/assessments");
    assessments = Array.isArray(assessmentsRes.data) ? assessmentsRes.data : [];
  } catch {}

  if (!classes.length) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <CreateClassForm />
          <CreateStudentForm />
        </div>
        <Card>
          <CardContent className="p-8 text-center text-sm text-slate-500">
            Create a class to get started.
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedClassId = params?.classId ?? classes[0]?.id ?? "";
  const selectedClass = classes.find((c) => c.id === selectedClassId) ?? classes[0] ?? null;

  const classStudents = selectedClass
    ? allStudents.filter((s) => s.class_id === selectedClass.id)
    : [];

  const classAssessments = selectedClass
    ? assessments.filter((a) => a.class_id === selectedClass.id)
    : [];

  const studentRows = classStudents.length > 0 ? normalizeStudentRows(classStudents) : [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <CreateClassForm />
        <CreateStudentForm />
      </div>

      <section className="grid gap-6 lg:grid-cols-3">
        {classes.map((item) => {
          const isActive = item.id === selectedClassId;
          const studentCount = allStudents.filter((s) => s.class_id === item.id).length;

          return (
            <a
              key={item.id}
              href={`?classId=${item.id}`}
              className={`block rounded-2xl border-2 transition ${
                isActive ? "border-sky-400 bg-sky-50/30" : "border-slate-200 bg-white hover:border-sky-200"
              }`}
            >
              <Card className="border-0 bg-transparent shadow-none">
                <CardHeader>
                  <CardTitle className="text-base">{item.class_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600">
                  <p>Subject: {item.subject}</p>
                  <p>Students: {studentCount}</p>
                </CardContent>
                <CardContent className="border-t border-slate-100 pt-4">
                  <ClassCardActions
                    classId={item.id}
                    initialName={item.class_name}
                    initialSubject={item.subject}
                  />
                </CardContent>
              </Card>
            </a>
          );
        })}
      </section>

      {selectedClass ? (
        <Card className="border-sky-100 bg-sky-50/40">
          <CardHeader>
            <CardTitle>{selectedClass.class_name} Overview</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div className="rounded-2xl border border-sky-100 bg-white p-4">
                <p className="text-sm font-medium text-slate-500">
                  Students ({classStudents.length})
                </p>
                <div className="mt-3">
                  {studentRows.length > 0 ? (
                    <StudentTable rows={studentRows} />
                  ) : (
                    <p className="text-sm text-slate-500">No students yet. Add them manually or upload a CSV.</p>
                  )}
                </div>
              </div>
              <div className="rounded-2xl border border-sky-100 bg-white p-4">
                <p className="text-sm font-medium text-slate-500">Recent Assessments</p>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {classAssessments.length > 0 ? (
                    classAssessments.map((a) => (
                      <li key={a.id || a.title}>{a.title} - {a.status ?? "pending"}</li>
                    ))
                  ) : (
                    <li className="text-slate-500">No assessments yet.</li>
                  )}
                </ul>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-sky-100 bg-white p-4">
                <p className="text-sm font-medium text-slate-500">Recent Insights</p>
                <p className="mt-3 text-sm text-slate-500">
                  {classStudents.length > 0
                    ? "Tag mistakes in Question Analysis to surface class-wide patterns."
                    : "Add students to this class, then tag their mistakes to see insights here."}
                </p>
              </div>
              <CSVUploader defaultClassId={selectedClassId} />
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}